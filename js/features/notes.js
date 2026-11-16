// js/features/notes.js
let selectedNoteIds = new Set();
let editingNoteId = null; let noteImageData = null;

function updateNoteImagePreview() { const wrap = $('#noteImgWrap'); if (noteImageData) { $('#noteImgPreview').src = noteImageData; wrap.hidden = false; } else { $('#noteImgPreview').removeAttribute('src'); wrap.hidden = true; } }

function renderNotes() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const grid = $('#notesGrid'); 
  const container = grid.parentNode.parentNode; // .notes-container
  
  // 生成多選操作列
  let bulkHtml = `
    <div class="bulk-actions" id="notesBulkActions" style="display:${selectedNoteIds.size > 0 ? 'flex' : 'none'}">
      <label style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="selectAllNotes" ${selectedNoteIds.size === notes.length && notes.length > 0 ? 'checked' : ''}>
        <span>全選</span>
      </label>
      <span style="flex:1;"></span>
    </div>
  `;
  
  // 清除舊的 bulk-actions (如果有的話)
  const oldBulk = container.querySelector('.bulk-actions');
  if (oldBulk) oldBulk.remove();
  container.insertAdjacentHTML('afterbegin', bulkHtml);

  if (!notes.length) { grid.innerHTML = ''; return; }
  
  grid.innerHTML = notes.map(function (n) { 
    const excerpt = (n.content || '').replace(/\s+/g, ' ').slice(0, 70); 
    const isChecked = selectedNoteIds.has(n.id);
    return `
      <div class="note-wrapper" style="position:relative;">
        <input type="checkbox" class="note-check" data-id="${n.id}" ${isChecked ? 'checked' : ''} style="position:absolute; top:10px; left:10px; z-index:10; width:20px; height:20px; accent-color:var(--fg); cursor:pointer;">
        <button class="card note" data-id="${n.id}" style="width:100%;"> 
          ${n.image ? `<div class="note-thumb" style="background-image:url('${n.image}')"></div>` : ''}
          <div class="note-h">${escapeHtml(n.title || dict.noteUntitled)}</div>
          <div class="note-b">${escapeHtml(excerpt)}</div>
          <div class="note-d">${escapeHtml(n.date || '')}</div>
        </button>
      </div>
    `; 
  }).join('');

  // 綁定多選事件
  container.querySelector('#selectAllNotes')?.addEventListener('change', function(e) {
    if (e.target.checked) notes.forEach(n => selectedNoteIds.add(n.id));
    else selectedNoteIds.clear();
    renderNotes();
  });

  grid.querySelectorAll('.note-check').forEach(cb => {
    cb.addEventListener('change', function(e) {
      e.stopPropagation();
      const id = this.dataset.id;
      if (this.checked) selectedNoteIds.add(id);
      else selectedNoteIds.delete(id);
      
      const bulkBtn = $('#bulkDeleteNotesBtn');
      if (selectedNoteIds.size > 0) {
        bulkBtn.style.display = 'block';
        bulkBtn.innerHTML = `${window.I18N[currentLang].bulkDeleteBtn} (${selectedNoteIds.size})`;
      } else {
        bulkBtn.style.display = 'none';
      }
    });
  });
}

function openNoteModal(id) {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  editingNoteId = id || null; const n = id ? notes.find(function (x) { return x.id === id; }) : null;
  $('#noteModalTitle').textContent = n ? dict.noteEdit : dict.noteNew; $('#noteTitle').value = n ? (n.title || '') : ''; $('#noteDate').value = n ? (n.date || todayKey()) : todayKey(); $('#noteContent').value = n ? (n.content || '') : ''; noteImageData = n ? (n.image || null) : null;
  updateNoteImagePreview(); $('#noteDelete').style.display = n ? '' : 'none'; openModal('#noteModal'); setTimeout(function () { $('#noteTitle').focus(); }, 80);
}

function initNotesEvents() {
  $('#bulkDeleteNotesBtn').addEventListener('click', function() {
    if (selectedNoteIds.size === 0) return;
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    customConfirm(dict.confirmBulkDeleteTitle, dict.confirmBulkDeleteMsg, dict.delete, dict.cancel, true).then(ok => {
      if (!ok) return;
      let count = 0;
      notes = notes.filter(n => {
        if (selectedNoteIds.has(n.id)) {
          trash.push({ id: uid(), type: 'note', title: n.title, data: n, deletedAt: Date.now() });
          count++;
          return false;
        }
        return true;
      });
      save('trash'); save('notes'); selectedNoteIds.clear(); $('#bulkDeleteNotesBtn').style.display = 'none'; renderNotes(); toast(dict.movedToTrash.replace('{n}', count));
    });
  });

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
  $('#noteDelete').addEventListener('click', function () { 
    const dict = window.I18N[currentLang] || window.I18N['zh-TW']; 
    if (!editingNoteId) return; 
    const n = notes.find(x => x.id === editingNoteId);
    if (n) trash.push({ id: uid(), type: 'note', title: n.title, data: n, deletedAt: Date.now() });
    notes = notes.filter(function (x) { return x.id !== editingNoteId; }); 
    save('trash'); save('notes'); renderNotes(); closeModal('#noteModal'); toast(dict.noteDeleted); 
  });
}