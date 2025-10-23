
// v1.7.0 — Extra leagues: ABL (Australia) & CBL (China)
(function(){
  function ensureExtraLeagues(){
    const leagues = App.state.leagues;
    // Add league tiers mapping (1=top)
    const tierByName = {
      'MLB':1, 'NPB':2, 'KBO':2, 'CPBL':3, 'ABL':4, 'CBL':4
    };
    // Ensure tier on every league
    for(const lg of leagues){
      if(lg.tier==null){
        lg.tier = tierByName[lg.name] || 3;
      }
    }
    // Replace MLB teams to full 30 if not already 30
    const mlb = leagues.find(l=>l.name==='MLB');
    if(mlb){
      if(!mlb.teams || mlb.teams.length<30){
        mlb.teams = (window.BAM_MLB_FULL||[]).map(t=>Object.assign({leagueId: mlb.id}, t));
      }else{
        // also backfill divisions if missing
        for(const t of mlb.teams){
          const full = (window.BAM_MLB_FULL||[]).find(x=>x.name===t.name);
          if(full && !t.division) t.division = full.division;
        }
      }
    }
    // Add ABL if missing
    if(!leagues.some(l=>l.name==='ABL')){
      const ablId = (Math.max(...leagues.map(l=>l.id))+1) || 10;
      leagues.push({
        id: ablId, name:'ABL', country:'Australia', level:'Top', tier:4,
        teams:[
          {id:801,name:'Adelaide Giants', country:'Australia', level:'ABL', leagueId: ablId},
          {id:802,name:'Brisbane Bandits', country:'Australia', level:'ABL', leagueId: ablId},
          {id:803,name:'Canberra Cavalry', country:'Australia', level:'ABL', leagueId: ablId},
          {id:804,name:'Melbourne Aces', country:'Australia', level:'ABL', leagueId: ablId},
          {id:805,name:'Perth Heat', country:'Australia', level:'ABL', leagueId: ablId},
          {id:806,name:'Sydney Blue Sox', country:'Australia', level:'ABL', leagueId: ablId},
          {id:807,name:'Geelong-Korea', country:'Australia', level:'ABL', leagueId: ablId},
          {id:808,name:'Auckland Tuatara', country:'New Zealand', level:'ABL', leagueId: ablId}
        ]
      });
    }
    // Add CBL (China) if missing
    if(!leagues.some(l=>l.name==='CBL')){
      const cblId = (Math.max(...leagues.map(l=>l.id))+2) || 11;
      leagues.push({
        id: cblId, name:'CBL', country:'China', level:'Top', tier:4,
        teams:[
          {id:901,name:'Beijing Tigers', country:'China', level:'CBL', leagueId: cblId},
          {id:902,name:'Tianjin Lions', country:'China', level:'CBL', leagueId: cblId},
          {id:903,name:'Shanghai Golden Eagles', country:'China', level:'CBL', leagueId: cblId},
          {id:904,name:'Guangdong Leopards', country:'China', level:'CBL', leagueId: cblId},
          {id:905,name:'Jiangsu Pegasus', country:'China', level:'CBL', leagueId: cblId},
          {id:906,name:'Sichuan Dragons', country:'China', level:'CBL', leagueId: cblId}
        ]
      });
    }
    // rebuild teams flat list
    App.state.teams = leagues.flatMap(lg=> (lg.teams||[]).map(t=>Object.assign({},t,{leagueId:lg.id, leagueName:lg.name})));
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    // wait a tick after App.init
    setTimeout(()=>{
      try{ ensureExtraLeagues(); App.save(); }catch(e){ console.warn('ensureExtraLeagues failed', e); }
    }, 50);
  });
})();
