'use strict';
/* ===== v14.4 · Section 3 (karigar se wapas lena) + Section 4 (dhaga stock) · client review 23–24 Nov =====
   3.1 return entry like the karigar slip (P3): date, karigar, item, grade, total weight with dhaga, cut, receiver
   3.2 grade (1st / 2nd / 3rd) is required, the entry does not save without it
   3.3 dhaga master: grams of dhaga per 1 kg of pirai, per item (register photo P1, 34 rows, editable)
   3.4 dhaga = total kg (with dhaga, owner's answer Q8) × g/kg; maal = total − dhaga
   3.5 stock: moulded (loose) minus at send, threaded plus, dhaga stock minus
   3.6 cut (moti that would not thread) → waste, under the same raw-material type and the same grade
   4.1 Dhaga section in stock, types 1×3, 2×2, 3×3, 1×2 (list editable), inward / count
   4.2 item → dhaga type (owner to tell, Q5): chosen at the return and remembered for the item
   4.3 dhaga goes down on the return; bell alert at / below the reorder level
   Owner answers used: Q7 (Mahebub bhai = owner, Tausif = karigar), Q8 (dhaga on total weight).
   Open, kept editable: Q3a (6 Semi 020/021), Q3b (1½ S.P. 217/247), Q3d (3 Semi 070/080 variant), Q5 (dhaga types). */

/* P1 rows: [row, size, P1 name, rate-list kind, g per kg, unclear note] */
const P1_14 = [
  [1, "2.5MM", "2½ S.P.", "Super", 120],
  [2, "3MM", "3 S.P.", "Super", 96],
  [3, "3MM", "3 Semi", "Semi", 70, "Q3d: 070 ya 080, kaunsa variant?"],
  [4, "4MM", "4 S.P.", "Super", 58],
  [5, "4MM", "4 Semi", "Semi", 45],
  [6, "4MM", "4 Semi", "Semi", 40],
  [7, "3MM", "3 Semi", "Semi", 80, "Q3d: 070 ya 080, kaunsa variant?"],
  [8, "5MM", "5 Semi", "Semi", 36],
  [9, "5MM", "5 Semi", "Semi", 30],
  [10, "6MM", "6 S.P.", "Super", 28],
  [11, "6MM", "6 S.P.", "Super", 25],
  [12, "6MM", "6 B.H.L.", "B.H.L.", 20],
  [13, "6MM", "6 Semi", "Semi", 21, "Q3a: 020 ya 021?"],
  [14, "7MM", "7 S.P.", "Super", 24],
  [15, "8MM", "8 Semi", "Semi", 20],
  [16, "8MM", "8 Semi", "Semi", 20],
  [17, "10MM", "10 S.P.", "Super", 16],
  [18, "10MM", "10 Semi", "Semi", 15],
  [19, "11MM", "11 Semi", "Semi", 12],
  [20, "12MM", "12 Semi", "Semi", 12],
  [21, "14MM", "14 Semi", "Semi", 10],
  [22, "4MM", "4 Jaw", "Jaw", 47],
  [23, "5MM", "5 Munga", "Munga", 44],
  [24, "6MM", "6 Munga", "Munga", 25],
  [25, "8MM", "8 Munga", "Munga", 25],
  [26, "6MM", "6 H.R.", "HR", 28],
  [27, "8MM", "8 H.R.", "HR", 23],
  [28, "8MM", "8 Jaw", "Jaw", 25],
  [29, "7MM", "7 SS", "Sujni", 26],
  [30, "9MM", "9 SS", "Sujni", 15],
  [31, "11MM", "11 SS", "Sujni", 10],
  [32, "10MM", "10 SS", "Sujni", 18],
  [33, "1.5MM", "1½ S.P.", "Super", 247, "Q3b: 217 ya 247?"],
  [34, "2MM", "2 S.P.", "Super", 164],
];
const DHAGA_TYPES14 = ["1×3", "2×2", "3×3", "1×2"]; // V6 · 0:38–1:00
const QGRADES14 = ["1st", "2nd", "3rd"];
if (!KARIGARS.some((k) => k.id === "k4")) {
  KARIGARS.push({ id: "k4", n: "Tausif bhai", a: "Bhiwandi" }); // karigar on slip P3 (Q7)
  KM.k4 = KARIGARS[KARIGARS.length - 1];
}

const _initV14d = initV14;
initV14 = function () {
  _initV14d();
  if (!S.dhaga) {
    const used = new Set();
    S.dhaga = P1_14.map(([row, size, p1, kind, gpk, unclear]) => {
      const ms = S.rl.filter((r) => r.size === size && r.kind === kind),
        r = ms.find((x) => !used.has(x.no)) || ms[0];
      if (r) used.add(r.no);
      return { id: "dh" + row, row, size, p1, kind, gpk, it: r ? r.no : null, type: "", unclear: unclear || "", note: "" };
    });
  }
  S.dhagaTypes = S.dhagaTypes || DHAGA_TYPES14.map((n) => ({ n, re: 0 }));
  S.cuts = S.cuts || [];
  S.dhagaMoves = S.dhagaMoves || [];
};

/* ---------- helpers ---------- */
const dhById14 = (id) => (S.dhaga || []).find((d) => d.id === id);
function dhagaFor14(key) {
  if (!key) return null;
  const [sz, sh, ty] = key.split("|"),
    cand = (S.dhaga || []).filter((d) => d.size === sz && kindFits14(d.kind, sh, ty));
  if (!cand.length) return null;
  const r = matchItem(sz, sh, ty);
  return cand.find((d) => r && d.it === r.no) || cand[0];
}
const dhName14 = (d) => {
  const r = d.it && rlItem(d.it);
  return r && r.size === d.size && r.kind === d.kind ? rlName(r) : `${d.size} ${d.kind}`;
};
const dhagaQty14 = (t) => qty("DHAGA", t, "kg");
// alert when the stock is negative, or a reorder level is set and the stock is at / below it (0 stock with no reorder = not used yet)
const isLow14 = (t) => {
  const q = dhagaQty14(t.n);
  return q < -1e-9 || (t.re > 0 && q <= t.re + 1e-9);
};
const dhagaLow14 = () => (S.dhagaTypes || []).filter(isLow14);
const kg3 = (v) => `${nf(v, 3)} kg`;
function dhagaMove14(type, q, why, ref) {
  move("DHAGA", type, "kg", q);
  S.dhagaMoves.push({ id: nid(), type, q, why, ref: ref || "", ts: Date.now(), by: (user() || {}).n || "" });
}
const jobType14 = (j) => (j.key || "").split("|")[2] || "";

/* ---------- 3.1–3.6 return form ---------- */
const _krmV144 = karRecvModal;
karRecvModal = function (id) {
  _krmV144(id);
  const f = document.querySelector("form[data-f=karRecv]"),
    j = S.jobs.find((x) => x.id === id);
  if (!f || !j) return;
  const d = dhagaFor14(j.key),
    ty = (d && d.type) || "",
    k = KM[j.kar];
  document.getElementById("mt").textContent = L("Pirai ka maal wapas lo (slip)", "Receive threaded goods (slip)");
  const top = f.querySelector(".sh-b") || f.querySelector(".sumbox").parentElement;
  top.insertAdjacentHTML(
    "afterbegin",
    `<div class="slip3"><div><span class="m">Karigar</span><b>${esc(k.n)}</b></div><div><span class="m">Item</span><b>${esc(plainName(j.key))}</b></div><div><span class="m">Challan</span><b>${esc(j.challan || "–")}</b></div></div>
     <div class="row2"><div class="fld"><label for="rdd">${L("Tareekh", "Date")}</label><input id="rdd" name="rdate" type="date" value="${ymd14(Date.now())}" max="${ymd14(Date.now())}" required></div><div class="fld"><label for="rrc">${L("Maal kisne liya (receiver)", "Received by")}</label><input id="rrc" name="recv" value="${esc((user() || {}).n || "")}" required></div></div>`,
  );
  f.querySelector(".slipbar")?.insertAdjacentHTML(
    "afterend",
    `<div class="fld" id="rqg"><span class="lb">${L("Grade (zaroori)", "Grade (required)")}</span><div class="radios">${QGRADES14.map((g) => `<label><input type="radio" name="qgrade" value="${g}">${g}</label>`).join("")}</div><span class="hint" id="rqgh">${L("Slip par grade na likha ho toh karigar se poochho. Bina grade save nahi hoga.", "If the slip has no grade, ask the karigar. It will not save without a grade.")}</span></div>`,
  );
  // dhaga: from the P1 register (g per kg of total weight), type remembered per item
  const th = f.thread.closest(".fld");
  th.style.display = "none";
  f.wt.closest(".fld").insertAdjacentHTML(
    "afterend",
    `<div class="fld"><label for="rdt">${L("Dhaga type", "Dhaga type")}</label><select id="rdt" name="dtype" required><option value="">${L("— chuno —", "— choose —")}</option>${S.dhagaTypes.map((t) => `<option ${t.n === ty ? "selected" : ""}>${esc(t.n)}</option>`).join("")}</select><label class="chk" style="margin-top:4px"><input type="checkbox" name="dremember" ${ty ? "" : "checked"}> ${L("Is item ke liye yaad rakho", "Remember for this item")}</label></div>
     <div class="fld"><label for="rgk">${L("Dhaga gram / kg", "Dhaga grams per kg")}</label><input id="rgk" name="gpk" type="number" inputmode="decimal" min="0" step="1" value="${d ? d.gpk : ""}" required><span class="hint">${d ? `P1 register: ${esc(d.p1)} · ${d.gpk} g${d.unclear ? ` · <b style="color:var(--warn)">${L("confirm baaki", "to confirm")}</b>` : ""}` : L("Register mein nahi: daalo", "Not in the register: enter it")}</span></div>`,
  );
  // cut replaces "wastage" (cut = moti that would not thread, hole closed)
  const wf = f.waste.closest(".fld");
  wf.style.display = "none";
  wf.insertAdjacentHTML(
    "beforebegin",
    `<div class="fld"><label for="rct">Cut (kg)</label><input id="rct" name="cut" type="number" inputmode="decimal" step="0.001" min="0"><span class="hint">${L("Jo moti pir nahi saki (hole band) → waste", "Moti that would not thread (hole closed) → waste")}</span></div>`,
  );
  f.dataset.dtype0 = ty;
  if (typeof tapRefresh === "function") tapRefresh();
  LIVE.karRecv(f);
};
function recv144(f) {
  const j = S.jobs.find((x) => x.id === f.dataset.id);
  if (!j || !f.gpk) return null;
  const wt = +f.wt.value || 0,
    gpk = +f.gpk.value || 0,
    dh = Math.round(wt * gpk) / 1000, // Q8: g per kg on the total weight (with dhaga)
    cut = +(f.cut.value || 0),
    g = f.querySelector("[name=qgrade]:checked");
  f.thread.dataset.touched = "1";
  f.thread.value = wt ? dh : "";
  f.waste.value = cut || "";
  return { j, wt, gpk, dh, cut, grade: g ? g.value : "", dtype: f.dtype.value, type: jobType14(j) };
}
const _lkrV144 = LIVE.karRecv;
LIVE.karRecv = (f) => {
  const c = recv144(f);
  _lkrV144(f);
  if (!c) return;
  const sum0 = document.getElementById("rsum"),
    after = c.dtype ? dhagaQty14(c.dtype) - c.dh : null;
  const tot = sum0.querySelector(".tot");
  (tot || sum0).insertAdjacentHTML(
    tot ? "beforebegin" : "beforeend",
    `${c.wt ? `<div><span>Dhaga: ${kg3(c.wt)} × ${nf(c.gpk)} g</span><b>${kg3(c.dh)}</b></div>` : ""}${c.dtype && c.wt ? `<div><span>${esc(c.dtype)} ${L("dhaga stock iske baad", "dhaga stock after this")}</span><b style="color:${after < 0 ? "var(--bad)" : "inherit"}">${kg3(after)}</b></div>` : ""}${c.cut ? `<div><span>Cut → waste (${esc(c.type)}${c.grade ? " · " + c.grade + " grade" : ""})</span><b>${kg3(c.cut)}</b></div>` : ""}`,
  );
  sum0.querySelectorAll("div > span").forEach((s) => {
    if (/^Loose \+ wastage$/.test(s.textContent)) s.textContent = "Loose + cut";
  });
};
const _fkrV144 = FORMS.karRecv;
FORMS.karRecv = (f) => {
  const c = recv144(f),
    err = document.getElementById("rerr");
  if (c) {
    if (!c.grade) {
      err.textContent = L("Grade chuno (1st / 2nd / 3rd). Bina grade save nahi hoga.", "Choose the grade (1st / 2nd / 3rd). It does not save without one.");
      document.getElementById("rqg").scrollIntoView({ block: "center" });
      return;
    }
    if (!c.dtype) {
      err.textContent = L("Dhaga type chuno.", "Choose the dhaga type.");
      f.dtype.focus();
      return;
    }
    if (!(c.gpk > 0)) {
      err.textContent = L("Dhaga gram / kg daalo.", "Enter dhaga grams per kg.");
      f.gpk.focus();
      return;
    }
  }
  const j = c && c.j,
    n0 = j ? j.receipts.length : 0,
    l0 = S.thr.length,
    rdate = f.rdate && f.rdate.value,
    recv = f.recv && f.recv.value.trim(),
    remember = f.dremember && f.dremember.checked;
  _fkrV144(f);
  if (!c || j.receipts.length === n0) return;
  const ts = dayTs14(rdate),
    rc = j.receipts[j.receipts.length - 1];
  Object.assign(rc, { ts, recv, qgrade: c.grade, dtype: c.dtype, gpk: c.gpk, dhaga: c.dh, cut: c.cut, beadKg: Math.round((c.wt - c.dh) * 1000) / 1000 });
  if (S.thr.length > l0) Object.assign(S.thr[S.thr.length - 1], { qgrade: c.grade, ts });
  dhagaMove14(c.dtype, -c.dh, "pirai", j.challan);
  if (c.cut > 0) {
    move("WASTE:M", c.type, "kg", c.cut);
    S.cuts.push({ id: nid(), type: c.type, grade: c.grade, kg: c.cut, job: j.id, kar: j.kar, ts });
  }
  const d = dhagaFor14(j.key);
  if (remember && d && d.type !== c.dtype) d.type = c.dtype;
  if (d && Math.abs(d.gpk - c.gpk) > 1e-9) rc.gpkNote = `register ${d.gpk} g`;
  logA(
    `Pirai wapas · ${KM[j.kar].n} · ${c.grade} grade · dhaga ${kg3(c.dh)} (${c.dtype}) minus${c.cut ? ` · cut ${kg3(c.cut)} → ${c.type} waste` : ""}${recv ? " · " + recv : ""}`,
    `Pirai back · ${KM[j.kar].n} · ${c.grade} grade · dhaga ${kg3(c.dh)} (${c.dtype}) used${c.cut ? ` · cut ${kg3(c.cut)} → ${c.type} waste` : ""}${recv ? " · " + recv : ""}`,
  );
  save();
  if (dhagaQty14(c.dtype) < 0)
    toast(L(`${c.dtype} dhaga stock minus mein: dhaga inward daalo.`, `${c.dtype} dhaga stock is negative: record the dhaga inward.`));
};

/* karigar page: grade + dhaga under the bunch column */
const _avkV144 = AV.karigar;
AV.karigar = function (u) {
  const tpl = document.createElement("template");
  tpl.innerHTML = _avkV144(u);
  tpl.content.querySelectorAll(".tw tbody tr").forEach((tr) => {
    const b = tr.querySelector("[data-a=challan]"),
      j = b && S.jobs.find((x) => x.id === b.dataset.id),
      td = tr.children[4];
    if (!j || !td) return;
    const rs = j.receipts.filter((r) => r.qgrade);
    if (!rs.length) return;
    td.insertAdjacentHTML("beforeend", `<div class="psub">${[...new Set(rs.map((r) => r.qgrade))].join(", ")} · dhaga ${kg3(sum(rs, (r) => r.dhaga || 0))}${sum(rs, (r) => r.cut || 0) ? ` · cut ${kg3(sum(rs, (r) => r.cut || 0))}` : ""}</div>`);
  });
  return tpl.innerHTML;
};

/* ---------- 3.6 waste page: cut by grade ---------- */
const _avwV144 = AV.waste;
AV.waste = function (u) {
  const h = _avwV144(u),
    cuts = S.cuts || [];
  if (!cuts.length) return h;
  const types = [...new Set(cuts.map((c) => c.type))];
  return (
    h +
    `<section class="card"><div class="card-h"><div><h3>${L("Pirai ka cut · grade ke hisaab se", "Pirai cut · by grade")}</h3><p>${L("Karigar se wapas aaya cut (jo moti pir nahi saki). Upar type ke waste mein bhi juda hai.", "Cut returned by karigars (moti that would not thread). Also counted in the type waste above.")}</p></div></div>
     <div class="tw"><table><thead><tr><th>Type</th>${QGRADES14.map((g) => `<th class="r">${g} grade</th>`).join("")}<th class="r">${L("Kul", "Total")}</th></tr></thead><tbody>${types
       .map((t) => {
         const by = (g) => sum(cuts.filter((c) => c.type === t && c.grade === g), (c) => c.kg);
         return `<tr><td><b>${esc(t)} waste</b></td>${QGRADES14.map((g) => `<td class="r">${by(g) ? kg3(by(g)) : "–"}</td>`).join("")}<td class="r"><b>${kg3(sum(cuts.filter((c) => c.type === t), (c) => c.kg))}</b></td></tr>`;
       })
       .join("")}</tbody></table></div></section>`
  );
};

/* ---------- 4.1 stock page: Dhaga tab ---------- */
const _avsV144 = AV.stock;
AV.stock = function (u) {
  const dh = S.ui.stockTab === "dhaga";
  if (dh) S.ui.stockTab = "fin";
  let h;
  try {
    h = _avsV144(u);
  } finally {
    if (dh) S.ui.stockTab = "dhaga";
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = h;
  const seg = tpl.content.querySelector(".seg");
  if (!seg) return h + (dh ? dhagaPage14() : "");
  const low = dhagaLow14().length;
  seg.insertAdjacentHTML("beforeend", `<button type="button" data-a="ui" data-k="stockTab" data-val="dhaga" aria-pressed="${dh}">Dhaga${low ? `<span class="badge">${low}</span>` : ""}</button>`);
  if (!dh) return tpl.innerHTML;
  seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.val === "dhaga")));
  const bar = seg.closest(".toolbar") || seg;
  return bar.outerHTML + dhagaPage14();
};
function dhagaPage14() {
  const admin = (user() || {}).role === "admin",
    ts = S.dhagaTypes,
    moves = S.dhagaMoves.slice().sort((a, b) => b.ts - a.ts).slice(0, 10);
  return `<section class="card"><div class="card-h"><div><h3>${L("Dhaga stock", "Dhaga stock")}</h3><p>${L("Karigar se pirai wapas aate hi dhaga apne aap minus hota hai (kul wazan × gram / kg).", "Dhaga goes down automatically when pirai comes back (total weight × grams per kg).")}</p></div>${admin ? `<div class="btns"><button type="button" class="btn sm" data-a="dhagaTypes14">${ic("edit", 14)} ${L("Type / reorder", "Types / reorder")}</button><button type="button" class="btn sm" data-a="dhagaCount14">${L("Ginti", "Count")}</button><button type="button" class="btn sm pri" data-a="dhagaIn14">${ic("plus", 14)} ${L("Dhaga aaya", "Dhaga inward")}</button></div>` : ""}</div>
   <div class="dhg">${ts
     .map((t) => {
       const q = dhagaQty14(t.n),
         low = isLow14(t);
       return `<div class="dhc${low ? " low" : ""}"><span class="m">${esc(t.n)}</span><b>${kg3(q)}</b><span class="psub">reorder ${kg3(t.re || 0)}</span>${low ? `<span class="pill ${q < 0 ? "bad" : "warn"}">${q < 0 ? L("minus mein", "negative") : L("kam hai", "low")}</span>` : ""}</div>`;
     })
     .join("")}</div></section>
   <section class="card"><div class="card-h"><h3>${L("Dhaga aana-jaana", "Dhaga movements")}</h3></div>${
     moves.length
       ? `<div class="list">${moves.map((m) => `<div class="item"><span class="ico-c ${m.q < 0 ? "warn" : "ok"}">${ic(m.q < 0 ? "thread" : "plus", 16)}</span><div class="grow"><div class="t1">${m.q > 0 ? "+" : ""}${kg3(m.q)} · ${esc(m.type)}</div><div class="t2">${m.why === "pirai" ? L("Pirai wapas", "Pirai return") : m.why === "count" ? L("Ginti", "Count") : L("Inward", "Inward")}${m.ref ? " · " + esc(m.ref) : ""} · ${esc(m.by)} · ${fwhen(m.ts)}</div></div></div>`).join("")}</div>`
       : `<div class="empty">${L("Abhi koi entry nahi. \"Dhaga aaya\" se opening stock daalo.", "No entries yet. Use \"Dhaga inward\" for the opening stock.")}</div>`
   }</section>`;
}
const dhTypeOpts14 = (sel) => S.dhagaTypes.map((t) => `<option ${t.n === sel ? "selected" : ""}>${esc(t.n)}</option>`).join("");
ACT.dhagaIn14 = () =>
  openModal(
    L("Dhaga aaya", "Dhaga inward"),
    L("Kharida hua ya opening stock", "Purchased or opening stock"),
    `<div class="row2"><div class="fld"><label for="dit">Type</label><select id="dit" name="type">${dhTypeOpts14()}</select></div><div class="fld"><label for="dik">${L("Kitna (kg)", "How much (kg)")}</label><input id="dik" name="kg" class="big-in" type="number" inputmode="decimal" min="0" step="0.001" required></div></div>
     <div class="fld"><label for="dis">${L("Kahan se / note", "Supplier / note")}</label><input id="dis" name="note" placeholder="${L("Jaise: opening stock", "e.g. opening stock")}"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Stock mein jodo", "Add to stock")}</button>`,
    { form: "dhagaIn14" },
  );
FORMS.dhagaIn14 = (f) => {
  const v = +f.kg.value || 0;
  if (!(v > 0)) return f.kg.focus();
  dhagaMove14(f.type.value, v, "in", f.note.value.trim());
  logA(`Dhaga aaya: ${kg3(v)} ${f.type.value}`, `Dhaga inward: ${kg3(v)} ${f.type.value}`);
  closeModal();
  render();
};
ACT.dhagaCount14 = () =>
  openModal(
    L("Dhaga ginti", "Dhaga count"),
    L("Taula hua asli stock daalo, app farak barabar karega.", "Enter the weighed stock; the app adjusts the difference."),
    `<div class="row2"><div class="fld"><label for="dct">Type</label><select id="dct" name="type">${dhTypeOpts14()}</select></div><div class="fld"><label for="dck">${L("Asli stock (kg)", "Actual stock (kg)")}</label><input id="dck" name="kg" class="big-in" type="number" inputmode="decimal" min="0" step="0.001" required></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "dhagaCount14" },
  );
FORMS.dhagaCount14 = (f) => {
  if (f.kg.value === "") return f.kg.focus();
  const t = f.type.value,
    d = (+f.kg.value || 0) - dhagaQty14(t);
  if (Math.abs(d) > 1e-9) dhagaMove14(t, d, "count");
  logA(`Dhaga ginti ${t}: ${kg3(+f.kg.value || 0)}`, `Dhaga count ${t}: ${kg3(+f.kg.value || 0)}`);
  closeModal();
  render();
};
ACT.dhagaTypes14 = () =>
  openModal(
    L("Dhaga type aur reorder", "Dhaga types and reorder"),
    L("Reorder se kam hote hi bell mein alert. Naya type bhi jod sakte ho.", "The bell alerts at or below reorder. You can add a type."),
    `${S.dhagaTypes.map((t, i) => `<div class="row2"><div class="fld"><label for="dtn${i}">Type</label><input id="dtn${i}" name="n${i}" value="${esc(t.n)}" required></div><div class="fld"><label for="dtr${i}">Reorder (kg)</label><input id="dtr${i}" name="re${i}" type="number" inputmode="decimal" min="0" step="0.1" value="${t.re || 0}"></div></div>`).join("")}
     <div class="row2"><div class="fld"><label for="dtnn">${L("Naya type (optional)", "New type (optional)")}</label><input id="dtnn" name="nn" placeholder="2×3"></div><div class="fld"><label for="dtnr">Reorder (kg)</label><input id="dtnr" name="nr" type="number" inputmode="decimal" min="0" step="0.1" value="0"></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "dhagaTypes14" },
  );
FORMS.dhagaTypes14 = (f) => {
  S.dhagaTypes.forEach((t, i) => {
    const n = f["n" + i].value.trim();
    if (n && n !== t.n) {
      // rename: carry the stock and the item links to the new name
      const q = dhagaQty14(t.n);
      if (q) {
        move("DHAGA", t.n, "kg", -q);
        move("DHAGA", n, "kg", q);
      }
      S.dhaga.forEach((d) => d.type === t.n && (d.type = n));
      t.n = n;
    }
    t.re = Math.max(0, +f["re" + i].value || 0);
  });
  const nn = f.nn.value.trim();
  if (nn && !S.dhagaTypes.some((t) => t.n === nn)) S.dhagaTypes.push({ n: nn, re: Math.max(0, +f.nr.value || 0) });
  logA("Dhaga type / reorder badla", "Dhaga types / reorder changed");
  closeModal();
  render();
};

/* ---------- 4.3 bell ---------- */
const _gaV144 = getAlerts;
getAlerts = function () {
  const A = _gaV144();
  dhagaLow14().forEach((t) => {
    const q = dhagaQty14(t.n);
    A.unshift([q < 0 ? "bad" : "warn", "box", q < 0 ? L(`${t.n} dhaga stock minus mein (${kg3(q)}): inward daalo`, `${t.n} dhaga stock negative (${kg3(q)}): record the inward`) : L(`${t.n} dhaga kam: ${kg3(q)}`, `${t.n} dhaga low: ${kg3(q)}`), "stock"]);
  });
  return A;
};

/* ---------- 3.3 dhaga master on the Rate list page ---------- */
function dhagaSection14(admin) {
  const rows = S.dhaga || [],
    nUn = rows.filter((d) => d.unclear).length,
    noT = rows.filter((d) => !d.type).length;
  return `<section class="card"><div class="card-h"><div><h3>${L("Dhaga (gram / kg)", "Dhaga (grams per kg)")} · ${rows.length}</h3><p>${L("Owner ka register (P1): 1 kg pirai (kul wazan, dhaage ke saath) mein kitne gram dhaga. Dhaga type pehli return par chuno, app yaad rakhega.", "Owner's register (P1): grams of dhaga in 1 kg of pirai (total weight with dhaga). Choose the dhaga type at the first return; the app remembers it.")}${nUn ? ` <span class="pill warn">${nUn} ${L("confirm baaki", "to confirm")}</span>` : ""}${noT ? ` <span class="pill mute">${noT} ${L("type baaki", "type not set")}</span>` : ""}</p></div></div>
   <div class="tw"><table><thead><tr><th>P1</th><th>Item</th><th class="r">${L("Gram / kg", "Grams / kg")}</th><th>${L("Dhaga type", "Dhaga type")}</th><th>${L("Rate list", "Rate list")}</th><th></th></tr></thead><tbody>${rows
     .map((d) => {
       const r = d.it && rlItem(d.it);
       return `<tr><td>${d.row || "–"}</td><td><b>${esc(d.size)} ${esc(d.kind)}</b><div class="psub">${esc(d.p1 || "")}${d.unclear ? ` · <span class="pill warn">${esc(d.unclear)}</span>` : ""}${d.note ? " · " + esc(d.note) : ""}</div></td><td class="r"><b>${nf(d.gpk)}</b></td><td>${d.type ? esc(d.type) : `<span class="psub">${L("owner batayega", "owner to tell")}</span>`}</td><td>${r ? `${r.no}. ${esc(rlName(r))}` : `<span class="psub">${L("list mein nahi", "not in list")}</span>`}</td><td>${admin ? `<button type="button" class="btn sm" data-a="dhagaEdit14" data-id="${d.id}">${ic("edit", 14)} ${L("Badlo", "Edit")}</button>` : ""}</td></tr>`;
     })
     .join("")}</tbody></table></div></section>`;
}
const _avpV144 = AV.products;
AV.products = function (u) {
  const h = _avpV144(u),
    admin = (user() || {}).role === "admin",
    mk = h.indexOf("</section>", h.indexOf(L("Pirai spec", "Pirai spec")));
  return mk < 0 ? h + dhagaSection14(admin) : h.slice(0, mk + 10) + dhagaSection14(admin) + h.slice(mk + 10);
};
ACT.dhagaEdit14 = (el) => {
  const d = dhById14(el.dataset.id);
  if (!d) return;
  openModal(
    `Dhaga · ${esc(d.size)} ${esc(d.kind)}`,
    d.row ? `P1 register row ${d.row} · ${esc(d.p1)}` : "",
    `<div class="row2"><div class="fld"><label for="dg">${L("Gram / kg", "Grams per kg")}</label><input id="dg" name="gpk" class="big-in" type="number" inputmode="decimal" min="0" step="1" value="${d.gpk}" required><span class="hint">${L("1 kg pirai (dhaage ke saath) mein", "In 1 kg of pirai (with dhaga)")}</span></div><div class="fld"><label for="dty">${L("Dhaga type", "Dhaga type")}</label><select id="dty" name="type"><option value="">${L("— owner batayega —", "— owner to tell —")}</option>${dhTypeOpts14(d.type)}</select></div></div>
     <div class="fld"><label for="dit2">${L("Rate list ka item", "Rate-list item")}</label><select id="dit2" name="it"><option value="">${L("— list mein nahi —", "— not in the list —")}</option>${S.rl.map((r) => `<option value="${r.no}" ${d.it === r.no ? "selected" : ""}>${r.no}. ${esc(rlName(r))}</option>`).join("")}</select></div>
     <label class="chk"><input type="checkbox" name="unclear" ${d.unclear ? "checked" : ""}> ${L("Owner se confirm baaki", "Still to confirm with the owner")}</label>
     <div class="fld"><label for="dnt">Note</label><input id="dnt" name="note" value="${esc(d.unclear || d.note || "")}"></div>
     <div class="pkinfo" id="dginfo"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "dhagaEdit14", live: "dhagaEdit14", id: d.id },
  );
};
LIVE.dhagaEdit14 = (f) => {
  const g = +f.gpk.value || 0;
  document.getElementById("dginfo").innerHTML = g
    ? `<b>${L(`1 kg → ${nf(1000 - g)} g maal + ${nf(g)} g dhaga`, `1 kg → ${nf(1000 - g)} g beads + ${nf(g)} g dhaga`)}</b><span>${L(`10 kg → ${kg3(g / 100)} dhaga`, `10 kg → ${kg3(g / 100)} dhaga`)}</span>`
    : `<b>${L("Gram daalo", "Enter grams")}</b>`;
};
FORMS.dhagaEdit14 = (f) => {
  const d = dhById14(f.dataset.id),
    g = +f.gpk.value;
  if (!(g > 0)) return f.gpk.focus();
  const old = d.gpk,
    note = f.note.value.trim(),
    un = f.unclear.checked;
  Object.assign(d, { gpk: g, type: f.type.value, it: f.it.value ? +f.it.value : null, unclear: un ? note || L("confirm baaki", "to confirm") : "", note: un ? "" : note });
  logA(`Dhaga ${d.size} ${d.kind}: ${old} → ${g} g/kg${d.type ? " · " + d.type : ""}`, `Dhaga ${d.size} ${d.kind}: ${old} → ${g} g/kg${d.type ? " · " + d.type : ""}`);
  closeModal();
  render();
};

/* ---------- Hindi words used above ---------- */
Object.entries({
  dhaga: "धागा",
  gram: "ग्राम",
  cut: "कट",
  grade: "ग्रेड",
  receiver: "रिसीवर",
  reorder: "रीऑर्डर",
  aana: "आना",
  jaana: "जाना",
  taula: "तौला",
  barabar: "बराबर",
  saki: "सकी",
  pir: "पिर",
  band: "बंद",
  poochho: "पूछो",
  batayega: "बताएगा",
}).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
