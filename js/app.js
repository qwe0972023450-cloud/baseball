
window.App = {
  version: '1.6.4',
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
    lastSavedAt: null
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
      lastSavedAt: null
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
