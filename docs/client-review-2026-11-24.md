# Client review fixes — 23–24 Nov 2026 (Pearl line)

Source: Zahid bhai ke 13 voice notes (V1–V13) aur 4 photos (P1–P4). Har check ke saath source likha hai, jaise `V10 · 2:44–3:11` = voice note 10, 2:44 se 3:11.
Live checklist (tick boxes): https://claude.ai/artifact/JDaM8hfrotRzwDsPyCpxjh

## 1. Order slip aur orders

Order ab owner ki slip book jaisa bane: ek slip, ek number, kai rang.

> Asar: order ka data badlega (ek line mein kai rang + quantity), order number series, orders list ki sorting, bill screen par rate.

- [x] **1.1 Order form slip jaisa ho** — Fields: Slip/Order No, Date, Party, Item name (Moti ya koi aur item), Size, Colour, Quantity (packets), Transport, Rate/deal, Sign. _(source: V1 · 0:00–0:46, P4)_
- [x] **1.2 Ek slip mein kai rang, har rang ki alag quantity** — Jaise 3mm Moti: Rani Gulabi 200, Green 200, Maroon 200 packets, ek hi order number par. _(source: V1 · 0:23–0:29, P4)_
- [x] **1.3 Slip number series** — Number book se match kare: abhi 223 hai toh agla 224, phir 225. Start number owner set kar sake. _(source: V1 · 0:43–0:51, P4)_
- [x] **1.4 Priority list: pehla order pehle** — 2–3 slips aayein toh sabse purana slip number upar; coating task isi kram mein. _(source: V1 · 0:51–1:00)_
- [x] **1.5 Transport field** — Kahan se kahan: jaise Bhiwandi se Rajkot. _(source: V1 · 0:29–0:41, P4)_
- [x] **1.6 Naye rang list mein** — Rani Gulabi aur Green SR list mein nahi hain; jodo (Maroon pehle se hai). _(source: P4)_
- [x] **1.7 Owner tab: order vs bana hua** — Har party ka order: 200 packet diya, kitne bane. Pura hone par "Ready to dispatch". _(source: V11 · 0:00–0:24)_
- [x] **1.8 Invoice par rate daalna** — Dispatch ke baad invoice; rate aur baaki details owner invoice ke time daale, bill usi se bane. _(source: V11 · 0:24–0:44)_

> **Status:** v14.1 mein bana (25 Nov) · `releases/v14.1-order-slip/` · 1.8 mein rate bill ke time; bill → dispatch ka kram Q11 tak wahi.

## 2. Karigar ko pirai ke liye bhejna

Karigar ko bata ke bhejna ki guchha kaise banana hai.

> Asar: naya master data (31 items ka pirai spec); karigar challan mein spec; "bunch" shabd ka matlab badlega.

- [ ] **2.1 Pirai spec master** — Har item: ladi per guchha, guchha per frame (2), moti per ladi. Photo P2 ki 31 lines import ho. _(source: V4 · 0:00–1:09, P2)_
- [ ] **2.2 Send challan par spec dikhe** — Jaise 8mm Semi: 18 ladi ka guchha, 2 guchha = 1 frame (36 ladi), 50 moti per ladi. _(source: V4 · 0:24–0:42, V6 · 0:00–0:08)_
- [ ] **2.3 "Bunch" ka sahi matlab** — Hamara bunch = 1,200 moti (standard). Karigar guchha/frame mein deta hai, woh bunch nahi. App mein "Kitne bunch aaye" ki jagah guchha/frame. _(source: V5 · 0:00–0:21)_
- [ ] **2.4 Naya item: No 6 B.H.L.** — B.H.L. = Big Hole. Aur "Semi F" bhi register mein hai; dono item list mein. _(source: V4 · 0:10–0:17, P2)_

## 3. Karigar se wapas lena

Return entry bilkul karigar ki slip jaisi, aur dhaga apne aap alag ho.

> Asar: return form ke fields, thread ka hisaab (0.02 kg/bunch hatega), loose / threaded / dhaga / waste chaaron stock.

- [ ] **3.1 Return entry slip jaisi** — Date, Karigar (slip: Mahebub Bhai / Tausit), Item (3 No Semi), Grade, Kul wazan dhaage ke saath (40.400 kg), Cut (0.800 kg), Receiver (Salman). _(source: V2 · 0:00–0:36, V7 · 0:00–0:16, P3)_
- [ ] **3.2 Grade zaroori (1st / 2nd / 3rd)** — Slip mein grade nahi likha tha ("gadbad"); app mein grade chune bina save na ho. _(source: V2 · 0:20–0:29)_
- [ ] **3.3 Dhaga master (gram per kg)** — Har item ka 1 kg pirai mein kitna dhaga. Photo P1 ki 34 lines. _(source: V3 · 0:00–0:16, P1)_
- [ ] **3.4 Dhaga apne aap minus** — Dhaga = kg × g/kg. Example: 1 kg @ 15 g → 985 g maal + 15 g dhaga; 11mm Semi 10 kg @ 12 g → 120 g. _(source: V6 · 0:09–0:38, V6 · 1:16–1:32)_
- [ ] **3.5 Stock movement** — Loose (moulded) maal minus, threaded maal plus, dhaga stock minus. _(source: V6 · 1:34–1:51)_
- [ ] **3.6 Cut waste mein, usi grade mein** — Cut = jo moti pir nahi sakti (hole band). Type-1 ka cut waste ke first grade section mein jaye. _(source: V2 · 0:36–1:24)_

## 4. Dhaga stock

Dhaga bhi inventory ka hissa ho.

> Asar: naya stock section (DHAGA), inward / opening stock mein dhaga, alerts.

- [ ] **4.1 Inventory mein Dhaga section** — Types: 1×3, 2×2, 3×3, 1×2 (alag grade/type). _(source: V6 · 0:38–1:00)_
- [ ] **4.2 Item ke saath dhaga type** — Kis maal mein kaunsa dhaga lagta hai; owner batayega. _(source: V6 · 1:26–1:32)_
- [ ] **4.3 Return par dhaga auto minus + alert** — Pirai entry se dhaga stock ghate; kam ho toh bell mein alert. _(source: V6 · 1:05–1:16)_

## 5. Line routing aur coating task form

Maal apni line mein khud jaaye.

> Asar: threaded lot ka unit raw material ki line se tay; coating task form mein owner ke format ke fields.

- [ ] **5.1 Pearl ka maal Pearl unit mein, Metal ka Metal mein** — Pearl line ka raw material / threaded maal apne aap Pearl unit; Metalizing ka Metalizing unit. _(source: V8 · 0:00–0:18)_
- [ ] **5.2 Pehle Pearl line poori** — Metal coating ke task ki requirement owner alag se batayega. _(source: V9 · 0:00–0:16, V12 · 0:00–0:07)_
- [ ] **5.3 Coating task: owner ke manual format ke saare fields** — Owner message bhejega ki woh haath se task kaise likhta hai; har value ka box/checkbox chahiye.owner ka message baaki _(source: V8 · 0:18–0:46)_

## 6. Coating task: packets se frames

Owner packets de, frames app nikale.

> Asar: v13 ka "frames per packet" (poora number) badal kar register se nikla hisaab + owner allowance (2.8 jaisa decimal).

- [ ] **6.1 Bunch = 1,200 moti, packet = packing × 1,200** — 8mm ki packing 4 bunch = 4 × 1,200 = 4,800 moti. _(source: V10 · 1:48–2:40)_
- [ ] **6.2 Moti per frame register se** — 2 guchha × ladi × moti: 8mm = 2 × 18 × 50 = 1,800. _(source: V10 · 2:44–3:11, P2)_
- [ ] **6.3 Exact frames per packet** — 4,800 ÷ 1,800 = 2.667; app khud nikale. _(source: V10 · 3:11–3:23)_
- [ ] **6.4 Owner allowance per item** — Tooti ladi ke liye: 8mm = 2.8. Task: 100 packet × 2.8 = 280 frame. Owner har item ka allowance dega. _(source: V10 · 3:23–4:33)_
- [ ] **6.5 Task mein target frames** — Jaise "2,060 frame ka target" saaf dikhe. _(source: V10 · 0:43–0:55)_

## 7. Daily production entry

Aaj ka kaam kal pack hota hai, isliye entry agle din.

> Asar: entry ki tareekh (work date), naye fields, rejected bunch ka auto hisaab, owner ka view.

- [ ] **7.1 Entry agle din, kal ki shift ke liye** — Aaj bane packets kal pack hote hain; operator agle din entry kare aur work date chune. _(source: V10 · 0:13–0:43)_
- [ ] **7.2 Operator ke inputs** — Frames used (target se 1–2 upar-neeche ho sakti) aur task ke against packets bane. _(source: V10 · 0:55–1:21)_
- [ ] **7.3 Rejected bunch apne aap** — Task ke frames khatam hone par: (frames × moti/frame − packets × moti/packet) ÷ 1,200. _(source: V10 · 1:21–1:48)_
- [ ] **7.4 Owner tab mein operator ka input** — Kis operator ne kis task par kitne frames, kitne packets; task ka progress. _(source: V11 · 0:00–0:16)_

## 8. Contractor aur workers

Fixed salary waale workers ka hajri aur kharchi hisaab.

> Asar: naya role (Contractor login), worker master, attendance, kharchi; purana piece-rate wage report iski jagah.

- [ ] **8.1 Naya login: Contractor** — Contractor login kare; uske under ke workers. _(source: V13 · 0:20–0:30)_
- [ ] **8.2 Worker master** — Naam (kabhi bhi badal sake), monthly salary (jaise ₹18,000). _(source: V13 · 0:00–0:08, V13 · 0:34–0:39)_
- [ ] **8.3 Per day wage = salary ÷ 30** — ₹18,000 → ₹600 per din. _(source: V13 · 0:08–0:20)_
- [ ] **8.4 Roz attendance** — Contractor har worker ki present lagaye. _(source: V13 · 0:20–0:34)_
- [ ] **8.5 Kharchi (running advance)** — Date ke saath amount, jaise ₹500. _(source: V13 · 0:39–0:51, V13 · 1:20–1:29)_
- [ ] **8.6 On the spot hisaab** — 6 din × ₹600 = ₹3,600 − ₹500 kharchi = ₹3,100 dena hai. _(source: V13 · 0:55–1:33)_

## 9. Delivery aur testing

Owner khud test karega.

> Asar: process; har update ke baad link bhejna.

- [ ] **9.1 Updated link owner ko share** — Pearl line ke saare changes ke baad link bhejo; owner test karke result batayega. _(source: V12 · 0:07–0:28)_

## Owner se sawaal (build se pehle confirm karo)

Abhi baaki: Q2 (1½ / 2 Super rate list mein?), Q3 (handwriting values), Q4 (allowance list), Q5 (dhaga type per item), Q6 (coating task message), Q9 ka workers wala hissa.

- [x] **Q1.** "S.P." / "Sopo" ka matlab Super hai? "SS" kaunsa maal (Sujni?) hai? "Semi F" kya hai? _(P1, P2)_
  **Jawab (26 Nov):** S.P. / Sopo = Super, SS = Sujni, Semi F = Semi Flat.
- [ ] **Q2.** 1½ aur 2 number S.P. rate list mein nahi hain. Inhe rate list mein jodna hai? _(P1)_
- [ ] **Q3.** Handwriting confirm: 6 Semi dhaga 020 ya 021? 1½ S.P. dhaga 217 ya 247? 6 Munga moti 060 ya 080? 3 Semi ke do dhaga value (070, 080): kaunsa kis variant ka? _(P1, P2)_
- [ ] **Q4.** Har item ka frames-per-packet allowance (8mm = 2.8 jaisa) ki list kab milegi? _(V10 · 3:40–3:50)_
- [ ] **Q5.** Kis maal mein kaunsa dhaga type (1×3, 2×2, 3×3, 1×2) lagta hai? _(V6 · 1:26–1:32)_
- [ ] **Q6.** Coating task haath se kaise likhte ho, woh message (saare fields) bhejo. _(V8 · 0:27–0:46)_
  **Status (26 Nov):** message abhi nahi aaya. Yaad dilana hai.
- [x] **Q7.** Slip par "Mahebub Bhai" aur "Tausit/Tausif" dono hain: karigar kaun, contractor kaun? _(P3, V2 · 0:11–0:20)_
  **Jawab (26 Nov):** Mahebub Bhai = MK Plastics ke asli owner ka naam (Zahid bhai se confirm: dono ek hi?). Isliye Tausif = karigar.
- [x] **Q8.** Dhaga g/kg kul wazan (dhaage ke saath) par lagega ya sirf maal ke wazan par? _(V6 · 0:19–0:36)_
  **Jawab (26 Nov):** kul wazan (dhaage ke saath) par. Dhaga = kul kg × g/kg, maal = kul − dhaga.
- [x] **Q9.** Contractor ke workers kaun hain (machine operator, packing, karigar)? Mahina hamesha 30 din ka? _(V13 · 0:00–0:20)_
  **Jawab (26 Nov):** mahina hamesha 30 din (salary ÷ 30). Workers kaun hain: abhi baaki.
- [x] **Q10.** Rate: slip par deal price likhte ho aur invoice par bhi; dono rakhein ya sirf invoice par? _(V1 · 0:31, V11 · 0:35–0:44)_
  **Jawab (26 Nov):** dono. Slip par deal rate (optional) + bill par final rate. v14.1 mein aisa hi hai.
- [x] **Q11.** V11 mein "dispatch ke baad invoice" bola; v9 mein "pehle bill, phir dispatch" tha. Abhi pehle bill, stock dispatch par minus. Kaunsa sahi? _(V11 · 0:24–0:44)_
  **Jawab (26 Nov):** pehle dispatch, phir bill. ⚠️ Flow badalna hai: dispatch (gaadi + packet, stock minus) → phir owner rate daal ke invoice.

## Hisaab (owner ke examples)

- 1 bunch = 1,200 moti. 1 packet = packing (bunch) × 1,200. 8mm: 4 × 1,200 = 4,800 moti.
- Moti per frame = 2 guchha × ladi × moti per ladi. 8mm Semi: 2 × 18 × 50 = 1,800.
- Exact frames per packet = 4,800 ÷ 1,800 = 2.667. Owner allowance 2.8 → 100 packet = 280 frame.
- Rejected bunch = (frames used × moti/frame − packets × moti/packet) ÷ 1,200.
- Dhaga = kg × gram per kg (register P1). Example: 1 kg @ 15 g → 985 g maal + 15 g dhaga. 11mm Semi 10 kg @ 12 g = 120 g.
- Contractor wage: salary ÷ 30 per din. ₹18,000 → ₹600; 6 din = ₹3,600 − ₹500 kharchi = ₹3,100.

## Media index

| Ref | File | Length | Topic |
|---|---|---|---|
| V1 | WhatsApp Ptt 2026-11-23 at 13.31.28 | 1:01 | Order slip ka format, slip number, priority |
| V2 | WhatsApp Ptt 2026-11-23 at 13.33.41 | 1:27 | Karigar return slip, grade, cut → waste |
| V3 | WhatsApp Ptt 2026-11-24 at 15.47.39 | 0:16 | Dhaga register kya hai (photo P1) |
| V4 | WhatsApp Ptt 2026-11-24 at 15.49.48 | 1:09 | Pirai data: ladi, guchha, frame, moti (photo P2) |
| V5 | WhatsApp Ptt 2026-11-24 at 15.50.15 | 0:21 | Standard bunch = 1200 moti, guchha alag |
| V6 | WhatsApp Ptt 2026-11-24 at 15.52.20 | 1:51 | Dhaga ka hisaab, dhaga stock, stock movement |
| V7 | WhatsApp Ptt 2026-11-24 at 15.53.04 | 0:16 | Return entry slip ke hisaab se |
| V8 | WhatsApp Ptt 2026-11-24 at 15.54.09 | 0:47 | Line routing, coating task ke fields |
| V9 | WhatsApp Ptt 2026-11-24 at 16.02.14 | 0:16 | Pehle Pearl, Metal coating baad mein |
| V10 | WhatsApp Ptt 2026-11-24 at 16.06.54 | 4:33 | Daily entry, frames/packets, rejected bunch |
| V11 | WhatsApp Ptt 2026-11-24 at 16.07.57 | 0:45 | Owner tab, dispatch, invoice par rate |
| V12 | WhatsApp Ptt 2026-11-24 at 16.08.28 | 0:28 | Pearl line poori karo, link share karo |
| V13 | WhatsApp Ptt 2026-11-24 at 16.13.58 | 1:34 | Contractor login, salary, attendance, kharchi |
| P1 | image.png (dhaga register) | — | Har maal: 1 kg pirai mein kitne gram dhaga |
| P2 | WhatsApp Image 2026-11-24 at 15.48.36 | — | Har maal: ladi, guchha, moti |
| P3 | WhatsApp Image 2026-11-23 at 13.32.12 | — | Karigar slip: Mahebub Bhai / Tausit, 3 No Semi 40.400, cut 0.800, Salman |
| P4 | WhatsApp Image 2026-11-23 at 13.30.24 | — | Order slip No 223: Zahid bhai, Moti 3mm, Rani Gulabi / Green / Maroon 200 each |
