
Router.register("staff", ()=>{
  function staffItem(name,key){
    const v = STATE.staff[key];
    return `<div class="panel">
      <div class="panel-header"><h3>${name}</h3><span class="badge">Lv. ${v}</span></div>
      <div class="statbar"><div style="width:${v}%"></div></div>
      <div class="flex" style="margin-top:8px">
        <button class="btn" onclick="STATE.staff['${key}']=Math.min(100,STATE.staff['${key}']+5); STATE.cash-=500000; STATE.finance.expense.push({type:'員工升級',amount:500000,note:'${name}'}); save(); updateHUD(); Router.resolve();">升級（$500k）</button>
      </div>
    </div>`;
  }
  return `<div class="grid grid-3">
    ${staffItem("球探","scout")}
    ${staffItem("談判顧問","negotiator")}
    ${staffItem("教練","coach")}
  </div>`;
});
