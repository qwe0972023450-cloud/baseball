Router.register("season", () => {
  const html = `
    <div class="grid cols-2">
      <div class="card">
        <h3>賽季狀態</h3>
        <div class="kpi">
          <span class="chip">年份 ${Game.year}</span>
          <span class="chip">週次 ${Game.week}/${Game.seasonWeeks}</span>
        </div>
        <div class="muted">例行賽長度於每年開季隨機設定為 40–45 週，結束後自動產生各聯盟冠軍。</div>
      </div>
      <div class="card">
        <h3>隨機事件</h3>
        <div class="muted">每週可能出現流言、傷情、贊助等事件，並影響新聞與名聲。</div>
      </div>
    </div>`;
  mount(html);
});