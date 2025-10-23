
App.registerPage('playoffs', {
  title:'季後賽',
  render(state){
    const qs = (location.hash.split('?')[1]||'');
    const params = new URLSearchParams(qs);
    const lid = +(params.get('lg')||1);
    const lg = state.leagues.find(l=>l.id===lid) || state.leagues[0];
    const po = state['po_'+lg.id];
    if(!po) return `<div class="grid"><section class="card"><h2>${lg.name} 季後賽</h2><div class="muted">尚未開始</div></section></div>`;
    function teamName(id){ const t=state.teams.find(x=>x.id===id); return t? t.name:'#'+id; }
    const pairs = (po.pairs||[]).map(([a,b])=>`<div class="mini-card"><div class="mini-title">${teamName(a)} vs ${teamName(b)}</div></div>`).join('');
    const winners = (po.winners||[]).map(id=>`<div class="chip">${teamName(id)}</div>`).join('');
    return `<div class="grid"><section class="card">
      <h2>${lg.name} 季後賽 - 第 ${po.round||1} 輪</h2>
      <h3>對戰組合</h3><div class="wrap">${pairs||'<div class="muted">尚無配對</div>'}</div>
      <h3 style="margin-top:12px">晉級</h3><div class="chip-row">${winners||''}</div>
    </section></div>`;
  }
});
