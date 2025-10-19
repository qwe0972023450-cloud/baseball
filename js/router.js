
const Router = {
  routes: {},
  register(path, render){ this.routes[path]=render; },
  async resolve(){
    const path = location.hash.replace("#/","") || "home";
    const outlet = document.getElementById("router-outlet");
    if(this.routes[path]){
      outlet.innerHTML = await this.routes[path]();
      // highlight nav
      document.querySelectorAll(".nav-link").forEach(a=>{
        a.classList.toggle("active", a.getAttribute("data-route")==path);
      });
    }else{
      outlet.innerHTML = `<div class="panel"><h3>找不到頁面</h3><div>Route: ${path}</div></div>`;
    }
  },
  refresh(){ this.resolve(); }
};

window.Router = Router;
window.addEventListener("DOMContentLoaded", init);
