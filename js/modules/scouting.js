
/* modules/scouting.js */
export function recommendPlayers(pool, count=3, nowWeek=1){
  // 從 pool 按潛力/年齡挑
  const sorted = [...pool].sort((a,b)=> (b.potential - a.potential) || (a.age - b.age));
  const out = sorted.slice(0,count).map(p=>({ ...p, discoveredWeek: nowWeek }));
  return out;
}
