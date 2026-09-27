"""
Greenhouse Backend Sync Client.
Pushes AI diagnosis results into Bed Monitoring Logs and Staff Notifications.
Features auto-login & token auto-refresh via Bot Service Account (Direction 3).
"""

import time
import httpx
import logging
from typing import Dict, Any, Optional
from config import Config

logger = logging.getLogger("GreenhouseSyncClient")

class GreenhouseSyncClient:
    def __init__(self, base_url: Optional[str] = None, token: Optional[str] = None):
        self.base_url = (base_url or Config.GREENHOUSE_API_URL).rstrip("/")
        self.custom_token = token
        self._bot_token: Optional[str] = None
        self._token_expires_at: float = 0

    async def get_valid_token(self, force_refresh: bool = False) -> Optional[str]:
        """
        Lấy Access Token hợp lệ:
        1. Nếu có custom_token (từ user đăng nhập trên web/app) -> dùng trực tiếp.
        2. Nếu dùng Bot Service Account:
           - Tự động đăng nhập qua POST /api/user/login bằng BOT_EMAIL & BOT_PASSWORD.
           - Cache token trong bộ nhớ, tự động lấy lại khi hết hạn hoặc force_refresh=True.
        """
        if self.custom_token:
            return self.custom_token

        current_time = time.time()
        if self._bot_token and not force_refresh and current_time < self._token_expires_at:
            return self._bot_token

        # Đăng nhập lấy token mới
        try:
            login_url = f"{self.base_url}/user/login"
            payload = {
                "email": Config.BOT_EMAIL,
                "password": Config.BOT_PASSWORD
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(login_url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    self._bot_token = data.get("accessToken")
                    # Cache token an toàn trong 12 giờ
                    self._token_expires_at = current_time + (12 * 3600)
                    logger.info(f"Bot Service Account login successful as: {Config.BOT_EMAIL}")
                    return self._bot_token
                else:
                    logger.warning(f"Bot Service Account login failed (HTTP {resp.status_code}): {resp.text}")
        except Exception as e:
            logger.error(f"Error authenticating Bot account: {e}")

        return self._bot_token

    async def _send_request(self, method: str, endpoint: str, payload: Dict[str, Any], user_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Gửi HTTP request với cơ chế tự động refresh token khi gặp HTTP 401.
        """
        token = user_token or await self.get_valid_token()
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.request(method, url, json=payload, headers=headers)
            
            # Nếu gặp 401 (hết hạn token) và đang dùng bot account -> refresh và thử lại 1 lần
            if resp.status_code == 401 and not user_token:
                logger.warning("Token expired (401). Refreshing token and retrying request...")
                new_token = await self.get_valid_token(force_refresh=True)
                if new_token:
                    headers["Authorization"] = f"Bearer {new_token}"
                    resp = await client.request(method, url, json=payload, headers=headers)

            if resp.status_code in (200, 201):
                return resp.json()
            else:
                return {
                    "success": False,
                    "status_code": resp.status_code,
                    "error": resp.text
                }

    async def add_monitoring_log(
        self,
        bed_id: str,
        status: str,
        remarks: str,
        user_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls POST /api/bed/log/:bedid to save inspection log and broadcast Socket.io event.
        status: 'normal', 'warning', 'critical'
        """
        endpoint = f"bed/log/{bed_id}"
        payload = {
            "status": status,
            "remarks": remarks
        }
        return await self._send_request("POST", endpoint, payload, user_token=user_token)

    async def create_notification(
        self,
        greenhouse_id: Optional[str],
        cage_id: Optional[str],
        bed_id: str,
        task_type: str,
        message: str,
        user_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls POST /api/notification to create an alert task for operators.
        task_type: 'Phun thuốc', 'Kiểm tra nhiệt độ', 'Tưới nước', 'Bón phân', 'Thu hoạch'
        """
        endpoint = "notification"
        payload = {
            "greenhouseId": greenhouse_id,
            "cageId": cage_id,
            "bedId": bed_id,
            "taskType": task_type,
            "message": message
        }
        return await self._send_request("POST", endpoint, payload, user_token=user_token)

    async def sync_diagnosis_to_bed(
        self,
        bed_id: str,
        diagnosis_result: Dict[str, Any],
        greenhouse_id: Optional[str] = None,
        cage_id: Optional[str] = None,
        user_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete sync workflow:
        1. Pushes monitoring log to bed.
        2. If severity is warning or critical, triggers emergency notification to staff.
        """
        severity = diagnosis_result.get("severity", "normal")
        disease_name = diagnosis_result.get("disease_name", "Không xác định")
        organic_treat = diagnosis_result.get("treatment", {}).get("organic", "")
        summary = diagnosis_result.get("summary_message", "")

        log_remarks = f"[AI Bác Sĩ Cây Trồng] Phát hiện: {disease_name}. Mức độ: {severity}. {organic_treat}"

        # 1. Add Log
        log_res = await self.add_monitoring_log(bed_id, severity, log_remarks, user_token=user_token)

        # 2. Add Notification if needed
        notif_res = None
        if severity in ("warning", "critical"):
            task_type = "Phun thuốc"
            alert_msg = f"CẢNH BÁO BỆNH HẠI: Luống {bed_id} phát hiện {disease_name}. {summary}"
            notif_res = await self.create_notification(
                greenhouse_id=greenhouse_id,
                cage_id=cage_id,
                bed_id=bed_id,
                task_type=task_type,
                message=alert_msg,
                user_token=user_token
            )

        return {
            "sync_status": "success",
            "monitoring_log_created": log_res,
            "notification_created": notif_res
        }
