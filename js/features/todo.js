// js/features/todo.js

// ==========================================
// 每週必做
// ==========================================
function tagById(id) { return todos.tags.find(function (t) { return t.id === id; }) || null; }
function tagsForDay(dayKey) { return (todos.schedule[dayKey] || []).map(tagById).filter(Boolean); }

function renderTodos() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const now = new Date(); const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); const todayDayKey = dayKeyOf(now); const tomorrowDayKey = dayKeyOf(tomorrow); const todayDateKey = dateKey(now); const todayDone = Array.isArray(todos.done[todayDateKey]) ? todos.done[todayDateKey] : [];
  const todayTags = tagsForDay(todayDayKey); const tomorrowTags = tagsForDay(tomorrowDayKey); const todayCol = $('#todayCol');
  if (!todayCol) return;
  const doneCount = todayTags.filter(function (t) { return todayDone.indexOf(t.id) >= 0; }).length;
  todayCol.innerHTML = '<div class="card today-card"><div class="today-head"><h3>' + dict.todayLabel + ' · ' + dayLabelOf(todayDayKey) + '</h3><span class="badge">' + (todayTags.length ? doneCount + ' / ' + todayTags.length : '—') + '</span></div><div class="today-list scroll-box">' + (todayTags.length ? todayTags.map(function (t) { const done = todayDone.indexOf(t.id) >= 0; return '<button class="today-item' + (done ? ' done' : '') + '" data-tag="' + t.id + '"><span class="chk"></span><span class="label">' + escapeHtml(t.name) + '</span></button>'; }).join('') : '<div class="empty small">' + dict.todoEmptyDay + '</div>') + '</div></div>';
  const tomorrowCol = $('#tomorrowCol');
  if (!tomorrowCol) return;
  tomorrowCol.innerHTML = '<div class="card tomorrow-card"><h4>' + dict.tomorrowLabel + ' · ' + dayLabelOf(tomorrowDayKey) + '</h4><div class="tomorrow-list">' + (tomorrowTags.length ? tomorrowTags.map(function (t) { return '<span class="tomorrow-tag">' + escapeHtml(t.name) + '</span>'; }).join('') : '<span class="empty small" style="padding:0;">—</span>') + '</div></div>';
}

let todoDraft = null; let todoChanged = false;
function checkTodoChanged() {
  if (!todoDraft) return; const dict = window.I18N[currentLang] || window.I18N['zh-TW']; const s1 = JSON.stringify(todoDraft); const s2 = JSON.stringify(todos); todoChanged = (s1 !== s2);
  const btnSave = $('#todoSaveBtn'); const btnCancel = $('#todoCancelBtn');
  if (todoChanged) { btnSave.disabled = false; btnSave.textContent = dict.todoSave; btnSave.style.background = '#2e9e5e'; btnSave.style.color = '#fff'; btnSave.style.borderColor = 'transparent'; btnCancel.style.display = 'inline-flex'; }
  else { btnSave.disabled = true; btnSave.textContent = dict.todoSave; btnSave.style.background = 'var(--hover)'; btnSave.style.color = 'var(--fg-dim)'; btnSave.style.borderColor = 'transparent'; btnCancel.style.display = 'none'; }
}

function openTodoSettings() {
  todoDraft = JSON.parse(JSON.stringify(todos)); if (!todoDraft.tags) todoDraft.tags = []; if (!todoDraft.schedule) todoDraft.schedule = emptyTodoData().schedule;
  WEEKDAYS.forEach(function (w) { if (!Array.isArray(todoDraft.schedule[w.key])) todoDraft.schedule[w.key] = []; });
  renderTagPool(); renderSchedule(); checkTodoChanged(); openModal('#todoModal');
}

function renderTagPool() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const pool = $('#tagPool'); if (!pool) return;
  if (!todoDraft.tags.length) { pool.innerHTML = '<div class="empty small" style="padding:6px 0;">' + dict.tagEmpty + '</div>'; return; }
  pool.innerHTML = todoDraft.tags.map(function (t) { return '<span class="tag-chip">' + escapeHtml(t.name) + '<button class="chip-x" data-del-tag="' + t.id + '" aria-label="刪除標籤">×</button></span>'; }).join('');
}

function renderSchedule() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const grid = $('#scheduleGrid'); if (!grid) return;
  if (!todoDraft.tags.length) { grid.innerHTML = '<div class="empty small" style="grid-column:1/-1;">' + dict.scheduleEmpty + '</div>'; return; }
  grid.innerHTML = WEEKDAYS.map(function (w) { const assigned = todoDraft.schedule[w.key] || []; const label = (dict.weekdaysFull && dict.weekdaysFull[w.key]) || w.label; return '<div class="sched-card"><h4>' + label + '</h4><div class="sched-tags">' + todoDraft.tags.map(function (t) { const on = assigned.indexOf(t.id) >= 0; return '<button class="sched-tag' + (on ? ' on' : '') + '" data-toggle-day="' + w.key + '" data-tag="' + t.id + '">' + escapeHtml(t.name) + '</button>'; }).join('') + '</div></div>'; }).join('');
}

function checkUnfinishedTasks() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const today = todayKey(); if (LS.get('lastTodoCheck', '') === today) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); const yKey = dayKeyOf(yesterday); const yDateKey = dateKey(yesterday);
  const yTags = tagsForDay(yKey); const yDone = Array.isArray(todos.done[yDateKey]) ? todos.done[yDateKey] : []; const unfinishedCount = yTags.filter(t => yDone.indexOf(t.id) < 0).length;
  if (unfinishedCount > 0) { LS.set('lastTodoCheck', today); toast(dict.yesterdayUnfinished.replace('{n}', unfinishedCount)); }
  else { LS.set('lastTodoCheck', today); }
}

// ==========================================
// 綁定每週必做的事件
// ==========================================
function initTodoEvents() {
  const todayCol = $('#todayCol');
  if (todayCol) {
    todayCol.addEventListener('click', function (e) {
      const btn = e.target.closest('.today-item'); if (!btn) return; const id = btn.dataset.tag; const tk = dateKey(new Date()); if (!Array.isArray(todos.done[tk])) todos.done[tk] = [];
      const arr = todos.done[tk]; const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id); save('todos'); renderTodos(); renderHome();
    });
  }

  const tagAddBtn = $('#tagAddBtn');
  if (tagAddBtn) {
    tagAddBtn.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const input = $('#tagInput'); const v = input.value.trim(); if (!v) { input.focus(); return; }
      if (todoDraft.tags.some(function (t) { return t.name === v; })) { toast(dict.tagDup); return; }
      todoDraft.tags.push({ id: uid(), name: v }); input.value = ''; renderTagPool(); renderSchedule(); checkTodoChanged(); input.focus();
    });
  }

  const tagInput = $('#tagInput');
  if (tagInput) {
    tagInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#tagAddBtn').click(); } });
  }

  const tagPool = $('#tagPool');
  if (tagPool) {
    tagPool.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-del-tag]'); if (!btn) return; const id = btn.dataset.delTag;
      todoDraft.tags = todoDraft.tags.filter(function (t) { return t.id !== id; });
      WEEKDAYS.forEach(function (w) { todoDraft.schedule[w.key] = todoDraft.schedule[w.key].filter(function (x) { return x !== id; }); });
      renderTagPool(); renderSchedule(); checkTodoChanged();
    });
  }

  const scheduleGrid = $('#scheduleGrid');
  if (scheduleGrid) {
    scheduleGrid.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-toggle-day]'); if (!btn) return; const day = btn.dataset.toggleDay; const tagId = btn.dataset.tag;
      const arr = todoDraft.schedule[day]; const i = arr.indexOf(tagId); if (i >= 0) arr.splice(i, 1); else arr.push(tagId);
      renderSchedule(); checkTodoChanged();
    });
  }

  const todoSaveBtn = $('#todoSaveBtn');
  if (todoSaveBtn) {
    todoSaveBtn.addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; if (!todoChanged) return; todos = todoDraft; save('todos'); renderTodos(); renderHome(); closeModal('#todoModal'); toast(dict.todoSaved); });
  }

  const todoCancelBtn = $('#todoCancelBtn');
  if (todoCancelBtn) {
    todoCancelBtn.addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; todoDraft = JSON.parse(JSON.stringify(todos)); renderTagPool(); renderSchedule(); checkTodoChanged(); toast(dict.todoReverted); });
  }

  const todoSettingsBtn = $('#todoSettingsBtn');
  if (todoSettingsBtn) {
    todoSettingsBtn.addEventListener('click', openTodoSettings);
  }
}