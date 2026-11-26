'use strict';
/* ===== v14.5 · Section 6: coating task, packets → frames (client review 24 Nov · V10, P2) =====
   6.1 1 bunch = 1,200 moti (S.cfg14.mpb), 1 packet = packing × 1,200 moti (8mm: 4 × 1,200 = 4,800)
   6.2 moti per frame from the pirai spec (P2): 8mm Semi = 2 × 18 × 50 = 1,800
   6.3 exact frames per packet = 4,800 ÷ 1,800 = 2.667 (the app works it out)
   6.4 owner's allowance per item for broken ladi (8mm = 2.8): task frames = packets × allowance (100 × 2.8 = 280)
   6.5 the coating task shows its frame target clearly ("280 frame ka target · 100 packet × 2.8")
   How: v13's frame helpers (bpfOf, fppOf, fppUse) are `const` and read r.fpp, so r.fpp now holds the EXACT frames per
   packet from P2 (r.fppSrc = "p2"); 1 frame = moti per frame ÷ 1,200 bunches everywhere (coating entry, stock).
   The allowance is kept apart in r.alw and used only for task targets. Items with no P2 spec keep the old way.
   Owner answer still open: Q4 (allowance list for every item) → editable per item, only 8mm Semi = 2.8 (V10) is set. */

const ALW14 = [{ size: "8MM", kind: "Semi", alw: 2.8 }]; // V10 · 3:23–4:33

function specOfItem14(r) {
  const ps = S.pirai || [];
  return ps.find((s) => s.it === r.no) || ps.find((s) => s.size === r.size && s.kind === r.kind) || null;
}
/* r.fpp = packing × 1,200 ÷ moti per frame, for every rate-list item that has a P2 spec and a packing */
function syncFpp14() {
  (S.rl || []).forEach((r) => {
    const sp = specOfItem14(r);
    if (sp && r.pack > 0) {
      r.fpp = (r.pack * mpb14()) / mpf14(sp);
      r.fppSrc = "p2";
      r.fppSample = false;
    } else if (r.fppSrc === "p2") {
      r.fpp = null; // spec or packing removed: back to "data baaki"
      r.fppSrc = "";
    }
  });
}
const _initV14e = initV14;
initV14 = function () {
  _initV14e();
  if (!S.v145) {
    (S.rl || []).forEach((r) => {
      const a = ALW14.find((x) => x.size === r.size && x.kind === r.kind);
      if (a && r.alw == null) {
        r.alw = a.alw;
        r.alwSrc = "V10";
      }
    });
    S.v145 = true;
  }
  syncFpp14();
};
const alwOf14 = (it) => {
  const r = rlItem(it);
  return r && r.alw > 0 ? r.alw : null;
};
/* frames for a task: allowance if the owner gave one, else the exact number */
const taskFpp14 = (it) => alwOf14(it) || fppUse(it) || null;
const fr2 = (v) => (+(+v).toFixed(3)).toLocaleString("en-IN", { maximumFractionDigits: 3 }); // 2.8, 2.667, 10
function packMath14(it) {
  const r = rlItem(it),
    sp = r && specOfItem14(r);
  if (!r || !r.pack) return null;
  const mpp = r.pack * mpb14(),
    mpf = sp ? mpf14(sp) : null,
    ex = mpf ? mpp / mpf : fppUse(it);
  return { r, sp, mpp, mpf, ex, alw: alwOf14(it), use: alwOf14(it) || ex };
}
function packCard14(it, pk) {
  const m = packMath14(it);
  if (!m) return `<b>${L("Is item ki packing abhi tay nahi", "Packing for this item is not set yet")}</b>`;
  const lines = m.mpf
    ? `<span>1 packet = ${m.r.pack} bunch × ${nf(mpb14())} = <b>${nf(m.mpp)} moti</b></span><span>1 frame = ${m.sp.gpf} × ${m.sp.ladi} × ${m.sp.mpl} = <b>${nf(m.mpf)} moti</b> (P2)</span><span>${L("Exact", "Exact")}: ${nf(m.mpp)} ÷ ${nf(m.mpf)} = <b>${fr2(m.ex)} frame / packet</b></span>`
    : `<span>${L("P2 spec nahi: andaaza", "No P2 spec: estimate")} ${fr2(m.ex)} frame / packet</span>`;
  const al = m.alw
    ? `<span>${L("Allowance (tooti ladi)", "Allowance (broken ladi)")}: <b>${fr2(m.alw)} frame / packet</b>${m.r.alwSrc ? " · " + esc(m.r.alwSrc) : ""}</span>`
    : `<span class="warn14">${L("Allowance abhi nahi (Q4): exact se target", "No allowance yet (Q4): target uses exact")}</span>`;
  const tg = pk > 0 ? `<span class="tg14">${nf(pk)} packet × ${fr2(m.use)} = <b>${nf(Math.ceil(pk * m.use - 1e-9))} frame</b></span>` : "";
  return lines + al + tg;
}

/* ---------- 6.3–6.5 coating task form ---------- */
const _ctmV145 = coatTaskModal;
coatTaskModal = function (pre) {
  _ctmV145(pre);
  const f = document.querySelector("form[data-f=coatTask]");
  if (!f || !f.ctpk) return;
  if (pre && pre.packets) {
    f.ctpk.value = pre.packets;
    f.target.value = Math.ceil(pre.packets * (taskFpp14(f.it.value) || 1) - 1e-9);
  }
  LIVE.coatTask(f);
};
const _lctV145 = LIVE.coatTask;
LIVE.coatTask = (f) => {
  _lctV145(f);
  const it = f.it.value,
    pk = Math.round(+(f.ctpk && f.ctpk.value) || 0),
    t = +f.target.value || 0,
    pi = document.getElementById("ctpki"),
    m = packMath14(it);
  if (pi) pi.innerHTML = packCard14(it, pk);
  const th = f.target.closest(".fld").querySelector(".hint"); // the stepper wraps the input, so look in the field
  if (th && m)
    th.textContent = `1 frame = ${fr2(m.r.pack / (m.ex || 1))} bunch${t ? ` · = ${nf(Math.floor(t / m.use + 1e-9))} packet${m.alw ? ` (${fr2(m.alw)} ${L("allowance se", "with allowance")})` : ""}` : ""}`;
  const sum0 = document.getElementById("ctsum");
  if (sum0 && t) {
    sum0.querySelectorAll(".v145").forEach((x) => x.remove());
    sum0.insertAdjacentHTML("afterbegin", `<div class="v145 tot14"><span>${L("Target", "Target")}</span><b>${nf(t)} frame${pk ? ` · ${nf(pk)} packet` : ""}</b></div>`);
  }
};
/* packets ↔ frames use the allowance (v13's handler used the exact number; this one runs after it) */
document.addEventListener("input", (e) => {
  const t = e.target,
    f = t && t.form;
  if (!f || f.dataset.f !== "coatTask") return;
  const use = taskFpp14(f.it.value);
  if (!use || !e.isTrusted) return; // react only to what the person typed, not to the app's own updates
  if (t.id === "ctpk") {
    const pk = Math.round(+t.value || 0);
    setNum(f.target, pk ? Math.ceil(pk * use - 1e-9) : "", true); // auto: v13's frames→packets handler skips it
  } else if (t.name === "target" && f.ctpk) f.ctpk.value = +t.value ? Math.floor(+t.value / use + 1e-9) : "";
});
const _fctV145 = FORMS.coatTask;
FORMS.coatTask = (f) => {
  const n0 = S.tasks.length,
    pk = Math.round(+(f.ctpk && f.ctpk.value) || 0),
    m = packMath14(f.it.value);
  _fctV145(f);
  if (S.tasks.length === n0) return;
  const t = S.tasks[S.tasks.length - 1];
  Object.assign(t, { pk: pk || null, alw: m ? m.alw : null, fppx: m ? m.ex : null, mpf: m ? m.mpf : null });
  save();
};
/* 6.5 task card: the target in words */
const _tc9V145 = taskCard9;
taskCard9 = function (t, mode) {
  const h = _tc9V145(t, mode);
  if (t.kind !== "coat" || !t.target) return h;
  const i = h.indexOf('<div class="yield"');
  if (i < 0) return h;
  const how = t.pk ? ` · ${nf(t.pk)} packet × ${fr2(t.alw || t.fppx || t.target / t.pk)}${t.alw ? " (allowance)" : ""}` : "";
  return h.slice(0, i) + `<div class="t2 tgt14">${ic("check", 12)}<span><b>${nf(t.target)} frame ${L("ka target", "target")}</b>${how}</span></div>` + h.slice(i);
};

/* order → coating task: packets short × allowance */
const _otV145 = ACT.orderTask;
ACT.orderTask = (el) => {
  _otV145(el);
  const o = S.orders.find((x) => x.id === el.dataset.id),
    l = o && o.lines[+el.dataset.i],
    f = document.querySelector("form[data-f=coatTask]");
  if (!l || !f || !f.ctpk) return;
  const pk = Math.ceil(shortOf(o, +el.dataset.i) / (l.pack || 1) - 1e-9),
    use = taskFpp14(PM[l.ref].it);
  if (!use || !pk) return;
  f.ctpk.value = pk;
  f.target.value = Math.ceil(pk * use - 1e-9);
  LIVE.coatTask(f);
};
const _onmV145 = orderNextModal;
orderNextModal = function (oid) {
  _onmV145(oid);
  const o = S.orders.find((x) => x.id === oid);
  if (!o) return;
  document.querySelectorAll("#modal-root [data-a=orderTask]").forEach((b) => {
    const i = +b.dataset.i,
      l = o.lines[i],
      use = taskFpp14(PM[l.ref].it);
    if (!use) return;
    const pk = Math.ceil(shortOf(o, i) / (l.pack || 1) - 1e-9);
    b.innerHTML = `${ic("send", 14)} ${L("Coating task do", "Assign coating task")} (${nf(pk)} packet · ${nf(Math.ceil(pk * use - 1e-9))} frame)`;
  });
};

/* ---------- 6.4 rate list: exact frames/packet (P2) + allowance ---------- */
const _rleV145 = ACT.rlEdit;
ACT.rlEdit = (el) => {
  _rleV145(el);
  const f = document.querySelector("form[data-f=rlEdit]");
  if (!f || !f.fpp) return;
  const r = rlItem(f.dataset.id),
    p2 = r.fppSrc === "p2";
  if (p2) {
    f.fpp.value = fr2(r.fpp).replace(/,/g, "");
    f.fpp.readOnly = true;
    f.fpp.step = "any";
    const lb = f.querySelector("label[for=rfp]");
    if (lb) lb.textContent = L("Frames / packet (P2 se, exact)", "Frames per packet (from P2, exact)");
    const h = f.fpp.closest(".fld").querySelector(".hint");
    if (h) h.textContent = L("Pirai spec aur packing se apne aap. Badalna ho toh Pirai spec badlo.", "Worked out from the pirai spec and packing. Change the pirai spec to change it.");
  }
  f.fpp.closest(".row2").insertAdjacentHTML(
    "afterend",
    `<div class="fld"><label for="ralw">${L("Allowance: frame / packet (tooti ladi ke saath)", "Allowance: frames per packet (with broken ladi)")}</label><input id="ralw" name="alw" type="number" inputmode="decimal" min="0" step="0.01" value="${r.alw || ""}" placeholder="${p2 ? fr2(r.fpp) : ""}"><span class="hint">${L("Jaise 8mm = 2.8. Coating task mein packet × allowance = frame. Khaali = exact.", "e.g. 8mm = 2.8. Coating task frames = packets × allowance. Empty = exact.")}</span></div>`,
  );
  if (typeof tapRefresh === "function") tapRefresh();
};
const _frlV145 = FORMS.rlEdit;
FORMS.rlEdit = (f) => {
  const r = rlItem(f.dataset.id),
    a = f.alw ? Math.round((+f.alw.value || 0) * 100) / 100 || null : r && r.alw,
    old = r ? r.alw || null : null;
  if (r && r.fppSrc === "p2") r.fpp = Math.round(+f.fpp.value || 0) || null; // v13 rounds; match it so it logs nothing, exact comes back below
  _frlV145(f);
  if (!r) return;
  r.alw = a;
  if (a !== old) {
    r.alwSrc = a ? L("owner", "owner") : "";
    logA(`Allowance ${r.no}. ${rlName(r)}: ${old || "–"} → ${a || "–"} frame/packet`, `Allowance ${r.no}. ${rlName(r)}: ${old || "–"} → ${a || "–"} frames per packet`);
  }
  syncFpp14();
  save();
  render();
};
/* spec or bunch size changed → exact frames per packet changes too */
["piraiEdit14", "mpbEdit14"].forEach((k) => {
  const prev = FORMS[k];
  FORMS[k] = (f) => {
    prev(f);
    syncFpp14();
    save();
    render();
  };
});
/* rate-list table: exact value, allowance and where it came from */
const _avpV145 = AV.products;
AV.products = function (u) {
  const tpl = document.createElement("template");
  tpl.innerHTML = _avpV145(u);
  const tb = tpl.content.querySelector(".tw table");
  if (!tb) return tpl.innerHTML;
  const ths = tb.querySelectorAll("thead th");
  if (ths[6]) ths[6].textContent = L("Frame / packet", "Frames / packet");
  tb.querySelectorAll("tbody tr").forEach((tr) => {
    const b = tr.querySelector("[data-a=rlEdit]"),
      r = b ? rlItem(b.dataset.id) : rlItem(+tr.children[0].textContent),
      td = tr.children[6];
    if (!r || !td || !r.fpp) return;
    td.innerHTML = `<b>${fr2(r.fpp)}</b>${r.fppSrc === "p2" ? ' <span class="psub">P2</span>' : r.fppSample ? ' <span class="pill mute">sample</span>' : ""}${r.alw ? `<div class="psub">allowance <b style="color:var(--ink)">${fr2(r.alw)}</b></div>` : ""}<div class="psub">1 fr = ${fr2(r.pack / r.fpp)} bunch</div>`;
  });
  return tpl.innerHTML;
};

/* ---------- Hindi words used above ---------- */
Object.entries({
  allowance: "अलाउंस",
  exact: "एग्ज़ैक्ट",
  target: "टारगेट",
  tooti: "टूटी",
}).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
