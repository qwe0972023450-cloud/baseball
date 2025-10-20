
Router.register("news", ()=>{
  const items = STATE.news.map(n=>`<div class="notice">[${n.year} W${n.week}] ${n.text}</div>`).join("");
  return `<div class="panel">
    <div class="panel-header"><h3>新聞中心</h3><span class="badge">${STATE.news.length} 則</span></div>
    ${items || "— 尚無新聞 —"}
  </div>`;
});
