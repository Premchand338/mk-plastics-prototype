// Full-app review crawl: every admin screen + staff screens + main forms,
// desktop 1366 / phone 390 × light / dark × Hinglish / English / Hindi.
// Reports page errors, sideways scroll on pages, and modal sheets wider than their box.
// Usage: node tools/review.js   (PW_CHROMIUM=/opt/pw-browsers/chromium in the cloud container)
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=path.resolve(path.join(__dirname,'..','index.html'));
 const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const issues=[];let checks=0;
 for(const [w,dev] of [[1366,'desktop'],[390,'phone']]) for(const scheme of ['light','dark']) for(const lang of ['hinglish','en','hi']){
  const tag=`${dev}/${scheme}/${lang}`;
  const ctx=await b.newContext({viewport:{width:w,height:900},colorScheme:scheme});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(250);
  // data: a bit of everything
  await p.evaluate(()=>{S.user='admin';
    move('RAW:M','rm2','kg',400);move('PLAIN:P','8MM|Round|Semi|SR','kg',60);move('PLAIN:P','20MM|Round|Semi|SR','kg',5);
    S.thr.push({id:'r1',line:'P',key:'3MM|Round|Semi|SR',bunch:3000,start:3000,kg:150,ts:Date.now(),status:'cq'});
    S.thr.push({id:'r2',line:'Z',key:'6MM|Round|Black PP|SR',bunch:400,start:400,kg:20,ts:Date.now(),status:'thr'});
    const pid=getProduct(3,'SR','Off White','D','P');move('FIN:P',pid,'bunch',1000);dhagaMove14('1×2',5,'in','opening');
    S.taskFields=[{id:'tfa',n:'Lacquer',k:'num',u:'kg'},{id:'tfb',n:'Hardener',k:'check',u:''}];});
  await p.evaluate(l=>{S.lang=l==='en'?'en':'hi';S.deva=l==='hi';render()},lang);
  const run=async(name,fn)=>{checks++;try{await p.evaluate(fn)}catch(e){issues.push(`${tag} · ${name}: ${e.message.split('\n')[0]}`)}await p.waitForTimeout(60);
    const ov=await p.evaluate(()=>{const s=document.querySelector('#modal-root .sheet');return {page:document.documentElement.scrollWidth>innerWidth+1,sheet:!!s&&s.scrollWidth>s.clientWidth+1,clip:[...document.querySelectorAll('#modal-root .pkinfo,#modal-root .sumbox,#app .card')].some(x=>x.scrollHeight>x.clientHeight+2&&getComputedStyle(x).overflowY==='visible')}});
    if(ov.page)issues.push(`${tag} · ${name}: page scrolls sideways`);if(ov.sheet)issues.push(`${tag} · ${name}: form wider than its box`);if(ov.clip)issues.push(`${tag} · ${name}: text spills out of a box`)};
  // flows that create records, so screens have something to show
  await run('order slip',()=>{newOrderModal();const f=document.querySelector('form[data-f=order]');f.pk_0.value='5';f.over&&(f.over.checked=true);LIVE.order(f);FORMS.order(f);closeModal()});
  await run('karigar send',()=>{karSendModal();const f=document.querySelector('form[data-f=karSend]');f.bead.value='P~8MM|Round|Semi|SR';f.kg.value='10';LIVE.karSend(f);FORMS.karSend(f);closeModal()});
  await run('coat task',()=>{coatTaskModal();const f=document.querySelector('form[data-f=coatTask]');f.it.value='3';LIVE.coatTask(f);f.target.value='50';FORMS.coatTask(f);closeModal()});
  const views=await p.evaluate(()=>Object.keys(AV));
  for(const v of views) await run('screen '+v,(v)=>{closeModal();S.user='admin';S.view=v;render()},v),await p.evaluate(v=>{closeModal();S.user='admin';S.view=v;render()},v);
  for(const t of ['fin','cq','thr','mould','raw','counts','dhaga']) await run('stock tab '+t,(t)=>{S.view='stock';S.ui.stockTab=t;render()});
  for(const t of ['all','party','waiting','ready']) await run('orders tab '+t,(t)=>{S.view='orders';S.ui.orderTab=t;render()});
  const forms=[['new order',()=>newOrderModal()],['slip view',()=>slipModal14(S.orders[0].id)],['order detail',()=>orderDetailModal(S.orders[0].id)],['dispatch',()=>dispatchModal14(S.orders[0].id)],
    ['bill setting',()=>ACT.billCfg14()],['slip series',()=>ACT.slipSeries()],['karigar send',()=>karSendModal()],['challan',()=>challanModal(S.jobs[0].id)],['karigar return',()=>karRecvModal(S.jobs[0].id)],
    ['coat task',()=>coatTaskModal()],['task boxes',()=>ACT.taskFields14()],['moulding task',()=>taskModal()],['inward',()=>inwardModal()],['pirai spec edit',()=>ACT.piraiEdit14({dataset:{id:'pr13'}})],
    ['dhaga edit',()=>ACT.dhagaEdit14({dataset:{id:'dh3'}})],['dhaga inward',()=>ACT.dhagaIn14()],['dhaga types',()=>ACT.dhagaTypes14()],['rate edit',()=>ACT.rlEdit({dataset:{id:16}})],['bunch size',()=>ACT.mpbEdit14()],['bell',()=>{S.view='home';render();document.querySelector('[data-a=bell]').click()}]];
  for(const [n,fn] of forms) await run('form '+n,fn);
  // full dispatch + bill now, then invoice
  await run('dispatch + bill',()=>{dispatchModal14(S.orders[0].id);const f=document.querySelector('form[data-f=dispatch14]');f.vehicle.value='MH04 AB 1';f.querySelector('[name=bmode][value=now]').checked=true;LIVE.dispatch14(f);FORMS.dispatch14(f)});
  // staff screens
  for(const u of ['stM1','stM2','stP1','stP2','stZ1']) {
    await run('staff '+u,(u)=>{closeModal();S.user=u;S.view='home';render()},u);await p.evaluate(u=>{closeModal();S.user=u;S.view='home';render()},u);
    await run('staff entry '+u,()=>{entryModal()});}
  if(errs.length)issues.push(...[...new Set(errs)].map(e=>`${tag} · JS error: ${e}`));
  await ctx.close()}
 await b.close();
 console.log(`Review: ${checks} checks · ${issues.length} issues`);[...new Set(issues)].forEach(i=>console.log('- '+i));process.exit(issues.length?1:0)})();
