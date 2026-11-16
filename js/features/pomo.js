// js/features/pomo.js
let pomoState = 'idle'; 
let pomoRemaining = 0;
let pomoTotalSet = 25 * 60;
let pomoInterval = null;
let audioCtx = null; let customAudioData = null; let soundType = LS.get('pomoSoundType', 'synth'); let pomoVolume = LS.get('pomoVolume', 70);

function loadCustomAudio() {
  if (!IDB.available()) return Promise.resolve();
  return IDB.get('audio', 'pomo').then(function (rec) { if (rec && rec.data) { customAudioData = rec.data; } if (typeof updateSoundUI === 'function') updateSoundUI(); }).catch(function () {});
}

function initAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); }

function playBell() {
  const vol = Math.max(0, Math.min(1, pomoVolume / 100));
  if (soundType === 'custom' && customAudioData) { try { const audio = new Audio(customAudioData); audio.volume = vol; audio.play().catch(function () {}); } catch (e) {} return; }
  if (!audioCtx) initAudio(); if (!audioCtx) return;
  try {
    const playNote = (freq, startTime, duration) => { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); osc.type = 'sine'; osc.frequency.value = freq; gain.gain.setValueAtTime(0, startTime); gain.gain.linearRampToValueAtTime(0.5 * vol, startTime + 0.05); gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration); osc.start(startTime); osc.stop(startTime + duration); };
    playNote(880, audioCtx.currentTime, 0.4); playNote(1046.50, audioCtx.currentTime + 0.15, 0.6); playNote(880, audioCtx.currentTime + 0.45, 0.4); playNote(1046.50, audioCtx.currentTime + 0.6, 0.8);
  } catch (e) {}
}

function formatPomoTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return pad(h) + ':' + pad(m) + ':' + pad(s);
}

function updatePomoUI() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const display = $('#pomoTimeDisplay'); const editor = $('#pomoEditor'); const btnL = $('#pomoBtnLeft'); const btnR = $('#pomoBtnRight');
  if(!display) return;
  display.textContent = formatPomoTime(pomoRemaining);
  display.style.display = 'flex';
  editor.classList.remove('active');
  
  if (pomoState === 'idle') {
    btnL.textContent = dict.pomoStart; btnL.className = 'pomo-btn start'; btnL.disabled = pomoRemaining === 0;
    btnR.textContent = dict.pomoReset; btnR.className = 'pomo-btn stop';
  } else if (pomoState === 'running') {
    btnL.textContent = dict.pomoPause; btnL.className = 'pomo-btn pause'; btnL.disabled = false;
    btnR.textContent = dict.pomoStop; btnR.className = 'pomo-btn stop';
  } else if (pomoState === 'paused') {
    btnL.textContent = dict.pomoResume; btnL.className = 'pomo-btn resume'; btnL.disabled = false;
    btnR.textContent = dict.pomoStop; btnR.className = 'pomo-btn stop';
  }
}

function getInputSecs() {
  const h = parseInt($('#pomoInpH').value, 10) || 0;
  const m = parseInt($('#pomoInpM').value, 10) || 0;
  const s = parseInt($('#pomoInpS').value, 10) || 0;
  let total = h * 3600 + m * 60 + s;
  if (total > 99 * 3600 + 99 * 60 + 99) total = 99 * 3600 + 99 * 60 + 99;
  return total;
}

function savePomoSettings() {
  const total = getInputSecs();
  pomoTotalSet = total;
  pomoRemaining = total;
  LS.set('pomoDuration', total);
  updatePomoUI();
}

function closePomoEditor() {
  const editor = $('#pomoEditor'); const display = $('#pomoTimeDisplay');
  if (editor.classList.contains('active')) { savePomoSettings(); editor.classList.remove('active'); display.style.display = 'flex'; }
}

function startPomoTimer() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  pomoState = 'running';
  updatePomoUI();
  pomoInterval = setInterval(function() {
    pomoRemaining--;
    if ($('#pomoTimeDisplay')) $('#pomoTimeDisplay').textContent = formatPomoTime(pomoRemaining);
    if (pomoRemaining <= 0) {
      clearInterval(pomoInterval);
      pomoState = 'idle'; pomoRemaining = pomoTotalSet; updatePomoUI();
      playBell();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      toast(dict.pomoTimeUp);
    }
  }, 1000);
}

function initPomoEvents() {
  const savedDur = LS.get('pomoDuration', null);
  if (savedDur !== null && savedDur >= 0) { pomoTotalSet = savedDur; pomoRemaining = savedDur; }
  updatePomoUI();

  const display = $('#pomoTimeDisplay');
  const editor = $('#pomoEditor');
  
  display.addEventListener('click', function (e) {
    e.stopPropagation();
    if (pomoState !== 'idle') return;
    const h = Math.floor(pomoRemaining / 3600); const m = Math.floor((pomoRemaining % 3600) / 60); const s = pomoRemaining % 60;
    $('#pomoInpH').value = pad(h); $('#pomoInpM').value = pad(m); $('#pomoInpS').value = pad(s);
    display.style.display = 'none'; editor.classList.add('active'); $('#pomoInpM').focus();
  });

  $$('.pomo-arrow').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const unit = this.dataset.unit; const act = this.dataset.act;
      const inp = unit === 'h' ? $('#pomoInpH') : (unit === 'm' ? $('#pomoInpM') : $('#pomoInpS'));
      let val = parseInt(inp.value, 10) || 0;
      if (act === 'up') { val = Math.min(99, val + 1); } else { val = Math.max(0, val - 1); }
      inp.value = pad(val);
      if ($('#pomoTimeDisplay')) $('#pomoTimeDisplay').textContent = formatPomoTime(getInputSecs());
    });
  });

  $('#pomoInpH').addEventListener('change', function() { this.value = pad(Math.min(99, Math.max(0, parseInt(this.value,10)||0))); if ($('#pomoTimeDisplay')) $('#pomoTimeDisplay').textContent = formatPomoTime(getInputSecs()); });
  $('#pomoInpM').addEventListener('change', function() { this.value = pad(Math.min(99, Math.max(0, parseInt(this.value,10)||0))); if ($('#pomoTimeDisplay')) $('#pomoTimeDisplay').textContent = formatPomoTime(getInputSecs()); });
  $('#pomoInpS').addEventListener('change', function() { this.value = pad(Math.min(99, Math.max(0, parseInt(this.value,10)||0))); if ($('#pomoTimeDisplay')) $('#pomoTimeDisplay').textContent = formatPomoTime(getInputSecs()); });

  editor.addEventListener('click', function(e) { e.stopPropagation(); });

  $('#pomoBtnLeft').addEventListener('click', function() {
    initAudio();
    if (editor.classList.contains('active')) { closePomoEditor(); return; }
    if (pomoState === 'idle') { if (pomoRemaining <= 0) return; startPomoTimer(); } 
    else if (pomoState === 'running') { clearInterval(pomoInterval); pomoState = 'paused'; updatePomoUI(); } 
    else if (pomoState === 'paused') { startPomoTimer(); }
  });

  $('#pomoBtnRight').addEventListener('click', function() {
    if (editor.classList.contains('active')) { closePomoEditor(); return; }
    clearInterval(pomoInterval);
    pomoState = 'idle';
    if (pomoState === 'idle' && pomoRemaining === pomoTotalSet) {
       pomoRemaining = pomoTotalSet;
    } else {
       pomoRemaining = pomoTotalSet;
    }
    updatePomoUI();
  });

  document.addEventListener('click', function(e) {
    if (editor.classList.contains('active') && !editor.contains(e.target) && !display.contains(e.target)) closePomoEditor();
  });

  $('#pomoFab').addEventListener('click', function () { $('#pomoPanel').classList.toggle('open'); });
  
  const soundBtn = $('#pomoSoundBtn');
  if(soundBtn) soundBtn.addEventListener('click', function () { updateSoundUI(); openModal('#soundModal'); });
  
  const filePick = $('#soundFilePick');
  if(filePick) filePick.addEventListener('click', function () { $('#soundFileInput').click(); });
  
  const fileInput = $('#soundFileInput');
  if(fileInput) {
    fileInput.addEventListener('change', function (e) { 
      const dict = window.I18N[currentLang] || window.I18N['zh-TW']; 
      const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; 
      if (file.size > 1024 * 1024) { toast(dict.pomoAudioTooBig); return; } 
      const reader = new FileReader(); 
      reader.onload = function (ev) { customAudioData = ev.target.result; $('#soundFileName').textContent = file.name; $$('input[name="soundType"]').forEach(function (r) { if (r.value === 'custom') r.checked = true; }); toast(dict.pomoAudioLoaded); }; 
      reader.readAsDataURL(file); 
    });
  }

  const soundSave = $('#soundSaveBtn');
  if(soundSave) {
    soundSave.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const selected = $('input[name="soundType"]:checked').value; if (selected === 'custom' && !customAudioData) { toast(dict.pomoSoundNoFile); return; }
      soundType = selected; LS.set('pomoSoundType', soundType);
      if (IDB.available()) { if (customAudioData) { IDB.put('audio', { id: 'pomo', data: customAudioData }).catch(function () {}); } else { IDB.del('audio', 'pomo').catch(function () {}); } }
      closeModal('#soundModal'); toast(dict.pomoSoundSaved); initAudio(); playBell();
    });
  }

  const volInput = $('#pomoVolume');
  if(volInput) {
    $('#pomoVolume').value = pomoVolume; $('#pomoVolumeVal').textContent = pomoVolume;
    volInput.addEventListener('input', function () { pomoVolume = parseInt(this.value, 10); $('#pomoVolumeVal').textContent = pomoVolume; LS.set('pomoVolume', pomoVolume); });
  }
}

function updateSoundUI() { 
  const dict = window.I18N[currentLang] || window.I18N['zh-TW']; 
  $$('input[name="soundType"]').forEach(function (r) { r.checked = (r.value === soundType); }); 
  const nameEl = $('#soundFileName');
  if(nameEl) nameEl.textContent = customAudioData ? dict.pomoCustomLoaded : dict.pomoSoundNoFile; 
}