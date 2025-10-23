
App.registerPage('champions', {
  title: '各聯盟冠軍榜',
  render(state){
    const rows = state.champions.map(c=>`<tr><td>${c.season}</td><td>${c.leagueName}</td><td>${c.teamName}</td></tr>`).join('')
      || '<tr><td colspan="3" class="muted">尚無資料</td></tr>';
    return `
      <div class="grid">
        <section class="card">
          <h2>🏆 歷年冠軍</h2>
          <table class="table">
            <thead><tr><th>賽季</th><th>聯盟</th><th>冠軍球隊</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </section>
      </div>
    `;
  }
});
