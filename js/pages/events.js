
App.registerPage('events', {
  title:'事件',
  render(state){
    const evts = state.events.slice(0,30).map(n=>`
      <article><div class="tag">W${n.week}</div>${(n.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}<h3>${n.title}</h3><div class="lead">${n.body}</div></article>
    `).join('') || '<div class="muted">目前沒有事件</div>';
    const recs = state.recommendations.slice(0,30).map(r=>{
      const p = state.players.find(x=>x.id===r.playerId);
      if(!p) return '';
      return `<li><a href="#/player?pid=${p.id}">${p.name}</a>（${p.teamName||'FA'}，${p.position}，潛力 ${p.potential}）</li>`;
    }).join('');
    return `<div class="grid">
      <section class="card"><h2>公司事件</h2><div class="paper">${evts}</div></section>
      <section class="card"><h2>球探推薦</h2><ul>${recs || '<li class="muted">尚無推薦</li>'}</ul></section>
    </div>`;
  }
});
