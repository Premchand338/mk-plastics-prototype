// Section 7 test (daily coating + packing entry · V10, V11).
// Usage: node tests/daily-entry.js [path-to-html]   (default: index.html)
// 3MM Semi: 1 frame = 6,000 moti (P2), 1 packet = 50 bunch = 60,000 moti.
// 60 frames used + 5 packets → (3,60,000 − 3,00,000) ÷ 1,200 = 50 bunch rejected.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out=[];const fails=[];
 const ok=(tag,name,cond,got)=>{if(!cond)fails.push(`${tag}: ${name} (got ${JSON.stringify(got)})`)};
 const near=(a,b2,e=1e-6)=>Math.abs(a-b2)<e;
 for(const [w,tag] of [[1366,'desktop'],[390,'phone']]){
  const ctx=await b.newContext({viewport:{width:w,height:900}});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const c=async s=>{await p.click(s);await p.waitForTimeout(100)};
  const ov=()=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  const sheetOv=()=>p.evaluate(()=>{const s=document.querySelector('#modal-root .sheet');return !!s&&s.scrollWidth>s.clientWidth+1});

  // setup: 2,000 bunch threaded 3MM Semi in Pearl coating; task 20 packets → 200 frames on P1
  await p.evaluate(()=>{S.user='admin';S.thr.push({id:'lt1',line:'P',key:'3MM|Round|Semi|SR',bunch:2000,start:2000,kg:100,ts:Date.now(),status:'cq'});S.view='tasks';render();coatTaskModal()});await p.waitForTimeout(100);
  await p.selectOption('#cti','3');await p.fill('#ctpk','20');await p.waitForTimeout(80);await c('form[data-f=coatTask] button[type=submit]');
  const tg=await p.evaluate(()=>S.tasks[S.tasks.length-1].target);ok(tag,'task 20 packet → 200 frame',tg===200,tg);

  // 7.1 + 7.2 staff entry, next day
  await p.evaluate(()=>{closeModal();S.user='stP1';S.shift.P1={start:Date.now(),stop:null,down:0,ended:false};render();entryModal()});await p.waitForTimeout(120);
  const f0=await p.evaluate(()=>({wd:document.getElementById('f-wd').value,lbl:document.getElementById('f-in').closest('.fld').querySelector('label').textContent}));
  const yest=await p.evaluate(()=>ymd14(Date.now()-DAY));
  ok(tag,'7.1 work date defaults to yesterday',f0.wd===yest,f0.wd);ok(tag,'7.2 "Frames use hue"',/Frames use hue/.test(f0.lbl),f0.lbl);
  await p.fill('#f-in','60');await p.fill('#f-pk','5');await p.waitForTimeout(100);
  const box=await p.evaluate(()=>({rj:document.getElementById('rjx').textContent,tp:document.getElementById('tpg').textContent}));
  ok(tag,'7.3 working: 3,60,000 − 3,00,000 → 50 bunch',/3,60,000 moti/.test(box.rj)&&/3,00,000 moti/.test(box.rj)&&/50 bunch/.test(box.rj),box.rj);
  ok(tag,'7.2 task progress: 0 + 60 = 60, 140 left',/Pehle 0 \+ aaj 60 = 60/.test(box.tp)&&/Baaki 140 frame/.test(box.tp),box.tp);
  const fOv=await sheetOv();ok(tag,'entry form fits',!fOv,fOv);
  const fit=await p.evaluate(()=>{const x=document.getElementById('rjx');return x.scrollHeight<=x.clientHeight+1});ok(tag,'working box shows all its lines',fit,fit);
  // too many packets is blocked
  await p.fill('#f-pk','7');await p.waitForTimeout(80);
  const n0=await p.evaluate(()=>S.entries.length);await c('form[data-f=entry] button[type=submit]');
  const blk=await p.evaluate(n0=>({n:S.entries.length-n0,e:document.getElementById('ferr').textContent}),n0);ok(tag,'7 packets from 60 frames blocked',blk.n===0&&/Packet/.test(blk.e),blk);
  await p.fill('#f-pk','5');await p.waitForTimeout(80);
  await c('form[data-f=entry] button[type=submit]');
  const e1=await p.evaluate(()=>{const e=S.entries[S.entries.length-1];return {pk:e.pkMode,fin:e.fin,packets:e.packets,out:e.out,rej:e.reject,input:e.input,wd:ymd14(e.workDate)}});
  ok(tag,'entry saved the owner way',e1.pk===true&&e1.fin===60&&e1.packets===5&&e1.out===250&&near(e1.rej,50)&&e1.input===300,e1);ok(tag,'work date stored',e1.wd===yest,e1.wd);

  // second entry, old way (packets blank): 40 frames, 2 reject → 38 packed frames = 190 bunch
  await p.evaluate(()=>{closeModal();entryModal()});await p.waitForTimeout(100);
  await p.fill('#f-in','40');await p.fill('#f-rej','2');await p.waitForTimeout(80);
  const tp2=await p.evaluate(()=>document.getElementById('tpg').textContent);ok(tag,'progress counts the earlier entry (60 + 40 = 100)',/Pehle 60 \+ aaj 40 = 100/.test(tp2),tp2);
  const hidden=await p.evaluate(()=>document.getElementById('rjx').hidden);ok(tag,'no owner working when packets blank',hidden,hidden);
  await c('form[data-f=entry] button[type=submit]');
  const e2=await p.evaluate(()=>{const e=S.entries[S.entries.length-1];return {pk:!!e.pkMode,out:e.out,frej:e.frej}});ok(tag,'old way unchanged: 38 × 5 = 190 bunch',!e2.pk&&e2.out===190&&e2.frej===2,e2);

  // approval: owner-way entry → 250 bunch to stock, 50 bunch reject → waste
  const pid=await p.evaluate(()=>S.entries.find(e=>e.pkMode).product);
  await p.evaluate(()=>{closeModal();S.user='admin';render();S.entries.filter(e=>e.kind==='coat'&&e.status==='pending').forEach(e=>ACT.approve({dataset:{id:e.id}}))});await p.waitForTimeout(100);
  const ap=await p.evaluate(pid=>({fin:qty('FIN:P',pid,'bunch'),w:qty('WASTE:M','Coating reject','kg'),n:S.coatRej.length,b:S.coatRej[0]&&S.coatRej[0].bunch,lot:S.thr.find(l=>l.id==='lt1').bunch}),pid);
  ok(tag,'stock = 250 + 190 = 440 bunch',ap.fin===440,ap.fin);ok(tag,'7.3 reject 50 bunch → waste (50 × 0.017 kg = 0.85 kg)',ap.n===1&&near(ap.b,50)&&near(ap.w,0.85,1e-3),ap);
  ok(tag,'lot 2,000 − 300 − 200 = 1,500 bunch',ap.lot===1500,ap.lot);

  // task card + owner tab (7.4)
  await p.evaluate(()=>{S.view='tasks';render()});
  const card=await p.evaluate(()=>document.querySelector('#app .tsum14').textContent);
  ok(tag,'task card: 100 / 200 · 8 packet · reject 60 bunch',/100 \/ 200/.test(card)&&/8 packet/.test(card)&&/60 bunch/.test(card),card);
  const tab=await p.evaluate(()=>{const h=[...document.querySelectorAll('#app section h3')].find(x=>/Operator ki entry/.test(x.textContent));return h?h.closest('section').textContent:''});
  ok(tag,'7.4 owner tab by work date: P1 · 60 frame · 5 packet · 50',/P1/.test(tab)&&/100 frame · 8 packet/.test(tab)&&/purana tareeka/.test(tab),tab.slice(0,200));
  const tOv=await ov();ok(tag,'tasks page fits',!tOv,tOv);
  await p.evaluate(()=>{S.view='waste';render()});const wp=await p.evaluate(()=>document.getElementById('app').textContent);
  ok(tag,'waste page: Coating reject 50 bunch',/Coating reject/.test(wp)&&/50/.test(wp),'');const wOv=await ov();ok(tag,'waste page fits',!wOv,wOv);

  // over target warning: 105 more frames → 205 > 200 + 2
  await p.evaluate(()=>{S.user='stP1';render();entryModal()});await p.waitForTimeout(100);await p.fill('#f-in','105');await p.waitForTimeout(80);
  const ot=await p.evaluate(()=>document.getElementById('tpg').textContent);ok(tag,'warns 5 frames over target',/Target se 5 frame zyada/.test(ot),ot);
  await p.fill('#f-in','101');await p.waitForTimeout(80);const ot2=await p.evaluate(()=>document.getElementById('tpg').textContent);ok(tag,'1 over target is fine (±2)',!/zyada/.test(ot2),ot2);

  await p.evaluate(()=>{closeModal();S.lang='hi';S.deva=true;entryModal();closeModal();S.user='admin';S.view='tasks';render();S.lang='hinglish';S.deva=false;render()});
  out.push({tag,e1,ap,errors:errs});ok(tag,'no page errors',!errs.length,errs);await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1)}console.log('Section 7 daily entry: all checks passed');process.exit(0)})();
