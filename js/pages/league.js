
App.registerPage('league', {
  title: '聯盟',
  render(state){
    const qs = (location.hash.split('?')[1]||'');
    const params = new URLSearchParams(qs);
    const lid = +(params.get('lg')||1);
    const lg = state.leagues.find(l=>l.id===lid) || state.leagues[0];
    const teams = state.teams.filter(t=>t.leagueId===lg.id);
    const tbl = state['tbl_'+lg.id] || {};

    function renderTable(teamIds){
      const rows = teamIds.map(tid=>{
        const t = state.teams.find(x=>x.id===tid);
        const row = tbl[tid]||{W:0,L:0,RS:0,RA:0};
        return `<tr><td>${t?t.name:''}</td><td>${row.W}</td><td>${row.L}</td><td>${row.RS}</td><td>${row.RA}</td></tr>`;
      }).join('') || `<tr><td colspan="5" class="muted">尚未有戰績</td></tr>`;
      return `<table class="table"><thead><tr><th>球隊</th><th>W</th><th>L</th><th>RS</th><th>RA</th></tr></thead><tbody>${rows}</tbody></table>`;
    }

    const other = state.leagues.map(x=>`<a class="btn${x.id===lg.id?' primary':''}" href="#/league?lg=${x.id}">${x.name}</a>`).join('');
    let blocks = '';
    if(lg.divisions && lg.divisions.length){
      for(const d of lg.divisions){
        const ids = teams.filter(t=>t.division===d).map(t=>t.id);
        blocks += `<section class="card"><h3>${d} 戰績</h3>${renderTable(ids)}</section>`;
      }
    }else{
      blocks = `<section class="card"><h3>戰績</h3>${renderTable(teams.map(t=>t.id))}</section>`;
    }

    const teamCards = teams.map(t=>`
      <div class="mini-card">
        <div class="mini-title">${t.name}</div>
        <div class="muted">${t.country||''}${t.division?(' · '+t.division):''}</div>
      </div>
    `).join('');

    return `
      <div class="grid">
        <section class="card">
          <h2>${lg.name} 概覽</h2>
          <div class="btn-row">${other}</div>
          ${blocks}
          <h3 style="margin-top:16px">球隊</h3>
          <div class="wrap">${teamCards}</div>
        </section>
      </div>`;
  }
});
