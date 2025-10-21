Router.register("home", () => {
  mount(`
    <section class="grid cols-3">
      <div class="card">
        <h3>經理快照</h3>
        <div class="kpi">
          <div class="chip">年份：${Game.year}</div>
          <div class="chip">週次：${Game.week}/${Game.seasonWeeks}</div>
          <div class="chip">知名度：${Game.fame}</div>
          <div class="chip">現金：$${Game.cash.toLocaleString()}</div>
        </div>
      </div>
      <div class="card">
        <h3>快速前往</h3>
        <div class="kpi">
          <a class="chip" href="#/clients">客戶列表</a>
          <a class="chip" href="#/news">本週新聞</a>
          <a class="chip" href="#/champions">歷年冠軍</a>
          <a class="chip" href="#/season">賽季資訊</a>
        </div>
      </div>
      <div class="card">
        <h3>提示</h3>
        <div class="muted">按上方「下一週」模擬賽事、生成新聞、並於第 ${Game.seasonWeeks} 週結束後自動產生各聯盟冠軍。</div>
      </div>
    </section>
  `);
});