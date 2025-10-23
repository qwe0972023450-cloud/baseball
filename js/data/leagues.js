window.LeaguesSeed=function(){return [
  {key:'MLB',name:'MLB 美國職棒',config:{gamesPerTeam:162},teams:[
    {id:'NYY',name:'New York Yankees'},{id:'BOS',name:'Boston Red Sox'},{id:'TOR',name:'Toronto Blue Jays'},{id:'TBR',name:'Tampa Bay Rays'},{id:'BAL',name:'Baltimore Orioles'},
    {id:'CLE',name:'Cleveland Guardians'},{id:'DET',name:'Detroit Tigers'},{id:'CWS',name:'Chicago White Sox'},{id:'KCR',name:'Kansas City Royals'},{id:'MIN',name:'Minnesota Twins'},
    {id:'HOU',name:'Houston Astros'},{id:'SEA',name:'Seattle Mariners'},{id:'TEX',name:'Texas Rangers'},{id:'LAA',name:'Los Angeles Angels'},{id:'OAK',name:'Oakland Athletics'},
    {id:'ATL',name:'Atlanta Braves'},{id:'PHI',name:'Philadelphia Phillies'},{id:'NYM',name:'New York Mets'},{id:'MIA',name:'Miami Marlins'},{id:'WSH',name:'Washington Nationals'},
    {id:'CHC',name:'Chicago Cubs'},{id:'MIL',name:'Milwaukee Brewers'},{id:'STL',name:'St. Louis Cardinals'},{id:'CIN',name:'Cincinnati Reds'},{id:'PIT',name:'Pittsburgh Pirates'},
    {id:'LAD',name:'Los Angeles Dodgers'},{id:'SFG',name:'San Francisco Giants'},{id:'SDP',name:'San Diego Padres'},{id:'ARI',name:'Arizona Diamondbacks'},{id:'COL',name:'Colorado Rockies'}
  ]},
  {key:'NPB',name:'NPB 日本職棒',config:{gamesPerTeam:143},teams:[
    {id:'YOM',name:'Yomiuri Giants'},{id:'HNS',name:'Hanshin Tigers'},{id:'CHU',name:'Chunichi Dragons'},{id:'HRO',name:'Hiroshima Toyo Carp'},{id:'YKB',name:'Yokohama DeNA BayStars'},{id:'YKS',name:'Tokyo Yakult Swallows'},
    {id:'SOF',name:'Fukuoka SoftBank Hawks'},{id:'HAM',name:'Hokkaido Nippon-Ham Fighters'},{id:'LIO',name:'Saitama Seibu Lions'},{id:'LOT',name:'Chiba Lotte Marines'},{id:'ORA',name:'Orix Buffaloes'},{id:'RAK',name:'Tohoku Rakuten Golden Eagles'}
  ]},
  {key:'KBO',name:'KBO 韓國職棒',config:{gamesPerTeam:144},teams:[
    {id:'DOO',name:'Doosan Bears'},{id:'LGW',name:'LG Twins'},{id:'KIA',name:'KIA Tigers'},{id:'LOT',name:'Lotte Giants'},{id:'NCD',name:'NC Dinos'},{id:'HAN',name:'Hanwha Eagles'},{id:'KTW',name:'KT Wiz'},{id:'SSG',name:'SSG Landers'},{id:'KWO',name:'Kiwoom Heroes'},{id:'SAM',name:'Samsung Lions'}
  ]},
  {key:'CPBL',name:'CPBL 中華職棒',config:{gamesPerTeam:120},teams:[
    {id:'LAM',name:'Rakuten Monkeys 樂天桃猿'},{id:'BRO',name:'CTBC Brothers 中信兄弟'},{id:'LIO_TW',name:'Uni-Lions 統一7-ELEVEn獅'},{id:'WED',name:'Wei Chuan Dragons 味全龍'},{id:'TIA',name:'TSG Hawks 台鋼雄鷹'}
  ]}
].map(lg=>({...lg,schedule:[]}));};