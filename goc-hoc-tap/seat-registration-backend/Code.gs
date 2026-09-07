var SETTINGS = {
  sheetName: "DangKyChoNgoi",
  roomName: "Phòng máy 3",
  className: "TC_TIN_15",
  totalSeats: 50,
  seatsPerRow: 10,
  pairPositions: [1, 2]
};

function setup() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Hãy tạo mã này từ menu Tiện ích mở rộng > Apps Script của Google Sheet.");
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", spreadsheet.getId());
  var sheet = spreadsheet.getSheetByName(SETTINGS.sheetName) || spreadsheet.insertSheet(SETTINGS.sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Thời gian", "Lớp", "STT", "Họ và tên", "Máy", "Dãy", "Vị trí trong dãy", "Suất"]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#256f69").setFontColor("#ffffff");
    sheet.autoResizeColumns(1, 8);
  }
  return "Đã khởi tạo dữ liệu cho " + SETTINGS.className;
}

function doGet(e) {
  try {
    return jsonResponse_(buildPublicState_());
  } catch (error) {
    return jsonResponse_({ ok: false, message: "Không thể đọc dữ liệu đăng ký." });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (payload.action !== "register") return jsonResponse_({ ok: false, message: "Yêu cầu không hợp lệ." });
    return jsonResponse_(register_(payload));
  } catch (error) {
    return jsonResponse_({ ok: false, message: "Hệ thống đang bận. Vui lòng tải lại sơ đồ và thử lại." });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function register_(payload) {
  var className = cleanText_(payload.className, 30);
  var roomName = cleanText_(payload.roomName, 50);
  var studentNumber = cleanText_(payload.studentNumber, 3);
  var studentName = cleanText_(payload.studentName, 80);
  var seatId = Number(payload.seatId);

  if (className !== SETTINGS.className || roomName !== SETTINGS.roomName) {
    return { ok: false, message: "Thông tin lớp hoặc phòng máy không đúng." };
  }
  if (!/^\d{1,2}$/.test(studentNumber) || Number(studentNumber) < 1 || Number(studentNumber) > 99) {
    return { ok: false, message: "Số thứ tự phải từ 1 đến 99." };
  }
  if (studentName.length < 2) return { ok: false, message: "Vui lòng nhập đầy đủ họ tên." };
  if (!Number.isInteger(seatId) || seatId < 1 || seatId > SETTINGS.totalSeats) {
    return { ok: false, message: "Số máy không hợp lệ." };
  }

  var sheet = getSheet_();
  var records = readRecords_(sheet);
  var duplicateStudent = records.some(function (record) {
    return record.className === className && record.studentNumber === studentNumber;
  });
  if (duplicateStudent) return { ok: false, message: "Số thứ tự này đã đăng ký chỗ ngồi." };

  var seatRecords = records.filter(function (record) {
    return record.className === className && record.seatId === seatId;
  });
  var primarySeatIds = {};
  records.forEach(function (record) {
    if (record.className === className && record.slot === 1) primarySeatIds[record.seatId] = true;
  });
  var primaryOccupied = Object.keys(primarySeatIds).length;
  var position = ((seatId - 1) % SETTINGS.seatsPerRow) + 1;
  var row = Math.floor((seatId - 1) / SETTINGS.seatsPerRow) + 1;
  var slot = 1;

  if (seatRecords.length > 0) {
    var pairAllowed = primaryOccupied >= SETTINGS.totalSeats && SETTINGS.pairPositions.indexOf(position) !== -1;
    if (!pairAllowed) {
      return {
        ok: false,
        code: primaryOccupied >= SETTINGS.totalSeats ? "PAIR_NOT_ALLOWED" : "SEAT_TAKEN",
        message: primaryOccupied >= SETTINGS.totalSeats
          ? "Máy này không thuộc bàn đầu được phép ghép. Hãy chọn chỗ khác."
          : "Máy này vừa có bạn đăng ký trước. Hãy chọn một máy khác."
      };
    }
    if (seatRecords.length >= 2) return { ok: false, code: "SEAT_FULL", message: "Máy này đã đủ hai bạn. Hãy chọn chỗ khác." };
    slot = 2;
  }

  sheet.appendRow([
    new Date(),
    className,
    safeCellText_(studentNumber),
    safeCellText_(studentName),
    seatId,
    row,
    position,
    slot
  ]);

  return { ok: true, seatId: seatId, row: row, position: position, slot: slot };
}

function buildPublicState_() {
  var records = readRecords_(getSheet_()).filter(function (record) { return record.className === SETTINGS.className; });
  var counts = {};
  var primarySeatIds = {};
  records.forEach(function (record) {
    counts[record.seatId] = (counts[record.seatId] || 0) + 1;
    if (record.slot === 1) primarySeatIds[record.seatId] = true;
  });
  var primaryOccupied = Object.keys(primarySeatIds).length;
  var seats = [];
  for (var seatId = 1; seatId <= SETTINGS.totalSeats; seatId += 1) {
    seats.push({ seatId: seatId, occupantCount: counts[seatId] || 0 });
  }
  return {
    ok: true,
    roomName: SETTINGS.roomName,
    className: SETTINGS.className,
    seats: seats,
    primaryOccupied: primaryOccupied,
    totalRegistrations: records.length,
    pairEnabled: primaryOccupied >= SETTINGS.totalSeats,
    updatedAt: new Date().toISOString()
  };
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
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues().map(function (row) {
    return {
      className: String(row[1] || "").trim(),
      studentNumber: String(row[2] || "").replace(/^'/, "").trim(),
      seatId: Number(row[4]),
      slot: Number(row[7])
    };
  }).filter(function (record) { return record.seatId >= 1 && record.seatId <= SETTINGS.totalSeats; });
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
