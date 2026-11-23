const http=require('http'),fs=require('fs'),path=require('path');
const dir=process.argv[2];
http.createServer((q,s)=>{
 const h={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'*','Access-Control-Allow-Private-Network':'true'};
 if(q.method==='OPTIONS'){s.writeHead(204,h);return s.end();}
 const name=path.basename(new URL(q.url,'http://x').searchParams.get('n')||'img.bin');
 const ch=[];q.on('data',c=>ch.push(c));q.on('end',()=>{fs.writeFileSync(path.join(dir,name),Buffer.concat(ch));s.writeHead(200,h);s.end('ok '+name);});
}).listen(4789,'127.0.0.1',()=>console.log('listening'));
