
// Ratings & development rules
const RATING_BUCKETS = [
  {min:0, max:1.99, label:"待觀察", onWeeks:4, action:"release"},
  {min:2, max:2.99, label:"邊緣", onWeeks:4, action:"release"},
  {min:3, max:4.99, label:"讓渡名單", action:"waive"},
  {min:5, max:6.99, label:"一般球員", action:"none"},
  {min:7, max:7.99, label:"主力球員", action:"none"},
  {min:8, max:8.99, label:"當家球星", action:"none"},
  {min:9, max:10, label:"頂尖球星", action:"none"},
];

function evalBucket(avg){
  for(const b of RATING_BUCKETS){
    if(avg>=b.min && avg<=b.max) return b;
  }
  return RATING_BUCKETS[0];
}

function progressFromRating(player, weeklyRating){
  // simple development curve: higher rating drives ability up to potential
  if(typeof player.potential === 'undefined'){ player.potential = Math.min(120, Math.round(player.ovr + 10 + Math.random()*20)); }
  const cap = player.potential;
  const delta = (weeklyRating-5) * 0.6 + (Math.random()*0.6-0.3); // -3..+3 scaled
  if(delta>0 && player.ovr < cap){
    player.ovr = Math.min(cap, Math.round(player.ovr + delta));
  }else if(delta<0){
    player.ovr = Math.max(40, Math.round(player.ovr + delta*0.4));
  }
}

function agingAndRetirement(player, age){
  if(age>=35){
    const retireChance = Math.max(0, (age-34) * 0.05); // 35=>5% ... 45=>55%
    if(Math.random() < retireChance){
      player.retired = true;
    }
  }
}

