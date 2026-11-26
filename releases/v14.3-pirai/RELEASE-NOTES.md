# v14.3 · Section 2: Karigar ko pirai ke liye bhejna

**Date:** 26 Nov 2026 · **Line:** Pearl · **File:** `mk-prototype-v14.3.html` (v14.1 + v14.2 bhi andar)
**Source:** V4, V5, V6 · photo P2 (`docs/register-pirai-P2.csv`) · Q1 jawab

## Kya badla

| # | Check | App mein | Kahan |
|---|---|---|---|
| 2.1 | Pirai spec master | P2 register ki **31 lines**: ladi / guchha, guchha / frame (2), moti / ladi → moti / frame apne aap. Har line rate list ke item se judi (4 Semi ki do lines → 34B aur 28B). **Har value badal sakte ho**; naya spec bhi jod sakte ho. | Rate list → **Pirai spec** |
| 2.2 | Challan par spec | Bhejte waqt maal se spec apne aap chunta hai (badal bhi sakte ho). "Guchha kaise banana hai" box: 18 ladi = 1 guchha · 2 guchha = 1 frame (36 ladi) · 50 moti / ladi · 1,800 moti / frame. Andaazan kitne frame wapas aayenge (kg × bunch/kg × 1,200 ÷ moti/frame). Challan paper par bhi yahi. | Karigar → Karigar ko bhejo → Challan |
| 2.3 | "Bunch" ka sahi matlab | 1 bunch = **1,200 moti** (badal sakte ho). Wapas lete waqt **"Kitne frame aaye" + "Khule guchha"**; app moti aur bunch khud nikaalta hai. Karigar page par "Frame aaye". | Karigar → Wapas lo |
| 2.4 | Naye items | **6 B.H.L.** (Big Hole) aur **6 Semi Flat** (Semi F) rate list mein (No 36, 37). Rate / packing abhi khaali: owner bharega. | Rate list |

**Saath mein fix:** rate list ke naam mein bunch/kg gol ho raha tha: 8mm Semi ke dono item "4B" dikhte the. Ab **3.5B** aur **4.25B**, order slip mein sahi item chun sakte ho.

## Confirm baaki (editable rakha, guess nahi kiya)

- **Q3c** · 6 Munga moti / ladi: 060 ya 080? Abhi 080, "confirm baaki" laga hai. Owner bataye toh Rate list → Pirai spec → 6MM Munga → Badlo.
- P2 ke 6 items rate list mein nahi: 7 S.P., 6 / 9 / 11 SS, (aur Q2: 1½ / 2 S.P.). Spec hai; rate list mein jodna hai ya nahi, owner bataye.
- **H.R.** ka poora naam register mein nahi (rate list mein "HR / Half Round" maana).

## Test result

- `npm test` (4 files, desktop + 390px phone): smoke ke numbers same (58 · 10.4 · ₹3,068 · 580 → 330). Smoke test mein karigar return ab **301 frame** daalta hai (pehle 1,505 bunch): 301 × 6,000 moti (3MM Semi, P2) = 1,505 bunch. Wajah: owner ka V5 (bunch = 1,200 moti, karigar frame mein deta hai).
- `tests/pirai.js` (naya, 30 checks): P2 master, 8mm Semi send → 23 frame andaaza, challan, 20 frame + 3 guchha → 38,700 moti → 32 bunch, spec na ho toh warning, row 24 confirm, 1 bunch editable, naam 3.5B / 4.25B.

## Agla (Section 3)

Karigar return slip jaisa (P3): grade zaroori, kul wazan, cut → waste, dhaga g/kg (P1) se apne aap (Q8: kul wazan par).
