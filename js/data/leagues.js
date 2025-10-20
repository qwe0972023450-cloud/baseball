
// Tiers: 1=中國, 2=澳洲ABL, 3=KBO/CPBL, 4=NPB, 5=MLB
const LEAGUES = [
  { id:"CNBL", name:"中國聯賽", tier:1, country:"中國", teams:[
    "北京猛虎","上海金鷹","廣東獵豹","四川熊貓","浙江海鷗","天津航海","江蘇雷霆","重慶山城","河南建業","武漢長江"
  ]},
  { id:"ABL", name:"澳洲職棒 ABL", tier:2, country:"澳洲", teams:[
    "布里斯本 Bandits","珀斯 Heat","雪梨 Blue Sox","墨爾本 Aces","坎培拉 Cavalry","奧克蘭 Tuatara"
  ]},
  { id:"KBO", name:"韓國職棒 KBO", tier:3, country:"韓國", teams:[
    "起亞虎","LG雙子","斗山熊","SSG登陸者","韓華鷹","NC恐龍","KT巫師","樂天巨人","三星獅","起源英雄"
  ]},
  { id:"CPBL", name:"中華職棒 CPBL", tier:3, country:"台灣", teams:[
    "樂天桃猿","中信兄弟","富邦悍將","統一7-ELEVEn獅","味全龍","台鋼雄鷹"
  ]},
  { id:"NPB", name:"日本職棒 NPB", tier:4, country:"日本", teams:[
    "讀賣巨人","阪神虎","中日龍","橫濱DeNA海灣之星","廣島東洋鯉魚","東京養樂多燕子",
    "福岡軟銀鷹","埼玉西武獅","東北樂天金鷲","歐力士猛牛","千葉羅德海洋","北海道日本火腿鬥士"
  ]},
  { id:"MLB", name:"美國職棒 MLB", tier:5, country:"美國", teams:[
    "Arizona Diamondbacks","Atlanta Braves","Baltimore Orioles","Boston Red Sox","Chicago Cubs",
    "Chicago White Sox","Cincinnati Reds","Cleveland Guardians","Colorado Rockies","Detroit Tigers",
    "Houston Astros","Kansas City Royals","Los Angeles Angels","Los Angeles Dodgers","Miami Marlins",
    "Milwaukee Brewers","Minnesota Twins","New York Mets","New York Yankees","Oakland Athletics",
    "Philadelphia Phillies","Pittsburgh Pirates","San Diego Padres","San Francisco Giants","Seattle Mariners",
    "St. Louis Cardinals","Tampa Bay Rays","Texas Rangers","Toronto Blue Jays","Washington Nationals"
  ]},
];
