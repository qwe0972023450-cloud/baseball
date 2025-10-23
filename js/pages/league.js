
App.registerPage('league', {
  title: '聯盟',
  render(state){
    const params = new URLSearchParams((location.hash.split('?')[1]||''));
    const lid = +(params.get('lg')||1);
    const lg = state.leagues.find(l=>l.id===lid) || state.leagues[0];
    const divisions = lg.divisions || [];
    const teams = state.teams.filter(t=>t.leagueId===lg.id);
    // standings for this league (aggregate)
    const key = `tbl_${lg.id}`;
    const tbl = state[key]||{};
    const rows = Object.entries(tbl).map(([tid,row])=>{
      const t = state.teams.find(t=>t.id==tid);
      return `<tr><td>${t? t.name:''}</td><td>${row.W}</td><td>${row.L}</td><td>${row.RS}</td><td>${row.RA}</td></tr>`;
    }).join('') || `<tr><td colspan="5" class="muted">尚未有戰績</td></tr>`;
    const divFilters = (divisions.length? (`<div class="chip-row">`
      + divisions.map(d=>`<button class="chip" onclick="App.pages.league.filterDiv('${d}')">${d}</button>`).join('')
      + `</div>`) : '');
    const teamCards = teams.map(t=>`
      <div class="mini-card" data-div="${t.division||''}">
        <div class="mini-title">${t.name}</div>
        <div class="muted">${t.country||''} · ${t.division||''}</div>
      </div>
    `).join('');
    const otherLeagues = state.leagues.map(x=>`
      <a class="btn${x.id===lg.id?' primary':''}" href="#/league?lg=${x.id}" onclick="App.navigate('league');return false;">${x.name}</a>
    `).join('');
    return `
      <div class="grid">
        <section class="card"><h2>${lg.name} 概覽</h2>
          <div class="btn-row">${otherLeagues}</div>
          ${divFilters}
          <h3>戰績</h3>
          <table class="table"><thead><tr><th>球隊</th><th>W</th><th>L</th><th>RS</th><th>RA</th></tr></thead><tbody>${rows}</tbody></table>
          <h3 style="margin-top:16px">球隊</h3>
          <div class="wrap">${teamCards}</div>
        </section>
      </div>
    `;
  },
  filterDiv(divName){
    document.querySelectorAll('.mini-card').forEach(el=>{
      el.style.display = (!divName || el.getAttribute('data-div')===divName) ? '' : 'none';
    });
  }
});
