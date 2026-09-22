# Backend sổ điểm cộng · điểm trừ

Trang `diem-cong.html` lưu dữ liệu trong trình duyệt và tự ghi mọi thay đổi vào [Google Sheet dùng cho sổ điểm](https://docs.google.com/spreadsheets/d/1akRVIQ0bPx2hOC40epQJE-ycTMb7sCzrGHkCEIMQUYw/edit). Nhờ vậy dữ liệu không mất khi đổi máy, các máy dùng chung một sổ, và cô tải về dạng Excel bằng **Tệp > Tải xuống > Microsoft Excel (.xlsx)**.

**Không chia sẻ quyền chỉnh sửa Sheet này** với học sinh.

## Kết nối hoạt động thế nào

Trang không có ô nhập mã. Khi cô mở sổ bằng mật khẩu, trang gửi mật khẩu cho Apps Script. Apps Script so mật khẩu với mã băm trong `SETTINGS.passHash` rồi trả về **mã đồng bộ**, và trang giữ mã này trên máy để các lần sau tự đồng bộ. Mật khẩu không được lưu ở đâu cả.

Địa chỉ `/exec` nằm trong `../diem-cong-config.js` và để công khai được: không có mật khẩu hay mã đồng bộ thì không đọc hay ghi được gì. Sai mật khẩu 10 lần trong 15 phút thì Apps Script tạm khóa đăng nhập.

## Lần đầu cài đặt

1. Trong Sheet, mở **Tiện ích mở rộng > Apps Script**. `SETTINGS.spreadsheetId` đã khóa đúng ID bảng tính này để không ghi nhầm nơi.
2. Thay nội dung `Code.gs` bằng nội dung của file `Code.gs` trong thư mục này rồi bấm Lưu.
3. Chọn hàm `setup` và bấm **Chạy**, cấp quyền cho script.
4. Chọn **Triển khai > Bản triển khai mới > Ứng dụng web**:
   **Thực thi với tư cách: Tôi**, **Ai có quyền truy cập: Bất kỳ ai**.
5. Dán URL kết thúc bằng `/exec` vào `apiUrl` trong `../diem-cong-config.js`.

Sau đó ở mỗi máy, cô chỉ cần mở sổ bằng mật khẩu một lần.

## Mỗi lần sửa `Code.gs`

**Triển khai > Quản lý bản triển khai > (bút chì) > Phiên bản: Phiên bản mới > Triển khai.**
URL `/exec` giữ nguyên.

## Đổi mật khẩu

Mật khẩu đổi trong trang chỉ có hiệu lực trên máy đó; Apps Script vẫn nhận mật khẩu chung. Máy đã kết nối rồi thì đổi mật khẩu vẫn đồng bộ bình thường. Muốn đổi mật khẩu chung thì sửa cả `DEFAULT_PASS_HASH` trong `diem-cong.html` và `SETTINGS.passHash` trong `Code.gs`.

## Cấu trúc trang tính

- `DiemCongTru`: mỗi dòng là một lượt ghi nhận gồm mã, ngày, họ tên, lớp, môn, cột kiểm tra, loại, điểm (điểm trừ ghi số âm), lý do và thời điểm ghi.
- `LichSu`: mỗi thao tác (ghi nhận, xóa, xóa toàn bộ, khôi phục, hoàn tác). Từ cột G trở đi là dữ liệu để trang hoàn tác, **không sửa tay các cột này**.

Cô có thể lọc, sắp xếp, tô màu hay thêm trang tính riêng để tổng hợp. Nên sửa hay xóa điểm ngay trên trang web: sửa tay trong `DiemCongTru` vẫn được, nhưng lần mở sổ tiếp theo trang web sẽ lấy theo Sheet.

## Nếu nghi mã đồng bộ bị lộ

Chạy hàm `resetSyncKey`. Các máy sẽ tự báo chưa kết nối; cô bấm **Khóa lại** rồi mở sổ bằng mật khẩu để nhận mã mới.
