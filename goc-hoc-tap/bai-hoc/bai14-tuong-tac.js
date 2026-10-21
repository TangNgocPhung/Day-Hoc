/* Nội dung bổ sung độc lập với bộ máy SQL: vẫn học và điền khuyết khi mất mạng. */
(function () {
  "use strict";
  const TOPICS = {
    select: { group:"DML · Truy xuất", title:"SELECT — Lấy dữ liệu, chọn cột", purpose:"Truy xuất dữ liệu. Danh sách sau SELECT xác định các cột hoặc biểu thức cần hiển thị.", syntax:"SELECT cot_1, cot_2\nFROM ten_bang;", example:"SELECT Mid, TenBN\nFROM bannhac;", reading:"Lấy mã bản nhạc và tên bản nhạc từ bảng bannhac.", tip:"SELECT * lấy tất cả các cột. SELECT cũng có thể lấy kết quả biểu thức hoặc hàm như AVG(tb).", mistake:"Dễ nhầm: SELECT chọn cột; WHERE lọc dòng." },
    from: { group:"DML · Truy xuất", title:"FROM — Lấy dữ liệu từ đâu?", purpose:"Chỉ ra bảng hoặc nguồn dữ liệu dùng cho truy vấn.", syntax:"SELECT danh_sach_cot\nFROM ten_bang;", example:"SELECT *\nFROM nhacsi;", reading:"Lấy tất cả các cột và các dòng của bảng nhacsi.", tip:"Khi cần lấy dữ liệu từ nhiều bảng có liên quan, có thể nối các bảng sau FROM bằng JOIN.", mistake:"Tên bảng đứng sau FROM; tên cột cần lấy đứng sau SELECT." },
    where: { group:"DML · Truy xuất", title:"WHERE — Giữ lại những dòng nào?", purpose:"Lọc các dòng theo điều kiện. Chỉ giữ những dòng mà điều kiện có giá trị đúng.", syntax:"SELECT danh_sach_cot\nFROM ten_bang\nWHERE dieu_kien;", example:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid = 1;", reading:"Chỉ lấy mã và tên những bản nhạc có Aid bằng 1: hai bản nhạc của Đỗ Nhuận trong dữ liệu mẫu.", tip:"Dùng =, <>, >, <, >=, <= và kết hợp bằng AND, OR, NOT. Chuỗi ký tự đặt trong dấu nháy đơn, ví dụ Mid = '0001'.", mistake:"WHERE lọc dòng, không chọn cột. UPDATE hoặc DELETE thiếu WHERE có thể tác động đến mọi dòng." },
    join: { group:"DML · Truy xuất", title:"INNER JOIN — Nối dữ liệu từ các bảng", purpose:"Ghép mỗi dòng của một bảng với những dòng của bảng khác thỏa điều kiện nối. INNER JOIN chỉ giữ các cặp khớp nhau.", syntax:"SELECT bang_1.cot_a, bang_2.cot_b\nFROM bang_1\nINNER JOIN bang_2\nON bang_1.khoa = bang_2.khoa;", example:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac\nINNER JOIN nhacsi\nON bannhac.Aid = nhacsi.Aid;", reading:"Ghép mỗi bản nhạc với nhạc sĩ có cùng Aid để hiển thị tên bản nhạc và tên nhạc sĩ.", tip:"JOIN viết một mình có nghĩa INNER JOIN trong ví dụ này. Tên cột nối không nhất thiết giống nhau; quan trọng là ý nghĩa dữ liệu và điều kiện ON.", mistake:"JOIN tạo kết quả ghép, không sửa các bảng nguồn. Số dòng có thể giảm hoặc tăng tùy số cặp khớp; không mặc định mỗi dòng chỉ ghép một lần." },
    on: { group:"DML · Truy xuất", title:"ON — Điều kiện ghép dòng", purpose:"Chỉ ra điều kiện để một dòng của bảng này ghép với một dòng của bảng kia trong JOIN.", syntax:"FROM bang_1\nINNER JOIN bang_2\nON bang_1.cot_lien_ket = bang_2.cot_lien_ket", example:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac INNER JOIN nhacsi\nON bannhac.Aid = nhacsi.Aid\nWHERE nhacsi.Aid = 1;", reading:"ON ghép bản nhạc với đúng nhạc sĩ theo Aid; WHERE sau đó chỉ giữ các dòng của nhạc sĩ Aid = 1.", tip:"Viết tên_bảng.tên_cột để phân biệt các cột trùng tên. Quan hệ khóa ngoài giúp xác định cách nối phù hợp; không bắt buộc khai báo khóa ngoài mới dùng được JOIN.", mistake:"Trong bài này, ON giải thích cách ghép; WHERE giải thích cách lọc kết quả. Với INNER JOIN, một số điều kiện có thể chuyển đổi tương đương giữa hai vị trí; với OUTER JOIN thì cần phân biệt." },
    order: { group:"DML · Truy xuất", title:"ORDER BY — Sắp xếp kết quả", purpose:"Sắp xếp các dòng kết quả theo một hoặc nhiều cột.", syntax:"SELECT danh_sach_cot\nFROM ten_bang\n[WHERE dieu_kien]\nORDER BY cot_sap_xep [ASC | DESC];", example:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid = 1\nORDER BY Mid DESC;", reading:"Lấy các bản nhạc có Aid = 1, mã bản nhạc lớn hơn hiển thị trước: 0005 rồi 0001.", tip:"ASC tăng dần và là mặc định; DESC giảm dần. Thứ tự chuỗi chữ phụ thuộc quy tắc đối chiếu của hệ QTCSDL.", mistake:"Không có ORDER BY thì không được bảo đảm thứ tự dòng. Sắp xếp kết quả không thay đổi dữ liệu gốc." },
    avg: { group:"DML · Hàm tổng hợp", title:"AVG — Tính giá trị trung bình", purpose:"Tính trung bình cộng các giá trị số khác NULL trong một cột hoặc biểu thức.", syntax:"SELECT AVG(cot_so)\nFROM ten_bang\n[WHERE dieu_kien];", example:"SELECT AVG(tb)\nFROM diemtoan_11A;", reading:"Tính điểm trung bình cộng của cột tb trong bảng diemtoan_11A.", tip:"Có thể dùng WHERE để chọn các dòng trước khi tính AVG. Khi không có giá trị số nào để tính, AVG trả về NULL.", mistake:"AVG là hàm đặt trong SELECT, không phải tên bảng hoặc mệnh đề thay cho SELECT." },
    insert: { group:"DML · Cập nhật", title:"INSERT INTO — Thêm dòng mới", purpose:"Thêm một hoặc nhiều dòng dữ liệu vào bảng đã có.", syntax:"INSERT INTO ten_bang (cot_1, cot_2)\nVALUES (gia_tri_1, gia_tri_2);", example:"INSERT INTO nhacsi (Aid, TenNS)\nVALUES (5, 'Phú Quang');", reading:"Thêm nhạc sĩ có mã 5 và tên Phú Quang vào bảng nhacsi.", tip:"Nên ghi rõ danh sách cột; số lượng và thứ tự giá trị phải khớp với danh sách đó.", mistake:"INSERT thêm dòng mới; UPDATE sửa dòng đang tồn tại. Không thêm mã khóa chính bị trùng." },
    update: { group:"DML · Cập nhật", title:"UPDATE … SET — Sửa dữ liệu", purpose:"Đổi giá trị một hoặc nhiều cột của các dòng được chọn.", syntax:"UPDATE ten_bang\nSET cot = gia_tri_moi\nWHERE dieu_kien;", example:"UPDATE nhacsi\nSET TenNS = 'Hoàng Hiệp'\nWHERE Aid = 6;", reading:"Đổi tên nhạc sĩ có Aid = 6 thành Hoàng Hiệp, nếu dòng này đã tồn tại.", tip:"SET nêu giá trị mới, WHERE chọn dòng cần sửa. Nếu không có dòng thỏa điều kiện thì không có dòng nào được cập nhật.", mistake:"Bỏ WHERE sẽ sửa mọi dòng trong bảng. Ví dụ này cần thêm nhạc sĩ Aid = 6 trước khi thực hành." },
    delete: { group:"DML · Cập nhật", title:"DELETE FROM — Xóa dòng dữ liệu", purpose:"Xóa các dòng thỏa điều kiện khỏi bảng.", syntax:"DELETE FROM ten_bang\nWHERE dieu_kien;", example:"DELETE FROM bannhac\nWHERE Mid = '0005';", reading:"Xóa dòng bản nhạc có mã 0005; cấu trúc bảng vẫn còn.", tip:"Có thể chạy SELECT với cùng WHERE trước để xem chính xác những dòng sẽ bị xóa.", mistake:"DELETE không có WHERE xóa mọi dòng. DELETE xóa dòng; DROP TABLE xóa bảng." },
    database: { group:"DDL · Định nghĩa", title:"CREATE DATABASE — Tạo cơ sở dữ liệu", purpose:"Tạo một cơ sở dữ liệu mới để chứa các bảng và những đối tượng liên quan.", syntax:"CREATE DATABASE ten_csdl;\nUSE ten_csdl;", example:"CREATE DATABASE music;\nUSE music;", reading:"Tạo CSDL music, rồi chọn music làm CSDL hiện hành theo cách viết MySQL.", tip:"CREATE DATABASE tạo CSDL; USE chọn CSDL để làm việc. CREATE DATABASE không tự tạo bảng.", mistake:"USE là cách viết theo MySQL của bài; một số hệ QTCSDL chọn cơ sở dữ liệu theo cách khác." },
    table: { group:"DDL · Định nghĩa", title:"CREATE TABLE — Tạo bảng", purpose:"Định nghĩa bảng mới: tên bảng, các cột, kiểu dữ liệu và ràng buộc.", syntax:"CREATE TABLE ten_bang (\n  cot_1 kieu_du_lieu,\n  cot_2 kieu_du_lieu\n);", example:"CREATE TABLE nhacsi (\n  Aid INT PRIMARY KEY,\n  TenNS VARCHAR(64)\n);", reading:"Tạo bảng nhacsi có mã số nguyên Aid là khóa chính và cột tên tối đa 64 ký tự.", tip:"INT dùng cho số nguyên; CHAR(n) cho chuỗi có độ dài cố định; VARCHAR(n) cho chuỗi có độ dài thay đổi trong giới hạn n.", mistake:"Tạo cấu trúc bảng chưa có nghĩa đã có các dòng dữ liệu; dùng INSERT INTO để thêm dòng." },
    alter: { group:"DDL · Định nghĩa", title:"ALTER TABLE — Thay đổi cấu trúc bảng", purpose:"Thay đổi định nghĩa bảng đang tồn tại, ví dụ thêm cột hoặc thêm ràng buộc khóa.", syntax:"ALTER TABLE ten_bang\nADD PRIMARY KEY (cot_khoa);", example:"ALTER TABLE bannhac\nADD PRIMARY KEY (Mid);", reading:"Khai báo Mid làm khóa chính của bảng bannhac đã có và chưa có khóa chính.", tip:"Có thể dùng ALTER TABLE để bổ sung khóa ngoài; xem nút FOREIGN KEY.", mistake:"ALTER thay đổi cấu trúc; UPDATE thay đổi giá trị dữ liệu. Cú pháp ALTER cụ thể có thể khác theo hệ QTCSDL." },
    primary: { group:"DDL · Ràng buộc", title:"PRIMARY KEY — Khóa chính", purpose:"Một cột hoặc nhóm cột định danh duy nhất mỗi dòng; giá trị khóa không trùng và không NULL.", syntax:"CREATE TABLE ten_bang (\n  cot_khoa INT PRIMARY KEY,\n  cot_khac VARCHAR(64)\n);", example:"CREATE TABLE nhacsi (\n  Aid INT PRIMARY KEY,\n  TenNS VARCHAR(64)\n);", reading:"Mỗi nhạc sĩ có một Aid duy nhất để phân biệt với các nhạc sĩ khác.", tip:"Khóa chính có thể gồm nhiều cột; mỗi bảng có tối đa một ràng buộc PRIMARY KEY.", mistake:"Tên người có thể trùng, nên không mặc định dùng tên làm khóa chính. Khóa chính không nhất thiết chỉ có một cột." },
    foreign: { group:"DDL · Ràng buộc", title:"FOREIGN KEY … REFERENCES — Khóa ngoài", purpose:"Khai báo tham chiếu từ cột hoặc nhóm cột của bảng này đến khóa được tham chiếu ở bảng khác, giúp duy trì toàn vẹn dữ liệu.", syntax:"ALTER TABLE bang_con\nADD FOREIGN KEY (cot_tham_chieu)\nREFERENCES bang_cha(cot_khoa);", example:"ALTER TABLE bannhac\nADD FOREIGN KEY (Aid)\nREFERENCES nhacsi(Aid);", reading:"Aid của bản nhạc tham chiếu đến Aid trong bảng nhacsi.", tip:"Trong ví dụ này, nhacsi.Aid phải là khóa được phép tham chiếu. Phòng SQL của bài chỉ ghi nhận khóa ngoài, chưa kiểm tra vi phạm khi nhập.", mistake:"Khóa ngoài là ràng buộc; JOIN là thao tác truy vấn. Khai báo khóa ngoài không tự hiển thị tên nhạc sĩ trong kết quả." },
    grant: { group:"DCL · Phân quyền", title:"GRANT … TO — Cấp quyền", purpose:"Cho phép người dùng thực hiện những thao tác được chỉ định trên đối tượng dữ liệu.", syntax:"GRANT quyen\nON doi_tuong\nTO nguoi_dung;", example:"GRANT SELECT\nON music.*\nTO guest;", reading:"Cho guest quyền SELECT trên mọi bảng của CSDL music theo ví dụ MySQL trong bài.", tip:"ON nêu đối tượng áp dụng quyền; TO nêu người nhận quyền. Cú pháp tài khoản cụ thể phụ thuộc hệ QTCSDL và cách tạo người dùng.", mistake:"Cấp quyền SELECT không đồng thời cấp quyền UPDATE hay DELETE. Trong phòng SQL, phân quyền chỉ được mô phỏng." },
    revoke: { group:"DCL · Phân quyền", title:"REVOKE … FROM — Thu hồi quyền", purpose:"Thu hồi quyền đã cấp cho người dùng trên đối tượng được chỉ định.", syntax:"REVOKE quyen\nON doi_tuong\nFROM nguoi_dung;", example:"REVOKE DELETE\nON music.nhacsi\nFROM mod;", reading:"Thu hồi quyền DELETE trên bảng nhacsi của CSDL music đối với mod theo ví dụ của bài.", tip:"GRANT đi cùng TO; REVOKE đi cùng FROM. Đây là các mẫu phân quyền được đơn giản hóa để học cú pháp.", mistake:"REVOKE thu hồi quyền, không xóa bảng hay dữ liệu. ON ở đây chỉ đối tượng quyền, khác vai trò điều kiện nối trong JOIN." }
  };

  const AUTHORS = [[1,"Đỗ Nhuận"],[2,"Văn Cao"],[3,"Hoàng Việt"],[4,"Nguyễn Tài Tuệ"]];
  const SONGS = [["0001",1,"Du kích sông Thao"],["0002",2,"Trường ca sông Lô"],["0003",3,"Tình ca"],["0004",4,"Xa khơi"],["0005",1,"Việt Nam quê hương tôi"],["0006",2,"Tiến về Hà Nội"]];
  const byId = function (id) { return document.getElementById(id); };
  function sql(pre, source) { if (typeof window.setSql === "function") window.setSql(pre, source); else pre.textContent = source; }
  function table(node, caption, columns, rows) {
    node.replaceChildren();
    const cap = document.createElement("caption"); cap.textContent = caption; node.append(cap);
    const head = document.createElement("thead"), header = document.createElement("tr");
    columns.forEach(function (c) { const cell=document.createElement("th"); cell.scope="col"; cell.textContent=c; header.append(cell); });
    head.append(header); node.append(head);
    const body=document.createElement("tbody");
    rows.forEach(function (r) { const tr=document.createElement("tr"); r.forEach(function (v) { const td=document.createElement("td"); td.textContent=String(v); tr.append(td); }); body.append(tr); });
    if (!rows.length) { const tr=document.createElement("tr"), td=document.createElement("td"); td.colSpan=columns.length; td.textContent="Không có dòng thỏa điều kiện."; tr.append(td); body.append(tr); }
    node.append(body);
  }

  function startMindmap() {
    const buttons=Array.from(document.querySelectorAll("[data-sql-topic]"));
    const columns=byId("sql-demo-columns"), filter=byId("sql-demo-filter"), sort=byId("sql-demo-sort"), join=byId("sql-demo-join"), orphan=byId("sql-demo-orphan");
    function drawDemo() {
      const source=SONGS.concat(orphan.checked ? [["0007",9,"Bản nhạc thử chưa có nhạc sĩ"]] : []);
      let rows=source.map(function (s) { return s.slice(); });
      if (join.checked) rows=rows.flatMap(function (s) { return AUTHORS.filter(function (a) { return a[0]===s[1]; }).map(function (a) { return s.concat(a[1]); }); });
      if (filter.value!=="all") rows=rows.filter(function (s) { return s[1]===Number(filter.value); });
      if (sort.value!=="none") rows.sort(function (a,b) { return (a[0]<b[0] ? -1 : a[0]>b[0] ? 1 : 0)*(sort.value==="DESC" ? -1 : 1); });
      let fields=columns.value==="all" ? ["Mid","Aid","TenBN"] : columns.value==="title" ? ["TenBN"] : ["Mid","TenBN"];
      const indices=columns.value==="all" ? [0,1,2] : columns.value==="title" ? [2] : [0,2];
      const selected=columns.value==="all" ? "bannhac.*" : fields.map(function (f) { return "bannhac."+f; }).join(", ");
      let query="SELECT "+selected+(join.checked ? ", nhacsi.TenNS" : "")+"\nFROM bannhac";
      if (join.checked) { query+="\nINNER JOIN nhacsi\nON bannhac.Aid = nhacsi.Aid"; fields=fields.concat("TenNS"); indices.push(3); }
      if (filter.value!=="all") query+="\nWHERE bannhac.Aid = "+filter.value;
      if (sort.value!=="none") query+="\nORDER BY bannhac.Mid "+sort.value;
      sql(byId("sql-demo-code"),query+";");
      table(byId("sql-demo-result"),"Kết quả truy vấn",fields,rows.map(function (s) { return indices.map(function (i) { return s[i]; }); }));
      table(byId("sql-demo-songs"),"bannhac · "+source.length+" dòng",["Mid","Aid","TenBN"],source);
      table(byId("sql-demo-authors"),"nhacsi · 4 dòng",["Aid","TenNS"],AUTHORS);
      byId("sql-demo-count").textContent=rows.length+" dòng × "+fields.length+" cột. Bảng nguồn bannhac vẫn có "+source.length+" dòng.";
      let explain="FROM lấy bảng bannhac. ";
      explain+=join.checked ? "INNER JOIN ghép các dòng có cùng Aid và thêm TenNS. " : "Chưa nối bảng nên chưa lấy TenNS từ nhacsi. ";
      explain+=filter.value!=="all" ? "WHERE chỉ giữ Aid = "+filter.value+". " : "Không có WHERE nên không lọc thêm dòng. ";
      explain+="SELECT quyết định các cột hiển thị. ";
      if (orphan.checked && join.checked) explain+="Dòng Aid = 9 không có nhạc sĩ tương ứng nên bị loại bởi INNER JOIN. ";
      if (sort.value!=="none") explain+="ORDER BY xếp mã bản nhạc "+(sort.value==="DESC" ? "giảm" : "tăng")+" dần.";
      byId("sql-demo-explain").textContent=explain;
    }
    buttons.forEach(function (button) {
      button.setAttribute("aria-controls","sql-topic-title");
      button.addEventListener("click",function () {
        const id=button.dataset.sqlTopic, t=TOPICS[id];
        buttons.forEach(function (b) { b.setAttribute("aria-pressed",String(b===button)); });
        ["group","title","purpose","reading","tip","mistake"].forEach(function (key) { byId("sql-topic-"+key).textContent=t[key]; });
        sql(byId("sql-topic-syntax"),t.syntax); sql(byId("sql-topic-example"),t.example);
        byId("sql-topic-live").textContent="Đã mở: "+t.title+". Xem cú pháp, ví dụ và phần thử truy vấn bên dưới.";
        if (["select","from","where","join","on","order"].includes(id)) {
          columns.value=id==="from" ? "all" : "idtitle"; filter.value=id==="where" ? "1" : "all";
          join.checked=id==="join" || id==="on"; sort.value=id==="order" ? "DESC" : "none";
          drawDemo();
        }
        document.querySelector(".sql-topic-detail").scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
      });
    });
    byId("sql-map-back").addEventListener("click",function () { const selected=document.querySelector('[data-sql-topic][aria-pressed="true"]'); selected.focus({preventScroll:true}); document.querySelector(".sql-mindmap").scrollIntoView({block:"start",behavior:"smooth"}); });
    [columns,filter,sort,join,orphan].forEach(function (control) { control.addEventListener("change",drawDemo); });
    byId("sql-demo-reset").addEventListener("click",function () { columns.value="idtitle"; filter.value="all"; sort.value="none"; join.checked=false; orphan.checked=false; drawDemo(); });
    drawDemo();
    const sheets=[
      { title:"1. Truy xuất · SELECT, FROM, WHERE, JOIN, ORDER BY, AVG", ids:["select","from","where","join","on","order","avg"] },
      { title:"2. Cập nhật · INSERT, UPDATE, DELETE", ids:["insert","update","delete"] },
      { title:"3. Định nghĩa · CREATE, ALTER, PRIMARY KEY, FOREIGN KEY", ids:["database","table","alter","primary","foreign"] },
      { title:"4. Phân quyền · GRANT, REVOKE", ids:["grant","revoke"] }
    ];
    sheets.forEach(function (group,index) {
      const details=document.createElement("details"), summary=document.createElement("summary"); summary.textContent=group.title; details.append(summary); details.open=index===0;
      const wrap=document.createElement("div"); wrap.className="table-scroll";
      const grid=document.createElement("table"); grid.className="std-table";
      const head=document.createElement("thead"), hr=document.createElement("tr");
      ["Từ khóa / Công dụng","Cú pháp ngắn"].forEach(function (label) { const th=document.createElement("th"); th.scope="col"; th.textContent=label; hr.append(th); }); head.append(hr); grid.append(head);
      const body=document.createElement("tbody");
      group.ids.forEach(function (id) { const t=TOPICS[id], row=document.createElement("tr"), label=document.createElement("td"), cell=document.createElement("td"), pre=document.createElement("pre"); label.textContent=t.title; pre.className="sql"; sql(pre,t.syntax); cell.append(pre); row.append(label,cell); body.append(row); });
      grid.append(body); wrap.append(grid); details.append(wrap); byId("sql-cheatsheet-groups").append(details);
    });
  }

  // Mỗi {{n}} tương ứng với một ô điền. Đáp án thay thế chỉ dùng khi có cùng ý nghĩa.
  const QUESTIONS = [
    {id:"m1",set:"meaning",title:"Lấy dữ liệu",text:"Từ khóa {{0}} mở đầu câu truy vấn lấy dữ liệu và nêu các cột cần hiển thị.",answers:[["SELECT"]],hint:"Từ khóa đầu tiên trong SELECT TenBN FROM bannhac;",explain:"SELECT truy xuất dữ liệu; danh sách sau SELECT xác định các cột hoặc biểu thức kết quả."},
    {id:"m2",set:"meaning",title:"Chọn nguồn dữ liệu",text:"Mệnh đề {{0}} chỉ ra bảng nguồn để lấy dữ liệu.",answers:[["FROM"]],hint:"Đọc câu: lấy TenBN từ bảng bannhac.",explain:"FROM bannhac nghĩa là lấy dữ liệu từ bảng bannhac."},
    {id:"m3",set:"meaning",title:"Lọc theo điều kiện",text:"Muốn chỉ lấy các dòng có Aid = 1, dùng mệnh đề {{0}}.",answers:[["WHERE"]],hint:"Từ khóa mang nghĩa “với điều kiện”.",explain:"WHERE Aid = 1 chỉ giữ những dòng có Aid bằng 1."},
    {id:"m4",set:"meaning",title:"Nối trong hai bảng",text:"Dùng {{0}} để ghép các dòng của hai bảng và chỉ giữ các cặp thỏa điều kiện nối.",answers:[["INNER JOIN","JOIN"]],hint:"Tên đầy đủ gồm hai từ; từ thứ hai là JOIN.",explain:"INNER JOIN kết hợp các dòng khớp nhau theo điều kiện ON; JOIN cũng được chấp nhận trong câu này."},
    {id:"m5",set:"meaning",title:"Điều kiện nối",text:"Trong INNER JOIN, từ khóa {{0}} đứng trước điều kiện bannhac.Aid = nhacsi.Aid.",answers:[["ON"]],hint:"SELECT … FROM bannhac INNER JOIN nhacsi ___ …",explain:"ON nêu điều kiện để ghép hai dòng; ví dụ các giá trị Aid phải bằng nhau."},
    {id:"m6",set:"meaning",title:"Sắp xếp",text:"Muốn sắp xếp các dòng kết quả, dùng mệnh đề {{0}}.",answers:[["ORDER BY"]],hint:"Gồm hai từ; theo sau là cột cần sắp xếp.",explain:"ORDER BY sắp xếp kết quả; ASC tăng dần, DESC giảm dần."},
    {id:"m7",set:"meaning",title:"Phân biệt cột và dòng",text:"Trong truy vấn đơn giản, danh sách sau SELECT chọn {{0}} hiển thị; WHERE lọc các {{1}} thỏa điều kiện.",answers:[["cột","các cột","column","columns","trường"],["dòng","bản ghi","hàng","row","rows"]],hint:"Nhìn bảng: tiêu đề ở trên là tên cột; mỗi bản ghi là một dòng.",explain:"SELECT chọn cột/biểu thức kết quả, WHERE lọc các dòng đầu vào."},
    {id:"m8",set:"meaning",title:"Lấy tất cả các cột",text:"Trong SELECT {{0}} FROM nhacsi;, ký hiệu cần điền mang nghĩa lấy mọi cột.",answers:[["*"]],hint:"Đó là dấu sao.",explain:"Dấu * là cách viết ngắn để lấy tất cả các cột; nó không phải điều kiện lọc dòng."},
    {id:"q1",set:"query",title:"Lấy tên bản nhạc",code:"{{0}} TenBN\n{{1}} bannhac;",answers:[["SELECT"],["FROM"]],hint:"Đầu tiên nêu cột cần lấy, sau đó nêu bảng nguồn.",explain:"SELECT TenBN FROM bannhac; lấy cột TenBN của tất cả các dòng trong bannhac."},
    {id:"q2",set:"query",title:"Chỉ lấy nhạc sĩ Aid = 2",code:"SELECT Aid, TenNS\nFROM nhacsi\n{{0}} Aid = 2;",answers:[["WHERE"]],hint:"Cần lọc dòng, không cần thay đổi cột.",explain:"WHERE Aid = 2 chỉ giữ dòng của nhạc sĩ Văn Cao trong dữ liệu mẫu."},
    {id:"q3",set:"query",title:"Ghép bản nhạc với nhạc sĩ",code:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac\n{{0}} nhacsi\n{{1}} bannhac.Aid = nhacsi.Aid;",answers:[["INNER JOIN","JOIN"],["ON"]],hint:"Một ô nêu thao tác nối, một ô mở đầu điều kiện nối.",explain:"INNER JOIN nhacsi ON bannhac.Aid = nhacsi.Aid ghép các dòng có cùng mã nhạc sĩ."},
    {id:"q4",set:"query",title:"Sắp xếp mã tăng dần",code:"SELECT Mid, TenBN\nFROM bannhac\n{{0}} Mid {{1}};",answers:[["ORDER BY"],["ASC"]],hint:"Mệnh đề sắp xếp gồm hai từ; tăng dần là ASC.",explain:"ORDER BY Mid ASC sắp xếp theo mã bản nhạc tăng dần. ASC là mặc định, nhưng câu này yêu cầu điền rõ."},
    {id:"q5",set:"query",title:"Sắp xếp mã giảm dần",code:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid = 1\nORDER BY Mid {{0}};",answers:[["DESC"]],hint:"Từ khóa đối lập với ASC.",explain:"DESC giảm dần: trong dữ liệu mẫu, 0005 được xếp trước 0001."},
    {id:"q6",set:"query",title:"Nối rồi lọc",code:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac INNER JOIN nhacsi\n{{0}} bannhac.Aid = nhacsi.Aid\n{{1}} nhacsi.Aid = 1;",answers:[["ON"],["WHERE"]],hint:"Dòng đầu là điều kiện ghép, dòng tiếp là điều kiện chọn kết quả.",explain:"ON nối đúng nhạc sĩ với bản nhạc; WHERE chỉ giữ các dòng thuộc nhạc sĩ có Aid = 1."},
    {id:"q7",set:"query",title:"Kết hợp hai điều kiện cùng đúng",code:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid = 1 {{0}} Mid = '0005';",answers:[["AND"]],hint:"Cả hai điều kiện đều phải đúng; không phải chỉ cần một điều kiện đúng.",explain:"AND yêu cầu đồng thời Aid = 1 và Mid = '0005'; chỉ trả về bản nhạc Việt Nam quê hương tôi."},
    {id:"q8",set:"query",title:"Tính điểm trung bình",code:"SELECT {{0}}(tb)\nFROM diemtoan_11A;",answers:[["AVG"]],hint:"Tên hàm viết tắt của average.",explain:"AVG(tb) tính trung bình cộng các giá trị khác NULL của cột tb."},
    {id:"d1",set:"manage",title:"Tạo CSDL và chọn CSDL",code:"{{0}} music;\n{{1}} music;",answers:[["CREATE DATABASE"],["USE"]],hint:"Câu đầu tạo cơ sở dữ liệu; câu sau chọn CSDL hiện hành theo MySQL.",explain:"CREATE DATABASE music tạo CSDL; USE music chọn CSDL để làm việc theo cách viết của bài."},
    {id:"d2",set:"manage",title:"Tạo bảng và khóa chính",code:"{{0}} nhacsi (\n  Aid INT {{1}},\n  TenNS VARCHAR(64)\n);",answers:[["CREATE TABLE"],["PRIMARY KEY"]],hint:"Một cụm từ tạo bảng, một cụm khai báo định danh duy nhất.",explain:"CREATE TABLE tạo cấu trúc bảng. PRIMARY KEY yêu cầu giá trị Aid duy nhất và không NULL."},
    {id:"d3",set:"manage",title:"Thêm khóa ngoài cho bảng đã có",code:"{{0}} bannhac\nADD {{1}} (Aid)\n{{2}} nhacsi(Aid);",answers:[["ALTER TABLE"],["FOREIGN KEY"],["REFERENCES"]],hint:"Thay cấu trúc bảng → khai báo khóa ngoài → chỉ ra bảng và cột được tham chiếu.",explain:"ALTER TABLE thay đổi định nghĩa bảng; FOREIGN KEY (Aid) REFERENCES nhacsi(Aid) khai báo tham chiếu đến mã nhạc sĩ."},
    {id:"d4",set:"manage",title:"Thêm nhạc sĩ",code:"{{0}} nhacsi (Aid, TenNS)\n{{1}} (5, 'Phú Quang');",answers:[["INSERT INTO"],["VALUES"]],hint:"Lệnh thêm dòng và từ khóa mở đầu danh sách giá trị.",explain:"INSERT INTO nêu bảng/cột nhận dữ liệu; VALUES nêu giá trị tương ứng để thêm dòng mới."},
    {id:"d5",set:"manage",title:"Đổi tên đúng một nhạc sĩ",code:"{{0}} nhacsi\n{{1}} TenNS = 'Hoàng Hiệp'\nWHERE Aid = 6;",answers:[["UPDATE"],["SET"]],hint:"Sửa dòng dùng UPDATE; gán giá trị mới dùng SET.",explain:"UPDATE … SET sửa dữ liệu. WHERE Aid = 6 giới hạn dòng cần sửa; phải có dòng Aid = 6 để cập nhật."},
    {id:"d6",set:"manage",title:"Xóa đúng bản nhạc có mã 0005",code:"{{0}} bannhac\n{{1}} Mid = '0005';",answers:[["DELETE FROM"],["WHERE"]],hint:"Cần xóa dòng dữ liệu; phải giữ mệnh đề lọc để tránh xóa cả bảng dữ liệu.",explain:"DELETE FROM … WHERE xóa các dòng thỏa điều kiện, vẫn giữ cấu trúc bảng. Bỏ WHERE sẽ xóa mọi dòng."},
    {id:"d7",set:"manage",title:"Cấp quyền đọc dữ liệu",code:"{{0}} SELECT\nON music.*\n{{1}} guest;",answers:[["GRANT"],["TO"]],hint:"Cấp quyền dùng GRANT; người nhận đứng sau TO.",explain:"Theo mẫu của bài: GRANT SELECT ON music.* TO guest cấp quyền truy xuất mọi bảng trong music."},
    {id:"d8",set:"manage",title:"Thu hồi quyền xóa",code:"{{0}} DELETE\nON music.nhacsi\n{{1}} mod;",answers:[["REVOKE"],["FROM"]],hint:"Thu hồi dùng REVOKE; người bị thu hồi đứng sau FROM.",explain:"Theo mẫu của bài: REVOKE DELETE ON music.nhacsi FROM mod thu hồi quyền xóa trên bảng nhacsi, không xóa dữ liệu."},

    {id:"s1",set:"select-easy",title:"Chọn đúng cột tên nhạc sĩ",task:"Lấy duy nhất cột tên nhạc sĩ từ bảng nhacsi.",code:"SELECT {{0}}\nFROM nhacsi;",answers:[["TenNS","nhacsi.TenNS"]],hint:"Bảng nhacsi có cột mã Aid và cột tên TenNS.",explain:"Điền TenNS vì đề chỉ yêu cầu tên nhạc sĩ. SELECT chọn cột hiển thị; FROM nhacsi chỉ ra bảng nguồn. Kết quả có 4 dòng và 1 cột."},
    {id:"s2",set:"select-easy",title:"Chọn cột làm điều kiện lọc",task:"Lấy tên các bản nhạc do nhạc sĩ có mã 1 sáng tác.",code:"SELECT TenBN\nFROM bannhac\nWHERE {{0}} = 1;",answers:[["Aid","bannhac.Aid"]],hint:"Trong bảng bannhac, Aid lưu mã nhạc sĩ, Mid lưu mã bản nhạc.",explain:"Điền Aid để lọc theo mã nhạc sĩ. Aid = 1 chọn hai bản nhạc Du kích sông Thao và Việt Nam quê hương tôi. TenBN vẫn là cột kết quả, dù Aid được dùng để lọc."},
    {id:"s3",set:"select-easy",title:"So sánh bằng trong WHERE",task:"Chỉ lấy các dòng có mã nhạc sĩ bằng 2.",code:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid {{0}} 2;",answers:[["="]],hint:"SQL dùng một dấu bằng cho phép so sánh bằng.",explain:"Điền =, tạo điều kiện Aid = 2. Hai bản nhạc có mã 0002 và 0006 thỏa điều kiện. Dùng > hoặc < sẽ chọn các dòng khác với yêu cầu."},
    {id:"s4",set:"select-easy",title:"Đếm cột trong SELECT",task:"Đọc truy vấn và xác định số cột được trả về, không cần đếm số dòng.",reference:"SELECT Mid, TenBN\nFROM bannhac;",text:"Kết quả có {{0}} cột.",answers:[["2","hai"]],hint:"Đếm các tên cột trong danh sách sau SELECT.",explain:"Có 2 cột là Mid và TenBN. Bảng nguồn có 3 cột nhưng Aid không nằm trong danh sách SELECT nên không xuất hiện trong kết quả."},
    {id:"s5",set:"select-easy",title:"Đếm dòng sau WHERE",task:"Dùng bảng bannhac trong mục dữ liệu mẫu để xác định kích thước kết quả.",reference:"SELECT TenBN\nFROM bannhac\nWHERE Aid = 1;",text:"Kết quả có {{0}} dòng và {{1}} cột.",answers:[["2","hai"],["1","một"]],hint:"Chỉ hai dòng 0001 và 0005 có Aid = 1. SELECT yêu cầu mấy cột?",explain:"Có 2 dòng thỏa Aid = 1, và SELECT chỉ yêu cầu TenBN nên có 1 cột. WHERE quyết định dòng được giữ; danh sách SELECT quyết định cột hiển thị."},
    {id:"s6",set:"select-easy",title:"Thêm thao tác nối bảng",task:"Nối bản nhạc với nhạc sĩ, chỉ giữ các cặp có cùng Aid.",code:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac\n{{0}} nhacsi\nON bannhac.Aid = nhacsi.Aid;",answers:[["INNER JOIN","JOIN"]],hint:"Phép nối trong có tên đầy đủ là INNER JOIN.",explain:"Điền INNER JOIN; JOIN cũng được chấp nhận. Mỗi bản nhạc được ghép với nhạc sĩ có cùng Aid. JOIN chỉ tạo kết quả truy vấn, không gộp hay sửa hai bảng nguồn."},
    {id:"s7",set:"select-easy",title:"Ghép đúng mã nhạc sĩ",task:"Hoàn thiện điều kiện nối theo cột mã nhạc sĩ ở hai bảng.",code:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac INNER JOIN nhacsi\nON bannhac.Aid = nhacsi.{{0}};",answers:[["Aid"]],hint:"Bảng nhacsi dùng Aid để định danh nhạc sĩ.",explain:"Điền Aid để tạo bannhac.Aid = nhacsi.Aid. Ghép theo mã nhạc sĩ giúp tên bản nhạc đi cùng đúng người sáng tác; Mid là mã bản nhạc nên không dùng thay Aid trong ví dụ này."},
    {id:"s8",set:"select-easy",title:"Điều kiện không có dòng khớp",task:"Trong dữ liệu ban đầu, không có bản nhạc nào có Aid = 99.",reference:"SELECT TenBN\nFROM bannhac\nWHERE Aid = 99;",text:"Truy vấn trả về {{0}} dòng.",answers:[["0","không","zero"]],hint:"WHERE chỉ giữ dòng thỏa điều kiện. Không có dòng nào có Aid = 99.",explain:"Kết quả có 0 dòng vì không có dòng nào thỏa điều kiện. Truy vấn vẫn hợp lệ; không có dữ liệu khớp không đồng nghĩa với lỗi cú pháp."},

    {id:"t1",set:"select-medium",title:"Chọn hai cột và lọc theo tác giả",task:"Lấy mã bản nhạc trước, tên bản nhạc sau, chỉ lấy bản nhạc có Aid = 1.",code:"SELECT {{0}}, {{1}}\nFROM bannhac\nWHERE Aid = 1;",answers:[["Mid","bannhac.Mid"],["TenBN","bannhac.TenBN"]],hint:"Đề yêu cầu hai cột theo thứ tự mã rồi đến tên.",explain:"Điền Mid, TenBN. Danh sách SELECT xác định cả cột lẫn thứ tự cột; WHERE Aid = 1 giữ các dòng 0001 và 0005. Không cần đưa Aid vào SELECT để dùng cột đó trong WHERE."},
    {id:"t2",set:"select-medium",title:"Kết hợp hai điều kiện đồng thời",task:"Chọn bản nhạc có Aid = 2, đồng thời loại mã bản nhạc 0002.",code:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid = 2 {{0}} Mid <> '0002';",answers:[["AND"]],hint:"Cả điều kiện về Aid và điều kiện loại mã 0002 đều phải đúng.",explain:"Điền AND vì cần thỏa đồng thời hai điều kiện. Aid = 2 có các dòng 0002, 0006; loại 0002 còn dòng 0006, Tiến về Hà Nội. OR sẽ cho phép những dòng chỉ thỏa một điều kiện nên sai yêu cầu."},
    {id:"t3",set:"select-medium",title:"Lấy nhạc của một trong hai tác giả",task:"Chọn các bản nhạc có Aid = 1 hoặc Aid = 2.",code:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid = 1 {{0}} Aid = 2;",answers:[["OR"]],hint:"Một dòng chỉ cần thỏa một trong hai điều kiện.",explain:"Điền OR để lấy nhạc của một trong hai nhạc sĩ. Kết quả có 4 dòng: 0001, 0002, 0005, 0006. Dùng AND sẽ không có dòng nào, vì một giá trị Aid không thể vừa bằng 1 vừa bằng 2."},
    {id:"t4",set:"select-medium",title:"Loại các dòng thuộc một tác giả",task:"Lấy những bản nhạc có Aid khác 1; điền toán tử so sánh khác.",code:"SELECT Mid, TenBN\nFROM bannhac\nWHERE Aid {{0}} 1;",answers:[["<>","!="]],hint:"Toán tử SQL chuẩn cho phép so sánh khác gồm dấu nhỏ hơn rồi dấu lớn hơn.",explain:"Điền <>; bài cũng chấp nhận !=. WHERE Aid <> 1 loại hai dòng có Aid = 1 và giữ 4 dòng còn lại. Điều kiện lọc không làm mất dữ liệu trong bảng nguồn."},
    {id:"t5",set:"select-medium",title:"Nối bảng rồi lấy nhạc của Văn Cao",task:"Nối theo Aid và chỉ giữ bản nhạc của Văn Cao, người có Aid = 2 trong bảng nhacsi.",code:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac\n{{0}} nhacsi\n{{1}} bannhac.Aid = nhacsi.Aid\nWHERE nhacsi.Aid = {{2}};",answers:[["INNER JOIN","JOIN"],["ON"],["2"]],hint:"Cần phép nối trong, điều kiện nối và mã nhạc sĩ cần lọc.",explain:"Điền INNER JOIN, ON, 2. ON ghép bản nhạc với đúng nhạc sĩ; WHERE sau đó giữ Aid = 2. Hai dòng kết quả là Trường ca sông Lô và Tiến về Hà Nội, đều đi cùng tên Văn Cao."},
    {id:"t6",set:"select-medium",title:"Xác định cột thuộc bảng nào",task:"Lấy tên bản nhạc và tên nhạc sĩ. Điền tên bảng đứng trước mỗi dấu chấm.",code:"SELECT {{0}}.TenBN, {{1}}.TenNS\nFROM bannhac INNER JOIN nhacsi\nON bannhac.Aid = nhacsi.Aid;",answers:[["bannhac"],["nhacsi"]],hint:"TenBN thuộc bảng Bản nhạc; TenNS thuộc bảng Nhạc sĩ.",explain:"Điền bannhac và nhacsi. Cách viết tên_bảng.tên_cột cho biết chính xác cột đến từ đâu và giúp tránh nhập nhằng khi nhiều bảng có tên cột giống nhau, như Aid."},
    {id:"t7",set:"select-medium",title:"Phân biệt hai cột Aid khi nối",task:"Dùng Aid ở bảng nhacsi để ghép với bannhac.Aid. Điền đầy đủ tên_bảng.tên_cột.",code:"SELECT bannhac.TenBN, nhacsi.TenNS\nFROM bannhac INNER JOIN nhacsi\nON bannhac.Aid = {{0}};",answers:[["nhacsi.Aid"]],hint:"Không chỉ điền Aid vì cả hai bảng đều có cột Aid.",explain:"Điền nhacsi.Aid để điều kiện so sánh hai bảng. Chỉ viết Aid sẽ nhập nhằng; viết bannhac.Aid ở cả hai vế không còn thể hiện liên kết đến nhạc sĩ và có thể ghép sai nhiều dòng."},
    {id:"t8",set:"select-medium",title:"Suy luận kết quả của điều kiện OR",task:"Đối chiếu bảng bannhac; xác định số dòng và số cột sau khi lọc.",reference:"SELECT TenBN\nFROM bannhac\nWHERE Aid = 1 OR Aid = 2;",text:"Kết quả có {{0}} dòng và {{1}} cột.",answers:[["4","bốn"],["1","một"]],hint:"Đếm các dòng có Aid = 1 hoặc 2, rồi đếm cột trong SELECT.",explain:"Có 4 dòng thỏa một trong hai điều kiện. SELECT chỉ lấy TenBN nên có 1 cột. OR mở rộng tập dòng được chọn; nó không làm tăng số cột kết quả."},

    {id:"h1",set:"select-hard",title:"Nối bảng bằng bí danh",task:"b là bí danh của bannhac, n là bí danh của nhacsi. Lấy tên bản nhạc và nhạc sĩ Văn Cao (Aid = 2).",code:"SELECT b.TenBN, n.TenNS\nFROM bannhac AS b\n{{0}} nhacsi AS n\nON {{1}} = n.Aid\nWHERE n.Aid = {{2}};",answers:[["INNER JOIN","JOIN"],["b.Aid"],["2"]],hint:"Sau AS b, dùng b để gọi cột của bannhac. Hai bảng vẫn nối theo Aid.",explain:"Điền INNER JOIN, b.Aid, 2. Bí danh chỉ rút ngắn cách viết tên bảng; không đổi dữ liệu hay cách nối. b.Aid = n.Aid ghép đúng hai bảng; n.Aid = 2 chọn nhạc của Văn Cao, cho 2 dòng kết quả."},
    {id:"h2",set:"select-hard",title:"INNER JOIN loại dòng không khớp",task:"Chỉ ở câu này: thêm vào bannhac dòng ('0007', 9, 'Bản nhạc thử'), nên bảng có 7 dòng. Bảng nhacsi vẫn chỉ có Aid từ 1 đến 4.",reference:"SELECT b.Mid\nFROM bannhac AS b\nINNER JOIN nhacsi AS n ON b.Aid = n.Aid;",text:"Sau INNER JOIN, kết quả có {{0}} dòng.",answers:[["6","sáu"]],hint:"Dòng mới có Aid = 9 có tìm được một dòng tương ứng trong nhacsi không?",explain:"Kết quả vẫn có 6 dòng. Sáu bản nhạc ban đầu đều tìm được nhạc sĩ; dòng mới Aid = 9 không có cặp thỏa ON nên bị INNER JOIN loại khỏi kết quả. Bảng nguồn vẫn có 7 dòng."},
    {id:"h3",set:"select-hard",title:"Một bản nhạc có nhiều bản thu âm",task:"Dùng bảng banthuam trong dữ liệu mẫu; bản nhạc 0001 được thu âm bởi TK và LD.",reference:"SELECT t.Mid, t.Sid, b.TenBN\nFROM banthuam AS t\nINNER JOIN bannhac AS b ON t.Mid = b.Mid\nWHERE b.Mid = '0001';",text:"Kết quả có {{0}} dòng và {{1}} cột.",answers:[["2","hai"],["3","ba"]],hint:"Mỗi bản thu âm khớp với bản nhạc 0001 tạo một dòng; SELECT có ba tên cột.",explain:"Kết quả có 2 dòng và 3 cột. Hai dòng banthuam có Mid = '0001' lần lượt mang Sid TK và LD; mỗi dòng ghép với cùng một bản nhạc. JOIN không tự gộp các bản thu của một bài thành một dòng."},
    {id:"h4",set:"select-hard",title:"Phối hợp ON và hai điều kiện WHERE",task:"Dùng b cho bannhac, n cho nhacsi. Lấy đúng bản nhạc mã 0005 của nhạc sĩ Aid = 1.",code:"SELECT b.TenBN, n.TenNS\nFROM bannhac AS b INNER JOIN nhacsi AS n\nON b.Aid = {{0}}\nWHERE n.Aid = {{1}} {{2}} b.Mid = '0005';",answers:[["n.Aid"],["1"],["AND"]],hint:"ON nối hai mã nhạc sĩ; WHERE yêu cầu cùng đúng mã tác giả và mã bản nhạc.",explain:"Điền n.Aid, 1, AND. ON ghép bản nhạc với nhạc sĩ theo Aid. WHERE chỉ giữ dòng đồng thời thuộc Aid = 1 và Mid = '0005'; kết quả là Việt Nam quê hương tôi — Đỗ Nhuận."},
    {id:"h5",set:"select-hard",title:"Nối ba bảng theo hai quan hệ",task:"t là banthuam, b là bannhac, c là casi. Lấy tên bản nhạc 0001 và tên những ca sĩ đã thu âm bản nhạc đó.",code:"SELECT b.TenBN, c.TenCS\nFROM banthuam AS t\nINNER JOIN bannhac AS b ON {{0}} = b.Mid\nINNER JOIN casi AS c ON t.Sid = {{1}}\nWHERE b.Mid = '0001';",answers:[["t.Mid"],["c.Sid"]],hint:"Bản thu âm liên kết với bản nhạc qua Mid, với ca sĩ qua Sid.",explain:"Điền t.Mid và c.Sid. Phép nối thứ nhất lấy tên bản nhạc theo Mid; phép nối thứ hai lấy tên ca sĩ theo Sid. WHERE giữ bản nhạc 0001, cho 2 dòng: Du kích sông Thao với Trần Khánh và với Lê Dung."},
    {id:"h6",set:"select-hard",title:"Phát hiện điều kiện mâu thuẫn",task:"Đọc truy vấn; một giá trị Aid không thể đồng thời bằng 1 và 2.",reference:"SELECT b.TenBN, n.TenNS\nFROM bannhac AS b INNER JOIN nhacsi AS n\nON b.Aid = n.Aid\nWHERE n.Aid = 1 AND n.Aid = 2;",text:"Truy vấn hiện tại trả về {{0}} dòng. Muốn lấy nhạc của một trong hai nhạc sĩ, thay AND bằng {{1}}.",answers:[["0","không","zero"],["OR"]],hint:"AND yêu cầu cả hai điều kiện cùng đúng; OR chỉ cần một điều kiện đúng.",explain:"Điền 0 và OR. AND tạo điều kiện không thể thỏa nên không có dòng nào, dù JOIN đã ghép được dữ liệu. Đổi thành OR sẽ giữ 4 bản nhạc thuộc Aid = 1 hoặc Aid = 2."},
    {id:"h7",set:"select-hard",title:"JOIN có tự loại dòng trùng không?",task:"Bảng banthuam có hai dòng giống nhau ('0002', 'QH'). Truy vấn không dùng DISTINCT.",reference:"SELECT t.Mid, b.TenBN\nFROM banthuam AS t\nINNER JOIN bannhac AS b ON t.Mid = b.Mid\nWHERE t.Mid = '0002';",text:"Kết quả hiển thị {{0}} dòng, dù các giá trị hiển thị giống nhau.",answers:[["2","hai"]],hint:"Mỗi dòng banthuam được ghép riêng; SELECT thông thường không tự xóa dòng trùng.",explain:"Có 2 dòng kết quả giống nhau: 0002 — Trường ca sông Lô. Cả hai dòng banthuam đều khớp một dòng bannhac. SELECT và INNER JOIN không tự loại kết quả trùng; không được mặc định chỉ còn 1 dòng."},
    {id:"h8",set:"select-hard",title:"Hoàn thiện truy vấn nối ba bảng và lọc",task:"Lấy tên các bản nhạc của nhạc sĩ Aid = 1 và tên ca sĩ có mã TK đã thu âm chúng. Dùng t cho banthuam, b cho bannhac, c cho casi.",code:"{{0}} b.TenBN, c.TenCS\nFROM banthuam AS t\n{{1}} bannhac AS b ON t.Mid = {{2}}\nINNER JOIN casi AS c ON {{3}} = c.Sid\n{{4}} b.Aid = {{5}} AND c.Sid = '{{6}}';",answers:[["SELECT"],["INNER JOIN","JOIN"],["b.Mid"],["t.Sid"],["WHERE"],["1"],["TK"]],hint:"Chọn cột bằng SELECT, nối theo Mid và Sid, rồi lọc đồng thời mã nhạc sĩ và mã ca sĩ.",explain:"Điền SELECT; INNER JOIN; b.Mid; t.Sid; WHERE; 1; TK. Hai phép nối bổ sung tên bản nhạc và tên ca sĩ cho từng bản thu âm. WHERE yêu cầu đồng thời Aid = 1 và Sid = 'TK'. Kết quả có 2 dòng: Du kích sông Thao và Việt Nam quê hương tôi, đều do Trần Khánh thu âm trong dữ liệu mẫu."}
  ];

  function normalize(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").trim().replace(/\s+/g," ").replace(/\s*\.\s*/g,".").toUpperCase();
  }
  function startFill() {
    const storageKey="bai14-sql-dien-khuyet-v1", select=byId("sql-fill-set"), list=byId("sql-fill-questions");
    const descriptions={
      "select-easy":"Mức dễ: chọn đúng cột, lọc dòng theo một điều kiện, nhận biết INNER JOIN và ON. Dùng dữ liệu mẫu để đếm dòng và cột.",
      "select-medium":"Mức trung bình: kết hợp AND, OR, so sánh khác và nối hai bảng. Chú ý cột thuộc bảng nào và phân biệt ON với WHERE.",
      "select-hard":"Mức khó: dùng bí danh, nối ba bảng, phân tích dòng không khớp và dòng trùng. Mở dữ liệu mẫu để suy luận trước khi điền.",
      meaning:"Bộ nền tảng: ôn lại công dụng các từ khóa trong Bài 14.",
      query:"Bộ nền tảng: hoàn thiện các câu truy vấn SELECT, WHERE, JOIN và sắp xếp.",
      manage:"Bộ nền tảng: tạo CSDL, bảng, khóa; thêm, sửa, xóa và phân quyền."
    };
    table(byId("sql-fill-data-songs"),"bannhac · 6 dòng",["Mid","Aid","TenBN"],SONGS);
    table(byId("sql-fill-data-authors"),"nhacsi · 4 dòng",["Aid","TenNS"],AUTHORS);
    table(byId("sql-fill-data-recordings"),"banthuam · 6 dòng",["Mid","Sid"],[["0001","TK"],["0001","LD"],["0005","TK"],["0005","TN"],["0002","QH"],["0002","QH"]]);
    table(byId("sql-fill-data-singers"),"casi · 4 dòng",["Sid","TenCS"],[["TK","Trần Khánh"],["LD","Lê Dung"],["TN","Tấn Nhân"],["QH","Quốc Hương"]]);
    const states={}; let storageOK=true;
    QUESTIONS.forEach(function (q) { states[q.id]={values:q.answers.map(function () { return ""; }),checked:false,revealed:false}; });
    try {
      const saved=JSON.parse(localStorage.getItem(storageKey)||"null");
      if (saved && saved.version===1) {
        if (Array.from(select.options).some(function (option) { return option.value===saved.set; })) select.value=saved.set;
        QUESTIONS.forEach(function (q) { const s=saved.states && saved.states[q.id]; if (s && Array.isArray(s.values) && s.values.length===q.answers.length && s.values.every(function (v) { return typeof v==="string" && v.length<=100; })) states[q.id]={values:s.values,checked:s.checked===true,revealed:s.revealed===true}; });
      }
    } catch (_) { storageOK=false; }
    function save() {
      try { localStorage.setItem(storageKey,JSON.stringify({version:1,set:select.value,states:states})); }
      catch (_) { storageOK=false; }
      if (!storageOK) byId("sql-fill-storage").textContent="Trình duyệt chưa cho phép lưu tiến độ; em vẫn có thể làm và chấm bài trong lần mở này.";
    }
    function correct(q,i) { return q.answers[i].some(function (a) { return q.id==="h8" && i===6 ? a===states[q.id].values[i].trim() : normalize(a)===normalize(states[q.id].values[i]); }); }
    function mastered(q) { const s=states[q.id]; return s.checked && !s.revealed && q.answers.every(function (_,i) { return correct(q,i); }); }
    function updateScore() {
      let total=0,right=0,filled=0,done=0;
      QUESTIONS.forEach(function (q) { const s=states[q.id]; total+=q.answers.length; filled+=s.values.filter(function (v) { return v.trim(); }).length; if (mastered(q)) done++; if (s.checked && !s.revealed) q.answers.forEach(function (_,i) { if (correct(q,i)) right++; }); });
      const group=QUESTIONS.filter(function (q) { return q.set===select.value; });
      byId("sql-fill-score").textContent="Bộ này: "+group.filter(mastered).length+"/"+group.length+" câu đúng tự làm · Toàn bài: "+right+"/"+total+" ô đúng, "+done+"/"+QUESTIONS.length+" câu hoàn thành. Đã điền "+filled+"/"+total+" ô.";
      byId("sql-fill-summary").textContent="Điền chỗ trống: "+right+"/"+total+" ô đúng tự làm · "+done+"/"+QUESTIONS.length+" câu hoàn thành.";
      const progress=document.querySelector(".sql-fill-progress"); progress.setAttribute("aria-valuemax",String(total)); progress.setAttribute("aria-valuenow",String(right)); byId("sql-fill-progress-bar").style.width=(right/total*100)+"%";
    }
    function updateCard(q) {
      const s=states[q.id], card=byId("sql-fill-"+q.id), feedback=byId("sql-fill-feedback-"+q.id);
      if (!card) return;
      const right=q.answers.reduce(function (sum,_,i) { return sum+(correct(q,i) ? 1 : 0); },0), empty=s.values.some(function (v) { return !v.trim(); });
      card.className="sql-fill-card"+(s.revealed ? " reviewed" : s.checked ? (right===q.answers.length ? " solved" : " needs-review") : "");
      q.answers.forEach(function (_,i) { const input=byId("sql-blank-"+q.id+"-"+i); const invalid=s.checked && !s.revealed && !correct(q,i); input.setAttribute("aria-invalid",String(invalid)); input.classList.toggle("answer-correct",s.checked && !s.revealed && correct(q,i)); });
      if (s.revealed) feedback.textContent="Đã xem đáp án, chưa tính điểm tự làm. "+q.explain+" Bấm “Làm lại câu cần ôn” để tự điền lại.";
      else if (s.checked) feedback.textContent=(right===q.answers.length ? "Đúng "+right+"/"+q.answers.length+" ô. "+q.explain : empty ? "Còn ô chưa điền. Đã đúng "+right+"/"+q.answers.length+" ô; điền thêm rồi kiểm tra lại." : "Đúng "+right+"/"+q.answers.length+" ô. Xem lại các ô được đánh dấu; em có thể dùng gợi ý rồi sửa.");
      else feedback.textContent="";
      byId("sql-fill-solution-"+q.id).hidden=!(s.revealed || (s.checked && right===q.answers.length));
    }
    function render() {
      list.replaceChildren();
      byId("sql-fill-level-description").textContent=descriptions[select.value];
      byId("sql-fill-data").hidden=!select.value.startsWith("select-");
      Array.from(document.querySelectorAll("[data-sql-fill-level]")).forEach(function (button) { button.setAttribute("aria-pressed",String(button.dataset.sqlFillLevel===select.value)); });
      QUESTIONS.filter(function (q) { return q.set===select.value; }).forEach(function (q) {
        const s=states[q.id], number=QUESTIONS.indexOf(q)+1, card=document.createElement("article"); card.id="sql-fill-"+q.id; card.className="sql-fill-card";
        const heading=document.createElement("h3"); heading.id=card.id+"-heading"; heading.textContent="Câu "+number+". "+q.title; card.setAttribute("aria-labelledby",heading.id); card.append(heading);
        if (q.task) { const task=document.createElement("p"); task.className="sql-fill-task"; task.textContent=q.task; card.append(task); }
        if (q.reference) { const reference=document.createElement("div"), pre=document.createElement("pre"); reference.className="sql-fill-reference"; pre.className="sql"; sql(pre,q.reference); reference.append(pre); card.append(reference); }
        const prompt=document.createElement("div"); prompt.className=q.code ? "sql-fill-code" : "sql-fill-prompt";
        (q.code||q.text).split(/(\{\{\d+\}\})/).forEach(function (part) {
          const match=part.match(/^\{\{(\d+)\}\}$/);
          if (!match) { prompt.append(document.createTextNode(part)); return; }
          const i=Number(match[1]), input=document.createElement("input"); input.className="sql-blank"; input.id="sql-blank-"+q.id+"-"+i; input.type="text"; input.maxLength=100; input.value=s.values[i]; input.autocomplete="off"; input.spellcheck=false; input.setAttribute("autocapitalize","off"); input.setAttribute("aria-label","Câu "+number+", ô trống "+(i+1)); input.setAttribute("aria-describedby",heading.id+" sql-fill-feedback-"+q.id); input.style.width=Math.max(8,Math.min(20,q.answers[i][0].length+2))+"ch";
          input.addEventListener("input",function () { s.values[i]=input.value; s.checked=false; updateCard(q); updateScore(); save(); });
          input.addEventListener("keydown",function (e) { if (e.key==="Enter") { e.preventDefault(); s.checked=true; updateCard(q); updateScore(); save(); } }); prompt.append(input);
        }); card.append(prompt);
        const actions=document.createElement("div"); actions.className="button-row";
        function action(label,kind,callback) { const b=document.createElement("button"); b.type="button"; b.className="btn "+kind; b.textContent=label; b.addEventListener("click",callback); actions.append(b); return b; }
        action("Kiểm tra câu này","btn-primary",function () { s.checked=true; updateCard(q); updateScore(); save(); });
        const hint=document.createElement("p"); hint.id="sql-fill-hint-"+q.id; hint.className="sql-fill-help"; hint.hidden=true; hint.textContent=q.hint;
        const hintButton=action("Gợi ý","btn-secondary",function () { hint.hidden=!hint.hidden; hintButton.setAttribute("aria-expanded",String(!hint.hidden)); }); hintButton.setAttribute("aria-expanded","false"); hintButton.setAttribute("aria-controls",hint.id);
        action("Xem đáp án","btn-secondary",function () { s.values=q.answers.map(function (a) { return a[0]; }); s.checked=true; s.revealed=true; q.answers.forEach(function (_,i) { byId("sql-blank-"+q.id+"-"+i).value=s.values[i]; }); updateCard(q); updateScore(); save(); });
        const feedback=document.createElement("p"); feedback.id="sql-fill-feedback-"+q.id; feedback.className="sql-fill-feedback"; feedback.setAttribute("aria-live","polite");
        const solution=document.createElement("div"), solutionTitle=document.createElement("h4"), complete=document.createElement(q.code ? "pre" : "p"); solution.id="sql-fill-solution-"+q.id; solution.className="sql-fill-solution"; solution.hidden=true; solutionTitle.textContent=q.code ? "Câu lệnh hoàn chỉnh" : "Nội dung hoàn chỉnh";
        const solutionText=(q.code||q.text).replace(/\{\{(\d+)\}\}/g,function (_,i) { return q.answers[Number(i)][0]; });
        if (q.code) { complete.className="sql"; sql(complete,solutionText); } else complete.textContent=solutionText;
        solution.append(solutionTitle,complete); card.append(actions,hint,feedback,solution); list.append(card); updateCard(q);
      }); updateScore();
    }
    select.addEventListener("change",function () { render(); save(); });
    Array.from(document.querySelectorAll("[data-sql-fill-level]")).forEach(function (button) { button.addEventListener("click",function () { select.value=button.dataset.sqlFillLevel; render(); save(); }); });
    byId("sql-fill-form").addEventListener("submit",function (event) { event.preventDefault(); QUESTIONS.filter(function (q) { return q.set===select.value; }).forEach(function (q) { states[q.id].checked=true; updateCard(q); }); updateScore(); save(); });
    byId("sql-fill-retry").addEventListener("click",function () { QUESTIONS.filter(function (q) { return q.set===select.value && !mastered(q); }).forEach(function (q) { states[q.id]={values:q.answers.map(function () { return ""; }),checked:false,revealed:false}; }); render(); save(); });
    byId("sql-fill-reset").addEventListener("click",function () { QUESTIONS.filter(function (q) { return q.set===select.value; }).forEach(function (q) { states[q.id]={values:q.answers.map(function () { return ""; }),checked:false,revealed:false}; }); render(); save(); });
    render(); if (!storageOK) save();
  }

  document.addEventListener("DOMContentLoaded",function () {
    if (!byId("so-do-sql") || !byId("sql-fill-form")) return;
    startMindmap();
    startFill();
  });
})();
