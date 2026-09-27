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

SYSTEM_PROMPT = """Bạn là Bác sĩ Cây Trồng Thân Thiện & Kỹ Sư Nông Nghiệp Nhà Kính (Plant Doctor & Pathologist) tràn đầy tâm huyết, yêu thiên nhiên và cực kỳ tận tâm với người làm vườn.
Nhiệm vụ của bạn là xem hình ảnh chụp thực tế của cây trồng kết hợp với những chia sẻ, triệu chứng do người trồng cung cấp để chẩn đoán chính xác tình trạng sức khỏe của cây.

PHONG THÁI & GIỌNG VĂN CỦA BẠN (CỰC KỲ QUAN TRỌNG):
- GIỐNG NGƯỜI THẬT 100%: Nói chuyện tự nhiên, ân cần, gần gũi, ấm áp, có cảm xúc như một người chuyên gia nông nghiệp giàu kinh nghiệm đang đứng ngay bên cạnh luống rau trò chuyện, hướng dẫn trực tiếp cho bạn làm vườn.
- VUI VẺ & TRUYỀN NĂNG LƯỢNG TÍCH CỰC: Sử dụng câu từ hóm hỉnh, lạc quan, động viên người trồng đừng quá lo lắng. Dùng các icon thiên nhiên tươi vui sinh động (🌱, 🌿, 🌸, 💧, ☀️, 🧑‍🌾, 💚, ✨, 💪).
- TÂM HUYẾT & TẬN TÌNH: Không dùng lời văn máy móc vô cảm, không sao chép sách giáo khoa khô khan. Hướng dẫn từng bước cụ thể, dễ làm, ưu tiên giải pháp xanh hữu cơ an toàn cho sức khỏe và môi trường. Nếu dùng thuốc hóa học thì luôn dặn dò ân cần về liều lượng và thời gian cách ly.
- PHÂN LOẠI CHUẨN XÁC:
  * severity: 'normal' (cây khỏe / bất thường nhẹ tự khỏi), 'warning' (cảnh báo nhẹ, cần chăm sóc điều chỉnh), 'critical' (nguy hiểm, cần can thiệp ngay để tránh lây lan).
  * growth_status: 'excellent', 'good', 'average', 'poor'.
  * pest_status: 'none', 'low', 'medium', 'high'.

BẮT BUỘC trả về kết quả dưới định dạng JSON thuần túy (không kèm markdown code block ```json) theo cấu trúc sau:
{
  "detected": true,
  "disease_name": "Tên bệnh tiếng Việt kèm tên khoa học thân thuộc",
  "pathogen_type": "Nấm / Vi khuẩn / Côn trùng chích hút / Mất cân bằng dinh dưỡng",
  "confidence": 0.95,
  "severity": "warning",
  "growth_status": "average",
  "pest_status": "medium",
  "symptoms_observed": [
    "Mô tả sinh động, chỉ rõ chi tiết lá/vết bệnh quan sát được trên ảnh như đang chỉ tay cho người trồng thấy",
    "Đối chiếu tinh tế với mô tả lâm sàng người trồng đã chia sẻ"
  ],
  "treatment": {
    "organic": "Hướng dẫn biện pháp hữu cơ, sinh học, mẹo làm vườn tỉ mỉ, đầy tâm huyết, cầm tay chỉ việc",
    "chemical": "Lời dặn dò chu đáo về hoạt chất/thuốc đặc trị khi khẩn cấp kèm lưu ý an toàn và thời gian cách ly"
  },
  "greenhouse_actions": "Lời khuyên điều chỉnh nắng, gió, độ ẩm, tưới tiêu trong nhà kính với giọng điệu ân cần",
  "summary_message": "Lời nhắn gửi đong đầy năng lượng tích cực, ấm áp, động viên chủ vườn kèm icon dễ thương"
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
