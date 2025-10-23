
App.registerPage('clients', {
  title: '客戶',
  render(state){
    // Simple list: name / team / salary / quick stats
    const rows = state.players
      .filter(p=>p.teamId) // exclude FA/retired by default
      .slice(0, 500)
      .map(p=>{
        return `<tr>
          <td><strong>${p.name}</strong><div class="muted">${p.position}</div></td>
          <td>${p.teamName}</td>
          <td>${App.utils.formatMoney(p.salary)}</td>
          <td>${p.stats.G}</td>
          <td>${p.stats.PA}</td>
          <td>${p.stats.H}</td>
          <td>${p.stats.HR}</td>
          <td>${p.stats.RBI}</td>
          <td>${p.stats.AVG}</td>
          <td><span class="badge">${p.rating.toFixed(1)}</span> <span class="badge ${p.status==='released'?'bad':(p.status==='starter'?'ok':'')}">${p.status}</span></td>
        </tr>`;
      }).join('');
    return `
      <div class="grid">
        <section class="card">
          <h2>我的客戶（簡易清單）</h2>
          <table class="table">
            <thead><tr>
              <th>球員</th><th>所屬球隊</th><th>薪資</th>
              <th>G</th><th>PA</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th>
              <th>評分/狀態</th>
            </tr></thead>
            <tbody>${rows || `<tr><td colspan="10" class="muted">尚無資料</td></tr>`}</tbody>
          </table>
        </section>
      </div>
    `;
  }
});
