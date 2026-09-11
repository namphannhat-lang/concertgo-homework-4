# Trạng thái triển khai — 2026-09-08

- Localhost đã được người dùng xác nhận hoạt động tốt.
- Đã quan sát bằng phiên đăng nhập thật: danh sách gồm đơn tài khoản khác, nút Chi tiết / Sửa, Xóa và form chi tiết.
- Đã sửa nguyên nhân hai server chạy trùng khiến backend cũ tiếp tục phục vụ request.
- Giao diện xác minh quyền bằng /api/me; backend Python và JavaScript đều chỉ cho email admin đã xác thực.
- Launcher mới dùng lại server đúng phiên bản, chỉ mở trình duyệt khi API sẵn sàng.
- 27 ca kiểm tra quyền/validation với mock đã qua. Các test này không thay thế kiểm thử đăng nhập thực tế.
- Schema thật không có updated_at hoặc khóa ngoại trỏ vào bookings. Giữ hard delete có xác nhận và chỉ sửa thông tin liên hệ.
- Quyền trực tiếp anon/authenticated vào bookings đã được thu hồi; API dùng secret key phía server.
- Thanh toán vẫn mô phỏng; chưa triển khai provider, hoàn tiền, giữ chỗ, phân trang hoặc kiểm soát xung đột cập nhật.
- Chưa deploy bản cập nhật lên hosting.

## UI 20260908.3
Danh sách chờ API xác minh quyền trước khi hiển thị thao tác. Nút sửa/xóa ở hàng riêng, tránh tràn ngang. Request cũ không ghi đè danh sách khi đổi tài khoản. API thử làm mới phiên một lần khi nhận 401. Đã qua kiểm tra refresh session bằng mock; đang chờ xác nhận ở trình duyệt do launcher mở.

## Telegram khi sửa/xóa — đã triển khai
Supabase function send-booking-telegram phiên bản 2 đã ACTIVE. PATCH gửi mã đơn, tên/email/điện thoại mới và thời gian; DELETE gửi mã đơn và thời gian. Chỉ gửi sau thao tác database thành công. Telegram lỗi không đảo ngược kết quả sửa/xóa; UI báo riêng tình trạng thông báo. Hai thông báo thử đã được Telegram xác nhận HTTP 200, sent=true. Server local đã khởi động lại. Không sửa/xóa đơn thật để kiểm thử.


## Concert management (2026-09-11)
- Only the verified admin email `ADMIN_EMAIL` may create, edit, or delete concerts; both Python and Node API routes enforce this.
- The editor uses day/month/year/hour/minute dropdowns in Vietnam time and requires at least one ticket type with a whole-number VND price.
- Concert and ticket edits are atomic through the service-only manage_concert RPC. Deleted concerts and removed ticket types are hidden while booking history stays intact.
- Booking uses place_concert_booking to reject deleted concerts, unavailable tickets, mismatched concert/ticket IDs and stale prices.
- For a fresh database, run concert-management.sql and concert-booking.sql after the existing table setup. These changes are already applied to the connected project.
- Validation: Node/Python authorization and input tests, browser CRUD and checkout checks, and database transaction tests rolled back after verification.

## Environment configuration (2026-09-11)
- Admin identity now comes from the server-only ADMIN_EMAIL environment variable; missing/blank configuration grants no admin access.
- Local values remain in ignored .env.local; committed examples contain no real values. Telegram continues to read Supabase Edge Function Secrets.
- Authorization fixtures use example.com identities and mock notification delivery.
