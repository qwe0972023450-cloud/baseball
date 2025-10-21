#!/usr/bin/env node
// Convert your v1.1 roster JSON to v1.6.x format.
// Usage: node tools/convert_roster_11_to_16x.js input.json output.json
const fs=require('fs');
const [, , inFile, outFile] = process.argv;
if(!inFile||!outFile){ console.log('Usage: node tools/convert_roster_11_to_16x.js input.json output.json'); process.exit(1); }
const raw=JSON.parse(fs.readFileSync(inFile,'utf-8'));
/*
  Accepts objects like:
  { name, team, age, salary, ovr, potential, season? }, possibly with different field cases.
*/
const out = raw.map(p=>({
  name: p.name || p.playerName || p.fullname,
  team: p.team || p.teamName,
  age: Number(p.age ?? 24),
  salary: Number(p.salary ?? p.contract?.k ?? 500),
  ovr: Number(p.ovr ?? p.overall ?? 60),
  potential: Number(p.potential ?? p.pot ?? 70),
  season: p.season ? {
    G: Number(p.season.G ?? 0),
    AB: Number(p.season.AB ?? 0),
    H: Number(p.season.H ?? 0),
    HR: Number(p.season.HR ?? 0),
    RBI: Number(p.season.RBI ?? 0),
    AVG: Number(p.season.AVG ?? 0)
  } : undefined
}));
fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log('✅ Converted:', out.length, 'players ->', outFile);
