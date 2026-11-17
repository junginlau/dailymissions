// js/homes.js

// ==========================================
// 首頁 (時鐘、天氣、名言、統計、目標、書籤)
// ==========================================
function updateClock() {
  const now = new Date();
  let timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes());
  if (window.innerWidth > 768) timeStr += ':' + pad(now.getSeconds());

  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const days = dict.weekdays || ['日', '一', '二', '三', '四', '五', '六'];
  let dateStr;
  if (currentLang === 'en') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    dateStr = monthNames[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear() + ' · ' + days[now.getDay()];
  } else if (currentLang === 'ja') {
    const monthNamesJa = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    dateStr = now.getFullYear() + '年 ' + monthNamesJa[now.getMonth()] + now.getDate() + '日 (' + days[now.getDay()] + ')';
  } else {
    dateStr = now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日 · 星期' + days[now.getDay()];
  }
  $('#clockTime').textContent = timeStr;
  $('#clockDate').textContent = dateStr;
}

function initWeather() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const weatherInfo = $('#weatherInfo');
  if (!weatherInfo) return;

  function fetchWeather(lat, lon) {
    const weatherApiUrl =
      'https://' +
      'api.' +
      'open-meteo' +
      '.com/v1/forecast?latitude=' +
      lat +
      '&longitude=' +
      lon +
      '&current_weather=true';

    fetch(weatherApiUrl)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        const w = data.current_weather;
        const code = w.weathercode;
        let icon = '⛅';
        if (code === 0) icon = '☀️';
        else if (code === 1 || code === 2) icon = '🌤️';
        else if (code === 3) icon = '☁️';
        else if (code >= 51 && code <= 67) icon = '🌧️';
        else if (code >= 71 && code <= 77) icon = '❄️';
        else if (code >= 80 && code <= 82) icon = '🌦️';
        else if (code >= 95) icon = '⛈️';
        weatherInfo.innerHTML =
          '<span class="weather-icon">' + icon + '</span> ' + w.temperature + '°C · ' + dict.weatherWind + ' ' + w.windspeed + ' km/h';
      })
      .catch(function () {
        weatherInfo.innerHTML = '⛅ ' + dict.weatherFail;
      });
  }

  function fallbackIP() {
    const ipApiUrl = 'https://' + 'ipapi' + '.co/json/';

    fetch(ipApiUrl)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.latitude && data.longitude) {
          fetchWeather(data.latitude, data.longitude);
        } else {
          weatherInfo.innerHTML = '⛅ ' + dict.weatherNoGeo;
        }
      })
      .catch(function () {
        weatherInfo.innerHTML = '⛅ ' + dict.weatherFail;
      });
  }

  if (!navigator.geolocation) {
    fallbackIP();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      fetchWeather(pos.coords.latitude, pos.coords.longitude);
    },
    function () {
      fallbackIP();
    },
    { timeout: 5000 }
  );
}

const QUOTES = {
  'zh-TW': [
    '慢慢來，比較快。',
    '今天所做的事，決定明天的你。',
    '不要因為走得太遠，而忘記為什麼出發。',
    '專注當下，一切都是最好的安排。',
    '你不需要很厲害才能開始，但你需要開始才會很厲害。',
    '把每一天當作新的開始。',
    '千里之行，始於足下。'
  ],
  en: [
    'Slow is smooth, smooth is fast.',
    'What you do today determines who you are tomorrow.',
    'Do not go so far that you forget why you started.',
    'Focus on the present; everything is perfectly arranged.',
    "You don't have to be great to start, but you have to start to be great.",
    'Treat every day as a new beginning.',
    'A journey of a thousand miles begins with a single step.'
  ],
  ja: [
    '急がば回れ。',
    '今日の行いが、明日のあなたを決める。',
    '遠くへ行きすぎて、なぜ出発したかを忘れないで。',
    '今に集中すれば、すべてが最高の配置になる。',
    '上手く始める必要はない、始めることが上手くなる秘訣だ。',
    '毎日を新しいスタートとして捉えよう。',
    '千里の道も一歩から。'
  ]
};

function updateQuote() {
  const list = QUOTES[currentLang] || QUOTES['zh-TW'];
  const qEl = $('#quoteText');
  if (qEl) qEl.textContent = list[Math.floor(Math.random() * list.length)];
}

let cdInterval = null;
let cdIndex = 0;
let cdListData = [];

function collectUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const list = [];
  Object.keys(events).forEach(function (k) {
    const target = new Date(k);
    target.setHours(0, 0, 0, 0);
    if (target < today) return;
    (events[k] || []).forEach(function (ev) {
      list.push({
        kind: 'event',
        id: ev.id,
        date: k,
        time: ev.time || '',
        title: ev.title
      });
    });
  });
  (countdowns || []).forEach(function (cd) {
    if (!cd || !cd.date) return;
    const target = new Date(cd.date);
    target.setHours(0, 0, 0, 0);
    if (target < today) return;
    list.push({
      kind: 'countdown',
      id: cd.id,
      date: cd.date,
      time: '',
      title: cd.title
    });
  });
  list.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (!a.time && !b.time) return 0;
    if (!a.time) return -1;
    if (!b.time) return 1;
    return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
  });
  return list.slice(0, 3);
}

function renderCountdowns() {
  const list = $('#countdownList');
  if (!list) return;
  if (cdInterval) {
    clearInterval(cdInterval);
    cdInterval = null;
  }
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  cdListData = collectUpcomingEvents();
  if (!cdListData.length) {
    list.innerHTML = '<div class="empty small" style="padding:6px 0;">' + dict.upcomingEmpty + '</div>';
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function buildItem(cd) {
    const target = new Date(cd.date);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    let text = diff === 0 ? dict.countdownToday : dict.countdownDays.replace('{n}', diff);
    const urgentClass = diff >= 0 && diff <= 3 ? ' urgent' : '';
    const d = keyToDate(cd.date);
    const dateLabel = d.getMonth() + 1 + '/' + d.getDate();
    const timeStr = cd.time ? ' ' + cd.time : '';
    const delBtn =
      cd.kind === 'countdown'
        ? '<button class="cd-del mini del" data-cd-id="' +
          cd.id +
          '" title="' +
          dict.countdownDelete +
          '" aria-label="' +
          dict.countdownDelete +
          '" style="width:20px;height:20px;font-size:11px;margin-left:6px;">×</button>'
        : '';
    return (
      '<div class="cd-item"><span class="cd-title">' +
      escapeHtml(cd.title) +
      ' <span class="cd-date">' +
      dateLabel +
      timeStr +
      '</span></span><span class="cd-days' +
      urgentClass +
      '">' +
      text +
      '</span>' +
      delBtn +
      '</div>'
    );
  }

  if (cdListData.length === 1) {
    list.innerHTML = buildItem(cdListData.at(0));
    return;
  }
  cdIndex = 0;
  list.innerHTML = buildItem(cdListData.at(0));
  cdInterval = setInterval(function () {
    cdIndex = (cdIndex + 1) % cdListData.length;
    const item = list.querySelector('.cd-item');
    if (item) {
      item.style.transition = 'opacity .5s, transform .5s';
      item.style.opacity = '0';
      item.style.transform = 'translateY(5px)';
    }
    setTimeout(function () {
      list.innerHTML = buildItem(cdListData.at(cdIndex));
      const newItem = list.querySelector('.cd-item');
      if (newItem) {
        newItem.style.transition = 'opacity .5s, transform .5s';
        newItem.style.opacity = '0';
        newItem.style.transform = 'translateY(-5px)';
        void newItem.offsetWidth;
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
      }
    }, 500);
  }, 4000);
}

function countTodayTags() {
  const tk = dayKeyOf(new Date());
  return (todos.schedule[tk] || []).length;
}

function countUpcoming(days) {
  const now = new Date();
  let n = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const list = events[dateKey(d)];
    if (list) n += list.length;
  }
  return n;
}

function getTodayExpense() {
  const tk = todayKey();
  let totalTWD = 0;
  ledger.forEach(function (item) {
    if (item.date === tk && item.type === 'expense') totalTWD += item.amount;
  });
  const rate = exchangeRates[mainCurrency] || 1;
  return Math.round(totalTWD / rate);
}

function renderHome() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];

  if (!LS.get('onboarded', false)) {
    const homeMain = document.querySelector('.home-main');
    const existingCard = document.getElementById('welcomeCard');
    if (homeMain && !existingCard) {
      const card = document.createElement('div');
      card.id = 'welcomeCard';
      card.className = 'card welcome-card';
      card.innerHTML =
        '<div style="font-weight:600; margin-bottom:6px;">' +
        dict.welcomeTitle +
        '</div><div style="font-size:13px; line-height:1.6; color:var(--fg-dim); margin-bottom:10px;">' +
        dict.welcomeDesc +
        '</div><button class="btn primary" id="welcomeCloseBtn" style="font-size:12px; padding:6px 12px;">' +
        dict.welcomeBtn +
        '</button>';
      homeMain.prepend(card);
      document.getElementById('welcomeCloseBtn').addEventListener('click', function () {
        LS.set('onboarded', true);
        card.remove();
      });
    } else if (existingCard) {
      existingCard.innerHTML =
        '<div style="font-weight:600; margin-bottom:6px;">' +
        dict.welcomeTitle +
        '</div><div style="font-size:13px; line-height:1.6; color:var(--fg-dim); margin-bottom:10px;">' +
        dict.welcomeDesc +
        '</div><button class="btn primary" id="welcomeCloseBtn" style="font-size:12px; padding:6px 12px;">' +
        dict.welcomeBtn +
'';
document.getElementById('welcomeCloseBtn').addEventListener('click', function () {
LS.set('onboarded', true);
existingCard.remove();
});
}
}
if ($('#statTodo')) $('#statTodo').textContent = countTodayTags();
if ($('#statEvent')) $('#statEvent').textContent = countUpcoming(7);
if ($('#statDiary')) $('#statDiary').textContent = diaries.length;
if ($('#statExpense')) $('#statExpense').textContent = currencySymbols[mainCurrency] + ' ' + getTodayExpense();
renderCountdowns();
renderGoals();
renderBookmarks();
}
// ==========================================
// 目標 (Goals)
// ==========================================
let editingGoalId = null;
let confirmGoalId = null;
const GOAL_CONFIRM_TEXTS = {
'zh-TW': [
{ title: '你真的完成這個目標了嗎？', sub: '你確定沒有偷懶嗎？問問自己的心。', icon: '🤔' },
{ title: '確定完成了嗎？', sub: '別騙自己喔，誠實面對比較好。', icon: '👀' },
{ title: '要標記為完成了？', sub: '回想一下，真的盡力了嗎？', icon: '🧐' },
{ title: '這個目標真的達成了嗎？', sub: '再檢查一次，確認沒有僥倖。', icon: '🔍' }
],
en: [
{ title: 'Are you sure you completed this goal?', sub: 'Did you really give it your all?', icon: '🤔' },
{ title: 'Is it done?', sub: "Don't lie to yourself, face it honestly.", icon: '👀' },
{ title: 'Mark as complete?', sub: 'Think about it, did you really try your best?', icon: '🧐' },
{ title: 'Really achieved?', sub: 'Double-check to make sure.', icon: '🔍' }
]
};
function renderGoals() {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const wrap = $('#goalList');
const badge = $('#goalBadge');
if (!wrap || !badge) return;
if (!goals.length) {
wrap.innerHTML = '' + dict.goalEmpty + '';
badge.textContent = '0 / 0';
return;
}
const doneCount = goals.filter(function (g) {
return g.done;
}).length;
badge.textContent = doneCount + ' / ' + goals.length;
wrap.innerHTML = goals
.map(function (g) {
const prog = g.progress || 0;
return (
'' +
escapeHtml(g.title) +
'' +
(g.note ? '' + escapeHtml(g.note) + '' : '') +
'✎×'
);
})
.join('');
}
function openGoalConfirm(id) {
confirmGoalId = id;
const list = GOAL_CONFIRM_TEXTS[currentLang] || GOAL_CONFIRM_TEXTS['zh-TW'];
const t = list[Math.floor(Math.random() * list.length)];
document.querySelector('.goal-confirm-icon').textContent = t.icon;
$('#goalConfirmTitle').textContent = t.title;
$('#goalConfirmSub').textContent = t.sub;
openModal('#goalConfirmModal');
}
function openGoalModal(id) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
editingGoalId = id || null;
const g = id
? goals.find(function (x) {
return x.id === id;
})
: null;
$('#goalModalTitle').textContent = g ? dict.goalEdit : dict.goalNew;
document.querySelector('#goalModal .sub2').textContent = g ? dict.goalEditSub : dict.goalNewSub;
$('#goalTitle').value = g ? g.title : '';
$('#goalNote').value = g ? g.note || '' : '';
$('#goalProgress').value = g ? g.progress || 0 : 0;
$('#goalProgressVal').textContent = g ? g.progress || 0 : 0;
$('#goalDelete').style.display = g ? '' : 'none';
openModal('#goalModal');
setTimeout(function () {
$('#goalTitle').focus();
}, 80);
}
// ==========================================
// 書籤 (Bookmarks)
// ==========================================
let editingBmId = null;
function faviconUrl(url) {
return (
'https://' +
'www.' +
'google' +
'.com/s2/favicons?sz=64&domain_url=' +
encodeURIComponent(url)
);
}
function renderBookmarks() {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const list = $('#bmList');
if (!list) return;
if (!bookmarks.length) {
list.innerHTML = '' + dict.bmEmpty + '';
return;
}
list.innerHTML = bookmarks
.map(function (b) {
let host = '';
try {
host = new URL(b.url).hostname;
} catch (e) {
host = '';
}
      const name = b.name || host || b.url;
      return (
        '<div class="bm-item" data-id="' +
        b.id +
        '" title="' +
        escapeHtml(name) +
        '">' +
        '<span class="bm-drag-handle">⠿</span>' +
        '<img class="bm-fav" src="' +
        faviconUrl(b.url) +
        '" alt="" onerror="this.style.display=\'none\'">' +
        '<span class="bm-name">' +
        escapeHtml(name) +
        '</span>' +
        '<div class="bm-acts">' +
        '<button class="bm-act" data-act="edit" title="' +
        dict.bmEdit +
        '" aria-label="' +
        dict.bmEdit +
        '">✎</button>' +
        '<button class="bm-act del" data-act="del" title="' +
        dict.bmDelete +
        '" aria-label="' +
        dict.bmDelete +
        '">×</button>' +
        '</div>' +
        '</div>'
      );

})
.join('');
}
function normalizeUrl(raw) {
let u = String(raw || '').trim();
if (!u) return '';
function normalizeUrl(raw) {
  let u = String(raw || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) {
    u = 'http' + 's://' + u;
  }
  return u;
}

}
function openBmModal(id) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
editingBmId = id || null;
const b = id
? bookmarks.find(function (x) {
return x.id === id;
})
: null;
$('#bmModalTitle').textContent = b ? dict.bmEdit : dict.bmNew;
$('#bmName').value = b ? b.name : '';
$('#bmUrl').value = b ? b.url : '';
$('#bmDelete').style.display = b ? '' : 'none';
openModal('#bmModal');
setTimeout(function () {
$('#bmName').focus();
}, 80);
}
// ==========================================
// 綁定首頁相關的所有事件
// ==========================================
function initHomeEvents() {
$('#cdAddBtn').addEventListener('click', function () {
$('#cdTitle').value = '';
$('#cdDate').value = '';
openModal('#cdModal');
setTimeout(function () {
$('#cdTitle').focus();
}, 80);
});
$('#cdSave').addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const title = $('#cdTitle').value.trim();
const date = $('#cdDate').value;
if (!title) {
toast(dict.cdTitlePlaceholder);
$('#cdTitle').focus();
return;
}
if (!date) {
toast(dict.cdDate);
$('#cdDate').focus();
return;
}
countdowns.push({ id: uid(), title: title, date: date });
save('countdowns');
closeModal('#cdModal');
renderCountdowns();
toast(dict.cdAdded);
});
$('#countdownList').addEventListener('click', function (e) {
const btn = e.target.closest('.cd-del');
if (!btn) return;
const id = btn.dataset.cdId;
if (!id) return;
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
customConfirm(dict.cdConfirmDelTitle, dict.cdConfirmDelMsg, dict.delete, dict.cancel, true).then(function (ok) {
if (!ok) return;
countdowns = countdowns.filter(function (c) {
return c.id !== id;
});
save('countdowns');
renderCountdowns();
toast(dict.cdDeleted);
});
});
$('#goalProgress').addEventListener('input', function () {
$('#goalProgressVal').textContent = this.value;
});
$('#goalAddBtn').addEventListener('click', function () {
openGoalModal(null);
});
$('#goalConfirmYes').addEventListener('click', function () {
if (!confirmGoalId) {
closeModal('#goalConfirmModal');
return;
}
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const g = goals.find(function (x) {
return x.id === confirmGoalId;
});
if (g) {
g.done = true;
g.progress = 100;
save('goals');
renderGoals();
}
confirmGoalId = null;
closeModal('#goalConfirmModal');
toast(dict.goalConfirmDone);
});
$('#goalConfirmNo').addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
confirmGoalId = null;
closeModal('#goalConfirmModal');
toast(dict.goalConfirmKeep);
});
$('#goalList').addEventListener('click', function (e) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const btn = e.target.closest('[data-act]');
if (!btn) return;
const item = e.target.closest('.goal-item');
if (!item) return;
const id = item.dataset.id;
const g = goals.find(function (x) {
return x.id === id;
});
if (!g) return;
const act = btn.dataset.act;
if (act === 'toggle') {
if (!g.done) openGoalConfirm(id);
else {
g.done = false;
g.progress = 0;
save('goals');
renderGoals();
}
} else if (act === 'edit') {
openGoalModal(id);
} else if (act === 'del') {
goals = goals.filter(function (x) {
return x.id !== id;
});
save('goals');
renderGoals();
toast(dict.deleted);
}
});
$('#goalSave').addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const title = $('#goalTitle').value.trim();
if (!title) {
toast(dict.goalSaveFail);
$('#goalTitle').focus();
return;
}
const note = $('#goalNote').value.trim();
const prog = parseInt($('#goalProgress').value, 10);
if (editingGoalId) {
const g = goals.find(function (x) {
return x.id === editingGoalId;
});
if (g) {
g.title = title;
g.note = note;
g.progress = prog;
if (prog === 100) g.done = true;
}
} else {
goals.unshift({
id: uid(),
title: title,
note: note,
progress: prog,
done: prog === 100
});
}
save('goals');
renderGoals();
closeModal('#goalModal');
toast(dict.saved);
});
$('#goalDelete').addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
if (!editingGoalId) return;
goals = goals.filter(function (x) {
return x.id !== editingGoalId;
});
save('goals');
renderGoals();
closeModal('#goalModal');
toast(dict.deleted);
});
$('#bmAddBtn').addEventListener('click', function () {
openBmModal(null);
});
$('#bmList').addEventListener('click', function (e) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const item = e.target.closest('.bm-item');
if (!item) return;
const id = item.dataset.id;
const b = bookmarks.find(function (x) {
return x.id === id;
});
if (!b) return;
const actBtn = e.target.closest('[data-act]');
if (actBtn) {
if (actBtn.dataset.act === 'del') {
bookmarks = bookmarks.filter(function (x) {
return x.id !== id;
});
save('bookmarks');
renderBookmarks();
toast(dict.bookmarkDeleted);
} else if (actBtn.dataset.act === 'edit') {
openBmModal(id);
}
return;
}
window.open(b.url, '_blank', 'noopener');
});
$('#bmSave').addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const url = normalizeUrl($('#bmUrl').value);
let name = $('#bmName').value.trim();
if (!url) {
toast(dict.bookmarkUrlRequired);
$('#bmUrl').focus();
return;
}
if (!name) {
try {
name = new URL(url).hostname;
} catch (e) {
name = url;
}
}
if (editingBmId) {
const b = bookmarks.find(function (x) {
return x.id === editingBmId;
});
if (b) {
b.name = name;
b.url = url;
}
} else {
bookmarks.push({ id: uid(), name: name, url: url });
}
save('bookmarks');
renderBookmarks();
closeModal('#bmModal');
toast(dict.bookmarkSaved);
});
$('#bmDelete').addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
if (!editingBmId) return;
bookmarks = bookmarks.filter(function (x) {
return x.id !== editingBmId;
});
save('bookmarks');
renderBookmarks();
closeModal('#bmModal');
toast(dict.bookmarkDeleted);
});
// 書籤拖拽 (Pointer Events)
(function initBookmarkDrag() {
const listEl = $('#bmList');
let dragging = null;
let placeholder = null;
let pointerOffsetY = 0;
let pointerId = null;
if (!listEl) return;
function getItemUnder(clientY) {
const items = $$('.bm-item', listEl).filter(function (el) {
return el !== dragging;
});
for (let i = 0; i < items.length; i++) {
const r = items[i].getBoundingClientRect();
if (clientY < r.top + r.height / 2) return items[i];
}
return null;
}
listEl.addEventListener('pointerdown', function (e) {
const handle = e.target.closest('.bm-drag-handle');
if (!handle) return;
const item = e.target.closest('.bm-item');
if (!item) return;
e.preventDefault();
dragging = item;
pointerId = e.pointerId;
pointerOffsetY = e.clientY - item.getBoundingClientRect().top;
placeholder = document.createElement('div');
placeholder.className = 'bm-placeholder';
placeholder.style.height = item.offsetHeight + 'px';
item.parentNode.insertBefore(placeholder, item);
item.classList.add('dragging');
item.style.position = 'fixed';
item.style.width = item.offsetWidth + 'px';
item.style.left = item.getBoundingClientRect().left + 'px';
item.style.top = e.clientY - pointerOffsetY + 'px';
item.style.zIndex = '999';
item.style.pointerEvents = 'none';
try {
handle.setPointerCapture(pointerId);
} catch (err) {}
});
listEl.addEventListener('pointermove', function (e) {
if (!dragging || e.pointerId !== pointerId) return;
e.preventDefault();
dragging.style.top = e.clientY - pointerOffsetY + 'px';
const before = getItemUnder(e.clientY);
if (before) listEl.insertBefore(placeholder, before);
else listEl.appendChild(placeholder);
});
function finishDrag() {
if (!dragging) return;
dragging.classList.remove('dragging');
dragging.style.position = '';
dragging.style.width = '';
dragging.style.left = '';
dragging.style.top = '';
dragging.style.zIndex = '';
dragging.style.pointerEvents = '';
if (placeholder && placeholder.parentNode) {
placeholder.parentNode.insertBefore(dragging, placeholder);
placeholder.remove();
}
placeholder = null;
dragging = null;
pointerId = null;
const newOrderIds = $$('.bm-item', listEl).map(function (el) {
return el.dataset.id;
});
const newBookmarks = [];
newOrderIds.forEach(function (id) {
const b = bookmarks.find(function (x) {
return x.id === id;
});
if (b) newBookmarks.push(b);
});
if (newBookmarks.length === bookmarks.length) {
bookmarks = newBookmarks;
save('bookmarks');
toast((window.I18N[currentLang] || window.I18N['zh-TW']).bmDragSave);
}
}
listEl.addEventListener('pointerup', finishDrag);
listEl.addEventListener('pointercancel', finishDrag);
})();
}