// Section 5 test (line routing + coating task boxes · V8, V9).
// Usage: node tests/routing.js [path-to-html]   (default: index.html)
// 5.1 Black PP (Metalizing raw material) → moulding → karigar → threaded lot → only the Metalizing unit sees it.
// 5.3 the owner adds his own coating-task boxes; they show on the task and its card.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out=[];const fails=[];
 const ok=(tag,name,cond,got)=>{if(!cond)fails.push(`${tag}: ${name} (got ${JSON.stringify(got)})`)};
 for(const [w,tag] of [[1366,'desktop'],[390,'phone']]){
  const ctx=await b.newContext({viewport:{width:w,height:900}});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const c=async s=>{await p.click(s);await p.waitForTimeout(100)};
  const sheetOv=()=>p.evaluate(()=>{const s=document.querySelector('#modal-root .sheet');return !!s&&s.scrollWidth>s.clientWidth+1});

  // 5.1 Metalizing raw material all the way to coating
  await p.evaluate(()=>{S.user='admin';S.view='maal';render();inwardModal()});await p.selectOption('#im','rm5');await p.fill('#ib','BP/1');await p.fill('#iq','300');await c('form[data-f=inward] button[type=submit]');
  await p.evaluate(()=>{closeModal();taskModal()});await p.click('label:has(input[name=line][value=Z])');await p.waitForTimeout(80);
  const rmList=await p.evaluate(()=>[...document.querySelectorAll('#trm option')].map(o=>o.value).join());ok(tag,'Metalizing line lists only its raw material',rmList==='rm5',rmList);
  await p.selectOption('#trm','rm5');await p.selectOption('#tsz','6MM');await p.fill('#ttg','50');await c('form[data-f=task] button[type=submit]');
  const mt=await p.evaluate(()=>S.tasks[S.tasks.length-1].line);ok(tag,'moulding task line = raw material line (Z)',mt==='Z',mt);
  await p.evaluate(()=>{closeModal();S.user='stM1';S.shift.M1={start:Date.now(),stop:null,down:0,ended:false};render();entryModal()});await p.fill('#f-in','52');await p.fill('#f-out','50');await c('form[data-f=entry] button[type=submit]');
  const [key,nP]=await p.evaluate(()=>{closeModal();S.user='admin';render();ACT.approve({dataset:{id:S.entries[S.entries.length-1].id}});return [keysAt('PLAIN:Z')[0],keysAt('PLAIN:P').length]});
  ok(tag,'moulded stock lands in PLAIN:Z, not Pearl',!!key&&nP===0,[key,nP]);
  await p.evaluate(()=>karSendModal());await p.waitForTimeout(80);
  const grp=await p.evaluate(k=>{const o=[...document.querySelectorAll('#kb option')].find(x=>x.value==='Z~'+k);return o&&o.parentElement.label},key);ok(tag,'karigar send lists it under Metalizing',/Metalizing/.test(grp||''),grp);
  await p.selectOption('#kb','Z~'+key);await p.fill('#kk','50');await c('form[data-f=karSend] button[type=submit]');
  const jl=await p.evaluate(()=>S.jobs[S.jobs.length-1].line);ok(tag,'karigar job line Z',jl==='Z',jl);
  await p.evaluate(()=>{closeModal();karRecvModal(S.jobs[S.jobs.length-1].id)});await p.waitForTimeout(100);
  const hasFr=await p.evaluate(()=>!!document.getElementById('rfr'));
  if(hasFr) await p.fill('#rfr','10'); else await p.fill('#rb','400');
  await p.fill('#rwt','50');await p.fill('#rgk','20');await p.click('label:has(input[name=qgrade][value="1st"])');await p.selectOption('#rdt','1×2');await p.waitForTimeout(80);
  await c('form[data-f=karRecv] button[type=submit]');
  const ask=await p.evaluate(()=>(document.querySelector('#modal-root [data-a=moveCoat]')||{}).textContent||'');ok(tag,'return asks: Move to Metalizing',/Metalizing/.test(ask),ask);
  await c('#modal-root [data-a=moveCoat]');
  const lot=await p.evaluate(()=>{const l=S.thr[S.thr.length-1];return [l.line,l.status]});ok(tag,'threaded lot Z in coating queue',lot.join()==='Z,cq',lot);
  // coating task: Pearl machine does not see it, MZ1 does
  await p.evaluate(()=>{closeModal();S.view='tasks';render();coatTaskModal()});await p.waitForTimeout(100);
  const pear=await p.evaluate(()=>({lots:[...document.querySelectorAll('#ctl option')].filter(o=>o.value).length,h:document.getElementById('tfline').textContent}));
  ok(tag,'P1 (Pearl): no Metalizing lot',pear.lots===0&&/Pearl line/.test(pear.h)&&/0 lot/.test(pear.h),pear);
  await p.click('label:has(input[name=machine][value=MZ1])');await p.waitForTimeout(100);
  const mz=await p.evaluate(()=>({lots:[...document.querySelectorAll('#ctl option')].filter(o=>o.value).length,h:document.getElementById('tfline').textContent}));
  ok(tag,'MZ1 (Metalizing): sees the lot',mz.lots===1&&/Metalizing line/.test(mz.h)&&/1 lot/.test(mz.h),mz);
  await p.evaluate(()=>closeModal());

  // 5.3 owner's boxes: none at first, add two from the task form, form comes back with them
  await p.evaluate(()=>coatTaskModal());await p.waitForTimeout(80);
  const none=await p.evaluate(()=>[document.getElementById('tf14').textContent,document.querySelectorAll('[name^=tf_]').length]);ok(tag,'no boxes guessed',/Q6/.test(none[0])&&none[1]===0,none);
  await c('#modal-root [data-a=taskFields14]');await p.fill('#tfnn','Lacquer');await p.selectOption('#tfkn','num');await p.fill('#tfun','kg');await c('form[data-f=taskFields14] button[type=submit]');
  await c('#modal-root [data-a=taskFields14]');await p.fill('#tfnn','Hardener mila');await p.selectOption('#tfkn','check');await p.waitForTimeout(60);
  const tOv=await sheetOv();ok(tag,'boxes editor fits',!tOv,tOv);
  await c('form[data-f=taskFields14] button[type=submit]');
  const back=await p.evaluate(()=>({form:!!document.querySelector('form[data-f=coatTask]'),n:document.querySelectorAll('#tf14 [name^=tf_]').length}));ok(tag,'back on the task form with 2 boxes',back.form&&back.n===2,back);
  await p.click('label:has(input[name=machine][value=MZ1])');await p.fill('#ctt','12');
  const ids=await p.evaluate(()=>S.taskFields.map(x=>x.id));
  await p.fill('#tf_'+ids[0],'2.5');await p.check(`#modal-root [name=tf_${ids[1]}]`);await p.waitForTimeout(60);
  const fOv=await sheetOv();ok(tag,'task form fits',!fOv,fOv);
  await c('form[data-f=coatTask] button[type=submit]');
  const tf=await p.evaluate(()=>{const t=S.tasks[S.tasks.length-1];return {tf:t.tf,line:t.line}});ok(tag,'task stores the boxes',tf.tf&&tf.tf[ids[0]]===2.5&&tf.tf[ids[1]]===true&&tf.line==='Z',tf);
  await p.evaluate(()=>{closeModal();render()});const card=await p.evaluate(()=>(document.querySelector('#app .tfv14')||{}).textContent||'');
  ok(tag,'card: Lacquer 2.5 kg · Hardener mila: Haan',/Lacquer: 2\.5 kg/.test(card)&&/Hardener mila: Haan/.test(card),card);
  // remove one box
  await p.evaluate(()=>ACT.taskFields14());await p.waitForTimeout(60);await p.check('#modal-root [name=del1]');await c('form[data-f=taskFields14] button[type=submit]');
  const left=await p.evaluate(()=>S.taskFields.map(x=>x.n).join());ok(tag,'box removed',left==='Lacquer',left);
  // staff cannot edit boxes
  const st=await p.evaluate(()=>{S.user='stP1';render();ACT.taskFields14();const o=!!document.querySelector('form[data-f=taskFields14]');S.user='admin';return o});ok(tag,'staff cannot edit boxes',!st,st);

  await p.evaluate(()=>{closeModal();S.lang='hi';S.deva=true;coatTaskModal();closeModal();S.lang='hinglish';S.deva=false;render()});
  out.push({tag,key,errors:errs});ok(tag,'no page errors',!errs.length,errs);await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1)}console.log('Section 5 routing + task boxes: all checks passed');process.exit(0)})();
