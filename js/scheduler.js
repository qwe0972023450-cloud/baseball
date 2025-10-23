(function(){
  function ensureSeasonSchedule(state){
    const {leagues}=state;
    for(const lg of leagues){
      if(lg.schedule && lg.schedule.length) continue;
      const teams=lg.teams.map(t=>t.id);
      const target=lg.config.gamesPerTeam||120;
      const pairs=[];
      for(let i=0;i<teams.length;i++){for(let j=i+1;j<teams.length;j++){pairs.push([teams[i],teams[j]]);}}
      const repeats=Math.max(1,Math.round((target/((teams.length-1)))/2));
      let matchups=[];
      for(let r=0;r<repeats;r++){matchups=matchups.concat(pairs);}
      for(let i=matchups.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[matchups[i],matchups[j]]=[matchups[j],matchups[i]];}
      const weeks=52, perWeek=Math.ceil(matchups.length/weeks);
      lg.schedule=[];
      for(let w=1;w<=weeks;w++){
        const start=(w-1)*perWeek;
        const chunk=matchups.slice(start,start+perWeek);
        lg.schedule.push({week:w,games:chunk.map(([a,b])=>({home:Math.random()<.5?a:b,away:Math.random()<.5?a:b}))});
      }
    }
  }
  function getTeam(state,id){for(const lg of state.leagues){const t=lg.teams.find(x=>x.id===id);if(t)return t;}return null;}
  function teamPower(state,team){const roster=(state.rosters[team.id]||[]);const avg=roster.length?(roster.reduce((s,p)=>s+(p.rating||50),0)/roster.length):50;return avg;}
  function bumpRandomPlayerStats(state,team,runs){
    const roster=state.rosters[team.id]||[]; if(!roster.length) return;
    const p=roster[Math.floor(Math.random()*roster.length)]; p.stats=p.stats||{G:0,AB:0,H:0,HR:0,OPS:0,RBI:0,ERA:0,IP:0,SO:0};
    p.stats.G++; const ab=Math.max(3,Math.round(3+Math.random()*2));
    p.stats.AB+=ab; const hits=Math.min(ab,Math.round(Math.random()*ab));
    p.stats.H+=hits; p.stats.HR+=(Math.random()<0.1?1:0); p.stats.RBI+=Math.round(Math.random()*runs);
    const obp=(p.stats.H/Math.max(1,p.stats.AB)); p.stats.OPS=+(obp+0.4+Math.random()*0.6).toFixed(3);
  }
  function playerEvaluation(p){
    const base=p.stats?.OPS||0.700; let score=5;
    if(base<.550) score=2; else if(base<.650) score=3.5; else if(base<.725) score=5.5; else if(base<.800) score=7.5; else if(base<.900) score=8.5; else score=9.2;
    p.eval=+score.toFixed(1); return p.eval;
  }
  function ratingGrowthAndContracts(state){
    for(const teamId of Object.keys(state.rosters)){
      const roster=state.rosters[teamId];
      roster.forEach(p=>{
        if(!p.ceiling) p.ceiling=Math.min(99,Math.round((p.rating||50)+10+Math.random()*30));
        const ev=playerEvaluation(p);
        if(ev>=7) p.rating=Math.min(p.ceiling,+((p.rating||50)+Math.random()*1.2).toFixed(1));
        else if(ev<=2 && (p.weeksLow=(p.weeksLow||0)+1)>=4){ p.status='Released'; }
        else if(ev>=3 && ev<5){ p.status='Waivers'; }
        else { p.status='Active'; p.weeksLow=0; }
      });
    }
  }
  function weeklyNews(state){
    const all=Object.values(state.rosters).flat();
    if(all.length){
      const sorted=all.filter(p=>p.stats?.G>0).sort((a,b)=>(b.stats?.OPS||0)-(a.stats?.OPS||0));
      if(sorted[0]) state.news.unshift({type:'BEST',text:`本週最佳球員：${sorted[0].name}（OPS ${sorted[0].stats.OPS}）`,ts:Date.now()});
      const worst=sorted[sorted.length-1];
      if(worst) state.news.unshift({type:'WORST',text:`本週狀況最差：${worst.name}（OPS ${worst.stats.OPS}）`,ts:Date.now()});
    }
    if(Math.random()<0.2){const lg=state.leagues[Math.floor(Math.random()*state.leagues.length)];state.news.unshift({type:'EVENT',text:`${lg.name} 傳出自由市場大消息，數名球員傳聞將被交易。`,ts:Date.now()});}
  }
  function calcChampion(lg){
    const standings=(lg.teams||[]).slice().sort((a,b)=>((b.stats?.W||0)-(b.stats?.L||0))-((a.stats?.W||0)-(a.stats?.L||0)));
    return standings[0]||lg.teams[0];
  }
  function processWeek(state){
    ensureSeasonSchedule(state);
    for(const lg of state.leagues){
      const wk=(lg.schedule||[]).find(s=>s.week===state.week); if(!wk) continue;
      for(const g of wk.games){
        const home=getTeam(state,g.home), away=getTeam(state,g.away);
        const homePow=teamPower(state,home), awayPow=teamPower(state,away);
        const homeScore=Math.max(0,Math.round((homePow*0.1 + Math.random()*6)));
        const awayScore=Math.max(0,Math.round((awayPow*0.1 + Math.random()*6)));
        if(!home.stats) home.stats={W:0,L:0,R:0,RA:0};
        if(!away.stats) away.stats={W:0,L:0,R:0,RA:0};
        home.stats.R+=homeScore; home.stats.RA+=awayScore; away.stats.R+=awayScore; away.stats.RA+=homeScore;
        if(homeScore>=awayScore){home.stats.W++;away.stats.L++;}else{away.stats.W++;home.stats.L++;}
        bumpRandomPlayerStats(state,home,homeScore); bumpRandomPlayerStats(state,away,awayScore);
      }
    }
    ratingGrowthAndContracts(state); weeklyNews(state);
    if(state.week===45){
      for(const lg of state.leagues){
        if(state.champions[lg.key]) continue;
        const champ=calcChampion(lg);
        state.champions[lg.key]={year:state.year,teamId:champ.id,name:champ.name};
        state.news.unshift({type:'CHAMP',league:lg.name,text:`${lg.name} 產生冠軍：${champ.name}！`,ts:Date.now()});
      }
    }
    state.week=Math.min(52,state.week+1);
  }
  window.BAMScheduler={processWeek};
})();