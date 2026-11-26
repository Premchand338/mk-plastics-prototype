# v14.7 · Section 5: Line routing + coating task ke box

**Date:** 26 Nov 2026 · **File:** `mk-prototype-v14.7.html` (v14.1–v14.6 bhi andar)
**Source:** V8, V9, V12 · Q6 (owner ka message abhi nahi aaya)

## Kya badla

| # | Check | App mein |
|---|---|---|
| 5.1 | Pearl ka maal Pearl mein, Metal ka Metal mein | Pehle se bana tha, ab **test se pakka**: Black PP (Metalizing raw material) → moulding task Metalizing line → moulded stock Metalizing → karigar challan "Metalizing" → threaded lot → **"Move to Metalizing"** → sirf **MZ1** ko dikhta hai, P1 / P2 ko nahi. Coating task form par machine ke neeche: "Metalizing line · sirf Metalizing raw material ka maal (1 lot coating mein)". |
| 5.2 | Pehle Pearl poori | Koi badlav nahi. Metal coating ki requirement owner baad mein batayega. |
| 5.3 | Owner ke format ke box | Owner ka message (Q6) abhi nahi aaya, isliye **guess nahi kiya**. Coating task form mein **"Task ke box"**: owner khud box jodta hai (Number / Likhne ka / Tick, unit ke saath). Naye task mein dikhte hain, task card par value. Jaise: "Lacquer: 2.5 kg · Hardener mila: Haan". Message aate hi wahi box yahan jod do, code nahi badlega. |

## Bug fix (test se mila)

Karigar return: jis maal ka **pirai spec nahi** (jaise Black PP), uske form mein **grade ka box hi nahi aata tha**, aur grade zaroori hai, toh **return save hi nahi hota tha**. Ab grade hamesha dikhta hai.

## Test result

`npm test` (8 files, desktop + 390px phone) pass, smoke ke numbers same (58 · 10.4 · ₹3,068 · 290 → 40).
Naya `tests/routing.js` (18 checks): Metalizing ka poora raasta, P1 ko lot nahi dikhta, MZ1 ko dikhta hai; box jodna / hatana, task aur card par value, staff box nahi badal sakta.
