
App.registerPage('home', {
  title: '首頁 / 儀表板',
  render(state){
    const week = state.week;
    const champions = state.champions.slice(0,5).map(c=>`<div class="stat">🏆 ${c.leagueName}：${c.teamName}</div>`).join('') || '<div class="muted">尚無冠軍</div>';
    const leagues = state.leagues.map(lg=>{
      const key = `tbl_${lg.id}`;
      const tbl = state[key]||{};
      const rows = Object.entries(tbl).map(([tid,row])=>{
        const t = state.teams.find(t=>t.id==tid);
        return `<tr><td>${t? t.name:''}</td><td>${row.W}</td><td>${row.L}</td><td>${row.RS}</td><td>${row.RA}</td></tr>`;
      }).join('') || `<tr><td colspan="5" class="muted">尚未有戰績</td></tr>`;
      return `
        <section class="card">
          <h2>${lg.name} 戰績</h2>
          <table class="table">
            <thead><tr><th>球隊</th><th>W</th><th>L</th><th>RS</th><th>RA</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </section>`;
    }).join('');
    return `
      <div class="grid">
        <section class="card">
          <h2>本季進度</h2>
          <div class="stat-row">
            <div class="stat">週次：${week} / ${state.maxWeeks}</div>
            <div class="stat">聯盟數：${state.leagues.length}</div>
            <div class="stat">球隊數：${state.teams.length}</div>
            <div class="stat">球員數：${state.players.length}</div>
            <div class="stat">上次儲存：${state.lastSavedAt? new Date(state.lastSavedAt).toLocaleString():'-'}</div>
          </div>
          <div style="margin-top:12px">
            <button class="btn primary" onclick="App.nextWeek()">➡️ 推進一週</button>
            <button class="btn" onclick="App.navigate('season')">📅 賽季</button>
            <button class="btn" onclick="App.navigate('news')">📰 新聞</button>
          </div>
        </section>

        <section class="card">
          <h2>近期冠軍</h2>
          <div class="stat-row">${champions}</div>
        </section>

        ${leagues}
      </div>
    `;
  }
});
