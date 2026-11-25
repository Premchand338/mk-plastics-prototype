'use strict';
/* ===== v14 · Section 1: order slip (client review 23–24 Nov 2026 · V1, V11, P4) =====
   1.1 order form = owner's slip book      1.2 one item, many colours, packets per colour
   1.3 slip number series (owner sets it)  1.4 oldest slip first (orders + coating tasks)
   1.5 transport from → to                 1.6 Rani Gulabi + Green in the SR colour list
   1.7 party-wise: ordered vs made         1.8 rate can be set / changed at bill time
   Data shape: an order still keeps ONE LINE PER COLOUR, so bill, task, dispatch and
   stock code work unchanged. New: o.slip = {date, from, to, item, sign}, line.g = item
   group on the slip, line.deal = rate typed on the slip (not the rate list). */

const COL14 = { SR: ["Rani Gulabi", "Green"] }; // P4 · Maroon is already there
Object.entries(COL14).forEach(([g, l]) =>
  l.forEach((c) => {
    if (COL9[g] && !COL9[g].includes(c)) COL9[g].push(c);
  }),
);
const SLIP_FROM = "Bhiwandi";
const SLIP_START = 224; // owner's book was at slip 223 on 23 Nov (P4)

function initV14() {
  S.seq = S.seq || {};
  if (!(S.seq.slip > 0)) S.seq.slip = SLIP_START;
  if (!S.v14) {
    S.colours = S.colours || JSON.parse(JSON.stringify(COL9));
    Object.entries(COL14).forEach(([g, l]) => {
      const a = (S.colours[g] = S.colours[g] || []);
      l.forEach((c) => {
        if (!a.some((x) => x.toLowerCase() === c.toLowerCase())) a.push(c);
      });
    });
  }
  (S.orders || []).forEach((o) => {
    if (!o.slip)
      o.slip = {
        legacy: true,
        date: o.ts,
        from: SLIP_FROM,
        to: (PTY[o.party] || {}).city || "",
        item: "Moti",
        sign: "",
      };
    o.lines.forEach((l, i) => {
      if (l.g === undefined) l.g = i;
    });
  });
  S.v14 = true;
}
const _seedV14 = seed;
seed = function () {
  _seedV14();
  initV14();
};

/* ---------- helpers ---------- */
const ymd14 = (d) => {
  d = new Date(d);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const slipOf = (o) => o.slip || { date: o.ts, from: "", to: "", item: "Moti", sign: "" };
const route14 = (o) => {
  const s = slipOf(o);
  return s.from || s.to ? `${esc(s.from || "–")} → ${esc(s.to || "–")}` : "";
};
const ordById = (id) => S.orders.find((o) => o.id === id);

/* 1.4 priority: oldest slip first. Orders saved before v14 (no real slip) are older, so they go first. */
const isDone14 = (o) =>
  o.cancelled || sum(o.lines, (l) => l.disp) >= sum(o.lines, (l) => l.qty) - 0.001;
const priCmp14 = (a, b) =>
  (a.slip && !a.slip.legacy ? 1 : 0) - (b.slip && !b.slip.legacy ? 1 : 0) ||
  a.no - b.no ||
  a.ts - b.ts;
const openOrders14 = () => S.orders.filter((o) => !isDone14(o)).sort(priCmp14);
function priRank14() {
  const m = new Map();
  openOrders14().forEach((o, i) => m.set(o.id, i + 1));
  return m;
}

/* 1.7 free ready stock is given to orders in priority order, so two orders never count the same packets. */
function alloc14() {
  const pool = {},
    a = new Map();
  openOrders14().forEach((o) =>
    o.lines.forEach((l, i) => {
      if (l.kind !== "fin") return;
      if (pool[l.ref] === undefined) pool[l.ref] = freeAvail(l);
      const give = Math.min(remBill(o, i), pool[l.ref]);
      pool[l.ref] -= give;
      a.set(o.id + "|" + i, give);
    }),
  );
  return a;
}
/* made = dispatched + billed (waiting for the truck) + ready stock given to this line */
const made14 = (o, i, A) =>
  Math.min(o.lines[i].qty, o.lines[i].qty - remBill(o, i) + (A.get(o.id + "|" + i) || 0));
const pk14 = (q, l) => Math.floor((q + 0.001) / (l.pack || 1));
const madePk14 = (o, A) => o.lines.reduce((s, l, i) => s + pk14(made14(o, i, A), l), 0);

/* status follows the priority allocation: "Ready" only if this order's share of stock covers it */
const _osV14 = orderStatus;
orderStatus = function (o) {
  const s = _osV14(o);
  if (s !== "waiting" && s !== "ready") return s;
  const A = alloc14();
  return o.lines.every((l, i) => made14(o, i, A) >= l.qty - 0.001) ? "ready" : "waiting";
};
OST.ready = ["ok", "Ready to dispatch", "Ready to dispatch"];

/* ---------- 1.1 · 1.2 · 1.3 · 1.5 new order = slip ---------- */
const newR14 = (color) => ({ color: color || "Off White", nc: "", pk: "" });
const newG14 = (p) =>
  Object.assign(
    { it: 3, line: "P", grade: "SR", coat: "D", rate: "", auto: true, rows: [newR14()] },
    p || {},
  );
function rows14(cb) {
  let k = 0;
  draft.groups.forEach((g, gi) => g.rows.forEach((r, ri) => cb(g, r, gi, ri, k++)));
}
newOrderModal = function () {
  const p = PARTIES[0];
  draft = {
    slip: {
      no: S.seq.slip,
      date: ymd14(Date.now()),
      item: "Moti",
      from: SLIP_FROM,
      to: p.city,
      toAuto: true,
      sign: (user() || {}).n || "",
    },
    party: p.id,
    groups: [newG14()],
    over: false,
    promise: ymd14(Date.now() + 7 * DAY),
  };
  renderOrderModal();
};
renderOrderModal = function (focusK) {
  const s = draft.slip;
  let k = 0;
  const groups = draft.groups
    .map((g, gi) => {
      const rows = g.rows
        .map((r, ri) => {
          const i = k++;
          return `<div class="slipc">
     <div class="fld"><label for="oc${i}">${L("Rang", "Colour")}</label><select id="oc${i}" name="cl_${i}">${colourOpts(g.grade, r.color)}</select><input name="nc_${i}" aria-label="${L("Naya rang", "New colour")}" placeholder="${L("Naye rang ka naam", "New colour name")}" value="${esc(r.nc || "")}" ${r.color === "__new" ? "" : "hidden"}></div>
     <div class="fld"><label for="oq${i}">${L("Kitne packet", "Packets")}</label><input id="oq${i}" name="pk_${i}" type="number" inputmode="numeric" min="0" step="1" value="${r.pk}"><span class="hint" id="oh${i}"></span></div>
     <button type="button" class="xbtn" data-a="slipDelCol" data-g="${gi}" data-r="${ri}" aria-label="${L("Rang hatao", "Remove colour")}" ${g.rows.length < 2 ? "disabled" : ""}>${ic("trash", 16)}</button>
     <div class="avl" id="av${i}"></div></div>`;
        })
        .join("");
      return `<div class="slipg">
   <div class="toolbar"><b>Item ${gi + 1}</b><span class="grow"></span><span class="pill mute" id="ogs${gi}">0 packet</span><button type="button" class="xbtn" data-a="slipDelItem" data-g="${gi}" aria-label="${L("Item hatao", "Remove item")}" ${draft.groups.length < 2 ? "disabled" : ""}>${ic("trash", 16)}</button></div>
   <div class="row2"><div class="fld"><label for="oi${gi}">${L("Size aur item (rate list)", "Size and item (rate list)")}</label><select id="oi${gi}" name="it_${gi}">${itemOpts(g.it)}</select></div><div class="fld"><label for="ol${gi}">Unit</label><select id="ol${gi}" name="ln_${gi}"><option value="P" ${g.line === "P" ? "selected" : ""}>Pearl</option><option value="Z" ${g.line === "Z" ? "selected" : ""}>Metalizing</option></select></div></div>
   <div class="row2"><div class="fld"><label for="og${gi}">Grade</label><select id="og${gi}" name="gr_${gi}">${GRADES.map((x) => `<option ${x === g.grade ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="fld"><label for="oco${gi}">Coating</label><select id="oco${gi}" name="co_${gi}"><option value="S" ${g.coat === "S" ? "selected" : ""}>Single</option><option value="D" ${g.coat === "D" ? "selected" : ""}>Double</option></select></div></div>
   <div class="slipcs">${rows}</div>
   <button type="button" class="btn sm" data-a="slipAddCol" data-g="${gi}" style="justify-self:start">${ic("plus", 15)} ${L("Aur rang", "Add colour")}</button>
   <div class="fld"><label for="or${gi}">${L("Rate / deal ₹ / bunch", "Rate / deal ₹ / bunch")}</label><input id="or${gi}" name="rate_${gi}" type="number" inputmode="decimal" min="0" step="0.1" value="${g.rate}"><span class="hint">${L("Rate list se aata hai. Deal alag ho toh badlo. Bill banate waqt bhi badal sakte ho.", "Comes from the rate list. Change it if the deal is different. You can also change it when billing.")}</span></div>
  </div>`;
    })
    .join("");
  openModal(
    L("Naya order · slip", "New order · slip"),
    L(
      "Owner ki slip book jaisa: ek slip number, ek item ke kai rang, har rang ke packet.",
      "Like the owner's slip book: one slip number, many colours per item, packets per colour.",
    ),
    `<div class="sliph">
   <div class="row3"><div class="fld"><label for="osn">${L("Slip / order no.", "Slip / order no.")}</label><input id="osn" name="slipno" type="number" inputmode="numeric" min="1" step="1" value="${esc(String(s.no))}" required><span class="hint" id="osnh"></span></div>
    <div class="fld"><label for="osd">${L("Tareekh", "Date")}</label><input id="osd" name="slipdate" type="date" value="${s.date}" required></div>
    <div class="fld"><label for="osi">${L("Item ka naam", "Item name")}</label><input id="osi" name="itemname" value="${esc(s.item)}" list="osil" placeholder="Moti"><datalist id="osil"><option value="Moti"></option></datalist></div></div>
   <div class="fld"><label for="op">Party</label><select id="op" name="party">${PARTIES.map((p) => `<option value="${p.id}" ${p.id === draft.party ? "selected" : ""}>${p.n} · ${p.city}</option>`).join("")}</select></div>
   <div class="row2"><div class="fld"><label for="osf">${L("Transport: kahan se", "Transport: from")}</label><input id="osf" name="from" value="${esc(s.from)}" placeholder="Bhiwandi"></div><div class="fld"><label for="ost">${L("Kahan tak", "To")}</label><input id="ost" name="to" value="${esc(s.to)}" placeholder="Rajkot"></div></div>
  </div>
  <div class="slipgs">${groups}</div>
  <button type="button" class="btn sm" data-a="slipAddItem" style="justify-self:start">${ic("plus", 15)} ${L("Aur item (doosra size)", "Add item (another size)")}</button>
  <div class="row2"><div class="fld"><label for="od">${L("Delivery kab tak", "Delivery by")}</label><input id="od" name="promise" type="date" value="${draft.promise || ""}"></div><div class="fld"><label for="osg">${L("Sign: order kisne liya", "Signed by: who took the order")}</label><input id="osg" name="sign" value="${esc(s.sign)}"></div></div>
  <div id="osum"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit" id="osave">${ic("check", 16)} ${L("Slip save karo", "Save slip")}</button>`,
    { form: "order", live: "order", wide: true, nofocus: true },
  );
  if (focusK !== undefined) {
    const el = document.getElementById("oq" + focusK);
    if (el) el.focus();
  }
};
syncDraft = function (f) {
  if (!f || !draft || !draft.groups) return;
  const s = draft.slip;
  draft.party = f.party.value;
  Object.assign(s, {
    no: f.slipno.value,
    date: f.slipdate.value,
    item: f.itemname.value,
    from: f.from.value,
    to: f.to.value,
    sign: f.sign.value,
  });
  if (f.promise) draft.promise = f.promise.value;
  draft.groups.forEach((g, gi) => {
    if (!f["it_" + gi]) return;
    Object.assign(g, {
      it: +f["it_" + gi].value,
      line: f["ln_" + gi].value,
      grade: f["gr_" + gi].value,
      coat: f["co_" + gi].value,
      rate: f["rate_" + gi].value,
    });
  });
  rows14((g, r, gi, ri, k) => {
    if (!f["cl_" + k]) return;
    Object.assign(r, { color: f["cl_" + k].value, nc: f["nc_" + k].value, pk: f["pk_" + k].value });
  });
  const c = f.querySelector("[name=over]");
  draft.over = c ? c.checked : false;
};
/* typed rate = deal (stop auto-filling); typed "to" = keep it when party changes */
document.addEventListener(
  "input",
  (e) => {
    const t = e.target,
      f = t && t.form;
    if (!f || f.dataset.f !== "order" || !draft || !draft.groups) return;
    if (/^rate_\d+$/.test(t.name || "")) {
      const g = draft.groups[+t.name.split("_")[1]];
      if (g) g.auto = false;
    }
    if (t.name === "to") draft.slip.toAuto = false;
  },
  true,
);
function slipNoState14(v) {
  const no = Math.round(+v || 0);
  if (!(no > 0) || String(v).trim() === "") return { no, bad: L("Slip number daalo", "Enter the slip number") };
  if (S.orders.some((o) => o.no === no))
    return { no, bad: L(`Slip ${no} pehle se hai. Doosra number daalo.`, `Slip ${no} already exists. Use another number.`) };
  return {
    no,
    msg:
      no === S.seq.slip
        ? L("Book ka agla number", "Next number in the book")
        : L(`Series ka agla number ${S.seq.slip} hai`, `The next number in the series is ${S.seq.slip}`),
  };
}
LIVE.order = function (f) {
  if (!draft || !draft.groups) return;
  syncDraft(f);
  const s = draft.slip,
    p = PTY[draft.party];
  if (f.dataset.p !== draft.party) {
    if (f.dataset.p !== undefined && s.toAuto) f.to.value = s.to = p.city;
    f.dataset.p = draft.party;
  }
  const sn = slipNoState14(s.no),
    snh = document.getElementById("osnh");
  snh.textContent = sn.bad || sn.msg;
  snh.classList.toggle("bad14", !!sn.bad);
  let val = 0,
    pkAll = 0;
  let k = 0;
  draft.groups.forEach((g, gi) => {
    const r = rlItem(g.it),
      cs = f["co_" + gi],
      dOpt = cs.querySelector("[value=D]");
    dOpt.disabled = !(r && r.d > 0);
    if (dOpt.disabled && g.coat === "D") {
      cs.value = "S";
      g.coat = "S";
    }
    const gs = f["gr_" + gi],
      gChanged = gs.dataset.g && gs.dataset.g !== g.grade;
    gs.dataset.g = g.grade;
    if (g.auto && r) {
      const ar = rlRate(r, g.coat);
      f["rate_" + gi].value = ar || "";
      g.rate = ar || "";
    }
    const pack = (r && r.pack) || 1,
      rate = +g.rate || 0;
    let gpk = 0;
    g.rows.forEach((row) => {
      const i = k++;
      if (gChanged) {
        f["cl_" + i].innerHTML = colourOpts(
          g.grade,
          cols(g.grade).includes(row.color) ? row.color : cols(g.grade)[0],
        );
        row.color = f["cl_" + i].value;
      }
      f["nc_" + i].hidden = row.color !== "__new";
      const pk = Math.round(+row.pk || 0),
        bunch = pk * pack;
      gpk += pk;
      val += bunch * rate;
      const pid =
          row.color && row.color !== "__new"
            ? findProduct(g.it, g.grade, row.color, g.coat, g.line)
            : null,
        av = pid ? qty("FIN:" + g.line, pid, "bunch") : 0;
      document.getElementById("oh" + i).textContent = r
        ? r.pack
          ? pk
            ? `${nf(pk)} × ${r.pack} = ${nf(bunch)} bunch`
            : `${r.pack} bunch / packet`
          : L("Packing abhi tay nahi", "Packing not set yet")
        : "";
      document.getElementById("av" + i).innerHTML = pk
        ? `${av >= bunch ? `<span class="pill ok">${ic("check", 12)} ${L("Stock hai", "In stock")}: ${nf(av)} bunch</span>` : `<span class="pill warn">${L("Taiyaar stock", "Ready stock")}: ${nf(av)} bunch · ${nf(bunch - av)} bunch ${L("banana padega", "to be made")}</span>`}`
        : "";
    });
    document.getElementById("ogs" + gi).textContent = `${nf(gpk)} packet`;
    pkAll += gpk;
  });
  const pi = partyInfo(p.id),
    after = pi.out + val * 1.18,
    over = after > p.limit;
  document.getElementById("osum").innerHTML =
    `<div class="sumbox"><div><span>${L("Slip mein kul", "Total on the slip")}</span><b>${nf(pkAll)} packet</b></div><div><span>${L("Order (bina GST)", "Order (before GST)")}</span><b>${rs(val)}</b></div><div><span>${L("Party ka abhi baaki", "Party owes now")}</span><b>${rs(pi.out)}</b></div><div class="tot"><span>${L("Order ke baad (GST ke saath, andaaza)", "After this order (with GST, est.)")}</span><b>${rs(after)}</b></div></div>
   ${over ? `<div class="note bad">${ic("alert", 16)}<span>${L(`Credit limit ${rs(p.limit)} paar ho jaayegi.`, `This crosses the ${rs(p.limit)} credit limit.`)}<label style="display:flex;gap:8px;align-items:center;margin-top:6px;color:var(--ink)"><input type="checkbox" name="over" ${draft.over ? "checked" : ""}> ${L("Phir bhi order lo (Admin)", "Take the order anyway (Admin)")}</label></span></div>` : ""}`;
  const c = f.querySelector("[name=over]");
  document.getElementById("osave").disabled =
    (over && !(c && c.checked)) || !(pkAll > 0) || !!sn.bad;
};
FORMS.order = function (f) {
  if (!draft || !draft.groups) return;
  syncDraft(f);
  const s = draft.slip,
    sn = slipNoState14(s.no);
  if (sn.bad) {
    f.slipno.focus();
    return LIVE.order(f);
  }
  const ls = [];
  let k = 0,
    gOut = 0;
  for (let gi = 0; gi < draft.groups.length; gi++) {
    const g = draft.groups[gi],
      r = rlItem(g.it);
    let used = false;
    for (const row of g.rows) {
      const i = k++,
        pk = Math.round(+row.pk || 0);
      if (!(pk > 0) || !r) continue;
      let color = row.color;
      if (color === "__new") {
        color = addColour(g.grade, row.nc);
        if (!color) {
          f["nc_" + i].focus();
          return;
        }
      }
      const pack = r.pack || 1,
        pid = getProduct(r.no, g.grade, color, g.coat, g.line),
        same = ls.find((x) => x.ref === pid);
      if (same) {
        // the same colour written twice on one slip: add up, keep one line
        same.pk += pk;
        same.qty += pk * pack;
        continue;
      }
      ls.push({
        kind: "fin",
        ref: pid,
        uom: "bunch",
        qty: pk * pack,
        pk,
        pack,
        rate: +g.rate || rlRate(r, g.coat),
        deal: !g.auto && +g.rate > 0,
        disp: 0,
        g: gOut,
      });
      used = true;
    }
    if (used) gOut++;
  }
  if (!ls.length) return;
  const no = sn.no,
    pr = f.promise.value ? new Date(f.promise.value + "T00:00").getTime() : Date.now() + 7 * DAY;
  const o = {
    id: "o" + no,
    no,
    party: draft.party,
    lines: ls,
    ts: Date.now(),
    promise: pr,
    cancelled: false,
    reason: "",
    slip: {
      date: s.date ? new Date(s.date + "T00:00").getTime() : Date.now(),
      from: s.from.trim(),
      to: s.to.trim(),
      item: s.item.trim() || "Moti",
      sign: s.sign.trim(),
    },
  };
  S.orders.push(o);
  if (no >= S.seq.slip) S.seq.slip = no + 1; // typing an old book number does not move the series back
  logA(
    `Slip #${no} · order banaya · ${PTY[o.party].n} · ${nf(sum(ls, (l) => l.pk))} packet${draft.over ? " (limit override)" : ""}`,
    `Slip #${no} · order created · ${PTY[o.party].n} · ${nf(sum(ls, (l) => l.pk))} packets${draft.over ? " (limit override)" : ""}`,
  );
  closeModal();
  S.view = "orders";
  S.ui.orderTab = "all";
  render();
  orderNextModal(o.id);
};
const slipForm14 = () => document.querySelector("form[data-f=order]");
ACT.slipAddItem = () => {
  syncDraft(slipForm14());
  const last = draft.groups[draft.groups.length - 1];
  draft.groups.push(
    newG14({ grade: last.grade, line: last.line, coat: last.coat, rows: [newR14(cols(last.grade)[0])] }),
  );
  let k = 0;
  draft.groups.forEach((g) => (k += g.rows.length));
  renderOrderModal(k - 1);
};
ACT.slipDelItem = (el) => {
  syncDraft(slipForm14());
  if (draft.groups.length > 1) draft.groups.splice(+el.dataset.g, 1);
  renderOrderModal();
};
ACT.slipAddCol = (el) => {
  syncDraft(slipForm14());
  const gi = +el.dataset.g,
    g = draft.groups[gi],
    used = g.rows.map((r) => r.color),
    next = cols(g.grade).find((c) => !used.includes(c)) || cols(g.grade)[0];
  g.rows.push(newR14(next));
  let k = 0;
  draft.groups.slice(0, gi + 1).forEach((x) => (k += x.rows.length));
  renderOrderModal(k - 1);
};
ACT.slipDelCol = (el) => {
  syncDraft(slipForm14());
  const g = draft.groups[+el.dataset.g];
  if (g && g.rows.length > 1) g.rows.splice(+el.dataset.r, 1);
  renderOrderModal();
};
/* the v8 quick-action map kept the old v1 order form; point it at the slip */
const _qkV14 = ACT.quick;
ACT.quick = (el) => (el.dataset.q === "order" ? newOrderModal() : _qkV14(el));

/* ---------- 1.3 slip number series ---------- */
ACT.slipSeries = () =>
  openModal(
    L("Slip number series", "Slip number series"),
    L("Order book ka agla number. Naya order isi number se shuru hoga.", "The next number in the order book. The next order starts from it."),
    `<div class="fld"><label for="ssn">${L("Agla slip number", "Next slip number")}</label><input id="ssn" name="next" class="big-in" type="number" inputmode="numeric" min="1" step="1" value="${S.seq.slip}" required><span class="hint">${L("Jaise book mein aakhri slip 223 hai toh 224 likho.", "If the last slip in the book is 223, enter 224.")}</span></div><p class="err" id="sserr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "slipSeries" },
  );
FORMS.slipSeries = (f) => {
  const n = Math.round(+f.next.value || 0),
    err = document.getElementById("sserr");
  if (!(n > 0)) {
    err.textContent = L("Sahi number daalo", "Enter a valid number");
    return;
  }
  if (S.orders.some((o) => o.no === n)) {
    err.textContent = L(`Slip ${n} pehle se hai`, `Slip ${n} already exists`);
    return;
  }
  const old = S.seq.slip;
  S.seq.slip = n;
  logA(`Slip series badli: ${old} → ${n}`, `Slip series changed: ${old} → ${n}`);
  closeModal();
  render();
  toast(L(`Agla slip number ${n}`, `Next slip number ${n}`));
};

/* ---------- slip view (paper, like the book) ---------- */
ACT.slipView = (el) => slipModal14(el.dataset.id);
function slipModal14(id) {
  const o = ordById(id);
  if (!o) return;
  const s = slipOf(o),
    p = PTY[o.party];
  let lastG = null;
  const rows = o.lines
    .map((l) => {
      const pr = PM[l.ref],
        r = rlItem(pr.it),
        first = l.g !== lastG;
      lastG = l.g;
      return `<tr class="${first ? "g0" : ""}"><td>${first ? `<b>${esc(s.item || "Moti")}</b> ${esc(r ? rlName(r) : pr.size)}<div class="m">${esc(pr.grade)} · ${COATN(pr.coat)} · ${LINE[pr.unit]}</div>` : ""}</td><td>${esc(pr.color)}</td><td class="r"><b>${nf(l.pk)}</b></td><td class="r">${first ? `₹${nf(l.rate, 2)}${l.deal ? " · deal" : ""}` : ""}</td></tr>`;
    })
    .join("");
  openModal(
    `Slip #${o.no}`,
    `${esc(p.n)} · ${fdate(s.date)}`,
    `<div class="paper slip14"><div class="ph"><div><h3>MK Plastics</h3><div class="m">Beads Bazaar · Bhiwandi</div></div><div style="text-align:right"><div class="stamp">Order slip</div><b>No. ${o.no}</b><div class="m">${new Date(s.date).toLocaleDateString("en-IN")}</div></div></div>
   <div class="slipmeta"><div><div class="m">Party</div><b>${esc(p.n)}</b><div class="m">${esc(p.city)}, ${esc(p.state)}</div></div><div><div class="m">Transport</div><b>${route14(o) || "–"}</b><div class="m">${L("Delivery", "Delivery")} ${fdate(o.promise)}</div></div></div>
   <div class="tw" style="margin-inline:0;padding-inline:0"><table><thead><tr><th>Item · size</th><th>${L("Rang", "Colour")}</th><th class="r">Packet</th><th class="r">Rate / bunch</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="2"><b>${L("Kul", "Total")}</b></td><td class="r"><b>${nf(sum(o.lines, (l) => l.pk || 0))}</b></td><td></td></tr></tfoot></table></div>
   <div class="slipsign"><div class="m">Sign</div><b>${esc(s.sign || "–")}</b></div>${o.cancelled ? `<div class="stamp" style="color:#B4473B">Cancelled · ${esc(o.reason)}</div>` : ""}</div>`,
    `<button type="button" class="btn" data-a="waShare">${ic("send", 16)} WhatsApp</button><span class="grow"></span><button type="button" class="btn" data-a="orderDetail" data-id="${o.id}">${L("Order kholo", "Open order")}</button><button type="button" class="btn pri" data-a="close">${L("Theek hai", "Done")}</button>`,
    { wide: true },
  );
}

/* order detail: slip header + "Slip dekho" */
const _odmV14 = orderDetailModal;
orderDetailModal = function (id) {
  _odmV14(id);
  const o = ordById(id),
    b = document.querySelector("#modal-root .sh-b"),
    ft = document.querySelector("#modal-root .sh-f");
  if (!o || !b) return;
  const s = slipOf(o),
    rk = priRank14().get(o.id);
  b.insertAdjacentHTML(
    "afterbegin",
    `<div class="slipbar">${rk ? `<span class="pill gold14">${L("Priority", "Priority")} ${rk}</span>` : ""}<span class="pill mute">Slip ${o.no} · ${fdate(s.date)}</span>${route14(o) ? `<span class="pill mute">${ic("truck", 12)} ${route14(o)}</span>` : ""}${s.sign ? `<span class="pill mute">Sign: ${esc(s.sign)}</span>` : ""}</div>`,
  );
  if (ft)
    ft.insertAdjacentHTML(
      "afterbegin",
      `<button type="button" class="btn" data-a="slipView" data-id="${o.id}">${ic("receipt", 16)} ${L("Slip dekho", "View slip")}</button>`,
    );
};

/* ---------- orders page: priority list + 1.7 party-wise ---------- */
AV.orders = function () {
  const tab = S.ui.orderTab,
    A = alloc14(),
    rank = priRank14(),
    list = S.orders.slice().sort((a, b) => {
      const ra = rank.get(a.id),
        rb = rank.get(b.id);
      return ra && rb ? ra - rb : ra ? -1 : rb ? 1 : b.ts - a.ts;
    });
  const cnt = (k) => list.filter((o) => orderStatus(o) === k).length;
  const tabs = [
    ["all", L("Sab", "All")],
    ["party", L("Party-wise", "By party")],
    ["waiting", L("Maal ka intezaar", "Waiting")],
    ["ready", "Ready"],
    ["billed", L("Bill bana", "Billed")],
    ["partial", L("Aadha gaya", "Part sent")],
    ["dispatched", L("Gaya", "Dispatched")],
    ["closed", L("Band", "Closed")],
  ];
  const ui = uninvoiced();
  const head = `${
    ui.length
      ? `<section class="card" style="background:var(--gold-soft);border-color:transparent"><div class="card-h"><div><h3>${L("Bill banana baaki", "Waiting to be billed")}</h3><p>${L("Yeh maal dispatch ho chuka hai", "These dispatches have left the factory")}</p></div></div><div class="list">${ui
          .map((d) => {
            const o = ordById(d.order);
            return `<div class="item"><span class="ico-c info">${ic("truck", 17)}</span><div class="grow"><div class="t1">Slip #${o.no} · ${esc(PTY[o.party].n)}</div><div class="t2">${d.lines.map(({ i, q }) => fq(q, o.lines[i].uom) + " " + esc(itemName(o.lines[i]))).join(", ")} · ${fwhen(d.ts)} · ${esc(d.vehicle || "")}</div></div><button type="button" class="btn sm pri" data-a="bill" data-id="${d.id}">${L("Bill banao", "Make bill")}</button></div>`;
          })
          .join("")}</div></section>`
      : ""
  }
  <div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l]) => `<button type="button" data-a="ui" data-k="orderTab" data-val="${k}" aria-pressed="${tab === k}">${l}${k !== "all" && k !== "party" && cnt(k) ? `<span class="badge">${cnt(k)}</span>` : ""}</button>`).join("")}</div><span class="grow"></span><button type="button" class="btn sm" data-a="slipSeries">${ic("edit", 14)} ${L("Agla slip", "Next slip")} #${S.seq.slip}</button></div>`;
  if (tab === "party") return head + partyWise14(A, rank);
  const shown = list.filter((o) => tab === "all" || orderStatus(o) === tab);
  return `${head}<p class="psub">${L("Pehla slip pehle: sabse purana slip number upar. Coating task bhi isi kram mein.", "First slip first: the oldest slip number is on top. Coating tasks follow the same order.")}</p>
  <div class="list">${
    shown.length
      ? shown
          .map((o) => {
            const st = orderStatus(o),
              tp = sum(o.lines, (l) => l.pk || 0),
              mp = madePk14(o, A),
              rk = rank.get(o.id);
            return `<button type="button" class="item" data-a="orderDetail" data-id="${o.id}">${thumb(PM[o.lines[0].ref])}<div class="grow"><div class="t1">${rk ? `<span class="pri14" aria-label="${L("Priority", "Priority")} ${rk}">${rk}</span>` : ""}Slip #${o.no} · ${esc(PTY[o.party].n)}</div><div class="t2">${slipLines14(o)}</div><div class="t2">${fdate(slipOf(o).date)}${route14(o) ? " · " + route14(o) : ""} · ${L("Delivery", "Due")} ${fdate(o.promise)}</div></div><div class="end">${opill(st)}<b class="num">${nf(mp)} / ${nf(tp)} packet</b>${beads(tp ? mp / tp : 0, 8, "var(--ok)")}</div></button>`;
          })
          .join("")
      : `<div class="empty">${L("Is filter mein koi order nahi", "No orders in this filter")}</div>`
  }</div>`;
};
/* "3MM Moti: Rani Gulabi 200, Green 200" — one phrase per item group */
function slipLines14(o) {
  const gs = [];
  o.lines.forEach((l) => {
    const p = PM[l.ref];
    let g = gs.find((x) => x.g === l.g);
    if (!g) gs.push((g = { g: l.g, n: `${p.size} ${p.shape} ${p.grade} ${COATN(p.coat)}`, c: [] }));
    g.c.push(`${esc(p.color)} ${nf(l.pk)}`);
  });
  return gs.map((g) => `<b>${esc(g.n)}</b>: ${g.c.join(", ")}`).join(" · ");
}
function partyWise14(A, rank) {
  const live = S.orders.filter((o) => !o.cancelled && !isDone14(o)).sort(priCmp14);
  if (!live.length)
    return `<div class="empty">${L("Abhi koi chalu order nahi.", "No open orders right now.")}</div>`;
  const byP = {};
  live.forEach((o) => (byP[o.party] = byP[o.party] || []).push(o));
  return Object.keys(byP)
    .map((pid) => {
      const p = PTY[pid],
        os = byP[pid];
      const tp = sum(os, (o) => sum(o.lines, (l) => l.pk || 0)),
        mp = sum(os, (o) => madePk14(o, A));
      return `<section class="card"><div class="card-h"><div><h3>${esc(p.n)}</h3><p>${esc(p.city)} · ${os.length} slip · ${L("order", "ordered")} ${nf(tp)} packet · ${L("bane", "made")} ${nf(mp)} packet</p></div>${beads(tp ? mp / tp : 0, 10, "var(--ok)")}</div>
     ${os
       .map((o) => {
         const st = orderStatus(o),
           ready = st === "ready";
         return `<div class="pw14"><div class="toolbar"><b>${rank.get(o.id) ? `<span class="pri14">${rank.get(o.id)}</span>` : ""}Slip #${o.no}</b><span class="psub">${fdate(slipOf(o).date)}${route14(o) ? " · " + route14(o) : ""}</span><span class="grow"></span>${opill(st)}</div>
       <div class="tw"><table><thead><tr><th>Item</th><th>${L("Rang", "Colour")}</th><th class="r">${L("Order", "Ordered")}</th><th class="r">${L("Bane", "Made")}</th><th class="r">${L("Baaki", "Left")}</th></tr></thead><tbody>${o.lines
         .map((l, i) => {
           const pr = PM[l.ref],
             m = pk14(made14(o, i, A), l),
             left = Math.max(0, (l.pk || 0) - m);
           return `<tr><td>${esc(pr.size)} ${esc(pr.shape)} · ${esc(pr.grade)} · ${COATN(pr.coat)}</td><td>${esc(pr.color)}</td><td class="r">${nf(l.pk)}</td><td class="r"><b>${nf(m)}</b></td><td class="r">${left ? `<span class="pill warn">${nf(left)}</span>` : `<span class="pill ok">${ic("check", 12)}</span>`}</td></tr>`;
         })
         .join("")}</tbody></table></div>
       <div class="btns">${ready ? `<span class="pill ok">${ic("truck", 12)} Ready to dispatch</span><button type="button" class="btn sm pri" data-a="billOrder" data-id="${o.id}">${ic("receipt", 14)} ${L("Bill banao", "Make bill")}</button>` : ""}<button type="button" class="btn sm" data-a="orderDetail" data-id="${o.id}">${L("Order kholo", "Open order")}</button></div></div>`;
       })
       .join("")}</section>`;
    })
    .join("");
}

/* ---------- 1.4 coating tasks follow slip priority ---------- */
function taskCmp14(rank) {
  const key = (t) => (t.order && rank.has(t.order) ? rank.get(t.order) : 1e9);
  return (a, b) => (b.working ? 1 : 0) - (a.working ? 1 : 0) || key(a) - key(b) || a.ts - b.ts;
}
AV.tasks = function () {
  const rank = priRank14(),
    open = S.tasks.filter((t) => t.status === "open"),
    mo = open
      .filter((t) => t.kind !== "coat")
      .sort((a, b) => (b.working ? 1 : 0) - (a.working ? 1 : 0) || b.ts - a.ts),
    co = open.filter((t) => t.kind === "coat").sort(taskCmp14(rank)),
    done = S.tasks
      .filter((t) => t.status !== "open")
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 12);
  return `${liveWork()}<section class="card"><div class="card-h"><div><h3>Moulding task · ${mo.length}</h3><p>${L("M1 / M2: kaunsa bead, kaunsa raw material, kitna kg.", "M1 / M2: which bead, which raw material, how many kg.")}</p></div><button type="button" class="btn sm" data-a="taskNew">${ic("plus", 14)} Moulding task</button></div>
   <div class="list">${mo.map((t) => taskCard9(t, "admin")).join("") || `<div class="empty">${ic("list")}${L("Koi moulding task chalu nahi.", "No open moulding tasks.")}</div>`}</div></section>
   <section class="card"><div class="card-h"><div><h3>${L("Coating + packing task", "Coating + packing tasks")} · ${co.length}</h3><p>${L("Pehla slip pehle: purane order ka task upar. P1 / P2 (Pearl) aur MZ1 (Metalizing).", "First slip first: the oldest order's task is on top. P1 / P2 (Pearl) and MZ1 (Metalizing).")}</p></div><button type="button" class="btn sm pri" data-a="coatTaskNew">${ic("plus", 14)} Coating task</button></div>
   <div class="list">${co.map((t) => taskCard9(t, "admin")).join("") || `<div class="empty">${ic("pearl")}${L("Koi coating task chalu nahi. Threaded maal coating mein bhejne ke baad task do.", "No open coating tasks. Assign one after moving threaded goods to coating.")}</div>`}</div></section>
   ${done.length ? `<section class="card"><div class="card-h"><h3>${L("Pure hue", "Completed")}</h3></div><div class="list">${done.map((t) => taskCard9(t, "done")).join("")}</div></section>` : ""}`;
};
/* staff "Mere task": same order. Reorder the rendered cards; nothing else in the screen changes. */
const _svV14 = staffView;
staffView = function (u) {
  const h = _svV14(u);
  const mine = S.tasks.filter((t) => t.machine === u.machine && t.status === "open");
  if (mine.length < 2 || !mine.some((t) => t.order)) return h;
  const tpl = document.createElement("template");
  tpl.innerHTML = h;
  const sel = "[data-a=taskStart],[data-a=taskStop]",
    b0 = tpl.content.querySelector(sel),
    list = b0 && b0.closest(".list");
  if (!list) return h;
  const items = [...list.children],
    idOf = (el) => {
      const b = el.querySelector(sel);
      return b ? b.dataset.id : null;
    };
  if (!items.every(idOf)) return h;
  const byId = (id) => S.tasks.find((t) => t.id === id),
    cmp = taskCmp14(priRank14());
  items.sort((a, b) => cmp(byId(idOf(a)), byId(idOf(b)))).forEach((el) => list.appendChild(el));
  return tpl.innerHTML;
};

/* ---------- 1.8 rate at bill time ---------- */
const _bomV14 = billOrderModal;
billOrderModal = function (oid) {
  _bomV14(oid);
  const f = document.querySelector("form[data-f=billOrder]"),
    o = ordById(oid);
  if (!f || !o) return;
  o.lines.forEach((l, i) => {
    const pk = f["pk" + i];
    if (!pk) return;
    pk.closest(".fld").insertAdjacentHTML(
      "afterend",
      `<div class="fld"><label for="brt${i}">${L("Rate ₹ / bunch (is bill ke liye)", "Rate ₹ / bunch (for this bill)")}</label><input id="brt${i}" name="rt${i}" data-g="${l.g}" type="number" inputmode="decimal" min="0" step="0.01" value="${l.rate || ""}"><span class="hint">${l.deal ? L("Slip par likha deal rate", "Deal rate written on the slip") : L("Rate list se", "From the rate list")} · ${L("Badlo toh usi item ke baaki rang bhi badlenge", "Changing it also changes the other colours of the same item")}</span></div>`,
    );
  });
  f.querySelector(".note").insertAdjacentHTML(
    "afterend",
    `<div class="slipbar"><span class="pill mute">Slip ${o.no} · ${fdate(slipOf(o).date)}</span>${route14(o) ? `<span class="pill mute">${ic("truck", 12)} ${route14(o)}</span>` : ""}</div>`,
  );
  if (typeof tapRefresh === "function") tapRefresh();
  LIVE.billOrder(f);
};
/* one rate per item: typing in one colour's rate fills the other colours of that item (until edited by hand) */
document.addEventListener(
  "input",
  (e) => {
    const t = e.target,
      f = t && t.form;
    if (!f || f.dataset.f !== "billOrder" || !/^rt\d+$/.test(t.name || "")) return;
    t.dataset.man = "1";
    f.querySelectorAll(`input[name^=rt][data-g="${t.dataset.g}"]`).forEach((x) => {
      if (x !== t && !x.dataset.man) x.value = t.value;
    });
  },
  true,
);
function withBillRates14(f, fn) {
  const o = ordById(f.dataset.id),
    old = o.lines.map((l) => l.rate);
  o.lines.forEach((l, i) => {
    const e = f["rt" + i];
    if (e && e.value !== "") l.rate = +e.value || 0;
  });
  try {
    return fn(o);
  } finally {
    o.lines.forEach((l, i) => (l.rate = old[i]));
  }
}
const _lboV14 = LIVE.billOrder;
LIVE.billOrder = (f) => {
  withBillRates14(f, () => _lboV14(f));
  const o = ordById(f.dataset.id),
    err = document.getElementById("berr"),
    noRate = billParts(f, o).find((x) => f["rt" + x.i] && !(+f["rt" + x.i].value > 0));
  if (noRate && err && !err.textContent)
    err.textContent = L("Har item ka rate daalo.", "Enter a rate for every item.");
};
const _fboV14 = FORMS.billOrder;
FORMS.billOrder = (f) => {
  const o = ordById(f.dataset.id),
    parts = billParts(f, o),
    noRate = parts.find((x) => f["rt" + x.i] && !(+f["rt" + x.i].value > 0));
  if (noRate) {
    document.getElementById("berr").textContent = L("Har item ka rate daalo.", "Enter a rate for every item.");
    f["rt" + noRate.i].focus();
    return;
  }
  const old = o.lines.map((l) => l.rate),
    n0 = S.invoices.length;
  parts.forEach(({ i }) => {
    const e = f["rt" + i];
    if (e) o.lines[i].rate = +e.value;
  });
  _fboV14(f);
  if (S.invoices.length === n0) {
    o.lines.forEach((l, i) => (l.rate = old[i])); // bill not made: put the old rates back
    return;
  }
  const ch = parts.filter(({ i }) => Math.abs(o.lines[i].rate - old[i]) > 0.0001);
  if (ch.length) {
    ch.forEach(({ i }) => (o.lines[i].rateAt = "bill"));
    logA(
      `Slip #${o.no}: bill par rate badla (${ch.map(({ i }) => `₹${nf(old[i], 2)} → ₹${nf(o.lines[i].rate, 2)}`).join(", ")})`,
      `Slip #${o.no}: rate changed at billing (${ch.map(({ i }) => `₹${nf(old[i], 2)} → ₹${nf(o.lines[i].rate, 2)}`).join(", ")})`,
    );
    save();
  }
};
/* invoice paper: slip number + transport */
const _ivmV14 = invoiceModal;
invoiceModal = function (id) {
  _ivmV14(id);
  const inv = S.invoices.find((x) => x.id === id),
    d = inv && S.dispatches.find((x) => x.id === inv.disp),
    o = d && ordById(d.order),
    to = document.querySelector("#modal-root .paper > div:nth-child(2)");
  if (!o || !to) return;
  to.insertAdjacentHTML(
    "afterend",
    `<div class="slipmeta"><div><div class="m">Order slip</div><b>No. ${o.no}</b><div class="m">${fdate(slipOf(o).date)}</div></div><div><div class="m">Transport</div><b>${route14(o) || "–"}</b></div></div>`,
  );
};

/* ---------- Hindi words used above ---------- */
Object.entries({
  tareekh: "तारीख़",
  transport: "ट्रांसपोर्ट",
  liya: "लिया",
  deal: "डील",
  series: "सीरीज़",
  agla: "अगला",
  priority: "प्रायोरिटी",
  book: "बुक",
  kram: "क्रम",
  wise: "वाइज़",
  waqt: "वक़्त",
  alag: "अलग",
  aakhri: "आख़िरी",
  likho: "लिखो",
  badli: "बदली",
  kholo: "खोलो",
  doosra: "दूसरा",
  badlenge: "बदलेंगे",
  isi: "इसी",
  kul: "कुल",
}).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
