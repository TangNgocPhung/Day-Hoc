/**
 * Backend đăng ký chỗ ngồi phòng máy - Trường THPT Nguyễn Khuyến.
 * Cuối file là phần sổ điểm cộng · điểm trừ, dùng chung bảng tính và bản triển khai.
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
    PM2: { name: "Phòng máy 2", rowCount: 5, seatsPerRow: 10, sharedSeats: true },
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
  if (sheet) {
    if (sheet.getLastRow() > 1) {
      return "Trang tính " + SETTINGS.paymentSheetName + " đã có dữ liệu, giữ nguyên.";
    }
    // Chưa có dòng nào nên ghi lại hàng tiêu đề cho khớp cấu trúc cột mới.
    sheet.clear();
  } else {
    sheet = spreadsheet.insertSheet(SETTINGS.paymentSheetName);
  }

  sheet.appendRow(PAYMENT_HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, PAYMENT_HEADERS.length).setFontWeight("bold").setBackground("#a95b28").setFontColor("#ffffff");
  sheet.autoResizeColumns(1, PAYMENT_HEADERS.length);
  return "Đã tạo/cập nhật trang tính " + SETTINGS.paymentSheetName + " với " + PAYMENT_HEADERS.length + " cột.";
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
    if (DIEM_CONG_ACTIONS.indexOf(payload.action) !== -1) return jsonResponse_(diemCongPost_(payload));
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

/* =====================================================================
 * SỔ ĐIỂM CỘNG · ĐIỂM TRỪ (trang diem-cong.html)
 *
 * Dùng chung bảng tính và bản triển khai với phần đăng ký chỗ ngồi ở trên,
 * ghi vào hai trang tính DiemCongTru và LichSu. doPost ở trên chuyển các
 * yêu cầu "login", "pull", "apply" xuống đây.
 *
 * Mọi yêu cầu (trừ "login") phải kèm mã đồng bộ. Địa chỉ /exec là công khai
 * nên thiếu mã này thì không ai đọc hay sửa được điểm của học sinh. Trang không
 * bắt cô nhập mã: khi cô mở sổ bằng mật khẩu, trang gửi mật khẩu về đây và
 * nhận lại mã đồng bộ.
 * ===================================================================== */

var DIEM_CONG_ACTIONS = ["login", "pull", "apply"];

function diemCongPost_(payload) {
  try {
    if (payload.action === "login") return dcLogin_(payload);
    var key = PropertiesService.getScriptProperties().getProperty("SYNC_KEY");
    if (!key || String(payload.key || "") !== key) {
      return { ok: false, code: "bad-key", message: "Mã đồng bộ không đúng." };
    }
    if (payload.action === "pull") return dcPull_();
    return dcApply_(payload);
  } catch (error) {
    return { ok: false, message: "Google Sheet đang bận hoặc gặp lỗi: " + error.message };
  }
}

var DC_SETTINGS = {
  // Bảng tính đích: https://docs.google.com/spreadsheets/d/1akRVIQ0bPx2hOC40epQJE-ycTMb7sCzrGHkCEIMQUYw/
  spreadsheetId: "1akRVIQ0bPx2hOC40epQJE-ycTMb7sCzrGHkCEIMQUYw",
  entrySheetName: "DiemCongTru",
  historySheetName: "LichSu",
  historyLimit: 1000,
  // Mã băm SHA-256 của mật khẩu mở sổ, trùng DEFAULT_PASS_HASH trong diem-cong.html.
  passHash: "617d0f7a1a2697a7745a81a9169ebd058f6a9fd5a478493ae5909d2c8d5bdb0e",
  // Sai mật khẩu quá số lần này trong 15 phút thì tạm khóa, chống dò mật khẩu.
  maxLoginFailures: 10,
  // Một ô Google Sheet chứa tối đa 50 000 ký tự nên dữ liệu hoàn tác dài được chia ra nhiều ô.
  chunkSize: 45000
};

var DC_ENTRY_HEADERS = ["Mã ghi nhận", "Ngày", "Họ và tên", "Lớp", "Môn học", "Cột kiểm tra", "Loại", "Điểm", "Lý do", "Ghi lúc"];
var DC_HISTORY_HEADERS = ["Mã", "Thời gian", "Thao tác", "Nội dung", "Số lượt", "Đã hoàn tác", "Dữ liệu (để hoàn tác)"];
var DC_HISTORY_DATA_COLUMN = 7;
var DC_CHUNK_MARK = "~";

var DC_ACTION_LABELS = {
  add: "Ghi nhận",
  "delete": "Xóa",
  clear: "Xóa toàn bộ",
  "import": "Khôi phục từ file",
  restore: "Hoàn tác",
  upload: "Tải lên từ máy"
};

function setupDiemCong() {
  var spreadsheet = DC_SETTINGS.spreadsheetId
    ? SpreadsheetApp.openById(DC_SETTINGS.spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Chưa xác định được Google Sheet dùng để lưu sổ điểm.");
  var props = PropertiesService.getScriptProperties();
  props.setProperty("SPREADSHEET_ID", spreadsheet.getId());

  dcPrepareSheet_(spreadsheet, DC_SETTINGS.entrySheetName, DC_ENTRY_HEADERS, "#256f69");
  dcPrepareSheet_(spreadsheet, DC_SETTINGS.historySheetName, DC_HISTORY_HEADERS, "#34618f");

  var entrySheet = spreadsheet.getSheetByName(DC_SETTINGS.entrySheetName);
  // Cột chữ để dạng văn bản thuần, tránh Sheet tự đổi "1/2" thành ngày hay "10" thành số.
  entrySheet.getRange("A:A").setNumberFormat("@");
  entrySheet.getRange("C:G").setNumberFormat("@");
  entrySheet.getRange("I:I").setNumberFormat("@");
  entrySheet.getRange("B:B").setNumberFormat("dd/mm/yyyy");
  entrySheet.getRange("H:H").setNumberFormat("+0.##;-0.##;0");
  entrySheet.getRange("J:J").setNumberFormat("dd/mm/yyyy hh:mm");
  var historySheet = spreadsheet.getSheetByName(DC_SETTINGS.historySheetName);
  historySheet.getRange("A:A").setNumberFormat("@");
  historySheet.getRange("C:D").setNumberFormat("@");
  historySheet.getRange("B:B").setNumberFormat("dd/mm/yyyy hh:mm");

  if (!props.getProperty("SYNC_KEY")) props.setProperty("SYNC_KEY", newKey_());
  return showSyncKey();
}

/** Chạy hàm này bất cứ lúc nào để xem lại mã đồng bộ (trong Nhật ký thực thi). */
function showSyncKey() {
  var key = PropertiesService.getScriptProperties().getProperty("SYNC_KEY");
  var message = key
    ? "Mã đồng bộ của sổ điểm: " + key + "  (trang tự lấy mã này khi cô mở sổ bằng mật khẩu, không cần nhập)"
    : "Chưa có mã đồng bộ. Hãy chạy hàm setupDiemCong trước.";
  console.log(message);
  return message;
}

/** Tạo mã mới khi nghi mã cũ bị lộ; các máy đang dùng mã cũ sẽ phải nhập lại. */
function resetSyncKey() {
  PropertiesService.getScriptProperties().setProperty("SYNC_KEY", newKey_());
  return showSyncKey();
}


/* ---------- Mở sổ bằng mật khẩu ---------- */

function dcLogin_(payload) {
  var cache = CacheService.getScriptCache();
  var failures = Number(cache.get("diemCongLoginFailures")) || 0;
  if (failures >= DC_SETTINGS.maxLoginFailures) {
    return { ok: false, code: "locked", message: "Nhập sai mật khẩu quá nhiều lần. Cô thử lại sau 15 phút." };
  }

  if (sha256Hex_(String(payload.passcode || "")) !== DC_SETTINGS.passHash) {
    cache.put("diemCongLoginFailures", String(failures + 1), 15 * 60);
    return { ok: false, code: "bad-pass", message: "Mật khẩu không đúng." };
  }

  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty("SYNC_KEY");
  if (!key) {
    key = newKey_();
    props.setProperty("SYNC_KEY", key);
  }
  return { ok: true, key: key };
}

function sha256Hex_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (byte) { return ("0" + ((byte + 256) % 256).toString(16)).slice(-2); })
    .join("");
}

/* ---------- Đọc toàn bộ dữ liệu ---------- */

function dcPull_() {
  var spreadsheet = dcSpreadsheet_();
  var entrySheet = spreadsheet.getSheetByName(DC_SETTINGS.entrySheetName);
  var historySheet = spreadsheet.getSheetByName(DC_SETTINGS.historySheetName);
  var tz = Session.getScriptTimeZone();

  var entries = dataRows_(entrySheet).filter(function (row) { return row[0]; }).map(function (row) {
    var signed = Number(row[7]) || 0;
    return {
      id: String(row[0]),
      date: row[1] instanceof Date ? Utilities.formatDate(row[1], tz, "yyyy-MM-dd") : String(row[1]),
      name: String(row[2]),
      className: String(row[3]),
      subject: String(row[4]),
      column: String(row[5]),
      type: row[6] === "Điểm trừ" || signed < 0 ? "tru" : "cong",
      points: Math.abs(signed),
      reason: String(row[8] || ""),
      createdAt: row[9] instanceof Date ? row[9].getTime() : Number(row[9]) || 0
    };
  });

  var history = dataRows_(historySheet).filter(function (row) { return row[0]; }).map(function (row) {
    var json = row.slice(DC_HISTORY_DATA_COLUMN - 1).map(function (cell) {
      var text = String(cell);
      return text.charAt(0) === DC_CHUNK_MARK ? text.slice(1) : text;
    }).join("");
    var list = [];
    try { list = json ? JSON.parse(json) : []; } catch (error) { list = []; }
    return {
      id: String(row[0]),
      at: row[1] instanceof Date ? row[1].getTime() : Number(row[1]) || 0,
      action: actionFromLabel_(row[2]),
      undone: row[5] === "Có",
      entries: list
    };
  });
  history.sort(function (a, b) { return b.at - a.at; });

  return { ok: true, entries: entries, history: history.slice(0, DC_SETTINGS.historyLimit) };
}

/* ---------- Ghi thay đổi ---------- */

function dcApply_(payload) {
  var spreadsheet = dcSpreadsheet_();
  var entrySheet = spreadsheet.getSheetByName(DC_SETTINGS.entrySheetName);
  var historySheet = spreadsheet.getSheetByName(DC_SETTINGS.historySheetName);

  removeEntries_(entrySheet, toArray_(payload.remove).map(String));
  upsertEntries_(entrySheet, toArray_(payload.upsert));
  appendHistory_(historySheet, toArray_(payload.history));
  markUndone_(historySheet, toArray_(payload.markUndone).map(String));
  return { ok: true };
}

function removeEntries_(sheet, ids) {
  if (!ids.length) return;
  var wanted = {};
  ids.forEach(function (id) { wanted[id] = true; });
  var column = idColumn_(sheet);
  var rows = [];
  column.forEach(function (id, index) { if (wanted[id]) rows.push(index + 2); });
  if (!rows.length) return;

  if (rows.length === column.length) {
    sheet.deleteRows(2, column.length);
    return;
  }
  rows.sort(function (a, b) { return b - a; }).forEach(function (row) { sheet.deleteRow(row); });
}

function upsertEntries_(sheet, entries) {
  if (!entries.length) return;
  var column = idColumn_(sheet);
  var rowById = {};
  column.forEach(function (id, index) { rowById[id] = index + 2; });

  var appended = [];
  entries.forEach(function (entry) {
    if (!entry || !entry.id) return;
    var values = entryRow_(entry);
    var row = rowById[String(entry.id)];
    if (row) sheet.getRange(row, 1, 1, values.length).setValues([values]);
    else appended.push(values);
  });
  if (appended.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appended.length, DC_ENTRY_HEADERS.length).setValues(appended);
  }
}

function entryRow_(entry) {
  var points = Math.abs(Number(entry.points)) || 0;
  var minus = entry.type === "tru";
  return [
    String(entry.id),
    dateFromIso_(entry.date),
    safeCellText_(cleanText_(entry.name, 80)),
    safeCellText_(cleanText_(entry.className, 30)),
    safeCellText_(cleanText_(entry.subject, 60)),
    safeCellText_(cleanText_(entry.column, 40)),
    minus ? "Điểm trừ" : "Điểm cộng",
    minus ? -points : points,
    safeCellText_(cleanText_(entry.reason, 300)),
    entry.createdAt ? new Date(Number(entry.createdAt)) : new Date()
  ];
}

function appendHistory_(sheet, items) {
  items.forEach(function (item) {
    if (!item || !item.id) return;
    if (idColumn_(sheet).indexOf(String(item.id)) !== -1) return;
    var list = toArray_(item.entries);
    var json = JSON.stringify(list);
    var chunks = [];
    // Mỗi mảnh bắt đầu bằng "~" để Sheet không hiểu nhầm mảnh nào đó (vd. bắt đầu bằng "=") là công thức.
    for (var start = 0; start < json.length; start += DC_SETTINGS.chunkSize) {
      chunks.push(DC_CHUNK_MARK + json.slice(start, start + DC_SETTINGS.chunkSize));
    }
    var values = [
      String(item.id),
      new Date(Number(item.at) || Date.now()),
      DC_ACTION_LABELS[item.action] || cleanText_(item.action, 30),
      safeCellText_(cleanText_(item.summary, 500)),
      list.length,
      item.undone ? "Có" : ""
    ].concat(chunks);
    if (values.length > sheet.getMaxColumns()) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), values.length - sheet.getMaxColumns());
    }
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, values.length).setValues([values]);
  });
}

function markUndone_(sheet, ids) {
  if (!ids.length) return;
  var column = idColumn_(sheet);
  ids.forEach(function (id) {
    var index = column.indexOf(id);
    if (index !== -1) sheet.getRange(index + 2, 6).setValue("Có");
  });
}

/* ---------- Tiện ích ---------- */

function dcSpreadsheet_() {
  // Ưu tiên ID cố định để không bao giờ ghi nhầm vào Sheet của dự án khác.
  var id = DC_SETTINGS.spreadsheetId || PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Chưa chạy hàm setupDiemCong.");
  return SpreadsheetApp.openById(id);
}

function dcPrepareSheet_(spreadsheet, name, headers, color) {
  var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  else sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground(color).setFontColor("#ffffff");
  sheet.autoResizeColumns(1, headers.length);
}

function dataRows_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
}

function idColumn_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(function (row) { return String(row[0]); });
}

function dateFromIso_(iso) {
  var parts = String(iso || "").split("-");
  if (parts.length !== 3) return String(iso || "");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function actionFromLabel_(label) {
  for (var key in DC_ACTION_LABELS) {
    if (DC_ACTION_LABELS[key] === label) return key;
  }
  return String(label || "");
}

function toArray_(value) {
  return Array.isArray(value) ? value : [];
}


function newKey_() {
  return Utilities.getUuid().replace(/-/g, "").slice(0, 16).toUpperCase();
}

