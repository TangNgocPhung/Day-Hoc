# Backend đăng ký chỗ ngồi TC_TIN_15

Trang đăng ký trên GitHub Pages cần Google Apps Script để lưu dữ liệu chung và khóa chống đăng ký trùng.

1. Tạo một Google Sheet trống, đặt tên `Đăng ký chỗ ngồi TC_TIN_15`.
2. Trong Sheet, mở **Tiện ích mở rộng > Apps Script**.
3. Thay nội dung `Code.gs` bằng nội dung của file `Code.gs` trong thư mục này.
4. Chạy hàm `setup` một lần và cấp quyền cho script.
5. Chọn **Triển khai > Bản triển khai mới > Ứng dụng web**.
6. Chọn **Thực thi với tư cách: Tôi** và **Ai có quyền truy cập: Bất kỳ ai**.
7. Sao chép URL kết thúc bằng `/exec` và thay giá trị `apiUrl` trong `../seat-registration-config.js`.

Hệ thống dùng `LockService` để kiểm tra và ghi trong cùng một khóa giao dịch. Nếu hai học sinh chọn cùng lúc, chỉ yêu cầu đến trước được ghi; yêu cầu còn lại nhận thông báo chọn máy khác.
