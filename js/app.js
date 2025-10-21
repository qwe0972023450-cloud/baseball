// Global State & Helpers
window.Game = {
  version: "1.4.0",
  year: 2030,
  week: 1,
  seasonWeeks: 52, // will be set 40-45 on new season
  fame: 0,
  cash: 0,
  leagues: [],
  teams: [],
  players: [],
  news: [],
  champions: [],
  ui: { clientQuery:"", clientSort:"rating_desc", champLeague:"", champYear:"" },
  rand(n){ return Math.floor(Math.random()*n); },
  uid(){ return Math.random().toString(36).slice(2,9); },
};

function saveGame(){
  try{
    const {routes, ...rest} = Game;
    localStorage.setItem("bam_save", JSON.stringify(rest));
  }catch(e){}
}
function loadGame(){
  try{
    const s = localStorage.getItem("bam_save");
    if (!s) return false;
    const obj = JSON.parse(s);
    Object.assign(Game, obj);
    return true;
  }catch(e){ return false; }
}

// boot
function boot(){
  Game.leagues = window.Leagues || [];
  Game.teams = Game.leagues.flatMap(l => l.teams.map(t => ({...t, league:l.code, leagueName:l.name})));
  if (!loadGame()){
    // init player pool only for fresh start
    const pool = (window.RealPlayers||[]).slice();
    while (pool.length < 60){
      const n = window.RandomName();
      const t = Game.teams[Game.rand(Game.teams.length)];
      pool.push({
        name:n, team:t.name, pos: Math.random()>.5?'B':'P', age: 22+Game.rand(12),
        salary: 120000 + Game.rand(800000),
        country: t.country, skill: 80+Game.rand(20), rating: +(7 + Math.random()*2).toFixed(1), scout: +(7.5 + Math.random()*2).toFixed(1),
        contract: 2030 + Game.rand(3)
      });
    }
    Game.players = pool.map(p => ({
      id: Game.uid(), ...p,
      mood: "🙂",
      season: {G:0, AB:0, H:0, AVG:0, HR:0, RBI:0, IP:0, K:0, ER:0, ERA:0},
      weeksBelow2:0, waiver:false, retired:false
    }));
    Game.seasonWeeks = 40 + Game.rand(6);
  }

  updateHeader();
  if (!location.hash) location.hash = "#/home";
  Router.init();
  document.getElementById("btn-next").addEventListener("click", () => { Scheduler.nextWeek(); saveGame(); });
}

// DOM ready safe init
if (document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", boot);
}else{
  boot();
}

function updateHeader(){
  document.getElementById("ui-year").textContent = Game.year;
  document.getElementById("ui-week").textContent = `${Game.week}/${Game.seasonWeeks}`;
  document.getElementById("ui-fame").textContent = Game.fame;
  document.getElementById("ui-cash").textContent = Game.cash.toLocaleString();
  document.getElementById("ui-year-footer").textContent = new Date().getFullYear();
}

// Simple event bus
window.Bus = {
  _e:{},
  on(ev, fn){ (this._e[ev]||(this._e[ev]=[])).push(fn); },
  emit(ev, data){ (this._e[ev]||[]).forEach(fn => fn(data)); }
};

// Render helper
window.mount = function(html){
  const el = document.getElementById("app-content");
  el.innerHTML = html;
  // persistent delegated clicks
  el.onclick = function(e){
    const a = e.target.closest("[data-action]");
    if (!a) return;
    const action = a.getAttribute("data-action");
    if (Pages.actions[action]) Pages.actions[action](a, e);
  };
}

// Pages registry
window.Pages = { actions:{} };
