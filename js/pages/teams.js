
App.registerPage('teams', {
  title:'球隊',
  render(state){
    const rows = state.teams.map(t=>`<tr><td>${t.leagueName}</td><td>${t.name}</td><td>${t.country||''}</td></tr>`).join('');
    return `<div class="grid"><section class="card">
    <h2>球隊清單</h2>
    <table class="table"><thead><tr><th>聯盟</th><th>球隊</th><th>國家</th></tr></thead><tbody>${rows}</tbody></table>
    </section></div>`;
  }
});
