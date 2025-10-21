// Tiny hash router with per-page mount() to fix dead buttons
window.Router = (()=>{
  const routes = {
    home: Pages.Home,
    clients: Pages.Clients,
    season: Pages.Season,
    news: Pages.News,
    champions: Pages.Champions,
    settings: Pages.Settings,
    // stubs
    teams: Pages.Teams, finance: Pages.Finance, staff: Pages.Staff, shop: Pages.Shop
  };
  function setActiveNav(key){
    document.querySelectorAll('.nav-btn').forEach(a=>{
      a.classList.toggle('active', a.getAttribute('data-route')===key);
    });
  }
  function render(hash){
    const key = (hash || location.hash || '#/home').replace('#/','');
    const page = routes[key];
    const el = document.getElementById('page-content');
    if(!page){ el.innerHTML = `<div class="card"><h3>找不到頁面</h3><div class="subtle mono">Route: ${key}</div></div>`; setActiveNav(key); return; }
    const html = (typeof page.render==='function') ? page.render() : page();
    el.innerHTML = html;
    setActiveNav(key);
    if(typeof page.mount==='function') page.mount(el);
  }
  window.addEventListener('hashchange', ()=>render(location.hash));
  window.addEventListener('load', ()=>render(location.hash));
  return { render };
})();