// Sections 3 + 4 test (karigar return slip + dhaga stock · V2, V3, V6, V7, P1, P3, Q7, Q8).
// Usage: node tests/karigar-return.js [path-to-html]   (default: index.html)
// Replays slip P3: Tausif · 3 No Semi · 40.400 kg with dhaga · cut 0.800 · receiver Salman.
// Dhaga (P1: 3 Semi 70 g/kg, on the total weight, Q8) = 40.400 × 70 g = 2.828 kg → maal 37.572 kg.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out=[];const fails=[];
 const ok=(tag,name,cond,got)=>{if(!cond)fails.push(`${tag}: ${name} (got ${JSON.stringify(got)})`)};
 const near=(a,b2)=>Math.abs(a-b2)<1e-6;
 for(const [w,tag] of [[1366,'desktop'],[390,'phone']]){
  const ctx=await b.newContext({viewport:{width:w,height:900}});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const c=async s=>{await p.click(s);await p.waitForTimeout(100)};
  const ov=()=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  const sheetOv=()=>p.evaluate(()=>{const s=document.querySelector('#modal-root .sheet');return !!s&&s.scrollWidth>s.clientWidth+1});

  // 3.3 + 4.1 masters
  const m=await p.evaluate(()=>({n:S.dhaga.length,un:S.dhaga.filter(d=>d.unclear).map(d=>d.row),r3:[S.dhaga[2].gpk,S.dhaga[2].it],r7:[S.dhaga[6].gpk,S.dhaga[6].it],
    types:S.dhagaTypes.map(t=>t.n).join(),tausif:!!KM.k4}));
  ok(tag,'3.3 34 P1 rows',m.n===34,m.n);ok(tag,'3.3 unclear rows 3, 7, 13, 33 (Q3)',m.un.join()==='3,7,13,33',m.un);
  ok(tag,'3.3 3 Semi 070 → 60B, 080 → 56B',m.r3.join()==='70,3'&&m.r7.join()==='80,4',[m.r3,m.r7]);
  ok(tag,'4.1 dhaga types',m.types==='1×3,2×2,3×3,1×2',m.types);ok(tag,'Tausif in karigar list (Q7)',m.tausif,m.tausif);

  // opening dhaga: 10 kg of 1×2
  await p.evaluate(()=>{S.user='admin';S.view='stock';S.ui.stockTab='dhaga';render();ACT.dhagaIn14()});await p.waitForTimeout(80);
  await p.selectOption('#dit','1×2');await p.fill('#dik','10');await p.fill('#dis','opening');await c('form[data-f=dhagaIn14] button[type=submit]');
  const d0=await p.evaluate(()=>qty('DHAGA','1×2','kg'));ok(tag,'4.1 dhaga inward',near(d0,10),d0);
  const sOv=await ov();ok(tag,'dhaga stock page fits',!sOv,sOv);
  const tabTxt=await p.evaluate(()=>document.querySelector('#app .dhg').textContent);ok(tag,'dhaga page lists 1×2 10 kg',/1×2\s*10\.000 kg/.test(tabTxt),tabTxt.slice(0,80));

  // send 45 kg of 3MM Semi to Tausif, then the P3 return
  await p.evaluate(()=>{move('PLAIN:P','3MM|Round|Semi|SR','kg',45);S.view='karigar';render();karSendModal()});await p.waitForTimeout(80);
  await p.click('label:has(input[name=kar][value=k4])');await p.selectOption('#kb','P~3MM|Round|Semi|SR');await p.fill('#kk','45');await c('form[data-f=karSend] button[type=submit]');
  await p.evaluate(()=>{closeModal();karRecvModal(S.jobs[0].id)});await p.waitForTimeout(100);
  const f0=await p.evaluate(()=>({top:document.querySelector('#modal-root .slip3').textContent,gpk:document.getElementById('rgk').value,dt:document.getElementById('rdt').value,rd:document.getElementById('rdd').value,rc:document.getElementById('rrc').value}));
  ok(tag,'3.1 slip header: karigar + item',/Tausif bhai/.test(f0.top)&&/3MM Round/.test(f0.top),f0.top);ok(tag,'3.3 g/kg from P1 = 70',f0.gpk==='70',f0.gpk);
  ok(tag,'4.2 dhaga type not guessed',f0.dt==='',f0.dt);ok(tag,'3.1 date + receiver defaults',!!f0.rd&&!!f0.rc,f0);
  await p.fill('#rfr','120');await p.fill('#rwt','40.400');await p.fill('#rct','0.800');await p.fill('#rrc','Salman');
  const yest=await p.evaluate(()=>ymd14(Date.now()-DAY));await p.fill('#rdd',yest);await p.waitForTimeout(80);
  const fOv=await sheetOv();ok(tag,'return form fits',!fOv,fOv);
  // 3.2 no grade → no save
  await c('form[data-f=karRecv] button[type=submit]');
  const g0=await p.evaluate(()=>({n:S.jobs[0].receipts.length,e:document.getElementById('rerr').textContent}));ok(tag,'3.2 grade required',g0.n===0&&/Grade chuno/.test(g0.e),g0);
  await p.click('label:has(input[name=qgrade][value="1st"])');await p.waitForTimeout(60);
  await c('form[data-f=karRecv] button[type=submit]');
  const g1=await p.evaluate(()=>({n:S.jobs[0].receipts.length,e:document.getElementById('rerr').textContent}));ok(tag,'4.2 dhaga type required',g1.n===0&&/Dhaga type/.test(g1.e),g1);
  await p.selectOption('#rdt','1×2');await p.waitForTimeout(80);
  const sm=await p.evaluate(()=>document.getElementById('rsum').textContent);
  ok(tag,'3.4 summary: dhaga 2.828, stock after 7.172, cut → Semi · 1st',/2\.828 kg/.test(sm)&&/7\.172 kg/.test(sm)&&/Cut → waste \(Semi · 1st grade\)/.test(sm),sm);
  await c('form[data-f=karRecv] button[type=submit]');
  const r=await p.evaluate(()=>{const j=S.jobs[0],x=j.receipts[0];return {dh:x.dhaga,bead:x.beadKg,g:x.qgrade,rc:x.recv,cut:x.cut,day:ymd14(x.ts),bunch:x.bunch,
    stock:qty('DHAGA','1×2','kg'),waste:qty('WASTE:M','Semi','kg'),cuts:S.cuts.map(c=>c.grade+' '+c.kg).join(),type:S.dhaga[2].type,bal:rawBal(j).bal,lot:S.thr[S.thr.length-1].qgrade}});
  ok(tag,'3.4 dhaga = 40.400 × 70 g = 2.828 kg, maal 37.572',near(r.dh,2.828)&&near(r.bead,37.572),r);
  ok(tag,'3.1 grade, receiver, cut, date saved',r.g==='1st'&&r.rc==='Salman'&&near(r.cut,0.8)&&r.day===yest,r);
  ok(tag,'3.5 / 4.3 dhaga stock 10 → 7.172',near(r.stock,7.172),r.stock);ok(tag,'3.5 threaded lot: 120 frame = 600 bunch, 1st grade',r.bunch===600&&r.lot==='1st',[r.bunch,r.lot]);
  ok(tag,'3.6 cut → Semi waste, 1st grade',near(r.waste,0.8)&&r.cuts==='1st 0.8',[r.waste,r.cuts]);
  ok(tag,'4.2 dhaga type remembered for 3 Semi',r.type==='1×2',r.type);ok(tag,'balance 45 − 37.572 − 0.8 ≈ 6.6',Math.abs(r.bal-6.6)<0.06,r.bal);

  // second return: type pre-selected now
  await p.evaluate(()=>{closeModal();karRecvModal(S.jobs[0].id)});await p.waitForTimeout(80);
  const pre=await p.evaluate(()=>document.getElementById('rdt').value);ok(tag,'4.2 type pre-selected next time',pre==='1×2',pre);
  // pages
  await p.evaluate(()=>{closeModal();S.view='karigar';render()});const kp=await p.evaluate(()=>document.querySelector('#app .tw').textContent);
  ok(tag,'karigar page: grade + dhaga + cut',/1st · dhaga 2\.828 kg · cut 0\.800 kg/.test(kp),kp.slice(0,200));const kOv=await ov();ok(tag,'karigar page fits',!kOv,kOv);
  await p.evaluate(()=>{S.view='waste';render()});const wp=await p.evaluate(()=>document.getElementById('app').textContent);
  ok(tag,'3.6 waste page: cut by grade',/Pirai ka cut/.test(wp)&&/0\.800 kg/.test(wp),'');const wOv=await ov();ok(tag,'waste page fits',!wOv,wOv);
  const quiet=await p.evaluate(()=>!getAlerts().some(a=>/dhaga/.test(a[2])));ok(tag,'4.3 no alert for unused types at 0 (reorder 0)',quiet,quiet);
  // 4.3 alerts: reorder 8 kg → low; then use more than stock → negative
  await p.evaluate(()=>{S.dhagaTypes.find(t=>t.n==='1×2').re=8});
  const low=await p.evaluate(()=>getAlerts().some(a=>/1×2 dhaga kam/.test(a[2])));ok(tag,'4.3 low dhaga alert',low,low);
  await p.evaluate(()=>{ACT.dhagaCount14()});await p.waitForTimeout(60);await p.selectOption('#dct','1×2');await p.fill('#dck','0');await c('form[data-f=dhagaCount14] button[type=submit]');
  await p.evaluate(()=>{dhagaMove14('1×2',-1,'pirai','test')});
  const neg=await p.evaluate(()=>getAlerts().find(a=>/1×2 dhaga stock minus/.test(a[2])));ok(tag,'4.3 negative dhaga alert (red)',neg&&neg[0]==='bad',neg);
  // rate list page: dhaga master + edit (owner confirms 6 Semi = 020)
  await p.evaluate(()=>{S.view='products';render()});
  const rp=await p.evaluate(()=>[...document.querySelectorAll('#app section h3')].map(h=>h.textContent).join('|'));ok(tag,'3.3 dhaga master after pirai spec',/Pirai spec · 31\|Dhaga \(gram \/ kg\) · 34/.test(rp),rp);
  const pOv=await ov();ok(tag,'rate list page fits',!pOv,pOv);
  await c('#app [data-a=dhagaEdit14][data-id=dh13]');await p.fill('#dg','20');await p.uncheck('#modal-root [name=unclear]');await c('form[data-f=dhagaEdit14] button[type=submit]');
  const e13=await p.evaluate(()=>({g:S.dhaga[12].gpk,u:S.dhaga[12].unclear}));ok(tag,'Q3a confirmed: 6 Semi = 20 g',e13.g===20&&e13.u==='',e13);
  // types: rename keeps stock
  await p.evaluate(()=>{dhagaMove14('2×2',5,'in');ACT.dhagaTypes14()});await p.waitForTimeout(60);await p.fill('#dtn1','2×2 moti');await c('form[data-f=dhagaTypes14] button[type=submit]');
  const rn=await p.evaluate(()=>[qty('DHAGA','2×2 moti','kg'),qty('DHAGA','2×2','kg')]);ok(tag,'type rename carries stock',near(rn[0],5)&&near(rn[1],0),rn);
  // Hindi
  await p.evaluate(()=>{S.lang='hi';S.deva=true;S.view='stock';S.ui.stockTab='dhaga';render();karRecvModal(S.jobs[0].id);closeModal();S.view='products';render();S.lang='hinglish';S.deva=false;render()});
  out.push({tag,r,errors:errs});ok(tag,'no page errors',!errs.length,errs);await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1)}console.log('Sections 3 + 4 karigar return + dhaga: all checks passed');process.exit(0)})();
