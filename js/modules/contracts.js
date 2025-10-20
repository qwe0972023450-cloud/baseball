
/* modules/contracts.js */
export const Contract = {
  canRenegotiate(player, nowWeek){
    if(!player.contract) return true;
    const weeksSince = nowWeek - (player.contract.signedWeek||0);
    return weeksSince >= 52; // 一年鎖定
  },
  cooling(player, nowWeek){
    const last = player.lastNegotiationWeek || -999;
    return (nowWeek - last) < 4;
  },
  triesLeft(player){
    return 3 - (player.negotiationTries||0);
  },
  applyOptions(offer, player){
    // 各選項對接受率的影響（+- 為趨勢）
    let delta = 0;
    if(offer.playerOption) delta += 5;
    if(offer.teamOption) delta -= 2;
    if(offer.buyout && offer.buyout > 0) delta += 3;
    if(offer.arbYears && offer.arbYears > 0) delta -= 1;
    // 年限與薪資也會加成
    delta += Math.min(10, Math.floor(offer.years * 1.2));
    delta += Math.min(12, Math.floor(offer.salary / (player.expectedSalary||200000) * 6));
    return delta;
  }
};
