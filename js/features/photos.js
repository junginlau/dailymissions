// js/features/photos.js
function loadPhotoSrc(id) {
  if (photoCache[id]) return Promise.resolve(photoCache[id]);
  const fallbackLegacy = function () { const legacy = (legacyPhotos || []).find(function (p) { return p.id === id; }); if (legacy && legacy.src) { photoCache[id] = legacy.src; return legacy.src; } return null; };
  if (!IDB.available()) return Promise.resolve(fallbackLegacy());
  return IDB.get('photos', id).then(function (rec) { if (rec && rec.src) { photoCache[id] = rec.src; return rec.src; } return fallbackLegacy(); }).catch(function () { return fallbackLegacy(); });
}

function renderPhotos() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const grid = $('#photoGrid'); if (!grid) return;
  if (!photoMeta.length) { grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">' + dict.photoEmpty + '</div>'; return; }
  grid.innerHTML = photoMeta.map(function (p) { return '<button class="photo" data-id="' + p.id + '"><img alt="" data-photo="' + p.id + '"></button>'; }).join('');
  photoMeta.forEach(function (p) { loadPhotoSrc(p.id).then(function (src) { const img = grid.querySelector('img[data-photo="' + p.id + '"]'); if (img && src) img.src = src; }); });
}

let lightboxId = null;
function openLightbox(id) {
  const meta = photoMeta.find(function (x) { return x.id === id; }); if (!meta) return; lightboxId = id;
  loadPhotoSrc(id).then(function (src) { if (!src) { toast((window.I18N[currentLang] || window.I18N['zh-TW']).imgFail); return; } $('#lightboxImg').src = src; $('#lightboxCaption').value = meta.title || ''; $('#lightbox').classList.add('open'); document.body.classList.add('lock'); });
}
function closeLightbox() { $('#lightbox').classList.remove('open'); lightboxId = null; if (!document.querySelector('.modal.open, .lightbox.open')) document.body.classList.remove('lock'); }

function initPhotosEvents() {
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
  
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') closeLightbox(); });
  $('#lightboxCaption').addEventListener('input', function () { if (!lightboxId) return; const meta = photoMeta.find(function (x) { return x.id === lightboxId; }); if (meta) { meta.title = $('#lightboxCaption').value; save('photoMeta'); } });
  $('#lightboxDel').addEventListener('click', function () { if (!lightboxId) return; const dict = window.I18N[currentLang] || window.I18N['zh-TW']; const id = lightboxId; photoMeta = photoMeta.filter(function (x) { return x.id !== id; }); delete photoCache[id]; save('photoMeta'); if (IDB.available()) IDB.del('photos', id).catch(function () {}); renderPhotos(); closeLightbox(); toast(dict.photoDeleted); });
}