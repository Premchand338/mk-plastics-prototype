# Progress · client review fixes (Pearl line)

Last updated: 25 Nov 2026 · Branch: `claude/bold-pasteur-hc1dru` · Checklist: `docs/client-review-2026-11-24.md`

## Status

| Section | Checks | Status | Release | Code |
|---|---|---|---|---|
| 1 · Order slip | 1.1–1.8 | ✅ Done, owner test baaki | [v14.1](../releases/v14.1-order-slip/) · https://claude.ai/artifact/3b81iMAGmvTXbEhwSSz414 | `js/10-v14-order-slip.js`, `css/05-v14.css`, `tests/slip.js` |
| 1 fix · Dispatch → bill (Q11) | 1.8 | ⏭ Next (v14.2) | – | – |
| 2 · Karigar ko pirai ke liye bhejna | 2.1–2.4 | Uske baad | – | – |
| 3 · Karigar se wapas lena | 3.1–3.6 | Baaki | – | – |
| 4 · Dhaga stock | 4.1–4.3 | Baaki | – | – |
| 5 · Line routing + coating task form | 5.1–5.3 | Baaki (5.3 owner ke message ka intezaar, Q6) | – | – |
| 6 · Packets → frames | 6.1–6.5 | Baaki (allowance list Q4) | – | – |
| 7 · Daily production entry | 7.1–7.4 | Baaki | – | – |
| 8 · Contractor + workers | 8.1–8.6 | Baaki (Q7, Q9) | – | – |
| 9 · Delivery | 9.1 | Har release ke saath link | – | – |

## Process (har section ke liye same)

1. Checklist ka section padho + source (V/P) + register CSV.
2. Naya layer file: `js/1N-v14-<topic>.js` (+ CSS agar chahiye), `index.html` mein `99-boot.js` se pehle. Data upgrade ho toh `initV14…()` ko extend karo / `seed()` wrap karo.
3. Owner ke khule sawaal (Q1–Q11) ke values **guess nahi**: UI mein editable rakho.
4. Section ka test: `tests/<topic>.js` (phone 390px + desktop), `package.json` ke `test` mein jodo.
5. `PW_CHROMIUM=/opt/pw-browsers/chromium npm test` (cloud) / `npm test` (local). Smoke numbers same: 58 · 10.4 · ₹3,068 · 580 → 330.
6. `node tools/release.js v14.N <slug>` → `RELEASE-NOTES.md`, `OWNER-TEST.md`, `screenshots/` (phone light + desktop dark, 2×) → `releases/README.md` mein row.
7. Checklist mein `[x]` + status line, yeh file update, commit, push, link publish.

## Section 2 ke liye notes (next)

- 2.1 Pirai spec master: `docs/register-pirai-P2.csv` (31 lines: ladi/guchha, guchha/frame = 2, moti/ladi). `unclear` rows editable + "confirm baaki" mark.
- 2.2 Karigar send challan par spec: jaise 8mm Semi = 18 ladi ka guchha, 2 guchha = 1 frame (36 ladi), 50 moti/ladi.
- 2.3 "Bunch" = 1,200 moti (standard). Karigar se guchha/frame aata hai; app mein "Kitne bunch aaye" ki jagah guchha/frame. ⚠️ Smoke test karigar return mein `#rb` (bunch) bharta hai: field badla toh test update karna padega aur wajah likhni padegi.
- 2.4 Naye items: No 6 B.H.L. (Big Hole), Semi F (Q1: Semi F kya hai?).
- Karigar code: `karSendModal`, `karRecvModal`, `FORMS.karSend`, `FORMS.karRecv` (04-v8 + baad ke layers, sab files mein search karo).

## Owner ke jawab (26 Nov)

- **Q11 → pehle dispatch, phir bill.** v14.1 abhi "pehle bill" hai: agla kaam isko palatna (v14.2). Stock dispatch par hi minus (CLAUDE rule 5 theek). Smoke test ka order (bill → dispatch) badlega: wajah = owner ka Q11 jawab.
  - Dispatch ke turant baad invoice ke buttons: **Invoice dekho · PDF download · WhatsApp share**.
  - Dispatch hua, bill nahi bana → owner home + bell par "Bill banana baaki", din ki limit editable (default 2 din).
  - Credit limit: dispatch par rokna ya sirf bill par warning: **owner ne abhi tay nahi kiya**, isliye setting rakho (default: warning).
- Q10 → slip + bill dono par rate (jaisa hai).
- Q1 → S.P./Sopo = Super, SS = Sujni, Semi F = Semi Flat.
- Q7 → Mahebub Bhai = Zahid bhai ke father (owner), Zahid bhai = beta (business chalate hain). Tausif = karigar.
- Q8 → dhaga kul wazan (dhaage ke saath) par.
- Q9 → mahina = 30 din.
- Baaki: Q2, Q3, Q4, Q5, Q6, Q9 (workers kaun).

## Khule sawaal (owner)

Q1–Q11 checklist ke end mein. Sabse zaroori abhi: **Q10** (rate slip par bhi?), **Q11** (bill dispatch se pehle ya baad?), **Q1/Q3** (P2 register ke unclear rows, Section 2 ke liye).
