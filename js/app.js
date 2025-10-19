
const VERSION = "1.1";

// ---------- State ----------
const STATE = {
  year: 2034,
  week: 1,
  fame: 50, // 0-1000
  cash: 12_000_000,
  staff: { scout: 80, negotiator: 75, coach: 70 },
  academy: { hs:true, college:true, overseas:true, level:3 },
  commission: { salary:0.10, endorsement:0.20, transfer:0.05 },
  clients: [], // players we represent
  playersPool: [],
  finance: { income:[], expense:[], history:[] },
  news: [],
  champions: {}, // {year:{LEAGUE: team}}
};

// ---------- Utilities ----------
function save(){ localStorage.setItem("BAM_SAVE", JSON.stringify(STATE)); }
function load(){
  const raw = localStorage.getItem("BAM_SAVE");
  if(raw){
    try{ Object.assign(STATE, JSON.parse(raw)); }
    catch(e){ console.warn("Load failed",e); }
  }
}
function fmtMoney(n){ return "$" + n.toLocaleString(); }
function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function clamp(x,a,b){ return Math.max(a, Math.min(b,x)); }
function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function calcOVR(p){
  // Basic overall calculation weighted by role
  const bat = (p.hitL + p.hitR + p.power + p.eye + p.discipline + p.speed)/6;
  const pit = (p.vel + p.control + p.movement + p.breaking)/4;
  const field = (p.def + p.arm)/2;
  let k=1;
  if(p.pos.includes("投手")) k=0.75;
  return Math.round(k*bat + (1.2-k)*pit + 0.5*field);
}
function makePlayer(seedTier=null){
  const pos = randomChoice(POSITIONS);
  const bats = Math.random()<0.5? "R":"L";
  const throws = Math.random()<0.5? "R":"L";
  let base = 40 + rand(0,30); // base ability
  if(seedTier){ base += (seedTier-3)*8; } // higher tier slightly better pool
  const p = {
    id: Math.random().toString(36).slice(2),
    name: randName(),
    age: rand(17,34),
    pos,
    bats, throws,
    // batting
    hitL: clamp(base + rand(-10,10), 20, 99),
    hitR: clamp(base + rand(-10,10), 20, 99),
    power: clamp(base + rand(-15,12), 20, 99),
    eye: clamp(base + rand(-12,12), 20, 99),
    discipline: clamp(base + rand(-12,12), 20, 99),
    speed: clamp(base + rand(-12,12), 20, 99),
    // pitching
    vel: clamp(base + rand(-10,10), 20, 99),
    control: clamp(base + rand(-12,12), 20, 99),
    movement: clamp(base + rand(-12,12), 20, 99),
    breaking: clamp(base + rand(-15,12), 20, 99),
    def: clamp(base + rand(-8,12), 20, 99),
    arm: clamp(base + rand(-8,12), 20, 99),
    potential: clamp(base + rand(0,25), 30, 99),
    morale: rand(60,90),
    fatigue: 0,
    injury: null,
    ovr: 50,
    team: null, // {leagueId,teamName,tier}
    salary: 0,
    endorsements: [],
    contractWeeks: 0,
  };
  p.ovr = calcOVR(p);
  return p;
}

function seedPools(){
  if(STATE.playersPool.length < 120){
    const tiers = [1,2,3,4,5];
    for(let i=0;i<80;i++){
      STATE.playersPool.push(makePlayer(randomChoice(tiers)));
    }
  }
}

function init(){
  load();
  if(STATE.clients.length===0){
    // seed with a rookie
    STATE.clients.push(makePlayer(3));
    STATE.clients[0].name = STATE.clients[0].name + "（簽）";
    STATE.clients[0].salary = 120_000;
    STATE.clients[0].contractWeeks = 52*2;
    STATE.clients[0].team = { leagueId:"CPBL", teamName:"中信兄弟", tier:3 };
  }
  seedPools();
  updateHUD();
  window.addEventListener("hashchange", ()=>Router.resolve());
  document.querySelectorAll(".nav-link").forEach(a=>{
    a.addEventListener("click", ()=>{
      document.querySelectorAll(".nav-link").forEach(n=>n.classList.remove("active"));
      a.classList.add("active");
    })
  });
  document.getElementById("btn-next-week").addEventListener("click",nextWeek);
  if(!location.hash) location.hash = "#/home";
  Router.resolve();
  save();
}

function updateHUD(){
  document.getElementById("hud-year").textContent = STATE.year;
  document.getElementById("hud-week").textContent = STATE.week;
  document.getElementById("hud-fame").textContent = STATE.fame;
  document.getElementById("hud-cash").textContent = fmtMoney(STATE.cash);
}

function addNews(text){ STATE.news.unshift({ id:Math.random().toString(36).slice(2), week:STATE.week, year:STATE.year, text }); }

// ---- Simulation helpers ----
function leagueById(id){ return LEAGUES.find(l=>l.id===id); }

function signDifficulty(tier, ovr){
  // Higher tier more difficult; fame helps
  const base = 20 + (tier*15); // 35..95
  const ovrAdj = (ovr-60)*0.6; // -? +?
  const fameAdj = Math.log10(Math.max(1,STATE.fame))*10;
  let chance = clamp(60 + ovrAdj + fameAdj - base, 5, 90);
  return chance;
}

function trySign(player, leagueId, teamName){
  const league = leagueById(leagueId);
  const chance = signDifficulty(league.tier, player.ovr);
  const roll = rand(1,100);
  const ok = roll <= chance;
  if(ok){
    player.team = { leagueId, teamName, tier: league.tier };
    player.salary = Math.round((1000 + player.ovr*1200) * (1 + league.tier*0.25));
    player.contractWeeks = 52*rand(1,3);
    const fee = Math.round(player.salary * STATE.commission.salary);
    STATE.cash += fee;
    STATE.finance.income.push({type:"薪資佣金", amount:fee, note:`${player.name} @ ${league.name} ${teamName}`});
    addNews(`✅ 簽約成功：${player.name} 加入 ${league.name} - ${teamName}；週薪 ${fmtMoney(player.salary)}，佣金入帳 ${fmtMoney(fee)}。`);
  }else{
    addNews(`❌ 簽約失敗：${player.name} 嘗試加入 ${league.name} - ${teamName} 未果（機率 ${chance}% 擲出 ${roll}）。`);
  }
  save();
  return ok;
}

function progressPlayer(p){
  // 受年齡與潛力影響
  const agePeak = 28;
  const dev = p.potential/100;
  const dist = agePeak - p.age;
  const delta = clamp(Math.round(dist*dev*0.6 + rand(-2,3)), -3, 4);
  // apply to core attributes
  ["hitL","hitR","power","eye","discipline","speed","vel","control","movement","breaking","def","arm"].forEach(k=>{
    p[k] = clamp(p[k] + delta, 20, 99);
  });
  p.ovr = calcOVR(p);
  p.age += (STATE.week%52===0?1:0);
}

function simulateTeamSeason(league){
  // Compute strength per team based on all clients currently on that team plus baseline by league tier
  const baseByTier = {1:50,2:58,3:66,4:74,5:82};
  const teams = league.teams.map(name=>({name, score: baseByTier[league.tier] + rand(-5,5), stats:{AVG:0.250,OPS:0.700,ERA:4.20,WHIP:1.30,KBB:2.2}}));
  // Add contribution from represented players
  STATE.clients.forEach(p=>{
    if(p.team && p.team.leagueId===league.id){
      const t = teams.find(t=>t.name===p.team.teamName);
      if(t){ t.score += (p.ovr-60)*0.25; }
    }
  });
  // pick champion by highest score + noise
  teams.forEach(t=> t.score += Math.random()*5 );
  teams.sort((a,b)=>b.score-a.score);
  const champ = teams[0];
  // generate stats rough
  champ.stats.AVG = +(0.250 + (champ.score-70)*0.002).toFixed(3);
  champ.stats.OPS = +(0.700 + (champ.score-70)*0.01).toFixed(3);
  champ.stats.ERA = +(4.20 - (champ.score-70)*0.03).toFixed(3);
  champ.stats.WHIP = +(1.30 - (champ.score-70)*0.01).toFixed(3);
  champ.stats.KBB = +(2.2 + (champ.score-70)*0.05).toFixed(3);
  return {champion: champ.name, table: teams};
}

function endOfSeason(){
  // development & contracts
  STATE.clients.forEach(p=>{
    progressPlayer(p);
    if(p.contractWeeks<=0 && p.team){
      addNews(`📄 合同到期：${p.name} 離開 ${leagueById(p.team.leagueId).name} - ${p.team.teamName}`);
      p.team = null; p.salary=0;
    }
  });
  // champions per league
  const year = STATE.year;
  STATE.champions[year] = STATE.champions[year] || {};
  LEAGUES.forEach(lg=>{
    const res = simulateTeamSeason(lg);
    STATE.champions[year][lg.id] = res.champion;
    addNews(`🏆 ${year} ${lg.name} 冠軍：${res.champion}`);
  });
  // finance history
  const income = STATE.finance.income.reduce((a,b)=>a+b.amount,0);
  const expense = STATE.finance.expense.reduce((a,b)=>a+b.amount,0);
  const net = income - expense;
  STATE.finance.history.unshift({ year, income, expense, net });
  // reset yearly ledgers
  STATE.finance.income = [];
  STATE.finance.expense = [];
  save();
}

function weeklyTick(){
  // passive costs
  const ops = 300_000 + STATE.staff.scout*100 + STATE.staff.negotiator*120 + STATE.staff.coach*110;
  STATE.cash -= ops;
  STATE.finance.expense.push({type:"營運", amount:ops, note:"週期成本"});
  // endorsements chance
  STATE.clients.forEach(p=>{
    if(p.team && Math.random()<0.05){
      const fee = rand(30_000, 160_000);
      const cut = Math.round(fee * STATE.commission.endorsement);
      STATE.cash += cut;
      STATE.finance.income.push({type:"代言提成", amount:cut, note:`${p.name}`});
      addNews(`📣 代言：${p.name} 獲得代言金 ${fmtMoney(fee)}（提成 ${fmtMoney(cut)}）`);
    }
    if(p.contractWeeks>0) p.contractWeeks -= 1;
  });
  // random injuries (minor)
  STATE.clients.forEach(p=>{
    if(p.team && Math.random()<0.02){
      p.injury = {weeks: rand(1,6), type: randomChoice(["拉傷","扭傷","疲勞"])};
      addNews(`🩹 傷病：${p.name} ${p.injury.type} 預計${p.injury.weeks} 週`);
    }
    if(p.injury){ p.injury.weeks -= 1; if(p.injury.weeks<=0) p.injury=null; }
  });
  save();
}

function nextWeek(){
  STATE.week += 1;
  if(STATE.week>52){
    STATE.week = 1; STATE.year += 1;
    endOfSeason();
  }
  weeklyTick();
  updateHUD();
  Router.refresh(); // refresh current view
}

// ---------- Exports ----------
window.STATE = STATE;
window.save = save;
window.load = load;
window.fmtMoney = fmtMoney;
window.trySign = trySign;
window.leagueById = leagueById;
window.signDifficulty = signDifficulty;
window.addNews = addNews;
window.init = init;
