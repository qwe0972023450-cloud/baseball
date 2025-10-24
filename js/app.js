
window.App = {
  version: '1.9.0',
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
    events: [], // {week, title, body, tags:[]}
    recommendations: [], // {week, playerId}
    tasks: [], // agency department tasks
    agency: {cash: 500000, reputation: 50, clientIds: [], depts:{scout:1, manager:1, trainer:1, finance:1, sales:1, academy:1}, academyIds:[], _lastCommission:0},
    events: [], // {week, title, body, type}
    recommendations: [], // {week, playerId, note}
    lastSavedAt: null,
    agency: {
      level:1, reputation:0, cash: 500000, clientIds: [],
      depts: {scout:1, manager:1, trainer:1, finance:1, sales:1, academy:1},
      academyIds: [],
      kpi:{quarter:1, target:200000, progress:0},
      missions: [],
      _lastCommission:0
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
      level:1, reputation:0, cash: 500000, clientIds: [],
      depts: {scout:1, manager:1, trainer:1, finance:1, sales:1, academy:1},
      academyIds: [],
      kpi:{quarter:1, target:200000, progress:0},
      missions: [],
      _lastCommission:0
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
        career: {totals:{G:0,PA:0,H:0,HR:0,RBI:0,AVG:0, IP:0,W:0,L:0,SV:0,HLD:0,ERA:0}, seasons:[]},
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
  if(p.position==='P'){
    const GS = 1; // one outing per week
    const ip = +(Math.max(0, 4 + (p.rating-5)*0.6 + (Math.random()*3-1.5))).toFixed(1);
    const runs = Math.max(0, Math.round((9/ip) * (5 - (p.rating-5)*0.7) * (0.8+Math.random()*0.6)));
    // decisions
    const decision = Math.random();
    const win = decision < 0.35 ? 1:0;
    const loss = (decision>=0.35 && decision<0.6) ? 1:0;
    const sv = (decision>=0.6 && decision<0.75) ? 1:0;
    const hld = (decision>=0.75 && decision<0.9) ? 1:0;
    // store in batter stats minimally for now, but also extend a pitching shadow
    p.pit = p.pit || {IP:0,W:0,L:0,SV:0,HLD:0,R:0};
    p.pit.IP = +(p.pit.IP + ip).toFixed(1);
    p.pit.W += win; p.pit.L += loss; p.pit.SV += sv; p.pit.HLD += hld; p.pit.R += runs;
    // eval fluctuation for pitchers
    const era = p.pit.IP? +(p.pit.R*9/p.pit.IP).toFixed(2): 0;
    const perf = (4.2 - era) * 0.12;
    p.eval = Math.max(1, Math.min(10, +(p.eval + perf + (Math.random()-.5)*0.4).toFixed(2)));
    App.utils.applyEvaluationRules(p);
    App.utils.progressionFromRating(p);
    return;
  }
  // hitters
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
// === Extended helpers ===
App.utils.scoutGrade = (p)=>{
  const cap = p.potential||p.rating||5;
  const s = Math.round((cap/10)*5);
  return ['F','D','C','B','A','A+'][Math.max(0,Math.min(5,s))];
};

// standings helpers (win%, GB, tiebreakers: H2H, run diff)
App.utils.computeStandings = (leagueId, teamIds)=>{
  const key = `tbl_${leagueId}`;
  const tbl = App.state[key]||{};
  const rows = teamIds.map(tid=>{
    const r = tbl[tid]||{W:0,L:0,RS:0,RA:0};
    const WP = (r.W + r.L) ? (r.W/(r.W+r.L)) : 0;
    const RD = r.RS - r.RA;
    return {teamId:tid, ...r, WP, RD};
  });
  // head-to-head approx: prefer higher RS against same opponents when tied
  rows.sort((a,b)=>{
    if(b.WP!==a.WP) return b.WP-a.WP;
    const gb = (b.W-a.W) - (b.L-a.L);
    if(gb!==0) return -gb;
    if(b.RD!==a.RD) return b.RD-a.RD;
    return b.RS - a.RS;
  });
  // games behind
  const lead = rows[0]||{W:0,L:0};
  rows.forEach(r=>{
    r.GB = ((lead.W - r.W) + (r.L - lead.L))/2;
  });
  return rows;
};

// Better sports-style articles
App.utils.composeNewsArticles = (week)=>{
  const items = [];
  // best hitter
  const hitters = App.state.players.filter(p=>p.teamId && p.position!=='P' && p._lastWeekRec && p._lastWeekRec.PA>0);
  if(hitters.length){
    hitters.sort((a,b)=> (b._lastWeekRec.AVG - a._lastWeekRec.AVG) || (b._lastWeekRec.HR - a._lastWeekRec.HR));
    const s = hitters[0];
    items.push({
      week, title:`${s.teamName}火力點：${s.name}手感灼熱`,
      body:`【聯合通訊】第${week}週，${s.teamName}外野手${s.name}手感火燙，單週打擊率 ${s._lastWeekRec.AVG}、敲出 ${s._lastWeekRec.HR} 轟、貢獻 ${s._lastWeekRec.RBI} 打點。賽後${s.name}表示：「我只是專注在把球打紮實，節奏來了。」`,
      tags:['焦點','打者']
    });
  }
  // best pitcher
  const pitchers = App.state.players.filter(p=>p.teamId && p.position==='P' && p._lastWeekPitch && p._lastWeekPitch.IP>0);
  if(pitchers.length){
    pitchers.sort((a,b)=> (a._lastWeekPitch.ERA - b._lastWeekPitch.ERA) || (b._lastWeekPitch.W - a._lastWeekPitch.W) );
    const s = pitchers[0];
    items.push({
      week, title:`王牌領航：${s.name}單週壓制`,
      body:`【體壇日報】${s.teamName}先發${s.name}本週投 ${s._lastWeekPitch.IP} 局，防禦率 ${s._lastWeekPitch.ERA.toFixed(2)}，收下 ${s._lastWeekPitch.W} 勝 ${s._lastWeekPitch.SV?`、${s._lastWeekPitch.SV} 次救援`:''}。教頭稱讚：「他今天的伸卡球在邊角消失。」`,
      tags:['焦點','投手']
    });
  }
  // one marquee game if exists
  const rounds = App.state.schedule.filter(s=>s.week===week);
  if(rounds.length){
    const r = rounds[Math.floor(Math.random()*rounds.length)];
    const g = (r.games||[])[Math.floor(Math.random()*r.games.length)];
    if(g){
      const home = ((App.state.teams.find(t=>t.id===g.homeId)||{}).name)||'主隊';
      const away = ((App.state.teams.find(t=>t.id===g.awayId)||{}).name)||'客隊';
      items.push({week, title:`拉鋸之戰：${home} 險勝 ${away}`, body:`【現場】${home} 與 ${away} 打滿九局，終場以 ${g.homeScore}:${g.awayScore} 分分勝負，${(g.homeScore>g.awayScore?home:away)} 關鍵時刻的牛棚成功守成。`, tags:['話題戰','賽事']});
    }
  }
  return items;
};

// Pitcher & Batter weekly sim
App.utils.simPlayerWeek = (p)=>{
  if(!p.teamId) return;
  if(p.position==='P'){
    const GS = 1; // one outing per week
    const ip = +(Math.max(0, 4 + (p.rating-5)*0.6 + (Math.random()*3-1.5))).toFixed(1);
    const runs = Math.max(0, Math.round((9/ip) * (5 - (p.rating-5)*0.7) * (0.8+Math.random()*0.6)));
    // decisions
    const decision = Math.random();
    const win = decision < 0.35 ? 1:0;
    const loss = (decision>=0.35 && decision<0.6) ? 1:0;
    const sv = (decision>=0.6 && decision<0.75) ? 1:0;
    const hld = (decision>=0.75 && decision<0.9) ? 1:0;
    // store in batter stats minimally for now, but also extend a pitching shadow
    p.pit = p.pit || {IP:0,W:0,L:0,SV:0,HLD:0,R:0};
    p.pit.IP = +(p.pit.IP + ip).toFixed(1);
    p.pit.W += win; p.pit.L += loss; p.pit.SV += sv; p.pit.HLD += hld; p.pit.R += runs;
    // eval fluctuation for pitchers
    const era = p.pit.IP? +(p.pit.R*9/p.pit.IP).toFixed(2): 0;
    const perf = (4.2 - era) * 0.12;
    p.eval = Math.max(1, Math.min(10, +(p.eval + perf + (Math.random()-.5)*0.4).toFixed(2)));
    App.utils.applyEvaluationRules(p);
    App.utils.progressionFromRating(p);
    return;
  }
  // hitters
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
  const perf = (hits/PA) - 0.25;
  p.eval = Math.max(1, Math.min(10, +(p.eval + perf*4 + (Math.random()-.5)*0.6).toFixed(2)));
  App.utils.applyEvaluationRules(p);
  App.utils.progressionFromRating(p);
};
    p.statsPitch.G += G; p.statsPitch.IP += IP; p.statsPitch.W += W; p.statsPitch.L += L; p.statsPitch.SV += SV; p.statsPitch.HLD += HLD; p.statsPitch.ER += runs;
    p.statsPitch.ERA = p.statsPitch.IP? (9*p.statsPitch.ER/p.statsPitch.IP):0;
    // last week snapshot
    p._lastWeekPitch = {G,IP, W,L,SV,HLD, ER:runs, ERA: (IP? 9*runs/IP:0)};
    // eval
    const perf = (W?0.4:0) + (SV?0.25:0) + (HLD?0.15:0) - Math.min(1, (p._lastWeekPitch.ERA-3)/6);
    p.eval = Math.max(1, Math.min(10, +(p.eval + perf*0.8 + (Math.random()-.5)*0.4).toFixed(2)));
  }else{
    const games = 6;
    const PA = App.utils.rand(18, 28);
    const contact = p.rating/10;
    const hits = Math.max(0, Math.round(PA * (0.18 + contact*0.17) * (0.8 + Math.random()*0.4)));
    const hr = Math.max(0, Math.round(hits * (0.05 + contact*0.06) * Math.random()*1.5));
    const rbi = Math.max(hr, Math.round(hits * (0.6 + Math.random()*0.8)));
    p.stats.G += games; p.stats.PA += PA; p.stats.H += hits; p.stats.HR += hr; p.stats.RBI += rbi;
    p.stats.AVG = +(App.utils.avg(p.stats.H, p.stats.PA));
    const perf = (hits/PA) - 0.25;
    p._lastWeekRec = {G:games, PA, H:hits, HR:hr, RBI:rbi, AVG: p.stats.AVG};
    p.eval = Math.max(1, Math.min(10, +(p.eval + perf*4 + (Math.random()-.5)*0.6).toFixed(2)));
  }
  App.utils.applyEvaluationRules(p);
  App.utils.progressionFromRating(p);
};

// Weekly agency revenue & training
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

// Client weekly light report
App.utils.buildClientWeeklyReport = (week)=>{
  const ag = App.state.agency; const cs = (ag.clientIds||[]).map(id=>App.state.players.find(p=>p.id===id)).filter(Boolean);
  if(!cs.length) return `<h3>本週客戶報告</h3><div class="muted">目前沒有客戶</div>`;
  const rows = cs.map(p=>{
    if(p.position==='P' && p._lastWeekPitch){
      const r = p._lastWeekPitch;
      const wl = r.W? '勝投' : (r.SV? '救援' : (r.HLD? '中繼' : '—'));
      return `<tr><td>${p.name}</td><td>${p.teamName||'-'}</td><td>投手</td><td>${r.IP} IP</td><td>${wl}</td><td>${p.eval.toFixed(1)}</td></tr>`;
    }else{
      const r = p._lastWeekRec||{AVG:0,HR:0};
      return `<tr><td>${p.name}</td><td>${p.teamName||'-'}</td><td>打者</td><td>AVG ${r.AVG}</td><td>HR ${r.HR}</td><td>${p.eval.toFixed(1)}</td></tr>`;
    }
  }).join('');
  return `<h3>本週客戶表現（W${week}）</h3>
    <table class="table"><thead><tr><th>球員</th><th>球隊</th><th>類型</th><th>重點數據</th><th>結果</th><th>評分</th></tr></thead><tbody>${rows}</tbody></table>`;
};

// Compose weekly news (separate from events & recommendations)
App.utils.makeWeeklyNewsPack = (week)=> App.utils.composeNewsArticles(week);

});
// ==== Added utilities: standings, events, recommendations, contracts, news pack ====
App.utils.scoutGrade = (p)=>{
  const s = Math.round(((p.potential||p.rating||5)/10)*5);
  return ['F','D','C','B','A','A+'][Math.max(0, Math.min(5,s))];
};

// Build/return sorted standings with tie-breakers (WPCT, H2H, RunDiff)
App.utils.getStandings = (leagueId)=>{
  const key = 'tbl_'+leagueId;
  const tbl = App.state[key]||{};
  const rows = Object.entries(tbl).map(([tid,row])=>{
    const g = row.W + row.L;
    const wpct = g? row.W/g : 0;
    const rd = (row.RS||0) - (row.RA||0);
    return {tid:+tid, ...row, G:g, WPCT:wpct, RD:rd};
  });
  // H2H map
  const h2h = App.state['h2h_'+leagueId]||{};
  rows.sort((a,b)=>{
    if(b.WPCT !== a.WPCT) return b.WPCT - a.WPCT;
    // pairwise head-to-head
    const ha = (h2h[a.tid]||{})[b.tid];
    const hb = (h2h[b.tid]||{})[a.tid];
    if(ha && hb){
      const aw = ha.W||0, bw = hb.W||0;
      if(aw!==bw) return bw - aw; // more wins vs each other
    }
    // run differential
    if(b.RD !== a.RD) return b.RD - a.RD;
    // last resort: runs scored
    return (b.RS||0) - (a.RS||0);
  });
  // games behind
  if(rows.length){
    const lead = rows[0];
    for(const r of rows){
      r.GB = +(((lead.W - r.W) + (r.L - lead.L))/2).toFixed(1);
    }
  }
  return rows;
};

App.utils.pushEvent = (week, title, body, tags=[])=>{
  App.state.events.unshift({week, title, body, tags});
};
App.utils.pushRecommendation = (week, playerId)=>{
  App.state.recommendations.unshift({week, playerId});
};

// Client weekly report (simplified per request)
App.utils.buildClientWeeklyReport = (week)=>{
  const ag = App.state.agency||{clientIds:[]};
  const clients = ag.clientIds.map(id=>App.state.players.find(p=>p.id===id)).filter(Boolean);
  if(!clients.length) return `<h3>本週客戶報告</h3><div class="muted">目前沒有客戶</div>`;
  const rows = clients.map(p=>{
    const r = p._lastWeekRec||{};
    if(p.position==='P'){
      const pit = p._lastWeekPit||{IP:0,W:0,L:0,SV:0,HLD:0};
      const wl = pit.W?`W`:(pit.L?`L`:(pit.SV?`SV`:(pit.HLD?`HLD`:'')));
      return `<tr><td>${p.name}</td><td>${p.teamName||'-'}</td><td>投手</td><td>${pit.IP||0}</td><td>${wl}</td><td>${(p.eval||'-')}</td></tr>`;
    }else{
      return `<tr><td>${p.name}</td><td>${p.teamName||'-'}</td><td>打者</td><td>${r.AVG||'-'}</td><td>${r.HR||0} HR</td><td>${(p.eval||'-')}</td></tr>`;
    }
  }).join('');
  return `<h3>本週客戶表現（W${week}）</h3><table class="table">
  <thead><tr><th>球員</th><th>球隊</th><th>定位</th><th>${'數據'}</th><th>${'重點'}</th><th>評分</th></tr></thead>
  <tbody>${rows}</tbody></table>`;
};

// Sports-style news pack
App.utils.makeWeeklyNewsPack = (week)=>{
  const list = [];
  // Headline: top performer hitter or pitcher
  const hitters = App.state.players.filter(p=>p.teamId && p.position!=='P' && p._lastWeekRec && p._lastWeekRec.PA>0);
  if(hitters.length){
    hitters.sort((a,b)=> (b._lastWeekRec.AVG - a._lastWeekRec.AVG) || (b._lastWeekRec.HR - a._lastWeekRec.HR));
    const h = hitters[0];
    list.push({week, title:`${h.name} 火燙手感點燃 ${h.teamName}`, body:`【本報訊】${h.teamName}外野手 ${h.name} 本週手感發燙，${h._lastWeekRec.H} 安、${h._lastWeekRec.HR} 轟，打擊率 ${h._lastWeekRec.AVG}。教頭盛讚其專注度與擊球品質。`, tags:['頭條','打者']});
  }
  const pitchers = App.state.players.filter(p=>p.teamId && p.position==='P' && p._lastWeekPit);
  if(pitchers.length){
    pitchers.sort((a,b)=> ( (b._lastWeekPit.W - a._lastWeekPit.W) || (b._lastWeekPit.SV - a._lastWeekPit.SV) || (b._lastWeekPit.IP - a._lastWeekPit.IP) ));
    const p = pitchers[0];
    const flag = p._lastWeekPit.W?'勝投':(p._lastWeekPit.SV?'救援成功':(p._lastWeekPit.HLD?'中繼點':'優質先發'));
    list.push({week, title:`${p.name} ${flag}　${p.teamName}穩住陣腳`, body:`【比賽焦點】${p.name} 本週投 ${p._lastWeekPit.IP} 局，貢獻 ${flag}，有效壓制對手火力。教練團肯定其球威與控球。`, tags:['投手','焦點戰']});
  }
  // League roundup: pick one league game random
  const rounds = App.state.schedule.filter(s=>s.week===week);
  if(rounds.length){
    const s = rounds[Math.floor(Math.random()*rounds.length)];
    if(s.games && s.games.length){
      const g = s.games[Math.floor(Math.random()*s.games.length)];
      const home = ((App.state.teams.find(t=>t.id===g.homeId)||{}).name)||'主隊';
      const away = ((App.state.teams.find(t=>t.id===g.awayId)||{}).name)||'客隊';
      list.push({week, title:`拉鋸大戰　${home} 險勝 ${away}`, body:`【戰況】${home} 與 ${away} 上演你來我往，終場 ${g.homeScore}:${g.awayScore} 分勝出；球迷情緒高漲，球隊士氣上揚。`, tags:['戰況']});
    }
  }
  return list;
};

// Contracts & weekly income (basic)
App.utils.agencyWeeklyTick = ()=>{
  const ag = App.state.agency; let sum=0;
  for(const id of ag.clientIds){
    const p = App.state.players.find(x=>x.id===id); if(!p||!p.agentContract) continue;
    const weekly = (p.agentContract.salary||0) * (p.agentContract.commission||8) / 100 / 52;
    sum += weekly;
  }
  // finance passive income
  const yieldRate = 0.0007 + 0.0002*(ag.depts.finance-1);
  ag.cash += Math.round(sum + (ag.cash*yieldRate));
  ag._lastCommission = Math.round(sum);
};


/* ---- runtime error overlay (debug) ---- */
window.addEventListener('error', function(e){
  var box=document.getElementById('errorbox'); if(!box){ box=document.createElement('div'); box.id='errorbox'; document.body.appendChild(box); }
  box.style.cssText='position:fixed;left:8px;right:8px;bottom:60px;background:#7f1d1d;color:#fff;border:1px solid #b91c1c;border-radius:12px;padding:8px;z-index:99999;white-space:pre-wrap';
  box.textContent = 'JS Error: '+(e.message||e)+' @ '+(e.filename||'')+':'+(e.lineno||'')+':'+(e.colno||'');
});
window.addEventListener('unhandledrejection', function(e){
  var box=document.getElementById('errorbox'); if(!box){ box=document.createElement('div'); box.id='errorbox'; document.body.appendChild(box); }
  box.style.cssText='position:fixed;left:8px;right:8px;bottom:60px;background:#7f1d1d;color:#fff;border:1px solid #b91c1c;border-radius:12px;padding:8px;z-index:99999;white-space:pre-wrap';
  box.textContent = 'Promise Rejection: '+(e.reason&&e.reason.message?e.reason.message:e.reason);
});
