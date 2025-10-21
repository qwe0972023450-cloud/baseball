let _timer=null;
const Engine = {
  tickWeek(){
    Store.players.forEach(p=>simulatePlayerWeek(p));
    evaluatePlayers();
    produceWeeklyNews();
    if(Store.week===Store.settings.weeksPerSeason){
      awardChampions();
      Store.season += 1; Store.week = 0;
      retireAgingPlayers();
      Store.players.forEach(p=>p.weeklyRatings=[]);
    }
    Store.week += 1; persist(); Router.render(location.hash);
  },
  auto(start=true){
    if(start){ if(_timer) return; Store.settings.autoSim=true; _timer=setInterval(()=>Engine.tickWeek(),800); }
    else { Store.settings.autoSim=false; clearInterval(_timer); _timer=null; }
  }
};
function simulatePlayerWeek(p){
  if(p.status!=='active') return;
  const perf = Math.max(1, Math.min(10, Math.round(normal(p.ovr/10,1.2))));
  p.weeklyRatings.push(perf); if(p.weeklyRatings.length>4) p.weeklyRatings.shift();
  const games=5, ab=3+Math.floor(Math.random()*10);
  const hitRate = Math.min(0.45, Math.max(0.15, 0.18 + (p.ovr-50)/500 + (perf-5)/50 ));
  const hits = Math.round(ab*hitRate); const hr = Math.random()<(0.02+p.ovr/5000+perf/500)?1:0;
  p.season.G += games; p.season.AB += ab; p.season.H += hits; p.season.HR += hr; p.season.RBI += Math.round(hits*0.6 + hr*1.5);
  calcAVG(p);
  const avg4 = p.weeklyRatings.reduce((a,b)=>a+b,0)/p.weeklyRatings.length;
  if(avg4>=7) p.ovr = Math.min(99, p.ovr + (avg4>=9?2:1));
  else if(avg4<=3) p.ovr = Math.max(35, p.ovr - 1);
  p.role = roleByAvgScore(avg4);
}
function evaluatePlayers(){
  Store.players.forEach(p=>{
    if(p.weeklyRatings.length<4) return;
    const avg4 = p.weeklyRatings.slice(-4).reduce((a,b)=>a+b,0)/4;
    if(avg4<2){ p.status='released'; p.teamId=null; p.team='FA'; if(!Store.freeAgents.includes(p.id)) Store.freeAgents.push(p.id); }
    else if(avg4>=3 && avg4<5){ p.status='waived'; if(!Store.waiver.includes(p.id)) Store.waiver.push(p.id); }
    else { if(p.status==='waived') p.status='active'; }
  });
}
function awardChampions(){
  Leagues.leagues.forEach(L=>{
    const tally={};
    Store.players.forEach(p=>{
      if(!p.teamId) return;
      const team = Store.teams.find(t=>t.id===p.teamId);
      if(!team || team.leagueId!==L.id) return;
      (tally[p.teamId] ||= { team:p.team, ab:0, h:0 });
      tally[p.teamId].ab += p.season.AB; tally[p.teamId].h += p.season.H;
    });
    let best=null,bestAvg=-1; Object.values(tally).forEach(t=>{ const avg=t.ab? t.h/t.ab:0; if(avg>bestAvg){bestAvg=avg; best=t;} });
    if(best) Store.champions[L.id] = { league:L.name, team:best.team, avg:bestAvg, season:Store.season };
  });
}
function retireAgingPlayers(){
  Store.players.forEach(p=>{
    if(p.status==='retired') return;
    if(p.age>=35){
      const base=(p.age-34)*0.03;
      const chance=Math.min(0.33, base + (p.ovr<55?0.06:0) - (p.ovr>85?0.04:0));
      if(Math.random()<chance) p.status='retired'; else p.age+=1;
    }else p.age+=1;
  });
}
function produceWeeklyNews(){
  let best=null,worst=null,bS=-1,wS=99;
  Store.players.forEach(p=>{
    const last=p.weeklyRatings[p.weeklyRatings.length-1];
    if(last!=null){ if(last>bS){bS=last;best=p;} if(last<wS){wS=last;worst=p;} }
  });
  const date=`S${Store.season} W${Store.week}`;
  const lead=`例行賽來到第 ${Store.week} 週，焦點持續聚集在頂尖戰力與黑馬球員身上。`;
  const items=[];
  if(best) items.push({title:'本週最佳球員', text:`${best.team} 的 ${best.name} 評分 ${bS}/10，火力全開！AVG ${(best.season.AVG||0).toFixed(3)}。`});
  if(worst) items.push({title:'本週最差球員', text:`${worst.team} 的 ${worst.name} 僅 ${wS}/10，教練團考慮調整。`});
  if(Math.random()<0.25) items.push({title:'傷兵名單', text:'數名球員傳出小傷，預期休兵 1–2 週。'});
  Store.news.unshift({date,lead,items}); if(Store.news.length>30) Store.news.pop();
}
function normal(mu,sigma){let u=0,v=0;while(u===0)u=Math.random();while(v===0)v=Math.random();const n=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);return n*sigma+mu;}