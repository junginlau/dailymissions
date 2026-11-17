// js/core.js
const STORAGE_OK = (function () {
  try {
    const k = '__t_' + Date.now();
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
})();

const LS = {
  get: function (k, d) {
    if (!STORAGE_OK) return d;
    try {
      const v = localStorage.getItem(k);
      return v === null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  },
  set: function (k, v) {
    if (!STORAGE_OK) return false;
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove: function (k) {
    if (!STORAGE_OK) return;
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  }
};

const IDB = (function () {
  const DB_NAME = 'my_space_db';
  const DB_VER = 2;
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) {
        reject(new Error('no idb'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('audio')) {
          db.createObjectStore('audio', { keyPath: 'id' });
        }
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

  function run(storeName, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = fn(store);
        req.onsuccess = function () {
          resolve(req.result);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  return {
    available: function () {
      return 'indexedDB' in window;
    },
    get: function (storeName, id) {
      return run(storeName, 'readonly', function (s) {
        return s.get(id);
      });
    },
    put: function (storeName, obj) {
      return run(storeName, 'readwrite', function (s) {
        return s.put(obj);
      });
    },
    del: function (storeName, id) {
      return run(storeName, 'readwrite', function (s) {
        return s.delete(id);
      });
    },
    getAll: function (storeName) {
      return run(storeName, 'readonly', function (s) {
        return s.getAll();
      });
    }
  };
})();

const $ = function (sel, root) {
  return (root || document).querySelector(sel);
};

const $$ = function (sel, root) {
  return Array.from((root || document).querySelectorAll(sel));
};

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

function keyToDate(k) {
  const p = k.split('-').map(Number);
  return new Date(p.at(0), p.at(1) - 1, p.at(2));
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDateTime(d) {
  return (
    d.getFullYear() +
    '/' +
    pad(d.getMonth() + 1) +
    '/' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes())
  );
}

let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.classList.remove('show');
  }, 2400);
}

function openModal(id) {
  const el = $(id);
  if (!el) return;
  el.classList.add('open');
  document.body.classList.add('lock');
}

function closeModal(id) {
  const el = $(id);
  if (!el) return;
  el.classList.remove('open');
  if (!document.querySelector('.modal.open, .lightbox.open')) {
    document.body.classList.remove('lock');
  }
}

let confirmResolve = null;
function customConfirm(title, message, okText, cancelText, isDanger) {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  $('#customConfirmTitle').textContent = title || dict.confirmTitle;
  $('#customConfirmMessage').textContent = message || dict.confirmDefaultMsg;
  const okBtn = $('#customConfirmOk');
  const cancelBtn = $('#customConfirmCancel');
  okBtn.textContent = okText || dict.confirmOk;
  cancelBtn.textContent = cancelText || dict.confirmCancel;
  if (isDanger) {
    okBtn.className = 'btn danger';
  } else {
    okBtn.className = 'btn primary';
  }
  openModal('#customConfirmModal');
  return new Promise(function (resolve) {
    confirmResolve = resolve;
  });
}

function initCustomConfirmEvents() {
  const okBtn = $('#customConfirmOk');
  const cancelBtn = $('#customConfirmCancel');
  if (okBtn && !okBtn.dataset.bound) {
    okBtn.dataset.bound = '1';
    okBtn.addEventListener('click', function () {
      closeModal('#customConfirmModal');
      if (confirmResolve) {
        const r = confirmResolve;
        confirmResolve = null;
        r(true);
      }
    });
  }
  if (cancelBtn && !cancelBtn.dataset.bound) {
    cancelBtn.dataset.bound = '1';
    cancelBtn.addEventListener('click', function () {
      closeModal('#customConfirmModal');
      if (confirmResolve) {
        const r = confirmResolve;
        confirmResolve = null;
        r(false);
      }
    });
  }
}

function compressImage(file, maxDim, quality) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      const img = new Image();
      img.onload = function () {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(c.toDataURL('image/jpeg', quality));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isArray(v) {
  return Array.isArray(v);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function dayKeyOf(date) {
  return DAY_KEYS.at(date.getDay());
}

function emptySchedule() {
  return { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] };
}

function migrateTodos(raw) {
  const fresh = {
    tags: [],
    schedule: emptySchedule(),
    done: {},
    lastCheckedDate: todayKey()
  };
  if (!raw || typeof raw !== 'object') return fresh;
  if (Array.isArray(raw.tags) && raw.schedule) {
    fresh.tags = raw.tags.map(function (t) {
      return typeof t === 'string' ? { id: uid(), text: t } : t;
    });
    DAY_KEYS.forEach(function (k) {
      fresh.schedule[k] = Array.isArray(raw.schedule[k]) ? raw.schedule[k] : [];
    });
    fresh.done = raw.done && typeof raw.done === 'object' ? raw.done : {};
    fresh.lastCheckedDate = raw.lastCheckedDate || todayKey();
    return fresh;
  }
  const map = {};
  function getTagId(text) {
    const t = String(text || '').trim();
    if (!t) return null;
    if (!map[t]) {
      const id = uid();
      map[t] = id;
      fresh.tags.push({ id: id, text: t });
    }
    return map[t];
  }
  const items = Array.isArray(raw) ? raw : Array.isArray(raw.items) ? raw.items : [];
  items.forEach(function (it) {
    const id = getTagId(it.text);
    if (!id) return;
    DAY_KEYS.forEach(function (k) {
      if (fresh.schedule[k].indexOf(id) < 0) fresh.schedule[k].push(id);
    });
  });
  return fresh;
}

// ==========================================
// 全域共享資料狀態
// ==========================================
let todos = migrateTodos(LS.get('my_todos_v2', null));
let events = LS.get('my_events_v1', {});
let diaries = LS.get('my_diaries_v1', []);
let notes = LS.get('my_notes_v1', []);
let goals = LS.get('my_goals_v1', []);
let bookmarks = LS.get('my_bookmarks_v1', []);
let ledger = LS.get('my_ledger_v1', []);
let countdowns = LS.get('my_countdowns_v1', []);
let trash = LS.get('my_trash_v1', []);

const DEFAULT_LEDGER_CATS = ['飲食', '交通', '購物', '娛樂', '生活', '薪資', '投資', '其他'];
let ledgerCategories = LS.get('my_ledger_cats_v1', DEFAULT_LEDGER_CATS);

const DEFAULT_RATES = {
  TWD: 1,
  USD: 32.5,
  JPY: 0.21,
  HKD: 4.15,
  EUR: 35.2,
  GBP: 41.0,
  CNY: 4.5
};
const RATE_MIN_INTERVAL = 24 * 60 * 60 * 1000;
const savedRateObj = LS.get('exchangeRates', null);
let exchangeRates = savedRateObj && savedRateObj.rates ? savedRateObj.rates : DEFAULT_RATES;
let exchangeRatesUpdatedAt = savedRateObj && savedRateObj.updatedAt ? savedRateObj.updatedAt : null;

let mainCurrency = LS.get('mainCurrency', 'TWD');
const currencySymbols = {
  TWD: 'NT$',
  USD: '$',
  JPY: '¥',
  HKD: 'HK$',
  EUR: '€',
  GBP: '£',
  CNY: '¥'
};

let photoMeta = LS.get('my_photos_meta_v1', null);
let legacyPhotos = LS.get('my_photos_v1', null);
const photoCache = {};

if (!Array.isArray(photoMeta)) {
  photoMeta = Array.isArray(legacyPhotos)
    ? legacyPhotos.map(function (p) {
        return { id: p.id, title: p.title || '' };
      })
    : [];
}

function save(key) {
  const map = {
todos: ['my_todos_v2', todos],
events: ['my_events_v1', events],
diaries: ['my_diaries_v1', diaries],
notes: ['my_notes_v1', notes],
photoMeta: ['my_photos_meta_v1', photoMeta],
goals: ['my_goals_v1', goals],
bookmarks: ['my_bookmarks_v1', bookmarks],
ledger: ['my_ledger_v1', ledger],
countdowns: ['my_countdowns_v1', countdowns],
ledgerCategories: ['my_ledger_cats_v1', ledgerCategories],
trash: ['my_trash_v1', trash]
};
if (map[key]) {
const entry = map[key];
LS.set(entry.at(0), entry.at(1));
if (!window.__isRestoringBackup) {
LS.set('localDataUpdatedAt', Date.now());
if (typeof window.scheduleAutoSync === 'function') {
window.scheduleAutoSync();
}
}
}
}
function migrateLegacyPhotosToIDB() {
if (!IDB.available() || !Array.isArray(legacyPhotos) || !legacyPhotos.length) {
return Promise.resolve();
}
const tasks = legacyPhotos.map(function (p) {
if (!p || !p.id || !p.src) return Promise.resolve();
photoCache[p.id] = p.src;
return IDB.put('photos', { id: p.id, src: p.src }).catch(function () {});
});
return Promise.all(tasks).then(function () {
save('photoMeta');
LS.remove('my_photos_v1');
legacyPhotos = null;
});
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
const cut = new Date();
cut.setDate(cut.getDate() - 14);
cut.setHours(0, 0, 0, 0);
let changed = false;
Object.keys(todos.done).forEach(function (k) {
if (keyToDate(k) < cut) {
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