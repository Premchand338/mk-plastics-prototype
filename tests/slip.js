// Section 1 test (order slip, client review 24 Nov · V1, V11, P4).
// Usage: node tests/slip.js [path-to-html]   (default: index.html)
// Replays slip 223 from photo P4 as the next book number (224): 3mm Moti, Rani Gulabi / Green / Maroon 200 packets each,
// Bhiwandi → Rajkot. Then checks the series, oldest-slip-first, party-wise made vs ordered, and the rate at bill time.
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

  // 1.6 colours
  const colours=await p.evaluate(()=>['Rani Gulabi','Green','Maroon'].every(c=>S.colours.SR.includes(c)));
  ok(tag,'1.6 SR colours',colours,colours);
  // 1.3 series starts at 224
  const seq0=await p.evaluate(()=>S.seq.slip);ok(tag,'1.3 series start',seq0===224,seq0);

  // 1.1 1.2 1.5 slip: one item, three colours
  await p.evaluate(()=>{S.user='admin';S.view='orders';render();newOrderModal()});await p.waitForTimeout(100);
  await p.selectOption('#op','c5');await p.waitForTimeout(60);
  const autoTo=await p.inputValue('#ost');ok(tag,'1.5 "to" follows party city',autoTo==='Bhiwandi',autoTo);
  await p.fill('#ost','Rajkot');
  await p.selectOption('#oi0','3');await p.selectOption('#oco0','D');
  await p.selectOption('#oc0','Rani Gulabi');await p.fill('#oq0','200');
  await c('[data-a=slipAddCol][data-g="0"]');await p.selectOption('#oc1','Green');await p.fill('#oq1','200');
  await c('[data-a=slipAddCol][data-g="0"]');await p.selectOption('#oc2','Maroon');await p.fill('#oq2','200');
  await p.waitForTimeout(80);
  const formOv=await sheetOv();ok(tag,'slip form fits',!formOv,formOv);
  const kept=await p.inputValue('#ost');ok(tag,'1.5 typed "to" kept after re-render',kept==='Rajkot',kept);
  // ₹3.12 lakh crosses Raja Textiles' ₹1 lakh credit limit: save stays locked until the admin override is ticked
  const locked=await p.evaluate(()=>document.getElementById('osave').disabled);ok(tag,'credit limit still guards the slip',locked,locked);
  await p.check('#modal-root [name=over]');await p.waitForTimeout(60);
  await c('form[data-f=order] button[type=submit]');
  const o1=await p.evaluate(()=>{const o=S.orders[S.orders.length-1];return {no:o.no,n:o.lines.length,pk:o.lines.map(l=>l.pk),g:o.lines.map(l=>l.g),to:o.slip.to,from:o.slip.from,seq:S.seq.slip,rate:o.lines[0].rate}});
  ok(tag,'1.1 slip no 224',o1.no===224,o1.no);ok(tag,'1.2 three colour lines, one item',o1.n===3&&o1.g.every(x=>x===0)&&o1.pk.join()==='200,200,200',o1);
  ok(tag,'1.5 transport',o1.from==='Bhiwandi'&&o1.to==='Rajkot',o1);ok(tag,'1.3 series moves to 225',o1.seq===225,o1.seq);
  ok(tag,'rate from rate list (3mm Semi double)',o1.rate===10.4,o1.rate);

  // duplicate slip number is refused
  await p.evaluate(()=>{closeModal();newOrderModal()});await p.waitForTimeout(80);
  await p.fill('#osn','224');await p.fill('#oq0','5');await p.waitForTimeout(80);
  const dupBlocked=await p.evaluate(()=>document.getElementById('osave').disabled);ok(tag,'1.3 duplicate slip blocked',dupBlocked,dupBlocked);
  // an older book number (backfill) goes in, but the series does not move back
  await p.fill('#osn','220');await p.selectOption('#op','c1');await p.selectOption('#oc0','Off White');await p.waitForTimeout(80);
  await c('form[data-f=order] button[type=submit]');
  const seq2=await p.evaluate(()=>S.seq.slip);ok(tag,'1.3 backfill keeps series',seq2===225,seq2);

  // 1.4 oldest slip first in the list
  await p.evaluate(()=>{closeModal();S.view='orders';S.ui.orderTab='all';render()});
  const firstTwo=await p.evaluate(()=>[...document.querySelectorAll('#app [data-a=orderDetail] .t1')].slice(0,2).map(e=>e.textContent));
  ok(tag,'1.4 oldest slip on top',/Slip #220/.test(firstTwo[0])&&/Slip #224/.test(firstTwo[1]),firstTwo);
  const listOv=await ov();ok(tag,'orders list fits',!listOv,listOv);

  // 1.7 party-wise tab
  await p.evaluate(()=>{S.ui.orderTab='party';render()});
  const pw=await p.evaluate(()=>({cards:document.querySelectorAll('#app .pw14').length,txt:document.querySelector('#app .pw14').textContent}));
  ok(tag,'1.7 party-wise shows both slips',pw.cards===2,pw.cards);
  const pwOv=await ov();ok(tag,'party-wise fits',!pwOv,pwOv);

  // 1.7 priority allocation: give 7 packets of ready stock for 3mm Semi Double Off White; slip 220 (5 packets) takes it first
  const alloc=await p.evaluate(()=>{const o=S.orders.find(x=>x.no===220),l=o.lines[0];move('FIN:P',l.ref,'bunch',7*l.pack);
    const A=alloc14();return {st:orderStatus(o),made:madePk14(o,A)}});
  ok(tag,'1.7 ready to dispatch when made = ordered',alloc.st==='ready'&&alloc.made===5,alloc);

  // 1.8 rate at bill time: change 10.4 → 11 for slip 220
  await p.evaluate(()=>{render();billOrderModal(S.orders.find(x=>x.no===220).id)});await p.waitForTimeout(100);
  await p.fill('#brt0','11');await p.waitForTimeout(60);
  const billOv=await sheetOv();ok(tag,'bill form fits',!billOv,billOv);
  await c('form[data-f=billOrder] button[type=submit]');
  const inv=await p.evaluate(()=>{const i=S.invoices[S.invoices.length-1];return {rate:i.lines[0].rate,taxable:i.taxable,slip:!!document.querySelector('#modal-root .slipmeta')}});
  ok(tag,'1.8 bill uses the new rate',inv.rate===11&&Math.abs(inv.taxable-5*50*11)<0.01,inv);ok(tag,'invoice shows slip + transport',inv.slip,inv.slip);

  // slip paper view
  await p.evaluate(()=>{closeModal();slipModal14(S.orders.find(x=>x.no===224).id)});await p.waitForTimeout(80);
  const slip=await p.evaluate(()=>document.querySelector('#modal-root .slip14').textContent);
  ok(tag,'slip paper lists 3 colours + Rajkot',/Rani Gulabi/.test(slip)&&/Green/.test(slip)&&/Maroon/.test(slip)&&/Rajkot/.test(slip)&&/600/.test(slip),slip.slice(0,120));
  const slipOv=await sheetOv();ok(tag,'slip paper fits',!slipOv,slipOv);

  // Hindi mode renders without errors
  await p.evaluate(()=>{closeModal();S.lang='hi';S.deva=true;S.view='orders';S.ui.orderTab='party';render();newOrderModal()});await p.waitForTimeout(80);
  await p.evaluate(()=>{closeModal();S.lang='hinglish';S.deva=false;render()});

  out.push({tag,slip:o1,alloc,inv,errors:errs});ok(tag,'no page errors',!errs.length,errs);await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1)}console.log('Section 1: all checks passed');process.exit(0)})();
