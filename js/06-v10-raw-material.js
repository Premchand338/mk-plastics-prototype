"use strict";
/* ---------- v10: owner changes (raw material, add stock units) ---------- */
/* ABS, GPPS, Papdi -> Pearl line. Everything else (Black PP, others) -> Metalizing line. */
RM_TYPES.splice(
  0,
  RM_TYPES.length,
  "Semi",
  "Super",
  "ABS",
  "Papdi",
  "Black PP",
);
SAMPLE_RMS.splice(
  0,
  SAMPLE_RMS.length,
  ["ABS", "P", "ABS", 200, 0],
  ["GPPS 206 Semi", "P", "Semi", 500, 112],
  ["GPPS 206 Super", "P", "Super", 400, 118],
  ["Papdi", "P", "Papdi", 100, 0],
  ["Black PP", "Z", "Black PP", 200, 0],
);
const rmBase = (r) => r.base || (/^GPPS 206/.test(r.n) ? "GPPS 206" : r.n);
const isPapdi = (id) => {
  const r = rmOf(id);
  return !!r && /papdi/i.test(r.n);
};
const lineOfName = (n) => (/abs|gpps|papdi/i.test(n) ? "P" : "Z");
syncRaw = function () {
  const cons = RAW.filter(
    (r) => !r.rm && !/^g[A-Z]/.test(r.id) && r.unit !== "O",
  );
  const rms = (S.rms || []).map((r) => ({
    id: r.id,
    unit: "M",
    n: r.n,
    uom: "kg",
    re: r.re,
    rm: true,
    line: r.line,
    type: r.type,
  }));
  const oth = (S.others || []).map((o) => ({
    id: o.id,
    unit: "O",
    n: o.n,
    uom: o.uom,
    re: 0,
    oth: true,
  }));
  RAW.splice(0, RAW.length, ...rms, ...cons, ...oth);
  Object.keys(RM).forEach((k) => delete RM[k]);
  RAW.forEach((r) => (RM[r.id] = r));
  (S.rms || []).forEach((r) => {
    COST.raw[r.id] = r.cost || 0;
  });
};
function initV10() {
  if (S.v10) return;
  S.v10 = true;
  S.others = S.others || [];
  if (
    (S.rms || []).length === SAMPLE_RMS.length &&
    S.rms.every((r, i) => r.n === SAMPLE_RMS[i][0])
  ) {
    S.rms.forEach((r) => (r.v10 = 1));
    syncRaw();
    return;
  }
  const old = S.rms || [],
    blob = JSON.stringify([S.entries, S.inwards, S.tasks, S.jobs, S.regrinds]);
  const out = [];
  SAMPLE_RMS.forEach(([n, line, type, re, cost]) => {
    const o = /^GPPS/.test(n)
      ? old.find(
          (r) =>
            r.line === "P" && r.type === type && /^GPPS/.test(r.n) && !r.v10,
        )
      : null;
    out.push(
      o
        ? Object.assign(o, { n, re, v10: 1 })
        : { id: "rm" + S.seq.rm++, n, line, type, re, cost, v10: 1 },
    );
  });
  old.forEach((r) => {
    if (
      !r.v10 &&
      (blob.includes('"' + r.id + '"') || qty("RAW:M", r.id, "kg") > 0)
    )
      out.push(r);
  });
  S.rms = out;
  syncRaw();
}
const _seedV10 = seed;
seed = function () {
  _seedV10();
  initV10();
};

/* new raw material: line follows the name unless changed by hand */
const _lrmV10 = LIVE.rmNew;
LIVE.rmNew = (f) => {
  _lrmV10(f);
  if (f.dataset.nm !== f.name.value) {
    f.dataset.nm = f.name.value;
    const v = lineOfName(f.name.value),
      r = f.querySelector("[name=line][value=" + v + "]");
    if (r) r.checked = true;
  }
};

/* add stock: Unit = Moulding, Metalizing, Pearl, Others (raw material stage) */
const _slV10 = stkLocs;
stkLocs = function (st) {
  return st === "raw"
    ? [
        ["M", "Moulding"],
        ["Z", "Metalizing"],
        ["P", "Pearl"],
        ["O", "Others"],
      ]
    : _slV10(st);
};
const _siV10 = stkItems;
stkItems = function (st, u) {
  if (st !== "raw") return _siV10(st, u);
  if (u === "O")
    return [
      ...(S.others || []).map((o) => [o.id, o.n, o.uom]),
      [
        "__newo",
        "+ " + L("Naya item (naam likho)", "New item (type the name)"),
        "kg",
      ],
    ];
  if (u !== "M")
    return RAW.filter((r) => r.unit === u && !r.rm).map((r) => [
      r.id,
      r.n,
      r.uom,
    ]);
  const seen = {},
    out = [];
  (S.rms || []).forEach((r) => {
    const b = rmBase(r),
      sib = S.rms.filter((x) => rmBase(x) === b);
    if (sib.length > 1) {
      if (seen[b]) return;
      seen[b] = 1;
      out.push(["__g:" + b, b + " · " + LINE[r.line] + " line", "kg"]);
    } else out.push([r.id, r.n + " · " + LINE[r.line] + " line", "kg"]);
  });
  RAW.filter((r) => r.unit === "M" && !r.rm).forEach((r) =>
    out.push([r.id, r.n, r.uom]),
  );
  return out;
};
function realRaw(f) {
  const v = f.item.value;
  if (v.startsWith("__g:")) return f.variant ? f.variant.value : "";
  return v;
}
const _lasV10 = LIVE.addStock;
LIVE.addStock = (f) => {
  _lasV10(f);
  const st = f.querySelector("[name=stage]:checked").value,
    iv = f.item.value;
  let box = document.getElementById("fsub10");
  if (!box) {
    f.item
      .closest(".row2")
      .insertAdjacentHTML(
        "afterend",
        '<div id="fsub10" class="row2" hidden></div>',
      );
    box = document.getElementById("fsub10");
  }
  const key = st + "|" + f.loc.value + "|" + iv;
  if (box.dataset.k !== key) {
    box.dataset.k = key;
    let h = "";
    if (st === "raw" && iv.startsWith("__g:")) {
      const b = iv.slice(4);
      h = `<div class="fld"><label for="fvar">${L("Kaunsa grade?", "Which grade?")}</label><select id="fvar" name="variant">${S.rms
        .filter((r) => rmBase(r) === b)
        .map((r) => `<option value="${r.id}">${esc(r.type)}</option>`)
        .join("")}</select></div>`;
    } else if (st === "raw" && isPapdi(iv))
      h = `<div class="fld" style="grid-column:1/-1"><label for="fdesc">${L("Description", "Description")} <span class="hint" style="display:inline">(${L("optional", "optional")})</span></label><input id="fdesc" name="desc" placeholder="${L("Jaise: rang, supplier, quality", "e.g. colour, supplier, quality")}"></div>`;
    else if (st === "raw" && iv === "__newo")
      h = `<div class="fld"><label for="fon">${L("Item ka naam", "Item name")}</label><input id="fon" name="o_n" placeholder="${L("Jaise: Carton box", "e.g. Carton box")}"></div><div class="fld"><label for="fou">${L("Kis unit mein", "Counted in")}</label><select id="fou" name="o_u"><option value="kg">kg</option><option value="pcs">pcs</option><option value="L">L</option><option value="roll">roll</option></select></div>`;
    box.innerHTML = h;
    box.hidden = !h;
  }
  if (st === "raw") {
    const id = realRaw(f),
      r = RM[id];
    if (iv === "__newo" && f.o_u) {
      const u = f.o_u.value;
      document.getElementById("su").textContent = "(" + u + ")";
      f.qty.step = intUom(u) ? "1" : "0.1";
      document.getElementById("sh").textContent = "";
    } else if (r) {
      document.getElementById("su").textContent = "(" + r.uom + ")";
      document.getElementById("sh").textContent =
        L("Abhi stock: ", "In stock now: ") +
        fq(qty("RAW:" + f.loc.value, id, r.uom), r.uom) +
        (r.rm ? " · " + LINE[r.line] + " line" : "");
    }
  }
};
function addOther(n, uom) {
  n = n.trim();
  if (!n) return null;
  S.others = S.others || [];
  const ex = S.others.find((o) => o.n.toLowerCase() === n.toLowerCase());
  if (ex) return ex.id;
  S.seq.oth = (S.seq.oth || 0) + 1;
  const id = "o" + S.seq.oth;
  S.others.push({ id, n, uom });
  syncRaw();
  return id;
}
const _stlV10 = stkTakeLine;
stkTakeLine = function (f) {
  if (f.querySelector("[name=stage]:checked").value !== "raw")
    return _stlV10(f);
  const iv = f.item.value;
  let q = +f.qty.value;
  if (!(q > 0)) return null;
  let id = iv,
    uom;
  if (iv === "__newo") {
    if (!f.o_n.value.trim()) {
      f.o_n.focus();
      return null;
    }
    id = addOther(f.o_n.value, f.o_u.value);
  } else if (iv.startsWith("__g:")) id = f.variant.value;
  const r = RM[id];
  if (!r) return null;
  uom = r.uom;
  q = intUom(uom) ? Math.round(q) : r1(q);
  const ln = { loc: "RAW:" + f.loc.value, item: id, uom, qty: q };
  const d = f.desc && isPapdi(id) ? f.desc.value.trim() : "";
  if (d) ln.desc = d;
  if (iv === "__newo") {
    f.o_n.value = "";
    f.item.value = id;
  }
  return ln;
};
const _snV10 = stkLineName;
stkLineName = function (l) {
  return _snV10(l) + (l.desc ? " (" + l.desc + ")" : "");
};
ACT.stkAddLine = function () {
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
  const same = draft.lines.find(
    (x) =>
      x.loc === l.loc && x.item === l.item && (x.desc || "") === (l.desc || ""),
  );
  if (same) same.qty = intUom(l.uom) ? same.qty + l.qty : r1(same.qty + l.qty);
  else draft.lines.push(l);
  e.textContent = "";
  f.qty.value = "";
  if (f.desc) f.desc.value = "";
  LIVE.addStock(f);
  f.qty.focus();
};

/* stock page: Others section */
const _avsV10 = AV.stock;
AV.stock = function () {
  const h = _avsV10();
  if (S.ui.stockTab !== "raw") return h;
  const o = RAW.filter((r) => r.unit === "O");
  const rows = o
    .map(
      (r) =>
        `<tr><td><div class="pname">${esc(r.n)}</div></td><td class="r"><b>${fq(qty("RAW:O", r.id, r.uom), r.uom)}</b></td></tr>`,
    )
    .join("");
  const sec =
    `<div class="eyebrow">${L("Others", "Others")}</div>` +
    (o.length
      ? `<div class="tw"><table><thead><tr><th>Material</th><th class="r">Stock</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="muted" style="font-size:13px">${L('Abhi koi item nahi. "Stock jodo" mein Unit = Others chuno.', 'No items yet. In "Add stock" pick Unit = Others.')}</p>`);
  const i = h.lastIndexOf('<p class="muted"');
  return i < 0 ? h : h.slice(0, i) + sec + h.slice(i);
};
