# v14.2 · Pehle dispatch, phir bill

**Date:** 26 Nov 2026 · **Line:** Pearl · **File:** `mk-prototype-v14.2.html`
**Source:** Zahid bhai ke jawab 26 Nov (Q11 + follow-ups) · `docs/PROGRESS.md`

## Kya badla

| Owner ne kaha | App mein |
|---|---|
| Pehle dispatch, phir bill | Order / Party-wise / Dispatch page par ab **Dispatch karo** (pehle "Bill banao" tha). Stock dispatch par hi minus. |
| Rate dispatch screen par | Har item ka rate box, slip ke rate se bhara. Ek rang ka rate badlo toh usi item ke baaki rang bhi. |
| Bill abhi ya baad mein (customizable) | Dispatch screen par **Abhi bill banao** / **Bill baad mein**. Pehle se kaunsa chuna ho, owner **Bill setting** (Orders page) mein tay kare. |
| Bill baad mein → final rate | Orders → **Bill banana baaki** → Bill banao → final rate → invoice. Kitne din se baaki, saath mein dikhta hai. |
| Turant dekho, PDF, WhatsApp | Invoice par **WhatsApp** (bill ka summary taiyaar message) aur **PDF download** (browser print → Save as PDF; file ka naam = bill number, jaise `MK-26-27-0001.pdf`). |
| Invoice par dispatch ki tareekh | Bill ki tareekh = dispatch ki tareekh. Paper par **Dispatch** block: tareekh + gaadi number. |
| System mein bill ki tareekh | `billedAt` alag save; invoice ke neeche "Bill bana 28 Nov" pill. |
| Har order ka alag bill | Har dispatch ka apna bill; do orders kabhi ek bill mein nahi. |
| Sirf owner | Dispatch aur bill ke buttons / forms sirf admin ke liye. |
| Yaad dilana | Bill **2 din** (setting) se zyada baaki → bell mein laal alert. Wahi dispatch bell mein do baar nahi dikhta. |
| Credit limit (tay nahi) | Setting: **Sirf warning** (default) ya **Dispatch roko** (owner tick karke bhej sake). |

Purana data: v14.1 tak jo bill ban gaye the par dispatch nahi hue, unke liye purana "Dispatch karo" button chalta rahega.

## Test result

- `npm test` (3 files, desktop + 390px phone):
  - smoke: auto packed 58, rate 10.4, bill MK/26-27/0001 ₹3,068, ready stock 580 → 330, koi error / sideways scroll nahi. **Numbers same.** Test ka kram badla (bill → dispatch ki jagah dispatch + bill ek step mein), wajah: owner ka Q11 jawab.
  - `tests/slip.js`: Section 1 checks pass (1.8 rate ab dispatch screen par).
  - `tests/dispatch.js` (naya, 31 checks): bill baad mein + 3 din purana dispatch → alert → final rate ₹9 → invoice 23 Nov ka, bill bana 26 Nov; PDF; WhatsApp; setting; credit block; staff ko mana; alag bill.

## Dhyan do

- **GST:** invoice number bill banne ke kram mein aata hai, tareekh dispatch ki. "Bill baad mein" se kabhi number 0005 ki tareekh 0004 se pehle ho sakti hai. CA se poochna: chalega ya number bhi dispatch ke kram mein chahiye?
- WhatsApp prototype mein sirf message bhejta hai; PDF haath se attach. Asli app mein PDF apne aap jaa sakti hai (server chahiye).
