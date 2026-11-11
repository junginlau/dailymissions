(function () {
  'use strict';

  /* ═══════════════ 工具 ═══════════════ */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function todayKey() { return dateKey(new Date()); }
  function keyToDate(key) {
    const p = key.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function fmtDateTime(d) {
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
           pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 本地儲存 */
  const STORAGE_OK = (function () {
    try {
      const k = '__test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  const LS = {
    get(k, d) {
      if (!STORAGE_OK) return d;
      try {
        const v = localStorage.getItem(k);
        return v === null ? d : JSON.parse(v);
      } catch (e) { return d; }
    },
    set(k, v) {
      if (!STORAGE_OK) return false;
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (e) { return false; }
    }
  };

  /* Toast */
  let toastTimer = null;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2300);
  }

  /* 圖片壓縮 */
  function compressImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('not image')); return;
      }
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (w > maxDim || h > maxDim) {
            const r = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          let data = c.toDataURL('image/jpeg', quality);
          resolve(data);
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* 彈窗控制 */
  function openModal(sel) {
    const m = $(sel);
    if (!m) return;
    m.classList.add('open');
    document.body.classList.add('lock');
  }
  function closeModal(sel) {
    const m = $(sel);
    if (m) m.classList.remove('open');
    if (!document.querySelector('.modal.open, .lightbox.open')) {
      document.body.classList.remove('lock');
    }
  }

  /* ═══════════════ 主題 ═══════════════ */
  const root     = document.documentElement;
  const bgLayer  = $('#bgLayer');
  const DEFAULT_LUM = 55;
  const state = { lum: DEFAULT_LUM, bg: null };

  function getCookie(name) {
    const m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function setCookie(name, value) {
    try {
      document.cookie = name + '=' + encodeURIComponent(value) +
                        '; path=/; max-age=31536000; SameSite=Lax';
      return getCookie(name) !== null;
    } catch (e) { return false; }
  }
  function delCookie(name) {
    document.cookie = name + '=; path=/; max-age=0; SameSite=Lax';
  }

  function loadPrefs() {
    let lum = NaN;
    try {
      const v = localStorage.getItem('lum');
      if (v !== null) lum = parseFloat(v);
    } catch (e) {}
    if (isNaN(lum)) lum = parseFloat(getCookie('lum'));
    if (!isNaN(lum)) state.lum = Math.min(100, Math.max(0, lum));
    else state.lum = DEFAULT_LUM;

    let bg = null;
    try { bg = localStorage.getItem('bg'); } catch (e) {}
    if (!bg) bg = getCookie('bg');
    state.bg = bg || null;
  }

  function savePrefs() {
    setCookie('lum', String(state.lum));
    try { localStorage.setItem('lum', String(state.lum)); } catch (e) {}

    if (state.bg) {
      const ok = setCookie('bg', state.bg);
      if (!ok) {
        delCookie('bg');
        try { localStorage.setItem('bg', state.bg); } catch (e) {}
      } else {
        try { localStorage.removeItem('bg'); } catch (e) {}
      }
    } else {
      delCookie('bg');
      try { localStorage.removeItem('bg'); } catch (e) {}
    }
  }

  function applyTheme() {
    const b = state.lum / 100;
    const bgL = 12 + b * 76;
    let txL;
    if (bgL > 50) txL = Math.max(8, 100 - bgL - 32);
    else          txL = Math.min(94, 100 - bgL + 32);

    if (state.bg) {
      bgLayer.style.backgroundImage = 'url("' + state.bg + '")';
      bgLayer.style.backgroundColor = '#000';
      bgLayer.style.filter = 'brightness(' + (0.35 + b * 1.0).toFixed(2) + ')';
    } else {
      bgLayer.style.backgroundImage = 'none';
      bgLayer.style.filter = 'none';
      bgLayer.style.backgroundColor = 'hsl(220, 14%, ' + bgL.toFixed(1) + '%)';
    }

    const light = bgL > 50;
    root.style.setProperty('--fg', 'hsl(220, 12%, ' + txL.toFixed(1) + '%)');
    root.style.setProperty('--fg-dim', 'hsla(220, 10%, ' + txL.toFixed(1) + '%, .62)');
    root.style.setProperty('--panel', light ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.09)');
    root.style.setProperty('--panel-border', light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.15)');
    root.style.setProperty('--nav-bg', light ? 'rgba(255,255,255,.62)' : 'rgba(18,20,26,.55)');
    root.style.setProperty('--hover', light ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.10)');
    root.style.setProperty('--ink-inv', light ? '#ffffff' : '#111318');
    document.documentElement.style.colorScheme = light ? 'light' : 'dark';

    const t = txL.toFixed(1);
    root.style.setProperty('--scroll-thumb', 'hsla(220, 10%, ' + t + '%, .30)');
    root.style.setProperty('--scroll-thumb-hover', 'hsla(220, 10%, ' + t + '%, .52)');

    $('#lumRange').value = state.lum;
    $('#lumVal').textContent = Math.round(state.lum);
  }

  /* ═══════════════ 資料處理與遷移 ═══════════════ */
  const WEEKDAYS = [
    { key: 'mon', label: '星期一' },
    { key: 'tue', label: '星期二' },
    { key: 'wed', label: '星期三' },
    { key: 'thu', label: '星期四' },
    { key: 'fri', label: '星期五' },
    { key: 'sat', label: '星期六' },
    { key: 'sun', label: '星期日' }
  ];
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  function emptyTodoData() {
    return {
      tags: [],
      schedule: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      done: {}
    };
  }

  function migrateTodos(raw) {
    if (!raw) return emptyTodoData();
    if (raw.tags && raw.schedule) {
      WEEKDAYS.forEach(function (w) {
        if (!Array.isArray(raw.schedule[w.key])) raw.schedule[w.key] = [];
      });
      if (!raw.done || typeof raw.done !== 'object') raw.done = {};
      return raw;
    }
    const data = emptyTodoData();
    const seen = {};
    WEEKDAYS.forEach(function (w) {
      const list = raw[w.key];
      if (!Array.isArray(list)) return;
      list.forEach(function (item) {
        const name = (item && item.text || '').trim();
        if (!name) return;
        if (!seen[name]) {
          seen[name] = { id: uid(), name: name };
          data.tags.push(seen[name]);
        }
        data.schedule[w.key].push(seen[name].id);
      });
    });
    return data;
  }

  let todos     = migrateTodos(LS.get('todos', null));
  let events    = LS.get('events', {});
  let diaries   = LS.get('diaries', []);
  let notes     = LS.get('notes', []);
  let photos    = LS.get('photos', []);
  let goals     = LS.get('goals', []);
  let bookmarks = LS.get('bookmarks', []);
  let countdowns= LS.get('countdowns', []);

  let ledger = LS.get('ledger', null);
  if (!ledger) {
    const oldExp = LS.get('expenses', []);
    if (oldExp.length) {
      ledger = oldExp.map(e => ({ ...e, type: 'expense' }));
      LS.set('ledger', ledger);
      try { localStorage.removeItem('expenses'); } catch(e) {}
    } else {
      ledger = [];
    }
  }

  if (!events || typeof events !== 'object' || Array.isArray(events)) events = {};
  if (!Array.isArray(diaries)) diaries = [];
  if (!Array.isArray(notes)) notes = [];
  if (!Array.isArray(photos)) photos = [];
  if (!Array.isArray(goals)) goals = [];
  if (!Array.isArray(bookmarks)) bookmarks = [];
  if (!Array.isArray(ledger)) ledger = [];
  if (!Array.isArray(countdowns)) countdowns = [];

  function save(key) {
    const map = {
      todos: todos, events: events, diaries: diaries,
      notes: notes, photos: photos, goals: goals, bookmarks: bookmarks,
      ledger: ledger, countdowns: countdowns
    };
    const ok = LS.set(key, map[key]);
    if (!ok) toast('儲存失敗，請檢查瀏覽器空間');
    return ok;
  }

  function dayKeyOf(d) { return DAY_KEYS[d.getDay()]; }
  function dayLabelOf(key) {
    const map = { mon: '星期一', tue: '星期二', wed: '星期三', thu: '星期四',
                  fri: '星期五', sat: '星期六', sun: '星期日' };
    return map[key] || key;
  }

  function pruneDone() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);
    const minKey = dateKey(cutoff);
    let changed = false;
    Object.keys(todos.done || {}).forEach(function (k) {
      if (k < minKey) { delete todos.done[k]; changed = true; }
    });
    if (changed) save('todos');
  }

  /* ═══════════════ 視圖切換 ═══════════════ */
  const views = $$('.view');
  const navBtns = $$('.nav-btn');
  const mobileNavBtns = $$('.mobile-nav-btn');
  const mobileMoreMenu = $('#mobileMoreMenu');

  function showView(name) {
    views.forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + name);
    });
    navBtns.forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === name);
    });
    
    mobileNavBtns.forEach(function (b) {
      if (name === 'notes' || name === 'photos' || name === 'ledger') {
        b.classList.toggle('active', b.dataset.view === 'more');
      } else {
        b.classList.toggle('active', b.dataset.view === name);
      }
    });
    
    if (name !== 'notes' && name !== 'photos' && name !== 'ledger') {
      mobileMoreMenu.classList.remove('open');
    }

    if (name === 'calendar') renderCalendar();
    if (name === 'home') renderHome();
    if (name === 'diary') renderDiaries();
    if (name === 'ledger') renderLedger();
    
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  $('#navLinks').addEventListener('click', function (e) {
    const btn = e.target.closest('.nav-btn');
    if (btn) showView(btn.dataset.view);
  });

  mobileNavBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const view = this.dataset.view;
      if (view === 'more') {
        mobileMoreMenu.classList.toggle('open');
      } else {
        showView(view);
      }
    });
  });

  mobileMoreMenu.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (btn) {
      showView(btn.dataset.view);
      mobileMoreMenu.classList.remove('open');
    }
  });

  document.addEventListener('click', function (e) {
    if (mobileMoreMenu.classList.contains('open') && 
        !mobileMoreMenu.contains(e.target) && 
        !e.target.closest('.mobile-nav-btn[data-view="more"]')) {
      mobileMoreMenu.classList.remove('open');
    }
  });

  $('#logoBtn').addEventListener('click', function () {
    showView('home');
    closeSettings();
  });

  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function () { showView(el.dataset.go); });
  });

  /* ═══════════════ 搜尋欄與引擎切換 ═══════════════ */
  function doSearch(raw) {
    const q = String(raw || '').trim();
    if (!q) return;
    if (/^https?:\/\//i.test(q)) {
      window.open(q, '_blank', 'noopener');
      return;
    }
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q) && !/\s/.test(q)) {
      window.open('https://' + q, '_blank', 'noopener');
      return;
    }
    
    const engine = $('#searchEngine').value;
    let url = '';
    if (engine === 'google') url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    else if (engine === 'youtube') url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
    window.open(url, '_blank', 'noopener');
  }

  $('#searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    doSearch($('#searchInput').value);
    $('#searchInput').value = '';
    $('#searchInput').blur();
  });

  /* ═══════════════ 快捷鍵 ═══════════════ */
  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === '/') {
      e.preventDefault();
      $('#searchInput').focus();
    } else if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openNoteModal(null);
    } else if (e.key === 'Escape') {
      closeSettings();
      $$('.modal.open').forEach(function (m) { closeModal('#' + m.id); });
      if ($('#lightbox').classList.contains('open')) closeLightbox();
    }
  });

  /* ═══════════════ 首頁 Widgets ═══════════════ */
  
  function updateClock() {
    const now = new Date();
    let timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes());
    if (window.innerWidth > 768) {
      timeStr += ':' + pad(now.getSeconds());
    }
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const dateStr = now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日 · 星期' + days[now.getDay()];
    $('#clockTime').textContent = timeStr;
    $('#clockDate').textContent = dateStr;
  }
  setInterval(updateClock, 1000);
  updateClock();
  window.addEventListener('resize', updateClock);

  function initWeather() {
    if (!navigator.geolocation) {
      $('#weatherInfo').innerHTML = '⛅ 無法獲取定位';
      return;
    }
    navigator.geolocation.getCurrentPosition(function (pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true')
        .then(r => r.json())
        .then(data => {
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
          
          $('#weatherInfo').innerHTML = '<span class="weather-icon">' + icon + '</span> ' + w.temperature + '°C · 風速 ' + w.windspeed + ' km/h';
        })
        .catch(() => {
          $('#weatherInfo').innerHTML = '⛅ 天氣載入失敗';
        });
    }, function () {
      $('#weatherInfo').innerHTML = '⛅ 無法獲取定位';
    }, { timeout: 5000 });
  }
  initWeather();

  const QUOTES = [
    '慢慢來，比較快。',
    '今天所做的事，決定明天的你。',
    '不要因為走得太遠，而忘記為什麼出發。',
    '專注當下，一切都是最好的安排。',
    '你不需要很厲害才能開始，但你需要開始才會很厲害。',
    '把每一天當作新的開始。',
    '千里之行，始於足下。'
  ];
  $('#quoteText').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // 最近的要事（自動輪播）
  let cdInterval = null;
  let cdIndex = 0;
  let cdListData = [];

  function renderCountdowns() {
    const list = $('#countdownList');
    if (cdInterval) {
      clearInterval(cdInterval);
      cdInterval = null;
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    let upcoming = [];
    Object.keys(events).forEach(k => {
      const target = new Date(k);
      target.setHours(0,0,0,0);
      if (target >= today && events[k].length > 0) {
        upcoming.push({ date: k, title: events[k][0].title });
      }
    });

    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    cdListData = upcoming.slice(0, 3);

    if (!cdListData.length) {
      list.innerHTML = '<div class="empty small" style="padding:6px 0;">近期沒有要事。</div>';
      return;
    }

    // 如果只有一個，直接顯示，不需要輪播
    if (cdListData.length === 1) {
      const cd = cdListData[0];
      const target = new Date(cd.date);
      target.setHours(0,0,0,0);
      const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      let text = diff === 0 ? '就是今天！' : '還有 ' + diff + ' 天';
      let urgentClass = (diff >= 0 && diff <= 3) ? ' urgent' : '';
      list.innerHTML = '<div class="cd-item" style="animation:none;">' +
        '<span class="cd-title">' + escapeHtml(cd.title) + '</span>' +
        '<span class="cd-days' + urgentClass + '">' + text + '</span>' +
      '</div>';
      return;
    }

    // 如果有多個，進行輪播
    cdIndex = 0;
    function updateCdDisplay() {
      const cd = cdListData[cdIndex];
      const target = new Date(cd.date);
      target.setHours(0,0,0,0);
      const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      let text = diff === 0 ? '就是今天！' : '還有 ' + diff + ' 天';
      let urgentClass = (diff >= 0 && diff <= 3) ? ' urgent' : '';
      
      list.innerHTML = '<div class="cd-item" style="animation: none; opacity: 1; transform: none;">' +
        '<span class="cd-title">' + escapeHtml(cd.title) + '</span>' +
        '<span class="cd-days' + urgentClass + '">' + text + '</span>' +
      '</div>';
    }

    updateCdDisplay();

    cdInterval = setInterval(function () {
      cdIndex = (cdIndex + 1) % cdListData.length;
      
      // 淡出
      const item = list.querySelector('.cd-item');
      if (item) {
        item.style.transition = 'opacity 0.5s, transform 0.5s';
        item.style.opacity = '0';
        item.style.transform = 'translateY(5px)';
      }
      
      setTimeout(function () {
        updateCdDisplay();
        // 淡入
        const newItem = list.querySelector('.cd-item');
        if (newItem) {
          newItem.style.transition = 'opacity 0.5s, transform 0.5s';
          newItem.style.opacity = '0';
          newItem.style.transform = 'translateY(-5px)';
          // 強制重繪
          void newItem.offsetWidth;
          newItem.style.opacity = '1';
          newItem.style.transform = 'translateY(0)';
        }
      }, 500);
      
    }, 4000); // 每 4 秒切換一次
  }

  // 統計
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
    let total = 0;
    ledger.forEach(item => {
      if (item.date === tk && item.type === 'expense') total += item.amount;
    });
    return total;
  }

  function renderHome() {
    $('#statTodo').textContent = countTodayTags();
    $('#statEvent').textContent = countUpcoming(7);
    $('#statDiary').textContent = diaries.length;
    $('#statExpense').textContent = getTodayExpense();
    
    renderCountdowns();
    renderGoals();
    renderBookmarks();
  }

  /* ═══════════════ 目標 ═══════════════ */
  function renderGoals() {
    const wrap = $('#goalList');
    const badge = $('#goalBadge');

    if (!goals.length) {
      wrap.innerHTML = '<div class="empty small">還沒有目標，點右上角「新增目標」開始吧。</div>';
      badge.textContent = '0 / 0';
      return;
    }

    const doneCount = goals.filter(function (g) { return g.done; }).length;
    badge.textContent = doneCount + ' / ' + goals.length;

    wrap.innerHTML = goals.map(function (g) {
      const prog = g.progress || 0;
      return '<div class="goal-item' + (g.done ? ' done' : '') + '" data-id="' + g.id + '">' +
        '<button class="goal-chk" data-act="toggle" aria-label="標記完成"></button>' +
        '<div class="goal-main">' +
          '<div class="goal-title">' + escapeHtml(g.title) + '</div>' +
          (g.note ? '<div class="goal-note">' + escapeHtml(g.note) + '</div>' : '') +
          '<div class="goal-progress-bar"><div class="goal-progress-fill" style="width:' + prog + '%"></div></div>' +
        '</div>' +
        '<div class="goal-acts">' +
          '<button class="mini" data-act="edit" aria-label="編輯目標">編</button>' +
          '<button class="mini del" data-act="del" aria-label="刪除目標">×</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  let editingGoalId = null;
  let confirmGoalId = null;

  const GOAL_CONFIRM_TEXTS = [
    { title: '你真的完成這個目標了嗎？', sub: '你確定沒有偷懶嗎？問問自己的心。', icon: '🤔' },
    { title: '確定完成了嗎？', sub: '別騙自己喔，誠實面對比較好。', icon: '👀' },
    { title: '要標記為完成了？', sub: '回想一下，真的盡力了嗎？', icon: '🧐' },
    { title: '這個目標真的達成了嗎？', sub: '再檢查一次，確認沒有僥倖。', icon: '🔍' }
  ];

  function openGoalConfirm(id) {
    confirmGoalId = id;
    const t = GOAL_CONFIRM_TEXTS[Math.floor(Math.random() * GOAL_CONFIRM_TEXTS.length)];
    document.querySelector('.goal-confirm-icon').textContent = t.icon;
    $('#goalConfirmTitle').textContent = t.title;
    $('#goalConfirmSub').textContent = t.sub;
    openModal('#goalConfirmModal');
  }

  $('#goalConfirmYes').addEventListener('click', function () {
    if (!confirmGoalId) { closeModal('#goalConfirmModal'); return; }
    const g = goals.find(function (x) { return x.id === confirmGoalId; });
    if (g) {
      g.done = true;
      g.progress = 100;
      save('goals');
      renderGoals();
    }
    confirmGoalId = null;
    closeModal('#goalConfirmModal');
    toast('恭喜完成目標！為自己鼓掌 👏');
  });

  $('#goalConfirmNo').addEventListener('click', function () {
    confirmGoalId = null;
    closeModal('#goalConfirmModal');
    toast('繼續努力，你可以的 💪');
  });

  function openGoalModal(id) {
    editingGoalId = id || null;
    const g = id ? goals.find(function (x) { return x.id === id; }) : null;

    $('#goalModalTitle').textContent = g ? '編輯目標' : '新增目標';
    $('#goalTitle').value = g ? g.title : '';
    $('#goalNote').value = g ? (g.note || '') : '';
    $('#goalProgress').value = g ? (g.progress || 0) : 0;
    $('#goalProgressVal').textContent = g ? (g.progress || 0) : 0;
    $('#goalDelete').style.display = g ? '' : 'none';

    openModal('#goalModal');
    setTimeout(function () { $('#goalTitle').focus(); }, 80);
  }

  $('#goalProgress').addEventListener('input', function () {
    $('#goalProgressVal').textContent = this.value;
  });

  $('#goalAddBtn').addEventListener('click', function () { openGoalModal(null); });

  $('#goalList').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const item = e.target.closest('.goal-item');
    if (!item) return;
    const id = item.dataset.id;
    const g = goals.find(function (x) { return x.id === id; });
    if (!g) return;

    const act = btn.dataset.act;
    if (act === 'toggle') {
      if (!g.done) {
        openGoalConfirm(id);
      } else {
        g.done = false;
        g.progress = 0;
        save('goals');
        renderGoals();
      }
    } else if (act === 'edit') {
      openGoalModal(id);
    } else if (act === 'del') {
      goals = goals.filter(function (x) { return x.id !== id; });
      save('goals');
      renderGoals();
      toast('已刪除目標');
    }
  });

  $('#goalSave').addEventListener('click', function () {
    const title = $('#goalTitle').value.trim();
    if (!title) { toast('請填寫目標標題'); $('#goalTitle').focus(); return; }
    const note = $('#goalNote').value.trim();
    const prog = parseInt($('#goalProgress').value, 10);

    if (editingGoalId) {
      const g = goals.find(function (x) { return x.id === editingGoalId; });
      if (g) { g.title = title; g.note = note; g.progress = prog; if (prog === 100) g.done = true; }
    } else {
      goals.unshift({ id: uid(), title: title, note: note, progress: prog, done: prog === 100 });
    }

    save('goals');
    renderGoals();
    closeModal('#goalModal');
    toast('已保存目標');
  });

  $('#goalDelete').addEventListener('click', function () {
    if (!editingGoalId) return;
    goals = goals.filter(function (x) { return x.id !== editingGoalId; });
    save('goals');
    renderGoals();
    closeModal('#goalModal');
    toast('已刪除目標');
  });

  /* ═══════════════ 書籤 (支援拖拽) ═══════════════ */
  let editingBmId = null;

  function faviconUrl(url) {
    return 'https://www.google.com/s2/favicons?sz=64&domain_url=' + encodeURIComponent(url);
  }

  function renderBookmarks() {
    const list = $('#bmList');
    if (!bookmarks.length) {
      list.innerHTML = '<div class="empty small">還沒有書籤<br>點右上角 ＋ 新增</div>';
      return;
    }
    list.innerHTML = bookmarks.map(function (b) {
      let host = '';
      try { host = new URL(b.url).hostname; } catch (e) { host = ''; }
      const name = b.name || host || b.url;
      return '<div class="bm-item" draggable="true" data-id="' + b.id + '" title="' + escapeHtml(name) + '">' +
        '<img class="bm-fav" src="' + faviconUrl(b.url) + '" alt="" ' +
             'onerror="this.style.visibility=\'hidden\'">' +
        '<span class="bm-name">' + escapeHtml(name) + '</span>' +
        '<div class="bm-acts">' +
          '<button class="bm-act" data-act="edit" title="編輯" aria-label="編輯書籤">編</button>' +
          '<button class="bm-act del" data-act="del" title="刪除" aria-label="刪除書籤">×</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // 拖拽排序邏輯
  let dragSrcEl = null;

  $('#bmList').addEventListener('dragstart', function (e) {
    const item = e.target.closest('.bm-item');
    if (!item) return;
    dragSrcEl = item;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.id);
    setTimeout(() => item.classList.add('dragging'), 0);
  });

  $('#bmList').addEventListener('dragover', function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.bm-item');
    if (target && target !== dragSrcEl) {
      const rect = target.getBoundingClientRect();
      const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
      // 確保不會抓錯
      if (dragSrcEl.parentNode === this) {
        this.insertBefore(dragSrcEl, next && target.nextSibling || target);
      }
    }
  });

  $('#bmList').addEventListener('dragend', function (e) {
    if (!dragSrcEl) return;
    dragSrcEl.classList.remove('dragging');
    dragSrcEl = null;

    // 重新獲取 DOM 順序並更新資料
    const newOrderIds = $$('.bm-item', $('#bmList')).map(el => el.dataset.id);
    const newBookmarks = [];
    newOrderIds.forEach(id => {
      const b = bookmarks.find(x => x.id === id);
      if (b) newBookmarks.push(b);
    });
    bookmarks = newBookmarks;
    save('bookmarks');
    toast('排序已保存');
  });

  function normalizeUrl(raw) {
    let u = String(raw || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }

  function openBmModal(id) {
    editingBmId = id || null;
    const b = id ? bookmarks.find(function (x) { return x.id === id; }) : null;
    $('#bmModalTitle').textContent = b ? '編輯書籤' : '新增書籤';
    $('#bmName').value = b ? b.name : '';
    $('#bmUrl').value = b ? b.url : '';
    $('#bmDelete').style.display = b ? '' : 'none';
    openModal('#bmModal');
    setTimeout(function () { $('#bmName').focus(); }, 80);
  }

  $('#bmAddBtn').addEventListener('click', function () { openBmModal(null); });

  $('#bmList').addEventListener('click', function (e) {
    const item = e.target.closest('.bm-item');
    if (!item) return;
    const id = item.dataset.id;
    const b = bookmarks.find(function (x) { return x.id === id; });
    if (!b) return;

    const actBtn = e.target.closest('[data-act]');
    if (actBtn) {
      if (actBtn.dataset.act === 'del') {
        bookmarks = bookmarks.filter(function (x) { return x.id !== id; });
        save('bookmarks');
        renderBookmarks();
        toast('已刪除書籤');
      } else if (actBtn.dataset.act === 'edit') {
        openBmModal(id);
      }
      return;
    }
    window.open(b.url, '_blank', 'noopener');
  });

  $('#bmSave').addEventListener('click', function () {
    let url = normalizeUrl($('#bmUrl').value);
    let name = $('#bmName').value.trim();
    if (!url) { toast('請填寫網址'); $('#bmUrl').focus(); return; }
    if (!name) {
      try { name = new URL(url).hostname; } catch (e) { name = url; }
    }
    if (editingBmId) {
      const b = bookmarks.find(function (x) { return x.id === editingBmId; });
      if (b) { b.name = name; b.url = url; }
    } else {
      bookmarks.push({ id: uid(), name: name, url: url });
    }
    save('bookmarks');
    renderBookmarks();
    closeModal('#bmModal');
    toast('已保存書籤');
  });

  $('#bmDelete').addEventListener('click', function () {
    if (!editingBmId) return;
    bookmarks = bookmarks.filter(function (x) { return x.id !== editingBmId; });
    save('bookmarks');
    renderBookmarks();
    closeModal('#bmModal');
    toast('已刪除書籤');
  });

  /* ═══════════════ 記帳頁面 ═══════════════ */
  function renderLedger() {
    if (!$('#ledgerDate').value) {
      $('#ledgerDate').value = todayKey();
    }
    
    const now = new Date();
    const thisMonth = now.getFullYear() + '-' + pad(now.getMonth() + 1);
    const monthItems = ledger.filter(item => item.date.startsWith(thisMonth));
    
    let totalExpense = 0;
    let totalIncome = 0;
    monthItems.forEach(item => {
      if (item.type === 'income') totalIncome += item.amount;
      else totalExpense += item.amount;
    });
    
    const balance = totalIncome - totalExpense;
    $('#monthExpenseTotal').textContent = totalExpense;
    $('#monthIncomeTotal').textContent = totalIncome;
    $('#monthBalanceTotal').textContent = balance;
    $('#monthBalanceTotal').style.color = balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';

    const listWrap = $('#ledgerList');
    if (!monthItems.length) {
      listWrap.innerHTML = '<div class="empty">本月還沒有任何記帳紀錄。</div>';
      return;
    }

    const sorted = monthItems.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    listWrap.innerHTML = sorted.map(function (item) {
      const isIncome = item.type === 'income';
      const sign = isIncome ? '+' : '-';
      const colorClass = isIncome ? 'income' : 'expense';
      return '<div class="ledger-item">' +
        '<div class="ledger-date">' + item.date.slice(5) + '</div>' +
        '<div class="ledger-cat">' + escapeHtml(item.category) + '</div>' +
        '<div class="ledger-note">' + escapeHtml(item.note || '-') + '</div>' +
        '<div class="ledger-amount ' + colorClass + '">' + sign + '$' + item.amount + '</div>' +
        '<button class="mini del ledger-del" data-id="' + item.id + '" title="刪除">×</button>' +
      '</div>';
    }).join('');
  }

  $('#ledgerAddBtn').addEventListener('click', function () {
    const type = $('#ledgerType').value;
    const amount = parseFloat($('#ledgerAmount').value);
    const category = $('#ledgerCategory').value;
    const date = $('#ledgerDate').value;
    const note = $('#ledgerNote').value.trim();

    if (!amount || amount <= 0) { toast('請輸入有效金額'); $('#ledgerAmount').focus(); return; }
    if (!date) { toast('請選擇日期'); $('#ledgerDate').focus(); return; }

    ledger.push({ id: uid(), type: type, amount: amount, category: category, date: date, note: note });
    save('ledger');
    
    $('#ledgerAmount').value = '';
    $('#ledgerNote').value = '';
    
    renderLedger();
    renderHome();
    toast('已新增紀錄');
  });

  $('#ledgerList').addEventListener('click', function (e) {
    const btn = e.target.closest('.ledger-del');
    if (!btn) return;
    const id = btn.dataset.id;
    ledger = ledger.filter(function (x) { return x.id !== id; });
    save('ledger');
    renderLedger();
    renderHome();
    toast('已刪除紀錄');
  });

  /* ═══════════════ 每週必做 ═══════════════ */
  function tagById(id) {
    return todos.tags.find(function (t) { return t.id === id; }) || null;
  }

  function tagsForDay(dayKey) {
    return (todos.schedule[dayKey] || [])
      .map(tagById)
      .filter(Boolean);
  }

  function renderTodos() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const todayDayKey = dayKeyOf(now);
    const tomorrowDayKey = dayKeyOf(tomorrow);
    const todayDateKey = dateKey(now);
    const todayDone = Array.isArray(todos.done[todayDateKey]) ? todos.done[todayDateKey] : [];

    const todayTags = tagsForDay(todayDayKey);
    const tomorrowTags = tagsForDay(tomorrowDayKey);

    const todayCol = $('#todayCol');
    const doneCount = todayTags.filter(function (t) { return todayDone.indexOf(t.id) >= 0; }).length;
    todayCol.innerHTML =
      '<div class="card today-card">' +
        '<div class="today-head">' +
          '<h3>今天 · ' + dayLabelOf(todayDayKey) + '</h3>' +
          '<span class="badge">' +
            (todayTags.length ? doneCount + ' / ' + todayTags.length : '—') +
          '</span>' +
        '</div>' +
        '<div class="today-list scroll-box">' +
          (todayTags.length
            ? todayTags.map(function (t) {
                const done = todayDone.indexOf(t.id) >= 0;
                return '<button class="today-item' + (done ? ' done' : '') +
                       '" data-tag="' + t.id + '">' +
                  '<span class="chk"></span>' +
                  '<span class="label">' + escapeHtml(t.name) + '</span>' +
                '</button>';
              }).join('')
            : '<div class="empty small">今天沒有安排，點右上角設定標籤。</div>') +
        '</div>' +
      '</div>';

    const tomorrowCol = $('#tomorrowCol');
    tomorrowCol.innerHTML =
      '<div class="card tomorrow-card">' +
        '<h4>明天 · ' + dayLabelOf(tomorrowDayKey) + '</h4>' +
        '<div class="tomorrow-list">' +
          (tomorrowTags.length
            ? tomorrowTags.map(function (t) {
                return '<span class="tomorrow-tag">' + escapeHtml(t.name) + '</span>';
              }).join('')
            : '<span class="empty small" style="padding:0;">—</span>') +
        '</div>' +
      '</div>';
  }

  $('#todayCol').addEventListener('click', function (e) {
    const btn = e.target.closest('.today-item');
    if (!btn) return;
    const id = btn.dataset.tag;
    const tk = dateKey(new Date());
    if (!Array.isArray(todos.done[tk])) todos.done[tk] = [];
    const arr = todos.done[tk];
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(id);
    save('todos');
    renderTodos();
    renderHome();
  });

  let todoDraft = null;

  function openTodoSettings() {
    todoDraft = JSON.parse(JSON.stringify(todos));
    if (!todoDraft.tags) todoDraft.tags = [];
    if (!todoDraft.schedule) todoDraft.schedule = emptyTodoData().schedule;
    WEEKDAYS.forEach(function (w) {
      if (!Array.isArray(todoDraft.schedule[w.key])) todoDraft.schedule[w.key] = [];
    });
    renderTagPool();
    renderSchedule();
    openModal('#todoModal');
  }

  function renderTagPool() {
    const pool = $('#tagPool');
    if (!todoDraft.tags.length) {
      pool.innerHTML = '<div class="empty small" style="padding:6px 0;">還沒有標籤，先新增一個吧。</div>';
      return;
    }
    pool.innerHTML = todoDraft.tags.map(function (t) {
      return '<span class="tag-chip">' + escapeHtml(t.name) +
        '<button class="chip-x" data-del-tag="' + t.id + '" aria-label="刪除標籤">×</button>' +
      '</span>';
    }).join('');
  }

  function renderSchedule() {
    const grid = $('#scheduleGrid');
    if (!todoDraft.tags.length) {
      grid.innerHTML = '<div class="empty small" style="grid-column:1/-1;">先新增標籤，再分配到星期。</div>';
      return;
    }
    grid.innerHTML = WEEKDAYS.map(function (w) {
      const assigned = todoDraft.schedule[w.key] || [];
      return '<div class="sched-card">' +
        '<h4>' + w.label + '</h4>' +
        '<div class="sched-tags">' +
          todoDraft.tags.map(function (t) {
            const on = assigned.indexOf(t.id) >= 0;
            return '<button class="sched-tag' + (on ? ' on' : '') +
                   '" data-toggle-day="' + w.key + '" data-tag="' + t.id + '">' +
                   escapeHtml(t.name) + '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');
  }

  $('#tagAddBtn').addEventListener('click', function () {
    const input = $('#tagInput');
    const v = input.value.trim();
    if (!v) { input.focus(); return; }
    if (todoDraft.tags.some(function (t) { return t.name === v; })) {
      toast('已經有同名標籤');
      return;
    }
    todoDraft.tags.push({ id: uid(), name: v });
    input.value = '';
    renderTagPool();
    renderSchedule();
    input.focus();
  });

  $('#tagInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); $('#tagAddBtn').click(); }
  });

  $('#tagPool').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-del-tag]');
    if (!btn) return;
    const id = btn.dataset.delTag;
    todoDraft.tags = todoDraft.tags.filter(function (t) { return t.id !== id; });
    WEEKDAYS.forEach(function (w) {
      todoDraft.schedule[w.key] = todoDraft.schedule[w.key].filter(function (x) { return x !== id; });
    });
    renderTagPool();
    renderSchedule();
  });

  $('#scheduleGrid').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-toggle-day]');
    if (!btn) return;
    const day = btn.dataset.toggleDay;
    const tagId = btn.dataset.tag;
    const arr = todoDraft.schedule[day];
    const i = arr.indexOf(tagId);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(tagId);
    renderSchedule();
  });

  $('#todoSaveBtn').addEventListener('click', function () {
    todos = todoDraft;
    todoDraft = null;
    save('todos');
    renderTodos();
    renderHome();
    closeModal('#todoModal');
    toast('已保存每週設定');
  });

  $('#todoSettingsBtn').addEventListener('click', openTodoSettings);

  /* ═══════════════ 日曆 ═══════════════ */
  const TIMEZONE = (function () {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '本地時區'; }
    catch (e) { return '本地時區'; }
  })();

  let calCursor = new Date();
  calCursor.setDate(1);

  function monthIndex(y, m) { return y * 12 + m; }

  function renderCalendar() {
    const y = calCursor.getFullYear();
    const m = calCursor.getMonth();
    const now = new Date();
    const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6;
    const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12;
    const curIdx = monthIndex(y, m);

    $('#calTitle').textContent = y + ' 年 ' + (m + 1) + ' 月';
    $('#calPrev').disabled = curIdx <= minIdx;
    $('#calNext').disabled = curIdx >= maxIdx;
    $('#calTz').textContent = '時區：' + TIMEZONE +
      ' · 可記錄範圍：前 6 個月 ～ 後 12 個月';

    if (!$('#calJumpDate').value) {
      $('#calJumpDate').value = y + '-' + pad(m + 1) + '-01';
    }

    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrev = new Date(y, m, 0).getDate();
    const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
    const tk = todayKey();

    let html = ['日', '一', '二', '三', '四', '五', '六'].map(function (d) {
      return '<div class="cal-dow">' + d + '</div>';
    }).join('');

    for (let i = 0; i < totalCells; i++) {
      const dn = i - firstDow + 1;
      if (dn < 1) {
        html += '<div class="cal-cell muted">' + (daysInPrev + dn) + '</div>';
      } else if (dn > daysInMonth) {
        html += '<div class="cal-cell muted">' + (dn - daysInMonth) + '</div>';
      } else {
        const key = y + '-' + pad(m + 1) + '-' + pad(dn);
        const list = events[key] || [];
        const isToday = key === tk;
        // 以星星標記有事件的日期
        let star = list.length > 0 ? ' ⭐' : '';
        html += '<button class="cal-cell' + (isToday ? ' today' : '') +
                '" data-date="' + key + '">' + dn + star +
                '</button>';
      }
    }
    $('#calGrid').innerHTML = html;
  }

  function shiftMonth(delta) {
    const now = new Date();
    const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6;
    const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12;
    const cur = monthIndex(calCursor.getFullYear(), calCursor.getMonth());
    const next = cur + delta;
    if (next < minIdx || next > maxIdx) return;
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + delta, 1);
    renderCalendar();
  }

  $('#calPrev').addEventListener('click', function () { shiftMonth(-1); });
  $('#calNext').addEventListener('click', function () { shiftMonth(1); });
  $('#calToday').addEventListener('click', function () {
    calCursor = new Date();
    calCursor.setDate(1);
    $('#calJumpDate').value = todayKey();
    renderCalendar();
  });

  $('#calJumpDate').addEventListener('change', function () {
    const val = this.value;
    if (!val) return;
    const p = val.split('-');
    calCursor = new Date(p[0], p[1] - 1, 1);
    renderCalendar();
    openEventModal(val);
  });

  $('#calGrid').addEventListener('click', function (e) {
    const cell = e.target.closest('.cal-cell[data-date]');
    if (cell) openEventModal(cell.dataset.date);
  });

  let eventDateKey = null;
  let editingEventId = null;

  function openEventModal(key) {
    eventDateKey = key;
    editingEventId = null;
    const d = keyToDate(key);
    const week = '日一二三四五六'[d.getDay()];
    $('#eventDateTitle').textContent =
      d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 星期' + week;

    $('#eventForm').reset();
    $('#eventSubmit').textContent = '保存要事';
    $('#eventCancelEdit').hidden = true;

    renderEventList();
    openModal('#eventModal');
    setTimeout(function () { $('#evTitle').focus(); }, 80);
  }

  function renderEventList() {
    const wrap = $('#eventList');
    const list = events[eventDateKey] || [];
    if (!list.length) {
      wrap.innerHTML = '<div class="empty small">這天還沒有要事。</div>';
      return;
    }
    wrap.innerHTML = list.map(function (ev) {
      return '<div class="event-item" data-id="' + ev.id + '">' +
        (ev.time ? '<div class="ev-time">' + escapeHtml(ev.time) + '</div>' : '') +
        '<div class="ev-main">' +
          '<div class="ev-title">' + escapeHtml(ev.title) + '</div>' +
          (ev.content ? '<div class="ev-content">' + escapeHtml(ev.content) + '</div>' : '') +
        '</div>' +
        '<div class="ev-acts">' +
          '<button class="mini" data-act="edit">編</button>' +
          '<button class="mini del" data-act="del">×</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  $('#eventForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = $('#evTitle').value.trim();
    if (!title) { $('#evTitle').focus(); return; }
    const time = $('#evTime').value;
    const content = $('#evContent').value.trim();

    if (!events[eventDateKey]) events[eventDateKey] = [];

    if (editingEventId) {
      const ev = events[eventDateKey].find(function (x) { return x.id === editingEventId; });
      if (ev) { ev.title = title; ev.time = time; ev.content = content; }
    } else {
      events[eventDateKey].push({ id: uid(), title: title, time: time, content: content });
    }

    save('events');
    $('#eventForm').reset();
    editingEventId = null;
    $('#eventSubmit').textContent = '保存要事';
    $('#eventCancelEdit').hidden = true;
    renderEventList();
    renderCalendar();
    renderHome(); // 更新首頁的最近要事
    toast('已保存');
  });

  $('#eventCancelEdit').addEventListener('click', function () {
    editingEventId = null;
    $('#eventForm').reset();
    $('#eventSubmit').textContent = '保存要事';
    $('#eventCancelEdit').hidden = true;
    $('#evTitle').focus();
  });

  $('#eventList').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const item = e.target.closest('.event-item');
    if (!item) return;
    const id = item.dataset.id;
    const list = events[eventDateKey] || [];
    const ev = list.find(function (x) { return x.id === id; });
    if (!ev) return;

    if (btn.dataset.act === 'del') {
      events[eventDateKey] = list.filter(function (x) { return x.id !== id; });
      if (!events[eventDateKey].length) delete events[eventDateKey];
      save('events');
      if (editingEventId === id) {
        editingEventId = null;
        $('#eventForm').reset();
        $('#eventSubmit').textContent = '保存要事';
        $('#eventCancelEdit').hidden = true;
      }
      renderEventList();
      renderCalendar();
      renderHome(); // 更新首頁的最近要事
      toast('已刪除');
    } else if (btn.dataset.act === 'edit') {
      editingEventId = id;
      $('#evTitle').value = ev.title;
      $('#evTime').value = ev.time || '';
      $('#evContent').value = ev.content || '';
      $('#eventSubmit').textContent = '更新要事';
      $('#eventCancelEdit').hidden = false;
      $('#evTitle').focus();
    }
  });

  function pruneEvents() {
    const now = new Date();
    const minKey = dateKey(new Date(now.getFullYear(), now.getMonth() - 6, 1));
    const maxKey = dateKey(new Date(now.getFullYear(), now.getMonth() + 13, 0));
    let changed = false;
    Object.keys(events).forEach(function (k) {
      if (k < minKey || k > maxKey) { delete events[k]; changed = true; }
    });
    if (changed) save('events');
  }

  /* ═══════════════ 日記 ═══════════════ */
  let diaryFilterDate = '';

  function renderDiaries() {
    let list = diaries.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    if (diaryFilterDate) {
      list = list.filter(function (d) {
        return dateKey(new Date(d.createdAt)) === diaryFilterDate;
      });
    }

    const wrap = $('#diaryList');
    if (!list.length) {
      wrap.innerHTML = '<div class="empty">' +
        (diaryFilterDate ? '這天還沒有日記。' : '還沒有日記，從上面開始寫第一篇吧。') +
        '</div>';
      return;
    }

    wrap.innerHTML = list.map(function (d) {
      const dt = new Date(d.createdAt);
      return '<div class="diary-card" data-id="' + d.id + '">' +
        '<div class="diary-meta">' +
          '<span>' + fmtDateTime(dt) + '</span>' +
          (d.weather ? '<span class="tag">' + escapeHtml(d.weather) + '</span>' : '') +
          (d.mood ? '<span class="tag">' + escapeHtml(d.mood) + '</span>' : '') +
        '</div>' +
        '<div class="diary-title">' + escapeHtml(d.title) + '</div>' +
        '<div class="diary-preview">' + escapeHtml(d.content) + '</div>' +
      '</div>';
    }).join('');
  }

  $('#diaryList').addEventListener('click', function (e) {
    const card = e.target.closest('.diary-card[data-id]');
    if (card) openDiaryModal(card.dataset.id);
  });

  function openDiaryModal(id) {
    const d = diaries.find(function (x) { return x.id === id; });
    if (!d) return;
    const dt = new Date(d.createdAt);
    $('#diaryModalTitle').textContent = d.title;
    $('#diaryModalMeta').innerHTML =
      fmtDateTime(dt) +
      (d.weather ? ' · ' + escapeHtml(d.weather) : '') +
      (d.mood ? ' · ' + escapeHtml(d.mood) : '');
    $('#diaryModalBody').textContent = d.content;
    openModal('#diaryModal');
  }

  $('#diarySave').addEventListener('click', function () {
    const title = $('#diaryTitle').value.trim();
    const content = $('#diaryContent').value.trim();
    if (!title) { toast('請填寫標題'); $('#diaryTitle').focus(); return; }
    if (!content) { toast('請填寫內文'); $('#diaryContent').focus(); return; }

    diaries.push({
      id: uid(),
      title: title,
      weather: $('#diaryWeather').value,
      mood: $('#diaryMood').value,
      content: content,
      createdAt: Date.now()
    });
    save('diaries');

    $('#diaryTitle').value = '';
    $('#diaryContent').value = '';
    $('#diaryWeather').value = '';
    $('#diaryMood').value = '';

    renderDiaries();
    renderHome();
    toast('已保存，日記永久保留且不可修改');
  });

  $('#diaryDatePickerBtn').addEventListener('click', function () {
    $('#diaryDateInput').value = diaryFilterDate || todayKey();
    openModal('#diaryDateModal');
  });

  $('#diaryDateConfirm').addEventListener('click', function () {
    const val = $('#diaryDateInput').value;
    if (val) {
      diaryFilterDate = val;
      $('#diaryDatePickerBtn').textContent = '日記日期：' + val;
      $('#diaryClearFilter').hidden = false;
      renderDiaries();
    }
    closeModal('#diaryDateModal');
  });

  $('#diaryClearFilter').addEventListener('click', function () {
    diaryFilterDate = '';
    $('#diaryDatePickerBtn').textContent = '全部日記（點擊選擇日期）';
    $('#diaryClearFilter').hidden = true;
    renderDiaries();
  });

  /* ═══════════════ 筆記本 ═══════════════ */
  function renderNotes() {
    const grid = $('#notesGrid');
    if (!notes.length) {
      grid.innerHTML = ''; 
      return;
    }
    grid.innerHTML = notes.map(function (n) {
      const excerpt = (n.content || '').replace(/\s+/g, ' ').slice(0, 70);
      return '<button class="card note" data-id="' + n.id + '">' +
        (n.image ? '<div class="note-thumb" style="background-image:url(\'' + n.image + '\')"></div>' : '') +
        '<div class="note-h">' + escapeHtml(n.title || '無標題') + '</div>' +
        '<div class="note-b">' + escapeHtml(excerpt) + '</div>' +
        '<div class="note-d">' + escapeHtml(n.date || '') + '</div>' +
      '</button>';
    }).join('');
  }

  let editingNoteId = null;
  let noteImageData = null;

  function updateNoteImagePreview() {
    const wrap = $('#noteImgWrap');
    if (noteImageData) {
      $('#noteImgPreview').src = noteImageData;
      wrap.hidden = false;
    } else {
      $('#noteImgPreview').removeAttribute('src');
      wrap.hidden = true;
    }
  }

  function openNoteModal(id) {
    editingNoteId = id || null;
    const n = id ? notes.find(function (x) { return x.id === id; }) : null;

    $('#noteModalTitle').textContent = n ? '編輯筆記' : '新增筆記';
    $('#noteTitle').value = n ? (n.title || '') : '';
    $('#noteDate').value = n ? (n.date || todayKey()) : todayKey();
    $('#noteContent').value = n ? (n.content || '') : '';
    noteImageData = n ? (n.image || null) : null;
    updateNoteImagePreview();
    $('#noteDelete').style.display = n ? '' : 'none';

    openModal('#noteModal');
    setTimeout(function () { $('#noteTitle').focus(); }, 80);
  }

  $('#noteAdd').addEventListener('click', function () { openNoteModal(null); });

  $('#notesGrid').addEventListener('click', function (e) {
    const card = e.target.closest('.note[data-id]');
    if (card) openNoteModal(card.dataset.id);
  });

  $('#noteImgPick').addEventListener('click', function () { $('#noteImgInput').click(); });

  $('#noteImgInput').addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    toast('正在處理圖片…');
    compressImage(file, 1200, 0.75).then(function (data) {
      noteImageData = data;
      updateNoteImagePreview();
    }).catch(function () {
      toast('圖片處理失敗');
    });
  });

  $('#noteImgClear').addEventListener('click', function () {
    noteImageData = null;
    updateNoteImagePreview();
  });

  $('#noteSave').addEventListener('click', function () {
    const title = $('#noteTitle').value.trim();
    const content = $('#noteContent').value.trim();
    const date = $('#noteDate').value;

    if (!title && !content && !noteImageData) {
      toast('筆記還是空的'); return;
    }

    if (editingNoteId) {
      const n = notes.find(function (x) { return x.id === editingNoteId; });
      if (n) {
        n.title = title;
        n.content = content;
        n.date = date;
        n.image = noteImageData;
      }
    } else {
      notes.unshift({
        id: uid(),
        title: title,
        content: content,
        date: date,
        image: noteImageData
      });
    }

    save('notes');
    renderNotes();
    closeModal('#noteModal');
    toast('已保存');
  });

  $('#noteDelete').addEventListener('click', function () {
    if (!editingNoteId) return;
    notes = notes.filter(function (x) { return x.id !== editingNoteId; });
    save('notes');
    renderNotes();
    closeModal('#noteModal');
    toast('已刪除筆記');
  });

  /* ═══════════════ 照片庫 ═══════════════ */
  function renderPhotos() {
    const grid = $('#photoGrid');
    if (!photos.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">還沒有照片，點「添加照片」上傳。</div>';
      return;
    }
    grid.innerHTML = photos.map(function (p) {
      return '<button class="photo" data-id="' + p.id + '">' +
        '<img src="' + p.src + '" alt="">' +
      '</button>';
    }).join('');
  }

  $('#photoAdd').addEventListener('click', function () { $('#photoInput').click(); });

  $('#photoInput').addEventListener('change', function (e) {
    const files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    toast('正在處理 ' + files.length + ' 張圖片…');
    let done = 0;
    const tasks = files.map(function (f) {
      return compressImage(f, 1600, 0.72).then(function (src) {
        photos.push({ id: uid(), src: src, title: '' });
        done++;
      }).catch(function () {});
    });

    Promise.all(tasks).then(function () {
      save('photos');
      renderPhotos();
      toast(done > 0 ? '已添加 ' + done + ' 張照片' : '圖片處理失敗');
    });
  });

  $('#photoGrid').addEventListener('click', function (e) {
    const btn = e.target.closest('.photo[data-id]');
    if (btn) openLightbox(btn.dataset.id);
  });

  let lightboxId = null;

  function openLightbox(id) {
    const p = photos.find(function (x) { return x.id === id; });
    if (!p) return;
    lightboxId = id;
    $('#lightboxImg').src = p.src;
    $('#lightboxCaption').value = p.title || '';
    $('#lightbox').classList.add('open');
    document.body.classList.add('lock');
  }

  function closeLightbox() {
    $('#lightbox').classList.remove('open');
    lightboxId = null;
    if (!document.querySelector('.modal.open, .lightbox.open')) {
      document.body.classList.remove('lock');
    }
  }

  $('#lightboxClose').addEventListener('click', closeLightbox);

  $('#lightbox').addEventListener('click', function (e) {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  $('#lightboxCaption').addEventListener('input', function () {
    if (!lightboxId) return;
    const p = photos.find(function (x) { return x.id === lightboxId; });
    if (p) { p.title = $('#lightboxCaption').value; save('photos'); }
  });

  $('#lightboxDel').addEventListener('click', function () {
    if (!lightboxId) return;
    photos = photos.filter(function (x) { return x.id !== lightboxId; });
    save('photos');
    renderPhotos();
    closeLightbox();
    toast('已刪除照片');
  });

  /* ═══════════════ 番茄鐘 ═══════════════ */
  let pomoInterval = null;
  let pomoSeconds = 25 * 60;
  let pomoRunning = false;

  const pomoTime = $('#pomoTime');
  const pomoPanel = $('#pomoPanel');
  const pomoFab = $('#pomoFab');

  function updatePomoDisplay() {
    const m = Math.floor(pomoSeconds / 60);
    const s = pomoSeconds % 60;
    pomoTime.textContent = pad(m) + ':' + pad(s);
  }

  pomoFab.addEventListener('click', function () {
    pomoPanel.classList.toggle('open');
  });

  $('#pomoSetBtn').addEventListener('click', function () {
    let custom = parseInt($('#pomoCustom').value, 10);
    let mins = 25;
    
    if (custom && custom > 0 && custom <= 180) {
      mins = custom;
      $('#pomoPreset').value = '';
    } else {
      mins = parseInt($('#pomoPreset').value, 10);
      if (!mins) mins = 25;
    }
    
    pomoSeconds = mins * 60;
    clearInterval(pomoInterval);
    pomoRunning = false;
    $('#pomoStart').textContent = '開始';
    updatePomoDisplay();
    $('#pomoCustom').value = '';
  });

  $('#pomoPreset').addEventListener('change', function () {
    if (this.value) {
      pomoSeconds = parseInt(this.value, 10) * 60;
      clearInterval(pomoInterval);
      pomoRunning = false;
      $('#pomoStart').textContent = '開始';
      updatePomoDisplay();
      $('#pomoCustom').value = '';
    }
  });

  function playBell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playNote(880, ctx.currentTime, 0.4);
      playNote(1046.50, ctx.currentTime + 0.15, 0.6);
      playNote(880, ctx.currentTime + 0.45, 0.4);
      playNote(1046.50, ctx.currentTime + 0.6, 0.8);
    } catch (e) {
      console.log('無法播放鈴聲');
    }
  }

  $('#pomoStart').addEventListener('click', function () {
    if (pomoRunning) {
      clearInterval(pomoInterval);
      pomoRunning = false;
      this.textContent = '繼續';
    } else {
      pomoRunning = true;
      this.textContent = '暫停';
      pomoInterval = setInterval(function () {
        pomoSeconds--;
        updatePomoDisplay();
        if (pomoSeconds <= 0) {
          clearInterval(pomoInterval);
          pomoRunning = false;
          $('#pomoStart').textContent = '開始';
          pomoSeconds = 25 * 60;
          updatePomoDisplay();
          playBell();
          toast('時間到！休息一下吧 ⏰');
        }
      }, 1000);
    }
  });

  $('#pomoReset').addEventListener('click', function () {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoSeconds = 25 * 60;
    updatePomoDisplay();
    $('#pomoStart').textContent = '開始';
    $('#pomoPreset').value = '25';
    $('#pomoCustom').value = '';
  });

  updatePomoDisplay();

  /* ═══════════════ 設定面板與備份 ═══════════════ */
  const settings = $('#settings');
  const gearBtn = $('#gearBtn');

  function openSettings() {
    settings.classList.add('open');
    gearBtn.classList.add('open');
  }
  function closeSettings() {
    settings.classList.remove('open');
    gearBtn.classList.remove('open');
  }

  gearBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (settings.classList.contains('open')) closeSettings();
    else openSettings();
  });

  document.addEventListener('click', function (e) {
    if (settings.classList.contains('open') &&
        !settings.contains(e.target) && !gearBtn.contains(e.target)) {
      closeSettings();
    }
  });

  $('#lumRange').addEventListener('input', function () {
    state.lum = parseFloat(this.value);
    applyTheme();
    savePrefs();
  });

  $('#pickBg').addEventListener('click', function () { $('#bgFileInput').click(); });

  $('#clearBg').addEventListener('click', function () {
    state.bg = null;
    applyTheme();
    savePrefs();
    toast('已移除背景圖片');
  });

  $('#bgFileInput').addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    toast('正在處理背景圖片…');
    compressImage(file, 1600, 0.8).then(function (data) {
      state.bg = data;
      applyTheme();
      savePrefs();
      toast('背景已套用');
    }).catch(function () {
      toast('圖片處理失敗');
    });
  });

  $('#themeToggle').addEventListener('click', function () {
    state.lum = state.lum > 50 ? 15 : 85;
    applyTheme();
    savePrefs();
    toast(state.lum > 50 ? '已切換為淺色模式' : '已切換為深色模式');
  });

  $('#exportBtn').addEventListener('click', function () {
    const data = {
      todos: todos, events: events, diaries: diaries, notes: notes, photos: photos,
      goals: goals, bookmarks: bookmarks, ledger: ledger, countdowns: countdowns
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_space_backup_' + todayKey() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('備份檔案已下載');
  });

  $('#importBtn').addEventListener('click', function () {
    $('#importFileInput').click();
  });

  $('#importFileInput').addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.todos) todos = data.todos;
        if (data.events) events = data.events;
        if (data.diaries) diaries = data.diaries;
        if (data.notes) notes = data.notes;
        if (data.photos) photos = data.photos;
        if (data.goals) goals = data.goals;
        if (data.bookmarks) bookmarks = data.bookmarks;
        if (data.ledger) ledger = data.ledger;
        else if (data.expenses) ledger = data.expenses.map(e => ({ ...e, type: 'expense' }));
        if (data.countdowns) countdowns = data.countdowns;

        ['todos', 'events', 'diaries', 'notes', 'photos', 'goals', 'bookmarks', 'ledger', 'countdowns'].forEach(save);

        renderTodos();
        renderCalendar();
        renderDiaries();
        renderNotes();
        renderPhotos();
        renderGoals();
        renderBookmarks();
        renderLedger();
        renderHome();

        toast('備份匯入成功！');
        closeSettings();
      } catch (err) {
        toast('備份檔案解析失敗');
      }
    };
    reader.readAsText(file);
  });

  $$('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(btn.dataset.close);
    });
  });

  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m) closeModal('#' + m.id);
    });
  });

  /* ═══════════════ 初始化 ═══════════════ */
  if (!STORAGE_OK) {
    setTimeout(function () {
      toast('⚠️ 瀏覽器儲存空間不可用，資料將不會保留');
    }, 900);
  }

  loadPrefs();
  applyTheme();
  pruneEvents();
  pruneDone();

  renderTodos();
  renderCalendar();
  renderDiaries();
  renderNotes();
  renderPhotos();
  renderLedger();
  renderHome();
  showView('home');

})();