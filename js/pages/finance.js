
Router.register("finance", ()=>{
  const inc = STATE.finance.income.map(x=>`<tr><td>${x.type}</td><td>${x.note||""}</td><td style="text-align:right">${fmtMoney(x.amount)}</td></tr>`).join("");
  const exp = STATE.finance.expense.map(x=>`<tr><td>${x.type}</td><td>${x.note||""}</td><td style="text-align:right">-${fmtMoney(x.amount)}</td></tr>`).join("");
  const hist = STATE.finance.history.map(h=>`<tr><td>${h.year}</td><td style="text-align:right">${fmtMoney(h.income)}</td><td style="text-align:right">-${fmtMoney(h.expense)}</td><td style="text-align:right">${fmtMoney(h.net)}</td></tr>`).join("");
  const totalInc = STATE.finance.income.reduce((a,b)=>a+b.amount,0);
  const totalExp = STATE.finance.expense.reduce((a,b)=>a+b.amount,0);
  const net = totalInc - totalExp;
  return `
  <div class="grid grid-2">
    <div class="panel">
      <div class="panel-header"><h3>今年收支</h3><span class="badge">即時</span></div>
      <div class="kpi">
        <div class="card"><div class="muted">收入</div><div class="big">${fmtMoney(totalInc)}</div></div>
        <div class="card"><div class="muted">支出</div><div class="big">${fmtMoney(totalExp)}</div></div>
        <div class="card"><div class="muted">結存</div><div class="big" style="color:${net>=0?'var(--green)':'var(--red)'}">${fmtMoney(net)}</div></div>
      </div>
      <div class="grid grid-2" style="margin-top:10px">
        <div>
          <div class="section-title">收入明細</div>
          <table class="table"><thead><tr><th>分類</th><th>說明</th><th style="text-align:right">金額</th></tr></thead><tbody>${inc||"<tr><td colspan=3>—</td></tr>"}</tbody></table>
        </div>
        <div>
          <div class="section-title">支出明細</div>
          <table class="table"><thead><tr><th>分類</th><th>說明</th><th style="text-align:right">金額</th></tr></thead><tbody>${exp||"<tr><td colspan=3>—</td></tr>"}</tbody></table>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>年度盈虧記錄</h3><span class="badge">歷史</span></div>
      <table class="table"><thead><tr><th>年度</th><th style="text-align:right">收入</th><th style="text-align:right">支出</th><th style="text-align:right">結存</th></tr></thead><tbody>${hist||"<tr><td colspan=4>—</td></tr>"}</tbody></table>
    </div>
  </div>`;
});
