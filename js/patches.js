/* v1.7.1: router fallback + weekly flow + clients enhance + RWD */
(function(){
  // --- Router fallback: ensure #/home etc render ---
  const routesOK = ["#/home","#/clients","#/season","#/news","#/settings","#/champions","#/leagues"];
  function ensureHome(){
    const app = document.getElementById("app");
    if(!app) return;
    if(!app.innerHTML.trim()){
      app.innerHTML = `<div class="home-fallback">
        <h2>棒球經紀經理</h2>
        <div class="nav-grid">
          <a href="#/home">首頁</a>
          <a href="#/clients">客戶</a>
          <a href="#/season">賽季</a>
          <a href="#/news">新聞</a>
          <a href="#/champions">冠軍</a>
          <a href="#/settings">設定</a>
          <a href="#/leagues">聯盟</a>
        </div>
      </div>`;
    }
  }
  function routerGuard(){
    if(routesOK.includes(location.hash)){
      setTimeout(ensureHome, 50);
    }
  }
  window.addEventListener("hashchange", routerGuard);
  document.addEventListener("DOMContentLoaded", routerGuard);
  setTimeout(routerGuard, 100);

  // --- Weekly flow wrap ---
  const origAdvance = window.advanceWeek;
  window.advanceWeek = async function(){
    if(typeof origAdvance==="function"){ await origAdvance(); }
    // 1) show client ratings of this week
    await showClientWeeklySummary();
    // 2) show newspaper
    await showNewspaper();
    // 3) done -> go back home
    location.hash = "#/home";
  };

  async function showClientWeeklySummary(){
    const app = document.getElementById("app") || document.body;
    const layer = document.createElement("div");
    layer.className="overlay-v171";
    Object.assign(layer.style,{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9997});
    const card=document.createElement("div");
    Object.assign(card.style,{background:"#fff",width:"min(92vw,800px)",borderRadius:"16px",padding:"18px",maxHeight:"85vh",overflow:"auto"});
    card.innerHTML = `<h3 style="margin:0 0 10px;">本週客戶表現</h3>
      <div id="client-weekly" class="table-v171"></div>
      <div style="text-align:right;margin-top:12px;"><button id="next" class="btn-primary">下一步</button></div>`;
    layer.appendChild(card); document.body.appendChild(layer);

    const data = (window.getClientPlayers && window.getClientPlayers()) || (window.PLAYERS||[]);
    const box = card.querySelector("#client-weekly");
    box.innerHTML = renderClientTable(data);
    await new Promise(res=> card.querySelector("#next").onclick = ()=>{ layer.remove(); res(); });
  }

  function renderClientTable(players){
    if(!players || !players.length) return `<div style="opacity:.7">尚無客戶</div>`;
    const rows = players.map(p=>{
      const team = p.team || p.teamName || "-";
      const sal = p.salary ? `$${p.salary.toLocaleString()}` : "-";
      const pos = p.position || p.pos || "-";
      const r = p.rating||"-";
      const w = (p.stats && (p.stats.weekly||p.stats.lastWeek)) || {};
      const line = w.ab!=null ? `AB ${w.ab} · H ${w.h||0} · HR ${w.hr||0} · RBI ${w.rbi||0} ｜ ERA ${w.era??"-"} · IP ${w.ip??"-"}` : (p.stats?JSON.stringify(p.stats):"-");
      return `<tr>
        <td>${p.name||("球員#"+(p.id||""))}</td>
        <td>${team}</td>
        <td>${sal}</td>
        <td>${pos}</td>
        <td>${r}</td>
        <td style="font-size:12px;opacity:.8">${line}</td>
      </tr>`;
    }).join("");
    return `<table><thead><tr><th>球員</th><th>球隊</th><th>薪資</th><th>位置</th><th>評分</th><th>本週成績</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  async function showNewspaper(){
    const wrap = document.createElement("div");
    Object.assign(wrap.style,{position:"fixed",inset:0,background:"rgba(255,255,255,.96)",zIndex:9996,overflow:"auto",padding:"20px"});
    wrap.innerHTML = `<div class="paper-v171">
      <div class="paper-header">棒球週刊</div>
      <div class="paper-body" id="paper-body">
        <div class="paper-col">
          <h3>本週最佳球員</h3>
          <div id="best-box">-</div>
        </div>
        <div class="paper-col">
          <h3>本週最差球員</h3>
          <div id="worst-box">-</div>
        </div>
      </div>
      <div style="text-align:right"><button id="close-paper" class="btn-primary">返回首頁</button></div>
    </div>`;
    document.body.appendChild(wrap);
    const sample = (window.PLAYERS||[]).slice(0,20);
    const best = sample.sort((a,b)=>(b.rating||0)-(a.rating||0))[0] || {};
    const worst = sample.sort((a,b)=>(a.rating||0)-(b.rating||0))[0] || {};
    document.getElementById("best-box").innerHTML = `<b>${best.name||"-"}</b>｜${best.team||"-"}｜評分 ${best.rating||"-"}`;
    document.getElementById("worst-box").innerHTML = `<b>${worst.name||"-"}</b>｜${worst.team||"-"}｜評分 ${worst.rating||"-"}`;
    await new Promise(res=> document.getElementById("close-paper").onclick=()=>{ wrap.remove(); res(); });
  }

  // --- Clients page enhancement: compact list with detail link ---
  function enhanceClients(){
    if(location.hash!=="#/clients") return;
    const app = document.getElementById("app"); if(!app) return;
    const root = document.createElement("div"); root.className="clients-compact";
    root.innerHTML = `<h2>客戶清單</h2><div id="client-list"></div>`;
    app.innerHTML = ""; app.appendChild(root);

    const clients = (window.getClientPlayers && window.getClientPlayers()) || (window.PLAYERS||[]).filter(p=> (window.Agency?.state?.clients||[]).includes(p.id));
    const list = root.querySelector("#client-list");
    const cards = (clients.length?clients:(window.PLAYERS||[]).slice(0,12)).map(p=>{
      const team = p.team || p.teamName || "-";
      const sal = p.salary ? `$${p.salary.toLocaleString()}` : "-";
      const pos = p.position || p.pos || "-";
      const r = p.rating||"-";
      return `<div class="client-card">
        <div class="cc-head">
          <div class="cc-name">${p.name||("球員#"+(p.id||""))}</div>
          <div class="cc-team">${team}</div>
        </div>
        <div class="cc-meta">
          <span>${pos}</span>
          <span>評分 ${r}</span>
          <span>${sal}</span>
        </div>
        <div class="cc-actions">
          <a href="#/player/${p.id||('p'+Math.random().toString(36).slice(2))}" class="btn-link">查看</a>
          ${(window.Agency?.state?.clients||[]).includes(p.id) ? `<button class="btn-outline" data-rel="${p.id}">解約</button>` : `<button class="btn-primary" data-sign="${p.id}">簽約</button>`}
        </div>
      </div>`;
    }).join("");
    list.innerHTML = `<div class="client-grid">${cards}</div>`;

    list.addEventListener("click", (e)=>{
      const t = e.target;
      if(t.dataset.sign){ window.Agency?.sign?.(t.dataset.sign); enhanceClients(); }
      if(t.dataset.rel){ window.Agency?.release?.(t.dataset.rel); enhanceClients(); }
    }); 
  }

  window.addEventListener("hashchange", ()=> setTimeout(enhanceClients,30));
  if(location.hash==="#/clients"){ setTimeout(enhanceClients,30); }

  // --- Player potential & scout grade growth tick (very light) ---
  function potentialTick(){
    const arr = (window.PLAYERS||[]);
    arr.forEach(p=>{
      if(p.potential==null){ p.potential = Math.min(99, (p.rating||50) + Math.floor(Math.random()*20)); }
      if(p.scoutGrade==null){ p.scoutGrade = Math.round(Math.max(20, Math.min(80, p.potential * 0.8))); }
      if(Math.random()<0.3){
        // small drift toward potential
        const r = p.rating||50;
        const delta = Math.sign((p.potential||r)-r) * 1;
        p.rating = Math.max(20, Math.min(99, r + delta));
      }
    });
  }
  setInterval(potentialTick, 10000);

  // --- styling inject ---
  const style = document.createElement("style");
  style.innerHTML = `
  .page-wrap{padding:16px}
  .page-title{margin:6px 0 12px;font-size:20px}
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .pill{border:1px solid #ddd;border-radius:999px;padding:6px 12px;background:#fff}
  .conf-block{margin:10px 0 18px;padding:10px;border:1px solid #eee;border-radius:12px;background:#fff}
  .division{margin:6px 0}
  .team-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:6px 0 0;padding:0 16px}
  @media (min-width:720px){ .team-list{grid-template-columns:repeat(3,minmax(0,1fr));} }
  .btn-primary{background:#111;color:#fff;border:0;border-radius:10px;padding:8px 12px}
  .btn-outline{background:#fff;color:#111;border:1px solid #111;border-radius:10px;padding:8px 12px}
  .btn-link{color:#0070f3;text-decoration:none}
  .client-grid{display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:10px}
  @media (min-width:560px){ .client-grid{grid-template-columns:repeat(2,1fr);} }
  @media (min-width:900px){ .client-grid{grid-template-columns:repeat(3,1fr);} }
  .client-card{background:#fff;border:1px solid #eee;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px}
  .cc-head{display:flex;justify-content:space-between;gap:8px}
  .cc-name{font-weight:700}
  .cc-meta{display:flex;gap:10px;flex-wrap:wrap;opacity:.85}
  .cc-actions{display:flex;gap:10px;justify-content:flex-end}
  .paper-v171{max-width:900px;margin:0 auto}
  .paper-header{font-family:serif;font-size:32px;font-weight:800;border-bottom:3px solid #111;margin-bottom:12px}
  .paper-body{display:grid;grid-template-columns:1fr;gap:16px;margin-bottom:12px}
  @media (min-width:800px){ .paper-body{grid-template-columns:1fr 1fr;} }
  .nav-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .nav-grid a{display:block;padding:10px;border:1px solid #eee;border-radius:12px;background:#fff;text-align:center}
  `;
  document.head.appendChild(style);

})();
