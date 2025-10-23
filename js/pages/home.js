window.PageHome=(()=>{
  const render=(el)=>{
    const s=window.BAM.state;
    el.innerHTML=`
      <div class="grid cols-2">
        <div class="card">
          <h2>賽季進度</h2>
          <div class="kpi">
            <div class="item"><div class="label">年份</div><div class="value">${s.year}</div></div>
            <div class="item"><div class="label">目前週數</div><div class="value">${s.week} / 52</div></div>
            <div class="item"><div class="label">聯盟數</div><div class="value">${s.leagues.length}</div></div>
          </div>
          <div style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="btn primary" id="btnNextWeek">推進 1 週</button>
            <button class="btn" id="btnNext5">推進 5 週</button>
            <button class="btn ghost" id="btnSave">存檔</button>
            <button class="btn warn" id="btnClear">清除存檔</button>
          </div>
        </div>
        <div class="card">
          <h2>最新新聞</h2>
          <div class="paper">
            <div class="headline">每週棒球新聞</div>
            ${s.news.slice(0,6).map(n=>`<div class="item">📰 ${new Date(n.ts).toLocaleString()}｜${n.text}</div>`).join('')||'<div class="item">尚無新聞</div>'}
          </div>
        </div>
      </div>
      <div class="card">
        <h2>已產生冠軍</h2>
        <table class="table">
          <thead><tr><th>聯盟</th><th>年份</th><th>冠軍</th></tr></thead>
          <tbody>
            ${s.leagues.map(lg=>{const c=s.champions[lg.key];return `<tr><td>${lg.name}</td><td>${c?c.year:'—'}</td><td>${c?c.name:'—'}</td></tr>`;}).join('')}
          </tbody>
        </table>
      </div>`;
    el.querySelector('#btnNextWeek').onclick=()=>{window.BAMScheduler.processWeek(window.BAM.state);window.BAMState.save();window.BAMRouter.start();};
    el.querySelector('#btnNext5').onclick=()=>{for(let i=0;i<5;i++)window.BAMScheduler.processWeek(window.BAM.state);window.BAMState.save();window.BAMRouter.start();};
    el.querySelector('#btnSave').onclick=()=>{window.BAMState.save();alert('已存檔');};
    el.querySelector('#btnClear').onclick=()=>{if(confirm('確定清除存檔？')){localStorage.clear();location.reload();}};
  };
  return{render};
})();