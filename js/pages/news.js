
function NewsPage(){
  const container = document.getElementById('app');
  const news = JSON.parse(localStorage.getItem('news')||'[]');
  const parts = [`<h2>每週棒球新聞</h2>`];
  for(const n of news){
    parts.push(`<article class="newspaper">
      <header>
        <h3>📰 ${n.title}</h3>
        <small>年份 ${n.year} • 第 ${n.week} 週</small>
      </header>
      <section class="columns">
        <div>
          <h4>最佳球員</h4>
          <p>${n.best.team} — <b>${n.best.name}</b>（評分 ${n.best.rating.toFixed(1)}）</p>
        </div>
        <div>
          <h4>最差球員</h4>
          <p>${n.worst.team} — <b>${n.worst.name}</b>（評分 ${n.worst.rating.toFixed(1)}）</p>
        </div>
      </section>
      <p>${n.body}</p>
    </article>`);
  }
  container.innerHTML = parts.join('');
}
