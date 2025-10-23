window.PlayersSeed=function(){
  const seed={
    "NYY":["Aaron Judge","Juan Soto","Gerrit Cole","Anthony Rizzo","Giancarlo Stanton","Gleyber Torres","Carlos Rodón","Nestor Cortes"],
    "BOS":["Rafael Devers","Triston Casas","Trevor Story","Brayan Bello","Kenley Jansen","Masataka Yoshida"],
    "TOR":["Vladimir Guerrero Jr.","Bo Bichette","George Springer","Jose Berríos","Chris Bassitt","Kevin Gausman"],
    "TBR":["Randy Arozarena","Yandy Díaz","Shane McClanahan","Tyler Glasnow","Isaac Paredes"],
    "BAL":["Adley Rutschman","Gunnar Henderson","Cedric Mullins","Ryan Mountcastle","Grayson Rodriguez"],
    "CLE":["José Ramírez","Shane Bieber","Emmanuel Clase","Josh Naylor","Andrés Giménez"],
    "DET":["Spencer Torkelson","Riley Greene","Tarik Skubal","Javier Báez","Kerry Carpenter"],
    "CWS":["Luis Robert Jr.","Eloy Jiménez","Dylan Cease","Andrew Vaughn","Michael Kopech"],
    "KCR":["Bobby Witt Jr.","Salvador Perez","Brady Singer","Vinnie Pasquantino","MJ Melendez"],
    "MIN":["Carlos Correa","Byron Buxton","Pablo López","Royce Lewis","Joe Ryan"],
    "HOU":["Jose Altuve","Yordan Alvarez","Kyle Tucker","Alex Bregman","Framber Valdez","Justin Verlander"],
    "SEA":["Julio Rodríguez","Cal Raleigh","George Kirby","Luis Castillo","Logan Gilbert"],
    "TEX":["Corey Seager","Marcus Semien","Adolis García","Nathan Eovaldi","Josh Jung"],
    "LAA":["Mike Trout","Shohei Ohtani","Anthony Rendon","Patrick Sandoval","Reid Detmers"],
    "OAK":["Zack Gelof","Shea Langeliers","Tyler Soderstrom","Mason Miller"],
    "ATL":["Ronald Acuña Jr.","Matt Olson","Austin Riley","Spencer Strider","Ozzie Albies"],
    "PHI":["Bryce Harper","Trea Turner","Zack Wheeler","Aaron Nola","Kyle Schwarber","J.T. Realmuto"],
    "NYM":["Pete Alonso","Francisco Lindor","Jeff McNeil","Kodai Senga","Edwin Díaz"],
    "MIA":["Jazz Chisholm Jr.","Luis Arraez","Jesús Luzardo","Sandy Alcantara"],
    "WSH":["CJ Abrams","Keibert Ruiz","Josiah Gray","Lane Thomas"],
    "CHC":["Cody Bellinger","Dansby Swanson","Nico Hoerner","Justin Steele","Kyle Hendricks"],
    "MIL":["Christian Yelich","Corbin Burnes","Freddy Peralta","Willy Adames","Devin Williams"],
    "STL":["Paul Goldschmidt","Nolan Arenado","Willson Contreras","Miles Mikolas","Jordan Walker"],
    "CIN":["Elly De La Cruz","Jonathan India","Hunter Greene","Matt McLain","Nick Lodolo"],
    "PIT":["Oneil Cruz","Ke'Bryan Hayes","Bryan Reynolds","Mitch Keller"],
    "LAD":["Mookie Betts","Freddie Freeman","Shohei Ohtani","Walker Buehler","Clayton Kershaw","Will Smith"],
    "SFG":["Logan Webb","Camilo Doval","Michael Conforto","Thairo Estrada"],
    "SDP":["Fernando Tatis Jr.","Manny Machado","Xander Bogaerts","Yu Darvish","Joe Musgrove"],
    "ARI":["Corbin Carroll","Zac Gallen","Ketel Marte","Christian Walker","Merrill Kelly"],
    "COL":["Kris Bryant","C.J. Cron","Ryan McMahon","Kyle Freeland"],
    "YOM":["Kazuma Okamoto","Yoshihiro Maru","Tomoyuki Sugano"],
    "HNS":["Shintaro Fujinami","Teruaki Sato","Kento Itohara"],
    "CHU":["Ryusei Ohe","Yohei Oshima","Hiroto Takahashi"],
    "HRO":["Masato Morishita","Ryoma Nishikawa","Ryusei Kikuchi"],
    "YKB":["Shugo Maki","Toshiro Miyazaki","Taiki Sekine"],
    "YKS":["Munetaka Murakami","Tetsuto Yamada","Norichika Aoki"],
    "SOF":["Yuki Yanagita","Kodai Senga","Kensuke Kondo"],
    "HAM":["Sho Nakata","Naoyuki Uwasawa","Go Matsumoto"],
    "LIO":["Hotaka Yamakawa","Shuta Tonosaki","Takumi Kuriyama"],
    "LOT":["Koki Yamaguchi","Roki Sasaki","Hisunori Yasuda"],
    "ORA":["Yoshinobu Yamamoto","Masataka Yoshida","Yutaro Sugimoto"],
    "RAK":["Hideto Asamura","Masahiro Tanaka","Hiroaki Shimauchi"],
    "DOO":["Yang Eui-ji","Raul Alcantara","Kim Jae-hwan"],
    "LGW":["Kim Hyun-soo","Go Woo-suk","Park Hae-min"],
    "KIA":["Yang Hyeon-jong","Na Sung-bum","Choi Hyung-woo"],
    "LOT":["Lee Dae-ho","Park Se-woong","Jeon Jun-woo"],
    "NCD":["Yang Eui-ji","Na Sung-bum","Koo Chang-mo"],
    "HAN":["Ryu Hyun-jin","Noh Si-hwan","Jang Min-jae"],
    "KTW":["Kang Baek-ho","Go Young-pyo","Park Byung-ho"],
    "SSG":["Choo Shin-soo","Kim Kwang-hyun","Choi Jeong"],
    "KWO":["Lee Jung-hoo","An Woo-jin","Kim Hye-sung"],
    "SAM":["Oh Seung-hwan","Koo Ja-wook","David Buchanan"],
    "LAM":["Chen Chun-Hsiu","Lin Chih-Ping","Cheng Chin"],
    "BRO":["C.K. Wang","Chang Chih-Hao","K.L. Chiang"],
    "LIO_TW":["Lin An-Ko","Su Chih-Chieh","Chen Yun-Wen"],
    "WED":["Chu Yu-Hsien","Kuo Yen-Wen","Li Kai-Wei"],
    "TIA":["Liu Chih-Jung","Chen Kuan-Yu","Weng Yan"]
  };
  function obj(name,id){return {id:id+'_'+name.replace(/\s|\./g,''),name, pos:['P','C','1B','2B','SS','3B','LF','CF','RF','DH'][Math.floor(Math.random()*10)],age:21+Math.floor(Math.random()*15),rating:+(60+Math.random()*32).toFixed(1),salary:Math.round(1000000+Math.random()*25000000)};}
  const pools={MLB:{first:['Michael','James','Robert','John','David','William','Daniel','Joseph','Ryan','Andrew','Mark','Scott','Kevin','Jason','Eric','Alex','Chris','Brian','Patrick','Anthony'],last:['Smith','Johnson','Williams','Brown','Jones','Miller','Davis','Garcia','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin']},
    NPB:{first:['Taro','Hiroshi','Takashi','Yuki','Kenta','Shota','Kazuya','Ryo','Daiki','Sota','Naoki','Yuya','Kaito','Shinji'],last:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Yoshida','Yamada','Sasaki','Yamaguchi']},
    KBO:{first:['Minho','Jisoo','Hyunwoo','Sungmin','Taeyang','Jiwon','Seungwoo','Junho','Donghyun','Yongho','Jaeho'],last:['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han']},
    CPBL:{first:['Wei','Chih','Yu','Cheng','Kuo','Po','Kun','Ming','Hao','Yen','Chia','Ting','Chih-Hao','Chih-Wei'],last:['Wang','Chen','Lin','Hsueh','Huang','Tsai','Wu','Chang','Liu','Kao','Hsu','Lai','Fang']}};
  const leaguesByTeam={}; for(const lg of window.LeaguesSeed()){for(const t of lg.teams){leaguesByTeam[t.id]=lg.key;}}
  const out={};
  for(const teamId of Object.keys(leaguesByTeam)){
    const base=(seed[teamId]||[]).map(n=>obj(n,teamId));
    const lgKey=leaguesByTeam[teamId]; const pool=pools[lgKey]||pools.MLB;
    while(base.length<26){const name=pool.first[Math.floor(Math.random()*pool.first.length)]+' '+pool.last[Math.floor(Math.random()*pool.last.length)]; base.push(obj(name,teamId));}
    out[teamId]=base;
  }
  return out;
};