# Development Plan — ConcertGo / Homework 4

Ngày phân tích: 11/09/2026  
Thư mục dự án: `C:\Users\namph\Downloads\Homework 4`  
Mục đích: hoàn thiện sản phẩm hiện có theo PRD, giữ các chức năng đã hoạt động và xác định điều kiện trước khi bán vé thật.

## 1. Kết luận phân tích

ConcertGo đã vượt giai đoạn dựng giao diện: có danh sách concert, chọn hạng vé/số lượng, đăng nhập, kiểm tra đơn, lưu booking, lịch sử vé, quản trị đơn và quản trị concert. Hướng phù hợp là hoàn thiện độ tin cậy của luồng hiện tại, không viết lại toàn bộ hoặc đổi framework lúc này.

Khoảng cách lớn nhất với PRD là **FR-06: thanh toán online chưa được tích hợp**. `processPayment()` trong `script.js` gọi `saveBooking('success')`; backend nhận trạng thái do client gửi. Đây là luồng mô phỏng, chưa phải bằng chứng đã thu tiền. Ngoài ra, hệ thống chưa có tồn kho thực, giữ chỗ hoặc cơ chế chống tạo đơn trùng ở backend.

Kế hoạch chia hai mốc:

1. **Bản demo hoàn chỉnh:** luồng đặt vé mô phỏng rõ ràng, dữ liệu và quyền truy cập ổn định, kiểm thử đầy đủ và có hướng dẫn chạy lại.
2. **MVP giao dịch thật:** thêm tồn kho, giữ chỗ, thanh toán được xác minh ở server và xác nhận vé đáng tin cậy. Chỉ đạt PRD thanh toán thật khi hoàn thành mốc này.

## 2. Cơ sở và giới hạn đánh giá

Đã đối chiếu `project-overview-prd.md`, `design-guidelines (1).md`, `README.md`, `IMPLEMENTATION-NOTES.md`, cấu hình package, frontend, các phần backend liên quan đến auth/booking/concert, SQL và các test hiện có.

- Nhận định kỹ thuật dựa trên mã nguồn trong thư mục; không xác nhận schema hoặc trạng thái triển khai của database đang kết nối.
- Thông tin từng triển khai Edge Function, kiểm thử trình duyệt và áp dụng SQL là ghi nhận từ `IMPLEMENTATION-NOTES.md`, chưa được kiểm chứng lại trong lần phân tích này.
- Không đọc nội dung `.env.local`, không thay đổi ứng dụng/database, không tạo đơn hoặc gửi Telegram thật.
- Đã chạy thành công năm file test Node trong lệnh `npm test` bằng Node trực tiếp: admin, session, checkout, auth regression và concerts. Đây chủ yếu là kiểm thử mock.
- Kiểm tra cú pháp thành công cho `script.js`, các API booking/concert kể cả route `[id]`, `api/me.js`, `api/config.js` và `lib/supabase.js`.
- Chưa chạy test Python hoặc trình duyệt trong lần này. Python/py/npm không có trong PATH của phiên kiểm tra; Node có sẵn. Không suy ra Python chưa được cài trên máy.

## 3. Kiến trúc hiện tại

| Thành phần | File chính | Vai trò |
|---|---|---|
| Frontend | `index.html`, `style.css`, `script.js` | Web tiếng Việt, các bước đặt vé, auth và màn hình quản trị |
| Backend local | `server.py` | HTTP API bằng Python, chạy tại `127.0.0.1:3001` |
| Launcher | `start_website.py`, `start-website.bat` | Khởi động/kiểm tra server và mở website |
| Backend hosting | `api/`, `lib/supabase.js`, `vercel.json` | API JavaScript tương ứng cho môi trường hosting |
| Auth và database | Supabase, các file SQL | Xác minh người dùng, lưu concert, hạng vé và booking |
| Nghiệp vụ giao dịch DB | `concert-management.sql`, `concert-booking.sql` | Sửa concert nguyên tử; kiểm tra concert/hạng vé/giá khi đặt |
| Thông báo | `supabase/functions/send-booking-telegram/index.ts` | Thông báo booking; cần kiểm chứng cấu hình triển khai riêng |
| Kiểm thử | `tests/` | Quyền, validation, phiên đăng nhập, checkout, concert và notification |

Frontend gọi API; API xác minh người dùng rồi truy cập database bằng secret phía server. Quyền admin hiện gắn với một email đã xác thực. RPC trong hai file SQL giới hạn thực thi cho `service_role`. Concert được xóa mềm, hạng vé được archive; booking hiện có thao tác xóa vĩnh viễn sau xác nhận.

## 4. Đối chiếu PRD

| Yêu cầu | Hiện trạng từ mã nguồn | Phần cần hoàn thiện |
|---|---|---|
| FR-01 Danh sách concert | Có API và giao diện danh sách | Kiểm chứng loading/empty/error và dữ liệu nhiều concert |
| FR-02 Chi tiết concert | Có chọn concert, thông tin và các hạng vé | Rà soát thông tin đủ dùng, trạng thái concert ngừng bán |
| FR-03 Chọn vé | Chọn hạng vé, số lượng 1–6 | Làm rõ giới hạn mỗi đơn và tồn kho thực |
| FR-04 Thông tin đặt vé | Có form, frontend validation; email từ tài khoản | Đồng bộ validation tạo booking ở Python và Node |
| FR-05 Kiểm tra đơn | Có tóm tắt trước khi xác nhận | Xử lý giá thay đổi, dữ liệu cũ và phục hồi thao tác |
| FR-06 Thanh toán online | Mô phỏng, client gửi `success` | Provider, tạo giao dịch server, webhook và đối soát |
| FR-07 Xác nhận vé | Có mã `CG-` từ ID booking, lịch sử đơn | Phân biệt xác nhận demo với vé đã thanh toán |
| FR-08 Xử lý lỗi | Có lỗi auth, API, giá cũ, vé không khả dụng | Bổ sung hết tồn kho, timeout không rõ kết quả, retry an toàn |
| FR-09 Tìm/lọc nâng cao | Chưa xác nhận tính năng hoàn chỉnh | Để sau khi P0 ổn định |
| FR-10 Lịch sử vé | Đã có | Đổi liên kết sở hữu từ email sang user ID, thêm phân trang |
| FR-11 Theo dõi concert | Chưa thấy triển khai | Giữ ở backlog P1 |

Quản trị concert/booking là phạm vi đã mở rộng so với PRD gốc. Giữ và kiểm thử hồi quy; cập nhật tài liệu để phản ánh phạm vi này.

## 5. Vấn đề ưu tiên

| Mức | Phát hiện và căn cứ | Hành động |
|---|---|---|
| P0 trước giao dịch thật | Client quyết định `status`; `api/bookings.js` chấp nhận `success`/`failed` | Tách chế độ demo; chỉ server/provider xác nhận thanh toán thật |
| P0 dữ liệu | Danh sách vé lọc theo `buyer_email`, trong khi admin được sửa trường này | Thêm `bookings.user_id`; dùng ID người dùng xác thực để kiểm tra sở hữu |
| P0 độ tin cậy | `state.processing` chỉ chặn nhấp lặp trên một trang; chưa thấy idempotency server | Thêm khóa yêu cầu và ràng buộc unique để retry trả lại cùng đơn |
| P0 trước giao dịch thật | SQL chỉ kiểm tra trạng thái `available`; `max_quantity` không phải tổng tồn kho | Thêm tồn kho và giữ chỗ trong transaction; kiểm thử đồng thời |
| P0 đầu vào | API POST booking có kiểm tra số lượng/tổng tiền nhưng chưa có validation tên/điện thoại tương đương PATCH admin | Chuẩn hóa kiểu dữ liệu, độ dài, định dạng UUID, số và lỗi 4xx cho cả hai backend |
| P1 lịch sử | Booking join tên concert hiện tại; sửa concert có thể thay đổi nội dung lịch sử hiển thị | Lưu snapshot tên concert, thời gian, địa điểm và hạng vé tại lúc đặt |
| P1 vận hành | Có hai backend cùng nghiệp vụ | Bộ test hợp đồng chung để phát hiện lệch hành vi |
| P1 quy mô | GET booking lấy toàn bộ danh sách; chưa có phân trang | Phân trang có thứ tự ổn định và index theo truy vấn thực tế |
| P1 quản trị | Booking hard delete, chưa có nhật ký/xung đột cập nhật | Thêm audit và version; trước thu tiền chuyển sang hủy có lịch sử phù hợp |
| P1 thông báo | Notification lỗi được tách khỏi kết quả ghi đơn nhưng chưa có hàng đợi retry bền vững | Outbox/retry có chống gửi trùng và giới hạn dữ liệu cá nhân |

Server local đã có allowlist cho `/`, `/index.html`, `/style.css`, `/script.js` và bind loopback. Giữ cơ chế này; thêm hồi quy để bảo đảm `.env.local`, `.git` và mã nguồn backend không được phục vụ qua HTTP. Đây là bảo vệ hiện có cần duy trì, không phải kết luận đang lộ secret.

## 6. Kế hoạch thực hiện

### Giai đoạn 0 — Chốt baseline và khả năng dựng lại

- [ ] Cập nhật PRD/README: bắt buộc đăng nhập khi đặt vé, xác nhận bằng mã booking, quyền admin và thanh toán mô phỏng.
- [ ] Ghi rõ thứ tự setup: `supabase-setup.sql` → SQL quyền booking → `concert-management.sql` → `concert-booking.sql`; đối chiếu các file quyền trùng chức năng trước khi hợp nhất.
- [ ] Dựng database thử nghiệm mới để kiểm chứng schema từ repo; sau đó chuẩn hóa migration và seed tách biệt.
- [ ] Chạy đủ test Node/Python; bổ sung route concert `[id]` và các module còn thiếu vào kiểm tra cú pháp của package.
- [ ] Bổ sung một lệnh kiểm tra tổng hợp và hướng dẫn runtime.

**Nghiệm thu:** người khác dựng được bản demo từ thư mục và `.env.example`; mọi giới hạn được ghi rõ; không cần dùng dữ liệu thật để chạy test.

### Giai đoạn 1 — Củng cố booking và quyền sở hữu

- [ ] Thêm `user_id` vào booking; backend lấy từ phiên được xác minh, không tin ID client gửi.
- [ ] Lập phương án backfill dữ liệu cũ; bản ghi không ánh xạ chắc chắn phải được xử lý riêng, không tự gán chủ sở hữu bằng suy đoán.
- [ ] Chuyển lọc lịch sử sang `user_id`; email trở thành thông tin liên hệ độc lập.
- [ ] Chuẩn hóa validation tạo booking và mã lỗi giữa Python/Node; giá và tổng tiền cuối cùng do server/database xác định.
- [ ] Thêm idempotency key theo người dùng và nội dung yêu cầu; cùng khóa/cùng nội dung trả cùng đơn, cùng khóa/khác nội dung bị từ chối.
- [ ] Lưu snapshot thông tin vé và concert; cập nhật hiển thị lịch sử.

**File dự kiến:** `api/bookings.js`, `server.py`, `lib/supabase.js`, `script.js`, migration booking và `tests/`.

**Nghiệm thu:** sửa email liên hệ không chuyển quyền xem vé; tài khoản A không đọc được đơn B; retry sau mất mạng không sinh đơn thứ hai; payload sai bị chặn trước thao tác lưu.

### Giai đoạn 2 — Hoàn thiện trải nghiệm demo

- [ ] Gắn nhãn thanh toán mô phỏng rõ ở bước review/xác nhận.
- [ ] Khi nhận lỗi giá cũ hoặc hạng vé ngừng bán: tải dữ liệu mới, giữ thông tin người mua, yêu cầu chọn lại và kiểm tra tổng tiền.
- [ ] Kiểm tra loading, empty, error, success; phân biệt “không lưu được đơn” với “đã lưu nhưng chưa gửi thông báo”.
- [ ] Thay thông báo cố định về cổng localhost bằng nội dung phù hợp môi trường chạy.
- [ ] Kiểm tra mobile 360/390px, tablet 768px, desktop 1280px; không tràn ngang ở form và danh sách quản trị.
- [ ] Rà soát label, focus khi đổi màn hình/đóng dialog, thông báo lỗi có thể đọc bằng công cụ hỗ trợ, nút khoảng 44×44px và reduced motion theo design guideline.

**File dự kiến:** `index.html`, `style.css`, `script.js`, test checkout/session.

**Nghiệm thu:** người dùng hoàn thành luồng bằng điện thoại và bàn phím; lỗi có bước phục hồi rõ; admin CRUD không làm mất lịch sử vé. Đạt mốc demo sau khi giai đoạn 0–2 hoàn tất.

### Giai đoạn 3 — Tồn kho và giữ chỗ

Phụ thuộc: giai đoạn 1 và quyết định quy tắc tồn kho/giữ chỗ.

- [ ] Phân biệt tổng tồn kho, số vé đang giữ, số đã bán và giới hạn mỗi đơn.
- [ ] Tạo reservation có hạn sử dụng; giữ/trừ/hoàn tồn trong transaction có cơ chế khóa phù hợp.
- [ ] Hết hạn hoặc hủy phải giải phóng đúng một lần; tác vụ hết hạn có thể chạy lại an toàn.
- [ ] Chốt hành vi khi admin đổi giá, ngừng bán hoặc xóa concert đang có reservation.
- [ ] Chốt xử lý thanh toán đến sau khi reservation hết hạn.

**Nghiệm thu:** với một vé còn lại và hai yêu cầu đồng thời, tối đa một yêu cầu giữ được vé; tồn không âm; hết hạn/trả lại tồn không bị lặp.

### Giai đoạn 4 — Thanh toán thật và xác nhận vé

Phụ thuộc: giai đoạn 3; lựa chọn provider, tài khoản sandbox và quy tắc thanh toán đã được xác nhận.

- [ ] Thiết kế trạng thái đơn và payment riêng, ví dụ pending/paid/failed/cancelled/expired; lập migration thay vì ghi giá trị mới vào constraint hiện có.
- [ ] Server tạo giao dịch từ đơn và tổng tiền đã xác minh; không nhận trạng thái thành công từ client.
- [ ] Xác minh chữ ký webhook; kiểm tra mã đơn, số tiền, tiền tệ và transaction ID; xử lý webhook lặp/sai thứ tự.
- [ ] Trang quay lại từ provider chỉ hiển thị trạng thái đã được backend xác minh.
- [ ] Lưu lịch sử payment, cung cấp tác vụ đối soát cho giao dịch chờ hoặc chưa rõ kết quả.
- [ ] Chỉ phát xác nhận vé sau thanh toán hợp lệ; chốt dùng mã đặt vé hay bổ sung email/QR theo nhu cầu.
- [ ] Thay hard delete đối với đơn có giao dịch bằng quy trình hủy có audit; hoàn tiền cần phạm vi nghiệp vụ riêng.

**Nghiệm thu:** sandbox xử lý đúng thành công, thất bại, hủy, timeout, webhook lặp và giả mạo; một giao dịch không tạo nhiều vé; không có vé xác nhận từ client tự báo thành công.

### Giai đoạn 5 — Vận hành và phát hành

- [ ] Thêm phân trang, audit quản trị và kiểm soát cập nhật đồng thời.
- [ ] Tách notification khỏi request bằng outbox; retry có giới hạn và khóa chống gửi trùng.
- [ ] Log có request ID; tránh ghi secret/token hoặc đầy đủ thông tin cá nhân; theo dõi lỗi API, booking và thanh toán.
- [ ] Kiểm tra quyền bảng/RPC trên môi trường thử nghiệm; secret chỉ nằm phía server; cấu hình auth redirect và biến môi trường theo nơi triển khai.
- [ ] Chuẩn bị backup, rollback ứng dụng và phương án xử lý migration khi rollback.
- [ ] Kiểm thử trên preview hosting để kiểm chứng API JavaScript thực tế; chỉ phát hành sau khi đạt checklist tương ứng demo/giao dịch thật.

**Nghiệm thu:** cài đặt lặp lại được, preview hoàn thành luồng chính, có hướng dẫn sự cố và khôi phục; bản demo vẫn được ghi nhãn nếu chưa xong giai đoạn 3–4.

## 7. Ma trận kiểm thử bắt buộc

| Nhóm | Ca quan trọng | Cấp kiểm tra |
|---|---|---|
| Auth | Chưa đăng nhập, token hết hạn, auth service lỗi, đổi tài khoản khi request đang chạy | Unit + browser |
| Quyền | User thường gọi API admin; admin chưa xác thực; đọc đơn người khác; đổi email liên hệ | API contract + DB test |
| Concert | Ngày sai, hạng vé trùng, giá sai, edit/delete khi checkout đang mở | Unit + DB transaction + browser |
| Booking | 0/7 vé, UUID sai, tên/điện thoại sai, giá thay đổi, ticket sai concert, request trùng | API contract + DB test |
| Inventory | Hai người tranh vé cuối, hết hạn giữ chỗ, retry hoàn tồn | DB concurrency |
| Payment | Webhook giả/lặp/sai số tiền, timeout, callback đến trước webhook, thanh toán đến muộn | Provider sandbox + integration |
| Notification | Gửi lỗi nhưng đơn đã lưu; retry không tạo booking hoặc thông báo trùng | Mock + integration thử nghiệm |
| UI | Mobile, bàn phím, lỗi/empty/loading, dữ liệu form được giữ | Browser thủ công/tự động |
| Phục vụ file | Không truy cập được `.env.local`, `.git`, source backend | HTTP regression |

Giữ các test hiện có. Bổ sung test hướng hành vi và giao dịch thật trong database thử nghiệm; test mock xanh không thay thế kiểm thử RLS, transaction hay provider.

## 8. Thứ tự ưu tiên và quy mô dự kiến

| Giai đoạn | Quy mô tương đối | Phụ thuộc |
|---|---|---|
| 0. Baseline/setup | Nhỏ | Bắt đầu ngay |
| 1. Booking/quyền | Vừa | Baseline và phương án dữ liệu cũ |
| 2. UX/demo | Vừa | Hợp đồng lỗi từ giai đoạn 1 |
| 3. Tồn kho | Lớn | Giai đoạn 1, quy tắc giữ chỗ |
| 4. Thanh toán | Lớn | Giai đoạn 3, provider sandbox |
| 5. Vận hành | Vừa | Chuẩn bị sớm; nghiệm thu sau luồng hoàn chỉnh |

Chưa đặt ngày hoàn thành vì chưa có deadline, nguồn lực và provider. Nếu mục tiêu là nộp Homework, ưu tiên giai đoạn 0–2 và mô tả trung thực giới hạn. Nếu mục tiêu là mở bán, giai đoạn 3–5 là điều kiện trước phát hành giao dịch thật.

## 9. Quyết định cần chốt khi bắt đầu triển khai

1. Mục tiêu bàn giao là demo hay bán vé thật; thời hạn dự kiến?
2. Provider thanh toán nào và loại tiền tệ được hỗ trợ? Hiện giao diện/giá dùng VND.
3. Tổng tồn kho do ai nhập; có giữ chỗ không và giữ bao lâu?
4. Xác nhận bằng mã booking đã đủ chưa; có cần QR/email hoặc kiểm vé tại cổng?
5. Cho phép admin sửa/hủy đến mức nào khi đơn đã thanh toán; ai xử lý hoàn tiền?

Không mở rộng resale, mạng xã hội, loyalty, chọn ghế chi tiết hoặc hệ thống hàng chờ trong kế hoạch MVP này. Tìm/lọc nâng cao và theo dõi concert giữ ở backlog sau khi luồng đặt vé cốt lõi ổn định.
