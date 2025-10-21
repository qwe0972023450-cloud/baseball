const FAMILY = ["陳","林","黃","張","李","王","吳","劉","蔡","楊","趙","周","徐","孫","朱"];
const GIVEN = ["冠廷","冠宇","柏翰","志明","哲瑋","家豪","承恩","冠豪","建宏","俊傑","宗翰","承翰","睿恩","奕廷","威廷"];
window.RandomName = function(){ const f = FAMILY[Math.floor(Math.random()*FAMILY.length)]; const g = GIVEN[Math.floor(Math.random()*GIVEN.length)]; return f+g; };