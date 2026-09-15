/* ==========================================================================
   Trò chơi ôn tập · Giáo dục địa phương 11 — bộ máy dùng chung
   --------------------------------------------------------------------------
   Mỗi trang trò chơi chỉ cần khai báo:

     window.GAME = {
       cd: 3,                                   // số chủ đề (1..8) → bảng màu
       chip: 'CĐ3 · BÀI 2',                     // nhãn góc trái khi chơi
       topic: 'VĂN HỌC TP.HCM TRƯỚC NĂM 1975',  // dòng nhỏ trên mỗi câu hỏi
       title: 'Chữ nghĩa |đất Gia Định|',       // |…| sẽ in nghiêng
       sub: 'Mô tả ngắn hiển thị ở đầu trang.',
       back: 'cd3-bai2-van-ban-van-hoc-truoc-1975.html',
       bank: [ { q:'…', a:['…','…','…','…'], c:0, e:'…' }, … ]
     };

   Trong mỗi câu hỏi, `c` là chỉ số đáp án đúng trong mảng `a` (các đáp án sẽ
   được trộn lại khi chơi nên thứ tự khai báo không ảnh hưởng).
   ========================================================================== */
(function () {
  'use strict';

  var G = window.GAME;
  if (!G || !Array.isArray(G.bank) || !G.bank.length) {
    document.body.innerHTML = '<p style="font-family:system-ui;padding:2rem">' +
      'Thiếu dữ liệu câu hỏi (window.GAME.bank).</p>';
    return;
  }

  var TIME_LIMIT = 20;

  /* Thang xếp hạng riêng cho từng chủ đề */
  var RANKS = {
    1: ['Hướng dẫn viên kỳ cựu', 'Điều phối tour', 'Thuyết minh viên', 'Tình nguyện viên điểm đến', 'Khách tham quan tập sự'],
    2: ['Nhà chép sử thành phố', 'Người giữ đền', 'Hướng dẫn viên di tích', 'Học trò cần mẫn', 'Khách vãn cảnh'],
    3: ['Nhà nghiên cứu văn học', 'Người chép tuyển tập', 'Bạn đọc tinh tường', 'Người mới vào thư phòng', 'Khách ghé hiệu sách'],
    4: ['Nhạc trưởng thành phố', 'Nhà soạn hoà âm', 'Ca trưởng đội văn nghệ', 'Người tập xướng âm', 'Khán giả hàng cuối'],
    5: ['Kiến trúc sư trưởng', 'Nhà bảo tồn di sản', 'Người vẽ khảo tả', 'Sinh viên kiến trúc', 'Khách dạo phố'],
    6: ['Nhà hoạch định phát triển', 'Chuyên viên môi trường', 'Người phân tích số liệu', 'Cán bộ tập sự', 'Người mới tìm hiểu'],
    7: ['Tổng công trình sư STEM', 'Trưởng nhóm dự án', 'Người chế tạo mẫu', 'Thành viên câu lạc bộ', 'Người mới thử sức'],
    8: ['Người giữ lệ làng', 'Tuyên truyền viên pháp luật', 'Hoà giải viên khu phố', 'Công dân hiểu luật', 'Người mới tìm hiểu']
  };
  var MEDALS = ['🏆', '🥇', '🥈', '🥉', '🌱'];
  var RANK_SUBS = [
    'Trọn vẹn tuyệt đối! Em nắm rất chắc cả bài.',
    'Rất tốt! Chỉ cần xem lại vài chi tiết nhỏ là hoàn hảo.',
    'Khá ổn rồi — lướt lại phần câu sai bên dưới là chắc kiến thức.',
    'Em đã nắm được ý chính, cần ôn thêm các từ khoá quan trọng.',
    'Đừng lo, đọc lại phần Ghi nhớ của bài rồi chơi thêm một lượt nữa nhé!'
  ];

  var ranks = RANKS[G.cd] || RANKS[1];

  /* ---------- Tiện ích ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  /* "Chữ nghĩa |đất Gia Định|" → "Chữ nghĩa <em>đất Gia Định</em>" */
  var titleHtml = function (s) {
    return esc(s).replace(/\|([^|]+)\|/g, '<em>$1</em>');
  };

  /* ---------- Dựng khung trang ---------- */
  var total = G.bank.length;
  var lengthOptions = [10, 15, total].filter(function (n, i, arr) {
    return n <= total && arr.indexOf(n) === i;
  });
  if (!lengthOptions.length) lengthOptions = [total];

  document.body.className = 'cd' + (G.cd || 1);
  document.body.innerHTML =
    '<canvas id="confetti" aria-hidden="true"></canvas>' +
    '<main class="sheet">' +

    /* ----- Màn hình bắt đầu ----- */
    '<section class="screen on" id="screen-start">' +
      '<div class="hero">' +
        '<span class="kicker">TRÒ CHƠI ÔN TẬP · GIÁO DỤC ĐỊA PHƯƠNG 11</span>' +
        '<h1>' + titleHtml(G.title || 'Trò chơi ôn tập') + '</h1>' +
        '<p class="hero-sub">' + esc(G.sub || '') + '</p>' +
      '</div>' +
      '<div class="pad">' +
        '<div class="setup-block">' +
          '<span class="setup-label">1 · CHỌN SỐ CÂU HỎI</span>' +
          '<div class="choice-grid" id="len-choices">' +
            lengthOptions.map(function (n, i) {
              var label = n === total ? 'Toàn bộ ' + total + ' câu' : n + ' câu';
              var desc = n === total
                ? 'Chơi hết bộ câu hỏi của bài — dùng khi ôn tập kỹ.'
                : 'Lấy ngẫu nhiên ' + n + ' câu trong ' + total + ' câu của bài.';
              var emoji = n === total ? '📚' : (i === 0 ? '⚡' : '🎯');
              return '<button class="choice' + (i === 0 ? ' sel' : '') + '" data-len="' + n + '" type="button">' +
                '<b><span class="emoji">' + emoji + '</span>' + label + '</b>' +
                '<span>' + desc + '</span></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="setup-block">' +
          '<span class="setup-label">2 · CHỌN CHẾ ĐỘ CHƠI</span>' +
          '<div class="choice-grid" id="mode-choices">' +
            '<button class="choice sel" data-mode="relax" type="button">' +
              '<b><span class="emoji">🧘</span>Thư giãn</b>' +
              '<span>Không giới hạn thời gian, suy nghĩ thoải mái rồi chọn.</span></button>' +
            '<button class="choice" data-mode="rush" type="button">' +
              '<b><span class="emoji">⏱️</span>Tính giờ 20 giây</b>' +
              '<span>Trả lời càng nhanh điểm thưởng càng cao. Hết giờ là mất lượt!</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="btn-row">' +
          '<button class="btn btn--primary" id="btn-start" type="button">▶ Bắt đầu chơi</button>' +
          '<button class="icon-btn" id="btn-sound" type="button" title="Bật/tắt âm thanh" aria-label="Bật hoặc tắt âm thanh">🔊</button>' +
          '<span class="hud-idx" id="qcount-note"></span>' +
        '</div>' +
        '<div class="rules">' +
          '<h3>Luật chơi</h3>' +
          '<ul>' +
            '<li>Mỗi câu đúng được <b>100 điểm</b>; đúng liên tiếp được cộng thêm <b>điểm combo</b> (tối đa +100).</li>' +
            '<li>Chế độ tính giờ: mỗi giây còn lại đổi thành <b>5 điểm thưởng</b>.</li>' +
            '<li>Có thể bấm phím <b>1 · 2 · 3 · 4</b> để chọn đáp án và <b>Enter</b> để sang câu tiếp theo.</li>' +
            '<li>Sai không sao — cuối lượt chơi sẽ có phần <b>xem lại câu sai</b> kèm giải thích.</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* ----- Màn hình chơi ----- */
    '<section class="screen" id="screen-play">' +
      '<div class="hud">' +
        '<div class="hud-left">' +
          '<span class="hud-chip">' + esc(G.chip || '') + '</span>' +
          '<span class="hud-idx" id="qindex">Câu 1 / 1</span>' +
          '<span class="streak" id="streak">🔥 chuỗi 0</span>' +
        '</div>' +
        '<div class="hud-left">' +
          '<div class="score-box"><b id="score">0</b><span>điểm</span></div>' +
          '<button class="icon-btn" id="btn-quit" type="button" title="Thoát về màn hình đầu" aria-label="Thoát">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="progress-track"><div class="progress-fill" id="progress"></div></div>' +
      '<div class="timer-track"><div class="timer-fill" id="timer"></div></div>' +
      '<div class="pad">' +
        '<div class="qmeta" id="qmeta"></div>' +
        '<h2 class="qtext" id="qtext">—</h2>' +
        '<div class="answers" id="answers"></div>' +
        '<div class="feedback" id="feedback"><h4 id="fb-title">—</h4><p id="fb-text">—</p></div>' +
        '<div class="next-row"><button class="btn btn--dark" id="btn-next" type="button" style="display:none;">Câu tiếp theo →</button></div>' +
      '</div>' +
    '</section>' +

    /* ----- Màn hình kết quả ----- */
    '<section class="screen" id="screen-end">' +
      '<div class="hero">' +
        '<span class="kicker">KẾT QUẢ LƯỢT CHƠI</span>' +
        '<h1 id="end-title">Xong rồi!</h1>' +
        '<p class="hero-sub" id="end-sub">—</p>' +
      '</div>' +
      '<div class="pad">' +
        '<div class="result-head">' +
          '<div class="medal" id="medal">🏅</div>' +
          '<h2 class="rank" id="rank">—</h2>' +
          '<p class="rank-sub" id="rank-sub">—</p>' +
        '</div>' +
        '<div class="score-strip">' +
          '<div class="score-cell"><b id="r-score">0</b><span>Tổng điểm</span></div>' +
          '<div class="score-cell"><b id="r-correct">0</b><span>Câu đúng</span></div>' +
          '<div class="score-cell"><b id="r-percent">0%</b><span>Tỉ lệ chính xác</span></div>' +
          '<div class="score-cell"><b id="r-streak">0</b><span>Chuỗi dài nhất</span></div>' +
        '</div>' +
        '<div class="review" id="review"></div>' +
        '<div class="btn-row" style="margin-top:1.2rem">' +
          '<button class="btn btn--primary" id="btn-again" type="button">↻ Chơi lại</button>' +
          '<button class="btn btn--ghost" id="btn-home" type="button">Đổi thiết lập</button>' +
          (G.back ? '<a class="btn btn--ghost" href="' + esc(G.back) + '">← Về bài giảng</a>' : '') +
        '</div>' +
      '</div>' +
    '</section>' +

    '<footer class="site-footer">' +
      '<span>GIÁO DỤC ĐỊA PHƯƠNG 11 · ' + esc(G.topic || '') + '</span>' +
      '<span><a href="index.html">← Thư viện bài giảng</a> · GV: TĂNG NGỌC PHỤNG</span>' +
    '</footer>' +
    '</main>';

  /* ---------- Trạng thái ---------- */
  var state = {
    len: lengthOptions[0],
    mode: 'relax',
    sound: true,
    deck: [],
    idx: 0,
    score: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    locked: false,
    wrong: [],
    timeLeft: TIME_LIMIT,
    ticker: null
  };

  /* ---------- Âm thanh ---------- */
  var audioCtx = null;
  function beep(freqs, dur, type) {
    if (!state.sound) return;
    dur = dur || 0.12;
    type = type || 'sine';
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = f;
        var t0 = audioCtx.currentTime + i * dur;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      });
    } catch (e) { /* trình duyệt chặn âm thanh thì bỏ qua */ }
  }
  var sndGood = function () { beep([660, 880, 1180], 0.11, 'triangle'); };
  var sndBad = function () { beep([220, 165], 0.16, 'sawtooth'); };
  var sndTick = function () { beep([440], 0.05, 'square'); };
  var sndWin = function () { beep([523, 659, 784, 1047], 0.13, 'triangle'); };

  /* ---------- Pháo giấy ---------- */
  var canvas = $('confetti');
  var ctx = canvas.getContext('2d');
  var pieces = [];
  var rafId = null;
  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fallback;
  }
  function burst(n, originY) {
    n = n || 60;
    originY = originY || 0.35;
    var colors = [
      cssVar('--sun', '#E4A23B'), cssVar('--rain', '#5AA6B4'),
      cssVar('--ember', '#B5533A'), cssVar('--good', '#2F7D5B'),
      cssVar('--sun-soft', '#F5DCA9'), cssVar('--rain-soft', '#CDE6E3')
    ];
    for (var i = 0; i < n; i++) {
      pieces.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
        y: canvas.height * originY,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * -9 - 3,
        g: 0.28 + Math.random() * 0.15,
        w: 5 + Math.random() * 7,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 90 + Math.random() * 40
      });
    }
    if (!rafId) rafId = requestAnimationFrame(drawConfetti);
  }
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter(function (p) { return p.life > 0 && p.y < canvas.height + 40; });
    pieces.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (pieces.length) {
      rafId = requestAnimationFrame(drawConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rafId = null;
    }
  }

  /* ---------- Màn hình ---------- */
  function show(id) {
    var screens = document.querySelectorAll('.screen');
    Array.prototype.forEach.call(screens, function (s) { s.classList.remove('on'); });
    $(id).classList.add('on');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Thiết lập ---------- */
  $('len-choices').addEventListener('click', function (ev) {
    var btn = ev.target.closest('.choice');
    if (!btn) return;
    Array.prototype.forEach.call($('len-choices').querySelectorAll('.choice'), function (b) {
      b.classList.remove('sel');
    });
    btn.classList.add('sel');
    state.len = parseInt(btn.dataset.len, 10);
    beep([520], 0.05, 'square');
    updateCountNote();
  });
  $('mode-choices').addEventListener('click', function (ev) {
    var btn = ev.target.closest('.choice');
    if (!btn) return;
    Array.prototype.forEach.call($('mode-choices').querySelectorAll('.choice'), function (b) {
      b.classList.remove('sel');
    });
    btn.classList.add('sel');
    state.mode = btn.dataset.mode;
    beep([520], 0.05, 'square');
    updateCountNote();
  });
  function updateCountNote() {
    $('qcount-note').textContent = state.len + ' câu · ' +
      (state.mode === 'rush' ? '20 giây/câu' : 'không giới hạn giờ');
  }
  updateCountNote();

  $('btn-sound').addEventListener('click', function () {
    state.sound = !state.sound;
    $('btn-sound').textContent = state.sound ? '🔊' : '🔇';
    if (state.sound) beep([660], 0.08);
  });

  /* ---------- Bắt đầu ---------- */
  function startGame() {
    state.deck = shuffle(G.bank).slice(0, Math.min(state.len, G.bank.length)).map(function (q) {
      var correctText = q.a[q.c];
      var opts = shuffle(q.a);
      return { q: q.q, e: q.e, opts: opts, ci: opts.indexOf(correctText), correctText: correctText };
    });
    state.idx = 0; state.score = 0; state.correct = 0;
    state.streak = 0; state.bestStreak = 0; state.wrong = [];
    show('screen-play');
    renderQuestion();
  }
  $('btn-start').addEventListener('click', startGame);
  $('btn-again').addEventListener('click', startGame);
  $('btn-home').addEventListener('click', function () { stopTimer(); show('screen-start'); });
  $('btn-quit').addEventListener('click', function () { stopTimer(); show('screen-start'); });

  /* ---------- Đồng hồ ---------- */
  function stopTimer() {
    if (state.ticker) { clearInterval(state.ticker); state.ticker = null; }
  }
  function startTimer() {
    stopTimer();
    $('timer').classList.remove('warn');
    $('timer').style.width = '100%';
    if (state.mode !== 'rush') return;
    state.timeLeft = TIME_LIMIT;
    var lastTick = TIME_LIMIT;
    state.ticker = setInterval(function () {
      state.timeLeft -= 0.1;
      var pct = Math.max(0, state.timeLeft / TIME_LIMIT) * 100;
      $('timer').style.width = pct + '%';
      if (state.timeLeft <= 5) {
        $('timer').classList.add('warn');
        var sec = Math.ceil(state.timeLeft);
        if (sec > 0 && sec < lastTick) { lastTick = sec; sndTick(); }
      }
      if (state.timeLeft <= 0) { stopTimer(); timeUp(); }
    }, 100);
  }

  /* ---------- Hiển thị câu hỏi ---------- */
  function renderQuestion() {
    var q = state.deck[state.idx];
    state.locked = false;

    $('qindex').textContent = 'Câu ' + (state.idx + 1) + ' / ' + state.deck.length;
    $('progress').style.width = (state.idx / state.deck.length * 100) + '%';
    $('score').textContent = state.score;
    updateStreakChip();

    $('qmeta').textContent = G.topic || '';
    $('qtext').textContent = q.q;

    var wrap = $('answers');
    wrap.innerHTML = '';
    q.opts.forEach(function (text, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ans';
      btn.innerHTML = '<span class="key">' + (i + 1) + '</span><span>' + esc(text) + '</span>';
      btn.addEventListener('click', function () { answer(i); });
      wrap.appendChild(btn);
    });

    $('feedback').className = 'feedback';
    $('btn-next').style.display = 'none';
    startTimer();
  }

  function updateStreakChip() {
    var chip = $('streak');
    if (state.streak >= 2) {
      chip.textContent = '🔥 chuỗi ' + state.streak;
      chip.classList.add('on');
    } else {
      chip.classList.remove('on');
    }
  }

  function lockAnswers(pickedIndex) {
    var q = state.deck[state.idx];
    Array.prototype.forEach.call($('answers').children, function (b, k) {
      b.disabled = true;
      if (k === q.ci) b.classList.add('correct');
      else if (k === pickedIndex) b.classList.add('wrong');
      else b.classList.add('dim');
    });
  }

  function showNextButton() {
    var last = state.idx === state.deck.length - 1;
    $('btn-next').style.display = 'inline-flex';
    $('btn-next').textContent = last ? 'Xem kết quả →' : 'Câu tiếp theo →';
  }

  /* ---------- Trả lời ---------- */
  var PRAISES = ['Chính xác! 🎉', 'Quá chuẩn! 👏', 'Tuyệt vời! ⭐', 'Đúng rồi đó! 💪', 'Xuất sắc! 🌟'];
  var pickPraise = function () { return PRAISES[Math.floor(Math.random() * PRAISES.length)]; };

  function answer(i) {
    if (state.locked) return;
    state.locked = true;
    stopTimer();

    var q = state.deck[state.idx];
    lockAnswers(i);

    if (i === q.ci) {
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      var combo = Math.min(100, (state.streak - 1) * 20);
      var timeBonus = state.mode === 'rush' ? Math.max(0, Math.round(state.timeLeft) * 5) : 0;
      var gained = 100 + combo + timeBonus;
      state.score += gained;
      $('score').textContent = state.score;
      sndGood();
      burst(state.streak >= 3 ? 90 : 45, 0.3);
      var bonusText = (combo ? ' +' + combo + ' combo' : '') + (timeBonus ? ' +' + timeBonus + ' tốc độ' : '');
      $('feedback').className = 'feedback on ok';
      $('fb-title').innerHTML = pickPraise() + '<span class="points">+' + gained + ' điểm' + esc(bonusText) + '</span>';
      $('fb-text').textContent = q.e;
    } else {
      state.streak = 0;
      state.wrong.push(q);
      sndBad();
      $('feedback').className = 'feedback on no';
      $('fb-title').textContent = 'Chưa đúng — đáp án là: ' + q.correctText;
      $('fb-text').textContent = q.e;
    }
    updateStreakChip();
    showNextButton();
    $('btn-next').focus();
  }

  function timeUp() {
    if (state.locked) return;
    state.locked = true;
    var q = state.deck[state.idx];
    lockAnswers(-1);
    state.streak = 0;
    state.wrong.push(q);
    sndBad();
    updateStreakChip();
    $('feedback').className = 'feedback on no';
    $('fb-title').textContent = '⏰ Hết giờ! Đáp án là: ' + q.correctText;
    $('fb-text').textContent = q.e;
    showNextButton();
  }

  $('btn-next').addEventListener('click', function () {
    if (state.idx < state.deck.length - 1) {
      state.idx++;
      renderQuestion();
    } else {
      finish();
    }
  });

  /* ---------- Kết thúc ---------- */
  function finish() {
    stopTimer();
    $('progress').style.width = '100%';
    var total = state.deck.length;
    var pct = Math.round(state.correct / total * 100);

    var tier = 4;
    if (pct === 100) tier = 0;
    else if (pct >= 80) tier = 1;
    else if (pct >= 60) tier = 2;
    else if (pct >= 40) tier = 3;

    $('medal').textContent = MEDALS[tier];
    $('rank').textContent = ranks[tier];
    $('rank-sub').textContent = RANK_SUBS[tier];
    $('end-title').textContent = pct >= 80 ? 'Quá đỉnh!' : (pct >= 50 ? 'Làm tốt lắm!' : 'Cố lên nào!');
    $('end-sub').textContent = 'Em trả lời đúng ' + state.correct + '/' + total + ' câu của bài này.';

    $('r-score').textContent = state.score;
    $('r-correct').textContent = state.correct + '/' + total;
    $('r-percent').textContent = pct + '%';
    $('r-streak').textContent = state.bestStreak;

    var review = $('review');
    if (state.wrong.length === 0) {
      review.innerHTML = '<div class="perfect">🎯 Không sai câu nào! Em có thể thử chế độ ' +
        '<b>Tính giờ 20 giây</b> để thử thách bản thân.</div>';
    } else {
      review.innerHTML = '<h3>Xem lại ' + state.wrong.length + ' câu chưa đúng</h3>' +
        state.wrong.map(function (q) {
          return '<div class="review-item">' +
            '<p class="q">' + esc(q.q) + '</p>' +
            '<p class="a">✓ ' + esc(q.correctText) + '</p>' +
            '<p class="e">' + esc(q.e) + '</p>' +
          '</div>';
        }).join('');
    }

    show('screen-end');
    if (pct >= 60) {
      sndWin();
      burst(150, 0.25);
      setTimeout(function () { burst(100, 0.3); }, 400);
    }
  }

  /* ---------- Bàn phím ---------- */
  document.addEventListener('keydown', function (ev) {
    if (!$('screen-play').classList.contains('on')) return;
    if (['1', '2', '3', '4'].indexOf(ev.key) !== -1) {
      var btn = $('answers').children[parseInt(ev.key, 10) - 1];
      if (btn && !btn.disabled) btn.click();
    } else if (ev.key === 'Enter' && $('btn-next').style.display !== 'none') {
      ev.preventDefault();
      $('btn-next').click();
    }
  });
})();
