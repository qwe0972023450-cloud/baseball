
(function(){
  const id='page-leagues';
  function render(root){
    root.innerHTML=`<div class="container"><div class="card"><h2>各聯盟一覽</h2>
      <div class="tabbar" id="lg-tabs"></div><div id="lg-content"></div></div></div>`;
    const tabs=root.querySelector('#lg-tabs'), content=root.querySelector('#lg-content');
    const leagues=(window.App&&window.App.leagues)||{}; const keys=Object.keys(leagues); let active=keys[0]||null;
    keys.forEach(k=>{const b=document.createElement('button'); b.textContent=`${k} (${leagues[k].country||''})`; b.onclick=()=>{active=k;draw()}; tabs.appendChild(b);});
    function draw(){
      [...tabs.children].forEach(e=>e.classList.remove('active')); const i=keys.indexOf(active); if(i>=0) tabs.children[i].classList.add('active');
      const lg=leagues[active]; if(!lg){content.innerHTML='<p>沒有資料</p>'; return;}
      let html='';
      if(lg.conferences){ Object.entries(lg.conferences).forEach(([conf,obj])=>{
        html+=`<div class="division"><h3>${conf}</h3>`; Object.entries(obj.divisions||{}).forEach(([div,teams])=>{
          html+=`<div class="division"><h4>${div}</h4><div>` + (teams||[]).map(t=>`<span class="team-chip">${t}</span>`).join('') + `</div></div>`;
        }); html+=`</div>`; });
      } else { Object.entries(lg.divisions||{}).forEach(([div,teams])=>{
        html+=`<div class="division"><h4>${div}</h4><div>` + (teams||[]).map(t=>`<span class="team-chip">${t}</span>`).join('') + `</div></div>`;
      }); }
      content.innerHTML=html||'<p>尚無隊伍資料</p>';
    }
    draw();
  }
  window.Pages=window.Pages||{}; window.Pages[id]={render};
})();
