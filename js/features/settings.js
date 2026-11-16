// js/features/settings.js

// ==========================================
// 1. 全域狀態（供 ui.js 等跨模組讀取）
// ==========================================
let accessToken = null;
try {
  const savedTok = LS.get('googleToken', null);
  const savedExp = LS.get('googleTokenExp', 0);
  if (savedTok && savedExp && Date.now() < savedExp - 60000) {
    accessToken = savedTok;
  } else if (savedTok) {
    LS.remove('googleToken');
    LS.remove('googleTokenExp');
    accessToken = null;
  }
} catch (e) {
  accessToken = null;
}

(function () {
  'use strict';

  // ==========================================
  // 2. 主題與背景偏好設定
  // ==========================================
  const root = document.documentElement;
  const bgLayer = $('#bgLayer');
  const DEFAULT_LUM = 55;
  const state = {
    lum: DEFAULT_LUM,
    bg: null
  };

  function getCookie(name) {
    const m = document.cookie.match('(^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[2]) : null;
  }

  function setCookie(name, value) {
    try {
      document.cookie =
        name +
        '=' +
        encodeURIComponent(value) +
        '; path=/; max-age=31536000; SameSite=Lax';
      return getCookie(name) !== null;
    } catch (e) {
      return false;
    }
  }

  function delCookie(name) {
    document.cookie = name + '=; path=/; max-age=0; SameSite=Lax';
  }

  function loadPrefs() {
    let lum = NaN;
    try {
      const v = localStorage.getItem('lum');
      if (v !== null) {
        lum = parseFloat(v);
      }
    } catch (e) {}

    if (isNaN(lum)) {
      lum = parseFloat(getCookie('lum'));
    }

    if (!isNaN(lum)) {
      state.lum = Math.min(100, Math.max(0, lum));
    } else {
      state.lum = DEFAULT_LUM;
    }

    let bg = null;
    try {
      bg = localStorage.getItem('bg');
    } catch (e) {}

    if (!bg) {
      bg = getCookie('bg');
    }
    state.bg = bg || null;
  }

  function savePrefs() {
    setCookie('lum', String(state.lum));
    try {
      localStorage.setItem('lum', String(state.lum));
    } catch (e) {}

    if (state.bg) {
      const ok = setCookie('bg', state.bg);
      if (!ok) {
        delCookie('bg');
        try {
          localStorage.setItem('bg', state.bg);
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem('bg');
        } catch (e) {}
      }
    } else {
      delCookie('bg');
      try {
        localStorage.removeItem('bg');
      } catch (e) {}
    }
  }

  function applyTheme() {
    const b = state.lum / 100;
    const bgL = 12 + b * 76;
    let txL;

    if (bgL > 50) {
      txL = Math.max(8, 100 - bgL - 32);
    } else {
      txL = Math.min(94, 100 - bgL + 32);
    }

    if (bgLayer) {
      if (state.bg) {
        bgLayer.style.backgroundImage = 'url("' + state.bg + '")';
        bgLayer.style.backgroundColor = '#000';
        bgLayer.style.filter = 'brightness(' + (0.35 + b * 1.0).toFixed(2) + ')';
      } else {
        bgLayer.style.backgroundImage = 'none';
        bgLayer.style.filter = 'none';
        bgLayer.style.backgroundColor = 'hsl(220, 14%, ' + bgL.toFixed(1) + '%)';
      }
    }

    const light = bgL > 50;
    root.style.setProperty('--fg', 'hsl(220, 12%, ' + txL.toFixed(1) + '%)');
    root.style.setProperty('--fg-dim', 'hsla(220, 10%, ' + txL.toFixed(1) + '%, .62)');
    root.style.setProperty(
      '--panel-bg-solid',
      light ? 'rgba(245, 247, 250, 0.92)' : 'rgba(25, 28, 36, 0.92)'
    );
    root.style.setProperty(
      '--panel',
      light ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.09)'
    );
    root.style.setProperty(
      '--panel-border',
      light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.15)'
    );
    root.style.setProperty(
      '--nav-bg',
      light ? 'rgba(255,255,255,.62)' : 'rgba(18,20,26,.55)'
    );
    root.style.setProperty(
      '--hover',
      light ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.10)'
    );
    root.style.setProperty('--ink-inv', light ? '#ffffff' : '#111318');
    document.documentElement.style.colorScheme = light ? 'light' : 'dark';

    const t = txL.toFixed(1);
    root.style.setProperty('--scroll-thumb', 'hsla(220, 10%, ' + t + '%, .30)');
    root.style.setProperty('--scroll-thumb-hover', 'hsla(220, 10%, ' + t + '%, .52)');

    const lumRange = $('#lumRange');
    const lumVal = $('#lumVal');
    if (lumRange) lumRange.value = state.lum;
    if (lumVal) lumVal.textContent = Math.round(state.lum);
  }

  // ==========================================
  // 3. 本機資料備份、匯入驗證與還原
  // ==========================================
  const BACKUP_VERSION = 2;

  function buildBackupPayload() {
    const exportPhotos = photoMeta.map(function (m) {
      return loadPhotoSrc(m.id).then(function (src) {
        return {
          id: m.id,
          title: m.title || '',
          src: src || ''
        };
      });
    });

    return Promise.all(exportPhotos).then(function (photosData) {
      return {
        version: BACKUP_VERSION,
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
          lum: state.lum,
          bg: state.bg
        },
        pomoSoundType: typeof soundType !== 'undefined' ? soundType : 'synth'
      };
    });
  }

  function exportData() {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    buildBackupPayload().then(function (data) {
      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my_space_backup_' + todayKey() + '.json';
      a.click();
      URL.revokeObjectURL(url);
      toast(dict.exporting);
    });
  }

  function validateBackup(data) {
    if (!data || typeof data !== 'object') {
      return 'Invalid format';
    }
    if (data.version != null && typeof data.version !== 'number') {
      return 'Invalid version';
    }

    const checks = [
      [
        'todos',
        function (v) {
          return v && typeof v === 'object' && !Array.isArray(v);
        }
      ],
      [
        'events',
        function (v) {
          return v && typeof v === 'object' && !Array.isArray(v);
        }
      ],
      ['diaries', isArray],
      ['notes', isArray],
      ['photos', isArray],
      ['goals', isArray],
      ['bookmarks', isArray],
      ['ledger', isArray],
      ['countdowns', isArray],
      ['trash', isArray]
    ];

    for (let i = 0; i < checks.length; i++) {
      const key = checks[i][0];
      const fn = checks[i][1];
      if (data[key] !== undefined && !fn(data[key])) {
        return 'Invalid ' + key;
      }
    }

    if (data.photos) {
      for (let i = 0; i < data.photos.length; i++) {
        const p = data.photos[i];
        if (!p || !isNonEmptyString(p.id) || typeof p.src !== 'string') {
          return 'Invalid photo data';
        }
      }
    }
    return null;
  }

  function restoreFromBackupData(data) {
    if (data.todos) todos = migrateTodos(data.todos);
    if (data.events) events = data.events;
    if (data.diaries) diaries = data.diaries;
    if (data.notes) notes = data.notes;
    if (data.goals) goals = data.goals;
    if (data.bookmarks) bookmarks = data.bookmarks;
    if (data.countdowns) countdowns = data.countdowns;
    if (data.trash) trash = data.trash;
    if (data.ledgerCategories) ledgerCategories = data.ledgerCategories;

    if (data.ledger) {
      ledger = data.ledger;
    } else if (data.expenses) {
      ledger = data.expenses.map(function (x) {
        return Object.assign({}, x, { type: 'expense' });
      });
    }

    photoMeta = [];
    const photoWrites = (data.photos || []).map(function (p) {
      photoMeta.push({
        id: p.id,
        title: p.title || ''
      });
      if (IDB.available() && p.src) {
        photoCache[p.id] = p.src;
        return IDB.put('photos', {
          id: p.id,
          src: p.src
        }).catch(function () {});
      }
      return Promise.resolve();
    });

    if (data.prefs) {
      if (typeof data.prefs.lum === 'number') {
        state.lum = Math.min(100, Math.max(0, data.prefs.lum));
      }
      if (typeof data.prefs.bg === 'string') {
        state.bg = data.prefs.bg || null;
      }
      applyTheme();
      savePrefs();
    }

    if (data.pomoSoundType === 'synth' || data.pomoSoundType === 'custom') {
      if (typeof soundType !== 'undefined') {
        soundType = data.pomoSoundType;
      }
      LS.set('pomoSoundType', data.pomoSoundType);
      if (typeof updateSoundUI === 'function') {
        updateSoundUI();
      }
    }

    return Promise.all(photoWrites).then(function () {
      const keysToSave = [
        'todos',
        'events',
        'diaries',
        'notes',
        'goals',
        'bookmarks',
        'ledger',
        'countdowns',
        'ledgerCategories',
        'trash'
      ];
      keysToSave.forEach(save);
      save('photoMeta');

      if (typeof pruneEvents === 'function') pruneEvents();
      if (typeof pruneDone === 'function') pruneDone();
      if (typeof pruneTrash === 'function') pruneTrash();

      if (typeof renderTodos === 'function') renderTodos();
      if (typeof renderCalendar === 'function') renderCalendar();
      if (typeof renderDiaries === 'function') renderDiaries();
      if (typeof renderNotes === 'function') renderNotes();
      if (typeof renderPhotos === 'function') renderPhotos();
      if (typeof renderGoals === 'function') renderGoals();
      if (typeof renderBookmarks === 'function') renderBookmarks();
      if (typeof renderLedger === 'function') renderLedger();
      if (typeof renderHome === 'function') renderHome();
if (typeof renderTrash === 'function') renderTrash();
});
}
// ==========================================
// 4. Google Drive 雲端備份邏輯
// ==========================================
const CLIENT_ID = 'googleusercontent.com';
const SCOPES = 'googleapis.com';
let tokenClient = null;
function clearGoogleToken() {
accessToken = null;
try {
LS.remove('googleToken');
LS.remove('googleTokenExp');
} catch (e) {}
updateGoogleUI();
}
function updateGoogleUI() {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const gLoginBtn = $('#gLoginBtn');
const gStatus = $('#gStatus');
const gActionWrap = $('#gActionWrap');
if (!gLoginBtn || !gStatus || !gActionWrap) return;
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
window.updateGoogleUI = updateGoogleUI;
function initGoogleAuth() {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const gStatus = $('#gStatus');
const gLoginBtn = $('#gLoginBtn');
if (typeof google === 'undefined') {
if (gStatus) gStatus.textContent = dict.gLoadingFail;
return;
}
tokenClient = google.accounts.oauth2.initTokenClient({
client_id: CLIENT_ID,
scope: SCOPES,
callback: function (tokenResponse) {
const d = window.I18N[currentLang] || window.I18N['zh-TW'];
if (tokenResponse && tokenResponse.access_token) {
accessToken = tokenResponse.access_token;
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
}
});
if (gLoginBtn && !gLoginBtn.dataset.bound) {
gLoginBtn.dataset.bound = '1';
gLoginBtn.addEventListener('click', function () {
if (tokenClient) {
tokenClient.requestAccessToken({ prompt: 'consent' });
}
});
}
}
// ==========================================
// 5. 初始化設定面板所有事件
// ==========================================
window.initSettingsEvents = function () {
loadPrefs();
applyTheme();
if (!STORAGE_OK) {
setTimeout(function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
toast(dict.storageNo);
}, 900);
}
// 亮度滑桿
(function bindLumSlider() {
const lumRange = $('#lumRange');
if (!lumRange || lumRange.dataset.bound) return;
lumRange.dataset.bound = '1';
lumRange.addEventListener('input', function () {
state.lum = parseFloat(this.value);
applyTheme();
savePrefs();
});
})();
// 背景圖片選擇與清除
(function bindBackgroundControls() {
const pickBg = $('#pickBg');
const bgFileInput = $('#bgFileInput');
if (pickBg && bgFileInput && !pickBg.dataset.bound) {
pickBg.dataset.bound = '1';
pickBg.addEventListener('click', function () {
bgFileInput.click();
});
bgFileInput.addEventListener('change', function (e) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const file = e.target.files && e.target.files[0];
e.target.value = '';
if (!file) return;
toast(dict.imgProcessing);
compressImage(file, 1600, 0.8)
.then(function (data) {
state.bg = data;
applyTheme();
savePrefs();
toast(dict.bgApplied);
})
.catch(function () {
toast(dict.imgFail);
});
});
}
const clearBg = $('#clearBg');
if (clearBg && !clearBg.dataset.bound) {
clearBg.dataset.bound = '1';
clearBg.addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
state.bg = null;
applyTheme();
savePrefs();
toast(dict.bgRemoved);
});
}
})();
// 深/淺色快捷切換
(function bindThemeToggle() {
const themeToggle = $('#themeToggle');
if (!themeToggle || themeToggle.dataset.bound) return;
themeToggle.dataset.bound = '1';
themeToggle.addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
state.lum = state.lum > 50 ? 15 : 85;
applyTheme();
savePrefs();
toast(state.lum > 50 ? dict.themeLight : dict.themeDark);
});
})();
// 匯出與匯入備份
(function bindLocalBackup() {
const exportBtn = $('#exportBtn');
if (exportBtn && !exportBtn.dataset.bound) {
exportBtn.dataset.bound = '1';
exportBtn.addEventListener('click', exportData);
}
const aboutExportBtn = $('#aboutExportBtn');
if (aboutExportBtn && !aboutExportBtn.dataset.bound) {
aboutExportBtn.dataset.bound = '1';
aboutExportBtn.addEventListener('click', exportData);
}
const importBtn = $('#importBtn');
const importFileInput = $('#importFileInput');
if (importBtn && importFileInput && !importBtn.dataset.bound) {
importBtn.dataset.bound = '1';
importBtn.addEventListener('click', function () {
importFileInput.click();
});
importFileInput.addEventListener('change', function (e) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const file = e.target.files && e.target.files[0];
e.target.value = '';
if (!file) return;
if (file.size > 60 * 1024 * 1024) {
toast(dict.importTooLarge);
return;
}
const reader = new FileReader();
reader.onload = function (ev) {
let data;
try {
data = JSON.parse(ev.target.result);
} catch (err) {
toast(dict.importParseFail);
return;
}
const err = validateBackup(data);
if (err) {
toast(dict.importInvalid.replace('{e}', err));
return;
}
customConfirm(
dict.confirmImportTitle,
dict.confirmImportMsg,
dict.confirmImportOk,
dict.cancel,
true
).then(function (ok) {
if (!ok) return;
restoreFromBackupData(data).then(function () {
toast(dict.importing);
if (typeof closeSettings === 'function') {
closeSettings();
}
});
});
};
reader.readAsText(file);
});
}
})();
// 清除所有資料
(function bindClearAll() {
const clearAllBtn = $('#clearAllBtn');
if (!clearAllBtn || clearAllBtn.dataset.bound) return;
clearAllBtn.dataset.bound = '1';
clearAllBtn.addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
customConfirm(
dict.confirmClearTitle,
dict.confirmClearMsg,
dict.confirmClearOk,
dict.cancel,
true
).then(function (ok1) {
if (!ok1) return;
customConfirm(
dict.confirmClear2Title,
dict.confirmClear2Msg,
dict.confirmClear2Ok,
dict.cancel,
true
).then(function (ok2) {
if (!ok2) return;
try {
localStorage.clear();
} catch (e) {}
accessToken = null;
updateGoogleUI();
document.cookie.split(';').forEach(function (c) {
document.cookie =
c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
});
if (IDB.available()) {
['photos', 'audio'].forEach(function (store) {
IDB.getAll(store)
.then(function (rows) {
rows.forEach(function (r) {
IDB.del(store, r.id).catch(function () {});
});
})
.catch(function () {});
});
}
toast(dict.clearedReload);
setTimeout(function () {
location.reload();
}, 1500);
});
});
});
})();
// Google Drive 雲端上傳與還原
(function bindGoogleDrive() {
updateGoogleUI();
window.addEventListener('load', function () {
setTimeout(initGoogleAuth, 1000);
});
const gBackupBtn = $('#gBackupBtn');
if (gBackupBtn && !gBackupBtn.dataset.bound) {
gBackupBtn.dataset.bound = '1';
gBackupBtn.addEventListener('click', async function () {
if (!accessToken) return;
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
toast(dict.gBackupUploading);
try {
const data = await buildBackupPayload();
const jsonString = JSON.stringify(data);
const searchRes = await fetch(
'googleapis.com',
{
headers: {
Authorization: 'Bearer ' + accessToken
}
}
);
if (searchRes.status === 401) {
clearGoogleToken();
toast(dict.gTokenExpired);
return;
}
const searchData = await searchRes.json();
let fileId = null;
if (searchData.files && searchData.files.length > 0) {
fileId = searchData.files[0].id;
}
const boundary = '-------314159265358979323846';
const delimiter = '\r\n--' + boundary + '\r\n';
const close_delim = '\r\n--' + boundary + '--';
const metadata = {
name: 'my_space_backup.json',
mimeType: 'application/json'
};
if (!fileId) {
metadata.parents = ['appDataFolder'];
}
const multipartRequestBody =
delimiter +
'Content-Type: application/json\r\n\r\n' +
JSON.stringify(metadata) +
delimiter +
'Content-Type: application/json\r\n\r\n' +
jsonString +
close_delim;
let url = 'googleapis.com';
let method = 'POST';
if (fileId) {
url += '/' + fileId;
method = 'PATCH';
}
url += '?uploadType=multipart';
const res = await fetch(url, {
method: method,
headers: {
Authorization: 'Bearer ' + accessToken,
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
}
const gRestoreBtn = $('#gRestoreBtn');
if (gRestoreBtn && !gRestoreBtn.dataset.bound) {
gRestoreBtn.dataset.bound = '1';
gRestoreBtn.addEventListener('click', async function () {
if (!accessToken) return;
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const ok = await customConfirm(
dict.gConfirmRestoreTitle,
dict.gConfirmRestoreMsg,
dict.gConfirmRestoreOk,
dict.cancel,
true
);
if (!ok) return;
toast(dict.gRestoreDownloading);
try {
const searchRes = await fetch(
'googleapis.com',
{
headers: {
Authorization: 'Bearer ' + accessToken
}
}
);
if (searchRes.status === 401) {
clearGoogleToken();
toast(dict.gTokenExpired);
return;
}
const searchData = await searchRes.json();
if (!searchData.files || searchData.files.length === 0) {
toast(dict.gRestoreEmpty);
return;
}
const fileId = searchData.files[0].id;
const fileRes = await fetch(
'googleapis.com' + fileId + '?alt=media',
{
headers: {
Authorization: 'Bearer ' + accessToken
}
}
);
if (fileRes.status === 401) {
clearGoogleToken();
toast(dict.gTokenExpired);
return;
}
const data = await fileRes.json();
const err = validateBackup(data);
if (err) {
toast(dict.importInvalid.replace('{e}', err));
return;
}
await restoreFromBackupData(data);
toast(dict.gRestoreOk);
if (typeof closeSettings === 'function') {
closeSettings();
}
} catch (err) {
console.error(err);
toast(dict.gRestoreFail);
}
});
}
})();
};
})();