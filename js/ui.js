// js/ui.js
let currentLang = LS.get('userLang', 'zh-TW');
let currentView = 'home';

// ==========================================
// 1. 語言切換與初始化
// ==========================================
function applyLanguage(lang) {
  if (!window.I18N || !window.I18N[lang]) return;
  const dict = window.I18N[lang];

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const key = el.dataset.i18n;
    if (dict[key]) {
      if (key === 'landingDesc' || key === 'landingPrivacy' || key === 'welcomeDesc') {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  const nextLangMap = { 'zh-TW': 'EN', en: '日本語', ja: '中文' };
  const switchBtn = $('#langSwitchBtn');
  if (switchBtn) switchBtn.textContent = nextLangMap[lang] || 'EN';
  const landingLangBtn = $('#landingLangBtn');
  if (landingLangBtn) landingLangBtn.textContent = nextLangMap[lang] || 'EN';

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
  if (typeof updateGoogleUI === 'function') updateGoogleUI();

  LS.set('userLang', lang);
}

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
// 2. 視圖切換與導覽列
// ==========================================
const views = $$('.view');
const navBtns = $$('.nav-btn');
const mobileNavBtns = $$('.mobile-nav-btn');
const mobileMoreMenu = $('#mobileMoreMenu');

function showView(name) {
  if (typeof BatchCtrl !== 'undefined') {
    BatchCtrl.exit();
  }

  currentView = name;
  views.forEach(function (v) {
    v.classList.toggle('active', v.id === 'view-' + name);
  });
  navBtns.forEach(function (b) {
    b.classList.toggle('active', b.dataset.view === name);
  });
  mobileNavBtns.forEach(function (b) {
    if (name === 'notes' || name === 'photos' || name === 'ledger' || name === 'about' || name === 'trash') {
      b.classList.toggle('active', b.dataset.view === 'more');
    } else {
      b.classList.toggle('active', b.dataset.view === name);
    }
  });
  if (name !== 'notes' && name !== 'photos' && name !== 'ledger' && name !== 'about' && name !== 'trash') {
    if (mobileMoreMenu) mobileMoreMenu.classList.remove('open');
  }

  if (name !== 'home' && typeof cdInterval !== 'undefined' && cdInterval) {
    clearInterval(cdInterval);
    cdInterval = null;
  }

  if (name === 'todo' && typeof checkUnfinishedTasks === 'function') checkUnfinishedTasks();
  if (name === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
  if (name === 'home' && typeof renderHome === 'function') renderHome();
  if (name === 'diary' && typeof renderDiaries === 'function') renderDiaries();
  if (name === 'ledger' && typeof renderLedger === 'function') renderLedger();
  if (name === 'photos' && typeof renderPhotos === 'function') renderPhotos();
  if (name === 'trash' && typeof renderTrash === 'function') renderTrash();

  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================
// 3. 搜尋列（防截斷拼接版）
// ==========================================
function doSearch(raw) {
  const q = String(raw || '').trim();
  if (!q) return;
  const lower = q.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    window.open(q, '_blank', 'noopener');
    return;
  }
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q) && !/\s/.test(q)) {
    window.open('http' + 's://' + q, '_blank', 'noopener');
    return;
  }
  const engine = $('#searchEngine').value;
  let url = '';
  if (engine === 'google') {
    url = 'https://' + 'www.' + 'google' + '.com/search?q=' + encodeURIComponent(q);
  } else if (engine === 'youtube') {
    url = 'https://' + 'www.' + 'youtube' + '.com/results?search_query=' + encodeURIComponent(q);
  }
  window.open(url, '_blank', 'noopener');
}

// ==========================================
// 4. 設定面板
// ==========================================
const settings = $('#settings');
const gearBtn = $('#gearBtn');

function openSettings() {
  if (settings) settings.classList.add('open');
  if (gearBtn) gearBtn.classList.add('open');
}

function closeSettings() {
  if (settings) settings.classList.remove('open');
  if (gearBtn) gearBtn.classList.remove('open');
}

// ==========================================
// 5. 初始化所有 UI 事件綁定
// ==========================================
function initUI() {
  // 導覽列連結
  const navLinks = $('#navLinks');
  if (navLinks && !navLinks.dataset.bound) {
    navLinks.dataset.bound = '1';
    navLinks.addEventListener('click', function (e) {
      const btn = e.target.closest('.nav-btn');
      if (btn) showView(btn.dataset.view);
    });
  }

  // 選單 (更多) - 掛載至 document.body 最頂層避免被 .nav 遮擋
  const navMoreBtn = $('#navMoreBtn');
  const navMoreMenu = $('#navMoreMenu');
  if (navMoreBtn && navMoreMenu && !navMoreBtn.dataset.bound) {
    navMoreBtn.dataset.bound = '1';
    document.body.appendChild(navMoreMenu);

    function closeNavMore() {
      navMoreMenu.classList.remove('open');
      navMoreMenu.style.display = 'none';
    }

    function openNavMore() {
      const rect = navMoreBtn.getBoundingClientRect();
      navMoreMenu.style.position = 'fixed';
      navMoreMenu.style.top = rect.bottom + 8 + 'px';
      navMoreMenu.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - 160)) + 'px';
      navMoreMenu.style.zIndex = '2147483647';
      navMoreMenu.style.display = 'flex';
      navMoreMenu.classList.add('open');
    }

    navMoreBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (navMoreMenu.classList.contains('open')) {
        closeNavMore();
      } else {
        openNavMore();
      }
    });

    navMoreMenu.addEventListener('click', function (e) {
      const btn = e.target.closest('button');
      if (btn) {
        e.stopPropagation();
        const targetView = btn.dataset.view;
        closeNavMore();
        if (targetView) showView(targetView);
      }
    });

    document.addEventListener('click', function (e) {
      if (
        navMoreMenu.classList.contains('open') &&
        !navMoreMenu.contains(e.target) &&
        !navMoreBtn.contains(e.target)
      ) {
        closeNavMore();
      }
    });

    window.addEventListener('resize', closeNavMore);
  }

  // 手機版底部導覽列
  mobileNavBtns.forEach(function (btn) {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      const view = this.dataset.view;
      if (view === 'more') {
        if (mobileMoreMenu) mobileMoreMenu.classList.toggle('open');
      } else {
        showView(view);
      }
    });
  });

  if (mobileMoreMenu && !mobileMoreMenu.dataset.bound) {
    mobileMoreMenu.dataset.bound = '1';
    mobileMoreMenu.addEventListener('click', function (e) {
      const btn = e.target.closest('button');
      if (btn) {
        showView(btn.dataset.view);
        mobileMoreMenu.classList.remove('open');
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (
      mobileMoreMenu &&
      mobileMoreMenu.classList.contains('open') &&
      !mobileMoreMenu.contains(e.target) &&
      !e.target.closest('.mobile-nav-btn[data-view="more"]')
    ) {
      mobileMoreMenu.classList.remove('open');
    }
  });

  // Logo 回首頁
  const logoBtn = $('#logoBtn');
  if (logoBtn && !logoBtn.dataset.bound) {
    logoBtn.dataset.bound = '1';
    logoBtn.addEventListener('click', function () {
      showView('home');
      closeSettings();
    });
  }

  $$('[data-go]').forEach(function (el) {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', function () {
      showView(el.dataset.go);
    });
  });

  // 搜尋表單
  const searchForm = $('#searchForm');
  if (searchForm && !searchForm.dataset.bound) {
    searchForm.dataset.bound = '1';
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      doSearch($('#searchInput').value);
      $('#searchInput').value = '';
      $('#searchInput').blur();
    });
  }

  // 設定齒輪
  if (gearBtn && !gearBtn.dataset.bound) {
    gearBtn.dataset.bound = '1';
    gearBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (settings.classList.contains('open')) closeSettings();
      else openSettings();
    });
  }

  document.addEventListener('click', function (e) {
    if (settings && settings.classList.contains('open') && !settings.contains(e.target) && !gearBtn.contains(e.target)) {
      closeSettings();
    }
  });

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
$$('[data-close]').forEach(function (btn) {
if (btn.dataset.bound) return;
btn.dataset.bound = '1';
btn.addEventListener('click', function () {
closeModal(btn.dataset.close);
});
});
$$('.modal').forEach(function (m) {
if (m.dataset.bound) return;
m.dataset.bound = '1';
m.addEventListener('click', function (e) {
if (e.target === m) closeModal('#' + m.id);
});
});
// 全域快捷鍵
document.addEventListener('keydown', function (e) {
const tag = document.activeElement.tagName;
if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
if (e.key === 'Escape') {
e.preventDefault();
if (typeof BatchCtrl !== 'undefined') BatchCtrl.exit();
closeSettings();
const pomoPanel = $('#pomoPanel');
if (pomoPanel) pomoPanel.classList.remove('open');
if (typeof closePomoEditor === 'function') closePomoEditor();
$$('.modal.open').forEach(function (m) {
closeModal('#' + m.id);
});
const lb = $('#lightbox');
if (lb && lb.classList.contains('open') && typeof closeLightbox === 'function') closeLightbox();
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
// 頁尾年份
const copyrightEl = document.getElementById('copyrightYear');
if (copyrightEl) copyrightEl.textContent = new Date().getFullYear();
}
// ==========================================
// 6. Landing Page 顯示邏輯
// ==========================================
function initPublicLanding() {
const landingEl = document.getElementById('public-landing');
const navEl = document.querySelector('.nav');
const appMainEl = document.querySelector('.app');
const mobileNavEl = document.querySelector('.mobile-nav');
const pomoFabEl = document.getElementById('pomoFab');
window.enterDashboard = function () {
if (landingEl) landingEl.style.setProperty('display', 'none', 'important');
if (navEl) navEl.style.setProperty('display', 'flex', 'important');
if (appMainEl) appMainEl.style.setProperty('display', 'flex', 'important');
if (mobileNavEl && window.innerWidth <= 768) mobileNavEl.style.setProperty('display', 'flex', 'important');
if (pomoFabEl) pomoFabEl.style.setProperty('display', 'flex', 'important');
if (typeof renderHome === 'function') renderHome();
try {
localStorage.setItem('guestEntered', 'true');
} catch (err) {}
};
const showLanding = function () {
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
// ==========================================
// 7. 全站右鍵 / 長按批量刪除控制器 (筆記/照片/記帳/垃圾桶)
// ==========================================
const BatchCtrl = (function () {
let activeModule = null;
let selectedIds = new Set();
let menuEl = null;
let targetModule = null;
let targetItemId = null;
const MODULE_CONFIG = {
notes: {
viewSel: '#view-notes',
itemSel: '.note[data-id]',
getAllIds: function () {
return notes.map(function (n) {
return n.id;
});
},
render: function () {
if (typeof renderNotes === 'function') renderNotes();
},
onDelete: function (ids) {
let count = 0;
notes = notes.filter(function (n) {
if (ids.has(n.id)) {
trash.push({
id: uid(),
type: 'note',
title: n.title || '無標題',
data: n,
deletedAt: Date.now()
});
count++;
return false;
}
return true;
});
save('trash');
save('notes');
return count;
}
},
photos: {
viewSel: '#view-photos',
itemSel: '.photo[data-id]',
getAllIds: function () {
return photoMeta.map(function (p) {
return p.id;
});
},
render: function () {
if (typeof renderPhotos === 'function') renderPhotos();
},
onDelete: function (ids) {
let count = 0;
photoMeta = photoMeta.filter(function (p) {
if (ids.has(p.id)) {
trash.push({
id: uid(),
type: 'photo',
title: p.title || '照片',
data: p,
deletedAt: Date.now()
});
count++;
return false;
}
return true;
});
save('trash');
save('photoMeta');
return count;
}
},
ledger: {
viewSel: '#view-ledger',
itemSel: '.ledger-item[data-id]',
getAllIds: function () {
const now = new Date();
const thisMonth = now.getFullYear() + '-' + pad(now.getMonth() + 1);
return ledger
.filter(function (item) {
return item.date.startsWith(thisMonth);
})
.map(function (item) {
return item.id;
});
},
render: function () {
if (typeof renderLedger === 'function') renderLedger();
if (typeof renderHome === 'function') renderHome();
},
onDelete: function (ids) {
let count = 0;
ledger = ledger.filter(function (item) {
if (ids.has(item.id)) {
const label = item.category + (item.note ? ' · ' + item.note : '');
trash.push({
id: uid(),
type: 'ledger',
title: label,
data: item,
deletedAt: Date.now()
});
count++;
return false;
}
return true;
});
save('trash');
save('ledger');
return count;
}
},
trash: {
viewSel: '#view-trash',
itemSel: '.trash-item[data-id]',
isPermanent: true,
getAllIds: function () {
return trash.map(function (t) {
return t.id;
});
},
render: function () {
if (typeof renderTrash === 'function') renderTrash();
},
onDelete: function (ids) {
let count = 0;
trash = trash.filter(function (item) {
if (ids.has(item.id)) {
if (item.type === 'photo' && item.data && item.data.id) {
delete photoCache[item.data.id];
if (IDB.available()) {
IDB.del('photos', item.data.id).catch(function () {});
}
}
count++;
return false;
}
return true;
});
save('trash');
return count;
}
}
};
function ensureMenu() {
if (menuEl) return menuEl;
menuEl = document.createElement('div');
menuEl.className = 'ctx-menu';
menuEl.id = 'globalCtxMenu';
const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'ctx-menu-item';
btn.id = 'ctxBatchDelBtn';
btn.textContent = '🗑️ 批量刪除';
menuEl.appendChild(btn);
document.body.appendChild(menuEl);
btn.addEventListener('click', function () {
const mod = targetModule;
const firstId = targetItemId;
hideMenu();
if (mod) {
enter(mod, firstId);
}
});
document.addEventListener('click', function (e) {
if (menuEl && menuEl.classList.contains('open') && !menuEl.contains(e.target)) {
hideMenu();
}
});
document.addEventListener('scroll', hideMenu, true);
return menuEl;
}
function showMenu(x, y, modName, itemId) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const m = ensureMenu();
targetModule = modName;
targetItemId = itemId;
m.querySelector('#ctxBatchDelBtn').textContent = '🗑️ ' + (dict.ctxBatchDelete || '批量刪除');
m.classList.add('open');
const rect = m.getBoundingClientRect();
const left = Math.min(x, window.innerWidth - rect.width - 12);
const top = Math.min(y, window.innerHeight - rect.height - 12);
m.style.left = Math.max(8, left) + 'px';
m.style.top = Math.max(8, top) + 'px';
}
function hideMenu() {
if (menuEl) {
menuEl.classList.remove('open');
}
}
function enter(modName, initialId) {
activeModule = modName;
selectedIds.clear();
if (initialId) {
selectedIds.add(initialId);
}
const cfg = MODULE_CONFIG[modName];
if (cfg && cfg.render) cfg.render();
}
function exit() {
hideMenu();
if (!activeModule) return;
const prev = activeModule;
activeModule = null;
selectedIds.clear();
const cfg = MODULE_CONFIG[prev];
if (cfg && cfg.render) cfg.render();
}
function toggle(id) {
if (!activeModule) return;
if (selectedIds.has(id)) {
selectedIds.delete(id);
} else {
selectedIds.add(id);
}
const cfg = MODULE_CONFIG[activeModule];
if (cfg && cfg.render) cfg.render();
}
function renderToolbar(containerEl, modName) {
if (!containerEl) return;
const oldBar = containerEl.querySelector('.batch-bar');
if (oldBar) oldBar.remove();
if (activeModule !== modName) return;
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const cfg = MODULE_CONFIG[modName];
const allIds = cfg.getAllIds();
const isAllChecked = allIds.length > 0 && selectedIds.size === allIds.length;
const bar = document.createElement('div');
bar.className = 'batch-bar';
const label = document.createElement('label');
label.className = 'batch-bar-label';
const chk = document.createElement('input');
chk.type = 'checkbox';
chk.checked = isAllChecked;
const labelSpan = document.createElement('span');
labelSpan.textContent = dict.batchSelectAll || '全選';
label.appendChild(chk);
label.appendChild(labelSpan);
const countSpan = document.createElement('span');
countSpan.className = 'batch-bar-count';
countSpan.textContent = (dict.batchSelectedCount || '已選取 {n} 項').replace('{n}', selectedIds.size);
const delBtn = document.createElement('button');
delBtn.type = 'button';
delBtn.className = 'btn danger';
delBtn.disabled = selectedIds.size === 0;
delBtn.textContent = dict.delete || '刪除';
const cancelBtn = document.createElement('button');
cancelBtn.type = 'button';
cancelBtn.className = 'btn ghost';
cancelBtn.textContent = dict.batchCancel || '取消';
bar.appendChild(label);
bar.appendChild(countSpan);
bar.appendChild(delBtn);
bar.appendChild(cancelBtn);
containerEl.prepend(bar);
chk.addEventListener('change', function (e) {
if (e.target.checked) {
allIds.forEach(function (id) {
selectedIds.add(id);
});
} else {
selectedIds.clear();
}
cfg.render();
});
cancelBtn.addEventListener('click', exit);
delBtn.addEventListener('click', async function () {
const count = selectedIds.size;
if (count === 0) return;
const t1 = cfg.isPermanent
? (dict.confirmPerm1Title || '⚠️ 確定要永久刪除嗎？')
: (dict.confirmBatch1Title || '確定要刪除選取的 {n} 個項目嗎？').replace('{n}', count);
const m1 = cfg.isPermanent
? (dict.confirmPerm1Msg || '選取的 {n} 個項目將被徹底刪除，無法復原！').replace('{n}', count)
: (dict.confirmBatch1Msg || '這些項目將會先移至垃圾桶（保留 14 天）。');
const ok1 = await customConfirm(t1, m1, dict.delete, dict.cancel, true);
if (!ok1) return;
const t2 = cfg.isPermanent
? (dict.confirmPerm2Title || '最後重複確認')
: (dict.confirmBatch2Title || '再次確認刪除');
const m2 = cfg.isPermanent
? (dict.confirmPerm2Msg || '刪除後資料與檔案將永遠消失，確定執行？')
: (dict.confirmBatch2Msg || '請再次確認是否要將這些項目移至垃圾桶？');
const ok2 = await customConfirm(t2, m2, dict.delete, dict.cancel, true);
if (!ok2) return;
const deletedCount = cfg.onDelete(new Set(selectedIds));
activeModule = null;
selectedIds.clear();
cfg.render();
if (cfg.isPermanent) {
toast(dict.permanentlyDeleted || '已永久刪除');
} else {
toast((dict.movedToTrash || '已將 {n} 個項目移至垃圾桶').replace('{n}', deletedCount));
}
});
}
document.addEventListener('contextmenu', function (e) {
const keys = Object.keys(MODULE_CONFIG);
for (let i = 0; i < keys.length; i++) {
const modName = keys.at(i);
const cfg = MODULE_CONFIG[modName];
const viewEl = $(cfg.viewSel);
if (!viewEl || !viewEl.classList.contains('active')) continue;
const itemEl = e.target.closest(cfg.itemSel);
if (itemEl && viewEl.contains(itemEl)) {
e.preventDefault();
showMenu(e.clientX, e.clientY, modName, itemEl.dataset.id);
return;
}
}
});
let lpTimer = null;
let lpStartX = 0;
let lpStartY = 0;
let lpTriggered = false;
document.addEventListener(
'pointerdown',
function (e) {
if (e.pointerType === 'mouse') return;
lpTriggered = false;
const keys = Object.keys(MODULE_CONFIG);
for (let i = 0; i < keys.length; i++) {
const modName = keys.at(i);
const cfg = MODULE_CONFIG[modName];
const viewEl = $(cfg.viewSel);
if (!viewEl || !viewEl.classList.contains('active')) continue;
const itemEl = e.target.closest(cfg.itemSel);
if (itemEl && viewEl.contains(itemEl)) {
lpStartX = e.clientX;
lpStartY = e.clientY;
const itemId = itemEl.dataset.id;
clearTimeout(lpTimer);
lpTimer = setTimeout(function () {
lpTriggered = true;
if (navigator.vibrate) navigator.vibrate(30);
showMenu(lpStartX, lpStartY, modName, itemId);
}, 500);
return;
}
}
},
{ passive: true }
);
document.addEventListener(
'pointermove',
function (e) {
if (!lpTimer) return;
if (Math.abs(e.clientX - lpStartX) > 10 || Math.abs(e.clientY - lpStartY) > 10) {
clearTimeout(lpTimer);
lpTimer = null;
}
},
{ passive: true }
);
function cancelLongPress() {
if (lpTimer) {
clearTimeout(lpTimer);
lpTimer = null;
}
}
document.addEventListener('pointerup', cancelLongPress, { passive: true });
document.addEventListener('pointercancel', cancelLongPress, { passive: true });
document.addEventListener(
'click',
function (e) {
if (lpTriggered) {
e.preventDefault();
e.stopPropagation();
lpTriggered = false;
}
},
true
);
return {
isActive: function (modName) {
return activeModule === modName;
},
isSelected: function (id) {
return selectedIds.has(id);
},
toggle: toggle,
exit: exit,
renderToolbar: renderToolbar
};
})();