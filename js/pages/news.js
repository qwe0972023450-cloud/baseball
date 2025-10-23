window.PageNews=(()=>{
  const render=(el)=>{
    const s=window.BAM.state;
    el.innerHTML=`<div class="card"><h2>每週新聞 📰</h2>
      <div class="paper"><div class="headline">棒球周刊（第 ${s.week} 週）</div>
      ${s.news.slice(0,24).map(n=>`<div class="item">${new Date(n.ts).toLocaleString()}｜${n.text}</div>`).join('')||'<div class="item">沒有新聞</div>'}
      </div></div>`;
  }; return{render};
})();