
App.registerPage('league', {
  title: '聯盟',
  render(state){
    const qs = (location.hash.split('?')[1]||'');
    const params = new URLSearchParams(qs);
    const lid = +(params.get('lg')||1);
    const lg = state.leagues.find(l=>l.id===lid) || state.leagues[0];
    const teams = state.teams.filter(t=>t.leagueId===lg.id);
    const divisions = lg.divisions||[];

    function tableFor(teamIds){
      const rows = App.utils.computeStandings(lg.id, teamIds);
      const tr = rows.map(r=>{
        const t = state.teams.find(x=>x.id===r.teamId);
        return `<tr><td>${t.name}</td><td>${r.W}</td><td>${r.L}</td><td>${(r.WP*100).toFixed(1)}%</td><td>${r.GB.toFixed(1)}</td><td>${r.RS}</td><td>${r.RA}</td><td>${r.RD}</td></tr>`;
      }).join('') || `<tr><td colspan="8" class="muted">尚未有戰績</td></tr>`;
      return `<table class="table"><thead><tr><th>球隊</th><th>W</th><th>L</th><th>勝率</th><th>勝差</th><th>RS</th><th>RA</th><th>RD</th></tr></thead><tbody>${tr}</tbody></table>`;
    }

    const blocks = (divisions.length? divisions.map(d=>{
      const ids = teams.filter(t=>t.division===d).map(t=>t.id);
      return `<section class="card"><h2>${lg.name} · ${d}</h2>${tableFor(ids)}</section>`;
    }).join('') : `<section class="card"><h2>${lg.name} 戰績</h2>${tableFor(teams.map(t=>t.id))}</section>`);

    const switcher = state.leagues.map(x=>`<a class="btn${x.id===lg.id?' primary':''}" href="#/league?lg=${x.id}">${x.name}</a>`).join('');

    return `<div class="grid">
      <section class="card">
        <h2>${lg.name} 分頁</h2>
        <div class="btn-row">${switcher}</div>
      </section>
      ${blocks}
    </div>`;
  }
});
