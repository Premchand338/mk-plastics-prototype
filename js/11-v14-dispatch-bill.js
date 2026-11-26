'use strict';
/* ===== v14.2 · dispatch first, then bill (owner's answer to Q11, 26 Nov 2026) =====
   - Only the owner (admin) dispatches and bills.
   - Dispatch screen: packets, truck no., dispatch date, rate per item (filled from the slip).
     Two ways, the owner picks the default in "Bill setting":
       "Abhi bill banao" → dispatch + invoice in one step
       "Bill baad mein"  → dispatch only; the order shows under "Bill banana baaki", the owner fills the final rate later
   - Stock goes down at dispatch (CLAUDE rule 5). Every dispatch gets its own bill; orders are never mixed.
   - Invoice date = dispatch date (printed). The day the bill was made is kept as inv.billedAt (system only).
   - Invoice: Dekho · PDF download (browser print → Save as PDF) · WhatsApp share (summary text).
   - Bills not made within S.cfg14.billDays days → bell alert. Credit limit: warn (default) or block, owner's choice. */

const CFG14 = { billMode: "now", billDays: 2, creditMode: "warn" };
const _initV14b = initV14;
initV14 = function () {
  _initV14b();
  S.cfg14 = Object.assign({}, CFG14, S.cfg14 || {});
};
const isOwner14 = () => (user() || {}).role === "admin";
function ownerOnly14() {
  if (isOwner14()) return true;
  toast(L("Dispatch aur bill sirf owner kar sakta hai.", "Only the owner can dispatch and bill."));
  return false;
}
const dayTs14 = (ymd) => {
  // today → now (keeps the time); another day → noon of that day
  if (!ymd || ymd === ymd14(Date.now())) return Date.now();
  return new Date(ymd + "T12:00").getTime();
};
const billAgeDays14 = (d) => Math.floor((today0() + DAY - 1 - d.ts) / DAY);
const billLate14 = (d) => !d.invoice && !d.pending && billAgeDays14(d) >= (S.cfg14 || CFG14).billDays;

/* ---------- dispatch screen ---------- */
function dispRows14(o) {
  const A = alloc14();
  return o.lines
    .map((l, i) => {
      const rem = remBill(o, i),
        av = freeAvail(l),
        share = A.get(o.id + "|" + i) || 0,
        pack = l.pack || 1;
      return { l, i, rem, av, pack, mx: Math.floor(Math.min(rem, av) / pack), def: Math.floor(Math.min(rem, share) / pack) };
    })
    .filter((x) => x.rem > 0);
}
function dispatchModal14(oid) {
  if (!ownerOnly14()) return;
  const o = ordById(oid);
  if (!o) return;
  const p = PTY[o.party],
    rows = dispRows14(o),
    mode = S.cfg14.billMode;
  openModal(
    L("Dispatch karo", "Dispatch"),
    `Slip #${o.no} · ${esc(p.n)} · ${esc(p.city)}`,
    `<div class="slipbar"><span class="pill mute">Slip ${o.no} · ${fdate(slipOf(o).date)}</span>${route14(o) ? `<span class="pill mute">${ic("truck", 12)} ${route14(o)}</span>` : ""}</div>
   ${
     rows.length
       ? rows
           .map(({ l, i, rem, av, pack, mx, def }) => {
             const pr = PM[l.ref];
             return `<div class="dr14"><div class="t1">${esc(pname(pr))} · ${esc(psub(pr))}</div>
     <div class="row2"><div class="fld"><label for="dq${i}">${L("Kitne packet bhejna", "Packets to send")}</label><input id="dq${i}" name="pk${i}" type="number" inputmode="numeric" min="0" step="1" max="${mx}" value="${def}"><span class="hint">${pack} bunch / packet · ${L("order mein baaki", "left on order")} ${nf(Math.round(rem / pack))} · ${L("taiyaar", "ready")} ${nf(Math.floor(av / pack))}</span></div>
     <div class="fld b14"><label for="drt${i}">Rate ₹ / bunch</label><input id="drt${i}" name="rt${i}" data-g="${l.g}" type="number" inputmode="decimal" min="0" step="0.01" value="${l.rate || ""}"><span class="hint">${l.deal ? L("Slip ka deal rate", "Deal rate from the slip") : L("Rate list se", "From the rate list")}</span></div></div></div>`;
           })
           .join("")
       : `<div class="empty">${L("Is order mein bhejne ko kuch nahi.", "Nothing left to send on this order.")}</div>`
   }
   <div class="row2"><div class="fld"><label for="dv">${L("Gaadi number", "Vehicle no.")}</label><input id="dv" name="vehicle" placeholder="MH04 AB 1234" required></div><div class="fld"><label for="ddt">${L("Dispatch ki tareekh", "Dispatch date")}</label><input id="ddt" name="ddate" type="date" value="${ymd14(Date.now())}" max="${ymd14(Date.now())}" required><span class="hint">${L("Bill par yahi tareekh chhapegi", "This date is printed on the bill")}</span></div></div>
   <div class="fld"><label for="dp">${ic("camera", 14)} ${L("Maal ki photo", "Photo of the load")}</label><input id="dp" name="photo" type="file" accept="image/*"></div>
   <div class="fld"><span class="lb">${L("Bill kab?", "When to bill?")}</span><div class="radios"><label><input type="radio" name="bmode" value="now" ${mode === "now" ? "checked" : ""}>${L("Abhi bill banao", "Bill now")}</label><label><input type="radio" name="bmode" value="later" ${mode === "later" ? "checked" : ""}>${L("Bill baad mein", "Bill later")}</label></div><span class="hint" id="dmh"></span></div>
   <div class="fld b14"><span class="lb">${L("Kaunsa bill?", "Bill type")}</span><div class="radios"><label><input type="radio" name="type" value="GST" checked>GST tax invoice</label><label><input type="radio" name="type" value="KACHCHA">${L("Kachcha bill", "Estimate (kachcha)")}</label></div></div>
   <div class="sumbox" id="dsum"></div><div id="dcr"></div><p class="err" id="derr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit" id="dsave" ${rows.length ? "" : "disabled"}>${ic("truck", 16)} <span>${L("Dispatch karo", "Dispatch")}</span></button>`,
    { form: "dispatch14", live: "dispatch14", id: oid, wide: true, nofocus: true },
  );
}
function dispParts14(f, o) {
  const parts = [];
  o.lines.forEach((l, i) => {
    const el = f["pk" + i];
    if (!el) return;
    const pk = Math.round(+el.value || 0);
    if (pk > 0) parts.push({ i, pk, q: pk * (l.pack || 1), rate: f["rt" + i] ? +f["rt" + i].value || 0 : l.rate });
  });
  return parts;
}
function dispCheck14(f, o, parts, now) {
  if (!parts.length) return L("Kam se kam ek item ke packet daalo.", "Enter packets for at least one item.");
  if (parts.some((x) => x.q > Math.min(remBill(o, x.i), freeAvail(o.lines[x.i])) + 0.001))
    return L("Itna taiyaar stock nahi hai, ya order se zyada hai.", "More than the ready stock or the order.");
  if (now && parts.some((x) => !(x.rate > 0))) return L("Har item ka rate daalo.", "Enter a rate for every item.");
  return "";
}
LIVE.dispatch14 = (f) => {
  const o = ordById(f.dataset.id),
    p = PTY[o.party],
    now = f.querySelector("[name=bmode]:checked").value === "now",
    gst = f.querySelector("[name=type]:checked").value === "GST",
    parts = dispParts14(f, o),
    intra = p.state === "Maharashtra";
  f.querySelectorAll(".b14").forEach((el) => (el.hidden = !now));
  document.getElementById("dmh").textContent = now
    ? L("Dispatch ke saath hi invoice banega: dekho, PDF, WhatsApp.", "The invoice is made with the dispatch: view, PDF, WhatsApp.")
    : L('Abhi sirf dispatch. Bill "Bill banana baaki" mein rahega; final rate baad mein bharo.', 'Dispatch only. The bill waits under "Waiting to be billed"; fill the final rate later.');
  f.querySelector("#dsave span").textContent = now ? L("Dispatch + bill banao", "Dispatch + make bill") : L("Dispatch karo", "Dispatch");
  const tx = sum(parts, (x) => x.q * x.rate),
    tot = Math.round(gst ? tx * 1.18 : tx);
  document.getElementById("dsum").innerHTML =
    `<div><span>${L("Bhej rahe ho", "Sending")}</span><b>${nf(sum(parts, (x) => x.pk))} packet · ${nf(sum(parts, (x) => x.q))} bunch</b></div>` +
    (now
      ? `${parts.map((x) => `<div><span>${nf(x.pk)} packet × ${o.lines[x.i].pack || 1} bunch × ₹${nf(x.rate, 2)}</span><b>${rs(x.q * x.rate)}</b></div>`).join("")}<div><span>Taxable</span><b>${rs(tx)}</b></div>${gst ? (intra ? `<div><span>CGST 9% + SGST 9%</span><b>${rs(tx * 0.18)}</b></div>` : `<div><span>IGST 18% (${esc(p.state)})</span><b>${rs(tx * 0.18)}</b></div>`) : ""}<div class="tot"><span>${L("Bill ki rakam", "Bill amount")}</span><b>${rs(tot)}</b></div>`
      : "");
  const est = now ? tot : sum(parts, (x) => x.q * (x.rate || o.lines[x.i].rate)) * 1.18,
    after = partyInfo(p.id).out + est,
    over = after > p.limit,
    block = over && S.cfg14.creditMode === "block";
  document.getElementById("dcr").innerHTML = over
    ? `<div class="note ${block ? "bad" : "warn"}">${ic("alert", 16)}<span>${L(`Credit limit ${rs(p.limit)} paar: party ka baaki ${rs(after)} ho jaayega.`, `Over the ${rs(p.limit)} credit limit: the party will owe ${rs(after)}.`)}${block ? `<label style="display:flex;gap:8px;align-items:center;margin-top:6px;color:var(--ink)"><input type="checkbox" name="over"> ${L("Phir bhi bhejo (owner)", "Send anyway (owner)")}</label>` : ""}</span></div>`
    : "";
  const c = f.querySelector("[name=over]");
  if (c && f.dataset.over === "1") c.checked = true;
  if (c) c.onchange = () => ((f.dataset.over = c.checked ? "1" : ""), LIVE.dispatch14(f));
  document.getElementById("derr").textContent = parts.length ? dispCheck14(f, o, parts, now) : "";
  document.getElementById("dsave").disabled = !parts.length || (block && !(c && c.checked));
};
FORMS.dispatch14 = (f) => {
  if (!ownerOnly14()) return;
  const o = ordById(f.dataset.id),
    now = f.querySelector("[name=bmode]:checked").value === "now",
    type = f.querySelector("[name=type]:checked").value,
    parts = dispParts14(f, o),
    err = dispCheck14(f, o, parts, now);
  if (err) {
    document.getElementById("derr").textContent = err;
    return;
  }
  if (!f.vehicle.value.trim()) {
    document.getElementById("derr").textContent = L("Gaadi number daalo.", "Enter the vehicle number.");
    f.vehicle.focus();
    return;
  }
  const ts = dayTs14(f.ddate.value),
    d = {
      id: nid(),
      order: o.id,
      unit: PM[o.lines[parts[0].i].ref].unit,
      lines: parts.map((x) => ({ i: x.i, q: x.q, pk: x.pk })),
      ts,
      vehicle: f.vehicle.value.trim(),
      by: user().n,
      invoice: null,
      pending: false,
      v142: true,
    };
  d.lines.forEach(({ i, q }) => {
    lineTake(o.lines[i], q);
    o.lines[i].disp += q;
  });
  S.dispatches.push(d);
  logA(
    `Dispatch · Slip #${o.no} · ${PTY[o.party].n} · ${nf(sum(parts, (x) => x.pk))} packet · ${d.vehicle} · stock se minus`,
    `Dispatched · Slip #${o.no} · ${PTY[o.party].n} · ${nf(sum(parts, (x) => x.pk))} packets · ${d.vehicle} · stock reduced`,
  );
  closeModal();
  if (now) {
    const inv = billDispatch14(d, type, Object.fromEntries(parts.map((x) => [x.i, x.rate])));
    render();
    invoiceModal(inv.id);
    toast(L("Dispatch ho gaya aur bill ban gaya.", "Dispatched and billed."));
  } else {
    render();
    toast(L('Dispatch ho gaya. Bill "Bill banana baaki" mein hai.', 'Dispatched. The bill is under "Waiting to be billed".'));
  }
};
/* make the invoice for one dispatch: rates set on the order lines, invoice dated on the dispatch day */
function billDispatch14(d, type, rates) {
  const o = ordById(d.order),
    ch = [];
  d.lines.forEach(({ i }) => {
    const r = rates[i];
    if (r > 0 && Math.abs(r - o.lines[i].rate) > 0.0001) {
      ch.push(`₹${nf(o.lines[i].rate, 2)} → ₹${nf(r, 2)}`);
      o.lines[i].rate = r;
      o.lines[i].rateAt = "bill";
    }
  });
  if (ch.length)
    logA(`Slip #${o.no}: bill par rate badla (${ch.join(", ")})`, `Slip #${o.no}: rate changed at billing (${ch.join(", ")})`);
  const inv = makeInvoice(d, type, d.ts);
  inv.billedAt = Date.now();
  inv.dispTs = d.ts;
  return inv;
}

/* ---------- "Bill baad mein" → bill later ---------- */
billModal = function (did) {
  if (!ownerOnly14()) return;
  const d = S.dispatches.find((x) => x.id === did),
    o = ordById(d.order),
    p = PTY[o.party];
  openModal(
    L("Bill banao", "Make bill"),
    `Slip #${o.no} · ${esc(p.n)} · ${L("dispatch", "dispatched")} ${fdate(d.ts)} · ${esc(d.vehicle || "")}`,
    `<div class="note">${ic("truck", 16)}<span>${L(`Maal ${fdate(d.ts)} ko ja chuka hai. Final rate bharo; bill par dispatch ki tareekh (${fdate(d.ts)}) chhapegi.`, `The goods left on ${fdate(d.ts)}. Fill the final rate; the bill shows the dispatch date (${fdate(d.ts)}).`)}</span></div>
   <div class="fld"><span class="lb">${L("Kaunsa bill?", "Bill type")}</span><div class="radios"><label><input type="radio" name="type" value="GST" checked>GST tax invoice</label><label><input type="radio" name="type" value="KACHCHA">${L("Kachcha bill", "Estimate (kachcha)")}</label></div></div>
   ${d.lines
     .map(({ i, q, pk }) => {
       const l = o.lines[i],
         pr = PM[l.ref];
       return `<div class="fld"><label for="drt${i}">${esc(pname(pr))} · ${esc(psub(pr))} · ${nf(pk)} packet · ${L("rate ₹ / bunch", "rate ₹ / bunch")}</label><input id="drt${i}" name="rt${i}" data-g="${l.g}" type="number" inputmode="decimal" min="0" step="0.01" value="${l.rate || ""}"><span class="hint">${nf(q)} bunch · ${l.deal ? L("slip ka deal rate", "deal rate from the slip") : L("rate list se", "from the rate list")}</span></div>`;
     })
     .join("")}
   <div class="sumbox" id="bsum"></div><p class="err" id="berr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("receipt", 16)} ${L("Bill banao", "Make bill")}</button>`,
    { form: "billLater14", live: "billLater14", id: did, wide: true },
  );
};
LIVE.billLater14 = (f) => {
  const d = S.dispatches.find((x) => x.id === f.dataset.id),
    o = ordById(d.order),
    p = PTY[o.party],
    gst = f.querySelector("[name=type]:checked").value === "GST",
    rows = d.lines.map(({ i, q, pk }) => ({ i, q, pk, r: +f["rt" + i].value || 0 })),
    tx = sum(rows, (x) => x.q * x.r);
  document.getElementById("bsum").innerHTML =
    `${rows.map((x) => `<div><span>${nf(x.pk)} packet × ${o.lines[x.i].pack || 1} bunch × ₹${nf(x.r, 2)}</span><b>${rs(x.q * x.r)}</b></div>`).join("")}<div><span>Taxable</span><b>${rs(tx)}</b></div>${gst ? `<div><span>${p.state === "Maharashtra" ? "CGST 9% + SGST 9%" : `IGST 18% (${esc(p.state)})`}</span><b>${rs(tx * 0.18)}</b></div>` : ""}<div class="tot"><span>${L("Bill ki rakam", "Bill amount")}</span><b>${rs(Math.round(gst ? tx * 1.18 : tx))}</b></div>`;
  document.getElementById("berr").textContent = rows.some((x) => !(x.r > 0)) ? L("Har item ka rate daalo.", "Enter a rate for every item.") : "";
};
FORMS.billLater14 = (f) => {
  if (!ownerOnly14()) return;
  const d = S.dispatches.find((x) => x.id === f.dataset.id);
  if (d.invoice) return closeModal();
  const rates = {};
  for (const { i } of d.lines) {
    const r = +f["rt" + i].value || 0;
    if (!(r > 0)) {
      document.getElementById("berr").textContent = L("Har item ka rate daalo.", "Enter a rate for every item.");
      f["rt" + i].focus();
      return;
    }
    rates[i] = r;
  }
  const inv = billDispatch14(d, f.querySelector("[name=type]:checked").value, rates);
  closeModal();
  render();
  invoiceModal(inv.id);
  toast(L(`Bill ${inv.no} ban gaya · tareekh ${fdate(inv.ts)} (dispatch)`, `Bill ${inv.no} made · dated ${fdate(inv.ts)} (dispatch)`));
};
/* one rate per item: typing in one colour fills the other colours of that item until they are edited by hand */
document.addEventListener(
  "input",
  (e) => {
    const t = e.target,
      f = t && t.form;
    if (!f || !/^(dispatch14|billLater14)$/.test(f.dataset.f || "") || !/^rt\d+$/.test(t.name || "")) return;
    t.dataset.man = "1";
    f.querySelectorAll(`input[name^=rt][data-g="${t.dataset.g}"]`).forEach((x) => {
      if (x !== t && !x.dataset.man) x.value = t.value;
    });
  },
  true,
);

/* ---------- route every old "bill first" button to the dispatch screen ---------- */
ACT.billOrder = (el) => dispatchModal14(el.dataset.id);
ACT.dispatch = (el) => {
  const legacy = pendBills().find((x) => x.order === el.dataset.id); // billed before v14.2, truck not gone yet
  if (legacy) return dispatchBillModal(legacy.id);
  dispatchModal14(el.dataset.id);
};
const relabel14 = (root) =>
  root.querySelectorAll("[data-a=billOrder]").forEach((b) => {
    b.innerHTML = `${ic("truck", b.classList.contains("sm") ? 14 : 16)} ${L("Dispatch karo", "Dispatch")}`;
    if (!isOwner14()) b.remove();
  });
const _odmV142 = orderDetailModal;
orderDetailModal = function (id) {
  _odmV142(id);
  relabel14(document.getElementById("modal-root"));
};
const _onmV142 = orderNextModal;
orderNextModal = function (oid) {
  _onmV142(oid);
  relabel14(document.getElementById("modal-root"));
};
const _dvV142 = dispatchView;
dispatchView = function (u) {
  return _dvV142(u).replace(/data-a="dispatch" data-id="([^"]+)"([^>]*)>[\s\S]*?<\/button>/g, (m, id, rest) => {
    const legacy = pendBills().some((d) => d.order === id);
    return `data-a="dispatch" data-id="${id}"${rest}>${ic("truck", 16)} ${legacy ? L("Dispatch karo (bill bana hai)", "Dispatch (already billed)") : L("Dispatch karo", "Dispatch")}</button>`;
  });
};
const _avoV142 = AV.orders;
AV.orders = function (u) {
  const tpl = document.createElement("template");
  tpl.innerHTML = _avoV142(u);
  relabel14(tpl.content);
  tpl.content.querySelectorAll("[data-a=bill]").forEach((b) => {
    const d = S.dispatches.find((x) => x.id === b.dataset.id),
      t2 = d && b.closest(".item") && b.closest(".item").querySelector(".t2");
    if (!t2) return;
    const n = billAgeDays14(d);
    t2.insertAdjacentHTML("beforeend", ` <span class="pill ${billLate14(d) ? "bad" : "mute"}">${n ? L(`${n} din se baaki`, `${n} ${n > 1 ? "days" : "day"} waiting`) : L("aaj dispatch", "dispatched today")}</span>`);
  });
  return tpl.innerHTML;
};

/* ---------- invoice: dates, PDF, WhatsApp ---------- */
const _ivmV142 = invoiceModal;
invoiceModal = function (id) {
  _ivmV142(id);
  const inv = S.invoices.find((x) => x.id === id),
    d = inv && S.dispatches.find((x) => x.id === inv.disp),
    r = document.getElementById("modal-root"),
    ft = r.querySelector(".sh-f"),
    paper = r.querySelector(".paper");
  if (!inv || !ft || !paper) return;
  const legacyPend = d && d.pending,
    meta = paper.querySelector(".slipmeta");
  if (meta && d && !d.pending)
    meta.insertAdjacentHTML("beforeend", `<div><div class="m">Dispatch</div><b>${new Date(d.ts).toLocaleDateString("en-IN")}</b><div class="m">${esc(d.vehicle || "")}</div></div>`);
  paper.insertAdjacentHTML(
    "afterend",
    `<div class="slipbar">${d && !d.pending ? `<span class="pill mute">${ic("truck", 12)} Dispatch ${fdate(d.ts)}${d.vehicle ? " · " + esc(d.vehicle) : ""}</span>` : ""}<span class="pill mute">${ic("receipt", 12)} ${L("Bill bana", "Billed")} ${fdate(inv.billedAt || inv.ts)}</span></div>`,
  );
  ft.innerHTML = `<a class="btn" data-wa14 href="${waLink14(inv)}" target="_blank" rel="noopener">${ic("send", 16)} WhatsApp</a><button type="button" class="btn" data-a="invPdf14" data-id="${inv.id}">${ic("print", 16)} PDF download</button><span class="grow"></span>${legacyPend ? `<button type="button" class="btn pri" data-a="dispBill" data-id="${d.id}">${ic("truck", 16)} ${L("Dispatch karo", "Dispatch")}</button>` : `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "Done")}</button>`}`;
};
function waText14(inv) {
  const p = PTY[inv.party],
    o = ordById(inv.order),
    d = S.dispatches.find((x) => x.id === inv.disp);
  return [
    `*MK Plastics · Beads Bazaar*`,
    `${inv.type === "GST" ? "Tax Invoice" : "Estimate"} ${inv.no} · ${new Date(inv.ts).toLocaleDateString("en-IN")}`,
    `${p.n}, ${p.city}`,
    o ? `Order slip ${o.no}${route14(o) ? " · " + slipOf(o).from + " → " + slipOf(o).to : ""}` : "",
    d && d.vehicle ? `Gaadi: ${d.vehicle}` : "",
    "",
    ...inv.lines.map((l) => `• ${l.desc}: ${l.pk != null ? l.pk + " packet · " : ""}${nf(l.qty)} bunch × ₹${nf(l.rate, 2)} = ₹${nf(l.amt, 2)}`),
    "",
    `*Total: ₹${nf(inv.total)}*`,
  ]
    .filter((x, i, a) => x !== "" || (a[i - 1] !== "" && i > 0))
    .join("\n");
}
const waLink14 = (inv) => "https://wa.me/?text=" + encodeURIComponent(waText14(inv));
ACT.invPdf14 = (el) => {
  const inv = S.invoices.find((x) => x.id === el.dataset.id),
    t = document.title;
  document.body.classList.add("print14");
  document.title = inv.no.replace(/\//g, "-"); // becomes the PDF file name
  const done = () => {
    document.body.classList.remove("print14");
    document.title = t;
  };
  addEventListener("afterprint", done, { once: true });
  toast(L('"Save as PDF" chuno, file ka naam bill number hoga.', 'Choose "Save as PDF"; the file is named after the bill number.'));
  setTimeout(() => {
    window.print();
    setTimeout(done, 500);
  }, 60);
};

/* ---------- Bill setting (owner) ---------- */
ACT.billCfg14 = () => {
  if (!ownerOnly14()) return;
  const c = S.cfg14;
  openModal(
    L("Bill setting", "Billing settings"),
    L("Dispatch par bill kab bane, aur yaad kab dilaye.", "When the bill is made at dispatch, and when to remind."),
    `<div class="fld"><span class="lb">${L("Dispatch screen par pehle se chuna", "Pre-selected on the dispatch screen")}</span><div class="radios"><label><input type="radio" name="mode" value="now" ${c.billMode === "now" ? "checked" : ""}>${L("Abhi bill banao", "Bill now")}</label><label><input type="radio" name="mode" value="later" ${c.billMode === "later" ? "checked" : ""}>${L("Bill baad mein", "Bill later")}</label></div><span class="hint">${L("Har dispatch par badal bhi sakte ho.", "You can still change it on each dispatch.")}</span></div>
   <div class="fld"><label for="bcd">${L("Bill kitne din mein ban jaana chahiye", "Bill should be made within (days)")}</label><input id="bcd" name="days" type="number" inputmode="numeric" min="0" step="1" value="${c.billDays}"><span class="hint">${L("Isse zyada din ho toh bell mein alert.", "After this the bell shows an alert.")}</span></div>
   <div class="fld"><span class="lb">${L("Credit limit paar ho toh", "When the credit limit is crossed")}</span><div class="radios"><label><input type="radio" name="credit" value="warn" ${c.creditMode !== "block" ? "checked" : ""}>${L("Sirf warning", "Warn only")}</label><label><input type="radio" name="credit" value="block" ${c.creditMode === "block" ? "checked" : ""}>${L("Dispatch roko (owner tick kare)", "Block dispatch (owner ticks to send)")}</label></div><span class="hint">${L("Owner ne abhi tay nahi kiya; tab tak warning.", "Not decided by the owner yet; warning until then.")}</span></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "billCfg14" },
  );
};
FORMS.billCfg14 = (f) => {
  const n = Math.max(0, Math.round(+f.days.value || 0));
  S.cfg14 = {
    billMode: f.querySelector("[name=mode]:checked").value,
    billDays: n,
    creditMode: f.querySelector("[name=credit]:checked").value,
  };
  logA(
    `Bill setting: ${S.cfg14.billMode === "now" ? "abhi bill" : "bill baad mein"} · ${n} din · credit ${S.cfg14.creditMode}`,
    `Billing settings: ${S.cfg14.billMode === "now" ? "bill now" : "bill later"} · ${n} days · credit ${S.cfg14.creditMode}`,
  );
  closeModal();
  render();
  toast(L("Setting save ho gayi.", "Settings saved."));
};

/* ---------- bell: bills not made in time ---------- */
const _gaV142 = getAlerts;
getAlerts = function () {
  const A = _gaV142();
  const late = S.dispatches.filter(billLate14),
    ui = uninvoiced().length,
    gen = L(`${ui} dispatch ka bill banana baaki`, `${ui} ${ui > 1 ? "dispatches" : "dispatch"} not billed yet`),
    gi = A.findIndex((a) => a[2] === gen); // the core alert counts all unbilled; show late ones only once (red)
  if (gi >= 0 && late.length) {
    const n = ui - late.length;
    if (n > 0) A[gi] = [A[gi][0], A[gi][1], L(`${n} dispatch ka bill banana baaki`, `${n} ${n > 1 ? "dispatches" : "dispatch"} not billed yet`), A[gi][3]];
    else A.splice(gi, 1);
  }
  if (late.length && isOwner14())
    A.unshift([
      "bad",
      "receipt",
      L(
        `${late.length} dispatch ka bill ${S.cfg14.billDays} din se zyada baaki`,
        `${late.length} ${late.length > 1 ? "dispatches" : "dispatch"} not billed for over ${S.cfg14.billDays} days`,
      ),
      "orders",
    ]);
  return A;
};

/* ---------- Hindi words used above ---------- */
Object.entries({
  gaadi: "गाड़ी",
  chhapegi: "छपेगी",
  bhejna: "भेजना",
  bhej: "भेज",
  rahe: "रहे",
  setting: "सेटिंग",
  warning: "वार्निंग",
  roko: "रोको",
  tick: "टिक",
  yaad: "याद",
  dilaye: "दिलाए",
  chuno: "चुनो",
  chuka: "चुका",
  bharo: "भरो",
  bhejo: "भेजो",
}).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
