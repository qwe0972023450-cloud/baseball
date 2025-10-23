const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
app.use(compression());
const staticDir = path.join(__dirname);
app.use(express.static(staticDir, { maxAge: '1h', setHeaders: (res, filePath)=>{
  if(filePath.endsWith('.html')) res.setHeader('Cache-Control','no-store');
}}));
app.get('*', (req,res)=>{
  // Hash routing doesn't need server fallback, but keep index.html for safety
  res.sendFile(path.join(staticDir,'index.html'));
});
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`BB Agent v1.6.4 on ${port}`));
