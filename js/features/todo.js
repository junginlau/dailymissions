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
 * 每天顯示全部標籤（固定依標籤池順序，避免點擊變灰後跳位像被刪掉）：
 * - 已選（on）：亮色，可點擊變灰；可拖曳調整「今天必做」順序（角標顯示序號）
 * - 未選：灰色，可點擊變亮
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

    // 固定用標籤池順序，只改亮/灰，位置不變
    const tagsHtml = todoDraft.tags
      .map(function (t) {
        const onIdx = assigned.indexOf(t.id);
        const on = onIdx >= 0;
        const orderBadge =
          on && assigned.length > 1
            ? '<span class="sched-order">' + (onIdx + 1) + '</span>'
            : '';
        return (
          '<button type="button" class="sched-tag' +
          (on ? ' on' : '') +
          '" data-toggle-day="' +
          w.key +
          '" data-tag="' +
          t.id +
          '">' +
          orderBadge +
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
    // 點擊：亮 ↔ 灰（標籤仍留在該天）
    scheduleGrid.addEventListener('click', function (e) {
      const btn = e.target.closest('.sched-tag[data-toggle-day]');
      if (!btn) return;
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

    // Pointer 拖曳排序（避免 HTML5 draggable 吞掉 click）
    var ptr = null; // { tagId, fromDay, startX, startY, moved, el, pointerId }

    scheduleGrid.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      const btn = e.target.closest('.sched-tag.on[data-tag]');
      if (!btn) return;
      ptr = {
        tagId: btn.dataset.tag,
        fromDay: btn.dataset.toggleDay,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        el: btn,
        pointerId: e.pointerId
      };
    });

    scheduleGrid.addEventListener('pointermove', function (e) {
      if (!ptr || e.pointerId !== ptr.pointerId) return;
      const dx = e.clientX - ptr.startX;
      const dy = e.clientY - ptr.startY;
      if (!ptr.moved && dx * dx + dy * dy < 36) return; // 6px 門檻，未超過當點擊

      if (!ptr.moved) {
        ptr.moved = true;
        try {
          ptr.el.setPointerCapture(e.pointerId);
        } catch (err) {}
        ptr.el.classList.add('dragging');
        ptr.el.dataset.dragMoved = '1';
      }

      // 高亮目前懸停的同天 on 標籤 / 卡片
      clearSchedDragUI();
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const card = under && under.closest ? under.closest('.sched-card[data-day]') : null;
      if (card) {
        card.classList.add('drag-over');
        if (card.dataset.day === ptr.fromDay) {
          const targetBtn = under.closest('.sched-tag.on');
          if (targetBtn && targetBtn.dataset.tag !== ptr.tagId) {
            targetBtn.classList.add('drag-target');
          }
        }
      }
    });

    function endPointerDrag(e) {
      if (!ptr || (e && e.pointerId !== ptr.pointerId)) return;
      const info = ptr;
      ptr = null;

      if (!info.moved) {
        // 純點擊：交給 click 處理
        if (info.el) info.el.classList.remove('dragging');
        clearSchedDragUI();
        return;
      }

      info.el.classList.remove('dragging');
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const card = under && under.closest ? under.closest('.sched-card[data-day]') : null;

      if (card) {
        const toDay = card.dataset.day;
        if (toDay === info.fromDay) {
          const targetBtn = under.closest('.sched-tag.on');
          const beforeId =
            targetBtn && targetBtn.dataset.tag !== info.tagId ? targetBtn.dataset.tag : null;
          reorderTagInDay(toDay, info.tagId, beforeId);
        } else {
          // 拖到其他天 → 加入該天（原天仍保留選取）
          addTagToDay(toDay, info.tagId);
        }
        renderSchedule();
        checkTodoChanged();
      }

      clearSchedDragUI();
      // 防止後續 click 再 toggle
      setTimeout(function () {
        const el = scheduleGrid.querySelector(
          '.sched-tag[data-tag="' + info.tagId + '"][data-toggle-day="' + info.fromDay + '"]'
        );
        if (el) el.dataset.dragMoved = '1';
      }, 0);
    }

    scheduleGrid.addEventListener('pointerup', endPointerDrag);
    scheduleGrid.addEventListener('pointercancel', endPointerDrag);

    // 標籤池 HTML5 拖到某天（可選快捷）
    scheduleGrid.addEventListener('dragover', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card || !todoDrag || todoDrag.mode !== 'assign') return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      card.classList.add('drag-over');
    });
    scheduleGrid.addEventListener('dragleave', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (card && !card.contains(e.relatedTarget)) card.classList.remove('drag-over');
    });
    scheduleGrid.addEventListener('drop', function (e) {
      const card = e.target.closest('.sched-card[data-day]');
      if (!card || !todoDrag || todoDrag.mode !== 'assign') return;
      e.preventDefault();
      card.classList.remove('drag-over');
      if (addTagToDay(card.dataset.day, todoDrag.tagId)) {
        renderSchedule();
        checkTodoChanged();
      }
      todoDrag = null;
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
