window.Scheduler = {
  nextWeek(){
    if (Game.week >= Game.seasonWeeks){
      this.finishSeason();
      return;
    }
    Game.week++;
    Game.players.forEach(p => {
      if (p.retired) return;
      const isBatter = p.pos === 'B';
      p.season.G++;
      if (isBatter){
        const ab = 10 + Math.floor(Math.random()*12);
        const hits = Math.floor(ab*(0.18+Math.random()*0.18));
        const hr = Math.random()<0.15 ? Math.floor(Math.random()*2) : 0;
        const rbi = hr* (1+Math.floor(Math.random()*3));
        p.season.AB += ab;
        p.season.H += hits;
        p.season.HR += hr;
        p.season.RBI += rbi;
        p.season.AVG = p.season.AB ? (p.season.H / p.season.AB) : 0;
      } else {
        const ip = parseFloat((3+Math.random()*4).toFixed(1));
        const k = Math.floor(ip*(1.5+Math.random()*1.5));
        const er = Math.floor(Math.max(0, ip*(0.5+Math.random()*1.5)-Math.random()));
        p.season.IP = parseFloat((p.season.IP + ip).toFixed(1));
        p.season.K += k;
        p.season.ER += er;
        p.season.ERA = p.season.IP ? (p.season.ER*9/p.season.IP) : 0;
      }
      let delta = (Math.random()-.45)*0.2;
      if (isBatter && p.season.AVG>0.3) delta += 0.05;
      if (!isBatter && p.season.ERA && p.season.ERA<3.0) delta += 0.05;
      p.rating = Math.max(1, Math.min(10, +(p.rating + delta).toFixed(1)));
      p.skill = Math.max(50, Math.min(100, Math.round(p.skill + delta*2)));
      let mood = "🙂";
      if (p.rating>=9) mood = "🤩";
      else if (p.rating>=7.5) mood="😄";
      else if (p.rating<=3) mood="😕";
      p.mood = mood;
      if (p.rating < 2){
        p.weeksBelow2++;
        if (p.weeksBelow2>=4){
          p.waiver = false;
          p.retired = true;
          News.push(`【解約】${p.name} 表現低迷（平均評價 < 2 四週），與 ${p.team} 提前解約。`);
        }
      }else if (p.rating<5){
        p.waiver = true;
      }else{
        p.waiver = false;
      }
      if (!p.retired && p.age>=35){
        const chance = (p.age-34)*0.003;
        if (Math.random()<chance){
          p.retired = true;
          News.push(`【退休】${p.name}（${p.age}）宣布退休。`);
        }
      }
      if (Game.week % 13 === 0) p.age++;
    });
    this.weeklyNews();
    Bus.emit("render");
    Router.routes[Router.current()]?.();
  },

  finishSeason(){
    const year = Game.year;
    Game.leagues.forEach(l => {
      const teams = Game.teams.filter(t=>t.league===l.code);
      const champ = teams[Math.floor(Math.random()*teams.length)];
      Game.champions.push({year, league:l.code, leagueName:l.name, team:champ.name, country:champ.country});
      News.push(`【${l.name}】${year} 年度冠軍：${champ.country} ${champ.name}`);
    });
    Game.week = 1;
    Game.year++;
    Game.seasonWeeks = 40+Game.rand(6);
    Game.players.forEach(p => {
      p.season = {G:0,AB:0,H:0,AVG:0,HR:0,RBI:0,IP:0,K:0,ER:0,ERA:0};
      p.weeksBelow2 = 0;
      if (!p.retired && Math.random()<0.05) p.contract = Game.year + (1+Game.rand(3));
    });
    News.push(`【開季】${Game.year} 新球季正式開始（例行賽：${Game.seasonWeeks} 週）！`);
    updateHeader();
    Router.go("champions");
    saveGame();
  },

  weeklyNews(){
    const active = Game.players.filter(p=>!p.retired);
    if (active.length){
      const best = active.slice().sort((a,b)=>b.rating-a.rating)[0];
      const worst = active.slice().sort((a,b)=>a.rating-b.rating)[0];
      News.push(`【本週之星】${best.name} 評價 ${best.rating}（${best.team}）`);
      News.push(`【本週低潮】${worst.name} 評價 ${worst.rating}（${worst.team}）`);
    }
    const roll = Math.random();
    if (roll<0.2){
      const p = active[Math.floor(Math.random()*active.length)];
      News.push(`【流言】${p.name} 傳出可能被交易，${p.team} 表示「不評論」。`);
    }else if (roll<0.35){
      const p = active[Math.floor(Math.random()*active.length)];
      News.push(`【傷情】${p.name} 輕傷休戰一週，所幸無大礙。`);
    }else if (roll<0.45){
      News.push(`【商業】某品牌加碼贊助聯盟，聯盟聲量上升。`);
      Game.fame += 1;
    }
  }
};

window.News = {
  push(msg){
    const item = { id: Game.uid(), week: Game.week, year: Game.year, text: msg, time: Date.now() };
    Game.news.unshift(item);
  },
  list(){ return Game.news.slice(0,50); }
};
