Router.register("news", () => {
  const list = News.list().map(n => `
    <div class="paper">
      <h2>${n.year} W${n.week} — 棒球週報</h2>
      <p class="lead">${n.text}</p>
      <div class="muted">${new Date(n.time).toLocaleString()}</div>
    </div>
  `).join("");
  mount(`<div class="grid cols-2">${list || '<div class="card">目前尚無新聞，按「下一週」試試。</div>'}</div>`);
});