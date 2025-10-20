
Router.register("settings", ()=>{
  function updateCommission(){
    const s = parseFloat(document.getElementById("c-salary").value);
    const e = parseFloat(document.getElementById("c-endorse").value);
    const t = parseFloat(document.getElementById("c-transfer").value);
    STATE.commission.salary = s/100; STATE.commission.endorsement = e/100; STATE.commission.transfer = t/100;
    save(); Router.resolve();
  }
  function exportSave(){
    const blob = new Blob([JSON.stringify(STATE)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="bam_save.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
  }
  window.updateCommission = updateCommission;
  window.exportSave = exportSave;
  window.importSave = ()=>{
    const inp = document.getElementById("file-import");
    if(!inp.files[0]) return;
    const reader = new FileReader();
    reader.onload = ()=>{ Object.assign(STATE, JSON.parse(reader.result)); save(); location.hash="#/home"; location.reload(); };
    reader.readAsText(inp.files[0]);
  };
  return `<div class="grid grid-2">
    <div class="panel">
      <div class="panel-header"><h3>佣金設定</h3><span class="badge">即時生效</span></div>
      <div class="grid grid-2">
        <div>薪資提成（%）<input id="c-salary" class="input" type="number" value="${Math.round(STATE.commission.salary*100)}"></div>
        <div>代言提成（%）<input id="c-endorse" class="input" type="number" value="${Math.round(STATE.commission.endorsement*100)}"></div>
        <div>交易抽成（%）<input id="c-transfer" class="input" type="number" value="${Math.round(STATE.commission.transfer*100)}"></div>
      </div>
      <div class="flex" style="margin-top:8px">
        <button class="btn" onclick="updateCommission()">更新</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><h3>存檔</h3><span class="badge">匯出/匯入</span></div>
      <div class="flex">
        <button class="btn secondary" onclick="exportSave()">匯出存檔</button>
        <label class="btn muted" for="file-import">選擇存檔</label>
        <input id="file-import" style="display:none" type="file" accept="application/json" onchange="importSave()" />
      </div>
      <div class="section-title">版本</div>
      <div>目前版本 v${VERSION}（頁面完全分離、十個路由、年度冠軍公告、分級聯盟難度與表現）</div>
    </div>
  </div>`;
});
