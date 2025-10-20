
/* modules/news.js */
export function newsPadHTML({title, body, tag='Football', time='Just Now'}){
  return `
  <div class="news-pad">
    <header>
      <div>SPORT</div>
      <nav style="display:flex;gap:12px;font-weight:700">
        <span>Football</span><span>Formula 1</span><span>Cricket</span>
      </nav>
    </header>
    <div class="body">
      <h2 style="margin:0 0 8px;font-weight:800">${title}</h2>
      <div class="by">${time}</div>
      <p>${body}</p>
    </div>
  </div>`
}
