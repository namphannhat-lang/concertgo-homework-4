# Design Guidelines --- ConcertGo

**Nguồn:** `project-overview-prd.md`\
**Trạng thái:** Draft\
**Ngày:** 2026-08-21

## 1. Design direction

-   **Hướng được khuyến nghị:** Warm Concert Energy --- kết hợp cảm giác
    ấm cúng của trải nghiệm âm nhạc trực tiếp, năng lượng của concert và
    sự rõ ràng của một sản phẩm đặt vé hiện đại.
-   **Ba tính từ định hướng:** Ấm cúng, năng động, hiện đại.
-   **Vì sao phù hợp:** Người dùng chính là fan trẻ muốn tìm và đặt vé
    nhanh. Hình ảnh và điểm nhấn có thể truyền năng lượng concert, trong
    khi các bước chọn vé và thanh toán phải sạch, dễ đọc và đáng tin.
-   **Điều cần tránh:** Giao diện giống poster quá mức; quá nhiều
    neon/gradient; hiệu ứng làm lu mờ giá vé hoặc CTA; checkout nhiều
    chi tiết trang trí; chữ nhỏ; dùng màu làm tín hiệu trạng thái duy
    nhất.
-   **Giả định thiết kế:** ConcertGo chưa có bộ nhận diện chính thức.
    Tên, màu, font và art direction dưới đây là đề xuất cần kiểm chứng
    bằng bản mockup và người dùng thử.

### Phân loại đầu vào

-   **Thông tin user cung cấp:** responsive mobile + desktop; màn hình
    đầu hiển thị danh sách concert; cảm giác ấm cúng, năng động, hiện
    đại; Tiếng Việt; nội dung ngắn; tương phản tốt; nút đủ lớn trên
    mobile; keyboard focus rõ; không dùng màu sắc làm tín hiệu duy nhất.
-   **Đề xuất của coach:** mobile-first trong cách ưu tiên bố cục; art
    direction Warm Concert Energy; bảng màu và typography bên dưới;
    checkout giảm trang trí để tăng độ rõ và tin cậy.
-   **Giả định cần kiểm chứng:** Người dùng thích phong cách tối ấm; ảnh
    concert giúp quyết định mà không gây nhiễu; màu tím/hồng/cam phù hợp
    với nhận diện mong muốn.

## 2. UX principles

1.  **Concert trước, thao tác ngay:** Khi mở sản phẩm, người dùng nhìn
    thấy concert và có thể chọn ngay mà không phải đi qua màn hình giới
    thiệu.
2.  **Một quyết định chính mỗi bước:** Mỗi vùng quyết định chỉ có một
    CTA chính; đặc biệt ở chọn vé và checkout.
3.  **Luôn biết mình đang mua gì:** Tên concert, loại vé, số lượng và
    tổng tiền phải dễ kiểm tra trước khi thanh toán.
4.  **Phản hồi rõ, có đường phục hồi:** Loading, hết vé, input sai và
    thanh toán thất bại đều phải nói rõ chuyện gì xảy ra và người dùng
    nên làm gì tiếp.
5.  **Năng lượng ở discovery, bình tĩnh ở checkout:** Trang khám phá có
    thể giàu hình ảnh; phần nhập thông tin và thanh toán ưu tiên sự rõ
    ràng.

## 3. Information architecture

-   **Khu vực chính:** Khám phá concert → Chi tiết concert → Chọn vé →
    Thông tin đặt vé/kiểm tra đơn → Thanh toán → Xác nhận.
-   **Quan hệ điều hướng:** Luồng tuyến tính sau khi người dùng chọn
    concert. Người dùng có thể quay lại bước trước trước khi thanh toán
    mà không mất lựa chọn hợp lệ.
-   **Nội dung ưu tiên:** Concert và CTA chọn concert ở entry; loại vé
    và giá ở chi tiết; tóm tắt đơn và tổng tiền ở checkout; trạng thái
    giao dịch và thông tin xác nhận ở cuối.

## 4. Core user flow

1.  **Entry:** Người dùng mở ConcertGo và thấy danh sách concert.
2.  **Primary action:** Chọn concert, sau đó chọn loại vé và số lượng.
3.  **System feedback:** Hệ thống kiểm tra dữ liệu/khả dụng, hiển thị
    giá và trạng thái rõ ràng.
4.  **Result:** Người dùng nhập thông tin, kiểm tra đơn, thanh toán và
    nhận xác nhận khi thành công.
5.  **Next useful action:** Xem lại thông tin xác nhận hoặc quay về danh
    sách concert.

## 5. Screens and states

  ---------------------------------------------------------------------------
  Màn hình          Mục đích          Nội dung chính    Trạng thái bắt buộc
  ----------------- ----------------- ----------------- ---------------------
  Danh sách concert Giúp người dùng   Card concert,     default, loading,
                    chọn concert ngay ảnh, tên, thời    empty, error
                                      gian/địa điểm nếu 
                                      có dữ liệu, trạng 
                                      thái vé, CTA      
                                      xem/đặt vé        

  Chi tiết concert  Giúp hiểu concert Hero concert,     default, loading,
                    và chọn vé        thông tin chính,  unavailable/sold out,
                                      danh sách loại    error
                                      vé, giá, số       
                                      lượng, CTA tiếp   
                                      tục               

  Thông tin đặt vé  Thu thập dữ liệu  Form có label,    default, validation
                    cần thiết         validation, tóm   error
                                      tắt lựa chọn vé   

  Kiểm tra đơn      Cho người dùng    Concert, vé, số   default,
                    xác nhận trước    lượng, thông tin  price/availability
                    thanh toán        người mua, tổng   changed, error
                                      tiền, CTA thanh   
                                      toán              

  Thanh toán        Hoàn tất giao     Khu vực thanh     default,
                    dịch              toán theo nhà     loading/processing,
                                      cung cấp được     error
                                      chọn, trạng thái  
                                      xử lý             

  Xác nhận vé       Xác nhận kết quả  Thông báo thành   success
                    thành công        công, thông tin   
                                      concert, loại/số  
                                      lượng vé, mã/xác  
                                      nhận nếu có       

  Thanh toán thất   Cho phép phục hồi Lý do ở mức an    error
  bại                                 toàn, đơn hiện    
                                      tại, CTA thử lại  
                                      hoặc quay lại     
  ---------------------------------------------------------------------------

> Hình thức xác nhận cuối cùng (mã đặt chỗ, QR, email...) vẫn là câu hỏi
> mở trong PRD, nên UI không được giả định một loại cụ thể cho tới khi
> chốt.

## 6. Component inventory

  -----------------------------------------------------------------------
  Component         Trách nhiệm       Biến thể/state    Ghi chú
                                                        accessibility
  ----------------- ----------------- ----------------- -----------------
  Header            Nhận diện và điều default           Điều hướng
                    hướng tối thiểu                     keyboard được;
                                                        logo có
                                                        accessible name

  ConcertCard       Tóm tắt concert   default,          Toàn card không
                    để chọn nhanh     unavailable       thay thế label rõ
                                                        cho CTA

  ConcertHero       Tạo bối cảnh cảm  default           Ảnh có alt phù
                    xúc ở trang chi                     hợp hoặc
                    tiết                                decorative nếu
                                                        chỉ trang trí

  TicketOption      Hiển thị loại vé, available,        Selected/sold out
                    giá, khả dụng     selected, sold    có text/icon,
                                      out               không chỉ đổi màu

  QuantityControl   Chọn số lượng vé  default, min,     Nút tăng/giảm có
                                      max, disabled     accessible name
                                                        và touch target
                                                        đủ lớn

  PrimaryButton     Hành động chính   default, hover,   Focus ring rõ;
                                      focus, pressed,   disabled không
                                      loading, disabled chỉ dựa vào màu

  FormField         Thu thập thông    default, focus,   Label luôn hiển
                    tin người mua     valid, invalid,   thị; lỗi gắn với
                                      disabled          field

  OrderSummary      Giúp kiểm tra đơn default, changed  Tổng tiền và thay
                                                        đổi quan trọng
                                                        được nhấn rõ

  StatusMessage     Phản hồi hệ thống info, success,    Có icon/text và
                                      warning, error    semantic status
                                                        phù hợp

  LoadingState      Báo đang xử lý    list, payment     Không gây nhấp
                                                        nháy mạnh; có
                                                        text khi chờ quan
                                                        trọng

  EmptyState        Xử lý khi không   concerts, tickets Nêu lý do và hành
                    có concert/vé                       động tiếp theo

  StepIndicator     Cho biết vị trí   current,          Có text/semantic,
                    trong checkout    complete,         không chỉ màu
                                      upcoming          
  -----------------------------------------------------------------------

## 7. Layout và responsive behavior

-   **Mobile:** Mobile-first; danh sách concert một cột; card ưu tiên
    ảnh + tên + thông tin cần thiết + CTA; checkout một cột; CTA quan
    trọng dễ chạm và gần vùng nội dung liên quan.
-   **Tablet:** Có thể tăng lên hai cột cho danh sách concert khi đủ
    chỗ; checkout vẫn ưu tiên luồng đọc rõ.
-   **Desktop:** Danh sách concert dùng grid 2--3 cột tùy chiều rộng;
    trang chi tiết có thể chia nội dung chính và khu chọn vé; checkout
    có thể đặt form và order summary cạnh nhau nếu không làm đứt luồng
    đọc.
-   **Grid/container:** Container tối đa khoảng 1200px, padding tối
    thiểu 16px mobile và 24--32px ở màn hình lớn. Dùng grid linh hoạt,
    không cố định chiều rộng card.
-   **Ưu tiên khi không đủ chỗ:** Giữ tên concert, giá, trạng thái vé và
    CTA; giảm nội dung mô tả/phụ trợ trước.

## 8. Design tokens

### Color

  -----------------------------------------------------------------------
  Token                   Giá trị đề xuất         Mục đích
  ----------------------- ----------------------- -----------------------
  `color-primary`         `#7C3AED`               CTA, focus/selected có
                                                  hỗ trợ thêm shape/text

  `color-accent-warm`     `#F97316`               Điểm nhấn ấm, dùng tiết
                                                  chế

  `color-accent-energy`   `#EC4899`               Điểm nhấn năng lượng ở
                                                  discovery

  `color-background`      `#18151D`               Nền tối ấm cho khu khám
                                                  phá

  `color-surface`         `#24202A`               Card/surface trên nền
                                                  tối

  `color-surface-light`   `#FFFFFF`               Checkout/form khi cần
                                                  tối đa độ rõ

  `color-text`            `#F8FAFC`               Text chính trên nền tối

  `color-text-dark`       `#18181B`               Text trên surface sáng

  `color-muted`           `#A8A1B0`               Text phụ trên nền tối

  `color-danger`          `#DC2626`               Lỗi, luôn đi kèm
                                                  icon/text

  `color-success`         `#15803D`               Thành công, luôn đi kèm
                                                  icon/text
  -----------------------------------------------------------------------

> Các cặp màu thực tế phải được kiểm tra tương phản trước khi triển
> khai; mã HEX hiện là đề xuất thiết kế, chưa phải brand token đã duyệt.

### Typography

-   **Font family:** Inter hoặc sans-serif hệ thống tương đương; ưu tiên
    dễ đọc và hỗ trợ tiếng Việt tốt.
-   **Display:** 40--56px desktop / 32--40px mobile, bold.
-   **Heading:** 24--32px, semibold/bold.
-   **Body:** 16px, regular; line-height khoảng 1.5.
-   **Label/Button:** 14--16px, medium/semibold.
-   **Nguyên tắc độ dài dòng:** Nội dung dài khoảng 55--75 ký tự mỗi
    dòng ở desktop; form và checkout giữ câu ngắn.

### Spacing, radius và elevation

-   **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64px.
-   **Radius:** 12px cho control/card nhỏ; 16--20px cho card concert
    lớn.
-   **Border/elevation:** Border mảnh để phân vùng; shadow nhẹ khi cần
    tách card, không dùng glow dày quanh checkout.

## 9. Interaction và feedback

-   **Primary action:** Mỗi bước có một CTA chính rõ: "Chọn vé", "Tiếp
    tục", "Thanh toán", "Thử lại".
-   **Hover/focus/pressed/disabled:** Hover chỉ là bổ sung; focus ring
    rõ 2--3px; pressed có phản hồi thị giác; disabled kèm thay đổi độ
    tương phản và trạng thái semantic.
-   **Validation:** Validate khi người dùng rời field hoặc submit; lỗi
    đặt gần field, nói rõ cách sửa.
-   **Loading:** Dùng skeleton cho danh sách; khi thanh toán dùng trạng
    thái "Đang xử lý thanh toán..." và chặn submit lặp.
-   **Success:** Hiển thị tiêu đề thành công rõ, tóm tắt giao dịch và
    xác nhận vé nếu đã có định dạng được chốt.
-   **Error và recovery:** Nêu lỗi bằng ngôn ngữ dễ hiểu, giữ dữ liệu an
    toàn đã nhập, cho phép sửa hoặc thử lại.

## 10. Content và microcopy

-   **Ngôn ngữ:** Tiếng Việt.
-   **Tone:** Ngắn, thân thiện, rõ ràng; năng lượng ở discovery nhưng
    bình tĩnh ở thanh toán/lỗi.
-   **Quy tắc label/button/error:** Button bắt đầu bằng động từ; tránh
    thuật ngữ kỹ thuật; lỗi phải nói cả vấn đề và cách xử lý.
-   **Ví dụ copy chính:**
    -   "Khám phá concert"
    -   "Chọn vé"
    -   "Tiếp tục đặt vé"
    -   "Kiểm tra đơn"
    -   "Thanh toán"
    -   "Đang xử lý thanh toán..."
    -   "Đặt vé thành công"
    -   "Thanh toán chưa thành công. Kiểm tra thông tin và thử lại."
    -   "Loại vé này hiện không còn khả dụng. Hãy chọn loại vé khác."

## 11. Accessibility

-   **Tương phản:** Text và control phải đạt tương phản đủ rõ; kiểm tra
    thực tế trước triển khai, đặc biệt với tím/hồng/cam trên nền tối.
-   **Keyboard và focus:** Toàn bộ core flow dùng được bằng bàn phím;
    thứ tự tab theo luồng đọc; focus ring luôn nhìn thấy.
-   **Label và semantic structure:** Form field có label thật; heading
    theo thứ bậc; thông báo lỗi/trạng thái có semantic phù hợp.
-   **Touch target:** Nút và control quan trọng tối thiểu khoảng 44×44px
    trên mobile.
-   **Motion/reduced motion:** Animation ngắn và có mục đích; tôn trọng
    `prefers-reduced-motion`; không dùng chuyển động liên tục để truyền
    tải thông tin thiết yếu.
-   **Không phụ thuộc màu:** Selected, sold out, success, warning và
    error luôn có text, icon hoặc shape hỗ trợ.

## 12. UI acceptance checklist

-   [ ] Hành động chính nổi bật và chỉ có một primary CTA trong mỗi vùng
    quyết định.
-   [ ] Mobile và desktop đều hoàn thành được core user flow.
-   [ ] Mở sản phẩm là thấy danh sách concert và có thể chọn concert.
-   [ ] Loading, empty, error và success có cách hiển thị cụ thể.
-   [ ] Form có label, validation và hướng phục hồi lỗi.
-   [ ] Không dùng màu sắc làm tín hiệu duy nhất.
-   [ ] Nút quan trọng trên mobile có touch target đủ lớn.
-   [ ] Keyboard focus rõ trong toàn bộ core flow.
-   [ ] Checkout ưu tiên sự rõ ràng hơn hiệu ứng trang trí.
-   [ ] UI không đưa thêm tính năng ngoài PRD.

## 13. UI Spec Prompt --- copy toàn bộ vào công cụ thiết kế

Bạn là một senior product designer. Hãy tạo UI mockup hoàn chỉnh cho sản
phẩm **ConcertGo**.

### Bối cảnh sản phẩm

ConcertGo là nền tảng đặt vé concert trực tuyến dành cho fan trẻ muốn
mua vé concert, đặc biệt là người quan tâm đến các concert hot. Nỗi đau
cần giải quyết là người dùng có thể mất thời gian và công sức di chuyển
để mua vé trực tiếp.

Câu định vị:

"Tôi tạo ra ConcertGo dành cho fan trẻ muốn mua vé concert để giúp họ
đặt và nhận vé concert trực tuyến mà không cần đến điểm bán."

Bằng chứng về mức độ phổ biến của nỗi đau hiện tại: CHƯA ĐỦ DỮ LIỆU.
Không tự thêm số liệu hoặc tuyên bố thị trường.

### Mục tiêu trải nghiệm

Khi mở sản phẩm, người dùng nhìn thấy danh sách concert và có thể chọn
ngay concert muốn mua vé.

Core user flow:

Danh sách concert → Chi tiết concert → Chọn loại vé và số lượng → Nhập
thông tin → Kiểm tra đơn → Thanh toán → Xác nhận vé.

Mục tiêu là giúp người dùng hoàn thành luồng này rõ ràng trên cả mobile
và desktop.

### Màn hình và trạng thái bắt buộc

1.  **Danh sách concert**
    -   Card concert có ảnh, tên và các thông tin concert đã có dữ liệu.
    -   CTA rõ để xem/chọn concert.
    -   States: default, loading, empty, error.
2.  **Chi tiết concert + chọn vé**
    -   Hero concert.
    -   Thông tin concert.
    -   Danh sách loại vé, giá, số lượng và trạng thái khả dụng.
    -   CTA "Tiếp tục đặt vé".
    -   States: default, loading, selected, sold out/unavailable, error.
3.  **Thông tin đặt vé**
    -   Form thông tin người mua với label luôn hiển thị.
    -   Tóm tắt concert và vé đã chọn.
    -   States: default, focus, validation error.
4.  **Kiểm tra đơn**
    -   Tên concert, loại vé, số lượng, thông tin người mua, tổng tiền.
    -   CTA chính "Thanh toán".
    -   States: default, availability/price changed, error.
5.  **Thanh toán**
    -   Khu thanh toán sạch, ít trang trí.
    -   States: default, processing, error.
    -   Không tự chọn nhà cung cấp thanh toán; đây vẫn là quyết định mở.
6.  **Xác nhận**
    -   Tiêu đề "Đặt vé thành công".
    -   Tóm tắt concert và vé.
    -   Khu vực dành cho thông tin xác nhận.
    -   Không tự quyết định xác nhận là QR, email hay mã đặt chỗ vì PRD
        chưa chốt.
    -   State: success.
7.  **Thanh toán thất bại**
    -   Thông báo rõ.
    -   Giữ thông tin an toàn đã nhập.
    -   CTA "Thử lại" và đường quay lại phù hợp.
    -   State: error.

### Component chính

-   Header tối giản.
-   ConcertCard.
-   ConcertHero.
-   TicketOption.
-   QuantityControl.
-   PrimaryButton.
-   FormField.
-   OrderSummary.
-   StatusMessage.
-   Loading/Skeleton.
-   EmptyState.
-   StepIndicator cho checkout.

Mỗi component tương tác phải có default, hover nếu phù hợp, focus,
pressed và disabled. Sold out, selected, success và error không được chỉ
dùng màu để truyền tải trạng thái.

### Visual direction và design tokens

Hướng thiết kế: **Warm Concert Energy**.

Ba tính từ: **ấm cúng, năng động, hiện đại**.

Discovery có năng lượng và cảm xúc concert; checkout chuyển sang bố cục
sạch, bình tĩnh và đáng tin.

Màu đề xuất: - Primary purple: `#7C3AED` - Warm accent: `#F97316` -
Energy accent: `#EC4899` - Warm dark background: `#18151D` - Dark
surface: `#24202A` - Light surface: `#FFFFFF` - Light text: `#F8FAFC` -
Dark text: `#18181B` - Muted text: `#A8A1B0` - Danger: `#DC2626` -
Success: `#15803D`

Kiểm tra tương phản thực tế; không dùng accent nếu làm giảm khả năng
đọc.

Typography: - Inter hoặc sans-serif tương đương hỗ trợ tiếng Việt. -
Display 40--56px desktop / 32--40px mobile, bold. - Heading 24--32px,
semibold/bold. - Body 16px, line-height khoảng 1.5. - Label/button
14--16px, medium/semibold.

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px.

Radius: 12px cho control/card nhỏ; 16--20px cho concert card lớn.

Dùng ảnh concert giàu cảm xúc nhưng không để ảnh cạnh tranh với giá,
trạng thái vé hoặc CTA. Tránh giao diện giống poster, neon/glow quá mức
và gradient dày đặc.

### Layout và responsive

Thiết kế responsive cho mobile và desktop, ưu tiên mobile-first.

-   Mobile: concert list một cột; checkout một cột; nút chính dễ chạm.
-   Tablet: concert list có thể hai cột.
-   Desktop: concert list 2--3 cột; trang chi tiết có thể chia thông tin
    và khu chọn vé; checkout có thể đặt form cạnh order summary.
-   Container desktop tối đa khoảng 1200px.
-   Padding mobile tối thiểu 16px; màn hình lớn 24--32px.
-   Khi thiếu chỗ, ưu tiên tên concert, giá, trạng thái vé và CTA.

### Tương tác

-   Tap/click concert → mở chi tiết.
-   Chọn TicketOption → hiển thị selected state bằng nhiều tín hiệu
    ngoài màu.
-   QuantityControl → cập nhật số lượng và tổng tiền.
-   Submit form → validate và đưa focus tới lỗi phù hợp khi cần.
-   Thanh toán → chuyển sang processing, ngăn submit lặp.
-   Thành công → hiển thị confirmation.
-   Thất bại → giữ dữ liệu an toàn và cho phép thử lại.
-   Back trong checkout trước thanh toán không được làm mất lựa chọn hợp
    lệ nếu không cần thiết.

### Nội dung mẫu

Dùng copy tiếng Việt ngắn và dễ hiểu:

-   "Khám phá concert"
-   "Chọn vé"
-   "Tiếp tục đặt vé"
-   "Kiểm tra đơn"
-   "Thanh toán"
-   "Đang xử lý thanh toán..."
-   "Đặt vé thành công"
-   "Thanh toán chưa thành công. Kiểm tra thông tin và thử lại."
-   "Loại vé này hiện không còn khả dụng. Hãy chọn loại vé khác."

Dùng dữ liệu concert giả hợp lý cho mockup nhưng không bịa số liệu kinh
doanh, testimonial hoặc đối tác.

### Accessibility

-   Tương phản tốt.
-   Core flow dùng được bằng keyboard.
-   Focus ring rõ.
-   Form có label thật và lỗi liên kết với field.
-   Touch target quan trọng tối thiểu khoảng 44×44px.
-   Không dùng màu làm tín hiệu duy nhất.
-   Tôn trọng reduced motion.
-   Dùng semantic structure rõ ràng.

### Acceptance

-   Người dùng mở sản phẩm là thấy concert và có thể bắt đầu chọn.
-   Chỉ một primary CTA trong mỗi vùng quyết định.
-   Mobile và desktop đều hoàn thành được core flow.
-   Có thiết kế cụ thể cho loading, empty, unavailable, validation
    error, payment processing, payment error và success.
-   Người dùng luôn kiểm tra được concert, loại vé, số lượng và tổng
    tiền trước thanh toán.
-   Checkout ưu tiên độ rõ và tin cậy.
-   Không thêm tính năng ngoài phạm vi MVP.
-   Không tự quyết định nhà cung cấp thanh toán hoặc hình thức xác nhận
    vé khi PRD chưa chốt.

Hãy tạo mockup đủ chi tiết để developer có thể triển khai. Không thêm
tính năng ngoài phạm vi MVP.
