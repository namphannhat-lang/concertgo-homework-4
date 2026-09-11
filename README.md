# ConcertGo — Homework 4

## Chạy website

Mở start-website.bat. Website: http://localhost:3001/index.html.
Launcher dùng lại server đúng phiên bản nếu đã chạy, tránh mở nhiều server trùng cổng. Nếu báo server cũ, đóng server cũ rồi chạy lại. Không mở index.html bằng file://.

## Quyền quản trị

Đăng nhập tài khoản `ADMIN_EMAIL` đã xác thực email, chọn **Quản lý đặt vé**. Admin xem đơn của tất cả tài khoản, sửa tên/email/số điện thoại và xóa đơn sau xác nhận. Tài khoản khác chỉ xem vé của mình. Giao diện lấy quyền từ /api/me; mỗi API vẫn tự xác thực quyền với Supabase.

## Cấu hình

Giữ SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY và SUPABASE_SECRET_KEY trong .env.local. Không đưa secret key lên client hoặc commit file này. Bảng bookings chỉ được truy cập qua backend. Các file SQL quyền đã được đồng bộ theo cơ chế này.

## Kiểm tra

Node.js: npm test
Python: python -B tests/test_admin.py
Không có bước build vì frontend dùng HTML/CSS/JavaScript thuần.

Thanh toán là mô phỏng. Admin không sửa hạng vé, tổng tiền hoặc trạng thái thanh toán. Bản Vercel có API JavaScript tương ứng; chưa triển khai bản cập nhật lên hosting.

## Biến môi trường và GitHub

1. Sao chép `.env.example` thành `.env.local`, rồi điền cấu hình tại máy của bạn.
2. `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY` là cấu hình được phép trả cho trình duyệt qua `/api/config`.
3. `SUPABASE_SECRET_KEY` và `ADMIN_EMAIL` chỉ đọc ở backend. Email admin phải được xác thực; để trống `ADMIN_EMAIL` sẽ không cấp quyền admin cho tài khoản nào.
4. Python đọc `.env.local` khi khởi động; biến môi trường hệ điều hành được ưu tiên. Khởi động lại server sau khi sửa cấu hình. API Node trên hosting đọc biến môi trường của hosting, không tự tải file local.
5. Trên Vercel, cấu hình bốn biến của `.env.example` trong Project Settings → Environment Variables trước khi triển khai. GitHub chỉ chứa code và file mẫu, không chứa giá trị thật.
6. Telegram chạy trong Supabase Edge Function: đặt `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` trong Edge Function Secrets. File `supabase/functions/.env.example` là mẫu cho chạy local; backend Python/Node không cần giữ bản sao Telegram token. `SUPABASE_SECRET_KEYS` được Supabase cấp tự động ở môi trường hosted.

Không commit `.env`, `.env.local`, các biến thể `.env.*` có giá trị thật hoặc private key. Các file SQL cấu hình bảng/quyền và source API không phải secret: giữ trong Git để dựng lại dự án.

Tài liệu Supabase: [Environment Variables](https://supabase.com/docs/guides/functions/secrets).

Kiểm tra bổ sung:

```text
node tests/env-security.test.mjs
python -B tests/test_env_security.py
python -B tests/test_concerts.py
python -B tests/test_notifications.py
```

Các test dùng cấu hình giả và mock; không cần gửi đơn hoặc thông báo thật.
