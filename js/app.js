
window.App = {
  version: '1.8.0',
  state: {
    currentRoute: 'home',
    week: 1,
    maxWeeks: 52,
    leagues: [],
    teams: [],
    players: [],
    schedule: [], // {week, leagueId, games:[{homeId,awayId,homeScore,awayScore}]}
    champions: [], // {season, leagueId, leagueName, teamId, teamName}
    news: [], // {week, title, body, tags:[]}
    lastSavedAt: null,
    agency: { 
      level:1, reputation:0, cash: 250000, clientIds: [], lastRecommendationWeek: 0,
      depts: {scout:1, manager:1, trainer:1, finance:1, sales:1, academy:1},
      academyIds: [], _lastCommission:0
    }
  },
  data: {
    maleNames: [],
    leaguesSeed: []
  },
  pages: {},
  utils: {},
  registerPage(name, obj){ this.pages[name]=obj; },
  setTitle(t){ const el = document.getElementById('page-title'); if(el) el.textContent=t; },
  navigate(route){
    if(!this.pages[route]){
      this.renderNotFound(route);
      return;
    }
    this.state.currentRoute = route;
    location.hash = `#/${route}`;
    // nav active
    document.querySelectorAll('.nav-item').forEach(a=>{
      a.classList.toggle('active', a.getAttribute('data-route')===route);
    });
    // render
    const page = this.pages[route];
    this.setTitle(page.title || 'Baseball Agent Manager');
    const html = page.render(this.state);
    const app = document.getElementById('app');
    app.innerHTML = html;
    if(typeof page.onMount === 'function') page.onMount(this.state, this);
  },
  renderNotFound(route){
    const app = document.getElementById('app');
    document.querySelectorAll('.nav-item').forEach(a=>a.classList.remove('active'));
    this.setTitle('找不到頁面');
    app.innerHTML = `
      <div class="grid">
        <section class="card">
          <h2>找不到頁面</h2>
          <div class="muted">Route: #/${route}</div>
          <div style="margin-top:12px">
            <a class="btn primary" href="#/home" onclick="App.navigate('home');return false;">回首頁</a>
          </div>
        </section>
      </div>`;
  },
  save(){
    try{
      const blob = JSON.stringify(this.state);
      localStorage.setItem('bam:state', blob);
      this.state.lastSavedAt = new Date().toISOString();
    }catch(e){ console.warn('save failed', e); }
  },
  load(){
    try{
      const s = localStorage.getItem('bam:state');
      if(!s) return false;
      const parsed = JSON.parse(s);
      // simple migration
      this.state = Object.assign({
        currentRoute:'home',week:1,maxWeeks:52,leagues:[],teams:[],players:[],schedule:[],champions:[],news:[],lastSavedAt:null
      }, parsed);
      return true;
    }catch(e){ console.warn('load failed', e); return false; }
  },
  reset(hard=false){
    if(hard) localStorage.removeItem('bam:state');
    // seed from data
    this.state = {
      currentRoute:'home',
      week:1,maxWeeks:52,
      leagues: JSON.parse(JSON.stringify(this.data.leaguesSeed)),
      teams: [], players: [], schedule: [], champions: [], news: [],
      lastSavedAt: null,
    agency: { 
      level:1, reputation:0, cash: 250000, clientIds: [], lastRecommendationWeek: 0,
      depts: {scout:1, manager:1, trainer:1, finance:1, sales:1, academy:1},
      academyIds: [], _lastCommission:0
    }
    };
    // flatten teams from leaguesSeed
    this.state.teams = this.state.leagues.flatMap(l=>l.teams.map(t=>({...t, leagueId:l.id, leagueName:l.name})));
    // if no players, generate basic rosters with male names only (you can import real CSV to replace)
    this.state.players = this.utils.generatePlayersForAllTeams(this.state.teams, 15);
    this.state.schedule = [];
    this.state.champions = [];
    this.state.news = [];
    this.save();
  }
};

// utils
App.utils.rand = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
App.utils.id = (p='id')=> p + '_' + Math.random().toString(36).slice(2,10);
App.utils.sample = (arr)=> arr.length? arr[Math.floor(Math.random()*arr.length)] : null;

App.utils.position = ()=> {
  const pos = ['P','C','1B','2B','3B','SS','LF','CF','RF','DH'];
  return App.utils.sample(pos);
};

App.utils.generatePlayersForAllTeams = (teams, roster=15)=>{
  const list = [];
  for(const tm of teams){
    for(let i=0;i<roster;i++){
      const name = App.utils.sample(App.data.maleNames) + ' ' + App.utils.sample(App.data.maleNames);
      const rating = Math.max(1, Math.min(10, (Math.random()*6 + 2.5))); // 2.5~8.5
      const potential = Math.max(rating, Math.min(10, rating + (Math.random()* (10-rating))));
      const age = App.utils.rand(18,34);
      list.push({
        id: App.utils.id('ply'),
        name, teamId: tm.id, teamName: tm.name, leagueId: tm.leagueId, leagueName: tm.leagueName,
        position: App.utils.position(),
        salary: App.utils.rand(50, 1500) * 1000,
        rating: +rating.toFixed(1),
        potential: +potential.toFixed(1),
        eval: 6, // initial
        weeksBelow2: 0,
        age,
        status: 'normal',
        stats: {G:0, PA:0, H:0, HR:0, RBI:0, AVG:0},
        seasonWeekAtJoin: 1
      });
    }
  }
  return list;
};

App.utils.formatMoney = (n)=>'$'+(n||0).toLocaleString('en-US');
App.utils.avg = (h,pa)=> pa? (h/pa).toFixed(3) : '0.000';

// growth/evaluation rules
App.utils.applyEvaluationRules = (p)=>{
  // map eval to status
  if(p.eval<2){ p.status='released-candidate'; }
  else if(p.eval<5){ p.status='dfa'; }
  else if(p.eval<7){ p.status='normal'; }
  else if(p.eval<9){ p.status='starter'; }
  else if(p.eval<=10){ p.status='franchise'; }

  if(p.eval<2){
    p.weeksBelow2 = (p.weeksBelow2||0) + 1;
    if(p.weeksBelow2>=4){
      // released
      p.teamId = null;
      p.teamName = 'Free Agent';
      p.status = 'released';
    }
  }else{
    p.weeksBelow2 = 0;
  }
};

App.utils.progressionFromRating = (p)=>{
  // Higher eval nudges rating upward up to potential
  const delta = (p.eval-5) * 0.05; // -0.15 .. +0.25
  if(delta!==0){
    p.rating = Math.max(1, Math.min(p.potential, +(p.rating + delta).toFixed(2)));
  }
};

// compute stats from rating (toy sim)
App.utils.simPlayerWeek = (p)=>{
  if(!p.teamId) return;
  const games = 6; // per week
  const PA = App.utils.rand(18, 28);
  const contact = p.rating/10;
  const hits = Math.max(0, Math.round(PA * (0.18 + contact*0.17) * (0.8 + Math.random()*0.4)));
  const hr = Math.max(0, Math.round(hits * (0.05 + contact*0.06) * Math.random()*1.5));
  const rbi = Math.max(hr, Math.round(hits * (0.6 + Math.random()*0.8)));
  p.stats.G += games;
  p.stats.PA += PA;
  p.stats.H += hits;
  p.stats.HR += hr;
  p.stats.RBI += rbi;
  p.stats.AVG = +(App.utils.avg(p.stats.H, p.stats.PA));
  // weekly eval fluctuation
  const perf = (hits/PA) - 0.25;
  p.eval = Math.max(1, Math.min(10, +(p.eval + perf*4 + (Math.random()-.5)*0.6).toFixed(2)));
  App.utils.applyEvaluationRules(p);
  App.utils.progressionFromRating(p);
};

// news helpers
App.utils.pushNews = (week, title, body, tags=[])=>{
  App.state.news.unshift({week, title, body, tags, id:App.utils.id('news')});
  if(App.state.news.length>200) App.state.news.pop();
};

// onload
window.addEventListener('load', ()=>{
  // seed from data scripts
  App.data.maleNames = window.BAM_MALE_NAMES || [];
  App.data.leaguesSeed = window.BAM_LEAGUES || [];
  const ok = App.load();
  if(!ok) App.reset(true);

  document.getElementById('btn-save').addEventListener('click', ()=>{
    App.save(); alert('已儲存');
  });
  document.getElementById('btn-reset').addEventListener('click', ()=>{
    if(confirm('確定要重置為預設名單與資料？')){
      App.reset(true);
      App.navigate('home');
    }
  });

  // initial route
  if(location.hash && location.hash.startsWith('#/')){
    const r = location.hash.slice(2);
    App.navigate(r);
  }else{
    App.navigate('home');
  }
});


// ==== UI helpers ====
App.ui = App.ui || {};
App.ui.showModal = function(html, onClose){
  const el = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.innerHTML = html + `<div style="text-align:right;margin-top:12px"><button class="btn primary" id="modal-next">下一步</button></div>`;
  el.style.display = 'flex';
  const handler = ()=>{
    el.style.display='none';
    document.getElementById('modal-next').removeEventListener('click', handler);
    if(onClose) onClose();
  };
  document.getElementById('modal-next').addEventListener('click', handler);
};
App.ui.showSequential = function(contents, finallyCb){
  const queue = contents.slice();
  function next(){
    const item = queue.shift();
    if(!item){ if(finallyCb) finallyCb(); return; }
    App.ui.showModal(item, next);
  }
  next();
};

// ==== Agency & Contracts ====
App.utils.scoutGrade = (p)=>{
  const s = Math.round(((p.potential||p.rating||5)/10)*5);
  return ['F','D','C','B','A','A+'][Math.max(0, Math.min(5,s))];
};
App.utils.agencyCapacity = ()=> 5 + (App.state.agency.level-1)*5;
App.utils.agencyUpgradeCost = ()=> Math.round(200000 * App.state.agency.level * (1 - 0.03*(App.state.agency.depts.finance-1)));
App.utils.agencyUpgrade = ()=>{
  const cost = App.utils.agencyUpgradeCost();
  const ag = App.state.agency;
  if(ag.cash < cost){ alert('現金不足'); return; }
  ag.cash -= cost; ag.level += 1; App.save(); alert('公司已升級');
  App.navigate('agency');
};
App.utils.deptUpgradeCost = (k)=>{
  const lv = App.state.agency.depts[k]||1;
  return Math.round(120000 * lv * (1 - 0.02*(App.state.agency.depts.finance-1)));
};
App.utils.deptUpgrade = (k)=>{
  const cost = App.utils.deptUpgradeCost(k);
  const ag = App.state.agency;
  if(ag.cash < cost){ alert('現金不足'); return; }
  ag.cash -= cost; ag.depts[k] = (ag.depts[k]||1)+1; App.save(); alert('已升級 '+k);
  App.navigate('agency');
};
App.utils.submitAgentOffer = (pid, form)=>{
  const ag = App.state.agency; const p = App.state.players.find(x=>x.id===pid);
  if(!p){ alert('找不到球員'); return false; }
  if(ag.clientIds.length >= App.utils.agencyCapacity()){ alert('客戶已達上限'); return false; }
  const salary = +form.salary.value||0, years = +form.years.value||1, bonus=+form.bonus.value||0, commission=+form.commission.value||8;
  if(ag.cash < bonus){ alert('現金不足以支付簽約金'); return false; }
  // success probability
  const league = App.state.leagues.find(l=>l.id===p.leagueId)||{level:'Top'};
  const levelFactor = (league.level==='Top')? 0.2 : 0.5;
  const want = (p.rating + p.potential)/20;
  const rep = (ag.reputation/100);
  const mgr = 0.03*(ag.depts.manager-1);
  const scout = 0.02*(ag.depts.scout-1);
  const offerBoost = Math.min(0.25, (salary/600000)*0.12 + (bonus/200000)*0.1);
  const prob = Math.min(0.95, 0.25 + rep + levelFactor*(1-want) + mgr + scout + offerBoost);
  if(Math.random() < prob){
    ag.clientIds.push(p.id);
    ag.reputation = Math.min(100, ag.reputation + 3);
    ag.cash -= bonus;
    p.agentContract = {years, salary, bonus, commission};
    App.utils.pushNews(App.state.week, `簽下客戶：${p.name}`, `你以 ${App.utils.formatMoney(salary)}/年、簽約金 ${App.utils.formatMoney(bonus)} 與 ${p.name} 簽約（佣金 ${commission}%）。`, ['經紀','簽約']);
    App.save(); alert('簽約成功'); App.navigate('clients');
  }else{
    App.utils.pushNews(App.state.week, `簽約失敗：${p.name}`, `${p.name} 對你的合約並不滿意。`, ['經紀','談判']);
    alert('對方拒絕了');
  }
  return false;
};
App.utils.agencyRemoveClient = (pid)=>{
  const ag = App.state.agency; ag.clientIds = ag.clientIds.filter(id=>id!==pid);
  App.save(); alert('已解除經紀約'); App.navigate('clients');
};
App.utils.agencyWeeklyTick = ()=>{
  const ag = App.state.agency; let commissionSum = 0;
  for(const id of (ag.clientIds||[])){
    const p = App.state.players.find(x=>x.id===id); if(!p||!p.agentContract) continue;
    const weekly = (p.agentContract.salary||0) * (p.agentContract.commission||8) / 100 / 52;
    const salesBoost = 1 + 0.05*(ag.depts.sales-1);
    commissionSum += weekly * salesBoost;
    const trainerBoost = 0.02*(ag.depts.trainer-1);
    if(trainerBoost>0){
      p.eval = Math.min(10, +(p.eval + trainerBoost).toFixed(2));
      App.utils.progressionFromRating(p);
    }
  }
  const cashYield = (ag.cash||0) * (0.0005 + 0.0002*(ag.depts.finance-1));
  ag.cash += Math.round(commissionSum + cashYield);
  ag._lastCommission = Math.round(commissionSum);
};
App.utils.makeNewsWeekly = (week)=>{
  const played = App.state.players.filter(p=>p.teamId && p._lastWeekRec && p._lastWeekRec.PA>0);
  if(played.length){
    played.sort((a,b)=> (b._lastWeekRec.AVG - a._lastWeekRec.AVG) || (b._lastWeekRec.HR - a._lastWeekRec.HR));
    const best = played[0], worst = played[played.length-1];
    App.utils.pushNews(week, `火力噴發：${best.name}`, `${best.name} 本週 ${best._lastWeekRec.H} 安、${best._lastWeekRec.HR} 轟、打擊率 ${best._lastWeekRec.AVG}，帶動 ${best.teamName} 進攻狂潮。`, ['最佳','週報']);
    App.utils.pushNews(week, `低潮待解：${worst.name}`, `${worst.name} 手感下滑，本週打擊率 ${worst._lastWeekRec.AVG}，球隊期待他儘快找回節奏。`, ['低迷','週報']);
  }
  const rounds = App.state.schedule.filter(s=>s.week===week);
  if(rounds.length){
    const s = rounds[Math.floor(Math.random()*rounds.length)];
    if(s.games && s.games.length){
      const g = s.games[Math.floor(Math.random()*s.games.length)];
      const home = App.state.teams.find(t=>t.id===g.homeId)?.name||'主隊';
      const away = App.state.teams.find(t=>t.id===g.awayId)?.name||'客隊';
      App.utils.pushNews(week, `話題之戰`, `${home} 與 ${away} 上演拉鋸戰，終場比分 ${g.homeScore}:${g.awayScore}，現場氣氛沸騰。`, ['焦點戰役']);
    }
  }
};

