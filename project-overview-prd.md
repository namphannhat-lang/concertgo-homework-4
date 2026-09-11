# Project Overview & PRD --- ConcertGo

**Trạng thái:** Draft\
**Ngày:** 2026-08-21\
**Phiên bản:** MVP

## 1. Tổng quan sản phẩm

-   **Tên sản phẩm:** ConcertGo
-   **Mô tả một câu:** Nền tảng giúp fan trẻ tìm, đặt, thanh toán và
    nhận xác nhận vé concert trực tuyến mà không cần đến điểm bán.
-   **Đối tượng người dùng:** Fan trẻ muốn mua vé concert, đặc biệt là
    người quan tâm đến các concert hot.
-   **Hành động quan trọng nhất:** Đặt và nhận vé concert trực tuyến.

## 2. Câu định vị MVP

> Tôi tạo ra **ConcertGo** dành cho **fan trẻ muốn mua vé concert** để
> giúp họ **đặt và nhận vé concert trực tuyến mà không cần đến điểm
> bán**.

## 3. Người dùng và bối cảnh

-   **Người dùng chính:** Fan trẻ muốn mua vé concert trực tuyến.
-   **Tình huống sử dụng:** Khi người dùng muốn mua vé concert mà không
    muốn hoặc không thể đến điểm bán trực tiếp.
-   **Động lực:** Tiết kiệm thời gian và công sức di chuyển; hoàn thành
    việc mua vé từ xa.
-   **Rào cản:** `CHƯA ĐỦ DỮ LIỆU` về các rào cản cụ thể khi người dùng
    mua vé hiện nay, ngoài việc phải di chuyển trong một số trường hợp.

## 4. Vấn đề cần giải quyết

-   **Nỗi đau chính:** Người dùng có thể mất thời gian và công sức di
    chuyển để mua vé concert trực tiếp.
-   **Cách làm hiện tại:** Có thể phải đến điểm bán trực tiếp hoặc sử
    dụng các cách đặt vé hiện có.
-   **Vì sao cách hiện tại chưa tốt:** Việc phải di chuyển làm tăng thời
    gian và sự bất tiện.
-   **Bằng chứng:** `CHƯA ĐỦ DỮ LIỆU`. Chưa có phỏng vấn người dùng, dữ
    liệu hành vi hoặc số liệu chứng minh mức độ phổ biến của vấn đề.

## 5. Job To Be Done

> Khi muốn tham dự một concert, tôi muốn chọn và đặt vé trực tuyến, để
> có thể hoàn thành việc mua vé mà không cần đến điểm bán.

## 6. Giá trị sản phẩm

-   **Giá trị cốt lõi:** Cho phép fan hoàn thành luồng mua vé concert từ
    xa trong một trải nghiệm liền mạch.
-   **Điểm khác biệt có thể kiểm chứng:** Một luồng từ tìm concert đến
    nhận xác nhận vé trực tuyến, tập trung vào sự thuận tiện.
-   **Giả định quan trọng nhất:** Người dùng thực sự muốn hoàn thành
    toàn bộ quá trình mua và nhận vé online thay vì phải xử lý một phần
    tại điểm bán.

## 7. Core user flow

1.  Người dùng xem hoặc tìm concert muốn tham dự.
2.  Người dùng mở concert và chọn loại vé/số lượng vé phù hợp.
3.  Người dùng nhập thông tin cần thiết và kiểm tra đơn đặt vé.
4.  Người dùng thực hiện thanh toán trực tuyến.
5.  Hệ thống thông báo kết quả giao dịch và, khi thành công, cung cấp
    xác nhận vé cho người dùng.

## 8. Functional requirements

### P0 --- Bắt buộc cho MVP

-   **FR-01 --- Danh sách concert:** Hệ thống phải hiển thị các concert
    có thể đặt vé với thông tin cơ bản đủ để người dùng chọn concert.
-   **FR-02 --- Chi tiết concert:** Khi người dùng chọn một concert, hệ
    thống phải hiển thị thông tin concert và các loại vé đang được cung
    cấp.
-   **FR-03 --- Chọn vé:** Người dùng phải có thể chọn loại vé và số
    lượng vé trước khi tiếp tục.
-   **FR-04 --- Thông tin đặt vé:** Hệ thống phải cho phép người dùng
    nhập các thông tin cần thiết để tạo đơn đặt vé và báo lỗi khi dữ
    liệu bắt buộc không hợp lệ.
-   **FR-05 --- Kiểm tra đơn:** Trước khi thanh toán, người dùng phải
    thấy concert, loại vé, số lượng và tổng tiền của đơn.
-   **FR-06 --- Thanh toán online:** Hệ thống phải cung cấp luồng thanh
    toán trực tuyến và trả về trạng thái thành công hoặc thất bại.
-   **FR-07 --- Xác nhận vé:** Sau khi thanh toán thành công, hệ thống
    phải hiển thị xác nhận đặt vé để người dùng biết giao dịch đã hoàn
    tất.
-   **FR-08 --- Xử lý lỗi cơ bản:** Hệ thống phải có phản hồi rõ ràng
    khi dữ liệu không hợp lệ, vé không còn khả dụng hoặc thanh toán thất
    bại.

### P1 --- Có thể làm sau khi P0 ổn định

-   **FR-09 --- Tìm kiếm/lọc nâng cao:** Cho phép tìm concert theo nhiều
    tiêu chí.
-   **FR-10 --- Lịch sử vé:** Cho phép người dùng xem lại các vé đã đặt
    trong tài khoản.
-   **FR-11 --- Thông báo concert:** Cho phép theo dõi concert và nhận
    thông báo khi sắp mở bán.

## 9. Scope

### IN --- MVP làm

-   Xem danh sách concert.
-   Xem chi tiết concert.
-   Chọn loại vé và số lượng.
-   Nhập thông tin đặt vé.
-   Kiểm tra đơn trước khi thanh toán.
-   Thanh toán trực tuyến.
-   Nhận trạng thái và xác nhận vé sau khi thanh toán.
-   Xử lý các trạng thái lỗi cơ bản trong luồng đặt vé.

### OUT --- Chưa làm

-   Vé resale/chợ vé thứ cấp.
-   Cộng đồng hoặc mạng xã hội cho fan.
-   Loyalty, điểm thưởng hoặc membership.
-   Gợi ý concert cá nhân hóa.
-   Hệ thống săn vé, hàng chờ hoặc countdown chuyên biệt cho concert
    hot.
-   Sơ đồ chọn ghế chi tiết.

### Non-goals --- Cố tình không giải quyết

-   Không xây một mạng xã hội âm nhạc.
-   Không giải quyết mua bán lại vé giữa người dùng.
-   Không tối ưu cho toàn bộ quy trình vận hành concert hoặc quản lý sự
    kiện của nhà tổ chức trong MVP.

## 10. Success criteria và validation

  -----------------------------------------------------------------------
  Success criterion       Cách kiểm chứng         Tín hiệu đạt
  ----------------------- ----------------------- -----------------------
  Người dùng hiểu cách    Cho người dùng mục tiêu Người dùng tự tìm được
  bắt đầu đặt vé          thử mà không hướng dẫn  concert và bắt đầu
                                                  luồng đặt vé

  Người dùng hoàn thành   Quan sát phiên dùng thử Người dùng đi hết luồng
  core user flow          từ chọn concert đến xác mà không cần người xây
                          nhận vé                 sản phẩm can thiệp

  Luồng giúp giảm nhu cầu Hỏi người dùng sau khi  Người dùng xác nhận họ
  đến điểm bán            trải nghiệm             có thể hoàn thành việc
                                                  đặt vé từ xa bằng luồng
                                                  này

  Các lỗi chính có hướng  Thử input sai, vé không Mỗi tình huống có thông
  phục hồi                khả dụng và thanh toán  báo rõ và có bước tiếp
                          thất bại                theo để thử lại hoặc
                                                  sửa dữ liệu
  -----------------------------------------------------------------------

> Chưa đặt tỷ lệ chuyển đổi hoặc thời gian hoàn thành cụ thể vì chưa có
> dữ liệu nền. Cần đo sau những phiên dùng thử đầu tiên.

## 11. Edge cases quan trọng

-   **Khi input trống hoặc sai:** Không cho tiếp tục với trường bắt buộc
    chưa hợp lệ; chỉ rõ trường cần sửa.
-   **Khi không có dữ liệu:** Hiển thị trạng thái không có concert hoặc
    không có loại vé khả dụng thay vì màn hình trống.
-   **Khi vé hết hoặc không còn đủ số lượng:** Thông báo trước khi hoàn
    tất thanh toán và yêu cầu người dùng chọn lại.
-   **Khi thanh toán thất bại:** Không hiển thị xác nhận vé; thông báo
    thất bại và cung cấp cách thử lại.
-   **Khi thao tác thất bại do hệ thống:** Giữ tối đa thông tin người
    dùng đã nhập nếu an toàn và cho phép thử lại.
-   **Khi dùng trên màn hình nhỏ:** Core user flow vẫn phải hoàn thành
    được; chi tiết responsive sẽ được xác định trong design guideline.

## 12. Ràng buộc và dependency

-   **Nền tảng:** Chưa được user giới hạn. Đề xuất của coach: web
    responsive để dùng được trên điện thoại và máy tính.
-   **Thời gian/ngân sách/kỹ năng:** User chưa đặt giới hạn cụ thể.
-   **Dữ liệu:** Cần dữ liệu concert, loại vé, giá và tình trạng vé.
    Nguồn dữ liệu thật chưa được xác định.
-   **Tích hợp:** Thanh toán online là dependency quan trọng; nhà cung
    cấp thanh toán chưa được chọn.
-   **Bảo mật hoặc quyền riêng tư:** Cần bảo vệ thông tin người mua và
    dữ liệu liên quan đến thanh toán; phạm vi dữ liệu cụ thể phụ thuộc
    giải pháp thanh toán được chọn.

## 13. Rủi ro và giả định

  -----------------------------------------------------------------------
  Loại                    Nội dung                Cách giảm rủi ro/kiểm
                                                  chứng
  ----------------------- ----------------------- -----------------------
  Giả định                Fan gặp bất tiện đáng   Phỏng vấn nhanh 5--8
                          kể vì phải đi mua vé    người thuộc nhóm mục
                          trực tiếp               tiêu về lần mua vé gần
                                                  nhất

  Giả định                Người dùng muốn hoàn    Cho họ thử core flow và
                          thành toàn bộ quá trình hỏi liệu họ có chọn
                          online                  cách này thay cho cách
                                                  hiện tại

  Rủi ro                  Thanh toán thật làm MVP Chọn một giải pháp
                          phức tạp hơn            thanh toán duy nhất;
                                                  xác nhận yêu cầu kỹ
                                                  thuật trước khi triển
                                                  khai

  Rủi ro                  Vé có thể hết trong lúc Xác định quy tắc kiểm
                          người dùng đang đặt     tra/tạm giữ tồn vé
                                                  trước khi triển khai

  Rủi ro                  Chưa có nguồn dữ liệu   Dùng dữ liệu mẫu cho
                          concert và vé           bản thử nghiệm nếu chưa
                                                  có nguồn dữ liệu thật
  -----------------------------------------------------------------------

## 14. Câu hỏi còn mở

-   [ ] ConcertGo sẽ dùng dữ liệu concert/vé từ đâu?
-   [ ] MVP sẽ tích hợp nhà cung cấp thanh toán nào?
-   [ ] Vé có cần được giữ tạm trong thời gian thanh toán hay chỉ kiểm
    tra lại trước khi xác nhận?
-   [ ] Xác nhận vé ở MVP là mã đặt chỗ, QR code, email hay hình thức
    khác?
-   [ ] Có bắt buộc tạo tài khoản trước khi đặt vé không?
-   [ ] Tên "ConcertGo" có được giữ làm tên chính thức không?

## 15. Điều kiện sẵn sàng sang Design

-   [x] Một người dùng chính đã được chốt.
-   [x] Một hành động chính đã được chốt.
-   [x] P0 và OUT scope không mâu thuẫn.
-   [x] Mỗi success criterion có cách kiểm chứng.
-   [x] Giả định chưa có bằng chứng đã được đánh dấu.
