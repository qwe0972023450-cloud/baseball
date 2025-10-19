
function clientRow(p, idx){
  const teamLabel = p.team ? `${leagueById(p.team.leagueId).name} / ${p.team.teamName}` : `<span class="tag">自由球員</span>`;
  const inj = p.injury ? `<span class="badge" style="background:#5b1e2e;border-color:#802942">傷：${p.injury.type}</span>` : "";
  return `<tr>
    <td>${idx+1}</td>
    <td><b>${p.name}</b><div class="muted">${p.age} 歲</div></td>
    <td>${p.pos}<div class="muted">${p.bats}打/${p.throws}投</div></td>
    <td>${p.ovr}</td>
    <td>
      <div class="statbar"><div style="width:${p.power}%"></div></div>
      <div class="muted">力量 ${p.power}</div>
    </td>
    <td>${teamLabel} ${inj}</td>
    <td>${p.salary? fmtMoney(p.salary) : "-"}</td>
    <td class="flex">
      <button class="btn sm" onclick="UI.viewClient('${p.id}')">查看</button>
      <button class="btn sm secondary" onclick="UI.openSign('${p.id}')">簽約</button>
      <button class="btn sm muted" onclick="UI.offerEndorse('${p.id}')">代言</button>
    </td>
  </tr>`;
}

const UI = {
  viewClient(id){
    const p = STATE.clients.find(x=>x.id===id);
    if(!p) return;
    const team = p.team? `${leagueById(p.team.leagueId).name} - ${p.team.teamName}` : "自由球員";
    const page = document.getElementById("router-outlet");
    page.innerHTML = `<div class="panel">
      <div class="panel-header">
        <h3>球員檔案 — ${p.name}</h3>
        <button class="btn" onclick="Router.resolve()">返回</button>
      </div>
      <div class="grid grid-2">
        <div class="panel">
          <div class="section-title">基本</div>
          <div>年齡：${p.age} ｜ 位置：${p.pos} ｜ 投打：${p.bats}/${p.throws}</div>
          <div>潛力：${p.potential} ｜ OVR：<b>${p.ovr}</b> ｜ 隊伍：${team}</div>
          ${p.injury? `<div class="notice">傷勢：${p.injury.type}（尚餘 ${p.injury.weeks} 週）</div>`:""}
        </div>
        <div class="panel">
          <div class="section-title">打擊</div>
          <div class="grid grid-2">
            ${["hitL","hitR","power","eye","discipline","speed"].map(k=>`<div>${k.toUpperCase()}: ${p[k]}<div class='statbar'><div style='width:${p[k]}%'></div></div></div>`).join("")}
          </div>
          <hr class="sep"/>
          <div class="section-title">投球</div>
          <div class="grid grid-2">
            ${["vel","control","movement","breaking"].map(k=>`<div>${k.toUpperCase()}: ${p[k]}<div class='statbar'><div style='width:${p[k]}%'></div></div></div>`).join("")}
          </div>
        </div>
      </div>
      <div class="flex">
        <button class="btn secondary" onclick="UI.openSign('${p.id}')">嘗試簽約</button>
        <button class="btn muted" onclick="UI.offerEndorse('${p.id}')">安排代言</button>
      </div>
    </div>`;
  },
  openSign(id){
    const p = STATE.clients.find(x=>x.id===id);
    let opts = LEAGUES.map(l=>`<optgroup label="${l.name}">${l.teams.map(t=>`<option value="${l.id}|${t}">${t}</option>`).join("")}</optgroup>`).join("");
    const page = document.getElementById("router-outlet");
    page.innerHTML = `<div class="panel">
      <div class="panel-header">
        <h3>簽約試算 — ${p.name}（OVR ${p.ovr}）</h3>
        <button class="btn" onclick="Router.resolve()">返回</button>
      </div>
      <div class="grid grid-2">
        <div class="panel">
          <div class="section-title">選擇球隊</div>
          <select id="sign-target">${opts}</select>
          <div id="sign-chance" class="notice" style="margin-top:8px;">請選擇球隊查看成功率</div>
          <div class="flex" style="margin-top:8px;">
            <button class="btn primary" onclick="UI.doSign('${p.id}')">送出簽約</button>
          </div>
        </div>
        <div class="panel">
          <div class="section-title">模型說明</div>
          <ul>
            <li>成功率 = 能力(OVR) × 知名度 × 聯盟層級難度</li>
            <li>層級越高（MLB/NPB）越難；知名度可緩解</li>
            <li>簽約成功後以層級 × 能力計算週薪與合同期</li>
          </ul>
        </div>
      </div>
    </div>`;
    const sel = document.getElementById("sign-target");
    sel.addEventListener("change",()=>{
      const [lid] = sel.value.split("|");
      const chance = signDifficulty(leagueById(lid).tier, p.ovr);
      document.getElementById("sign-chance").innerHTML = `預估成功率：<b>${chance}%</b>`;
    });
  },
  doSign(id){
    const sel = document.getElementById("sign-target");
    if(!sel || !sel.value) return;
    const [lid, team] = sel.value.split("|");
    const p = STATE.clients.find(x=>x.id===id);
    trySign(p, lid, team);
    updateHUD();
    Router.resolve();
  },
  offerEndorse(id){
    const p = STATE.clients.find(x=>x.id===id);
    const fee = rand(100_000, 600_000);
    const cut = Math.round(fee * STATE.commission.endorsement * (1 + STATE.staff.negotiator/200));
    STATE.cash += cut;
    STATE.finance.income.push({type:"代言提成", amount:cut, note:`${p.name}`});
    addNews(`📣 你為 ${p.name} 談到代言 ${fmtMoney(fee)}（提成 ${fmtMoney(cut)}）`);
    updateHUD(); save(); Router.resolve();
  }
};

Router.register("clients", ()=>{
  const rows = STATE.clients.map((p,i)=>clientRow(p,i)).join("");
  return `
  <div class="panel">
    <div class="panel-header">
      <h3>客戶清單</h3>
      <div class="flex">
        <button class="btn" onclick="STATE.clients.push(makePlayer()); save(); Router.resolve();">新增客戶</button>
        <button class="btn muted" onclick="Router.resolve()">重新整理</button>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>#</th><th>姓名</th><th>位置/投打</th><th>OVR</th><th>能力</th><th>球隊</th><th>週薪</th><th>操作</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
});
