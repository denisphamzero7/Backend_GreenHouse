# Luồng API Hình Ảnh & Thông Báo (Upload & Notification API)

Tài liệu này chi tiết hóa cách thức hoạt động của **API Upload hình ảnh lên Cloudinary** và **API Quản lý thông báo công việc (Notification)** kết hợp Socket.io gửi dữ liệu thời gian thực.

- **Upload Routing**: [api/routers/uploadimage.js](file:///c:/xampp/htdocs/Server_GreenHouse/api/routers/uploadimage.js) -> [api/controllers/uploadimage.js](file:///c:/xampp/htdocs/Server_GreenHouse/api/controllers/uploadimage.js)
- **Notification Routing**: [api/routers/notification.js](file:///c:/xampp/htdocs/Server_GreenHouse/api/routers/notification.js) -> [api/controllers/notificationController.js](file:///c:/xampp/htdocs/Server_GreenHouse/api/controllers/notificationController.js)

---

## 1. Danh Sách API Endpoints

### 1.1 API Upload Hình Ảnh
| Phương thức | Endpoint | Middleware / Quyền | Phản hồi JSON | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/upload` | Công khai (Tùy biến upload đơn lẻ) | `{ success, path, filename }` | Tải một file ảnh lên Cloudinary |

### 1.2 API Thông Báo Công Việc (Notification)
| Phương thức | Endpoint | Middleware / Quyền | Validate Schema | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/notification` | `verifyAccessToken` | `notificationvalidation.createNotification` | Tạo thông báo công việc mới |
| **GET** | `/api/notification` | Công khai | - | Lấy danh sách toàn bộ thông báo |
| **PUT** | `/api/notification/:noId` | `verifyAccessToken` | `notificationvalidation.updateNotification` | Cập nhật thông báo |
| **DELETE** | `/api/notification/:noId` | `verifyAccessToken` | - | Xóa một thông báo |

---

## 2. Chi Tiết Luồng Hoạt Động (API Workflows)

### 2.1 Luồng Tải Hình Ảnh Lên Cloudinary (Image Upload Flow)

Dự án sử dụng thư viện `multer-storage-cloudinary` tích hợp trực tiếp để tự động hóa khâu lưu trữ ảnh trực tuyến mà không tốn dung lượng ổ đĩa của server.

```mermaid
sequenceDiagram
    actor Client
    participant API as Upload Router
    participant Multer as Multer Cloudinary Middleware
    participant Cloud as Cloudinary CDN
    participant Controller as Upload Controller

    Client->>API: POST /api/upload (multipart/form-data kèm file)
    API->>Multer: Khởi tạo lưu trữ & truyền stream file
    Multer->>Cloud: Gửi dữ liệu nhị phân của ảnh lên server Cloudinary
    Cloud-->>Multer: Trả về kết quả lưu trữ (Secure URL, Public ID, format,...)
    Note over Multer: Đưa thông tin ảnh vừa upload vào req.file
    Multer-->>Controller: Chuyển tiếp luồng xử lý
    Controller-->>Client: 200 OK (Trả về URL Cloudinary trong 'path')
```

---

### 2.2 Luồng Gửi & Nhận Thông Báo Thời Gian Thực (Notification Real-time Flow)

Hệ thống hỗ trợ gửi thông báo phân công tác vụ (Tưới nước, Bón phân, Phun thuốc, Kiểm tra nhiệt độ, Thu hoạch) đến trực tiếp tài khoản nhân viên phụ trách nhà kính.

```mermaid
sequenceDiagram
    actor Admin as Trưởng nhóm (Admin/Manager)
    participant API as Notification Controller
    participant Service as Notification Service
    participant DB as MongoDB (Notification Model)
    participant Socket as Socket.io (getIO)
    actor Staff as Nhân viên (Staff/User)

    Staff->>Socket: Kết nối và gọi socket.emit('join_room', staffUserId)
    Socket-->>Staff: Xác nhận đã tham gia Room cá nhân thành công

    Admin->>API: POST /api/notification (userId, message, taskType, bedId)
    API->>Service: createNotification(userId, data)
    Service->>DB: Tạo mới bản ghi Notification (isRead = false)
    DB-->>Service: Lưu thành công
    Service-->>API: Trả về object thông báo hoàn chỉnh (gồm info User)

    API->>Socket: Gửi tới phòng: io.to(staffUserId.toString())
    Socket->>Staff: Phát sự kiện 'new_notification' kèm dữ liệu thông báo tức thì

    API-->>Admin: Trả về HTTP 201 Created ("Gửi thông báo thành công")
```

- **Khi cập nhật thông báo (`PUT /api/notification/:noId`)**: Cập nhật thông số công việc của thông báo trong DB. Sau đó phát ra sự kiện Socket.io:
  `io.to(userId.toString()).emit('notification_updated', { notificationId: noId });`
- **Khi xóa thông báo (`DELETE /api/notification/:noId`)**: Xóa bản ghi trong DB. Đồng thời phát ra sự kiện Socket.io:
  `io.to(userId.toString()).emit('notification_deleted', { noId });`
- Sự kiện Socket.io đảm bảo cho ứng dụng Client của nhân viên lập tức biến mất hoặc cập nhật trạng thái thông báo mà không cần reload trang web.
