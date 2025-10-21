function renderChampions(){
  const leagues = Game.leagues;
  const yearsSet = new Set(Game.champions.map(c=>c.year));
  const yearOptions = Array.from(yearsSet).sort((a,b)=>b-a).map(y=>`<option value="${y}" ${Game.ui.champYear==y?'selected':''}>${y}</option>`).join("");
  const leagueOptions = leagues.map(l=>`<option value="${l.code}" ${Game.ui.champLeague===l.code?'selected':''}>${l.name}</option>`).join("");

  const toolbar = `<div class="toolbar">
    <select id="champ-league" class="select"><option value="">全部聯盟</option>${leagueOptions}</select>
    <select id="champ-year" class="select"><option value="">全部年份</option>${yearOptions}</select>
  </div>`;

  const filtered = Game.champions.filter(c => {
    if (Game.ui.champLeague && c.league !== Game.ui.champLeague) return false;
    if (Game.ui.champYear && c.year != Game.ui.champYear) return false;
    return true;
  });

  const byYear = {};
  filtered.forEach(c => { (byYear[c.year]||(byYear[c.year]=[])).push(c); });
  const years = Object.keys(byYear).sort((a,b)=>b-a);
  const html = years.map(y => {
    const items = byYear[y].map(c => `<span class="chip">${c.leagueName}：${c.country} ${c.team}</span>`).join("");
    return `<div class="card"><h3>${y} 年冠軍</h3><div class="kpi">${items}</div></div>`;
  }).join("");

  mount(`<div class="card"><h3>歷年冠軍</h3>${toolbar}</div><div class="grid cols-2">${html || '<div class="card">尚無冠軍紀錄，請先跑完一季。</div>'}</div>`);

  const lsel = document.getElementById("champ-league");
  const ysel = document.getElementById("champ-year");
  lsel.onchange = (e)=>{ Game.ui.champLeague = e.target.value; renderChampions(); };
  ysel.onchange = (e)=>{ Game.ui.champYear = e.target.value; renderChampions(); };
}
Router.register("champions", renderChampions);
Bus.on("render", ()=>{ if (Router.current()==="champions") renderChampions(); });