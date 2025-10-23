window.PageClients=(()=>{
  const render=(el)=>{
    const s=window.BAM.state;
    if(!s.clients||!s.clients.length){
      s.clients=[];const all=Object.entries(s.rosters).flatMap(([tid,arr])=>arr.map(p=>({...p,teamId:tid})));
      all.sort((a,b)=>(b.rating||50)-(a.rating||50)); s.clients=all.slice(0,30).map(p=>({id:p.id,teamId:p.teamId}));
    }
    const rows=s.clients.map(c=>{
      const t=getTeam(c.teamId); const p=(s.rosters[c.teamId]||[]).find(x=>x.id===c.id); if(!p) return '';
      const sal=p.salary?`$${(p.salary/1_000_000).toFixed(1)}M`:'—'; const st=p.stats||{G:0,AB:0,H:0,HR:0,OPS:0,RBI:0};
      return `<tr data-team="${c.teamId}" data-id="${c.id}" class="row"><td>${p.name}</td><td>${t?.name||'—'}</td><td>${sal}</td><td>${st.G}</td><td>${st.HR}</td><td>${st.OPS||0}</td><td><span class="badge">評分 ${p.eval||'—'}</span></td></tr>`;
    }).join('');
    el.innerHTML=`
      <div class="card">
        <h2>客戶列表（簡潔版）</h2>
        <table class="table" id="clientTable">
          <thead><tr><th>名稱</th><th>所屬球隊</th><th>薪資</th><th>G</th><th>HR</th><th>OPS</th><th>評價</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div id="modal" style="display:none"></div>`;
    el.querySelector('#clientTable').addEventListener('click', (e)=>{
      const tr=e.target.closest('tr.row'); if(!tr) return;
      const teamId=tr.getAttribute('data-team'); const id=tr.getAttribute('data-id');
      const p=(s.rosters[teamId]||[]).find(x=>x.id===id); const t=getTeam(teamId); if(!p) return;
      const m=el.querySelector('#modal');
      m.innerHTML=`<div class="modal"><div class="content">
        <h3>${p.name} <span class="badge">${t?.name||''}</span></h3>
        <div class="kpi">
          <div class="item"><div class="label">位置</div><div class="value">${p.pos||'—'}</div></div>
          <div class="item"><div class="label">年齡</div><div class="value">${p.age||'—'}</div></div>
          <div class="item"><div class="label">評分</div><div class="value">${p.eval||'—'}</div></div>
          <div class="item"><div class="label">能力</div><div class="value">${(p.rating||0).toFixed(1)}</div></div>
          <div class="item"><div class="label">上限(球探)</div><div class="value">${p.ceiling||'—'}</div></div>
          <div class="item"><div class="label">狀態</div><div class="value">${p.status||'Active'}</div></div>
        </div>
        <div class="card" style="margin-top:.8rem">
          <h4>本季數據</h4>
          <table class="table"><tbody>
            <tr><th>G</th><td>${p.stats?.G||0}</td><th>AB</th><td>${p.stats?.AB||0}</td><th>H</th><td>${p.stats?.H||0}</td></tr>
            <tr><th>HR</th><td>${p.stats?.HR||0}</td><th>RBI</th><td>${p.stats?.RBI||0}</td><th>OPS</th><td>${p.stats?.OPS||0}</td></tr>
          </tbody></table>
        </div>
        <div style="margin-top:.8rem;display:flex;gap:.5rem;justify-content:flex-end">
          <button class="btn ghost" id="close">關閉</button>
        </div></div></div>`;
      m.style.display='block'; m.querySelector('#close').onclick=()=>{m.style.display='none';};
      m.addEventListener('click',(ev)=>{if(ev.target.classList.contains('modal'))m.style.display='none';},{once:true});
    });
    function getTeam(id){for(const lg of s.leagues){const t=lg.teams.find(x=>x.id===id); if(t) return t;} return null;}
  };
  return{render};
})();