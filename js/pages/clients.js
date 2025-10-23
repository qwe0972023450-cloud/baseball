
App.registerPage('clients', {
  title: '客戶',
  render(state){
    const ag = state.agency || {clientIds:[]};
    const list = ag.clientIds.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
    const rows = list.map(p=>`<tr>
      <td><a href="#/player?pid=${p.id}"><strong>${p.name}</strong></a></td>
      <td>${p.teamName||'自由球員'}</td>
      <td>${App.utils.formatMoney(p.salary)}</td>
      <td>${p.position}</td>
      <td>${(p.eval||'-')}</td>
    </tr>`).join('') || `<tr><td colspan="5" class="muted">尚無客戶</td></tr>`;
    return `<div class="grid"><section class="card">
      <h2>我的客戶</h2>
      <table class="table"><thead><tr><th>球員</th><th>球隊</th><th>薪資</th><th>位置</th><th>評分</th></tr></thead><tbody>${rows}</tbody></table>
    </section></div>`;
  }
});
