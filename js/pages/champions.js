window.PageChampions=(()=>{
  const render=(el)=>{
    const s=window.BAM.state;
    el.innerHTML=`<div class="card"><h2>歷史冠軍</h2>
      <table class="table"><thead><tr><th>聯盟</th><th>年份</th><th>冠軍球隊</th></tr></thead>
      <tbody>${s.leagues.map(lg=>{const c=s.champions[lg.key];return `<tr><td>${lg.name}</td><td>${c?c.year:'—'}</td><td>${c?c.name:'—'}</td></tr>`;}).join('')}</tbody></table>
    </div>`;
  }; return{render};
})();