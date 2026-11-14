# 📝 更新日誌 (Changelog)

> 版本語義：底層 `Y`=大功能、`Z`=大功能內子功能；全域 `Z`=小功能；`beta-n` 僅用於除錯。
> 本檔早期版本由 AI 產生，版本軸理解有誤（曾把 i18n 併入 v0.5、把底層迭代塞進全域 beta）。以下為校正後的版本軸，更新內容本身不變。

## 📅 近期更新紀錄

### 底層 v0.6.1 / 全域 v1.0.8-beta-b11 - 2026-11-14
- **多語系擴充（日文）**：
  - `lang.js` 新增 `ja` 語系，涵蓋所有介面文字。
  - 語言切換改為輪替制：`zh-TW → en → ja → zh-TW`。
  - 切換按鈕動態顯示下一種語言（`EN` / `日本語` / `中文`）。
  - `updateClock` 支援日文日期格式（`YYYY年 M月D日 (曜日)`）。
  - `QUOTES` 補上日文名言陣列。
- **快捷鍵系統**：
  - `Esc` 關閉所有彈窗與面板。
  - `/` 快速聚焦搜尋欄。
  - `n` 快速新增筆記。
  - `1` 到 `6` 快速切換分頁（首頁、必做、日曆、日記、筆記、記帳）。
- **小按鈕圖示化**：
  - 目標與書籤的編輯按鈕改為 `✎` 符號。
  - 目標彈窗副標題依「新增 / 編輯」動態切換。
- **平板響應式修正**：
  - `.app` 解除 `height: 100vh` 與 `overflow: hidden`，改為 `overflow-y: auto`。
  - 首頁改為單欄並置中，玻璃方塊對齊。
  - 待辦與記帳區塊調整，修復無法滑動問題。
- **手機版首頁精簡**：
  - 隱藏頂部 `.nav` 導覽列。
  - 隱藏首頁四個捷徑方塊，保留底部導覽列。
- **手機版相冊**：照片網格改為一行五個。
- **日期輸入框修復**：手機版 `input[type="date"]` 加上 `max-width: 100%` 與 `box-sizing`，不再超出邊界。
- **Footer 底部安全區域**：平板與手機 Footer 加上 `env(safe-area-inset-bottom)`，不再超越底部。
- `sw.js` 快取暫標 `v1.0.8-beta-b11`。

### 底層 v0.6.0 / 全域 v1.0.8 - 2026-11-14
- **全站 i18n 國際化架構（底層大功能 Y=6）**：
  - 建立 `lang.js` 集中管理中英翻譯。
  - `index.html` 全面加入 `data-i18n` / `data-i18n-placeholder`。
  - `applyLanguage` 支援靜態替換與動態重渲染。
  - Landing Page 改用 `window.enterDashboard()` 全域函式。
  - Footer 版面修復、主畫面內部滾動。
- **待修（底層 v0.6.0-beta-a 起）**：
  - 法務頁面連結 `./readme/*` → 根目錄，修復 404。
  - `googleToken` 寫入 LocalStorage，維持登入狀態。
  - 補齊 `lang.js` 缺漏 key（`upcomingEmpty`、`bmEmpty`、`goalEmpty`、`ledgerEmpty`、`gStatusConnected`）。

### 底層 v0.6.0-beta-a（除錯）- 2026-11-14
- 修復法務頁面連結 `./readme/*` → 根目錄 `./privacy.html`、`./terms.html`（`index.html`、`about.html`）。
- `googleToken` 寫入 LocalStorage 並於啟動時還原，修正重新整理後登入狀態遺失。
- `lang.js` 補齊 `ledgerEmpty`、`gStatusConnected`（中英各一）。
- `sw.js` 快取暫標 `v1.0.8-beta-a`。

### 底層 v0.6.0-beta-b（除錯）- 2026-11-14
- **Token 過期處理**：新增 `googleTokenExp` 到期時間記錄；啟動時若 Token 已過期或剩餘不足 60 秒，自動清除並要求重新登入。上傳/還原遇 HTTP 401 時清除 Token 並提示重新登入。清除所有資料時一併清除 Token。
- **文件一致性**：`AIworkflow.md` 判定流程改用 code fence；`README.md` 版本命名規則同步新語義；`changelog.md` 段落順序與層級校正。
- `sw.js` 快取暫標 `v1.0.8-beta-b`。

### 底層 v0.5.x（Google Drive 雲端備份，大功能 Y=5）
- GIS 登入、上傳/還原至 `appDataFolder`、photoCache 修復。
- 記帳性質標籤刪除。

### 底層 v0.4.x（IndexedDB 重構，大功能 Y=4）
- 照片/音效遷移 IndexedDB、備份含照片本體、version 檢查與型別驗證。

### 底層 v0.3.x（多幣別記帳 + 匯率，大功能 Y=3）
- 匯率 API、本地快取、降級、更新時間；未來日期驗證。

### 底層 v0.2.x（番茄鐘重構，大功能 Y=2）
- 時分秒自訂、狀態機、立體按鈕、音量/鈴聲。

### 底層 v0.1.x（基礎功能，大功能 Y=1）
- 待辦、日曆、日記、筆記、照片、記帳、番茄鐘雛形。