# MK Plastics · Beads Bazaar — Prototype

Inventory aur production app ka clickable prototype: moulding → karigar (pirai) → Pearl / Metalizing coating → order → bill → dispatch. Koi server nahi, koi build tool nahi. Sirf HTML, CSS aur plain JavaScript. Saara data browser ke `localStorage` mein rehta hai.

Yeh wahi version hai jo Claude par **Version 14** ke naam se publish hua tha (16 Nov 2026). Isse file-file mein toda gaya hai taaki VS Code mein edit karna aasaan ho. Original aur yeh version ek hi test se check kiye gaye hain, aur dono ke numbers bilkul same aate hain.

## Chalana kaise hai

**Sabse aasaan:** VS Code mein folder kholo → "Live Server" extension install karo (VS Code khud suggest karega) → `index.html` par right-click → **Open with Live Server**. Save karte hi browser apne aap refresh hoga.

**Bina extension ke:** `index.html` ko seedha Chrome / Edge mein double-click karke kholo. Yeh bhi chalega.

Internet chahiye sirf fonts (Google Fonts) aur QR code library (jsDelivr) ke liye. Iske bina bhi app chalega, bas font alag dikhega aur QR nahi banega.

## Demo login

| Kaun | Mobile | PIN |
|---|---|---|
| Owner (Admin) | 9800000001 | 1111 |
| Vinod · M1 Moulding | 9800000020 | 3320 |
| Pramod · M2 Moulding | 9800000021 | 3321 |
| Salman · P1 Pearl | 9800000022 | 3322 |
| P2 Operator · P2 Pearl | 9800000024 | 3324 |
| Hamidur · MZ1 Metalizing | 9800000023 | 3323 |

Upar dark bar mein **Zero reset** dabao toh saara data zero ho jaata hai. Masters (rate list, parties, users) bache rehte hain.

## Folder structure

```
index.html                 sirf markup + files ko sahi order mein load karta hai
css/
  01-base.css              poora design (Pearl & Thread theme, light + dark)
  02-v11-ui.css            tap inputs: chips, toggles, colour swatches, steppers
  03-v12-dashboard.css     admin home dashboard + "Dhyan do" bell
  04-v13.css               raw material by line, shapes, frames per packet
  05-v14.css               order slip (Section 1)
js/
  00-images.js             product photos (base64) — isse mat chhedo
  01-core.js               state, helpers, render, saare screens, modals, login, guide
  02-v5-reports-stock.js   lots, slips, QR, reports, stock count, add stock
  03-v7-roles.js           sirf Admin + Staff roles
  04-v8-production-flow.js naya production flow: task, entry, approval, karigar, coating
  05-v9-owner-changes.js   rate list (35 items), coating tasks, orders, bill → dispatch, Hindi
  06-v10-raw-material.js   raw material list, Stock jodo units
  07-v11-ui-layer.js       tap inputs (purane fields ke upar, logic same)
  08-v12-dashboard-bell.js admin dashboard + bell
  09-v13-owner-changes.js  line-wise raw material, shapes, P2, frames per packet
  10-v14-order-slip.js     order slip: slip no. series, kai rang, transport, priority, party-wise, bill par rate
  99-boot.js               app start
tools/build.js             sab kuch ek single HTML file mein jodta hai (dist/)
tools/release.js           build + releases/<version>/ folder
tests/smoke.js             poora flow chalake numbers check karta hai
tests/slip.js              Section 1 (order slip) ke checks
releases/                  har section ki shareable file + notes + screenshots
docs/                      client review checklist + owner ke registers (CSV)
CLAUDE.md                  Claude Code ke liye project notes
```

## Edit kaise karein

- **Rang, font, spacing:** `css/01-base.css` mein sabse upar `:root` ke variables (`--navy`, `--gold` …). Dark mode ke variables thoda neeche hain.
- **Koi text badalna:** `Ctrl+Shift+F` se text dhoondho. Har text `L('Hinglish','English')` ke roop mein likha hai. Dono badlo.
- **Hindi shabd:** `05-v9-owner-changes.js` mein `DV9` dictionary (Hinglish shabd → Devanagari).
- **Rate list, rang, shapes:** app ke andar **Rate list** page se hi badal sakte ho. Code chhedne ki zarurat nahi.

**Ek zaroori baat:** files `index.html` mein jis order mein likhi hain, usi order mein chalti hain. Baad waali file pehle waali ke functions ko badal deti hai (jaise `render=function(){…}`). Isliye kisi function ko dhoondhte waqt dekho ki baad ki kisi file mein woh dobara toh nahi likha. Naya bada badlav karna ho toh nayi file banao (jaise `js/10-v14-….js`) aur `index.html` mein `99-boot.js` se pehle jodo.

## Purana data saaf karna

Browser mein data `mk-proto-v6` naam se save hota hai. App ka **Zero reset** button use karo, ya DevTools → Application → Local Storage → delete.

## Single file banana (share ya publish karne ke liye)

```
node tools/build.js
```
`dist/mk-prototype.html` ban jaayegi: ek hi file, sab kuch andar. Isse WhatsApp par bhej sakte ho, ya Claude se bolo "is file ko MK Plastics Prototype artifact par publish karo".

## Test

```
npm install
npx playwright install chromium
npm test
```
Poora flow chalta hai (inward → moulding → karigar → coating → order → bill → dispatch). Sahi hone par numbers yeh aane chahiye: auto packed **58**, rate **10.4**, bill **₹3,068**, ready stock **580 → 330**, koi error nahi.

## Git (recommended)

Pehli baar:
```
git init
git add .
git commit -m "MK Plastics prototype v14 (split for VS Code)"
```
Har edit ke baad commit karo. Kuch toot jaaye toh purane version par wapas jaana aasaan rehta hai.

## Aage kya

Client review (23–24 Nov) ke 40 fixes `docs/client-review-2026-11-24.md` mein hain. Live checklist: https://claude.ai/artifact/JDaM8hfrotRzwDsPyCpxjh
