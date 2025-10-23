window.CSV = {
  parse: function(text) {
    const lines = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split("\n");
    const rows = [];
    for (let line of lines) {
      if (line.trim()==="") continue;
      const cells = [];
      let cur = "", inQ = false;
      for (let i=0;i<line.length;i++){
        const ch = line[i];
        if (ch === '"' ) {
          if (inQ && line[i+1] === '"'){ cur += '"'; i++; }
          else inQ = !inQ;
        } else if (ch === ',' && !inQ) {
          cells.push(cur); cur="";
        } else cur += ch;
      }
      cells.push(cur);
      rows.push(cells.map(s=>s.trim()));
    }
    const header = rows.shift();
    return rows.map(r => {
      const o = {};
      header.forEach((h,i)=>o[h]=r[i]);
      return o;
    });
  }
};
