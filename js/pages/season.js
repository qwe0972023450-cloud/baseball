
Router.register("season", ()=>{
  // Current season estimate board per league (synthetic standings for quick glance)
  function leagueBlock(l){
    const mock = l.teams.map(n=>({name:n, win: rand(30,90), loss: rand(30,90)}));
    mock.sort((a,b)=> (b.win-b.loss) - (a.win-a.loss));
    const rows = mock.slice(0,8).map((t,i)=>`<tr><td>${i+1}</td><td>${t.name}</td><td>${t.win}-${t.loss}</td></tr>`).join("");
    return `<div class="panel">
      <div class="panel-header"><h3>${l.name}</h3><span class="badge">Tier ${l.tier}</span></div>
      <table class="table"><thead><tr><th>#</th><th>球隊</th><th>戰績</th></tr></thead><tbody>${rows}</tbody></table>
    </div>`;
  }
  return `<div class="grid grid-2">${LEAGUES.map(leagueBlock).join("")}</div>`;
});
