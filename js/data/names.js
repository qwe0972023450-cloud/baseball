
// Male-only names, English + Chinese, with nationality
const MALE_EN_FIRST = ["James","John","Robert","Michael","William","David","Richard","Joseph","Thomas","Charles","Daniel","Matthew","Anthony","Mark","Steven","Paul","Andrew","Joshua","Kevin","Brian"];
const MALE_ZH_FIRST = ["志豪","冠廷","柏翰","承翰","家豪","俊傑","宇軒","彥廷","紹庭","冠宇","承恩","柏宇","宗翰","育誠","家銘","俊宏","冠霖","志軒","博文","信宏"];
const EN_LAST = ["Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Garcia","Rodriguez","Wilson","Martinez","Anderson","Taylor","Thomas","Hernandez","Moore","Martin","Jackson","Thompson","White"];
const ZH_LAST = ["王","李","張","林","陳","黃","吳","劉","蔡","楊","許","鄭","謝","洪","郭","羅","邱","曾","蕭","潘"];
const COUNTRIES = [
  ["USA","US"],["Japan","JP"],["South Korea","KR"],["Taiwan","TW"],["China","CN"],
  ["Australia","AU"],["Dominican Republic","DO"],["Venezuela","VE"],["Mexico","MX"],["Canada","CA"]
];

function randIdentity(){
  const zh = Math.random()<0.5;
  const name = zh
    ? (ZH_LAST[Math.floor(Math.random()*ZH_LAST.length)] + MALE_ZH_FIRST[Math.floor(Math.random()*MALE_ZH_FIRST.length)])
    : (MALE_EN_FIRST[Math.floor(Math.random()*MALE_EN_FIRST.length)] + " " + EN_LAST[Math.floor(Math.random()*EN_LAST.length)]);
  const [countryName, countryCode] = COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)];
  return { name, countryName, countryCode };
}

const POSITIONS = ["先發投手","中繼投手","終結者","捕手","一壘手","二壘手","三壘手","游擊手","左外野","中外野","右外野"];