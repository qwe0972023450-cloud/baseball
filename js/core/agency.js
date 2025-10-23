/* v1.7.1: simple agency core (level, xp, slots, sign/release, 4w suggestions) */
window.Agency = (function(){
  const storeKey = "agency_state_v171";
  const defaultState = { level: 1, xp: 0, slots: 5, clients: [], lastSuggestionWeek: 0 };
  function load(){ try{ return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(storeKey)||"{}")); }catch(e){ return {...defaultState}; } }
  function save(){ localStorage.setItem(storeKey, JSON.stringify(state)); }
  function xpToNext(level){ return 100 + (level-1)*50; }
  function recalcSlots(){ state.slots = 5 + Math.floor((state.level-1)/1)*2; }
  const state = load(); recalcSlots();

  function addXP(val){ state.xp += val; const need = xpToNext(state.level); if(state.xp>=need){ state.level++; state.xp -= need; recalcSlots(); toast("經紀公司升級至 Lv."+state.level+"，客戶名額 "+state.slots); } save(); }
  function canSign(){ return state.clients.length < state.slots; }
  function sign(playerId){ if(!canSign()){ toast("已達上限，無法簽約"); return false; } if(state.clients.includes(playerId)){ toast("已是客戶"); return false; } state.clients.push(playerId); addXP(10); save(); toast("已簽入客戶 #"+playerId); return true; }
  function release(playerId){ const i=state.clients.indexOf(playerId); if(i>=0){ state.clients.splice(i,1); save(); toast("已解除客戶 #"+playerId); return true; } return false; }
  function weeklySuggestion(currentWeek, playerPoolGetter){
    if(currentWeek - (state.lastSuggestionWeek||0) >= 4){
      state.lastSuggestionWeek = currentWeek; save();
      const pool = (playerPoolGetter&&playerPoolGetter())||[];
      if(pool.length){
        const pick = pool[Math.floor(Math.random()*pool.length)];
        showSuggestionModal(pick);
      }
    }
  }

  function toast(msg){
    const el=document.createElement("div");
    el.className="toast-v171"; el.textContent=msg;
    Object.assign(el.style,{position:"fixed",bottom:"16px",left:"50%",transform:"translateX(-50%)",padding:"10px 14px",background:"#111",color:"#fff",borderRadius:"10px",zIndex:9999});
    document.body.appendChild(el); setTimeout(()=>el.remove(),2200);
  }

  function showSuggestionModal(player){
    const wrap = document.createElement("div");
    wrap.className="modal-v171";
    Object.assign(wrap.style,{position:"fixed",inset:"0",background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9998});
    const card = document.createElement("div");
    Object.assign(card.style,{background:"#fff",borderRadius:"16px",padding:"18px",width:"min(92vw,520px)",boxShadow:"0 10px 30px rgba(0,0,0,.2)"});
    card.innerHTML = `
      <h3 style="margin:0 0 8px;font-size:20px;">每4週推薦球員</h3>
      <div style="font-size:14px;opacity:.8;margin-bottom:12px;">是否簽入此名球員加入公司？</div>
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px;">
        <div style="width:56px;height:56px;border-radius:50%;background:#f2f2f2"></div>
        <div>
          <div><b>${player.name||"球員"}</b> · ${player.position||""}</div>
          <div style="font-size:12px;opacity:.8">${player.team||"-"}｜評分 ${player.rating||"-"}｜潛力 ${player.potential||"-"}</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="v171-decline" style="padding:8px 12px;border-radius:10px;border:1px solid #ddd;background:#fff">先不要</button>
        <button id="v171-accept" style="padding:8px 12px;border-radius:10px;border:0;background:#111;color:#fff">簽入</button>
      </div>`;
    wrap.appendChild(card); document.body.appendChild(wrap);
    card.querySelector("#v171-decline").onclick=()=>wrap.remove();
    card.querySelector("#v171-accept").onclick=()=>{ if(sign(player.id||player.pid||Date.now())) wrap.remove(); };
  }

  return { state, addXP, sign, release, canSign, weeklySuggestion };
})();
