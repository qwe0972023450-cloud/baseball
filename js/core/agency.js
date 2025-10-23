
(function(){const KEY='BAM_AGENCY';const DEF={level:1,xp:0,slots:5,clients:[]};
function load(){try{return JSON.parse(localStorage.getItem(KEY))||DEF}catch(e){return DEF}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
function cap(l){return 5+(l-1)*3}function lvl(x){return x<100?1:x<250?2:x<500?3:x<900?4:x<1400?5:x<2000?6:7}
function addXP(v){const s=load();s.xp+=v;s.level=lvl(s.xp);s.slots=cap(s.level);save(s);return s}
function sign(id){const s=load();if(s.clients.length>=s.slots)return{ok:false};if(s.clients.find(c=>c.playerId===id))return{ok:true};s.clients.push({playerId:id,since:Date.now()});addXP(10);save(s);return{ok:true}}
function release(id){const s=load();s.clients=s.clients.filter(c=>c.playerId!==id);save(s);return{ok:true}}
function summary(){const s=load();return{level:s.level,xp:s.xp,slots:s.slots,used:s.clients.length}}
function signed(){return new Set(load().clients.map(c=>c.playerId))}
window.Agency={load,save,sign,release,addXP,summary,signedPlayerIds:signed};})();
