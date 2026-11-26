// Smoke test: runs the full Pearl-line flow, prints the key numbers and fails if they change.
// Expected: auto packed 58 · rate 10.4 · bill MK/26-27/0001 ₹3,068 · ready stock 290 → 40 bunch.
// Usage: node tests/smoke.js [path-to-html]   (default: index.html)
// Needs Playwright: npm i -D playwright && npx playwright install chromium
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out=[];
 for(const [w,tag] of [[1366,'desktop'],[390,'phone']]){
  const ctx=await b.newContext({viewport:{width:w,height:900}});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const c=async s=>{await p.click(s);await p.waitForTimeout(100)};const J=()=>p.evaluate(()=>journeyStages().map(s=>s.v).join(' | '));
  const ov=()=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  await p.evaluate(()=>{S.user='admin';S.view='maal';render();inwardModal()});await p.selectOption('#im','rm2');await p.fill('#ib','SP/1');await p.fill('#iq','500');await c('form[data-f=inward] button[type=submit]');
  await p.evaluate(()=>{closeModal();taskModal()});await p.selectOption('#trm','rm2');await p.selectOption('#tsz','3MM');await p.fill('#ttg','100');await c('form[data-f=task] button[type=submit]');
  await p.evaluate(()=>{S.user='stM1';S.shift.M1={start:Date.now(),stop:null,down:0,ended:false};render();entryModal()});await p.fill('#f-in','105');await p.fill('#f-out','100');await c('form[data-f=entry] button[type=submit]');
  await p.evaluate(()=>{closeModal();S.user='admin';render();ACT.approve({dataset:{id:S.entries[0].id}});karSendModal()});await p.fill('#kk','100');await c('form[data-f=karSend] button[type=submit]');
  await p.evaluate(()=>{closeModal();karRecvModal(S.jobs[0].id)});await p.fill('#rfr','301');/* v14.3 (owner V5): karigar returns frames; 301 × 6,000 moti (3MM Semi, P2) = 1,505 bunch of 1,200 */await p.fill('#rwt','107.53');await p.click('label:has(input[name=qgrade][value="1st"])');await p.selectOption('#rdt','1×2');/* v14.4 (owner V6, Q8): dhaga = total kg × 70 g/kg (3 Semi, P1); 107.53 − 7.527 = 100 kg bead = sent, same as before */await c('form[data-f=karRecv] button[type=submit]');
  await p.evaluate(()=>{closeModal();S.view='coating';S.ui.coatTab='thr';render()});await c('[data-a=moveCoat]');
  await p.evaluate(()=>{S.view='tasks';render();coatTaskModal()});await p.waitForTimeout(100);await p.fill('#ctt','60');await c('form[data-f=coatTask] button[type=submit]');
  await p.evaluate(()=>{S.user='stP1';S.shift.P1={start:Date.now(),stop:null,down:0,ended:false};render();entryModal()});await p.waitForTimeout(100);
  await p.fill('#f-in','60');await p.fill('#f-rej','2');await p.waitForTimeout(80);const autoOut=await p.inputValue('#f-out');
  await p.selectOption('#ccl','__new');await p.fill('#cnc','Golden');await p.click('label:has(input[name=coat][value=D])');await c('form[data-f=entry] button[type=submit]');
  await p.evaluate(()=>{closeModal();S.user='admin';render();ACT.approve({dataset:{id:S.entries.find(e=>e.kind==='coat').id}})});const afterCoat=await J();
  await p.evaluate(()=>{closeModal();S.view='orders';render();newOrderModal()});await p.waitForTimeout(100);
  await p.selectOption('#oc0','Golden');await p.selectOption('#oco0','D');await p.fill('#oq0','5');await p.waitForTimeout(80);const rate=await p.inputValue('#or0');
  await c('form[data-f=order] button[type=submit]');await p.evaluate(()=>{closeModal();orderDetailModal(S.orders[0].id)});await c('#modal-root [data-a=billOrder]');
  // v14.2 (owner's answer Q11, 26 Nov): dispatch first, bill in the same step. Same numbers as before.
  await p.fill('#dv','MH04 AB 1234');await c('form[data-f=dispatch14] button[type=submit]');const inv=await p.evaluate(()=>[S.invoices[0].no,S.invoices[0].total]);const afterDisp=await J();
  let overflow=false;for(const v of ['home','tasks','production','karigar','coating','dispatch','maal','stock','waste','products','orders','khaata','kharcha','reports','log','team','guide']){await p.evaluate(v=>{S.user='admin';S.view=v;closeModal();render()},v);if(await ov())overflow=v}
  await p.evaluate(()=>{S.view='home';render()});await c('[data-a=bell]');const bell=await p.evaluate(()=>!!document.querySelector('.bellw.open'));
  out.push({tag,autoOut,rate,inv,afterCoat,afterDisp,bell,overflow,errors:errs});await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 // Expected (CLAUDE.md). v14.5: 1 frame of 3MM Semi = 6,000 moti (P2) = 5 bunch, not the old flat 10 → ready 290 → 40 (was 580 → 330).
 const bad=out.flatMap(o=>[o.autoOut!=='58'&&'autoOut '+o.autoOut,o.rate!=='10.4'&&'rate '+o.rate,(o.inv[0]!=='MK/26-27/0001'||o.inv[1]!==3068)&&'bill '+o.inv,
   !/\| 290 bunch$/.test(o.afterCoat)&&'ready after coating '+o.afterCoat,!/\| 40 bunch$/.test(o.afterDisp)&&'ready after dispatch '+o.afterDisp].filter(Boolean).map(x=>o.tag+': '+x));
 if(bad.length)console.log('FAIL\n- '+bad.join('\n- '));
 process.exit(out.some(o=>o.errors.length||o.overflow)||bad.length?1:0)})();
