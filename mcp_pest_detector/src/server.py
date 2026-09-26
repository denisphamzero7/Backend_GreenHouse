"""
FastMCP Server for Greenhouse Pest & Plant Disease Detection.
Exposes Tools for Vision AI, Symptoms analysis, and Backend Synchronization.
"""

import json
from typing import Optional, Dict, Any
from mcp.server.fastmcp import FastMCP

from src.vision_analyzer import analyze_plant_disease
from src.knowledge_base import search_knowledge_base
from src.greenhouse_sync import GreenhouseSyncClient

# Initialize FastMCP Server
mcp = FastMCP("GreenhousePestDetector")
sync_client = GreenhouseSyncClient()

@mcp.tool()
async def diagnose_plant_disease(
    image_path_or_url: str,
    symptoms: str = "",
    crop_type: str = ""
) -> str:
    """
    Nhận diện sâu bệnh và chẩn đoán tình trạng sức khỏe cây trồng thông qua ảnh chụp lá/thân/quả
    kết hợp với mô tả triệu chứng lâm sàng.

    Args:
        image_path_or_url: Đường dẫn ảnh cục bộ trên ổ đĩa (vd: C:/images/leaf.jpg) hoặc URL (vd: Cloudinary).
        symptoms: Triệu chứng người trồng quan sát được (vd: 'lá héo rũ, đốm vàng viền nâu, mốc trắng').
        crop_type: Tên loại cây trồng (vd: 'Cà chua', 'Xà lách', 'Dưa leo', 'Dâu tây').

    Returns:
        JSON string chứa tên bệnh, tỷ lệ tự tin, mức độ nguy hiểm, hướng dẫn điều trị hữu cơ & hóa học.
    """
    try:
        result = await analyze_plant_disease(image_path_or_url, symptoms, crop_type)
        return json.dumps(result, ensure_ascii=False, indent=2)
    except Exception as e:
        return json.dumps({"error": f"Lỗi trong quá trình phân tích ảnh: {str(e)}"}, ensure_ascii=False)

@mcp.tool()
def lookup_pest_database(
    query: str,
    crop_type: str = ""
) -> str:
    """
    Tra cứu từ điển bệnh hại và sâu bệnh nông nghiệp nhà kính offline.

    Args:
        query: Từ khóa tìm kiếm (tên bệnh, triệu chứng, hoặc loại mầm bệnh).
        crop_type: Lọc theo loại cây trồng cụ thể nếu có (vd: 'Cà chua').

    Returns:
        JSON string danh sách các bệnh khớp, triệu chứng chi tiết, nguyên nhân và phác đồ điều trị.
    """
    try:
        results = search_knowledge_base(query, crop_type)
        if not results:
            return json.dumps({"message": "Không tìm thấy kết quả phù hợp trong từ điển.", "results": []}, ensure_ascii=False)
        return json.dumps({"count": len(results), "results": results}, ensure_ascii=False, indent=2)
    except Exception as e:
        return json.dumps({"error": f"Lỗi tra cứu: {str(e)}"}, ensure_ascii=False)

@mcp.tool()
async def sync_diagnosis_to_greenhouse(
    bed_id: str,
    diagnosis_json_str: str,
    greenhouse_id: str = "",
    cage_id: str = ""
) -> str:
    """
    Đồng bộ kết quả chẩn đoán sâu bệnh từ AI vào hệ thống Backend Nhà Kính (Server_GreenHouse).
    Hành động: Tự động ghi nhật ký kiểm tra (monitoringLog) cho luống đất và tạo thông báo khẩn cấp cho nhân viên.

    Args:
        bed_id: Mã ID của luống đất trong hệ thống (MongoDB ObjectId).
        diagnosis_json_str: Chuỗi JSON kết quả trả về từ tool 'diagnose_plant_disease'.
        greenhouse_id: (Tùy chọn) Mã ID của nhà kính chứa luống rau.
        cage_id: (Tùy chọn) Mã ID của lồng kính.

    Returns:
        JSON string thông báo trạng thái đồng bộ thành công vào cơ sở dữ liệu và phát Socket.io.
    """
    try:
        if isinstance(diagnosis_json_str, str):
            diagnosis_data = json.loads(diagnosis_json_str)
        else:
            diagnosis_data = diagnosis_json_str

        res = await sync_client.sync_diagnosis_to_bed(
            bed_id=bed_id,
            diagnosis_result=diagnosis_data,
            greenhouse_id=greenhouse_id or None,
            cage_id=cage_id or None
        )
        return json.dumps(res, ensure_ascii=False, indent=2)
    except Exception as e:
        return json.dumps({"error": f"Lỗi đồng bộ dữ liệu vào Backend: {str(e)}"}, ensure_ascii=False)

if __name__ == "__main__":
    # Run the FastMCP server via standard I/O (stdio)
    mcp.run()
