/**
 * Backend sổ điểm cộng · điểm trừ - Góc Học Tập.
 *
 * Trang diem-cong.html gửi mọi thay đổi về đây để lưu vào Google Sheet, nhờ vậy
 * dữ liệu không mất khi đổi máy hay xóa dữ liệu trình duyệt, và cô tải về dạng
 * Excel bằng Tệp > Tải xuống > Microsoft Excel.
 *
 * Mọi yêu cầu phải kèm mã đồng bộ (tạo khi chạy setup). Địa chỉ /exec là công khai
 * nên thiếu mã này thì không ai đọc hay sửa được điểm của học sinh. Trang không bắt
 * cô nhập mã: khi cô mở sổ bằng mật khẩu, trang gửi mật khẩu về đây (yêu cầu "login")
 * và nhận lại mã đồng bộ.
 */
var SETTINGS = {
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

var ENTRY_HEADERS = ["Mã ghi nhận", "Ngày", "Họ và tên", "Lớp", "Môn học", "Cột kiểm tra", "Loại", "Điểm", "Lý do", "Ghi lúc"];
var HISTORY_HEADERS = ["Mã", "Thời gian", "Thao tác", "Nội dung", "Số lượt", "Đã hoàn tác", "Dữ liệu (để hoàn tác)"];
var HISTORY_DATA_COLUMN = 7;
var CHUNK_MARK = "~";

var ACTION_LABELS = {
  add: "Ghi nhận",
  "delete": "Xóa",
  clear: "Xóa toàn bộ",
  "import": "Khôi phục từ file",
  restore: "Hoàn tác",
  upload: "Tải lên từ máy"
};

function setup() {
  var spreadsheet = SETTINGS.spreadsheetId
    ? SpreadsheetApp.openById(SETTINGS.spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Chưa xác định được Google Sheet dùng để lưu sổ điểm.");
  var props = PropertiesService.getScriptProperties();
  props.setProperty("SPREADSHEET_ID", spreadsheet.getId());

  prepareSheet_(spreadsheet, SETTINGS.entrySheetName, ENTRY_HEADERS, "#256f69");
  prepareSheet_(spreadsheet, SETTINGS.historySheetName, HISTORY_HEADERS, "#34618f");

  var entrySheet = spreadsheet.getSheetByName(SETTINGS.entrySheetName);
  // Cột chữ để dạng văn bản thuần, tránh Sheet tự đổi "1/2" thành ngày hay "10" thành số.
  entrySheet.getRange("A:A").setNumberFormat("@");
  entrySheet.getRange("C:G").setNumberFormat("@");
  entrySheet.getRange("I:I").setNumberFormat("@");
  entrySheet.getRange("B:B").setNumberFormat("dd/mm/yyyy");
  entrySheet.getRange("H:H").setNumberFormat("+0.##;-0.##;0");
  entrySheet.getRange("J:J").setNumberFormat("dd/mm/yyyy hh:mm");
  var historySheet = spreadsheet.getSheetByName(SETTINGS.historySheetName);
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
    ? "Mã đồng bộ của sổ điểm: " + key + "  (nhập mã này vào trang Sổ điểm cộng · điểm trừ)"
    : "Chưa có mã đồng bộ. Hãy chạy hàm setup trước.";
  console.log(message);
  return message;
}

/** Tạo mã mới khi nghi mã cũ bị lộ; các máy đang dùng mã cũ sẽ phải nhập lại. */
function resetSyncKey() {
  PropertiesService.getScriptProperties().setProperty("SYNC_KEY", newKey_());
  return showSyncKey();
}

function doGet() {
  return jsonResponse_({ ok: true, message: "Backend sổ điểm cộng đang chạy." });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (payload.action === "login") return jsonResponse_(login_(payload));
    var key = PropertiesService.getScriptProperties().getProperty("SYNC_KEY");
    if (!key || String(payload.key || "") !== key) {
      return jsonResponse_({ ok: false, code: "bad-key", message: "Mã đồng bộ không đúng." });
    }

    lock.waitLock(20000);
    if (payload.action === "pull") return jsonResponse_(pull_());
    if (payload.action === "apply") return jsonResponse_(apply_(payload));
    return jsonResponse_({ ok: false, message: "Yêu cầu không hợp lệ." });
  } catch (error) {
    return jsonResponse_({ ok: false, message: "Google Sheet đang bận hoặc gặp lỗi: " + error.message });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

/* ---------- Mở sổ bằng mật khẩu ---------- */

function login_(payload) {
  var cache = CacheService.getScriptCache();
  var failures = Number(cache.get("loginFailures")) || 0;
  if (failures >= SETTINGS.maxLoginFailures) {
    return { ok: false, code: "locked", message: "Nhập sai mật khẩu quá nhiều lần. Cô thử lại sau 15 phút." };
  }

  if (sha256Hex_(String(payload.passcode || "")) !== SETTINGS.passHash) {
    cache.put("loginFailures", String(failures + 1), 15 * 60);
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

function pull_() {
  var spreadsheet = getSpreadsheet_();
  var entrySheet = spreadsheet.getSheetByName(SETTINGS.entrySheetName);
  var historySheet = spreadsheet.getSheetByName(SETTINGS.historySheetName);
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
    var json = row.slice(HISTORY_DATA_COLUMN - 1).map(function (cell) {
      var text = String(cell);
      return text.charAt(0) === CHUNK_MARK ? text.slice(1) : text;
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

  return { ok: true, entries: entries, history: history.slice(0, SETTINGS.historyLimit) };
}

/* ---------- Ghi thay đổi ---------- */

function apply_(payload) {
  var spreadsheet = getSpreadsheet_();
  var entrySheet = spreadsheet.getSheetByName(SETTINGS.entrySheetName);
  var historySheet = spreadsheet.getSheetByName(SETTINGS.historySheetName);

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
    sheet.getRange(sheet.getLastRow() + 1, 1, appended.length, ENTRY_HEADERS.length).setValues(appended);
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
    for (var start = 0; start < json.length; start += SETTINGS.chunkSize) {
      chunks.push(CHUNK_MARK + json.slice(start, start + SETTINGS.chunkSize));
    }
    var values = [
      String(item.id),
      new Date(Number(item.at) || Date.now()),
      ACTION_LABELS[item.action] || cleanText_(item.action, 30),
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

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || SETTINGS.spreadsheetId;
  if (!id) throw new Error("Chưa chạy hàm setup.");
  return SpreadsheetApp.openById(id);
}

function prepareSheet_(spreadsheet, name, headers, color) {
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
  for (var key in ACTION_LABELS) {
    if (ACTION_LABELS[key] === label) return key;
  }
  return String(label || "");
}

function toArray_(value) {
  return Array.isArray(value) ? value : [];
}

function cleanText_(value, maxLength) {
  return String(value === undefined || value === null ? "" : value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function safeCellText_(value) {
  var text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function newKey_() {
  return Utilities.getUuid().replace(/-/g, "").slice(0, 16).toUpperCase();
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
