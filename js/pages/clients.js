Pages.Clients = {
  render(){
    const rows = Store.players.filter(p=>p.status!=='retired').slice(0,600).map(p=>{
      const avg4=p.weeklyRatings.length?(p.weeklyRatings.reduce((a,b)=>a+b,0)/p.weeklyRatings.length).toFixed(1):'-';
      const badge = p.role.includes('頂尖')?'gold':p.role.includes('當家')?'green':p.role.includes('主力')?'blue':'gray';
      return `<tr><td>${p.name}</td><td>${p.team||'FA'}</td><td>${fmtMoney(p.salary)}</td><td>${avg4}</td><td><span class="badge ${badge}">${p.role}</span></td></tr>`;
    }).join('');
    return `<div class="card">
      <h3>客戶列表 <span class="badge gray">簡易</span></h3>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>姓名</th><th>所屬球隊</th><th>薪資</th><th>平均評分(近4)</th><th>評價</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="btn-row" style="margin-top:8px">
        <button class="btn" id="toDetail">切換 詳細能力/當季數據</button>
        <button class="btn ghost" id="exportCsv">匯出 CSV</button>
      </div>
    </div>
    <div id="detailBlock"></div>`;
  },
  mount(){
    document.getElementById('toDetail').onclick=()=>renderDetail();
    document.getElementById('exportCsv').onclick=()=>{
      const header=['name','team','salary','ovr','potential','G','AB','H','HR','RBI','AVG'];
      const lines=[header.join(',')];
      Store.players.forEach(p=>{
        const row=[p.name,p.team,p.salary,p.ovr,p.potential,p.season.G,p.season.AB,p.season.H,p.season.HR,p.season.RBI,(p.season.AVG||0).toFixed(3)];
        lines.push(row.map(x=>typeof x==='string'&&x.includes(',')?`"${x}"`:x).join(','));
      });
      const blob=new Blob([lines.join('\n')],{type:'text/csv'});
      const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='clients.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1200);
    };
  }
};
function renderDetail(){
  const rows = Store.players.filter(p=>p.status!=='retired').slice(0,600).map(p=>{
    return `<tr>
      <td>${p.name}</td><td>${p.team||'FA'}</td><td>${fmtMoney(p.salary)}</td>
      <td>${p.ovr}</td><td>${p.potential} <span class="badge gray">${p.scoutTier}</span></td>
      <td class="mono">${p.season.G}</td><td class="mono">${p.season.AB}</td><td class="mono">${p.season.H}</td>
      <td class="mono">${p.season.HR}</td><td class="mono">${p.season.RBI}</td><td class="mono">${(p.season.AVG||0).toFixed(3)}</td>
    </tr>`;
  }).join('');
  document.getElementById('detailBlock').innerHTML = `<div class="card" style="margin-top:10px">
    <h3>客戶列表 <span class="badge gray">詳細</span></h3>
    <div class="table-wrap"><table class="table">
      <thead><tr>
        <th>姓名</th><th>所屬球隊</th><th>薪資</th><th>OVR</th><th>潛力(球探)</th>
        <th>G</th><th>AB</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>`;
}