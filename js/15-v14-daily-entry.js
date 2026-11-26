'use strict';
/* ===== v14.6 · Section 7: daily production (coating + packing) entry · client review 24 Nov · V10, V11 =====
   7.1 entry is made the next day: the operator picks the WORK DATE (default: yesterday)
   7.2 operator's inputs: frames used (may be 1–2 above / below the target) and packets made against the task
   7.3 rejected bunch, worked out: (frames × moti/frame − packets × moti/packet) ÷ 1,200; shown per entry and per task
   7.4 owner's tab (Tasks page): who entered what, by work date — frames, packets, rejected bunch, task progress
   Decided with Premchand (26 Nov): keep BOTH ways in the form.
   - Packets typed (owner's way, V10): stock goes up by packets × packing; the rest of the frames' moti = rejected bunch,
     which goes to Waste as "Coating reject" on approval.
   - Packets left blank (old way): packed frames / reject frames as before (stock = packed frames × bunch per frame).
   Stock still changes only on the admin's approval. */

const COATREJ14 = "Coating reject";
const _initV14f = initV14;
initV14 = function () {
  _initV14f();
  S.coatRej = S.coatRej || [];
};

/* ---------- helpers ---------- */
const coatEntriesOf14 = (t, skipId) => S.entries.filter((e) => e.kind === "coat" && e.task === t.id && e.status !== "returned" && e.id !== skipId);
const rejB14 = (e) => (e.pkMode ? e.reject || 0 : (e.frej || 0) * (e.bpf || S.bpf)); // rejected bunch of one entry
function taskSums14(t, skipId) {
  const es = coatEntriesOf14(t, skipId);
  return { n: es.length, fr: sum(es, (e) => e.fin || 0), pk: sum(es, (e) => e.packets || 0), rej: sum(es, rejB14) };
}
function entryCalc14(f) {
  const t = S.tasks.find((x) => x.id === (f.querySelector("[name=task]:checked") || {}).value),
    r = rlItem(f.it.value);
  if (!t || !r) return null;
  const sp = specOfItem14(r),
    bpf = bpfOf(r.no),
    fin = Math.round(+f.input.value || 0),
    typed = f.packets.value.trim() !== "",
    pk = Math.round(+f.packets.value || 0),
    mpf = sp ? mpf14(sp) : bpf * mpb14(),
    mpp = (r.pack || 0) * mpb14(),
    inM = fin * mpf,
    outM = pk * mpp;
  return { t, r, sp, bpf, fin, typed, pk, mpf, mpp, inM, outM, rejM: inM - outM, rejB: (inM - outM) / mpb14() };
}
const rB = (v) => nf(Math.round(v * 10) / 10, Number.isInteger(Math.round(v * 10) / 10) ? 0 : 1);

/* ---------- 7.1 + 7.2 + 7.3 entry form ---------- */
const _emV146 = entryModal;
entryModal = function (id) {
  _emV146(id);
  const f = document.querySelector("form[data-f=entry][data-live=coatEntry9]");
  if (!f) return;
  const e = id ? S.entries.find((x) => x.id === id) : null,
    wd = e && e.workDate ? ymd14(e.workDate) : ymd14(Date.now() - DAY);
  f.querySelector(".fld").insertAdjacentHTML(
    "beforebegin",
    `<div class="fld"><label for="f-wd">${L("Kis din ka kaam? (work date)", "Which day's work? (work date)")}</label><input id="f-wd" name="wdate" type="date" value="${wd}" max="${ymd14(Date.now())}" required><span class="hint">${L("Aaj bane packet kal pack hote hain, isliye kal ki shift ki entry aaj.", "Packets made today are packed tomorrow, so today you enter yesterday's shift.")}</span></div>`,
  );
  const pk = f.packets.closest(".fld");
  pk.querySelector("label").textContent = L("Kitne packet bane (task ke against)", "Packets made (against the task)");
  pk.insertAdjacentHTML("afterend", `<div class="pkinfo rj14" id="rjx" hidden></div><div class="slipbar" id="tpg"></div>`);
  // the two main inputs first: frames used, then packets
  const fi = f.input.closest(".fld").querySelector("label");
  if (fi) fi.textContent = L("Frames use hue", "Frames used");
  if (typeof tapRefresh === "function") tapRefresh();
  LIVE.coatEntry9(f);
};
const _lceV146 = LIVE.coatEntry9;
LIVE.coatEntry9 = (f) => {
  _lceV146(f);
  const c = entryCalc14(f),
    box = document.getElementById("rjx"),
    tpg = document.getElementById("tpg");
  if (!c || !box) return;
  // 7.2 task progress
  const s = taskSums14(c.t, f.dataset.id),
    now = s.fr + c.fin,
    left = c.t.target - now;
  tpg.innerHTML = `<span class="pill mute">Task #${c.t.no} · ${nf(c.t.target)} frame ${L("target", "target")}</span><span class="pill mute">${L("Pehle", "Before")} ${nf(s.fr)} + ${L("aaj", "now")} ${nf(c.fin)} = ${nf(now)}</span>${left >= -2 ? `<span class="pill ${left <= 2 ? "ok" : "mute"}">${left > 0 ? L(`Baaki ${nf(left)} frame`, `${nf(left)} frames left`) : L("Target pura", "Target done")}</span>` : `<span class="pill warn">${L(`Target se ${nf(-left)} frame zyada`, `${nf(-left)} frames over target`)}</span>`}`;
  // 7.3 rejected bunch (owner's way, only when packets are typed)
  if (!c.typed || !c.fin) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const bad = c.rejM < -1e-6;
  box.innerHTML = `<b>${L("Hisaab (owner ka tareeka)", "Working (owner's method)")}</b>
    <span>${nf(c.fin)} frame × ${nf(c.mpf)} moti = ${nf(c.inM)} moti</span>
    <span>${nf(c.pk)} packet × ${nf(c.mpp)} moti = ${nf(c.outM)} moti</span>
    <span class="${bad ? "bad14" : "tg14"}">${bad ? L(`Packet zyada hain: ${nf(c.fin)} frame mein ${nf(Math.floor(c.inM / (c.mpp || 1)))} packet tak ban sakte hain`, `Too many packets: ${nf(c.fin)} frames make at most ${nf(Math.floor(c.inM / (c.mpp || 1)))} packets`) : `${L("Reject", "Rejected")} = ${nf(c.rejM)} ÷ ${nf(mpb14())} = <b>${rB(c.rejB)} bunch</b> → Waste (${COATREJ14})`}</span>
    <span class="psub">${L("Stock mein", "To stock")}: ${nf(c.pk)} × ${c.r.pack} = ${nf(c.pk * c.r.pack)} bunch ${L("(approval ke baad)", "(after approval)")}</span>`;
  if (bad) document.getElementById("ferr").textContent = L("Packet, frames se zyada nahi ho sakte.", "Packets cannot exceed what the frames make.");
};
const _feV146 = FORMS.entry;
FORMS.entry = function (f) {
  const u = user();
  if (!u || u.unit === "M" || !f.wdate) return _feV146(f);
  const c = entryCalc14(f),
    wts = dayTs14(f.wdate.value),
    id = f.dataset.id;
  if (c && c.typed) {
    if (!(c.pk > 0)) {
      document.getElementById("ferr").textContent = L("Packet daalo, ya khaali chhodo.", "Enter packets, or leave it blank.");
      return f.packets.focus();
    }
    if (c.rejM < -1e-6) return LIVE.coatEntry9(f);
  }
  const nE = S.entries.length,
    nO = S.outbox.length;
  _feV146(f);
  const e = id ? S.entries.find((x) => x.id === id) : S.entries.length > nE ? S.entries[S.entries.length - 1] : S.outbox.length > nO ? S.outbox[S.outbox.length - 1] : null;
  if (!e || e.kind !== "coat") return;
  e.workDate = wts;
  if (c && c.typed) {
    const bpf = e.bpf || c.bpf;
    Object.assign(e, {
      pkMode: true,
      packets: c.pk,
      out: c.pk * c.r.pack,
      reject: Math.max(0, Math.round((e.input - c.pk * c.r.pack) * 1000) / 1000),
      mpf: c.mpf,
      mpp: c.mpp,
    });
    e.fout = Math.round((e.out / bpf) * 100) / 100;
    e.frej = Math.round((e.reject / bpf) * 100) / 100;
  } else delete e.pkMode;
  save();
  if (!id && typeof slipModal === "function" && document.querySelector("#modal-root .sheet")) slipModal(e.id); // re-open with the final numbers
};

/* ---------- 7.3 approval: rejected bunch → Waste ("Coating reject") ---------- */
const _apV146 = ACT.approve;
ACT.approve = function (el) {
  const e = S.entries.find((x) => x.id === el.dataset.id),
    was = e && e.status;
  _apV146(el);
  if (!e || was === "approved" || e.status !== "approved" || e.kind !== "coat" || !e.pkMode || !(e.reject > 0)) return;
  const kgv = Math.round(e.reject * (S.kpb[e.product] || 0.5) * 1000) / 1000;
  move("WASTE:M", COATREJ14, "kg", kgv);
  S.coatRej.push({ id: nid(), entry: e.id, task: e.task, product: e.product, bunch: e.reject, kg: kgv, ts: Date.now(), workDate: e.workDate || e.ts });
  logA(`Coating reject: ${rB(e.reject)} bunch (${kg(kgv)}) → waste`, `Coating reject: ${rB(e.reject)} bunches (${kg(kgv)}) → waste`);
  save();
  render();
};

/* ---------- task card: frames used, packets, rejected bunch (7.2, 7.3) ---------- */
const _tc9V146 = taskCard9;
taskCard9 = function (t, mode) {
  const h = _tc9V146(t, mode);
  if (t.kind !== "coat") return h;
  const s = taskSums14(t);
  if (!s.n) return h;
  const i = h.indexOf('<div class="yield"');
  if (i < 0) return h;
  const done = s.fr >= t.target;
  return (
    h.slice(0, i) +
    `<div class="t2 tsum14">${L("Frames use hue", "Frames used")} <b>${nf(s.fr)} / ${nf(t.target)}</b> · ${nf(s.pk)} packet · ${L("reject", "rejected")} <b>${rB(s.rej)} bunch</b>${done ? ` <span class="pill ok">${L("Frames khatam", "Frames used up")}</span>` : ""}</div>` +
    h.slice(i)
  );
};

/* ---------- 7.4 owner's tab: operator entries by work date ---------- */
const _avtV146 = AV.tasks;
AV.tasks = function (u) {
  const h = _avtV146(u),
    es = S.entries
      .filter((e) => e.kind === "coat")
      .sort((a, b) => (b.workDate || b.ts) - (a.workDate || a.ts) || b.ts - a.ts)
      .slice(0, 30);
  if (!es.length) return h;
  const byDay = {};
  es.forEach((e) => (byDay[ymd14(e.workDate || e.ts)] = byDay[ymd14(e.workDate || e.ts)] || []).push(e));
  const st = (e) => (e.status === "approved" ? `<span class="pill ok">OK</span>` : e.status === "returned" ? `<span class="pill bad">${L("Wapas", "Back")}</span>` : `<span class="pill warn">${L("Baaki", "Pending")}</span>`);
  return (
    h +
    `<section class="card"><div class="card-h"><div><h3>${L("Operator ki entry · work date", "Operator entries · by work date")}</h3><p>${L("Kis operator ne kis task par kitne frame use kiye, kitne packet bane, kitna reject.", "Who used how many frames on which task, packets made, and rejects.")}</p></div></div>
     ${Object.keys(byDay)
       .map((d) => {
         const rows = byDay[d];
         return `<div class="eyebrow">${new Date(d + "T12:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · ${nf(sum(rows, (e) => e.fin || 0))} frame · ${nf(sum(rows, (e) => e.packets || 0))} packet</div>
         <div class="tw"><table><thead><tr><th>Operator</th><th>Task</th><th class="r">Frame</th><th class="r">Packet</th><th class="r">${L("Reject (bunch)", "Rejected (bunch)")}</th><th></th></tr></thead><tbody>${rows
           .map((e) => {
             const t = S.tasks.find((x) => x.id === e.task);
             return `<tr><td><b>${esc(e.machine)}</b><div class="psub">${esc(e.staff || "")}</div></td><td>${t ? `#${t.no} · ${esc(taskTitle(t))}` : "–"}${e.pkMode ? "" : `<div class="psub">${L("purana tareeka (frame)", "old method (frames)")}</div>`}</td><td class="r">${nf(e.fin || 0)}</td><td class="r">${nf(e.packets || 0)}</td><td class="r">${rB(rejB14(e))}</td><td>${st(e)}</td></tr>`;
           })
           .join("")}</tbody></table></div>`;
       })
       .join("")}</section>`
  );
};

/* ---------- waste page: coating reject in bunch ---------- */
const _avwV146 = AV.waste;
AV.waste = function (u) {
  const h = _avwV146(u),
    xs = S.coatRej || [];
  if (!xs.length) return h;
  const byP = {};
  xs.forEach((x) => {
    const k = x.product;
    byP[k] = byP[k] || { b: 0, kg: 0, n: 0 };
    byP[k].b += x.bunch;
    byP[k].kg += x.kg;
    byP[k].n++;
  });
  return (
    h +
    `<section class="card"><div class="card-h"><div><h3>${L("Coating reject", "Coating reject")}</h3><p>${L("Frames ka moti − packet ka moti (owner ka hisaab). Upar waste table mein kg mein bhi.", "Frames' moti − packets' moti (owner's method). Also in the waste table above, in kg.")}</p></div></div>
     <div class="tw"><table><thead><tr><th>Product</th><th class="r">Entry</th><th class="r">Bunch</th><th class="r">kg</th></tr></thead><tbody>${Object.keys(byP)
       .map((k) => `<tr><td>${PM[k] ? itemCell("fin", k) : esc(k)}</td><td class="r">${byP[k].n}</td><td class="r"><b>${rB(byP[k].b)}</b></td><td class="r">${kg(byP[k].kg)}</td></tr>`)
       .join("")}</tbody></table></div></section>`
  );
};

/* ---------- Hindi words used above ---------- */
Object.entries({
  operator: "ऑपरेटर",
  work: "वर्क",
  date: "डेट",
  shift: "शिफ़्ट",
  khatam: "ख़त्म",
  tareeka: "तरीका",
  reject: "रिजेक्ट",
}).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
