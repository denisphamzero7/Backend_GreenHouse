"""
Multimodal Vision Analyzer for Plant Pests & Diseases.
Integrates Google Gemini Vision API with symptom analysis.
"""

import io
import os
import json
import base64
import httpx
from PIL import Image
from typing import Dict, Any, Optional

from config import Config
from src.knowledge_base import search_knowledge_base

SYSTEM_PROMPT = """Bạn là một Chuyên gia Bác sĩ Nông nghiệp & Bệnh học Thực vật (Plant Pathologist) hàng đầu dành cho các hệ thống Nhà Kính (Greenhouse).
Nhiệm vụ của bạn là kiểm tra hình ảnh lá cây/thân cây/quả và kết hợp với triệu chứng lâm sàng do người trồng cung cấp để:
1. Xác định chính xác loài sâu hại, bệnh hại do nấm, vi khuẩn hoặc virus gây ra.
2. Đánh giá mức độ tổn thương và phân loại độ nguy hiểm: 'normal' (bình thường), 'warning' (cảnh báo nhẹ), 'critical' (nghiêm trọng - có nguy cơ lây lan diện rộng).
3. Đề xuất các giải pháp xử lý hữu cơ sinh học an toàn trước, sau đó là giải pháp hóa học nếu cần thiết.
4. Đưa ra biện pháp điều chỉnh môi trường nhà kính (độ ẩm, nhiệt độ, tưới nước) để phòng ngừa.

BẮT BUỘC trả về kết quả dưới định dạng JSON thuần túy (không kèm markdown code block ```json) theo cấu trúc sau:
{
  "detected": true,
  "disease_name": "Tên bệnh tiếng Việt (Tên tiếng Anh / Tên khoa học)",
  "pathogen_type": "Nấm / Vi khuẩn / Côn trùng / Rối loạn dinh dưỡng",
  "confidence": 0.95,
  "severity": "critical",
  "growth_status": "poor",
  "pest_status": "high",
  "symptoms_observed": [
    "Mô tả chi tiết triệu chứng 1 quan sát được trên ảnh",
    "Mô tả triệu chứng 2 khớp với người dùng mô tả"
  ],
  "treatment": {
    "organic": "Hướng dẫn xử lý sinh học / hữu cơ / cắt tỉa",
    "chemical": "Tên hoạt chất bảo vệ thực vật khuyên dùng (nếu khẩn cấp)"
  },
  "greenhouse_actions": "Khuyến nghị điều chỉnh thông gió, độ ẩm, tưới tiêu trong nhà kính",
  "summary_message": "Lời nhắn tóm tắt ngắn gọn gửi cho nhân viên quản lý luống rau"
}
"""

async def load_image_bytes(image_path_or_url: str) -> bytes:
    """Load image from local disk path or remote HTTP(S) URL."""
    if image_path_or_url.startswith("http://") or image_path_or_url.startswith("https://"):
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(image_path_or_url)
            resp.raise_for_status()
            return resp.content
    else:
        # Local file path
        if not os.path.exists(image_path_or_url):
            raise FileNotFoundError(f"Không tìm thấy file ảnh tại đường dẫn: {image_path_or_url}")
        with open(image_path_or_url, "rb") as f:
            return f.read()

async def analyze_plant_disease(
    image_path_or_url: str,
    symptoms: str = "",
    crop_type: str = ""
) -> Dict[str, Any]:
    """
    Main function to analyze pest and disease from plant image and text symptoms.
    """
    # 1. Load image
    image_bytes = await load_image_bytes(image_path_or_url)
    
    # Validate image with Pillow
    img = Image.open(io.BytesIO(image_bytes))
    mime_type = "image/jpeg"
    if img.format == "PNG":
        mime_type = "image/png"
    elif img.format == "WEBP":
        mime_type = "image/webp"

    # 2. Check if Gemini API Key is configured
    api_key = Config.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
    
    if api_key:
        try:
            # Use Google Gemini REST API directly for maximum compatibility
            encoded_image = base64.b64encode(image_bytes).decode("utf-8")
            
            user_prompt = f"Phân tích cây trồng trong ảnh.\n"
            if crop_type:
                user_prompt += f"- Loại cây trồng: {crop_type}\n"
            if symptoms:
                user_prompt += f"- Triệu chứng lâm sàng người trồng ghi nhận: {symptoms}\n"
            user_prompt += "Hãy chẩn đoán sâu bệnh và trả về đúng schema JSON yêu cầu."

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{Config.GEMINI_MODEL}:generateContent?key={api_key}"
            
            payload = {
                "system_instruction": {
                    "parts": [{"text": SYSTEM_PROMPT}]
                },
                "contents": [
                    {
                        "parts": [
                            {"text": user_prompt},
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": encoded_image
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "response_mime_type": "application/json"
                }
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    resp_json = response.json()
                    candidates = resp_json.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        raw_text = candidates[0]["content"]["parts"][0]["text"]
                        # Clean code block backticks if present
                        cleaned = raw_text.strip()
                        if cleaned.startswith("```json"):
                            cleaned = cleaned[7:]
                        if cleaned.endswith("```"):
                            cleaned = cleaned[:-3]
                        cleaned = cleaned.strip()
                        return json.loads(cleaned)
                else:
                    print(f"[Warning] Gemini API error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[Warning] Gemini Vision call failed, falling back to Knowledge Base: {e}")

    # Fallback to local Knowledge Base if offline or no API Key
    kb_results = search_knowledge_base(symptoms or "héo đốm lá", crop_type)
    if kb_results:
        top_match = kb_results[0]
        return {
            "detected": True,
            "disease_name": top_match["name"],
            "pathogen_type": top_match["pathogen_type"],
            "confidence": 0.82,
            "severity": top_match["severity_default"],
            "growth_status": "average" if top_match["severity_default"] != "critical" else "poor",
            "pest_status": "medium" if top_match["severity_default"] != "critical" else "high",
            "symptoms_observed": top_match["key_symptoms"][:2] + [f"Khớp với mô tả: {symptoms}"],
            "treatment": top_match["treatment"],
            "greenhouse_actions": top_match["prevention"],
            "summary_message": f"Phát hiện dấu hiệu {top_match['name']} trên cây {crop_type or 'trồng'}. Cần xử lý sớm."
        }

    return {
        "detected": False,
        "disease_name": "Không phát hiện bệnh hại rõ ràng",
        "pathogen_type": "Không xác định",
        "confidence": 0.5,
        "severity": "normal",
        "growth_status": "good",
        "pest_status": "none",
        "symptoms_observed": ["Lá cây không có dấu hiệu nấm mốc hoặc đốm bệnh nặng"],
        "treatment": {
            "organic": "Duy trì chế độ chăm sóc và tưới tiêu bình thường",
            "chemical": "Không cần sử dụng hóa chất"
        },
        "greenhouse_actions": "Duy trì độ ẩm 65-75% và thông thoáng gió trong nhà kính",
        "summary_message": "Cây trồng phát triển bình thường, không có sâu bệnh nguy hiểm."
    }
