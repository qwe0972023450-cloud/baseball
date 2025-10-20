
/* modules/charts.js */
export function ensureChartJs(){
  return new Promise((resolve)=>{
    if(window.Chart){ resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    s.onload = ()=>resolve();
    document.head.appendChild(s);
  });
}
export async function renderLine(canvas, labels, datasets){
  await ensureChartJs();
  const c = canvas.getContext('2d');
  return new Chart(c, {
    type:'line',
    data:{ labels, datasets },
    options:{ responsive:true, plugins:{ legend:{ display:true } } }
  });
}
