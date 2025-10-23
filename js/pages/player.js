
App.registerPage('player', {
  title:'球員',
  render(state){
    const id = state._viewPlayerId;
    const p = state.players.find(x=>x.id===id);
    if(!p){ return `<div class="grid"><section class="card"><h2>找不到球員</h2></section></div>`;}
    const stats = p.stats||{};
    const def = (p.defPositions||[p.position||'']).join('、');
    const canSign = App.utils.canSignPlayer(p);
    return `<div class="grid">
      <section class="card">
        <h2>${p.name} <span class="muted">(${p.age?Math.floor(p.age):'-'}歲, ${p.position||''})</span></h2>
        <div class="stat-row">
          <div class="stat">所屬：${p.teamName||'自由球員'}</div>
          <div class="stat">薪資：${App.utils.formatMoney(p.salary||0)}</div>
          <div class="stat">評分：${p.rating||'-'}（潛力 ${p.potential||'-'} / 球探 ${p.scout||'-'}）</div>
        </div>
        <div class="def-diamond">
          <div class="base diamond"></div>
          <div class="pos">${def}</div>
        </div>
        <div class="actions" style="margin-top:8px">
          <button class="btn" onclick="App.navigate('clients')">⬅️ 返回客戶</button>
          <button class="btn primary" ${canSign.ok? '':'disabled'} onclick="(App.utils.signPlayer(App.state.players.find(x=>x.id=='+id+')) && App.navigate('clients'))">🤝 簽入經紀公司</button>
          ${canSign.ok? '' : `<div class="muted" style="margin-top:6px">無法簽約：${canSign.reason}</div>`}
        </div>
      </section>
      <section class="card">
        <h3>攻守數據（本季）</h3>
        <div class="stat-row">
          <div class="stat">G ${stats.G||0}</div>
          <div class="stat">PA ${stats.PA||0}</div>
          <div class="stat">H ${stats.H||0}</div>
          <div class="stat">HR ${stats.HR||0}</div>
          <div class="stat">RBI ${stats.RBI||0}</div>
          <div class="stat">AVG ${stats.AVG||'.000'}</div>
        </div>
      </section>
    </div>`;
  }
});
