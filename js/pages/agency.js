
App.registerPage('agency', {
  title: '經紀公司',
  render(state){
    const ag = state.agency;
    const cap = App.utils.agencyCapacity();
    const clients = ag.clientIds.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
    const rows = clients.map(p=>`
      <tr>
        <td><a href="#/player?pid=${p.id}"><strong>${p.name}</strong></a></td>
        <td>${p.teamName||'-'}</td>
        <td>${App.utils.formatMoney(p.salary)}</td>
        <td>${p.position}</td>
        <td>${(p.eval??'-')}</td>
        <td>${p.agentContract? (p.agentContract.years+'y/'+p.agentContract.commission+'%'):'-'}</td>
        <td><button class="btn" onclick="App.utils.agencyRemoveClient('${p.id}')">解除</button></td>
      </tr>`).join('') || `<tr><td colspan="7" class="muted">尚無客戶</td></tr>`;

    const trainees = (ag.academyIds||[]).map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
    const tRows = trainees.map(p=>`
      <tr><td>${p.name}</td><td>${p.position}</td><td>${(p.rating??'-')}</td><td>${(p.potential??'-')}</td></tr>
    `).join('') || `<tr><td colspan="4" class="muted">尚無學院球員</td></tr>`;

    function deptRow(name, key, desc){
      const lv = ag.depts[key]||1;
      const cost = App.utils.deptUpgradeCost(key);
      return `<tr>
        <td>${name}</td><td>Lv.${lv}</td><td>${desc}</td>
        <td><button class="btn" onclick="App.utils.deptUpgrade('${key}')">升級（${App.utils.formatMoney(cost)}）</button></td>
      </tr>`;
    }

    return `
      <div class="grid">
        <section class="card">
          <h2>公司概況</h2>
          <div class="stat-row">
            <div class="stat"><div class="stat-k">等級</div><div class="stat-v">Lv.${ag.level}</div></div>
            <div class="stat"><div class="stat-k">名望</div><div class="stat-v">${ag.reputation}</div></div>
            <div class="stat"><div class="stat-k">現金</div><div class="stat-v">${App.utils.formatMoney(ag.cash)}</div></div>
            <div class="stat"><div class="stat-k">客戶數</div><div class="stat-v">${clients.length}/${cap}</div></div>
            <div class="stat"><div class="stat-k">上週佣金</div><div class="stat-v">${App.utils.formatMoney(ag._lastCommission||0)}</div></div>
          </div>
          <div class="btn-row">
            <a class="btn" href="#/clients">客戶清單</a>
            <a class="btn" href="#/league">聯盟</a>
          </div>
        </section>

        <section class="card">
          <h2>部門與職務</h2>
          <table class="table">
            <thead><tr><th>部門</th><th>等級</th><th>效果</th><th>操作</th></tr></thead>
            <tbody>
              ${deptRow('球探部','scout','提升推薦品質與簽約成功率')}
              ${deptRow('經理室','manager','提升談判成功與高端客戶接受度')}
              ${deptRow('訓練部','trainer','提升旗下球員每週成長')}
              ${deptRow('財務部','finance','提升利息與成本效率')}
              ${deptRow('業務部','sales','提升代言/佣金收入')}
              ${deptRow('體育學院','academy','提升學院培訓生的素質')}
            </tbody>
          </table>
        </section>

        <section class="card">
          <h2>簽約候選（球探推薦）</h2>
          <div class="muted">每 4 週自動推薦；也可自行去球員頁提出合約</div>
          ${(()=>{
            const can = state.players.filter(p=>!(ag.clientIds||[]).includes(p.id)).sort((a,b)=>b.potential-a.potential).slice(0,20);
            const rows = can.map(p=>`<tr>
              <td>${p.name}</td><td>${p.teamName||'-'}</td><td>${p.position}</td>
              <td>${(p.potential??'-')}</td><td>${App.utils.scoutGrade(p)}</td>
              <td><a class="btn" href="#/player?pid=${p.id}">談合約</a></td>
            </tr>`).join('');
            return `<table class="table"><thead><tr><th>球員</th><th>球隊</th><th>位置</th><th>潛力</th><th>評等</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
          })()}
        </section>

        <section class="card">
          <h2>體育學院（自有球員）</h2>
          <table class="table"><thead><tr><th>姓名</th><th>位置</th><th>能力</th><th>潛力</th></tr></thead><tbody>${tRows}</tbody></table>
        </section>
      </div>`;
  }
});
