
App.registerPage('player', {
  title: '球員資料',
  render(state){
    const qs = (location.hash.split('?')[1]||'');
    const params = new URLSearchParams(qs);
    const pid = params.get('pid');
    const p = state.players.find(x=>x.id===pid);
    if(!p){ return `<div class="grid"><section class="card"><h2>找不到球員</h2></section></div>`; }
    const scout = App.utils.scoutGrade(p);
    const hasContract = !!p.agentContract;
    const actions = (state.agency && state.agency.clientIds.includes(p.id))
      ? `<button class="btn" onclick="App.utils.agencyRemoveClient('${p.id}')">解除經紀約</button>`
      : `<form onsubmit="return App.utils.submitAgentOffer('${p.id}', this)">
           <div style="display:flex;gap:8px;flex-wrap:wrap">
             <label>年薪：<input name="salary" type="number" min="50000" step="50000" value="300000"/></label>
             <label>年數：<input name="years" type="number" min="1" max="5" value="2"/></label>
             <label>簽約金：<input name="bonus" type="number" min="0" step="50000" value="100000"/></label>
             <label>佣金%：<input name="commission" type="number" min="3" max="15" value="8"/></label>
             <button class="btn primary" type="submit">提出經紀合約</button>
           </div>
         </form>`;

    return `
      <div class="grid">
        <section class="card">
          <h2>${p.name}</h2>
          <div class="stat-row">
            <div class="stat"><div class="stat-k">球隊</div><div class="stat-v">${p.teamName||'自由球員'}</div></div>
            <div class="stat"><div class="stat-k">位置</div><div class="stat-v">${p.position}</div></div>
            <div class="stat"><div class="stat-k">薪資</div><div class="stat-v">${App.utils.formatMoney(p.salary)}</div></div>
            <div class="stat"><div class="stat-k">評分</div><div class="stat-v">${(p.eval??'-')}</div></div>
          </div>
          <div class="stat-row">
            <div class="stat"><div class="stat-k">能力</div><div class="stat-v">${(p.rating??'-')}</div></div>
            <div class="stat"><div class="stat-k">潛力</div><div class="stat-v">${(p.potential??'-')}</div></div>
            <div class="stat"><div class="stat-k">球探評等</div><div class="stat-v">${scout}</div></div>
            <div class="stat"><div class="stat-k">年齡</div><div class="stat-v">${p.age||'-'}</div></div>
          </div>
          <h3>本季累積</h3>
          <div class="stat-row">
            <div class="stat"><div class="stat-k">G</div><div class="stat-v">${p.stats.G}</div></div>
            <div class="stat"><div class="stat-k">PA</div><div class="stat-v">${p.stats.PA}</div></div>
            <div class="stat"><div class="stat-k">H</div><div class="stat-v">${p.stats.H}</div></div>
            <div class="stat"><div class="stat-k">HR</div><div class="stat-v">${p.stats.HR}</div></div>
            <div class="stat"><div class="stat-k">RBI</div><div class="stat-v">${p.stats.RBI}</div></div>
            <div class="stat"><div class="stat-k">AVG</div><div class="stat-v">${p.stats.AVG}</div></div>
          </div>
          <h3 style="margin-top:16px">經紀合約</h3>
          <div>${hasContract? JSON.stringify(p.agentContract): '尚未簽訂'}</div>
          <div style="margin-top:12px">${actions}</div>
        </section>
      </div>`;
  }
});
