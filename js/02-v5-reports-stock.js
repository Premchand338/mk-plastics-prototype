"use strict";
/* ---------- v5: lots, slips, QR, piece-rate, karigar khata, reports, stock count ---------- */
const TARE = 0.15,
  BAG = 25;
const COST = {
  raw: {
    gSemi: 112,
    gSuper: 118,
    gCrylo: 126,
    gOther: 122,
    bag: 9,
    essence: 640,
    lacquer: 210,
    pigment: 880,
    thread: 45,
    alu: 410,
    base: 230,
    top: 250,
  },
  plain: 135,
  coat: 178,
};
function newLot(ts) {
  const d = new Date(ts || Date.now());
  return (
    "L" +
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    "-" +
    String(S.seq.lot++).padStart(3, "0")
  );
}
function findEntry(id) {
  return (
    S.entries.find((e) => e.id === id) || S.outbox.find((e) => e.id === id)
  );
}
const estEarn = (e) => e.out * (S.pieceRate[e.unit] || 0);
function entrySku(e) {
  return e.unit === "M"
    ? plainName(e.product)
    : pname(PM[e.product]) + " · " + psub(PM[e.product]);
}
function qrSvg(text, size) {
  try {
    if (typeof qrcode !== "function") throw 0;
    const q = qrcode(0, "M");
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg class="qr" viewBox="-2 -2 ${n + 4} ${n + 4}" width="${size}" height="${size}" role="img" aria-label="QR code" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
  } catch (e) {
    return `<div class="qr-fb" style="width:${size}px;height:${size}px">QR</div>`;
  }
}
function monthRange() {
  const back = +(S.ui.repMonth || 0);
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - back);
  const a = d.getTime();
  d.setMonth(d.getMonth() + 1);
  return [a, d.getTime()];
}
const monthLabel = () =>
  new Date(monthRange()[0]).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

function seedV5() {
  const t = Date.now();
  S.pieceRate = { M: 1.5, P: 2.5, Z: 3 };
  S.karRate = 4;
  S.tol = 1.5;
  S.penRate = 200;
  S.karPays = [];
  S.counts = [];
  S.seq.lot = 1;
  S.seq.jw = 31;
  S.entries
    .slice()
    .sort((a, b) => a.ts - b.ts)
    .forEach((e) => (e.lot = newLot(e.ts)));
  S.jobs.forEach(
    (j) => (j.challan = "JW/26-27/" + String(S.seq.jw++).padStart(4, "0")),
  );
  S.jobs.push({
    id: nid(),
    kar: "k3",
    unit: "Z",
    product: "p11",
    sent: 40,
    ts: t - 25 * DAY,
    by: "Rakesh",
    challan: "JW/26-27/0028",
    receipts: [{ bunch: 70, loose: 2, waste: 1, ts: t - 14 * DAY }],
    closed: true,
    closeTs: t - 13 * DAY,
    loss: 2,
    penalty: Math.round((2 - (40 * S.tol) / 100) * S.penRate),
  });
  S.karPays.push({
    id: nid(),
    kar: "k1",
    amount: 600,
    mode: "Cash",
    ts: t - 4 * DAY,
  });
  const L1 = [
    ["RAW:P", "essence", "kg", -0.8],
    ["FIN:P", "p02", "bunch", -2],
    ["COAT:P", "p08", "kg", -1.2],
    ["FIN:P", "p19", "bunch", 0],
    ["RAW:P", "thread", "roll", 0],
  ];
  S.counts.push({
    id: nid(),
    unit: "P",
    by: "Imran",
    ts: t - 3 * HR,
    status: "pending",
    lines: L1.map(([loc, item, uom, d]) => {
      const sys = qty(loc, item, uom);
      return { loc, item, uom, sys, cnt: r1(sys + d) };
    }),
  });
}

/* slips */
function slipModal(id) {
  const e = findEntry(id);
  if (!e) return;
  const bags = Math.max(1, Math.ceil(e.out / BAG)),
    tare = bags * TARE,
    gross = e.out + tare;
  const payload = JSON.stringify({
    lot: e.lot,
    sku: e.product,
    netKg: r1(e.out),
    op: e.staff,
    m: e.machine,
  });
  openModal(
    L("Weighment slip", "Weighment slip"),
    `${e.lot} · 58 mm`,
    `<div class="thermal">
   <div class="tc"><b style="font-size:14px">MK PLASTICS</b><br>Beads Bazaar · Bhiwandi</div><div class="tc tt">WEIGHMENT SLIP</div><hr>
   <div class="tr"><span>Lot</span><b>${e.lot}</b></div><div class="tr"><span>${L("Tarikh", "Date")}</span><span>${new Date(e.ts).toLocaleDateString("en-IN")} ${ftime(e.ts)}</span></div>
   <div class="tr"><span>Machine</span><span>${e.machine} · ${UNITS[e.unit].n}</span></div><div class="tr"><span>Operator</span><span>${esc(e.staff)}</span></div><div class="tr"><span>Shift</span><span>${e.shift}</span></div><hr>
   <div class="tl">${esc(entrySku(e))}</div>
   <div class="tr"><span>${L("Bori", "Bags")}</span><span>${bags} × ${BAG} kg</span></div><div class="tr"><span>Gross</span><span>${nf(gross, 2)} kg</span></div><div class="tr"><span>Tare</span><span>${nf(tare, 2)} kg</span></div>
   <div class="tr tbig"><span>Net</span><b>${nf(e.out, 2)} kg</b></div><div class="tr"><span>${e.unit === "M" ? "Waste" : "Reject"}</span><span>${nf(e.reject, 2)} kg</span></div><div class="tr"><span>Yield</span><span>${nf(yieldOf(e) * 100, 1)}%</span></div><hr>
   <div class="tr"><span>${L("Kamai", "Earning")} @ ₹${S.pieceRate[e.unit]}/kg</span><b>₹${nf(estEarn(e), 2)}</b></div>
   <div class="tc tsm">${e.status === "approved" ? "APPROVED" : L("Approval ke baad pakki", "Confirmed after approval")}</div>
   <div class="tqr">${qrSvg(payload, 112)}</div><div class="sig"><span>Operator</span><span>Supervisor</span></div></div>`,
    `<span class="grow">${L("Asli app mein Bluetooth thermal printer par print hoga", "Prints on a Bluetooth thermal printer in the real app")}</span><button type="button" class="btn" data-a="stickers" data-id="${e.id}">${ic("qr", 16)} ${L("Bori sticker", "Bag stickers")} (${bags})</button><button type="button" class="btn pri" data-a="fakePrint">${ic("print", 16)} Print</button>`,
  );
}
function stickersModal(id) {
  const e = findEntry(id),
    bags = Math.max(1, Math.ceil(e.out / BAG));
  const items = Array.from({ length: bags }, (_, i) => {
    const kv = i < bags - 1 ? BAG : r1(e.out - BAG * (bags - 1));
    return `<div class="sticker">${qrSvg(JSON.stringify({ lot: e.lot, bag: `${i + 1}/${bags}`, sku: e.product, netKg: kv, op: e.staff, m: e.machine }), 84)}<div style="min-width:0"><b>${e.lot}-B${i + 1}</b><div>${esc(entrySku(e))}</div><div class="kgv">${nf(kv, 1)} kg</div><div class="sm">${e.machine} · ${esc(e.staff)} · ${fdate(e.ts)}</div><div class="sm">${L("Bori", "Bag")} ${i + 1}/${bags}</div></div></div>`;
  }).join("");
  openModal(
    L("Bori ke QR sticker", "Bag QR stickers"),
    `${e.lot} · ${bags} ${L("bori", "bags")} · 50 × 50 mm`,
    `<div class="stickers">${items}</div><div class="note">${ic("qr", 16)}<span>${L("Har 25 kg bori par ek sticker. Lene wali unit QR scan karegi, toh 3mm/4mm ya rang ka mix nahi hoga.", "One sticker per 25 kg bag. The receiving unit scans it, so 3mm/4mm sizes and colours never get mixed.")}</span></div>`,
    `<button type="button" class="btn" data-a="slip" data-id="${e.id}">← Slip</button><span class="grow"></span><button type="button" class="btn pri" data-a="fakePrint">${ic("print", 16)} Print ${bags}</button>`,
    { wide: true },
  );
}
function challanModal(jid) {
  const j = S.jobs.find((x) => x.id === jid),
    p = PM[j.product],
    k = KM[j.kar],
    val = j.sent * COST.coat;
  if (!j.challan) j.challan = "JW/26-27/" + String(S.seq.jw++).padStart(4, "0");
  openModal(
    L("Job work delivery challan", "Job work delivery challan"),
    `${j.challan} · Rule 55`,
    `<div class="paper">
   <div class="ph"><div><h3>MK Plastics</h3><div class="m">Beads Bazaar · Bhiwandi, Mumbai 421302, Maharashtra</div><div class="m">GSTIN 27XXXXXXXXXX1Z0 (sample)</div></div><div style="text-align:right"><div class="stamp">Delivery Challan · Job work</div><b>${j.challan}</b><div class="m">${new Date(j.ts).toLocaleDateString("en-IN")}</div></div></div>
   <div class="row2"><div><div class="m">${L("Karigar (job worker)", "Job worker")}</div><b>${esc(k.n)}</b><div class="m">${esc(k.a)}, Bhiwandi · ${L("GST registered nahi", "Not GST registered")}</div></div><div><div class="m">${L("Maksad", "Purpose")}</div><b>${L("Job work: dhaage mein pirona", "Job work: threading")}</b><div class="m">Sec. 143 CGST Act · Rule 55</div></div></div>
   <div class="tw" style="margin-inline:0;padding-inline:0"><table><thead><tr><th>#</th><th>${L("Vivran", "Description")}</th><th>HSN</th><th class="r">Qty</th><th class="r">${L("Andaazit keemat", "Approx. value")}</th></tr></thead><tbody><tr><td>1</td><td>${esc(pname(p))} · ${esc(psub(p))}<div class="m">${L("Coated beads, bina dhaage", "Coated beads, unthreaded")}</div></td><td>3926</td><td class="r">${kg(j.sent)}</td><td class="r">${rs(val)}</td></tr></tbody></table></div>
   <div class="row2"><div><div class="m">${L("Wapas kab tak (company niyam)", "Return by (company rule)")}</div><b>${new Date(j.ts + 15 * DAY).toLocaleDateString("en-IN")}</b></div><div><div class="m">${L("Wapas kaise aayega", "Comes back as")}</div><b>${L("Bunch", "Bunches")} · ~${nf(j.sent / S.kpb[j.product])}</b><div class="m">${L("Chhoot", "Tolerance")} ${S.tol}% · ₹${S.karRate}/bunch</div></div></div>
   <div class="m">${L("Job work ke inputs 1 saal ke andar wapas aane chahiye. Sample format hai, CA se confirm karein.", "Job-work inputs must come back within 1 year. Sample format; confirm with your CA.")}</div>
   <div class="sig2"><span>${L("MK Plastics ki taraf se", "For MK Plastics")}</span><span>${L("Karigar ka sign", "Karigar signature")}</span></div></div>`,
    `<span class="grow">${L("Do copy: karigar + office", "Two copies: karigar + office")}</span><button type="button" class="btn" data-a="waShare">${ic("send", 16)} WhatsApp</button><button type="button" class="btn pri" data-a="fakePrint">${ic("print", 16)} Print</button>`,
    { wide: true },
  );
}
function packingModal(did) {
  const d = S.dispatches.find((x) => x.id === did),
    o = S.orders.find((x) => x.id === d.order),
    p = PTY[o.party];
  if (!d.pk)
    d.pk =
      "PK-" +
      o.no +
      "-" +
      (S.dispatches.filter((x) => x.order === o.id).indexOf(d) + 1);
  const payload = JSON.stringify({
    pk: d.pk,
    order: o.no,
    party: p.id,
    items: d.lines.map(({ i, q }) => [o.lines[i].ref, q, o.lines[i].uom]),
  });
  openModal(
    L("Packing slip", "Packing slip"),
    `${d.pk} · 80 mm`,
    `<div class="thermal w80">
   <div class="tc"><b style="font-size:14px">MK PLASTICS</b><br>Beads Bazaar · Bhiwandi</div><div class="tc tt">PACKING SLIP</div><hr>
   <div class="tr"><span>Slip</span><b>${d.pk}</b></div><div class="tr"><span>Order</span><span>#${o.no}</span></div><div class="tr"><span>${L("Tarikh", "Date")}</span><span>${new Date(d.ts).toLocaleDateString("en-IN")} ${ftime(d.ts)}</span></div>
   <div class="tr"><span>Party</span><span>${esc(p.n)}</span></div><div class="tr"><span>City</span><span>${esc(p.city)}</span></div><div class="tr"><span>${L("Gaadi", "Vehicle")}</span><span>${esc(d.vehicle || "–")}</span></div><hr>
   ${d.lines.map(({ i, q }) => `<div class="tl">${esc(itemName(o.lines[i]))}</div><div class="tr"><span></span><b>${fq(q, o.lines[i].uom)}</b></div>`).join("")}<hr>
   <div class="tr"><span>${L("Bheja", "Sent by")}</span><span>${esc(d.by)} · ${UNITS[d.unit].n}</span></div>
   <div class="tqr">${qrSvg(payload, 120)}</div><div class="tc tsm">${L("Carton par chipkao · rate nahi likha", "Stick on the carton · no rates printed")}</div><div class="sig"><span>${L("Bhejne wala", "Dispatched by")}</span><span>${L("Lene wala", "Received by")}</span></div></div>`,
    `<span class="grow">${L('Admin ko "Bill banana baaki" mein dikhega', 'Shows for the Admin under "Waiting to be billed"')}</span><button type="button" class="btn pri" data-a="fakePrint">${ic("print", 16)} Print</button>`,
  );
}

/* karigar khata */
const _jobBal = jobBal;
jobBal = function (j) {
  const b = rawBal(j);
  if (j.closed) {
    b.loss = j.loss;
    b.bal = 0;
  }
  return b;
};
function karInfo(kid) {
  const js = S.jobs.filter((j) => j.kar === kid),
    rec = js.flatMap((j) => j.receipts.map((r) => ({ r, j }))),
    earned = sum(rec, (x) => x.r.bunch * S.karRate),
    pen = sum(js, (j) => j.penalty || 0),
    paid = sum(
      S.karPays.filter((p) => p.kar === kid),
      (p) => p.amount,
    );
  return {
    earned,
    pen,
    paid,
    due: earned - pen - paid,
    custody: sum(js, (j) => jobBal(j).bal),
    rec,
    js,
  };
}
function closeJobModal(jid) {
  const j = S.jobs.find((x) => x.id === jid),
    b = rawBal(j),
    kp = S.kpb[j.product],
    thr = b.bunch * kp,
    un = b.bal,
    pct = j.sent ? (un / j.sent) * 100 : 0,
    allow = (j.sent * S.tol) / 100,
    over = Math.max(0, un - allow),
    pen = Math.round(over * S.penRate);
  openModal(
    L("Karigar ka hisaab band karo", "Close the karigar job"),
    `${esc(KM[j.kar].n)} · ${esc(jobName(j))} · ${j.challan || ""}`,
    `<div class="sumbox"><div><span>${L("Bheja", "Issued")}</span><b>${kg(j.sent)}</b></div><div><span>${L("Bunch mein", "In bunches")} (${nf(b.bunch)} × ${kp} kg)</span><b>${kg(thr)}</b></div><div><span>Loose ${L("wapas", "returned")}</span><b>${kg(b.loose)}</b></div><div><span>Wastage (${L("karigar ne bataya", "declared")})</span><b>${kg(b.waste)}</b></div><div class="tot"><span>${L("Hisaab nahi mila", "Unaccounted")}</span><b>${kg(un)} · ${nf(pct, 2)}%</b></div></div>
   ${
     pct <= S.tol
       ? `<div class="note ok">${ic("check", 16)}<span>${L(`${S.tol}% chhoot ke andar (dhaaga, handling). Koi penalty nahi.`, `Within the ${S.tol}% allowance (thread, handling). No penalty.`)}</span></div>`
       : `<div class="note bad">${ic("alert", 16)}<span>${L(`Chhoot ${kg(allow)} tak hai. ${kg(over)} zyada gaya. Penalty ${rs(pen)} (₹${S.penRate}/kg), karigar ki kamai se katega.`, `The allowance is ${kg(allow)}. ${kg(over)} is over. Penalty ${rs(pen)} (₹${S.penRate}/kg), deducted from wages.`)}</span></div>
   <label class="note" style="cursor:pointer;align-items:center"><input type="checkbox" name="waive"> ${L("Penalty maaf karo (Record mein likha jaayega)", "Waive the penalty (recorded in Activity)")}</label>`
   }
   <div class="sumbox"><div><span>${L("Is kaam ki kamai", "Wages for this job")} (${nf(b.bunch)} × ₹${S.karRate})</span><b>${rs(b.bunch * S.karRate)}</b></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("lock", 16)} ${L("Hisaab band karo", "Close job")}</button>`,
    { form: "closeJob", id: jid, wide: true },
  );
}
function karKhataModal(kid) {
  const k = KM[kid],
    ki = karInfo(kid);
  const rows = [
    ...ki.rec.map(({ r, j }) => ({
      ts: r.ts,
      d: `${nf(r.bunch)} bunch · ${jobName(j)}`,
      cr: r.bunch * S.karRate,
      dr: 0,
    })),
    ...ki.js
      .filter((j) => j.penalty)
      .map((j) => ({
        ts: j.closeTs,
        d: `Penalty · ${j.challan} · ${kg(j.loss)} ${L("kam", "short")}`,
        cr: 0,
        dr: j.penalty,
      })),
    ...S.karPays
      .filter((p) => p.kar === kid)
      .map((p) => ({
        ts: p.ts,
        d: `Payment · ${p.mode}`,
        cr: 0,
        dr: p.amount,
      })),
  ].sort((a, b) => a.ts - b.ts);
  let bal = 0;
  openModal(
    `${esc(k.n)} · Khata`,
    `${esc(k.a)} · ₹${S.karRate}/bunch · ${L("chhoot", "tolerance")} ${S.tol}%`,
    `${ki.due < 0 ? `<div class="note warn">${ic("alert", 16)}<span>${L("Penalty kamai se zyada hai. Agle kaam ki kamai se katega.", "Penalties exceed wages. The rest comes off the next job.")}</span></div>` : ""}<div class="kpis"><div class="kpi"><span>${L("Kul kamai", "Total earned")}</span><b>${rs(ki.earned)}</b></div><div class="kpi"><span>Penalty</span><b>${rs(ki.pen)}</b></div><div class="kpi"><span>${L("Diya", "Paid")}</span><b>${rs(ki.paid)}</b></div><div class="kpi"><span>${L("Dena baaki", "Due")}</span><b>${rs(ki.due)}</b></div></div>
   <div class="note">${ic("thread", 16)}<span>${L("Karigar ke paas abhi maal", "Material with the karigar now")}: <b>${kg(ki.custody)}</b></span></div>
   <div class="tw"><table><thead><tr><th>${L("Tarikh", "Date")}</th><th>${L("Vivran", "Details")}</th><th class="r">${L("Kamai", "Earned")}</th><th class="r">${L("Kata / diya", "Deducted / paid")}</th><th class="r">${L("Baaki", "Balance")}</th></tr></thead><tbody>${
     rows
       .map((r) => {
         bal += r.cr - r.dr;
         return `<tr><td>${fdate(r.ts)}</td><td>${esc(r.d)}</td><td class="r">${r.cr ? rs(r.cr) : ""}</td><td class="r">${r.dr ? rs(r.dr) : ""}</td><td class="r"><b>${rs(bal)}</b></td></tr>`;
       })
       .join("") ||
     `<tr><td colspan="5" class="muted">${L("Abhi kuch nahi", "Nothing yet")}</td></tr>`
   }</tbody></table></div>`,
    `<button type="button" class="btn" data-a="close">${L("Theek hai", "Done")}</button><button type="button" class="btn pri" data-a="karPay" data-id="${kid}">+ Payment</button>`,
    { wide: true },
  );
}
function karPayModal(kid) {
  const ki = karInfo(kid);
  openModal(
    L("Karigar ko payment", "Pay karigar"),
    `${esc(KM[kid].n)} · ${L("dena baaki", "due")} ${rs(ki.due)}`,
    `<div class="fld"><label for="kpa">${L("Rakam ₹", "Amount ₹")}</label><input id="kpa" name="amount" class="big-in" type="number" inputmode="decimal" min="1" value="${Math.max(0, Math.round(ki.due))}"></div><div class="fld"><span class="lb">Mode</span><div class="radios">${["Cash", "UPI", "Bank"].map((m, i) => `<label><input type="radio" name="mode" value="${m}" ${i ? "" : "checked"}>${m}</label>`).join("")}</div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Payment save</button>`,
    { form: "karPay", id: kid },
  );
}

/* stock count */
function countItems(unit) {
  const out = [];
  RAW.filter((r) => r.unit === unit).forEach((r) =>
    out.push({
      g: "Raw material",
      loc: "RAW:" + unit,
      item: r.id,
      uom: r.uom,
      n: r.n,
    }),
  );
  PLAINS.filter((k) => qty("PLAIN:" + unit, k, "kg") > 0).forEach((k) =>
    out.push({
      g: "Plain beads",
      loc: "PLAIN:" + unit,
      item: k,
      uom: "kg",
      n: plainName(k),
    }),
  );
  if (unit !== "M") {
    PRODUCTS.filter(
      (p) => p.unit === unit && qty("COAT:" + unit, p.id, "kg") > 0,
    ).forEach((p) =>
      out.push({
        g: "Coated",
        loc: "COAT:" + unit,
        item: p.id,
        uom: "kg",
        n: pname(p) + " · " + p.grade,
      }),
    );
    PRODUCTS.filter(
      (p) => p.unit === unit && qty("FIN:" + unit, p.id, "bunch") > 0,
    ).forEach((p) =>
      out.push({
        g: L("Taiyaar maal", "Finished"),
        loc: "FIN:" + unit,
        item: p.id,
        uom: "bunch",
        n: pname(p) + " · " + p.grade,
      }),
    );
  }
  return out;
}
function countLineName(l) {
  const [k] = l.loc.split(":");
  return k === "RAW"
    ? RM[l.item].n
    : k === "PLAIN"
      ? plainName(l.item)
      : pname(PM[l.item]) +
        " · " +
        PM[l.item].grade +
        (k === "COAT" ? " (coated)" : "");
}
function countValue(l, d) {
  const [k] = l.loc.split(":");
  return (
    d *
    (k === "RAW"
      ? COST.raw[l.item] || 0
      : k === "PLAIN"
        ? COST.plain
        : k === "COAT"
          ? COST.coat
          : S.kpb[l.item] * COST.coat + S.karRate)
  );
}
function countModal() {
  const u = user(),
    items = countItems(u.unit);
  let g = "";
  draft = { items };
  openModal(
    L("Physical stock ginti", "Physical stock count"),
    `${UNITS[u.unit].n} · ${new Date().toLocaleDateString("en-IN")}`,
    `<div class="note">${ic("scale", 16)}<span>${L('Jo godown mein hai wahi gino aur toul ke daalo. System ka number jaan-boojh ke nahi dikhaya. Khaali chhoda toh "barabar" maana jaayega.', "Count and weigh what is physically there. The system figure is hidden on purpose. Left blank means it matches.")}</span></div>
   <div class="list">${items
     .map((it, i) => {
       const h =
         it.g !== g
           ? `<div class="eyebrow" style="margin-top:6px">${it.g}</div>`
           : "";
       g = it.g;
       return (
         h +
         `<div class="toolbar cline"><label for="cc${i}" style="flex:1;min-width:0;font-size:13.5px">${esc(it.n)}</label><div class="phone-in" style="width:150px"><input id="cc${i}" name="c${i}" type="number" inputmode="decimal" step="0.1" min="0" style="font-size:16px;min-height:42px;padding:6px 10px;border:0;width:100%"><span style="font-size:12px;padding:0 10px">${it.uom}</span></div></div>`
       );
     })
     .join("")}</div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("send", 16)} ${L("Admin ko bhejo", "Send to Admin")}</button>`,
    { form: "count", wide: true, nofocus: true },
  );
}
function countCard(c, admin) {
  const diff = c.lines.filter((l) => Math.abs(l.cnt - l.sys) > 0.001),
    val = sum(diff, (l) => countValue(l, l.cnt - l.sys));
  return `<div class="item" style="flex-direction:column;align-items:stretch;gap:10px"><div class="toolbar"><div>${uchip(c.unit)} <b style="margin-left:6px">${esc(c.by)}</b> <span class="psub">· ${fwhen(c.ts)} · ${c.lines.length} ${L("item gine", "items counted")}</span></div>${c.status === "pending" ? `<span class="pill warn">${L("Approval baaki", "Awaiting approval")}</span>` : c.status === "approved" ? `<span class="pill ok">Approved</span>` : `<span class="pill bad">${L("Wapas", "Rejected")}</span>`}</div>
   ${
     diff.length
       ? `<div class="tw"><table><thead><tr><th>Item</th><th class="r">${L("System", "System")}</th><th class="r">${L("Gina", "Counted")}</th><th class="r">${L("Farak", "Gap")}</th>${admin ? `<th class="r">₹</th>` : ""}</tr></thead><tbody>${diff
           .map((l) => {
             const d = l.cnt - l.sys;
             return `<tr><td>${esc(countLineName(l))}</td><td class="r">${fq(l.sys, l.uom)}</td><td class="r">${fq(l.cnt, l.uom)}</td><td class="r" style="color:${d < 0 ? "var(--bad)" : "var(--ok)"};font-weight:600">${d > 0 ? "+" : ""}${fq(d, l.uom)}</td>${admin ? `<td class="r">${rs(countValue(l, d))}</td>` : ""}</tr>`;
           })
           .join("")}</tbody></table></div>`
       : `<div class="note ok">${ic("check", 16)}<span>${L("Sab barabar mila.", "Everything matched.")}</span></div>`
   }
   ${c.note ? `<div class="note bad">${ic("undo", 15)}<span>${esc(c.note)}</span></div>` : ""}
   ${admin && c.status === "pending" ? `<div class="toolbar"><span class="psub">${diff.length} ${L("item mein farak", "items differ")} · ${L("kul", "total")} <b style="color:var(--ink)">${rs(val)}</b></span><div class="btns"><input id="cn-${c.id}" placeholder="${L("Wapas bhejne ka reason", "Reason to reject")}" style="border:1px solid var(--line);border-radius:9px;padding:6px 10px;min-height:34px;background:var(--surface)"><button type="button" class="btn sm danger" data-a="countReject" data-id="${c.id}">${L("Wapas bhejo", "Reject")}</button><button type="button" class="btn sm pri" data-a="countApprove" data-id="${c.id}">${ic("check", 14)} ${L("Approve, stock theek karo", "Approve and adjust")}</button></div></div>` : ""}</div>`;
}
function countsAdmin() {
  const pend = S.counts.filter((c) => c.status === "pending"),
    done = S.counts
      .filter((c) => c.status !== "pending")
      .sort((a, b) => b.ts - a.ts);
  return `<div class="card-h"><div><h3>${L("Physical ginti approval", "Physical count approvals")}</h3><p>${L("Manager ne godown gin ke bheja. Approve karne par farak ka stock adjustment ban jaata hai (Record mein likha).", "Managers count the store and send it here. Approving posts the gaps as stock adjustments (recorded in Activity).")}</p></div></div>
   <div class="list">${pend.map((c) => countCard(c, true)).join("") || `<div class="empty">${ic("check")}${L("Koi ginti approval ke liye nahi", "No counts waiting")}</div>`}</div>${done.length ? `<div class="eyebrow">${L("Pichhli ginti", "Earlier counts")}</div><div class="list">${done.map((c) => countCard(c, true)).join("")}</div>` : ""}`;
}
function countsManager(u) {
  const mine = S.counts
      .filter((c) => c.unit === u.unit)
      .sort((a, b) => b.ts - a.ts),
    pend = mine.find((c) => c.status === "pending");
  return `<div class="card-h"><div><h3>${L("Physical stock ginti", "Physical stock count")}</h3><p>${L("Hafte mein ek baar. Gin ke bhejo, Admin farak dekh ke approve karega.", "Once a week. Send the count; the Admin reviews the gaps and approves.")}</p></div>${pend ? "" : `<button type="button" class="btn pri sm" data-a="countNew">${ic("plus", 15)} ${L("Nayi ginti", "New count")}</button>`}</div>
   <div class="list">${mine.map((c) => countCard(c, false)).join("") || `<div class="empty">${L("Abhi koi ginti nahi", "No counts yet")}</div>`}</div>`;
}

/* reports */
const CSV = {};
function csvOf(rows) {
  return (
    "﻿" +
    rows
      .map((r) =>
        r
          .map((c) => {
            const s = String(c ?? "");
            return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
          })
          .join(","),
      )
      .join("\r\n")
  );
}
function tableOf(rows, numCols = []) {
  const [h, ...b] = rows;
  return `<div class="tw"><table><thead><tr>${h.map((c, i) => `<th class="${numCols.includes(i) ? "r" : ""}">${esc(c)}</th>`).join("")}</tr></thead><tbody>${b.map((r) => `<tr>${r.map((c, i) => `<td class="${numCols.includes(i) ? "r" : ""}">${esc(c)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${h.length}" class="muted">${L("Is mahine kuch nahi", "Nothing this month")}</td></tr>`}</tbody></table></div>`;
}
const n2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
function opWage() {
  const [a, b] = monthRange(),
    es = S.entries.filter(
      (e) => e.status === "approved" && e.ts >= a && e.ts < b,
    ),
    g = {};
  es.forEach((e) => {
    const k = e.staff + "|" + e.machine;
    g[k] = g[k] || {
      op: e.staff,
      m: e.machine,
      u: e.unit,
      n: 0,
      kg: 0,
      days: {},
    };
    g[k].n++;
    g[k].kg += e.out;
    const dk = new Date(e.ts).toDateString();
    g[k].days[dk] = (g[k].days[dk] || 0) + e.out;
  });
  return Object.values(g).sort((x, y) => x.m.localeCompare(y.m));
}
function reportsView() {
  const tab = S.ui.repTab || "gstr",
    [a, b] = monthRange();
  const tabs = [
    ["gstr", "GSTR-1"],
    ["wage", L("Operator wage", "Operator wages")],
    ["karwage", L("Karigar wage", "Karigar wages")],
    ["stockval", L("Stock ki keemat", "Stock valuation")],
    ["tally", "Tally XML"],
  ];
  let rows,
    body,
    num = [];
  if (tab === "gstr") {
    const inv = S.invoices
      .filter((i) => i.type === "GST" && i.ts >= a && i.ts < b)
      .sort((x, y) => x.ts - y.ts);
    rows = [
      [
        "Date",
        "Invoice No",
        "Party",
        "GSTIN",
        "Place of supply",
        "Taxable",
        "CGST 9%",
        "SGST 9%",
        "IGST 18%",
        "Total",
      ],
      ...inv.map((i) => {
        const p = PTY[i.party];
        return [
          new Date(i.ts).toLocaleDateString("en-IN"),
          i.no,
          p.n,
          p.gst,
          p.state,
          n2(i.taxable),
          n2(i.cgst),
          n2(i.sgst),
          n2(i.igst),
          n2(i.total),
        ];
      }),
    ];
    if (inv.length)
      rows.push([
        "",
        "",
        "",
        "",
        "Total",
        n2(sum(inv, (i) => i.taxable)),
        n2(sum(inv, (i) => i.cgst)),
        n2(sum(inv, (i) => i.sgst)),
        n2(sum(inv, (i) => i.igst)),
        n2(sum(inv, (i) => i.total)),
      ]);
    num = [5, 6, 7, 8, 9];
    body =
      `<p class="muted" style="font-size:13px">${L("Sirf GST bill. Kachcha bill GSTR-1 mein nahi jaate.", "GST bills only. Kachcha estimates are not part of GSTR-1.")}</p>` +
      tableOf(rows, num);
  } else if (tab === "wage") {
    const ws = opWage();
    rows = [
      [
        "Operator",
        "Machine",
        "Unit",
        "Entries",
        "Good qty",
        "Rate ₹",
        "Earning ₹",
      ],
      ...ws.map((w) => [
        w.op,
        w.m,
        UNITS[w.u].n,
        w.n,
        n2(w.kg),
        n2(S.pieceRate[w.u]),
        n2(w.kg * S.pieceRate[w.u]),
      ]),
    ];
    if (ws.length)
      rows.push([
        "Total",
        "",
        "",
        sum(ws, (w) => w.n),
        n2(sum(ws, (w) => w.kg)),
        "",
        n2(sum(ws, (w) => w.kg * S.pieceRate[w.u])),
      ]);
    num = [3, 4, 5, 6];
    body = `<div class="toolbar" style="justify-content:flex-start;gap:12px">${Object.keys(
      UNITS,
    )
      .map(
        (k) =>
          `<div class="fld" style="width:140px"><label for="pr-${k}">${UNITS[k].n} ₹/kg</label><input id="pr-${k}" type="number" inputmode="decimal" step="0.05" min="0" value="${S.pieceRate[k]}"></div>`,
      )
      .join(
        "",
      )}<button type="button" class="btn sm" data-a="savePiece" style="align-self:flex-end">${L("Rate save", "Save rates")}</button></div>
     <p class="muted" style="font-size:13px">${L("Sirf approved entry ki kamai. Operator par tap karo, din-wise wage slip khulegi. Rate sample hai.", "Earnings count approved entries only. Tap an operator for a day-wise wage slip. Rates are samples.")}</p>
     <div class="tw"><table><thead><tr>${rows[0].map((c, i) => `<th class="${num.includes(i) ? "r" : ""}">${c}</th>`).join("")}</tr></thead><tbody>${ws.map((w) => `<tr class="click" data-a="wageSlip" data-op="${esc(w.op)}" data-m="${w.m}"><td><b>${esc(w.op)}</b></td><td>${w.m}</td><td>${uchip(w.u)}</td><td class="r">${w.n}</td><td class="r">${fq(w.kg, uomU(w.u))}</td><td class="r">₹${n2(S.pieceRate[w.u])}</td><td class="r"><b>${rs(w.kg * S.pieceRate[w.u])}</b></td></tr>`).join("") || `<tr><td colspan="7" class="muted">${L("Is mahine kuch nahi", "Nothing this month")}</td></tr>`}</tbody></table></div>`;
  } else if (tab === "karwage") {
    rows = [
      [
        "Karigar",
        "Area",
        "Bunch (month)",
        "Rate ₹/bunch",
        "Earned (month)",
        "Penalty (month)",
        "Paid (month)",
        "Due (all time)",
      ],
      ...KARIGARS.map((k) => {
        const ki = karInfo(k.id),
          bm = sum(
            ki.rec.filter((x) => x.r.ts >= a && x.r.ts < b),
            (x) => x.r.bunch,
          ),
          pm = sum(
            ki.js.filter((j) => j.penalty && j.closeTs >= a && j.closeTs < b),
            (j) => j.penalty,
          ),
          paid = sum(
            S.karPays.filter((p) => p.kar === k.id && p.ts >= a && p.ts < b),
            (p) => p.amount,
          );
        return [
          k.n,
          k.a,
          bm,
          n2(S.karRate),
          n2(bm * S.karRate),
          n2(pm),
          n2(paid),
          n2(ki.due),
        ];
      }),
    ];
    num = [2, 3, 4, 5, 6, 7];
    body = tableOf(rows, num);
  } else if (tab === "stockval") {
    const R = [];
    RAW.forEach((r) => {
      const q = qty("RAW:" + r.unit, r.id, r.uom);
      R.push([
        "Raw material",
        r.n,
        UNITS[r.unit].n,
        n2(q),
        r.uom,
        n2(COST.raw[r.id]),
        n2(q * COST.raw[r.id]),
      ]);
    });
    PLAINS.forEach((k) => {
      const q = sum(["M", "P", "Z"], (u) => qty("PLAIN:" + u, k, "kg"));
      if (q > 0)
        R.push([
          "Plain beads",
          plainName(k),
          "All",
          n2(q),
          "kg",
          n2(COST.plain),
          n2(q * COST.plain),
        ]);
    });
    PRODUCTS.forEach((p) => {
      const q = qty("COAT:" + p.unit, p.id, "kg");
      if (q > 0)
        R.push([
          "Coated",
          pname(p) + " " + p.grade,
          UNITS[p.unit].n,
          n2(q),
          "kg",
          n2(COST.coat),
          n2(q * COST.coat),
        ]);
    });
    PRODUCTS.forEach((p) => {
      const bj = sum(
        S.jobs.filter((j) => j.product === p.id),
        (j) => jobBal(j).bal,
      );
      if (bj > 0)
        R.push([
          "With karigar",
          pname(p) + " " + p.grade,
          KM[S.jobs.find((j) => j.product === p.id && jobBal(j).bal > 0).kar].n,
          n2(bj),
          "kg",
          n2(COST.coat),
          n2(bj * COST.coat),
        ]);
    });
    PRODUCTS.forEach((p) => {
      const q = qty("FIN:" + p.unit, p.id, "bunch"),
        c = S.kpb[p.id] * COST.coat + S.karRate;
      if (q > 0)
        R.push([
          "Finished",
          pname(p) + " " + p.grade,
          UNITS[p.unit].n,
          n2(q),
          "bunch",
          n2(c),
          n2(q * c),
        ]);
    });
    rows = [
      ["Category", "Item", "Location", "Qty", "UOM", "Unit cost ₹", "Value ₹"],
      ...R,
    ];
    const cats = [...new Set(R.map((r) => r[0]))].map((c) => [
        c,
        sum(
          R.filter((r) => r[0] === c),
          (r) => +r[6],
        ),
      ]),
      tot = sum(cats, (c) => c[1]);
    rows.push(["Total", "", "", "", "", "", n2(tot)]);
    num = [3, 5, 6];
    body =
      `<div class="kpis">${cats.map(([c, v]) => `<div class="kpi"><span>${c}</span><b>${rs(v)}</b></div>`).join("")}<div class="kpi"><span>${L("Kul", "Total")}</span><b>${rs(tot)}</b></div></div><p class="muted" style="font-size:13px">${L("Cost sample hai (GPPS last inward rate, coating ₹178/kg, threading ₹/bunch). Owner ke asli cost se badlega.", "Costs are samples (last GPPS inward rate, coating ₹178/kg, threading per bunch). They will use the owner's real costs.")}</p>` +
      tableOf(rows, num);
  } else {
    const inv = S.invoices
      .filter((i) => i.type === "GST" && i.ts >= a && i.ts < b)
      .sort((x, y) => x.ts - y.ts);
    const dt = (ts) => {
      const d = new Date(ts);
      return (
        d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, "0") +
        String(d.getDate()).padStart(2, "0")
      );
    };
    const le = (n, pos, amt) =>
      `   <ALLLEDGERENTRIES.LIST><LEDGERNAME>${n}</LEDGERNAME><ISDEEMEDPOSITIVE>${pos ? "Yes" : "No"}</ISDEEMEDPOSITIVE><AMOUNT>${n2(amt)}</AMOUNT></ALLLEDGERENTRIES.LIST>`;
    const xml =
      `<ENVELOPE>\n <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>\n <BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC><REQUESTDATA>\n` +
      inv
        .map((i) => {
          const p = PTY[i.party];
          return `  <TALLYMESSAGE xmlns:UDF="TallyUDF"><VOUCHER VCHTYPE="Sales" ACTION="Create">\n   <DATE>${dt(i.ts)}</DATE><VOUCHERNUMBER>${i.no}</VOUCHERNUMBER><PARTYLEDGERNAME>${esc(p.n)}</PARTYLEDGERNAME>\n${[le(esc(p.n), true, -i.total), le("Sales GST 18%", false, i.taxable), i.cgst ? le("Output CGST 9%", false, i.cgst) : "", i.sgst ? le("Output SGST 9%", false, i.sgst) : "", i.igst ? le("Output IGST 18%", false, i.igst) : "", Math.abs(i.round) > 0.001 ? le("Round Off", false, i.round) : ""].filter(Boolean).join("\n")}\n  </VOUCHER></TALLYMESSAGE>`;
        })
        .join("\n") +
      `\n </REQUESTDATA></IMPORTDATA></BODY>\n</ENVELOPE>`;
    CSV.tally = xml;
    body = `<p class="muted" style="font-size:13px">${L("Tally Prime mein Import → Vouchers. Ledger ke naam owner ke Tally ke hisaab se badlenge. Sample format.", "Import into Tally Prime via Import → Vouchers. Ledger names will match the owner's Tally. Sample format.")} · ${inv.length} voucher</p><pre class="xml">${esc(xml)}</pre>`;
  }
  if (tab !== "tally") CSV[tab] = csvOf(rows);
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l]) => `<button type="button" data-a="ui" data-k="repTab" data-val="${k}" aria-pressed="${tab === k}">${l}</button>`).join("")}</div>
   <div class="seg" role="group">${[
     [0, L("Is mahina", "This month")],
     [1, L("Pichhla mahina", "Last month")],
   ]
     .map(
       ([k, l]) =>
         `<button type="button" data-a="ui" data-k="repMonth" data-val="${k}" aria-pressed="${+(S.ui.repMonth || 0) === k}">${l}</button>`,
     )
     .join("")}</div></div>
   <section class="card"><div class="card-h"><div><h3>${tabs.find((x) => x[0] === tab)[1]} · ${monthLabel()}</h3><p>${L("Asli app mein Excel/CSV file download hogi. Yahan copy karke Excel mein paste kar sakte ho.", "The real app downloads an Excel/CSV file. Here you can copy and paste it into Excel.")}</p></div><button type="button" class="btn pri sm" data-a="copyCsv" data-k="${tab}">${ic("sheet", 15)} ${tab === "tally" ? L("XML copy karo", "Copy XML") : L("CSV copy karo", "Copy CSV")}</button></div>${body}</section>`;
}
function wageSlipModal(op, m) {
  const w = opWage().find((x) => x.op === op && x.m === m);
  if (!w) return;
  const r = S.pieceRate[w.u],
    ds = Object.entries(w.days).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  openModal(
    L("Wage slip", "Wage slip"),
    `${esc(op)} · ${m} · ${monthLabel()}`,
    `<div class="paper"><div class="ph"><div><h3>MK Plastics</h3><div class="m">${L("Piece-rate wage slip", "Piece-rate wage slip")}</div></div><div style="text-align:right"><div class="stamp">${monthLabel()}</div><b>${esc(op)}</b><div class="m">${m} · ${UNITS[w.u].n} · ₹${n2(r)}/kg</div></div></div>
   <div class="tw" style="margin-inline:0;padding-inline:0"><table><thead><tr><th>${L("Tarikh", "Date")}</th><th class="r">${L("Achha maal", "Good kg")}</th><th class="r">${L("Kamai", "Earning")}</th></tr></thead><tbody>${ds.map(([d, v]) => `<tr><td>${new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", weekday: "short" })}</td><td class="r">${kg(v)}</td><td class="r">₹${n2(v * r)}</td></tr>`).join("")}</tbody></table></div>
   <div class="tots"><div><span>${L("Kul kg", "Total kg")}</span><span class="num">${kg(w.kg)}</span></div><div class="g"><span>${L("Kul kamai", "Total earned")}</span><span class="num">${rs(w.kg * r)}</span></div></div><div class="m">${L("Sirf approved entry. Sample rate.", "Approved entries only. Sample rate.")}</div><div class="sig2"><span>${L("Operator ka sign", "Operator signature")}</span><span>Admin</span></div></div>`,
    `<button type="button" class="btn" data-a="close">${L("Theek hai", "Done")}</button><button type="button" class="btn pri" data-a="fakePrint">${ic("print", 16)} Print</button>`,
    { wide: true },
  );
}

/* illustrations for new workflows */
const miniQR = (x, y, s) => {
  const p = [
    [1, 1, 1, 0, 1],
    [1, 0, 1, 1, 0],
    [1, 1, 1, 0, 1],
    [0, 1, 0, 1, 1],
    [1, 0, 1, 1, 1],
  ];
  let o = "";
  p.forEach((r, i) =>
    r.forEach((v, j) => {
      if (v)
        o += `<rect x="${x + j * s}" y="${y + i * s}" width="${s}" height="${s}" style="fill:#111"/>`;
    }),
  );
  return o;
};
Object.assign(ILLO, {
  slip: () => `<g class="a-print"><rect x="58" y="20" width="74" height="80" rx="2" style="fill:#fff;stroke:var(--line)" stroke-width="1.5"/><path d="M66 32h40M66 40h30M66 48h44M66 56h24" style="stroke:#555" stroke-width="2" stroke-linecap="round"/>${miniQR(98, 60, 5)}<text x="66" y="72" style="fill:#111;font-size:8px;font-weight:600">NET</text><text x="66" y="84" style="fill:#111;font-size:10px;font-weight:700">25.00</text></g>
  <rect x="38" y="96" width="114" height="36" rx="9" style="fill:var(--navy)"/><rect x="52" y="98" width="86" height="4" rx="2" style="fill:var(--ink);opacity:.5"/><circle cx="138" cy="118" r="3.5" class="a-pulse" style="fill:var(--ok)"/>
  <path d="M168 128c-4-26 0-40 10-46h34c10 6 14 20 10 46z" style="fill:var(--sand);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/>
  <g class="a-pop2"><rect x="178" y="96" width="34" height="24" rx="3" style="fill:#fff;stroke:var(--navy)" stroke-width="1.2"/>${miniQR(181, 99, 3.6)}<path d="M201 102h8M201 107h6M201 112h8" style="stroke:#555" stroke-width="1.6"/></g>
  <line x1="16" y1="134" x2="224" y2="134" class="ln2"/>`,
  count: () => `<path d="M18 64h108M18 116h108" class="ln"/>
  <path d="M26 64c-2-14 0-22 6-25h16c6 3 8 11 6 25z" style="fill:var(--sand);stroke:var(--navy)" stroke-width="1.6"/><rect x="62" y="38" width="26" height="26" rx="3" style="fill:var(--u-p-soft);stroke:var(--navy)" stroke-width="1.6"/><rect x="94" y="44" width="24" height="20" rx="3" style="fill:var(--u-m-soft);stroke:var(--navy)" stroke-width="1.6"/>
  <path d="M26 116c-2-14 0-22 6-25h16c6 3 8 11 6 25z" style="fill:var(--sand);stroke:var(--navy)" stroke-width="1.6"/><path d="M62 116c-2-14 0-22 6-25h16c6 3 8 11 6 25z" style="fill:var(--sand);stroke:var(--navy)" stroke-width="1.6"/><rect x="94" y="92" width="24" height="24" rx="3" style="fill:var(--u-z-soft);stroke:var(--navy)" stroke-width="1.6"/>
  ${[
    [40, 30],
    [75, 30],
    [106, 36],
    [40, 82],
    [75, 82],
    [106, 84],
  ]
    .map(
      ([x, y], i) =>
        `<g class="a-tick" style="${dl(i * 0.35)}"><circle cx="${x}" cy="${y}" r="5" style="fill:var(--gold)"/></g>`,
    )
    .join("")}
  <rect x="146" y="22" width="76" height="106" rx="7" class="pap"/><rect x="170" y="16" width="28" height="10" rx="3" style="fill:var(--navy)"/>
  <text x="156" y="48" class="it">33.2 kg</text><text x="156" y="66" class="it">148 bunch</text><text x="156" y="84" class="it">52 L</text><path d="M156 96h50M156 108h36" class="ln thin"/>
  <g class="a-pop2"><rect x="196" y="56" width="30" height="16" rx="8" style="fill:var(--warn)"/><text x="211" y="67.5" text-anchor="middle" class="it inv">−2</text></g>
  <g class="a-show"><circle cx="212" cy="118" r="10" style="fill:var(--ok)"/><path d="M207.5 118l3 3 6-7" class="ck"/></g>`,
  khata:
    () => `<path d="M120 40v84M98 124h44" class="ln" stroke-width="3"/><circle cx="120" cy="40" r="4" style="fill:var(--navy)"/>
  <g class="a-tilt"><line x1="56" y1="44" x2="184" y2="44" class="ln" stroke-width="3"/>
   <path d="M60 46l-14 34M60 46l14 34M180 46l-14 34M180 46l14 34" class="ln thin"/><path d="M40 80h40a20 8 0 0 1-40 0z" style="fill:var(--gold-soft);stroke:var(--navy)" stroke-width="1.6"/><path d="M160 80h40a20 8 0 0 1-40 0z" style="fill:var(--gold-soft);stroke:var(--navy)" stroke-width="1.6"/>
   ${bd(52, 76, 4, "pink")}${bd(60, 74, 4, "white")}${bd(68, 76, 4, "pink")}${bd(56, 69, 4, "white")}${bd(64, 68, 4, "pink")}
   ${Array.from({ length: 8 }, (_, i) => {
     const a = (i / 8) * Math.PI * 2;
     return bd(
       178 + Math.cos(a) * 8,
       70 + Math.sin(a) * 6,
       2.8,
       i % 2 ? "pink" : "white",
     );
   }).join("")}<circle cx="194" cy="76" r="2" style="fill:var(--muted)"/></g>
  <text x="60" y="104" text-anchor="middle" class="it mu">${L("bheja", "issued")}</text><text x="180" y="104" text-anchor="middle" class="it mu">${L("wapas", "back")}</text>
  <g class="a-show"><rect x="94" y="12" width="52" height="18" rx="9" style="fill:var(--ok)"/><text x="120" y="24.5" text-anchor="middle" class="it inv">≤ 1.5%</text></g>
  <g class="a-coin2">${bd(196, 120, 8, "gold")}</g><line x1="16" y1="132" x2="224" y2="132" class="ln2"/>`,
});
Object.assign(UCIL, {
  "UC-19": "slip",
  "UC-20": "slip",
  "UC-21": "khata",
  "UC-22": "expense",
  "UC-23": "count",
});
UCS.push(
  {
    id: "UC-19",
    r: ["staff"],
    t: ["Bori ki slip aur QR sticker", "Bag slip and QR stickers"],
    k: ["Entry save hote hi", "Right after saving an entry"],
    s: [
      ['"Entry Daalo" → Save', '"Add entry" → Save'],
      [
        "58 mm weighment slip apne aap khulti hai",
        "The 58 mm weighment slip opens by itself",
      ],
      [
        '"Bori sticker": har 25 kg bori ka QR',
        '"Bag stickers": a QR for every 25 kg bag',
      ],
      ["Bori par chipkao, slip par sign", "Stick them on, sign the slip"],
    ],
    o: [
      "Har bori ka lot no. aur QR. Lene wali unit scan karegi, size/rang mix nahi hoga. Slip par kamai bhi dikhti hai.",
      "Every bag gets a lot no. and QR. The receiving unit scans it, so sizes and colours never mix. The slip also shows earnings.",
    ],
    u: "stM2",
    v: "home",
  },
  {
    id: "UC-20",
    r: ["manager"],
    t: ["Karigar delivery challan", "Karigar delivery challan"],
    k: ["Karigar ko maal dete waqt", "When handing material to a karigar"],
    s: [
      [
        'Karigar → "Karigar ko bhejo" → save',
        'Karigar → "Send to karigar" → save',
      ],
      [
        "Rule 55 challan apne aap banta hai",
        "The Rule 55 challan is made automatically",
      ],
      ["Do copy print: karigar + office", "Print two copies: karigar + office"],
      ["Karigar sign kare", "The karigar signs"],
    ],
    o: [
      "Job work ka kagaz poora: kitna kg, keemat, wapas kab tak, chhoot %.",
      "Job-work paperwork is complete: kg, value, return date, tolerance %.",
    ],
    u: "mgrP",
    v: "karigar",
  },
  {
    id: "UC-21",
    r: ["admin"],
    t: ["Karigar ka hisaab band aur payment", "Close a karigar job and pay"],
    k: ["Karigar ka kaam poora hone par", "When the karigar finishes a job"],
    s: [
      ['Karigar → job par "Hisaab band"', 'Karigar → "Close job"'],
      [
        "App farak % nikalta hai (1.5% tak chhoot)",
        "The app works out the gap % (1.5% allowed)",
      ],
      [
        "Zyada ho toh penalty, ya reason ke saath maaf",
        "Over that: penalty, or waive with a reason",
      ],
      ['Khata → "+ Payment"', 'Khata → "+ Payment"'],
    ],
    o: [
      "Kamai, penalty, diya aur baaki, ek khate mein.",
      "Wages, penalties, payments and balance in one account.",
    ],
    u: "admin",
    v: "karigar",
  },
  {
    id: "UC-22",
    r: ["admin"],
    t: ["Operator wage aur export", "Operator wages and exports"],
    k: ["Mahine ke end mein", "At month end"],
    s: [
      ["Reports → Operator wage", "Reports → Operator wages"],
      ["Piece rate ₹/kg check karo", "Check the per-kg rates"],
      ["Operator par tap: wage slip", "Tap an operator: wage slip"],
      [
        "GSTR-1 / Tally: copy karke CA ko",
        "GSTR-1 / Tally: copy and send to the CA",
      ],
    ],
    o: [
      "Payroll aur GST data bina dobara likhe Excel ya Tally mein.",
      "Payroll and GST data go to Excel or Tally without re-typing.",
    ],
    u: "admin",
    v: "reports",
  },
  {
    id: "UC-23",
    r: ["manager", "admin"],
    t: ["Physical stock ginti", "Physical stock count"],
    k: ["Hafte mein ek baar", "Once a week"],
    s: [
      [
        'Maal → Stock ginti → "Nayi ginti"',
        'Material → Stock count → "New count"',
      ],
      [
        "Har item gin/toul ke daalo (system number chhupa)",
        "Count or weigh each item (system figure hidden)",
      ],
      ["Admin ko bhejo", "Send to Admin"],
      [
        "Admin: Stock → Ginti approval → Approve",
        "Admin: Stock → Count approvals → Approve",
      ],
    ],
    o: [
      "Farak ka adjustment ban jaata hai, Record mein likha. Stock app se match.",
      "Gaps become stock adjustments, logged in Activity. Stock matches the app.",
    ],
    u: "mgrP",
    v: "maal",
    tk: "maalTab",
    tv: "count",
  },
);
(() => {
  const R = Object.fromEntries(ROLES.map((r) => [r.r, r]));
  R.admin.daily.push([
    "Karigar ka hisaab band karna aur payment",
    "Close karigar jobs and pay them",
  ]);
  R.admin.period.push(
    [
      "Mahine ke end: operator wage, GSTR-1, Tally export",
      "Month end: operator wages, GSTR-1, Tally export",
    ],
    ["Physical stock ginti approve karna", "Approve physical stock counts"],
  );
  R.admin.sc = [
    "Home, Orders, Stock, Products, Production, Karigar, Khaata, Kharcha, Reports, Record, Team",
    "Home, Orders, Stock, Products, Production, Karigar, Accounts, Expenses, Reports, Activity, Team",
  ];
  R.manager.daily.push([
    "Karigar ko maal ke saath challan dena",
    "Hand the challan to the karigar with the goods",
  ]);
  R.manager.period.push([
    "Ginti app mein daalna, Admin approve karega",
    "Enter the count in the app for Admin approval",
  ]);
  R.staff.daily.push([
    "Har entry ke baad slip aur bori par QR sticker",
    "A slip and bag QR stickers after each entry",
  ]);
  R.staff.acc.push([
    "Sahi bori par sahi sticker",
    "The right sticker on the right bag",
  ]);
  R.staff.who = [
    "Har machine ka operator: Moulding M1–M2, Pearl P1–P2, Metalizing MZ1. Kamai piece-rate (₹ per kg achha maal).",
    "The operator of each machine: Moulding M1–M2, Pearl P1–P2, Metalizing MZ1. Paid piece-rate (₹ per good kg).",
  ];
  R.staff.no = R.staff.no.filter((x) => !x[0].startsWith("Rate"));
  R.staff.no.unshift([
    "Bechne ka rate, bill, payment",
    "Selling rates, bills, payments",
  ]);
})();
PERMS.push(
  [
    ["Bori slip / QR sticker", "Bag slip / QR sticker"],
    "y",
    "y",
    "y:apni entry|own entries",
  ],
  [
    ["Karigar challan", "Karigar challan"],
    "y",
    "y:Pearl, Metalizing|Pearl, Metalizing",
    "x",
  ],
  [
    [
      "Karigar hisaab band, penalty, payment",
      "Close karigar jobs, penalty, payment",
    ],
    "y",
    "x",
    "x",
  ],
  [
    ["Physical stock ginti", "Physical stock count"],
    "y:approve|approve",
    "y:ginti daalna|enters count",
    "x",
  ],
  [
    ["Reports, wage register, export", "Reports, wage register, exports"],
    "y",
    "x",
    "x",
  ],
  [["Apni piece-rate kamai", "Own piece-rate earnings"], "y", "x", "y"],
);
const _ga = getAlerts;
getAlerts = function () {
  const A = _ga();
  const pc = S.counts.filter((c) => c.status === "pending").length;
  if (pc)
    A.unshift([
      "info",
      "scale",
      L(
        `${pc} stock ginti approval ke liye ruki hai`,
        `${pc} stock ${pc > 1 ? "counts" : "count"} awaiting approval`,
      ),
      "stock",
      "counts",
    ]);
  const op = S.jobs.filter(
    (j) => !j.closed && j.receipts.length && rawBal(j).bal <= j.sent * 0.05,
  ).length;
  if (op)
    A.push([
      "info",
      "thread",
      L(
        `${op} karigar job ka hisaab band karna baaki`,
        `${op} karigar ${op > 1 ? "jobs" : "job"} ready to close`,
      ),
      "karigar",
    ]);
  return A;
};
Object.assign(ICONS, {
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3M14 21h1"/>',
  print:
    '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  sheet:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
});
Object.assign(ACT, {
  slip(el) {
    slipModal(el.dataset.id);
  },
  stickers(el) {
    stickersModal(el.dataset.id);
  },
  challan(el) {
    challanModal(el.dataset.id);
  },
  packing(el) {
    packingModal(el.dataset.id);
  },
  fakePrint() {
    toast(
      L(
        "Prototype mein print nahi hota. Asli app mein thermal / normal printer par jaayega.",
        "The prototype cannot print. The real app sends this to a thermal or normal printer.",
      ),
    );
  },
  closeJob(el) {
    closeJobModal(el.dataset.id);
  },
  karKhata(el) {
    karKhataModal(el.dataset.id);
  },
  karPay(el) {
    karPayModal(el.dataset.id);
  },
  countNew() {
    countModal();
  },
  countApprove(el) {
    const c = S.counts.find((x) => x.id === el.dataset.id);
    let n = 0;
    c.lines.forEach((l) => {
      const d = l.cnt - l.sys;
      if (Math.abs(d) > 0.001) {
        move(l.loc, l.item, l.uom, d);
        n++;
      }
    });
    c.status = "approved";
    c.by2 = user().n;
    logA(
      `${UNITS[c.unit].n} ginti approve: ${n} item adjust`,
      `${UNITS[c.unit].n} count approved: ${n} items adjusted`,
    );
    render();
    toast(
      L(`${n} item ka stock theek ho gaya.`, `Stock adjusted for ${n} items.`),
    );
  },
  countReject(el) {
    const i = document.getElementById("cn-" + el.dataset.id),
      r = i.value.trim();
    if (!r) {
      i.focus();
      return;
    }
    const c = S.counts.find((x) => x.id === el.dataset.id);
    c.status = "rejected";
    c.note = r;
    logA(
      `${UNITS[c.unit].n} ginti wapas: ${r}`,
      `${UNITS[c.unit].n} count rejected: ${r}`,
    );
    render();
    toast(L("Ginti wapas. Dobara gino.", "Count rejected. Count again."));
  },
  savePiece() {
    Object.keys(UNITS).forEach((k) => {
      const v = +document.getElementById("pr-" + k).value;
      if (v >= 0) S.pieceRate[k] = v;
    });
    logA("Piece rate badla", "Piece rates updated");
    render();
    toast(L("Piece rate save.", "Piece rates saved."));
  },
  wageSlip(el) {
    wageSlipModal(el.dataset.op, el.dataset.m);
  },
  copyCsv(el) {
    const k = el.dataset.k,
      txt = CSV[k] || "";
    const fb = () => {
      openModal(
        L("Copy karo", "Copy"),
        L(
          "Text select hai, Ctrl+C / Copy dabao",
          "The text is selected, press Ctrl+C / Copy",
        ),
        `<textarea id="cpy" style="width:100%;min-height:260px;font-family:ui-monospace,monospace;font-size:12px;border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--surface)">${esc(txt.replace(/^﻿/, ""))}</textarea>`,
        `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "Done")}</button>`,
      );
      const t = document.getElementById("cpy");
      t.focus();
      t.select();
    };
    try {
      navigator.clipboard
        .writeText(txt.replace(/^﻿/, ""))
        .then(() =>
          toast(
            L(
              "Copy ho gaya. Excel mein paste karo.",
              "Copied. Paste it into Excel.",
            ),
          ),
        )
        .catch(fb);
    } catch (e) {
      fb();
    }
  },
});
Object.assign(FORMS, {
  closeJob(f) {
    const j = S.jobs.find((x) => x.id === f.dataset.id),
      b = rawBal(j),
      un = b.bal,
      pct = j.sent ? (un / j.sent) * 100 : 0,
      over = Math.max(0, un - (j.sent * S.tol) / 100),
      w = f.waive && f.waive.checked;
    j.closed = true;
    j.closeTs = Date.now();
    j.loss = un;
    j.penalty = pct > S.tol && !w ? Math.round(over * S.penRate) : 0;
    logA(
      `${KM[j.kar].n} ka job ${j.challan} band · ${kg(un)} farak${j.penalty ? " · penalty " + rs(j.penalty) : w ? " · penalty maaf" : ""}`,
      `Closed ${KM[j.kar].n} job ${j.challan} · ${kg(un)} gap${j.penalty ? " · penalty " + rs(j.penalty) : w ? " · penalty waived" : ""}`,
    );
    closeModal();
    render();
    toast(L("Hisaab band ho gaya.", "Job closed."));
  },
  karPay(f) {
    const a = +f.amount.value;
    if (!(a > 0)) {
      f.amount.focus();
      return;
    }
    const kid = f.dataset.id;
    S.karPays.push({
      id: nid(),
      kar: kid,
      amount: Math.round(a),
      mode: f.querySelector("[name=mode]:checked").value,
      ts: Date.now(),
    });
    logA(`${KM[kid].n} ko ${rs(a)} diya`, `Paid ${rs(a)} to ${KM[kid].n}`);
    render();
    karKhataModal(kid);
    toast(L(`${rs(a)} payment save.`, `${rs(a)} payment saved.`));
  },
  count(f) {
    const u = user(),
      items = draft.items,
      lines = items.map((it, i) => {
        const v = f["c" + i].value,
          sys = qty(it.loc, it.item, it.uom);
        return {
          loc: it.loc,
          item: it.item,
          uom: it.uom,
          sys,
          cnt:
            v === ""
              ? sys
              : it.uom === "bunch" || it.uom === "pcs" || it.uom === "roll"
                ? Math.round(+v)
                : r1(+v),
        };
      });
    S.counts.push({
      id: nid(),
      unit: u.unit,
      by: u.n,
      ts: Date.now(),
      status: "pending",
      lines,
    });
    const d = lines.filter((l) => Math.abs(l.cnt - l.sys) > 0.001).length;
    logA(
      `${UNITS[u.unit].n}: stock ginti bheji (${d} farak)`,
      `${UNITS[u.unit].n}: stock count sent (${d} gaps)`,
    );
    closeModal();
    render();
    toast(L("Ginti Admin ko chali gayi.", "Count sent to the Admin."));
  },
});

/* ---------- no-scrollbar helpers: stack labels + edge fades ---------- */
function enhance(root) {
  if (!root) return;
  root.querySelectorAll(".tw table").forEach((tb) => {
    const hs = [...tb.querySelectorAll("thead th")].map((th) =>
      th.textContent.trim(),
    );
    tb.querySelectorAll("tbody tr").forEach((tr) => {
      let i = 0;
      [...tr.children].forEach((td) => {
        if (!td.hasAttribute("data-label"))
          td.setAttribute("data-label", hs[i] || "");
        i += +(td.getAttribute("colspan") || 1);
      });
    });
  });
  root.querySelectorAll(".tw").forEach(fadeUpd);
}
function fadeUpd(el) {
  const l = el.scrollLeft > 2,
    r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
  el.classList.toggle("fl", l);
  el.classList.toggle("fr", r);
}
document.addEventListener(
  "scroll",
  (e) => {
    const t = e.target;
    if (t && t.classList && t.classList.contains("tw")) fadeUpd(t);
  },
  true,
);
addEventListener("resize", () =>
  document.querySelectorAll(".tw").forEach(fadeUpd),
);
const _renderNS = render;
render = function () {
  _renderNS();
  enhance(document.getElementById("app"));
};
const _openNS = openModal;
openModal = function (...a) {
  _openNS(...a);
  enhance(document.getElementById("modal-root"));
};

/* ---------- fresh start: masters stay, all transactions zero ---------- */
PARTIES.forEach((p) => {
  p.open = 0;
});
const _seedFull = seed;
seed = function () {
  _seedFull();
  Object.assign(S, {
    stock: {},
    entries: [],
    transfers: [],
    inwards: [],
    jobs: [],
    orders: [],
    dispatches: [],
    invoices: [],
    payments: [],
    expenses: [],
    log: [],
    outbox: [],
    shift: {},
    closed: {},
    counts: [],
    karPays: [],
    lastUser: null,
  });
  S.seq = { order: 1001, gst: 1, kb: 1, id: S.seq.id, lot: 1, jw: 1 };
  S.ui.lastProd = {};
  S.users.forEach((u) => {
    u.last = null;
    u.fails = 0;
  });
  logA("App shuru: saara data zero", "App started: all data at zero", {
    n: "System",
    role: "admin",
  });
};

/* ---------- admin: add stock directly (opening stock, purchase, return, correction) ---------- */
const STAGES = [
  ["raw", "Raw material", "Raw material"],
  ["plain", "Plain beads", "Plain beads"],
  ["coat", "Coated (bina dhaage)", "Coated (unthreaded)"],
  ["fin", "Taiyaar maal", "Finished"],
];
const STK_REASONS = [
  ["open", "Opening stock", "Opening stock"],
  ["buy", "Kharid", "Purchase"],
  ["ret", "Wapas aaya", "Return"],
  ["fix", "Sudhar", "Correction"],
];
const intUom = (u) => u === "bunch" || u === "pcs" || u === "roll";
function stkLocs(st) {
  return (st === "coat" || st === "fin" ? ["P", "Z"] : ["M", "P", "Z"]).map(
    (k) => [k, UNITS[k].n],
  );
}
function stkItems(st, u) {
  if (st === "raw")
    return RAW.filter((r) => r.unit === u).map((r) => [r.id, r.n, r.uom]);
  if (st === "plain") return PLAINS.map((k) => [k, plainName(k), "kg"]);
  return PRODUCTS.filter((p) => p.unit === u).map((p) => [
    p.id,
    pname(p) + " · " + psub(p),
    st === "fin" ? "bunch" : "kg",
  ]);
}
const stkLocKey = (st, u) =>
  ({ raw: "RAW", plain: "PLAIN", coat: "COAT", fin: "FIN" })[st] + ":" + u;
function stkLineName(l) {
  const [k] = l.loc.split(":");
  return k === "RAW"
    ? RM[l.item].n
    : k === "PLAIN"
      ? plainName(l.item)
      : pname(PM[l.item]) + " · " + psub(PM[l.item]);
}
function addStockModal() {
  draft = { lines: [] };
  openModal(
    L("Stock jodo", "Add stock"),
    L(
      "Godown mein jo maal hai, seedha stock mein jodo",
      "Add goods that are physically in your store",
    ),
    `<div class="fld"><span class="lb">${L("Kaunsa maal?", "Which stage?")}</span><div class="radios">${STAGES.map(([k, h, e], i) => `<label><input type="radio" name="stage" value="${k}" ${i ? "" : "checked"}>${L(h, e)}</label>`).join("")}</div></div>
   <div class="row2"><div class="fld"><label for="sl">Unit</label><select id="sl" name="loc"></select></div><div class="fld"><label for="si">Item</label><select id="si" name="item"></select></div></div>
   <div class="row2" style="align-items:end"><div class="fld"><label for="sq">${L("Kitna", "Quantity")} <span id="su"></span></label><input id="sq" name="qty" class="big-in" type="number" inputmode="decimal" min="0" step="0.1"><span class="hint" id="sh"></span></div>
    <button type="button" class="btn" data-a="stkAddLine" style="min-height:60px">${ic("plus", 16)} ${L("List mein daalo", "Add to list")}</button></div>
   <p class="err" id="serr" role="alert"></p>
   <div id="slist"></div>
   <div class="fld"><span class="lb">${L("Kyun?", "Reason")}</span><div class="radios">${STK_REASONS.map(([k, h, e], i) => `<label><input type="radio" name="reason" value="${k}" ${i ? "" : "checked"}>${L(h, e)}</label>`).join("")}</div></div>
   <div class="fld"><label for="sn">Note</label><input id="sn" name="note" placeholder="${L("Jaise: 1 Nov ka godown ginti", "e.g. store count on 1 Nov")}"></div>
   <div class="note">${ic("inbox", 16)}<span>${L('Supplier se naya maal bill ke saath aaye toh "Maal → Inward" behtar hai, usmein bill photo aur rate judta hai.', 'For new supplier goods with a bill, "Material → Inward" is better: it keeps the bill photo and rate.')}</span></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit" id="ssave">${ic("check", 16)} ${L("Stock save karo", "Save stock")}</button>`,
    { form: "addStock", live: "addStock", wide: true, nofocus: true },
  );
}
LIVE.addStock = (f) => {
  const st = f.querySelector("[name=stage]:checked").value;
  if (f.dataset.st !== st) {
    f.dataset.st = st;
    const cur = f.loc.value;
    const ls = stkLocs(st);
    f.loc.innerHTML = ls
      .map(
        ([k, n]) =>
          `<option value="${k}" ${k === cur ? "selected" : ""}>${n}</option>`,
      )
      .join("");
    f.dataset.lk = "";
  }
  const lk = st + "|" + f.loc.value;
  if (f.dataset.lk !== lk) {
    f.dataset.lk = lk;
    f.item.innerHTML = stkItems(st, f.loc.value)
      .map(
        ([v, n, u]) =>
          `<option value="${esc(v)}" data-u="${u}">${esc(n)}</option>`,
      )
      .join("");
  }
  const opt = f.item.selectedOptions[0],
    uom = opt ? opt.dataset.u : "kg";
  document.getElementById("su").textContent = "(" + uom + ")";
  f.qty.step = intUom(uom) ? "1" : "0.1";
  document.getElementById("sh").textContent = opt
    ? L("Abhi stock: ", "In stock now: ") +
      fq(qty(stkLocKey(st, f.loc.value), f.item.value, uom), uom)
    : "";
  const ls = (draft && draft.lines) || [];
  document.getElementById("slist").innerHTML = ls.length
    ? `<div class="sumbox">${ls.map((l, i) => `<div><span>${esc(stkLineName(l))} <span class="psub">· ${UNITS[l.loc.split(":")[1]].n}</span></span><span style="display:flex;gap:8px;align-items:center"><b>+${fq(l.qty, l.uom)}</b><button type="button" class="xbtn" style="width:28px;height:28px" data-a="stkDel" data-i="${i}" aria-label="${L("Hatao", "Remove")}">${ic("x", 14)}</button></span></div>`).join("")}<div class="tot"><span>${ls.length} item</span><span></span></div></div>`
    : "";
  const pend = +f.qty.value > 0 ? 1 : 0;
  document.getElementById("ssave").innerHTML =
    `${ic("check", 16)} ${L("Stock save karo", "Save stock")}${ls.length + pend ? ` (${ls.length + pend})` : ""}`;
};
function stkTakeLine(f) {
  const st = f.querySelector("[name=stage]:checked").value,
    opt = f.item.selectedOptions[0];
  if (!opt) return null;
  const uom = opt.dataset.u;
  let q = +f.qty.value;
  if (!(q > 0)) return null;
  q = intUom(uom) ? Math.round(q) : r1(q);
  return { loc: stkLocKey(st, f.loc.value), item: f.item.value, uom, qty: q };
}
Object.assign(ACT, {
  addStock() {
    addStockModal();
  },
  stkAddLine() {
    const f = document.querySelector("form[data-f=addStock]"),
      l = stkTakeLine(f),
      e = document.getElementById("serr");
    if (!l) {
      e.textContent = L(
        "Kitna hai, woh daalo (0 se zyada).",
        "Enter a quantity above 0.",
      );
      f.qty.focus();
      return;
    }
    const same = draft.lines.find((x) => x.loc === l.loc && x.item === l.item);
    if (same)
      same.qty = intUom(l.uom) ? same.qty + l.qty : r1(same.qty + l.qty);
    else draft.lines.push(l);
    e.textContent = "";
    f.qty.value = "";
    LIVE.addStock(f);
    f.qty.focus();
  },
  stkDel(el) {
    const f = document.querySelector("form[data-f=addStock]");
    draft.lines.splice(+el.dataset.i, 1);
    LIVE.addStock(f);
  },
});
FORMS.addStock = (f) => {
  const l = stkTakeLine(f);
  if (l) draft.lines.push(l);
  if (!draft.lines.length) {
    document.getElementById("serr").textContent = L(
      "Kam se kam ek item ka stock daalo.",
      "Add stock for at least one item.",
    );
    f.qty.focus();
    return;
  }
  const rs_ = f.querySelector("[name=reason]:checked").value,
    rr = STK_REASONS.find((x) => x[0] === rs_),
    note = f.note.value.trim();
  draft.lines.forEach((x) => {
    move(x.loc, x.item, x.uom, x.qty);
    const un = UNITS[x.loc.split(":")[1]].n;
    logA(
      `Stock joda (${rr[1]}): +${fq(x.qty, x.uom)} ${stkLineName(x)} · ${un}${note ? " · " + note : ""}`,
      `Stock added (${rr[2]}): +${fq(x.qty, x.uom)} ${stkLineName(x)} · ${un}${note ? " · " + note : ""}`,
    );
  });
  const n = draft.lines.length;
  closeModal();
  render();
  toast(
    L(
      `${n} item stock mein jud gaye.`,
      `${n} ${n > 1 ? "items" : "item"} added to stock.`,
    ),
  );
};
const _taAS = topAction;
topAction = function (u) {
  const b = `<button type="button" class="btn ${S.view === "stock" ? "pri" : ""}" data-a="addStock">${ic("box")}${L("Stock jodo", "Add stock")}</button>`;
  if (u.role === "admin" && S.view === "home") return b + _taAS(u);
  if (u.role === "admin" && S.view === "stock") return b;
  return _taAS(u);
};
const _ahAS = AV.home;
AV.home = function (u) {
  const empty = !Object.values(S.stock).some((v) => v > 0);
  return (
    (empty
      ? `<section class="card" style="background:var(--gold-soft);border-color:transparent"><div class="card-h"><div><h3>${L("Shuru karo: apna maujooda stock jodo", "Start here: add your current stock")}</h3><p>${L("Abhi app mein stock zero hai. Godown mein jo GPPS, plain beads, coated maal aur bunch pade hain, woh yahan se ek baar mein jod do.", "The app has no stock yet. Add the GPPS, plain beads, coated beads and bunches already in your store, all in one go.")}</p></div><button type="button" class="btn pri" data-a="addStock">${ic("box")}${L("Stock jodo", "Add stock")}</button></div></section>`
      : "") + _ahAS(u)
  );
};
UCS.push({
  id: "UC-24",
  r: ["admin"],
  t: [
    "Seedha stock jodna (opening stock)",
    "Add stock directly (opening stock)",
  ],
  k: [
    "App shuru karte waqt, ya maal kahin aur se aaye",
    "When starting the app, or when goods arrive another way",
  ],
  s: [
    ['Home → "Stock jodo"', 'Home → "Add stock"'],
    [
      "Stage chuno: Raw / Plain / Coated / Taiyaar",
      "Pick the stage: Raw / Plain / Coated / Finished",
    ],
    [
      'Unit, item, kitna → "List mein daalo"',
      'Unit, item, quantity → "Add to list"',
    ],
    [
      "Reason (Opening / Kharid / Wapas / Sudhar) → Save",
      "Reason (Opening / Purchase / Return / Correction) → Save",
    ],
  ],
  o: [
    "Stock turant badhta hai. Har line Record mein likhi jaati hai.",
    "Stock goes up at once. Every line is written to Activity.",
  ],
  u: "admin",
  v: "home",
});
UCIL["UC-24"] = "count";
PERMS.push([
  ["Seedha stock jodna", "Add stock directly"],
  "y",
  "p:ginti se|via count",
  "x",
]);
(() => {
  const a = ROLES.find((r) => r.r === "admin");
  a.daily.unshift([
    'Pehli baar: Home → "Stock jodo" se maujooda stock',
    'First time: enter current stock via Home → "Add stock"',
  ]);
})();
