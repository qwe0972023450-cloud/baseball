
(function(){
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------------- State ----------------
  const state = {
    money: 3_000_000,
    week: 1,
    season: 2129,
    rep: 120,
    office: { level: 3 },
    academy: { level: 2 },
    employees: { scout: 1, negotiator: 1, trainer: 1 },
    clients: [],
    prospects: [],
    aiAgencies: [],
    finance: [],
    news: [],
    purchases: [],
    achievements: {},
    teams: [],
  };

  // ---------------- Helpers ----------------
  const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const choice = arr => arr[rand(0, arr.length-1)];
  const chance = p => Math.random()<p;
  const moneyFmt = n => "$"+Math.round(n).toLocaleString();
  const weeksPerSeason = 52;

  const positions = ["投手(P)","捕手(C)","一壘(1B)","二壘(2B)","三壘(3B)","游擊(SS)","左外(LF)","中外(CF)","右外(RF)"];
  const surnames = "陳林黃張李王吳劉蔡楊許鄭謝洪郭邱曾廖賴周徐蘇葉莊".split("");
  const names = "志豪柏廷俊傑承恩凱翔冠宇哲瑋家豪家銘柏宇宇軒宥勝峻豪廷恩冠廷".split("");

  function pickName(){ return choice(surnames)+choice(names); }
  function createTeam(i){
    const city = ["台北","台中","高雄","台南","新北","桃園","新竹","花蓮","嘉義","宜蘭","台東","屏東"][i%12];
    const animal = ["獅","鷹","熊","龍","鯨","雷","豹","虎","鯊","狼"][i%10];
    return { id:i, name: city + animal, league:(i%2?"AL":"NL"), stats: {
      AVG:(0.220+Math.random()*0.1).toFixed(3),
      OPS:(0.650+Math.random()*0.2).toFixed(3),
      KBB: rand(150,950),
      ERA:(2.80+Math.random()*3).toFixed(3),
      WHIP:(1.10+Math.random()*0.6).toFixed(3),
    }};
  }

  function baseSkill(){
    // hitting
    const hitR = rand(40,80);
    const hitL = rand(40,80);
    const clutch = rand(40,80);
    const power = rand(40,80);
    const vision = rand(40,80);
    const grit = rand(40,80);
    // pitching
    const pFF = rand(10,80);
    const pSI = rand(10,70);
    const pSL = rand(10,70);
    const pCU = rand(5,60);
    const pCH = rand(5,60);
    return { hitR, hitL, clutch, power, vision, grit, pFF, pSI, pSL, pCU, pCH };
  }

  function calcOVR(s){
    const bat = (s.hitR + s.hitL + s.clutch + s.power + s.vision + s.grit) / 6;
    const pit = (s.pFF + s.pSI + s.pSL + s.pCU + s.pCH) / 5;
    return Math.round( (bat*0.6 + pit*0.4) );
  }

  function createPlayer(id){
    const age = rand(18,34);
    const pos = choice(positions);
    const club = choice(state.teams).name;
    const s = baseSkill();
    const ovr = calcOVR(s);
    const salary = Math.floor(800 + ovr*25 + rand(0, 600)) * 100; // per week
    const contractYears = rand(2,4);
    return {
      id, name: pickName(), position: pos, age,
      club, status: "健康",
      skills: s, ovr,
      salaryPerWeek: salary,
      contractEndWeek: state.season*weeksPerSeason + contractYears*weeksPerSeason,
      value: Math.floor(ovr*75_000 + rand(100_000, 2_000_000)),
      potential: Math.min(99, ovr + rand(1,15)),
      history: []
    };
  }

  function officeCap(level){ return 10 + level*5; }
  function officeCost(level){ return level*120_000; }
  function academyCost(level){ return level*40_000; }
  function academyGrads(level){ return 1 + Math.floor(level*0.8 + 1); }

  function addFinance(kind, delta, meta={}){
    state.finance.unshift({ ts: `${state.season}W${state.week.toString().padStart(2,"0")}`, kind, delta, meta});
    state.money += delta;
    renderTop(); renderFinance();
  }

  function pushNews(title, body){
    state.news.unshift({ id: Date.now()+""+Math.random(), title, body, ts:`${state.season}:${state.week}` });
    renderNews();
  }

  function save(){ localStorage.setItem("bb_agent_save_v02", JSON.stringify(state)); alert("已儲存"); }
  function load(){
    const s = localStorage.getItem("bb_agent_save_v02");
    if(!s){ alert("沒有存檔"); return; }
    Object.assign(state, JSON.parse(s));
    renderAll();
    alert("已載入");
  }

  function newGame(){
    state.money = 3_000_000;
    state.week = 1; state.season = 2129; state.rep = 120;
    state.office = { level: 3 };
    state.academy = { level: 2 };
    state.employees = { scout: 1, negotiator: 1, trainer: 1 };
    state.teams = Array.from({length:20}, (_,i)=>createTeam(i));
    state.clients = Array.from({length: 16}, (_,i)=>createPlayer(i));
    state.prospects = [];
    state.aiAgencies = Array.from({length:19}, (_,i)=>({ name: i===0?"Zahavi管理":"Agency "+(i+1), revenue: rand(500_000, 12_000_000)}));
    state.finance = [];
    state.news = [];
    state.purchases = [];
    state.achievements = {};
    addFinance("初始資金", 3_000_000);
    pushNews("夏季轉會窗口已打開", "提醒：球季結束，交易/自由球員窗口開啟。");
    renderAll();
  }

  // ---------------- Shop ----------------
  const SHOP = {
    goods: [
      { id:"console", name:"遊戲機", price: 5000, rep:5, desc:"紓壓小物，提升心情與少量知名度。" },
      { id:"laptop", name:"筆記型電腦", price: 15000, rep:4, desc:"提升文件處理效率（談判成功率+1%）。" },
      { id:"fashion", name:"名牌服裝", price: 40000, rep:15, desc:"門面要有，見客更有自信。" },
      { id:"billiard", name:"撞球桌", price: 30000, rep:8, desc:"社交場合加分，客戶關係+1。" },
      { id:"wine", name:"酒窖", price: 120000, rep:18, desc:"高端招待，贊助合作小幅提升。" },
      { id:"suite", name:"套房", price: 250000, rep:25, desc:"穩定的基地，知名度+25。" },
      { id:"pen", name:"古董筆", price: 8000, rep:2, desc:"簽約儀式更講究。"},
      { id:"condo", name:"公寓", price: 600000, rep:35, desc:"資產增長（每週租金收入）。"},
      { id:"horse", name:"賽馬", price: 900000, rep:40, desc:"豪奢象徵，偶爾帶來獎金。"},
    ],
    transport: [
      { id:"car", name:"跑車", price: 200000, rep:20, desc:"更快拜訪客戶，談判+1%。" },
      { id:"suv", name:"SUV", price: 120000, rep:12, desc:"載具寬敞，球探出差方便。" },
      { id:"jet", name:"私人小噴", price: 5_000_000, rep:80, desc:"跨洲洽談沒在怕（贊助更願意談）。" }
    ],
    biz: [
      { id:"agencyBrand", name:"品牌公關套餐", price: 180000, rep:30, desc:"知名度快速提升，新聞報導更常見。" },
      { id:"analytics", name:"數據分析系統", price: 220000, rep:10, desc:"球員估值更準確（溢價+5%）。" },
      { id:"academyLv", name:"學院擴編基金", price: 150000, rep:0, effect:"academy+1", desc:"直接提升學院等級+1。" },
    ]
  };

  function isOwned(id){ return state.purchases.includes(id); }
  function buyItem(it){
    if(isOwned(it.id)) return;
    if(state.money < it.price){ alert("資金不足"); return; }
    state.purchases.push(it.id);
    addFinance("個人用品購買 - "+it.name, -it.price);
    state.rep += it.rep || 0;
    if(it.effect==="academy+1"){ state.academy.level++; }
    renderShop(); renderTop();
  }

  // ---------------- Rendering Top/Main ----------------
  function renderTop(){
    $("#money").textContent = moneyFmt(state.money);
    $("#seasonWeek").textContent = `${state.season}: 第 ${state.week} 週`;
    $("#rep").textContent = state.rep;
  }
  function renderMain(){
    $("#officeLevel").textContent = `Lv.${state.office.level}`;
    $("#clientsCount").textContent = `${state.clients.length} / ${officeCap(state.office.level)}`;
    $("#staffSummary").textContent = `球探${state.employees.scout} 商務${state.employees.negotiator} 教練${state.employees.trainer}`;
    $("#academyLevel").textContent = `Lv.${state.academy.level}`;
    $("#shopHint").textContent = `${state.purchases.length} 已購`;
  }

  // ---------------- Office/Academy ----------------
  function renderOffice(){
    $("#officeLvl").textContent = "Lv."+state.office.level;
    $("#officeCap").textContent = officeCap(state.office.level);
    $("#officeCost").textContent = moneyFmt(officeCost(state.office.level));
    $("#officeUpCost").textContent = moneyFmt(250000 * state.office.level);
  }
  function renderAcademy(){
    $("#academyLvl").textContent = "Lv."+state.academy.level;
    $("#academyGrad").textContent = academyGrads(state.academy.level);
    $("#academyCost").textContent = moneyFmt(academyCost(state.academy.level));
    $("#academyUpCost").textContent = moneyFmt(120000 * state.academy.level);
    const ul = $("#prospects");
    ul.innerHTML = "";
    state.prospects.forEach(p=>{
      const li = document.createElement("li");
      li.textContent = `${p.name} ${p.position} OVR${p.ovr} 年齡${p.age}`;
      const b = document.createElement("button");
      b.textContent = "簽下";
      b.onclick = ()=>{
        if(state.clients.length >= officeCap(state.office.level)){ alert("超出客戶容量，請升級辦公室。"); return; }
        state.clients.push(p);
        addFinance("簽下新秀簽約費", -50_000);
        unlock("簽下第一名新秀");
        state.prospects = state.prospects.filter(x=>x.id!==p.id);
        renderAcademy(); renderClients();
      };
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  // ---------------- Clients ----------------
  function renderClients(){
    const tbody = $("#clientsTable tbody");
    tbody.innerHTML = "";
    state.clients.forEach(p=>{
      const yrs = Math.floor((p.contractEndWeek - (state.season*weeksPerSeason+state.week))/weeksPerSeason);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><b>${p.name}</b><br/><small>${p.club}</small></td>
        <td>${p.position}</td><td>${p.ovr}</td><td>${p.age}</td>
        <td>${p.potential}</td>
        <td>${moneyFmt(p.salaryPerWeek)}</td><td>${yrs} 年</td>
        <td><button class="mini">詳情</button></td>`;
      tr.querySelector("button").onclick = ()=>openPlayer(p);
      tbody.appendChild(tr);
    });
  }

  function skillBlock(p){
    const s = p.skills;
    return `
      <div class="h-scroll">
        <div class="card"><b>對右投打擊</b> Lv.${s.hitR}</div>
        <div class="card"><b>對左投打擊</b> Lv.${s.hitL}</div>
        <div class="card"><b>關鍵能力</b> Lv.${s.clutch}</div>
        <div class="card"><b>爆擊</b> Lv.${s.power}</div>
        <div class="card"><b>視野</b> Lv.${s.vision}</div>
        <div class="card"><b>堅韌</b> Lv.${s.grit}</div>
      </div>
      <div class="h-scroll">
        <div class="card"><b>四縫線速球</b> Lv.${s.pFF}</div>
        <div class="card"><b>二縫線速球</b> Lv.${s.pSI}</div>
        <div class="card"><b>滑球</b> Lv.${s.pSL}</div>
        <div class="card"><b>曲球</b> Lv.${s.pCU}</div>
        <div class="card"><b>變速球</b> Lv.${s.pCH}</div>
      </div>
    `;
  }

  function drawOVR(p){
    const c = $("#pOVR"); const ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    const center = {x:c.width/2,y:c.height/2};
    const metrics = [
      ["hitR", p.skills.hitR],["hitL", p.skills.hitL],["clutch", p.skills.clutch],
      ["power", p.skills.power],["vision", p.skills.vision],["grit", p.skills.grit],
      ["pFF", p.skills.pFF],["pSI", p.skills.pSI],["pSL", p.skills.pSL],
      ["pCU", p.skills.pCU],["pCH", p.skills.pCH],
    ];
    const max = 100;
    const r0 = 30, rMax = 110;
    // base ring
    ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.globalAlpha=0.3;
    ctx.beginPath(); ctx.arc(center.x,center.y,rMax,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
    // segments
    metrics.forEach((m,i)=>{
      const angle = (i/metrics.length)*Math.PI*2 - Math.PI/2;
      const r = r0 + (rMax-r0)*(m[1]/max);
      const x = center.x + r*Math.cos(angle);
      const y = center.y + r*Math.sin(angle);
      ctx.beginPath(); ctx.moveTo(center.x,center.y); ctx.lineTo(x,y); ctx.stroke();
    });
    // OVR text
    ctx.fillStyle="#fff"; ctx.font="bold 38px system-ui"; ctx.textAlign="center";
    ctx.fillText(p.ovr, center.x, center.y+14);
  }

  let currentPlayer = null;
  function openPlayer(p){
    currentPlayer = p;
    $("#pName").textContent = p.name;
    $("#pInfo").innerHTML = `年齡 ${p.age}｜位置 ${p.position}｜球會 ${p.club}<br>
      OVR <b>${p.ovr}</b>（潛力 ${p.potential}）｜薪資/週 ${moneyFmt(p.salaryPerWeek)}｜身價 ${moneyFmt(p.value)}`;
    $("#pSkills").innerHTML = skillBlock(p);
    drawOVR(p);
    show("player");
  }

  // ---------------- Negotiation / Trade ----------------
  let pendingOffer = null;
  function openNegotiation(p){
    pendingOffer = { player: p, target: choice(state.teams) };
    $("#negTitle").textContent = `對 ${p.name} 的競標`;
    $("#negBody").innerHTML = `
      <div>來自 <b>${pendingOffer.target.name}</b> 的報價意向。</div>
      <div>建議價：${moneyFmt(p.value*0.6)} ~ ${moneyFmt(p.value*1.2)}</div>
      <div>你的抽成：轉會費的 10%</div>
    `;
    const r = $("#offerRange");
    r.min = Math.floor(p.value*0.4); r.max = Math.floor(p.value*1.6); r.step = 50_000; r.value = Math.floor(p.value);
    $("#offerValText").textContent = moneyFmt(+r.value);
    show("negotiation");
  }

  function acceptOffer(){
    const fee = +$("#offerRange").value;
    const cut = Math.floor(fee*0.10);
    addFinance("轉會費佣金", cut, {fee});
    pushNews(`${pendingOffer.player.name} 完成轉隊`, `${pendingOffer.player.name} 轉投 ${pendingOffer.target.name}，轉會費 ${moneyFmt(fee)}，你的抽成 ${moneyFmt(cut)}。`);
    // move club & small morale boost
    pendingOffer.player.club = pendingOffer.target.name;
    pendingOffer.player.salaryPerWeek += Math.floor(fee/2000);
    unlock("完成首筆轉會");
    show("clients"); renderClients();
  }

  function counterOffer(){
    const fee = +$("#offerRange").value;
    if(chance(0.55 + state.employees.negotiator*0.03)){
      addFinance("轉會費佣金（反出價）", Math.floor(fee*0.12), {fee});
      pushNews("反出價成功", `你與 ${pendingOffer.target.name} 達成新價格 ${moneyFmt(fee)}。`);
      pendingOffer.player.club = pendingOffer.target.name;
    }else{
      pushNews("反出價失敗", `${pendingOffer.target.name} 不願接受你的要價。`);
    }
    show("clients"); renderClients();
  }

  // ---------------- Staff ----------------
  function renderStaff(){
    const staff = state.employees;
    const mk = (role,label)=>{
      const lv = staff[role];
      return `<div class="card"><b>${label}</b> Lv.${lv}　每週薪資 ${moneyFmt(lv*2600)}<button data-up="${role}">升級</button></div>`;
    };
    $("#staffList").innerHTML = mk("scout","球探") + mk("negotiator","商務經理") + mk("trainer","教練");
    $$("#staffList [data-up]").forEach(b=> b.onclick = ()=>{
      const role = b.dataset.up; const lv = state.employees[role];
      const cost = 2000 * (lv+1) * 12;
      if(state.money<cost){ alert("資金不足"); return; }
      state.employees[role]++;
      addFinance(`提升${role}等級`, -cost);
      renderStaff(); renderMain();
    });
  }

  // ---------------- Shop Render ----------------
  let activeTab = "goods";
  function renderShop(){
    $$(".tab").forEach(t=> t.classList.toggle("active", t.dataset.tab===activeTab));
    const list = SHOP[activeTab];
    const host = $("#shopList"); host.innerHTML="";
    list.forEach(it=>{
      const li = document.createElement("div");
      li.className="shop-item";
      li.innerHTML = `<img src="https://picsum.photos/seed/${it.id}/140/100" alt="">
        <div><div><b>${it.name}</b>${isOwned(it.id) ? '<span class="badge">已擁有</span>': ''}</div>
        <small>${it.desc}</small><div>價格：${moneyFmt(it.price)}</div></div>
        <div class="buy"><button ${isOwned(it.id)?'disabled':''}>購買</button></div>`;
      li.querySelector("button").onclick = ()=> buyItem(it);
      host.appendChild(li);
    });
  }

  // ---------------- Ranking ----------------
  function renderRanking(){
    const meRevenue = state.finance.filter(x=>x.delta>0).reduce((a, x)=>a+x.delta, 0);
    const rows = [{name:"雲頂國際運動行銷", revenue: meRevenue}].concat(state.aiAgencies);
    rows.sort((a,b)=>b.revenue-a.revenue);
    const tbody = $("#rankTable tbody"); tbody.innerHTML="";
    rows.forEach((r,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${i+1}</td><td>${r.name}</td><td>${moneyFmt(r.revenue)}</td>`;
      tbody.appendChild(tr);
    });
  }

  // ---------------- Finance ----------------
  function financeTotals(){
    const Y = state.season;
    const yearly = state.finance.filter(f=>f.ts.startsWith(Y+"W"));
    const sum = (kindFilter, sign=0)=> yearly.filter(f=> (sign===0 || (sign>0? f.delta>0:f.delta<0)) && (!kindFilter || f.kind.includes(kindFilter))).reduce((a,f)=>a+f.delta,0);
    return {
      salary: sum("合約"),
      transfer: sum("轉會"),
      sponsor: sum("贊助"),
      business: sum("代言") + sum("商業") + sum("房租") + sum("獎金"),
      staff: sum("員工",-1),
      building: sum("營運",-1) + sum("辦公室",-1) + sum("學院",-1),
      personal: sum("個人",-1),
      other: sum("",0) - (sum("合約")+sum("轉會")+sum("贊助")+sum("代言")+sum("商業")+sum("房租")+sum("獎金")+sum("員工",-1)+sum("營運",-1)+sum("辦公室",-1)+sum("學院",-1)+sum("個人",-1)),
      totalIncome: yearly.filter(f=>f.delta>0).reduce((a,f)=>a+f.delta,0),
      totalExpense: yearly.filter(f=>f.delta<0).reduce((a,f)=>a+f.delta,0),
    };
  }
  function renderFinance(){
    const t = financeTotals();
    $("#financeTotals").innerHTML = `
      <h3>現年總數</h3>
      <div>收入 — 薪資佣金：${moneyFmt(t.salary)}　轉會費佣金：${moneyFmt(t.transfer)}　贊助費佣金：${moneyFmt(t.sponsor)}　業務收入：${moneyFmt(t.business)}</div>
      <div>支出 — 員工薪資：${moneyFmt(t.staff)}　建築物運行成本：${moneyFmt(t.building)}　個人用品：${moneyFmt(t.personal)}</div>
      <div>結存：<b>${moneyFmt(t.totalIncome + t.totalExpense)}</b></div>
    `;
    $("#financeLog").textContent = state.finance.slice(0,200).map(f=>`${f.ts}  ${f.kind}  ${(f.delta>=0?"+":"")}${moneyFmt(f.delta)}`).join("\\n");
  }

  // ---------------- News & Achievements ----------------
  function renderNews(){
    const ul = $("#newsList"); ul.innerHTML="";
    state.news.forEach(n=>{
      const li = document.createElement("li");
      li.innerHTML = `<div style="font-weight:700">${n.title}</div><div>${n.body}</div><small>${n.ts}</small>`;
      ul.appendChild(li);
    });
  }

  const ACH = [
    { id:"firstRookie", name:"簽下第一名新秀", check: ()=> state.finance.some(f=>f.kind.includes("簽下新秀")) },
    { id:"firstTransfer", name:"完成首筆轉會", check: ()=> state.finance.some(f=>f.kind.includes("轉會費佣金")) },
    { id:"income1m", name:"年度收益破百萬", check: ()=> financeTotals().totalIncome >= 1_000_000 },
  ];
  function unlock(name){ state.achievements[name]=true; renderAchievements(); }
  function renderAchievements(){
    const ul = $("#achList"); ul.innerHTML="";
    ACH.forEach(a=>{
      const done = a.check() || state.achievements[a.name];
      const li = document.createElement("li");
      li.className="card";
      li.innerHTML = `<b>${a.name}</b> ${done?'<span class="badge">完成</span>':'<span class="badge" style="background:#999">未完成</span>'}`;
      ul.appendChild(li);
    });
  }

  // ---------------- Game Loop ----------------
  function nextWeek(){
    // weekly costs
    addFinance("辦公室營運成本", -officeCost(state.office.level));
    addFinance("學院營運成本", -academyCost(state.academy.level));
    const staffCost = (state.employees.scout+state.employees.negotiator+state.employees.trainer)*2600;
    addFinance("員工薪資", -staffCost);

    // purchases passive
    if(isOwned("condo")) addFinance("房租收入", 10_000);
    if(isOwned("horse") && chance(0.05)) addFinance("賽馬獎金", rand(5_000,30_000));

    // player commission 12% of weekly salary
    let commission = 0;
    state.clients.forEach(p=> commission += Math.floor(p.salaryPerWeek * 0.12));
    if(commission>0) addFinance("本週合約佣金", commission);

    // events
    if(chance(0.2)){
      const p = choice(state.clients);
      if(p) pushNews("球員要求續約", `${p.name} 表示希望獲得續約與加薪。`);
    }
    if(chance(0.22)){
      // generate prospects
      for(let i=0;i<academyGrads(state.academy.level);i++){
        const pr = createPlayer(Date.now()+i);
        pr.club = "自由球員"; state.prospects.push(pr);
      }
      pushNews("學院畢業名單", "有數名新秀可簽約。");
      renderAcademy();
    }
    if(chance(0.18)){
      openNegotiation(choice(state.clients));
      return; // open negotiation immediately this week
    }

    // time
    state.week++;
    if(state.week>weeksPerSeason){
      state.week=1; state.season++;
      pushNews("休賽期開始","自由球員與交易視窗已開啟。");
    }
    renderAll();
  }

  // ---------------- Actions ----------------
  function recommendPlayer(p){
    const boost = (5 + state.employees.negotiator*2 + Math.floor(state.rep/100));
    if(chance(0.55)){
      const raise = Math.floor(p.salaryPerWeek * (0.05 + boost/100));
      p.salaryPerWeek += raise;
      addFinance(`${p.name} 代言/續約成功（提成）`, Math.floor(raise*0.5));
      pushNews("推薦成功", `${p.name} 的商業價值提升，薪資增加 ${moneyFmt(raise)}。`);
    }else{
      pushNews("推薦失敗", `${p.name} 的談判破局，下次再試。`);
    }
    renderClients();
  }
  function renewContract(p){
    const years = rand(2,4);
    const baseRaise = Math.floor(p.salaryPerWeek * (0.1 + state.employees.negotiator*0.03));
    const ok = chance(0.6 + state.rep/1000);
    if(ok){
      p.salaryPerWeek += baseRaise;
      p.contractEndWeek += years*weeksPerSeason;
      addFinance(`${p.name} 續約佣金`, Math.floor(baseRaise*0.6));
      pushNews("續約成功", `${p.name} 與 ${p.club} 完成 ${years} 年續約。`);
    }else{
      pushNews("續約失敗", `${p.name} 對續約條件不滿。`);
    }
    renderClients();
  }

  // ---------------- Navigation ----------------
  function show(name){ $$(".screen").forEach(s=>s.classList.remove("active")); $("#screen-"+name).classList.add("active"); }

  // Tile nav
  $$(".tile").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const target = btn.dataset.screen;
      show(target);
      if(target==="office") renderOffice();
      if(target==="clients") renderClients();
      if(target==="staff") renderStaff();
      if(target==="academy") renderAcademy();
      if(target==="shop") renderShop();
      if(target==="ranking") renderRanking();
      if(target==="finance") renderFinance();
      if(target==="news") renderNews();
      if(target==="achievements") renderAchievements();
    });
  });
  // back buttons
  $$(".back").forEach(b=> b.addEventListener("click", ()=> show("main")) );

  // Office controls
  $("#btnOfficeUp").onclick = ()=>{
    const cost = 250000 * state.office.level;
    if(state.money<cost){ alert("資金不足"); return; }
    state.office.level++; addFinance("升級辦公室", -cost); renderOffice(); renderMain();
  };
  $("#btnOfficeDown").onclick = ()=>{
    if(state.office.level<=1) return;
    state.office.level--; addFinance("縮編辦公室退款", 120000); renderOffice(); renderMain();
  };

  // Academy controls
  $("#btnAcademyUp").onclick = ()=>{
    const cost = 120000 * state.academy.level;
    if(state.money<cost){ alert("資金不足"); return; }
    state.academy.level++; addFinance("升級學院", -cost); renderAcademy(); renderMain();
  };
  $("#btnAcademyDown").onclick = ()=>{
    if(state.academy.level<=1) return;
    state.academy.level--; addFinance("縮編學院退款", 60000); renderAcademy(); renderMain();
  };

  // Staff hire
  // (handled in renderStaff -> data-up buttons)

  // Shop tabs
  $$(".tab").forEach(t=> t.addEventListener("click", ()=>{ activeTab = t.dataset.tab; renderShop(); }));

  // Clients buttons
  $("#btnRecommendAll").onclick = ()=> state.clients.forEach(recommendPlayer);
  $("#btnRecommendSome").onclick = ()=> state.clients.filter(()=>chance(0.4)).forEach(recommendPlayer);
  $("#btnFindProspect").onclick = ()=>{
    const p = createPlayer(Date.now());
    p.club = "自由球員"; state.prospects.push(p);
    pushNews("球探報告", `發現潛力新秀：${p.name}（OVR${p.ovr}，${p.position}）`);
    renderAcademy();
  };

  // Player actions
  $("#btnPitch").onclick = ()=> currentPlayer && recommendPlayer(currentPlayer);
  $("#btnRenew").onclick = ()=> currentPlayer && renewContract(currentPlayer);
  $("#btnTrade").onclick = ()=> currentPlayer && openNegotiation(currentPlayer);
  $("#btnRelease").onclick = ()=>{
    if(!currentPlayer) return;
    state.clients = state.clients.filter(x=>x.id!==currentPlayer.id);
    addFinance(`釋出 ${currentPlayer.name}`, 0);
    show("clients"); renderClients();
  };

  // Negotiation actions
  $("#offerRange").oninput = (e)=> $("#offerValText").textContent = moneyFmt(+e.target.value);
  $("#btnOfferAccept").onclick = acceptOffer;
  $("#btnOfferCounter").onclick = counterOffer;
  $("#btnOfferReject").onclick = ()=>{ pushNews("你已拒絕報價","等待下一次機會。"); show("clients"); };

  // Finance buttons
  $("#btnFinanceLog").onclick = ()=>{
    const years = {};
    state.finance.forEach(f=>{
      const y = +f.ts.split("W")[0]; years[y]=years[y]||{income:0,expense:0};
      if(f.delta>0) years[y].income+=f.delta; else years[y].expense+=f.delta;
    });
    const lines = Object.entries(years).sort((a,b)=>a[0]-b[0]).map(([y,v])=>`${y} 收入 ${moneyFmt(v.income)}   支出 ${moneyFmt(v.expense)}   結存 ${moneyFmt(v.income+v.expense)}`);
    $("#financeLog").textContent = lines.join("\\n") + "\\n\\n" + state.finance.slice(0,200).map(f=>`${f.ts}  ${f.kind}  ${(f.delta>=0?"+":"")}${moneyFmt(f.delta)}`).join("\\n");
  };
  $("#btnFinanceGain").onclick = ()=> addFinance("測試收入", rand(10_000, 100_000));

  // Settings
  $("#btnSave").onclick = save;
  $("#btnLoad").onclick = load;
  $("#btnNewGame").onclick = ()=>{ if(confirm("確定開始新遊戲？當前進度將覆蓋。")) newGame(); };

  // Next week
  $("#nextWeek").onclick = nextWeek;

  // Init
  newGame();
  renderAll();
  function renderAll(){
    renderTop(); renderMain(); renderOffice(); renderAcademy(); renderClients(); renderStaff(); renderShop(); renderRanking(); renderFinance(); renderNews(); renderAchievements();
  }
})();
