
App.registerPage('home', {
  title: '首頁 / 儀表板',
  render(state){
    const week = state.week;
    const ag = state.agency;
    const cap = App.utils.agencyCapacity();
    const rec = (ag._pendingRec? state.players.find(p=>p.id===ag._pendingRec): null);
    return `
      <div class="grid">
        <section class="card">
          <h2>賽季進度</h2>
          <div class="stat-row">
            <div class="stat"><div class="stat-k">目前週</div><div class="stat-v">W${week}</div></div>
            <div class="stat"><div class="stat-k">新聞</div><div class="stat-v"><a href="#/news">查看</a></div></div>
            <div class="stat"><div class="stat-k">聯盟</div><div class="stat-v"><a href="#/league">前往</a></div></div>
            <div class="stat"><div class="stat-k">客戶</div><div class="stat-v"><a href="#/clients">管理</a></div></div>
          </div>
          <div class="btn-row">
            <button class="btn primary" onclick="App.nextWeek()">➡️ 推進一週</button>
            <button class="btn" onclick="(App.sim.ensureSchedule(),App.save(),alert('已生成/更新賽程'));">🗓️ 生成賽程</button>
            <a class="btn" href="#/agency">經紀公司</a>
          </div>
        </section>

        <section class="card">
          <h2>經紀公司快照</h2>
          <div class="stat-row">
            <div class="stat"><div class="stat-k">等級</div><div class="stat-v">Lv.${ag.level}</div></div>
            <div class="stat"><div class="stat-k">名望</div><div class="stat-v">${ag.reputation}</div></div>
            <div class="stat"><div class="stat-k">現金</div><div class="stat-v">${App.utils.formatMoney(ag.cash)}</div></div>
            <div class="stat"><div class="stat-k">客戶</div><div class="stat-v">${ag.clientIds.length}/${cap}</div></div>
          </div>
          ${rec ? (`<div class="notice">球探推薦：<a href="#/player?pid=${rec.id}">${rec.name}</a>（${rec.teamName||'-'}）</div>`) : ''}
        </section>

        <section class="card">
          <h2>近期冠軍</h2>
          ${(()=>{
            const champions = state.champions.slice(0,5).map(c=>`<div class="stat"><div class="stat-k">${c.leagueName}</div><div class="stat-v">${c.teamName}</div></div>`).join('') || '<div class="muted">尚無冠軍</div>';
            return `<div class="stat-row">${champions}</div>`;
          })()}
        </section>
      </div>`;
  }
});
