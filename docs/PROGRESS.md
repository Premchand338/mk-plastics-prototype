# Progress · client review fixes (Pearl line)

Last updated: 26 Nov 2026 · Branch: `claude/bold-pasteur-hc1dru` · Checklist: `docs/client-review-2026-11-24.md`

## Status

| Section | Checks | Status | Release | Code |
|---|---|---|---|---|
| 1 · Order slip | 1.1–1.8 | ✅ Done, owner test baaki | [v14.1](../releases/v14.1-order-slip/) · https://claude.ai/artifact/3b81iMAGmvTXbEhwSSz414 | `js/10-v14-order-slip.js`, `css/05-v14.css`, `tests/slip.js` |
| 1 fix · Dispatch → bill (Q11) | 1.8 | ✅ Done, owner test baaki | [v14.2](../releases/v14.2-dispatch-bill/) | `js/11-v14-dispatch-bill.js`, `tests/dispatch.js` |
| 2 · Karigar ko pirai ke liye bhejna | 2.1–2.4 | ✅ Done, owner test baaki | – | – |
| 3 · Karigar se wapas lena | 3.1–3.6 | ✅ Done (v14.4), owner test baaki | – | – |
| 4 · Dhaga stock | 4.1–4.3 | ✅ Done (v14.4), owner test baaki | – | – |
| 5 · Line routing + coating task form | 5.1–5.3 | Baaki (5.3 owner ke message ka intezaar, Q6) | – | – |
| 6 · Packets → frames | 6.1–6.5 | Baaki (allowance list Q4) | – | – |
| 7 · Daily production entry | 7.1–7.4 | ✅ Done (v14.6), owner test baaki | – | – |
| 8 · Contractor + workers | 8.1–8.6 | ⏭ Next (Q9: workers kaun) | – | – |
| 9 · Delivery | 9.1 | Har release ke saath link | – | – |

## Process (har section ke liye same)

1. Checklist ka section padho + source (V/P) + register CSV.
2. Naya layer file: `js/1N-v14-<topic>.js` (agla: `16-v14-…`) (+ CSS agar chahiye), `index.html` mein `99-boot.js` se pehle. Data upgrade ho toh `initV14…()` ko extend karo / `seed()` wrap karo.
3. Owner ke khule sawaal (Q1–Q11) ke values **guess nahi**: UI mein editable rakho.
4. Section ka test: `tests/<topic>.js` (phone 390px + desktop), `package.json` ke `test` mein jodo.
5. `PW_CHROMIUM=/opt/pw-browsers/chromium npm test` (cloud) / `npm test` (local). Smoke numbers: 58 · 10.4 · ₹3,068 · 290 → 40 (v14.5 se; test khud check karta hai).
6. `node tools/release.js v14.N <slug>` → `RELEASE-NOTES.md`, `OWNER-TEST.md`, `screenshots/` (phone light + desktop dark, 2×) → `releases/README.md` mein row.
7. Checklist mein `[x]` + status line, yeh file update, commit, push, link publish.

## Agle section ke notes

- **Section 7: done (v14.6).** Pehle ke notes: 7.1 work date (agle din entry), 7.2 operator: frames used + packets bane (task ke against), 7.3 rejected bunch = (frames × moti/frame − packets × moti/packet) ÷ 1,200 → `mpf14(spec)` aur `r.pack × mpb14()` (v14.5 ready), 7.4 owner tab: operator-wise frames / packets / task progress. Coating entry = v9 `entryModal` + `LIVE.coatEntry9` + v13 wrapper (`withBpf`). Smoke test coating entry (#f-in 60, #f-rej 2, auto 58) ka dhyan.
- **Section 5:** 5.1 line routing check, 5.3 owner message (Q6).
- **Section 8 (next):** naya role Contractor (login), worker master (naam, salary), per day = salary ÷ 30 (Q9), roz attendance, kharchi (date + amount), on-the-spot hisaab (6 din × ₹600 − ₹500 = ₹3,100). Roles: `03-v7-roles.js` (admin + staff), users `S.users`, login `01-core.js`.
- Frames: `r.fpp` = exact frame/packet (P2, `syncFpp14`), `r.alw` = owner allowance, `taskFpp14(it)` = task ke liye.

## Owner ke jawab (26 Nov)

- **Q11 → pehle dispatch, phir bill.** v14.1 abhi "pehle bill" hai: agla kaam isko palatna (v14.2). Stock dispatch par hi minus (CLAUDE rule 5 theek). Smoke test ka order (bill → dispatch) badlega: wajah = owner ka Q11 jawab.
  - Dispatch ke turant baad invoice ke buttons: **Invoice dekho · PDF download · WhatsApp share**.
  - Dispatch hua, bill nahi bana → owner home + bell par "Bill banana baaki", din ki limit editable (default 2 din).
  - **Rate dispatch screen par hi** (slip ke rate se pehle se bhara, badal sakte ho) → dispatch save hote hi invoice ban jaaye.
  - **PDF:** "PDF download" = browser ka print → Save as PDF (prototype mein server nahi). WhatsApp: message + invoice summary taiyaar khulega, PDF haath se attach.
  - **Dispatch screen par do option (customizable):** "Abhi bill banao" (rate bharo → turant invoice) ya **"Bill baad mein"** (sirf dispatch, rate baad mein). Default option Settings se owner chune; har dispatch par badal bhi sakte ho.
  - "Bill baad mein" wale dispatch → Orders mein "Bill banana baaki" list → owner final rate bhare → invoice banao (dekho · PDF · WhatsApp). Din ki limit (default 2) ke baad bell mein alert.
  - **Tareekh:** invoice par **dispatch ki tareekh** chhape; system mein **bill banne ki tareekh** alag save ho (report / log ke liye).
  - **Alag bill:** jodna nahi. Har dispatch ka apna bill, aur do orders kabhi ek bill mein nahi.
  - **Sirf owner (admin)** dispatch kar sakta hai aur bill bana sakta hai; staff ko yeh buttons nahi dikhenge.
  - Credit limit: dispatch par rokna ya sirf bill par warning: **owner ne abhi tay nahi kiya**, isliye setting rakho (default: warning).
- Q10 → slip + bill dono par rate (jaisa hai).
- Q1 → S.P./Sopo = Super, SS = Sujni, Semi F = Semi Flat.
- Q7 → Mahebub Bhai = Zahid bhai ke father (owner), Zahid bhai = beta (business chalate hain). Tausif = karigar.
- Q8 → dhaga kul wazan (dhaage ke saath) par.
- Q9 → mahina = 30 din.
- Baaki: Q2, Q3, Q4, Q5, Q6, Q9 (workers kaun).

- CA se poochna: "Bill baad mein" se invoice number aur tareekh ka kram ulta ho sakta hai (v14.2 notes).

## Jawab (26 Nov, v14.3 ke baad)

- Karigar kabhi kabhi khule guchha bhi deta hai → "Khule guchha" box rahega.
- Frame ka andaaza lagbhag sahi → waisa hi.
- Section 3 + 4 ek saath (v14.4): return form ek hi baar badlega.

## Jawab (26 Nov, v14.4 ke baad)

- Dhaga g/kg hamesha register (P1) wala → form mein register ka value (jaisa hai).
- Cut ka grade alag ya wahi: abhi poocha nahi (abhi maal wala grade).
- Agla: Section 6.

## Jawab (26 Nov, v14.5 ke baad)

- Allowance: Zahid bhai baaki items ki list bhejenge (Q4) → aate hi rate list mein.
- 6MM Semi / 8MM Super ka pirai spec: abhi poocha nahi.
- Agla: Section 7.

## Faisla (26 Nov, Section 7)

- Coating entry mein dono tareeke rakhe (packet bhara = owner ka; khaali = purana frame wala).
- Reject bunch (owner ka hisaab) → Waste "Coating reject".

## Khule sawaal (owner)

Q1–Q11 checklist ke end mein. Sabse zaroori abhi: **Q10** (rate slip par bhi?), **Q11** (bill dispatch se pehle ya baad?), **Q1/Q3** (P2 register ke unclear rows, Section 2 ke liye).
