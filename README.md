# Baseball Agent Manager v1.4.0

## 開發/本機執行
```bash
npm i
npm start
# http://localhost:3000
```

## 部署到 Heroku
1. 建立新 Heroku app
2. 上傳整包檔案（包含 `Procfile`）
3. 設定 Buildpack：Node.js
4. Deploy 後訪問根路徑（為 SPA，所有 routes 由前端 hash 處理）

## 版本重點
- 修復：`clients`/`champions` 路由找不到、按鈕只響應一次、破版
- 新增：客戶搜尋/排序、冠軍過濾、localStorage 自動存檔、重設遊戲
