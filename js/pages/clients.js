function renderClients(){
  // filter + sort
  const q = Game.ui.clientQuery.trim().toLowerCase();
  const sorted = Game.players.slice().filter(p => !q || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
  const [key, dir] = Game.ui.clientSort.split("_"); // rating_desc
  sorted.sort((a,b)=>{
    let va = (key==='rating'?a.rating:key==='salary'?a.salary:a.skill);
    let vb = (key==='rating'?b.rating:key==='salary'?b.salary:b.skill);
    return dir==='asc' ? va - vb : vb - va;
  });

  const toolbar = `
    <div class="toolbar">
      <input id="client-search" class="input" placeholder="搜尋姓名 / 球隊" value="${Game.ui.clientQuery||''}"/>
      <select id="client-sort" class="select">
        <option value="rating_desc" ${Game.ui.clientSort==='rating_desc'?'selected':''}>評分 ⬇</option>
        <option value="rating_asc" ${Game.ui.clientSort==='rating_asc'?'selected':''}>評分 ⬆</option>
        <option value="salary_desc" ${Game.ui.clientSort==='salary_desc'?'selected':''}>薪資 ⬇</option>
        <option value="salary_asc" ${Game.ui.clientSort==='salary_asc'?'selected':''}>薪資 ⬆</option>
        <option value="skill_desc" ${Game.ui.clientSort==='skill_desc'?'selected':''}>能力 ⬇</option>
        <option value="skill_asc" ${Game.ui.clientSort==='skill_asc'?'selected':''}>能力 ⬆</option>
      </select>
    </div>`;

  const rows = sorted.map(p => `
    <div class="row basic">
      <div class="name">${p.name}</div>
      <div>${p.team}</div>
      <div>$${p.salary.toLocaleString()}</div>
      <div><button class="btn" data-action="toggle" data-id="${p.id}">詳情</button></div>
      <div class="details" id="d-${p.id}" style="display:none;">
        <div class="kpi">
          <span class="chip">能力 ${p.skill}</span>
          <span class="chip">評分 ${p.rating}</span>
          <span class="chip">球探上限 ${p.scout}</span>
          <span class="chip">年齡 ${p.age}</span>
          <span class="chip">合約 ${p.contract}</span>
          <span class="chip">狀態 ${p.mood}${p.waiver?'（讓渡）':''}${p.retired?'（不在名單）':''}</span>
        </div>
        <div class="grid cols-2">
          <div class="card">
            <b>當季數據（打者）</b>
            <div class="kpi">
              <span class="chip">G ${p.season.G}</span>
              <span class="chip">AB ${p.season.AB}</span>
              <span class="chip">H ${p.season.H}</span>
              <span class="chip">AVG ${(p.season.AVG||0).toFixed(3)}</span>
              <span class="chip">HR ${p.season.HR}</span>
              <span class="chip">RBI ${p.season.RBI}</span>
            </div>
          </div>
          <div class="card">
            <b>當季數據（投手）</b>
            <div class="kpi">
              <span class="chip">G ${p.season.G}</span>
              <span class="chip">IP ${p.season.IP}</span>
              <span class="chip">K ${p.season.K}</span>
              <span class="chip">ER ${p.season.ER}</span>
              <span class="chip">ERA ${(p.season.ERA||0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  mount(`<div class="card"><h3>客戶</h3>${toolbar}<div class="grid">${rows}</div></div>`);

  // actions
  Pages.actions.toggle = (el)=>{
    const id = el.getAttribute("data-id");
    const d = document.getElementById("d-"+id);
    d.style.display = d.style.display==="none" ? "" : "none";
  };

  // bind toolbar
  const s = document.getElementById("client-search");
  const sel = document.getElementById("client-sort");
  s.oninput = (e)=>{ Game.ui.clientQuery = e.target.value; renderClients(); };
  sel.onchange = (e)=>{ Game.ui.clientSort = e.target.value; renderClients(); };
}

Router.register("clients", renderClients);
Bus.on("render", ()=>{ if (Router.current()==="clients") renderClients(); });