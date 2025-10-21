Router.register("settings", () => {
  mount(`<div class="card">
    <h3>設定 / 存檔</h3>
    <div class="kpi">
      <button class="btn" data-action="save">匯出存檔</button>
      <input type="file" id="file" accept="application/json" />
      <button class="btn" data-action="load">匯入存檔</button>
      <button class="btn" data-action="reset">重設遊戲</button>
    </div>
    <div class="muted">系統會自動將進度保存到本機瀏覽器（localStorage）。重設將清除本機存檔並重新生成球員。</div>
  </div>`);

  Pages.actions.save = ()=>{
    const {routes, ...rest} = Game;
    const data = JSON.stringify({version:Game.version,...rest}, null, 2);
    const blob = new Blob([data], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `save_${Date.now()}.json`;
    a.click();
  };
  Pages.actions.load = ()=>{
    const f = document.getElementById("file").files[0];
    if(!f) return alert("請先選擇存檔檔案");
    const fr = new FileReader();
    fr.onload = ()=>{
      try{
        const s = JSON.parse(fr.result);
        Object.assign(Game, s);
        saveGame();
        updateHeader();
        Router.go("home");
      }catch(e){ alert("存檔格式錯誤"); }
    };
    fr.readAsText(f);
  };
  Pages.actions.reset = ()=>{
    if (!confirm("確定要重設？此操作會清除本機存檔。")) return;
    localStorage.removeItem("bam_save");
    location.reload();
  };
});