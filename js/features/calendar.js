// js/features/calendar.js
const TIMEZONE = (function () {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '本地時區';
  } catch (e) {
    return '本地時區';
  }
})();

let calCursor = new Date();
calCursor.setDate(1);

function monthIndex(y, m) {
  return y * 12 + m;
}

let eventDateKey = null;
let editingEventId = null;

function renderCalendar() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const y = calCursor.getFullYear();
  const m = calCursor.getMonth();
  const now = new Date();
  const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6;
  const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12;
  const curIdx = monthIndex(y, m);

  $('#calTitle').textContent = dict.evMonthYear.replace('{y}', y).replace('{m}', m + 1);
  $('#calPrev').disabled = curIdx <= minIdx;
  $('#calNext').disabled = curIdx >= maxIdx;
  $('#calTz').textContent = dict.calTz.replace('{tz}', TIMEZONE);
  if (!$('#calJumpDate').value) {
    $('#calJumpDate').value = y + '-' + pad(m + 1) + '-01';
  }

  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const tk = todayKey();

  const gridEl = $('#calGrid');
  if (!gridEl) return;
  gridEl.textContent = '';

  dict.weekdays.forEach(function (d) {
    const dow = document.createElement('div');
    dow.className = 'cal-dow';
    dow.textContent = d;
    gridEl.appendChild(dow);
  });

  for (let i = 0; i < totalCells; i++) {
    const dn = i - firstDow + 1;
    if (dn < 1) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell muted';
      cell.textContent = daysInPrev + dn;
      gridEl.appendChild(cell);
    } else if (dn > daysInMonth) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell muted';
      cell.textContent = dn - daysInMonth;
      gridEl.appendChild(cell);
    } else {
      const key = y + '-' + pad(m + 1) + '-' + pad(dn);
      const list = events[key] || [];
      const isToday = key === tk;
      const star = list.length > 0 ? ' ⭐' : '';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-cell' + (isToday ? ' today' : '');
      btn.dataset.date = key;
      btn.textContent = dn + star;
      gridEl.appendChild(btn);
    }
  }

  renderCalSidebar();
}

function renderCalSidebar() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const listEl = $('#calSidebarList');
  if (!listEl) return;

  listEl.textContent = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allEvents = [];

  Object.keys(events).forEach(function (k) {
    const targetDate = keyToDate(k);
    if (targetDate < today) return;
    (events[k] || []).forEach(function (ev) {
      allEvents.push({
        date: k,
        time: ev.time || '',
        title: ev.title,
        content: ev.content || ''
      });
    });
  });

  allEvents.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (!a.time && !b.time) return 0;
    if (!a.time) return -1;
    if (!b.time) return 1;
    return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
  });

  if (!allEvents.length) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty small';
    emptyEl.style.padding = '6px 0';
    emptyEl.textContent = dict.upcomingEmpty || '近期沒有要事。';
    listEl.appendChild(emptyEl);
    return;
  }

  allEvents.forEach(function (ev) {
    const d = keyToDate(ev.date);
    const dateLabel = d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cal-sidebar-item';

    const dateDiv = document.createElement('div');
    dateDiv.className = 'cal-sidebar-date';
    dateDiv.textContent = dateLabel + ' ';

    if (ev.time) {
      const timeSpan = document.createElement('span');
      timeSpan.className = 'cal-sidebar-time';
      timeSpan.textContent = ev.time;
      dateDiv.appendChild(timeSpan);
    }

    const titleDiv = document.createElement('div');
    titleDiv.className = 'cal-sidebar-ev-title';
    titleDiv.textContent = ev.title;

    itemDiv.appendChild(dateDiv);
    itemDiv.appendChild(titleDiv);
    listEl.appendChild(itemDiv);
  });
}

function inCalendarRange(date) {
  const now = new Date();
  const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6;
  const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12;
  const idx = monthIndex(date.getFullYear(), date.getMonth());
  return idx >= minIdx && idx <= maxIdx;
}

function shiftMonth(delta) {
  const now = new Date();
  const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6;
  const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12;
  const cur = monthIndex(calCursor.getFullYear(), calCursor.getMonth());
  const next = cur + delta;
  if (next < minIdx || next > maxIdx) return;
  calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + delta, 1);
  renderCalendar();
}

function openEventModal(key) {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  eventDateKey = key;
  editingEventId = null;
  const d = keyToDate(key);
  const week = dict.weekdays.at(d.getDay());

  $('#eventDateTitle').textContent =
    dict.evMonthYear.replace('{y}', d.getFullYear()).replace('{m}', d.getMonth() + 1) +
    ' ' +
    d.getDate() +
    ' · ' +
    dict.evWeek.replace('{w}', week);

  $('#eventForm').reset();
  $('#eventSubmit').textContent = dict.evSave;
  $('#eventCancelEdit').hidden = true;
  renderEventList();
  openModal('#eventModal');
  setTimeout(function () {
    $('#evTitle').focus();
  }, 80);
}

function renderEventList() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const wrap = $('#eventList');
  if (!wrap) return;

  wrap.textContent = '';
  const list = events[eventDateKey] || [];

  if (!list.length) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty small';
    emptyEl.textContent = dict.calEventEmpty;
    wrap.appendChild(emptyEl);
    return;
  }

  list.forEach(function (ev) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'event-item';
    itemDiv.dataset.id = ev.id;

    if (ev.time) {
      const timeDiv = document.createElement('div');
      timeDiv.className = 'ev-time';
      timeDiv.textContent = ev.time;
      itemDiv.appendChild(timeDiv);
    }

    const mainDiv = document.createElement('div');
    mainDiv.className = 'ev-main';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'ev-title';
    titleDiv.textContent = ev.title;
    mainDiv.appendChild(titleDiv);

    if (ev.content) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'ev-content';
      contentDiv.textContent = ev.content;
      mainDiv.appendChild(contentDiv);
    }

    const actsDiv = document.createElement('div');
    actsDiv.className = 'ev-acts';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'mini';
    editBtn.dataset.act = 'edit';
    editBtn.title = dict.edit;
    editBtn.textContent = '✎';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'mini del';
    delBtn.dataset.act = 'del';
    delBtn.title = dict.delete;
    delBtn.textContent = '×';

    actsDiv.appendChild(editBtn);
    actsDiv.appendChild(delBtn);

    itemDiv.appendChild(mainDiv);
    itemDiv.appendChild(actsDiv);
    wrap.appendChild(itemDiv);
  });
}

function initCalendarEvents() {
  const calPrev = $('#calPrev');
  if (calPrev && !calPrev.dataset.bound) {
    calPrev.dataset.bound = '1';
    calPrev.addEventListener('click', function () {
      shiftMonth(-1);
    });
  }

  const calNext = $('#calNext');
  if (calNext && !calNext.dataset.bound) {
    calNext.dataset.bound = '1';
    calNext.addEventListener('click', function () {
      shiftMonth(1);
    });
  }

  const calToday = $('#calToday');
  if (calToday && !calToday.dataset.bound) {
    calToday.dataset.bound = '1';
    calToday.addEventListener('click', function () {
      calCursor = new Date();
      calCursor.setDate(1);
      $('#calJumpDate').value = todayKey();
      renderCalendar();
    });
  }

  const calJumpDate = $('#calJumpDate');
  if (calJumpDate && !calJumpDate.dataset.bound) {
    calJumpDate.dataset.bound = '1';
    calJumpDate.addEventListener('change', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const val = this.value;
      if (!val) return;
      const p = val.split('-').map(Number);
      const target = new Date(p.at(0), p.at(1) - 1, 1);
      if (!inCalendarRange(target)) {
        toast(dict.calRangeLimit);
        this.value = todayKey();
        return;
      }
      calCursor = target;
      renderCalendar();
      openEventModal(val);
    });
  }

  const calGrid = $('#calGrid');
  if (calGrid && !calGrid.dataset.bound) {
    calGrid.dataset.bound = '1';
    calGrid.addEventListener('click', function (e) {
      const cell = e.target.closest('.cal-cell[data-date]');
      if (cell) openEventModal(cell.dataset.date);
    });
  }

  const eventForm = $('#eventForm');
  if (eventForm && !eventForm.dataset.bound) {
    eventForm.dataset.bound = '1';
    eventForm.addEventListener('submit', function (e) {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      e.preventDefault();
      const title = $('#evTitle').value.trim();
      if (!title) {
        $('#evTitle').focus();
        return;
      }
      const time = $('#evTime').value;
      const content = $('#evContent').value.trim();
      if (!events[eventDateKey]) events[eventDateKey] = [];
      if (editingEventId) {
const ev = events[eventDateKey].find(function (x) {
return x.id === editingEventId;
});
if (ev) {
ev.title = title;
ev.time = time;
ev.content = content;
}
} else {
events[eventDateKey].push({
id: uid(),
title: title,
time: time,
content: content
});
}
save('events');
$('#eventForm').reset();
editingEventId = null;
$('#eventSubmit').textContent = dict.evSave;
$('#eventCancelEdit').hidden = true;
renderEventList();
renderCalendar();
renderHome();
toast(dict.eventSaved);
});
}
const eventCancelEdit = $('#eventCancelEdit');
if (eventCancelEdit && !eventCancelEdit.dataset.bound) {
eventCancelEdit.dataset.bound = '1';
eventCancelEdit.addEventListener('click', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
editingEventId = null;
$('#eventForm').reset();
$('#eventSubmit').textContent = dict.evSave;
$('#eventCancelEdit').hidden = true;
$('#evTitle').focus();
});
}
const eventList = $('#eventList');
if (eventList && !eventList.dataset.bound) {
eventList.dataset.bound = '1';
eventList.addEventListener('click', function (e) {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
const btn = e.target.closest('[data-act]');
if (!btn) return;
const item = e.target.closest('.event-item');
if (!item) return;
const id = item.dataset.id;
const list = events[eventDateKey] || [];
const ev = list.find(function (x) {
return x.id === id;
});
if (!ev) return;
if (btn.dataset.act === 'del') {
trash.push({
id: uid(),
type: 'event',
title: ev.title,
dateKey: eventDateKey,
data: ev,
deletedAt: Date.now()
});
save('trash');
events[eventDateKey] = list.filter(function (x) {
return x.id !== id;
});
if (!events[eventDateKey].length) delete events[eventDateKey];
save('events');
if (editingEventId === id) {
editingEventId = null;
$('#eventForm').reset();
$('#eventSubmit').textContent = dict.evSave;
$('#eventCancelEdit').hidden = true;
}
renderEventList();
renderCalendar();
renderHome();
toast((dict.movedToTrash || '已將 {n} 個項目移至垃圾桶').replace('{n}', 1));
} else if (btn.dataset.act === 'edit') {
editingEventId = id;
$('#evTitle').value = ev.title;
$('#evTime').value = ev.time || '';
$('#evContent').value = ev.content || '';
$('#eventSubmit').textContent = dict.evUpdate;
$('#eventCancelEdit').hidden = false;
$('#evTitle').focus();
}
});
}
}