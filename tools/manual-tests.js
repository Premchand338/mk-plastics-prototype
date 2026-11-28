// Manual test script for Premchand: 3 test cases from "Zero reset", click by click.
// Every step is run here the same way a person would do it: buttons are found by the SAME visible name that the
// step tells you to tap, so if a name in the PDF is wrong, this run fails.
// Output: docs/guide/manual/steps.json + screenshots → used by tools/manual-guide.js for the PDF.
// Usage: node tools/manual-tests.js   (PW_CHROMIUM=/opt/pw-browsers/chromium in the cloud container)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const root=path.join(__dirname,'..'),file=path.join(root,'index.html'),outDir=path.join(root,'docs','guide','manual');
fs.mkdirSync(outDir,{recursive:true});fs.readdirSync(outDir).forEach(f=>fs.unlinkSync(path.join(outDir,f)));
const USERS={owner:['9800000001','1111','Owner'],vinod:['9800000020','3320','Vinod (M1)'],salman:['9800000022','3322','Salman (P1)']};
(async()=>{const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});
 const CASES=[];
 async function testCase(id,title,goal,who,fn){
  const ctx=await b.newContext({viewport:{width:1280,height:860},deviceScaleFactor:1.5,reducedMotion:'reduce'});await ctx.route(/fonts\.|qrcode/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const steps=[];let n=0,shotN=0;
  const wait=(ms=150)=>p.waitForTimeout(ms);
  const scope=async()=>(await p.$('#modal-root .sheet'))?'#modal-root':'#app';
  // tap a visible button / chip / label by its text (the text written in the step)
  const tap=async(text,sc)=>{sc=sc||await scope();const re=text instanceof RegExp?text:new RegExp('^\\s*'+text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$');
   const loc=p.locator(`${sc} :is(button,label,a):not([data-a=nav]):visible`).filter({hasText:re});const c=await loc.count();
   if(!c){const loc2=p.locator(`${sc} :is(button,label,a):not([data-a=nav]):visible`).filter({hasText:text});if(!await loc2.count())throw new Error(`Button "${text}" nahi mila`);await loc2.first().click()}else await loc.first().click();await wait()};
  const field=async(label,value)=>{const sc=await scope();const el=p.locator(sc).getByLabel(label,{exact:false}).first();await el.fill(String(value));await wait(80)};
  const pick=async(label,option)=>{const sc=await scope();const el=p.locator(sc).getByLabel(label,{exact:false}).first();await el.selectOption({label:option}).catch(async()=>{const v=await el.evaluate((s,o)=>{const x=[...s.options].find(op=>op.textContent.trim().startsWith(o));return x&&x.value},option);if(!v)throw new Error(`"${label}" mein "${option}" nahi`);await el.selectOption(v)});await wait(100)};
  const text=async(sel)=>p.evaluate(s=>{const e=document.querySelector(s);return e?e.innerText.replace(/\s+/g,' ').trim():''},sel);
  const S_=(f,a)=>p.evaluate(f,a);
  const login=async(u)=>{const [m,pin]=USERS[u];if(await p.$('[data-a=lgBack]'))await p.click('[data-a=lgBack]');await p.fill('input[name=mobile]',m);await tap('Aage badho','#app');for(const d of pin)await p.click(`[data-a=pinKey]:text-is("${d}")`);await wait(300)};
  const logout=async()=>{if(await p.$('#modal-root .sheet'))await p.click('#modal-root [data-a=close]');await tap('Logout','#app');await wait(200)};
  const nav=async(label)=>{if(await p.$('#modal-root .sheet'))await p.click('#modal-root [data-a=close]');await p.locator('.side [data-a=nav]:visible').filter({hasText:new RegExp('^\\s*'+label+'(\\s|\\d|$)')}).first().click();await wait(200)}; // menu items may carry a count badge ("Approval 1")
  const shot=async(sel)=>{await p.evaluate(()=>{const t=document.getElementById('toast');if(t){t.innerHTML='';t.className=''}});await wait(60);const f=`${id}-${String(++shotN).padStart(2,'0')}.jpg`;
   const s=sel||(await p.$('#modal-root .sheet')?'#modal-root .sheet':null);if(s){const el=await p.$(s);if(el){await el.screenshot({path:path.join(outDir,f),type:'jpeg',quality:80});return f}}
   await p.screenshot({path:path.join(outDir,f),type:'jpeg',quality:80});return f};
  // one step = what you do + what you should see; the run does it and checks it
  const step=async(o)=>{n++;let actual='',pass=false,shotF=null;
   try{if(o.run)await o.run();actual=o.check?String(await o.check()):'';pass=o.ok?!!o.ok(actual):true;if(o.shot)shotF=await shot(o.shot===true?null:o.shot)}catch(e){actual='RUN FAIL: '+e.message.split('\n')[0]+' || SCREEN: '+(await p.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,260)).catch(()=>''));pass=false;await p.screenshot({path:path.join(outDir,`FAIL-${id}-${n}.png`)}).catch(()=>{})}
   steps.push({n,who:o.who||'',do:o.do,see:o.see||'',actual,pass,shot:shotF});};
  const api={p,tap,field,pick,text,S_,login,logout,nav,step,wait};
  try{await fn(api)}catch(e){steps.push({n:++n,do:'(run ruk gaya)',see:'',actual:e.message.split('\n')[0],pass:false})}
  if(errs.length)steps.push({n:++n,do:'Page errors',see:'koi nahi',actual:errs.join(' | '),pass:false});
  CASES.push({id,title,goal,who,steps});await ctx.close()}

 /* ---- shared pieces ---- */
 const reset=async({step,tap,login})=>{
  await step({who:'—',do:'App kholo. Upar dark bar mein <b>Zero reset</b> → <b>Haan, zero karo</b>.',see:'Login screen. Saara data zero.',run:async()=>{await tap('Zero reset','#app');await tap('Haan, zero karo','#modal-root')}});
  await step({who:'Owner',do:'Login: mobile <b>9800000001</b> → <b>Aage badho</b> → PIN <b>1111</b>.',see:'Home: "Aaj ka control room".',run:()=>login('owner'),check:async()=>'',ok:()=>true});};
 const moulding=async(a,{rm,rmLabel,line,size,inKg,outKg,lineName})=>{const {step,tap,field,pick,nav,login,logout,S_,text}=a;
  await step({who:'Owner',do:`Menu <b>Inward</b> → button <b>Inward</b> → Material <b>${rmLabel} (kg)</b> · Bill no. <b>B-1</b> · Kitna aaya <b>300</b> → <b>Save</b>.`,see:`${rmLabel}: 300 kg stock mein.`,
   run:async()=>{await nav('Inward');await tap('Inward');await tap(rmLabel+' (kg)');await a.p.fill('#ib','B-1');await a.p.fill('#iq','300');await tap('Save')},
   check:()=>S_(rm=>qty('RAW:M',rm,'kg'),rm),ok:v=>+v===300});
  await step({who:'Owner',do:`Menu <b>Tasks</b> → <b>Moulding task</b> → Machine <b>M1</b> · Line <b>${lineName}</b> · Raw material <b>${rmLabel}</b> · Size <b>${size}</b> · Shape <b>Round</b> · Grade <b>SR</b> · Target <b>${outKg}</b> kg → <b>Task do</b>.`,see:`Task #1 M1 par (${lineName} line).`,
   run:async()=>{await nav('Tasks');await tap('Moulding task');if(line==='Z')await tap('Metalizing line');await a.p.selectOption('#trm',rm);await a.p.selectOption('#tsz',size);await a.p.fill('#ttg',String(outKg));await tap('Task do')},
   check:()=>S_(()=>{const t=S.tasks[S.tasks.length-1];return t?`${t.machine} · ${t.line}`:''}),ok:v=>v===`M1 · ${line}`});
  await a.logout();
  await step({who:'Vinod',do:'<b>Logout</b> → <b>← Doosra number</b> → <b>9800000020</b> → PIN <b>3320</b> → <b>Shift Shuru</b>.',see:'Vinod ki screen, shift chalu.',
   run:async()=>{await login('vinod');await tap(/Shift Shuru/)},check:()=>S_(()=>!!(S.shift.M1&&S.shift.M1.start)),ok:v=>v==='true'});
  await step({who:'Vinod',do:`<b>Entry Daalo</b> → task #1 · Raw material liya <b>${inKg}</b> kg · Achha maal <b>${outKg}</b> kg → <b>Save</b>.`,see:`Waste ${inKg-outKg} kg apne aap. Entry admin ke paas approval ke liye.`,
   run:async()=>{await tap(/Entry Daalo/);await a.p.fill('#f-in',String(inKg));await a.p.fill('#f-out',String(outKg));await a.p.click('form[data-f=entry] button[type=submit]');await a.wait(200)},
   check:()=>S_(()=>{const e=S.entries[S.entries.length-1];return e?e.status:''}),ok:v=>v==='pending'});
  await a.logout();
  await step({who:'Owner',do:'<b>Logout</b> → <b>← Doosra number</b> → owner login → menu <b>Approval</b> → Vinod ki entry par <b>Approve</b>.',see:`Moulded beads ${outKg} kg stock mein (${lineName}).`,
   run:async()=>{await login('owner');await nav('Approval');await tap('Approve')},
   check:()=>S_(([l,s])=>qty('PLAIN:'+l,s+'|Round|'+(l==='Z'?'Black PP':'Semi')+'|SR','kg'),[line,size]),ok:v=>+v===outKg});};

 /* ================= TC1 ================= */
 await testCase('TC1','Pearl order: raw material se bill tak','Ek order ka poora safar: moulding → karigar (pirai) → coating task → roz ki entry → dispatch (do rang mein se ek) → bill baad mein.','Owner, Vinod (M1), Salman (P1)',async(a)=>{
  const {step,tap,field,pick,nav,login,logout,S_,text,p,wait}=a;
  await reset(a);
  await moulding(a,{rm:'rm2',rmLabel:'GPPS 206 Semi',line:'P',lineName:'Pearl',size:'3MM',inKg:105,outKg:100});
  await step({who:'Owner',do:'Menu <b>Stock</b> → tab <b>Dhaga</b> → <b>Dhaga aaya</b> → Type <b>1×2</b> · kitna <b>10</b> kg · note "opening" → <b>Stock mein jodo</b>.',see:'1×2 dhaga: 10.000 kg.',shot:'#app',
   run:async()=>{await nav('Stock');await tap('Dhaga');await tap('Dhaga aaya');await p.selectOption('#dit','1×2');await field('Kitna','10');await tap('Stock mein jodo')},check:()=>S_(()=>qty('DHAGA','1×2','kg')),ok:v=>+v===10});
  await step({who:'Owner',do:'Menu <b>Karigar</b> → <b>Karigar ko bhejo</b> → Karigar <b>Tausif bhai</b> · Moulded bead <b>3MM Round · Semi (SR)</b> · Kitna <b>100</b> kg.',see:'Pirai spec apne aap: <b>3MM Semi · 30×2×100 = 6,000 moti</b>. Box: 30 ladi = 1 guchha · 2 guchha = 1 frame · andaazan <b>1,200 frame</b>.',shot:true,
   run:async()=>{await nav('Karigar');await tap('Karigar ko bhejo');await tap('Tausif bhai');await p.selectOption('#kb','P~3MM|Round|Semi|SR');await p.fill('#kk','100');await wait(150)},check:()=>text('#kspec'),ok:v=>/6,000 moti \/ frame/.test(v)&&/1,200 frame/.test(v)});
  await step({who:'Owner',do:'<b>Bhejo + challan banao</b>.',see:'Job-work challan: "Pirai kaise karni hai" box (30 · 2 · 60 · 100 · 6,000).',shot:true,
   run:()=>tap('Bhejo + challan banao'),check:()=>text('#modal-root .paper'),ok:v=>/Pirai kaise karni hai/.test(v)});
  await step({who:'Owner',do:'Challan band karo → Karigar page par job ke saamne <b>Wapas lo</b>. Bharo: Maal kisne liya <b>Salman</b> · Grade <b>1st</b> · Kitne frame aaye <b>301</b> · Kul wazan <b>107.53</b> kg · Dhaga type <b>1×2</b> (gram/kg 70 apne aap).',see:'Neeche: 301 frame = 18,06,000 moti = <b>1,505 bunch</b> · Dhaga 107.53 × 70 g = <b>7.527 kg</b> · 1×2 dhaga stock iske baad <b>2.473 kg</b> · Iske baad baaki <b>0.0 kg</b>.',shot:true,
   run:async()=>{await p.click('#modal-root [data-a=close]');await wait();await tap('Wapas lo');await field('Maal kisne liya','Salman');await tap('1st');await p.fill('#rfr','301');await p.fill('#rwt','107.53');await p.selectOption('#rdt','1×2');await wait(150)},
   check:()=>text('#rsum'),ok:v=>/1,505 bunch/.test(v)&&/7\.527 kg/.test(v)&&/2\.473 kg/.test(v)});
  await step({who:'Owner',do:'<b>Threaded maal aaya</b> → popup mein <b>Move to Pearl coating</b>.',see:'Lot 1,505 bunch Pearl coating mein (menu Coating → "Coating mein").',
   run:async()=>{await tap('Threaded maal aaya');await tap('Move to Pearl coating')},check:()=>S_(()=>{const l=S.thr[0];return l?`${l.bunch} ${l.status}`:''}),ok:v=>v==='1505 cq'});
  await step({who:'Owner',do:'Menu <b>Orders</b> → <b>Naya order</b>. Party <b>Laxmi Lace Works · Mumbai</b>. Item <b>3. 3MM Semi · 60B</b> · Unit Pearl · Grade SR · Coating <b>Double</b>. Rang <b>Rani Gulabi</b>, packet <b>10</b>. <b>Aur rang</b> → <b>Green</b>, packet <b>10</b>.',see:'Slip no. <b>224</b> · Bhiwandi → Mumbai · Item 1: 20 packet · rate ₹10.4.',shot:true,
   run:async()=>{await nav('Orders');await tap('Naya order');await p.selectOption('#op','c2');await p.selectOption('#oi0','3');await p.selectOption('#oco0','D');await p.selectOption('#oc0','Rani Gulabi');await p.fill('#oq0','10');await tap('Aur rang');await p.selectOption('#oc1','Green');await p.fill('#oq1','10');await wait(150)},
   check:()=>S_(()=>`${document.getElementById('osn').value} ${document.getElementById('or0').value} ${document.getElementById('ogs0').textContent}`),ok:v=>v==='224 10.4 20 packet'});
  await step({who:'Owner',do:'<b>Slip save karo</b>.',see:'Popup: dono rang ke saamne <b>Coating task do (10 packet · 100 frame)</b>.',shot:true,
   run:()=>tap('Slip save karo'),check:()=>text('#modal-root'),ok:v=>/10 packet · 100 frame/.test(v)});
  await step({who:'Owner',do:'Rani Gulabi ke saamne <b>Coating task do</b> → Machine <b>P1 · Salman</b> rehne do → <b>Task do</b>.',see:'Form mein: Kitne packet <b>10</b> → Target <b>100 frame</b> (3MM Semi: 1 packet = 10 frame exact; allowance abhi nahi).',
   run:async()=>{await p.locator('#modal-root [data-a=orderTask]:visible').first().click();await wait(200);const v=await S_(()=>[document.getElementById('ctpk').value,document.getElementById('ctt').value].join());await tap('Task do');return v},
   check:()=>S_(()=>{const t=S.tasks.find(x=>x.kind==='coat');return t?`${t.pk} ${t.target} ${t.machine}`:''}),ok:v=>v==='10 100 P1'});
  await logout();
  await step({who:'Salman',do:'<b>Logout</b> → <b>← Doosra number</b> → <b>9800000022</b> → PIN <b>3322</b> → <b>Shift Shuru</b> → <b>Entry Daalo</b>. Work date <b>kal</b> (pehle se). Task #2 · Frames use hue <b>105</b> · Kitne packet bane <b>10</b>.',see:'Hisaab box: 105 × 6,000 = 6,30,000 moti · 10 × 60,000 = 6,00,000 · Reject = <b>25 bunch</b> → Waste. Task: Pehle 0 + aaj 105.',shot:true,
   run:async()=>{await login('salman');await tap(/Shift Shuru/);await tap(/Entry Daalo/);await p.fill('#f-in','105');await p.fill('#f-pk','10');await wait(150)},
   check:()=>text('#rjx'),ok:v=>/25 bunch/.test(v)});
  await step({who:'Salman',do:'<b>Save karo</b>.',see:'Entry owner ke paas approval ke liye.',run:async()=>{await p.click('form[data-f=entry] button[type=submit]');await wait(200)},check:()=>S_(()=>{const e=S.entries[S.entries.length-1];return `${e.pkMode} ${e.out} ${e.reject}`}),ok:v=>v==='true 500 25'});
  await logout();
  await step({who:'Owner',do:'Owner login → menu <b>Coating</b> (badge 1) → tab <b>Final approval</b> → Salman ki entry par <b>Approve</b>. (Coating ki entry Approval page par nahi, yahan aati hai.)',see:'Stock → "Dispatch ke liye taiyaar": 3MM Round Rani Gulabi <b>500 bunch</b>. Waste page: <b>Coating reject</b> 25 bunch.',
   run:async()=>{await login('owner');await nav('Coating');await tap(/^\s*Final approval/);await tap('Approve')},
   check:()=>S_(()=>{const e=S.entries[S.entries.length-1];return `${qty('FIN:P',e.product,'bunch')} ${S.coatRej.length?S.coatRej[0].bunch:0}`}),ok:v=>v==='500 25'});
  await step({who:'Owner',do:'Menu <b>Orders</b> → tab <b>Party-wise</b>.',see:'Laxmi Lace Works · Slip #224: Rani Gulabi Order 10 · Bane <b>10</b> · Baaki ✓ ; Green Order 10 · Bane 0 · Baaki <b>10</b>.',shot:'#app',
   run:async()=>{await nav('Orders');await tap('Party-wise')},check:()=>text('#app .pw14'),ok:v=>/Rani Gulabi/.test(v)&&/Green/.test(v)});
  await step({who:'Owner',do:'<b>Order kholo</b> → <b>Dispatch karo</b>. Rani Gulabi <b>10</b> packet (Green 0) · Gaadi number <b>MH04 AB 1234</b> · Bill kab? <b>Bill baad mein</b> → <b>Dispatch karo</b>.',see:'Stock Rani Gulabi 500 → <b>0</b>. Orders page par <b>"Bill banana baaki"</b>: Slip #224, aaj dispatch.',shot:true,
   run:async()=>{await tap('Order kholo');await tap('Dispatch karo');await tap('Bill baad mein');await p.fill('#dv','MH04 AB 1234');await wait(120);const f=await S_(()=>document.getElementById('dq0').value+' '+document.getElementById('dq1').value);if(f!=='10 0')throw new Error('packets '+f)},
   check:async()=>{await p.click('form[data-f=dispatch14] button[type=submit]');await wait(200);return S_(()=>`${qty('FIN:P',S.orders[0].lines[0].ref,'bunch')} ${uninvoiced().length}`)},ok:v=>v==='0 1'});
  await step({who:'Owner',do:'Orders page par "Bill banana baaki" mein <b>Bill banao</b> → GST tax invoice · Rate <b>10.4</b> (slip se) → <b>Bill banao</b>.',see:'Invoice <b>MK/26-27/0001</b> · 10 packet × 50 bunch × ₹10.40 = ₹5,200 + CGST 9% + SGST 9% = <b>₹6,136</b>. Neeche: Dispatch (aaj) · Bill bana (aaj). Buttons: WhatsApp · PDF download.',shot:true,
   run:async()=>{await p.click('#modal-root [data-a=close]').catch(()=>{});await wait();await tap('Bill banao','#app');await tap('Bill banao','#modal-root')},
   check:()=>S_(()=>{const i=S.invoices[0];return i?`${i.no} ${i.total}`:''}),ok:v=>v==='MK/26-27/0001 6136'});
 });


 /* ================= TC2 ================= */
 await testCase('TC2','Karigar slip (P3): grade, dhaga, cut, alert','Owner ki photo P3 wali slip: Tausif · 3 No Semi · 40.400 kg · cut 0.800 · receiver Salman. Grade zaroori, dhaga apne aap, cut waste mein, dhaga kam ho toh alert.','Owner, Vinod (M1)',async(a)=>{
  const {step,tap,field,nav,login,logout,S_,text,p,wait}=a;
  await reset(a);
  await moulding(a,{rm:'rm2',rmLabel:'GPPS 206 Semi',line:'P',lineName:'Pearl',size:'3MM',inKg:52,outKg:50});
  await step({who:'Owner',do:'Menu <b>Stock</b> → tab <b>Dhaga</b> → <b>Dhaga aaya</b> → Type <b>1×2</b> · kitna <b>5</b> kg → <b>Stock mein jodo</b>.',see:'1×2: 5.000 kg.',
   run:async()=>{await nav('Stock');await tap('Dhaga');await tap('Dhaga aaya');await p.selectOption('#dit','1×2');await field('Kitna','5');await tap('Stock mein jodo')},check:()=>S_(()=>qty('DHAGA','1×2','kg')),ok:v=>+v===5});
  await step({who:'Owner',do:'Usi page par <b>Type / reorder</b> → 1×2 wali line mein Reorder <b>3</b> → <b>Save karo</b>.',see:'1×2 card par "reorder 3.000 kg". Abhi alert nahi (5 > 3).',
   run:async()=>{await tap('Type / reorder');await p.fill('#dtr3','3');await tap('Save karo')},check:()=>S_(()=>S.dhagaTypes[3].re+' '+getAlerts().some(x=>/dhaga/.test(x[2]))),ok:v=>v==='3 false'});
  await step({who:'Owner',do:'Menu <b>Karigar</b> → <b>Karigar ko bhejo</b> → <b>Tausif bhai</b> · <b>3MM Round · Semi (SR)</b> · <b>45</b> kg → <b>Bhejo + challan banao</b> → challan band karo (X).',see:'Karigar page: Tausif bhai ke paas 45.0 kg.',
   run:async()=>{await nav('Karigar');await tap('Karigar ko bhejo');await tap('Tausif bhai');await p.selectOption('#kb','P~3MM|Round|Semi|SR');await p.fill('#kk','45');await tap('Bhejo + challan banao');await p.click('#modal-root [data-a=close]');await wait()},
   check:()=>S_(()=>S.jobs.length&&S.jobs[0].sent),ok:v=>+v===45});
  await step({who:'Owner',do:'Job ke saamne <b>Wapas lo</b>. Slip jaisa bharo: Maal kisne liya <b>Salman</b> · Kitne frame aaye <b>120</b> · Kul wazan <b>40.400</b> · Dhaga type <b>1×2</b> · Cut <b>0.800</b>. <b>Grade mat chuno</b> → <b>Threaded maal aaya</b>.',see:'Save <b>nahi</b> hota. Laal likha: "Grade chuno (1st / 2nd / 3rd). Bina grade save nahi hoga."',shot:true,
   run:async()=>{await tap('Wapas lo');await field('Maal kisne liya','Salman');await p.fill('#rfr','120');await p.fill('#rwt','40.400');await p.selectOption('#rdt','1×2');await p.fill('#rct','0.800');await wait();await tap('Threaded maal aaya')},
   check:async()=>(await S_(()=>S.jobs[0].receipts.length))+' '+(await text('#rerr')),ok:v=>/^0 Grade chuno/.test(v)});
  await step({who:'Owner',do:'Ab Grade <b>1st</b> chuno.',see:'Neeche hisaab: 120 frame = 7,20,000 moti = 600 bunch · Dhaga 40.400 × 70 g = <b>2.828 kg</b> · 1×2 stock iske baad <b>2.172 kg</b> · Cut → waste (<b>Semi · 1st grade</b>) 0.800 kg.',shot:true,
   run:()=>tap('1st'),check:()=>text('#rsum'),ok:v=>/2\.828 kg/.test(v)&&/2\.172 kg/.test(v)&&/Semi · 1st grade/.test(v)});
  await step({who:'Owner',do:'<b>Threaded maal aaya</b> → popup mein <b>Baad mein</b>.',see:'Maal 37.572 kg (40.400 − 2.828). Dhaga 2.172 kg.',
   run:async()=>{await tap('Threaded maal aaya');await tap('Baad mein')},check:()=>S_(()=>{const x=S.jobs[0].receipts[0];return x?`${x.beadKg} ${qty('DHAGA','1×2','kg').toFixed(3)}`:''}),ok:v=>v==='37.572 2.172'});
  await step({who:'Owner',do:'Menu <b>Stock</b> → tab <b>Dhaga</b>. Phir upar <b>bell</b> (ghanti).',see:'Dhaga tab par badge; 1×2 card <b>2.172 kg · "kam hai"</b>. Bell mein (Stock group): "1×2 dhaga kam: 2.172 kg".',shot:'#app',
   run:async()=>{await nav('Stock');await tap(/^\s*Dhaga/)},check:async()=>(await text('#app .dhc.low'))+' | '+(await S_(()=>getAlerts().map(x=>x[2]).find(t=>/dhaga/.test(t))||'')),ok:v=>/2\.172 kg/.test(v)&&/1×2 dhaga kam: 2\.172 kg/.test(v)});
  await step({who:'Owner',do:'Menu <b>Waste</b> → neeche dekho.',see:'"Semi waste" <b>2.800 kg</b> (2 kg moulding + 0.800 cut). "Pirai ka cut · grade ke hisaab se": Semi · 1st grade <b>0.800 kg</b>.',shot:'#app',
   run:async()=>{await nav('Waste')},check:()=>text('#app'),ok:v=>/Pirai ka cut/.test(v)&&/0\.800 kg/.test(v)&&/2\.8 kg|2\.800 kg/.test(v)});
  await step({who:'Owner',do:'Menu <b>Karigar</b>.',see:'Tausif bhai ki line: Frame aaye <b>120</b> (600 bunch) · <b>1st · dhaga 2.828 kg · cut 0.800 kg</b> · baaki ~6.6 kg.',shot:'#app',
   run:async()=>{await nav('Karigar')},check:()=>text('#app .tw'),ok:v=>/1st · dhaga 2\.828 kg · cut 0\.800 kg/.test(v)});
  await step({who:'Owner',do:'Menu <b>Rate list</b> → neeche <b>Dhaga (gram / kg)</b> → line 3 "3MM Semi".',see:'Dhaga type ab <b>1×2</b> (return par "yaad rakho" se). Gram / kg 70, "confirm baaki" (Q3d).',
   run:async()=>{await nav('Rate list')},check:()=>S_(()=>S.dhaga[2].type),ok:v=>v==='1×2'});
 });

 /* ================= TC3 ================= */
 await testCase('TC3','Pehla slip pehle, turant bill, Metalizing ka raasta','Do party ne same maal maanga, stock ek ke liye kaafi: purana slip pehle. Dispatch ke saath turant bill (IGST), WhatsApp + PDF. Phir Metalizing ka maal sirf MZ1 ko.','Owner, Vinod (M1)',async(a)=>{
  const {step,tap,field,nav,login,logout,S_,text,p,wait}=a;
  await reset(a);
  await step({who:'Owner',do:'Upar <b>Stock jodo</b> → <b>Dispatch ke liye taiyaar</b> → Unit <b>Pearl line</b> → Item <b>+ Naya product</b>: <b>3. 3MM Semi · 60B</b> · <b>SR</b> · rang <b>Off White</b> · <b>Double</b> · kitna <b>500</b> bunch → Kyun <b>Opening stock</b> → <b>List mein daalo</b> → <b>Stock save karo</b>.',see:'Stock → "Dispatch ke liye taiyaar": 3MM Round Off White · Double <b>500 bunch</b> (= 10 packet).',
   run:async()=>{await tap('Stock jodo','#app');await tap('Dispatch ke liye taiyaar');await p.evaluate(()=>{const f=document.querySelector('#modal-root form');const s=f.loc;s.value=[...s.options].find(o=>/Pearl/.test(o.textContent)).value;s.dispatchEvent(new Event('change',{bubbles:true}))});await wait();
     await p.selectOption('#modal-root [name=fn_it]','3');await p.selectOption('#modal-root [name=fn_gr]','SR');await p.selectOption('#modal-root [name=fn_cl]','Off White');await p.selectOption('#modal-root [name=fn_co]','D');await wait();
     await p.locator('#modal-root').getByLabel(/Kitna/).first().fill('500');await tap('Opening stock');await tap('List mein daalo');await tap('Stock save karo')},
   check:()=>S_(()=>{const id=findProduct(3,'SR','Off White','D','P');return id?qty('FIN:P',id,'bunch'):0}),ok:v=>+v===500});
  for(const [party,name,no] of [['c1','Shree Ganesh Garments · Surat',224],['c4','Noor Embroidery · Bhiwandi',225]])
   await step({who:'Owner',do:`Menu <b>Orders</b> → <b>Naya order</b> → Party <b>${name}</b> · Item <b>3. 3MM Semi · 60B</b> · <b>Double</b> · rang <b>Off White</b> · packet <b>8</b> → <b>Slip save karo</b> → popup <b>Baad mein</b>.`,see:`Slip <b>#${no}</b> ban gaya.`,
    run:async()=>{await nav('Orders');await tap('Naya order');await p.selectOption('#op',party);await p.selectOption('#oi0','3');await p.selectOption('#oco0','D');await p.selectOption('#oc0','Off White');await p.fill('#oq0','8');await wait();if(await p.$('#modal-root [name=over]'))await p.check('#modal-root [name=over]');await tap('Slip save karo');await tap('Baad mein')},
    check:()=>S_(()=>S.orders[S.orders.length-1].no),ok:v=>+v===no});
  await step({who:'Owner',do:'Orders page (tab <b>Sab</b>).',see:'Upar <b>1 · Slip #224</b> "Ready to dispatch" 8 / 8 packet; neeche <b>2 · Slip #225</b> "Maal ka intezaar" 2 / 8 (stock pehle purane slip ko).',shot:'#app',
   run:async()=>{await tap(/^\s*Sab\s*$/)},check:()=>S_(()=>S.orders.map(o=>`#${o.no} ${orderStatus(o)}`).join(' · ')),ok:v=>v==='#224 ready · #225 waiting'});
  await step({who:'Owner',do:'Slip #224 kholo → <b>Dispatch karo</b> → packet 8 · Gaadi number <b>GJ05 XY 4321</b> · Bill kab? <b>Abhi bill banao</b> · <b>GST tax invoice</b> → <b>Dispatch + bill banao</b>.',see:'Invoice turant: <b>MK/26-27/0001</b> · 8 × 50 × ₹10.40 = ₹4,160 + <b>IGST 18% (Gujarat)</b> = <b>₹4,909</b>. Paper par Order slip 224 · Transport Bhiwandi → Surat · Dispatch (aaj, GJ05 XY 4321).',shot:true,
   run:async()=>{await p.locator('#app [data-a=orderDetail]:visible').first().click();await wait(200);await tap('Dispatch karo');await p.fill('#dv','GJ05 XY 4321');await wait();await tap('Dispatch + bill banao')},
   check:()=>S_(()=>{const i=S.invoices[0];return i?`${i.no} ${i.total} ${i.igst>0}`:''}),ok:v=>v==='MK/26-27/0001 4909 true'});
  await step({who:'Owner',do:'Invoice par <b>WhatsApp</b> aur <b>PDF download</b> dekho (PDF: print → "Save as PDF").',see:'WhatsApp message: bill no., Shree Ganesh Garments, Slip 224, gaadi, Total ₹4,909. PDF mein sirf bill ka kaagaz.',
   run:async()=>{},check:()=>S_(()=>decodeURIComponent(document.querySelector('#modal-root [data-wa14]').getAttribute('href'))),ok:v=>/MK\/26-27\/0001/.test(v)&&/4,909/.test(v)&&/GJ05 XY 4321/.test(v)});
  await step({who:'Owner',do:'Invoice band karo → Orders → tab <b>Party-wise</b>.',see:'Noor Embroidery · Slip #225: Bane 2 / 8 (stock 100 bunch bacha). Shree Ganesh: list se hat gaya (pura dispatch).',
   run:async()=>{await p.click('#modal-root [data-a=close]');await wait();await tap('Party-wise')},check:()=>S_(()=>`${qty('FIN:P',S.orders[0].lines[0].ref,'bunch')} ${orderStatus(S.orders[1])}`),ok:v=>v==='100 waiting'});
  await moulding(a,{rm:'rm5',rmLabel:'Black PP',line:'Z',lineName:'Metalizing',size:'6MM',inKg:52,outKg:50});
  await step({who:'Owner',do:'Menu <b>Karigar</b> → <b>Karigar ko bhejo</b> → Moulded bead list mein <b>"Metalizing line"</b> ke neeche <b>6MM Round · Black PP (SR)</b> · <b>50</b> kg → <b>Bhejo + challan banao</b> → band karo.',see:'Pirai spec: "spec nahi mila" (Black PP P2 mein nahi) → theek, wapas lete waqt bunch seedha daalenge.',
   run:async()=>{await nav('Karigar');await tap('Karigar ko bhejo');await p.selectOption('#kb','Z~6MM|Round|Black PP|SR');await p.fill('#kk','50');await wait();const t=await text('#kspec');await tap('Bhejo + challan banao');await p.click('#modal-root [data-a=close]');await wait();return t},
   check:()=>S_(()=>S.jobs[0].line),ok:v=>v==='Z'});
  await step({who:'Owner',do:'<b>Wapas lo</b> → Grade <b>1st</b> · Bunch <b>400</b> · Kul wazan <b>50</b> · Dhaga type <b>1×2</b> · Dhaga gram / kg <b>20</b> → <b>Threaded maal aaya</b>.',see:'Popup: <b>Move to Metalizing</b> (Pearl nahi). Dhaga stock minus mein → bell mein laal alert (dhaga inward nahi kiya).',shot:true,
   run:async()=>{await tap('Wapas lo');await tap('1st');await p.fill('#rb','400');await p.fill('#rwt','50');await p.selectOption('#rdt','1×2');await p.fill('#rgk','20');await wait();await tap('Threaded maal aaya')},
   check:()=>text('#modal-root'),ok:v=>/Move to Metalizing/.test(v)});
  await step({who:'Owner',do:'<b>Move to Metalizing</b> → menu <b>Tasks</b> → <b>Coating task</b>. Machine <b>P1</b> dekho, phir <b>MZ1</b> chuno.',see:'P1: "Pearl line · … (<b>0 lot</b> coating mein)", lot list khaali. MZ1: "Metalizing line · … (<b>1 lot</b>)", lot <b>6MM Round · Black PP (SR) · 400 bunch</b>.',shot:true,
   run:async()=>{await tap('Move to Metalizing');await nav('Tasks');await tap('Coating task');await wait(150);const pear=await text('#tfline');await tap(/MZ1/);await wait(150);return pear},
   check:async()=>(await text('#tfline'))+' | '+(await S_(()=>[...document.querySelectorAll('#ctl option')].filter(o=>o.value).map(o=>o.textContent).join())),ok:v=>/Metalizing line/.test(v)&&/1 lot/.test(v)&&/Black PP/.test(v)});
 });
 await b.close();
 fs.writeFileSync(path.join(outDir,'steps.json'),JSON.stringify({ts:Date.now(),cases:CASES},null,1));
 CASES.forEach(t=>{const ok=t.steps.filter(s=>s.pass).length;console.log(`${t.id} ${t.title}: ${ok}/${t.steps.length}`);t.steps.filter(s=>!s.pass).forEach(s=>console.log('  FAIL #'+s.n,s.do.replace(/<[^>]+>/g,'').slice(0,90),'→',s.actual.slice(0,160)))});
 process.exit(CASES.every(t=>t.steps.every(s=>s.pass))?0:1)})();
