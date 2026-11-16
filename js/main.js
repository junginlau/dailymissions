// js/main.js
(function () {
  'use strict';

  function safeRun(name, fn) {
    if (typeof fn !== 'function') return;
    try {
      fn();
    } catch (e) {
      console.warn('模組執行失敗：' + name, e);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 1. 初始化設定面板、主題亮度與 Google 狀態 (最優先套用視覺主題)
    safeRun('initSettingsEvents', window.initSettingsEvents);

    // 2. 初始化語言與靜態文字
    currentLang = LS.get('userLang', 'zh-TW');
    safeRun('applyLanguage', function () {
      applyLanguage(currentLang);
    });

    // 3. 綁定全域 UI 與所有功能模組事件
    safeRun('initUI', window.initUI);
    safeRun('initHomeEvents', window.initHomeEvents);
    safeRun('initTodoEvents', window.initTodoEvents);
    safeRun('initCalendarEvents', window.initCalendarEvents);
    safeRun('initDiaryEvents', window.initDiaryEvents);
    safeRun('initNotesEvents', window.initNotesEvents);
    safeRun('initPhotosEvents', window.initPhotosEvents);
    safeRun('initPomoEvents', window.initPomoEvents);
    safeRun('initLedgerEvents', window.initLedgerEvents);
    safeRun('initTrashEvents', window.initTrashEvents);

    // 4. 啟動時鐘與天氣定時器
    if (typeof updateClock === 'function') {
      updateClock();
      setInterval(updateClock, 1000);
      window.addEventListener('resize', updateClock);
    }
    safeRun('initWeather', window.initWeather);
    safeRun('updateQuote', window.updateQuote);

    // 5. 清理過期資料（日曆、待辦完成紀錄、垃圾桶 14 天到期項目）
    safeRun('pruneEvents', window.pruneEvents);
    safeRun('pruneDone', window.pruneDone);
    safeRun('pruneTrash', window.pruneTrash);

    // 6. 初次渲染所有頁面與元件
    safeRun('renderHome', window.renderHome);
    safeRun('renderTodos', window.renderTodos);
    safeRun('renderCalendar', window.renderCalendar);
    safeRun('renderDiaries', window.renderDiaries);
    safeRun('renderNotes', window.renderNotes);
    safeRun('renderPhotos', window.renderPhotos);
    safeRun('renderGoals', window.renderGoals);
    safeRun('renderBookmarks', window.renderBookmarks);
    safeRun('renderLedger', window.renderLedger);
    safeRun('renderTrash', window.renderTrash);

    // 7. 非同步載入 IndexedDB 自訂鈴聲與舊照片遷移
    const asyncTasks = [];
    if (typeof loadCustomAudio === 'function') {
      asyncTasks.push(loadCustomAudio());
    }
    if (typeof migrateLegacyPhotos === 'function') {
      asyncTasks.push(migrateLegacyPhotos());
    }
    if (asyncTasks.length > 0) {
      Promise.all(asyncTasks)
        .then(function () {
          if (typeof updateSoundUI === 'function') updateSoundUI();
          if (typeof renderPhotos === 'function') renderPhotos();
        })
        .catch(function () {});
    }

    // 8. 決定顯示公開 Landing Page 或直接進入儀表板
    safeRun('initPublicLanding', window.initPublicLanding);

    // 9. 初始化 PWA 版本更新橫幅按鈕
    (function initUpdateBanner() {
      const banner = $('#updateBanner');
      if (!banner) return;

      const applyBtn = $('#updateBannerApply');
      const laterBtn = $('#updateBannerLater');
      const closeBtn = $('#updateBannerClose');

      if (applyBtn && !applyBtn.dataset.bound) {
        applyBtn.dataset.bound = '1';
        applyBtn.addEventListener('click', function () {
          window.location.reload();
        });
      }
      if (laterBtn && !laterBtn.dataset.bound) {
        laterBtn.dataset.bound = '1';
        laterBtn.addEventListener('click', function () {
          banner.hidden = true;
        });
      }
      if (closeBtn && !closeBtn.dataset.bound) {
        closeBtn.dataset.bound = '1';
        closeBtn.addEventListener('click', function () {
          banner.hidden = true;
        });
      }
    })();

    // 10. 註冊 Service Worker (PWA)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker
          .register('./sw.js')
          .then(function (reg) {
            reg.onupdatefound = function () {
              const installingWorker = reg.installing;
              if (!installingWorker) return;
              installingWorker.onstatechange = function () {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  const banner = $('#updateBanner');
                  if (banner) banner.hidden = false;
                }
              };
            };
          })
          .catch(function (err) {
            console.log('SW registration failed:', err);
          });
      });
    }
  });
})();
