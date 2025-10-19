
(function(){
const STORAGE='bbt_v9';
const $=id=>document.getElementById(id);
const qa=(sel,root=document)=>[...root.querySelectorAll(sel)];
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rid=()=>Math.random().toString(36).slice(2,10);
const toast=(t)=>{const el=$('toast'); el.textContent=t; el.style.display='block'; setTimeout(()=>el.style.display='none',1200);};

// Presets
const MLB={divisions:{'AL East':[["mlb-nyy","New York Yankees"],["mlb-tbr","Tampa Bay Rays"],["mlb-tor","Toronto Blue Jays"],["mlb-bos","Boston Red Sox"],["mlb-bal","Baltimore Orioles"]],
'AL Central':[["mlb-cws","Chicago White Sox"],["mlb-cle","Cleveland Guardians"],["mlb-det","Detroit Tigers"],["mlb-kcr","Kansas City Royals"],["mlb-min","Minnesota Twins"]],
'AL West':[["mlb-hou","Houston Astros"],["mlb-oak","Oakland Athletics"],["mlb-sea","Seattle Mariners"],["mlb-tex","Texas Rangers"],["mlb-laa","Los Angeles Angels"]],
'NL East':[["mlb-atl","Atlanta Braves"],["mlb-mia","Miami Marlins"],["mlb-nym","New York Mets"],["mlb-phi","Philadelphia Phillies"],["mlb-was","Washington Nationals"]],
'NL Central':[["mlb-chc","Chicago Cubs"],["mlb-cin","Cincinnati Reds"],["mlb-mil","Milwaukee Brewers"],["mlb-pit","Pittsburgh Pirates"],["mlb-stl","St. Louis Cardinals"]],
'NL West':[["mlb-ari","Arizona Diamondbacks"],["mlb-col","Colorado Rockies"],["mlb-lad","Los Angeles Dodgers"],["mlb-sd","San Diego Padres"],["mlb-sf","San Francisco Giants"]]} };
const NPB={leagues:{'Central':[["npb-g","Yomiuri Giants"],["npb-han","Hanshin Tigers"],["npb-cd","Chunichi Dragons"],["npb-hiro","Hiroshima Carp"],["npb-dena","Yokohama DeNA BayStars"],["npb-yak","Tokyo Yakult Swallows"]],
'Pacific':[["npb-sb","SoftBank Hawks"],["npb-lotte","Lotte Marines"],["npb-seibu","Seibu Lions"],["npb-ham","Nippon-Ham Fighters"],["npb-orix","Orix Buffaloes"],["npb-rak","Rakuten Eagles"]]}};
const KBO={teams:[["kbo-ds","Doosan Bears"],["kbo-lg","LG Twins"],["kbo-kiw","Kiwoom Heroes"],["kbo-ssg","SSG Landers"],["kbo-lt","Lotte Giants"],["kbo-han","Hanwha Eagles"],["kbo-kia","KIA Tigers"],["kbo-sam","Samsung Lions"],["kbo-nc","NC Dinos"],["kbo-kt","KT Wiz"]]};
const CPBL={teams:[["cpbl-ctbc","CTBC Brothers"],["cpbl-rak","Rakuten Monkeys"],["cpbl-uni","Uni-Lions"],["cpbl-fg","Fubon Guardians"],["cpbl-wcd","Wei Chuan Dragons"],["cpbl-tsg","TSG Hawks"]]};

function genName(){const FN=["Wei","Chih","Yu","Hung","Han","Yung","Hao","Yen","Po","Yao","Kei","Shun","Daichi","Yuki","Sora","Min","Hyun","Jae","Dong","Jin","John","Alex","Carlos","Miguel","Luis","Aaron","Mike","James","Ryan","Leo"];const LN=["Lin","Chen","Wang","Liu","Huang","Suzuki","Sato","Tanaka","Yamamoto","Ito","Kim","Park","Lee","Choi","Smith","Johnson","Williams","Brown","Davis","Martinez","Lopez","Perez","Gonzalez","Hernandez","Garcia","Clark","Young"];return FN[rand(0,FN.length-1)]+' '+LN[rand(0,LN.length-1)];}
function makeBatter(tid){return {pid:rid(),name:genName(),team:tid,contact:rand(55,90),power:rand(50,95),disc:rand(45,85),speed:rand(40,85),bstats:{AB:0,H:0,R:0,RBI:0,BB:0,K:0,HR:0}};}
function makePitcher(tid, role='SP'){return {pid:rid(),name:genName(),team:tid,role,stuff:rand(55,90),control:rand(45,85),stamina: role==='SP'?rand(65,90):rand(45,75),fatigue:0,mix:['FF','SL','CH','CB','SI'].map(t=>({type:t,q:rand(50,85)}))};}
function genTeam(id,name,meta){const lineup=[...Array(9)].map(()=>makeBatter(id));const sp=makePitcher(id,'SP');const pen=[makePitcher(id,'RP'),makePitcher(id,'RP'),makePitcher(id,'RP')];return{ id,name,logo:`/static/assets/logo_${id}.svg`,lineup,order:0,sp,pen,curPitcher:sp,fin:{rev:0,price:20,cap:30000},meta};}

function buildTeams(lid){
  let teams=[];
  if(lid==='mlb'){
    for(const [div, lst] of Object.entries(MLB.divisions)){
      const lg = div.startsWith('AL') ? 'AL' : 'NL';
      lst.forEach(([id,name])=> teams.push(genTeam(id,name,{league:lg,division:div})));
    }
  }else if(lid==='npb'){
    for(const [lg, lst] of Object.entries(NPB.leagues)){
      lst.forEach(([id,name])=> teams.push(genTeam(id,name,{league:lg})));
    }
  }else{
    const base = lid==='kbo'?KBO.teams:CPBL.teams;
    base.forEach(([id,name])=> teams.push(genTeam(id,name,{})));
  }
  return teams;
}

function inchCells(){let h=''; for(let i=1;i<=12;i++) h+=`<span>${i}</span>`; $('inningLine').innerHTML=h;}
function view(v){['home','dash','game','post','manager','owner','career','import'].forEach(x=>{$('view-'+x)?.classList.add('hidden')}); qa('.tab').forEach(t=>t.classList.remove('active')); qa(`.tab[data-view="${v}"]`).forEach(t=>t.classList.add('active')); $('view-'+v)?.classList.remove('hidden');}
function ticker(msg){$('tickerLine').innerHTML=`<span class="line">${msg}　　</span>`;}

function populateHome(){ const lid=$('leagueSel').value; const teams=buildTeams(lid); $('teamSel').innerHTML=teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join(''); $('kTeams').textContent=teams.length; $('kDH').textContent='是'; $('kPlayoffs').textContent=(lid==='mlb'?'12隊':'各聯盟制'); }

function mkStandings(teams){ const o={}; teams.forEach(t=>o[t.id]={W:0,L:0}); return o; }

// Schedule (weighted pairs by structure)
function makeWeightedPairs(ids, getMeta, lid, real){
  function weight(a,b){
    if(lid==='mlb'){ const A=getMeta(a), B=getMeta(b); if(A.league===B.league){ if(A.division===B.division) return real?13:2; return real?6:1; } else { return real?4:1; } }
    if(lid==='npb'){ const A=getMeta(a), B=getMeta(b); if(A.league===B.league) return real?10:2; return real?3:1; }
    return real?12:2; // kbo/cpbl
  }
  const pairs=[]; const homeBias={};
  for(let i=0;i<ids.length;i++){
    for(let j=i+1;j<ids.length;j++){
      const a=ids[i], b=ids[j], w=weight(a,b);
      for(let k=0;k<w;k++){
        const home=(homeBias[a]||0) <= (homeBias[b]||0) ? a : b;
        const away=home===a?b:a;
        homeBias[home]=(homeBias[home]||0)+1;
        pairs.push({home,away});
      }
    }
  }
  return pairs;
}
function layoutIntoDays(pairs, ids){
  const perDay=Math.floor(ids.length/2), days=[]; let cur=[], busy=new Set(); const base=new Date(new Date().getFullYear(),3,1); let di=0;
  pairs.forEach(g=>{
    const {home:a,away:b}=g;
    if(busy.has(a)||busy.has(b)||cur.length>=perDay){ days.push({date:new Date(base.getTime()+di*86400000).toISOString().slice(0,10), games:cur}); di++; cur=[]; busy.clear(); }
    cur.push({home:a,away:b}); busy.add(a); busy.add(b);
  });
  if(cur.length) days.push({date:new Date(base.getTime()+di*86400000).toISOString().slice(0,10), games:cur});
  return days;
}

let S=null, G=null, POST=null;
function persist(){localStorage.setItem(STORAGE,JSON.stringify(S)); localStorage.setItem(STORAGE+'_post',JSON.stringify(POST));}
function load(){const a=localStorage.getItem(STORAGE); if(!a) return null; S=JSON.parse(a); POST=JSON.parse(localStorage.getItem(STORAGE+'_post')||'null'); return S;}

function startNew(){ const lid=$('leagueSel').value, mode=$('modeSel').value, nick=$('nick').value||'Player', real=$('seasonLen').value==='real'; const teams=buildTeams(lid); const ids=teams.map(t=>t.id); const getMeta=(id)=>teams.find(t=>t.id===id).meta||{}; const pairs=makeWeightedPairs(ids,getMeta,lid,real); const days=layoutIntoDays(pairs,ids); const map=Object.fromEntries(teams.map(t=>[t.id,t])); const me=$('teamSel').value||ids[0]; S={meta:{version:'v9',mode,league:lid,season:(new Date().getFullYear()),nick}, teams:map, me, dayPos:0, days, standings:mkStandings(teams)}; persist(); renderDash(); view('dash'); toast('已建立存檔'); ticker('賽季開打！'); }

// Dashboard
function today(){ return S.days[S.dayPos]; }
function renderDash(){ inchCells(); $('seasonLabel').textContent=S.meta.season; const d=today(); $('dateLabel').textContent=d?d.date:'—'; const g=d?.games.find(g=>g.home===S.me||g.away===S.me); if(g){ $('todayGame').textContent=`${S.teams[g.away].name} @ ${S.teams[g.home].name}（第 ${S.dayPos+1} 日）`; $('logoAway').src=S.teams[g.away].logo; $('logoHome').src=S.teams[g.home].logo; $('nameAway').textContent=S.teams[g.away].name; $('nameHome').textContent=S.teams[g.home].name; } else { $('todayGame').textContent='今日沒有你的比賽'; } const rec=S.standings[S.me]; $('recordLabel').textContent=`${rec.W}-${rec.L}`; renderStandings(); $('goPlayoffs').classList.toggle('hidden',!(S.dayPos>=S.days.length && !POST && S.days.length>0)); }

function groupByDivision(){ if(S.meta.league==='mlb'){ const groups={}; Object.values(S.teams).forEach(t=>{ const key=t.meta.division; if(!groups[key]) groups[key]=[]; const rec=S.standings[t.id]; const pct=rec.W/Math.max(1,rec.W+rec.L); groups[key].push({id:t.id,name:t.name,W:rec.W,L:rec.L,pct}); }); Object.values(groups).forEach(arr=>arr.sort((a,b)=>b.pct-a.pct)); return groups; } else if(S.meta.league==='npb'){ const groups={Central:[],Pacific:[]}; Object.values(S.teams).forEach(t=>{ const key=t.meta.league; const rec=S.standings[t.id]; const pct=rec.W/Math.max(1,rec.W+rec.L); groups[key].push({id:t.id,name:t.name,W:rec.W,L:rec.L,pct}); }); Object.values(groups).forEach(arr=>arr.sort((a,b)=>b.pct-a.pct)); return groups; } else { const all={'聯盟':[]}; Object.values(S.teams).forEach(t=>{ const rec=S.standings[t.id]; const pct=rec.W/Math.max(1,rec.W+rec.L); all['聯盟'].push({id:t.id,name:t.name,W:rec.W,L:rec.L,pct}); }); all['聯盟'].sort((a,b)=>b.pct-a.pct); return all; } }
function renderStandings(){ const holder=$('standings'); holder.innerHTML=''; const groups=groupByDivision(); Object.entries(groups).forEach(([g,list])=>{ const h=document.createElement('div'); h.className='groupHead'; h.textContent=g; holder.appendChild(h); const table=document.createElement('table'); table.className='table'; table.innerHTML='<thead><tr><th>隊名</th><th>W</th><th>L</th><th>PCT</th></tr></thead><tbody>'+ list.map(r=>`<tr><td>${r.name}</td><td>${r.W}</td><td>${r.L}</td><td>${r.pct.toFixed(3)}</td></tr>`).join('')+'</tbody>'; holder.appendChild(table); }); }

// Game engine
let G=null;
function curBatSide(){return G.half==='top'?'away':'home'} function curPitSide(){return G.half==='top'?'home':'away'} function curBatTeam(){return G[curBatSide()]} function curPitTeam(){return G[curPitSide()]} function curBatter(){return curBatTeam().lineup[curBatTeam().order%9]} function curPitcher(){return curPitTeam().curPitcher}
function resetCount(){G.balls=0;G.strikes=0} function nextBatter(){curBatTeam().order=(curBatTeam().order+1)%9}
function pushLog(m){const f=$('feed'); const p=document.createElement('p'); p.textContent=m; f.appendChild(p); f.scrollTop=f.scrollHeight; ticker(m);}
function fillBox(id,lineup){const tb=$(id).querySelector('tbody'); tb.innerHTML=lineup.map(b=>`<tr><td>${b.name}</td><td>${b.bstats.AB||0}</td><td>${b.bstats.H||0}</td><td>${b.bstats.R||0}</td><td>${b.bstats.RBI||0}</td><td>${b.bstats.BB||0}</td><td>${b.bstats.K||0}</td><td>${b.bstats.HR||0}</td></tr>`).join('');}
function updateBaseLights(){ ['bl1','bl2','bl3'].forEach((id,i)=>$(id).classList.toggle('on',G.bases[i]===1)); }
function updateHUD(){ ['b1','b2','b3'].forEach((id,i)=>$(id).classList.toggle('on',G.balls>i)); ['s1','s2'].forEach((id,i)=>$(id).classList.toggle('on',G.strikes>i)); ['o1','o2'].forEach((id,i)=>$(id).classList.toggle('on',G.outs>i)); $('scoreAway').textContent=G.score.away; $('scoreHome').textContent=G.score.home; $('rheA').textContent=G.rhe.away.join('/'); $('rheH').textContent=G.rhe.home.join('/'); updateBaseLights(); }
function endHalf(){ G.outs=0; G.bases=[0,0,0]; resetCount(); G.half=G.half==='top'?'bot':'top'; if(G.half==='top') G.inning++; pushLog('— 半局結束');}
function scoreRun(n){G.score[curBatSide()]+=n; G.rhe[curBatSide()][0]=G.score[curBatSide()]}
function advance(n){const b=G.bases;for(let i=0;i<n;i++){if(b[2]){scoreRun(1);b[2]=0;} if(b[1]){b[2]=1;b[1]=0;} if(b[0]){b[1]=1;b[0]=0;}}}
function walk(){const b=G.bases;if(b[0]&&b[1]&&b[2])scoreRun(1); else if(b[0]&&b[1]&&!b[2]) b[2]=1; else if(b[0]&&!b[1]) b[1]=1; b[0]=1;}

function outcome(){const bat=curBatter(),pit=curPitcher(),off=$('offTactic').value,pType=$('pitchType').value; if(off==='ibb') return 'BB'; if(off==='bunt'&&G.outs<2&&(G.bases[0]||G.bases[1])) return Math.random()<0.72?'SAC':'FOUL'; if(off==='steal'&&(G.bases[0]||G.bases[1])) return Math.random()<0.58?'STEAL_OK':'STEAL_OUT'; const q=(pit.mix.find(x=>x.type===pType)?.q||60), effStuff=pit.stuff-Math.floor(pit.fatigue/12), effCtrl=pit.control-Math.floor(pit.fatigue/10); let pBall=.33-(effCtrl-60)/400+(bat.disc-60)/300, pStrike=.27+(effCtrl-60)/400-(bat.disc-60)/300, pFoul=.12+(bat.contact-60)/400, pInPlay=1-(pBall+pStrike+pFoul); pStrike+=(q-60)/300; pInPlay+=(effStuff-60)/500-(q-60)/600; pBall=clamp(pBall,0.05,0.6); pStrike=clamp(pStrike,0.1,0.6); pFoul=clamp(pFoul,0.05,0.4); pInPlay=clamp(pInPlay,0.05,0.6); const r=Math.random(); if(r<pBall) return 'BALL'; if(r<pBall+pStrike) return 'STRIKE'; if(r<pBall+pStrike+pFoul) return 'FOUL'; const hitP=clamp(0.25+(bat.contact-60)/400+(bat.power-60)/500-(effStuff-60)/600,0.12,0.43), hrP=clamp(0.03+(bat.power-70)/300,0.005,0.12), xbP=clamp(0.09+(bat.power-60)/400,0.02,0.28); if(Math.random()<hitP){ if(Math.random()<hrP) return 'HR'; return Math.random()<xbP?(Math.random()<0.85?'2B':'3B'):'1B'; } return 'OUT';}

function playOne(){ if(!G||G.finished) return; const o=outcome(); const bat=curBatter(), pit=curPitcher(); if(o==='BALL'){G.balls++;pushLog('壞球'); if(G.balls>=4){walk();bat.bstats.BB=(bat.bstats.BB||0)+1;pushLog('保送'); nextBatter(); resetCount();}} else if(o==='STRIKE'){G.strikes++;pushLog('好球'); if(G.strikes>=3){bat.bstats.K=(bat.bstats.K||0)+1;G.outs++;pushLog(`${bat.name} 三振`); nextBatter(); resetCount();}} else if(o==='FOUL'){ if(G.strikes<2) G.strikes++; pushLog('界外球'); } else if(o==='STEAL_OK'){ if(G.bases[0]&&!G.bases[1]){G.bases[0]=0;G.bases[1]=1;} else if(G.bases[1]&&!G.bases[2]){G.bases[2]=1;} pushLog('⚡ 盜壘成功'); } else if(o==='STEAL_OUT'){ if(G.bases[1]) G.bases[1]=0; else if(G.bases[0]) G.bases[0]=0; G.outs++; pushLog('🔒 盜壘失敗'); } else if(o==='SAC'){ advance(1); G.outs++; pushLog('犧牲短打'); nextBatter(); } else if(o==='BB'){ walk(); bat.bstats.BB=(bat.bstats.BB||0)+1; nextBatter(); } else if(o==='1B'){ advance(1); G.bases[0]=1; bat.bstats.AB=(bat.bstats.AB||0)+1; bat.bstats.H=(bat.bstats.H||0)+1; pushLog('一壘安打'); nextBatter(); } else if(o==='2B'){ advance(2); G.bases[1]=1; G.bases[0]=0; bat.bstats.AB=(bat.bstats.AB||0)+1; bat.bstats.H=(bat.bstats.H||0)+1; pushLog('二壘安打'); nextBatter(); } else if(o==='3B'){ advance(3); G.bases[2]=1; G.bases[1]=0; G.bases[0]=0; bat.bstats.AB=(bat.bstats.AB||0)+1; bat.bstats.H=(bat.bstats.H||0)+1; pushLog('三壘安打'); nextBatter(); } else if(o==='HR'){ const runs=1+G.bases[0]+G.bases[1]+G.bases[2]; G.bases=[0,0,0]; scoreRun(runs); bat.bstats.AB=(bat.bstats.AB||0)+1; bat.bstats.H=(bat.bstats.H||0)+1; bat.bstats.HR=(bat.bstats.HR||0)+1; pushLog('💥 全壘打！'+runs+' 分'); $('overlayGame').style.display='block'; setTimeout(()=>$('overlayGame').style.display='none',900); nextBatter(); } else if(o==='OUT'){ G.outs++; bat.bstats.AB=(bat.bstats.AB||0)+1; pushLog('出局'); nextBatter(); } pit.fatigue+=rand(1,3); if(G.outs>=3) endHalf(); updateHUD(); fillBox('boxAway',G.away.lineup); fillBox('boxHome',G.home.lineup); }

function autoHalf(){let i=0; while(G && G.outs<3 && i++<400) playOne();}
function autoGame(){let i=0; while(G && G.inning<=12 && i++<6000) playOne(); if(G && G.inning>12) finishGame();}
function initGame(){const d=today(); if(!d){alert('球季結束'); return;} const g=d.games.find(x=>x.home===S.me||x.away===S.me); if(!g){alert('今日沒有你的比賽'); return;} G={away:S.teams[g.away],home:S.teams[g.home],inning:1,half:'top',outs:0,balls:0,strikes:0,bases:[0,0,0],score:{away:0,home:0},rhe:{away:[0,0,0],home:[0,0,0]},finished:false}; $('feed').innerHTML=''; $('boxAwayName').textContent=G.away.name; $('boxHomeName').textContent=G.home.name; fillBox('boxAway',G.away.lineup); fillBox('boxHome',G.home.lineup); updateHUD(); view('game'); }

// Full-day sim
function teamStrength(t){ const bat=(t.lineup.reduce((s,b)=>s+b.contact+b.power,0)/t.lineup.length); const pit=t.sp.stuff; return (bat+pit)/3; }
function quickSimGame(home, away){ const th=teamStrength(home), ta=teamStrength(away); const base=4.2; const diff=(th-ta)/20; const homeRuns=Math.max(0,Math.round(base+1.1+diff+(Math.random()*3-1.5))); const awayRuns=Math.max(0,Math.round(base-0.1-diff+(Math.random()*3-1.5))); return {homeRuns,awayRuns}; }
function applyResult(game, sh, sa){ if(sh>sa){ S.standings[game.home].W++; S.standings[game.away].L++; } else { S.standings[game.away].W++; S.standings[game.home].L++; } }
function simTodayAll(includeMy){ const d=today(); if(!d) return; const my=d.games.find(x=>x.home===S.me||x.away===S.me); d.games.forEach(g=>{ if(!includeMy && my && g.home===my.home && g.away===my.away) return; const r=quickSimGame(S.teams[g.home],S.teams[g.away]); applyResult(g,r.homeRuns,r.awayRuns); }); S.dayPos++; persist(); renderDash(); }
function finishGame(){ const d=today(); const my=d?.games.find(x=> (S.teams[x.home].name===G.home.name && S.teams[x.away].name===G.away.name) ); const game={home:G.home.id,away:G.away.id}; const win= G.score.home===G.score.away ? (Math.random()<0.5?'home':'away') : (G.score.home>G.score.away?'home':'away'); applyResult(game, win==='home'?1:0, win==='away'?1:0); simTodayAll(false); view('dash'); }

// Events
function attach(){ qa('.bottomnav .tab').forEach(t=>t.addEventListener('click',e=>{e.preventDefault(); view(t.dataset.view);})); $('leagueSel').addEventListener('change',populateHome); $('startCareer').addEventListener('click',startNew); $('loadSave').addEventListener('click',()=>{ if(load()){ renderDash(); view('dash'); } else alert('沒有存檔'); }); $('playToday').addEventListener('click',()=>{ initGame(); }); $('simToday').addEventListener('click',()=>{ simTodayAll(true); }); $('simToEnd').addEventListener('click',()=>{ while(S.dayPos<S.days.length){ simTodayAll(true); } renderDash(); $('banner').textContent='REGULAR SEASON COMPLETE'; $('banner').style.display='block'; setTimeout(()=>$('banner').style.display='none',1500); }); $('pitch').addEventListener('click',playOne); $('autoHalf').addEventListener('click',autoHalf); $('autoGame').addEventListener('click',autoGame); $('swapPitcher').addEventListener('click',()=>{ if(!G) return; const t=G[curPitSide()]; const nxt=t.pen.shift(); if(!nxt){alert('牛棚用盡');return;} t.pen.push(t.curPitcher); t.curPitcher=nxt; pushLog('換投：'+nxt.name); }); $('leaveGame').addEventListener('click',()=>{ view('dash'); renderDash(); }); }
window.addEventListener('load',()=>{ attach(); populateHome(); if(load()){ renderDash(); view('dash'); } else { view('home'); } });
})();