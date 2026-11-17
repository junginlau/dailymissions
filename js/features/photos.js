// js/features/photos.js
function loadPhotoSrc(id) {
  if (photoCache[id]) return Promise.resolve(photoCache[id]);
  const fallbackLegacy = function () {
    const legacy = (legacyPhotos || []).find(function (p) {
      return p.id === id;
    });
    if (legacy && legacy.src) {
      photoCache[id] = legacy.src;
      return legacy.src;
    }
    return null;
  };
  if (!IDB.available()) return Promise.resolve(fallbackLegacy());
  return IDB.get('photos', id)
    .then(function (rec) {
      if (rec && rec.src) {
        photoCache[id] = rec.src;
        return rec.src;
      }
      return fallbackLegacy();
    })
    .catch(function () {
      return fallbackLegacy();
    });
}

function renderPhotos() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const grid = $('#photoGrid');
  if (!grid) return;

  const container = grid.closest('.photo-container');
  const isBatch = typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('photos');
  if (typeof BatchCtrl !== 'undefined') {
    BatchCtrl.renderToolbar(container, 'photos');
  }

  if (!photoMeta.length) {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">' + dict.photoEmpty + '</div>';
    return;
  }

  grid.innerHTML = photoMeta
    .map(function (p) {
      const selected = isBatch && BatchCtrl.isSelected(p.id);
      const badgeHtml = isBatch ? '<span class="batch-chk-badge"></span>' : '';
      return (
        '<button class="photo batch-selectable' +
        (selected ? ' is-selected' : '') +
        '" data-id="' +
        p.id +
        '">' +
        badgeHtml +
        '<img alt="" data-photo="' +
        p.id +
        '">' +
        '</button>'
      );
    })
    .join('');

  photoMeta.forEach(function (p) {
    loadPhotoSrc(p.id).then(function (src) {
      const img = grid.querySelector('img[data-photo="' + p.id + '"]');
      if (img && src) img.src = src;
    });
  });
}

let lightboxId = null;

function openLightbox(id) {
  const meta = photoMeta.find(function (x) {
    return x.id === id;
  });
  if (!meta) return;
  lightboxId = id;
  loadPhotoSrc(id).then(function (src) {
    if (!src) {
      toast((window.I18N[currentLang] || window.I18N['zh-TW']).imgFail);
      return;
    }
    $('#lightboxImg').src = src;
    $('#lightboxCaption').value = meta.title || '';
    $('#lightbox').classList.add('open');
    document.body.classList.add('lock');
  });
}

function closeLightbox() {
  $('#lightbox').classList.remove('open');
  lightboxId = null;
  if (!document.querySelector('.modal.open, .lightbox.open')) {
    document.body.classList.remove('lock');
  }
}

function initPhotosEvents() {
  const photoAdd = $('#photoAdd');
  const photoInput = $('#photoInput');
  if (photoAdd && photoInput && !photoAdd.dataset.bound) {
    photoAdd.dataset.bound = '1';
    photoAdd.addEventListener('click', function () {
      photoInput.click();
    });
    photoInput.addEventListener('change', function (e) {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const files = Array.prototype.slice.call(e.target.files || []);
      e.target.value = '';
      if (!files.length) return;
      if (!IDB.available()) {
        toast(dict.photoStorageFail);
        return;
      }
      toast(dict.photoProcessMulti.replace('{n}', files.length));
      let done = 0;
      const tasks = files.map(function (f) {
        return compressImage(f, 1600, 0.72)
          .then(function (src) {
            const id = uid();
            return IDB.put('photos', { id: id, src: src }).then(function () {
              photoCache[id] = src;
              photoMeta.push({ id: id, title: '' });
              done++;
            });
          })
          .catch(function () {});
      });
      Promise.all(tasks).then(function () {
        save('photoMeta');
        renderPhotos();
        toast(done > 0 ? dict.photoAdded.replace('{n}', done) : dict.imgFail);
      });
    });
  }

  const photoGrid = $('#photoGrid');
  if (photoGrid && !photoGrid.dataset.bound) {
    photoGrid.dataset.bound = '1';
    photoGrid.addEventListener('click', function (e) {
      const btn = e.target.closest('.photo[data-id]');
      if (!btn) return;
      if (typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('photos')) {
        BatchCtrl.toggle(btn.dataset.id);
        return;
      }
      openLightbox(btn.dataset.id);
    });
  }

  const lightboxClose = $('#lightboxClose');
  if (lightboxClose && !lightboxClose.dataset.bound) {
    lightboxClose.dataset.bound = '1';
    lightboxClose.addEventListener('click', closeLightbox);
  }

  const lightbox = $('#lightbox');
  if (lightbox && !lightbox.dataset.bound) {
    lightbox.dataset.bound = '1';
    lightbox.addEventListener('click', function (e) {
      if (e.target.id === 'lightbox') closeLightbox();
    });
  }

  const lightboxCaption = $('#lightboxCaption');
  if (lightboxCaption && !lightboxCaption.dataset.bound) {
    lightboxCaption.dataset.bound = '1';
    lightboxCaption.addEventListener('input', function () {
      if (!lightboxId) return;
      const meta = photoMeta.find(function (x) {
        return x.id === lightboxId;
      });
      if (meta) {
        meta.title = $('#lightboxCaption').value;
        save('photoMeta');
      }
    });
  }

  // [NEW] 單張照片刪除先移入垃圾桶（保留 IDB 本體直到永久刪除）
  const lightboxDel = $('#lightboxDel');
  if (lightboxDel && !lightboxDel.dataset.bound) {
    lightboxDel.dataset.bound = '1';
    lightboxDel.addEventListener('click', function () {
      if (!lightboxId) return;
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const id = lightboxId;
      const meta = photoMeta.find(function (x) {
        return x.id === id;
      });
      if (meta) {
        trash.push({
          id: uid(),
          type: 'photo',
          title: meta.title || dict.navPhotos || '照片',
          data: meta,
          deletedAt: Date.now()
        });
      }
      photoMeta = photoMeta.filter(function (x) {
        return x.id !== id;
      });
      save('trash');
      save('photoMeta');
      renderPhotos();
      closeLightbox();
      toast((dict.movedToTrash || '已將 {n} 個項目移至垃圾桶').replace('{n}', 1));
    });
  }
}
