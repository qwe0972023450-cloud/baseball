
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
  App.state.week += 1;
  App.save();
  App.navigate(App.state.currentRoute);
};
