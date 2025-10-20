
// --- Season scheduler & playoffs (weeks 1-45 regular, 46-48 playoffs) ---
const SCHED_CFG = {
  "MLB": {games:162, weeksRS:44, playoffTeams:4},
  "NPB": {games:143, weeksRS:44, playoffTeams:4},
  "KBO": {games:144, weeksRS:44, playoffTeams:4},
  "CPBL": {games:120, weeksRS:40, playoffTeams:4},
  "ABL": {games:40,  weeksRS:30, playoffTeams:4},
  "CNBL":{games:60,  weeksRS:34, playoffTeams:4}
};
function ensureSeasonStructures(){
  STATE.season ||= {weekGames:{}, standings:{}, playoffs:null, champions:{}};
  Object.entries(LEAGUES).forEach(([key, lg])=>{
    STATE.season.standings[key] ||= {};
    (lg.teams||[]).forEach(tm=>{
      STATE.season.standings[key][tm] ||= {W:0,L:0,RS:0,RA:0};
    });
  });
}
function teamRating(leagueKey, team){
  // TODO: tie to roster when implemented. Keep simple for now.
  return 70 + Math.random()*10;
}
function scheduleForWeek(week){
  ensureSeasonStructures();
  const games = [];
  Object.entries(LEAGUES).forEach(([key, lg])=>{
    const cfg = SCHED_CFG[key] || {games:40,weeksRS:30, playoffTeams:4};
    const gpw = Math.ceil(cfg.games / cfg.weeksRS);
    if(week <= cfg.weeksRS){ // regular season
      const pool = (lg.teams||[]).slice().sort(()=>Math.random()-0.5);
      while(pool.length>1){
        const a = pool.pop(); const b = pool.pop();
        for(let g=0; g<gpw; g++){ games.push({league:key, a, b}); }
      }
    }else if(week===cfg.weeksRS+1 && (!STATE.season.playoffs || !STATE.season.playoffs[key])){
      // seed playoffs
      const table = Object.entries(STATE.season.standings[key]).sort((x,y)=> (y[1].W-x[1].W));
      const seeds = table.slice(0, Math.min(cfg.playoffTeams, table.length)).map(e=>e[0]);
      STATE.season.playoffs = STATE.season.playoffs || {};
      STATE.season.playoffs[key] = {round:1, seeds, winners:[], results:[]};
    }else if(week>cfg.weeksRS && week<=48 && STATE.season.playoffs && STATE.season.playoffs[key]){
      // playoffs weeks
      const PO = STATE.season.playoffs[key];
      if(PO.done) return;
      let pairs=[];
      if(PO.round===1){ pairs=[[PO.seeds[0],PO.seeds[3]],[PO.seeds[1],PO.seeds[2]]]; }
      else if(PO.round===2 && PO.winners.length>=2){ pairs=[[PO.winners[0], PO.winners[1]]]; }
      if(pairs.length){
        pairs.forEach(pr=> games.push({league:key, a:pr[0], b:pr[1], playoff:true}));
      }
    }
  });
  STATE.season.weekGames[week] = games;
}
function playWeek(week){
  const games = (STATE.season.weekGames && STATE.season.weekGames[week]) || [];
  games.forEach(g=>{
    const aScore = Math.round(2 + Math.random()*7 + teamRating(g.league,g.a)/18);
    const bScore = Math.round(2 + Math.random()*7 + teamRating(g.league,g.b)/18);
    if(!g.playoff){
      const tA = STATE.season.standings[g.league][g.a];
      const tB = STATE.season.standings[g.league][g.b];
      tA.RS += aScore; tA.RA += bScore;
      tB.RS += bScore; tB.RA += aScore;
      if(aScore>bScore){ tA.W++; tB.L++; } else { tB.W++; tA.L++; }
    }else{
      const winner = (aScore>=bScore)? g.a : g.b;
      const PO = STATE.season.playoffs[g.league];
      PO.results.push({week, a:g.a, b:g.b, winner});
      if(PO.round===1){
        PO.winners.push(winner);
        if(PO.winners.length>=2){ PO.round=2; }
      }else if(PO.round===2){
        PO.champion = winner; PO.done=true;
        const year = STATE.year;
        STATE.champions ||= {};
        (STATE.champions[year] ||= []).push({league:g.league, team:winner});
        addNews(`🏆 ${year} 年 ${g.league} 冠軍：${winner}`);
      }
    }
  });
}
function runWeeklySchedule(){
  const w = STATE.week;
  if(!STATE.season){ STATE.season = {weekGames:{}, standings:{}, playoffs:null, champions:{}}; }
  if(!STATE.season.weekGames[w]){ scheduleForWeek(w); }
  playWeek(w);
}
