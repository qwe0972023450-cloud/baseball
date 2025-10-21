Router.register("finance", () => {
  mount(`<div class="card"><h3>財務</h3><div class="kpi">
    <span class="chip">現金 $${Game.cash.toLocaleString()}</span>
    <span class="chip">知名度 ${Game.fame}</span>
  </div>
  <div class="muted">（示意頁）佣金、代言、支出將在完整版打通。</div>
  </div>`);
});