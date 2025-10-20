
const FIRST_NAMES = ["志豪","冠廷","柏翰","承翰","家豪","俊傑","宇軒","彥廷","紹庭","亭妤","怡君","佳穎","美華","慧君","欣怡","雅婷","家瑜"];
const LAST_NAMES = ["王","李","張","林","陳","黃","吳","劉","蔡","楊","許","鄭","謝","洪","郭","羅","邱"];
const POSITIONS = ["先發投手","中繼投手","終結者","捕手","一壘手","二壘手","三壘手","游擊手","左外野","中外野","右外野"];
function randName(){
  return LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)] + FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)];
}
