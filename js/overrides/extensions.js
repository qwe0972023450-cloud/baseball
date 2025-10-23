
// v1.7.0 — Systems upgrade: agency, potential/scouting, weekly flow & sign logic
(function(){
  function ensureAgency(){
    const ag = App.state.agency || (App.state.agency={});
    if(ag.level==null) ag.level = 1;
    if(ag.capacity==null) ag.capacity = 8;
    if(ag.clients==null) ag.clients = []; // store playerIds
    if(ag.reputation==null) ag.reputation = 0;
    if(ag.xp==null) ag.xp = 0;
    if(ag.nextRecWeek==null) ag.nextRecWeek = 4;
  }
  function ensurePlayerFields(){
    for(const p of App.state.players){
      if(p.age==null) p.age = 18 + Math.floor(Math.random()*20); // 18-38
      if(p.ovr==null) p.ovr = Math.round(40 + Math.random()*40); // 40-80
      if(p.potential==null) p.potential = Math.round(p.ovr + 5 + Math.random()*15); // ovr..ovr+20
      if(p.scout==null) p.scout = (20 + Math.round(Math.random()*60)); // 20-80
      if(p.ceilingTier==null) p.ceilingTier = (p.ovr>70?1:(p.ovr>60?2:(p.ovr>50?3:4)));
      if(p.defPositions==null) p.defPositions = [p.position||'IF'];
      if(p.rating==null) p.rating = Math.max(1, Math.min(100, Math.round((p.ovr+p.scout)/2)));
      if(p.eval==null) p.eval = Math.round(p.rating/10);
      if(p.status==null) p.status = 'active'; // 'active'|'retired'|'injured' ...
    }
  }
  function upgradeCapacityIfNeeded(){
    const ag = App.state.agency;
    const thresholds = [0, 10, 30, 70, 120, 180, 260]; // xp thresholds
    const caps       = [8, 10, 12, 15, 18, 22, 26];
    let lvl = ag.level;
    while(lvl+1<=thresholds.length && ag.xp>=thresholds[lvl]){
      lvl += 1;
    }
    if(lvl!==ag.level){
      ag.level = lvl;
      ag.capacity = caps[Math.min(lvl-1, caps.length-1)];
      App.utils.pushToast && App.utils.pushToast(`經紀公司升級至 Lv.${lvl}！客戶席位提升至 ${ag.capacity}`);
    }
  }

  // Extend utils
  App.utils = Object.assign(App.utils||{}, {
    leagueTier(leagueId){
      const lg = App.state.leagues.find(l=>l.id===leagueId);
      return lg? (lg.tier||3) : 3;
    },
    signDifficultyForTier(tier){
      // 1 easiest number? Here higher number more difficult; used as requirement baseline
      return ({1:80, 2:70, 3:60, 4:50}[tier] || 60);
    },
    canSignPlayer(p){
      const ag = App.state.agency;
      if(!ag) return {ok:false, reason:'Agency 未初始化'};
      if(ag.clients.includes(p.id)) return {ok:false, reason:'已是你的客戶'};
      if(ag.clients.length>=ag.capacity) return {ok:false, reason:'客戶席位已滿'};
      // Difficulty relative to current team league tier or desired tier (use current)
      const t = App.state.teams.find(t=>t.id===p.teamId);
      const tier = t? App.utils.leagueTier(t.leagueId) : 3;
      const need = App.utils.signDifficultyForTier(tier);
      const score = p.rating + (App.state.agency.reputation||0);
      return (score>=need) ? {ok:true} : {ok:false, reason:`評分不足（需求≥${need}，目前 ${score}）`};
    },
    signPlayer(p){
      const chk = App.utils.canSignPlayer(p);
      if(!chk.ok){ alert('無法簽約：'+chk.reason); return false; }
      const ag = App.state.agency;
      ag.clients.push(p.id);
      ag.xp += Math.round(3 + p.rating/20);
      App.utils.pushNews(App.state.week, `簽約成功：${p.name}`, `你與 ${p.name} 正式簽下經紀合約！`, ['簽約','經紀']);
      App.save();
      upgradeCapacityIfNeeded();
      return true;
    },
    playerById(id){
      return App.state.players.find(x=>x.id===id);
    },
    ensureWeeklyRecommendation(){
      const ag = App.state.agency;
      if(!ag) return;
      const w = App.state.week;
      if(w>=ag.nextRecWeek){
        // recommend a FA or random non-client active player
        const pool = App.state.players.filter(p=>p.status==='active' && !ag.clients.includes(p.id));
        if(pool.length){
          const candidate = pool[Math.floor(Math.random()*pool.length)];
          App.state.recommendation = { week:w, playerId: candidate.id };
          ag.nextRecWeek = w + 4;
          App.utils.pushNews(w, '球員推薦', `球探推薦你關注 ${candidate.name}（評分 ${candidate.rating}，潛力 ${candidate.potential}）。`, ['推薦','球探']);
        }
      }
    },
    // Wrap simPlayerWeek to add potential growth & age/retirement
    _orig_simPlayerWeek: App.utils.simPlayerWeek
  });

  App.utils.simPlayerWeek = function(p){
    try{
      if(typeof App.utils._orig_simPlayerWeek === 'function'){
        App.utils._orig_simPlayerWeek(p);
      }
    }catch(e){ /* ignore */ }
    // gradual growth toward potential until ~28-30
    if(p.status==='active'){
      const growthPeak = 29;
      const ageFactor = (p.age<growthPeak) ? 1 : (p.age<33 ? 0.4 : -0.6);
      const gap = (p.potential||p.ovr) - p.ovr;
      const delta = (gap>0? 0.15*Math.random()*ageFactor : -0.05*Math.random());
      p.ovr = Math.max(30, Math.min(95, p.ovr + delta));
      p.rating = Math.max(1, Math.min(100, Math.round((p.ovr + (p.scout||p.ovr))/2)));
      // small chance of injury reducing weekly stats
      if(Math.random()<0.04){ p.status = 'injured'; App.utils.pushNews(App.state.week, `${p.name} 受傷`, `傳出輕傷，短期影響表現。`, ['傷勢']); }
      else if(p.status==='injured' && Math.random()<0.3){ p.status='active'; }
      // retirement check age 35-45
      if(p.age>=35){
        const chance = Math.min(0.02*(p.age-34), 0.2); // up to 20% weekly at 45
        if(Math.random()<chance){
          p.status='retired'; p.teamId=null; p.teamName=''; 
          App.utils.pushNews(App.state.week, `退休：${p.name}`, `${p.name} 宣布退休。`, ['退休']);
        }
      }
    }
    if(Math.random()<0.02){ p.age += (1/52); } // coarse aging across season
  };

  // Weekly flow override
  (function(){
    const origNextWeek = App.nextWeek;
    App.nextWeek = function(){
      // If season ended, fall back to original (it resets etc.)
      if(App.state.week>App.state.maxWeeks){
        return origNextWeek ? origNextWeek() : null;
      }
      App.sim.playWeek(App.state.week);
      App.state.week += 1;
      ensureAgency();
      ensurePlayerFields();
      App.utils.ensureWeeklyRecommendation();
      App.save();
      // kick off 2-step weekly flow
      App.state._weeklyFlow = {week: App.state.week-1, step:1};
      App.navigate('weekly');
    };
  })();

  // Initialize on load
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(()=>{ 
      try{
        ensureAgency(); ensurePlayerFields(); upgradeCapacityIfNeeded();
      }catch(e){ console.warn('init extensions failed', e); }
    }, 50);
  });
})();
