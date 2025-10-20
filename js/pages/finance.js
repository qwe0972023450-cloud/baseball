
function drawLine(canvasId,data){
  const c=document.getElementById(canvasId); if(!c) return;
  const ctx=c.getContext('2d'); const W=c.width, H=c.height;
  ctx.clearRect(0,0,W,H);
  const max=Math.max(1,...data); const step=W/Math.max(1,(data.length-1));
  ctx.beginPath(); ctx.lineWidth=2; ctx.strokeStyle="#5ac8fa";
  data.forEach((v,i)=>{ const x=i*step; const y=H - (v/max)*(H-10) - 5; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.stroke();
  ctx.fillStyle="#9fb0d0"; ctx.font="12px system-ui"; ctx.fillText("0",2,H-2); ctx.fillText(String(max.toFixed?max.toFixed(0):max),2,12);
}

Router.register("finance", ()=>{
  const inc = STATE.finance.income.map(x=>`<tr><td>${x.week?('第'+x.week+'週'):'-'}</td><td>${x.type}</td><td>${x.note||''}</td><td style="text-align:right">${fmtMoney(x.amount)}</td></tr>`).join("");
  const exp = STATE.finance.expense.map(x=>`<tr><td>${x.week?('第'+x.week+'週'):'-'}</td><td>${x.type}</td><td>${x.note||''}</td><td style="text-align:right">-${fmtMoney(x.amount)}</td></tr>`).join("");
  const hist = STATE.finance.history.map(h=>`<tr><td>${h.year}</td><td style="text-align:right">${fmtMoney(h.income)}</td><td style="text-align:right">-${fmtMoney(h.expense)}</td><td style="text-align:right">${fmtMoney(h.net)}</td></tr>`).join("");
  const totalInc = STATE.finance.income.reduce((a,b)=>a+b.amount,0);
  const totalExp = STATE.finance.expense.reduce((a,b)=>a+b.amount,0);
  const net = totalInc - totalExp;
  // build weekly net for chart
  const weeks=[...new Set([...STATE.finance.income.map(x=>x.week), ...STATE.finance.expense.map(x=>x.week)])].filter(Boolean).sort((a,b)=>a-b);
  const perWeek = weeks.map(w=>{
    const incW = STATE.finance.income.filter(x=>x.week===w).reduce((a,b)=>a+b.amount,0);
    const expW = STATE.finance.expense.filter(x=>x.week===w).reduce((a,b)=>a+b.amount,0);
    return incW - expW;
  });
  setTimeout(()=>{ drawLine('chartProfit', perWeek); }, 0);
  return `
  <div class="grid grid-2">
    <div class="panel">
      <div class="panel-header"><h3>今年收支</h3><span class="badge">即時</span></div>
      <div class="kpi">
        <div class="card"><div class="muted">收入</div><div class="big">${fmtMoney(totalInc)}</div></div>
        <div class="card"><div class="muted">支出</div><div class="big">${fmtMoney(totalExp)}</div></div>
        <div class="card"><div class="muted">結存</div><div class="big" style="color:${net>=0?'var(--green)':'var(--red)'}">${fmtMoney(net)}</div></div>
      </div>
      <canvas id="chartProfit" width="520" height="160" style="background:#0d3559;border-radius:10px;margin:8px 0"></canvas>
      <div class="grid grid-2">
        <div>
          <div class="section-title">收入明細</div>
          <table class="table"><thead><tr><th>週</th><th>分類</th><th>說明</th><th style="text-align:right">金額</th></tr></thead><tbody>${inc||"<tr><td colspan=4>—</td></tr>"}</tbody></table>
        </div>
        <div>
          <div class="section-title">支出明細</div>
          <table class="table"><thead><tr><th>週</th><th>分類</th><th>說明</th><th style="text-align:right">金額</th></tr></thead><tbody>${exp||"<tr><td colspan=4>—</td></tr>"}</tbody></table>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>年度盈虧記錄</h3><span class="badge">歷史</span></div>
      <table class="table"><thead><tr><th>年度</th><th style="text-align:right">收入</th><th style="text-align:right">支出</th><th style="text-align:right">結存</th></tr></thead><tbody>${hist||"<tr><td colspan=4>—</td></tr>"}</tbody></table>
    </div>
  </div>`;
});
