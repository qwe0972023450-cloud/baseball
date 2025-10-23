const express=require('express');const path=require('path');const app=express();const PORT=process.env.PORT||8080;
app.use(express.static(__dirname,{extensions:['html']}));
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(PORT,()=>console.log('BAM v1.6.4 on',PORT));