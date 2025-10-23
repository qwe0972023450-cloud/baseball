/* Auto-added by v1.7.1 upgrade: league/team overrides + levels + signingDifficulty */
window.LEAGUE_OVERRIDES = (function(){
  const MLB = {
    code: "MLB",
    name: "Major League Baseball",
    level: 5, signingDifficulty: "Very Hard",
    conferences: [
      { name: "American League", divisions: [
        { name: "AL East", teams: ["New York Yankees","Boston Red Sox","Tampa Bay Rays","Toronto Blue Jays","Baltimore Orioles"] },
        { name: "AL Central", teams: ["Cleveland Guardians","Minnesota Twins","Chicago White Sox","Detroit Tigers","Kansas City Royals"] },
        { name: "AL West", teams: ["Houston Astros","Texas Rangers","Seattle Mariners","Los Angeles Angels","Oakland Athletics"] }
      ]},
      { name: "National League", divisions: [
        { name: "NL East", teams: ["Atlanta Braves","Philadelphia Phillies","New York Mets","Miami Marlins","Washington Nationals"] },
        { name: "NL Central", teams: ["St. Louis Cardinals","Chicago Cubs","Milwaukee Brewers","Cincinnati Reds","Pittsburgh Pirates"] },
        { name: "NL West", teams: ["Los Angeles Dodgers","San Francisco Giants","San Diego Padres","Arizona Diamondbacks","Colorado Rockies"] }
      ]}
    ]
  };

  const NPB = {
    code: "NPB", name: "Nippon Professional Baseball",
    level: 5, signingDifficulty: "Hard",
    conferences: [
      { name: "Central League", divisions: [{ name: "Central", teams: ["Yomiuri Giants","Hanshin Tigers","Chunichi Dragons","Hiroshima Toyo Carp","Yokohama DeNA BayStars","Tokyo Yakult Swallows"] }]},
      { name: "Pacific League", divisions: [{ name: "Pacific", teams: ["Orix Buffaloes","Fukuoka SoftBank Hawks","Tohoku Rakuten Golden Eagles","Chiba Lotte Marines","Hokkaido Nippon-Ham Fighters","Saitama Seibu Lions"] }]}
    ]
  };

  const KBO = {
    code: "KBO", name: "KBO League",
    level: 4, signingDifficulty: "Medium-Hard",
    conferences: [
      { name: "KBO", divisions: [{ name: "Regular", teams: ["Doosan Bears","LG Twins","Lotte Giants","SSG Landers","Kia Tigers","Samsung Lions","Hanwha Eagles","NC Dinos","KT Wiz","Kiwoom Heroes"] }]}
    ]
  };

  const CPBL = {
    code: "CPBL", name: "Chinese Professional Baseball League",
    level: 3, signingDifficulty: "Medium",
    conferences: [
      { name: "CPBL", divisions: [{ name: "Regular", teams: ["Uni-President Lions","CTBC Brothers","Rakuten Monkeys","Fubon Guardians","Wei Chuan Dragons","Tainan TSG Hawks"] }]}
    ]
  };

  const CNBL = {
    code: "CNBL", name: "China Baseball League",
    level: 2, signingDifficulty: "Medium-Easy",
    conferences: [
      { name: "CBL", divisions: [{ name: "Regular", teams: ["Beijing Tigers","Tianjin Lions","Shanghai Golden Eagles","Jiangsu Pegasus","Sichuan Dragons","Guangdong Leopards"] }]}
    ]
  };

  const ABL = {
    code: "ABL", name: "Australian Baseball League",
    level: 2, signingDifficulty: "Medium",
    conferences: [
      { name: "ABL", divisions: [{ name: "Regular", teams: ["Adelaide Giants","Brisbane Bandits","Canberra Cavalry","Melbourne Aces","Perth Heat","Auckland Tuatara"] }]}
    ]
  };

  return { MLB, NPB, KBO, CPBL, CNBL, ABL };
})();
