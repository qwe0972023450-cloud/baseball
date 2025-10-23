window.PageSeason=(()=>{
  const render=(el)=>{
    const s=window.BAM.state, cur=s.week;
    el.innerHTML=`<div class="card"><h2>每週排程（第 ${cur} 週）</h2>
      ${s.leagues.map(lg=>{
        const wk=(lg.schedule||[]).find(x=>x.week===cur)||{games:[]};
        return `<div class="sub"><div class="badge">${lg.name}</div>
          <table class="table"><thead><tr><th>主場</th><th>客場</th></tr></thead>
          <tbody>${
            wk.games.slice(0,12).map(g=>`<tr><td>${nameOf(g.home)}</td><td>${nameOf(g.away)}</td></tr>`).join('')||'<tr><td colspan="2">—</td></tr>'
          }</tbody></table></div>`;
      }).join('')}</div>`;
    function nameOf(id){for(const lg of s.leagues){const t=lg.teams.find(x=>x.id===id); if(t) return t.name;} return id;}
  }; return{render};
})();