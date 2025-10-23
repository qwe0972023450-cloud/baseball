
App.registerPage('teams', {
  title:'聯盟/戰績',
  render(state){
    function tableForLeague(lg){
      const teams = state.teams.filter(t=>t.leagueId===lg.id);
      const key = `tbl_${lg.id}`;
      if(!Object.keys(state[key]||{}).length){
        return `<div class="muted">尚未有戰績</div>`;
      }
      function renderRows(ids){
        const rows = App.utils.getStandings(lg.id).filter(r=>!ids || ids.includes(r.tid)).map(r=>{
          const t = state.teams.find(x=>x.id===r.tid);
          return `<tr><td>${t.name}</td><td>${r.W}</td><td>${r.L}</td><td>${(r.WPCT*100).toFixed(1)}%</td><td>${r.GB}</td><td>${r.RS}</td><td>${r.RA}</td><td>${r.RD}</td></tr>`;
        }).join('');
        return `<table class="table"><thead><tr><th>球隊</th><th>W</th><th>L</th><th>勝率</th><th>GB</th><th>RS</th><th>RA</th><th>RD</th></tr></thead><tbody>${rows}</tbody></table>`;
      }
      if(lg.name==='MLB'){
        const divs = ['AL East','AL Central','AL West','NL East','NL Central','NL West'];
        return divs.map(d=>{
          const ids = teams.filter(t=>t.division===d).map(t=>t.id);
          return `<section class="card"><h3>${d}</h3>${renderRows(ids)}</section>`;
        }).join('');
      }else{
        return `<section class="card"><h3>${lg.name}</h3>${renderRows()}</section>`;
      }
    }
    const blocks = state.leagues.map(lg=> tableForLeague(lg)).join('');
    return `<div class="grid">${blocks}</div>`;
  }
});
