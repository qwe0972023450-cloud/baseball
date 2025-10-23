
App.registerPage('leagues', {
  title: '聯盟',
  render(state){
    const sel = (state._selLeagueId) || (state.leagues[0]? state.leagues[0].id : 0);
    const tabs = state.leagues.map(lg=>`<button class="tab ${sel===lg.id?'active':''}" onclick="(App.state._selLeagueId=${lg.id},App.navigate('leagues'))">${lg.name}</button>`).join('');
    const lg = state.leagues.find(l=>l.id===sel) || state.leagues[0];
    const teams = state.teams.filter(t=>t.leagueId===lg.id);
    // Group by division if present
    const byDiv = {};
    for(const t of teams){
      const key = t.division || '全部';
      (byDiv[key]||(byDiv[key]=[])).push(t);
    }
    const sections = Object.entries(byDiv).map(([div, list])=>{
      const rows = list.map(t=>`<tr><td>${t.name}</td><td>${t.country||''}</td><td>${t.division||''}</td></tr>`).join('');
      return `<section class="card"><h3>${div}</h3><table class="table"><thead><tr><th>球隊</th><th>國家</th><th>分區</th></tr></thead><tbody>${rows}</tbody></table></section>`;
    }).join('');
    return `<div class="grid">
      <section class="card">
        <h2>聯盟清單</h2>
        <div class="tabs">${tabs}</div>
      </section>
      ${sections}
    </div>`;
  }
});
