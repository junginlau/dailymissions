(function () {
  'use strict';

  // ==========================================
  // 1. 工具函式與變數宣告
  // ==========================================
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return dateKey(new Date()); }
  function keyToDate(key) { const p = key.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function fmtDateTime(d) { return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function isNonEmptyString(v) { return typeof v === 'string' && v.length > 0; }
  function isArray(v) { return Array.isArray(v); }

  const STORAGE_OK = (function () {
    try { const k = '__test__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; }
  })();

  const LS = {
    get(k, d) { if (!STORAGE_OK) return d; try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { if (!STORAGE_OK) return false; try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    remove(k) { if (!STORAGE_OK) return; try { localStorage.removeItem(k); } catch (e) {} }
  };

  const IDB = (function () {
    const DB_NAME = 'my_space_db'; const DB_VERSION = 1; const STORES = ['photos', 'audio']; let dbPromise = null;
    function open() {
      if (dbPromise) return dbPromise;
      dbPromise = new Promise(function (resolve, reject) {
        if (!('indexedDB' in window)) { reject(new Error('no idb')); return; }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = function (e) { const db = e.target.result; STORES.forEach(function (name) { if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' }); }); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
      return dbPromise;
    }
    function tx(store, mode) { return open().then(function (db) { return db.transaction(store, mode).objectStore(store); }); }
    return {
      available() { return 'indexedDB' in window; },
      put(store, obj) { return tx(store, 'readwrite').then(function (s) { return new Promise(function (resolve, reject) { const r = s.put(obj); r.onsuccess = function () { resolve(true); }; r.onerror = function () { reject(r.error); }; }); }); },
      get(store, id) { return tx(store, 'readonly').then(function (s) { return new Promise(function (resolve, reject) { const r = s.get(id); r.onsuccess = function () { resolve(r.result || null); }; r.onerror = function () { reject(r.error); }; }); }); },
      getAll(store) { return tx(store, 'readonly').then(function (s) { return new Promise(function (resolve, reject) { const r = s.getAll(); r.onsuccess = function () { resolve(r.result || []); }; r.onerror = function () { reject(r.error); }; }); }); },
      del(store, id) { return tx(store, 'readwrite').then(function (s) { return new Promise(function (resolve, reject) { const r = s.delete(id); r.onsuccess = function () { resolve(true); }; r.onerror = function () { reject(r.error); }; }); }); }
    };
  })();

  let toastTimer = null;
  function toast(msg) { let el = document.querySelector('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); } el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2300); }

  function compressImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) { reject(new Error('not image')); return; }
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
          let w = img.naturalWidth || img.width; let h = img.naturalHeight || img.height;
          if (w > maxDim || h > maxDim) { const r = Math.min(maxDim / w, maxDim / h); w = Math.round(w * r); h = Math.round(h * r); }
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const ctx = c.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject; img.src = ev.target.result;
      };
      reader.onerror = reject; reader.readAsDataURL(file);
    });
  }

  function openModal(sel) { const m = $(sel); if (!m) return; m.classList.add('open'); document.body.classList.add('lock'); }
  function closeModal(sel) { const m = $(sel); if (m) m.classList.remove('open'); if (!document.querySelector('.modal.open, .lightbox.open')) document.body.classList.remove('lock'); }

  let confirmActive = false;
  function customConfirm(title, message, okText, cancelText, danger) {
    return new Promise(function (resolve) {
      if (confirmActive) { resolve(false); return; }
      const modal = $('#confirmModal');
      if (!modal) { resolve(window.confirm(title + '\n' + (message || ''))); return; }
      confirmActive = true;
      $('#confirmTitle').textContent = title || '確定嗎？';
      $('#confirmSub').textContent = message || '';
      const okBtn = $('#confirmOk'); const cancelBtn = $('#confirmCancel');
      okBtn.textContent = okText || '確定'; cancelBtn.textContent = cancelText || '取消';
      if (danger) { okBtn.style.background = '#e5484d'; okBtn.style.borderColor = 'transparent'; okBtn.style.color = '#fff'; } else { okBtn.style.background = ''; okBtn.style.borderColor = ''; okBtn.style.color = ''; }
      const closeTargets = modal.querySelectorAll('.x-btn, [data-close="#confirmModal"]');
      function cleanup() {
        confirmActive = false; okBtn.removeEventListener('click', onOk); cancelBtn.removeEventListener('click', onCancel); modal.removeEventListener('click', onBackdrop);
        closeTargets.forEach(function (b) { b.removeEventListener('click', onCancel); });
      }
      function onOk() { cleanup(); closeModal('#confirmModal'); resolve(true); }
      function onCancel() { cleanup(); closeModal('#confirmModal'); resolve(false); }
      function onBackdrop(e) { if (e.target === modal) onCancel(); }
      okBtn.addEventListener('click', onOk); cancelBtn.addEventListener('click', onCancel); modal.addEventListener('click', onBackdrop);
      closeTargets.forEach(function (b) { b.addEventListener('click', onCancel); });
      openModal('#confirmModal');
    });
  }

  // ==========================================
  // 2. 語言切換與初始化
  // ==========================================
  let currentLang = LS.get('userLang', 'zh-TW');

  function applyLanguage(lang) {
    if (!window.I18N || !window.I18N[lang]) return;
    const dict = window.I18N[lang];
    
    // 1. 替換所有帶有 data-i18n 的靜態元素
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.dataset.i18n;
      if (dict[key]) {
        if (key === 'landingDesc' || key === 'landingPrivacy' || key === 'welcomeDesc') {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 2. 替換所有帶有 data-i18n-placeholder 的輸入框
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key]) el.placeholder = dict[key];
    });

    // 3. 更新切換按鈕文字（動態顯示下一種語言）
    const nextLangMap = { 'zh-TW': 'EN', 'en': '日本語', 'ja': '中文' };
    const switchBtn = $('#langSwitchBtn');
    if (switchBtn) {
      switchBtn.textContent = nextLangMap[lang] || 'EN';
    }
    const landingLangBtn = $('#landingLangBtn');
    if (landingLangBtn) {
      landingLangBtn.textContent = nextLangMap[lang] || 'EN';
    }

    // 4. 重新渲染動態內容（讓首頁卡片、清單立刻切換語言）
    updateClock();
    initWeather();
    updateQuote(); // [NEW] 補上名言重繪
    if (typeof renderHome === 'function') renderHome();
    if (typeof renderTodos === 'function') renderTodos();
    if (typeof renderCalendar === 'function') renderCalendar();
    if (typeof renderDiaries === 'function') renderDiaries();
    if (typeof renderNotes === 'function') renderNotes();
    if (typeof renderPhotos === 'function') renderPhotos();
    if (typeof renderGoals === 'function') renderGoals();
    if (typeof renderBookmarks === 'function') renderBookmarks();
    if (typeof renderLedger === 'function') renderLedger();

    // 5. 儲存語言設定
    LS.set('userLang', lang);
  }

  // ==========================================
  // 3. 主題與設定
  // ==========================================
  const root = document.documentElement; const bgLayer = $('#bgLayer'); const DEFAULT_LUM = 55; const state = { lum: DEFAULT_LUM, bg: null };
  function getCookie(name) { const m = document.cookie.match('(?:^|; )' + name + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : null; }
  function setCookie(name, value) { try { document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=31536000; SameSite=Lax'; return getCookie(name) !== null; } catch (e) { return false; } }
  function delCookie(name) { document.cookie = name + '=; path=/; max-age=0; SameSite=Lax'; }

  function loadPrefs() {
    let lum = NaN; try { const v = localStorage.getItem('lum'); if (v !== null) lum = parseFloat(v); } catch (e) {}
    if (isNaN(lum)) lum = parseFloat(getCookie('lum')); if (!isNaN(lum)) state.lum = Math.min(100, Math.max(0, lum)); else state.lum = DEFAULT_LUM;
    let bg = null; try { bg = localStorage.getItem('bg'); } catch (e) {} if (!bg) bg = getCookie('bg'); state.bg = bg || null;
  }
  function savePrefs() {
    setCookie('lum', String(state.lum)); try { localStorage.setItem('lum', String(state.lum)); } catch (e) {}
    if (state.bg) { const ok = setCookie('bg', state.bg); if (!ok) { delCookie('bg'); try { localStorage.setItem('bg', state.bg); } catch (e) {} } else { try { localStorage.removeItem('bg'); } catch (e) {} } } else { delCookie('bg'); try { localStorage.removeItem('bg'); } catch (e) {} }
  }
  function applyTheme() {
    const b = state.lum / 100; const bgL = 12 + b * 76; let txL;
    if (bgL > 50) txL = Math.max(8, 100 - bgL - 32); else txL = Math.min(94, 100 - bgL + 32);
    if (state.bg) { bgLayer.style.backgroundImage = 'url("' + state.bg + '")'; bgLayer.style.backgroundColor = '#000'; bgLayer.style.filter = 'brightness(' + (0.35 + b * 1.0).toFixed(2) + ')'; } else { bgLayer.style.backgroundImage = 'none'; bgLayer.style.filter = 'none'; bgLayer.style.backgroundColor = 'hsl(220, 14%, ' + bgL.toFixed(1) + '%)'; }
    const light = bgL > 50;
    root.style.setProperty('--fg', 'hsl(220, 12%, ' + txL.toFixed(1) + '%)'); root.style.setProperty('--fg-dim', 'hsla(220, 10%, ' + txL.toFixed(1) + '%, .62)');
    root.style.setProperty('--panel-bg-solid', light ? 'rgba(245, 247, 250, 0.92)' : 'rgba(25, 28, 36, 0.92)'); root.style.setProperty('--panel', light ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.09)');
    root.style.setProperty('--panel-border', light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.15)'); root.style.setProperty('--nav-bg', light ? 'rgba(255,255,255,.62)' : 'rgba(18,20,26,.55)');
    root.style.setProperty('--hover', light ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.10)'); root.style.setProperty('--ink-inv', light ? '#ffffff' : '#111318');
    document.documentElement.style.colorScheme = light ? 'light' : 'dark';
    const t = txL.toFixed(1); root.style.setProperty('--scroll-thumb', 'hsla(220, 10%, ' + t + '%, .30)'); root.style.setProperty('--scroll-thumb-hover', 'hsla(220, 10%, ' + t + '%, .52)');
    $('#lumRange').value = state.lum; $('#lumVal').textContent = Math.round(state.lum);
  }

  // ==========================================
  // 4. 資料初始化
  // ==========================================
  const WEEKDAYS = [{ key: 'mon', label: '星期一' }, { key: 'tue', label: '星期二' }, { key: 'wed', label: '星期三' }, { key: 'thu', label: '星期四' }, { key: 'fri', label: '星期五' }, { key: 'sat', label: '星期六' }, { key: 'sun', label: '星期日' }];
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  function emptyTodoData() { return { tags: [], schedule: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }, done: {} }; }
  function migrateTodos(raw) {
    if (!raw) return emptyTodoData();
    if (raw.tags && raw.schedule) { WEEKDAYS.forEach(function (w) { if (!Array.isArray(raw.schedule[w.key])) raw.schedule[w.key] = []; }); if (!raw.done || typeof raw.done !== 'object') raw.done = {}; return raw; }
    const data = emptyTodoData(); const seen = {};
    WEEKDAYS.forEach(function (w) { const list = raw[w.key]; if (!Array.isArray(list)) return; list.forEach(function (item) { const name = (item && item.text || '').trim(); if (!name) return; if (!seen[name]) { seen[name] = { id: uid(), name: name }; data.tags.push(seen[name]); } data.schedule[w.key].push(seen[name].id); }); });
    return data;
  }

  let todos = migrateTodos(LS.get('todos', null));
  let events = LS.get('events', {});
  let diaries = LS.get('diaries', []);
  let notes = LS.get('notes', []);
  let goals = LS.get('goals', []);
  let bookmarks = LS.get('bookmarks', []);
  let countdowns = LS.get('countdowns', []);
  let ledgerCategories = LS.get('ledgerCategories', ['飲食', '交通', '購物', '娛樂', '薪資', '投資', '其他']);

  let photoMeta = LS.get('photoMeta', null);
  const legacyPhotos = LS.get('photos', null);
  let needsLegacyPhotoMigration = false;
  if (!photoMeta && Array.isArray(legacyPhotos) && legacyPhotos.length) { needsLegacyPhotoMigration = true; photoMeta = legacyPhotos.map(function (p) { return { id: p.id, title: p.title || '' }; }); }
  if (!Array.isArray(photoMeta)) photoMeta = [];

  const DEFAULT_RATES = { TWD: 1, USD: 32, JPY: 0.22, HKD: 4.1, EUR: 35, GBP: 41, CNY: 4.4 };
  let exchangeRates = Object.assign({}, DEFAULT_RATES);
  let exchangeRatesUpdatedAt = 0;
  const photoCache = {};
  const RATE_MIN_INTERVAL = 60 * 60 * 1000;
  (function loadCachedRates() {
    const cached = LS.get('exchangeRates', null);
    if (cached && cached.rates && cached.updatedAt) {
      exchangeRates = Object.assign({}, DEFAULT_RATES, cached.rates);
      exchangeRatesUpdatedAt = cached.updatedAt;
    }
  })();

  let mainCurrency = LS.get('mainCurrency', 'HKD');
  const currencySymbols = { TWD: 'NT$', USD: '$', JPY: '¥', HKD: 'HK$', EUR: '€', GBP: '£', CNY: '¥' };

  let ledger = LS.get('ledger', null);
  if (!ledger) { const oldExp = LS.get('expenses', []); if (oldExp.length) { ledger = oldExp.map(e => ({ ...e, type: 'expense' })); LS.set('ledger', ledger); LS.remove('expenses'); } else { ledger = []; } }

  if (!events || typeof events !== 'object' || Array.isArray(events)) events = {};
  if (!Array.isArray(diaries)) diaries = [];
  if (!Array.isArray(notes)) notes = [];
  if (!Array.isArray(goals)) goals = [];
  if (!Array.isArray(bookmarks)) bookmarks = [];
  if (!Array.isArray(ledger)) ledger = [];
  if (!Array.isArray(countdowns)) countdowns = [];

  function save(key) {
    if (key === 'photoMeta') { const ok = LS.set('photoMeta', photoMeta); if (!ok) toast(window.I18N[currentLang].photoMetaFail); return ok; }
    const map = { todos: todos, events: events, diaries: diaries, notes: notes, goals: goals, bookmarks: bookmarks, ledger: ledger, countdowns: countdowns, ledgerCategories: ledgerCategories };
    const ok = LS.set(key, map[key]); if (!ok) toast(window.I18N[currentLang].storageFail); return ok;
  }

  function migrateLegacyPhotos() {
    if (!needsLegacyPhotoMigration || !IDB.available()) { needsLegacyPhotoMigration = false; return Promise.resolve(); }
    return Promise.all(legacyPhotos.map(function (p) { return IDB.put('photos', { id: p.id, src: p.src }).catch(function () {}); })).then(function () { LS.remove('photos'); LS.set('photoMeta', photoMeta); needsLegacyPhotoMigration = false; });
  }

  function dayKeyOf(d) { return DAY_KEYS[d.getDay()]; }
  function dayLabelOf(key) { const map = window.I18N[currentLang].weekdaysFull || {}; return map[key] || key; }
  function pruneDone() { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60); const minKey = dateKey(cutoff); let changed = false; Object.keys(todos.done || {}).forEach(function (k) { if (k < minKey) { delete todos.done[k]; changed = true; } }); if (changed) save('todos'); }

  // ==========================================
  // 5. 視圖切換與導覽列
  // ==========================================
  const views = $$('.view'); const navBtns = $$('.nav-btn'); const mobileNavBtns = $$('.mobile-nav-btn'); const mobileMoreMenu = $('#mobileMoreMenu');
  let currentView = 'home';

  function showView(name) {
    currentView = name;
    views.forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + name); });
    navBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.view === name); });
    mobileNavBtns.forEach(function (b) { if (name === 'notes' || name === 'photos' || name === 'ledger' || name === 'about') { b.classList.toggle('active', b.dataset.view === 'more'); } else { b.classList.toggle('active', b.dataset.view === name); } });
    if (name !== 'notes' && name !== 'photos' && name !== 'ledger' && name !== 'about') mobileMoreMenu.classList.remove('open');
    if (name !== 'home' && cdInterval) { clearInterval(cdInterval); cdInterval = null; }
    if (name === 'todo') checkUnfinishedTasks();
    if (name === 'calendar') renderCalendar();
    if (name === 'home') renderHome();
    if (name === 'diary') renderDiaries();
    if (name === 'ledger') renderLedger();
    if (name === 'photos') renderPhotos();
    if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('#navLinks').addEventListener('click', function (e) { const btn = e.target.closest('.nav-btn'); if (btn) showView(btn.dataset.view); });

  const navMoreBtn = $('#navMoreBtn'); const navMoreMenu = $('#navMoreMenu');
  if (navMoreBtn && navMoreMenu) {
    navMoreBtn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      const isOpen = navMoreMenu.style.display === 'flex';
      if (isOpen) { navMoreMenu.style.display = 'none'; } else {
        navMoreMenu.style.display = 'flex'; navMoreMenu.style.position = 'fixed'; navMoreMenu.style.top = '60px'; navMoreMenu.style.left = '20px';
        navMoreMenu.style.flexDirection = 'column'; navMoreMenu.style.background = 'var(--panel-bg-solid)'; navMoreMenu.style.border = '1px solid var(--panel-border)';
        navMoreMenu.style.borderRadius = '12px'; navMoreMenu.style.padding = '8px'; navMoreMenu.style.zIndex = '99999'; navMoreMenu.style.boxShadow = '0 10px 30px rgba(0,0,0,.3)'; navMoreMenu.style.gap = '4px';
      }
    });
    navMoreMenu.addEventListener('click', function (e) { const btn = e.target.closest('button'); if (btn) { e.stopPropagation(); showView(btn.dataset.view); navMoreMenu.style.display = 'none'; } });
    document.addEventListener('click', function (e) { if (navMoreMenu.style.display === 'flex' && !navMoreMenu.contains(e.target) && e.target !== navMoreBtn) navMoreMenu.style.display = 'none'; });
  }

  mobileNavBtns.forEach(function (btn) { btn.addEventListener('click', function () { const view = this.dataset.view; if (view === 'more') { mobileMoreMenu.classList.toggle('open'); } else { showView(view); } }); });
  mobileMoreMenu.addEventListener('click', function (e) { const btn = e.target.closest('button'); if (btn) { showView(btn.dataset.view); mobileMoreMenu.classList.remove('open'); } });
  document.addEventListener('click', function (e) { if (mobileMoreMenu.classList.contains('open') && !mobileMoreMenu.contains(e.target) && !e.target.closest('.mobile-nav-btn[data-view="more"]')) mobileMoreMenu.classList.remove('open'); });
  
  $('#logoBtn').addEventListener('click', function () { showView('home'); closeSettings(); });
  $$('[data-go]').forEach(function (el) { el.addEventListener('click', function () { showView(el.dataset.go); }); });

  // ==========================================
  // 6. 搜尋與快捷鍵
  // ==========================================
  function doSearch(raw) {
    const q = String(raw || '').trim(); if (!q) return;
    if (/^https?:\/\//i.test(q)) { window.open(q, '_blank', 'noopener'); return; }
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q) && !/\s/.test(q)) { window.open('https://' + q, '_blank', 'noopener'); return; }
    const engine = $('#searchEngine').value; let url = '';
    if (engine === 'google') url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    else if (engine === 'youtube') url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
    window.open(url, '_blank', 'noopener');
  }
  $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); doSearch($('#searchInput').value); $('#searchInput').value = ''; $('#searchInput').blur(); });

  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // 1. Esc 關閉所有彈窗與面板
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSettings();
      $('#pomoPanel').classList.remove('open');
      closePomoEditor(); // 確保關閉番茄鐘編輯器
      $$('.modal.open').forEach(function (m) { closeModal('#' + m.id); });
      if ($('#lightbox').classList.contains('open')) closeLightbox();
      return;
    }

    // 2. / 快速聚焦搜尋欄
    if (e.key === '/') {
      e.preventDefault();
      $('#searchInput').focus();
      return;
    }

    // 3. n 快速新增筆記
    if ((e.key === 'n' || e.key === 'N') && (currentView === 'home' || currentView === 'notes')) {
      e.preventDefault();
      openNoteModal(null);
      return;
    }

    // 4. 數字鍵 1-6 切換分頁
    if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
      e.preventDefault();
      const views = { '1': 'home', '2': 'todo', '3': 'calendar', '4': 'diary', '5': 'notes', '6': 'ledger' };
      showView(views[e.key]);
      return;
    }
  });

  const copyrightEl = document.getElementById('copyrightYear');
  if (copyrightEl) copyrightEl.textContent = new Date().getFullYear();

  // ==========================================
  // 7. 首頁 (時鐘、天氣、名言、統計、目標、書籤)
  // ==========================================
  function updateClock() {
    const now = new Date();
    let timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes());
    if (window.innerWidth > 768) timeStr += ':' + pad(now.getSeconds());
    
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const days = dict.weekdays || ['日','一','二','三','四','五','六'];
    let dateStr;
    if (currentLang === 'en') {
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dateStr = monthNames[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear() + ' · ' + days[now.getDay()];
    } else if (currentLang === 'ja') {
      const monthNamesJa = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
      dateStr = now.getFullYear() + '年 ' + monthNamesJa[now.getMonth()] + now.getDate() + '日 (' + days[now.getDay()] + ')';
    } else {
      dateStr = now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日 · 星期' + days[now.getDay()];
    }
    $('#clockTime').textContent = timeStr;
    $('#clockDate').textContent = dateStr;
  }
  setInterval(updateClock, 1000); updateClock(); window.addEventListener('resize', updateClock);

  function initWeather() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const weatherInfo = $('#weatherInfo');

    function fetchWeather(lat, lon) {
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true')
        .then(r => r.json())
        .then(data => {
          const w = data.current_weather; const code = w.weathercode; let icon = '⛅';
          if (code === 0) icon = '☀️'; else if (code === 1 || code === 2) icon = '🌤️'; else if (code === 3) icon = '☁️'; else if (code >= 51 && code <= 67) icon = '🌧️'; else if (code >= 71 && code <= 77) icon = '❄️'; else if (code >= 80 && code <= 82) icon = '🌦️'; else if (code >= 95) icon = '⛈️';
          weatherInfo.innerHTML = '<span class="weather-icon">' + icon + '</span> ' + w.temperature + '°C · ' + dict.weatherWind + ' ' + w.windspeed + ' km/h';
        }).catch(() => {
          weatherInfo.innerHTML = '⛅ ' + dict.weatherFail;
        });
    }

    function fallbackIP() {
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
          if (data && data.latitude && data.longitude) {
            fetchWeather(data.latitude, data.longitude);
          } else {
            weatherInfo.innerHTML = '⛅ ' + dict.weatherNoGeo;
          }
        }).catch(() => {
          weatherInfo.innerHTML = '⛅ ' + dict.weatherFail;
        });
    }

    if (!navigator.geolocation) { fallbackIP(); return; }
    navigator.geolocation.getCurrentPosition(
      function (pos) { fetchWeather(pos.coords.latitude, pos.coords.longitude); },
      function () { fallbackIP(); },
      { timeout: 5000 }
    );
  }
  initWeather();

  const QUOTES = {
    'zh-TW': ['慢慢來，比較快。', '今天所做的事，決定明天的你。', '不要因為走得太遠，而忘記為什麼出發。', '專注當下，一切都是最好的安排。', '你不需要很厲害才能開始，但你需要開始才會很厲害。', '把每一天當作新的開始。', '千里之行，始於足下。'],
    'en': ['Slow is smooth, smooth is fast.', 'What you do today determines who you are tomorrow.', 'Do not go so far that you forget why you started.', 'Focus on the present; everything is perfectly arranged.', 'You don\'t have to be great to start, but you have to start to be great.', 'Treat every day as a new beginning.', 'A journey of a thousand miles begins with a single step.'],
    'ja': ['急がば回れ。', '今日の行いが、明日のあなたを決める。', '遠くへ行きすぎて、なぜ出発したかを忘れないで。', '今に集中すれば、すべてが最高の配置になる。', '上手く始める必要はない、始めることが上手くなる秘訣だ。', '毎日を新しいスタートとして捉えよう。', '千里の道も一歩から。']
  };
  function updateQuote() {
    const list = QUOTES[currentLang] || QUOTES['zh-TW'];
    $('#quoteText').textContent = list[Math.floor(Math.random() * list.length)];
  }
  updateQuote();

  let cdInterval = null; let cdIndex = 0; let cdListData = [];
  function collectUpcomingEvents() {
    const today = new Date(); today.setHours(0, 0, 0, 0); const list = [];
    Object.keys(events).forEach(function (k) {
      const target = new Date(k); target.setHours(0, 0, 0, 0); if (target < today) return;
      (events[k] || []).forEach(function (ev) { list.push({ kind: 'event', id: ev.id, date: k, time: ev.time || '', title: ev.title }); });
    });
    (countdowns || []).forEach(function (cd) {
      if (!cd || !cd.date) return;
      const target = new Date(cd.date); target.setHours(0, 0, 0, 0); if (target < today) return;
      list.push({ kind: 'countdown', id: cd.id, date: cd.date, time: '', title: cd.title });
    });
    list.sort(function (a, b) { if (a.date !== b.date) return a.date < b.date ? -1 : 1; if (!a.time && !b.time) return 0; if (!a.time) return -1; if (!b.time) return 1; return a.time < b.time ? -1 : (a.time > b.time ? 1 : 0); });
    return list.slice(0, 3);
  }
  function renderCountdowns() {
    const list = $('#countdownList'); if (cdInterval) { clearInterval(cdInterval); cdInterval = null; }
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    cdListData = collectUpcomingEvents(); if (!cdListData.length) { list.innerHTML = '<div class="empty small" style="padding:6px 0;">' + dict.upcomingEmpty + '</div>'; return; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    function buildItem(cd) {
      const target = new Date(cd.date); target.setHours(0, 0, 0, 0); const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      let text = diff === 0 ? dict.countdownToday : dict.countdownDays.replace('{n}', diff);
      const urgentClass = (diff >= 0 && diff <= 3) ? ' urgent' : '';
      const d = keyToDate(cd.date); const dateLabel = (d.getMonth() + 1) + '/' + d.getDate(); const timeStr = cd.time ? ' ' + cd.time : '';
      const delBtn = cd.kind === 'countdown' ? '<button class="cd-del mini del" data-cd-id="' + cd.id + '" title="' + dict.countdownDelete + '" aria-label="' + dict.countdownDelete + '" style="width:20px;height:20px;font-size:11px;margin-left:6px;">×</button>' : '';
      return '<div class="cd-item"><span class="cd-title">' + escapeHtml(cd.title) + ' <span class="cd-date">' + dateLabel + timeStr + '</span></span><span class="cd-days' + urgentClass + '">' + text + '</span>' + delBtn + '</div>';
    }
    if (cdListData.length === 1) { list.innerHTML = buildItem(cdListData[0]); return; }
    cdIndex = 0; list.innerHTML = buildItem(cdListData[0]);
    cdInterval = setInterval(function () {
      cdIndex = (cdIndex + 1) % cdListData.length; const item = list.querySelector('.cd-item');
      if (item) { item.style.transition = 'opacity .5s, transform .5s'; item.style.opacity = '0'; item.style.transform = 'translateY(5px)'; }
      setTimeout(function () {
        list.innerHTML = buildItem(cdListData[cdIndex]); const newItem = list.querySelector('.cd-item');
        if (newItem) { newItem.style.transition = 'opacity .5s, transform .5s'; newItem.style.opacity = '0'; newItem.style.transform = 'translateY(-5px)'; void newItem.offsetWidth; newItem.style.opacity = '1'; newItem.style.transform = 'translateY(0)'; }
      }, 500);
    }, 4000);
  }

  (function bindCountdownHandlers() {
    const addBtn = $('#cdAddBtn'); const saveBtn = $('#cdSave'); const listEl = $('#countdownList');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = '1';
      addBtn.addEventListener('click', function () { $('#cdTitle').value = ''; $('#cdDate').value = ''; openModal('#cdModal'); setTimeout(function () { $('#cdTitle').focus(); }, 80); });
    }
    if (saveBtn && !saveBtn.dataset.bound) {
      saveBtn.dataset.bound = '1';
      saveBtn.addEventListener('click', function () {
        const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
        const title = $('#cdTitle').value.trim(); const date = $('#cdDate').value;
        if (!title) { toast(dict.cdTitlePlaceholder); $('#cdTitle').focus(); return; }
        if (!date) { toast(dict.cdDate); $('#cdDate').focus(); return; }
        countdowns.push({ id: uid(), title: title, date: date }); save('countdowns'); closeModal('#cdModal'); renderCountdowns(); toast(dict.cdAdded);
      });
    }
    if (listEl && !listEl.dataset.bound) {
      listEl.dataset.bound = '1';
      listEl.addEventListener('click', function (e) {
        const btn = e.target.closest('.cd-del'); if (!btn) return; const id = btn.dataset.cdId; if (!id) return;
        const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
        customConfirm(dict.cdConfirmDelTitle, dict.cdConfirmDelMsg, dict.delete, dict.cancel, true).then(function (ok) {
          if (!ok) return;
          countdowns = countdowns.filter(function (c) { return c.id !== id; }); save('countdowns'); renderCountdowns(); toast(dict.cdDeleted);
        });
      });
    }
  })();

  function countTodayTags() { const tk = dayKeyOf(new Date()); return (todos.schedule[tk] || []).length; }
  function countUpcoming(days) { const now = new Date(); let n = 0; for (let i = 0; i < days; i++) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i); const list = events[dateKey(d)]; if (list) n += list.length; } return n; }
  function getTodayExpense() {
    const tk = todayKey(); let totalTWD = 0;
    ledger.forEach(item => { if (item.date === tk && item.type === 'expense') totalTWD += item.amount; });
    const rate = exchangeRates[mainCurrency] || 1;
    return Math.round(totalTWD / rate);
  }

  function renderHome() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    if (!LS.get('onboarded', false)) {
      const homeMain = document.querySelector('.home-main');
      let existingCard = document.getElementById('welcomeCard');
      
      if (homeMain && !existingCard) {
        // 首次生成
        const card = document.createElement('div'); card.id = 'welcomeCard'; card.className = 'card welcome-card';
        card.innerHTML = `<div style="font-weight:600; margin-bottom:6px;">${dict.welcomeTitle}</div><div style="font-size:13px; line-height:1.6; color:var(--fg-dim); margin-bottom:10px;">${dict.welcomeDesc}</div><button class="btn primary" id="welcomeCloseBtn" style="font-size:12px; padding:6px 12px;">${dict.welcomeBtn}</button>`;
        homeMain.prepend(card);
        document.getElementById('welcomeCloseBtn').addEventListener('click', () => { LS.set('onboarded', true); card.remove(); });
      } else if (existingCard) {
        // [NEW] 如果卡片已存在，切換語言時直接更新內容
        existingCard.innerHTML = `<div style="font-weight:600; margin-bottom:6px;">${dict.welcomeTitle}</div><div style="font-size:13px; line-height:1.6; color:var(--fg-dim); margin-bottom:10px;">${dict.welcomeDesc}</div><button class="btn primary" id="welcomeCloseBtn" style="font-size:12px; padding:6px 12px;">${dict.welcomeBtn}</button>`;
        document.getElementById('welcomeCloseBtn').addEventListener('click', () => { LS.set('onboarded', true); existingCard.remove(); });
      }
    }
    $('#statTodo').textContent = countTodayTags(); $('#statEvent').textContent = countUpcoming(7); $('#statDiary').textContent = diaries.length; $('#statExpense').textContent = currencySymbols[mainCurrency] + ' ' + getTodayExpense();
    renderCountdowns(); renderGoals(); renderBookmarks();
  }

  function renderGoals() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const wrap = $('#goalList'); const badge = $('#goalBadge');
    if (!goals.length) { wrap.innerHTML = '<div class="empty small">' + dict.goalEmpty + '</div>'; badge.textContent = '0 / 0'; return; }
    const doneCount = goals.filter(function (g) { return g.done; }).length; badge.textContent = doneCount + ' / ' + goals.length;
    wrap.innerHTML = goals.map(function (g) {
      const prog = g.progress || 0;
      return '<div class="goal-item' + (g.done ? ' done' : '') + '" data-id="' + g.id + '"><button class="goal-chk" data-act="toggle" aria-label="標記完成"></button><div class="goal-main"><div class="goal-title">' + escapeHtml(g.title) + '</div>' + (g.note ? '<div class="goal-note">' + escapeHtml(g.note) + '</div>' : '') + '<div class="goal-progress-bar"><div class="goal-progress-fill" style="width:' + prog + '%"></div></div></div><div class="goal-acts"><button class="mini" data-act="edit" aria-label="' + dict.goalEdit + '">✎</button><button class="mini del" data-act="del" aria-label="' + dict.goalDelete + '">×</button></div></div>';
    }).join('');
  }

  let editingGoalId = null; let confirmGoalId = null;
  const GOAL_CONFIRM_TEXTS = {
    'zh-TW': [{ title: '你真的完成這個目標了嗎？', sub: '你確定沒有偷懶嗎？問問自己的心。', icon: '🤔' }, { title: '確定完成了嗎？', sub: '別騙自己喔，誠實面對比較好。', icon: '👀' }, { title: '要標記為完成了？', sub: '回想一下，真的盡力了嗎？', icon: '🧐' }, { title: '這個目標真的達成了嗎？', sub: '再檢查一次，確認沒有僥倖。', icon: '🔍' }],
    'en': [{ title: 'Are you sure you completed this goal?', sub: 'Did you really give it your all?', icon: '🤔' }, { title: 'Is it done?', sub: 'Don\'t lie to yourself, face it honestly.', icon: '👀' }, { title: 'Mark as complete?', sub: 'Think about it, did you really try your best?', icon: '🧐' }, { title: 'Really achieved?', sub: 'Double-check to make sure.', icon: '🔍' }]
  };
  function openGoalConfirm(id) { confirmGoalId = id; const list = GOAL_CONFIRM_TEXTS[currentLang] || GOAL_CONFIRM_TEXTS['zh-TW']; const t = list[Math.floor(Math.random() * list.length)]; document.querySelector('.goal-confirm-icon').textContent = t.icon; $('#goalConfirmTitle').textContent = t.title; $('#goalConfirmSub').textContent = t.sub; openModal('#goalConfirmModal'); }
  $('#goalConfirmYes').addEventListener('click', function () { if (!confirmGoalId) { closeModal('#goalConfirmModal'); return; } const dict = window.I18N[currentLang] || window.I18N['zh-TW']; const g = goals.find(function (x) { return x.id === confirmGoalId; }); if (g) { g.done = true; g.progress = 100; save('goals'); renderGoals(); } confirmGoalId = null; closeModal('#goalConfirmModal'); toast(dict.goalConfirmDone); });
  $('#goalConfirmNo').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; confirmGoalId = null; closeModal('#goalConfirmModal'); toast(dict.goalConfirmKeep); });

  function openGoalModal(id) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    editingGoalId = id || null; const g = id ? goals.find(function (x) { return x.id === id; }) : null;
        $('#goalModalTitle').textContent = g ? dict.goalEdit : dict.goalNew; 
    document.querySelector('#goalModal .sub2').textContent = g ? dict.goalEditSub : dict.goalNewSub;
    $('#goalTitle').value = g ? g.title : ''; $('#goalNote').value = g ? (g.note || '') : ''; $('#goalProgress').value = g ? (g.progress || 0) : 0; $('#goalProgressVal').textContent = g ? (g.progress || 0) : 0; $('#goalDelete').style.display = g ? '' : 'none';
    openModal('#goalModal'); setTimeout(function () { $('#goalTitle').focus(); }, 80);
  }
  $('#goalProgress').addEventListener('input', function () { $('#goalProgressVal').textContent = this.value; });
  $('#goalAddBtn').addEventListener('click', function () { openGoalModal(null); });
  $('#goalList').addEventListener('click', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const btn = e.target.closest('[data-act]'); if (!btn) return; const item = e.target.closest('.goal-item'); if (!item) return;
    const id = item.dataset.id; const g = goals.find(function (x) { return x.id === id; }); if (!g) return; const act = btn.dataset.act;
    if (act === 'toggle') { if (!g.done) openGoalConfirm(id); else { g.done = false; g.progress = 0; save('goals'); renderGoals(); } }
    else if (act === 'edit') openGoalModal(id);
    else if (act === 'del') { goals = goals.filter(function (x) { return x.id !== id; }); save('goals'); renderGoals(); toast(dict.deleted); }
  });
  $('#goalSave').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const title = $('#goalTitle').value.trim(); if (!title) { toast(dict.goalSaveFail); $('#goalTitle').focus(); return; }
    const note = $('#goalNote').value.trim(); const prog = parseInt($('#goalProgress').value, 10);
    if (editingGoalId) { const g = goals.find(function (x) { return x.id === editingGoalId; }); if (g) { g.title = title; g.note = note; g.progress = prog; if (prog === 100) g.done = true; } }
    else { goals.unshift({ id: uid(), title: title, note: note, progress: prog, done: prog === 100 }); }
    save('goals'); renderGoals(); closeModal('#goalModal'); toast(dict.saved);
  });
  $('#goalDelete').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; if (!editingGoalId) return; goals = goals.filter(function (x) { return x.id !== editingGoalId; }); save('goals'); renderGoals(); closeModal('#goalModal'); toast(dict.deleted); });

  let editingBmId = null;
  function faviconUrl(url) { return 'https://www.google.com/s2/favicons?sz=64&domain_url=' + encodeURIComponent(url); }
  function renderBookmarks() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const list = $('#bmList'); if (!bookmarks.length) { list.innerHTML = '<div class="empty small">' + dict.bmEmpty + '</div>'; return; }
    list.innerHTML = bookmarks.map(function (b) {
      let host = ''; try { host = new URL(b.url).hostname; } catch (e) { host = ''; } const name = b.name || host || b.url;
            return '<div class="bm-item" data-id="' + b.id + '" title="' + escapeHtml(name) + '"><span class="bm-drag-handle">⠿</span><img class="bm-fav" src="' + faviconUrl(b.url) + '" alt="" onerror="this.style.display=\'none\'"><span class="bm-name">' + escapeHtml(name) + '</span><div class="bm-acts"><button class="bm-act" data-act="edit" title="' + dict.bmEdit + '" aria-label="' + dict.bmEdit + '">✎</button><button class="bm-act del" data-act="del" title="' + dict.bmDelete + '" aria-label="' + dict.bmDelete + '">×</button></div></div>';
    }).join('');
  }

  (function initBookmarkDrag() {
    const listEl = $('#bmList'); let dragging = null; let startY = 0; let placeholder = null; let pointerOffsetY = 0; let pointerId = null;
    function getItemUnder(clientY) { const items = $$('.bm-item', listEl).filter(function (el) { return el !== dragging; }); for (let i = 0; i < items.length; i++) { const r = items[i].getBoundingClientRect(); if (clientY < r.top + r.height / 2) return items[i]; } return null; }
    listEl.addEventListener('pointerdown', function (e) {
      const handle = e.target.closest('.bm-drag-handle'); if (!handle) return; const item = e.target.closest('.bm-item'); if (!item) return; e.preventDefault();
      dragging = item; pointerId = e.pointerId; startY = e.clientY; pointerOffsetY = e.clientY - item.getBoundingClientRect().top;
      placeholder = document.createElement('div'); placeholder.className = 'bm-placeholder'; placeholder.style.height = item.offsetHeight + 'px'; item.parentNode.insertBefore(placeholder, item);
      item.classList.add('dragging'); item.style.position = 'fixed'; item.style.width = item.offsetWidth + 'px'; item.style.left = item.getBoundingClientRect().left + 'px'; item.style.top = (e.clientY - pointerOffsetY) + 'px'; item.style.zIndex = '999'; item.style.pointerEvents = 'none';
      try { handle.setPointerCapture(pointerId); } catch (err) {}
    });
    listEl.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pointerId) return; e.preventDefault(); dragging.style.top = (e.clientY - pointerOffsetY) + 'px';
      const before = getItemUnder(e.clientY); if (before) listEl.insertBefore(placeholder, before); else listEl.appendChild(placeholder);
    });
    function finishDrag() {
      if (!dragging) return; dragging.classList.remove('dragging'); dragging.style.position = ''; dragging.style.width = ''; dragging.style.left = ''; dragging.style.top = ''; dragging.style.zIndex = ''; dragging.style.pointerEvents = '';
      if (placeholder && placeholder.parentNode) { placeholder.parentNode.insertBefore(dragging, placeholder); placeholder.remove(); }
      placeholder = null; dragging = null; pointerId = null;
      const newOrderIds = $$('.bm-item', listEl).map(function (el) { return el.dataset.id; }); const newBookmarks = [];
      newOrderIds.forEach(function (id) { const b = bookmarks.find(function (x) { return x.id === id; }); if (b) newBookmarks.push(b); });
      if (newBookmarks.length === bookmarks.length) { bookmarks = newBookmarks; save('bookmarks'); toast((window.I18N[currentLang] || window.I18N['zh-TW']).bmDragSave); }
    }
    listEl.addEventListener('pointerup', finishDrag); listEl.addEventListener('pointercancel', finishDrag);
  })();

  function normalizeUrl(raw) { let u = String(raw || '').trim(); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; return u; }
  function openBmModal(id) { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; editingBmId = id || null; const b = id ? bookmarks.find(function (x) { return x.id === id; }) : null; $('#bmModalTitle').textContent = b ? dict.bmEdit : dict.bmNew; $('#bmName').value = b ? b.name : ''; $('#bmUrl').value = b ? b.url : ''; $('#bmDelete').style.display = b ? '' : 'none'; openModal('#bmModal'); setTimeout(function () { $('#bmName').focus(); }, 80); }
  $('#bmAddBtn').addEventListener('click', function () { openBmModal(null); });
  $('#bmList').addEventListener('click', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const item = e.target.closest('.bm-item'); if (!item) return; const id = item.dataset.id; const b = bookmarks.find(function (x) { return x.id === id; }); if (!b) return;
    const actBtn = e.target.closest('[data-act]');
    if (actBtn) { if (actBtn.dataset.act === 'del') { bookmarks = bookmarks.filter(function (x) { return x.id !== id; }); save('bookmarks'); renderBookmarks(); toast(dict.bookmarkDeleted); } else if (actBtn.dataset.act === 'edit') { openBmModal(id); } return; }
    window.open(b.url, '_blank', 'noopener');
  });
  $('#bmSave').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    let url = normalizeUrl($('#bmUrl').value); let name = $('#bmName').value.trim(); if (!url) { toast(dict.bookmarkUrlRequired); $('#bmUrl').focus(); return; }
    if (!name) { try { name = new URL(url).hostname; } catch (e) { name = url; } }
    if (editingBmId) { const b = bookmarks.find(function (x) { return x.id === editingBmId; }); if (b) { b.name = name; b.url = url; } }
    else { bookmarks.push({ id: uid(), name: name, url: url }); }
    save('bookmarks'); renderBookmarks(); closeModal('#bmModal'); toast(dict.bookmarkSaved);
  });
  $('#bmDelete').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; if (!editingBmId) return; bookmarks = bookmarks.filter(function (x) { return x.id !== editingBmId; }); save('bookmarks'); renderBookmarks(); closeModal('#bmModal'); toast(dict.bookmarkDeleted); });

  // ==========================================
  // 8. 記帳與匯率
  // ==========================================
  function renderRateFreshness() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const el = $('#rateFreshness'); if (!el) return;
    if (!exchangeRatesUpdatedAt) { el.textContent = dict.ledgerRateNote; return; }
    el.textContent = dict.ledgerRateNote + '：' + fmtDateTime(new Date(exchangeRatesUpdatedAt));
  }

  function fetchExchangeRates() {
    const now = Date.now();
    if (exchangeRatesUpdatedAt && (now - exchangeRatesUpdatedAt) < RATE_MIN_INTERVAL) { renderRateFreshness(); return; }
    fetch('https://open.er-api.com/v6/latest/TWD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          const newRates = Object.assign({}, DEFAULT_RATES);
          ['USD', 'JPY', 'HKD', 'EUR', 'GBP', 'CNY'].forEach(function (cur) { if (data.rates[cur]) newRates[cur] = 1 / data.rates[cur]; });
          exchangeRates = newRates; exchangeRatesUpdatedAt = Date.now();
          LS.set('exchangeRates', { rates: newRates, updatedAt: exchangeRatesUpdatedAt });
          renderRateFreshness(); renderLedger(); renderHome();
        }
      }).catch(() => { renderRateFreshness(); });
  }
  fetchExchangeRates();

  function renderLedgerTags() {
    const wrap = $('#ledgerTags'); if (!wrap) return;
    if (!ledgerCategories.length) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = ledgerCategories.map(function(cat) { 
      return '<div class="tag-chip-ledger-wrap">' +
               '<span class="tag-chip-ledger" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</span>' +
               '<button class="tag-del-btn" type="button" data-del-cat="' + escapeHtml(cat) + '" title="刪除標籤" aria-label="刪除標籤">×</button>' +
             '</div>'; 
    }).join('');
  }

  (function bindLedgerDropdown() {
    const wrap = $('#ledgerTags');
    const inp = $('#ledgerCategory');
    if (!wrap || !inp || wrap.dataset.bound) return;
    
    wrap.dataset.bound = '1';
    inp.dataset.bound = '1';

    inp.addEventListener('focus', function() {
      renderLedgerTags();
      wrap.classList.add('open');
    });

    wrap.addEventListener('click', function(e) {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const delBtn = e.target.closest('.tag-del-btn');
      if (delBtn) {
        e.stopPropagation();
        const catToDelete = delBtn.dataset.delCat;
        customConfirm(dict.ledgerDelTagTitle, dict.ledgerDelTagMsg.replace('{c}', escapeHtml(catToDelete)), dict.delete, dict.cancel, true).then(function(ok) {
          if (!ok) return;
          ledgerCategories = ledgerCategories.filter(function(c) { return c !== catToDelete; });
          save('ledgerCategories');
          renderLedgerTags();
          toast(dict.ledgerTagDeleted);
        });
        return;
      }

      const btn = e.target.closest('.tag-chip-ledger'); 
      if (!btn) return;
      inp.value = btn.dataset.cat;
      wrap.classList.remove('open');
    });

    document.addEventListener('click', function(e) {
      if (wrap.classList.contains('open') && !inp.contains(e.target) && !wrap.contains(e.target)) {
        wrap.classList.remove('open');
      }
    });
  })();

  function renderLedger() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    if (!$('#ledgerDate').value) $('#ledgerDate').value = todayKey();
    $('#ledgerDate').max = todayKey();

    const now = new Date(); const thisMonth = now.getFullYear() + '-' + pad(now.getMonth() + 1); const monthItems = ledger.filter(item => item.date.startsWith(thisMonth));
    let totalExpenseTWD = 0; let totalIncomeTWD = 0;
    monthItems.forEach(item => { if (item.type === 'income') totalIncomeTWD += item.amount; else totalExpenseTWD += item.amount; });
    const currentRate = exchangeRates[mainCurrency] || 1;
    const showExpense = Math.round(totalExpenseTWD / currentRate); const showIncome = Math.round(totalIncomeTWD / currentRate); const showBalance = showIncome - showExpense;
    const symbol = currencySymbols[mainCurrency] || '$';
    $('#monthExpenseTotal').textContent = symbol + ' ' + showExpense; $('#monthIncomeTotal').textContent = symbol + ' ' + showIncome; $('#monthBalanceTotal').textContent = symbol + ' ' + showBalance; $('#monthBalanceTotal').style.color = showBalance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
    const listWrap = $('#ledgerList'); if (!monthItems.length) { listWrap.innerHTML = '<div class="empty">' + dict.ledgerEmpty + '</div>'; renderRateFreshness(); return; }
    const sorted = monthItems.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    listWrap.innerHTML = sorted.map(function (item) {
      const isIncome = item.type === 'income'; const sign = isIncome ? '+' : '-'; const colorClass = isIncome ? 'income' : 'expense';
      let amountDisplay = ''; let extraNote = '';
      if (item.currency && item.currency !== mainCurrency && item.originalAmount) {
        amountDisplay = sign + item.currency + ' ' + item.originalAmount; const itemInTWD = item.amount; const converted = Math.round(itemInTWD / currentRate);
        extraNote = ` <span style="font-size:11px;color:var(--fg-dim)">(約 ${symbol}${converted})</span>`;
      } else if (item.currency && item.currency === mainCurrency && item.originalAmount) {
        amountDisplay = sign + symbol + ' ' + item.originalAmount;
      } else {
        amountDisplay = sign + symbol + ' ' + Math.round(item.amount / currentRate);
      }
      return '<div class="ledger-item"><div class="ledger-date">' + item.date.slice(5) + '</div><div class="ledger-cat">' + escapeHtml(item.category) + '</div><div class="ledger-note">' + escapeHtml(item.note || '-') + '</div><div class="ledger-amount ' + colorClass + '">' + amountDisplay + extraNote + '</div><button class="mini del ledger-del" data-id="' + item.id + '" title="刪除">×</button></div>';
    }).join('');
    renderRateFreshness();
  }

  (function bindLedgerHandlers() {
    const addBtn = $('#ledgerAddBtn'); const listEl = $('#ledgerList');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = '1';
      addBtn.addEventListener('click', function () {
        const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
        const type = $('#ledgerType').value; const currency = $('#ledgerCurrency').value;
        const amountRaw = parseFloat($('#ledgerAmount').value);
        const category = $('#ledgerCategory').value.trim() || '其他';
        const date = $('#ledgerDate').value || todayKey(); const note = $('#ledgerNote').value.trim();
        
        if (!amountRaw || amountRaw <= 0) { toast(dict.ledgerAmountInvalid); $('#ledgerAmount').focus(); return; }
        if (!date) { toast(dict.ledgerDateFuture); return; }
        if (date > todayKey()) { toast(dict.ledgerDateFuture); $('#ledgerDate').value = todayKey(); return; }
        
        if (!ledgerCategories.includes(category)) {
          ledgerCategories.push(category);
          save('ledgerCategories');
        }

        const rateToBase = exchangeRates[currency] || 1; const amountInBase = amountRaw * rateToBase;
        ledger.push({ id: uid(), type: type, currency: currency, originalAmount: amountRaw, amount: amountInBase, category: category, date: date, note: note, createdAt: Date.now() });
        save('ledger'); $('#ledgerAmount').value = ''; $('#ledgerNote').value = ''; $('#ledgerCategory').value = ''; renderLedger(); renderHome(); toast(dict.ledgerSaved);
      });
    }
    if (listEl && !listEl.dataset.bound) {
      listEl.dataset.bound = '1';
      listEl.addEventListener('click', function (e) {
        const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
        const btn = e.target.closest('.ledger-del'); if (!btn) return; const id = btn.dataset.id; if (!id) return;
        customConfirm(dict.ledgerConfirmDelTitle, dict.ledgerConfirmDelMsg, dict.ledgerDelOk, dict.cancel, true).then(function (ok) {
          if (!ok) return;
          ledger = ledger.filter(function (x) { return x.id !== id; }); save('ledger'); renderLedger(); renderHome(); toast(dict.ledgerDeleted);
        });
      });
    }
  })();

  // ==========================================
  // 9. 每週必做
  // ==========================================
  function tagById(id) { return todos.tags.find(function (t) { return t.id === id; }) || null; }
  function tagsForDay(dayKey) { return (todos.schedule[dayKey] || []).map(tagById).filter(Boolean); }
  function renderTodos() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const now = new Date(); const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); const todayDayKey = dayKeyOf(now); const tomorrowDayKey = dayKeyOf(tomorrow); const todayDateKey = dateKey(now); const todayDone = Array.isArray(todos.done[todayDateKey]) ? todos.done[todayDateKey] : [];
    const todayTags = tagsForDay(todayDayKey); const tomorrowTags = tagsForDay(tomorrowDayKey); const todayCol = $('#todayCol');
    const doneCount = todayTags.filter(function (t) { return todayDone.indexOf(t.id) >= 0; }).length;
    todayCol.innerHTML = '<div class="card today-card"><div class="today-head"><h3>' + dict.todayLabel + ' · ' + dayLabelOf(todayDayKey) + '</h3><span class="badge">' + (todayTags.length ? doneCount + ' / ' + todayTags.length : '—') + '</span></div><div class="today-list scroll-box">' + (todayTags.length ? todayTags.map(function (t) { const done = todayDone.indexOf(t.id) >= 0; return '<button class="today-item' + (done ? ' done' : '') + '" data-tag="' + t.id + '"><span class="chk"></span><span class="label">' + escapeHtml(t.name) + '</span></button>'; }).join('') : '<div class="empty small">' + dict.todoEmptyDay + '</div>') + '</div></div>';
    const tomorrowCol = $('#tomorrowCol');
    tomorrowCol.innerHTML = '<div class="card tomorrow-card"><h4>' + dict.tomorrowLabel + ' · ' + dayLabelOf(tomorrowDayKey) + '</h4><div class="tomorrow-list">' + (tomorrowTags.length ? tomorrowTags.map(function (t) { return '<span class="tomorrow-tag">' + escapeHtml(t.name) + '</span>'; }).join('') : '<span class="empty small" style="padding:0;">—</span>') + '</div></div>';
  }
  $('#todayCol').addEventListener('click', function (e) {
    const btn = e.target.closest('.today-item'); if (!btn) return; const id = btn.dataset.tag; const tk = dateKey(new Date()); if (!Array.isArray(todos.done[tk])) todos.done[tk] = [];
    const arr = todos.done[tk]; const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id); save('todos'); renderTodos(); renderHome();
  });

  let todoDraft = null; let todoChanged = false;
  function checkTodoChanged() {
    if (!todoDraft) return; const dict = window.I18N[currentLang] || window.I18N['zh-TW']; const s1 = JSON.stringify(todoDraft); const s2 = JSON.stringify(todos); todoChanged = (s1 !== s2);
    const btnSave = $('#todoSaveBtn'); const btnCancel = $('#todoCancelBtn');
    if (todoChanged) { btnSave.disabled = false; btnSave.textContent = dict.todoSave; btnSave.style.background = '#2e9e5e'; btnSave.style.color = '#fff'; btnSave.style.borderColor = 'transparent'; btnCancel.style.display = 'inline-flex'; }
    else { btnSave.disabled = true; btnSave.textContent = dict.todoSave; btnSave.style.background = 'var(--hover)'; btnSave.style.color = 'var(--fg-dim)'; btnSave.style.borderColor = 'transparent'; btnCancel.style.display = 'none'; }
  }
  function openTodoSettings() {
    todoDraft = JSON.parse(JSON.stringify(todos)); if (!todoDraft.tags) todoDraft.tags = []; if (!todoDraft.schedule) todoDraft.schedule = emptyTodoData().schedule;
    WEEKDAYS.forEach(function (w) { if (!Array.isArray(todoDraft.schedule[w.key])) todoDraft.schedule[w.key] = []; });
    renderTagPool(); renderSchedule(); checkTodoChanged(); openModal('#todoModal');
  }
  function renderTagPool() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const pool = $('#tagPool'); if (!todoDraft.tags.length) { pool.innerHTML = '<div class="empty small" style="padding:6px 0;">' + dict.tagEmpty + '</div>'; return; }
    pool.innerHTML = todoDraft.tags.map(function (t) { return '<span class="tag-chip">' + escapeHtml(t.name) + '<button class="chip-x" data-del-tag="' + t.id + '" aria-label="刪除標籤">×</button></span>'; }).join('');
  }
  function renderSchedule() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const grid = $('#scheduleGrid'); if (!todoDraft.tags.length) { grid.innerHTML = '<div class="empty small" style="grid-column:1/-1;">' + dict.scheduleEmpty + '</div>'; return; }
    grid.innerHTML = WEEKDAYS.map(function (w) { const assigned = todoDraft.schedule[w.key] || []; const label = (dict.weekdaysFull && dict.weekdaysFull[w.key]) || w.label; return '<div class="sched-card"><h4>' + label + '</h4><div class="sched-tags">' + todoDraft.tags.map(function (t) { const on = assigned.indexOf(t.id) >= 0; return '<button class="sched-tag' + (on ? ' on' : '') + '" data-toggle-day="' + w.key + '" data-tag="' + t.id + '">' + escapeHtml(t.name) + '</button>'; }).join('') + '</div></div>'; }).join('');
  }
  function checkUnfinishedTasks() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const today = todayKey(); if (LS.get('lastTodoCheck', '') === today) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const yKey = dayKeyOf(yesterday); const yDateKey = dateKey(yesterday);
    const yTags = tagsForDay(yKey); const yDone = Array.isArray(todos.done[yDateKey]) ? todos.done[yDateKey] : []; const unfinishedCount = yTags.filter(t => yDone.indexOf(t.id) < 0).length;
    if (unfinishedCount > 0) { LS.set('lastTodoCheck', today); toast(dict.yesterdayUnfinished.replace('{n}', unfinishedCount)); }
    else { LS.set('lastTodoCheck', today); }
  }
  $('#tagAddBtn').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const input = $('#tagInput'); const v = input.value.trim(); if (!v) { input.focus(); return; }
    if (todoDraft.tags.some(function (t) { return t.name === v; })) { toast(dict.tagDup); return; }
    todoDraft.tags.push({ id: uid(), name: v }); input.value = ''; renderTagPool(); renderSchedule(); checkTodoChanged(); input.focus();
  });
  $('#tagInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#tagAddBtn').click(); } });
  $('#tagPool').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-del-tag]'); if (!btn) return; const id = btn.dataset.delTag;
    todoDraft.tags = todoDraft.tags.filter(function (t) { return t.id !== id; });
    WEEKDAYS.forEach(function (w) { todoDraft.schedule[w.key] = todoDraft.schedule[w.key].filter(function (x) { return x !== id; }); });
    renderTagPool(); renderSchedule(); checkTodoChanged();
  });
  $('#scheduleGrid').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-toggle-day]'); if (!btn) return; const day = btn.dataset.toggleDay; const tagId = btn.dataset.tag;
    const arr = todoDraft.schedule[day]; const i = arr.indexOf(tagId); if (i >= 0) arr.splice(i, 1); else arr.push(tagId);
    renderSchedule(); checkTodoChanged();
  });
  $('#todoSaveBtn').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; if (!todoChanged) return; todos = todoDraft; save('todos'); renderTodos(); renderHome(); closeModal('#todoModal'); toast(dict.todoSaved); });
  $('#todoCancelBtn').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; todoDraft = JSON.parse(JSON.stringify(todos)); renderTagPool(); renderSchedule(); checkTodoChanged(); toast(dict.todoReverted); });
  $('#todoSettingsBtn').addEventListener('click', openTodoSettings);

  // ==========================================
  // 10. 日曆
  // ==========================================
  const TIMEZONE = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '本地時區'; } catch (e) { return '本地時區'; } })();
  let calCursor = new Date(); calCursor.setDate(1);
  function monthIndex(y, m) { return y * 12 + m; }
  function renderCalendar() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const y = calCursor.getFullYear(); const m = calCursor.getMonth(); const now = new Date();
    const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6; const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12; const curIdx = monthIndex(y, m);
    $('#calTitle').textContent = dict.evMonthYear.replace('{y}', y).replace('{m}', (m + 1)); $('#calPrev').disabled = curIdx <= minIdx; $('#calNext').disabled = curIdx >= maxIdx;
    $('#calTz').textContent = dict.calTz.replace('{tz}', TIMEZONE);
    if (!$('#calJumpDate').value) $('#calJumpDate').value = y + '-' + pad(m + 1) + '-01';
    const firstDow = new Date(y, m, 1).getDay(); const daysInMonth = new Date(y, m + 1, 0).getDate(); const daysInPrev = new Date(y, m, 0).getDate(); const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7; const tk = todayKey();
    let html = dict.calendarWeekdays.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('');
    for (let i = 0; i < totalCells; i++) {
      const dn = i - firstDow + 1;
      if (dn < 1) html += '<div class="cal-cell muted">' + (daysInPrev + dn) + '</div>';
      else if (dn > daysInMonth) html += '<div class="cal-cell muted">' + (dn - daysInMonth) + '</div>';
      else { const key = y + '-' + pad(m + 1) + '-' + pad(dn); const list = events[key] || []; const isToday = key === tk; const star = list.length > 0 ? ' ⭐' : ''; html += '<button class="cal-cell' + (isToday ? ' today' : '') + '" data-date="' + key + '">' + dn + star + '</button>'; }
    }
    $('#calGrid').innerHTML = html;
    renderCalSidebar();
  }

  function renderCalSidebar() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const listEl = $('#calSidebarList');
    if (!listEl) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allEvents = [];

    // 收集所有事件
    Object.keys(events).forEach(function (k) {
      const targetDate = keyToDate(k);
      if (targetDate < today) return; // 只顯示今天與未來
      (events[k] || []).forEach(function (ev) {
        allEvents.push({ date: k, time: ev.time || '', title: ev.title, content: ev.content || '' });
      });
    });

    // 根據日期與時間排序
    allEvents.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      if (!a.time && !b.time) return 0;
      if (!a.time) return -1;
      if (!b.time) return 1;
      return a.time < b.time ? -1 : (a.time > b.time ? 1 : 0);
    });

    if (!allEvents.length) {
      listEl.innerHTML = '<div class="empty small" style="padding:6px 0;">' + (dict.upcomingEmpty || '近期沒有要事。') + '</div>';
      return;
    }

    listEl.innerHTML = allEvents.map(function (ev) {
      const d = keyToDate(ev.date);
      const dateLabel = d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
      const timeLabel = ev.time ? '<span class="cal-sidebar-time">' + escapeHtml(ev.time) + '</span>' : '';
      return '<div class="cal-sidebar-item">' +
               '<div class="cal-sidebar-date">' + dateLabel + ' ' + timeLabel + '</div>' +
               '<div class="cal-sidebar-ev-title">' + escapeHtml(ev.title) + '</div>' +
             '</div>';
    }).join('');
  }
  function inCalendarRange(date) { const now = new Date(); const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6; const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12; const idx = monthIndex(date.getFullYear(), date.getMonth()); return idx >= minIdx && idx <= maxIdx; }
  function shiftMonth(delta) { const now = new Date(); const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6; const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12; const cur = monthIndex(calCursor.getFullYear(), calCursor.getMonth()); const next = cur + delta; if (next < minIdx || next > maxIdx) return; calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + delta, 1); renderCalendar(); }
  $('#calPrev').addEventListener('click', function () { shiftMonth(-1); });
  $('#calNext').addEventListener('click', function () { shiftMonth(1); });
  $('#calToday').addEventListener('click', function () { calCursor = new Date(); calCursor.setDate(1); $('#calJumpDate').value = todayKey(); renderCalendar(); });
  $('#calJumpDate').addEventListener('change', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const val = this.value; if (!val) return; const p = val.split('-').map(Number); const target = new Date(p[0], p[1] - 1, 1);
    if (!inCalendarRange(target)) { toast(dict.calRangeLimit); this.value = todayKey(); return; }
    calCursor = target; renderCalendar(); openEventModal(val);
  });
  $('#calGrid').addEventListener('click', function (e) { const cell = e.target.closest('.cal-cell[data-date]'); if (cell) openEventModal(cell.dataset.date); });
  let eventDateKey = null; let editingEventId = null;
  function openEventModal(key) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    eventDateKey = key; editingEventId = null; const d = keyToDate(key); const week = dict.weekdays[d.getDay()];
    $('#eventDateTitle').textContent = dict.evMonthYear.replace('{y}', d.getFullYear()).replace('{m}', (d.getMonth() + 1)) + ' ' + d.getDate() + ' · ' + dict.evWeek.replace('{w}', week);
    $('#eventForm').reset(); $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; renderEventList(); openModal('#eventModal'); setTimeout(function () { $('#evTitle').focus(); }, 80);
  }
  function renderEventList() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const wrap = $('#eventList'); const list = events[eventDateKey] || []; if (!list.length) { wrap.innerHTML = '<div class="empty small">' + dict.calEventEmpty + '</div>'; return; }
    wrap.innerHTML = list.map(function (ev) { return '<div class="event-item" data-id="' + ev.id + '">' + (ev.time ? '<div class="ev-time">' + escapeHtml(ev.time) + '</div>' : '') + '<div class="ev-main"><div class="ev-title">' + escapeHtml(ev.title) + '</div>' + (ev.content ? '<div class="ev-content">' + escapeHtml(ev.content) + '</div>' : '') + '</div><div class="ev-acts"><button class="mini" data-act="edit">' + dict.edit + '</button><button class="mini del" data-act="del">×</button></div></div>'; }).join('');
  }
  $('#eventForm').addEventListener('submit', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    e.preventDefault(); const title = $('#evTitle').value.trim(); if (!title) { $('#evTitle').focus(); return; } const time = $('#evTime').value; const content = $('#evContent').value.trim();
    if (!events[eventDateKey]) events[eventDateKey] = [];
    if (editingEventId) { const ev = events[eventDateKey].find(function (x) { return x.id === editingEventId; }); if (ev) { ev.title = title; ev.time = time; ev.content = content; } }
    else { events[eventDateKey].push({ id: uid(), title: title, time: time, content: content }); }
    save('events'); $('#eventForm').reset(); editingEventId = null; $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; renderEventList(); renderCalendar(); renderHome(); toast(dict.eventSaved);
  });
  $('#eventCancelEdit').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; editingEventId = null; $('#eventForm').reset(); $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; $('#evTitle').focus(); });
  $('#eventList').addEventListener('click', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const btn = e.target.closest('[data-act]'); if (!btn) return; const item = e.target.closest('.event-item'); if (!item) return; const id = item.dataset.id; const list = events[eventDateKey] || []; const ev = list.find(function (x) { return x.id === id; }); if (!ev) return;
    if (btn.dataset.act === 'del') { events[eventDateKey] = list.filter(function (x) { return x.id !== id; }); if (!events[eventDateKey].length) delete events[eventDateKey]; save('events'); if (editingEventId === id) { editingEventId = null; $('#eventForm').reset(); $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; } renderEventList(); renderCalendar(); renderHome(); toast(dict.eventDeleted); }
    else if (btn.dataset.act === 'edit') { editingEventId = id; $('#evTitle').value = ev.title; $('#evTime').value = ev.time || ''; $('#evContent').value = ev.content || ''; $('#eventSubmit').textContent = dict.evUpdate; $('#eventCancelEdit').hidden = false; $('#evTitle').focus(); }
  });
  function pruneEvents() {
    const now = new Date(); const minKey = dateKey(new Date(now.getFullYear(), now.getMonth() - 6, 1)); const maxKey = dateKey(new Date(now.getFullYear(), now.getMonth() + 13, 0)); let changed = false;
    Object.keys(events).forEach(function (k) { if (k < minKey || k > maxKey) { delete events[k]; changed = true; } }); if (changed) save('events');
  }

  // ==========================================
  // 11. 日記
  // ==========================================
  let diaryFilterDate = '';
  let editingDiaryId = null;
  let diaryImageData = null;

  function updateDiaryImagePreview() {
    const wrap = $('#diaryImgWrap');
    if (diaryImageData) { $('#diaryImgPreview').src = diaryImageData; wrap.hidden = false; } else { $('#diaryImgPreview').removeAttribute('src'); wrap.hidden = true; }
  }

  function resetDiaryForm() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    editingDiaryId = null; diaryImageData = null;
    $('#diaryTitle').value = ''; $('#diaryContent').value = ''; $('#diaryWeather').value = ''; $('#diaryMood').value = '';
    updateDiaryImagePreview();
    $('#diaryCancelEdit').hidden = true;
    $('#diarySave').textContent = dict.diarySave;
    $('#diaryLockNote').textContent = dict.diaryLockNote;
  }

  function renderDiaries() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    let list = diaries.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    if (diaryFilterDate) list = list.filter(function (d) { return dateKey(new Date(d.createdAt)) === diaryFilterDate; });
    const wrap = $('#diaryList'); if (!list.length) { wrap.innerHTML = '<div class="empty">' + (diaryFilterDate ? dict.diaryEmptyDay : dict.diaryEmpty) + '</div>'; return; }
    wrap.innerHTML = list.map(function (d) { const dt = new Date(d.createdAt); return '<div class="diary-card" data-id="' + d.id + '"><div class="diary-meta"><span>' + fmtDateTime(dt) + '</span>' + (d.weather ? '<span class="tag">' + escapeHtml(d.weather) + '</span>' : '') + (d.mood ? '<span class="tag">' + escapeHtml(d.mood) + '</span>' : '') + '</div><div class="diary-title">' + escapeHtml(d.title) + '</div><div class="diary-preview">' + escapeHtml(d.content) + '</div></div>'; }).join('');
  }

  $('#diaryList').addEventListener('click', function (e) { const card = e.target.closest('.diary-card[data-id]'); if (card) openDiaryModal(card.dataset.id); });
  
  function openDiaryModal(id) {
    const d = diaries.find(function (x) { return x.id === id; }); if (!d) return; const dt = new Date(d.createdAt);
    $('#diaryModalTitle').textContent = d.title; 
    $('#diaryModalMeta').innerHTML = fmtDateTime(dt) + (d.weather ? ' · ' + escapeHtml(d.weather) : '') + (d.mood ? ' · ' + escapeHtml(d.mood) : '');
    $('#diaryModalBody').textContent = d.content; 
    
    if (d.image) { $('#diaryModalImg').src = d.image; $('#diaryModalImg').hidden = false; } else { $('#diaryModalImg').removeAttribute('src'); $('#diaryModalImg').hidden = true; }
    
    $('#diaryModalEditBtn').onclick = function() {
      closeModal('#diaryModal');
      editDiary(id);
    };
    
    openModal('#diaryModal');
  }

  function editDiary(id) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const d = diaries.find(function (x) { return x.id === id; }); if (!d) return;
    editingDiaryId = id; diaryImageData = d.image || null;
    $('#diaryTitle').value = d.title; $('#diaryContent').value = d.content; $('#diaryWeather').value = d.weather || ''; $('#diaryMood').value = d.mood || '';
    updateDiaryImagePreview();
    $('#diaryCancelEdit').hidden = false;
    $('#diarySave').textContent = dict.diaryUpdate;
    $('#diaryLockNote').textContent = dict.diaryEditingNote;
    showView('diary');
    $('#diaryCompose').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  $('#diaryImgPick').addEventListener('click', function() { $('#diaryImgInput').click(); });
  $('#diaryImgInput').addEventListener('change', function(e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; toast(dict.imgProcessing);
    compressImage(file, 1200, 0.75).then(function(data) { diaryImageData = data; updateDiaryImagePreview(); }).catch(function() { toast(dict.imgFail); });
  });
  $('#diaryImgClear').addEventListener('click', function() { diaryImageData = null; updateDiaryImagePreview(); });
  $('#diaryCancelEdit').addEventListener('click', function() { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; resetDiaryForm(); toast(dict.diaryEditCancelled); });

  $('#diarySave').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const title = $('#diaryTitle').value.trim(); const content = $('#diaryContent').value.trim(); 
    if (!title) { toast(dict.diaryTitleRequired); $('#diaryTitle').focus(); return; } 
    if (!content) { toast(dict.diaryContentRequired); $('#diaryContent').focus(); return; }
    
    if (editingDiaryId) {
      const d = diaries.find(function (x) { return x.id === editingDiaryId; });
      if (d) {
        d.title = title; d.weather = $('#diaryWeather').value; d.mood = $('#diaryMood').value; d.content = content;
        if (diaryImageData && diaryImageData !== d.image) {
          const newId = uid();
          if (IDB.available()) IDB.put('photos', { id: newId, src: diaryImageData }).catch(function(){});
          photoCache[newId] = diaryImageData;
          const dDate = dateKey(new Date(d.createdAt));
          photoMeta.push({ id: newId, title: dDate });
          d.image = diaryImageData;
          save('photoMeta');
        } else if (!diaryImageData && d.image) {
          d.image = null;
        } else if (diaryImageData) {
          d.image = diaryImageData;
        }
      }
      save('diaries'); resetDiaryForm(); renderDiaries(); renderPhotos(); renderHome(); toast(dict.diaryUpdated);
    } else {
      const newDiaryId = uid();
      let finalImg = null;
      if (diaryImageData) {
        finalImg = diaryImageData;
        const newId = uid();
        if (IDB.available()) IDB.put('photos', { id: newId, src: diaryImageData }).catch(function(){});
        photoCache[newId] = diaryImageData;
        const today = todayKey();
        photoMeta.push({ id: newId, title: today });
        save('photoMeta');
      }
      diaries.push({ id: newDiaryId, title: title, weather: $('#diaryWeather').value, mood: $('#diaryMood').value, content: content, image: finalImg, createdAt: Date.now() }); 
      save('diaries');
      resetDiaryForm(); renderDiaries(); renderPhotos(); renderHome(); toast(dict.diarySaved);
    }
  });

  $('#diaryDatePickerBtn').addEventListener('click', function () { $('#diaryDateInput').value = diaryFilterDate || todayKey(); openModal('#diaryDateModal'); });
  $('#diaryDateConfirm').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const val = $('#diaryDateInput').value;
    if (val) { diaryFilterDate = val; $('#diaryDatePickerBtn').textContent = dict.diaryFilterDate.replace('{d}', val); $('#diaryClearFilter').hidden = false; renderDiaries(); } closeModal('#diaryDateModal');
  });
  $('#diaryClearFilter').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; diaryFilterDate = ''; $('#diaryDatePickerBtn').textContent = dict.diaryFilterAll; $('#diaryClearFilter').hidden = true; renderDiaries(); });

  // ==========================================
  // 12. 筆記本
  // ==========================================
  function renderNotes() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const grid = $('#notesGrid'); if (!notes.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = notes.map(function (n) { const excerpt = (n.content || '').replace(/\s+/g, ' ').slice(0, 70); return '<button class="card note" data-id="' + n.id + '">' + (n.image ? '<div class="note-thumb" style="background-image:url(\'' + n.image + '\')"></div>' : '') + '<div class="note-h">' + escapeHtml(n.title || dict.noteUntitled) + '</div><div class="note-b">' + escapeHtml(excerpt) + '</div><div class="note-d">' + escapeHtml(n.date || '') + '</div></button>'; }).join('');
  }
  let editingNoteId = null; let noteImageData = null;
  function updateNoteImagePreview() { const wrap = $('#noteImgWrap'); if (noteImageData) { $('#noteImgPreview').src = noteImageData; wrap.hidden = false; } else { $('#noteImgPreview').removeAttribute('src'); wrap.hidden = true; } }
  function openNoteModal(id) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    editingNoteId = id || null; const n = id ? notes.find(function (x) { return x.id === id; }) : null;
    $('#noteModalTitle').textContent = n ? dict.noteEdit : dict.noteNew; $('#noteTitle').value = n ? (n.title || '') : ''; $('#noteDate').value = n ? (n.date || todayKey()) : todayKey(); $('#noteContent').value = n ? (n.content || '') : ''; noteImageData = n ? (n.image || null) : null;
    updateNoteImagePreview(); $('#noteDelete').style.display = n ? '' : 'none'; openModal('#noteModal'); setTimeout(function () { $('#noteTitle').focus(); }, 80);
  }
  $('#noteAdd').addEventListener('click', function () { openNoteModal(null); });
  $('#notesGrid').addEventListener('click', function (e) { const card = e.target.closest('.note[data-id]'); if (card) openNoteModal(card.dataset.id); });
  $('#noteImgPick').addEventListener('click', function () { $('#noteImgInput').click(); });
  $('#noteImgInput').addEventListener('change', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; toast(dict.imgProcessing);
    compressImage(file, 1200, 0.75).then(function (data) { noteImageData = data; updateNoteImagePreview(); }).catch(function () { toast(dict.imgFail); });
  });
  $('#noteImgClear').addEventListener('click', function () { noteImageData = null; updateNoteImagePreview(); });
  $('#noteSave').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const title = $('#noteTitle').value.trim(); const content = $('#noteContent').value.trim(); const date = $('#noteDate').value;
    if (!title && !content && !noteImageData) { toast(dict.noteEmpty); return; }
    if (editingNoteId) { const n = notes.find(function (x) { return x.id === editingNoteId; }); if (n) { n.title = title; n.content = content; n.date = date; n.image = noteImageData; } }
    else { notes.unshift({ id: uid(), title: title, content: content, date: date, image: noteImageData }); }
    save('notes'); renderNotes(); closeModal('#noteModal'); toast(dict.noteSaved);
  });
  $('#noteDelete').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; if (!editingNoteId) return; notes = notes.filter(function (x) { return x.id !== editingNoteId; }); save('notes'); renderNotes(); closeModal('#noteModal'); toast(dict.noteDeleted); });

  // ==========================================
  // 13. 照片庫
  // ==========================================
  function loadPhotoSrc(id) {
    if (photoCache[id]) return Promise.resolve(photoCache[id]);
    const fallbackLegacy = function () { const legacy = (legacyPhotos || []).find(function (p) { return p.id === id; }); if (legacy && legacy.src) { photoCache[id] = legacy.src; return legacy.src; } return null; };
    if (!IDB.available()) return Promise.resolve(fallbackLegacy());
    return IDB.get('photos', id).then(function (rec) { if (rec && rec.src) { photoCache[id] = rec.src; return rec.src; } return fallbackLegacy(); }).catch(function () { return fallbackLegacy(); });
  }
  function renderPhotos() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const grid = $('#photoGrid'); if (!photoMeta.length) { grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">' + dict.photoEmpty + '</div>'; return; }
    grid.innerHTML = photoMeta.map(function (p) { return '<button class="photo" data-id="' + p.id + '"><img alt="" data-photo="' + p.id + '"></button>'; }).join('');
    photoMeta.forEach(function (p) { loadPhotoSrc(p.id).then(function (src) { const img = grid.querySelector('img[data-photo="' + p.id + '"]'); if (img && src) img.src = src; }); });
  }
  $('#photoAdd').addEventListener('click', function () { $('#photoInput').click(); });
  $('#photoInput').addEventListener('change', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const files = Array.prototype.slice.call(e.target.files || []); e.target.value = ''; if (!files.length) return;
    if (!IDB.available()) { toast(dict.photoStorageFail); return; }
    toast(dict.photoProcessMulti.replace('{n}', files.length)); let done = 0;
    const tasks = files.map(function (f) { return compressImage(f, 1600, 0.72).then(function (src) { const id = uid(); return IDB.put('photos', { id: id, src: src }).then(function () { photoCache[id] = src; photoMeta.push({ id: id, title: '' }); done++; }); }).catch(function () {}); });
    Promise.all(tasks).then(function () { save('photoMeta'); renderPhotos(); toast(done > 0 ? dict.photoAdded.replace('{n}', done) : dict.imgFail); });
  });
  $('#photoGrid').addEventListener('click', function (e) { const btn = e.target.closest('.photo[data-id]'); if (btn) openLightbox(btn.dataset.id); });
  let lightboxId = null;
  function openLightbox(id) {
    const meta = photoMeta.find(function (x) { return x.id === id; }); if (!meta) return; lightboxId = id;
    loadPhotoSrc(id).then(function (src) { if (!src) { toast((window.I18N[currentLang] || window.I18N['zh-TW']).imgFail); return; } $('#lightboxImg').src = src; $('#lightboxCaption').value = meta.title || ''; $('#lightbox').classList.add('open'); document.body.classList.add('lock'); });
  }
  function closeLightbox() { $('#lightbox').classList.remove('open'); lightboxId = null; if (!document.querySelector('.modal.open, .lightbox.open')) document.body.classList.remove('lock'); }
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') closeLightbox(); });
  $('#lightboxCaption').addEventListener('input', function () { if (!lightboxId) return; const meta = photoMeta.find(function (x) { return x.id === lightboxId; }); if (meta) { meta.title = $('#lightboxCaption').value; save('photoMeta'); } });
  $('#lightboxDel').addEventListener('click', function () { if (!lightboxId) return; const dict = window.I18N[currentLang] || window.I18N['zh-TW']; const id = lightboxId; photoMeta = photoMeta.filter(function (x) { return x.id !== id; }); delete photoCache[id]; save('photoMeta'); if (IDB.available()) IDB.del('photos', id).catch(function () {}); renderPhotos(); closeLightbox(); toast(dict.photoDeleted); });

  // ==========================================
  // 14. 番茄鐘
  // ==========================================
  let pomoState = 'idle'; 
  let pomoRemaining = 0;
  let pomoTotalSet = 25 * 60;
  let pomoInterval = null;
  
  const pomoTimeDisplay = $('#pomoTimeDisplay');
  const pomoEditor = $('#pomoEditor');
  const pomoBtnLeft = $('#pomoBtnLeft');
  const pomoBtnRight = $('#pomoBtnRight');
  
  let audioCtx = null; let customAudioData = null; let soundType = LS.get('pomoSoundType', 'synth'); let pomoVolume = LS.get('pomoVolume', 70);

  function loadCustomAudio() {
    if (!IDB.available()) return Promise.resolve();
    return IDB.get('audio', 'pomo').then(function (rec) { if (rec && rec.data) { customAudioData = rec.data; } if (typeof updateSoundUI === 'function') updateSoundUI(); }).catch(function () {});
  }

  function initAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); }
  function playBell() {
    const vol = Math.max(0, Math.min(1, pomoVolume / 100));
    if (soundType === 'custom' && customAudioData) { try { const audio = new Audio(customAudioData); audio.volume = vol; audio.play().catch(function () {}); } catch (e) {} return; }
    if (!audioCtx) initAudio(); if (!audioCtx) return;
    try {
      const playNote = (freq, startTime, duration) => { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); osc.type = 'sine'; osc.frequency.value = freq; gain.gain.setValueAtTime(0, startTime); gain.gain.linearRampToValueAtTime(0.5 * vol, startTime + 0.05); gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration); osc.start(startTime); osc.stop(startTime + duration); };
      playNote(880, audioCtx.currentTime, 0.4); playNote(1046.50, audioCtx.currentTime + 0.15, 0.6); playNote(880, audioCtx.currentTime + 0.45, 0.4); playNote(1046.50, audioCtx.currentTime + 0.6, 0.8);
    } catch (e) {}
  }

  function formatPomoTime(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  function updatePomoUI() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    pomoTimeDisplay.textContent = formatPomoTime(pomoRemaining);
    pomoTimeDisplay.style.display = 'flex';
    pomoEditor.classList.remove('active');
    
    if (pomoState === 'idle') {
      pomoBtnLeft.textContent = dict.pomoStart;
      pomoBtnLeft.className = 'pomo-btn start';
      pomoBtnLeft.disabled = pomoRemaining === 0;
      
      pomoBtnRight.textContent = dict.pomoReset;
      pomoBtnRight.className = 'pomo-btn stop';
    } else if (pomoState === 'running') {
      pomoBtnLeft.textContent = dict.pomoPause;
      pomoBtnLeft.className = 'pomo-btn pause';
      pomoBtnLeft.disabled = false;
      
      pomoBtnRight.textContent = dict.pomoStop;
      pomoBtnRight.className = 'pomo-btn stop';
    } else if (pomoState === 'paused') {
      pomoBtnLeft.textContent = dict.pomoResume;
      pomoBtnLeft.className = 'pomo-btn resume';
      pomoBtnLeft.disabled = false;
      
      pomoBtnRight.textContent = dict.pomoStop;
      pomoBtnRight.className = 'pomo-btn stop';
    }
  }

  function getInputSecs() {
    const h = parseInt($('#pomoInpH').value, 10) || 0;
    const m = parseInt($('#pomoInpM').value, 10) || 0;
    const s = parseInt($('#pomoInpS').value, 10) || 0;
    let total = h * 3600 + m * 60 + s;
    if (total > 99 * 3600 + 99 * 60 + 99) total = 99 * 3600 + 99 * 60 + 99;
    return total;
  }

  function savePomoSettings() {
    const total = getInputSecs();
    pomoTotalSet = total;
    pomoRemaining = total;
    LS.set('pomoDuration', total);
    updatePomoUI();
  }

   pomoTimeDisplay.addEventListener('click', function (e) {
    e.stopPropagation();
    if (pomoState !== 'idle') return;
    
    const h = Math.floor(pomoRemaining / 3600);
    const m = Math.floor((pomoRemaining % 3600) / 60);
    const s = pomoRemaining % 60;
    $('#pomoInpH').value = pad(h);
    $('#pomoInpM').value = pad(m);
    $('#pomoInpS').value = pad(s);
    
    pomoTimeDisplay.style.display = 'none';
    pomoEditor.classList.add('active');
    $('#pomoInpM').focus();
  });

  $$('.pomo-arrow').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const unit = this.dataset.unit;
      const act = this.dataset.act;
      const inp = unit === 'h' ? $('#pomoInpH') : (unit === 'm' ? $('#pomoInpM') : $('#pomoInpS'));
      let val = parseInt(inp.value, 10) || 0;
      if (act === 'up') { val = Math.min(99, val + 1); } 
      else { val = Math.max(0, val - 1); }
      inp.value = pad(val);
      
      const tempTotal = getInputSecs();
      pomoTimeDisplay.textContent = formatPomoTime(tempTotal);
    });
  });

  $('#pomoInpH').addEventListener('change', function() { this.value = pad(Math.min(99, Math.max(0, parseInt(this.value,10)||0))); pomoTimeDisplay.textContent = formatPomoTime(getInputSecs()); });
  $('#pomoInpM').addEventListener('change', function() { this.value = pad(Math.min(99, Math.max(0, parseInt(this.value,10)||0))); pomoTimeDisplay.textContent = formatPomoTime(getInputSecs()); });
  $('#pomoInpS').addEventListener('change', function() { this.value = pad(Math.min(99, Math.max(0, parseInt(this.value,10)||0))); pomoTimeDisplay.textContent = formatPomoTime(getInputSecs()); });

  function closePomoEditor() {
    if (pomoEditor.classList.contains('active')) {
      savePomoSettings();
      pomoEditor.classList.remove('active');
      pomoTimeDisplay.style.display = 'flex';
    }
  }

  pomoEditor.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  function startPomoTimer() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    pomoState = 'running';
    updatePomoUI();
    pomoInterval = setInterval(function() {
      pomoRemaining--;
      pomoTimeDisplay.textContent = formatPomoTime(pomoRemaining);
      if (pomoRemaining <= 0) {
        clearInterval(pomoInterval);
        pomoState = 'idle';
        pomoRemaining = pomoTotalSet;
        updatePomoUI();
        playBell();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        toast(dict.pomoTimeUp);
      }
    }, 1000);
  }

  pomoBtnLeft.addEventListener('click', function() {
    initAudio();
    
    if (pomoEditor.classList.contains('active')) {
      closePomoEditor();
      return;
    }
    
    if (pomoState === 'idle') {
      if (pomoRemaining <= 0) return;
      startPomoTimer();
    } else if (pomoState === 'running') {
      clearInterval(pomoInterval);
      pomoState = 'paused';
      updatePomoUI();
    } else if (pomoState === 'paused') {
      startPomoTimer();
    }
  });

  pomoBtnRight.addEventListener('click', function() {
    if (pomoEditor.classList.contains('active')) {
      closePomoEditor();
      return;
    }
    
    clearInterval(pomoInterval);
    
    if (pomoState === 'idle') {
      pomoTotalSet = 0;
      pomoRemaining = 0;
      LS.set('pomoDuration', 0);
      updatePomoUI();
    } else {
      pomoState = 'idle';
      pomoRemaining = pomoTotalSet; 
      updatePomoUI();
    }
  });

  const savedDur = LS.get('pomoDuration', null);
  if (savedDur !== null && savedDur >= 0) {
    pomoTotalSet = savedDur;
    pomoRemaining = savedDur;
  }
  updatePomoUI();

  function updateSoundUI() { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; $$('input[name="soundType"]').forEach(function (r) { r.checked = (r.value === soundType); }); $('#soundFileName').textContent = customAudioData ? dict.pomoCustomLoaded : dict.pomoSoundNoFile; }
  $('#pomoSoundBtn').addEventListener('click', function () { updateSoundUI(); openModal('#soundModal'); });
  $('#soundFilePick').addEventListener('click', function () { $('#soundFileInput').click(); });
  $('#soundFileInput').addEventListener('change', function (e) { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; if (file.size > 1024 * 1024) { toast(dict.pomoAudioTooBig); return; } const reader = new FileReader(); reader.onload = function (ev) { customAudioData = ev.target.result; $('#soundFileName').textContent = file.name; $$('input[name="soundType"]').forEach(function (r) { if (r.value === 'custom') r.checked = true; }); toast(dict.pomoAudioLoaded); }; reader.readAsDataURL(file); });
  $('#soundSaveBtn').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const selected = $('input[name="soundType"]:checked').value; if (selected === 'custom' && !customAudioData) { toast(dict.pomoSoundNoFile); return; }
    soundType = selected; LS.set('pomoSoundType', soundType);
    if (IDB.available()) { if (customAudioData) { IDB.put('audio', { id: 'pomo', data: customAudioData }).catch(function () {}); } else { IDB.del('audio', 'pomo').catch(function () {}); } }
    closeModal('#soundModal'); toast(dict.pomoSoundSaved); initAudio(); playBell();
  });
  function updateVolumeUI() { $('#pomoVolume').value = pomoVolume; $('#pomoVolumeVal').textContent = pomoVolume; }
  $('#pomoVolume').addEventListener('input', function () { pomoVolume = parseInt(this.value, 10); $('#pomoVolumeVal').textContent = pomoVolume; LS.set('pomoVolume', pomoVolume); });
  updateVolumeUI();

  $('#pomoFab').addEventListener('click', function () { $('#pomoPanel').classList.toggle('open'); });

  document.addEventListener('click', function(e) {
    if (pomoEditor.classList.contains('active') && !pomoEditor.contains(e.target) && !pomoTimeDisplay.contains(e.target)) {
      closePomoEditor();
    }
  });

  // ==========================================
  // 15. 設定面板與備份
  // ==========================================
  const settings = $('#settings'); const gearBtn = $('#gearBtn');
  function openSettings() { settings.classList.add('open'); gearBtn.classList.add('open'); }
  function closeSettings() { settings.classList.remove('open'); gearBtn.classList.remove('open'); }
  gearBtn.addEventListener('click', function (e) { e.stopPropagation(); if (settings.classList.contains('open')) closeSettings(); else openSettings(); });
  document.addEventListener('click', function (e) { if (settings.classList.contains('open') && !settings.contains(e.target) && !gearBtn.contains(e.target)) closeSettings(); });
  $('#lumRange').addEventListener('input', function () { state.lum = parseFloat(this.value); applyTheme(); savePrefs(); });
  $('#pickBg').addEventListener('click', function () { $('#bgFileInput').click(); });
  $('#clearBg').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; state.bg = null; applyTheme(); savePrefs(); toast(dict.bgRemoved); });
  $('#bgFileInput').addEventListener('change', function (e) { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; toast(dict.imgProcessing); compressImage(file, 1600, 0.8).then(function (data) { state.bg = data; applyTheme(); savePrefs(); toast(dict.bgApplied); }).catch(function () { toast(dict.imgFail); }); });
  $('#themeToggle').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; state.lum = state.lum > 50 ? 15 : 85; applyTheme(); savePrefs(); toast(state.lum > 50 ? dict.themeLight : dict.themeDark); });
  
  $('#mainCurrencySelect').value = mainCurrency;
  $('#mainCurrencySelect').addEventListener('change', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    mainCurrency = this.value; LS.set('mainCurrency', mainCurrency); renderLedger(); renderHome(); toast(dict.currencyChanged.replace('{c}', mainCurrency));
  });

  const BACKUP_VERSION = 2;
  function exportData() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const exportPhotos = photoMeta.map(function (m) { return loadPhotoSrc(m.id).then(function (src) { return { id: m.id, title: m.title || '', src: src || '' }; }); });
    Promise.all(exportPhotos).then(function (photosData) {
      const data = { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), todos: todos, events: events, diaries: diaries, notes: notes, photos: photosData, goals: goals, bookmarks: bookmarks, ledger: ledger, countdowns: countdowns, ledgerCategories: ledgerCategories, prefs: { lum: state.lum, bg: state.bg }, pomoSoundType: soundType };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'my_space_backup_' + todayKey() + '.json'; a.click(); URL.revokeObjectURL(url); toast(dict.exporting);
    });
  }
  $('#exportBtn').addEventListener('click', exportData); $('#aboutExportBtn').addEventListener('click', exportData);

  $('#clearAllBtn').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    customConfirm(dict.confirmClearTitle, dict.confirmClearMsg, dict.confirmClearOk, dict.cancel, true).then(function (ok1) {
      if (!ok1) return;
      customConfirm(dict.confirmClear2Title, dict.confirmClear2Msg, dict.confirmClear2Ok, dict.cancel, true).then(function (ok2) {
        if (!ok2) return;
        try { localStorage.clear(); } catch (e) {}
        accessToken = null;
        if (typeof updateGoogleUI === 'function') updateGoogleUI();
        document.cookie.split(';').forEach(function (c) { document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/'); });
        if (IDB.available()) { ['photos', 'audio'].forEach(function (store) { IDB.getAll(store).then(function (rows) { rows.forEach(function (r) { IDB.del(store, r.id).catch(function () {}); }); }).catch(function () {}); }); }
        toast(dict.clearedReload); setTimeout(function () { location.reload(); }, 1500);
      });
    });
  });

  function validateBackup(data) {
    if (!data || typeof data !== 'object') return 'Invalid format';
    if (data.version != null && typeof data.version !== 'number') return 'Invalid version';
    const checks = [['todos', function (v) { return v && typeof v === 'object' && !Array.isArray(v); }], ['events', function (v) { return v && typeof v === 'object' && !Array.isArray(v); }], ['diaries', isArray], ['notes', isArray], ['photos', isArray], ['goals', isArray], ['bookmarks', isArray], ['ledger', isArray], ['countdowns', isArray]];
    for (let i = 0; i < checks.length; i++) { const key = checks[i][0]; const fn = checks[i][1]; if (data[key] !== undefined && !fn(data[key])) return 'Invalid ' + key; }
    if (data.photos) { for (let i = 0; i < data.photos.length; i++) { const p = data.photos[i]; if (!p || !isNonEmptyString(p.id) || typeof p.src !== 'string') return 'Invalid photo data'; } }
    return null;
  }
  $('#importBtn').addEventListener('click', function () { $('#importFileInput').click(); });
  $('#importFileInput').addEventListener('change', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return;
    if (file.size > 60 * 1024 * 1024) { toast(dict.importTooLarge); return; }
    const reader = new FileReader();
    reader.onload = function (ev) {
      let data; try { data = JSON.parse(ev.target.result); } catch (err) { toast(dict.importParseFail); return; }
      const err = validateBackup(data); if (err) { toast(dict.importInvalid.replace('{e}', err)); return; }
      customConfirm(dict.confirmImportTitle, dict.confirmImportMsg, dict.confirmImportOk, dict.cancel, true).then(function (ok) {
        if (!ok) return;
        if (data.todos) todos = migrateTodos(data.todos); if (data.events) events = data.events; if (data.diaries) diaries = data.diaries; if (data.notes) notes = data.notes; if (data.goals) goals = data.goals; if (data.bookmarks) bookmarks = data.bookmarks; if (data.countdowns) countdowns = data.countdowns;
        if (data.ledgerCategories) ledgerCategories = data.ledgerCategories;
        if (data.ledger) ledger = data.ledger; else if (data.expenses) ledger = data.expenses.map(function (x) { return Object.assign({}, x, { type: 'expense' }); });
        photoMeta = [];
        const photoWrites = (data.photos || []).map(function (p) { photoMeta.push({ id: p.id, title: p.title || '' }); if (IDB.available() && p.src) { photoCache[p.id] = p.src; return IDB.put('photos', { id: p.id, src: p.src }).catch(function () {}); } return Promise.resolve(); });
        if (data.prefs) { if (typeof data.prefs.lum === 'number') state.lum = Math.min(100, Math.max(0, data.prefs.lum)); if (typeof data.prefs.bg === 'string') state.bg = data.prefs.bg || null; applyTheme(); savePrefs(); }
        if (data.pomoSoundType === 'synth' || data.pomoSoundType === 'custom') { soundType = data.pomoSoundType; LS.set('pomoSoundType', soundType); }
        Promise.all(photoWrites).then(function () {
          ['todos', 'events', 'diaries', 'notes', 'goals', 'bookmarks', 'ledger', 'countdowns', 'ledgerCategories'].forEach(save); save('photoMeta'); pruneEvents(); pruneDone();
          renderTodos(); renderCalendar(); renderDiaries(); renderNotes(); renderPhotos(); renderGoals(); renderBookmarks(); renderLedger(); renderHome();
          toast(dict.importing); closeSettings();
        });
      });
    };
    reader.readAsText(file);
  });

  // ==========================================
  // 16. Google Drive 雲端備份邏輯
  // ==========================================
  const CLIENT_ID = '355931371376-sdu9qo95t0ghojgsb6eicqgc5nd6i31o.apps.googleusercontent.com';
  const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
  let tokenClient = null;
  let accessToken = null;
  // [NEW] 啟動時還原 Token（含過期檢查）
  try {
    const savedTok = LS.get('googleToken', null);
    const savedExp = LS.get('googleTokenExp', 0);
    if (savedTok && savedExp && Date.now() < savedExp - 60000) {
      accessToken = savedTok;
    } else if (savedTok) {
      LS.remove('googleToken'); LS.remove('googleTokenExp');
      accessToken = null;
    }
  } catch (e) { accessToken = null; }

  // [NEW] 統一清除 Token 並更新 UI
  function clearGoogleToken() {
    accessToken = null;
    try { LS.remove('googleToken'); LS.remove('googleTokenExp'); } catch (e) {}
    if (typeof updateGoogleUI === 'function') updateGoogleUI();
  }

  const gLoginBtn = $('#gLoginBtn');
  const gBackupBtn = $('#gBackupBtn');
  const gRestoreBtn = $('#gRestoreBtn');
  const gStatus = $('#gStatus');
  const gActionWrap = $('#gActionWrap');

  function updateGoogleUI() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    if (accessToken) {
      gLoginBtn.style.display = 'none';
      gActionWrap.style.display = 'flex';
      gStatus.textContent = dict.gStatusConnected;
      gStatus.style.color = 'var(--income-color)';
    } else {
      gLoginBtn.style.display = 'block';
      gActionWrap.style.display = 'none';
      gStatus.textContent = dict.gStatusNone;
      gStatus.style.color = 'var(--fg-dim)';
    }
  }

  function initGoogleAuth() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    if (typeof google === 'undefined') {
      gStatus.textContent = dict.gLoadingFail;
      return;
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        const d = window.I18N[currentLang] || window.I18N['zh-TW'];
        if (tokenResponse && tokenResponse.access_token) {
          accessToken = tokenResponse.access_token;
          // [NEW] 持久化 Token 與到期時間（預設 3600 秒，扣 60 秒緩衝）
          const expiresIn = (tokenResponse.expires_in || 3600) * 1000;
          try {
            LS.set('googleToken', accessToken);
            LS.set('googleTokenExp', Date.now() + expiresIn);
          } catch (e) {}
          updateGoogleUI();
          toast(d.gLoginOk);
        } else {
          toast(d.gLoginFail);
        }
      },
    });
    gLoginBtn.addEventListener('click', () => {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  window.addEventListener('load', () => {
    setTimeout(initGoogleAuth, 1000);
  });

  gBackupBtn.addEventListener('click', async () => {
    if (!accessToken) return;
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    toast(dict.gBackupUploading);
    try {
      const exportPhotos = photoMeta.map(function (m) { return loadPhotoSrc(m.id).then(function (src) { return { id: m.id, title: m.title || '', src: src || '' }; }); });
      const photosData = await Promise.all(exportPhotos);
      const data = { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), todos: todos, events: events, diaries: diaries, notes: notes, photos: photosData, goals: goals, bookmarks: bookmarks, ledger: ledger, countdowns: countdowns, ledgerCategories: ledgerCategories, prefs: { lum: state.lum, bg: state.bg }, pomoSoundType: soundType };
      const jsonString = JSON.stringify(data);

      const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      if (searchRes.status === 401) { clearGoogleToken(); toast(dict.gTokenExpired); return; }
      const searchData = await searchRes.json();
      let fileId = null;
      if (searchData.files && searchData.files.length > 0) {
        fileId = searchData.files[0].id;
      }

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";
      
      let metadata = { name: 'my_space_backup.json', mimeType: 'application/json' };
      if (!fileId) metadata.parents = ['appDataFolder'];
      
      const multipartRequestBody =
        delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + 
        delimiter + 'Content-Type: application/json\r\n\r\n' + jsonString + 
        close_delim;

      let url = 'https://www.googleapis.com/upload/drive/v3/files';
      let method = 'POST';
      if (fileId) { url += '/' + fileId; method = 'PATCH'; }
      url += '?uploadType=multipart';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      if (res.ok) {
        toast(dict.gBackupOk);
      } else if (res.status === 401) {
        clearGoogleToken();
        toast(dict.gTokenExpired);
      } else {
        toast(dict.gBackupFail);
      }
    } catch (err) {
      console.error(err);
      toast(dict.gBackupFailNetwork);
    }
  });

  gRestoreBtn.addEventListener('click', async () => {
    if (!accessToken) return;
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const ok = await customConfirm(dict.gConfirmRestoreTitle, dict.gConfirmRestoreMsg, dict.gConfirmRestoreOk, dict.cancel, true);
    if (!ok) return;

    toast(dict.gRestoreDownloading);
    try {
      const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      if (searchRes.status === 401) { clearGoogleToken(); toast(dict.gTokenExpired); return; }
      const searchData = await searchRes.json();
      if (!searchData.files || searchData.files.length === 0) { toast(dict.gRestoreEmpty); return; }
      
      const fileId = searchData.files[0].id;
      const fileRes = await fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      if (fileRes.status === 401) { clearGoogleToken(); toast(dict.gTokenExpired); return; }
      const data = await fileRes.json();

      if (data.todos) todos = migrateTodos(data.todos); 
      if (data.events) events = data.events; 
      if (data.diaries) diaries = data.diaries; 
      if (data.notes) notes = data.notes; 
      if (data.goals) goals = data.goals; 
      if (data.bookmarks) bookmarks = data.bookmarks; 
      if (data.countdowns) countdowns = data.countdowns;
      if (data.ledgerCategories) ledgerCategories = data.ledgerCategories;
      if (data.ledger) ledger = data.ledger; else if (data.expenses) ledger = data.expenses.map(x => Object.assign({}, x, { type: 'expense' }));
      
      photoMeta = [];
      const photoWrites = (data.photos || []).map(p => { 
        photoMeta.push({ id: p.id, title: p.title || '' }); 
        if (IDB.available() && p.src) { photoCache[p.id] = p.src; return IDB.put('photos', { id: p.id, src: p.src }).catch(()=>{}); } 
        return Promise.resolve(); 
      });
      
      if (data.prefs) { if (typeof data.prefs.lum === 'number') state.lum = Math.min(100, Math.max(0, data.prefs.lum)); if (typeof data.prefs.bg === 'string') state.bg = data.prefs.bg || null; applyTheme(); savePrefs(); }
      if (data.pomoSoundType === 'synth' || data.pomoSoundType === 'custom') { soundType = data.pomoSoundType; LS.set('pomoSoundType', soundType); }

      await Promise.all(photoWrites);
      ['todos', 'events', 'diaries', 'notes', 'goals', 'bookmarks', 'ledger', 'countdowns', 'ledgerCategories'].forEach(save); save('photoMeta'); pruneEvents(); pruneDone();
      renderTodos(); renderCalendar(); renderDiaries(); renderNotes(); renderPhotos(); renderGoals(); renderBookmarks(); renderLedger(); renderHome();
      toast(dict.gRestoreOk);
    } catch (err) {
      console.error(err);
      toast(dict.gRestoreFail);
    }
  });

  updateGoogleUI();

  // ==========================================
  // 17. 初始化與 Landing Page 切換
  // ==========================================
  $$('[data-close]').forEach(function (btn) { btn.addEventListener('click', function () { closeModal(btn.dataset.close); }); });
  $$('.modal').forEach(function (m) { m.addEventListener('click', function (e) { if (e.target === m) closeModal('#' + m.id); }); });

  if (!STORAGE_OK) { setTimeout(function () { toast((window.I18N[currentLang] || window.I18N['zh-TW']).storageNo); }, 900); }
  loadPrefs(); applyTheme(); pruneEvents(); pruneDone();

  // [NEW] 初始化語言與切換按鈕
  currentLang = LS.get('userLang', 'zh-TW'); 
  applyLanguage(currentLang);

  // [NEW] 多語系輪替函式
  const LANG_CYCLE = ['zh-TW', 'en', 'ja'];
  function cycleLanguage() {
    const currentIndex = LANG_CYCLE.indexOf(currentLang);
    currentLang = LANG_CYCLE[(currentIndex + 1) % LANG_CYCLE.length];
    applyLanguage(currentLang);
    toast(window.I18N[currentLang].welcomeLangSwitched);
  }

  // [NEW] 主程式語系切換
  const langSwitchBtn = $('#langSwitchBtn');
  if (langSwitchBtn && !langSwitchBtn.dataset.bound) {
    langSwitchBtn.dataset.bound = '1';
    langSwitchBtn.addEventListener('click', cycleLanguage);
  }

  // [NEW] Landing Page 語系切換
  const landingLangBtn = $('#landingLangBtn');
  if (landingLangBtn && !landingLangBtn.dataset.bound) {
    landingLangBtn.dataset.bound = '1';
    landingLangBtn.addEventListener('click', cycleLanguage);
  }

  function safeRender(name, fn) {
    try { fn(); } catch (e) { console.warn('初始化渲染失敗：' + name, e); }
  }
  safeRender('home', renderHome);
  safeRender('todos', renderTodos);
  safeRender('calendar', renderCalendar);
  safeRender('diaries', renderDiaries);
  safeRender('notes', renderNotes);
  safeRender('photos', renderPhotos);
  safeRender('goals', renderGoals);
  safeRender('bookmarks', renderBookmarks);
  safeRender('ledger', renderLedger);

  Promise.all([loadCustomAudio(), migrateLegacyPhotos()]).then(function () {
    if (typeof updateSoundUI === 'function') updateSoundUI();
    renderPhotos();
  }).catch(function () {});

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              const banner = $('#updateBanner');
              if (banner) banner.hidden = false;
            }
          };
        };
      }).catch((err) => { console.log('SW registration failed:', err); });
    });
  }

  (function initUpdateBanner() {
    const banner = $('#updateBanner'); if (!banner) return;
    const applyBtn = $('#updateBannerApply'); const laterBtn = $('#updateBannerLater'); const closeBtn = $('#updateBannerClose');
    if (applyBtn) applyBtn.addEventListener('click', function () { window.location.reload(); });
    if (laterBtn) laterBtn.addEventListener('click', function () { banner.hidden = true; });
    if (closeBtn) closeBtn.addEventListener('click', function () { banner.hidden = true; });
  })();

  // [NEW] 處理未登入時的公開 Landing Page 顯示邏輯
  (function initPublicLanding() {
    const landing = document.getElementById('public-landing');
    const nav = document.querySelector('.nav');
    const appMain = document.querySelector('.app');
    const mobileNav = document.querySelector('.mobile-nav');
    const pomoFab = document.getElementById('pomoFab');

    // 定義全域切換函數（供 HTML onclick 呼叫）
    window.enterDashboard = function() {
      if (landing) landing.style.display = 'none';
      if (nav) nav.style.display = 'flex';
      if (appMain) appMain.style.display = 'flex';
      if (mobileNav && window.innerWidth <= 768) mobileNav.style.display = 'flex';
      if (pomoFab) pomoFab.style.display = 'flex';
      if (typeof renderHome === 'function') renderHome();
      
      // 記錄已進入狀態，避免下次重整又卡在 Landing Page
      try { localStorage.setItem('guestEntered', 'true'); } catch(err) {}
    };

    const showLanding = () => {
      if (landing) landing.style.display = 'flex';
      if (nav) nav.style.display = 'none';
      if (appMain) appMain.style.display = 'none';
      if (mobileNav) mobileNav.style.display = 'none';
      if (pomoFab) pomoFab.style.display = 'none';
    };

    // 決定初始畫面（以 accessToken 為單一真相來源，過期已在啟動時清除）
    const hasToken = !!accessToken;
    const isGuest = localStorage.getItem('guestEntered') === 'true';

    // 如果已經有 Token，或者訪客已經點過「進入儀表板」，就直接顯示主程式
    if (hasToken || isGuest) {
      window.enterDashboard();
    } else {
      showLanding();
    }
  })();

})(); // <- 這裡是補齊的結尾，非常重要！