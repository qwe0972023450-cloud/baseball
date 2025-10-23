
App.registerPage('home', {
  title: '首頁',
  render(state){
    const cash = App.utils.formatMoney(state.agency.cash);
    const rep = state.agency.reputation||0;
    const wk = state.week;
    return `
    <div class="topbar">
      <div class="tb-left">$${cash}</div>
      <div class="tb-mid">賽季：${new Date().getFullYear()}　第 ${wk} 週</div>
      <div class="tb-right">知名度：${rep}</div>
    </div>
    <div class="grid tiles">
      <section class="tile"><h3>辦公室</h3><div class="muted">級別 ${state.agency.level||1}</div></section>
      <a class="tile" href="#/clients"><h3>客戶</h3><div class="muted">${state.agency.clientIds.length||0} 人</div></a>
      <a class="tile" href="#/staff"><h3>員工</h3><div class="muted">球探/經理/訓練</div></a>
      <section class="tile"><h3>經紀公司</h3><div class="muted">現金 ${cash}</div></section>
      <section class="tile"><h3>學院</h3><div class="muted">${(state.agency.academyIds||[]).length} 名</div></section>
      <a class="tile" href="#/news"><h3>新聞</h3><div class="muted">每週報紙</div></a>
      <a class="tile" href="#/events"><h3>事件</h3><div class="muted">公司動態/推薦</div></a>
      <a class="tile" href="#/season"><h3>賽季</h3><div class="muted">排程與比分</div></a>
    </div>
    <div style="text-align:center;margin-top:16px">
      <button class="btn primary" onclick="App.nextWeek()">進入下週</button>
    </div>`;
  }
});
