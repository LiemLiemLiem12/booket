# Hệ thống Đặt vé & Quản lý chỗ ngồi – Tổng quan thách thức và chức năng

## 1. Giới thiệu

Hệ thống cho phép **Người tổ chức** tạo chiến dịch bán vé kèm sơ đồ chỗ ngồi, **Người mua** chọn chỗ và thanh toán vé, đồng thời có **Quản trị viên** giám sát toàn bộ hoạt động.  
Công nghệ đề xuất: **Backend NestJS (Node.js)**, **Frontend Next.js**, **Redis** cho giữ chỗ nguyên tử, **Nginx** làm reverse proxy & load balancer.

---

## 2. Các thách thức và giải pháp

### 2.1. Trải nghiệm người dùng và quy trình

| Thách thức                                                                              | Giải pháp                                                                                                                                     |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Xung đột chọn chỗ thời gian thực** – nhiều người cùng chọn một ghế gần như đồng thời. | Cơ chế **giữ chỗ tạm thời (hold seat)** với TTL (5–10 phút). Hiển thị trạng thái `AVAILABLE / HOLD / SOLD` theo thời gian thực qua WebSocket. |
| **Hết hạn giữ chỗ & mất cơ hội thanh toán** – người dùng không hoàn tất kịp.            | Đồng hồ đếm ngược rõ ràng. Gửi thông báo nhắc nhở trước khi hết hạn. Sau khi hết hạn, tự động giải phóng ghế.                                 |
| **Tải cao đột biến khi mở bán (Flash Sale)** – hàng nghìn người cùng truy cập sơ đồ.    | Tách luồng đọc (cache tĩnh/CDN) và luồng ghi (hàng đợi). Sử dụng **Virtual Waiting Room** (phòng chờ ảo) để điều tiết lưu lượng.              |
| **Giao diện sơ đồ ghế phải mượt trên mọi thiết bị**                                     | Next.js SSG/ISR cho layout, client-side hydration kết hợp WebSocket cập nhật trạng thái, giảm re-render không cần thiết.                      |

### 2.2. Tính nhất quán và toàn vẹn dữ liệu

| Thách thức                                                                                       | Giải pháp                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bán quá số lượng (Overselling)** – hai giao dịch cùng chuyển ghế sang SOLD.                    | **Atomic operation**: Dùng Redis `SET NX` / Lua script để giữ ghế. Database lock (`SELECT ... FOR UPDATE`) cho các bước xác nhận cuối cùng.                    |
| **Đồng bộ trạng thái HOLD ↔ SOLD ↔ AVAILABLE** khi thanh toán thành công, thất bại hoặc hết hạn. | **Delayed Queue** (Redis keyspace notification / BullMQ delayed jobs) để tự động huỷ hold. **Saga pattern** đảm bảo tính nhất quán giữa giữ chỗ và thanh toán. |
| **Idempotency (lặp giao dịch an toàn)** – nhấn nút nhiều lần, callback trùng.                    | Sử dụng **idempotency key** cho mỗi yêu cầu đặt giữ/thanh toán. Backend lưu key và kết quả, trả về cached nếu trùng.                                           |
| **Hủy/hoàn vé đồng bộ**                                                                          | Saga với bước trả ghế + hoàn tiền. Ghế chuyển sang `PENDING_REFUND` nếu cổng thanh toán lỗi, có cơ chế retry.                                                  |

### 2.3. Quản lý chiến dịch (phía Người tổ chức)

| Thách thức                                                                 | Giải pháp                                                                                                                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thiết kế sơ đồ chỗ ngồi linh hoạt** – hàng, cột, khu vực, giá khác nhau. | Công cụ kéo thả + import CSV. Lưu dạng template, mỗi chiến dịch snapshot template thành **inventory instance** riêng.                       |
| **Thay đổi sơ đồ/cấu hình giữa chừng** (thêm ghế, đổi giá)                 | Phiên bản hóa inventory. Cho phép sửa bản nháp và áp dụng theo batch, chỉ với ghế chưa bị HOLD/SOLD. Ghế đã bán không thể xóa, chỉ vô hiệu. |
| **Phân biệt quyền sở hữu chiến dịch**                                      | Phân quyền rõ ràng qua JWT token, mỗi organizer chỉ quản lý được campaign của mình.                                                         |

### 2.4. Thanh toán và hoàn vé

| Thách thức                                  | Giải pháp                                                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Tích hợp nhiều cổng thanh toán, timeout** | Webhook / callback với retry. Tự động gia hạn hold nếu phát hiện người dùng đang chờ xác nhận từ cổng thanh toán. |
| **Hoàn tiền một phần/toàn bộ**              | Module refund độc lập, ghi log chi tiết để đối soát. Có thể tích hợp cronjob kiểm tra các khoản refund pending.   |
| **Xác minh giao dịch**                      | Lưu lịch sử thanh toán với trạng thái, idempotency key, đối chiếu định kỳ với báo cáo từ cổng thanh toán.         |

### 2.5. Kiến trúc hệ thống và vận hành

| Thách thức                                                                            | Giải pháp                                                                                                                                                                          |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Khả năng mở rộng (scaling)** – dịch vụ giữ chỗ phải scale ngang khi có sự kiện hot. | **CQRS**: Tách read (cache Redis) và write (DB + Redis lock). NestJS instance chia sẻ Redis adapter cho WebSocket. Dùng **Nginx** load balancing với sticky session cho Socket.IO. |
| **Độ trễ thời gian thực** – người dùng mong đợi thấy thay đổi ghế ngay lập tức.       | WebSocket (Socket.IO) + Redis pub/sub giữa các instance để đẩy delta. Client dùng optimistic UI, rollback nếu xung đột.                                                            |
| **Gian lận và bot săn vé**                                                            | Rate limiting ngay tại Nginx (`limit_req`). CAPTCHA ở bước giữ chỗ. Giới hạn số ghế hold đồng thời trên mỗi tài khoản/IP.                                                          |
| **Giám sát và cảnh báo**                                                              | Health check endpoint, log tập trung, cảnh báo khi tỉ lệ lỗi cao hoặc Redis bất thường.                                                                                            |
| **Bảo mật**                                                                           | Nginx làm SSL termination, ẩn backend. NestJS Helmet, CORS, validation pipe.                                                                                                       |

---

## 3. Kiến trúc công nghệ đề xuất

- **Backend**: NestJS (Node.js) + TypeScript, sử dụng `@nestjs/bull` (BullMQ) cho hàng đợi, `ioredis` cho Redis, `@nestjs/websockets` cho realtime.
- **Frontend**: Next.js (React), tận dụng SSG/ISR cho trang sự kiện, client-side fetching cho sơ đồ ghế.
- **Database**: PostgreSQL (lưu trữ campaign, user, order) với indexing mạnh, có thể dùng Prisma/TypeORM.
- **Cache & Lock**: Redis cluster (hold seat, session, rate limit).
- **Reverse Proxy / Load Balancer**: Nginx – SSL termination, sticky session, rate limiting, static file caching.
- **Message Queue**: Redis/BullMQ để xử lý delayed job (hết hạn hold) và gửi email.
- **Monitoring**: Prometheus + Grafana, ELK cho log.

---

## 4. Chức năng chi tiết theo vai trò

### 4.1. Admin (Quản trị viên hệ thống)

- **Quản lý người dùng**: xem danh sách, phân quyền (admin, organizer, buyer), khóa/mở tài khoản.
- **Quản lý người tổ chức**: duyệt đăng ký làm organizer (nếu cần), cấu hình giới hạn số chiến dịch, hoa hồng.
- **Cấu hình hệ thống**: thời gian giữ chỗ mặc định, số ghế tối đa người dùng được giữ, cài đặt thông báo (email, SMS).
- **Báo cáo tổng quan**: doanh thu toàn hệ thống, số vé bán, tỉ lệ hủy vé, top sự kiện.
- **Giám sát**: health dashboard, xem log, thiết lập rate limit, quản lý bot.
- **Hỗ trợ**: xử lý tranh chấp, hoàn tiền thủ công cho giao dịch lỗi.
- **Danh mục**: quản lý thể loại sự kiện, thành phố, địa điểm.

### 4.2. Người tổ chức (Organizer) – Tạo và quản lý chiến dịch bán vé

- **Đăng ký/đăng nhập**, quản lý thông tin cá nhân, xác thực (KYC nếu cần).
- **Tạo chiến dịch mới**: nhập tên, mô tả, thời gian, địa điểm, ảnh banner, thể loại.
- **Thiết kế sơ đồ chỗ ngồi**:
  - Tạo khu vực, hàng ghế, đánh số ghế.
  - Gán giá vé linh hoạt (theo từng ghế hoặc theo khu vực).
  - Lưu dưới dạng template, import từ file.
- **Cấu hình bán vé**:
  - Thời gian mở bán / kết thúc.
  - Giới hạn số vé mỗi người mua.
  - Thời gian giữ chỗ (hold timeout).
  - Số ghế tối đa được giữ đồng thời.
- **Quản lý vé đã bán**: danh sách người mua, trạng thái vé, xuất CSV, quét mã QR check-in (nếu có).
- **Báo cáo chiến dịch**: doanh thu, số vé đã bán/theo khu vực, tỉ lệ huỷ, biểu đồ thời gian thực.
- **Chỉnh sửa sơ đồ trong khi bán**:
  - Thêm ghế mới (chưa bị HOLD/SOLD).
  - Vô hiệu hóa ghế đã bán (không được xóa).
  - Đổi giá (chỉ áp dụng cho ghế chưa được giữ).
- **Hủy chiến dịch**: cho phép hoàn tiền hàng loạt theo chính sách, thông báo đến người mua.

### 4.3. Người mua (Buyer) – Mua vé & chọn chỗ

- **Đăng ký/đăng nhập**: qua email, social, xác thực 2FA (tùy chọn).
- **Tìm kiếm & khám phá sự kiện**:
  - Lọc theo thể loại, địa điểm, thời gian.
  - Xem danh sách, bản đồ, sự kiện nổi bật.
- **Xem chi tiết sự kiện**: thông tin, sơ đồ chỗ ngồi tương tác, chỉ hiển thị ghế khả dụng.
- **Chọn ghế & giữ chỗ**:
  - Click chọn ghế, xem giá, thêm vào giỏ.
  - Hệ thống tự động giữ ghế (hold) với đồng hồ đếm ngược.
  - Cảnh báo khi sắp hết thời gian giữ.
- **Thanh toán**:
  - Chọn phương thức thanh toán (thẻ tín dụng, ví điện tử, chuyển khoản).
  - Xác nhận thanh toán an toàn, idempotency.
  - Nhận vé điện tử (QR code, vé PDF) sau khi thanh toán thành công.
- **Quản lý vé của tôi**: lịch sử giao dịch, xem vé, tải về, gửi lại email.
- **Hủy vé / yêu cầu hoàn tiền**:
  - Gửi yêu cầu hủy (nếu chính sách cho phép).
  - Hệ thống xử lý refund, trả ghế về trạng thái khả dụng.
- **Thông báo**: nhận email/SMS nhắc hết hạn hold, xác nhận mua vé, sự kiện sắp diễn ra, thay đổi từ organizer.

---

## 5. Tóm tắt giải pháp cốt lõi

| Hạng mục         | Giải pháp chính                                                    |
| ---------------- | ------------------------------------------------------------------ |
| Toàn vẹn dữ liệu | Atomic hold với Redis, DB lock, Saga, idempotency key              |
| Chịu tải cao     | Cache/CDN, phòng chờ ảo, phân tách read/write, Nginx rate limiting |
| Thời gian thực   | WebSocket + Redis pub/sub, optimistic UI                           |
| Quản lý sơ đồ    | Template + snapshot, phiên bản hóa, batch update                   |
| Chống bot        | CAPTCHA, rate limit, giới hạn số ghế hold                          |
| Mở rộng          | CQRS, microservice (tuỳ chọn), Nginx load balancing sticky session |

Hệ thống được thiết kế để đảm bảo **tính nhất quán**, **sẵn sàng cao** và **trải nghiệm người dùng mượt mà**, ngay cả trong những đợt mở bán cao điểm.
