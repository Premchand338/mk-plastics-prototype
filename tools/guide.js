// Owner guide + test report → docs/guide/MK-Plastics-Guide-v14.7.pdf (Hinglish, A4).
// Needs: docs/guide/tc/results.json (node tools/test-cases.js) and the release screenshots.
// Usage: node tools/guide.js   (PW_CHROMIUM=/opt/pw-browsers/chromium in the cloud container)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const root=path.join(__dirname,'..'),gd=path.join(root,'docs','guide');
const R=JSON.parse(fs.readFileSync(path.join(gd,'tc','results.json'),'utf8'));
const REVIEW={checks:744,issues:0}; // node tools/review.js (26 Nov 2026)
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rel=(v,f)=>`../../releases/${v}/screenshots/${f}`;
const fig=(src,cap,cls='')=>`<figure class="${cls}"><img src="${src}"><figcaption>${cap}</figcaption></figure>`;
const steps=a=>`<ol class="steps">${a.map(s=>`<li>${s}</li>`).join('')}</ol>`;
const total=R.cases.reduce((a,t)=>a+t.steps.length,0),passed=R.cases.reduce((a,t)=>a+t.steps.filter(s=>s.pass).length,0);

/* ---------- section workflows ---------- */
const SECTIONS=[
 {no:'1',v:'v14.1',title:'Order slip',who:'Owner (admin)',why:'Order ab owner ki slip book jaisa: ek slip number, ek item ke kai rang, har rang ke packet.',
  steps:['<b>Orders → Naya order</b> dabao. Slip number apne aap aata hai (book ka agla, jaise 224).','Tareekh, <b>Party</b>, Transport (kahan se → kahan tak; party ka shehar apne aap) bharo.','Item chuno (size + Semi / Super …), Unit (Pearl / Metalizing), Grade, Coating.','<b>Rang</b> chuno aur <b>packet</b> daalo. Doosra rang: <b>"Aur rang"</b>. Doosra size: <b>"Aur item"</b>.','Rate rate list se aata hai; deal alag ho toh badlo. <b>Sign</b> mein order lene wale ka naam.','<b>Slip save karo</b>. App batata hai kya stock se jaayega aur kis rang ka coating task dena hai.'],
  tips:['Agla slip number: Orders page par <b>"Agla slip #…"</b> se badal sakte ho. Ek number do baar nahi chalega.','<b>Pehla slip pehle:</b> list mein sabse purana slip upar (1, 2, 3). Taiyaar stock bhi pehle purane slip ko milta hai.','<b>Party-wise</b> tab: har party, har rang: Order / Bane / Baaki. Pura hone par <b>Ready to dispatch</b>.','Order kholo → <b>Slip dekho</b>: book jaisa kaagaz.'],
  figs:[[rel('v14.1-order-slip','01-slip-form-top-phone.png'),'Naya order · slip (phone)','ph'],[rel('v14.1-order-slip','03-orders-priority-phone.png'),'Pehla slip pehle (1, 2) · Ready to dispatch','ph'],[rel('v14.1-order-slip','05-slip-paper-desktop.png'),'Slip dekho: book jaisa kaagaz','wide']]},
 {no:'1b',v:'v14.2',title:'Pehle dispatch, phir bill',who:'Sirf owner',why:'Owner ka jawab (Q11): maal pehle jaata hai, bill saath mein ya baad mein. Bill par dispatch ki tareekh.',
  steps:['Order kholo → <b>Dispatch karo</b> (pehle "Bill banao" tha).','Har rang ke <b>packet</b> (taiyaar stock tak), <b>gaadi number</b>, <b>dispatch ki tareekh</b>, maal ki photo.','<b>Bill kab?</b> → <b>Abhi bill banao</b>: rate dekho (slip se bhara), GST / Kachcha chuno. Ya <b>Bill baad mein</b>.','Save: stock usi waqt minus. Abhi bill chuna toh invoice turant: <b>WhatsApp</b> · <b>PDF download</b>.','Bill baad mein: Orders → <b>Bill banana baaki</b> → Bill banao → final rate → invoice.'],
  tips:['Invoice ki tareekh = <b>dispatch ki tareekh</b>. Bill kis din bana, woh alag save hota hai ("Bill bana …").','Har dispatch ka alag bill; do order kabhi ek bill mein nahi.','<b>Bill setting</b> (Orders page): pehle se kaunsa chuna ho, bill kitne din mein (2), credit limit par warning ya rokna.','PDF: browser ka print → "Save as PDF"; file ka naam bill number. WhatsApp mein message taiyaar, PDF haath se jodo.'],
  figs:[[rel('v14.2-dispatch-bill','01-dispatch-screen-phone.png'),'Dispatch karo · packet + rate','ph'],[rel('v14.2-dispatch-bill','03-invoice-pdf-whatsapp-phone.png'),'Invoice: WhatsApp · PDF download','ph'],[rel('v14.2-dispatch-bill','06-bill-later-final-rate-desktop.png'),'Bill baad mein: final rate bharo','wide']]},
 {no:'2',v:'v14.3',title:'Karigar ko pirai ke liye bhejna',who:'Owner',why:'Karigar ko bata ke bhejna ki guchha kaise banana hai. 1 bunch = 1,200 moti; karigar frame / guchha mein deta hai.',
  steps:['<b>Karigar → Karigar ko bhejo</b>: karigar, moulded maal, kitna kg.','<b>Pirai spec</b> maal se apne aap chunta hai (P2 register). Galat ho toh dropdown se badlo.','Box "Guchha kaise banana hai": jaise 8mm Semi: 18 ladi = 1 guchha · 2 guchha = 1 frame · 50 moti / ladi = 1,800 moti / frame. Saath mein andaazan frame.','<b>Bhejo + challan banao</b>: challan par bhi yahi spec.'],
  tips:['Spec ki list: <b>Rate list → Pirai spec</b> (31 lines, sab badal sakte ho). 6 Munga par "confirm baaki".','1 bunch = 1,200 moti: Pirai spec ke upar button se badal sakte ho.','Rate list mein naye item: <b>6 B.H.L.</b> aur <b>6 Semi Flat</b> (rate baaki).'],
  figs:[[rel('v14.3-pirai','01-send-spec-phone.png'),'Bhejte waqt spec + andaaza','ph'],[rel('v14.3-pirai','05-challan-desktop.png'),'Job-work challan par spec','wide']]},
 {no:'3 + 4',v:'v14.4',title:'Karigar se wapas lena + Dhaga stock',who:'Owner (receiver: jaise Salman)',why:'Return entry bilkul karigar ki slip jaisi; dhaga apne aap alag; cut waste mein; dhaga ka stock.',
  steps:['Karigar page → job par <b>Wapas lo</b>.','Upar: Karigar · Item · Challan. <b>Tareekh</b> aur <b>Maal kisne liya</b>.','<b>Grade</b> 1st / 2nd / 3rd (zaroori: bina grade save nahi).','<b>Kitne frame aaye</b> + khule guchha → app moti aur bunch nikaalta hai.','<b>Kul wazan (dhaage ke saath)</b>, <b>Dhaga type</b>, gram / kg (register P1 se), <b>Cut</b>.','Neeche hisaab dekho: dhaga kitna, maal kitna, dhaga stock kitna bacha, cut kis waste mein → <b>Threaded maal aaya</b>.'],
  tips:['Dhaga = kul wazan × g/kg. P3 slip: 40.400 kg × 70 g = 2.828 kg dhaga, maal 37.572 kg.','Dhaga type pehli baar chuno, <b>"Is item ke liye yaad rakho"</b>: agli baar apne aap.','<b>Stock → Dhaga</b>: Dhaga aaya, Ginti, Type / reorder. Reorder se kam → bell.','Cut → raw material ke type ka waste; Waste page par <b>grade ke hisaab se</b> bhi.'],
  figs:[[rel('v14.4-karigar-return-dhaga','02-grade-dhaga-cut-phone.png'),'Grade · frame · kul wazan · dhaga','ph'],[rel('v14.4-karigar-return-dhaga','03-dhaga-summary-phone.png'),'Hisaab: dhaga, stock, cut, baaki','ph'],[rel('v14.4-karigar-return-dhaga','04-dhaga-stock-phone.png'),'Stock → Dhaga','ph']]},
 {no:'6',v:'v14.5',title:'Coating task: packet se frame',who:'Owner',why:'Owner packet dete hain, frame app nikaalta hai: packet = packing × 1,200 moti, frame = P2 spec, owner ka allowance.',
  steps:['<b>Tasks → Coating task</b> (ya order se "Coating task do").','Machine (P1 / P2 / MZ1), lot, item, grade, rang, coating.','<b>Kitne packet chahiye</b> daalo → <b>Target (frames)</b> apne aap.','Box "Is item ka hisaab": 1 packet = 4,800 moti · 1 frame = 1,800 moti · exact 2.667 · allowance 2.8 → 100 packet = <b>280 frame</b>.','<b>Task do</b>: card par "280 frame ka target · 100 packet × 2.8".'],
  tips:['Allowance (tooti ladi ke liye): <b>Rate list → Badlo → Allowance</b>. Abhi sirf 8mm Semi = 2.8; baaki par exact.','Exact frame / packet (P2) rate list mein "P2" ke saath, read-only (spec badlo toh badlega).','3MM Semi ka 1 frame = 6,000 moti = 5 bunch (pehle andaaza 10 tha).'],
  figs:[[rel('v14.5-packets-frames','01-packets-to-frames-phone.png'),'Packet → frame ka hisaab','ph'],[rel('v14.5-packets-frames','03-task-card-target-phone.png'),'Task card: target','ph']]},
 {no:'7',v:'v14.6',title:'Roz ki production entry',who:'Operator (Salman / P2 / Hamidur), approval owner',why:'Aaj ke bane packet kal pack hote hain: entry agle din, work date ke saath. Reject apne aap.',
  steps:['Operator login → <b>Entry</b>. Upar <b>work date</b> (pehle se kal).','Task chuno (progress dikhta hai: pehle + aaj = kul, baaki).','<b>Frames use hue</b> aur <b>Kitne packet bane</b>.','Hisaab: (frames × moti/frame − packets × moti/packet) ÷ 1,200 = <b>reject bunch</b> → Waste "Coating reject".','Owner <b>Approval → OK</b>: stock = packet × packing.'],
  tips:['Packet khaali chhoda toh purana tareeka (pack hue frame / reject frame) chalta hai.','Target se 1–2 frame upar-neeche theek; zyada par warning.','Tasks page neeche: <b>Operator ki entry · work date</b> (owner ka tab).'],
  figs:[[rel('v14.6-daily-entry','01-work-date-phone.png'),'Work date + task','ph'],[rel('v14.6-daily-entry','03-reject-bunch-phone.png'),'Reject bunch ka hisaab','ph'],[rel('v14.6-daily-entry','06-owner-tab-desktop.png'),'Owner ka tab: operator ki entry','wide']]},
 {no:'5',v:'v14.7',title:'Line routing + coating task ke box',who:'Owner',why:'Pearl ka maal Pearl unit mein, Metal ka Metal mein. Owner ke task format ke box (Q6 ka intezaar).',
  steps:['Moulding task mein pehle <b>Line</b> chuno: usi line ka raw material dikhta hai.','Wahi line aage chalti hai: moulded stock → karigar → threaded lot → coating.','Coating task mein machine ke neeche: "Pearl line · …" / "Metalizing line · …". Lot sirf usi line ke.','<b>Task ke box</b>: owner apne box jode (Number / Likhne ka / Tick). Naye task aur card par dikhte hain.'],
  tips:['Owner ka message (Q6) aate hi wahi box jod do, code nahi badlega.','Metal coating ki requirement owner baad mein batayega.'],
  figs:[[rel('v14.7-routing-task-boxes','02-task-line-metalizing-phone.png'),'MZ1: sirf Metalizing ka lot','ph'],[rel('v14.7-routing-task-boxes','04-task-with-boxes-phone.png'),'Owner ke box task mein','ph'],[rel('v14.7-routing-task-boxes','05-task-card-boxes-phone.png'),'Card par box ki value','ph']]},
];

const FIXED=[
 ['v14.2','Bell mein ek hi dispatch do baar ("2 din se zyada" + "bill banana baaki").','Late wala sirf laal alert mein.'],
 ['v14.3','Rate list ke naam mein bunch/kg gol: 8mm Semi ke dono item "4B" dikhte the.','Ab 3.5B aur 4.25B.'],
 ['v14.3','Phone par pirai spec ke 31 chip (lamba scroll).','Ek dropdown.'],
 ['v14.4','Reorder 0 aur stock 0 par har dhaga type ka jhootha alert.','Alert sirf minus ya reorder set ho tab.'],
 ['v14.5','Packet daalte hi frame / packet aapas mein ulajhte the (100 packet → 95).','Sirf jo aap type karo uspe; app ka khud ka update dobara nahi.'],
 ['v14.6','Phone par reject ka hisaab-box chhota, text bahar.','Box poora dikhta hai; test check karta hai.'],
 ['v14.7','Jis maal ka pirai spec nahi (jaise Black PP), return form mein grade ka box nahi, toh save hi nahi hota tha.','Grade hamesha dikhta hai.'],
];
const OBS=[
 ['Bell mein dhaga ka alert "Stock" group ke andar chhup jaata hai (demo raw material ke 14 alert ke saath).','Sujhaav: dhaga / karigar alert alag group mein. Owner bataye.'],
 ['WhatsApp sirf message bhejta hai; PDF haath se attach.','Prototype ki seema (server nahi). Asli app mein PDF apne aap.'],
 ['"Bill baad mein" se invoice number aur tareekh ka kram ulta ho sakta hai (0005 ki tareekh 0004 se pehle).','CA se poochna.'],
 ['Hindi mode mein kuch technical shabd (frame, bunch, dispatch) English mein hi rehte hain.','Jaan-boojh kar; factory mein yahi bolte hain.'],
 ['6MM Semi aur 8MM Super ka P2 spec nahi: in par purana andaaza (1 frame = 10 bunch).','Owner se spec chahiye.'],
];
const QS=[
 ['Q2','1½ aur 2 number Super (S.P.) rate list mein jodna hai?'],
 ['Q3a','6 Semi ka dhaga: 020 ya 021 gram?'],
 ['Q3b','1½ S.P. ka dhaga: 217 ya 247 gram?'],
 ['Q3d','3 Semi ke do dhaga value (070, 080): 60B wale ka 070 aur 56B wale ka 080, sahi?'],
 ['Q4','Baaki items ka allowance (jaise 8mm = 2.8) ki list.'],
 ['Q5','Kis maal mein kaunsa dhaga (1×3, 2×2, 3×3, 1×2)? (Abhi return par chun ke yaad rakhte hain.)'],
 ['Q6','Coating task haath se kaise likhte ho? Woh message bhejo, wahi box jod denge.'],
 ['Spec','6MM Semi aur 8MM Super ka pirai spec (ladi / guchha, moti / ladi).'],
 ['Cut','Cut ka grade wahi jo maal ka grade, ya alag?'],
 ['Work date','Entry hamesha agle din hi hoti hai, ya kabhi 2–3 din baad bhi?'],
 ['CA','Bill baad mein: invoice number aur tareekh ka kram (upar dekho).'],
];

const css=`
@page{size:A4;margin:16mm 14mm 18mm}
*{box-sizing:border-box}
:root{--ink:#1E1D2B;--muted:#6B6878;--line:#E6E1D5;--gold:#C9A86A;--gold-ink:#8A672C;--soft:#F7F3EA;--navy:#2B2A4C;--ok:#2F7D5B;--ok-soft:#E5F2EB;--bad:#B4473B;--bad-soft:#F7E6E3}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Inter,"DejaVu Sans",sans-serif;color:var(--ink);font-size:10.5pt;line-height:1.5;margin:0}
h1,h2,h3{font-family:"Inter Display",Inter,sans-serif;color:var(--navy);line-height:1.2;margin:0}
h1{font-size:28pt;font-weight:600;letter-spacing:-.01em}
h2{font-size:17pt;font-weight:600;margin:0 0 6px;padding-top:2px}
h3{font-size:12pt;font-weight:600;margin:14px 0 6px}
p{margin:0 0 8px}
.eyebrow{font-size:8pt;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-ink)}
.page{page-break-before:always}
.lead{color:var(--muted);font-size:10.5pt;margin-bottom:10px}
.cover{height:257mm;display:flex;flex-direction:column;justify-content:space-between;padding:6mm 2mm}
.cover .band{border-top:3px solid var(--gold);padding-top:14px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}
.kpi{border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:#fff}
.kpi b{display:block;font-size:18pt;font-weight:600;color:var(--navy);font-family:"Inter Display",Inter}
.kpi span{font-size:8.5pt;color:var(--muted)}
.toc{columns:2;column-gap:24px;margin:0;padding:0;list-style:none}
.toc li{break-inside:avoid;padding:5px 0;border-bottom:1px dotted var(--line);display:flex;justify-content:space-between;gap:10px}
.toc li span{color:var(--muted)}
table{border-collapse:collapse;width:100%;font-size:9pt;margin:6px 0 10px}
th,td{border-bottom:1px solid var(--line);padding:5px 6px;text-align:left;vertical-align:top}
th{font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;background:var(--soft)}
tr{break-inside:avoid}
.ok{color:var(--ok);font-weight:600}.bad{color:var(--bad);font-weight:600}
.pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:8pt;font-weight:600}
.pill.ok{background:var(--ok-soft)}.pill.bad{background:var(--bad-soft)}
.sec-h{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid var(--gold);padding-bottom:6px;margin-bottom:8px}
.sec-h .no{font-family:"Inter Display";font-size:22pt;font-weight:600;color:var(--gold-ink)}
.meta{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 8px}
.meta span{font-size:8.5pt;background:var(--soft);border-radius:999px;padding:2px 9px;color:var(--navy)}
.cols{display:grid;grid-template-columns:1.15fr 1fr;gap:16px;align-items:start}
ol.steps{margin:0;padding-left:20px}ol.steps li{margin-bottom:4px}
.tips{background:var(--soft);border-left:3px solid var(--gold);border-radius:6px;padding:8px 12px;margin:8px 0}
.tips ul{margin:0;padding-left:16px}.tips li{margin-bottom:3px;font-size:9.5pt}
.figs{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;align-items:flex-start}
figure{margin:0;break-inside:avoid}
figure img{display:block;border:1px solid var(--line);border-radius:8px;max-width:100%}
figure.ph img{height:66mm;width:auto}
figure.wide img{height:66mm;width:auto;max-width:100%}
.figs.tcg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
figure.tc img{width:100%;height:auto;max-height:96mm;object-fit:contain;object-position:left top}
figcaption{font-size:8pt;color:var(--muted);margin-top:3px}
.flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:10px 0}
.flow b{background:#fff;border:1px solid var(--gold);border-radius:8px;padding:6px 9px;font-size:9pt;font-weight:600;color:var(--navy)}
.flow i{color:var(--gold-ink);font-style:normal;font-weight:700}
.box{border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:8px 0;break-inside:avoid}
.small{font-size:8.5pt;color:var(--muted)}
.tc-h{background:var(--navy);color:#fff;border-radius:10px;padding:10px 14px;margin-bottom:8px}
.tc-h h2{color:#fff}.tc-h p{color:#D9D6E8;margin:4px 0 0}
`;

const sectionHTML=s=>`<section class="page"><div class="sec-h"><span class="no">${s.no}</span><h2>${esc(s.title)}</h2></div>
 <div class="meta"><span>Version ${s.v}</span><span>Kaun karega: ${esc(s.who)}</span></div>
 <p class="lead">${s.why}</p>
 <div class="cols"><div><h3>Step by step</h3>${steps(s.steps)}</div><div class="tips"><h3 style="margin-top:0">Dhyan do</h3><ul>${s.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div></div>
 <div class="figs">${s.figs.map(([src,cap,cls])=>fig(src,cap,cls)).join('')}</div></section>`;

const tcHTML=t=>{const ok=t.steps.filter(s=>s.pass).length;
 return `<section class="page"><div class="tc-h"><div class="eyebrow" style="color:#E7CF9C">Test case ${t.id.slice(2)} · ${ok}/${t.steps.length} pass</div><h2>${esc(t.title)}</h2><p>${esc(t.goal)}</p></div>
 <table><thead><tr><th style="width:4%">#</th><th style="width:13%">Section</th><th style="width:30%">Kya kiya</th><th style="width:25%">Kya hona chahiye</th><th style="width:22%">Kya hua</th><th style="width:6%"></th></tr></thead><tbody>
 ${t.steps.map((s,i)=>`<tr><td>${i+1}</td><td>${esc(s.sec||'')}</td><td>${esc(s.do)}</td><td>${esc(s.expect)}</td><td>${esc(s.actual)}</td><td>${s.pass?'<span class="pill ok">Pass</span>':'<span class="pill bad">Fail</span>'}</td></tr>`).join('')}</tbody></table>
 <div class="figs tcg">${t.steps.filter(s=>s.shot).map(s=>fig('tc/'+s.shot,`${esc(s.sec)}: ${esc(s.do).slice(0,90)}`,'tc')).join('')}</div></section>`};

const html=`<!doctype html><html lang="hi"><head><meta charset="utf-8"><title>MK Plastics · App guide aur test report</title><style>${css}</style></head><body>
<section class="cover"><div>
 <div class="eyebrow">MK Plastics · Beads Bazaar · Bhiwandi</div>
 <h1 style="margin-top:10px">App guide aur<br>test report</h1>
 <p class="lead" style="font-size:12pt;margin-top:10px">Client review (23–24 Nov) ke badlav: har section ka step-by-step tareeka, 3 poore test case aur poore app ka review. Version <b>14.7</b> · 26 Nov 2026.</p>
 <div class="kpis"><div class="kpi"><b>7</b><span>section bane (1–7)</span></div><div class="kpi"><b>${passed}/${total}</b><span>test case steps pass</span></div><div class="kpi"><b>${REVIEW.checks}</b><span>review checks · ${REVIEW.issues} problem</span></div><div class="kpi"><b>${QS.length}</b><span>owner se sawaal baaki</span></div></div>
 <h3>Andar kya hai</h3>
 <ol class="toc"><li>Shuru kaise karein <span>login, shabd</span></li><li>Poora flow ek nazar mein</li>${SECTIONS.map(s=>`<li>Section ${s.no}: ${esc(s.title)} <span>${s.v}</span></li>`).join('')}<li>Test case 1–3 <span>${passed}/${total} pass</span></li><li>Review report <span>bugs, sujhaav</span></li><li>Owner se sawaal</li></ol>
</div><div class="band small">Owner: Mahebub bhai · Review: Zahid bhai · Consultant: Premchand · Prototype: browser mein chalta hai, data usi phone / computer mein rehta hai. Section 8 (contractor) abhi ruka: abhi koi contractor nahi.</div></section>

<section class="page"><h2>Shuru kaise karein</h2>
 <p class="lead">App browser mein khulta hai. Upar dark bar mein: Logout · Online / Offline · Hinglish / Hindi / English · Dark mode · <b>Zero reset</b> (saara data zero, masters bache rehte hain).</p>
 <table><thead><tr><th>Kaun</th><th>Mobile</th><th>PIN</th><th>Kya karta hai</th></tr></thead><tbody>
 <tr><td><b>Owner (Admin)</b></td><td>9800000001</td><td>1111</td><td>Sab: order, task, approval, karigar, dispatch, bill, setting</td></tr>
 <tr><td>Vinod · M1 Moulding</td><td>9800000020</td><td>3320</td><td>Moulding entry</td></tr>
 <tr><td>Pramod · M2 Moulding</td><td>9800000021</td><td>3321</td><td>Moulding entry</td></tr>
 <tr><td>Salman · P1 Pearl</td><td>9800000022</td><td>3322</td><td>Coating + packing entry (work date)</td></tr>
 <tr><td>P2 Operator · P2 Pearl</td><td>9800000024</td><td>3324</td><td>Coating + packing entry</td></tr>
 <tr><td>Hamidur · MZ1 Metalizing</td><td>9800000023</td><td>3323</td><td>Metalizing coating entry</td></tr></tbody></table>
 <h3>Shabd aur hisaab</h3>
 <table><thead><tr><th style="width:22%">Shabd</th><th>Matlab</th></tr></thead><tbody>
 <tr><td><b>Bunch</b></td><td>Hamara standard: <b>1 bunch = 1,200 moti</b> (Rate list → Pirai spec se badal sakte ho).</td></tr>
 <tr><td><b>Packet</b></td><td>Packing × 1,200 moti. 8mm: 4 bunch = 4,800 moti.</td></tr>
 <tr><td><b>Ladi · Guchha · Frame</b></td><td>Karigar ladi pirota hai; kai ladi = 1 guchha; 2 guchha = 1 frame. Moti / frame = guchha × ladi × moti / ladi (P2 register). 8mm Semi: 2 × 18 × 50 = 1,800.</td></tr>
 <tr><td><b>Exact frame / packet</b></td><td>Packet ka moti ÷ frame ka moti. 8mm: 4,800 ÷ 1,800 = 2.667.</td></tr>
 <tr><td><b>Allowance</b></td><td>Tooti ladi ke liye owner ka frame / packet (8mm = 2.8). Task target = packet × allowance.</td></tr>
 <tr><td><b>Dhaga g/kg</b></td><td>1 kg pirai (dhaage ke saath) mein kitne gram dhaga (P1 register). Dhaga = kul wazan × g/kg.</td></tr>
 <tr><td><b>Cut</b></td><td>Jo moti pir nahi saki (hole band) → waste, usi grade mein.</td></tr>
 <tr><td><b>Reject bunch</b></td><td>(Frames × moti/frame − packets × moti/packet) ÷ 1,200 → Waste "Coating reject".</td></tr>
 <tr><td><b>Work date</b></td><td>Kis din ka kaam: entry agle din hoti hai, isliye pehle se kal.</td></tr></tbody></table>
 <h3>Poora flow ek nazar mein</h3>
 <div class="flow"><b>Raw material (line)</b><i>→</i><b>Moulding task + entry</b><i>→</i><b>Approval</b><i>→</i><b>Karigar ko bhejo (spec)</b><i>→</i><b>Wapas lo (grade, dhaga, cut)</b><i>→</i><b>Coating mein bhejo</b></div>
 <div class="flow"><b>Order slip</b><i>→</i><b>Coating task (packet → frame)</b><i>→</i><b>Roz ki entry (work date)</b><i>→</i><b>Approval</b><i>→</i><b>Dispatch</b><i>→</i><b>Bill (abhi / baad mein)</b></div>
 <p class="small">Stock sirf owner ke approval par badalta hai. Bikri ka stock dispatch par ghatta hai, bill par nahi. Pearl ka maal Pearl mein, Metalizing ka Metalizing mein apne aap.</p>
</section>

${SECTIONS.map(sectionHTML).join('')}

${R.cases.map(tcHTML).join('')}

<section class="page"><h2>Review report</h2>
 <p class="lead">Kaise kiya: har screen aur har zaroori form, desktop aur phone (390 px), light aur dark, Hinglish / English / Hindi: kul <b>${REVIEW.checks} check</b>. Dekha: koi error, sideways scroll, form box se bahar, text box se bahar. Saath mein 8 test files (har section ke) aur upar ke 3 test case.</p>
 <div class="box"><b class="ok">Nateeja: ${REVIEW.issues} problem.</b> Saare test pass: smoke ke numbers 58 · 10.4 · bill ₹3,068 · ready stock 290 → 40.</div>
 <h3>Banate waqt mile aur theek kiye</h3>
 <table><thead><tr><th style="width:10%">Version</th><th>Kya galat tha</th><th style="width:34%">Ab</th></tr></thead><tbody>${FIXED.map(f=>`<tr><td>${f[0]}</td><td>${esc(f[1])}</td><td class="ok">${esc(f[2])}</td></tr>`).join('')}</tbody></table>
 <h3>Dhyan aur sujhaav (bug nahi)</h3>
 <table><thead><tr><th>Baat</th><th style="width:38%">Kya karein</th></tr></thead><tbody>${OBS.map(o=>`<tr><td>${esc(o[0])}</td><td>${esc(o[1])}</td></tr>`).join('')}</tbody></table>
 <h3>Ek badlav jo jaan-boojh kar kiya</h3>
 <p>Pehle har item ka 1 frame = 10 bunch maana tha. P2 register se 3MM Semi ka frame = 6,000 moti = <b>5 bunch</b>. Isliye test mein ready stock 580 → 330 ki jagah <b>290 → 40</b> (v14.5).</p>
</section>

<section class="page"><h2>Owner se sawaal</h2>
 <p class="lead">Jab tak jawab nahi aata, yeh sab app mein badalne layak (editable) rakhe hain, guess nahi kiya.</p>
 <table><thead><tr><th style="width:12%">#</th><th>Sawaal (Zahid bhai se)</th><th style="width:16%">Jawab</th></tr></thead><tbody>${QS.map(q=>`<tr><td><b>${q[0]}</b></td><td>${esc(q[1])}</td><td></td></tr>`).join('')}</tbody></table>
 <h3>Jo pehle hi bata diya (26 Nov)</h3>
 <ul><li>Pehle dispatch, phir bill; bill abhi ya baad mein (setting); sirf owner; invoice par dispatch ki tareekh.</li><li>Rate slip par bhi, bill par bhi. S.P. = Super, SS = Sujni, Semi F = Semi Flat.</li><li>Dhaga kul wazan par; g/kg hamesha register wala. Mahina 30 din. Mahebub bhai owner, Tausif karigar.</li><li>Coating reject regrind / phenk dete hain (waste). Abhi koi contractor nahi.</li></ul>
 <h3>Files</h3>
 <p class="small">Code: <code>js/10-v14 … 16-v14</code> · Release: <code>releases/v14.1 … v14.7</code> (har folder mein file, notes, owner test, screenshots) · Test: <code>npm test</code> · Review: <code>node tools/review.js</code> · Yeh PDF: <code>node tools/test-cases.js && node tools/guide.js</code>.</p>
</section>
</body></html>`;

(async()=>{const out=path.join(gd,'guide.html');fs.writeFileSync(out,html);
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const p=await (await b.newContext()).newPage();
 await p.goto('file://'+out);await p.waitForTimeout(500);
 const pdf=path.join(gd,'MK-Plastics-Guide-v14.7.pdf');
 await p.pdf({path:pdf,format:'A4',printBackground:true,displayHeaderFooter:true,margin:{top:'16mm',bottom:'18mm',left:'14mm',right:'14mm'},
  headerTemplate:'<div></div>',footerTemplate:'<div style="width:100%;font-size:7.5pt;color:#8A8796;padding:0 14mm;display:flex;justify-content:space-between;font-family:Inter,sans-serif"><span>MK Plastics · App guide aur test report · v14.7</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});
 await b.close();console.log('PDF',path.relative(root,pdf),(fs.statSync(pdf).size/1048576).toFixed(1)+' MB')})();
