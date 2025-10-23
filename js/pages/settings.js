
App.registerPage('settings', {
  title: '設定 / 匯入',
  render(state){
    return `
      <div class="grid">
        <section class="card">
          <h2>匯入真實名單（CSV）</h2>
          <div class="muted">上傳 teams.csv 與 players.csv 以覆蓋目前名單。</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px">
            <div>
              <div class="muted">teams.csv 欄位：</div>
              <pre class="muted">leagueId,leagueName,teamId,teamName,country,level</pre>
            </div>
            <div>
              <div class="muted">players.csv 欄位：</div>
              <pre class="muted">name,teamId,salary,rating,age,position,eval,potential</pre>
            </div>
          </div>
          <div style="margin:10px 0">
            <input type="file" id="teams-file" accept=".csv" />
            <input type="file" id="players-file" accept=".csv" />
          </div>
          <button class="btn primary" id="btn-import">匯入</button>
          <button class="btn" id="btn-export">匯出目前資料</button>
        </section>

        <section class="card">
          <h2>關於版本</h2>
          <div class="stat-row">
            <div class="stat">版本：${App.version}</div>
            <div class="stat">週數：${state.week}/${state.maxWeeks}</div>
            <div class="stat">球隊：${state.teams.length}</div>
            <div class="stat">球員：${state.players.length}</div>
          </div>
        </section>
      </div>
    `;
  },
  onMount(state){
    document.getElementById('btn-import').addEventListener('click', async ()=>{
      const tf = document.getElementById('teams-file').files[0];
      const pf = document.getElementById('players-file').files[0];
      if(!tf && !pf){ alert('請至少提供一個 CSV'); return; }
      if(tf){
        const text = await tf.text(); const rows = csvToRows(text);
        // header
        const data = rows.slice(1).filter(r=>r.length>=6).map(r=>({
          leagueId: +r[0], leagueName:r[1], id:+r[2], name:r[3], country:r[4], level:r[5]
        }));
        // rebuild leagues from teams
        const byLeague = {};
        for(const t of data){
          if(!byLeague[t.leagueId]) byLeague[t.leagueId] = {id:t.leagueId, name:t.leagueName, teams:[], country:t.country, level:t.level};
          byLeague[t.leagueId].teams.push({id:t.id, name:t.name, country:t.country, level:t.level});
        }
        App.state.leagues = Object.values(byLeague);
        App.state.teams = App.state.leagues.flatMap(l=>l.teams.map(t=>({...t, leagueId:l.id, leagueName:l.name})));
      }
      if(pf){
        const text = await pf.text(); const rows = csvToRows(text);
        App.state.players = rows.slice(1).filter(r=>r.length>=5).map(r=>{
          const obj = {
            id: App.utils.id('ply'), name:r[0], teamId: +r[1]||null, salary:+r[2]||0, rating: +r[3]||5, age:+r[4]||25,
            position: r[5]||'CF', eval: +(r[6]||6), potential:+(r[7]||r[3]||6), teamName:'', leagueId:null, leagueName:'',
            weeksBelow2:0, status:'normal', stats:{G:0,PA:0,H:0,HR:0,RBI:0,AVG:0}
          };
          if(obj.teamId){
            const tm = App.state.teams.find(t=>t.id===obj.teamId);
            if(tm){ obj.teamName=tm.name; obj.leagueId=tm.leagueId; obj.leagueName=tm.leagueName; }
            else { obj.teamName='Unknown'; }
          }else{
            obj.teamName='Free Agent';
          }
          return obj;
        });
      }
      // reset schedule & tables
      App.state.schedule=[]; Object.keys(App.state).forEach(k=>{ if(k.startsWith('tbl_')||k.startsWith('po_')) delete App.state[k]; });
      App.sim.ensureSchedule();
      App.save();
      alert('匯入完成');
      App.navigate('home');
    });
    document.getElementById('btn-export').addEventListener('click', ()=>{
      const teams = ['leagueId,leagueName,teamId,teamName,country,level']
        .concat(App.state.teams.map(t=>[t.leagueId,t.leagueName,t.id,t.name,t.country||'',t.level||''].join(','))).join('\n');
      const players = ['name,teamId,salary,rating,age,position,eval,potential']
        .concat(App.state.players.map(p=>[p.name,p.teamId||'',p.salary,p.rating,p.age,p.position,p.eval,p.potential].join(','))).join('\n');
      download('teams.csv', teams);
      setTimeout(()=>download('players.csv', players), 400);
    });

    function csvToRows(text){
      return text.trim().split(/\r?\n/).map(line=>{
        // naive split; assumes no commas inside values
        return line.split(',');
      });
    }
    function download(filename, content){
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([content], {type:'text/csv'}));
      a.download = filename; a.click();
      URL.revokeObjectURL(a.href);
    }
  }
});
