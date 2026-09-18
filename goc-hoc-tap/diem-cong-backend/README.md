# Backend sổ điểm cộng · điểm trừ

Trang `diem-cong.html` lưu dữ liệu trong trình duyệt. Khi kết nối backend này, mọi thay đổi còn được ghi vào một Google Sheet riêng. Nhờ vậy dữ liệu không mất khi đổi máy, các máy dùng chung một sổ, và cô tải về dạng Excel bằng **Tệp > Tải xuống > Microsoft Excel (.xlsx)**.

## Lần đầu cài đặt

1. Tạo một Google Sheet trống, đặt tên `Sổ điểm cộng điểm trừ`. **Không chia sẻ Sheet này** với học sinh.
2. Trong Sheet, mở **Tiện ích mở rộng > Apps Script**.
3. Thay nội dung `Code.gs` bằng nội dung của file `Code.gs` trong thư mục này rồi bấm Lưu.
4. Chọn hàm `setup` và bấm **Chạy**, cấp quyền cho script.
5. Mở **Nhật ký thực thi** và chép **mã đồng bộ** (16 ký tự). Quên mã thì chạy hàm `showSyncKey`.
6. Chọn **Triển khai > Bản triển khai mới > Ứng dụng web**:
   **Thực thi với tư cách: Tôi**, **Ai có quyền truy cập: Bất kỳ ai**.
7. Chép URL kết thúc bằng `/exec`.
8. Mở trang Sổ điểm cộng, vào mục **Đồng bộ Google Sheet**, dán URL và mã đồng bộ rồi bấm **Kết nối**.
   Muốn các máy khác không phải dán URL thì dán nó vào `apiUrl` trong `../diem-cong-config.js`. URL để công khai được vì không có mã đồng bộ thì không đọc hay ghi được.

Ở mỗi máy khác, cô chỉ cần nhập mã đồng bộ một lần.

## Mỗi lần sửa `Code.gs`

**Triển khai > Quản lý bản triển khai > (bút chì) > Phiên bản: Phiên bản mới > Triển khai.**
URL `/exec` giữ nguyên.

## Cấu trúc trang tính

- `DiemCongTru`: mỗi dòng là một lượt ghi nhận gồm mã, ngày, họ tên, lớp, môn, cột kiểm tra, loại, điểm (điểm trừ ghi số âm), lý do và thời điểm ghi.
- `LichSu`: mỗi thao tác (ghi nhận, xóa, xóa toàn bộ, khôi phục, hoàn tác). Từ cột G trở đi là dữ liệu để trang hoàn tác, **không sửa tay các cột này**.

Cô có thể lọc, sắp xếp, tô màu hay thêm trang tính riêng để tổng hợp. Chỉ nên sửa hay xóa dòng ngay trên trang web: sửa tay trong `DiemCongTru` vẫn được, nhưng lần mở sổ tiếp theo trang web sẽ lấy theo Sheet.

## Nếu mã đồng bộ bị lộ

Chạy hàm `resetSyncKey` để tạo mã mới, rồi nhập mã mới trên các máy của cô.
