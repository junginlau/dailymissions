// js/features/diary.js
let diaryFilterDate = '';
let editingDiaryId = null;
let diaryImageData = null;

function updateDiaryImagePreview() {
  const wrap = $('#diaryImgWrap');
  if (diaryImageData) { $('#diaryImgPreview').src = diaryImageData; wrap.hidden = false; } else { $('#diaryImgPreview').removeAttribute('src'); wrap.hidden = true; }
}

function resetDiaryForm() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  editingDiaryId = null; diaryImageData = null;
  $('#diaryTitle').value = ''; $('#diaryContent').value = ''; $('#diaryWeather').value = ''; $('#diaryMood').value = '';
  updateDiaryImagePreview();
  $('#diaryCancelEdit').hidden = true;
  $('#diarySave').textContent = dict.diarySave;
  $('#diaryLockNote').textContent = dict.diaryLockNote;
}

function renderDiaries() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  let list = diaries.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  if (diaryFilterDate) list = list.filter(function (d) { return dateKey(new Date(d.createdAt)) === diaryFilterDate; });
  const wrap = $('#diaryList'); if (!list.length) { wrap.innerHTML = '<div class="empty">' + (diaryFilterDate ? dict.diaryEmptyDay : dict.diaryEmpty) + '</div>'; return; }
  wrap.innerHTML = list.map(function (d) { const dt = new Date(d.createdAt); return '<div class="diary-card" data-id="' + d.id + '"><div class="diary-meta"><span>' + fmtDateTime(dt) + '</span>' + (d.weather ? '<span class="tag">' + escapeHtml(d.weather) + '</span>' : '') + (d.mood ? '<span class="tag">' + escapeHtml(d.mood) + '</span>' : '') + '</div><div class="diary-title">' + escapeHtml(d.title) + '</div><div class="diary-preview">' + escapeHtml(d.content) + '</div></div>'; }).join('');
  
  // [NEW] 手機版顯示懸浮按鈕
  const mobileAddBtn = $('#mobileDiaryAddBtn');
  if (mobileAddBtn) {
    mobileAddBtn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
  }
}

function openDiaryModal(id) {
  const d = diaries.find(function (x) { return x.id === id; }); if (!d) return; const dt = new Date(d.createdAt);
  $('#diaryModalTitle').textContent = d.title; 
  $('#diaryModalMeta').innerHTML = fmtDateTime(dt) + (d.weather ? ' · ' + escapeHtml(d.weather) : '') + (d.mood ? ' · ' + escapeHtml(d.mood) : '');
  $('#diaryModalBody').textContent = d.content; 
  
  if (d.image) { $('#diaryModalImg').src = d.image; $('#diaryModalImg').hidden = false; } else { $('#diaryModalImg').removeAttribute('src'); $('#diaryModalImg').hidden = true; }
  
  $('#diaryModalEditBtn').onclick = function() {
    closeModal('#diaryModal');
    editDiary(id);
  };
  
  openModal('#diaryModal');
}

function editDiary(id) {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const d = diaries.find(function (x) { return x.id === id; }); if (!d) return;
  editingDiaryId = id; diaryImageData = d.image || null;
  $('#diaryTitle').value = d.title; $('#diaryContent').value = d.content; $('#diaryWeather').value = d.weather || ''; $('#diaryMood').value = d.mood || '';
  updateDiaryImagePreview();
  $('#diaryCancelEdit').hidden = false;
  $('#diarySave').textContent = dict.diaryUpdate;
  $('#diaryLockNote').textContent = dict.diaryEditingNote;
  showView('diary');
  $('#diaryCompose').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

  // [NEW] 手機版懸浮按鈕點擊事件：打開一個空白的日記彈窗
  const mobileAddBtn = $('#mobileDiaryAddBtn');
  if (mobileAddBtn) {
    mobileAddBtn.addEventListener('click', function() {
      resetDiaryForm();
      // 在手機版，我們直接把左邊的表單移到彈窗裡顯示
      // 這裡簡化處理：點擊後切換到左邊的輸入區塊並滾動到它
      const diaryLeft = document.querySelector('.diary-left');
      if (diaryLeft) {
        diaryLeft.style.display = 'block';
        diaryLeft.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  $('#diaryImgPick').addEventListener('click', function() { $('#diaryImgInput').click(); });
  $('#diaryImgInput').addEventListener('change', function(e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; toast(dict.imgProcessing);
    compressImage(file, 1200, 0.75).then(function(data) { diaryImageData = data; updateDiaryImagePreview(); }).catch(function() { toast(dict.imgFail); });
  });
  $('#diaryImgClear').addEventListener('click', function() { diaryImageData = null; updateDiaryImagePreview(); });
  $('#diaryCancelEdit').addEventListener('click', function() { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; resetDiaryForm(); toast(dict.diaryEditCancelled); });

  $('#diarySave').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const title = $('#diaryTitle').value.trim(); const content = $('#diaryContent').value.trim(); 
    if (!title) { toast(dict.diaryTitleRequired); $('#diaryTitle').focus(); return; } 
    if (!content) { toast(dict.diaryContentRequired); $('#diaryContent').focus(); return; }
    
    if (editingDiaryId) {
      const d = diaries.find(function (x) { return x.id === editingDiaryId; });
      if (d) {
        d.title = title; d.weather = $('#diaryWeather').value; d.mood = $('#diaryMood').value; d.content = content;
        if (diaryImageData && diaryImageData !== d.image) {
          const newId = uid();
          if (IDB.available()) IDB.put('photos', { id: newId, src: diaryImageData }).catch(function(){});
          photoCache[newId] = diaryImageData;
          const dDate = dateKey(new Date(d.createdAt));
          photoMeta.push({ id: newId, title: dDate });
          d.image = diaryImageData;
          save('photoMeta');
        } else if (!diaryImageData && d.image) {
          d.image = null;
        } else if (diaryImageData) {
          d.image = diaryImageData;
        }
      }
      save('diaries'); resetDiaryForm(); renderDiaries(); renderPhotos(); renderHome(); toast(dict.diaryUpdated);
    } else {
      const newDiaryId = uid();
      let finalImg = null;
      if (diaryImageData) {
        finalImg = diaryImageData;
        const newId = uid();
        if (IDB.available()) IDB.put('photos', { id: newId, src: diaryImageData }).catch(function(){});
        photoCache[newId] = diaryImageData;
        const today = todayKey();
        photoMeta.push({ id: newId, title: today });
        save('photoMeta');
      }
      diaries.push({ id: newDiaryId, title: title, weather: $('#diaryWeather').value, mood: $('#diaryMood').value, content: content, image: finalImg, createdAt: Date.now() }); 
      save('diaries');
      resetDiaryForm(); renderDiaries(); renderPhotos(); renderHome(); toast(dict.diarySaved);
    }
  });

  $('#diaryDatePickerBtn').addEventListener('click', function () { $('#diaryDateInput').value = diaryFilterDate || todayKey(); openModal('#diaryDateModal'); });
  $('#diaryDateConfirm').addEventListener('click', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const val = $('#diaryDateInput').value;
    if (val) { diaryFilterDate = val; $('#diaryDatePickerBtn').textContent = dict.diaryFilterDate.replace('{d}', val); $('#diaryClearFilter').hidden = false; renderDiaries(); } closeModal('#diaryDateModal');
  });
  $('#diaryClearFilter').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; diaryFilterDate = ''; $('#diaryDatePickerBtn').textContent = dict.diaryFilterAll; $('#diaryClearFilter').hidden = true; renderDiaries(); });
}