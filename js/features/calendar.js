// js/features/calendar.js
const TIMEZONE = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '本地時區'; } catch (e) { return '本地時區'; } })();
let calCursor = new Date(); calCursor.setDate(1);
function monthIndex(y, m) { return y * 12 + m; }
let eventDateKey = null; let editingEventId = null;

function renderCalendar() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const y = calCursor.getFullYear(); const m = calCursor.getMonth(); const now = new Date();
  const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6; const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12; const curIdx = monthIndex(y, m);
  $('#calTitle').textContent = dict.evMonthYear.replace('{y}', y).replace('{m}', (m + 1)); $('#calPrev').disabled = curIdx <= minIdx; $('#calNext').disabled = curIdx >= maxIdx;
  $('#calTz').textContent = dict.calTz.replace('{tz}', TIMEZONE);
  if (!$('#calJumpDate').value) $('#calJumpDate').value = y + '-' + pad(m + 1) + '-01';
  const firstDow = new Date(y, m, 1).getDay(); const daysInMonth = new Date(y, m + 1, 0).getDate(); const daysInPrev = new Date(y, m, 0).getDate(); const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7; const tk = todayKey();
  let html = dict.weekdays.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('');
  for (let i = 0; i < totalCells; i++) {
    const dn = i - firstDow + 1;
    if (dn < 1) html += '<div class="cal-cell muted">' + (daysInPrev + dn) + '</div>';
    else if (dn > daysInMonth) html += '<div class="cal-cell muted">' + (dn - daysInMonth) + '</div>';
    else { const key = y + '-' + pad(m + 1) + '-' + pad(dn); const list = events[key] || []; const isToday = key === tk; const star = list.length > 0 ? ' ⭐' : ''; html += '<button class="cal-cell' + (isToday ? ' today' : '') + '" data-date="' + key + '">' + dn + star + '</button>'; }
  }
  $('#calGrid').innerHTML = html;
  renderCalSidebar();
}

function renderCalSidebar() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const listEl = $('#calSidebarList');
  if (!listEl) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allEvents = [];

  Object.keys(events).forEach(function (k) {
    const targetDate = keyToDate(k);
    if (targetDate < today) return;
    (events[k] || []).forEach(function (ev) {
      allEvents.push({ date: k, time: ev.time || '', title: ev.title, content: ev.content || '' });
    });
  });

  allEvents.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (!a.time && !b.time) return 0;
    if (!a.time) return -1;
    if (!b.time) return 1;
    return a.time < b.time ? -1 : (a.time > b.time ? 1 : 0);
  });

  if (!allEvents.length) {
    listEl.innerHTML = '<div class="empty small" style="padding:6px 0;">' + (dict.upcomingEmpty || '近期沒有要事。') + '</div>';
    return;
  }

  listEl.innerHTML = allEvents.map(function (ev) {
    const d = keyToDate(ev.date);
    const dateLabel = d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
    const timeLabel = ev.time ? '<span class="cal-sidebar-time">' + escapeHtml(ev.time) + '</span>' : '';
    return '<div class="cal-sidebar-item">' +
             '<div class="cal-sidebar-date">' + dateLabel + ' ' + timeLabel + '</div>' +
             '<div class="cal-sidebar-ev-title">' + escapeHtml(ev.title) + '</div>' +
           '</div>';
  }).join('');
}

function inCalendarRange(date) { const now = new Date(); const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6; const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12; const idx = monthIndex(date.getFullYear(), date.getMonth()); return idx >= minIdx && idx <= maxIdx; }
function shiftMonth(delta) { const now = new Date(); const minIdx = monthIndex(now.getFullYear(), now.getMonth()) - 6; const maxIdx = monthIndex(now.getFullYear(), now.getMonth()) + 12; const cur = monthIndex(calCursor.getFullYear(), calCursor.getMonth()); const next = cur + delta; if (next < minIdx || next > maxIdx) return; calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + delta, 1); renderCalendar(); }

function openEventModal(key) {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  eventDateKey = key; editingEventId = null; const d = keyToDate(key); const week = dict.weekdays[d.getDay()];
  $('#eventDateTitle').textContent = dict.evMonthYear.replace('{y}', d.getFullYear()).replace('{m}', (d.getMonth() + 1)) + ' ' + d.getDate() + ' · ' + dict.evWeek.replace('{w}', week);
  $('#eventForm').reset(); $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; renderEventList(); openModal('#eventModal'); setTimeout(function () { $('#evTitle').focus(); }, 80);
}

function renderEventList() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const wrap = $('#eventList'); const list = events[eventDateKey] || []; if (!list.length) { wrap.innerHTML = '<div class="empty small">' + dict.calEventEmpty + '</div>'; return; }
  wrap.innerHTML = list.map(function (ev) { 
    return '<div class="event-item" data-id="' + ev.id + '">' + 
             (ev.time ? '<div class="ev-time">' + escapeHtml(ev.time) + '</div>' : '') + 
             '<div class="ev-main">' +
               '<div class="ev-title">' + escapeHtml(ev.title) + '</div>' + 
               (ev.content ? '<div class="ev-content">' + escapeHtml(ev.content) + '</div>' : '') + 
             '</div>' +
             '<div class="ev-acts">' +
               '<button class="mini" data-act="edit" title="' + dict.edit + '">✎</button>' + 
               '<button class="mini del" data-act="del" title="' + dict.delete + '">×</button>' +
             '</div>' +
           '</div>'; 
  }).join('');
}

function initCalendarEvents() {
  $('#calPrev').addEventListener('click', function () { shiftMonth(-1); });
  $('#calNext').addEventListener('click', function () { shiftMonth(1); });
  $('#calToday').addEventListener('click', function () { calCursor = new Date(); calCursor.setDate(1); $('#calJumpDate').value = todayKey(); renderCalendar(); });
  $('#calJumpDate').addEventListener('change', function () {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const val = this.value; if (!val) return; const p = val.split('-').map(Number); const target = new Date(p[0], p[1] - 1, 1);
    if (!inCalendarRange(target)) { toast(dict.calRangeLimit); this.value = todayKey(); return; }
    calCursor = target; renderCalendar(); openEventModal(val);
  });
  $('#calGrid').addEventListener('click', function (e) { const cell = e.target.closest('.cal-cell[data-date]'); if (cell) openEventModal(cell.dataset.date); });
  $('#eventForm').addEventListener('submit', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    e.preventDefault(); const title = $('#evTitle').value.trim(); if (!title) { $('#evTitle').focus(); return; } const time = $('#evTime').value; const content = $('#evContent').value.trim();
    if (!events[eventDateKey]) events[eventDateKey] = [];
    if (editingEventId) { const ev = events[eventDateKey].find(function (x) { return x.id === editingEventId; }); if (ev) { ev.title = title; ev.time = time; ev.content = content; } }
    else { events[eventDateKey].push({ id: uid(), title: title, time: time, content: content }); }
    save('events'); $('#eventForm').reset(); editingEventId = null; $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; renderEventList(); renderCalendar(); renderHome(); toast(dict.eventSaved);
  });
  $('#eventCancelEdit').addEventListener('click', function () { const dict = window.I18N[currentLang] || window.I18N['zh-TW']; editingEventId = null; $('#eventForm').reset(); $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; $('#evTitle').focus(); });
  $('#eventList').addEventListener('click', function (e) {
    const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
    const btn = e.target.closest('[data-act]'); if (!btn) return; const item = e.target.closest('.event-item'); if (!item) return; const id = item.dataset.id; const list = events[eventDateKey] || []; const ev = list.find(function (x) { return x.id === id; }); if (!ev) return;
    if (btn.dataset.act === 'del') { events[eventDateKey] = list.filter(function (x) { return x.id !== id; }); if (!events[eventDateKey].length) delete events[eventDateKey]; save('events'); if (editingEventId === id) { editingEventId = null; $('#eventForm').reset(); $('#eventSubmit').textContent = dict.evSave; $('#eventCancelEdit').hidden = true; } renderEventList(); renderCalendar(); renderHome(); toast(dict.eventDeleted); }
    else if (btn.dataset.act === 'edit') { editingEventId = id; $('#evTitle').value = ev.title; $('#evTime').value = ev.time || ''; $('#evContent').value = ev.content || ''; $('#eventSubmit').textContent = dict.evUpdate; $('#eventCancelEdit').hidden = false; $('#evTitle').focus(); }
  });
}