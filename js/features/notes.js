// js/features/notes.js
let editingNoteId = null;
let noteImageData = null;

function updateNoteImagePreview() {
  const wrap = $('#noteImgWrap');
  if (noteImageData) {
    $('#noteImgPreview').src = noteImageData;
    wrap.hidden = false;
  } else {
    $('#noteImgPreview').removeAttribute('src');
    wrap.hidden = true;
  }
}

function renderNotes() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const grid = $('#notesGrid');
  if (!grid) return;

  const container = grid.closest('.notes-container');
  const isBatch = typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('notes');
  if (typeof BatchCtrl !== 'undefined') {
    BatchCtrl.renderToolbar(container, 'notes');
  }

  if (!notes.length) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = notes
    .map(function (n) {
      const excerpt = (n.content || '').replace(/\s+/g, ' ').slice(0, 70);
      const selected = isBatch && BatchCtrl.isSelected(n.id);
      const badgeHtml = isBatch ? '<span class="batch-chk-badge"></span>' : '';

      return (
        '<button class="card note batch-selectable' +
        (selected ? ' is-selected' : '') +
        '" data-id="' +
        n.id +
        '">' +
        badgeHtml +
        (n.image ? '<div class="note-thumb" style="background-image:url(\'' + n.image + '\')"></div>' : '') +
        '<div class="note-h">' +
        escapeHtml(n.title || dict.noteUntitled) +
        '</div>' +
        '<div class="note-b">' +
        escapeHtml(excerpt) +
        '</div>' +
        '<div class="note-d">' +
        escapeHtml(n.date || '') +
        '</div>' +
        '</button>'
      );
    })
    .join('');
}

function openNoteModal(id) {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  editingNoteId = id || null;
  const n = id
    ? notes.find(function (x) {
        return x.id === id;
      })
    : null;
  $('#noteModalTitle').textContent = n ? dict.noteEdit : dict.noteNew;
  $('#noteTitle').value = n ? n.title || '' : '';
  $('#noteDate').value = n ? n.date || todayKey() : todayKey();
  $('#noteContent').value = n ? n.content || '' : '';
  noteImageData = n ? n.image || null : null;
  updateNoteImagePreview();
  $('#noteDelete').style.display = n ? '' : 'none';
  openModal('#noteModal');
  setTimeout(function () {
    $('#noteTitle').focus();
  }, 80);
}

function initNotesEvents() {
  const noteAdd = $('#noteAdd');
  if (noteAdd && !noteAdd.dataset.bound) {
    noteAdd.dataset.bound = '1';
    noteAdd.addEventListener('click', function () {
      openNoteModal(null);
    });
  }

  const notesGrid = $('#notesGrid');
  if (notesGrid && !notesGrid.dataset.bound) {
    notesGrid.dataset.bound = '1';
    notesGrid.addEventListener('click', function (e) {
      const card = e.target.closest('.note[data-id]');
      if (!card) return;
      if (typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('notes')) {
        BatchCtrl.toggle(card.dataset.id);
        return;
      }
      openNoteModal(card.dataset.id);
    });
  }

  const noteImgPick = $('#noteImgPick');
  const noteImgInput = $('#noteImgInput');
  if (noteImgPick && noteImgInput && !noteImgPick.dataset.bound) {
    noteImgPick.dataset.bound = '1';
    noteImgPick.addEventListener('click', function () {
      noteImgInput.click();
    });
    noteImgInput.addEventListener('change', function (e) {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      toast(dict.imgProcessing);
      compressImage(file, 1200, 0.75)
        .then(function (data) {
          noteImageData = data;
          updateNoteImagePreview();
        })
        .catch(function () {
          toast(dict.imgFail);
        });
    });
  }

  const noteImgClear = $('#noteImgClear');
  if (noteImgClear && !noteImgClear.dataset.bound) {
    noteImgClear.dataset.bound = '1';
    noteImgClear.addEventListener('click', function () {
      noteImageData = null;
      updateNoteImagePreview();
    });
  }

  const noteSave = $('#noteSave');
  if (noteSave && !noteSave.dataset.bound) {
    noteSave.dataset.bound = '1';
    noteSave.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const title = $('#noteTitle').value.trim();
      const content = $('#noteContent').value.trim();
      const date = $('#noteDate').value;
      if (!title && !content && !noteImageData) {
        toast(dict.noteEmpty);
        return;
      }
      if (editingNoteId) {
        const n = notes.find(function (x) {
          return x.id === editingNoteId;
        });
        if (n) {
          n.title = title;
          n.content = content;
          n.date = date;
          n.image = noteImageData;
        }
      } else {
        notes.unshift({
          id: uid(),
          title: title,
          content: content,
          date: date,
          image: noteImageData
        });
      }
      save('notes');
      renderNotes();
      closeModal('#noteModal');
      toast(dict.noteSaved);
    });
  }

  const noteDelete = $('#noteDelete');
  if (noteDelete && !noteDelete.dataset.bound) {
    noteDelete.dataset.bound = '1';
    noteDelete.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      if (!editingNoteId) return;
      const n = notes.find(function (x) {
        return x.id === editingNoteId;
      });
      if (n) {
        trash.push({
          id: uid(),
          type: 'note',
          title: n.title || dict.noteUntitled,
          data: n,
          deletedAt: Date.now()
        });
      }
      notes = notes.filter(function (x) {
        return x.id !== editingNoteId;
      });
      save('trash');
      save('notes');
      renderNotes();
      closeModal('#noteModal');
      toast((dict.movedToTrash || '已將 {n} 個項目移至垃圾桶').replace('{n}', 1));
    });
  }
}