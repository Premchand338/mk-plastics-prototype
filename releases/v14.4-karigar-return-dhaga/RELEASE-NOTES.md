# v14.4 · Section 3 + 4: Karigar se wapas lena + Dhaga stock

**Date:** 26 Nov 2026 · **Line:** Pearl · **File:** `mk-prototype-v14.4.html` (v14.1–v14.3 bhi andar)
**Source:** V2, V3, V6, V7 · photos P1 (dhaga register), P3 (karigar slip) · jawab Q7, Q8

## Section 3: Karigar se wapas lena

| # | Check | App mein |
|---|---|---|
| 3.1 | Return slip jaisa | Upar: Karigar · Item · Challan. Fields: **Tareekh**, **Maal kisne liya** (receiver, jaise Salman), frame + khule guchha, **Kul wazan dhaage ke saath**, **Cut**, loose. Karigar list mein **Tausif bhai** (Q7). |
| 3.2 | Grade zaroori | **1st / 2nd / 3rd**. Bina grade save nahi hota ("Grade chuno"). |
| 3.3 | Dhaga master (g/kg) | P1 ki **34 lines**, har line rate list ke item se judi. Rate list → **Dhaga (gram / kg)**. Sab editable. |
| 3.4 | Dhaga apne aap | Dhaga = **kul wazan × g/kg** (Q8). P3 example: 40.400 kg × 70 g = **2.828 kg** dhaga, maal **37.572 kg**. g/kg form mein badal bhi sakte ho. |
| 3.5 | Stock | Moulded maal bhejte waqt minus (pehle se), threaded lot plus (frame → bunch), **dhaga stock minus**. |
| 3.6 | Cut → waste, usi grade | Cut **raw material type ke waste** mein judta hai (regrind ho sake), aur Waste page par **"Pirai ka cut · grade ke hisaab se"** (1st / 2nd / 3rd). |

## Section 4: Dhaga stock

| # | Check | App mein |
|---|---|---|
| 4.1 | Dhaga section | Stock → **Dhaga** tab: 1×3, 2×2, 3×3, 1×2 (naam badal / naya type jod sakte ho). **Dhaga aaya** (inward / opening), **Ginti**, aana-jaana list. |
| 4.2 | Item ke saath dhaga type | Q5 abhi baaki, isliye guess nahi: pehli return par type chuno, **"Is item ke liye yaad rakho"**; agli baar apne aap. Rate list mein bhi badal sakte ho. |
| 4.3 | Auto minus + alert | Return par dhaga minus. Bell: reorder se kam → "dhaga kam" (peela); minus mein → laal. Reorder 0 aur stock 0 = abhi use nahi, alert nahi. |

## Confirm baaki (editable, "confirm baaki" laga)

- **Q3a** 6 Semi: 020 ya 021? (abhi 21) · **Q3b** 1½ S.P.: 217 ya 247? (abhi 247) · **Q3d** 3 Semi ke do value: 070 → 60B, 080 → 56B maana, sahi hai?
- **Q5** kis maal mein kaunsa dhaga: return par chuno, app yaad rakhega.
- P1 mein 1½ aur 2 S.P. hain, rate list mein nahi (Q2).

## Test result

- `npm test` (5 files, desktop + 390px phone): smoke ke numbers same (58 · 10.4 · ₹3,068 · 580 → 330).
  Smoke test badla, wajah owner ka V6 + Q8: pehle dhaga = bunch × 0.02 kg tha, ab kul wazan × g/kg (3 Semi = 70 g). Isliye kul wazan **107.53 kg** (pehle 130.1): 107.53 − 7.527 dhaga = 100 kg maal = jitna bheja, baaki sab same. Grade 1st aur dhaga 1×2 bhi chunta hai.
- `tests/karigar-return.js` (naya, 36 checks): P3 slip replay → dhaga 2.828, maal 37.572, stock 10 → 7.172, cut 0.800 → Semi waste 1st grade, grade / dhaga type zaroori, type yaad, alerts, Q3a edit, type rename.

## Agla

Section 5 (line routing + coating task form; 5.3 owner ke message ka intezaar, Q6) ya Section 6 (packets → frames, 1 bunch = 1,200 moti ab ready hai).
