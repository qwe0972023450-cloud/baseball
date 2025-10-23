// Realistic leagues & teams with divisions.
window.BAM_LEAGUES = [
  {
    id: 1, name: 'MLB', country: 'USA', level: 'Top',
    divisions: ['AL East','AL Central','AL West','NL East','NL Central','NL West'],
    teams: [
      {id:101,name:'New York Yankees', country:'USA', level:'MLB', division:'AL East'},
      {id:102,name:'Boston Red Sox', country:'USA', level:'MLB', division:'AL East'},
      {id:103,name:'Baltimore Orioles', country:'USA', level:'MLB', division:'AL East'},
      {id:104,name:'Tampa Bay Rays', country:'USA', level:'MLB', division:'AL East'},
      {id:105,name:'Toronto Blue Jays', country:'USA', level:'MLB', division:'AL East'},
      {id:106,name:'Chicago White Sox', country:'USA', level:'MLB', division:'AL Central'},
      {id:107,name:'Cleveland Guardians', country:'USA', level:'MLB', division:'AL Central'},
      {id:108,name:'Detroit Tigers', country:'USA', level:'MLB', division:'AL Central'},
      {id:109,name:'Kansas City Royals', country:'USA', level:'MLB', division:'AL Central'},
      {id:110,name:'Minnesota Twins', country:'USA', level:'MLB', division:'AL Central'},
      {id:111,name:'Houston Astros', country:'USA', level:'MLB', division:'AL West'},
      {id:112,name:'Texas Rangers', country:'USA', level:'MLB', division:'AL West'},
      {id:113,name:'Los Angeles Angels', country:'USA', level:'MLB', division:'AL West'},
      {id:114,name:'Oakland Athletics', country:'USA', level:'MLB', division:'AL West'},
      {id:115,name:'Seattle Mariners', country:'USA', level:'MLB', division:'AL West'},
      {id:116,name:'New York Mets', country:'USA', level:'MLB', division:'NL East'},
      {id:117,name:'Atlanta Braves', country:'USA', level:'MLB', division:'NL East'},
      {id:118,name:'Philadelphia Phillies', country:'USA', level:'MLB', division:'NL East'},
      {id:119,name:'Miami Marlins', country:'USA', level:'MLB', division:'NL East'},
      {id:120,name:'Washington Nationals', country:'USA', level:'MLB', division:'NL East'},
      {id:121,name:'Chicago Cubs', country:'USA', level:'MLB', division:'NL Central'},
      {id:122,name:'St. Louis Cardinals', country:'USA', level:'MLB', division:'NL Central'},
      {id:123,name:'Milwaukee Brewers', country:'USA', level:'MLB', division:'NL Central'},
      {id:124,name:'Cincinnati Reds', country:'USA', level:'MLB', division:'NL Central'},
      {id:125,name:'Pittsburgh Pirates', country:'USA', level:'MLB', division:'NL Central'},
      {id:126,name:'Los Angeles Dodgers', country:'USA', level:'MLB', division:'NL West'},
      {id:127,name:'San Francisco Giants', country:'USA', level:'MLB', division:'NL West'},
      {id:128,name:'San Diego Padres', country:'USA', level:'MLB', division:'NL West'},
      {id:129,name:'Arizona Diamondbacks', country:'USA', level:'MLB', division:'NL West'},
      {id:130,name:'Colorado Rockies', country:'USA', level:'MLB', division:'NL West'}
    ]
  },
  {
    id: 2, name: 'NPB', country: 'Japan', level: 'Top',
    divisions: ['Central','Pacific'],
    teams: [
      {id:201,name:'Yomiuri Giants', country:'Japan', level:'NPB', division:'Central'},
      {id:202,name:'Hanshin Tigers', country:'Japan', level:'NPB', division:'Central'},
      {id:203,name:'Chunichi Dragons', country:'Japan', level:'NPB', division:'Central'},
      {id:204,name:'Hiroshima Toyo Carp', country:'Japan', level:'NPB', division:'Central'},
      {id:205,name:'Yokohama DeNA BayStars', country:'Japan', level:'NPB', division:'Central'},
      {id:206,name:'Tokyo Yakult Swallows', country:'Japan', level:'NPB', division:'Central'},
      {id:207,name:'Orix Buffaloes', country:'Japan', level:'NPB', division:'Pacific'},
      {id:208,name:'Fukuoka SoftBank Hawks', country:'Japan', level:'NPB', division:'Pacific'},
      {id:209,name:'Saitama Seibu Lions', country:'Japan', level:'NPB', division:'Pacific'},
      {id:210,name:'Tohoku Rakuten Golden Eagles', country:'Japan', level:'NPB', division:'Pacific'},
      {id:211,name:'Chiba Lotte Marines', country:'Japan', level:'NPB', division:'Pacific'},
      {id:212,name:'Hokkaido Nippon-Ham Fighters', country:'Japan', level:'NPB', division:'Pacific'}
    ]
  },
  {
    id: 3, name: 'KBO', country: 'Korea', level: 'Top',
    divisions: null,
    teams: [
      {id:301,name:'Doosan Bears', country:'Korea', level:'KBO'},
      {id:302,name:'LG Twins', country:'Korea', level:'KBO'},
      {id:303,name:'SSG Landers', country:'Korea', level:'KBO'},
      {id:304,name:'Lotte Giants', country:'Korea', level:'KBO'},
      {id:305,name:'KIA Tigers', country:'Korea', level:'KBO'},
      {id:306,name:'NC Dinos', country:'Korea', level:'KBO'},
      {id:307,name:'KT Wiz', country:'Korea', level:'KBO'},
      {id:308,name:'Hanwha Eagles', country:'Korea', level:'KBO'},
      {id:309,name:'Samsung Lions', country:'Korea', level:'KBO'},
      {id:310,name:'Kiwoom Heroes', country:'Korea', level:'KBO'}
    ]
  },
  {
    id: 4, name: 'CPBL', country: 'Taiwan', level: 'Top',
    divisions: null,
    teams: [
      {id:401,name:'CTBC Brothers', country:'Taiwan', level:'CPBL'},
      {id:402,name:'Rakuten Monkeys', country:'Taiwan', level:'CPBL'},
      {id:403,name:'Uni-President 7-Eleven Lions', country:'Taiwan', level:'CPBL'},
      {id:404,name:'Fubon Guardians', country:'Taiwan', level:'CPBL'},
      {id:405,name:'Wei Chuan Dragons', country:'Taiwan', level:'CPBL'},
      {id:406,name:'TSG Hawks', country:'Taiwan', level:'CPBL'}
    ]
  },
  {
    id: 5, name: 'CBL', country: 'China', level: 'Top',
    divisions: null,
    teams: [
      {id:501,name:'Beijing Tigers', country:'China', level:'CBL'},
      {id:502,name:'Tianjin Lions', country:'China', level:'CBL'},
      {id:503,name:'Shanghai Eagles', country:'China', level:'CBL'},
      {id:504,name:'Guangdong Leopards', country:'China', level:'CBL'},
      {id:505,name:'Jiangsu Pegasus', country:'China', level:'CBL'},
      {id:506,name:'Sichuan Dragons', country:'China', level:'CBL'}
    ]
  },
  {
    id: 6, name: 'ABL', country: 'Australia', level: 'Top',
    divisions: null,
    teams: [
      {id:601,name:'Adelaide Giants', country:'Australia', level:'ABL'},
      {id:602,name:'Brisbane Bandits', country:'Australia', level:'ABL'},
      {id:603,name:'Canberra Cavalry', country:'Australia', level:'ABL'},
      {id:604,name:'Melbourne Aces', country:'Australia', level:'ABL'},
      {id:605,name:'Perth Heat', country:'Australia', level:'ABL'},
      {id:606,name:'Sydney Blue Sox', country:'Australia', level:'ABL'},
      {id:607,name:'Auckland Tuatara', country:'New Zealand', level:'ABL'},
      {id:608,name:'Geelong-Korea', country:'Australia', level:'ABL'}
    ]
  }
];