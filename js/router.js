window.Router = {
  routes: {},
  register(path, renderFn){ this.routes[path] = renderFn; },
  go(path){ location.hash = "#/"+path; },
  current(){ return location.hash.replace(/^#\//,'') || 'home'; },
  init(){
    const render = () => {
      const r = this.current();
      const fn = this.routes[r];
      if (!fn){
        mount(`<div class="card">找不到頁面<br/>Route: <b>${r}</b></div>`);
        return;
      }
      fn();
      updateHeader();
    };
    window.addEventListener("hashchange", render);
    render();
  }
};