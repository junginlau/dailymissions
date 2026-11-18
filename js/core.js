// js/core.js
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function pad(n) {
  return String(n).padStart(2, '0');
}
function dateKey(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function todayKey() {
  return dateKey(new Date());
}
function keyToDate(key) {
  const p = key.split('-').map(Number);
  return new Date(p.at(0), p.at(1) - 1, p.at(2));
}
function fmtDateTime(d) {
  return (
    d.getFullYear() +
    '年' +
    (d.getMonth() + 1) +
    '月' +
    d.getDate() +
    '日 ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes())
  );
}
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}
function isArray(v) {
  return Array.isArray(v);
}

const STORAGE_OK = (function () {
  try {
    const k = '__test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
})();

const LS = {
  get(k, d) {
    if (!STORAGE_OK) return d;
    try {
      const v = localStorage.getItem(k);
      return v === null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    if (!STORAGE_OK) return false;
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(k) {
    if (!STORAGE_OK) return;
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  }
};

const IDB = (function () {
  const DB_NAME = 'my_space_db';
  const DB_VERSION = 1;
  const STORES = ['photos', 'audio'];
  let dbPromise = null;
  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) {
        reject(new Error('no idb'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        STORES.forEach(function (name) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
        });
      };
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
    return dbPromise;
  }
  function tx(store, mode) {
    return open().then(function (db) {
      return db.transaction(store, mode).objectStore(store);
    });
  }
  return {
    available() {
      return 'indexedDB' in window;
    },
    put(store, obj) {
      return tx(store, 'readwrite').then(function (s) {
        return new Promise(function (resolve, reject) {
          const r = s.put(obj);
          r.onsuccess = function () {
            resolve(true);
          };
          r.onerror = function () {
            reject(r.error);
          };
        });
      });
    },
    get(store, id) {
      return tx(store, 'readonly').then(function (s) {
        return new Promise(function (resolve, reject) {
          const r = s.get(id);
          r.onsuccess = function () {
            resolve(r.result || null);
          };
          r.onerror = function () {
            reject(r.error);
          };
        });
      });
    },
    getAll(store) {
      return tx(store, 'readonly').then(function (s) {
        return new Promise(function (resolve, reject) {
          const r = s.getAll();
          r.onsuccess = function () {
            resolve(r.result || []);
          };
          r.onerror = function () {
            reject(r.error);
          };
        });
      });
    },
    del(store, id) {
      return tx(store, 'readwrite').then(function (s) {
        return new Promise(function (resolve, reject) {
          const r = s.delete(id);
          r.onsuccess = function () {
            resolve(true);
          };
          r.onerror = function () {
            reject(r.error);
          };
        });
      });
    }
  };
})();

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
  toastTimer = setTimeout(function () {
    el.classList.remove('show');
  }, 2300);
}

function compressImage(file, maxDim, quality) {
  return new Promise(function (resolve, reject) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      reject(new Error('not image'));
      return;
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
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function openModal(sel) {
  const m = $(sel);
  if (!m) return;
  m.classList.add('open');
  document.body.classList.add('lock');
}
function closeModal(sel) {
  const m = $(sel);
  if (m) m.classList.remove('open');
  if (!document.querySelector('.modal.open, .lightbox.open')) document.body.classList.remove('lock');
}

let confirmActive = false;
function customConfirm(title, message, okText, cancelText, danger) {
  return new Promise(function (resolve) {
    if (confirmActive) {
      resolve(false);
      return;
    }
    const modal = $('#confirmModal');
    if (!modal) {
      resolve(window.confirm(title + '\n' + (message || '')));
      return;
    }
    confirmActive = true;
    $('#confirmTitle').textContent = title || '確定嗎？';
    $('#confirmSub').textContent = message || '';
    const okBtn = $('#confirmOk');
    const cancelBtn = $('#confirmCancel');
    okBtn.textContent = okText || '確定';
    cancelBtn.textContent = cancelText || '取消';
    if (danger) {
      okBtn.style.background = '#e5484d';
      okBtn.style.borderColor = 'transparent';
      okBtn.style.color = '#fff';
    } else {
      okBtn.style.background = '';
      okBtn.style.borderColor = '';
      okBtn.style.color = '';
    }
    const closeTargets = modal.querySelectorAll('.x-btn, [data-close="#confirmModal"]');
    function cleanup() {
      confirmActive = false;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      closeTargets.forEach(function (b) {
        b.removeEventListener('click', onCancel);
      });
    }
    function onOk() {
      cleanup();
      closeModal('#confirmModal');
      resolve(true);
    }
    function onCancel() {
      cleanup();
      closeModal('#confirmModal');
      resolve(false);
    }
    function onBackdrop(e) {
      if (e.target === modal) onCancel();
    }
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onBackdrop);
    closeTargets.forEach(function (b) {
      b.addEventListener('click', onCancel);
    });
    openModal('#confirmModal');
  });
}

// 全域 Enter 確認 (只在 confirmModal 開啟時有效)
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && $('#confirmModal') && $('#confirmModal').classList.contains('open')) {
    e.preventDefault();
    $('#confirmOk').click();
  }
});
// 確保在 main.js 載入前，initSettingsEvents 是存在的 (由 settings.js 定義)
window.initSettingsEvents = window.initSettingsEvents || function() {};

// ==========================================
// 自動同步核心邏輯（只在 core.js 宣告一次）
// ==========================================
let autoSyncTimer = null;

function getFormattedTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

window.scheduleAutoSync = function () {
  const isEnabled = LS.get('autoSyncEnabled', false);
  const token = (typeof accessToken !== 'undefined') ? accessToken : null;
  const filesApi = (typeof DRIVE_FILES_API !== 'undefined') ? DRIVE_FILES_API : null;
  const uploadApi = (typeof DRIVE_UPLOAD_API !== 'undefined') ? DRIVE_UPLOAD_API : null;
  if (!isEnabled || !token || !filesApi || !uploadApi) return;

  clearTimeout(autoSyncTimer);
  const gSyncTimeText = $('#gSyncTimeText');
  const dict0 = (window.I18N && window.I18N[currentLang]) || (window.I18N && window.I18N['zh-TW']) || {};
  if (gSyncTimeText) gSyncTimeText.textContent = dict0.gSyncingBg || '雲端同步中...';

  autoSyncTimer = setTimeout(async function () {
    try {
      const dict = (window.I18N && window.I18N[currentLang]) || (window.I18N && window.I18N['zh-TW']) || {};
      const liveToken = (typeof accessToken !== 'undefined') ? accessToken : token;
      if (!liveToken) return;

      const exportPhotos = (photoMeta || []).map(function (m) {
        if (typeof loadPhotoSrc !== 'function') {
          return Promise.resolve({ id: m.id, title: m.title || '', src: '' });
        }
        return loadPhotoSrc(m.id).then(function (src) {
          return { id: m.id, title: m.title || '', src: src || '' };
        });
      });
      const photosData = await Promise.all(exportPhotos);
      const backupVer = (typeof BACKUP_VERSION !== 'undefined') ? BACKUP_VERSION : 2;
      const data = {
        version: backupVer,
        exportedAt: new Date().toISOString(),
        todos: todos,
        events: events,
        diaries: diaries,
        notes: notes,
        photos: photosData,
        goals: goals,
        bookmarks: bookmarks,
        ledger: ledger,
        countdowns: countdowns,
        ledgerCategories: ledgerCategories,
        trash: trash,
        prefs: {
          lum: (typeof state !== 'undefined' && state) ? state.lum : 55,
          bg: (typeof state !== 'undefined' && state) ? state.bg : null
        },
        pomoSoundType: (typeof soundType !== 'undefined') ? soundType : 'synth'
      };
      const jsonString = JSON.stringify(data);

      const searchRes = await fetch(filesApi + '?spaces=appDataFolder', {
        headers: { 'Authorization': 'Bearer ' + liveToken }
      });
      if (searchRes.status === 401) {
        if (typeof clearGoogleToken === 'function') clearGoogleToken();
        return;
      }
      const searchData = await searchRes.json();
      let fileId = searchData.files && searchData.files.length > 0 ? searchData.files[0].id : null;

      const boundary = '-------314159265358979323846';
      const delimiter = '\r\n--' + boundary + '\r\n';
      const close_delim = '\r\n--' + boundary + '--';
      let metadata = { name: 'my_space_backup.json', mimeType: 'application/json' };
      if (!fileId) metadata.parents = ['appDataFolder'];

      const multipartRequestBody =
        delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
        delimiter + 'Content-Type: application/json\r\n\r\n' + jsonString +
        close_delim;

      let url = uploadApi;
      let method = 'POST';
      if (fileId) {
        url += '/' + fileId;
        method = 'PATCH';
      }
      url += '?uploadType=multipart';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': 'Bearer ' + liveToken,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      if (res.ok) {
        const now = Date.now();
        LS.set('lastCloudSyncTime', now);
        LS.set('lastSyncedDataTime', now);
        if (gSyncTimeText) {
          gSyncTimeText.textContent = (dict.gSyncSyncedAt || '已同步：') + getFormattedTime(now);
        }
      } else if (res.status === 401) {
        if (typeof clearGoogleToken === 'function') clearGoogleToken();
      } else if (gSyncTimeText) {
        gSyncTimeText.textContent = dict.gBackupFail || '同步失敗';
      }
    } catch (err) {
      console.error('Auto sync failed', err);
      if ($('#gSyncTimeText')) $('#gSyncTimeText').textContent = '同步失敗';
    }
  }, 5000);
};

async function checkCloudNewerOnLogin() {
  const token = (typeof accessToken !== 'undefined') ? accessToken : null;
  const filesApi = (typeof DRIVE_FILES_API !== 'undefined') ? DRIVE_FILES_API : null;
  if (!token || !filesApi) return;
  try {
    const searchRes = await fetch(filesApi + '?spaces=appDataFolder&fields=files(id,name,modifiedTime)', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (searchRes.status === 401) {
      if (typeof clearGoogleToken === 'function') clearGoogleToken();
      return;
    }
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      const cloudModified = new Date(searchData.files[0].modifiedTime).getTime();
      const localUpdated = LS.get('localDataUpdatedAt', 0);

      if (cloudModified > localUpdated + 5000) {
        const dict = (window.I18N && window.I18N[currentLang]) || (window.I18N && window.I18N['zh-TW']) || {};
        const ok = await customConfirm(
          dict.gConflictTitle || '偵測到雲端有較新的資料',
          (dict.gConflictMsg || '雲端備份時間（{t}）比本機資料更新，是否要下載並覆蓋目前裝置的資料？').replace('{t}', getFormattedTime(cloudModified)),
          dict.gConflictOk || '確認覆蓋本機',
          dict.cancel || '取消',
          true
        );
        if (ok) {
          const restoreBtn = $('#gRestoreBtn');
          if (restoreBtn) restoreBtn.click();
        }
      }
    }
  } catch (e) {
    console.warn('Check cloud failed', e);
  }
}
window.checkCloudNewerOnLogin = checkCloudNewerOnLogin;

// ==========================================
// 資料初始化（100% 保留原本的 localStorage 鍵名）
// ==========================================
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
  return { tags: [], schedule: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }, done: {} };
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
      const name = ((item && item.text) || '').trim();
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

let todos = migrateTodos(LS.get('todos', null));
let events = LS.get('events', {});
let diaries = LS.get('diaries', []);
let notes = LS.get('notes', []);
let goals = LS.get('goals', []);
let bookmarks = LS.get('bookmarks', []);
let countdowns = LS.get('countdowns', []);
let ledgerCategories = LS.get('ledgerCategories', ['飲食', '交通', '購物', '娛樂', '薪資', '投資', '其他']);
let trash = LS.get('trash', []);

let photoMeta = LS.get('photoMeta', null);
const legacyPhotos = LS.get('photos', null);
let needsLegacyPhotoMigration = false;
if (!photoMeta && Array.isArray(legacyPhotos) && legacyPhotos.length) {
needsLegacyPhotoMigration = true;
photoMeta = legacyPhotos.map(function (p) {
return { id: p.id, title: p.title || '' };
});
}
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
if (!ledger) {
const oldExp = LS.get('expenses', []);
if (oldExp.length) {
ledger = oldExp.map((e) => ({ ...e, type: 'expense' }));
LS.set('ledger', ledger);
LS.remove('expenses');
} else {
ledger = [];
}
}
if (!events || typeof events !== 'object' || Array.isArray(events)) events = {};
if (!Array.isArray(diaries)) diaries = [];
if (!Array.isArray(notes)) notes = [];
if (!Array.isArray(goals)) goals = [];
if (!Array.isArray(bookmarks)) bookmarks = [];
if (!Array.isArray(ledger)) ledger = [];
if (!Array.isArray(countdowns)) countdowns = [];
if (!Array.isArray(trash)) trash = [];
function save(key) {
const map = {
todos: ['todos', todos],
events: ['events', events],
diaries: ['diaries', diaries],
notes: ['notes', notes],
photoMeta: ['photoMeta', photoMeta],
goals: ['goals', goals],
bookmarks: ['bookmarks', bookmarks],
ledger: ['ledger', ledger],
countdowns: ['countdowns', countdowns],
ledgerCategories: ['ledgerCategories', ledgerCategories],
trash: ['trash', trash]
};
  if (map[key]) {
    const entry = map[key];
    LS.set(entry.at(0), entry.at(1));
    
    // [NEW] 如果自動同步有開啟，就觸發排程
    if (!window.__isRestoringBackup) {
      LS.set('localDataUpdatedAt', Date.now());
      if (typeof window.scheduleAutoSync === 'function') {
        window.scheduleAutoSync();
      }
    }
  }
}
function migrateLegacyPhotos() {
if (!needsLegacyPhotoMigration || !IDB.available()) {
needsLegacyPhotoMigration = false;
return Promise.resolve();
}
return Promise.all(
legacyPhotos.map(function (p) {
return IDB.put('photos', { id: p.id, src: p.src }).catch(function () {});
})
).then(function () {
LS.remove('photos');
LS.set('photoMeta', photoMeta);
needsLegacyPhotoMigration = false;
});
}
function dayKeyOf(d) {
return DAY_KEYS.at(d.getDay());
}
function dayLabelOf(key) {
const map = window.I18N[currentLang].weekdaysFull || {};
return map[key] || key;
}
function pruneEvents() {
const cut = new Date();
cut.setMonth(cut.getMonth() - 6);
cut.setHours(0, 0, 0, 0);
let changed = false;
Object.keys(events).forEach(function (k) {
if (keyToDate(k) < cut) {
delete events[k];
changed = true;
}
});
if (changed) save('events');
}
function pruneDone() {
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 60);
const minKey = dateKey(cutoff);
let changed = false;
Object.keys(todos.done || {}).forEach(function (k) {
if (k < minKey) {
delete todos.done[k];
changed = true;
}
});
if (changed) save('todos');
}
function pruneTrash() {
const now = Date.now();
const fourteenDays = 14 * 24 * 60 * 60 * 1000;
const kept = [];
let changed = false;
trash.forEach(function (item) {
if (now - item.deletedAt < fourteenDays) {
kept.push(item);
} else {
changed = true;
if (item.type === 'photo' && item.data && item.data.id) {
delete photoCache[item.data.id];
if (IDB.available()) {
IDB.del('photos', item.data.id).catch(function () {});
}
}
}
});
if (changed) {
trash = kept;
save('trash');
if (typeof currentView !== 'undefined' && currentView === 'trash' && typeof renderTrash === 'function') {
renderTrash();
}
}
}