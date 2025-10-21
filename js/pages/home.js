window.Pages=window.Pages||{};
Pages.Home = {
  render(){
    return `<div class="grid">
      <div class="col-12">
        <div class="card">
          <h3>賽季進度</h3>
          <div class="kpi">
            <div class="item"><div class="label">年度</div><div class="value">${Store.season}</div></div>
            <div class="item"><div class="label">目前週次</div><div class="value">W${Store.week}/${Store.settings.weeksPerSeason}</div></div>
            <div class="item"><div class="label">版本</div><div class="value">${Store.version}</div></div>
          </div>
          <div class="btn-row" style="margin-top:10px">
            <button class="btn primary" id="btnWeek">模擬 1 週</button>
            <button class="btn success" id="btnAuto">${Store.settings.autoSim? '停止自動':'自動模擬'}</button>
            <button class="btn warn" id="btnExport">匯出存檔</button>
            <button class="btn ghost" id="btnReset">新賽季重置</button>
          </div>
          <small class="muted">* 週 40–45 將自動產生各聯盟冠軍。</small>
        </div>
      </div>
    </div>`;
  },
  mount(){
    document.getElementById('btnWeek').onclick=()=>Engine.tickWeek();
    document.getElementById('btnAuto').onclick=()=>Engine.auto(!Store.settings.autoSim);
    document.getElementById('btnExport').onclick=()=>exportSave();
    document.getElementById('btnReset').onclick=()=>{ if(confirm('重置賽季？')){ resetSeasonHard(); Router.render('#/home'); } };
  }
};