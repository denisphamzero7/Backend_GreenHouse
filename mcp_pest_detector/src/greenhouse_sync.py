"""
Greenhouse Backend Sync Client.
Pushes AI diagnosis results into Bed Monitoring Logs and Staff Notifications.
"""

import httpx
from typing import Dict, Any, Optional
from config import Config

class GreenhouseSyncClient:
    def __init__(self, base_url: Optional[str] = None, token: Optional[str] = None):
        self.base_url = (base_url or Config.GREENHOUSE_API_URL).rstrip("/")
        self.token = token or Config.ADMIN_ACCESS_TOKEN

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def add_monitoring_log(
        self,
        bed_id: str,
        status: str,
        remarks: str
    ) -> Dict[str, Any]:
        """
        Calls POST /api/bed/log/:bedid to save inspection log and broadcast Socket.io event.
        status: 'normal', 'warning', 'critical'
        """
        url = f"{self.base_url}/bed/log/{bed_id}"
        payload = {
            "status": status,
            "remarks": remarks
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=self._headers())
            if resp.status_code in (200, 201):
                return resp.json()
            else:
                return {
                    "success": False,
                    "status_code": resp.status_code,
                    "error": resp.text
                }

    async def create_notification(
        self,
        greenhouse_id: Optional[str],
        cage_id: Optional[str],
        bed_id: str,
        task_type: str,
        message: str
    ) -> Dict[str, Any]:
        """
        Calls POST /api/notification to create an alert task for operators.
        task_type: 'Phun thuốc', 'Kiểm tra nhiệt độ', 'Tưới nước', 'Bón phân', 'Thu hoạch'
        """
        url = f"{self.base_url}/notification"
        payload = {
            "greenhouseId": greenhouse_id,
            "cageId": cage_id,
            "bedId": bed_id,
            "taskType": task_type,
            "message": message
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=self._headers())
            if resp.status_code in (200, 201):
                return resp.json()
            else:
                return {
                    "success": False,
                    "status_code": resp.status_code,
                    "error": resp.text
                }

    async def sync_diagnosis_to_bed(
        self,
        bed_id: str,
        diagnosis_result: Dict[str, Any],
        greenhouse_id: Optional[str] = None,
        cage_id: Optional[str] = None
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
        log_res = await self.add_monitoring_log(bed_id, severity, log_remarks)

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
                message=alert_msg
            )

        return {
            "sync_status": "success",
            "monitoring_log_created": log_res,
            "notification_created": notif_res
        }
