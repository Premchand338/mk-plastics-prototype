// Section 6 test (coating task: packets → frames · V10, P2).
// Usage: node tests/frames.js [path-to-html]   (default: index.html)
// Owner's example: 8mm Semi, packing 4 bunch = 4,800 moti; 1 frame = 2 × 18 × 50 = 1,800 moti; exact 2.667 frame / packet;
// allowance 2.8 → 100 packet = 280 frame.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out=[];const fails=[];
 const ok=(tag,name,cond,got)=>{if(!cond)fails.push(`${tag}: ${name} (got ${JSON.stringify(got)})`)};
 const near=(a,b2,e=1e-3)=>Math.abs(a-b2)<e;
 for(const [w,tag] of [[1366,'desktop'],[390,'phone']]){
  const ctx=await b.newContext({viewport:{width:w,height:900}});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const c=async s=>{await p.click(s);await p.waitForTimeout(100)};
  const ov=()=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  const sheetOv=()=>p.evaluate(()=>{const s=document.querySelector('#modal-root .sheet');return !!s&&s.scrollWidth>s.clientWidth+1});

  // 6.1–6.3 + 6.4 seed
  const m=await p.evaluate(()=>{const r=rlItem(16),r3=rlItem(3);return {fpp:r.fpp,src:r.fppSrc,alw:r.alw,bpf:bpfOf(16),f17:rlItem(17).alw,f3:r3.fpp,a3:r3.alw,b3:bpfOf(3),n13:rlItem(13).fpp}});
  ok(tag,'6.3 8mm Semi exact = 4 × 1,200 ÷ 1,800 = 2.667',near(m.fpp,8/3)&&m.src==='p2',m);ok(tag,'6.2 1 frame = 1,800 moti = 1.5 bunch',near(m.bpf,1.5),m.bpf);
  ok(tag,'6.4 allowance 8mm = 2.8 (both 8mm Semi)',m.alw===2.8&&m.f17===2.8,[m.alw,m.f17]);
  ok(tag,'3mm Semi: exact 10 frame / packet, 5 bunch / frame, no allowance',near(m.f3,10)&&near(m.b3,5)&&m.a3==null,m);
  ok(tag,'6MM Semi has no P2 spec → old way',m.n13==null,m.n13);

  // 6.4–6.5 coating task: 100 packet × 2.8 = 280 frame
  await p.evaluate(()=>{S.user='admin';S.view='tasks';render();coatTaskModal()});await p.waitForTimeout(100);
  await p.selectOption('#cti','16');await p.fill('#ctpk','100');await p.waitForTimeout(100);
  const t1=await p.evaluate(()=>({t:document.getElementById('ctt').value,info:document.getElementById('ctpki').textContent,sum:document.getElementById('ctsum').textContent}));
  ok(tag,'6.4 100 packet × 2.8 = 280 frame',t1.t==='280',t1.t);
  ok(tag,'6.1–6.3 card: 4,800 moti, 1,800 moti, 2.667, 2.8',/4,800 moti/.test(t1.info)&&/1,800 moti/.test(t1.info)&&/2\.667 frame \/ packet/.test(t1.info)&&/2\.8 frame \/ packet/.test(t1.info),t1.info);
  const hint=await p.evaluate(()=>document.getElementById('ctt').closest('.fld').querySelector('.hint').textContent);ok(tag,'target hint: 1 frame = 1.5 bunch · = 100 packet',/1 frame = 1\.5 bunch · = 100 packet/.test(hint),hint);
  ok(tag,'6.5 target in summary',/Target\s*280 frame · 100 packet/.test(t1.sum),t1.sum.slice(0,80));
  const fOv=await sheetOv();ok(tag,'task form fits',!fOv,fOv);
  await p.fill('#ctt','300');await p.waitForTimeout(80);const back=await p.inputValue('#ctpk');ok(tag,'frames typed → packets (300 ÷ 2.8 = 107)',back==='107',back);
  await p.fill('#ctpk','100');await p.waitForTimeout(80);
  await c('form[data-f=coatTask] button[type=submit]');
  const task=await p.evaluate(()=>{const t=S.tasks[S.tasks.length-1];return {target:t.target,pk:t.pk,alw:t.alw,fppx:t.fppx}});
  ok(tag,'task keeps packets + allowance',task.target===280&&task.pk===100&&task.alw===2.8&&near(task.fppx,8/3),task);
  await p.evaluate(()=>{closeModal();render()});const card=await p.evaluate(()=>document.querySelector('#app .tgt14').textContent);
  ok(tag,'6.5 card: 280 frame ka target · 100 packet × 2.8',/280 frame ka target/.test(card)&&/100 packet × 2\.8 \(allowance\)/.test(card),card);
  const tOv=await ov();ok(tag,'tasks page fits',!tOv,tOv);

  // no allowance yet (Q4): 3mm Semi 7 packet → exact 10 → 70 frame
  await p.evaluate(()=>coatTaskModal());await p.waitForTimeout(80);await p.selectOption('#cti','3');await p.fill('#ctpk','7');await p.waitForTimeout(80);
  const t2=await p.evaluate(()=>({t:document.getElementById('ctt').value,info:document.getElementById('ctpki').textContent}));
  ok(tag,'no allowance → exact (7 × 10 = 70) + note',t2.t==='70'&&/Allowance abhi nahi/.test(t2.info),t2);
  // owner gives 3mm allowance 10.5 in the rate list → 7 × 10.5 = 73.5 → 74
  await p.evaluate(()=>{closeModal();S.view='products';render();ACT.rlEdit({dataset:{id:3}})});await p.waitForTimeout(100);
  const ro=await p.evaluate(()=>({ro:document.getElementById('rfp').readOnly,v:document.getElementById('rfp').value}));ok(tag,'exact frames/packet read-only from P2',ro.ro&&ro.v==='10',ro);
  const eOv=await sheetOv();ok(tag,'rate edit fits',!eOv,eOv);
  const logs0=await p.evaluate(()=>S.log.length);
  await p.fill('#ralw','10.5');await c('form[data-f=rlEdit] button[type=submit]');
  const r3=await p.evaluate(l0=>({alw:rlItem(3).alw,fpp:rlItem(3).fpp,logs:S.log.slice(0,S.log.length-l0).map(x=>x.h||x.t||JSON.stringify(x)).join(' | ')}),logs0);
  ok(tag,'allowance saved, exact stays 10',r3.alw===10.5&&near(r3.fpp,10),r3);ok(tag,'no rounded "Frames/packet" log',!/Frames\/packet/.test(r3.logs),r3.logs);
  await p.evaluate(()=>{closeModal();coatTaskModal()});await p.waitForTimeout(80);await p.selectOption('#cti','3');await p.fill('#ctpk','7');await p.waitForTimeout(80);
  const t3=await p.inputValue('#ctt');ok(tag,'7 × 10.5 = 73.5 → 74 frame',t3==='74',t3);

  // rate list table shows exact + allowance
  await p.evaluate(()=>{closeModal();S.view='products';render()});
  const row=await p.evaluate(()=>[...document.querySelectorAll('#app .tw table tbody tr')].find(tr=>tr.children[0].textContent.trim()==='16').children[6].textContent);
  ok(tag,'rate list: 2.667 P2 · allowance 2.8 · 1 fr = 1.5 bunch',/2\.667/.test(row)&&/P2/.test(row)&&/allowance 2\.8/.test(row)&&/1 fr = 1\.5 bunch/.test(row),row);
  const pOv=await ov();ok(tag,'rate list fits',!pOv,pOv);

  // spec / bunch size changes flow through
  await p.evaluate(()=>ACT.piraiEdit14({dataset:{id:'pr13'}}));await p.waitForTimeout(80);await p.fill('#psm','60');await c('form[data-f=piraiEdit14] button[type=submit]');
  const s1=await p.evaluate(()=>rlItem(16).fpp);ok(tag,'spec 18×2×60 = 2,160 → 4,800 ÷ 2,160 = 2.222',near(s1,4800/2160),s1);
  await p.evaluate(()=>ACT.mpbEdit14());await p.waitForTimeout(60);await p.fill('#mpb','1000');await c('form[data-f=mpbEdit14] button[type=submit]');
  const s2=await p.evaluate(()=>rlItem(16).fpp);ok(tag,'1 bunch = 1,000 → 4,000 ÷ 2,160 = 1.852',near(s2,4000/2160),s2);
  await p.evaluate(()=>{ACT.mpbEdit14()});await p.waitForTimeout(60);await p.fill('#mpb','1200');await c('form[data-f=mpbEdit14] button[type=submit]');
  await p.evaluate(()=>{ACT.piraiEdit14({dataset:{id:'pr13'}})});await p.waitForTimeout(60);await p.fill('#psm','50');await c('form[data-f=piraiEdit14] button[type=submit]');

  // order → coating task: 10 packet short × 2.8 = 28 frame
  await p.evaluate(()=>{S.view='orders';render();newOrderModal()});await p.waitForTimeout(80);
  await p.selectOption('#op','c2');await p.selectOption('#oi0','16');await p.selectOption('#oc0','Off White');await p.fill('#oq0','10');await p.waitForTimeout(80);
  await c('form[data-f=order] button[type=submit]');
  const btn=await p.evaluate(()=>document.querySelector('#modal-root [data-a=orderTask]').textContent);ok(tag,'order: (10 packet · 28 frame)',/10 packet · 28 frame/.test(btn),btn);
  await c('#modal-root [data-a=orderTask]');
  const ot=await p.evaluate(()=>[document.getElementById('ctpk').value,document.getElementById('ctt').value]);ok(tag,'order task: 10 packet → 28 frame',ot.join()==='10,28',ot);

  await p.evaluate(()=>{closeModal();S.lang='hi';S.deva=true;S.view='tasks';render();coatTaskModal();closeModal();S.lang='hinglish';S.deva=false;render()});
  out.push({tag,m,task,errors:errs});ok(tag,'no page errors',!errs.length,errs);await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1)}console.log('Section 6 packets → frames: all checks passed');process.exit(0)})();
