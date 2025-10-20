
/* modules/playoffs.js */
export function makeBracket(standings){
  // standings: [{team, win, loss, pct}...]
  const sorted = [...standings].sort((a,b)=>b.pct - a.pct).slice(0,4);
  return {
    semi1: [sorted[0], sorted[3]],
    semi2: [sorted[1], sorted[2]],
    final: null,
    champion: null
  };
}
