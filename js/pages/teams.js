Router.register("teams", () => {
  const groups = Game.leagues.map(l => {
    const list = Game.teams.filter(t=>t.league===l.code).map(t=>`<span class="chip">${t.country} ${t.name}</span>`).join("");
    return `<div class="card"><h3>${l.name}</h3><div class="kpi">${list}</div></div>`;
  }).join("");
  mount(`<div class="grid cols-2">${groups}</div>`);
});