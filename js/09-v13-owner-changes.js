"use strict";
/* ---------- v13: owner changes (16 Nov) ----------
   1. Raw material separated by line (Pearl / Metalizing); old GPPS metal-grade items hidden.
   2. Shapes master: add, rename, hide.
   3. P2 operator login.
   4. Frames per packet per item: packets, bunch and waste worked out from frames.
   5. Coating task warns when no lot is in coating on that line. */
const SHAPES0 = SHAPES.slice(),
  KIND0 = JSON.parse(JSON.stringify(KIND9));
const P2U = {
  id: "stP2",
  role: "staff",
  unit: "P",
  machine: "P2",
  n: "P2 Operator",
  c: "var(--u-p)",
  mobile: "9800000024",
  pin: "3324",
};
if (!USERS.some((u) => u.id === "stP2")) USERS.push(P2U);
MSTAFF.P2 = "P2 Operator";

/* ----- 1. raw material by line ----- */
const rmStock = (r) => qty("RAW:M", r.id, "kg");
const rmHidden = (r) => !!r.legacy && rmStock(r) < 0.001;
const hidRM = () => new Set((S.rms || []).filter(rmHidden).map((r) => r.id));
const _syncV13 = syncRaw;
syncRaw = function () {
  _syncV13();
  RAW.forEach((x) => {
    if (!x.rm) return;
    const m = rmOf(x.id);
    if (m && rmHidden(m)) {
      x.re = 0;
      x.hid = true;
    } else if (m && m.legacy) {
      x.old = true;
    }
  });
};
function initV13() {
  S.users = S.users || [];
  if (!S.users.some((u) => u.id === "stP2"))
    S.users.push(Object.assign({ active: true, last: null, fails: 0 }, P2U));
  (S.rms || []).forEach((r) => {
    if (!r.v10 && !r.own && r.legacy === undefined) r.legacy = true;
  });
  if (!S.shapes) S.shapes = SHAPES0.map((n) => ({ n, hid: false }));
  S.shapeMap = S.shapeMap || {};
  (S.rl || []).forEach((r) => {
    if (r.fpp === undefined) {
      r.fpp = r.size === "4MM" && r.pack === 25 ? 5 : null;
      if (r.fpp) r.fppSample = true;
    }
  });
  applyShapes();
  syncRaw();
  S.v13 = true;
}
function applyShapes() {
  Object.keys(KIND9).forEach((k) => {
    const o = KIND0[k][0];
    KIND9[k][0] = (S.shapeMap || {})[o] || o;
  });
  SHAPES.splice(
    0,
    SHAPES.length,
    ...(S.shapes || []).filter((s) => !s.hid).map((s) => s.n),
  );
  if (typeof regAll === "function") regAll();
}
const _seedV13 = seed;
seed = function () {
  SHAPES.splice(0, SHAPES.length, ...SHAPES0);
  Object.keys(KIND0).forEach((k) => (KIND9[k] = KIND0[k].slice()));
  _seedV13();
  initV13();
};
const _frmV13 = FORMS.rmNew;
FORMS.rmNew = (f) => {
  const n = S.rms.length;
  _frmV13(f);
  if (S.rms.length > n) {
    S.rms[S.rms.length - 1].own = true;
    save();
  }
};

/* hide old items in every picker; group raw material chips by line */
const _trV13 = tapRefresh;
tapRefresh = function (root) {
  root = root || document.getElementById("modal-root");
  if (!root) return;
  const H = hidRM();
  if (H.size)
    root.querySelectorAll("form select").forEach((s) => {
      let lost = false;
      [...s.options].forEach((o) => {
        if (H.has(o.value)) {
          if (o.selected) lost = true;
          o.remove();
        }
      });
      s.querySelectorAll("optgroup").forEach((g) => {
        if (!g.children.length) g.remove();
      });
      if (lost) setTimeout(() => tapFire(s), 0);
    });
  return _trV13(root);
};
const _tsV13 = tapSelect;
tapSelect = function (s) {
  if (
    s.querySelector("optgroup") &&
    s.options.length <= 16 &&
    !isItemSel(s) &&
    !isColourSel(s) &&
    !/party/i.test(s.name)
  ) {
    const sig = tapSig(s);
    if (
      s._tsig === sig &&
      s.nextElementSibling &&
      s.nextElementSibling.classList.contains("tapbox")
    )
      return;
    s._tsig = sig;
    s._tkind = "groups";
    tapGroups(s);
    return;
  }
  if (s._tkind === "groups") s._tkind = undefined;
  return _tsV13(s);
};
function tapGroups(s) {
  const b = tapHost(s, "tgroups");
  b.className = "tapbox tgroups";
  const loose = [...s.children].filter((c) => c.tagName === "OPTION");
  b.innerHTML =
    (loose.length
      ? `<div class="tg"><div class="tg-c">${loose.map((o) => tchip(o, o.value === s.value)).join("")}</div></div>`
      : "") +
    [...s.querySelectorAll("optgroup")]
      .map(
        (g) =>
          `<div class="tg"><span class="tg-l">${esc(g.label)}</span><div class="tg-c">${[...g.children].map((o) => tchip(o, o.value === s.value)).join("")}</div></div>`,
      )
      .join("");
}
/* add stock: raw material under Moulding grouped Pearl line / Metalizing line / packing */
const _lasV13 = LIVE.addStock;
LIVE.addStock = (f) => {
  _lasV13(f);
  const st = f.querySelector("[name=stage]:checked").value;
  if (
    st === "raw" &&
    f.loc.value === "M" &&
    !f.item.querySelector("optgroup")
  ) {
    const cur = f.item.value,
      opts = [...f.item.options],
      lineOf = (v) => {
        if (v.startsWith("__g:")) return "P";
        const r = RM[v];
        return r && r.rm ? r.line : "X";
      };
    const grp = (l, lab) => {
      const os = opts.filter((o) => lineOf(o.value) === l);
      return os.length
        ? `<optgroup label="${lab}">${os.map((o) => o.outerHTML.replace(/ · (Pearl|Metalizing) line/, "")).join("")}</optgroup>`
        : "";
    };
    f.item.innerHTML =
      grp("P", L("Pearl line ka raw material", "Pearl line raw material")) +
      grp(
        "Z",
        L("Metalizing line ka raw material", "Metalizing line raw material"),
      ) +
      grp("X", L("Packing aur baaki", "Packing and other"));
    f.item.value = cur;
  }
  tapRefresh();
};
/* moulding task: say where the material will go */
const _ltV13 = LIVE.task;
LIVE.task = (f) => {
  _ltV13(f);
  const line = f.querySelector("[name=line]:checked").value,
    s = document.getElementById("tsum");
  if (s && !s.querySelector(".ln13"))
    s.insertAdjacentHTML(
      "beforeend",
      `<div class="ln13"><span>${L("Raw material ki list", "Raw material list")}</span><b>${L(`Sirf ${LINE[line]} line`, `${LINE[line]} line only`)}</b></div>`,
    );
  tapRefresh();
};
const _avsV13 = AV.stock;
AV.stock = function (u) {
  const keep = RAW.slice();
  RAW.splice(0, RAW.length, ...keep.filter((r) => !r.hid));
  try {
    return _avsV13(u);
  } finally {
    RAW.splice(0, RAW.length, ...keep);
  }
};

/* ----- 4. frames per packet ----- */
const fppOf = (it) => {
  const r = rlItem(it);
  return r && r.fpp > 0 ? r.fpp : null;
};
const bpfOf = (it) => {
  const r = rlItem(it);
  return r && r.fpp > 0 && r.pack > 0 ? r.pack / r.fpp : S.bpf;
};
const fppUse = (it) => {
  const r = rlItem(it);
  return fppOf(it) || (r && r.pack ? Math.max(1, r.pack / S.bpf) : null);
};
function withBpf(it, fn, persist) {
  const keep = S.bpf;
  S.bpf = bpfOf(it);
  try {
    return fn();
  } finally {
    S.bpf = keep;
    if (persist) save();
  }
}
const nf1 = (v) =>
  nf(
    Math.round(v * 100) / 100,
    Number.isInteger(Math.round(v * 100) / 100) ? 0 : 2,
  );
const packTxt = (it) => {
  const r = rlItem(it);
  if (!r || !r.pack)
    return L(
      "Is item ki packing abhi tay nahi",
      "Packing for this item is not set yet",
    );
  const f = fppOf(it);
  return f
    ? `1 packet = ${r.pack} bunch = ${f} frame · 1 frame = ${nf1(r.pack / f)} bunch`
    : `1 packet = ${r.pack} bunch · ${L("frame ka data baaki, abhi andaaza", "frame data pending, estimate for now")}: 1 frame = ${S.bpf} bunch`;
};

/* coating task: packets -> frames, and warn when no lot is in coating */
const _ctmV13 = coatTaskModal;
coatTaskModal = function (pre) {
  _ctmV13(pre);
  const f = document.querySelector("form[data-f=coatTask]");
  if (!f) return;
  const row = f.target.closest(".row2");
  row.insertAdjacentHTML(
    "beforebegin",
    `<div class="row2"><div class="fld"><label for="ctpk">${L("Kitne packet chahiye", "Packets needed")}</label><input id="ctpk" type="number" inputmode="numeric" min="0" step="1"><span class="hint">${L("Packet daalo, frames apne aap", "Type packets, frames fill in")}</span></div><div class="fld"><span class="lb">${L("Is item ka hisaab", "This item's packing")}</span><div class="pkinfo" id="ctpki"></div></div></div>`,
  );
  const h = f.target.parentNode.querySelector(".hint");
  if (h) h.id = "ctth";
  if (pre && pre.target) {
    f.ctpk.value = Math.floor(pre.target / (fppUse(f.it.value) || 1)) || "";
  }
  LIVE.coatTask(f);
};
const _lctV13 = LIVE.coatTask;
LIVE.coatTask = (f) => {
  withBpf(f.it.value, () => _lctV13(f));
  const dEl = f.querySelector("[name=coat][value=D]");
  if (dEl) dEl.disabled = false;
  const it = f.it.value,
    r = rlItem(it),
    fp = fppUse(it),
    t = +f.target.value || 0;
  const pi = document.getElementById("ctpki");
  if (pi) pi.innerHTML = `<b>${esc(packTxt(it))}</b>`;
  const th = document.getElementById("ctth");
  if (th) th.textContent = fp && t ? `= ${nf(Math.floor(t / fp))} packet` : "";
  const line = lineOfM(f.querySelector("[name=machine]:checked").value),
    has = S.thr.some(
      (l) => l.status === "cq" && l.line === line && l.bunch > 0,
    ),
    sum = document.getElementById("ctsum");
  if (sum) {
    sum.querySelectorAll(".v13").forEach((x) => x.remove());
  }
  let w = document.getElementById("ctwarn");
  if (!has) {
    if (!w) {
      sum.insertAdjacentHTML(
        "afterend",
        `<div class="note warn" id="ctwarn">${ic("alert", 16)}<span></span></div>`,
      );
      w = document.getElementById("ctwarn");
    }
    w.querySelector("span").textContent = L(
      `${LINE[line]} line mein abhi koi threaded lot coating mein nahi. Task de sakte ho, par staff entry tabhi kar payega jab aap Coating page se lot "Move to coating" karoge.`,
      `No threaded lot is in coating on the ${LINE[line]} line yet. You can assign the task, but staff can only enter work after you move a lot to coating.`,
    );
  } else if (w) w.remove();
  tapRefresh();
};
const _fctV13 = FORMS.coatTask;
FORMS.coatTask = (f) => withBpf(f.it.value, () => _fctV13(f), true);

/* coating entry: frames per item; packets, bunch and broken ladi shown */
const _emV13 = entryModal;
entryModal = function (id) {
  _emV13(id);
  const f = document.querySelector("form[data-f=entry][data-live=coatEntry9]");
  if (f) LIVE.coatEntry9(f);
};
const _lceV13 = LIVE.coatEntry9;
LIVE.coatEntry9 = (f) => {
  const it = f.it && f.it.value;
  withBpf(it, () => _lceV13(f));
  const r = rlItem(it),
    bpf = bpfOf(it),
    fp = fppUse(it),
    fi = +f.input.value || 0,
    fo = +f.out.value || 0,
    rj = +f.reject.value || 0,
    u = user() || {};
  const sub = document.querySelector("#modal-root .sh-h p");
  if (sub)
    sub.textContent = `${u.machine || ""} · ${UNITS[u.unit] ? UNITS[u.unit].n : ""} · ${packTxt(it)}`;
  const pk = document.getElementById("pkh");
  if (pk && r)
    pk.textContent = fo
      ? L(
          `${nf(fo)} frame = ${nf(Math.round(fo * bpf))} bunch = ${nf(Math.floor(fo / (fp || 1)))} packet${fp && fo % fp ? ` + ${nf(Math.round((fo % fp) * bpf))} bunch khula` : ""}. Khaali chhodo toh yahi lagega.`,
          `${nf(fo)} frames = ${nf(Math.round(fo * bpf))} bunches = ${nf(Math.floor(fo / (fp || 1)))} packets${fp && fo % fp ? ` + ${nf(Math.round((fo % fp) * bpf))} loose bunches` : ""}. Leave blank to use this.`,
        )
      : "";
  let wl = document.getElementById("wlad");
  if (!wl && pk) {
    pk.insertAdjacentHTML("afterend", '<span class="hint" id="wlad"></span>');
    wl = document.getElementById("wlad");
  }
  if (wl)
    wl.textContent = rj
      ? L(
          `Waste (ladi tooti): ${nf(rj)} frame ≈ ${nf(Math.round(rj * bpf))} bunch`,
          `Waste (broken strands): ${nf(rj)} frames ≈ ${nf(Math.round(rj * bpf))} bunches`,
        )
      : "";
  tapRefresh();
};
const _feV13 = FORMS.entry;
FORMS.entry = function (f) {
  const u = user();
  if (!u || u.unit === "M") return _feV13(f);
  const res = withBpf(f.it.value, () => _feV13(f), true);
  [...S.entries, ...S.outbox].forEach((e) => {
    if (e.kind === "coat")
      ["input", "out", "reject"].forEach((k) => {
        if (e[k] % 1) e[k] = Math.round(e[k]);
      });
  });
  save();
  return res;
};
const _lqV13 = lotQuick;
lotQuick = function (f) {
  return withBpf(f.it && f.it.value, () => _lqV13(f));
};

/* order: shortfall frames per item */
const _onmV13 = orderNextModal;
orderNextModal = function (oid) {
  _onmV13(oid);
  const o = S.orders.find((x) => x.id === oid);
  if (!o) return;
  document.querySelectorAll("#modal-root [data-a=orderTask]").forEach((b) => {
    const i = +b.dataset.i,
      p = PM[o.lines[i].ref],
      fr = Math.max(1, Math.ceil(shortOf(o, i) / bpfOf(p.it)));
    b.innerHTML = `${ic("send", 14)} ${L("Coating task do", "Assign coating task")} (${nf(fr)} frame)`;
  });
};
const _otV13 = ACT.orderTask;
ACT.orderTask = (el) => {
  const o = S.orders.find((x) => x.id === el.dataset.id),
    p = PM[o.lines[+el.dataset.i].ref];
  return withBpf(p.it, () => _otV13(el));
};

/* rate list: frames per packet column + edit */
const _rleV13 = ACT.rlEdit;
ACT.rlEdit = (el) => {
  _rleV13(el);
  const f = document.querySelector("form[data-f=rlEdit]");
  if (!f) return;
  const r = rlItem(f.dataset.id);
  f.pack
    .closest(".row2")
    .insertAdjacentHTML(
      "afterend",
      `<div class="row2"><div class="fld"><label for="rfp">${L("Frames / packet", "Frames per packet")}</label><input id="rfp" name="fpp" type="number" inputmode="numeric" min="0" step="1" value="${r.fpp || ""}"><span class="hint">${L("1 packet banane mein kitne frame lagte hain", "How many frames make one packet")}</span></div><div class="fld"><span class="lb">${L("Hisaab", "Works out to")}</span><div class="pkinfo" id="rfpi"></div></div></div>`,
    );
  rfpUpd(f);
  tapRefresh();
};
function rfpUpd(f) {
  const p = +f.pack.value || 0,
    fp = +f.fpp.value || 0,
    el = document.getElementById("rfpi");
  if (el)
    el.innerHTML =
      p && fp
        ? `<b>1 frame = ${nf1(p / fp)} bunch</b><span>${fp} frame = 1 packet = ${p} bunch</span>`
        : `<b>${L("Data baaki", "Not set")}</b><span>${L(`Tab tak 1 frame = ${S.bpf} bunch maana jaayega`, `Until then 1 frame = ${S.bpf} bunches is assumed`)}</span>`;
}
document.addEventListener("input", (e) => {
  const t = e.target,
    f = t.form;
  if (!f) return;
  if (f.dataset.f === "rlEdit" && (t.name === "fpp" || t.name === "pack"))
    rfpUpd(f);
  if (f.dataset.f === "coatTask" && t.id === "ctpk") {
    const fp = fppUse(f.it.value) || 1,
      pk = Math.round(+t.value || 0);
    setNum(f.target, pk ? Math.ceil(pk * fp) : "");
  }
  if (
    f.dataset.f === "coatTask" &&
    t.name === "target" &&
    !TAP.auto &&
    f.ctpk
  ) {
    const fp = fppUse(f.it.value) || 1;
    f.ctpk.value = +t.value ? Math.floor(+t.value / fp) : "";
  }
});
const _frlV13 = FORMS.rlEdit;
FORMS.rlEdit = (f) => {
  const r = rlItem(f.dataset.id),
    v = Math.round(+f.fpp.value || 0) || null;
  if (r && r.fpp !== v) {
    r.fpp = v;
    r.fppSample = false;
    logA(
      `Frames/packet: ${r.no}. ${rlName(r)} = ${v || "–"}`,
      `Frames per packet: ${r.no}. ${rlName(r)} = ${v || "–"}`,
    );
  }
  _frlV13(f);
};

/* ----- rate list page: table + raw material by line + shapes ----- */
function rlSection(admin) {
  return `<section class="card"><div class="card-h"><div><h3>${L("Rate list", "Rate list")} · ${S.rl.length} item</h3><p>${L("Rate ₹ per bunch. Packing = ek packet mein kitne bunch. Frames/packet = ek packet ke liye kitne frame. Isi se coating entry mein packet aur bunch apne aap bante hain.", "Rates are ₹ per bunch. Packing = bunches per packet. Frames/packet = frames needed for one packet; coating entries use it to work out packets and bunches.")}</p></div>${admin ? `<button type="button" class="btn sm" data-a="bpfEdit">${ic("edit", 14)} Default: 1 frame = ${S.bpf} bunch</button>` : ""}</div>
  <div class="tw"><table><thead><tr><th>No</th><th>Item</th><th class="r">Bunch / kg</th><th class="r">Single ₹</th><th class="r">Double ₹</th><th class="r">Packing</th><th class="r">Frames / packet</th><th></th></tr></thead><tbody>${S.rl.map((r) => `<tr><td>${r.no}</td><td><b>${esc(rlName(r))}</b><div class="psub">${esc(rlShape(r))}${r.note ? " · " + esc(r.note) : ""}</div></td><td class="r">${r.bpk ? nf(r.bpk, 2) : "–"}</td><td class="r">${r.s ? nf(r.s, 2) : "–"}</td><td class="r">${r.d ? nf(r.d, 2) : "–"}</td><td class="r">${r.pack ? nf(r.pack) + " bunch" : "–"}</td><td class="r">${r.fpp ? `<b>${r.fpp}</b> <span class="psub">(1 fr = ${nf1(r.pack / r.fpp)})</span>${r.fppSample ? ' <span class="pill mute">sample</span>' : ""}` : `<span class="pill warn">${L("data baaki", "pending")}</span>`}</td><td>${admin ? `<button type="button" class="btn sm" data-a="rlEdit" data-id="${r.no}">${ic("edit", 14)} ${L("Badlo", "Edit")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>
  <p class="psub">${L('"–" matlab abhi tay nahi. Frames/packet khaali ho toh default frame size se andaaza lagta hai. Badlav sirf nayi entry par lagta hai; purani entry apna hisaab rakhti hai.', '"–" means not set. Without frames/packet the default frame size is used as an estimate. Changes apply to new entries; old entries keep their own conversion.')}</p></section>`;
}
function rmSection(admin) {
  const vis = (S.rms || []).filter((r) => !rmHidden(r)),
    hid = (S.rms || []).filter(rmHidden).length;
  const col = (line) => {
    const list = vis.filter((r) => r.line === line);
    return `<div class="rmc"><div class="rmc-h">${lineChip(line)}<span class="psub">${list.length} item</span></div>${list.length ? list.map((r) => `<div class="rmr"><div><b>${esc(r.n)}</b>${r.legacy ? ' <span class="pill mute">' + L("Purana", "Old") + "</span>" : ""}<span class="psub">Type ${esc(r.type)} · ${L("stock", "stock")} ${kg(rmStock(r))} · reorder ${kg(r.re || 0)}</span></div>${admin ? `<button type="button" class="btn sm" data-a="rmEdit" data-id="${r.id}">${ic("edit", 14)} ${L("Badlo", "Edit")}</button>` : ""}</div>`).join("") : `<div class="mini-e">${L("Is line ka raw material nahi", "No raw material for this line")}</div>`}</div>`;
  };
  return `<section class="card"><div class="card-h"><div><h3>${L("Raw material · line ke hisaab se", "Raw material · by line")}</h3><p>${L("Pearl line ka raw material sirf Pearl line ke kaam mein aata hai, Metalizing ka sirf Metalizing mein. Moulding task, inward aur stock jodo yahi list dikhate hain, isliye maal ka poora safar raw material se tay hota hai.", "Pearl-line raw material is used only for Pearl-line work, Metalizing only for Metalizing. Moulding tasks, inward and add stock show this list, so the whole journey follows the raw material.")}</p></div>${admin ? `<button type="button" class="btn sm pri" data-a="rmNew">${ic("plus", 14)} ${L("Naya raw material", "New raw material")}</button>` : ""}</div>
   <div class="rmcat">${col("P")}${col("Z")}</div>${hid ? `<p class="psub">${L(`${hid} purane item (jaise GPPS SL / PS / DB / metal grade) list se hata diye gaye. Unka purana record safe hai.`, `${hid} old items (such as GPPS SL / PS / DB / metal grade) are hidden from lists. Their history is kept.`)}</p>` : ""}</section>`;
}
function shapeUse(n) {
  const k = "|" + n + "|";
  return {
    stock: Object.keys(S.stock).some(
      (x) => x.includes(k) && S.stock[x] > 0.0001,
    ),
    tasks: S.tasks.some((t) => t.shape === n && t.status === "open"),
    rl: Object.values(KIND9).some((v) => v[0] === n),
  };
}
function shapeSection(admin) {
  return `<section class="card"><div class="card-h"><div><h3>${L("Shapes", "Shapes")} · ${S.shapes.filter((s) => !s.hid).length}</h3><p>${L("Moulding task mein yahi shapes dikhte hain. Naam badalne par purana stock aur record bhi naye naam se dikhega.", "Moulding tasks show these shapes. Renaming also renames existing stock and records.")}</p></div>${admin ? `<button type="button" class="btn sm pri" data-a="shapeNew">${ic("plus", 14)} ${L("Naya shape", "New shape")}</button>` : ""}</div>
   <div class="shp">${S.shapes.map((s, i) => `<div class="shc${s.hid ? " off" : ""}"><b>${esc(s.n)}</b>${s.hid ? `<span class="pill mute">${L("band", "hidden")}</span>` : ""}${admin ? `<button type="button" class="lnk" data-a="shapeEdit" data-i="${i}">${ic("edit", 13)} ${L("Badlo", "Edit")}</button>` : ""}</div>`).join("")}</div></section>`;
}
const _avpV13 = AV.products;
AV.products = function (u) {
  const admin = (user() || {}).role === "admin",
    h = _avpV13(u),
    i = h.indexOf("</section>");
  return (
    rlSection(admin) + rmSection(admin) + shapeSection(admin) + h.slice(i + 10)
  );
};

ACT.rmEdit = (el) => {
  const r = rmOf(el.dataset.id);
  if (!r) return;
  const st = rmStock(r);
  openModal(
    L("Raw material badlo", "Edit raw material"),
    esc(r.n),
    `<div class="fld"><label for="ren">${L("Naam", "Name")}</label><input id="ren" name="name" value="${esc(r.n)}"></div>
   <div class="fld"><span class="lb">Line</span><div class="radios"><label><input type="radio" name="line" value="P" ${r.line === "P" ? "checked" : ""}>Pearl line</label><label><input type="radio" name="line" value="Z" ${r.line === "Z" ? "checked" : ""}>Metalizing line</label></div><span class="hint">${L("Line badalne se agle task aur inward naye line mein jaayenge.", "Changing the line sends future tasks and inwards to the new line.")}</span></div>
   <div class="row3"><div class="fld"><label for="ret">Type</label><input id="ret" name="type" value="${esc(r.type)}"></div><div class="fld"><label for="rer">Reorder (kg)</label><input id="rer" name="re" type="number" inputmode="decimal" min="0" step="1" value="${r.re || 0}"></div><div class="fld"><label for="rec">Rate ₹ / kg</label><input id="rec" name="cost" type="number" inputmode="decimal" min="0" step="0.1" value="${r.cost || 0}"></div></div>
   <label class="chk"><input type="checkbox" name="hide" ${st > 0.001 ? "disabled" : ""}> ${L("List se hatao (band karo)", "Remove from lists")}${st > 0.001 ? ` · <span class="psub">${L(`stock ${kg(st)} hai, pehle khatam karo`, `${kg(st)} in stock, use it up first`)}</span>` : ""}</label>
   <p class="err" id="reerr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "rmEdit", id: r.id },
  );
};
FORMS.rmEdit = (f) => {
  const r = rmOf(f.dataset.id),
    n = f.name.value.trim(),
    ty = f.type.value.trim();
  if (!n || !ty) {
    document.getElementById("reerr").textContent = L(
      "Naam aur type chahiye.",
      "Name and type are needed.",
    );
    return;
  }
  const was = `${r.n} · ${LINE[r.line]}`;
  Object.assign(r, {
    n,
    type: ty,
    line: f.querySelector("[name=line]:checked").value,
    re: +f.re.value || 0,
    cost: +f.cost.value || 0,
  });
  if (!RM_TYPES.includes(ty)) RM_TYPES.push(ty);
  if (f.hide.checked && !f.hide.disabled) r.legacy = true;
  syncRaw();
  logA(
    `Raw material badla: ${was} → ${r.n} · ${LINE[r.line]}${f.hide.checked ? " (band)" : ""}`,
    `Raw material edited: ${was} → ${r.n} · ${LINE[r.line]}${f.hide.checked ? " (hidden)" : ""}`,
  );
  closeModal();
  render();
  toast(L("Save ho gaya.", "Saved."));
};

ACT.shapeNew = () =>
  openModal(
    L("Naya shape", "New shape"),
    "",
    `<div class="fld"><label for="shn">${L("Shape ka naam", "Shape name")}</label><input id="shn" name="name" placeholder="${L("Jaise: Oval", "e.g. Oval")}"></div><p class="err" id="sherr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Jodo", "Add")}</button>`,
    { form: "shapeNew" },
  );
FORMS.shapeNew = (f) => {
  const n = f.name.value.trim();
  if (!n) return f.name.focus();
  if (S.shapes.some((s) => s.n.toLowerCase() === n.toLowerCase())) {
    document.getElementById("sherr").textContent = L(
      "Yeh shape pehle se hai.",
      "This shape already exists.",
    );
    return;
  }
  S.shapes.push({ n, hid: false });
  applyShapes();
  logA(`Naya shape: ${n}`, `New shape: ${n}`);
  closeModal();
  render();
  toast(L("Shape jud gaya.", "Shape added."));
};
ACT.shapeEdit = (el) => {
  const s = S.shapes[+el.dataset.i],
    u = shapeUse(s.n),
    lock = u.stock || u.tasks || u.rl;
  openModal(
    L("Shape badlo", "Edit shape"),
    esc(s.n),
    `<div class="fld"><label for="shr">${L("Naam", "Name")}</label><input id="shr" name="name" value="${esc(s.n)}"><span class="hint">${u.stock || u.rl ? L("Is shape ka stock / rate list item hai. Naya naam wahan bhi lag jaayega, Record mein likha jaayega.", "This shape has stock or rate list items. The new name applies there too and is logged in Record.") : ""}</span></div>
   <label class="chk"><input type="checkbox" name="hide" ${s.hid ? "checked" : ""} ${lock && !s.hid ? "disabled" : ""}> ${L("Task list se chhupao", "Hide from task list")}${lock && !s.hid ? ` · <span class="psub">${u.stock ? L("stock hai", "has stock") : u.tasks ? L("chalu task hai", "open task") : L("rate list mein hai", "used in rate list")}</span>` : ""}</label><p class="err" id="sherr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "shapeEdit", id: el.dataset.i },
  );
};
FORMS.shapeEdit = (f) => {
  const s = S.shapes[+f.dataset.id],
    a = s.n,
    b = f.name.value.trim();
  if (!b) return f.name.focus();
  if (
    b !== a &&
    S.shapes.some((x) => x !== s && x.n.toLowerCase() === b.toLowerCase())
  ) {
    document.getElementById("sherr").textContent = L(
      "Is naam ka shape pehle se hai.",
      "A shape with this name exists.",
    );
    return;
  }
  if (b !== a) {
    const j = JSON.stringify(S)
      .split("|" + a + "|")
      .join("|" + b + "|")
      .split('"shape":"' + a + '"')
      .join('"shape":"' + b + '"');
    const ns = JSON.parse(j);
    Object.keys(S).forEach((k) => delete S[k]);
    Object.assign(S, ns);
    const sh = S.shapes.find((x) => x.n === a) || S.shapes[+f.dataset.id];
    sh.n = b;
    const orig = Object.keys(KIND0)
      .map((k) => KIND0[k][0])
      .find((o) => (S.shapeMap[o] || o) === a);
    if (orig) S.shapeMap[orig] = b;
    logA(`Shape ka naam badla: ${a} → ${b}`, `Shape renamed: ${a} → ${b}`);
  }
  const s2 = S.shapes[+f.dataset.id];
  if (!f.hide.disabled) s2.hid = f.hide.checked;
  applyShapes();
  closeModal();
  render();
  toast(L("Save ho gaya.", "Saved."));
};
