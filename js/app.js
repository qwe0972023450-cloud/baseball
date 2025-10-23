
window.App = {
  version: '1.7.1',
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
    agency: { level:1, reputation:0, cash: 250000, clientIds: [], lastRecommendationWeek: 0 }
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
    agency: { level:1, reputation:0, cash: 250000, clientIds: [], lastRecommendationWeek: 0 }
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


// ==== UI helpers (modal queue) ====
App.ui = App.ui || {};
App.ui.queue = [];
App.ui.onFinish = null;
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
  App.ui.queue = contents.slice();
  App.ui.onFinish = finallyCb||null;
  function next(){
    const item = App.ui.queue.shift();
    if(!item){ if(App.ui.onFinish) App.ui.onFinish(); return; }
    App.ui.showModal(item, next);
  }
  next();
};

// ==== Agency helpers ====
App.utils.scoutGrade = (p)=>{
  const s = Math.round(((p.potential||p.rating||5)/10)*5); // 0..5
  return ['F','D','C','B','A','A+'][Math.max(0, Math.min(5,s))];
};
App.utils.agencyCapacity = ()=> 5 + (App.state.agency.level-1)*5;
App.utils.agencyUpgradeCost = ()=> 200000 * App.state.agency.level;
App.utils.agencyUpgrade = ()=>{
  const cost = App.utils.agencyUpgradeCost();
  if(App.state.agency.cash < cost){ alert('現金不足'); return; }
  App.state.agency.cash -= cost;
  App.state.agency.level += 1;
  App.save(); alert('已升級！');
  App.navigate('agency');
};
App.utils.agencyTrySign = (pid)=>{
  const ag = App.state.agency;
  if(ag.clientIds.length >= App.utils.agencyCapacity()){ alert('客戶已達上限，請升級經紀公司'); return; }
  const p = App.state.players.find(x=>x.id===pid);
  if(!p){ alert('找不到球員'); return; }
  const league = App.state.leagues.find(l=>l.id===p.leagueId);
  const levelFactor = (league.level==='Top')? 0.2 : 0.5;
  const want = (p.rating + p.potential)/20; // 0..1
  const rep = (ag.reputation/100); // 0..1
  const prob = Math.min(0.9, 0.3 + rep + levelFactor*(1-want));
  if(Math.random() < prob){
    ag.clientIds.push(p.id);
    ag.reputation = Math.min(100, ag.reputation + 2);
    App.utils.pushNews(App.state.week, `簽下客戶：${p.name}`, `你成功與 ${p.name} 簽訂經紀合約。`, ['經紀','簽約']);
    App.save(); alert('簽約成功！');
    App.navigate('clients');
  }else{
    App.utils.pushNews(App.state.week, `簽約失敗：${p.name}`, `${p.name} 拒絕了你的簽約提案，提升公司等級或名望再試試。`, ['經紀','簽約']);
    alert('對方拒絕了');
  }
};
App.utils.agencyRemoveClient = (pid)=>{
  const ag = App.state.agency;
  ag.clientIds = ag.clientIds.filter(id=>id!==pid);
  App.save(); alert('已解除合約');
  App.navigate('clients');
};
App.utils.buildClientWeeklyReport = (week)=>{
  const ag = App.state.agency;
  const clients = ag.clientIds.map(id=>App.state.players.find(p=>p.id===id)).filter(Boolean);
  if(!clients.length) return `<h3>本週客戶報告</h3><div class="muted">目前沒有客戶</div>`;
  const rows = clients.map(p=>{
    const rec = p._lastWeekRec || {G:0,PA:0,H:0,HR:0,RBI:0,AVG:0};
    return `<tr><td><a href="#/player?pid=${p.id}" onclick="App.navigate('player');return false;">${p.name}</a></td><td>${p.teamName||'-'}</td><td>${p.position}</td><td>${p.eval?.toFixed? p.eval.toFixed(1):p.eval}</td><td>${rec.G}</td><td>${rec.PA}</td><td>${rec.H}</td><td>${rec.HR}</td><td>${rec.RBI}</td><td>${rec.AVG}</td></tr>`;
  }).join('');
  return `<h3>本週客戶表現（W${week}）</h3><table class="table">
  <thead><tr><th>球員</th><th>球隊</th><th>位置</th><th>評分</th><th>G</th><th>PA</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th></tr></thead>
  <tbody>${rows}</tbody></table>`;
};

