# Baseball Agent Manager v1.6.3 (原始 1.1 佈局)
- **Root layout**: `index.html`, `style.css`, `js/*` 皆在專案根目錄（無 /public）
- **Global leagues**: MLB / NPB / KBO / CPBL（真實球隊，無隨機隊伍）
- **Per-page mount**: 修正按鈕無反應（事件綁定不再被覆蓋）
- **Mobile UI 強化**: 表格橫向卷軸、底部導覽穩定、避免破版
- **Clients / Champions / News**: 均已修復；沒有 404（含 SPA fallback）

## 部署（Heroku）
1. `heroku create`
2. `git push heroku main`（或上傳整包）
3. **必要**：`Procfile`、`package.json`（Node >=18）
4. 如直接打開 route（/clients 等），由 `server.js` 回傳 `index.html`。

## 匯入真實名單
- 將你的 1.1 名單轉換為 1.6.x：
  ```bash
  node tools/convert_roster_11_to_16x.js path/to/v1.1.json rosters.16x.json
  ```
- 進入「設定」→「匯入名單（JSON）」載入 `rosters.16x.json`。

> **注意**：本套件不直接內嵌完整實名名單（授權/著作權風險）。請於你方導入原始資料。

## 開發
- 啟動：`npm i && npm start` → `http://localhost:3000`
- 主程式：`js/app.js`、模擬器：`js/scheduler.js`、路由：`js/router.js`。
