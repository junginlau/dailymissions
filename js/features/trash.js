// js/features/trash.js
function renderTrash() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const list = $('#trashList'); if(!list) return;
  if (!trash.length) { list.innerHTML = '<div class="empty">' + dict.trashBinEmpty + '</div>'; return; }
  
  trash.sort((a, b) => b.deletedAt - a.deletedAt);
  
  list.innerHTML = trash.map(item => {
    const daysLeft = Math.ceil((14 * 24 * 60 * 60 * 1000 - (Date.now() - item.deletedAt)) / (1000 * 60 * 60 * 24));
    let typeName = '未知';
    if (item.type === 'note') typeName = dict.navNotes;
    if (item.type === 'diary') typeName = dict.navDiary;
    if (item.type === 'ledger') typeName = dict.navLedger;
    
    return `
      <div class="trash-item" data-id="${item.id}">
        <div class="trash-info">
          <span class="trash-title">${escapeHtml(item.title || '無標題')}</span>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="trash-type">${typeName}</span>
            <span class="trash-meta">${dict.trashBinDaysLeft.replace('{n}', daysLeft)}</span>
          </div>
        </div>
        <div class="trash-acts">
          <button class="btn ghost" data-act="restore" data-id="${item.id}">${dict.trashBinRestore}</button>
          <button class="btn danger" data-act="perm-del" data-id="${item.id}">${dict.trashBinDelete}</button>
        </div>
      </div>
    `;
  }).join('');
}

function initTrashEvents() {
  const list = $('#trashList');
  if (list) {
    list.addEventListener('click', function(e) {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const id = btn.dataset.id;
      const act = btn.dataset.act;
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const itemIndex = trash.findIndex(x => x.id === id);
      if (itemIndex < 0) return;
      const item = trash[itemIndex];

      if (act === 'restore') {
        if (item.type === 'note') { notes.unshift(item.data); save('notes'); renderNotes(); }
        if (item.type === 'diary') { diaries.push(item.data); save('diaries'); renderDiaries(); }
        if (item.type === 'ledger') { ledger.push(item.data); save('ledger'); renderLedger(); }
        trash.splice(itemIndex, 1); save('trash'); renderTrash(); toast(dict.restoredFromTrash);
      } else if (act === 'perm-del') {
        customConfirm(dict.trashBinDelete, '此操作無法復原！', dict.delete, dict.cancel, true).then(ok => {
          if (!ok) return;
          trash.splice(itemIndex, 1); save('trash'); renderTrash(); toast(dict.permanentlyDeleted);
        });
      }
    });
  }

  const emptyBtn = $('#emptyTrashBtn');
  if (emptyBtn) {
    emptyBtn.addEventListener('click', function() {
      if (!trash.length) return;
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      customConfirm('清空垃圾桶', '所有項目將被永久刪除！', dict.delete, dict.cancel, true).then(ok => {
        if (!ok) return;
        trash = []; save('trash'); renderTrash(); toast(dict.permanentlyDeleted);
      });
    });
  }
}