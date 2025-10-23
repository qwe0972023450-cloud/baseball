
App.registerPage('player', {
  title:'球員',
  render(state){
    const params = new URLSearchParams((location.hash.split('?')[1]||''));
    const pid = params.get('pid');
    const p = state.players.find(x=>x.id===pid);
    if(!p) return `<div class="grid"><section class="card"><h2>找不到球員</h2><div class="muted">ID: ${pid||'-'}</div></section></div>`;
    const scout = App.utils.scoutGrade? App.utils.scoutGrade(p) : '';
    const pit = p.pit||{IP:0,W:0,L:0,SV:0,HLD:0};
    const career = p.career||{totals:{},seasons:[]};
    return `<div class="grid">
      <section class="card">
        <h2>${p.name}</h2>
        <div class="stat-row">
          <div class="stat"><div class="stat-k">球隊</div><div class="stat-v">${p.teamName||'自由球員'}</div></div>
          <div class="stat"><div class="stat-k">位置</div><div class="stat-v">${p.position}</div></div>
          <div class="stat"><div class="stat-k">能力/潛力</div><div class="stat-v">${p.rating} / ${p.potential}（${scout}）</div></div>
          <div class="stat"><div class="stat-k">年齡</div><div class="stat-v">${p.age||'-'}</div></div>
        </div>
        <h3>本季數據</h3>
        ${p.position==='P' ? (`<div class="stat-row">
          <div class="stat"><div class="stat-k">IP</div><div class="stat-v">${pit.IP||0}</div></div>
          <div class="stat"><div class="stat-k">W-L</div><div class="stat-v">${pit.W||0}-${pit.L||0}</div></div>
          <div class="stat"><div class="stat-k">SV/HLD</div><div class="stat-v">${pit.SV||0}/${pit.HLD||0}</div></div>
        </div>`) : (`<div class="stat-row">
          <div class="stat"><div class="stat-k">G</div><div class="stat-v">${p.stats.G}</div></div>
          <div class="stat"><div class="stat-k">PA</div><div class="stat-v">${p.stats.PA}</div></div>
          <div class="stat"><div class="stat-k">H</div><div class="stat-v">${p.stats.H}</div></div>
          <div class="stat"><div class="stat-k">HR</div><div class="stat-v">${p.stats.HR}</div></div>
          <div class="stat"><div class="stat-k">RBI</div><div class="stat-v">${p.stats.RBI}</div></div>
          <div class="stat"><div class="stat-k">AVG</div><div class="stat-v">${p.stats.AVG}</div></div>
        </div>`)}
        <h3 style="margin-top:12px">生涯累積</h3>
        <div class="stat-row">
          <div class="stat"><div class="stat-k">打席</div><div class="stat-v">${career.totals.PA||0}</div></div>
          <div class="stat"><div class="stat-k">安打</div><div class="stat-v">${career.totals.H||0}</div></div>
          <div class="stat"><div class="stat-k">全壘打</div><div class="stat-v">${career.totals.HR||0}</div></div>
          <div class="stat"><div class="stat-k">打點</div><div class="stat-v">${career.totals.RBI||0}</div></div>
          <div class="stat"><div class="stat-k">AVG</div><div class="stat-v">${career.totals.AVG||0}</div></div>
        </div>
      </section>
    </div>`;
  }
});
