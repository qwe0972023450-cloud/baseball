
let _leagueTab = 'CNBL';
function setLeagueTab(id){ _leagueTab=id; Router.refresh(); }

Router.register("teams", ()=>{
  const tabs = `<div class="subtabs">`+
    LEAGUES.map(l=>`<button class="${l.id===_leagueTab?'active':''}" onclick="setLeagueTab('${l.id}')">${l.name}</button>`).join("")+
    `</div>`;
  const l = LEAGUES.find(x=>x.id===_leagueTab) || LEAGUES[0];
  const rows = l.teams.map((t,i)=>`<tr><td>${i+1}</td><td>${t}</td><td>${l.name}</td><td>Tier ${l.tier}</td></tr>`).join("");
  const table = `<table class="table"><thead><tr><th>#</th><th>球隊</th><th>聯盟</th><th>層級</th></tr></thead><tbody>${rows}</tbody></table>`;
  return `<div class="panel"><div class="panel-header"><h3>球隊/分聯盟</h3><span class="badge">${l.name}</span></div>${tabs}${table}</div>`;
});

window.setLeagueTab = setLeagueTab;
