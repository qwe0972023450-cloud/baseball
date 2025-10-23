
App.sim = {
  ensureSchedule(){
    if(App.state.schedule.length) return;
    // simple double round robin by league for first 39 weeks
    const regWeeks = 39;
    for(const lg of App.state.leagues){
      const teams = App.state.teams.filter(t=>t.leagueId===lg.id).map(t=>t.id);
      // round robin pairings
      let week=1;
      for(let w=1; w<=regWeeks; w++){
        const games=[];
        const shuffled = [...teams].sort(()=>Math.random()-.5);
        for(let i=0;i<shuffled.length;i+=2){
          const a = shuffled[i], b = shuffled[i+1];
          if(b===undefined) continue;
          games.push({homeId:a, awayId:b, homeScore:null, awayScore:null});
        }
        App.state.schedule.push({week:w, leagueId:lg.id, leagueName:lg.name, games});
      }
    }
  },
  playWeek(week){
    if(App.state.week===1){
      for(const p of App.state.players){
        p.age=(p.age||18)+1;
        if(p.age>=35 && p.age<=45 && Math.random()<((p.age-34)*0.02)){
          p.teamId=null;p.teamName='Retired';p.status='retired';
          App.utils.pushNews(App.state.week, `退役：${p.name}`, `${p.name}（${p.age}）宣布退役。`, ['退役']);
        }
        if(p.age>33) p.rating = Math.max(1, +(p.rating - 0.1).toFixed(2));
      }
    }

    // make sure schedule exists
    this.ensureSchedule();

    // simulate players
    for(const p of App.state.players){
      // retirement check off-season only; keep simple
      App.utils.simPlayerWeek(p);
    }

    // simulate games for week
    const schedules = App.state.schedule.filter(s=>s.week===week);
    for(const s of schedules){
      for(const g of s.games){
        const home = App.state.teams.find(t=>t.id===g.homeId);
        const away = App.state.teams.find(t=>t.id===g.awayId);
        const homeRating = avgTeamRating(home.id);
        const awayRating = avgTeamRating(away.id);
        const base = 2.8;
        const hr = Math.max(1, Math.round(base + (homeRating-awayRating)*0.6 + Math.random()*6));
        const ar = Math.max(0, Math.round(base + (awayRating-homeRating)*0.6 + Math.random()*6));
        g.homeScore = hr; g.awayScore = ar;
        // standings
        addResult(s.leagueId, home.id, away.id, hr, ar);
      }
    }

    // playoffs 40~45
    if(week===40){
      this.seedPlayoffs(week);
    }
    if(week>=40 && week<=45){
      this.playPlayoffs(week);
    }
    // News (best & worst of week)
    publishWeeklyNews(week);
    App.save();

    function avgTeamRating(teamId){
      const ps = App.state.players.filter(p=>p.teamId===teamId);
      if(!ps.length) return 5;
      return ps.map(p=>p.rating).reduce((a,b)=>a+b,0)/ps.length;
    }
    function addResult(leagueId, homeId, awayId, hs, as){
      const key = `tbl_${leagueId}`;
      let tbl = App.state[key];
      if(!tbl){
        tbl = {}; App.state[key]=tbl;
      }
      for(const tid of [homeId,awayId]){
        if(!tbl[tid]) tbl[tid] = {W:0,L:0,RS:0,RA:0};
      }
      if(hs>as){ tbl[homeId].W++; tbl[awayId].L++; } else { tbl[awayId].W++; tbl[homeId].L++; }
      tbl[homeId].RS+=hs; tbl[homeId].RA+=as;
      tbl[awayId].RS+=as; tbl[awayId].RA+=hs;
    }
    function publishWeeklyNews(week){
      const played = App.state.players.filter(p=>p.stats && p.stats.PA>0).sort((a,b)=>(b.stats.H/Math.max(1,b.stats.PA)) - (a.stats.H/Math.max(1,a.stats.PA)));
      if(played.length){
        const best = played[0];
        const worst = played[played.length-1];
        App.utils.pushNews(week, `本週最佳：${best.name}`, `帶領 ${best.teamName} 攻下火力，打擊率 ${best.stats.AVG}、全壘打 ${best.stats.HR}、打點 ${best.stats.RBI}。`, ['最佳球員','週報']);
        App.utils.pushNews(week, `本週低迷：${worst.name}`, `本週手感冰冷，打擊率 ${worst.stats.AVG}，需要盡快調整。`, ['低潮','週報']);
      }
      // random events
      if(Math.random()<0.35){
        const p = App.utils.sample(App.state.players);
        if(p && p.teamId){
          const kind = Math.random();
          if(kind<0.5){
            p.eval = Math.min(10, p.eval + 1);
            App.utils.pushNews(week, `熱身爆發：${p.name}`, `${p.teamName} 的 ${p.name} 狀態火燙，評價上調。`, ['事件','狀態']);
          }else{
            p.eval = Math.max(1, p.eval - 0.8);
            App.utils.pushNews(week, `小傷勢：${p.name}`, `${p.name} 傳出輕傷狀況，評價下降，短期影響表現。`, ['事件','傷勢']);
          }
        }
      }
    }
  },
  seedPlayoffs(startWeek){
    // take top 4 per league
    for(const lg of App.state.leagues){
      const key = `tbl_${lg.id}`;
      const tbl = App.state[key]||{};
      const rows = Object.entries(tbl).map(([tid,row])=>({tid:tid*1, ...row}));
      rows.sort((a,b)=>(b.W - a.W) || ((b.RS-b.RA)-(a.RS-a.RA)));
      const top = rows.slice(0,4).map(r=>r.tid);
      App.state[`po_${lg.id}`] = {teams:top, round:1, bracket:[ [top[0],top[3]], [top[1], top[2]] ], winners:[]};
      App.utils.pushNews(startWeek, `${lg.name} 季後賽開打`, `前四名球隊晉級：${top.map(id=>App.state.teams.find(t=>t.id===id).name).join('、')}`, ['季後賽']);
    }
  },
  playPlayoffs(week){
    for(const lg of App.state.leagues){
      const po = App.state[`po_${lg.id}`];
      if(!po) continue;
      if(po.round===1){
        // decide two winners
        po.winners = po.bracket.map(pair=>{
          const [a,b]=pair;
          return Math.random()<0.5? a:b;
        });
        po.round=2;
      }else if(po.round===2){
        // final winner
        const [a,b] = po.winners;
        const champId = Math.random()<0.5? a:b;
        const team = App.state.teams.find(t=>t.id===champId);
        App.state.champions.unshift({season:new Date().getFullYear(), leagueId: lg.id, leagueName: lg.name, teamId: champId, teamName: team.name});
        delete App.state[`po_${lg.id}`];
        App.utils.pushNews(week, `${lg.name} 冠軍出爐`, `${team.name} 奪下本季總冠軍！`, ['冠軍','季後賽']);
      }
    }
  }
};

// public actions
App.nextWeek = ()=>{
  if(App.state.week>=App.state.maxWeeks){
    alert('本季已結束，將開啟新賽季。');
    App.state.week = 1;
    // aging & retirement
    for(const p of App.state.players){
      p.age += 1; // simple yearly bump
      if(p.age>=35 && p.age<=45 && Math.random() < ((p.age-34)/12)){
        p.status='retired'; p.teamId=null;p.teamName='Retired';
      }else{
        // slight aging effect post 33
        if(p.age>33) p.rating = Math.max(1, +(p.rating - 0.1).toFixed(2));
      }
    }
    // reset standings & schedule
    App.state.schedule = [];
    for(const k of Object.keys(App.state)){
      if(k.startsWith('tbl_')) delete App.state[k];
      if(k.startsWith('po_')) delete App.state[k];
    }
    App.sim.ensureSchedule();
    App.save();
    App.navigate('home');
    return;
  }
  
App.sim.playWeek(App.state.week);

(function(){
  const ag = App.state.agency||{clientIds:[]};
  const clients = ag.clientIds.map(id=>App.state.players.find(p=>p.id===id)).filter(Boolean);
  for(const p of clients){
    const prev = p._shadowStats||{G:0,PA:0,H:0,HR:0,RBI:0,AVG:0};
    const rec = {G:p.stats.G - prev.G, PA:p.stats.PA - prev.PA, H:p.stats.H - prev.H, HR:p.stats.HR - prev.HR, RBI:p.stats.RBI - prev.RBI, AVG: p.stats.AVG};
    p._lastWeekRec = rec; p._shadowStats = {...p.stats};
  }
})();

if(App.state.week % 4 === 0 && (App.state.agency.lastRecommendationWeek||0) !== App.state.week){
  const ag = App.state.agency;
  const pool = App.state.players.filter(p=>!(ag.clientIds||[]).includes(p.id)).sort((a,b)=>b.potential-a.potential).slice(0,20);
  if(pool.length){
    const rec = pool[Math.floor(Math.random()*pool.length)];
    ag._pendingRec = rec.id; ag.lastRecommendationWeek = App.state.week;
    App.utils.pushNews(App.state.week, '球探推薦', `球探鎖定 ${rec.name}（${rec.teamName||'FA'}），建議盡速接觸。`, ['經紀','推薦']);
  }
}

if(App.state.week % 4 === 0){
  const r = Math.random();
  if(r<0.33){ App.state.agency.reputation = Math.min(100, App.state.agency.reputation+2); App.utils.pushNews(App.state.week,'品牌聲量提升','公司口碑上升，更多球員願意傾聽你的提案。',['公司']); }
  else if(r<0.66){ App.state.agency.cash += 50000; App.utils.pushNews(App.state.week,'小額代言案','成功替客戶媒合代言，進帳 $50,000。',['商務']); }
  else { App.state.agency.reputation = Math.max(0, App.state.agency.reputation-2); App.utils.pushNews(App.state.week,'負面新聞','不利傳聞影響公司名望。',['公司']); }
}

if([12,24,36,48].includes(App.state.week)){
  const ag = App.state.agency;
  const lv = ag.depts.academy||1;
  const mk = (min,max)=> +(Math.random()*(max-min)+min).toFixed(1);
  const rating = mk(3+0.3*(lv-1), 6+0.3*(lv-1));
  const potential = mk(rating+0.5, Math.min(10, rating+3));
  const pos = App.utils.position();
  const name = App.utils.sample(App.data.maleNames)+' '+App.utils.sample(App.data.maleNames);
  const ply = {id:App.utils.id('tra'), name, teamId:null, teamName:'Academy', leagueId:null, leagueName:'Academy',
    position:pos, salary:0, rating, potential, eval:6, age:17+(lv%3),
    status:'academy', stats:{G:0,PA:0,H:0,HR:0,RBI:0,AVG:0}, seasonWeekAtJoin: App.state.week};
  App.state.players.push(ply);
  ag.academyIds.push(ply.id);
  App.utils.pushNews(App.state.week,'學院畢業','體育學院推出新秀：'+name+'（'+pos+'）', ['學院','新秀']);
}

App.utils.agencyWeeklyTick();
App.utils.makeNewsWeekly(App.state.week);

const w = App.state.week;
const clientReport = App.utils.buildClientWeeklyReport(w);
const paper = (function(){
  const items = App.state.news.filter(n=>n.week===w).slice(0,10).map(n=>`
    <article>
      <div class="tag">W${n.week}</div>
      ${(n.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}
      <h3>${n.title}</h3>
      <div class="lead">${n.body}</div>
    </article>`).join('') || '<div class="muted">本週無新聞</div>';
  return `<h3>本週新聞</h3><div class="paper">${items}</div>`;
})();

App.state.week += 1;
App.save();
App.ui.showSequential([clientReport, paper], ()=>{ App.navigate(App.state.currentRoute); });
};
