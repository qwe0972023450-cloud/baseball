Pages.News = {
  render(){
    const items = Store.news.map(n=>`<div class="newspaper" style="margin:8px 0">
      <h3>聯盟週報</h3><div class="subtle">${n.date}</div><div>${n.lead}</div>
      ${n.items.map(a=>`<div class="article"><b>◆ ${a.title}</b><div>${a.text}</div></div>`).join('')}
    </div>`).join('');
    return `<div class="card"><h3>每週新聞</h3><div class="subtle">自動產出本週最佳/最差球員與隨機事件</div></div>${items || '<div class="card"><div class="subtle">尚無新聞，請先模擬。</div></div>'}`;
  }
};