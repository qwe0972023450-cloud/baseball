const Store = {
  version:'1.6.3',
  week:1, season:2025,
  teams:[], players:[],
  champions:{}, news:[], waiver:[], freeAgents:[],
  settings:{ weeksPerSeason:45, autoSim:false, useRealLeagues:true }
};

function initGame(){
  Store.teams = Leagues.getAllTeams(); // real teams across MLB/NPB/KBO/CPBL (no random teams)
  if(!Store.players.length){
    Store.players = generateRosters(Store.teams); // placeholder until real rosters imported
  }
  persist();
}
function persist(){ localStorage.setItem('BAM_SAVE', JSON.stringify(Store)); }
function load(){
  const raw = localStorage.getItem('BAM_SAVE'); if(!raw) return;
  try{ Object.assign(Store, JSON.parse(raw)); }catch(e){ console.warn('load failed', e); }
}
function resetSeasonHard(){
  Store.week=1; Store.champions={}; Store.news=[];
  Store.players.forEach(p=>{ p.weeklyRatings=[]; p.season = emptyStats(); });
  persist();
}

// ---- stats helpers ----
function emptyStats(){ return {G:0,AB:0,H:0,HR:0,RBI:0,AVG:0}; }
function calcAVG(p){ p.season.AVG = p.season.AB ? (p.season.H/p.season.AB) : 0; }

// ---- roles & scouting ----
function scoutTier(pot){
  if(pot>=92) return '頂尖球星';
  if(pot>=88) return '當家球星';
  if(pot>=80) return '主力球員';
  if(pot>=70) return '一般球員';
  return '潛力待觀察';
}
function roleByAvgScore(avg){
  if(avg<2) return '解約待定';
  if(avg<5) return '讓渡名單';
  if(avg<7) return '一般球員';
  if(avg<9) return '主力球員';
  if(avg<9.5) return '當家球星';
  return '頂尖球星';
}

// ---- rosters IO (1.1 compatible via tools) ----
function exportSave(){
  const blob = new Blob([JSON.stringify(Store,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=`BAM_${Store.season}_W${Store.week}.json`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1200);
}
function importSave(file){
  const fr = new FileReader();
  fr.onload = ()=>{
    try{ Object.assign(Store, JSON.parse(fr.result)); persist(); Router.render(location.hash); }
    catch(e){ alert('匯入失敗：JSON 格式錯誤'); }
  };
  fr.readAsText(file);
}
// Expected schema: [{name, team, age, salary, ovr, potential, season?}]
function importRosters(file){
  const fr = new FileReader();
  fr.onload = ()=>{
    try{
      const data = JSON.parse(fr.result);
      const byTeam = {}; Store.teams.forEach(t=>byTeam[t.name]=t.id);
      let pid=1;
      Store.players = data.map(p=>{
        const teamId = byTeam[p.team] ?? null;
        const obj = {
          id: pid++,
          name: p.name, team: p.team, teamId,
          age: p.age ?? 24, salary: p.salary ?? 500,
          ovr: p.ovr ?? 60, potential: p.potential ?? 70,
          role: '一般球員', weeklyRatings: [], status: teamId? 'active':'FA',
          season: emptyStats(), career: emptyStats(), scoutTier: scoutTier(p.potential ?? 70)
        };
        if(p.season){ Object.assign(obj.season, p.season); calcAVG(obj); }
        return obj;
      });
      persist(); alert('已載入真實名單！'); Router.render('#/clients');
    }catch(e){ alert('名單匯入失敗：JSON 格式錯誤'); }
  };
  fr.readAsText(file);
}

// ---- placeholder roster generator (teams are real; players are temporary) ----
function generateRosters(teams){
  const arr=[]; let pid=1;
  teams.forEach(t=>{
    for(let i=0;i<28;i++){
      const p = {
        id: pid++, name: Names.maleName(),
        teamId: t.id, team: t.name,
        age: 20+Math.floor(Math.random()*18),
        salary: 300+Math.floor(Math.random()*1500),
        ovr: 45+Math.floor(Math.random()*40),
        potential: 55+Math.floor(Math.random()*35),
        role:'一般球員', weeklyRatings:[], status:'active',
        season: emptyStats(), career: emptyStats(), scoutTier: ''
      };
      p.scoutTier = scoutTier(p.potential);
      arr.push(p);
    }
  });
  return arr;
}

function fmtMoney(k){ return `$${k}k`; }
function rnd(n){ return Math.floor(Math.random()*n); }

load();
document.addEventListener('DOMContentLoaded', ()=>{
  if(!localStorage.getItem('BAM_SAVE')) initGame();
  if(!Store.teams || !Store.teams.length) initGame();
});