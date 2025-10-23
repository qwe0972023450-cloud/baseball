
App.registerPage('finance', {
  title:'財務',
  render(state){
    const payroll = state.players.filter(p=>p.teamId).reduce((acc,p)=>acc+(p.salary||0),0);
    return `<div class="grid"><section class="card"><h2>財務總覽</h2>
    <div class="stat-row"><div class="stat">總薪資：${App.utils.formatMoney(payroll)}</div></div>
    </section></div>`;
  }
});
