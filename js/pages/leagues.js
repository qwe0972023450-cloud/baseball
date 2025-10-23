/* v1.7.1: Leagues page with tabs & divisions */
(function(){
  const route = "#/leagues";
  function render(){
    const app = document.getElementById("app") || document.body;
    app.innerHTML = "";
    const h = document.createElement("div");
    h.className="leagues-page";
    h.innerHTML = `
      <div class="page-wrap">
        <h2 class="page-title">聯盟總覽</h2>
        <div class="tabs" id="league-tabs"></div>
        <div id="league-panel"></div>
      </div>`;
    app.appendChild(h);

    const data = window.LEAGUE_OVERRIDES||{};
    const leagues = Object.values(data);
    const tabs = h.querySelector("#league-tabs");
    const panel = h.querySelector("#league-panel");

    function tabItem(l){ 
      const b=document.createElement("button");
      b.className="pill";
      b.textContent = l.name + (l.level?`  (Lv.${l.level})`:"");
      b.onclick=()=>openLeague(l);
      return b;
    }
    leagues.forEach(l => tabs.appendChild(tabItem(l)));
    if(leagues[0]) openLeague(leagues[0]);

    function openLeague(lg){
      panel.innerHTML="";
      lg.conferences.forEach(conf=>{
        const confEl=document.createElement("div");
        confEl.className="conf-block";
        confEl.innerHTML=`<h3>${conf.name}</h3>`;
        conf.divisions.forEach(div=>{
          const d=document.createElement("div");
          d.className="division";
          d.innerHTML=`<h4>${div.name}</h4>`;
          const list=document.createElement("ul");
          list.className="team-list";
          div.teams.forEach(t=>{
            const li=document.createElement("li");
            li.textContent=t;
            list.appendChild(li);
          });
          d.appendChild(list);
          confEl.appendChild(d);
        });
        panel.appendChild(confEl);
      });
    }
  }

  window.__registerLeaguesPage = render;

  // Router hook
  function onHash(){
    if(location.hash===route){ render(); }
  }
  window.addEventListener("hashchange", onHash);
  if(location.hash===route){ render(); }
})();
