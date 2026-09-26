"""
Agricultural Pest and Disease Knowledge Base.
Contains offline reference data for common greenhouse crops in Vietnam.
"""

from typing import List, Dict, Optional

PEST_DATABASE: List[Dict] = [
    {
        "id": "tom_late_blight",
        "crop": "Cà chua",
        "name": "Bệnh Mốc Sương / Sương Mai (Late Blight)",
        "scientific_name": "Phytophthora infestans",
        "pathogen_type": "Nấm mốc nước (Oomycete)",
        "key_symptoms": [
            "Đốm màu nâu đen ủng nước ở chóp hoặc mép lá",
            "Mặt dưới lá xuất hiện lớp mốc trắng mỏng khi ẩm ướt",
            "Thân cây xuất hiện vệt thâm đen, dễ gãy",
            "Quả có vết nâu sẫm, loang lổ cứng đờ"
        ],
        "causes": "Nhiệt độ 15-22 độ C, độ ẩm không khí cao trên 85%, tưới nước đọng trên lá",
        "severity_default": "critical",
        "treatment": {
            "organic": "Cắt tỉa ngay cành lá bệnh đem đốt. Phun dung dịch nano đồng hoặc dịch tỏi ớt.",
            "chemical": "Phun hoạt chất Metalaxyl, Mancozeb (Ridomil Gold), hoặc Dimethomorph."
        },
        "prevention": "Kiểm soát độ ẩm nhà kính dưới 80%, quạt thông gió đối lưu, không tưới phun vào chiều tối."
    },
    {
        "id": "tom_bacterial_wilt",
        "crop": "Cà chua / Ớt",
        "name": "Bệnh Héo Xanh Vi Khuẩn (Bacterial Wilt)",
        "scientific_name": "Ralstonia solanacearum",
        "pathogen_type": "Vi khuẩn (Bacteria)",
        "key_symptoms": [
            "Cây héo rũ đột ngột khi lá vẫn còn xanh tươi",
            "Ban ngày héo, ban đêm phục hồi nhẹ trong 2-3 ngày đầu, sau đó chết hẳn",
            "Cắt ngang gốc nhúng vào cốc nước trong thấy dịch vi khuẩn trắng đục chảy ra"
        ],
        "causes": "Vi khuẩn trong đất xâm nhập qua vết thương rễ, nhiệt độ đất cao 28-35 độ C",
        "severity_default": "critical",
        "treatment": {
            "organic": "Nhổ bỏ cây bệnh cho vào túi rác tiêu hủy ngay. Rắc vôi bột (Ca(OH)2) vào hố gốc để khử trùng.",
            "chemical": "Tưới gốc bằng Kasugamycin (Kasumin), Bismerthiazol hoặc Oxytetracycline để chặn lây lan."
        },
        "prevention": "Luân canh cây trồng khác họ cà, xử lý đất/giá thể kỹ bằng vôi hoặc nấm đối kháng Trichoderma."
    },
    {
        "id": "let_soft_rot",
        "crop": "Xà lách",
        "name": "Bệnh Thối Nhũn Vi Khuẩn (Bacterial Soft Rot)",
        "scientific_name": "Pectobacterium carotovorum",
        "pathogen_type": "Vi khuẩn (Bacteria)",
        "key_symptoms": [
            "Bẹ lá sát gốc bị úng nước, nhũn nát có mùi hôi tanh khó chịu",
            "Lá ngoài héo rũ áp sát mặt đất",
            "Bệnh lan nhanh làm cả cây đổ rạp thành khối nhầy"
        ],
        "causes": "Độ ẩm giá thể quá cao, đọng nước ở bẹ lá, bọ trĩ hoặc dụng cụ tỉa gây xước",
        "severity_default": "high",
        "treatment": {
            "organic": "Ngưng tưới nước 1-2 ngày, nhổ cây bệnh, phơi khô mặt luống.",
            "chemical": "Phun Streptomycin sulphate hoặc Kasugamycin quanh các cây lân cận."
        },
        "prevention": "Làm luống cao thoát nước tốt, tưới nhỏ giọt dưới gốc, không tưới làm văng đất lên bẹ."
    },
    {
        "id": "spider_mites",
        "crop": "Dâu tây / Cà chua / Dưa chuột",
        "name": "Nhện Đỏ Hại Lá (Two-Spotted Spider Mite)",
        "scientific_name": "Tetranychus urticae",
        "pathogen_type": "Côn trùng gây hại (Arachnida)",
        "key_symptoms": [
            "Mặt trên lá có vô số chấm nhỏ lấm tấm màu vàng nhạt hoặc bạc",
            "Mặt dưới lá có màng tơ mỏng li ti, có các chấm đỏ li ti bò chuyển động",
            "Lá vàng khô dần và rụng sớm"
        ],
        "causes": "Thời tiết khô nóng trong nhà kính (nhiệt độ trên 27 độ C, độ ẩm thấp dưới 60%)",
        "severity_default": "medium",
        "treatment": {
            "organic": "Phun dầu khoáng sinh học (SK Enspray 99EC), dầu neem (Neem oil) hoặc thả bọ rùa/nhện bắt mồi.",
            "chemical": "Phun luân phiên thuốc đặc trị nhện: Abamectin, Propargite, Fenpyroximate."
        },
        "prevention": "Phun sương giữ độ ẩm thích hợp trong nhà kính, vệ sinh cỏ dại xung quanh lồng kính."
    },
    {
        "id": "powdery_mildew",
        "crop": "Dưa leo / Bí ngô / Xà lách",
        "name": "Bệnh Phấn Trắng (Powdery Mildew)",
        "scientific_name": "Erysiphe cichoracearum",
        "pathogen_type": "Nấm (Fungal)",
        "key_symptoms": [
            "Xuất hiện các đốm bột màu trắng như rắc phấn trên cả 2 mặt lá",
            "Lớp phấn lan rộng bao phủ toàn bộ phiến lá",
            "Lá chuyển màu vàng nâu khô giòn và quăn queo"
        ],
        "causes": "Nhiệt độ ấm 20-27 độ C, ánh sáng kém, mật độ luống quá dày",
        "severity_default": "medium",
        "treatment": {
            "organic": "Phun dung dịch sữa tươi pha nước (tỷ lệ 1:9) hoặc dung dịch baking soda loãng (5g/lít).",
            "chemical": "Phun Hexaconazole (Anvil), Azoxystrobin (Amistar), hoặc Difenoconazole."
        },
        "prevention": "Tỉa bớt lá già, tạo khoảng cách thông thoáng giữa các luống rau."
    },
    {
        "id": "whitefly",
        "crop": "Cà chua / Ớt / Dưa chuột",
        "name": "Bọ Phấn Trắng (Whiteflies)",
        "scientific_name": "Bemisia tabaci",
        "pathogen_type": "Côn trùng chích hút",
        "key_symptoms": [
            "Khi rung nhẹ ngọn cây thấy đàn côn trùng nhỏ màu trắng bay túa ra",
            "Mặt dưới lá bám đầy trứng và ấu trùng tiết dịch mật",
            "Lá xuất hiện nấm muội đen (sooty mold) phủ kín làm giảm quang hợp",
            "Cây còi cọc và lây truyền virus xoăn ngọn"
        ],
        "causes": "Màng lưới chắn côn trùng nhà kính bị rách hoặc khe hở cửa thông gió",
        "severity_default": "high",
        "treatment": {
            "organic": "Treo bẫy dính màu vàng (Yellow sticky traps) khắp lồng kính. Phun chế phẩm sinh học nấm Beauveria bassiana.",
            "chemical": "Phun Pymetrozine, Spirotetramat (Movento) hoặc Dinotefuran."
        },
        "prevention": "Bảo dưỡng lưới chống côn trùng 50 mesh, vệ sinh cửa khử trùng trước khi vào nhà kính."
    }
]

def search_knowledge_base(query: str, crop: Optional[str] = None) -> List[Dict]:
    """Search offline pest & disease knowledge base by keywords."""
    query_lower = query.lower().strip()
    results = []
    
    for item in PEST_DATABASE:
        # Filter by crop if provided
        if crop and crop.lower() not in item["crop"].lower():
            continue
            
        # Match keywords in name, symptoms, pathogen
        matched = False
        if query_lower in item["name"].lower() or query_lower in item["scientific_name"].lower():
            matched = True
        elif any(query_lower in s.lower() for s in item["key_symptoms"]):
            matched = True
        elif query_lower in item["pathogen_type"].lower():
            matched = True
            
        if matched:
            results.append(item)
            
    # If no exact match and query is broad, return all items for the crop
    if not results and crop:
        results = [item for item in PEST_DATABASE if crop.lower() in item["crop"].lower()]
        
    return results
