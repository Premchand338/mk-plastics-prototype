// Section 2 test (karigar ko pirai ke liye bhejna · V4, V5, V6, P2).
// Usage: node tests/pirai.js [path-to-html]   (default: index.html)
// 8mm Semi (P2 row 13): 18 ladi = 1 guchha, 2 guchha = 1 frame (36 ladi), 50 moti / ladi → 1,800 moti / frame.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out=[];const fails=[];
 const ok=(tag,name,cond,got)=>{if(!cond)fails.push(`${tag}: ${name} (got ${JSON.stringify(got)})`)};
 for(const [w,tag] of [[1366,'desktop'],[390,'phone']]){
  const ctx=await b.newContext({viewport:{width:w,height:900}});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const c=async s=>{await p.click(s);await p.waitForTimeout(100)};
  const ov=()=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  const sheetOv=()=>p.evaluate(()=>{const s=document.querySelector('#modal-root .sheet');return !!s&&s.scrollWidth>s.clientWidth+1});

  // 2.1 master from P2 + 2.4 new items
  const m=await p.evaluate(()=>({n:S.pirai.length,un:S.pirai.filter(s=>s.unclear).map(s=>s.row),r13:(({ladi,gpf,mpl,it})=>({ladi,gpf,mpl,it}))(S.pirai.find(s=>s.row===13)),
    r5:S.pirai.find(s=>s.row===5).it,r6:S.pirai.find(s=>s.row===6).it,mpf1:mpf14(S.pirai.find(s=>s.row===1)),
    nw:S.rl.filter(r=>r.v143).map(r=>`${r.size} ${r.kind} ${r.s}`),rl:S.rl.length,mpb:mpb14()}));
  ok(tag,'2.1 31 P2 rows',m.n===31,m.n);ok(tag,'2.1 only row 24 (6 Munga) to confirm',m.un.join()==='24',m.un);
  ok(tag,'2.1 8 Semi = 18 × 2 × 50, linked to rate list 16',m.r13.ladi===18&&m.r13.gpf===2&&m.r13.mpl===50&&m.r13.it===16,m.r13);
  ok(tag,'2.1 repeated 4 Semi rows link to both variants',m.r5===6&&m.r6===7,[m.r5,m.r6]);ok(tag,'moti/frame 2½ S.P. = 6,000',m.mpf1===6000,m.mpf1);
  const names=await p.evaluate(()=>[rlName(rlItem(16)),rlName(rlItem(17))]);ok(tag,'8mm Semi variants not rounded (3.5B, 4.25B)',names.join()==='8MM Semi · 3.5B,8MM Semi · 4.25B',names);
  ok(tag,'2.4 B.H.L. + Semi Flat added, rate pending',m.nw.join()==='6MM B.H.L. 0,6MM Semi Flat 0'&&m.rl===37,m.nw);ok(tag,'2.3 1 bunch = 1,200 moti',m.mpb===1200,m.mpb);

  // 2.2 send 10 kg of 8MM Semi (SR) → spec on screen + challan
  await p.evaluate(()=>{S.user='admin';move('PLAIN:P','8MM|Round|Semi|SR','kg',50);move('PLAIN:P','20MM|Round|Semi|SR','kg',5);S.view='karigar';render();karSendModal()});await p.waitForTimeout(100);
  await p.selectOption('#kb','P~8MM|Round|Semi|SR');await p.fill('#kk','10');await p.waitForTimeout(80);
  const sendUI=await p.evaluate(()=>({spec:document.getElementById('kspc').value,card:document.getElementById('kspec').textContent}));
  const plain=await p.evaluate(()=>{const s=document.getElementById('kspc');return !(s.nextElementSibling&&s.nextElementSibling.classList.contains('tapbox'))});ok(tag,'spec stays a dropdown',plain,plain);
  ok(tag,'2.2 spec picked automatically',sendUI.spec==='pr13',sendUI.spec);
  ok(tag,'2.2 send screen shows 18 ladi · 2 guchha · 36 · 50 · 1,800',/18\s*ladi = 1 guchha/.test(sendUI.card)&&/36\s*ladi \/ frame/.test(sendUI.card)&&/1,800\s*moti \/ frame/.test(sendUI.card),sendUI.card.slice(0,160));
  ok(tag,'2.2 estimate: 10 kg × 3.5 bunch/kg × 1,200 ÷ 1,800 ≈ 23 frame',/23 frame/.test(sendUI.card),sendUI.card);
  const sOv=await sheetOv();ok(tag,'send form fits',!sOv,sOv);
  await c('form[data-f=karSend] button[type=submit]');
  const job=await p.evaluate(()=>{const j=S.jobs[S.jobs.length-1];return {spec:j.spec&&j.spec.id,mpf:j.spec&&j.spec.mpf,est:j.estFr,paper:(document.querySelector('#modal-root .paper')||{}).textContent||''}});
  ok(tag,'2.2 job keeps the spec',job.spec==='pr13'&&job.mpf===1800&&job.est===23,job);
  ok(tag,'2.2 challan shows how to thread',/Pirai kaise karni hai/.test(job.paper)&&/1,800/.test(job.paper)&&/Frame \/ guchha/.test(job.paper),job.paper.slice(0,200));
  const cOv=await sheetOv();ok(tag,'challan fits',!cOv,cOv);

  // 2.3 receive 20 frames + 3 loose guchha → (20×2+3)×18×50 = 38,700 moti → 32.25 → 32 bunch
  await p.evaluate(()=>{closeModal();karRecvModal(S.jobs[S.jobs.length-1].id)});await p.waitForTimeout(100);
  const rbHidden=await p.evaluate(()=>getComputedStyle(document.getElementById('rb').closest('.fld')).display==='none');ok(tag,'2.3 "Kitne bunch aaye" replaced',rbHidden,rbHidden);
  await p.fill('#rfr','20');await p.fill('#rgu','3');await p.fill('#rwt','9');await p.click('label:has(input[name=qgrade][value="1st"])');await p.selectOption('#rdt','1×2');await p.waitForTimeout(80);
  const rs=await p.evaluate(()=>({b:document.getElementById('rb').value,sum:document.getElementById('rsum').textContent}));
  ok(tag,'2.3 frames → moti → bunch',rs.b==='32'&&/38,700 moti/.test(rs.sum),rs);
  const rOv=await sheetOv();ok(tag,'receive form fits',!rOv,rOv);
  await c('form[data-f=karRecv] button[type=submit]');
  const rec=await p.evaluate(()=>{const j=S.jobs[S.jobs.length-1],r=j.receipts[0],l=S.thr[S.thr.length-1];return {fr:r.frames,gu:r.guchha,moti:r.moti,bunch:r.bunch,lot:[l.bunch,l.frames]}});
  ok(tag,'2.3 receipt + lot keep frames and bunches',rec.fr===20&&rec.gu===3&&rec.moti===38700&&rec.bunch===32&&rec.lot.join()==='32,20',rec);
  await p.evaluate(()=>{closeModal();S.view='karigar';render()});
  const kp=await p.evaluate(()=>document.querySelector('#app .tw table').textContent);ok(tag,'karigar page: Frame aaye 20 + 3 g',/Frame aaye/.test(kp)&&/20 \+ 3 g/.test(kp)&&/18×2×50/.test(kp),kp.slice(0,200));
  const kOv=await ov();ok(tag,'karigar page fits',!kOv,kOv);

  // bead with no spec (20MM Semi): warning + bunch typed directly
  await p.evaluate(()=>karSendModal());await p.waitForTimeout(80);await p.selectOption('#kb','P~20MM|Round|Semi|SR');await p.waitForTimeout(80);
  const nos=await p.evaluate(()=>({v:document.getElementById('kspc').value,t:document.getElementById('kspec').textContent}));ok(tag,'no spec → warning',nos.v===''&&/spec nahi mila/.test(nos.t),nos);
  await p.fill('#kk','2');await c('form[data-f=karSend] button[type=submit]');
  await p.evaluate(()=>{closeModal();karRecvModal(S.jobs[S.jobs.length-1].id)});await p.waitForTimeout(80);
  const rbVis=await p.evaluate(()=>!!document.getElementById('rb').offsetParent&&!document.getElementById('rfr'));ok(tag,'no spec → bunch field stays',rbVis,rbVis);

  // edit: owner confirms row 24 (6 Munga) = 060
  await p.evaluate(()=>{closeModal();S.view='products';render()});
  const sec=await p.evaluate(()=>[...document.querySelectorAll('#app section h3')].some(h=>/Pirai spec · 31/.test(h.textContent)));ok(tag,'rate list page has Pirai spec',sec,sec);
  const pOv=await ov();ok(tag,'rate list page fits',!pOv,pOv);
  await c('#app [data-a=piraiEdit14][data-id=pr24]');await p.fill('#psm','60');await p.uncheck('#modal-root [name=unclear]');await p.waitForTimeout(60);
  const eOv=await sheetOv();ok(tag,'spec edit fits',!eOv,eOv);
  await c('form[data-f=piraiEdit14] button[type=submit]');
  const r24=await p.evaluate(()=>{const s=S.pirai.find(x=>x.row===24);return {mpl:s.mpl,un:s.unclear,mpf:mpf14(s)}});ok(tag,'row 24 edited + confirmed',r24.mpl===60&&r24.un===''&&r24.mpf===2880,r24);
  // standard bunch is editable too
  await p.evaluate(()=>ACT.mpbEdit14());await p.waitForTimeout(60);await p.fill('#mpb','1000');await c('form[data-f=mpbEdit14] button[type=submit]');
  const mpb=await p.evaluate(()=>[mpb14(),fromFrames14(snap14(S.pirai.find(s=>s.row===13)),1,0).bunch]);ok(tag,'1 bunch = 1,000 → 1 frame = 2 bunch (rounded 1.8)',mpb[0]===1000&&mpb[1]===2,mpb);

  // Hindi render
  await p.evaluate(()=>{S.lang='hi';S.deva=true;S.view='karigar';render();karSendModal();closeModal();S.view='products';render();S.lang='hinglish';S.deva=false;render()});
  out.push({tag,job,rec,errors:errs});ok(tag,'no page errors',!errs.length,errs);await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1)}console.log('Section 2 pirai: all checks passed');process.exit(0)})();
