
(function(){
  function addNav(){
    const nav=document.getElementById('bottom-nav'); if(!nav) return;
    function add(name,hash){ if([...nav.querySelectorAll('a')].some(a=>a.getAttribute('href')===hash)) return;
      const a=document.createElement('a'); a.href=hash; a.textContent=name; a.className='nav-item'; nav.appendChild(a); }
    add('聯盟','#/leagues'); add('客戶','#/clients'); add('賽季','#/season'); add('新聞','#/news'); add('冠軍','#/champions'); add('設定','#/settings');
  }
  document.addEventListener('DOMContentLoaded', addNav);

  function showClientWeeklySummary(){
    const s=(window.Store&&window.Store.get)?window.Store.get():(window.App||{});
    const players=s.players||[]; const owns=(window.Agency&&window.Agency.signedPlayerIds)?window.Agency.signedPlayerIds():new Set();
    const own=players.filter(p=>owns.has(p.id));
    let html=`<div class="container"><div class="card"><h2>本週客戶表現評分</h2>`;
    if(own.length===0){ html+=`<p>尚未簽入客戶</p>`; } else {
      html+=`<div class="client-row" style="font-weight:700"><div>球員</div><div>球隊</div><div>薪資</div><div>位置</div><div>評分</div></div>`;
      html+=own.map(p=>`<div class="client-row"><div class="name">${p.name}</div><div>${p.teamName||'-'}</div><div>$${(p.salary||0).toLocaleString()}</div><div>${p.position||'-'}</div><div class="rating">${(p.weeklyRating||p.rating||0).toFixed(1)}</div></div>`).join('');
    }
    html+=`<div style="text-align:right;margin-top:12px"><button id="to-newspaper" class="badge">下一步</button></div></div></div>`;
    document.getElementById('app').innerHTML=html;
    document.getElementById('to-newspaper').onclick=()=>showNewspaper();
  }

  function showNewspaper(){
    const N=window.News&&window.News.generate?window.News.generate():{best:null,worst:null,headlines:[]};
    let html=`<div class="container"><div class="card newspaper"><h2>每週體育新聞</h2>`;
    if(N.best||N.worst){ html+=`<p class="lead">最佳球員：<b>${N.best?.name||'—'}</b>；最差球員：<b>${N.worst?.name||'—'}</b></p>`; }
    html+=`<div class="two-col">`+(N.headlines||[]).map(h=>`<p>• ${h}</p>`).join('')+`</div>`;
    html+=`<div style="text-align:right;margin-top:12px"><button id="back-home" class="badge">回首頁</button></div></div></div>`;
    document.getElementById('app').innerHTML=html;
    document.getElementById('back-home').onclick=()=>window.location.hash='#/home';
  }

  function tryWrapAdvance(){
    const g=window; if(g.advanceWeek && !g._wrappedAdvance){
      const orig=g.advanceWeek; g.advanceWeek=function(){ const r=orig.apply(this,arguments); setTimeout(()=>showClientWeeklySummary(),50); return r; }; g._wrappedAdvance=true;
    }
  }
  setInterval(tryWrapAdvance,500);

  function progression(){
    const s=(window.Store&&window.Store.get)?window.Store.get():(window.App||{}); const players=s.players||[];
    players.forEach(p=>{ if(p.potential==null) p.potential=(p.rating||50)+10+Math.random()*20;
      if(p.scoutGrade==null) p.scoutGrade=Math.min(100,Math.max(50,(p.potential||60)+(Math.random()*10-5)));
      if(p.rating<p.potential) p.rating+=Math.max(.1,(p.potential-p.rating)*.02);
    });
    if(window.Store&&window.Store.set) window.Store.set(s);
  }
  setInterval(progression,3000);

  function rec4(){
    const s=(window.Store&&window.Store.get)?window.Store.get():(window.App||{}); if(!s.week||s.week%4) return;
    const signed=(window.Agency&&window.Agency.signedPlayerIds)?window.Agency.signedPlayerIds():new Set();
    const pool=(s.players||[]).filter(p=>!signed.has(p.id)); if(pool.length===0) return;
    const pick=pool[Math.floor(Math.random()*pool.length)];
    const el=document.createElement('div'); el.className='card'; Object.assign(el.style,{position:'fixed',bottom:'12px',left:'12px',right:'12px',zIndex:9999,background:'#fff'});
    el.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
    <div><b>推薦潛力客戶</b>：${pick.name}（${pick.teamName||'-'} / 評分 ${(pick.rating||0).toFixed(1)} / 潛力 ${Math.round(pick.potential||0)}）</div>
    <div><button id="rec-sign" class="badge">簽入</button> <button id="rec-close" class="badge" style="background:#94a3b8">略過</button></div></div>`;
    document.body.appendChild(el);
    document.getElementById('rec-sign').onclick=()=>{ if(window.Agency) window.Agency.sign(pick.id); el.remove(); };
    document.getElementById('rec-close').onclick=()=>el.remove();
  }
  setInterval(rec4,2000);
})();
