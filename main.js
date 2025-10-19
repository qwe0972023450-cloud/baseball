
/* Core game */
const STATE = {
  year: 2034,
  week: 1,
  cash: 10_000_000,
  rep: 200,
  clients: [], // players under contract with agent
  freePlayers: [], // free market
  staff: { scout: 1, biz: 1, coach: 1 },
  academy: { level: 1, slots: 2, sources: {HS: true, College: true, Overseas: true} },
  news: [],
  teams: [],   // [{leagueKey, name, roster:[], rating, stats, champYears:[] }]
  champions: {}, // {year:{leagueKey:teamName}}
};

/** Utilities */
const fmtMoney = n => "$" + Math.round(n).toLocaleString();
const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
const rand = (a,b)=>a+Math.random()*(b-a);
const choice = arr => arr[Math.floor(Math.random()*arr.length)];
const sum = arr => arr.reduce((a,b)=>a+b,0);

/* Player factory */
function createPlayer(seed={}){
  const POS = ["投手","捕手","一壘","二壘","三壘","游擊","左外","中外","右外","DH"];
  const bats = choice(["右打","左打","雙打"]);
  const throws = choice(["右投","左投"]);
  const pos = choice(POS);
  const ovr = Math.round(rand(40,95)); // base ability
  const batting = {
    vsR: Math.round(rand(30,95)),
    vsL: Math.round(rand(30,95)),
    clutch: Math.round(rand(30,95)),
    power: Math.round(rand(30,95)),
    eye: Math.round(rand(30,95)),
    tough: Math.round(rand(30,95)),
  };
  const pitching = {
    fb: Math.round(rand(20,95)),
    sinker: Math.round(rand(10,90)),
    slider: Math.round(rand(10,90)),
    curve: Math.round(rand(10,90)),
    change: Math.round(rand(10,90)),
    control: Math.round(rand(20,95)),
  };
  const age = Math.round(rand(18,34));
  const salary = Math.round(rand(100_000,1_500_000));
  return {
    id: cryptoRandomId(),
    name: genName(),
    age, pos, bats, throws,
    batting, pitching,
    ovr,
    morale: 70,
    contract: {team:null, weeksLeft:52, weekly: Math.round(salary/52), agentCut: 0.10, endorsements:0},
    fame: Math.round(rand(20,200)),
  };
}

function cryptoRandomId(){ return Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,10); }
function genName(){
  const first = ["Shawn","Ken","Mike","Leo","Ricky","Jay","Aaron","Will","Kyle","Ryan","Ethan","Jae","Min","Hyun","Yuki","Kenta","Sho","Yu","Wei","Cheng","Yi","Hao","Jun","Kenji","Luis","Juan","Miguel","Jose"];
  const last = ["Hung","Chen","Lin","Wang","Li","Kim","Park","Lee","Choi","Suzuki","Sato","Tanaka","Yamamoto","Ohtani","Sasaki","Garcia","Rodriguez","Martinez","Hernandez","Brown","Smith","Jones"];
  return choice(first)+" "+choice(last);
}

/* Teams from LEAGUES */
function initTeams(){
  STATE.teams = LEAGUES.flatMap(l => l.teams.map(t => ({
    id: cryptoRandomId(),
    name: t,
    league: l.key,
    tier: l.tier,
    roster: [],
    rating: 50 + l.tier*10 + Math.round(rand(-5,5)),
    stats: {AVG:.250, OPS:.700, KBB:2.5, ERA:4.00, WHIP:1.35},
    wins:0,losses:0,
    champYears:[]
  })));
}

/* Difficulty model */
function signChance(player, team){
  const tier = team.tier;
  const baseline = {1:45, 2:52, 3:62, 4:72, 5:82}[tier] || 60;
  const repBoost = Math.log(1+STATE.rep)/5;
  const delta = player.ovr - baseline;
  const p = 1/(1+Math.exp(- (delta/6 + repBoost - (Math.random()*0.5)) ));
  return clamp(p,0.01,0.98);
}

/* Performance scaling */
function perfMultiplier(player, team){
  // center at OVR ~ baseline of tier
  const baseline = {1:45, 2:52, 3:62, 4:72, 5:82}[team.tier] || 60;
  const diff = player.ovr - baseline;
  // translate to 0.75..1.35
  return clamp(1 + diff/100, 0.70, 1.45);
}

/* Season sim */
function simulateSeason(){
  // reset team stats
  STATE.teams.forEach(t => {t.wins=0;t.losses=0;});
  // quick sim: each team strength = avg OVR top 12 players
  const leagueGroups = groupBy(STATE.teams, t => t.league);
  Object.entries(leagueGroups).forEach(([leagueKey,teams]) => {
    teams.forEach(t => {
      const top = t.roster.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,12);
      const strength = top.length? top.reduce((a,p)=>a+p.ovr*perfMultiplier(p,t),0)/top.length : 40+t.tier*8;
      t._strength = strength + rand(-2,2);
      // derive team stat lines
      t.stats.AVG = clamp(.200 + (t._strength-60)/400, .200, .320);
      t.stats.OPS = clamp(.600 + (t._strength-60)/200, .550, .900);
      t.stats.KBB = clamp(2 + (t._strength-60)/80, 1.2, 4.5);
      t.stats.ERA = clamp(4.5 - (t._strength-60)/40, 2.20, 6.50);
      t.stats.WHIP = clamp(1.40 - (t._strength-60)/200, 1.05, 1.60);
    });
    // round-robin approx
    for(let i=0;i<teams.length*18;i++){
      const a = choice(teams), b = choice(teams.filter(x=>x!==a));
      const pa = 1/(1+Math.exp(-(a._strength-b._strength)/3));
      if(Math.random()<pa) a.wins++, b.losses++; else b.wins++, a.losses++;
    }
    // champion
    const champ = teams.slice().sort((x,y)=>y.wins-x.wins)[0];
    champ.champYears.push(STATE.year);
    if(!STATE.champions[STATE.year]) STATE.champions[STATE.year]={};
    STATE.champions[STATE.year][leagueKey]=champ.name;
    pushNews(`🏆 ${getLeague(leagueKey).name} 本年度冠軍：<b>${champ.name}</b>`);
  });
}

function groupBy(arr,fn){
  return arr.reduce((acc,x)=>{const k=fn(x);(acc[k]=acc[k]||[]).push(x);return acc;},{});
}

function getLeague(key){ return LEAGUES.find(l=>l.key===key); }
function getTeamByName(name){ return STATE.teams.find(t=>t.name===name); }

/* Initial setup */
function init(){
  initTeams();
  // generate market
  for(let i=0;i<180;i++) STATE.freePlayers.push(createPlayer());
  // give starter clients
  for(let i=0;i<8;i++){ const p=createPlayer(); STATE.clients.push(p); }
  render();
}

function pushNews(html){ STATE.news.unshift({id:cryptoRandomId(), ts: Date.now(), html}); }

/* UI Renders */
const VIEWS = {
  home(){
    const kpis = `
      <div class="kpi">
        <div class="box"><div>現有客戶</div><h2>${STATE.clients.length}</h2><div class="note">已簽約的球員</div></div>
        <div class="box"><div>自由市場</div><h2>${STATE.freePlayers.length}</h2><div class="note">可嘗試簽下</div></div>
        <div class="box"><div>員工等級</div><h2>球探 ${STATE.staff.scout} / 商務 ${STATE.staff.biz} / 教練 ${STATE.staff.coach}</h2></div>
        <div class="box"><div>學院</div><h2>Lv.${STATE.academy.level}</h2><div class="note">來源：高中/大學/海外</div></div>
      </div>`;
    return `<section class="panel">
      <h1>總覽</h1>
      ${kpis}
      <div class="grid grid-2">
        <div class="panel"><h2>最新新聞</h2>${renderNews(5)}</div>
        <div class="panel"><h2>本年各聯盟冠軍</h2>${renderChampions(STATE.year)}</div>
      </div>
    </section>`;
  },

  clients(){
    const tabs = subTabs("clients",["清單","名單","陣容","輪值"]);
    let body = "";
    const view = getSubTab("clients");
    if(view==="清單"){
      body = renderClientList();
    }else if(view==="名單"){
      body = renderRosterBuilder();
    }else if(view==="陣容"){
      body = `<div class="note">（示意）依照球員打序與守位輸出；未來可與球隊簽約關聯。</div>`;
    }else{
      body = `<div class="note">（示意）投手先發與牛棚排序。</div>`;
    }
    return `<section class="panel">
      <h1>客戶</h1>${tabs}${body}
    </section>`;
  },

  teams(){
    const groups = groupBy(STATE.teams, t=>t.league);
    const html = Object.entries(groups).map(([league, arr])=>{
      const lg = getLeague(league);
      const rows = arr.map(t=>`
        <tr>
          <td>${t.name}</td>
          <td><span class="badge league-tier-${t.tier}">Tier ${t.tier}</span></td>
          <td>${lg.name}</td>
          <td>${t.wins}-${t.losses}</td>
          <td>${t.stats.AVG.toFixed(3)}</td>
          <td>${t.stats.OPS.toFixed(3)}</td>
          <td>${t.stats.KBB.toFixed(2)}</td>
          <td>${t.stats.ERA.toFixed(2)}</td>
          <td>${t.stats.WHIP.toFixed(3)}</td>
          <td><button class="btn" onclick="uiViewTeam('${t.id}')">詳細</button></td>
        </tr>`).join("");
      return `<div class="panel"><h2>${lg.name}</h2>
        <table><thead><tr><th>球隊</th><th>層級</th><th>聯盟</th><th>戰績</th><th>AVG</th><th>OPS</th><th>K/BB</th><th>ERA</th><th>WHIP</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
    }).join("");
    return `<section class="grid">${html}</section>`;
  },

  finance(){
    const tabs = subTabs("finance",["總覽","記錄","明細"]);
    let body="";
    const view=getSubTab("finance");
    if(view==="總覽") body = renderFinanceSummary();
    if(view==="記錄") body = renderFinanceRecords();
    if(view==="明細") body = renderLedger();
    return `<section class="panel"><h1>財務</h1>${tabs}${body}</section>`;
  },

  shop(){
    return `<section class="panel">
      <h1>商店</h1>
      ${renderShop()}
    </section>`;
  },

  staff(){
    return `<section class="panel"><h1>員工</h1>${renderStaff()}</section>`;
  },

  academy(){
    return `<section class="panel"><h1>學院 / 農場</h1>${renderAcademy()}</section>`;
  },

  season(){
    const rows = Object.entries(STATE.champions).sort((a,b)=>b[0]-a[0]).map(([y,obj])=>{
      const cells = LEAGUES.map(l=>`<td>${obj[l.key]||"-"}</td>`).join("");
      return `<tr><td>${y}</td>${cells}</tr>`;
    }).join("");
    return `<section class="panel">
      <h1>賽季概覽</h1>
      <table><thead><tr><th>年度</th>${LEAGUES.map(l=>`<th>${l.key}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
      <div class="note">每年結算會自動計算各聯盟冠軍。</div>
    </section>`;
  },

  news(){
    return `<section class="panel"><h1>新聞</h1>${renderNews()}</section>`;
  },

  settings(){
    return `<section class="panel"><h1>設定與存檔</h1>
      <div class="grid grid-2">
        <div class="panel">
          <h2>儲存/載入</h2>
          <button class="btn" onclick="saveGame()">儲存到本機</button>
          <button class="btn" onclick="loadGame()">載入本機存檔</button>
          <button class="btn danger" onclick="resetGame()">重置遊戲</button>
        </div>
        <div class="panel">
          <h2>偏好</h2>
          <label>每季週數 <input class="input" id="weeksPerSeason" type="number" value="52" min="10" max="60"/></label>
          <div class="note">目前用 52 週制。</div>
        </div>
      </div>
    </section>`;
  }
};

/* Sub tab cache */
const _subtab = {};
function subTabs(key, items){
  const active = _subtab[key] || items[0];
  return `<div class="subtabs">`+
    items.map(it=>`<button class="${it===active?'active':''}" onclick="setSubTab('${key}','${it}')">${it}</button>`).join("")+
  `</div>`;
}
function setSubTab(key, val){ _subtab[key]=val; render(); }
function getSubTab(key){ return _subtab[key]; }

/* Client list with Position + Bat/Pitch ability */
function renderClientList(){
  const rows = STATE.clients.map(p=>{
    const bat = Math.round((p.batting.vsR+p.batting.vsL+p.batting.power+p.batting.eye+p.batting.clutch)/5);
    const pit = Math.round((p.pitching.fb+p.pitching.slider+p.pitching.curve+p.pitching.change+p.pitching.control)/5);
    return `<tr>
      <td>${p.name}</td>
      <td>${p.pos} / ${p.bats}・${p.throws}</td>
      <td>${bat}</td><td>${pit}</td>
      <td>${p.ovr}</td>
      <td>${p.contract.team? p.contract.team : "-"}</td>
      <td>${fmtMoney(p.contract.weekly)}/週</td>
      <td>
        <button class="btn" onclick="uiOffer('${p.id}')">談判</button>
        <button class="btn" onclick="uiEndorse('${p.id}')">代言</button>
      </td>
    </tr>`;
  }).join("");
  return `<table><thead><tr><th>姓名</th><th>位置/投打</th><th>打擊</th><th>投球</th><th>OVR</th><th>球隊</th><th>週薪</th><th>操作</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="note">清單欄位已改成「位置＋投打能力」；同時顯示打擊/投球能力與 OVR。</div>`;
}

/* Offer & endorsements */
function uiOffer(pid){
  const p = STATE.clients.find(x=>x.id===pid);
  // pick a target team same tier or above for demo
  const target = choice(STATE.teams.filter(t=>!p.contract.team || t.name!==p.contract.team));
  const chance = signChance(p,target);
  const demand = Math.round(p.ovr*12_000 + target.tier*50_000);
  const html = `<div class="panel">
    <h2>與 ${target.name} 談判</h2>
    <p>預估機率：<b>${Math.round(chance*100)}%</b>（受聯盟層級、球員能力、你的知名度影響）</p>
    <label>開價每週薪資 <input id="offerWeekly" class="input" type="number" value="${demand}"/></label>
    <button class="btn ok" onclick="doOffer('${pid}','${target.id}')">送出報價</button>
  </div>`;
  showModal(html);
}
function doOffer(pid, tid){
  const p = STATE.clients.find(x=>x.id===pid);
  const t = STATE.teams.find(x=>x.id===tid);
  const weekly = Number(document.getElementById("offerWeekly").value||0);
  const prob = signChance(p,t) * clamp((weekly)/(p.ovr*12_000 + t.tier*50_000), 0.6, 1.5);
  if(Math.random() < prob){
    // success
    p.contract.team = t.name;
    p.contract.weekly = weekly;
    // roster move
    t.roster.push(p);
    // finances: salary paid by team, agent gets commission from salary and transfers/endorsements
    const salaryCut = weekly * 0.10; // 10% 提成（薪資/代言）
    STATE.cash += salaryCut;
    pushNews(`🖊️ ${p.name} 與 <b>${t.name}</b> 簽下合約（週薪 ${fmtMoney(weekly)}）。你獲得代理提成 ${fmtMoney(salaryCut)}。`);
  }else{
    pushNews(`❌ ${t.name} 拒絕 ${p.name} 的條件，建議提高週薪或尋找中低層級球隊。`);
  }
  hideModal(); render();
}

function uiEndorse(pid){
  const p = STATE.clients.find(x=>x.id===pid);
  const fee = Math.round(p.ovr * (50_000 + Math.random()*50_000) * (1+STATE.staff.biz*0.05));
  const cut = Math.round(fee*0.20);
  STATE.cash += cut;
  STATE.rep += Math.round(3 + p.ovr/40);
  pushNews(`📣 為 ${p.name} 接到代言案，酬勞 ${fmtMoney(fee)}（你的抽成 ${fmtMoney(cut)}）。`);
  render();
}

/* Roster builder (assign clients to target teams by probability) */
function renderRosterBuilder(){
  const rows = STATE.clients.map(p=>{
    return `<div class="card">
      <b>${p.name}</b> · OVR ${p.ovr} · ${p.pos}・${p.bats}/${p.throws}<br/>
      <div class="progress"><span style="width:${p.ovr}%"></span></div>
      <div style="margin-top:8px">
        <select id="sel-${p.id}" class="input">`+STATE.teams.map(t=>`<option value="${t.id}">${t.name}（Tier${t.tier}）</option>`).join("")+`</select>
        <button class="btn" onclick="tryAssign('${p.id}')">嘗試簽入</button>
      </div>
    </div>`;
  }).join("");
  return `<div class="cards">${rows}</div>`;
}
function tryAssign(pid){
  const p = STATE.clients.find(x=>x.id===pid);
  const sel = document.getElementById("sel-"+pid);
  const t = STATE.teams.find(x=>x.id===sel.value);
  const ch = signChance(p,t);
  if(Math.random()<ch){
    p.contract.team = t.name;
    t.roster.push(p);
    pushNews(`✅ ${p.name} 成功加入 ${t.name}（Tier ${t.tier})。`);
  }else{
    pushNews(`🧩 ${t.name} 評估 ${p.name} 尚未達到需求，建議提高能力或從較低層級起步。`);
  }
  render();
}

/* Finance */
function renderFinanceSummary(){
  const income = calcIncome();
  const spend = calcSpend();
  const net = income.total - spend.total;
  return `<div class="grid grid-3">
    <div class="panel">
      <h2>收入</h2>
      <table><tbody>
        <tr><td>薪資提成</td><td>${fmtMoney(income.salary)}</td></tr>
        <tr><td>交易抽成</td><td>${fmtMoney(income.transfer)}</td></tr>
        <tr><td>代言/贊助</td><td>${fmtMoney(income.endorse)}</td></tr>
        <tr><th>合計</th><th>${fmtMoney(income.total)}</th></tr>
      </tbody></table>
    </div>
    <div class="panel">
      <h2>支出</h2>
      <table><tbody>
        <tr><td>員工薪資</td><td>${fmtMoney(spend.staff)}</td></tr>
        <tr><td>建築/運營</td><td>${fmtMoney(spend.ops)}</td></tr>
        <tr><td>個人/商店</td><td>${fmtMoney(spend.shop)}</td></tr>
        <tr><th>合計</th><th>${fmtMoney(spend.total)}</th></tr>
      </tbody></table>
    </div>
    <div class="panel">
      <h2>結存</h2>
      <div style="font-size:28px;font-weight:800;color:${net>=0?'#7dd957':'#ff6b6b'}">${fmtMoney(net)}</div>
      <div class="note">佣金模型同時包含：薪資/代言提成 + 交易抽成。</div>
    </div>
  </div>`;
}

const LEDGER = []; // push {ts, type, amt, note}
function addLedger(type, amt, note){ LEDGER.push({ts: Date.now(), type, amt, note}); }
function renderFinanceRecords(){
  const rows = Object.entries(STATE.champions).slice(-8).map(([y,obj])=>{
    const list = Object.entries(obj).map(([lg,tm])=>`${lg}: ${tm}`).join(" · ");
    return `<tr><td>${y}</td><td>${list}</td></tr>`;
  }).join("");
  return `<div class="panel"><h2>年度冠軍紀錄</h2>
    <table><thead><tr><th>年度</th><th>各聯盟冠軍</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function renderLedger(){
  const rows = LEDGER.slice(-200).reverse().map(x=>`<tr><td>${new Date(x.ts).toLocaleString()}</td><td>${x.type}</td><td>${fmtMoney(x.amt)}</td><td>${x.note||""}</td></tr>`).join("");
  return `<table><thead><tr><th>時間</th><th>類別</th><th>金額</th><th>說明</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function calcIncome(){
  const salary = STATE.clients.filter(p=>p.contract.team).reduce((a,p)=>a+p.contract.weekly*0.10,0);
  const transfer = LEDGER.filter(x=>x.type==='交易抽成').reduce((a,x)=>a+x.amt,0)/52;
  const endorse = LEDGER.filter(x=>x.type==='代言抽成').reduce((a,x)=>a+x.amt,0)/52;
  return {salary, transfer, endorse, total: salary+transfer+endorse};
}
function calcSpend(){
  const staff = (STATE.staff.scout+STATE.staff.biz+STATE.staff.coach)*2_000;
  const ops = STATE.academy.level*1_000;
  const shop = 0;
  return {staff, ops, shop, total: staff+ops+shop};
}

/* Shop (3 tabs) */
function renderShop(){
  return `<div class="subtabs">
    <button class="active">商品</button><button>交通工具</button><button>業務</button>
  </div>
  <div class="grid grid-3">
    ${shopItem("遊戲機",1500,"微幅提升士氣/知名度")}
    ${shopItem("名牌服裝",10000,"提高商務談判成效 +1%")}
    ${shopItem("撞球桌",8000,"小幅放鬆，提升士氣")}
    ${shopItem("酒窖",30000,"每季舉辦酒會提升人脈")}
    ${shopItem("套房",120000,"固定提高知名度，偶爾觸發新聞")}
    ${shopItem("古董筆",25000,"提高簽字儀式格調（+粉）")}
    ${shopItem("公寓",240000,"每週房租收入 1,500")}
    ${shopItem("賽馬",500000,"小機率帶來額外獎金")}
  </div>`;
}
function shopItem(name, price, desc){
  return `<div class="card">
    <h3>${name}</h3>
    <div class="note">${desc}</div>
    <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
      <b>${fmtMoney(price)}</b>
      <button class="btn" onclick="buy('${name}',${price})">購買</button>
    </div>
  </div>`;
}
function buy(name, price){
  if(STATE.cash<price){ alert("資金不足"); return;}
  STATE.cash-=price;
  addLedger("商店支出",-price, name);
  pushNews(`🛒 購買 ${name} 花費 ${fmtMoney(price)}。`);
  if(name==="公寓"){ addLedger("被動收入",1500,"公寓房租"); }
  render();
}

/* Staff */
function renderStaff(){
  const row = (k, label)=>`<tr><td>${label}</td><td>Lv.${STATE.staff[k]}</td><td><button class="btn" onclick="lvl('${k}')">升級</button></td></tr>`;
  return `<table><tbody>
    ${row('scout','球探')} ${row('biz','商務')} ${row('coach','教練')}
  </tbody></table>`;
}
function lvl(k){
  const cost = 20_000 * (STATE.staff[k]+1);
  if(STATE.cash<cost){ alert("資金不足"); return;}
  STATE.cash-=cost; STATE.staff[k]++;
  addLedger("員工薪資",-cost,"升級 "+k);
  render();
}

/* Academy with sources HS/College/Overseas */
function renderAcademy(){
  const s = STATE.academy.sources;
  return `<div class="grid grid-2">
    <div class="panel">
      <h2>等級與名額</h2>
      <div>等級：Lv.${STATE.academy.level}（營運 ${fmtMoney(STATE.academy.level*1000)}/週）</div>
      <div>每年畢業：${STATE.academy.level+1} 名</div>
      <button class="btn" onclick="STATE.academy.level++; render()">升級</button>
    </div>
    <div class="panel">
      <h2>來源</h2>
      <label><input type="checkbox" ${s.HS?'checked':''} onchange="toggleSrc('HS',this.checked)"/> 高中</label><br/>
      <label><input type="checkbox" ${s.College?'checked':''} onchange="toggleSrc('College',this.checked)"/> 大學</label><br/>
      <label><input type="checkbox" ${s.Overseas?'checked':''} onchange="toggleSrc('Overseas',this.checked)"/> 海外</label>
      <div class="note">來源會影響潛力分佈：高中波動大；大學較穩定；海外看地區與球探等級。</div>
    </div>
  </div>`;
}
function toggleSrc(k,on){ STATE.academy.sources[k]=on; render(); }

/* News */
function renderNews(limit=null){
  const list = (limit?STATE.news.slice(0,limit):STATE.news).map(n=>`<div class="card"><div class="note">${new Date(n.ts).toLocaleString()}</div><div>${n.html}</div></div>`).join("");
  return `<div class="cards">${list||'<div class="note">尚無新聞</div>'}</div>`;
}
function renderChampions(y){
  const obj = STATE.champions[y]||{};
  const rows = LEAGUES.map(l=>`<tr><td>${l.name}</td><td>${obj[l.key]||"-"}</td></tr>`).join("");
  return `<table><thead><tr><th>聯盟</th><th>冠軍</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* View team modal */
function uiViewTeam(id){
  const t = STATE.teams.find(x=>x.id===id);
  const rows = t.roster.map(p=>`<tr><td>${p.name}</td><td>${p.pos}</td><td>${p.ovr}</td></tr>`).join("");
  const html = `<div class="panel">
    <h2>${t.name} · ${getLeague(t.league).name}</h2>
    <div>戰績 ${t.wins}-${t.losses} | AVG ${t.stats.AVG.toFixed(3)} | OPS ${t.stats.OPS.toFixed(3)} | ERA ${t.stats.ERA.toFixed(2)}</div>
    <h3>名單</h3>
    <table><thead><tr><th>球員</th><th>位置</th><th>OVR</th></tr></thead><tbody>${rows}</tbody></table>
  </div>`;
  showModal(html);
}

/* Weekly tick */
let WEEKS_PER_SEASON = 52;
function nextWeek(){
  // weekly income/expenses
  const inc = calcIncome(); const spend = calcSpend();
  const net = inc.total - spend.total;
  STATE.cash += net;
  addLedger("週結算", net, "佣金與支出自動結算");
  // random endorse chance
  if(Math.random()<0.35 && STATE.clients.length){
    uiEndorse(choice(STATE.clients).id);
  }
  // progress
  STATE.week++;
  if(STATE.week>WEEKS_PER_SEASON){
    // end-season
    STATE.week=1; STATE.year++;
    simulateSeason();
    // academy graduates
    const cnt = STATE.academy.level+1;
    for(let i=0;i<cnt;i++){
      const src = choice(Object.entries(STATE.academy.sources).filter(x=>x[1]).map(x=>x[0])) || "HS";
      const grad = createPlayerBySource(src);
      STATE.freePlayers.push(grad);
      pushNews(`🎓 ${src} 畢業生 ${grad.name} 進入市場（OVR ${grad.ovr}）。`);
    }
  }
  render();
}

function createPlayerBySource(src){
  let o = {HS:[35,95], College:[45,88], Overseas:[40,92]}[src] || [40,90];
  const p = createPlayer();
  p.ovr = Math.round(rand(o[0],o[1]));
  return p;
}

/* Modal */
let _modal=null;
function showModal(html){
  hideModal();
  _modal = document.createElement('div');
  _modal.className="modal";
  _modal.innerHTML = `<div class="modal-bg" onclick="hideModal()"></div><div class="modal-card">${html}</div>`;
  document.body.appendChild(_modal);
}
function hideModal(){ if(_modal){_modal.remove(); _modal=null;} }
const modalCSS = document.createElement('style');
modalCSS.textContent = `.modal{position:fixed;inset:0;display:grid;place-items:center;z-index:40}
.modal-bg{position:absolute;inset:0;background:rgba(0,0,0,.5)}
.modal-card{position:relative;max-width:860px;width:92%;max-height:85vh;overflow:auto;background:#0f1832;border:1px solid #345;box-shadow:0 20px 60px rgba(0,0,0,.5);border-radius:14px;padding:16px}`;
document.head.appendChild(modalCSS);

/* Save/Load */
function saveGame(){
  localStorage.setItem("BAM_SAVE", JSON.stringify(STATE));
  alert("已儲存");
}
function loadGame(){
  const raw = localStorage.getItem("BAM_SAVE");
  if(!raw) return alert("沒有存檔");
  Object.assign(STATE, JSON.parse(raw));
  render();
}
function resetGame(){
  if(!confirm("確定要重置？")) return;
  location.reload();
}

/* Render root */
function render(){
  document.getElementById("meta-year").textContent = STATE.year+" 年";
  document.getElementById("meta-week").textContent = "第 "+STATE.week+" 週";
  document.getElementById("meta-rep").textContent = STATE.rep;
  document.getElementById("meta-cash").textContent = fmtMoney(STATE.cash);
  const container = document.getElementById("view-container");
  const active = document.querySelector(".nav-btn.active")?.dataset.view || "home";
  container.innerHTML = VIEWS[active]();
}
document.addEventListener("click",(e)=>{
  const btn = e.target.closest(".nav-btn");
  if(btn){
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    render();
  }
});
document.getElementById("btn-next").addEventListener("click", nextWeek);

/* Boot */
init();
simulateSeason(); // prepopulate first champs
render();
