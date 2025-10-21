Pages.Season = {
  render(){
    const leagueCards = Leagues.leagues.map(L=>{
      const c=Store.champions[L.id];
      return `<div class="card">
        <h3>${L.name} <span class="badge gray">${L.gamesPerTeam} 場（壓縮 ${L.weeks} 週）</span></h3>
        <div class="subtle">分區：${L.structure.map(d=>d.name).join(' / ')}</div>
        ${c?`<div style="margin-top:8px"><span class="badge gold">上季冠軍</span> ${c.team}（${c.season}）</div>`:''}
      </div>`;
    }).join('');
    return `<div class="grid">
      <div class="col-12"><div class="card">
        <h3>賽季控制</h3>
        <div class="btn-row">
          <button class="btn primary" id="sim1">模擬 1 週</button>
          <button class="btn success" id="auto">${Store.settings.autoSim? '停止自動':'自動模擬'}</button>
          <button class="btn warn" id="simToEnd">跑到季末</button>
        </div>
      </div></div>
      <div class="col-12">${leagueCards}</div>
    </div>`;
  },
  mount(){
    document.getElementById('sim1').onclick=()=>Engine.tickWeek();
    document.getElementById('auto').onclick=()=>Engine.auto(!Store.settings.autoSim);
    document.getElementById('simToEnd').onclick=()=>{
      const left=Store.settings.weeksPerSeason-Store.week+1; for(let i=0;i<left;i++) Engine.tickWeek();
    };
  }
};