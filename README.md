### 📂 檔案結構
- **`index.html`**：網頁結構、彈窗、視圖定義。
- **`style.css`**：視覺樣式、毛玻璃效果、滾動條美化、響應式佈局（`< 768px`）。
- **`script.js`**：資料 CRUD、LocalStorage / IndexedDB 持久化、日曆演算法、圖片 Base64 壓縮、Pointer Events、Web Audio API。

---

## 📦 如何使用與部署

### 本地端運行
確保 `index.html`、`style.css`、`script.js` 在同一個資料夾內，直接雙擊 `index.html` 即可。

### 部署到網路上
本專案為純靜態檔案，非常適合部署於 **GitHub Pages**、**Vercel**、**Netlify** 或 **Cloudflare Pages**。

---

## ⚠️ 注意事項與隱私說明

1. **資料儲存**：所有資料皆不會上傳到任何伺服器。它們被儲存在你當前瀏覽器的 `LocalStorage`、`IndexedDB` 與 `Cookie` 中。
2. **清除快取**：如果你清理了瀏覽器快取，**所有紀錄將會遺失**。強烈建議定期使用右上角齒輪的「匯出備份」功能保存資料。
3. **外部連線揭露**：
   - 首頁天氣使用 Open-Meteo API（會傳送粗略地理位置）。
   - 書籤圖示使用 Google Favicon API（會傳送書籤網域）。
   - 其餘資料皆不外傳。
4. **行動裝置**：手機版網頁在切換分頁時會平滑滾動至頂部，並在特定區域（如筆記、照片）進行內部滾動，以達到最接近 App 的體驗。

---

## 本網站由 Deepseek 和 Gemini 共同創造
## 由 junginlau 提供 AI 提示詞及維護