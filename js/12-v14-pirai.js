'use strict';
/* ===== v14.3 · Section 2: sending to the karigar for pirai (client review 24 Nov · V4, V5, V6, P2) =====
   2.1 pirai spec master: per item ladi per guchha, guchha per frame (2), moti per ladi → moti per frame.
       Seeded from register photo P2 (docs/register-pirai-P2.csv, 31 rows). Every value stays editable;
       rows the owner has not confirmed carry "confirm baaki".
   2.2 send screen + job-work challan show the spec ("18 ladi ka guchha, 2 guchha = 1 frame, 50 moti / ladi").
   2.3 "bunch" = 1,200 moti (owner's standard, editable). The karigar returns frames / guchha; the app turns
       them into moti and standard bunches. "Kitne bunch aaye" is replaced by "Kitne frame + khule guchha".
   2.4 new items in the rate list: No 6 B.H.L. (Big Hole) and 6 Semi Flat ("Semi F", Q1). Rates pending.
   Owner answers used: Q1 (S.P. = Super, SS = Sujni, Semi F = Semi Flat). Still open: Q3c (6 Munga 060 / 080). */

/* P2 rows: [row, size, P2 name, rate-list kind, ladi per guchha, guchha per frame, moti per ladi, unclear note] */
const P2_14 = [
  [1, "2.5MM", "2½ S.P.", "Super", 30, 2, 100],
  [2, "3MM", "3 S.P.", "Super", 30, 2, 100],
  [3, "3MM", "3 Semi", "Semi", 30, 2, 100],
  [4, "4MM", "4 S.P.", "Super", 30, 2, 100],
  [5, "4MM", "4 Semi", "Semi", 24, 2, 100],
  [6, "4MM", "4 Semi", "Semi", 24, 2, 100],
  [7, "5MM", "5 Semi", "Semi", 24, 2, 80],
  [8, "5MM", "5 Semi", "Semi", 24, 2, 80],
  [9, "6MM", "6 S.P.", "Super", 24, 2, 80],
  [10, "6MM", "6 B.H.L.", "B.H.L.", 18, 2, 80],
  [11, "6MM", "6 Semi F", "Semi Flat", 18, 2, 80],
  [12, "7MM", "7 S.P.", "Super", 18, 2, 60],
  [13, "8MM", "8 Semi", "Semi", 18, 2, 50],
  [14, "8MM", "8 Semi", "Semi", 18, 2, 50],
  [15, "10MM", "10 S.P.", "Super", 18, 2, 50],
  [16, "10MM", "10 Semi", "Semi", 15, 2, 50],
  [17, "11MM", "11 Semi", "Semi", 12, 2, 40],
  [18, "12MM", "12 Semi", "Semi", 12, 2, 40],
  [19, "14MM", "14 Semi", "Semi", 9, 2, 24],
  [20, "10MM", "10 SS", "Sujni", 18, 2, 30],
  [21, "9MM", "9 SS", "Sujni", 18, 2, 50],
  [22, "11MM", "11 SS", "Sujni", 12, 2, 30],
  [23, "5MM", "5 Munga", "Munga", 24, 2, 80],
  [24, "6MM", "6 Munga", "Munga", 24, 2, 80, "Q3: moti / ladi 060 ya 080?"],
  [25, "8MM", "8 Munga", "Munga", 18, 2, 50],
  [26, "6MM", "6 SS", "Sujni", 18, 2, 50],
  [27, "7MM", "7 SS", "Sujni", 18, 2, 50],
  [28, "6MM", "6 H.R.", "HR", 18, 2, 80],
  [29, "8MM", "8 H.R.", "HR", 18, 2, 50],
  [30, "8MM", "8 Jaw", "Jaw", 18, 2, 50],
  [31, "4MM", "4 Jaw", "Jaw", 24, 2, 60],
];
/* 2.4 new rate-list items (rates / bunch per kg / packing: owner to give) */
const RL14_NEW = [
  { size: "6MM", kind: "B.H.L.", note: "B.H.L. = Big Hole (P2) · rate baaki" },
  { size: "6MM", kind: "Semi Flat", note: '"Semi F" (P2, Q1) · rate baaki' },
];
const MPB14 = 1200; // moti per standard bunch (V5)

function seedPirai14() {
  const used = new Set();
  return P2_14.map(([row, size, p2, kind, ladi, gpf, mpl, unclear]) => {
    // link to the rate-list item of the same size + kind; repeated P2 rows take the next variant (e.g. 4 Semi 34B, 28B)
    const ms = S.rl.filter((r) => r.size === size && r.kind === kind),
      r = ms.find((x) => !used.has(x.no)) || ms[0];
    if (r) used.add(r.no);
    return { id: "pr" + row, row, size, p2, kind, ladi, gpf, mpl, it: r ? r.no : null, unclear: unclear || "", note: "" };
  });
}
const _initV14c = initV14;
initV14 = function () {
  _initV14c();
  S.cfg14.mpb = S.cfg14.mpb || MPB14;
  if (!S.pirai) {
    RL14_NEW.forEach((n) => {
      if (!S.rl.some((r) => r.size === n.size && r.kind === n.kind))
        S.rl.push({ no: Math.max(...S.rl.map((r) => r.no)) + 1, size: n.size, kind: n.kind, bpk: null, s: 0, d: 0, pack: null, note: n.note, fpp: null, v143: true });
    });
    S.pirai = seedPirai14();
  }
};

/* ---------- helpers ---------- */
const mpf14 = (s) => (s ? s.gpf * s.ladi * s.mpl : 0); // moti per frame
const mpb14 = () => (S.cfg14 && S.cfg14.mpb) || MPB14;
const specById14 = (id) => (S.pirai || []).find((s) => s.id === id);
const specName14 = (s) => {
  const r = s.it && rlItem(s.it);
  return r && r.size === s.size && r.kind === s.kind ? rlName(r) : `${s.size} ${s.kind}`;
};
/* does a spec's rate-list kind fit a moulded bead's shape + type? */
function kindFits14(kind, sh, ty) {
  const k = KIND9[kind];
  if (k) return k[0] === sh && (k[1] === "" || k[1] === ty);
  return kind === ty || kind === sh;
}
/* best spec for a moulded key "size|shape|type|grade": same size + kind, prefer the rate-list variant matchItem picks */
function specFor14(key) {
  if (!key) return null;
  const [sz, sh, ty] = key.split("|"),
    cand = (S.pirai || []).filter((s) => s.size === sz && kindFits14(s.kind, sh, ty));
  if (!cand.length) return null;
  const r = matchItem(sz, sh, ty);
  return cand.find((s) => r && s.it === r.no) || cand[0];
}
const snap14 = (s) => s && { id: s.id, it: s.it, size: s.size, kind: s.kind, name: specName14(s), ladi: s.ladi, gpf: s.gpf, mpl: s.mpl, mpf: mpf14(s), unclear: s.unclear };
/* frames + loose guchha → moti → standard bunches */
function fromFrames14(sp, fr, gu) {
  const moti = (Math.max(0, fr) * sp.gpf + Math.max(0, gu)) * sp.ladi * sp.mpl;
  return { moti, bunch: Math.round(moti / mpb14()), exact: moti / mpb14() };
}
function specCard14(sp, estKg) {
  if (!sp)
    return `<div class="note warn">${ic("alert", 16)}<span>${L("Is maal ka pirai spec nahi mila. Rate list → Pirai spec mein jodo, ya upar se chuno.", "No pirai spec for this bead. Add it under Rate list → Pirai spec, or pick one above.")}</span></div>`;
  const mpf = mpf14(sp),
    r = sp.it && rlItem(sp.it),
    est = estKg > 0 && r && r.bpk ? (estKg * r.bpk * mpb14()) / mpf : 0;
  return `<div class="pspec"><div class="pspec-h"><b>${L("Guchha kaise banana hai", "How to make the guchha")}</b><span class="psub">${esc(sp.name || specName14(sp))}${sp.unclear ? ` · <span class="pill warn">${L("confirm baaki", "to confirm")}</span>` : ""}</span></div>
   <div class="psg"><div><b>${nf(sp.ladi)}</b><span>${L("ladi = 1 guchha", "ladi = 1 guchha")}</span></div><div><b>${nf(sp.gpf)}</b><span>${L("guchha = 1 frame", "guchha = 1 frame")}</span></div><div><b>${nf(sp.gpf * sp.ladi)}</b><span>${L("ladi / frame", "ladi / frame")}</span></div><div><b>${nf(sp.mpl)}</b><span>${L("moti / ladi", "moti / ladi")}</span></div><div class="hl"><b>${nf(mpf)}</b><span>${L("moti / frame", "moti / frame")}</span></div></div>
   <div class="psub">1 frame = ${nf(mpf)} moti = ${nf(mpf / mpb14(), 2)} bunch (1 bunch = ${nf(mpb14())} moti)${est ? ` · ${L("andaazan", "approx.")} <b style="color:var(--ink)">${nf(Math.round(est))} frame</b> ${L("wapas aayenge", "will come back")} (${nf(estKg, 1)} kg × ${nf(r.bpk, 2)} bunch/kg)` : ""}</div></div>`;
}

/* ---------- 2.2 send screen: spec picker + "how to make the guchha" ---------- */
const _ksmV143 = karSendModal;
karSendModal = function () {
  _ksmV143();
  const f = document.querySelector("form[data-f=karSend]");
  if (!f) return;
  f.kg.closest(".fld").insertAdjacentHTML(
    "afterend",
    `<div class="fld"><label for="kspc">${L("Pirai spec (P2 register)", "Pirai spec (P2 register)")}</label><select id="kspc" name="spec"></select><span class="hint">${L("Apne aap maal se chuna. Galat ho toh badlo.", "Picked from the bead. Change it if wrong.")}</span></div><div id="kspec"></div>`,
  );
  f.spec._tkind = ""; // keep it a dropdown (31 specs would be a very long chip list on the phone)
  LIVE.karSend(f);
};
const _lksV143 = LIVE.karSend;
LIVE.karSend = (f) => {
  _lksV143(f);
  if (!f.spec) return;
  const k = f.bead.value.split("~")[1];
  if (f.dataset.sk !== f.bead.value) {
    f.dataset.sk = f.bead.value;
    const auto = specFor14(k),
      sz = k.split("|")[0],
      same = S.pirai.filter((s) => s.size === sz),
      rest = S.pirai.filter((s) => s.size !== sz);
    const opt = (s) => `<option value="${s.id}" ${auto && s.id === auto.id ? "selected" : ""}>${esc(specName14(s))} · ${s.ladi}×${s.gpf}×${s.mpl} = ${nf(mpf14(s))} moti${s.unclear ? " · ?" : ""}</option>`;
    f.spec.innerHTML =
      `<option value="" ${auto ? "" : "selected"}>${L("— spec nahi —", "— no spec —")}</option>` +
      (same.length ? `<optgroup label="${esc(sz)}">${same.map(opt).join("")}</optgroup>` : "") +
      `<optgroup label="${L("Baaki", "Others")}">${rest.map(opt).join("")}</optgroup>`;
  }
  const sp = specById14(f.spec.value),
    ks = document.getElementById("kslip");
  if (ks && sp) ks.innerHTML = ks.innerHTML.replace(/dhaage wale bunch|threaded bunches/, L("frame / guchha mein", "in frames / guchha"));
  document.getElementById("kspec").innerHTML = specCard14(sp && snap14(sp), +f.kg.value || 0);
};
const _fksV143 = FORMS.karSend;
FORMS.karSend = (f) => {
  const sp = f.spec && specById14(f.spec.value),
    kgv = +f.kg.value || 0,
    n0 = S.jobs.length;
  _fksV143(f);
  if (S.jobs.length === n0 || !sp) return;
  const j = S.jobs[S.jobs.length - 1],
    r = sp.it && rlItem(sp.it);
  j.spec = snap14(sp);
  j.estFr = r && r.bpk ? Math.round((kgv * r.bpk * mpb14()) / mpf14(sp)) : null;
  save();
  challanModal(j.id); // re-open so the challan shows the spec
};

/* challan paper: spec block + "comes back as frames / guchha" */
const _chmV143 = challanModal;
challanModal = function (jid) {
  _chmV143(jid);
  const j = S.jobs.find((x) => x.id === jid),
    paper = document.querySelector("#modal-root .paper");
  if (!j || !paper || !j.spec) return;
  const s = j.spec,
    tw = paper.querySelector(".tw");
  tw.insertAdjacentHTML(
    "afterend",
    `<div class="pspec onpaper"><div class="pspec-h"><b>${L("Pirai kaise karni hai", "How to thread")}</b><span class="m">${esc(s.name)} · P2</span></div>
     <div class="psg"><div><b>${nf(s.ladi)}</b><span>ladi = 1 guchha</span></div><div><b>${nf(s.gpf)}</b><span>guchha = 1 frame</span></div><div><b>${nf(s.gpf * s.ladi)}</b><span>ladi / frame</span></div><div><b>${nf(s.mpl)}</b><span>moti / ladi</span></div><div class="hl"><b>${nf(s.mpf)}</b><span>moti / frame</span></div></div>
     <div class="m">${j.estFr ? L(`Andaazan ${nf(j.estFr)} frame wapas · `, `About ${nf(j.estFr)} frames back · `) : ""}${L(`Wapas frame / guchha mein lena · 1 bunch = ${nf(mpb14())} moti`, `Take back in frames / guchha · 1 bunch = ${nf(mpb14())} moti`)}</div></div>`,
  );
  paper.querySelectorAll("b").forEach((b) => {
    if (/bunch \(bead|bunches \(beads/i.test(b.textContent)) b.textContent = L("Frame / guchha (moti + dhaaga)", "Frames / guchha (beads + thread)");
  });
};

/* ---------- 2.3 receive: frames + loose guchha instead of "bunch" ---------- */
const jobSpec14 = (j) => j.spec || snap14(specFor14(j.key));
const _krmV143 = karRecvModal;
karRecvModal = function (id) {
  _krmV143(id);
  const f = document.querySelector("form[data-f=karRecv]"),
    j = S.jobs.find((x) => x.id === id);
  if (!f || !j) return;
  const sp = jobSpec14(j),
    bf = f.bunch.closest(".fld");
  if (!sp) {
    bf.insertAdjacentHTML("afterend", `<span class="hint">${L("Spec nahi mila, isliye bunch seedha daalo (1 bunch = 1,200 moti).", "No spec found, so enter bunches directly (1 bunch = 1,200 moti).")}</span>`);
    return;
  }
  bf.insertAdjacentHTML(
    "beforebegin",
    `<div class="fld"><label for="rfr">${L("Kitne frame aaye", "Frames received")}</label><input id="rfr" name="frames" class="big-in" type="number" inputmode="numeric" step="1" min="0" required><span class="hint">1 frame = ${sp.gpf} guchha × ${sp.ladi} ladi × ${sp.mpl} moti = ${nf(sp.mpf)} moti</span></div><div class="fld"><label for="rgu">${L("Khule guchha (frame se alag)", "Loose guchha (not in a frame)")}</label><input id="rgu" name="guchha" type="number" inputmode="numeric" step="1" min="0"></div>`,
  );
  document.getElementById("mt").textContent = L("Pirai ka maal wapas lo", "Receive threaded goods");
  bf.style.display = "none"; // the bunch field stays for the old form logic; it is filled from frames
  f.querySelector(".sumbox").insertAdjacentHTML(
    "beforebegin",
    `<div class="slipbar"><span class="pill mute">Spec: ${esc(sp.name)} · ${sp.ladi}×${sp.gpf}×${sp.mpl}</span>${sp.unclear ? `<span class="pill warn">${L("confirm baaki", "to confirm")}</span>` : ""}${j.estFr ? `<span class="pill mute">${L("andaazan", "approx.")} ${nf(j.estFr)} frame</span>` : ""}</div>`,
  );
  if (typeof tapRefresh === "function") tapRefresh();
  LIVE.karRecv(f);
};
function recvCalc14(f) {
  const j = S.jobs.find((x) => x.id === f.dataset.id),
    sp = j && f.frames && jobSpec14(j);
  if (!sp) return null;
  const fr = Math.round(+f.frames.value || 0),
    gu = Math.round(+(f.guchha && f.guchha.value) || 0),
    c = fromFrames14(sp, fr, gu);
  f.bunch.value = c.bunch || "";
  return Object.assign({ fr, gu, sp }, c);
}
const _lkrV143 = LIVE.karRecv;
LIVE.karRecv = (f) => {
  const c = recvCalc14(f);
  _lkrV143(f);
  if (!c) return;
  document
    .getElementById("rsum")
    .insertAdjacentHTML(
      "afterbegin",
      `<div><span>${nf(c.fr)} frame${c.gu ? ` + ${nf(c.gu)} guchha` : ""} = ${nf(c.moti)} moti</span><b>${nf(c.bunch)} bunch</b></div>${Math.abs(c.exact - c.bunch) > 0.001 ? `<div class="psub" style="justify-content:flex-start">${L(`Bunch poore mein: ${nf(c.exact, 2)} → ${nf(c.bunch)}`, `Rounded: ${nf(c.exact, 2)} → ${nf(c.bunch)} bunches`)}</div>` : ""}`,
    );
};
const _fkrV143 = FORMS.karRecv;
FORMS.karRecv = (f) => {
  const c = recvCalc14(f),
    j = S.jobs.find((x) => x.id === f.dataset.id);
  if (c && !(c.fr > 0 || c.gu > 0)) {
    f.frames.focus();
    return;
  }
  const n0 = j.receipts.length,
    l0 = S.thr.length;
  _fkrV143(f);
  if (!c || j.receipts.length === n0) return;
  Object.assign(j.receipts[j.receipts.length - 1], { frames: c.fr, guchha: c.gu, moti: c.moti, spec: c.sp.id });
  if (S.thr.length > l0) Object.assign(S.thr[S.thr.length - 1], { frames: c.fr, guchha: c.gu, moti: c.moti });
  save();
};

/* karigar page: frames next to bunches, spec under the bead */
const _avkV143 = AV.karigar;
AV.karigar = function (u) {
  const tpl = document.createElement("template");
  tpl.innerHTML = _avkV143(u);
  const tb = tpl.content.querySelector(".tw table");
  if (!tb) return tpl.innerHTML;
  const th = tb.querySelectorAll("thead th")[3];
  if (th) th.textContent = L("Frame aaye", "Frames back");
  tb.querySelectorAll("tbody tr").forEach((tr) => {
    const b = tr.querySelector("[data-a=challan]"),
      j = b && S.jobs.find((x) => x.id === b.dataset.id),
      td = tr.children[3];
    if (!j || !td) return;
    const fr = sum(j.receipts, (r) => r.frames || 0),
      gu = sum(j.receipts, (r) => r.guchha || 0),
      bu = sum(j.receipts, (r) => r.bunch || 0);
    td.innerHTML = fr || gu ? `${nf(fr)}${gu ? ` + ${nf(gu)} g` : ""}<div class="psub">${nf(bu)} bunch</div>` : `${nf(bu)}<div class="psub">bunch</div>`;
    const sp = j.spec || snap14(specFor14(j.key)),
      ps = tr.querySelector(".psub");
    if (sp && ps) ps.insertAdjacentHTML("beforeend", ` · ${sp.ladi}×${sp.gpf}×${sp.mpl}`);
  });
  return tpl.innerHTML;
};

/* ---------- 2.1 spec master on the Rate list page ---------- */
function piraiSection14(admin) {
  const rows = S.pirai || [],
    nUn = rows.filter((s) => s.unclear).length;
  return `<section class="card"><div class="card-h"><div><h3>${L("Pirai spec", "Pirai spec")} · ${rows.length}</h3><p>${L(`Owner ka register (P2): har maal ka guchha kaise banta hai. Moti / frame = guchha × ladi × moti. 1 bunch = ${nf(mpb14())} moti.`, `Owner's register (P2): how each bead's guchha is made. Moti / frame = guchha × ladi × moti. 1 bunch = ${nf(mpb14())} moti.`)}${nUn ? ` <span class="pill warn">${nUn} ${L("confirm baaki", "to confirm")}</span>` : ""}</p></div>${admin ? `<div class="btns"><button type="button" class="btn sm" data-a="mpbEdit14">${ic("edit", 14)} 1 bunch = ${nf(mpb14())} moti</button><button type="button" class="btn sm pri" data-a="piraiEdit14">${ic("plus", 14)} ${L("Naya spec", "New spec")}</button></div>` : ""}</div>
   <div class="tw"><table><thead><tr><th>P2</th><th>Item</th><th class="r">${L("Ladi / guchha", "Ladi / guchha")}</th><th class="r">${L("Guchha / frame", "Guchha / frame")}</th><th class="r">${L("Moti / ladi", "Moti / ladi")}</th><th class="r">${L("Moti / frame", "Moti / frame")}</th><th>${L("Rate list", "Rate list")}</th><th></th></tr></thead><tbody>${rows
     .map((s) => {
       const r = s.it && rlItem(s.it);
       return `<tr><td>${s.row || "–"}</td><td><b>${esc(s.size)} ${esc(s.kind)}</b><div class="psub">${esc(s.p2 || "")}${s.unclear ? ` · <span class="pill warn">${esc(s.unclear)}</span>` : ""}${s.note ? " · " + esc(s.note) : ""}</div></td><td class="r">${nf(s.ladi)}</td><td class="r">${nf(s.gpf)}</td><td class="r">${nf(s.mpl)}</td><td class="r"><b>${nf(mpf14(s))}</b></td><td>${r ? `${r.no}. ${esc(rlName(r))}` : `<span class="psub">${L("list mein nahi", "not in list")}</span>`}</td><td>${admin ? `<button type="button" class="btn sm" data-a="piraiEdit14" data-id="${s.id}">${ic("edit", 14)} ${L("Badlo", "Edit")}</button>` : ""}</td></tr>`;
     })
     .join("")}</tbody></table></div></section>`;
}
const _avpV143 = AV.products;
AV.products = function (u) {
  const h = _avpV143(u),
    i = h.indexOf("</section>");
  return i < 0 ? h + piraiSection14((user() || {}).role === "admin") : h.slice(0, i + 10) + piraiSection14((user() || {}).role === "admin") + h.slice(i + 10);
};
ACT.piraiEdit14 = (el) => {
  const s = specById14(el.dataset.id) || { id: "", row: null, size: "6MM", p2: "", kind: "Semi", ladi: 18, gpf: 2, mpl: 50, it: null, unclear: "", note: "" },
    kinds = [...new Set([...S.rl.map((r) => r.kind), ...S.pirai.map((x) => x.kind)])];
  openModal(
    s.id ? `${L("Pirai spec", "Pirai spec")} · ${esc(s.size)} ${esc(s.kind)}` : L("Naya pirai spec", "New pirai spec"),
    s.row ? `P2 register row ${s.row} · ${esc(s.p2)}` : L("Register mein jaisa likha ho", "As written in the register"),
    `<div class="row2"><div class="fld"><label for="pss">Size</label><input id="pss" name="size" value="${esc(s.size)}" list="pssl" required><datalist id="pssl">${SIZES.map((z) => `<option value="${z}"></option>`).join("")}</datalist></div><div class="fld"><label for="psk">${L("Maal (rate list ka naam)", "Bead type (rate list name)")}</label><input id="psk" name="kind" value="${esc(s.kind)}" list="pskl" required><datalist id="pskl">${kinds.map((k) => `<option value="${esc(k)}"></option>`).join("")}</datalist></div></div>
   <div class="row3"><div class="fld"><label for="psl">${L("Ladi / guchha", "Ladi per guchha")}</label><input id="psl" name="ladi" type="number" inputmode="numeric" min="1" step="1" value="${s.ladi}" required></div><div class="fld"><label for="psg">${L("Guchha / frame", "Guchha per frame")}</label><input id="psg" name="gpf" type="number" inputmode="numeric" min="1" step="1" value="${s.gpf}" required></div><div class="fld"><label for="psm">${L("Moti / ladi", "Moti per ladi")}</label><input id="psm" name="mpl" type="number" inputmode="numeric" min="1" step="1" value="${s.mpl}" required></div></div>
   <div class="fld"><label for="psi">${L("Rate list ka item", "Rate-list item")}</label><select id="psi" name="it"><option value="">${L("— list mein nahi —", "— not in the list —")}</option>${S.rl.map((r) => `<option value="${r.no}" ${s.it === r.no ? "selected" : ""}>${r.no}. ${esc(rlName(r))}</option>`).join("")}</select></div>
   <label class="chk"><input type="checkbox" name="unclear" ${s.unclear ? "checked" : ""}> ${L("Owner se confirm baaki", "Still to confirm with the owner")}</label>
   <div class="fld"><label for="psn">Note</label><input id="psn" name="note" value="${esc(s.unclear || s.note || "")}" placeholder="${L("Jaise: 060 ya 080?", "e.g. 060 or 080?")}"></div>
   <div class="pkinfo" id="psinfo"></div><p class="err" id="pserr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "piraiEdit14", live: "piraiEdit14", id: s.id },
  );
};
LIVE.piraiEdit14 = (f) => {
  const l = +f.ladi.value || 0,
    g = +f.gpf.value || 0,
    m = +f.mpl.value || 0;
  document.getElementById("psinfo").innerHTML =
    l && g && m
      ? `<b>1 frame = ${nf(g * l * m)} moti = ${nf((g * l * m) / mpb14(), 2)} bunch</b><span>${g} guchha × ${l} ladi × ${m} moti</span>`
      : `<b>${L("Teeno number daalo", "Enter all three numbers")}</b>`;
};
FORMS.piraiEdit14 = (f) => {
  const v = { size: f.size.value.trim().toUpperCase(), kind: f.kind.value.trim(), ladi: Math.round(+f.ladi.value || 0), gpf: Math.round(+f.gpf.value || 0), mpl: Math.round(+f.mpl.value || 0), it: f.it.value ? +f.it.value : null };
  if (!v.size || !v.kind || !(v.ladi > 0 && v.gpf > 0 && v.mpl > 0)) {
    document.getElementById("pserr").textContent = L("Size, maal aur teeno number zaroori hain.", "Size, bead type and all three numbers are needed.");
    return;
  }
  if (/^\d+(\.\d+)?$/.test(v.size)) v.size += "MM";
  const note = f.note.value.trim(),
    un = f.unclear.checked;
  v.unclear = un ? note || L("confirm baaki", "to confirm") : "";
  v.note = un ? "" : note;
  let s = specById14(f.dataset.id);
  const old = s ? `${s.ladi}×${s.gpf}×${s.mpl}` : "";
  if (s) Object.assign(s, v);
  else S.pirai.push((s = Object.assign({ id: "pr" + nid(), row: null, p2: "" }, v)));
  logA(
    `Pirai spec ${s.size} ${s.kind}: ${old ? old + " → " : ""}${s.ladi}×${s.gpf}×${s.mpl} = ${nf(mpf14(s))} moti/frame${un ? " (confirm baaki)" : ""}`,
    `Pirai spec ${s.size} ${s.kind}: ${old ? old + " → " : ""}${s.ladi}×${s.gpf}×${s.mpl} = ${nf(mpf14(s))} moti/frame${un ? " (to confirm)" : ""}`,
  );
  closeModal();
  render();
  toast(L("Spec save ho gaya. Naye challan par lagega.", "Spec saved. Applies to new challans."));
};
ACT.mpbEdit14 = () =>
  openModal(
    L("Standard bunch", "Standard bunch"),
    L("Hamara 1 bunch kitne moti ka (owner: 1,200).", "How many moti make our 1 bunch (owner: 1,200)."),
    `<div class="fld"><label for="mpb">${L("Moti / bunch", "Moti per bunch")}</label><input id="mpb" name="mpb" class="big-in" type="number" inputmode="numeric" min="1" step="1" value="${mpb14()}" required></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "mpbEdit14" },
  );
FORMS.mpbEdit14 = (f) => {
  const n = Math.round(+f.mpb.value || 0);
  if (!(n > 0)) return f.mpb.focus();
  logA(`Standard bunch: ${mpb14()} → ${n} moti`, `Standard bunch: ${mpb14()} → ${n} moti`);
  S.cfg14.mpb = n;
  closeModal();
  render();
};

/* ---------- Hindi words used above ---------- */
Object.entries({
  ladi: "लड़ी",
  guchha: "गुच्छा",
  frame: "फ़्रेम",
  moti: "मोती",
  pirai: "पिराई",
  khule: "खुले",
  spec: "स्पेक",
  andaazan: "अंदाज़न",
  aayenge: "आएंगे",
  karni: "करनी",
  register: "रजिस्टर",
  poore: "पूरे",
  teeno: "तीनों",
  standard: "स्टैंडर्ड",
}).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
