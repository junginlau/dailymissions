// js/features/todo.js

// ==========================================
// 每週必做
// ==========================================
function tagById(id) {
  return todos.tags.find(function (t) {
    return t.id === id;
  }) || null;
}
function tagsForDay(dayKey) {
  return (todos.schedule[dayKey] || []).map(tagById).filter(Boolean);
}

function renderTodos() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todayDayKey = dayKeyOf(now);
  const tomorrowDayKey = dayKeyOf(tomorrow);
  const todayDateKey = dateKey(now);
  const todayDone = Array.isArray(todos.done[todayDateKey]) ? todos.done[todayDateKey] : [];
  const todayTags = tagsForDay(todayDayKey);
  const tomorrowTags = tagsForDay(tomorrowDayKey);
  const todayCol = $('#todayCol');
  if (!todayCol) return;
  const doneCount = todayTags.filter(function (t) {
    return todayDone.indexOf(t.id) >= 0;
  }).length;
  todayCol.innerHTML =
    '<div class="card today-card"><div class="today-head"><h3>' +
    dict.todayLabel +
    ' · ' +
    dayLabelOf(todayDayKey) +
    '</h3><span class="badge">' +
    (todayTags.length ? doneCount + ' / ' + todayTags.length : '—') +
    '</span></div><div class="today-list scroll-box">' +
    (todayTags.length
      ? todayTags
          .map(function (t) {
            const done = todayDone.indexOf(t.id) >= 0;
            return (
              '<button class="today-item' +
              (done ? ' done' : '') +
              '" data-tag="' +
              t.id +
              '"><span class="chk"></span><span class="label">' +
              escapeHtml(t.name) +
              '</span></button>'
            );
          })
          .join('')
      : '<div class="empty small">' + dict.todoEmptyDay + '</div>') +
    '</div></div>';
  const tomorrowCol = $('#tomorrowCol');
  if (!tomorrowCol) return;
  tomorrowCol.innerHTML =
    '<div class="card tomorrow-card"><h4>' +
    dict.tomorrowLabel +
    ' · ' +
    dayLabelOf(tomorrowDayKey) +
    '</h4><div class="tomorrow-list">' +
    (tomorrowTags.length
      ? tomorrowTags
          .map(function (t) {
            return '<span class="tomorrow-tag">' + escapeHtml(t.name) + '</span>';
          })
          .join('')
      : '<span class="empty small" style="padding:0;">—</span>') +
    '</div></div>';
}

let todoDraft = null;
let todoChanged = false;
let todoDrag = null; // { tagId, fromDay, mode: 'assign'|'reorder' }

function checkTodoChanged() {
  if (!todoDraft) return;
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const s1 = JSON.stringify(todoDraft);
  const s2 = JSON.stringify(todos);
  todoChanged = s1 !== s2;
  const btnSave = $('#todoSaveBtn');
  const btnCancel = $('#todoCancelBtn');
  if (todoChanged) {
    btnSave.disabled = false;
    btnSave.textContent = dict.todoSave;
    btnSave.style.background = '#2e9e5e';
    btnSave.style.color = '#fff';
    btnSave.style.borderColor = 'transparent';
    btnCancel.style.display = 'inline-flex';
  } else {
    btnSave.disabled = true;
    btnSave.textContent = dict.todoSave;
    btnSave.style.background = 'var(--hover)';
    btnSave.style.color = 'var(--fg-dim)';
    btnSave.style.borderColor = 'transparent';
    btnCancel.style.display = 'none';
  }
}

function openTodoSettings() {
  todoDraft = JSON.parse(JSON.stringify(todos));
  if (!todoDraft.tags) todoDraft.tags = [];
  if (!todoDraft.schedule) todoDraft.schedule = emptyTodoData().schedule;
  WEEKDAYS.forEach(function (w) {
    if (!Array.isArray(todoDraft.schedule[w.key])) todoDraft.schedule[w.key] = [];
  });
  renderTagPool();
  renderSchedule();
  checkTodoChanged();
  openModal('#todoModal');
}

function renderTagPool() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const pool = $('#tagPool');
  if (!pool) return;
  if (!todoDraft.tags.length) {
    pool.innerHTML = '<div class="empty small" style="padding:6px 0;">' + dict.tagEmpty + '</div>';
    return;
  }
  pool.innerHTML = todoDraft.tags
    .map(function (t) {
      return (
        '<span class="tag-chip" draggable="true" data-tag-id="' +
        t.id +
        '">' +
        escapeHtml(t.name) +
        '<button type="button" class="chip-x" data-del-tag="' +
        t.id +
        '" aria-label="刪除標籤">×</button></span>'
      );
    })
    .join('');
}

/**
 * 每天顯示全部標籤：
 * - 已選（on）：亮色，可點擊變灰取消選取，可拖曳排序
 * - 未選：灰色，可點擊變亮加入該天
 * 排序只影響已選標籤在 schedule[day] 中的順序；未選標籤固定排在後面。
 */
function renderSchedule() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const grid = $('#scheduleGrid');
  if (!grid) return;
  if (!todoDraft.tags.length) {
    grid.innerHTML =
      '<div class="empty small" style="grid-column:1/-1;">' +
      (dict.scheduleEmpty || '請先新增標籤') +
      '</div>';
    return;
  }

  grid.innerHTML = WEEKDAYS.map(function (w) {
    const assigned = todoDraft.schedule[w.key] || [];
    const label = (dict.weekdaysFull && dict.weekdaysFull[w.key]) || w.label;

    // 已選：依 schedule 順序；未選：依 tags 池順序接在後面
    const orderedOn = assigned
      .map(function (id) {
        return todoDraft.tags.find(function (t) {
          return t.id === id;
        });
      })
      .filter(Boolean);
    const offTags = todoDraft.tags.filter(function (t) {
      return assigned.indexOf(t.id) < 0;
    });
    const displayTags = orderedOn.concat(offTags);

    const tagsHtml = displayTags
      .map(function (t) {
        const on = assigned.indexOf(t.id) >= 0;
        return (
          '<button type="button" class="sched-tag' +
          (on ? ' on' : '') +
          '" draggable="' +
          (on ? 'true' : 'false') +
          '" data-toggle-day="' +
          w.key +
          '" data-tag="' +
          t.id +
          '">' +
          escapeHtml(t.name) +
          '</button>'
        );
      })
      .join('');

    return (
      '<div class="sched-card" data-day="' +
      w.key +
      '"><h4>' +
      label +
      '</h4><div class="sched-tags" data-day="' +
      w.key +
      '">' +
      tagsHtml +
      '</div></div>'
    );
  }).join('');
}

function addTagToDay(dayKey, tagId) {
  if (!todoDraft || !dayKey || !tagId) return false;
  if (!Array.isArray(todoDraft.schedule[dayKey])) todoDraft.schedule[dayKey] = [];
  if (todoDraft.schedule[dayKey].indexOf(tagId) >= 0) return false;
  todoDraft.schedule[dayKey].push(tagId);
  return true;
}

function removeTagFromDay(dayKey, tagId) {
  if (!todoDraft || !dayKey || !tagId) return false;
  const arr = todoDraft.schedule[dayKey];
  if (!Array.isArray(arr)) return false;
  const i = arr.indexOf(tagId);
  if (i < 0) return false;
  arr.splice(i, 1);
  return true;
}

/** 在同一天內把 tagId 插到 beforeTagId 前面；beforeTagId 為 null 則移到已選列表末尾 */
function reorderTagInDay(dayKey, tagId, beforeTagId) {
  if (!todoDraft || !dayKey || !tagId) return;
  const arr = todoDraft.schedule[dayKey];
  if (!Array.isArray(arr)) return;
  const from = arr.indexOf(tagId);
  if (from < 0) return;
  arr.splice(from, 1);
  if (beforeTagId) {
    const to = arr.indexOf(beforeTagId);
    if (to >= 0) arr.splice(to, 0, tagId);
    else arr.push(tagId);
  } else {
    arr.push(tagId);
  }
}

function checkUnfinishedTasks() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const today = todayKey();
  if (LS.get('lastTodoCheck', '') === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = dayKeyOf(yesterday);
  const yDateKey = dateKey(yesterday);
  const yTags = tagsForDay(yKey);
  const yDone = Array.isArray(todos.done[yDateKey]) ? todos.done[yDateKey] : [];
  const unfinishedCount = yTags.filter(function (t) {
    return yDone.indexOf(t.id) < 0;
  }).length;
  if (unfinishedCount > 0) {
    LS.set('lastTodoCheck', today);
    toast(dict.yesterdayUnfinished.replace('{n}', unfinishedCount));
  } else {
    LS.set('lastTodoCheck', today);
  }
}

// ==========================================
// 綁定每週必做的事件
// ==========================================
function initTodoEvents() {
  const todayCol = $('#todayCol');
  if (todayCol) {
    todayCol.addEventListener('click', function (e) {
      const btn = e.target.closest('.today-item');
      if (!btn) return;
      const id = btn.dataset.tag;
      const tk = dateKey(new Date());
      if (!Array.isArray(todos.done[tk])) todos.done[tk] = [];
      const arr = todos.done[tk];
      const i = arr.indexOf(id);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(id);
      save('todos');
      renderTodos();
      renderHome();
    });
  }

  const tagAddBtn = $('#tagAddBtn');
  if (tagAddBtn) {
    tagAddBtn.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const input = $('#tagInput');
      const v = input.value.trim();
      if (!v) {
        input.focus();
        return;
      }
      if (
        todoDraft.tags.some(function (t) {
          return t.name === v;
        })
      ) {
        toast(dict.tagDup);
        return;
      }
      todoDraft.tags.push({ id: uid(), name: v });
      input.value = '';
      renderTagPool();
      renderSchedule();
      checkTodoChanged();
      input.focus();
    });
  }

  const tagInput = $('#tagInput');
  if (tagInput) {
    tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        $('#tagAddBtn').click();
      }
    });
  }

  const tagPool = $('#tagPool');
  if (tagPool) {
    tagPool.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-del-tag]');
      if (!btn) return;
      const id = btn.dataset.delTag;
      todoDraft.tags = todoDraft.tags.filter(function (t) {
        return t.id !== id;
      });
      WEEKDAYS.forEach(function (w) {
        todoDraft.schedule[w.key] = todoDraft.schedule[w.key].filter(function (x) {
          return x !== id;
        });
      });
      renderTagPool();
      renderSchedule();
      checkTodoChanged();
    });

    tagPool.addEventListener('dragstart', function (e) {
      const chip = e.target.closest('.tag-chip[data-tag-id]');
      if (!chip || e.target.closest('[data-del-tag]')) {
        e.preventDefault();
        return;
      }
      todoDrag = { tagId: chip.dataset.tagId, fromDay: null, mode: 'assign' };
      e.dataTransfer.setData('text/plain', chip.dataset.tagId);
      e.dataTransfer.effectAllowed = 'copy';
      chip.classList.add('dragging');
    });
    tagPool.addEventListener('dragend', function (e) {
      const chip = e.target.closest('.tag-chip');
      if (chip) chip.classList.remove('dragging');
      todoDrag = null;
      clearSchedDragUI();
    });
  }

  function clearSchedDragUI() {
    $$('.sched-card.drag-over').forEach(function (el) {
      el.classList.remove('drag-over');
    });
    $$('.sched-tag.drag-target').forEach(function (el) {
      el.classList.remove('drag-target');
    });
  }

  const scheduleGrid = $('#scheduleGrid');
  if (scheduleGrid) {
    // 點擊：亮 ↔ 灰（加入 / 取消選取），標籤仍留在該天
    scheduleGrid.addEventListener('click', function (e) {
      const btn = e.target.closest('.sched-tag[data-toggle-day]');
      if (!btn) return;
      // 避免拖曳結束後的殘留 click
      if (btn.dataset.dragMoved === '1') {
        btn.dataset.dragMoved = '';
        return;
      }
      const day = btn.dataset.toggleDay;
      const tagId = btn.dataset.tag;
      const arr = todoDraft.schedule[day];
      const i = arr.indexOf(tagId);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(tagId);
      renderSchedule();
      checkTodoChanged();
    });

    // 已選標籤：拖曳排序；也可拖到其他天（加入該天）
    scheduleGrid.addEventListener('dragstart', function (e) {
      const btn = e.target.closest('.sched-tag.on[data-tag]');
      if (!btn) {
        if (e.target.closest('.sched-tag')) e.preventDefault();
        return;
      }
      todoDrag = {
        tagId: btn.dataset.tag,
        fromDay: btn.dataset.toggleDay,
        mode: 'reorder'
      };
      e.dataTransfer.setData('text/plain', btn.dataset.tag);
      e.dataTransfer.effectAllowed = 'move';
      btn.classList.add('dragging');
      btn.dataset.dragMoved = '';
    });

    scheduleGrid.addEventListener('dragend', function (e) {
      const btn = e.target.closest('.sched-tag');
      if (btn) btn.classList.remove('dragging');
      todoDrag = null;
      clearSchedDragUI();
    });

    scheduleGrid.addEventListener('dragover', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card || !todoDrag) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = todoDrag.mode === 'reorder' ? 'move' : 'copy';

      $$('.sched-card.drag-over').forEach(function (el) {
        if (el !== card) el.classList.remove('drag-over');
      });
      card.classList.add('drag-over');

      $$('.sched-tag.drag-target').forEach(function (el) {
        el.classList.remove('drag-target');
      });
      if (todoDrag.fromDay === card.dataset.day) {
        const targetBtn = e.target.closest('.sched-tag.on');
        if (targetBtn && targetBtn.dataset.tag !== todoDrag.tagId) {
          targetBtn.classList.add('drag-target');
        }
      }
    });

    scheduleGrid.addEventListener('dragleave', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card) return;
      if (!card.contains(e.relatedTarget)) {
        card.classList.remove('drag-over');
      }
    });

    scheduleGrid.addEventListener('drop', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card || !todoDrag) return;
      e.preventDefault();
      const toDay = card.dataset.day;
      const tagId = todoDrag.tagId;
      const fromDay = todoDrag.fromDay;

      if (fromDay && fromDay === toDay) {
        // 同天排序：插到目標標籤前
        const targetBtn = e.target.closest('.sched-tag.on');
        const beforeId =
          targetBtn && targetBtn.dataset.tag !== tagId ? targetBtn.dataset.tag : null;
        reorderTagInDay(toDay, tagId, beforeId);
        // 標記避免 dragend 後觸發 click 把狀態又 toggle 掉
        setTimeout(function () {
          const srcBtn = scheduleGrid.querySelector(
            '.sched-tag[data-tag="' + tagId + '"][data-toggle-day="' + toDay + '"]'
          );
          if (srcBtn) srcBtn.dataset.dragMoved = '1';
        }, 0);
      } else {
        // 從標籤池或其他天 → 加入此天
        addTagToDay(toDay, tagId);
      }

      todoDrag = null;
      clearSchedDragUI();
      renderSchedule();
      checkTodoChanged();
    });
  }

  const todoSaveBtn = $('#todoSaveBtn');
  if (todoSaveBtn) {
    todoSaveBtn.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      if (!todoChanged) return;
      todos = todoDraft;
      save('todos');
      renderTodos();
      renderHome();
      closeModal('#todoModal');
      toast(dict.todoSaved);
    });
  }

  const todoCancelBtn = $('#todoCancelBtn');
  if (todoCancelBtn) {
    todoCancelBtn.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      todoDraft = JSON.parse(JSON.stringify(todos));
      renderTagPool();
      renderSchedule();
      checkTodoChanged();
      toast(dict.todoReverted);
    });
  }

  const todoSettingsBtn = $('#todoSettingsBtn');
  if (todoSettingsBtn) {
    todoSettingsBtn.addEventListener('click', openTodoSettings);
  }
}
