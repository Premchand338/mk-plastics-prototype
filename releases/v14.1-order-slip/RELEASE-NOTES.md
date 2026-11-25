# v14.1 · Section 1: Order slip

**Date:** 25 Nov 2026 · **Line:** Pearl · **File:** `mk-prototype-v14.1.html` (one file, sab kuch andar)
**Source:** client review 23–24 Nov (V1, V11, P4) · checklist `docs/client-review-2026-11-24.md` § 1

## Kya badla (checklist ke hisaab se)

| # | Check | Kya bana | Kahan dekho |
|---|---|---|---|
| 1.1 | Order form slip jaisa | Slip no., Tareekh, Party, Item ka naam (Moti), Size, Rang, Packet, Transport, Rate/deal, Sign | Orders → **Naya order** |
| 1.2 | Ek slip, kai rang | Ek item ke andar **Aur rang** → har rang ki alag packet. Ek slip mein kai size bhi (**Aur item**). Ek hi rang do baar likha toh jod ke ek line. | Naya order |
| 1.3 | Slip number series | Pehla number **224** (book 223 par thi). Har slip ke baad +1. **Agla slip #…** button se owner badal sake. Same number dobara nahi chalega. Purana number (jaise 220) daalo toh series peeche nahi jaati. | Orders page, upar right |
| 1.4 | Pehla order pehle | Chalu orders sabse purane slip number se upar, **1, 2, 3** priority badge. Coating task (admin + staff "Mere task") bhi isi kram mein. | Orders → Sab · Tasks |
| 1.5 | Transport | Kahan se (default Bhiwandi) → Kahan tak (party ka shehar apne aap, badal sakte ho). Slip, order, bill aur invoice par dikhta hai. | Naya order |
| 1.6 | Naye rang | **Rani Gulabi, Green** SR list mein (Maroon pehle se tha). | Rate list → Rang ki list |
| 1.7 | Order vs bana hua | Naya tab **Party-wise**: har party, har slip, har rang: Order / Bane / Baaki packet. Pura hone par **Ready to dispatch** + Bill banao button. Taiyaar stock purane slip ko pehle milta hai, do order ek hi packet nahi ginte. | Orders → Party-wise |
| 1.8 | Rate invoice ke time | Bill banao mein har item ka **Rate ₹ / bunch** box. Ek rang ka rate badlo toh usi item ke baaki rang bhi badalte hain. Badla hua rate log mein likha jaata hai. | Order → Bill banao |

**Slip dekho:** order kholo → **Slip dekho** → book jaisa paper (No., tareekh, party, transport, rang-wise packet, kul, sign).

## Data (developer ke liye)

- Order mein ab bhi **har rang ki ek line** hai, isliye bill, coating task, dispatch aur stock ka code nahi badla.
- Naya: `o.slip = {date, from, to, item, sign}`, `line.g` (slip par item group), `line.deal` (slip par likha rate), `S.seq.slip` (agla slip number).
- `initV14()` purane saved orders ko slip header deta hai (`legacy: true`); woh priority mein sabse upar aate hain kyunki woh purane hain.
- Order status "Ready" ab priority allocation se: stock pehle purane slip ko.
- Code: `js/10-v14-order-slip.js`, `css/05-v14.css`. Test: `tests/slip.js` (24 checks × phone + desktop).

## Test result

- `npm test` → smoke: auto packed 58, rate 10.4, bill MK/26-27/0001 ₹3,068, ready stock 580 → 330, koi error nahi, koi sideways scroll nahi (desktop + 390px phone). Numbers same rahe.
- `tests/slip.js` → Section 1: all checks passed (desktop + phone).

## Abhi khula (owner se poochna hai)

- **Q10** · Rate slip par bhi aur invoice par bhi? Abhi dono jagah hai: slip par optional deal rate, bill par final rate.
- **Q11 (naya)** · V11 mein "dispatch ke baad invoice" bola, lekin v9 mein owner ne "pehle bill, phir dispatch" kaha tha. Abhi flow wahi hai (pehle bill, stock dispatch par minus). Kaunsa sahi?
- Credit limit abhi bhi lagti hai: 600 packet ka slip (₹3.12 lakh) chhoti party par **Phir bhi order lo (Admin)** maangega.
