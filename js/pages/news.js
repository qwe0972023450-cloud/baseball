
App.registerPage('news', {
  title: '每週棒球新聞',
  render(state){
    const items = state.news.slice(0,30).map(n=>`
      <article>
        <div class="tag">W${n.week}</div>
        ${(n.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}
        <h3>${n.title}</h3>
        <div class="by">Baseball Daily · ${new Date().toLocaleDateString()}</div>
        <div class="lead">${n.body}</div>
      </article>
    `).join('') || '<div class="muted">目前沒有新聞，推進一週試試</div>';
    return `
      <div class="grid">
        <section class="card">
          <h2>📰 每週報紙</h2>
          <div class="paper">${items}</div>
        </section>
      </div>
    `;
  }
});

;(function(){ if(!window.News) window.News={}; if(!window.News.generate){ window.News.generate=function(){ return {best:null,worst:null,headlines:['聯盟焦點','交易傳聞','傷兵更新']}; }; } })();
