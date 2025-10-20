
// 客戶列表（簡潔版 + 展開詳情與賽季數據）
function ClientsPage(){
  const container = document.getElementById('app');
  const players = getAllPlayers();
  const html = [`<h2>客戶</h2>`,
    `<table class="table"><thead><tr><th>姓名</th><th>球隊</th><th>薪資</th><th>評價</th><th></th></tr></thead><tbody>`];

  for(const p of players){
    const salary = `$${Math.round((p.salary|| (120+Math.random()*180))*1000).toLocaleString()}千`;
    const avg = p.season?.avgRating ? p.season.avgRating.toFixed(1) : "-";
    html.push(`<tr>
      <td>${p.name}</td>
      <td>${p.team||p.club||'自由球員'}</td>
      <td>${salary}</td>
      <td>${avg}</td>
      <td><button class="btn small" data-id="${p.id}">詳情</button></td>
    </tr>
    <tr class="detail-row" id="detail-${p.id}" style="display:none">
      <td colspan="5">
        <div class="grid">
          <div>
            <div><b>位置</b>：${p.pos||p.position||'未知'}</div>
            <div><b>能力(OVR)</b>：${p.ovr}</div>
            <div><b>潛力</b>：${p.potential||'未評估'}</div>
            <div><b>狀態</b>：${p.status||''}</div>
          </div>
          <div>
            <div><b>本季數據</b>：G ${p.season?.G||0}｜AB ${p.season?.AB||0}｜H ${p.season?.H||0}｜HR ${p.season?.HR||0}｜RBI ${p.season?.RBI||0}</div>
            <div>AVG ${(p.season?.AVG||0).toFixed(3)}｜OPS ${(p.season?.OPS||0).toFixed(3)}</div>
          </div>
        </div>
      </td>
    </tr>`);
  }
  html.push(`</tbody></table>`);
  container.innerHTML = html.join("");

  container.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = btn.getAttribute('data-id');
      const row = document.getElementById('detail-'+id);
      row.style.display = row.style.display==='none' ? '' : 'none';
    });
  });
}
