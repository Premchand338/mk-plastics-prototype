# v14.5 · Section 6: Coating task, packet se frame

**Date:** 26 Nov 2026 · **Line:** Pearl · **File:** `mk-prototype-v14.5.html` (v14.1–v14.4 bhi andar)
**Source:** V10 (1:48–4:33) · photo P2

## Kya badla

| # | Check | App mein |
|---|---|---|
| 6.1 | Bunch = 1,200 moti | 1 packet = packing × 1,200 moti. 8mm: 4 × 1,200 = **4,800 moti**. |
| 6.2 | Moti / frame register se | P2 spec se: 8mm Semi = 2 × 18 × 50 = **1,800 moti**. |
| 6.3 | Exact frame / packet | App khud: 4,800 ÷ 1,800 = **2.667**. Rate list mein har item ke saath "P2" likha, read-only (spec badlo toh yeh badlega). |
| 6.4 | Owner allowance | Rate list → Badlo → **Allowance** (jaise 8mm = **2.8**, V10). Task: 100 packet × 2.8 = **280 frame**. Allowance khaali ho toh exact se. |
| 6.5 | Target saaf | Task form: "Is item ka hisaab" box + neeche **Target 280 frame · 100 packet**. Task card: **"280 frame ka target · 100 packet × 2.8 (allowance)"**. Order se task: kam packet × allowance (10 packet → 28 frame). |

## ⚠️ Numbers badle (jaan-boojh kar)

Pehle har item ke liye **1 frame = 10 bunch** maana tha ("abhi andaaza"). Ab register se: 3MM Semi ka frame = 2 × 30 × 100 = 6,000 moti = **5 bunch**. Isliye smoke test mein:

| | Pehle | Ab |
|---|---|---|
| Coating ke baad taiyaar stock | 580 bunch | **290 bunch** (58 frame × 5) |
| Dispatch ke baad | 330 bunch | **40 bunch** (290 − 250) |
| Coating mein bacha | 905 bunch | **1,205 bunch** |
| Auto packed · rate · bill | 58 · 10.4 · ₹3,068 | same |

Smoke test ab in numbers ko **check bhi karta hai** (pehle sirf print karta tha), badle toh fail.

Jin items ka P2 spec nahi (jaise 6MM Semi, 8MM Super) woh purane tareeke se ("data baaki" / default frame) chalte hain.

## Owner se baaki

- **Q4** · baaki items ka allowance: abhi sirf 8mm Semi = 2.8. Baaki par exact lagta hai aur form mein "Allowance abhi nahi (Q4)" dikhta hai.
- P2 mein 6MM Semi aur 8MM Super ki line nahi hai: unka spec chahiye.

## Test result

`npm test` (6 files, desktop + 390px phone) sab pass. Naya `tests/frames.js` (27 checks): 2.667 exact, 2.8 allowance, 100 → 280, frame se packet (300 → 107), allowance na ho toh exact (7 → 70), owner allowance 10.5 (7 → 74), spec / bunch badle toh exact badle, order se task (10 → 28).
