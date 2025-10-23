
// ---- Scheduler & Season Engine (clean 1.9.1) ----
App.sim = {
  ensureSchedule(){
    if(App.state.schedule && App.state.schedule.length) return;
    const REG_WEEKS = 39;
    for(const lg of App.state.leagues){
      const ids = App.state.teams.filter(t=>t.leagueId===lg.id).map(t=>t.id);
      for(let w=1; w<=REG_WEEKS; w++){
        const games=[];
        const shuffled = ids.slice().sort(()=>Math.random()-.5);
        for(let i=0;i<shuffled.length;i+=2){
          const a = shuffled[i], b = shuffled[i+1];
          if(b==null) continue;
          const home = Math.random()<0.5 ? a : b;
          const away = home===a? b : a;
          games.push({homeId:home, awayId:away, homeScore:0, awayScore:0});
        }
        App.state.schedule.push({week:w, leagueId: lg.id, games});
      }
    }
  },

  // Seed top4 by standings into round1 (best-of-5), then round2 finals (best-of-7)
  seedPlayoffs(week){
    for(const lg of App.state.leagues){
      const ids = App.state.teams.filter(t=>t.leagueId===lg.id).map(t=>t.id);
      const sorted = App.utils.sortStandings(lg.id, ids);
      const top4 = sorted.slice(0,4);
      if(top4.length<4) continue;
      const round1 = [
        {a:top4[0], b:top4[3], wA:0, wB:0, bestOf:5},
        {a:top4[1], b:top4[2], wA:0, wB:0, bestOf:5}
      ];
      App.state[`po_${lg.id}`] = {round:1, round1, round2:[], champion:null};
    }
  },

  playPlayoffs(week){
    function simSeries(s){
      const need = Math.ceil(s.bestOf/2);
      while(s.wA<need && s.wB<need){
        const aR = 3 + Math.random()*7, bR = 3 + Math.random()*7;
        if(aR>bR) s.wA++; else s.wB++;
      }
      return s.wA>s.wB ? s.a : s.b;
    }
    for(const lg of App.state.leagues){
      const po = App.state[`po_${lg.id}`]; if(!po) continue;
      if(po.round===1){
        const w1 = simSeries(po.round1[0]);
        const w2 = simSeries(po.round1[1]);
        po.round2 = [{a:w1, b:w2, wA:0, wB:0, bestOf:7}];
        po.round = 2;
      }else if(po.round===2){
        const champ = simSeries(po.round2[0]);
        po.champion = champ;
        const team = App.state.teams.find(t=>t.id===champ);
        App.state.champions.unshift({season:new Date().getFullYear(), leagueId:lg.id, leagueName:lg.name, teamId:champ, teamName:team?team.name:('#'+champ)});
        delete App.state[`po_${lg.id}`];
      }
    }
  },

  playWeek(week){
    this.ensureSchedule();
    const rounds = App.state.schedule.filter(s=>s.week===week);
    function addResult(leagueId, homeId, awayId, hs, as){
      // H2H tracking for tiebreaker
      const hkey = `h2h_${leagueId}`;
      const key = App.utils.keyPair(homeId, awayId);
      const h2h = (App.state[hkey] = App.state[hkey]||{});
      if(!h2h[key]) h2h[key] = {aWins:0,bWins:0};
      if(hs>as){ if(homeId<awayId) h2h[key].aWins++; else h2h[key].bWins++; }
      else     { if(homeId<awayId) h2h[key].bWins++; else h2h[key].aWins++; }

      const keyTbl = `tbl_${leagueId}`;
      const tbl = (App.state[keyTbl] = App.state[keyTbl] || {});
      tbl[homeId] = tbl[homeId] || {W:0,L:0,RS:0,RA:0};
      tbl[awayId] = tbl[awayId] || {W:0,L:0,RS:0,RA:0};
      tbl[homeId].RS += hs; tbl[homeId].RA += as;
      tbl[awayId].RS += as; tbl[awayId].RA += hs;
      if(hs>as){ tbl[homeId].W++; tbl[awayId].L++; } else { tbl[awayId].W++; tbl[homeId].L++; }
    }
    function teamPow(id){
      const ps = App.state.players.filter(p=>p.teamId===id);
      if(!ps.length) return 5;
      return ps.reduce((s,p)=>s+(p.rating||5),0)/ps.length;
    }

    for(const s of rounds){
      for(const g of s.games){
        const h = teamPow(g.homeId), a = teamPow(g.awayId);
        const base = 2.5;
        const hs = Math.max(0, Math.round(base + (Math.random()*6) + (h-5)*0.35));
        const as = Math.max(0, Math.round(base + (Math.random()*6) + (a-5)*0.35));
        g.homeScore = hs; g.awayScore = as;
        addResult(s.leagueId, g.homeId, g.awayId, hs, as);
      }
    }

    // trigger playoffs 40~45週
    if(week===40) this.seedPlayoffs(week);
    if(week>=40 && week<=45) this.playPlayoffs(week);
  }
};

// ---- Next Week Flow (4-step modal) ----
App.nextWeek = ()=>{
  if(App.state.week>=App.state.maxWeeks){
    alert('本季已結束'); return;
  }
  // 1) 模擬當週比賽 & 球員表現
  App.sim.playWeek(App.state.week);

  // 客戶簡報（精簡版）
  (function(){
    const ag = App.state.agency||{clientIds:[]};
    const clients = ag.clientIds.map(id=>App.state.players.find(p=>p.id===id)).filter(Boolean);
    for(const p of clients){
      const prevB = p._shadowB||{HR:0}; const nowB = p.stats||{AVG:0,HR:0};
      p._lastBat = {AVG: nowB.AVG, HR: (nowB.HR||0) - (prevB.HR||0), EVAL: p.eval};
      p._shadowB = {...nowB};
      const prevP = p._shadowP||{IP:0,W:0,L:0,S:0,HLD:0}; const nowP = p.statsPitch||{IP:0,W:0,L:0,S:0,HLD:0};
      p._lastPit = {IP: +((nowP.IP||0) - (prevP.IP||0)).toFixed(1), W: (nowP.W||0)-(prevP.W||0), L: (nowP.L||0)-(prevP.L||0), S: (nowP.S||0)-(prevP.S||0), HLD: (nowP.HLD||0)-(prevP.HLD||0), EVAL: p.eval};
      p._shadowP = {...nowP};
    }
  })();

  // 每 4 週：推薦（獨立）
  if(App.state.week % 4 === 0 && (App.state.agency.lastRecommendationWeek||0) !== App.state.week){
    const ag = App.state.agency;
    const pool = App.state.players.filter(p=>!(ag.clientIds||[]).includes(p.id)).sort((a,b)=>b.potential-a.potential).slice(0,20);
    if(pool.length){
      const rec = pool[Math.floor(Math.random()*pool.length)];
      ag._pendingRec = rec.id; ag.lastRecommendationWeek = App.state.week;
      App.state.recommendations.push({week:App.state.week, playerId:rec.id});
    }
  }

  // 每 4 週：公司事件（獨立）
  if(App.state.week % 4 === 0){
    const r = Math.random();
    if(r<0.33){ App.state.agency.reputation = Math.min(100, App.state.agency.reputation+2); App.state.events.push({week:App.state.week, type:'brand', text:'品牌聲量提升，更多球員願意傾聽你的提案。'}); }
    else if(r<0.66){ App.state.agency.cash += 50000; App.state.events.push({week:App.state.week, type:'deal', text:'成功替客戶媒合代言，進帳 $50,000。'}); }
    else { App.state.agency.reputation = Math.max(0, App.state.agency.reputation-2); App.state.events.push({week:App.state.week, type:'bad', text:'不利傳聞影響公司名望。'}); }
  }

  // 每週新聞（真實報導風格，只報比賽，不混事件/推薦）
  (function newsWeekly(){
    const rounds = App.state.schedule.filter(s=>s.week===App.state.week);
    if(rounds.length){
      const s = rounds[Math.floor(Math.random()*rounds.length)];
      if(s.games && s.games.length){
        const g = s.games[Math.floor(Math.random()*s.games.length)];
        const home = (App.state.teams.find(t=>t.id===g.homeId)||{}).name||'主隊';
        const away = (App.state.teams.find(t=>t.id===g.awayId)||{}).name||'客隊';
        const title = App.utils.writeGameHeadline(home, away, g.homeScore, g.awayScore);
        const lead = App.utils.writeGameLead(home, away, g.homeScore, g.awayScore);
        App.utils.pushNews(App.state.week, title, lead, ['焦點戰役','週報']);
      }
    }
  })();

  // 每週佣金/財務
  if(App.utils.agencyWeeklyTick) App.utils.agencyWeeklyTick();

  // Build 4-step modals
  const w = App.state.week;
  const clientReport = (function(){
    const ag = App.state.agency||{clientIds:[]};
    const clients = ag.clientIds.map(id=>App.state.players.find(p=>p.id===id)).filter(Boolean);
    const rows = clients.map(p=>{
      if(p.position==='P'){
        const r = p._lastPit||{IP:0,W:0,L:0,S:0,HLD:0,EVAL:p.eval};
        const tag = r.W>0?'勝投': (r.S>0?'救援': (r.HLD>0?'中繼': (r.L>0?'敗投':'登板')));
        return `<tr><td>${p.name}</td><td>${p.teamName||'-'}</td><td>${tag}</td><td>${r.IP} IP</td><td>${(r.EVAL||p.eval).toFixed(1)}</td></tr>`;
      }else{
        const r = p._lastBat||{AVG:p.stats.AVG, HR:0, EVAL:p.eval};
        return `<tr><td>${p.name}</td><td>${p.teamName||'-'}</td><td>AVG .${String(r.AVG).slice(2)}</td><td>${r.HR} HR</td><td>${(r.EVAL||p.eval).toFixed(1)}</td></tr>`;
      }
    }).join('') || '<tr><td colspan="5" class="muted">目前沒有客戶</td></tr>';
    return `<h3>本週客戶簡報（W${w}）</h3><table class="table"><thead><tr><th>球員</th><th>球隊</th><th>重點</th><th>數據</th><th>評分</th></tr></thead><tbody>${rows}</tbody></table>`;
  })();
  const eventsView = (function(){
    const items = App.state.events.filter(e=>e.week===w).map(e=>`<li>${e.text}</li>`).join('') || '<li class="muted">本週無事件</li>';
    return `<h3>本週事件</h3><ul>${items}</ul>`;
  })();
  const recsView = (function(){
    const items = App.state.recommendations.filter(r=>r.week===w).map(r=>{
      const p = App.state.players.find(x=>x.id===r.playerId);
      return `<li>球探推薦：<a href="#/player?pid=${p.id}">${p.name}</a>（${p.teamName||'FA'}）</li>`;
    }).join('') || '<li class="muted">本週無推薦</li>';
    return `<h3>球探推薦</h3><ul>${items}</ul>`;
  })();
  const paper = (function(){
    const items = App.state.news.filter(n=>n.week===w).slice(0,10).map(n=>`
      <article>
        <div class="tag">W${n.week}</div>
        ${(n.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}
        <h3>${n.title}</h3>
        <div class="by">Baseball Daily · ${new Date().toLocaleDateString()}</div>
        <div class="lead">${n.body}</div>
      </article>`).join('') || '<div class="muted">本週無新聞</div>';
    return `<h3>本週報紙</h3><div class="paper">${items}</div>`;
  })();

  App.state.week += 1;
  App.save();

  if(document.getElementById('modal-overlay') && App.ui && App.ui.showSequential){
    App.ui.showSequential([clientReport, eventsView, recsView, paper], ()=>{ App.navigate(App.state.currentRoute); });
  }else{
    App.navigate(App.state.currentRoute);
  }
};
