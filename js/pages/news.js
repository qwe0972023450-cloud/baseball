
Router.register("news", ()=>{
  const items = STATE.news.map(n=>`
    <div class="news-card">
      <div class="news-tablet">
        <div class="news-head"><b>SPORT</b> <span>All Sports</span><span style="margin-left:auto">第 ${n.week} 週</span></div>
        <div class="news-body"><h3>${n.text}</h3></div>
      </div>
    </div>`).join("");
  return `<div class="panel">
    <div class="panel-header"><h3>新聞中心</h3><span class="badge">${STATE.news.length} 則</span></div>
    ${items || "<div class='notice'>— 尚無新聞 —</div>"}
  </div>`;
});
