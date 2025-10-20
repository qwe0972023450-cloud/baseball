
Router.register("academy", ()=>{
  function makeProspectRow(p,i){
    return `<tr>
      <td>${i+1}</td><td>${p.name}</td><td>${p.age}</td><td>${p.pos}</td><td>${p.ovr}</td><td>${p.potential}</td>
      <td><button class="btn sm" onclick="STATE.clients.push(STATE.playersPool.splice(${i},1)[0]); save(); Router.resolve();">簽下</button></td>
    </tr>`;
  }
  // Seed prospects influenced by academy settings
  if(STATE.playersPool.length<40){
    for(let i=0;i<20;i++) STATE.playersPool.push(makePlayer(STATE.academy.level));
  }
  const rows = STATE.playersPool.slice(0,30).map(makeProspectRow).join("");
  return `
  <div class="grid grid-2">
    <div class="panel">
      <div class="panel-header"><h3>新秀名單</h3><span class="badge">來源：${STATE.academy.hs?"高中 ":""}${STATE.academy.college?"大學 ":""}${STATE.academy.overseas?"海外 ":""}</span></div>
      <table class="table"><thead><tr><th>#</th><th>姓名</th><th>年齡</th><th>位置</th><th>OVR</th><th>潛力</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>學院設定</h3><span class="badge">Level ${STATE.academy.level}</span></div>
      <div class="flex">
        <label><input type="checkbox" ${STATE.academy.hs?"checked":""} onchange="STATE.academy.hs=this.checked; save();"> 高中</label>
        <label><input type="checkbox" ${STATE.academy.college?"checked":""} onchange="STATE.academy.college=this.checked; save();"> 大學</label>
        <label><input type="checkbox" ${STATE.academy.overseas?"checked":""} onchange="STATE.academy.overseas=this.checked; save();"> 海外</label>
      </div>
      <div class="section-title">說明</div>
      <ul>
        <li>高中：波動大、可遇見天花板更高</li>
        <li>大學：能力較穩定、即戰力佳</li>
        <li>海外：受球探等級影響較大，可能出現黃金寶藏</li>
      </ul>
      <button class="btn" onclick="STATE.academy.level=Math.min(5,STATE.academy.level+1); save(); Router.resolve();">升級學院</button>
    </div>
  </div>`;
});
