# CLAUDE.md — MK Plastics prototype

Clickable prototype of an inventory + production app for MK Plastics / Beads Bazaar (plastic bead maker, Bhiwandi). Owner: Mahebub bhai (father); business run by his son Zahid bhai, who gives the reviews. Consultant: Premchand. UI language is Hinglish by default, with Hindi (Devanagari) and English toggles.

## Working with Premchand

- Ask every question (in chat and in question dialogs) in **Hinglish**, short and simple, so it can be forwarded to Zahid bhai as is.

## Stack and how it runs

- Plain HTML + CSS + vanilla JS. No framework, no bundler, no server. `index.html` loads `css/*.css` and then `js/*.js` as **classic scripts in a fixed order**. They all share one global scope.
- All state lives in one global object `S`, saved to `localStorage` key `mk-proto-v6` by `save()` (called from `render()`).
- `tools/build.js` inlines everything into `dist/mk-prototype.html` (one file, used for sharing and publishing as a Claude artifact).

## Architecture (read before editing)

- **Rendering:** `render()` rebuilds `#app`. Admin screens are `AV[view](user)`, staff screens are `staffView(u)`. Modals use `openModal(title, sub, bodyHTML, footHTML, {form, live, wide, id})` into `#modal-root`; `closeModal()`.
- **Event delegation, no listeners per element:**
  - `data-a="name"` on a button → `ACT.name(el)`
  - `<form data-f="name">` submit → `FORMS.name(form)`
  - `<form data-live="name">` input/change → `LIVE.name(form)`
- **Text:** always `L('Hinglish text','English text')`. Hindi mode converts Hinglish words with the `DV9` dictionary (`dvWalk`); add new words to `DV9` when you add UI text.
- **Stock ledger:** `S.stock` keyed `LOC|item|uom`. Locations: `RAW:M` (raw material), `DHAGA` (dhaga stock by type, kg), `RAW:O` (others), `PLAIN:P` / `PLAIN:Z` (moulded beads by line), `FIN:P` / `FIN:Z` (ready to dispatch), `WASTE:M`. Use `move(loc,item,uom,qty)` and `qty(loc,item,uom)`; never write `S.stock` directly.
- **Main collections:** `S.rms` (raw materials, each with `line` P or Z), `S.rl` (rate list, 35 items: `no,size,kind,bpk,s,d,pack,fpp`), `S.fp` (finished products), `S.tasks` (moulding + `kind:'coat'` tasks, `working` flag), `S.entries` (staff entries, approved by admin), `S.jobs` (karigar jobs), `S.thr` (threaded lots: `thr` → `cq` coating queue), `S.dhaga` (dhaga g/kg from P1 + dhaga type per item), `S.dhagaTypes`, `S.cuts` (cut by grade), `S.pirai` (pirai spec from P2: ladi/guchha, guchha/frame, moti/ladi; 1 bunch = `S.cfg14.mpb` = 1,200 moti), `S.orders`, `S.dispatches` (`pending:true` = billed, not yet dispatched), `S.invoices`, `S.payments`, `S.expenses`, `S.users`, `S.colours`, `S.shapes`.
- **Layer pattern:** the code grew in versions. Each `js/0N-vX-*.js` file **overrides** earlier functions by reassignment, usually keeping the old one:
  `const _prev = staffView; staffView = function(u){ const h = _prev(u); …; return h };`
  So the effective version of a function is the **last** file that reassigns it. Search all files before editing a function.
- **Migrations:** `initV8()`, `initV9()`, `initV10()`, `initV13()` run at boot (`99-boot.js`) and upgrade old saved data once, guarded by flags (`S.v9`, `S.v13` …). `seed()` is wrapped per layer and rebuilds demo data on Zero reset.
- **UI layer (v11):** chips, toggles, colour swatches and steppers are generated over the real `<select>`/`<input>` fields by `tapRefresh()`. The real fields stay in the DOM (visually hidden) and fire the same events, so `LIVE`/`FORMS` code reads them as before. Keep form logic on the real fields.

## Rules for changes

1. Put a new feature set in a **new layer file** `js/10-v14-<topic>.js` (+ `css/05-v14.css` if needed), add `'use strict';` at its top, and add it to `index.html` before `99-boot.js`. If it needs a data upgrade, write `initV14()` and call it in `99-boot.js` after `initV13()`, and wrap `seed()` the same way earlier layers do.
2. **Top-level code in a file must not use anything defined in a later file.** Inside functions it is fine (they run after boot). This bit us once: `AV.reports` in `01-core.js` now uses a wrapper `(...a)=>reportsView(...a)` because `reportsView` lives in `02-…js`.
3. Never put the literal `</script` inside JS (the build refuses it).
4. Keep both themes working (CSS variables in `:root` and the dark blocks), and phone width 390px with no sideways scroll.
5. Keep the prototype flow intact: stock changes only on admin approval; sale stock goes down at dispatch, not at billing. Since v14.2 (owner's Q11): **dispatch first, then bill** (now or later); only the owner dispatches and bills; invoice date = dispatch date, `inv.billedAt` = day billed.
6. After every change run `npm test` (Playwright: `tests/smoke.js`, `tests/slip.js`, `tests/dispatch.js`, `tests/pirai.js`, `tests/karigar-return.js`, `tests/frames.js`, `tests/daily-entry.js`, `tests/routing.js`). In the cloud container set `PW_CHROMIUM=/opt/pw-browsers/chromium`. Expected: auto packed 58, rate 10.4, bill MK/26-27/0001 ₹3,068, ready stock 290 → 40 (since v14.5: 1 frame of 3MM Semi = 6,000 moti = 5 bunch from P2, was a flat 10), no page errors, no overflow. `tests/smoke.js` asserts these. If you intentionally change these numbers, update `tests/smoke.js` and say why.

## Current work

`docs/client-review-2026-11-24.md` lists 40 checks from the owner's review (order slip format, karigar return slip with dhaga + cut, dhaga stock, pirai spec, 1,200-moti bunch, packets → frames allowance, next-day entry with rejected-bunch calc, contractor login with salary/attendance/kharchi). Each item cites its voice note (V1–V13 with timestamps) or photo (P1–P4). Owner's register data is in `docs/register-dhaga-P1.csv` and `docs/register-pirai-P2.csv`; rows marked `unclear` need the owner's confirmation. **Pearl line first; Metalizing later.** Progress and step-by-step process: `docs/PROGRESS.md`. Section 1 (order slip) is done in `js/10-v14-order-slip.js` → `releases/v14.1-order-slip/`; dispatch → bill in `js/11-v14-dispatch-bill.js` → `releases/v14.2-dispatch-bill/`; Section 2 (pirai spec, frames/guchha, 1 bunch = 1,200 moti) in `js/12-v14-pirai.js` → `releases/v14.3-pirai/`; Sections 3 + 4 (return slip with grade, dhaga g/kg, cut → waste; dhaga stock) in `js/13-v14-karigar-return.js` → `releases/v14.4-karigar-return-dhaga/`; Section 6 (exact frames/packet from P2 in `r.fpp`, owner allowance `r.alw`, task targets) in `js/14-v14-frames.js` → `releases/v14.5-packets-frames/`; Section 7 (work date, frames used + packets, rejected bunch → Waste "Coating reject"; packets blank = old frame way) in `js/15-v14-daily-entry.js` → `releases/v14.6-daily-entry/`; Section 5 (routing verified end to end, owner-defined coating-task boxes `S.taskFields` for Q6) in `js/16-v14-task-fields.js` → `releases/v14.7-routing-task-boxes/`; Section 8 (contractor) is on hold: no contractor for now (owner, 26 Nov). Waiting for the owner's test of v14.6; Section 5.3 waits for his message (Q6). Each section gets its own layer file and release folder (`node tools/release.js v14.N slug`, see `releases/README.md`). Eleven open questions are at the end of the checklist — don't guess those values, leave them editable in the UI.
