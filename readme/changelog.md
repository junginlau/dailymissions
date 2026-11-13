# 📝 更新日誌 (Changelog)

> 版本語義：底層 `Y`=大功能、`Z`=大功能內子功能；全域 `Z`=小功能；`beta-n` 僅用於除錯。
> 本檔早期版本由 AI 產生，版本軸理解有誤（曾把 i18n 併入 v0.5、把底層迭代塞進全域 beta）。以下為校正後的版本軸，更新內容本身不變。

## 📅 近期更新紀錄

### 底層 v0.6.1 / 全域 v1.0.8 - 2026-11-14
- **正式版發布**：結束 `beta-b` 測試。
- **i18n 全面補齊**：補上 Landing Page 語言切換按鈕、關於本站頁面、名言、首頁時鐘與天氣等殘留文字。
- **Token 生命週期完成**：實作過期檢查與 401 攔截，自動清除失效 Token 並提示。
- **法務連結修復**：`index.html` 與 `about.html` 正確指向 `./readme/` 下的法務頁面。

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