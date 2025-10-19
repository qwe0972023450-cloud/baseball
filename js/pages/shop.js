
Router.register("shop", ()=>{
  const items = [
    {name:"豪宅", price:3_000_000, effect:"+名聲 15", apply:()=>{STATE.fame+=15;}},
    {name:"超跑", price:1_200_000, effect:"+名聲 6", apply:()=>{STATE.fame+=6;}},
    {name:"高級西裝", price:60_000, effect:"+談判 2", apply:()=>{STATE.staff.negotiator+=2;}},
    {name:"培訓教材", price:80_000, effect:"+教練 2", apply:()=>{STATE.staff.coach+=2;}},
  ];
  const rows = items.map((it,i)=>`<tr><td>${it.name}</td><td>${it.effect}</td><td style="text-align:right">${fmtMoney(it.price)}</td><td><button class="btn sm" onclick="(function(){ if(STATE.cash>=${it.price}){STATE.cash-=${it.price}; (${it.apply.toString()})(); save(); updateHUD(); Router.resolve(); }})()">購買</button></td></tr>`).join("");
  return `<div class="panel">
    <div class="panel-header"><h3>商店</h3><span class="badge">形象/能力</span></div>
    <table class="table"><thead><tr><th>商品</th><th>效果</th><th style="text-align:right">價格</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table>
  </div>`;
});
