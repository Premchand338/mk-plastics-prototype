// Builds one self-contained HTML file (dist/mk-prototype.html) from index.html,
// inlining every css/*.css and js/*.js it links, in the same order.
// Use it to share the prototype as a single file or to publish it as a Claude artifact.
// Usage: node tools/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g,(m,f)=>`<style>\n${fs.readFileSync(path.join(root,f),'utf8')}</style>`);
html=html.replace(/<script src="(js\/[^"]+)"><\/script>/g,(m,f)=>{const code=fs.readFileSync(path.join(root,f),'utf8');
  if(/<\/script/i.test(code))throw new Error(f+' contains "</script" — split that string, e.g. "<\\/script"');return `<script>\n${code}</script>`});
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
const out=path.join(root,'dist','mk-prototype.html');fs.writeFileSync(out,html);
console.log('Built',path.relative(root,out),(fs.statSync(out).size/1024).toFixed(0)+' KB');
