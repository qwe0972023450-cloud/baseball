
App.registerPage('clients', {
  title: '客戶',
  render(state){
    // Simple list: name / team / salary / quick stats
    const rows = state.players
      .filter(p=>p.teamId) // exclude FA/retired by default
      .slice(0, 500)
      .map(p=>{
        return `<tr>
          <td><strong>${p.name}</strong><div class="muted">${p.position}</div></td>
          <td>${p.teamName}</td>
          <td>${App.utils.formatMoney(p.salary)}</td>
          <td>${p.stats.G}</td>
          <td>${p.stats.PA}</td>
          <td>${p.stats.H}</td>
          <td>${p.stats.HR}</td>
          <td>${p.stats.RBI}</td>
          <td>${p.stats.AVG}</td>
          <td><span class="badge">${p.rating.toFixed(1)}</span> <span class="badge ${p.status==='released'?'bad':(p.status==='starter'?'ok':'')}">${p.status}</span></td>
        </tr>`;
      }).join('');
    return `
      <div class="grid">
        <section class="card">
          <h2>我的客戶（簡易清單）</h2>
          <table class="table">
            <thead><tr>
              <th>球員</th><th>所屬球隊</th><th>薪資</th>
              <th>G</th><th>PA</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th>
              <th>評分/狀態</th>
            </tr></thead>
            <tbody>${rows || `<tr><td colspan="10" class="muted">尚無資料</td></tr>`}</tbody>
          </table>
        </section>
      </div>
    `;
  }
});

(function(){
  if (window.ClientsEnhanced) return; window.ClientsEnhanced=true;
  function renderCompact(){
    const host = document.getElementById('app'); if(!host) return;
    const store = (window.Store&&window.Store.get)?window.Store.get():(window.App||{});
    const players = store.players||[]; if(players.length===0) return;
    const signed = window.Agency?window.Agency.signedPlayerIds():new Set();
    const list = players.filter(p=>signed.has(p.id));
    const rows = list.map(p=>`<div class="client-row">
      <div class="name"><a href="#/client/${p.id}">${p.name||'-'}</a></div>
      <div>${p.teamName||'-'}</div><div>$${(p.salary||0).toLocaleString()}</div><div>${p.position||'-'}</div>
      <div class="rating">${(p.rating||0).toFixed(1)}</div></div>`).join('');
    host.innerHTML = `<div class="container"><div class="card"><h2>客戶清單</h2>
      <div class="client-row" style="font-weight:700"><div>球員</div><div>球隊</div><div>薪資</div><div>位置</div><div>評分</div></div>
      ${rows || '<p>尚未簽入任何客戶</p>'}</div></div>`;
  }
  window.Router = window.Router || {}; const oldGo = window.Router.go;
  window.Router.go = function(hash){ if(oldGo) oldGo.apply(this, arguments); if((hash||'').startsWith('#/clients')) setTimeout(renderCompact,30); };
})();