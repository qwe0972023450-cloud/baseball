Pages.Settings = {
  render(){
    return `<div class="grid">
      <div class="col-12"><div class="card">
        <h3>資料管理</h3>
        <div class="btn-row">
          <button class="btn warn" id="export">匯出存檔</button>
          <label class="btn ghost" for="importSave">匯入存檔</label>
          <input id="importSave" type="file" accept="application/json" style="display:none" />
        </div>
      </div></div>
      <div class="col-12"><div class="card">
        <h3>匯入真實球員名單</h3>
        <div class="subtle">JSON 陣列：{ name, team, age, salary, ovr, potential, season? }</div>
        <div class="btn-row" style="margin-top:8px">
          <label class="btn primary" for="importRoster">匯入名單（JSON）</label>
          <input id="importRoster" type="file" accept="application/json" style="display:none" />
        </div>
        <small class="muted">* team 名稱需與 <span class="mono">js/data/leagues.js</span> 相同；如為 1.1 舊格式，請使用 <span class="mono">tools/convert_roster_11_to_16x.js</span> 轉換。</small>
      </div></div>
    </div>`;
  },
  mount(){
    document.getElementById('export').onclick=()=>exportSave();
    document.getElementById('importSave').onchange=e=>{ const f=e.target.files[0]; if(f) importSave(f); };
    document.getElementById('importRoster').onchange=e=>{ const f=e.target.files[0]; if(f) importRosters(f); };
  }
};