
Router.register("teams", ()=>{
  const leagueBlocks = LEAGUES.map(l=>{
    const rows = l.teams.map((t,i)=>`<tr><td>${i+1}</td><td>${t}</td><td>${l.name}</td><td>Tier ${l.tier}</td></tr>`).join("");
    return `<div class="panel">
      <div class="panel-header"><h3>${l.name}</h3><span class="badge">Tier ${l.tier} — ${l.country}</span></div>
      <table class="table">
        <thead><tr><th>#</th><th>球隊</th><th>聯盟</th><th>層級</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join("");
  return `<div class="grid grid-2">${leagueBlocks}</div>`;
});
