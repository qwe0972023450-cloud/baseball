
function ChampionsPage(){
  const container = document.getElementById('app');
  const champs = (Game?.calendar?.champions) || JSON.parse(localStorage.getItem('champions')||'[]');
  const rows = champs.map(c=>`<tr><td>${c.year}</td><td>${c.league}</td><td>${c.team}</td></tr>`).join('');
  container.innerHTML = `<h2>歷屆聯盟冠軍</h2><table class="table"><thead><tr><th>年份</th><th>聯盟</th><th>冠軍球隊</th></tr></thead><tbody>${rows}</tbody></table>`;
}
