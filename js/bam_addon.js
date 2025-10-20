
/* js/bam_addon.js — 若你不想替換現有 scheduler.js，就把此檔案放在它「之後」載入。 */
(function(){
  if(!window.BAM || !window.BAM.initAddon){
    // 嘗試載入我們的 scheduler 補強（如果你未替換原檔，請手動在 index.html 加 <script src="/js/scheduler.js" type="module" defer>）
    console.warn('BAM addon 等待主程式…');
  }
})();
