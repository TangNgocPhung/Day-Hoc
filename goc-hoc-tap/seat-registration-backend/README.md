# Backend đăng ký chỗ ngồi phòng máy

Trang đăng ký trên GitHub Pages cần Google Apps Script để lưu dữ liệu chung và khóa chống đăng ký trùng.

Một sơ đồ chỗ ngồi được tính riêng cho từng cặp **(phòng máy, nhóm tự chọn)**, nên nhóm TC_TIN_13 và TC_TIN_14 vẫn dùng được cùng một máy ở hai buổi khác nhau.

## Lần đầu cài đặt

1. Tạo một Google Sheet trống, đặt tên `Đăng ký chỗ ngồi phòng máy`.
2. Trong Sheet, mở **Tiện ích mở rộng > Apps Script**.
3. Thay nội dung `Code.gs` bằng nội dung của file `Code.gs` trong thư mục này.
4. Chạy hàm `setup` một lần và cấp quyền cho script.
5. Chọn **Triển khai > Bản triển khai mới > Ứng dụng web**.
6. Chọn **Thực thi với tư cách: Tôi** và **Ai có quyền truy cập: Bất kỳ ai**.
7. Sao chép URL kết thúc bằng `/exec` và thay giá trị `apiUrl` trong `../seat-registration-config.js`.

## Mỗi lần sửa `Code.gs`

**Triển khai > Quản lý bản triển khai > (bút chì) > Phiên bản: Phiên bản mới > Triển khai.**
URL `/exec` giữ nguyên nên không phải sửa lại `seat-registration-config.js`.

## Cấu trúc trang tính

Hàm `setup` tạo trang tính `DangKyChoNgoi` với 10 cột:

| Cột | Nội dung |
|---|---|
| Thời gian | lúc học sinh bấm đăng ký |
| Mã phòng | `PM1`…`PM5`, dùng để đối chiếu dữ liệu |
| Phòng máy | tên đầy đủ cho dễ đọc |
| Nhóm tự chọn | `TC_TIN_13`…`TC_MOS_15` |
| Lớp học | lớp chính khóa của học sinh |
| Họ và tên | |
| Máy | số máy trong phòng |
| Dãy, Vị trí trong dãy | suy ra từ số máy |
| Suất | `1` là người ngồi chính, `2` là người ngồi ghép |

`setup` từ chối chạy nếu trang tính đã có dữ liệu, để không ghi đè lên đăng ký cũ. Muốn đổi cấu trúc cột thì xóa hết các dòng dữ liệu (giữ hàng tiêu đề) rồi chạy lại.

## Quy tắc chỗ ngồi

- Mỗi máy ưu tiên một học sinh.
- Phòng máy 1–4 (`sharedSeats: true`): hai máy đầu mỗi dãy (`pairPositions`) nhận tối đa 2 học sinh ngay từ đầu, vì phòng có máy hỏng nên phải ngồi chung. Các máy còn lại chỉ 1 học sinh.
- Phòng máy 5 / phòng LAB (`sharedSeats: false`): không ghép chung.
- Một học sinh (trùng họ tên và lớp) chỉ đăng ký được một chỗ cho mỗi nhóm tự chọn.

Hệ thống dùng `LockService` để kiểm tra và ghi trong cùng một khóa giao dịch. Nếu hai học sinh chọn cùng lúc, chỉ yêu cầu đến trước được ghi; yêu cầu còn lại nhận thông báo chọn máy khác.

## Giữ đồng bộ với trang web

Danh sách phòng và số máy nằm ở hai nơi và **phải khớp nhau**:

- `SETTINGS.rooms` và `SETTINGS.courses` trong `Code.gs`
- `window.PHONG_MAY` trong `../data/phong-may.js`

Mã phòng (`PM1`…`PM5`) là khóa đối chiếu, đổi ở một bên thì phải đổi ở bên kia.
