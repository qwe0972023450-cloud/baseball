
Router.register("champions", ()=>{
  const years = Object.keys(STATE.champions).sort((a,b)=>b-a);
  const blocks = years.map(y=>{
    const row = LEAGUES.map(l=>`<tr><td>${l.name}</td><td>${STATE.champions[y][l.id]||"-"}</td></tr>`).join("");
    return `<div class="panel">
      <div class="panel-header"><h3>${y} 冠軍列表</h3></div>
      <table class="table"><thead><tr><th>聯盟</th><th>冠軍隊伍</th></tr></thead><tbody>${row}</tbody></table>
    </div>`;
  }).join("");
  return `<div class="grid grid-2">${blocks || '<div class="panel"><div class="notice">尚未產生年度冠軍，請推進到季末（52 週）。</div></div>'}</div>`;
});
