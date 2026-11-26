// v14.2 test: dispatch first, then bill (owner's answers 26 Nov · Q11).
// Usage: node tests/dispatch.js [path-to-html]   (default: index.html)
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
  const ymd=d=>p.evaluate(d=>ymd14(d),d);

  // setup: 1,000 bunch ready of 3MM Semi Double SR Off White (Pearl); slip 224 · Laxmi Lace Works (Mumbai) · 10 packets
  const pid=await p.evaluate(()=>{S.user='admin';const id=getProduct(3,'SR','Off White','D','P');move('FIN:P',id,'bunch',1000);S.view='orders';render();return id});
  const defaults=await p.evaluate(()=>S.cfg14);ok(tag,'default settings',defaults.billMode==='now'&&defaults.billDays===2&&defaults.creditMode==='warn',defaults);
  await p.evaluate(()=>newOrderModal());await p.waitForTimeout(80);
  await p.selectOption('#op','c2');await p.selectOption('#oi0','3');await p.selectOption('#oco0','D');await p.selectOption('#oc0','Off White');await p.fill('#oq0','10');await p.waitForTimeout(80);
  await c('form[data-f=order] button[type=submit]');
  const oid=await p.evaluate(()=>{closeModal();return S.orders[0].id});

  // the order's main button now says Dispatch, not Bill
  await p.evaluate(id=>orderDetailModal(id),oid);
  const lbl=await p.evaluate(()=>document.querySelector('#modal-root [data-a=billOrder]').textContent.trim());ok(tag,'order button = Dispatch karo',/Dispatch karo/.test(lbl),lbl);
  await c('#modal-root [data-a=billOrder]');
  const dm=await p.evaluate(()=>({form:!!document.querySelector('form[data-f=dispatch14]'),pk:document.getElementById('dq0').value,rate:document.getElementById('drt0').value}));
  ok(tag,'dispatch screen opens with packets + slip rate',dm.form&&dm.pk==='10'&&dm.rate==='10.4',dm);
  const dOv=await sheetOv();ok(tag,'dispatch form fits',!dOv,dOv);

  // "Bill baad mein", dispatched 3 days ago
  await p.click('label:has(input[name=bmode][value=later])');await p.waitForTimeout(80);
  const hid=await p.evaluate(()=>document.querySelector('#drt0').closest('.fld').hidden);ok(tag,'rate hidden for bill later',hid,hid);
  const d3=await p.evaluate(()=>ymd14(Date.now()-3*DAY));
  await p.fill('#dv','MH04 AB 1234');await p.fill('#ddt',d3);await p.waitForTimeout(60);
  await c('form[data-f=dispatch14] button[type=submit]');
  const later=await p.evaluate(pid=>({inv:S.invoices.length,disp:S.dispatches.length,un:uninvoiced().length,stock:qty('FIN:P',pid,'bunch'),day:ymd14(S.dispatches[0].ts),
    alert:getAlerts().some(a=>/din se zyada baaki/.test(a[2])),dup:getAlerts().some(a=>/dispatch ka bill banana baaki/.test(a[2]))}),pid);
  ok(tag,'bill later: no invoice yet',later.inv===0&&later.disp===1&&later.un===1,later);
  ok(tag,'stock goes down at dispatch (1000 → 500)',later.stock===500,later.stock);
  ok(tag,'dispatch date kept',later.day===d3,later.day);ok(tag,'late bill alert after 2 days',later.alert,later.alert);ok(tag,'late bill not listed twice in the bell',!later.dup,later.dup);
  await p.evaluate(()=>{S.ui.orderTab='all';render()});
  const pend=await p.evaluate(()=>{const b=document.querySelector('#app [data-a=bill]');return b?b.closest('.item').textContent:''});
  ok(tag,'"Bill banana baaki" with days waiting',/3 din se baaki/.test(pend),pend);
  const lOv=await ov();ok(tag,'orders page fits',!lOv,lOv);

  // owner fills the final rate later
  await c('#app [data-a=bill]');await p.fill('#drt0','9');await p.waitForTimeout(60);
  await c('form[data-f=billLater14] button[type=submit]');
  const inv=await p.evaluate(()=>{const i=S.invoices[0];return {no:i.no,rate:i.lines[0].rate,total:i.total,date:ymd14(i.ts),billed:ymd14(i.billedAt),pk:i.lines[0].pk}});
  const today=await ymd(Date.now());
  ok(tag,'invoice no',inv.no==='MK/26-27/0001',inv.no);ok(tag,'final rate used (500 × 9 × 1.18 = 5,310)',inv.rate===9&&inv.total===5310,inv);
  ok(tag,'invoice dated on dispatch day',inv.date===d3,inv.date);ok(tag,'billed date stored = today',inv.billed===today,inv.billed);
  const pills=await p.evaluate(()=>document.querySelector('#modal-root .sh-b').textContent);ok(tag,'invoice shows dispatch + billed dates',/Dispatch/.test(pills)&&/Bill bana/.test(pills),'');
  const onPaper=await p.evaluate(()=>document.querySelector('#modal-root .paper .slipmeta').textContent);ok(tag,'dispatch date + truck printed on the invoice',/Dispatch/.test(onPaper)&&/MH04 AB 1234/.test(onPaper),onPaper);
  const alertGone=await p.evaluate(()=>!getAlerts().some(a=>/din se zyada baaki/.test(a[2])));ok(tag,'late alert gone after billing',alertGone,alertGone);

  // WhatsApp + PDF
  const wa=await p.evaluate(()=>decodeURIComponent(document.querySelector('#modal-root [data-wa14]').getAttribute('href')));
  ok(tag,'WhatsApp link with bill no + total + slip',/^https:\/\/wa\.me\/\?text=/.test(wa)&&/MK\/26-27\/0001/.test(wa)&&/5,310/.test(wa)&&/slip 224/i.test(wa),wa.slice(0,80));
  await p.evaluate(()=>{window.print=()=>{window.__pr=[document.body.classList.contains('print14'),document.title]}});
  await c('#modal-root [data-a=invPdf14]');await p.waitForTimeout(700);
  const pr=await p.evaluate(()=>({pr:window.__pr,after:document.body.classList.contains('print14')}));
  ok(tag,'PDF: prints only the invoice, file named by bill no',pr.pr&&pr.pr[0]===true&&pr.pr[1]==='MK-26-27-0001'&&!pr.after,pr);

  // settings: default "Bill baad mein"; second dispatch opens with it pre-selected, partial = its own bill
  await p.evaluate(()=>{closeModal();ACT.billCfg14()});await p.waitForTimeout(80);
  await p.click('label:has(input[name=mode][value=later])');await p.fill('#bcd','5');await c('form[data-f=billCfg14] button[type=submit]');
  const cfg=await p.evaluate(()=>S.cfg14);ok(tag,'settings saved',cfg.billMode==='later'&&cfg.billDays===5,cfg);
  const lateNow=await p.evaluate(()=>S.dispatches.filter(billLate14).length);ok(tag,'nothing late after billing',lateNow===0,lateNow);

  // credit block: Raja Textiles (₹1 lakh limit), 200 packets ≈ ₹1.23 lakh with GST
  await p.evaluate(pid=>{move('FIN:P',pid,'bunch',20000);S.cfg14.creditMode='block';newOrderModal()},pid);await p.waitForTimeout(80);
  await p.selectOption('#op','c5');await p.selectOption('#oi0','3');await p.selectOption('#oco0','D');await p.selectOption('#oc0','Off White');await p.fill('#oq0','200');await p.waitForTimeout(80);
  await p.check('#modal-root [name=over]');await c('form[data-f=order] button[type=submit]');
  await p.evaluate(()=>{closeModal();dispatchModal14(S.orders.find(o=>o.party==='c5').id)});await p.waitForTimeout(100);
  const pre=await p.evaluate(()=>document.querySelector('[name=bmode]:checked').value);ok(tag,'default mode from settings',pre==='later',pre);
  await p.click('label:has(input[name=bmode][value=now])');await p.waitForTimeout(80);
  const blocked=await p.evaluate(()=>document.getElementById('dsave').disabled);ok(tag,'credit block stops dispatch',blocked,blocked);
  await p.check('#modal-root [name=over]');await p.waitForTimeout(80);
  const unblocked=await p.evaluate(()=>document.getElementById('dsave').disabled);ok(tag,'owner tick allows dispatch',!unblocked,unblocked);
  await p.fill('#dv','GJ03 XY 9');await c('form[data-f=dispatch14] button[type=submit]');
  const two=await p.evaluate(()=>({n:S.invoices.length,orders:new Set(S.invoices.map(i=>i.order)).size,ts:ymd14(S.invoices[1].ts)}));
  ok(tag,'separate bill per dispatch / order',two.n===2&&two.orders===2,two);ok(tag,'bill now dated today',two.ts===today,two.ts);

  // owner only
  const staff=await p.evaluate(oid=>{closeModal();S.user='stP1';render();dispatchModal14(oid);const open=!!document.querySelector('form[data-f=dispatch14]');billModal(S.dispatches[0].id);const open2=!!document.querySelector('form[data-f=billLater14]');S.user='admin';return open||open2},oid);
  ok(tag,'staff cannot dispatch or bill',!staff,staff);

  // Hindi + dispatch page render
  await p.evaluate(()=>{S.lang='hi';S.deva=true;S.view='dispatch';render();S.view='orders';render();dispatchModal14(S.orders[0].id);closeModal();S.lang='hinglish';S.deva=false;S.view='dispatch';render()});
  const dvOv=await ov();ok(tag,'dispatch page fits',!dvOv,dvOv);
  out.push({tag,later,inv,two,errors:errs});ok(tag,'no page errors',!errs.length,errs);await ctx.close()}
 await b.close();console.log(JSON.stringify(out,null,1));
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1)}console.log('v14.2 dispatch → bill: all checks passed');process.exit(0)})();
