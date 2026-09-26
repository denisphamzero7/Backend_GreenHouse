# Luồng API Chẩn Đoán Sâu Bệnh & Triệu Chứng Bằng AI (Diagnosis API)

Tài liệu này chi tiết hóa cách thức hoạt động của API chẩn đoán sâu bệnh cây trồng bằng AI (kết hợp **Gemini Vision** và **Cơ sở tri thức bệnh học nông nghiệp**), trả về kết quả JSON chuẩn hóa để **React Frontend** hiển thị trực tiếp.

- **Routing:** [api/routers/diagnosis.js](file:///C:/laptrinh/Server_GreenHouse/api/routers/diagnosis.js)
- **Controller:** [api/controllers/diagnosisController.js](file:///C:/laptrinh/Server_GreenHouse/api/controllers/diagnosisController.js)
- **Service:** [api/services/aiDiagnosisService.js](file:///C:/laptrinh/Server_GreenHouse/api/services/aiDiagnosisService.js)

---

## 1. Danh Sách API Endpoints

| Phương thức | Endpoint | Định dạng gửi | Phản hồi | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/diagnosis/pest` | `multipart/form-data` | JSON chi tiết | Chẩn đoán qua **Ảnh chụp** (Cloudinary) + **Triệu chứng lâm sàng** + Tự động lưu log luống. |
| **POST** | `/api/diagnosis/symptoms` | `application/json` | JSON chi tiết | Tra cứu nhanh chẩn đoán chỉ bằng **Triệu chứng chữ** (không cần upload ảnh). |
| **GET** | `/api/diagnosis/knowledge-base` | - | Danh sách JSON | Lấy toàn bộ từ điển bệnh học nông nghiệp nhà kính nội bộ. |

---

## 2. Chi Tiết API Chẩn Đoán Chính: `POST /api/diagnosis/pest`

### 2.1 Tham số gửi lên (Request Payload - `multipart/form-data`)
* **`image`** *(File - Bắt buộc nếu không có symptoms)*: File ảnh chụp lá/thân/quả cây trồng (hỗ trợ JPG, PNG, tối đa 2MB). Ảnh sẽ tự động tải lên thư mục `greenhouse/` của Cloudinary.
* **`symptoms`** *(String - Tùy chọn)*: Triệu chứng người trồng quan sát được (ví dụ: *"Lá héo rũ từ sáng, đêm có mùi chua, mép lá có đốm nâu ủng nước"*).
* **`cropType`** *(String - Tùy chọn)*: Tên giống cây trồng (ví dụ: *"Cà chua"*, *"Xà lách"*, *"Dưa leo"*).
* **`bedId`** *(String - Tùy chọn)*: ID của luống đất trong MongoDB. Nếu truyền tham số này, hệ thống sẽ **tự động lưu kết quả chẩn đoán vào `monitoringLogs`** của luống và phát Socket.io `new_monitoring_log`.
* **`greenhouseId`** / **`cageId`** *(String - Tùy chọn)*: Định danh nhà kính và lồng kính nếu muốn gán vào cảnh báo.

### 2.2 Dữ liệu JSON phản hồi chuẩn (Response JSON)
```json
{
  "success": true,
  "message": "Chẩn đoán sâu bệnh thành công",
  "data": {
    "detected": true,
    "disease_name": "Bệnh Mốc Sương / Sương Mai (Late Blight)",
    "scientific_name": "Phytophthora infestans",
    "pathogen_type": "Nấm mốc nước (Oomycete)",
    "confidence": 0.95,
    "severity": "critical",
    "growth_status": "poor",
    "pest_status": "high",
    "symptoms_observed": [
      "Đốm nâu sẫm ủng nước ở chóp lá và mép lá",
      "Lớp nấm mốc trắng xám xuất hiện ở mặt dưới phiến lá ẩm",
      "Triệu chứng người dùng cung cấp: lá héo rũ, mép lá có đốm nâu ủng nước"
    ],
    "treatment": {
      "organic": "Cắt tỉa ngay cành lá bệnh đem đốt. Phun dung dịch nano đồng hoặc dầu neem.",
      "chemical": "Phun hoạt chất Metalaxyl, Mancozeb (Ridomil Gold 68WG) hoặc Dimethomorph liều lượng khuyến cáo."
    },
    "greenhouse_actions": "Hạ độ ẩm nhà kính dưới 75%, tăng cường quạt thông gió, ngừng tưới phun sương.",
    "summary_message": "Phát hiện dấu hiệu Bệnh Mốc Sương trên cây trồng. Vui lòng áp dụng phác đồ xử lý sớm.",
    "imageUrl": "https://res.cloudinary.com/.../greenhouse/sample.jpg",
    "auto_saved_to_bed": true,
    "monitoring_log": {
      "_id": "6789...",
      "status": "critical",
      "remarks": "[AI Bác Sĩ Cây Trồng] Bệnh Mốc Sương... | Hữu cơ: Cắt tỉa ngay...",
      "checkDate": "2026-09-26T14:35:00.000Z"
    }
  }
}
```

---

## 3. Mẫu Code Gọi API từ React Frontend (Axios)

```jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function DiagnosisModal({ bedId, cropType = 'Cà chua', onClose }) {
  const [file, setFile] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!file && !symptoms) return alert('Vui lòng chọn ảnh chụp lá hoặc nhập triệu chứng!');

    const formData = new FormData();
    if (file) formData.append('image', file);
    formData.append('symptoms', symptoms);
    formData.append('cropType', cropType);
    if (bedId) formData.append('bedId', bedId);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/diagnosis/pest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi chẩn đoán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-container">
      <h3>🔍 AI Bác Sĩ Cây Trồng (Gemini Vision)</h3>
      <form onSubmit={handleDiagnose}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <textarea 
          placeholder="Mô tả triệu chứng quan sát được (ví dụ: lá héo vàng, đốm đen, rệp...)" 
          value={symptoms} 
          onChange={(e) => setSymptoms(e.target.value)} 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang phân tích sâu bệnh bằng AI...' : 'Bắt đầu chẩn đoán'}
        </button>
      </form>

      {result && (
        <div className={`diagnosis-result card-${result.severity}`}>
          <h4>{result.disease_name}</h4>
          <p><strong>Mức độ:</strong> <span className="badge">{result.severity}</span> (Độ tin cậy: {Math.round(result.confidence * 100)}%)</p>
          <div className="treatment-box">
            <p>🌿 <strong>Sinh học:</strong> {result.treatment.organic}</p>
            <p>🧪 <strong>Hóa học:</strong> {result.treatment.chemical}</p>
            <p>🏠 <strong>Môi trường:</strong> {result.greenhouse_actions}</p>
          </div>
          {result.auto_saved_to_bed && (
            <p className="saved-badge">✅ Đã tự động lưu nhật ký vào Luống đất và phát cảnh báo!</p>
          )}
        </div>
      )}
    </div>
  );
}
```
