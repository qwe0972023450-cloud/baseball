window.BAMRouter=(()=>{
  const routes={'#/home':window.PageHome,'#/clients':window.PageClients,'#/season':window.PageSeason,'#/news':window.PageNews,'#/champions':window.PageChampions,'#/settings':window.PageSettings,'#/finance':window.PageFinance,'#/staff':window.PageStaff,'#/shop':window.PageShop};
  const render=()=>{const hash=location.hash||'#/home';const page=routes[hash];const app=document.getElementById('app');if(!page){app.innerHTML='<div class="card"><h2>找不到頁面</h2><p>Route: '+hash+'</p></div>';return;}page.render(app);highlight(hash);window.BAMState.save();};
  const highlight=(hash)=>{[...document.querySelectorAll('.tabs .tab,.bottombar .btn')].forEach(a=>a.classList.remove('active'));[...document.querySelectorAll(`a[href="${hash}"]`)].forEach(a=>a.classList.add('active'));};
  const start=()=>{window.addEventListener('hashchange',render);if(!location.hash)location.hash='#/home';render();};
  return{start};
})();