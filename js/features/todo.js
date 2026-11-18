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
let todoDrag = null; // { tagId, fromDay } fromDay = day key or null (pool)

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
        '<button class="chip-x" data-del-tag="' +
        t.id +
        '" aria-label="刪除標籤">×</button></span>'
      );
    })
    .join('');
}

function renderSchedule() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const grid = $('#scheduleGrid');
  if (!grid) return;
  if (!todoDraft.tags.length) {
    grid.innerHTML =
      '<div class="empty small" style="grid-column:1/-1;">' + (dict.scheduleEmpty || '請先新增標籤') + '</div>';
    return;
  }
  const dropHint = dict.todoDropHint || '拖曳標籤到這裡';
  grid.innerHTML = WEEKDAYS.map(function (w) {
    const assigned = todoDraft.schedule[w.key] || [];
    const label = (dict.weekdaysFull && dict.weekdaysFull[w.key]) || w.label;
    const tagsHtml = assigned.length
      ? assigned
          .map(function (tagId) {
            const t = todoDraft.tags.find(function (x) {
              return x.id === tagId;
            });
            if (!t) return '';
            return (
              '<button type="button" class="sched-tag on" draggable="true" data-toggle-day="' +
              w.key +
              '" data-tag="' +
              t.id +
              '" title="' +
              (dict.todoClickToRemove || '點擊移除') +
              '">' +
              escapeHtml(t.name) +
              '</button>'
            );
          })
          .join('')
      : '<span class="sched-drop-hint">' + dropHint + '</span>';
    return (
      '<div class="sched-card" data-day="' +
      w.key +
      '"><h4>' +
      label +
      '</h4><div class="sched-tags">' +
      tagsHtml +
      '</div></div>'
    );
  }).join('');
}

function addTagToDay(dayKey, tagId) {
  if (!todoDraft || !dayKey || !tagId) return;
  const arr = todoDraft.schedule[dayKey];
  if (!Array.isArray(arr)) todoDraft.schedule[dayKey] = [];
  if (todoDraft.schedule[dayKey].indexOf(tagId) < 0) {
    todoDraft.schedule[dayKey].push(tagId);
    renderSchedule();
    checkTodoChanged();
  }
}

function removeTagFromDay(dayKey, tagId) {
  if (!todoDraft || !dayKey || !tagId) return;
  const arr = todoDraft.schedule[dayKey];
  if (!Array.isArray(arr)) return;
  const i = arr.indexOf(tagId);
  if (i >= 0) {
    arr.splice(i, 1);
    renderSchedule();
    checkTodoChanged();
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

    // 從標籤池開始拖曳
    tagPool.addEventListener('dragstart', function (e) {
      const chip = e.target.closest('.tag-chip[data-tag-id]');
      if (!chip || e.target.closest('[data-del-tag]')) {
        e.preventDefault();
        return;
      }
      todoDrag = { tagId: chip.dataset.tagId, fromDay: null };
      e.dataTransfer.setData('text/plain', chip.dataset.tagId);
      e.dataTransfer.effectAllowed = 'copyMove';
      chip.classList.add('dragging');
    });
    tagPool.addEventListener('dragend', function (e) {
      const chip = e.target.closest('.tag-chip');
      if (chip) chip.classList.remove('dragging');
      todoDrag = null;
      $$('.sched-card.drag-over').forEach(function (el) {
        el.classList.remove('drag-over');
      });
    });
  }

  const scheduleGrid = $('#scheduleGrid');
  if (scheduleGrid) {
    // 點擊已分配標籤 → 移除（滅燈）
    scheduleGrid.addEventListener('click', function (e) {
      const btn = e.target.closest('.sched-tag.on[data-toggle-day]');
      if (!btn) return;
      removeTagFromDay(btn.dataset.toggleDay, btn.dataset.tag);
    });

    // 從某天內的標籤開始拖曳
    scheduleGrid.addEventListener('dragstart', function (e) {
      const btn = e.target.closest('.sched-tag.on[data-tag]');
      if (!btn) return;
      todoDrag = { tagId: btn.dataset.tag, fromDay: btn.dataset.toggleDay };
      e.dataTransfer.setData('text/plain', btn.dataset.tag);
      e.dataTransfer.effectAllowed = 'move';
      btn.classList.add('dragging');
    });

    scheduleGrid.addEventListener('dragend', function (e) {
      const btn = e.target.closest('.sched-tag');
      if (btn) btn.classList.remove('dragging');
      // 拖到天數範圍外 → 從原天移除
      if (todoDrag && todoDrag.fromDay && e.dataTransfer && e.dataTransfer.dropEffect === 'none') {
        // dropEffect none 表示沒有成功 drop；但瀏覽器行為不一致，改用 drag-over 狀態判斷較不穩
        // 這裡僅清狀態；真正「拖出移除」在 drop 到非卡片區時處理
      }
      todoDrag = null;
      $$('.sched-card.drag-over').forEach(function (el) {
        el.classList.remove('drag-over');
      });
    });

    scheduleGrid.addEventListener('dragover', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = todoDrag && todoDrag.fromDay ? 'move' : 'copy';
      if (!card.classList.contains('drag-over')) {
        $$('.sched-card.drag-over').forEach(function (el) {
          el.classList.remove('drag-over');
        });
        card.classList.add('drag-over');
      }
    });

    scheduleGrid.addEventListener('dragleave', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card) return;
      // 只有真正離開卡片時才移除高亮
      if (!card.contains(e.relatedTarget)) {
        card.classList.remove('drag-over');
      }
    });

    scheduleGrid.addEventListener('drop', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card) return;
      e.preventDefault();
      card.classList.remove('drag-over');
      const tagId = (todoDrag && todoDrag.tagId) || e.dataTransfer.getData('text/plain');
      const toDay = card.dataset.day;
      if (!tagId || !toDay) return;

      // 從另一天拖過來：先從原天移除
      if (todoDrag && todoDrag.fromDay && todoDrag.fromDay !== toDay) {
        removeTagFromDay(todoDrag.fromDay, tagId);
      }
      addTagToDay(toDay, tagId);
      todoDrag = null;
    });
  }

  // 拖到 modal 空白處（非某天卡片）→ 若來源是某天，則移除
  const todoModal = $('#todoModal');
  if (todoModal) {
    todoModal.addEventListener('dragover', function (e) {
      if (todoDrag && todoDrag.fromDay) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    });
    todoModal.addEventListener('drop', function (e) {
      if (e.target.closest('.sched-card[data-day]')) return;
      if (todoDrag && todoDrag.fromDay && todoDrag.tagId) {
        e.preventDefault();
        removeTagFromDay(todoDrag.fromDay, todoDrag.tagId);
        todoDrag = null;
      }
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
