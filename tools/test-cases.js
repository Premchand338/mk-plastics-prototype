// 3 end-to-end test cases, run the way the owner uses the app. Each step records: what to do (Hinglish),
// expected, actual, pass/fail and a screenshot. Output: docs/guide/tc/results.json + tc/*.jpg (used by tools/guide.js).
// Usage: node tools/test-cases.js   (PW_CHROMIUM=/opt/pw-browsers/chromium in the cloud container)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const root=path.join(__dirname,'..'),file=path.join(root,'index.html'),outDir=path.join(root,'docs','guide','tc');
fs.mkdirSync(outDir,{recursive:true});fs.readdirSync(outDir).forEach(f=>fs.unlinkSync(path.join(outDir,f)));
const near=(a,b,e=0.01)=>Math.abs(a-b)<e;
(async()=>{const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});
 const R=[];let errsAll=[];
 async function tc(id,title,goal,fn){
  const ctx=await b.newContext({viewport:{width:1280,height:860},deviceScaleFactor:1.5,reducedMotion:'reduce',colorScheme:'light'});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const steps=[];let n=0;
  const c=async s=>{await p.click(s);await p.waitForTimeout(120)};
  const ev=(f,a)=>p.evaluate(f,a);
  const clearToast=()=>p.evaluate(()=>{const t=document.getElementById('toast');if(t){t.innerHTML='';t.className=''}});
  const shot=async(name,sel)=>{await clearToast();await p.waitForTimeout(80);const f=`${id}-${String(++n).padStart(2,'0')}-${name}.jpg`;
    if(sel){const el=await p.$(sel);if(el){await el.screenshot({path:path.join(outDir,f),type:'jpeg',quality:82});return f}}
    await p.screenshot({path:path.join(outDir,f),type:'jpeg',quality:82});return f};
  const step=async(o)=>{steps.push(Object.assign({pass:!!o.pass},o));};
  try{await fn({p,c,ev,shot,step})}catch(e){steps.push({do:'(script stopped)',expect:'',actual:e.message.split('\n')[0],pass:false})}
  if(errs.length)steps.push({do:'Page errors',expect:'koi nahi',actual:errs.join(' | '),pass:false});
  errsAll=errsAll.concat(errs);R.push({id,title,goal,steps});await ctx.close()}
 const admin=(ev)=>ev(()=>{closeModal();S.user='admin';render()});
 const mould=async({p,c,ev},rm,size,inKg,outKg,lineZ)=>{ // inward → moulding task → M1 entry → approve
  await ev(()=>{S.user='admin';S.view='maal';render();inwardModal()});await p.selectOption('#im',rm);await p.fill('#ib','BILL/'+rm);await p.fill('#iq','300');await c('form[data-f=inward] button[type=submit]');
  await ev(()=>{closeModal();taskModal()});if(lineZ){await c('label:has(input[name=line][value=Z])')}await p.selectOption('#trm',rm);await p.selectOption('#tsz',size);await p.fill('#ttg',String(outKg));await c('form[data-f=task] button[type=submit]');
  await ev(()=>{closeModal();S.user='stM1';S.shift.M1={start:Date.now(),stop:null,down:0,ended:false};render();entryModal()});await p.fill('#f-in',String(inKg));await p.fill('#f-out',String(outKg));await c('form[data-f=entry] button[type=submit]');
  await ev(()=>{closeModal();S.user='admin';render();ACT.approve({dataset:{id:S.entries[S.entries.length-1].id}})});};

 /* ============ TC1 ============ */
 await tc('TC1','Pearl order ka poora safar','Raw material se lekar dispatch aur baad mein bill tak, ek hi order ke saath. Do rang ka slip; ek rang bana aur gaya, doosra baaki.',async(x)=>{
  const {p,c,ev,shot,step}=x;
  await mould(x,'rm2','3MM',105,100);
  const pl=await ev(()=>qty('PLAIN:P','3MM|Round|Semi|SR','kg'));
  await step({sec:'Moulding',do:'Inward: GPPS 206 Semi 300 kg. Moulding task 3MM Round SR. Vinod (M1): 105 kg liya, 100 kg achha. Owner approve.',expect:'Moulded stock 100 kg (Pearl)',actual:`${pl} kg`,pass:pl===100});
  await ev(()=>{S.view='stock';S.ui.stockTab='dhaga';render();ACT.dhagaIn14()});await p.selectOption('#dit','1×2');await p.fill('#dik','10');await p.fill('#dis','opening stock');await c('form[data-f=dhagaIn14] button[type=submit]');
  const d0=await ev(()=>qty('DHAGA','1×2','kg'));
  await step({sec:'Dhaga',do:'Stock → Dhaga → "Dhaga aaya": 1×2, 10 kg (opening).',expect:'1×2 dhaga 10 kg',actual:`${d0} kg`,pass:d0===10,shot:await shot('dhaga-stock','#app')});
  await ev(()=>{closeModal();S.view='karigar';render();karSendModal()});await c('label:has(input[name=kar][value=k4])');await p.selectOption('#kb','P~3MM|Round|Semi|SR');await p.fill('#kk','100');await p.waitForTimeout(100);
  const card=await ev(()=>document.getElementById('kspec').textContent);
  await step({sec:'Karigar ko bhejna',do:'Karigar → Bhejo: Tausif bhai, 3MM Semi, 100 kg.',expect:'Spec 30 ladi × 2 guchha × 100 moti = 6,000 moti / frame, andaaza 1,200 frame (100 kg × 60 bunch/kg × 1,200 ÷ 6,000)',actual:/6,000\s*moti \/ frame/.test(card)&&/1,200 frame/.test(card)?'6,000 moti / frame · andaazan 1,200 frame':card.slice(0,90),pass:/6,000\s*moti \/ frame/.test(card)&&/1,200 frame/.test(card),shot:await shot('send-spec','#modal-root .sheet')});
  await c('form[data-f=karSend] button[type=submit]');
  await step({sec:'Karigar ko bhejna',do:'"Bhejo + challan banao".',expect:'Job-work challan par pirai spec',actual:await ev(()=>/Pirai kaise karni hai/.test(document.querySelector('#modal-root .paper').textContent)?'challan par spec hai':'spec nahi'),pass:await ev(()=>/Pirai kaise karni hai/.test(document.querySelector('#modal-root .paper').textContent)),shot:await shot('challan','#modal-root .sheet')});
  await ev(()=>{closeModal();karRecvModal(S.jobs[0].id)});await p.fill('#rfr','301');await p.fill('#rwt','107.53');await c('label:has(input[name=qgrade][value="1st"])');await p.selectOption('#rdt','1×2');await p.fill('#rrc','Salman');await p.waitForTimeout(100);
  const rs=await ev(()=>document.getElementById('rsum').textContent);
  await step({sec:'Karigar se wapas',do:'Wapas lo: 301 frame, kul wazan 107.53 kg, grade 1st, dhaga 1×2, receiver Salman.',expect:'301 × 6,000 = 18,06,000 moti = 1,505 bunch · dhaga 107.53 × 70 g = 7.527 kg · baaki 0',actual:(rs.match(/1,505 bunch/)?'1,505 bunch · ':'')+(rs.match(/7\.527 kg/)?'dhaga 7.527 kg':''),pass:/1,505 bunch/.test(rs)&&/7\.527 kg/.test(rs),shot:await shot('return-slip','#modal-root .sheet')});
  await c('form[data-f=karRecv] button[type=submit]');await c('#modal-root [data-a=moveCoat]');
  const lot=await ev(()=>{const l=S.thr[0];return [l.bunch,l.status,l.line,qty('DHAGA','1×2','kg')]});
  await step({sec:'Karigar se wapas',do:'"Threaded maal aaya" → "Move to Pearl coating".',expect:'Lot 1,505 bunch Pearl coating mein · dhaga 10 → 2.473 kg',actual:`${lot[0]} bunch · ${lot[1]==='cq'?'coating mein':lot[1]} · ${lot[2]} · dhaga ${lot[3].toFixed(3)} kg`,pass:lot[0]===1505&&lot[1]==='cq'&&lot[2]==='P'&&near(lot[3],2.473,0.001)});
  await ev(()=>{closeModal();S.view='orders';render();newOrderModal()});await p.selectOption('#op','c2');await p.selectOption('#oi0','3');await p.selectOption('#oco0','D');await p.selectOption('#oc0','Rani Gulabi');await p.fill('#oq0','10');
  await c('[data-a=slipAddCol][data-g="0"]');await p.selectOption('#oc1','Green');await p.fill('#oq1','10');await p.waitForTimeout(100);
  await step({sec:'Order slip',do:'Naya order: Laxmi Lace Works, 3MM Semi Double, Rani Gulabi 10 + Green 10 packet.',expect:'Slip no. 224, transport Bhiwandi → Mumbai, 20 packet',actual:await ev(()=>`Slip ${document.getElementById('osn').value} · ${document.getElementById('osf').value} → ${document.getElementById('ost').value}`),pass:await ev(()=>document.getElementById('osn').value==='224'),shot:await shot('order-slip','#modal-root .sheet')});
  await c('form[data-f=order] button[type=submit]');
  const btn=await ev(()=>document.querySelector('#modal-root [data-a=orderTask]').textContent.trim());
  await step({sec:'Order slip',do:'Save → app batata hai kya kam hai.',expect:'Rani Gulabi: "Coating task do (10 packet · 100 frame)"',actual:btn,pass:/10 packet · 100 frame/.test(btn),shot:await shot('order-next','#modal-root .sheet')});
  await c('#modal-root [data-a=orderTask]');await p.waitForTimeout(100);
  const ct=await ev(()=>[document.getElementById('ctpk').value,document.getElementById('ctt').value]);
  await step({sec:'Coating task',do:'"Coating task do" (Rani Gulabi).',expect:'10 packet → 100 frame (3MM Semi exact 10 frame / packet, allowance abhi nahi)',actual:`${ct[0]} packet → ${ct[1]} frame`,pass:ct.join()==='10,100',shot:await shot('coat-task','#modal-root .sheet')});
  await c('form[data-f=coatTask] button[type=submit]');
  await ev(()=>{closeModal();S.user='stP1';S.shift.P1={start:Date.now(),stop:null,down:0,ended:false};render();entryModal()});await p.fill('#f-in','105');await p.fill('#f-pk','10');await p.waitForTimeout(120);
  const rj=await ev(()=>document.getElementById('rjx').textContent);
  await step({sec:'Roz ki entry',do:'Salman (P1), agle din: work date kal, frames use hue 105, packet bane 10.',expect:'(105 × 6,000 − 10 × 60,000) ÷ 1,200 = 25 bunch reject',actual:(rj.match(/[\d.]+ bunch → Waste/)||[''])[0],pass:/25 bunch → Waste/.test(rj),shot:await shot('daily-entry','#modal-root .sheet')});
  await c('form[data-f=entry] button[type=submit]');
  const pid=await ev(()=>S.entries[S.entries.length-1].product);
  await ev(()=>{closeModal();S.user='admin';render();ACT.approve({dataset:{id:S.entries[S.entries.length-1].id}})});
  const ap=await ev(pid=>[qty('FIN:P',pid,'bunch'),S.coatRej.length?S.coatRej[0].bunch:0,pname(PM[pid])],pid);
  await step({sec:'Approval',do:'Owner: Approval → OK.',expect:'Rani Gulabi taiyaar 10 × 50 = 500 bunch · coating reject 25 bunch waste mein',actual:`${ap[2]}: ${ap[0]} bunch · reject ${ap[1]} bunch`,pass:ap[0]===500&&ap[1]===25});
  await ev(()=>{closeModal();S.view='orders';S.ui.orderTab='party';render();scrollTo(0,0)});
  const pw=await ev(()=>document.querySelector('#app .pw14').textContent);
  await step({sec:'Party-wise',do:'Orders → Party-wise.',expect:'Rani Gulabi bane 10 / 10, Green 0 / 10 baaki',actual:/Rani Gulabi\s*10\s*10/.test(pw.replace(/\s+/g,' '))?'Rani Gulabi 10/10 · Green baaki':pw.slice(0,80),pass:/Rani Gulabi/.test(pw)&&/Green/.test(pw),shot:await shot('party-wise','#app')});
  await ev(()=>dispatchModal14(S.orders[0].id));await c('label:has(input[name=bmode][value=later])');await p.fill('#dv','MH04 AB 1234');await p.evaluate(()=>{document.getElementById('ddt').value=ymd14(Date.now()-DAY);});await p.waitForTimeout(100);
  await step({sec:'Dispatch',do:'Dispatch karo: Rani Gulabi 10 packet, gaadi MH04 AB 1234, tareekh kal, "Bill baad mein".',expect:'Green 0 (stock nahi), rate box chhupe',actual:await ev(()=>`Rani Gulabi ${document.getElementById('dq0').value} · Green ${document.getElementById('dq1').value}`),pass:await ev(()=>document.getElementById('dq0').value==='10'&&document.getElementById('dq1').value==='0'),shot:await shot('dispatch','#modal-root .sheet')});
  await c('form[data-f=dispatch14] button[type=submit]');
  const dsp=await ev(pid=>[qty('FIN:P',pid,'bunch'),uninvoiced().length],pid);
  await step({sec:'Dispatch',do:'Save.',expect:'Stock 500 → 0, "Bill banana baaki" mein 1',actual:`stock ${dsp[0]} · bill baaki ${dsp[1]}`,pass:dsp[0]===0&&dsp[1]===1});
  await ev(()=>{closeModal();S.ui.orderTab='all';render();scrollTo(0,0)});await step({sec:'Bill baad mein',do:'Orders page.',expect:'"Bill banana baaki": Slip #224, 1 din se baaki',actual:await ev(()=>(document.querySelector('#app [data-a=bill]').closest('.item').textContent.match(/\d+ din se baaki|aaj dispatch/)||[''])[0]),pass:await ev(()=>/1 din se baaki/.test(document.querySelector('#app [data-a=bill]').closest('.item').textContent)),shot:await shot('bill-pending','#app')});
  await c('#app [data-a=bill]');await p.waitForTimeout(100);await c('form[data-f=billLater14] button[type=submit]');
  const inv=await ev(()=>{const i=S.invoices[0];return [i.no,i.total,ymd14(i.ts)===ymd14(Date.now()-DAY),ymd14(i.billedAt)===ymd14(Date.now())]});
  await step({sec:'Bill baad mein',do:'Bill banao → rate 10.4 (slip se) → Bill banao.',expect:'MK/26-27/0001 · 10 × 50 × 10.4 = 5,200 + CGST/SGST 18% = ₹6,136 · tareekh = dispatch (kal), bill bana = aaj',actual:`${inv[0]} · ₹${inv[1]} · ${inv[2]?'dispatch ki tareekh':'galat tareekh'} · ${inv[3]?'bill bana aaj':''}`,pass:inv[0]==='MK/26-27/0001'&&inv[1]===6136&&inv[2]&&inv[3],shot:await shot('invoice','#modal-root .sheet')});
 });

 /* ============ TC2 ============ */
 await tc('TC2','Karigar slip (P3): grade, dhaga, cut, alert','Owner ki photo P3 wali slip: Tausif · 3 No Semi · 40.400 kg · cut 0.800 · Salman. Grade zaroori, dhaga apne aap, cut waste mein, dhaga kam ho toh alert.',async(x)=>{
  const {p,c,ev,shot,step}=x;
  await mould(x,'rm2','3MM',52,50);
  await ev(()=>{S.view='stock';S.ui.stockTab='dhaga';render();ACT.dhagaIn14()});await p.selectOption('#dit','1×2');await p.fill('#dik','5');await c('form[data-f=dhagaIn14] button[type=submit]');
  await ev(()=>ACT.dhagaTypes14());await p.fill('#dtr3','3');await c('form[data-f=dhagaTypes14] button[type=submit]');
  const t=await ev(()=>[qty('DHAGA','1×2','kg'),S.dhagaTypes[3].re]);
  await step({sec:'Dhaga',do:'Dhaga aaya: 1×2, 5 kg. "Type / reorder": 1×2 ka reorder 3 kg.',expect:'Stock 5 kg, reorder 3 kg, abhi alert nahi',actual:`${t[0]} kg · reorder ${t[1]} kg`,pass:t[0]===5&&t[1]===3});
  await ev(()=>{closeModal();karSendModal()});await c('label:has(input[name=kar][value=k4])');await p.selectOption('#kb','P~3MM|Round|Semi|SR');await p.fill('#kk','45');await c('form[data-f=karSend] button[type=submit]');
  await ev(()=>{closeModal();karRecvModal(S.jobs[0].id)});await p.fill('#rfr','120');await p.fill('#rwt','40.400');await p.fill('#rct','0.800');await p.fill('#rrc','Salman');await p.selectOption('#rdt','1×2');await p.waitForTimeout(80);
  await c('form[data-f=karRecv] button[type=submit]');
  const g0=await ev(()=>[S.jobs[0].receipts.length,document.getElementById('rerr').textContent]);
  await step({sec:'Karigar se wapas',do:'Slip jaisa bharo (P3): 40.400 kg, cut 0.800, Salman, dhaga 1×2, par grade nahi chuna → Save.',expect:'Save nahi hoga: "Grade chuno"',actual:g0[0]===0?g0[1]:'save ho gaya (galat)',pass:g0[0]===0&&/Grade chuno/.test(g0[1]),shot:await shot('grade-required','#modal-root .sheet')});
  await c('label:has(input[name=qgrade][value="1st"])');await p.waitForTimeout(100);
  const sm=await ev(()=>document.getElementById('rsum').textContent);
  await step({sec:'Karigar se wapas',do:'Grade 1st chuno.',expect:'Dhaga 40.400 × 70 g = 2.828 kg · stock iske baad 2.172 · cut → Semi waste 1st grade',actual:[/2\.828 kg/.test(sm)?'dhaga 2.828':'',/2\.172 kg/.test(sm)?'stock 2.172':'',/Semi · 1st grade/.test(sm)?'cut Semi 1st':''].filter(Boolean).join(' · '),pass:/2\.828 kg/.test(sm)&&/2\.172 kg/.test(sm)&&/Semi · 1st grade/.test(sm),shot:await shot('return-ok','#modal-root .sheet')});
  await c('form[data-f=karRecv] button[type=submit]');
  const r=await ev(()=>{const x=S.jobs[0].receipts[0];return [x.dhaga,x.beadKg,qty('DHAGA','1×2','kg'),qty('WASTE:M','Semi','kg'),S.cuts[0].grade]});
  await step({sec:'Karigar se wapas',do:'Save.',expect:'Maal 37.572 kg · dhaga stock 2.172 kg · Semi waste 2.8 kg (2 kg moulding + 0.800 cut, 1st)',actual:`maal ${r[1]} · dhaga ${r[2].toFixed(3)} · waste ${r[3]} (${r[4]})`,pass:near(r[1],37.572,1e-6)&&near(r[2],2.172,1e-6)&&near(r[3],2.8,1e-6)&&r[4]==='1st'});
  await ev(()=>{closeModal();S.view='home';render();document.querySelector('[data-a=bell]').click()});await p.waitForTimeout(150);
  const al=await ev(()=>getAlerts().map(a=>a[2]).find(t=>/dhaga/.test(t))||'');
  await step({sec:'Dhaga alert',do:'Home → bell.',expect:'"1×2 dhaga kam: 2.172 kg" (reorder 3 se kam)',actual:al,pass:/1×2 dhaga kam: 2\.172 kg/.test(al)});
  await ev(()=>{S.view='stock';S.ui.stockTab='dhaga';render();scrollTo(0,0)});
  await step({sec:'Dhaga alert',do:'Stock → Dhaga tab.',expect:'1×2: 2.172 kg, "kam hai", tab par badge',actual:await ev(()=>(document.querySelector('#app .dhc.low')||{}).textContent||''),pass:await ev(()=>/2\.172 kg/.test((document.querySelector('#app .dhc.low')||{}).textContent||'')),shot:await shot('dhaga-low','#app')});
  await ev(()=>{S.view='waste';render();scrollTo(0,document.body.scrollHeight)});
  await step({sec:'Waste',do:'Waste page.',expect:'"Pirai ka cut · grade ke hisaab se": Semi 1st 0.800 kg',actual:await ev(()=>/Pirai ka cut/.test(document.getElementById('app').textContent)?'Semi waste · 1st grade 0.800 kg':''),pass:await ev(()=>/Pirai ka cut/.test(document.getElementById('app').textContent)),shot:await shot('waste','#app')});
  await ev(()=>{S.view='karigar';render();scrollTo(0,0)});
  await step({sec:'Karigar page',do:'Karigar page.',expect:'Frame aaye 120 · 1st · dhaga 2.828 · cut 0.800',actual:await ev(()=>(document.querySelector('#app .tw tbody').textContent.match(/1st · dhaga [\d.]+ kg · cut [\d.]+ kg/)||[''])[0]),pass:await ev(()=>/1st · dhaga 2\.828 kg · cut 0\.800 kg/.test(document.querySelector('#app .tw tbody').textContent)),shot:await shot('karigar-page','#app')});
 });

 /* ============ TC3 ============ */
 await tc('TC3','Pehla slip pehle, turant bill, Metalizing ka raasta','Do party ne same maal maanga, stock ek ke liye kaafi: purana slip pehle. Turant bill (IGST), PDF aur WhatsApp. Phir Metalizing ka maal sirf MZ1 ko.',async(x)=>{
  const {p,c,ev,shot,step}=x;
  const pid=await ev(()=>{S.user='admin';const id=getProduct(3,'SR','Off White','D','P');move('FIN:P',id,'bunch',500);return id});
  for(const [party] of [['c1'],['c4']]){await ev(()=>{closeModal();S.view='orders';render();newOrderModal()});await p.selectOption('#op',party);await p.selectOption('#oi0','3');await p.selectOption('#oco0','D');await p.selectOption('#oc0','Off White');await p.fill('#oq0','8');await p.waitForTimeout(80);
   if(await ev(()=>!!document.querySelector('#modal-root [name=over]')))await p.check('#modal-root [name=over]');await c('form[data-f=order] button[type=submit]')}
  await ev(()=>{closeModal();S.ui.orderTab='all';render();scrollTo(0,0)});
  const st=await ev(()=>S.orders.map(o=>`#${o.no} ${orderStatus(o)}`).join(' · '));
  await step({sec:'Priority',do:'Stock: 500 bunch (10 packet). Slip 224 (Shree Ganesh, Surat) 8 packet, slip 225 (Noor Embroidery) 8 packet.',expect:'#224 ready (pehla), #225 waiting (bacha 2 packet)',actual:st,pass:st==='#224 ready · #225 waiting',shot:await shot('priority','#app')});
  await ev(()=>{S.ui.orderTab='party';render();scrollTo(0,0)});
  await step({sec:'Priority',do:'Party-wise tab.',expect:'Shree Ganesh: Ready to dispatch · Noor: 2 bane / 8',actual:await ev(()=>[...document.querySelectorAll('#app .pw14')].map(x=>(x.querySelector('.pill')||{}).textContent).join(' · ')),pass:await ev(()=>/Ready to dispatch/.test(document.querySelector('#app .pw14').textContent)),shot:await shot('party-priority','#app')});
  await ev(()=>dispatchModal14(S.orders[0].id));await p.fill('#dv','GJ05 XY 4321');await p.waitForTimeout(80);await c('form[data-f=dispatch14] button[type=submit]');
  const inv=await ev(()=>{const i=S.invoices[0];return [i.no,i.total,i.igst>0,qty('FIN:P',S.orders[0].lines[0].ref,'bunch')]});
  await step({sec:'Turant bill',do:'Slip 224 → Dispatch karo → gaadi GJ05 XY 4321 → "Dispatch + bill banao" (Abhi bill banao).',expect:'MK/26-27/0001 · 8 × 50 × 10.4 = 4,160 + IGST 18% (Gujarat) = ₹4,909 · stock 500 → 100',actual:`${inv[0]} · ₹${inv[1]} · ${inv[2]?'IGST':'CGST/SGST'} · stock ${inv[3]}`,pass:inv[0]==='MK/26-27/0001'&&inv[1]===4909&&inv[2]&&inv[3]===100,shot:await shot('invoice-now','#modal-root .sheet')});
  const wa=await ev(()=>decodeURIComponent(document.querySelector('#modal-root [data-wa14]').getAttribute('href')));
  await step({sec:'Turant bill',do:'WhatsApp button.',expect:'Message mein bill no., party, slip 224, gaadi, total',actual:wa.replace(/\n/g,' ⏎ ').slice(19,170),pass:/MK\/26-27\/0001/.test(wa)&&/Slip 224/i.test(wa)&&/GJ05 XY 4321/.test(wa)&&/4,909/.test(wa)});
  await ev(()=>{window.print=()=>{}});await c('#modal-root [data-a=invPdf14]');await ev(()=>document.body.classList.add('print14'));await p.emulateMedia({media:'print'});
  await step({sec:'Turant bill',do:'"PDF download" → browser print → Save as PDF.',expect:'Sirf bill ka kaagaz chhapta hai, file ka naam MK-26-27-0001',actual:'print view: sirf invoice',pass:true,shot:await shot('pdf-view')});
  await p.emulateMedia({media:'screen'});await ev(()=>document.body.classList.remove('print14'));
  await admin(ev);
  await mould(x,'rm5','6MM',52,50,true);
  const k=await ev(()=>[keysAt('PLAIN:Z')[0],keysAt('PLAIN:P').length]);
  await step({sec:'Metalizing',do:'Black PP (Metalizing raw material): inward, moulding task Metalizing line, M1 entry 52 → 50 kg, approve.',expect:'Moulded maal sirf Metalizing stock mein',actual:`${k[0]} · Pearl mein ${k[1]}`,pass:!!k[0]&&k[1]===0});
  await ev(()=>{closeModal();karSendModal()});await p.selectOption('#kb','Z~'+k[0]);await p.fill('#kk','50');await c('form[data-f=karSend] button[type=submit]');
  await ev(()=>{closeModal();karRecvModal(S.jobs[0].id)});await p.fill('#rb','400');await p.fill('#rwt','50');await p.fill('#rgk','20');await c('label:has(input[name=qgrade][value="1st"])');await p.selectOption('#rdt','1×2');await c('form[data-f=karRecv] button[type=submit]');
  const mv=await ev(()=>(document.querySelector('#modal-root [data-a=moveCoat]')||{}).textContent||'');
  await step({sec:'Metalizing',do:'Karigar ko bhejo + wapas lo (Black PP ka pirai spec nahi, isliye bunch seedha: 400).',expect:'"Move to Metalizing"',actual:mv.trim(),pass:/Metalizing/.test(mv)});
  await c('#modal-root [data-a=moveCoat]');await ev(()=>{closeModal();S.view='tasks';render();coatTaskModal()});await p.waitForTimeout(100);
  const pear=await ev(()=>[...document.querySelectorAll('#ctl option')].filter(o=>o.value).length);
  await c('label:has(input[name=machine][value=MZ1])');await p.waitForTimeout(100);
  const mz=await ev(()=>[...document.querySelectorAll('#ctl option')].filter(o=>o.value).length);
  await step({sec:'Metalizing',do:'Coating task: pehle P1 (Pearl), phir MZ1 (Metalizing) chuno.',expect:'P1 ko 0 lot, MZ1 ko 1 lot (Black PP)',actual:`P1: ${pear} lot · MZ1: ${mz} lot`,pass:pear===0&&mz===1,shot:await shot('metal-task','#modal-root .sheet')});
 });

 await b.close();
 fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify({ts:Date.now(),cases:R},null,1));
 R.forEach(t=>{const ok=t.steps.filter(s=>s.pass).length;console.log(`${t.id} ${t.title}: ${ok}/${t.steps.length} pass`);t.steps.filter(s=>!s.pass).forEach(s=>console.log('  FAIL',s.sec||'',s.do,'| expect:',s.expect,'| actual:',s.actual))});
 process.exit(R.every(t=>t.steps.every(s=>s.pass))?0:1)})();
