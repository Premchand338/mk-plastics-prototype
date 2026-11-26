# v14.6 · Section 7: Roz ki production entry

**Date:** 26 Nov 2026 · **Line:** Pearl · **File:** `mk-prototype-v14.6.html` (v14.1–v14.5 bhi andar)
**Source:** V10 (0:13–1:48), V11 (0:00–0:16) · faisla (26 Nov): **dono tareeke rakho**, reject bunch **waste mein**

## Kya badla

| # | Check | App mein |
|---|---|---|
| 7.1 | Entry agle din | Coating entry mein sabse upar **"Kis din ka kaam? (work date)"**, pehle se **kal** ki tareekh. Har entry ke saath save. |
| 7.2 | Operator ke inputs | **Frames use hue** + **Kitne packet bane (task ke against)**. Task progress: "Task #1 · 200 frame target · Pehle 60 + aaj 40 = 100 · Baaki 100". Target se 1–2 upar-neeche theek; 2 se zyada par warning. |
| 7.3 | Rejected bunch apne aap | Packet daalte hi: (frames × moti/frame − packets × moti/packet) ÷ 1,200. Example 3MM Semi: (3,60,000 − 3,00,000) ÷ 1,200 = **50 bunch**. Approval par **Waste → "Coating reject"** mein (kg + bunch). Packet frames se zyada ho toh save nahi. Task card par kul: "Frames use hue 100 / 200 · 8 packet · reject 60 bunch"; frames khatam toh "Frames khatam". |
| 7.4 | Owner tab | Tasks page par **"Operator ki entry · work date"**: din ke hisaab se operator, task, frame, packet, reject, haalat. |

## Dono tareeke (aapka faisla)

- **Packet bhara** (owner ka tareeka): stock mein **packet × packing** judta hai; baaki moti = reject → waste.
- **Packet khaali** (purana tareeka): pehle jaisa: "Coat + pack hue (frame)" × bunch/frame stock mein, "Reject (frame)" waste mein nahi.
- Stock sirf admin approval par badalta hai (pehle jaisa).

## Test result

`npm test` (7 files, desktop + 390px phone) pass. Smoke ke numbers same (58 · 10.4 · ₹3,068 · 290 → 40): smoke purane tareeke (packet khaali) se chalta hai.
Naya `tests/daily-entry.js` (24 checks): work date kal, 60 frame + 5 packet → 50 bunch reject, 7 packet block, purana tareeka 38 × 5 = 190, approval: stock 440, waste 0.85 kg, lot 1,500, task card, owner tab, target se zyada warning.

## Owner se poochna

- Coating reject ka kya hota hai: dobara coating, regrind ya bech dete hain?
- Work date hamesha "kal" hi hoti hai, ya kabhi 2–3 din purani bhi?
