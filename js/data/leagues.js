const Leagues = (()=>{
  const MLB_AL_E = ['Baltimore Orioles','Boston Red Sox','New York Yankees','Tampa Bay Rays','Toronto Blue Jays'];
  const MLB_AL_C = ['Chicago White Sox','Cleveland Guardians','Detroit Tigers','Kansas City Royals','Minnesota Twins'];
  const MLB_AL_W = ['Houston Astros','Los Angeles Angels','Oakland Athletics','Seattle Mariners','Texas Rangers'];
  const MLB_NL_E = ['Atlanta Braves','Miami Marlins','New York Mets','Philadelphia Phillies','Washington Nationals'];
  const MLB_NL_C = ['Chicago Cubs','Cincinnati Reds','Milwaukee Brewers','Pittsburgh Pirates','St. Louis Cardinals'];
  const MLB_NL_W = ['Arizona Diamondbacks','Colorado Rockies','Los Angeles Dodgers','San Diego Padres','San Francisco Giants'];

  const NPB_C = ['Yomiuri Giants','Hanshin Tigers','Hiroshima Toyo Carp','Chunichi Dragons','Tokyo Yakult Swallows','Yokohama DeNA BayStars'];
  const NPB_P = ['Orix Buffaloes','Fukuoka SoftBank Hawks','Saitama Seibu Lions','Tohoku Rakuten Golden Eagles','Chiba Lotte Marines','Hokkaido Nippon-Ham Fighters'];

  const KBO = ['Doosan Bears','Hanwha Eagles','Kia Tigers','KT Wiz','LG Twins','Lotte Giants','NC Dinos','Samsung Lions','SSG Landers','Kiwoom Heroes'];

  const CPBL = ['Rakuten Monkeys','CTBC Brothers','Uni-President 7-Eleven Lions','Fubon Guardians','Wei Chuan Dragons'];

  const leagues = [
    { id:'mlb', name:'MLB 美國職棒', country:'USA', weeks:45, structure:[
      { name:'American League East', teams: MLB_AL_E },
      { name:'American League Central', teams: MLB_AL_C },
      { name:'American League West', teams: MLB_AL_W },
      { name:'National League East', teams: MLB_NL_E },
      { name:'National League Central', teams: MLB_NL_C },
      { name:'National League West', teams: MLB_NL_W },
    ], gamesPerTeam:162, playoffSlots:12 },
    { id:'npb', name:'NPB 日本職棒', country:'Japan', weeks:44, structure:[
      { name:'Central League', teams: NPB_C },
      { name:'Pacific League', teams: NPB_P },
    ], gamesPerTeam:143, playoffSlots:6 },
    { id:'kbo', name:'KBO 韓國職棒', country:'Korea', weeks:44, structure:[
      { name:'KBO', teams: KBO },
    ], gamesPerTeam:144, playoffSlots:5 },
    { id:'cpbl', name:'CPBL 台灣職棒', country:'Taiwan', weeks:40, structure:[
      { name:'CPBL', teams: CPBL },
    ], gamesPerTeam:120, playoffSlots:4 },
  ];

  function getAllTeams(){
    const list=[]; let id=1;
    leagues.forEach(L=>L.structure.forEach(div=>div.teams.forEach(t=>{
      list.push({ id:id++, leagueId:L.id, league:L.name, division:div.name, name:t });
    })) );
    return list;
  }
  return { leagues, getAllTeams };
})();