window.PageSettings=(()=>{
  const render=(el)=>{
    el.innerHTML=`<div class="card"><h2>設定</h2>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn" id="btnExport">匯出存檔</button>
        <input type="file" id="importFile" style="display:none" accept="application/json"/>
        <button class="btn" id="btnImport">匯入存檔</button>
        <button class="btn warn" id="btnReset">重置遊戲</button>
      </div>
      <p style="opacity:.7;margin-top:.5rem">版本：v${window.BAM.state.version}</p></div>`;
    el.querySelector('#btnExport').onclick=()=>{const data=JSON.stringify(window.BAM.state,null,2);const blob=new Blob([data],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BAM_save_v164.json';a.click();};
    el.querySelector('#btnImport').onclick=()=>{const f=el.querySelector('#importFile');f.onchange=()=>{const file=f.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const obj=JSON.parse(r.result);window.BAM.state=obj;window.BAMState.save();alert('匯入成功');window.location.hash='#/home';window.BAMRouter.start();}catch(e){alert('匯入失敗：'+e.message);}};r.readAsText(file);};f.click();};
    el.querySelector('#btnReset').onclick=()=>{if(confirm('確定清除存檔？')){localStorage.clear();location.reload();}};
  }; return{render};
})();