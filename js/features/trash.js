// js/features/trash.js
function renderTrash() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const list = $('#trashList');
  if (!list) return;

  const container = list.closest('.trash-container');
  const isBatch = typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('trash');
  if (typeof BatchCtrl !== 'undefined') {
    BatchCtrl.renderToolbar(container, 'trash');
  }

  if (!trash.length) {
    list.innerHTML = '<div class="empty">' + dict.trashBinEmpty + '</div>';
    return;
  }

  trash.sort(function (a, b) {
    return b.deletedAt - a.deletedAt;
  });

  list.innerHTML = trash
    .map(function (item) {
      const daysLeft = Math.max(
        1,
        Math.ceil((14 * 24 * 60 * 60 * 1000 - (Date.now() - item.deletedAt)) / (1000 * 60 * 60 * 24))
      );
      let typeName = '未知';
      if (item.type === 'note') typeName = dict.navNotes;
      if (item.type === 'photo') typeName = dict.navPhotos || '照片庫';
      if (item.type === 'ledger') typeName = dict.navLedger;
      if (item.type === 'event') typeName = dict.navCalendar || '日曆';

      const selected = isBatch && BatchCtrl.isSelected(item.id);
      const badgeHtml = isBatch ? '<span class="batch-chk-badge"></span>' : '';
      const actsHtml = isBatch
        ? ''
        : '<div class="trash-acts">' +
          '<button class="btn ghost" data-act="restore" data-id="' +
          item.id +
          '">' +
          dict.trashBinRestore +
          '</button>' +
          '<button class="btn danger" data-act="perm-del" data-id="' +
          item.id +
          '">' +
          dict.trashBinDelete +
          '</button>' +
          '</div>';

      return (
        '<div class="trash-item batch-selectable' +
        (selected ? ' is-selected' : '') +
        '" data-id="' +
        item.id +
        '" style="' +
        (isBatch ? 'padding-right:42px;cursor:pointer;' : '') +
        '">' +
        badgeHtml +
        '<div class="trash-info">' +
        '<span class="trash-title">' +
        escapeHtml(item.title || '無標題') +
        '</span>' +
        '<div style="display:flex; gap:8px; align-items:center;">' +
        '<span class="trash-type">' +
        typeName +
        '</span>' +
        '<span class="trash-meta">' +
        dict.trashBinDaysLeft.replace('{n}', daysLeft) +
        '</span>' +
        '</div>' +
        '</div>' +
        actsHtml +
        '</div>'
      );
    })
    .join('');
}

function initTrashEvents() {
  const list = $('#trashList');
  if (list && !list.dataset.bound) {
    list.dataset.bound = '1';
    list.addEventListener('click', function (e) {
      const row = e.target.closest('.trash-item[data-id]');
      if (row && typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('trash')) {
        BatchCtrl.toggle(row.dataset.id);
        return;
      }

      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const itemIndex = trash.findIndex(function (x) {
        return x.id === id;
      });
      if (itemIndex < 0) return;
      const item = trash[itemIndex];

      if (act === 'restore') {
        if (item.type === 'note') {
          notes.unshift(item.data);
          save('notes');
          if (typeof renderNotes === 'function') renderNotes();
        } else if (item.type === 'photo') {
          photoMeta.push(item.data);
          save('photoMeta');
          if (typeof renderPhotos === 'function') renderPhotos();
        } else if (item.type === 'ledger') {
          ledger.push(item.data);
          save('ledger');
          if (typeof renderLedger === 'function') renderLedger();
          if (typeof renderHome === 'function') renderHome();
        } else if (item.type === 'event' && item.dateKey) {
          if (!events[item.dateKey]) events[item.dateKey] = [];
          events[item.dateKey].push(item.data);
          save('events');
          if (typeof renderCalendar === 'function') renderCalendar();
          if (typeof renderHome === 'function') renderHome();
        }
        trash.splice(itemIndex, 1);
        save('trash');
        renderTrash();
        toast(dict.restoredFromTrash);
      } else if (act === 'perm-del') {
        customConfirm(
          dict.confirmPerm1Title || dict.trashBinDelete,
          (dict.confirmPerm1Msg || '此操作無法復原！').replace('{n}', 1),
          dict.delete,
          dict.cancel,
          true
        ).then(function (ok1) {
          if (!ok1) return;
          customConfirm(
            dict.confirmPerm2Title || '最後重複確認',
            dict.confirmPerm2Msg || '刪除後將無法復原，確定執行？',
            dict.delete,
            dict.cancel,
            true
          ).then(function (ok2) {
            if (!ok2) return;
            if (item.type === 'photo' && item.data && item.data.id) {
              delete photoCache[item.data.id];
              if (IDB.available()) {
                IDB.del('photos', item.data.id).catch(function () {});
              }
            }
            trash.splice(itemIndex, 1);
            save('trash');
            renderTrash();
            toast(dict.permanentlyDeleted);
          });
        });
      }
    });
  }

  const emptyBtn = $('#emptyTrashBtn');
  if (emptyBtn && !emptyBtn.dataset.bound) {
    emptyBtn.dataset.bound = '1';
    emptyBtn.addEventListener('click', function () {
      if (!trash.length) return;
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      customConfirm(
        dict.confirmPerm1Title || '清空垃圾桶',
        (dict.confirmPerm1Msg || '所有項目將被永久刪除！').replace('{n}', trash.length),
        dict.delete,
        dict.cancel,
        true
      ).then(function (ok1) {
        if (!ok1) return;
        customConfirm(
          dict.confirmPerm2Title || '最後重複確認',
          dict.confirmPerm2Msg || '清空後所有項目將永遠消失，確定執行？',
          dict.delete,
          dict.cancel,
          true
        ).then(function (ok2) {
          if (!ok2) return;
          trash.forEach(function (item) {
            if (item.type === 'photo' && item.data && item.data.id) {
              delete photoCache[item.data.id];
              if (IDB.available()) {
                IDB.del('photos', item.data.id).catch(function () {});
              }
            }
          });
          trash = [];
          save('trash');
          renderTrash();
          toast(dict.permanentlyDeleted);
        });
      });
    });
  }
}
