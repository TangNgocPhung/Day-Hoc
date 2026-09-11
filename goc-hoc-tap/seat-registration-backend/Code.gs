/**
 * Backend đăng ký chỗ ngồi phòng máy - Trường THPT Nguyễn Khuyến.
 *
 * Mỗi sơ đồ chỗ ngồi được tính riêng theo cặp (phòng máy, nhóm tự chọn),
 * nên cùng một máy có thể được nhóm TC_TIN_13 và TC_TIN_14 dùng ở hai buổi khác nhau.
 *
 * Cấu hình ROOMS phải khớp với file data/phong-may.js của trang web.
 */
var SETTINGS = {
  sheetName: "DangKyChoNgoi",
  paymentSheetName: "ThuTienDeCuong",
  pairPositions: [1, 2],
  courses: ["TC_TIN_13", "TC_TIN_14", "TC_TIN_15", "TC_MOS_13", "TC_MOS_14", "TC_MOS_15"],
  rooms: {
    PM1: { name: "Phòng máy 1", rowCount: 4, seatsPerRow: 10, sharedSeats: true },
    PM2: { name: "Phòng máy 2", rowCount: 4, seatsPerRow: 10, sharedSeats: true },
    PM3: { name: "Phòng máy 3", rowCount: 4, seatsPerRow: 10, sharedSeats: true },
    PM4: { name: "Phòng máy 4", rowCount: 4, seatsPerRow: 10, sharedSeats: true },
    PM5: { name: "Phòng máy 5 - Phòng LAB", rowCount: 6, seatsPerRow: 8, sharedSeats: false }
  }
};

var HEADERS = [
  "Thời gian",
  "Mã phòng",
  "Phòng máy",
  "Nhóm tự chọn",
  "Lớp học",
  "Họ và tên",
  "Máy",
  "Dãy",
  "Vị trí trong dãy",
  "Suất"
];

var PAYMENT_HEADERS = [
  "Thời gian xác nhận",
  "Họ và tên",
  "Lớp",
  "Nhóm tự chọn",
  "Hình thức",
  "Số tiền",
  "Ghi chú"
];

/**
 * Mật khẩu giáo viên KHÔNG nằm trong mã nguồn, vì file này được đẩy lên
 * GitHub công khai. Đặt nó trong Apps Script:
 *   Cài đặt dự án > Thuộc tính tập lệnh > thêm TEACHER_PASSWORD
 * Chưa đặt thì mọi yêu cầu ghi nhận thu tiền đều bị từ chối.
 */
function teacherPassword_() {
  return PropertiesService.getScriptProperties().getProperty("TEACHER_PASSWORD") || "";
}

function setup() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Hãy tạo mã này từ menu Tiện ích mở rộng > Apps Script của Google Sheet.");
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", spreadsheet.getId());

  var sheet = spreadsheet.getSheetByName(SETTINGS.sheetName) || spreadsheet.insertSheet(SETTINGS.sheetName);
  if (sheet.getLastRow() > 1) {
    throw new Error("Trang tính đã có " + (sheet.getLastRow() - 1) + " dòng dữ liệu cũ. "
      + "Hãy xóa hết các dòng đó (giữ lại hàng tiêu đề) rồi chạy lại setup, vì cấu trúc cột đã thay đổi.");
  }

  sheet.clear();
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#256f69").setFontColor("#ffffff");
  sheet.autoResizeColumns(1, HEADERS.length);
  setupPayments_(spreadsheet);

  return "Đã khởi tạo dữ liệu cho " + Object.keys(SETTINGS.rooms).length + " phòng máy và "
    + SETTINGS.courses.length + " nhóm tự chọn.";
}

/**
 * Tạo trang tính danh sách nộp tiền đề cương nếu chưa có.
 * Giáo viên tự nhập từng dòng sau khi đối chiếu giao dịch; trang web chỉ đọc.
 * Gọi riêng hàm này nếu Sheet đã có dữ liệu chỗ ngồi nên không chạy được setup.
 */
function setupPayments() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Hãy chạy hàm này từ Apps Script của Google Sheet.");
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", spreadsheet.getId());
  return setupPayments_(spreadsheet);
}

function setupPayments_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(SETTINGS.paymentSheetName);
  if (sheet) return "Trang tính " + SETTINGS.paymentSheetName + " đã có sẵn, không thay đổi gì.";

  sheet = spreadsheet.insertSheet(SETTINGS.paymentSheetName);
  sheet.appendRow(PAYMENT_HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, PAYMENT_HEADERS.length).setFontWeight("bold").setBackground("#a95b28").setFontColor("#ffffff");
  sheet.autoResizeColumns(1, PAYMENT_HEADERS.length);
  return "Đã tạo trang tính " + SETTINGS.paymentSheetName + ".";
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (params.action === "payments") return jsonResponse_(buildPaymentList_());
    var room = SETTINGS.rooms[cleanText_(params.room, 10)];
    var course = cleanText_(params.course, 30);
    if (!room) return jsonResponse_({ ok: false, message: "Không tìm thấy phòng máy." });
    if (SETTINGS.courses.indexOf(course) === -1) return jsonResponse_({ ok: false, message: "Nhóm tự chọn không hợp lệ." });
    return jsonResponse_(buildPublicState_(cleanText_(params.room, 10), room, course));
  } catch (error) {
    return jsonResponse_({ ok: false, message: "Không thể đọc dữ liệu đăng ký." });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (payload.action === "addPayment") return jsonResponse_(addPayment_(payload));
    if (payload.action !== "register") return jsonResponse_({ ok: false, message: "Yêu cầu không hợp lệ." });
    return jsonResponse_(register_(payload));
  } catch (error) {
    return jsonResponse_({ ok: false, message: "Hệ thống đang bận. Vui lòng tải lại sơ đồ và thử lại." });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function register_(payload) {
  var roomId = cleanText_(payload.roomId, 10);
  var room = SETTINGS.rooms[roomId];
  var course = cleanText_(payload.course, 30);
  var studentName = cleanText_(payload.studentName, 80);
  var studentClass = cleanText_(payload.studentClass, 20);
  var seatId = Number(payload.seatId);

  if (!room) return { ok: false, message: "Không tìm thấy phòng máy." };
  if (SETTINGS.courses.indexOf(course) === -1) return { ok: false, message: "Nhóm tự chọn không hợp lệ." };
  if (studentName.length < 2) return { ok: false, message: "Vui lòng nhập đầy đủ họ tên." };
  if (studentClass.length < 1) return { ok: false, message: "Vui lòng nhập lớp học." };

  var totalSeats = room.rowCount * room.seatsPerRow;
  if (!Number.isInteger(seatId) || seatId < 1 || seatId > totalSeats) {
    return { ok: false, message: "Số máy không hợp lệ." };
  }

  var sheet = getSheet_();
  var records = readRecords_(sheet);

  var duplicateStudent = records.some(function (record) {
    return record.course === course
      && record.studentClass.toLowerCase() === studentClass.toLowerCase()
      && record.studentName.toLowerCase() === studentName.toLowerCase();
  });
  if (duplicateStudent) return { ok: false, message: "Bạn đã đăng ký chỗ ngồi cho nhóm này rồi." };

  var scoped = records.filter(function (record) {
    return record.roomId === roomId && record.course === course && record.seatId <= totalSeats;
  });
  var seatRecords = scoped.filter(function (record) { return record.seatId === seatId; });

  var position = ((seatId - 1) % room.seatsPerRow) + 1;
  var row = Math.floor((seatId - 1) / room.seatsPerRow) + 1;
  var slot = 1;

  if (seatRecords.length > 0) {
    if (!room.sharedSeats) {
      return { ok: false, code: "SEAT_TAKEN", message: "Máy này vừa có bạn đăng ký trước. Hãy chọn một máy khác." };
    }
    // Máy hỏng nên hai máy đầu mỗi dãy cho hai bạn ngồi chung ngay từ đầu,
    // không phải chờ tới khi cả phòng kín chỗ.
    if (SETTINGS.pairPositions.indexOf(position) === -1) {
      return {
        ok: false,
        code: "SEAT_TAKEN",
        message: "Máy này vừa có bạn đăng ký trước. Hãy chọn một máy khác."
      };
    }
    if (seatRecords.length >= 2) return { ok: false, code: "SEAT_FULL", message: "Máy này đã đủ hai bạn. Hãy chọn chỗ khác." };
    slot = 2;
  }

  sheet.appendRow([
    new Date(),
    roomId,
    room.name,
    course,
    safeCellText_(studentClass),
    safeCellText_(studentName),
    seatId,
    row,
    position,
    slot
  ]);

  return { ok: true, seatId: seatId, row: row, position: position, slot: slot };
}

function buildPublicState_(roomId, room, course) {
  var totalSeats = room.rowCount * room.seatsPerRow;
  var records = readRecords_(getSheet_()).filter(function (record) {
    return record.roomId === roomId && record.course === course
      && record.seatId >= 1 && record.seatId <= totalSeats;
  });

  var counts = {};
  var occupants = {};
  var primarySeatIds = {};
  records.forEach(function (record) {
    counts[record.seatId] = (counts[record.seatId] || 0) + 1;
    if (!occupants[record.seatId]) occupants[record.seatId] = [];
    occupants[record.seatId].push(record.studentName);
    if (record.slot === 1) primarySeatIds[record.seatId] = true;
  });
  var primaryOccupied = Object.keys(primarySeatIds).length;

  var seats = [];
  for (var seatId = 1; seatId <= totalSeats; seatId += 1) {
    seats.push({
      seatId: seatId,
      occupantCount: counts[seatId] || 0,
      occupants: occupants[seatId] || []
    });
  }

  return {
    ok: true,
    roomId: roomId,
    roomName: room.name,
    course: course,
    seats: seats,
    primaryOccupied: primaryOccupied,
    totalRegistrations: records.length,
    pairEnabled: Boolean(room.sharedSeats),
    updatedAt: new Date().toISOString()
  };
}

function addPayment_(payload) {
  var password = teacherPassword_();
  if (!password) {
    return { ok: false, message: "Chưa đặt mật khẩu giáo viên trong Thuộc tính tập lệnh (TEACHER_PASSWORD)." };
  }
  if (String(payload.password || "") !== password) {
    return { ok: false, message: "Mật khẩu không đúng." };
  }

  var studentName = cleanText_(payload.studentName, 80);
  var studentClass = cleanText_(payload.studentClass, 20);
  var course = cleanText_(payload.course, 30);
  var method = cleanText_(payload.method, 20) || "Tiền mặt";
  var amount = Number(payload.amount);
  var note = cleanText_(payload.note, 120);

  if (studentName.length < 2) return { ok: false, message: "Vui lòng nhập đầy đủ họ tên học sinh." };
  if (studentClass.length < 1) return { ok: false, message: "Vui lòng nhập lớp của học sinh." };
  if (SETTINGS.courses.indexOf(course) === -1) return { ok: false, message: "Nhóm tự chọn không hợp lệ." };
  if (!isFinite(amount) || amount <= 0) amount = 25000;

  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) return { ok: false, message: "Chưa chạy hàm setup()." };
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(SETTINGS.paymentSheetName);
  if (!sheet) {
    setupPayments_(spreadsheet);
    sheet = spreadsheet.getSheetByName(SETTINGS.paymentSheetName);
  }

  var existing = buildPaymentList_().payments || [];
  var duplicate = existing.some(function (item) {
    return item.studentName.toLowerCase() === studentName.toLowerCase()
      && item.studentClass.toLowerCase() === studentClass.toLowerCase()
      && item.course === course;
  });
  if (duplicate) return { ok: false, message: "Học sinh này đã có trong danh sách đã nộp của nhóm " + course + "." };

  sheet.appendRow([
    new Date(),
    safeCellText_(studentName),
    safeCellText_(studentClass),
    course,
    method,
    amount,
    safeCellText_(note)
  ]);

  return {
    ok: true,
    payment: { studentName: studentName, studentClass: studentClass, course: course, method: method }
  };
}

function buildPaymentList_() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) return { ok: false, message: "Chưa chạy hàm setup()." };

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SETTINGS.paymentSheetName);
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: true, payments: [], total: 0, updatedAt: new Date().toISOString() };
  }

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, PAYMENT_HEADERS.length).getValues();
  var payments = values.map(function (row) {
    return {
      studentName: String(row[1] || "").replace(/^'/, "").trim(),
      studentClass: String(row[2] || "").replace(/^'/, "").trim(),
      course: String(row[3] || "").trim(),
      method: String(row[4] || "").trim()
    };
  }).filter(function (item) { return item.studentName.length > 0; });

  return { ok: true, payments: payments, total: payments.length, updatedAt: new Date().toISOString() };
}

function getSheet_() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Chưa chạy hàm setup().");
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(SETTINGS.sheetName);
  if (!sheet) throw new Error("Không tìm thấy trang tính dữ liệu.");
  return sheet;
}

function readRecords_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues().map(function (row) {
    return {
      roomId: String(row[1] || "").trim(),
      course: String(row[3] || "").trim(),
      studentClass: String(row[4] || "").replace(/^'/, "").trim(),
      studentName: String(row[5] || "").replace(/^'/, "").trim(),
      seatId: Number(row[6]),
      slot: Number(row[9])
    };
  }).filter(function (record) { return record.seatId >= 1; });
}

function cleanText_(value, maxLength) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function safeCellText_(value) {
  var text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
