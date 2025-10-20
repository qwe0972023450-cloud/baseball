
/* js/scheduler.js — v1.1 delta patch drop-in
   - 保留原檔名，避免你現站 <script src="/js/scheduler.js"> 場景改動
   - Progressive enhancement：若找不到你的舊節點，會自動注入底部導覽與頁面容器
*/
import { Contract } from './modules/contracts.js';
import { makeBracket } from './modules/playoffs.js';
import { recommendPlayers } from './modules/scouting.js';
import { newsPadHTML } from './modules/news.js';
import { renderLine } from './modules/charts.js';

const BAM = window.BAM = window.BAM || {};

// ---------- State ----------
const storeKey = 'bam_save_v1_1';
const now = { year: 2025, week: 1 };
let leagues = {};
let teams = []; // {id, name, leagueKey, rating, wins, losses}
let players = []; // 客戶/自由球員
let news = [];
let finances = { cash: 0, history: [] };
let contracts = []; // active contracts

// ---------- Utilities ----------
async function loadJSON(url){
  const r = await fetch(url);
  return await r.json();
}
function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }
function uuid(){ return Math.random().toString(36).slice(2) }

// ---------- Name & Nation ----------
let namesZH, namesEN;
function randomName(){
  const useZh = Math.random() < 0.5;
  if(useZh){
    const f = pick(namesZH.family), g = pick(namesZH.given);
    return { name: f+g, nation: pick(['TW','CN','HK','MO']) };
  }else{
    return { name: `${pick(namesEN.first)} ${pick(namesEN.last)}`, nation: pick(['US','JP','KR','AU','CA','MX','DO','VE']) };
  }
}

// ---------- League/Team bootstrap ----------
function flattenTeams(){
  const out = [];
  Object.entries(leagues).forEach(([lk, cfg])=>{
    Object.entries(cfg.divisions).forEach(([div, arr])=>{
      arr.forEach(n=> out.push({ id: uuid(), name:n, leagueKey: lk, division: div, level: cfg.level, rating: rand(60,92), wins:0, losses:0 }));
    });
  });
  return out;
}

// ---------- Players ----------
function makePlayer(){
  const n = randomName();
  const ovr = rand(45, 85);
  const pot = Math.min(99, ovr + rand(5,15));
  const handed = pick(['R','L','S']);
  return {
    id: uuid(), name: n.name, nation: n.nation, age: rand(17,34),
    ovr, potential: pot,
    morale: rand(40,85), role: pick(['Starter','Bench','Prospect']), chemistry: rand(40,85),
    handed, pos: pick(['SP','RP','C','1B','2B','3B','SS','LF','CF','RF']),
    faWeeks: 0, // 自由球員未簽累積週
    negotiationTries: 0, lastNegotiationWeek: -999,
    scouting: { potentialTier: guessTier(pot) },
    teamId: null, contract: null, lastTeamRating: null
  };
}
function guessTier(p){ // 球探報告對應層級
  if(p>=90) return 'MLB 超級';
  if(p>=80) return 'MLB/NPB 核心';
  if(p>=70) return 'KBO/CPBL 先發';
  if(p>=60) return 'CPBL/ABL 先發';
  return '發展/學院';
}

// ---------- Scheduling ----------
function scheduleWeekGames(leagueKey){
  // 以聯盟為單位隨機配對（簡化：每週每隊打一場）
  const ts = teams.filter(t=>t.leagueKey===leagueKey);
  const shuffled = [...ts].sort(()=>Math.random()-0.5);
  const games = [];
  for(let i=0;i<shuffled.length;i+=2){
    if(i+1<shuffled.length) games.push([shuffled[i], shuffled[i+1]]);
  }
  return games;
}
function simGame(a, b){
  const ar = a.rating + rand(-5,5);
  const br = b.rating + rand(-5,5);
  const aScore = Math.max(0, Math.round(ar/10) + rand(0,6));
  const bScore = Math.max(0, Math.round(br/10) + rand(0,6));
  if(aScore === bScore){
    if(Math.random()<0.5){ return {win:a,lose:b,score:[aScore+1,bScore]} }
    else { return {win:b,lose:a,score:[aScore,bScore+1]} }
  }
  return (aScore>bScore) ? {win:a,lose:b,score:[aScore,bScore]} : {win:b,lose:a,score:[aScore,bScore]}
}
function updateStandings(res){
  res.win.wins++; res.lose.losses++;
}

// ---------- Negotiation ----------
function interestScore(player, team, offer){
  // 簽約意願 = 基礎(ovr對比聯盟等級) + 士氣/化學/角色 + 合約條款 + 球隊評分影響
  const leagueLevel = leagues[team.leagueKey].level;
  const base = Math.max(0, player.ovr - leagueLevel*10) / 2;
  const mood = (player.morale -50)/5 + (player.chemistry -50)/5 + (player.role==='Starter'?6:0);
  const teamFit = (team.rating - 70)/3;
  const optionDelta = Contract.applyOptions(offer, player);
  return base + mood + teamFit + optionDelta;
}
function tryNegotiate(player, team, offer){
  if(!Contract.canRenegotiate(player, now.week)) return {ok:false, reason:'合約未滿一年，不能改簽'};
  if(Contract.cooling(player, now.week)) return {ok:false, reason:'談判冷卻中（需滿 4 週）'};
  if(Contract.triesLeft(player)<=0) return {ok:false, reason:'本輪談判次數已用完'};
  player.negotiationTries = (player.negotiationTries||0)+1;
  player.lastNegotiationWeek = now.week;
  const score = interestScore(player, team, offer);
  const accept = score + rand(-8,8) > 12;
  if(accept){
    player.teamId = team.id;
    player.contract = { ...offer, signedWeek: now.week, teamId: team.id };
    player.faWeeks = 0;
    player.lastTeamRating = team.rating;
    player.negotiationTries = 0;
    news.unshift({week:now.week, html:newsPadHTML({title:`${player.name} 與 ${team.name} 簽下 ${offer.years} 年`, body:`包含選項：${offer.playerOption?'球員':''}${offer.teamOption?' 球隊':''}${offer.arbYears?` 仲裁${offer.arbYears}年`:''}${offer.buyout?` 買斷$${offer.buyout}`:''}`})});
    return {ok:true};
  }else{
    if(Contract.triesLeft(player)<=0){
      news.unshift({week:now.week, html:newsPadHTML({title:`${player.name} 談判失敗`, body:`與 ${team.name} 的談判暫告失敗，4 週後才可再談。`})});
    }
    return {ok:false, reason:'對方暫不接受，請調整條款或 4 週後再試'};
  }
}

// ---------- Week tick ----------
function tickWeek(){
  // 排程與模擬
  Object.keys(leagues).forEach(lk=>{
    const gs = scheduleWeekGames(lk);
    gs.forEach(([a,b])=>{
      const r = simGame(a,b);
      updateStandings(r);
    });
  });
  // 球探推薦每 4 週
  if(now.week % 4 === 0){
    const pool = Array.from({length:8}, ()=>makePlayer());
    const rec = recommendPlayers(pool, 3, now.week);
    players.push(...rec);
    news.unshift({week:now.week, html:newsPadHTML({title:'球探推薦三名潛力股', body:rec.map(p=>`${p.name}（${p.nation}） POT ${p.potential}`).join('<br>')})});
  }
  // 自由球員 12 週未簽離開
  players.forEach(p=>{
    if(!p.teamId){ p.faWeeks++; }
  });
  const before = players.length;
  players = players.filter(p=> !( !p.teamId && p.faWeeks>=12 ) );
  if(players.length < before){
    news.unshift({week:now.week, html:newsPadHTML({title:'自由球員離開經紀公司', body:'有球員超過 12 週未能簽約，已自動離開。'})});
  }
  // 週數 / 年份 滾動
  now.week++;
  if(now.week>52){
    now.week = 1; now.year++;
    ageAndRetire();
  }
  save();
  render();
}

function ageAndRetire(){
  players.forEach(p=> p.age++);
  // 35 起機率，45 必退
  const still = [];
  players.forEach(p=>{
    const force = p.age>=45;
    const chance = p.age>=35 ? Math.min(0.9, (p.age-34)*0.03) : 0;
    if(force || Math.random() < chance){
      news.unshift({week:now.week, html:newsPadHTML({title:`${p.name} 宣布退休`, body:`年齡 ${p.age}；祝福他未來一切順利。`})});
    }else{
      still.push(p);
    }
  });
  players = still;
}

// ---------- Save/Load ----------
function save(){
  const data = {now, players, teams, leagues, news, finances};
  localStorage.setItem(storeKey, JSON.stringify(data));
}
function load(){
  const s = localStorage.getItem(storeKey);
  if(!s) return false;
  try{
    const d = JSON.parse(s);
    Object.assign(now, d.now);
    players = d.players||[]; teams = d.teams||[]; leagues = d.leagues||{}; news = d.news||[]; finances = d.finances||finances;
    return true;
  }catch(e){ return false; }
}

// ---------- UI (progressive) ----------
function el(q){ return document.querySelector(q) }
function ensureBottomNav(){
  if(document.querySelector('.btm-nav')) return;
  const nav = document.createElement('div');
  nav.className = 'btm-nav';
  nav.innerHTML = ['主頁','客戶','球隊','季賽','設定'].map((t,i)=>`<button class="tab ${i==0?'active':''}" data-tab="${t}">${t}</button>`).join('');
  document.body.appendChild(nav);
  nav.addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab'); if(!btn) return;
    nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    showTab(btn.dataset.tab);
  });
}
function ensureContainers(){
  if(!el('#app')){
    const app = document.createElement('div');
    app.id = 'app';
    app.style.padding = '12px';
    document.body.appendChild(app);
  }
  if(!el('#main')){
    const m = document.createElement('div'); m.id='main'; document.querySelector('#app').appendChild(m);
  }
}
function showTab(name){
  const m = el('#main'); if(!m) return;
  if(name==='主頁') drawHome(m);
  else if(name==='客戶') drawClients(m);
  else if(name==='球隊') drawTeams(m);
  else if(name==='季賽') drawSeason(m);
  else if(name==='設定') drawSettings(m);
}

function drawHome(m){
  m.innerHTML = `
    <div class="kpi-bar">
      <div class="kpi">年份 <b>${now.year}</b></div>
      <div class="kpi">週次 <b>${now.week}/52</b></div>
      <div class="kpi">現金 <b>$${finances.cash.toLocaleString()}</b></div>
      <button class="btn" id="nextWeekBtn">下一週 ▶</button>
    </div>
    <div class="grid">
      <div class="g-col-12 card"><h3>最新新聞</h3><div id="newsWrap">${news.slice(0,3).map(n=>n.html).join('')}</div></div>
      <div class="g-col-6 card"><canvas id="cashChart" height="120"></canvas></div>
      <div class="g-col-6 card"><canvas id="dealChart" height="120"></canvas></div>
    </div>
  `;
  m.querySelector('#nextWeekBtn').onclick = tickWeek;
  // charts demo
  finances.history.push({w:`${now.year}-W${now.week}`, cash: finances.cash});
  const labels = finances.history.slice(-12).map(x=>x.w);
  renderLine(m.querySelector('#cashChart'), labels, [{label:'現金', data: finances.history.slice(-12).map(x=>x.cash), borderWidth:2}]);
  renderLine(m.querySelector('#dealChart'), labels, [{label:'簽約成功率', data: labels.map(()=>rand(30,85)), borderWidth:2}]);
}

function drawClients(m){
  const rows = players.map(p=>`
    <tr>
      <td><b>${p.name}</b> <span class="badge">${p.nation}</span><div class="chips"><span class="chip">OVR ${p.ovr}</span><span class="chip">POT ${p.potential}</span><span class="chip">士氣 ${p.morale}</span><span class="chip">化學 ${p.chemistry}</span><span class="chip">角色 ${p.role}</span></div></td>
      <td>${playerTeamLabel(p)}</td>
      <td>${gradeLabel(p)}</td>
      <td><button class="btn secondary" data-act="neg" data-id="${p.id}">談判</button> <button class="btn danger" data-act="cut" data-id="${p.id}">釋出</button></td>
    </tr>`).join('');
  m.innerHTML = `
    <div class="card">
      <h3>客戶 ${players.length}</h3>
      <table class="table">
        <thead><tr><th>球員</th><th>所屬</th><th>球隊評分</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  m.querySelectorAll('[data-act="cut"]').forEach(b=> b.onclick=()=>{players = players.filter(p=>p.id!==b.dataset.id); save(); render();});
  m.querySelectorAll('[data-act="neg"]').forEach(b=> b.onclick=()=> openNegModal(players.find(p=>p.id===b.dataset.id)));
}

function gradeLabel(p){
  const g = teamScore(p);
  let tag='';
  if(g<2) tag='釋出'; else if(g<=4) tag='讓渡'; else if(g<=6) tag='不續約';
  else if(g<=8) tag='固定先發'; else if(g<=9) tag='當家球星'; else tag='全球頂級';
  return `${g.toFixed(1)} <span class="badge">${tag}</span>`;
}
function teamScore(p){
  const base = (p.ovr/10);
  const teamR = (p.lastTeamRating||70)/10;
  return Math.max(1, Math.min(10, (base + teamR)/2 ));
}
function playerTeamLabel(p){
  const t = teams.find(t=>t.id===p.teamId);
  return t ? `${t.name}` : '<span class="badge">自由球員</span>';
}

function openNegModal(p){
  const modal = document.createElement('div');
  modal.style.position='fixed';modal.style.inset='0';modal.style.background='rgba(0,0,0,.6)';modal.style.zIndex='9999';
  modal.innerHTML = `
    <div class="card" style="max-width:640px;margin:10vh auto;padding:16px;background:#0f2635">
      <h3>與 ${p.name} 談判</h3>
      <div class="grid">
        <div class="g-col-6">
          <label>聯盟</label>
          <select id="negLeague" class="inp">${Object.keys(leagues).map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
        </div>
        <div class="g-col-6">
          <label>球隊</label>
          <select id="negTeam" class="inp"></select>
        </div>
        <div class="g-col-6"><label>週薪</label><input id="negSalary" type="number" value="200000"/></div>
        <div class="g-col-6"><label>年限</label><input id="negYears" type="number" value="1" min="1" max="7"/></div>
      </div>
      <div class="chips" style="margin:.5rem 0">
        <label><input type="checkbox" id="optPlayer"/> 球員選擇權</label>
        <label><input type="checkbox" id="optTeam"/> 球隊選擇權</label>
        <label>仲裁年 <input type="number" id="optArb" value="0" min="0" max="3" style="width:64px"/></label>
        <label>買斷金 <input type="number" id="optBuyout" value="0" step="10000" style="width:96px"/></label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn secondary" id="cancelBtn">取消</button>
        <button class="btn" id="offerBtn">出價（剩 ${3-(p.negotiationTries||0)} 次）</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const leagueSel = modal.querySelector('#negLeague');
  const teamSel = modal.querySelector('#negTeam');
  function fillTeams(){
    const lk = leagueSel.value;
    const ts = teams.filter(t=>t.leagueKey===lk);
    teamSel.innerHTML = ts.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  }
  leagueSel.onchange = fillTeams; fillTeams();

  modal.querySelector('#cancelBtn').onclick = ()=> modal.remove();
  modal.querySelector('#offerBtn').onclick = ()=>{
    const team = teams.find(t=>t.id===teamSel.value);
    const offer = {
      salary: Number(modal.querySelector('#negSalary').value||0),
      years: Number(modal.querySelector('#negYears').value||1),
      playerOption: modal.querySelector('#optPlayer').checked,
      teamOption: modal.querySelector('#optTeam').checked,
      arbYears: Number(modal.querySelector('#optArb').value||0),
      buyout: Number(modal.querySelector('#optBuyout').value||0),
    };
    const r = tryNegotiate(p, team, offer);
    alert(r.ok ? '簽約成功！' : r.reason);
    save(); render(); modal.remove();
  };
}

function drawTeams(m){
  // 聯盟分頁
  const tabs = Object.keys(leagues).map(k=>`<button class="tab" data-lk="${k}">${k}</button>`).join('');
  m.innerHTML = `<div class="card"><div class="chips">${tabs}</div><div id="teamTable"></div></div>`;
  const bar = m.querySelector('.chips');
  const target = m.querySelector('#teamTable');
  function draw(lk){
    const ts = teams.filter(t=>t.leagueKey===lk);
    const rows = ts.sort((a,b)=> (b.wins/(b.wins+b.losses+0.01)) - (a.wins/(a.wins+a.losses+0.01)) )
      .map(t=>`<tr><td>${t.name}</td><td>${t.wins}-${t.losses}</td><td>${(t.wins/(t.wins+t.losses+0.01)).toFixed(3)}</td></tr>`).join('');
    target.innerHTML = `<table class="table"><thead><tr><th>球隊</th><th>戰績</th><th>勝率</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  bar.addEventListener('click', e=>{
    const b = e.target.closest('.tab'); if(!b) return;
    draw(b.dataset.lk);
  });
  const first = Object.keys(leagues)[0]; draw(first);
}

function drawSeason(m){
  m.innerHTML = `
    <div class="grid">
      <div class="g-col-12 card">
        <h3>逐週賽程（當前週 ${now.week}）</h3>
        <div id="sched"></div>
      </div>
      <div class="g-col-12 card">
        <h3>季後賽</h3>
        <div id="bracket">例行賽第 46 週產生對戰</div>
      </div>
      <div class="g-col-12 card">
        <h3>新聞</h3>
        <div id="newsList">${news.map(n=>n.html).join('')}</div>
      </div>
    </div>`;
  // 當週簡易賽程（重算一次示意）
  const sc = Object.keys(leagues).flatMap(lk=> scheduleWeekGames(lk).map(([a,b])=>`${lk}: ${a.name} vs ${b.name}`));
  m.querySelector('#sched').innerHTML = sc.map(s=>`<div>${s}</div>`).join('');
  // 季後賽示意（用 MLB_NL 做例）
  const lk = 'MLB_NL';
  const ts = teams.filter(t=>t.leagueKey===lk);
  const st = ts.map(t=>({team:t, win:t.wins, loss:t.losses, pct: t.wins/(t.wins+t.losses+0.01)}));
  const bk = makeBracket(st);
  if(ts.length){
    m.querySelector('#bracket').innerHTML = `
      <div class="chips">
        <div>準決 1：${bk.semi1[0].team.name} vs ${bk.semi1[1].team.name}</div>
        <div>準決 2：${bk.semi2[0].team.name} vs ${bk.semi2[1].team.name}</div>
        <div class="badge">冠軍將於第 46 週產生</div>
      </div>`;
  }
}

function drawSettings(m){
  m.innerHTML = `
    <div class="card">
      <h3>設定</h3>
      <div class="chips"><button class="btn" id="resetBtn">清除存檔</button></div>
      <p>若你使用 Heroku，請確認 <code>&lt;script src="/js/scheduler.js" defer&gt;</code> 並避免載入不存在的舊檔。</p>
    </div>`;
  m.querySelector('#resetBtn').onclick = ()=>{ localStorage.removeItem(storeKey); location.reload(); };
}

// ---------- Bootstrap ----------
async function boot(){
  // 注入樣式（避免你未引 style.delta.css）
  if(!document.querySelector('link[data-bam-delta]')){
    const l = document.createElement('link');
    l.rel='stylesheet'; l.href='/css/style.delta.css'; l.setAttribute('data-bam-delta','1');
    document.head.appendChild(l);
  }
  ensureContainers(); ensureBottomNav();

  // 資料
  [leagues, namesZH, namesEN] = await Promise.all([
    loadJSON('/data/leagues.json'),
    loadJSON('/data/names_zh.json'),
    loadJSON('/data/names_en.json')
  ]);

  if(!load()){
    teams = flattenTeams();
    players = Array.from({length:8}, ()=>makePlayer());
    save();
  }

  render();
}

function render(){ showTab(document.querySelector('.btm-nav .tab.active')?.dataset.tab || '主頁'); }

document.addEventListener('DOMContentLoaded', boot);
