
Router.register('season', () => {
  const w = STATE.week;
  const games = (STATE.season && STATE.season.weekGames && STATE.season.weekGames[w]) || [];
  let html = `<div class="page"><h2>賽程 / 季後賽</h2><div class="muted">年份 ${STATE.year}・第 ${STATE.week} 週</div>`;

  html += `<div class="section"><h3>本週賽程</h3>`;
  if(games.length===0){ html += `<div class="muted">本週沒有賽事</div>`; }
  else{
    html += `<table class="table"><thead><tr><th>聯盟</th><th>客隊</th><th></th><th>主隊</th></tr></thead><tbody>`;
    games.forEach(g=>{
      html += `<tr><td>${g.league}${g.playoff?'（PO）':''}</td><td>${g.a}</td><td>vs</td><td>${g.b}</td></tr>`;
    });
    html += `</tbody></table>`;
  }
  html += `</div>`;

  // standings
  html += `<div class="section"><h3>戰績快照</h3>`;
  Object.entries(STATE.season?.standings||{}).forEach(([lg, table])=>{
    const rows = Object.entries(table).sort((x,y)=>y[1].W-x[1].W).slice(0,6);
    html += `<h4>${lg}</h4><table class="table compact"><thead><tr><th>隊伍</th><th>W</th><th>L</th><th>RS</th><th>RA</th></tr></thead><tbody>`;
    rows.forEach(([tm,st])=>{
      html += `<tr><td>${tm}</td><td>${st.W}</td><td>${st.L}</td><td>${st.RS}</td><td>${st.RA}</td></tr>`;
    });
    html += `</tbody></table>`;
  });
  html += `</div>`;

  // playoffs
  if(STATE.season?.playoffs){
    html += `<div class="section"><h3>季後賽對戰</h3>`;
    Object.entries(STATE.season.playoffs).forEach(([lg, po])=>{
      html += `<div class="playoff-box"><div class="po-title">${lg}</div>`;
      if(po.round>=1 && po.seeds){ html += `<div class="po-round">準決：${po.seeds.slice(0,4).join(' / ')}</div>`; }
      if(po.winners?.length){ html += `<div class="po-round">晉級：${po.winners.join(' vs ')}</div>`; }
      if(po.champion){ html += `<div class="po-champion">🏆 ${po.champion}</div>`; }
      html += `</div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  return html;
});
