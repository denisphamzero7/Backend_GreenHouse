# MCP Server: Nhận Diện Sâu Bệnh & Chẩn Đoán Cây Trồng Bằng AI (Greenhouse Pest Detector)

**Greenhouse Pest Detector MCP Server** là một máy chủ Model Context Protocol (MCP) chuyên biệt dành cho các hệ thống nông nghiệp thông minh. Server này cho phép các Trợ lý AI (như Antigravity, Claude, Cursor...) kiểm tra hình ảnh lá cây, phân tích triệu chứng bệnh hại, chẩn đoán mầm bệnh và tự động cập nhật nhật ký kiểm tra vào hệ thống quản lý nhà kính **Server_GreenHouse**.

---

## 1. Tính Năng Nổi Bật

- 🔍 **Nhận diện đa phương thức (Multimodal AI):** Kết hợp xử lý ảnh chụp độ phân giải cao bằng **Gemini 2.5/2.0 Flash Vision** cùng văn bản mô tả triệu chứng của nông dân.
- 🌿 **Từ điển bệnh học nông nghiệp nội bộ:** Tích hợp sẵn cơ sở dữ liệu tra cứu offline cho các loại cây trồng phổ biến tại Việt Nam (Cà chua, Xà lách, Dưa leo, Dâu tây, Ớt...).
- 💊 **Phác đồ điều trị kép:** Đưa ra cả giải pháp sinh học/hữu cơ an toàn và hoạt chất hóa học khi bệnh ở mức nguy cấp.
- ⚡ **Tự động đồng bộ Backend:** Tự động gọi API `POST /api/bed/log/:bedid` để lưu lịch sử kiểm tra và gọi `POST /api/notification` để bắn Socket.io cảnh báo khẩn cấp cho nhân viên nhà kính.

---

## 2. Cấu Trúc Thư Mục

```text
mcp_pest_detector/
├── src/
│   ├── server.py              # Khai báo FastMCP Server & 3 Tools chính
│   ├── vision_analyzer.py     # Module tích hợp Gemini Vision API & xử lý ảnh
│   ├── knowledge_base.py      # Cơ sở dữ liệu từ điển sâu bệnh offline
│   └── greenhouse_sync.py     # REST Client kết nối đồng bộ Backend_GreenHouse
├── config.py                  # Đọc biến môi trường cấu hình
├── requirements.txt           # Thư viện Python phụ thuộc
├── Dockerfile                 # Đóng gói container Docker
├── docker-compose.yml         # Khởi chạy tức thì bằng Docker
├── .env.example               # Mẫu thiết lập API keys
└── README.md                  # Tài liệu hướng dẫn sử dụng
```

---

## 3. Danh Sách Các Công Cụ (Tools) Cung Cấp Cho AI

| Tên Tool | Tham số | Mô tả chức năng |
| :--- | :--- | :--- |
| `diagnose_plant_disease` | `image_path_or_url` (bắt buộc)<br/>`symptoms` (tùy chọn)<br/>`crop_type` (tùy chọn) | Chẩn đoán sâu bệnh từ ảnh chụp và triệu chứng, đánh giá mức độ nguy hại (`normal`, `warning`, `critical`). |
| `lookup_pest_database` | `query` (bắt buộc)<br/>`crop_type` (tùy chọn) | Tra cứu nhanh từ điển bệnh hại, nguyên nhân và cách xử lý hữu cơ offline. |
| `sync_diagnosis_to_greenhouse` | `bed_id` (bắt buộc)<br/>`diagnosis_json_str` (bắt buộc)<br/>`greenhouse_id`, `cage_id` | Tự động ghi log vào luống rau và tạo thông báo khẩn cấp trên hệ thống web. |

---

## 4. Hướng Dẫn Cài Đặt & Chạy Server

### Bước 1: Chuẩn bị file `.env`
Sao chép file `.env.example` thành `.env` và điền khóa API của bạn:
```bash
cp .env.example .env
```
Nội dung file `.env`:
```ini
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
GREENHOUSE_API_URL=http://localhost:8080/api
ADMIN_ACCESS_TOKEN=eyJhbGciOi...
```

### Bước 2: Khởi chạy

#### Cách A: Chạy bằng Python (Khuyên dùng khi dev)
```bash
pip install -r requirements.txt
python src/server.py
```

#### Cách B: Chạy bằng Docker (Khuyên dùng khi deploy)
```bash
docker compose up -d
```

---

## 5. Tích Hợp Vào AI Client (Antigravity / Claude Desktop)

Thêm đoạn cấu hình sau vào tệp cấu hình MCP của bạn (ví dụ: `antigravity.mcp.json` hoặc `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "greenhouse-pest-detector": {
      "command": "python",
      "args": [
        "C:\\laptrinh\\Server_GreenHouse\\mcp_pest_detector\\src\\server.py"
      ],
      "env": {
        "GEMINI_API_KEY": "AIzaSy...your_gemini_key_here",
        "GREENHOUSE_API_URL": "http://localhost:8080/api"
      }
    }
  }
}
```

---

## 6. Mẫu Câu Lệnh (Prompt) Cho Người Dùng Trải Nghiệm

Khi đã kết nối MCP Server, bạn có thể nói với AI Agent:
- *"Hãy kiểm tra bức ảnh `C:/data/la_ca_chua.jpg` này giúp tôi, cây cà chua đang có triệu chứng lá héo rũ từ dưới lên và có đốm đen."*
- *"Tra cứu trong từ điển xem bệnh thối nhũn xà lách xử lý bằng phương pháp hữu cơ như thế nào?"*
- *"Sau khi chẩn đoán xong, hãy đồng bộ kết quả này vào Luống số `6789abcdef1234567890` của Nhà Kính A giúp tôi!"*
