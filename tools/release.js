// Makes a shareable release folder: releases/<version>-<slug>/mk-prototype-<version>.html
// Usage: node tools/release.js v14.1 order-slip
// Runs the normal build first, then copies the single file into the release folder.
// Write RELEASE-NOTES.md and OWNER-TEST.md in that folder, and add a row to releases/README.md.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const [ver,slug]=process.argv.slice(2);
if(!/^v\d+\.\d+$/.test(ver||'')||!/^[a-z0-9-]+$/.test(slug||'')){console.error('Usage: node tools/release.js v14.1 order-slip');process.exit(1)}
const root=path.join(__dirname,'..');
execFileSync(process.execPath,[path.join(__dirname,'build.js')],{stdio:'inherit'});
const dir=path.join(root,'releases',`${ver}-${slug}`);fs.mkdirSync(path.join(dir,'screenshots'),{recursive:true});
const out=path.join(dir,`mk-prototype-${ver}.html`);fs.copyFileSync(path.join(root,'dist','mk-prototype.html'),out);
console.log('Release file',path.relative(root,out));
