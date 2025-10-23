
App.registerPage('weekly', {
  title: '每週報告',
  render(state){
    const flow = state._weeklyFlow || {week: state.week-1, step:1};
    const wk = flow.week;
    const ag = state.agency||{clients:[]};
    if(flow.step===1){
      const my = (ag.clients||[]).map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
      const items = my.map(p=>{
        const s=p.stats||{};
        return `<tr>
          <td>${p.name}</td><td>${p.teamName||'FA'}</td><td>${p.position||''}</td>
          <td>${s.G||0}</td><td>${s.PA||0}</td><td>${s.H||0}</td><td>${s.HR||0}</td><td>${s.RBI||0}</td><td>${s.AVG||'.000'}</td>
          <td>${p.eval||Math.round((p.rating||50)/10)}</td>
        </tr>`;
      }).join('') || `<tr><td colspan="10" class="muted">本週尚無客戶資料</td></tr>`;
      return `<div class="grid">
        <section class="card">
          <h2>W${wk} 客戶本週表現</h2>
          <table class="table">
            <thead><tr><th>球員</th><th>所屬</th><th>守位</th><th>G</th><th>PA</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th><th>評分</th></tr></thead>
            <tbody>${items}</tbody>
          </table>
          <div class="actions" style="margin-top:8px">
            <button class="btn primary" onclick="(App.state._weeklyFlow.step=2,App.navigate('weekly'))">下一步</button>
          </div>
        </section>
      </div>`;
    }else{
      const news = state.news.filter(n=>n.week===wk);
      const best = news.find(n=>n.title.startsWith('本週最佳'));
      const worst = news.find(n=>n.title.startsWith('本週低迷'));
      const hot = news.slice(0,5).map(n=>`<li>• ${n.title}</li>`).join('') || '<li class="muted">尚無</li>';
      return `<div class="grid">
        <section class="card">
          <h2>W${wk} 📰 報紙</h2>
          <div>${best? `<div class="stat good">${best.title}</div>`:''}</div>
          <div>${worst? `<div class="stat warn">${worst.title}</div>`:''}</div>
          <ul style="margin-top:8px">${hot}</ul>
          <div class="actions" style="margin-top:8px">
            <button class="btn" onclick="App.navigate('home')">回首頁</button>
          </div>
        </section>
      </div>`;
    }
  }
});
