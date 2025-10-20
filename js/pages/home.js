
Router.register("home", ()=>{
  return `
  <div class="grid grid-3">
    <div class="panel">
      <div class="panel-header"><h3>關鍵指標</h3><span class="badge">儀表板</span></div>
      <div class="kpi">
        <div class="card"><div class="muted">知名度</div><div class="big">${STATE.fame}</div></div>
        <div class="card"><div class="muted">現金</div><div class="big">${fmtMoney(STATE.cash)}</div></div>
        <div class="card"><div class="muted">客戶數</div><div class="big">${STATE.clients.length}</div></div>
      </div>
      <hr class="sep"/>
      <div class="section-title">快速操作</div>
      <div class="flex">
        <a href="#/clients" class="btn secondary">管理客戶</a>
        <a href="#/academy" class="btn">學院招募</a>
        <a href="#/teams" class="btn muted">球隊查詢</a>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>新聞快訊</h3><span class="badge">最新 6 則</span></div>
      <div>${STATE.news.slice(0,6).map(n=>`<div class="notice">[${n.year} W${n.week}] ${n.text}</div>`).join("") || "— 尚無新聞 —"}</div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>本季目標</h3><span class="badge">自訂</span></div>
      <div class="notice">贏得任一聯盟冠軍、簽下 NPB 或 MLB 客戶 2 名、年度利潤達 $10M。</div>
      <div class="chart">（後續可以換成圖表）</div>
    </div>
  </div>`;
});
