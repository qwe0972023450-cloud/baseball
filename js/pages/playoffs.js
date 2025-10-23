
App.registerPage('playoffs', {
  title:'季後賽',
  render(state){
    const blocks = state.leagues.map(lg=>{
      const po = state[`po_${lg.id}`];
      if(!po) return `<section class="card"><h2>${lg.name} 季後賽</h2><div class="muted">尚未開始</div></section>`;
      function team(id){ const t=state.teams.find(x=>x.id===id); return t? t.name : '#'+id; }
      const seriesCards = po.series.map(s=>{
        const need = Math.ceil((s.best||5)/2);
        const bar = `<div class="chip-row">
          <span class="chip">${team(s.a)}</span><span class="chip">${s.wa}</span>
          <span class="chip">vs</span>
          <span class="chip">${s.wb}</span><span class="chip">${team(s.b)}</span>
          <span class="chip">BO${s.best}</span>
        </div>`;
        return `<div class="mini-card"><div class="mini-title">${s.round===2?'總冠軍賽':'系列賽'}（先至 ${need} 勝）</div>${bar}</div>`;
      }).join('');
      return `<section class="card"><h2>${lg.name} 季後賽</h2><div class="wrap">${seriesCards}</div></section>`;
    }).join('');
    return `<div class="grid">${blocks}</div>`;
  }
});
