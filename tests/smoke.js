// Smoke test: runs the full Pearl-line flow and prints the key numbers.
// Usage: node tests/smoke.js [path-to-html]   (default: index.html)
// Needs Playwright: npm i -D playwright && npx playwright install chromium
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
 const b=await chromium.launch();const out=[];
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
  await p.evaluate(()=>{closeModal();karRecvModal(S.jobs[0].id)});await p.fill('#rb','1505');await p.fill('#rwt','130.1');await c('form[data-f=karRecv] button[type=submit]');
  await p.evaluate(()=>{closeModal();S.view='coating';S.ui.coatTab='thr';render()});await c('[data-a=moveCoat]');
  await p.evaluate(()=>{S.view='tasks';render();coatTaskModal()});await p.waitForTimeout(100);await p.fill('#ctt','60');await c('form[data-f=coatTask] button[type=submit]');
  await p.evaluate(()=>{S.user='stP1';S.shift.P1={start:Date.now(),stop:null,down:0,ended:false};render();entryModal()});await p.waitForTimeout(100);
  await p.fill('#f-in','60');await p.fill('#f-rej','2');await p.waitForTimeout(80);const autoOut=await p.inputValue('#f-out');
  await p.selectOption('#ccl','__new');await p.fill('#cnc','Golden');await p.click('label:has(input[name=coat][value=D])');await c('form[data-f=entry] button[type=submit]');
  await p.evaluate(()=>{closeModal();S.user='admin';render();ACT.approve({dataset:{id:S.entries.find(e=>e.kind==='coat').id}})});const afterCoat=await J();
  await p.evaluate(()=>{closeModal();S.view='orders';render();newOrderModal()});await p.waitForTimeout(100);
  await p.selectOption('#oc0','Golden');await p.selectOption('#oco0','D');await p.fill('#oq0','5');await p.waitForTimeout(80);const rate=await p.inputValue('#or0');
  await c('form[data-f=order] button[type=submit]');await p.evaluate(()=>{closeModal();orderDetailModal(S.orders[0].id)});await c('#modal-root [data-a=billOrder]');
  await c('form[data-f=billOrder] button[type=submit]');const inv=await p.evaluate(()=>[S.invoices[0].no,S.invoices[0].total]);
  await c('#modal-root [data-a=dispBill]');await p.fill('#dv','MH04 AB 1234');await c('form[data-f=dispBill] button[type=submit]');const afterDisp=await J();
  let overflow=false;for(const v of ['home','tasks','production','karigar','coating','dispatch','maal','stock','waste','products','orders','khaata','kharcha','reports','log','team','guide']){await p.evaluate(v=>{S.user='admin';S.view=v;closeModal();render()},v);if(await ov())overflow=v}
  await p.evaluate(()=>{S.view='home';render()});await c('[data-a=bell]');const bell=await p.evaluate(()=>!!document.querySelector('.bellw.open'));
  out.push({tag,autoOut,rate,inv,afterCoat,afterDisp,bell,overflow,errors:errs});await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));process.exit(out.some(o=>o.errors.length||o.overflow)?1:0)})();
