
App.registerPage('season', {
  title: '賽季',
  render(state){
    const wk = state.week;
    // show week schedule by league
    const blocks = state.leagues.map(lg=>{
      const round = state.schedule.find(s=>s.week===wk && s.leagueId===lg.id);
      const list = round? round.games.map(g=>{
        const home = state.teams.find(t=>t.id===g.homeId);
        const away = state.teams.find(t=>t.id===g.awayId);
        const score = (g.homeScore==null) ? 'vs' : `${g.homeScore} : ${g.awayScore}`;
        return `<div class="stat">${home.name} ${score} ${away.name}</div>`;
      }).join('') : '<div class="muted">本週尚未排程（首次會自動生成）</div>';
      return `<section class="card"><h2>${lg.name} 第 ${wk} 週</h2><div class="stat-row">${list}</div></section>`;
    }).join('');
    return `
      <div class="grid">
        <section class="card">
          <h2>賽季控制</h2>
          <div class="stat-row">
            <div class="stat">本週：${wk} / ${state.maxWeeks}</div>
          </div>
          <div style="margin-top:12px">
            <button class="btn primary" onclick="App.nextWeek()">➡️ 推進一週</button>
            <button class="btn" onclick="(App.sim.ensureSchedule(),App.save(),alert('已生成/更新賽程'));">🗓️ 生成賽程</button>
          </div>
        </section>
        ${blocks}
      </div>
    `;
  },
  onMount(){
    // ensure schedule on first visit
    App.sim.ensureSchedule();
  }
});
