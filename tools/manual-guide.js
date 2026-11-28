// Printable test checklist (Hinglish) from tools/manual-tests.js → docs/guide/MK-Plastics-Test-Checklist.pdf
// Usage: node tools/manual-tests.js && node tools/manual-guide.js
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const root=path.join(__dirname,'..'),gd=path.join(root,'docs','guide'),md=path.join(gd,'manual');
const D=JSON.parse(fs.readFileSync(path.join(md,'steps.json'),'utf8'));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const css=`
@page{size:A4;margin:14mm 12mm 16mm}
*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--ink:#1E1D2B;--muted:#6B6878;--line:#E6E1D5;--gold:#C9A86A;--gold-ink:#8A672C;--soft:#F7F3EA;--navy:#2B2A4C;--ok:#2F7D5B}
body{font-family:Inter,"DejaVu Sans",sans-serif;color:var(--ink);font-size:10pt;line-height:1.45;margin:0}
h1,h2,h3{font-family:"Inter Display",Inter,sans-serif;color:var(--navy);margin:0;line-height:1.2}
h1{font-size:26pt;font-weight:600}h2{font-size:15pt;font-weight:600}h3{font-size:11.5pt;font-weight:600;margin:12px 0 6px}
p{margin:0 0 7px}.small{font-size:8.5pt;color:var(--muted)}
.eyebrow{font-size:8pt;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-ink)}
.page{page-break-before:always}
table{border-collapse:collapse;width:100%;font-size:9pt}
th,td{border:1px solid var(--line);padding:5px 6px;text-align:left;vertical-align:top}
th{font-size:7.5pt;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--soft);font-weight:600}
tr{break-inside:avoid}
td.n{font-weight:600;color:var(--navy);text-align:center;width:5%}
td.who{width:10%;font-size:8.5pt}td.do{width:38%}td.see{width:33%}td.tick{width:6%;text-align:center}td.note{width:8%}
.box{display:inline-block;width:13px;height:13px;border:1.5px solid var(--navy);border-radius:3px}
.tc-h{background:var(--navy);color:#fff;border-radius:10px;padding:11px 14px;margin-bottom:10px}
.tc-h h2{color:#fff}.tc-h p{color:#D9D6E8;margin:4px 0 0}
.tc-h .eyebrow{color:#E7CF9C}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.tip{background:var(--soft);border-left:3px solid var(--gold);border-radius:6px;padding:8px 12px;margin:6px 0}
.tip ul{margin:0;padding-left:16px}.tip li{margin-bottom:3px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
figure{margin:0;break-inside:avoid}figure img{width:100%;height:auto;max-height:110mm;object-fit:contain;object-position:left top;border:1px solid var(--line);border-radius:8px}
figcaption{font-size:8pt;color:var(--muted);margin-top:3px}
.res td{height:26px}
`;
const total=D.cases.reduce((a,t)=>a+t.steps.length,0),passed=D.cases.reduce((a,t)=>a+t.steps.filter(s=>s.pass).length,0);
const tcHTML=t=>`<section class="page"><div class="tc-h"><div class="eyebrow">Test case ${t.id.slice(2)} · ${t.steps.length} step · login: ${esc(t.who)}</div><h2>${esc(t.title)}</h2><p>${esc(t.goal)}</p></div>
 <table><thead><tr><th>#</th><th>Kaun</th><th>Kya karo</th><th>Kya dikhna chahiye</th><th>OK?</th><th>Note</th></tr></thead><tbody>
 ${t.steps.map(s=>`<tr><td class="n">${s.n}</td><td class="who">${esc(s.who)}</td><td class="do">${s.do}</td><td class="see">${s.see}</td><td class="tick"><span class="box"></span></td><td class="note"></td></tr>`).join('')}
 </tbody></table>
 ${t.steps.some(s=>s.shot)?`<h3>Screen aisi dikhni chahiye</h3><div class="grid">${t.steps.filter(s=>s.shot).map(s=>`<figure><img src="manual/${s.shot}"><figcaption>Step ${s.n}: ${esc(s.do.replace(/<[^>]+>/g,'')).slice(0,110)}</figcaption></figure>`).join('')}</div>`:''}
</section>`;
const html=`<!doctype html><html lang="hi"><head><meta charset="utf-8"><title>MK Plastics · Test checklist</title><style>${css}</style></head><body>
<section>
 <div class="eyebrow">MK Plastics · Beads Bazaar · App v14.7</div>
 <h1 style="margin:8px 0 6px">3 Test case:<br>Zero reset se shuru</h1>
 <p style="font-size:11pt;color:var(--muted)">Har test ek saaf app se shuru hota hai. Har step: <b>kya karo</b> → <b>kya dikhna chahiye</b> → sahi ho toh ☐ par tick, galat ho toh Note mein likho.</p>
 <div class="cols" style="margin-top:12px">
  <div><h3>Logins</h3><table><thead><tr><th>Kaun</th><th>Mobile</th><th>PIN</th></tr></thead><tbody>
   <tr><td><b>Owner</b></td><td>9800000001</td><td>1111</td></tr><tr><td>Vinod (M1 moulding)</td><td>9800000020</td><td>3320</td></tr><tr><td>Salman (P1 Pearl)</td><td>9800000022</td><td>3322</td></tr></tbody></table>
   <h3>Teen test</h3><table><thead><tr><th>Test</th><th>Kya check hota hai</th><th>Step</th></tr></thead><tbody>
   ${D.cases.map(t=>`<tr><td><b>${t.id}</b></td><td>${esc(t.title)}</td><td>${t.steps.length}</td></tr>`).join('')}</tbody></table></div>
  <div class="tip"><h3 style="margin-top:0">Pehle yeh padh lo</h3><ul>
   <li>Har test se pehle <b>Zero reset → Haan, zero karo</b>. Masters (rate list, users, pirai spec, dhaga register) bache rehte hain.</li>
   <li>User badalna: <b>Logout</b> → <b>← Doosra number</b> → naya mobile → <b>Aage badho</b> → PIN.</li>
   <li>Staff (Vinod / Salman) pehle <b>Shift Shuru</b>, phir <b>Entry Daalo</b>.</li>
   <li><b>Moulding</b> ki entry: menu <b>Approval</b>. <b>Coating</b> ki entry: menu <b>Coating → Final approval</b>.</li>
   <li>Jo number "Kya dikhna chahiye" mein hain, wahi aane chahiye (jaise ₹6,136). Thoda bhi alag ho toh Note mein likho.</li>
   <li>Kuch dropdown chip ki tarah dikhte hain: naam par tap karo.</li>
   <li>Laptop par chalao (side menu dikhta hai). Phone par menu neeche "Aur" mein hota hai.</li>
  </ul></div>
 </div>
 <p class="small" style="margin-top:10px">Yeh saare step pehle app mein button ke naam se click karke chalaye gaye: <b>${passed}/${total} sahi</b> (${new Date(D.ts).toLocaleDateString('en-IN')}). File: <code>releases/v14.7-routing-task-boxes/mk-prototype-v14.7.html</code>.</p>
</section>
${D.cases.map(tcHTML).join('')}
<section class="page"><h2>Result sheet</h2><p class="small">Test ke baad bharo aur photo bhej do.</p>
 <table class="res"><thead><tr><th style="width:12%">Test</th><th style="width:14%">Tareekh</th><th style="width:16%">Kisne kiya</th><th style="width:14%">Sab OK?</th><th>Kahan galat / kya badalna hai</th></tr></thead><tbody>
 ${D.cases.map(t=>`<tr><td><b>${t.id}</b></td><td></td><td></td><td>☐ Haan ☐ Nahi</td><td></td></tr>`).join('')}
 <tr><td colspan="5" style="height:120px;vertical-align:top" class="small">Baaki notes / Zahid bhai ke sawaal ke jawab (Q2, Q3, Q4, Q5, Q6 …):</td></tr></tbody></table>
</section></body></html>`;
(async()=>{const out=path.join(gd,'test-checklist.html');fs.writeFileSync(out,html);
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const p=await (await b.newContext()).newPage();
 await p.goto('file://'+out);await p.waitForTimeout(400);const pdf=path.join(gd,'MK-Plastics-Test-Checklist.pdf');
 await p.pdf({path:pdf,format:'A4',printBackground:true,displayHeaderFooter:true,margin:{top:'14mm',bottom:'16mm',left:'12mm',right:'12mm'},headerTemplate:'<div></div>',
  footerTemplate:'<div style="width:100%;font-size:7.5pt;color:#8A8796;padding:0 12mm;display:flex;justify-content:space-between;font-family:Inter,sans-serif"><span>MK Plastics · 3 Test case (Zero reset se) · v14.7</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});
 await b.close();console.log('PDF',path.relative(root,pdf),(fs.statSync(pdf).size/1048576).toFixed(1)+' MB')})();
