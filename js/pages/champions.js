Pages.Champions = {
  render(){
    const list = Object.values(Store.champions);
    const html = list.length? list.map(c=>`<tr><td>${c.season}</td><td>${c.league}</td><td>${c.team}</td><td>${(c.avg??0).toFixed(3)}</td></tr>`).join('')
      : '<tr><td colspan="4" class="subtle">尚無資料，請先跑完一季。</td></tr>';
    return `<div class="card">
      <h3>各國聯盟冠軍</h3>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>年度</th><th>聯盟</th><th>冠軍</th><th>團隊AVG</th></tr></thead>
        <tbody>${html}</tbody>
      </table></div>
    </div>`;
  }
};