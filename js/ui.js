// js/ui.js
let currentLang = LS.get('userLang', 'zh-TW');
let currentView = 'home';

// ==========================================
// 語言切換與初始化
// ==========================================
function applyLanguage(lang) {
  if (!window.I18N || !window.I18N[lang]) return;
  const dict = window.I18N[lang];
  
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

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  const nextLangMap = { 'zh-TW': 'EN', 'en': '日本語', 'ja': '中文' };
  const switchBtn = $('#langSwitchBtn');
  if (switchBtn) switchBtn.textContent = nextLangMap[lang] || 'EN';
  const landingLangBtn = $('#landingLangBtn');
  if (landingLangBtn) landingLangBtn.textContent = nextLangMap[lang] || 'EN';

  // 重新渲染所有動態內容 (使用 typeof 檢查，避免模組還沒載入時報錯)
  if (typeof updateClock === 'function') updateClock();
  if (typeof initWeather === 'function') initWeather();
  if (typeof updateQuote === 'function') updateQuote(); 
  if (typeof renderHome === 'function') renderHome();
  if (typeof renderTodos === 'function') renderTodos();
  if (typeof renderCalendar === 'function') renderCalendar();
  if (typeof renderDiaries === 'function') renderDiaries();
  if (typeof renderNotes === 'function') renderNotes();
  if (typeof renderPhotos === 'function') renderPhotos();
  if (typeof renderGoals === 'function') renderGoals();
  if (typeof renderBookmarks === 'function') renderBookmarks();
  if (typeof renderLedger === 'function') renderLedger();
  if (typeof renderTrash === 'function') renderTrash();

  LS.set('userLang', lang);
}

// 語言切換按鈕
const LANG_CYCLE = ['zh-TW', 'en', 'ja'];
function cycleLanguage() {
  const currentIndex = LANG_CYCLE.indexOf(currentLang);
  currentLang = LANG_CYCLE[(currentIndex + 1) % LANG_CYCLE.length];
  applyLanguage(currentLang);
  if (window.I18N[currentLang].welcomeLangSwitched) {
    toast(window.I18N[currentLang].welcomeLangSwitched);
  }
}

// ==========================================
// 視圖切換與導覽列
// ==========================================
const views = $$('.view'); const navBtns = $$('.nav-btn'); const mobileNavBtns = $$('.mobile-nav-btn'); const mobileMoreMenu = $('#mobileMoreMenu');

function showView(name) {
  currentView = name;
  views.forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + name); });
  navBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.view === name); });
  mobileNavBtns.forEach(function (b) { if (name === 'notes' || name === 'photos' || name === 'ledger' || name === 'about' || name === 'trash') { b.classList.toggle('active', b.dataset.view === 'more'); } else { b.classList.toggle('active', b.dataset.view === name); } });
  if (name !== 'notes' && name !== 'photos' && name !== 'ledger' && name !== 'about' && name !== 'trash') mobileMoreMenu.classList.remove('open');
  
  // 如果有計時器需要暫停可以放在這裡 (例如首頁的倒數計時)
  if (name !== 'home' && typeof cdInterval !== 'undefined' && cdInterval) { clearInterval(cdInterval); cdInterval = null; }
  
  if (name === 'todo' && typeof checkUnfinishedTasks === 'function') checkUnfinishedTasks();
  if (name === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
  if (name === 'home' && typeof renderHome === 'function') renderHome();
  if (name === 'diary' && typeof renderDiaries === 'function') renderDiaries();
  if (name === 'ledger' && typeof renderLedger === 'function') renderLedger();
  if (name === 'photos' && typeof renderPhotos === 'function') renderPhotos();
  if (name === 'trash' && typeof renderTrash === 'function') renderTrash();
  
  if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 搜尋列與快捷鍵
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

// ==========================================
// 設定面板
// ==========================================
const settings = $('#settings'); const gearBtn = $('#gearBtn');
function openSettings() { settings.classList.add('open'); gearBtn.classList.add('open'); }
function closeSettings() { settings.classList.remove('open'); gearBtn.classList.remove('open'); }

// ==========================================
// 初始化所有 UI 事件綁定
// ==========================================
function initUI() {
  // 導覽列連結
  $('#navLinks').addEventListener('click', function (e) { const btn = e.target.closest('.nav-btn'); if (btn) showView(btn.dataset.view); });

  // 選單 (更多)
  const navMoreBtn = $('#navMoreBtn'); const navMoreMenu = $('#navMoreMenu');
  if (navMoreBtn && navMoreMenu) {
    navMoreBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      navMoreMenu.classList.toggle('open');
    });
    navMoreMenu.addEventListener('click', function (e) { const btn = e.target.closest('button'); if (btn) { e.stopPropagation(); showView(btn.dataset.view); navMoreMenu.style.display = 'none'; } });
    document.addEventListener('click', function (e) { if (navMoreMenu.style.display === 'flex' && !navMoreMenu.contains(e.target) && e.target !== navMoreBtn) navMoreMenu.style.display = 'none'; });
  }

  // 手機版導覽列
  mobileNavBtns.forEach(function (btn) { btn.addEventListener('click', function () { const view = this.dataset.view; if (view === 'more') { mobileMoreMenu.classList.toggle('open'); } else { showView(view); } }); });
  mobileMoreMenu.addEventListener('click', function (e) { const btn = e.target.closest('button'); if (btn) { showView(btn.dataset.view); mobileMoreMenu.classList.remove('open'); } });
  document.addEventListener('click', function (e) { if (mobileMoreMenu.classList.contains('open') && !mobileMoreMenu.contains(e.target) && !e.target.closest('.mobile-nav-btn[data-view="more"]')) mobileMoreMenu.classList.remove('open'); });

  // Logo 回首頁
  $('#logoBtn').addEventListener('click', function () { showView('home'); closeSettings(); });
  $$('[data-go]').forEach(function (el) { el.addEventListener('click', function () { showView(el.dataset.go); }); });

  // 搜尋
  $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); doSearch($('#searchInput').value); $('#searchInput').value = ''; $('#searchInput').blur(); });

  // 設定齒輪
  gearBtn.addEventListener('click', function (e) { e.stopPropagation(); if (settings.classList.contains('open')) closeSettings(); else openSettings(); });
  document.addEventListener('click', function (e) { if (settings.classList.contains('open') && !settings.contains(e.target) && !gearBtn.contains(e.target)) closeSettings(); });

  // 語言切換按鈕
  const langSwitchBtn = $('#langSwitchBtn');
  if (langSwitchBtn && !langSwitchBtn.dataset.bound) {
    langSwitchBtn.dataset.bound = '1';
    langSwitchBtn.addEventListener('click', cycleLanguage);
  }
  const landingLangBtn = $('#landingLangBtn');
  if (landingLangBtn && !landingLangBtn.dataset.bound) {
    landingLangBtn.dataset.bound = '1';
    landingLangBtn.addEventListener('click', cycleLanguage);
  }

  // 彈窗關閉按鈕
  $$('[data-close]').forEach(function (btn) { btn.addEventListener('click', function () { closeModal(btn.dataset.close); }); });
  $$('.modal').forEach(function (m) { m.addEventListener('click', function (e) { if (e.target === m) closeModal('#' + m.id); }); });

  // 快捷鍵
  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSettings();
      const pomoPanel = $('#pomoPanel'); if (pomoPanel) pomoPanel.classList.remove('open');
      if (typeof closePomoEditor === 'function') closePomoEditor();
      $$('.modal.open').forEach(function (m) { closeModal('#' + m.id); });
      const lb = $('#lightbox'); if (lb && lb.classList.contains('open') && typeof closeLightbox === 'function') closeLightbox();
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      $('#searchInput').focus();
      return;
    }

    if ((e.key === 'n' || e.key === 'N') && (currentView === 'home' || currentView === 'notes')) {
      e.preventDefault();
      if (typeof openNoteModal === 'function') openNoteModal(null);
      return;
    }

    if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
      e.preventDefault();
      const viewsMap = { '1': 'home', '2': 'todo', '3': 'calendar', '4': 'diary', '5': 'notes', '6': 'ledger' };
      showView(viewsMap[e.key]);
      return;
    }
  });

  // 年份
  const copyrightEl = document.getElementById('copyrightYear');
  if (copyrightEl) copyrightEl.textContent = new Date().getFullYear();
}

// ==========================================
// Landing Page 顯示邏輯
// ==========================================
function initPublicLanding() {
  const landingEl = document.getElementById('public-landing');
  const navEl = document.querySelector('.nav');
  const appMainEl = document.querySelector('.app');
  const mobileNavEl = document.querySelector('.mobile-nav');
  const pomoFabEl = document.getElementById('pomoFab');

  window.enterDashboard = function() {
    if (landingEl) landingEl.style.setProperty('display', 'none', 'important');
    if (navEl) navEl.style.setProperty('display', 'flex', 'important');
    if (appMainEl) appMainEl.style.setProperty('display', 'flex', 'important');
    if (mobileNavEl && window.innerWidth <= 768) mobileNavEl.style.setProperty('display', 'flex', 'important');
    if (pomoFabEl) pomoFabEl.style.setProperty('display', 'flex', 'important');
    if (typeof renderHome === 'function') renderHome();
    try { localStorage.setItem('guestEntered', 'true'); } catch (err) {}
  };

  const showLanding = () => {
    if (landingEl) landingEl.style.setProperty('display', 'flex', 'important');
    if (navEl) navEl.style.setProperty('display', 'none', 'important');
    if (appMainEl) appMainEl.style.setProperty('display', 'none', 'important');
    if (mobileNavEl) mobileNavEl.style.setProperty('display', 'none', 'important');
    if (pomoFabEl) pomoFabEl.style.setProperty('display', 'none', 'important');
  };

  const hasToken = typeof accessToken !== 'undefined' && !!accessToken && localStorage.getItem('googleToken') !== null;
  const isGuest = localStorage.getItem('guestEntered') === 'true';

  if (hasToken || isGuest) {
    window.enterDashboard();
  } else {
    showLanding();
  }
  if (typeof updateGoogleUI === 'function') updateGoogleUI();
}