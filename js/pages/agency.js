
App.registerPage('agency', {
  title: '經紀公司',
  render(state){
    const ag = state.agency;
    const cap = App.utils.agencyCapacity();
    const clients = ag.clientIds.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
    const rows = clients.map(p=>`
      <tr>
        <td><a href="#/player?pid=${p.id}" onclick="App.navigate('player');return false;">${p.name}</a></td>
        <td>${p.teamName||'-'}</td>
        <td>${App.utils.formatMoney(p.salary)}</td>
        <td>${p.position}</td>
        <td>${p.eval?.toFixed? p.eval.toFixed(1):p.eval}</td>
        <td><button class="btn" onclick="App.utils.agencyRemoveClient('${p.id}')">解除</button></td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="muted">尚無客戶</td></tr>`;

    // simple scout list (top 50 by potential not yet clients)
    const candidates = state.players
      .filter(p=>!ag.clientIds.includes(p.id))
      .sort((a,b)=> (b.potential - a.potential)).slice(0, 50);
    const candRows = candidates.map(p=>`
      <tr>
        <td>${p.name}</td>
        <td>${p.teamName||'-'}</td>
        <td>${p.position}</td>
        <td>${p.potential?.toFixed? p.potential.toFixed(1):p.potential}</td>
        <td>${App.utils.scoutGrade(p)}</td>
        <td><button class="btn" onclick="App.utils.agencyTrySign('${p.id}')">簽約</button></td>
      </tr>
    `).join('');

    return `
      <div class="grid">
        <section class="card">
          <h2>公司資訊</h2>
          <div class="stat-row">
            <div class="stat"><div class="stat-k">等級</div><div class="stat-v">Lv.${ag.level}</div></div>
            <div class="stat"><div class="stat-k">名望</div><div class="stat-v">${ag.reputation}</div></div>
            <div class="stat"><div class="stat-k">現金</div><div class="stat-v">${App.utils.formatMoney(ag.cash)}</div></div>
            <div class="stat"><div class="stat-k">客戶數</div><div class="stat-v">${clients.length}/${cap}</div></div>
          </div>
          <div style="margin-top:12px">
            <button class="btn" onclick="App.utils.agencyUpgrade()">升級（${App.utils.formatMoney(App.utils.agencyUpgradeCost())}）</button>
            <button class="btn" onclick="App.navigate('clients')">查看客戶清單</button>
          </div>
        </section>

        <section class="card">
          <h2>簽約候選（球探推薦）</h2>
          <table class="table"><thead><tr><th>球員</th><th>球隊</th><th>位置</th><th>潛力</th><th>評等</th><th></th></tr></thead>
          <tbody>${candRows}</tbody></table>
        </section>
      </div>
    `;
  }
});
