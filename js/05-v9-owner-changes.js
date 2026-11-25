"use strict";
/* ================= v9: owner's changes (Nov 2026) =================
   Staff names · rate list 1–35 as the product master · coating tasks for Pearl/Metalizing
   · staff pick + start a task (Admin sees it live) · coating entry in frames with SR/TR colours
   + new colour · order → (Admin chooses) coating task or stock → bill → dispatch → stock minus
   · Hindi (Devanagari) as a third language. */
const NAMES9 = { M1: "Vinod", M2: "Pramod", P1: "Salman", MZ1: "Hamidur" };
Object.assign(MSTAFF, NAMES9);
USERS.forEach((u) => {
  if (NAMES9[u.machine]) u.n = NAMES9[u.machine];
});
const KIND9 = {
  Super: ["Round", "Super"],
  Semi: ["Round", "Semi"],
  Jaw: ["Jaw", ""],
  Munga: ["Munga", ""],
  HR: ["Half Round", ""],
  Sujni: ["Sujni", ""],
  Drop: ["Drop", ""],
};
/* No, size (mm), type, bunch per kg ("B"), single ₹/bunch, double ₹/bunch, packing (bunch per packet), note */
const RL9 = [
  [1, "2.5", "Super", 130, 5.8, 0, 100],
  [2, "3", "Super", 72, 7.3, 0, 50],
  [3, "3", "Semi", 60, 8, 10.4, 50],
  [4, "3", "Semi", 56, 8.6, 11, 50],
  [5, "4", "Super", 42, 10, 0, 25],
  [6, "4", "Semi", 34, 12.6, 15, 25],
  [7, "4", "Semi", 28, 14, 17, 25],
  [8, "5", "Super", 22, 17.5, 0, 15],
  [9, "5", "Semi", 17, 18.5, 25, 15],
  [10, "5", "Semi", 14, 23, 28, 15],
  [11, "6", "Super", 17, 17, 0, 10],
  [12, "6", "Super", 13, 23, 0, 10],
  [13, "6", "Semi", 10, 29, 36, 10],
  [14, "6", "Semi", 9, 35, 41, 10],
  [15, "8", "Super", 6.25, 42.5, 0, 4],
  [16, "8", "Semi", 3.5, 87.5, 105, 4],
  [17, "8", "Semi", 4.25, 72.5, 90, 4],
  [18, "10", "Super", 3, 87.5, 0, 2],
  [19, "10", "Semi", 2.5, 100, 125, 2],
  [20, "11", "Semi", 1.45, 185, 245, 1],
  [21, "12", "Semi", 1.25, 225, 275, 1],
  [22, "14", "Semi", null, 250, 300, 4, "4 gross"],
  [23, "16", "Semi", null, 290, 350, 4, "WIP · 4 gross"],
  [24, "20", "Semi", null, 0, 0, 0, "WIP"],
  [25, "4", "Jaw", 24, 28, 33, 25],
  [26, "8", "Jaw", null, 90, 105, 4, "bunch/kg ??????"],
  [27, "5", "Munga", 20.5, 26, 33, 15],
  [28, "6", "Munga", 11.4, 30, 38, 10],
  [29, "8", "Munga", null, 80, 100, 4, "bunch/kg ??????"],
  [30, "6", "HR", 13.7, 45, 53, 10],
  [31, "8", "HR", 6.6, 56, 65, 5],
  [32, "7", "Sujni", 6.25, 60, 70, 4],
  [33, "9", "Drop", null, 95, 135, 2, "bunch/kg ??????"],
  [34, "10", "Sujni", 2.4, 120, 150, 2],
  [35, "11", "Drop", 1.5, 125, 160, 2],
];
const COL9 = {
  SR: [
    "Off White",
    "White",
    "Cream",
    "Ferozi",
    "Orange",
    "LCD",
    "Artery",
    "Baby Pink",
    "Unique",
    "Yellow",
    "Red",
    "Maroon",
  ],
  TR: [
    "Off White",
    "White",
    "Orange",
    "Peach",
    "Pink",
    "Magenta",
    "Maroon",
    "Red",
    "Baby Pink",
    "Pista",
    "Cream",
  ],
};
const LEGACY9 = PRODUCTS.slice();
const RAW9 = RAW.slice();
SIZES.splice(
  0,
  SIZES.length,
  ...[...new Set(RL9.map((r) => r[1] + "MM"))].sort(
    (a, b) => parseFloat(a) - parseFloat(b),
  ),
);
if (!SHAPES.includes("Jaw")) SHAPES.push("Jaw");
const COAT_MS = ["P1", "P2", "MZ1"],
  lineOfM = (m) => (m === "MZ1" ? "Z" : "P");

/* ---------- rate list + product helpers ---------- */
const rlItem = (no) => (S.rl || []).find((r) => r.no === +no);
const rlShape = (r) => (KIND9[r.kind] ? KIND9[r.kind][0] : r.kind);
const rlDupe = (r) =>
  S.rl.filter((x) => x.size === r.size && x.kind === r.kind).length > 1;
const rlName = (r) =>
  `${r.size} ${r.kind}${rlDupe(r) && r.bpk ? " · " + nf(r.bpk) + "B" : ""}`;
const rlRate = (r, c) => (c === "D" ? r.d : r.s);
const COATN = (c) => (c === "D" ? "Double" : "Single");
function itemOpts(sel) {
  return S.rl
    .map(
      (r) =>
        `<option value="${r.no}" ${+sel === r.no ? "selected" : ""} ${r.s > 0 ? "" : "disabled"}>${r.no}. ${esc(rlName(r))}${r.s > 0 ? "" : " · " + L("rate baaki", "rate pending")}</option>`,
    )
    .join("");
}
function matchItem(sz, sh, ty) {
  return (
    S.rl.find(
      (r) =>
        r.s > 0 &&
        r.size === sz &&
        rlShape(r) === sh &&
        (r.kind === ty || !KIND9[r.kind] || KIND9[r.kind][1] === ""),
    ) || S.rl.find((r) => r.s > 0 && r.size === sz)
  );
}
function img9(shape, color) {
  const m =
    PROD_RAW.find((x) => x[2] === shape && x[3] === color) ||
    PROD_RAW.find((x) => x[3] === color) ||
    PROD_RAW.find((x) => x[2] === shape) ||
    PROD_RAW[0];
  return "i" + m[6];
}
function regFP(f) {
  const r = rlItem(f.it);
  if (!r) return;
  const p = {
    id: f.id,
    size: r.size,
    shape: rlShape(r),
    color: f.color,
    mat: r.kind + " · " + COATN(f.coat),
    grade: f.grade,
    img: img9(rlShape(r), f.color),
    unit: f.line,
    it: r.no,
    coat: f.coat,
  };
  const i = PRODUCTS.findIndex((x) => x.id === f.id);
  if (i >= 0) PRODUCTS[i] = p;
  else PRODUCTS.push(p);
  PM[f.id] = p;
  S.prices[f.id] = Object.assign(S.prices[f.id] || {}, {
    bunch: rlRate(r, f.coat),
    kg: null,
  });
  S.kpb[f.id] = r.bpk ? Math.round(1000 / r.bpk) / 1000 : 0.5;
}
function regAll() {
  PRODUCTS.splice(0, PRODUCTS.length);
  Object.keys(PM).forEach((k) => delete PM[k]);
  (S.fp || []).forEach(regFP);
}
const findProduct = (it, grade, color, coat, line) => {
  const f = (S.fp || []).find(
    (x) =>
      x.it === +it &&
      x.grade === grade &&
      x.color === color &&
      x.coat === coat &&
      x.line === line,
  );
  return f ? f.id : null;
};
function getProduct(it, grade, color, coat, line) {
  let id = findProduct(it, grade, color, coat, line);
  if (id) return id;
  const f = { id: "f" + S.seq.fp++, it: +it, grade, color, coat, line };
  S.fp.push(f);
  regFP(f);
  return f.id;
}
const cols = (g) => (S.colours && S.colours[g]) || S.colours.SR;
function colourOpts(g, sel, extra) {
  const has = cols(g).includes(sel);
  return (
    (extra || "") +
    (sel && !has && sel !== "__new"
      ? `<option selected>${esc(sel)}</option>`
      : "") +
    cols(g)
      .map((c) => `<option ${c === sel ? "selected" : ""}>${esc(c)}</option>`)
      .join("") +
    `<option value="__new" ${sel === "__new" ? "selected" : ""}>+ ${L("Naya rang jodo", "Add new colour")}</option>`
  );
}
function addColour(g, n) {
  n = (n || "").trim();
  if (!n) return null;
  const l = (S.colours[g] = S.colours[g] || []);
  const ex = l.find((c) => c.toLowerCase() === n.toLowerCase());
  if (ex) return ex;
  l.push(n);
  logA(`Naya rang joda: ${n} (${g})`, `New colour added: ${n} (${g})`);
  return n;
}

function initV9() {
  if (!S.v9) {
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
      outbox: [],
      shift: {},
      closed: {},
      counts: [],
      karPays: [],
      tasks: [],
      thr: [],
      regrinds: [],
    });
    Object.assign(S.seq, {
      order: 1001,
      gst: 1,
      kb: 1,
      lot: 1,
      jw: 1,
      task: 1,
      fp: 1,
    });
    S.rl = RL9.map(([no, sz, kind, bpk, s, d, pack, note]) => ({
      no,
      size: sz + "MM",
      kind,
      bpk,
      s,
      d,
      pack,
      note: note || "",
    }));
    S.fp = [];
    S.colours = JSON.parse(JSON.stringify(COL9));
    S.bpf = 10;
    S.prices = {};
    S.kpb = {};
    S.v9 = true;
    S.ui.stockTab = "fin";
    logA(
      "Owner ke badlav: rate list (1–35), coating task, frames, pehle bill phir dispatch",
      "Owner changes: rate list (1–35), coating tasks, frames, bill first then dispatch",
      { n: "System", role: "admin" },
    );
  }
  S.users.forEach((u) => {
    if (NAMES9[u.machine]) u.n = NAMES9[u.machine];
  });
  if (S.deva == null) S.deva = false;
  regAll();
}
const _seedV9 = seed;
seed = function () {
  PRODUCTS.splice(0, PRODUCTS.length, ...LEGACY9);
  LEGACY9.forEach((p) => (PM[p.id] = p));
  RAW.splice(0, RAW.length, ...RAW9);
  RAW9.forEach((r) => (RM[r.id] = r));
  _seedV9();
  initV9();
};

/* ---------- tasks: coating + start/pause ---------- */
const frDone = (t, appr) =>
  sum(
    S.entries.filter(
      (e) =>
        e.task === t.id &&
        (appr ? e.status === "approved" : e.status !== "returned"),
    ),
    (e) => e.out / (e.bpf || S.bpf),
  );
const lotName = (id) => {
  const l = S.thr.find((x) => x.id === id);
  return l ? plainName(l.key) + " · " + nf(l.bunch) + " bunch" : "–";
};
const _ttV9 = taskTitle;
taskTitle = function (t) {
  if (t.kind !== "coat") return _ttV9(t);
  const r = rlItem(t.it);
  return `${r ? rlName(r) : ""} · ${t.grade} · ${t.color || L("rang staff chunega", "colour by staff")} · ${COATN(t.coat)}`;
};
function taskCard9(t, mode) {
  const coat = t.kind === "coat",
    d = coat ? frDone(t) : taskDone(t),
    a = coat ? frDone(t, true) : taskApproved(t),
    fr = t.target ? Math.min(1, d / t.target) : 0,
    fmt = (v) => (coat ? nf(Math.round(v * 10) / 10) + " frame" : kg(v));
  const st =
    t.status !== "open"
      ? `<span class="pill mute">${L("Pura", "Done")}</span>`
      : t.working
        ? `<span class="pill ok">${ic("play", 12)} ${L("Chal raha", "In progress")}</span>`
        : `<span class="pill info">${L("Shuru nahi hua", "Not started")}</span>`;
  const r = coat ? null : rmOf(t.rm),
    ord = t.order ? S.orders.find((o) => o.id === t.order) : null;
  const s1 = coat
    ? `${t.machine} · ${esc(t.staff)} · ${lineChip(t.line)} · ${t.lot ? "Lot: " + esc(lotName(t.lot)) : L("koi bhi lot", "any lot")}`
    : `${t.machine} · ${esc(t.staff)} · ${lineChip(t.line)} · ${esc(r ? r.n : "")} (${t.type})`;
  const s2 = coat
    ? `${ord ? `Order #${ord.no} · ${esc(PTY[ord.party].n)} · ` : ""}${fdate(t.ts)}${t.note ? " · " + esc(t.note) : ""}`
    : `${L("Rang", "Colour")}: <b style="color:var(--ink)">${t.product && PM[t.product] ? esc(PM[t.product].color) : L("coating par", "at coating")}</b> · ${fdate(t.ts)}${t.note ? " · " + esc(t.note) : ""}`;
  const work =
    t.working && t.status === "open"
      ? `<div class="t2" style="color:var(--ok);font-weight:600">${esc(t.working.n)} ${L("is task par kaam kar raha hai", "is working on this task")} · ${ftime(t.working.ts)} ${L("se", "since")}</div>`
      : "";
  let btn = "";
  if (mode === "admin" && t.status === "open")
    btn = `<button type="button" class="btn sm" data-a="taskClose" data-id="${t.id}">${ic("check", 14)} ${L("Pura karo", "Mark done")}</button>`;
  if (mode === "staff" && t.status === "open")
    btn = t.working
      ? `<button type="button" class="btn sm" data-a="taskStop" data-id="${t.id}">${ic("pause", 14)} ${L("Rok do", "Pause")}</button>`
      : `<button type="button" class="btn sm pri" data-a="taskStart" data-id="${t.id}">${ic("play", 14)} ${L("Yeh kaam shuru karo", "Start this task")}</button>`;
  return `<div class="item" style="flex-wrap:wrap;align-items:flex-start">${coat && t.product && PM[t.product] ? thumb(PM[t.product]) : pthumb()}<div class="grow" style="min-width:200px"><div class="toolbar"><div class="t1">#${t.no} · ${esc(taskTitle(t))}</div>${st}</div><div class="t2">${s1}</div><div class="t2">${s2}</div>${work}
   <div class="yield" style="margin-top:6px">${beads(fr, 12, coat ? `var(${UNITS[t.line].c})` : "var(--u-m)")}<b>${fmt(d)}</b><span class="muted">/ ${fmt(t.target)} · approved ${fmt(a)}</span></div></div>${btn}</div>`;
}
taskCard = function (t, admin) {
  return taskCard9(t, admin ? "admin" : "done");
};
ACT.taskStart = (el) => {
  const u = user(),
    t = S.tasks.find((x) => x.id === el.dataset.id);
  S.tasks
    .filter((x) => x.machine === t.machine && x.working)
    .forEach((x) => (x.working = null));
  t.working = { n: u.n, ts: Date.now() };
  logA(
    `${u.machine}: ${u.n} ne task #${t.no} shuru kiya`,
    `${u.machine}: ${u.n} started task #${t.no}`,
  );
  render();
  toast(
    L(
      "Task shuru. Admin ko dikh raha hai.",
      "Task started. The Admin can see it.",
    ),
  );
};
ACT.taskStop = (el) => {
  const t = S.tasks.find((x) => x.id === el.dataset.id);
  t.working = null;
  render();
  toast(L("Task roka.", "Task paused."));
};
const _tclV9 = ACT.taskClose;
ACT.taskClose = (el) => {
  const t = S.tasks.find((x) => x.id === el.dataset.id);
  if (t) t.working = null;
  _tclV9(el);
};
function liveWork() {
  const ms = ["M1", "M2", "P1", "P2", "MZ1"];
  return `<section class="card"><div class="card-h"><div><h3>${L("Abhi kaun kya kar raha hai", "Who is working on what")}</h3><p>${L('Staff jab apna task "Shuru" karta hai, yahan dikhta hai.', 'Shows up here when staff tap "Start" on a task.')}</p></div><button type="button" class="btn sm" data-a="nav" data-v="tasks">${ic("list", 14)} Tasks</button></div>
   <div class="list">${ms
     .map((m) => {
       const t = S.tasks.find(
           (x) => x.machine === m && x.status === "open" && x.working,
         ),
         open = S.tasks.filter(
           (x) => x.machine === m && x.status === "open",
         ).length;
       return `<div class="item"><span class="ico-c ${t ? "ok" : ""}">${ic(t ? "play" : "pause", 16)}</span><div class="grow"><div class="t1">${m} · ${esc(staffOn(m))}</div><div class="t2">${t ? `#${t.no} · ${esc(taskTitle(t))} · ${ftime(t.working.ts)} ${L("se", "since")}` : open ? L(`${open} task diya hua, abhi shuru nahi kiya`, `${open} assigned, not started`) : L("Koi task nahi", "No task")}</div></div>${t ? `<span class="pill ok">${L("Kaam chalu", "Working")}</span>` : ""}</div>`;
     })
     .join("")}</div></section>`;
}
AV.tasks = function () {
  const open = S.tasks
      .filter((t) => t.status === "open")
      .sort((a, b) => (b.working ? 1 : 0) - (a.working ? 1 : 0) || b.ts - a.ts),
    mo = open.filter((t) => t.kind !== "coat"),
    co = open.filter((t) => t.kind === "coat"),
    done = S.tasks
      .filter((t) => t.status !== "open")
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 12);
  return `${liveWork()}<section class="card"><div class="card-h"><div><h3>Moulding task · ${mo.length}</h3><p>${L("M1 / M2: kaunsa bead, kaunsa raw material, kitna kg.", "M1 / M2: which bead, which raw material, how many kg.")}</p></div><button type="button" class="btn sm" data-a="taskNew">${ic("plus", 14)} Moulding task</button></div>
   <div class="list">${mo.map((t) => taskCard9(t, "admin")).join("") || `<div class="empty">${ic("list")}${L("Koi moulding task chalu nahi.", "No open moulding tasks.")}</div>`}</div></section>
   <section class="card"><div class="card-h"><div><h3>${L("Coating + packing task", "Coating + packing tasks")} · ${co.length}</h3><p>${L("P1 / P2 (Pearl) aur MZ1 (Metalizing): kaunsa item, rang, single ya double coating, kitne frame.", "P1 / P2 (Pearl) and MZ1 (Metalizing): which item, colour, single or double coating, how many frames.")}</p></div><button type="button" class="btn sm pri" data-a="coatTaskNew">${ic("plus", 14)} Coating task</button></div>
   <div class="list">${co.map((t) => taskCard9(t, "admin")).join("") || `<div class="empty">${ic("pearl")}${L("Koi coating task chalu nahi. Threaded maal coating mein bhejne ke baad task do.", "No open coating tasks. Assign one after moving threaded goods to coating.")}</div>`}</div></section>
   ${done.length ? `<section class="card"><div class="card-h"><h3>${L("Pure hue", "Completed")}</h3></div><div class="list">${done.map((t) => taskCard9(t, "done")).join("")}</div></section>` : ""}`;
};
const _taV9 = topAction;
topAction = function (u) {
  if (u.role === "admin" && S.view === "tasks")
    return `<button type="button" class="btn" data-a="taskNew">${ic("plus")}Moulding</button><button type="button" class="btn pri" data-a="coatTaskNew">${ic("plus")}Coating task</button>`;
  if (u.role === "admin" && S.view === "products")
    return `<button type="button" class="btn pri" data-a="colourNew">${ic("plus")}${L("Naya rang", "New colour")}</button>`;
  return _taV9(u);
};
ACT.coatTaskNew = () => coatTaskModal();

function coatTaskModal(pre) {
  pre = pre || {};
  const m0 = pre.machine || (pre.line === "Z" ? "MZ1" : "P1"),
    g0 = pre.grade || "SR";
  openModal(
    L("Naya coating task", "New coating task"),
    L(
      "Pearl ya Metalizing unit ko coating + packing ka kaam do",
      "Assign coating + packing work to the Pearl or Metalizing unit",
    ),
    `${pre.order ? `<div class="note">${ic("receipt", 16)}<span>Order #${pre.orderNo} · ${esc(pre.party || "")} · ${L("is order ke liye", "for this order")}</span></div>` : ""}<input type="hidden" name="order" value="${pre.order || ""}">
   <div class="fld"><span class="lb">Machine</span><div class="radios">${COAT_MS.map((m) => `<label><input type="radio" name="machine" value="${m}" ${m === m0 ? "checked" : ""}>${m} · ${esc(staffOn(m))} · ${LINE[lineOfM(m)]}</label>`).join("")}</div></div>
   <div class="fld"><label for="ctl">${L("Kaunsa threaded lot?", "Which threaded lot?")}</label><select id="ctl" name="lot"></select></div>
   <div class="row2"><div class="fld"><label for="cti">Item (rate list)</label><select id="cti" name="it">${itemOpts(pre.it || 3)}</select></div><div class="fld"><label for="ctg">Grade</label><select id="ctg" name="grade">${GRADES.map((g) => `<option ${g === g0 ? "selected" : ""}>${g}</option>`).join("")}</select></div></div>
   <div class="row2"><div class="fld"><label for="ctc">${L("Rang", "Colour")}</label><select id="ctc" name="color">${colourOpts(g0, pre.color || "", `<option value="">${L("Staff chunega", "Staff will choose")}</option>`)}</select><input id="ctn" name="newcolor" placeholder="${L("Naye rang ka naam", "New colour name")}" hidden></div>
    <div class="fld"><span class="lb">Coating</span><div class="radios"><label><input type="radio" name="coat" value="S" ${pre.coat !== "D" ? "checked" : ""}>Single</label><label><input type="radio" name="coat" value="D" ${pre.coat === "D" ? "checked" : ""}>Double</label></div></div></div>
   <div class="row2"><div class="fld"><label for="ctt">Target (frames)</label><input id="ctt" name="target" type="number" inputmode="numeric" min="1" step="1" value="${pre.target || ""}" required><span class="hint">1 frame = ${S.bpf} bunch</span></div><div class="fld"><label for="ctno">Note</label><input id="ctno" name="note" value="${esc(pre.note || "")}" placeholder="${L("Jaise: kal tak", "e.g. by tomorrow")}"></div></div>
   <div class="sumbox" id="ctsum"></div><p class="err" id="cterr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("send", 16)} ${L("Task do", "Assign task")}</button>`,
    { form: "coatTask", live: "coatTask", wide: true, nofocus: true },
  );
}
LIVE.coatTask = (f) => {
  const m = f.querySelector("[name=machine]:checked").value,
    line = lineOfM(m);
  if (f.dataset.m !== m) {
    f.dataset.m = m;
    const ls = S.thr.filter(
      (l) => l.status === "cq" && l.line === line && l.bunch > 0,
    );
    f.lot.innerHTML =
      `<option value="">${L("Koi bhi lot (staff chunega)", "Any lot (staff picks)")}</option>` +
      ls
        .map(
          (l) =>
            `<option value="${l.id}">${esc(plainName(l.key))} · ${nf(l.bunch)} bunch</option>`,
        )
        .join("");
    if (ls.length && !f.order.value) f.lot.value = ls[0].id;
    f.dataset.lv = "x";
  }
  if (f.dataset.lv !== f.lot.value) {
    const first = f.dataset.lv === undefined;
    f.dataset.lv = f.lot.value;
    const l = S.thr.find((x) => x.id === f.lot.value);
    if (l && !f.order.value) {
      const [sz, sh, ty, gr] = l.key.split("|"),
        r = matchItem(sz, sh, ty);
      if (r) f.it.value = r.no;
      if (GRADES.includes(gr)) f.grade.value = gr;
    }
  }
  const g = f.grade.value;
  if (f.dataset.g && f.dataset.g !== g) {
    const cur = f.color.value;
    f.color.innerHTML = colourOpts(
      g,
      cols(g).includes(cur) ? cur : "",
      `<option value="">${L("Staff chunega", "Staff will choose")}</option>`,
    );
  }
  f.dataset.g = g;
  f.newcolor.hidden = f.color.value !== "__new";
  const r = rlItem(f.it.value),
    dEl = f.querySelector("[name=coat][value=D]");
  dEl.disabled = !(r && r.d > 0);
  if (dEl.disabled && dEl.checked)
    f.querySelector("[name=coat][value=S]").checked = true;
  const c = f.querySelector("[name=coat]:checked").value,
    t = +f.target.value || 0,
    rate = r ? rlRate(r, c) : 0;
  document.getElementById("ctsum").innerHTML =
    `<div><span>Line</span><b>${LINE[line]} · ${m} · ${esc(staffOn(m))}</b></div><div><span>Target</span><b>${nf(t)} frame = ${nf(t * S.bpf)} bunch</b></div><div><span>Rate</span><b>${rate ? "₹" + nf(rate, 2) + " / bunch" : "–"}</b></div>${t && r && r.pack ? `<div><span>${L("Andaazit packet", "Approx. packets")}</span><b>${nf(Math.floor((t * S.bpf) / r.pack))} × ${r.pack} bunch</b></div>` : ""}`;
};
FORMS.coatTask = (f) => {
  const m = f.querySelector("[name=machine]:checked").value,
    line = lineOfM(m),
    r = rlItem(f.it.value),
    t = Math.round(+f.target.value || 0),
    err = (x) => {
      document.getElementById("cterr").textContent = x;
    };
  if (!r) return err(L("Item chuno.", "Pick an item."));
  if (!(t > 0)) {
    f.target.focus();
    return err(L("Kitne frame, yeh daalo.", "Enter the number of frames."));
  }
  let color = f.color.value;
  if (color === "__new") {
    color = addColour(f.grade.value, f.newcolor.value);
    if (!color) {
      f.newcolor.focus();
      return err(L("Naye rang ka naam likho.", "Type the new colour name."));
    }
  }
  const coat = f.querySelector("[name=coat]:checked").value;
  const tk = {
    id: nid(),
    no: S.seq.task++,
    kind: "coat",
    machine: m,
    line,
    lot: f.lot.value || null,
    it: r.no,
    grade: f.grade.value,
    color: color || null,
    coat,
    target: t,
    note: f.note.value.trim(),
    order: f.order.value || null,
    ts: Date.now(),
    status: "open",
    by: user().n,
    staff: staffOn(m),
    working: null,
  };
  if (color) tk.product = getProduct(r.no, tk.grade, color, coat, line);
  S.tasks.push(tk);
  logA(
    `Coating task #${tk.no}: ${m} · ${taskTitle(tk)} · ${t} frame`,
    `Coating task #${tk.no}: ${m} · ${taskTitle(tk)} · ${t} frames`,
  );
  closeModal();
  S.view = "tasks";
  render();
  toast(
    L(
      `Task #${tk.no} ${tk.staff} ko de diya.`,
      `Task #${tk.no} assigned to ${tk.staff}.`,
    ),
  );
};

/* ---------- staff screen ---------- */
staffView = function (u) {
  const h = _staffV8(u),
    ts = S.tasks
      .filter((t) => t.machine === u.machine && t.status === "open")
      .sort((a, b) => (b.working ? 1 : 0) - (a.working ? 1 : 0) || a.ts - b.ts);
  const card = `<section class="card"><div class="card-h"><div><h3>${L("Mere task", "My tasks")}</h3><p>${L('Jis task par kaam kar rahe ho, "Shuru karo" dabao. Admin ko dikhega.', 'Tap "Start" on the task you are working on. The Admin will see it.')}</p></div><span class="pill mute">${ts.length}</span></div>${ts.length ? `<div class="list">${ts.map((t) => taskCard9(t, "staff")).join("")}</div>` : `<div class="empty">${L("Abhi koi task nahi. Admin task dega.", "No tasks yet. The Admin will assign one.")}</div>`}</section>`;
  const mk =
    '<section class="card"><div class="card-h"><h3>' +
    L("Aaj ki meri entry", "My entries today");
  return h.replace(mk, card + mk);
};

/* ---------- coating entry in frames ---------- */
eq = function (e, v) {
  if (e && e.kind === "coat" && e.bpf)
    return nf(Math.round((v / e.bpf) * 10) / 10) + " frame";
  return fq(v, e && e.uom === "bunch" ? "bunch" : "kg");
};
const _emV9 = entryModal;
entryModal = function (id) {
  const u = user();
  if (u.unit === "M") return _emV9(id);
  const e = id ? S.entries.find((x) => x.id === id) : null;
  const ts = S.tasks.filter(
    (t) =>
      t.kind === "coat" &&
      t.machine === u.machine &&
      (t.status === "open" || (e && e.task === t.id)),
  );
  if (!ts.length)
    return openModal(
      L("Coating entry", "Coating entry"),
      u.machine,
      `<div class="empty">${ic("list")}${L("Admin ne abhi is machine ko koi coating task nahi diya. Admin se task maango.", "The Admin has not assigned a coating task to this machine yet. Ask the Admin.")}</div>`,
      `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "OK")}</button>`,
    );
  const sel = e ? e.task : (ts.find((t) => t.working) || ts[0]).id;
  openModal(
    e
      ? L("Entry sudharo", "Fix entry")
      : L("Coating + packing entry", "Coating + packing entry"),
    `${u.machine} · ${UNITS[u.unit].n} · 1 frame = ${S.bpf} bunch`,
    `<div class="fld"><span class="lb">${L("Kaunsa task?", "Which task?")}</span><div class="pick plain" role="radiogroup">${ts.map((t) => `<label><input type="radio" name="task" value="${t.id}" ${t.id === sel ? "checked" : ""}><b>#${t.no} · ${esc(taskTitle(t))}</b><span class="psub">${nf(Math.round(frDone(t) * 10) / 10)} / ${nf(t.target)} frame${t.working ? " · " + L("chal raha", "in progress") : ""}</span></label>`).join("")}</div></div>
   <div class="fld"><label for="clot">Threaded lot</label><select id="clot" name="lot"></select><span class="hint" id="clh"></span></div>
   <div class="row2"><div class="fld"><label for="cit">Item (rate list)</label><select id="cit" name="it">${itemOpts()}</select></div><div class="fld"><label for="cgr">${L("Threaded maal ka grade", "Grade of the threaded goods")}</label><select id="cgr" name="grade">${GRADES.map((g) => `<option>${g}</option>`).join("")}</select></div></div>
   <div class="row2"><div class="fld"><label for="ccl">${L("Final product ka rang", "Final product colour")}</label><select id="ccl" name="color"></select><input id="cnc" name="newcolor" placeholder="${L("Naye rang ka naam", "New colour name")}" hidden></div>
    <div class="fld"><span class="lb">Coating</span><div class="radios"><label><input type="radio" name="coat" value="S" checked>Single</label><label><input type="radio" name="coat" value="D">Double</label></div></div></div>
   <div class="row3"><div class="fld"><label for="f-in">${L("Frames liye", "Frames taken")}</label><input id="f-in" name="input" class="big-in" type="number" inputmode="numeric" step="1" min="0" value="${e ? e.fin : ""}" required></div>
   <div class="fld"><label for="f-out">${L("Coat + pack hue (frame)", "Coated + packed (frames)")}</label><input id="f-out" name="out" class="big-in" type="number" inputmode="numeric" step="1" min="0" value="${e ? e.fout : ""}" required></div>
   <div class="fld"><label for="f-rej">${L("Reject (frame)", "Rejected (frames)")}</label><input id="f-rej" name="reject" class="big-in" type="number" inputmode="numeric" step="1" min="0" value="${e ? e.frej : ""}"></div></div>
   <div class="fld"><label for="f-pk">${L("Kitne packet bane", "Packets made")}</label><input id="f-pk" name="packets" type="number" inputmode="numeric" min="0" step="1" value="${e && e.packets ? e.packets : ""}"><span class="hint" id="pkh"></span></div>
   <div class="yield" id="yl"></div><p class="err" id="ferr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "entry", live: "coatEntry9", id: id || "" },
  );
  if (e) {
    const f = document.querySelector("form[data-f=entry]"),
      p = PM[e.product];
    f.dataset.elot = e.lot;
    f.dataset.t = "";
    LIVE.coatEntry9(f);
    f.lot.value = e.lot;
    f.dataset.lv = e.lot;
    f.it.value = p.it;
    f.grade.value = p.grade;
    f.dataset.g = "";
    f.dataset.tc = p.color;
    f.querySelector(`[name=coat][value=${p.coat}]`).checked = true;
    LIVE.coatEntry9(f);
  }
};
LIVE.coatEntry9 = (f) => {
  const t = S.tasks.find(
    (x) => x.id === (f.querySelector("[name=task]:checked") || {}).value,
  );
  if (!t) return;
  if (f.dataset.t !== t.id) {
    f.dataset.t = t.id;
    const ls = S.thr.filter(
      (l) =>
        l.status === "cq" &&
        l.line === t.line &&
        (l.bunch > 0 || l.id === f.dataset.elot) &&
        (!t.lot || l.id === t.lot),
    );
    f.lot.innerHTML =
      ls
        .map(
          (l) =>
            `<option value="${l.id}">${esc(plainName(l.key))} · ${nf(l.bunch)} bunch</option>`,
        )
        .join("") ||
      `<option value="">${L("Koi lot coating mein nahi", "No lot in coating")}</option>`;
    f.it.value = t.it;
    f.querySelector(`[name=coat][value=${t.coat}]`).checked = true;
    f.dataset.lv = "~";
    f.dataset.tc = t.color || "";
  }
  const l = S.thr.find((x) => x.id === f.lot.value);
  if (f.dataset.lv !== f.lot.value) {
    f.dataset.lv = f.lot.value;
    const g = l ? l.key.split("|")[3] : t.grade;
    f.grade.value = GRADES.includes(g) ? g : t.grade;
    f.dataset.g = "";
  }
  const g = f.grade.value;
  if (f.dataset.g !== g) {
    f.dataset.g = g;
    const cur =
      f.dataset.tc || (f.color.value !== "__new" ? f.color.value : "");
    f.color.innerHTML = colourOpts(g, cur);
    f.dataset.tc = "";
  }
  f.newcolor.hidden = f.color.value !== "__new";
  const r = rlItem(f.it.value),
    dEl = f.querySelector("[name=coat][value=D]");
  dEl.disabled = !(r && r.d > 0);
  if (dEl.disabled && dEl.checked)
    f.querySelector("[name=coat][value=S]").checked = true;
  const bpf = S.bpf,
    i = +f.input.value || 0,
    o = +f.out.value || 0,
    rj = +f.reject.value || 0,
    avail = l ? Math.floor(l.bunch / bpf) : 0,
    y = i ? o / i : 0;
  document.getElementById("clh").textContent = l
    ? `${LINE[l.line]} · ${nf(l.bunch)} bunch = ${nf(avail)} frame · ${kg(l.kg)}`
    : "";
  document.getElementById("pkh").textContent =
    r && r.pack && o
      ? L(
          `Andaaza: ${nf(Math.floor((o * bpf) / r.pack))} packet (${r.pack} bunch / packet). Khaali chhodo toh yahi lagega.`,
          `Approx. ${nf(Math.floor((o * bpf) / r.pack))} packets (${r.pack} bunches / packet). Leave blank to use this.`,
        )
      : "";
  document.getElementById("yl").innerHTML =
    i && o
      ? `${beads(y, 12, `var(${UNITS[t.line].c})`, true)}<b>${nf(y * 100, 1)}%</b><span class="muted">${nf(o)} frame = ${nf(o * bpf)} bunch</span>`
      : "";
  document.getElementById("ferr").textContent = !l
    ? L(
        'Is task ke liye abhi koi lot coating mein nahi. Admin "Move to coating" karega.',
        "No lot is in coating for this task yet. The Admin needs to move one to coating.",
      )
    : i > avail
      ? L(
          `Lot mein sirf ${nf(avail)} frame (${nf(l.bunch)} bunch) hai.`,
          `Only ${nf(avail)} frames (${nf(l.bunch)} bunches) in this lot.`,
        )
      : o + rj > i
        ? L(
            "Pack + reject, liye hue frames se zyada nahi ho sakte.",
            "Packed + rejected cannot exceed frames taken.",
          )
        : "";
};
const _feV9 = FORMS.entry;
FORMS.entry = function (f) {
  const u = user();
  if (u.unit === "M") {
    const t = S.tasks.find(
        (x) => x.id === (f.querySelector("[name=task]:checked") || {}).value,
      ),
      n0 = S.entries.length + S.outbox.length;
    const res = _feV9(f);
    if (
      t &&
      !t.working &&
      !f.dataset.id &&
      S.entries.length + S.outbox.length > n0
    ) {
      t.working = { n: u.n, ts: Date.now() };
      save();
    }
    return res;
  }
  const id = f.dataset.id,
    err = (x) => {
      document.getElementById("ferr").textContent = x;
    },
    t = S.tasks.find(
      (x) => x.id === (f.querySelector("[name=task]:checked") || {}).value,
    ),
    l = S.thr.find((x) => x.id === f.lot.value),
    r = rlItem(f.it.value);
  const fi = Math.round(+f.input.value || 0),
    fo = Math.round(+f.out.value || 0),
    fr = Math.round(+f.reject.value || 0),
    bpf = S.bpf;
  if (!t || !l || !r)
    return err(L("Task, lot aur item chuno.", "Pick the task, lot and item."));
  if (!(fi > 0) || !(fo > 0))
    return err(
      L(
        "Frames liye aur pack hue, dono daalo.",
        "Enter frames taken and frames packed.",
      ),
    );
  if (fi * bpf > l.bunch || fo + fr > fi) {
    LIVE.coatEntry9(f);
    return;
  }
  let color = f.color.value;
  if (color === "__new") {
    color = addColour(f.grade.value, f.newcolor.value);
    if (!color) {
      f.newcolor.focus();
      return err(L("Naye rang ka naam likho.", "Type the new colour name."));
    }
  }
  const coat = f.querySelector("[name=coat]:checked").value,
    pid = getProduct(r.no, f.grade.value, color, coat, t.line);
  const extra = {
    kind: "coat",
    task: t.id,
    lot: l.id,
    product: pid,
    line: t.line,
    uom: "bunch",
    bpf,
    fin: fi,
    fout: fo,
    frej: fr,
    packets:
      Math.round(+f.packets.value || 0) ||
      (r.pack ? Math.floor((fo * bpf) / r.pack) : 0),
  };
  const i = fi * bpf,
    o = fo * bpf,
    rj = fr * bpf;
  if (id) {
    const e = S.entries.find((x) => x.id === id);
    Object.assign(e, extra, {
      input: i,
      out: o,
      reject: rj,
      status: "pending",
      note: "",
    });
    logA(
      `${u.machine}: entry sudhari (${fo} frame)`,
      `${u.machine}: entry fixed (${fo} frames)`,
    );
    closeModal();
    toast(
      L(
        "Entry sudhar di. Admin ke paas gayi.",
        "Entry fixed and sent to the Admin.",
      ),
    );
    return render();
  }
  const e = Object.assign(
    {
      id: nid(),
      unit: u.unit,
      machine: u.machine,
      staff: u.n,
      shift: "Day",
      ts: Date.now(),
      input: i,
      out: o,
      reject: rj,
      down: 0,
      status: "pending",
      hist: false,
      note: "",
    },
    extra,
  );
  e.lotNo = newLot();
  if (!t.working) t.working = { n: u.n, ts: Date.now() };
  if (S.online) {
    S.entries.push(e);
    logA(
      `${u.machine}: ${fo} frame (${o} bunch) coating entry`,
      `${u.machine}: ${fo} frames (${o} bunches) coating entry`,
    );
    toast(
      L(
        "Entry save ho gayi. Admin final approval karega.",
        "Entry saved. The Admin will give final approval.",
      ),
    );
  } else {
    S.outbox.push(e);
    toast(
      L(
        "Internet nahi hai. Entry phone mein save hai.",
        "Offline. Entry saved on the phone.",
      ),
    );
  }
  render();
  slipModal(e.id);
};

/* ---------- orders: rate list items, packets, task or stock ---------- */
const newOL = () => ({
  it: 3,
  grade: "SR",
  color: "Off White",
  coat: "D",
  line: "P",
  pk: "",
  rate: "",
  nc: "",
  auto: true,
});
newOrderModal = function () {
  draft = {
    party: PARTIES[0].id,
    lines: [newOL()],
    over: false,
    promise: new Date(Date.now() + 7 * DAY).toISOString().slice(0, 10),
  };
  renderOrderModal();
};
renderOrderModal = function () {
  openModal(
    L("Naya order", "New order"),
    L(
      "Party, item, rang, coating aur packet. Rate, rate list se apne aap aata hai.",
      "Party, item, colour, coating and packets. The rate comes from the rate list.",
    ),
    `<div class="fld"><label for="op">Party</label><select id="op" name="party">${PARTIES.map((p) => `<option value="${p.id}" ${p.id === draft.party ? "selected" : ""}>${p.n} · ${p.city}</option>`).join("")}</select></div>
  <div class="list">${draft.lines
    .map(
      (
        l,
        i,
      ) => `<div style="display:grid;gap:10px;padding:12px 14px;border:1px solid var(--line);border-radius:18px">
   <div class="toolbar"><b>Item ${i + 1}</b><button type="button" class="xbtn" data-a="delLine" data-i="${i}" aria-label="${L("Line hatao", "Remove line")}" ${draft.lines.length < 2 ? "disabled" : ""}>${ic("trash", 16)}</button></div>
   <div class="row2"><div class="fld"><label for="oi${i}">Item (rate list)</label><select id="oi${i}" name="it_${i}">${itemOpts(l.it)}</select></div><div class="fld"><label for="ol${i}">Unit</label><select id="ol${i}" name="ln_${i}"><option value="P" ${l.line === "P" ? "selected" : ""}>Pearl</option><option value="Z" ${l.line === "Z" ? "selected" : ""}>Metalizing</option></select></div></div>
   <div class="row3"><div class="fld"><label for="og${i}">Grade</label><select id="og${i}" name="gr_${i}">${GRADES.map((g) => `<option ${g === l.grade ? "selected" : ""}>${g}</option>`).join("")}</select></div><div class="fld"><label for="oc${i}">${L("Rang", "Colour")}</label><select id="oc${i}" name="cl_${i}">${colourOpts(l.grade, l.color)}</select><input name="nc_${i}" aria-label="${L("Naya rang", "New colour")}" placeholder="${L("Naye rang ka naam", "New colour name")}" value="${esc(l.nc || "")}" ${l.color === "__new" ? "" : "hidden"}></div><div class="fld"><label for="oco${i}">Coating</label><select id="oco${i}" name="co_${i}"><option value="S" ${l.coat === "S" ? "selected" : ""}>Single</option><option value="D" ${l.coat === "D" ? "selected" : ""}>Double</option></select></div></div>
   <div class="row2"><div class="fld"><label for="oq${i}">${L("Kitne packet", "Packets")}</label><input id="oq${i}" name="pk_${i}" type="number" inputmode="numeric" min="0" step="1" value="${l.pk}" required><span class="hint" id="oh${i}"></span></div><div class="fld"><label for="or${i}">Rate ₹ / bunch</label><input id="or${i}" name="rate_${i}" type="number" inputmode="decimal" min="0" step="0.1" value="${l.rate}"><span class="hint">${L("Rate list se. Badal bhi sakte ho.", "From the rate list. You can change it.")}</span></div></div>
   <div class="avl" id="av${i}"></div></div>`,
    )
    .join("")}</div>
  <button type="button" class="btn sm" data-a="addLine" style="justify-self:start">${ic("plus", 15)} ${L("Aur item", "Add item")}</button>
  <div class="fld"><label for="od">${L("Delivery kab tak", "Delivery by")}</label><input id="od" name="promise" type="date" value="${draft.promise || ""}"></div>
  <div id="osum"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit" id="osave">${ic("check", 16)} ${L("Order save karo", "Save order")}</button>`,
    { form: "order", live: "order", wide: true, nofocus: true },
  );
};
syncDraft = function (f) {
  if (!f || !draft) return;
  draft.party = f.party.value;
  if (f.promise) draft.promise = f.promise.value;
  draft.lines.forEach((l, i) => {
    if (!f["it_" + i]) return;
    Object.assign(l, {
      it: +f["it_" + i].value,
      line: f["ln_" + i].value,
      grade: f["gr_" + i].value,
      color: f["cl_" + i].value,
      nc: f["nc_" + i].value,
      coat: f["co_" + i].value,
      pk: f["pk_" + i].value,
      rate: f["rate_" + i].value,
    });
  });
  const c = f.querySelector("[name=over]");
  draft.over = c ? c.checked : false;
};
document.addEventListener(
  "input",
  (e) => {
    const t = e.target;
    if (
      t &&
      /^rate_\d+$/.test(t.name || "") &&
      t.form &&
      t.form.dataset.f === "order" &&
      draft &&
      draft.lines
    ) {
      const l = draft.lines[+t.name.split("_")[1]];
      if (l) l.auto = false;
    }
  },
  true,
);
LIVE.order = function (f) {
  syncDraft(f);
  let val = 0;
  draft.lines.forEach((l, i) => {
    const r = rlItem(l.it),
      cs = f["co_" + i],
      dOpt = cs.querySelector("[value=D]");
    dOpt.disabled = !(r && r.d > 0);
    if (dOpt.disabled && l.coat === "D") {
      cs.value = "S";
      l.coat = "S";
    }
    const gs = f["gr_" + i];
    if (gs.dataset.g && gs.dataset.g !== l.grade) {
      f["cl_" + i].innerHTML = colourOpts(
        l.grade,
        cols(l.grade).includes(l.color) ? l.color : cols(l.grade)[0],
      );
      l.color = f["cl_" + i].value;
    }
    gs.dataset.g = l.grade;
    f["nc_" + i].hidden = l.color !== "__new";
    if (l.auto && r) {
      const ar = rlRate(r, l.coat);
      f["rate_" + i].value = ar || "";
      l.rate = ar || "";
    }
    const pk = Math.round(+l.pk || 0),
      pack = (r && r.pack) || 1,
      bunch = pk * pack,
      rate = +l.rate || 0;
    val += bunch * rate;
    const pid =
        l.color && l.color !== "__new"
          ? findProduct(l.it, l.grade, l.color, l.coat, l.line)
          : null,
      av = pid ? qty("FIN:" + l.line, pid, "bunch") : 0;
    document.getElementById("oh" + i).textContent = r
      ? r.pack
        ? `${r.pack} bunch / packet${pk ? " · " + nf(bunch) + " bunch" : ""}`
        : L("Packing abhi tay nahi", "Packing not set yet")
      : "";
    document.getElementById("av" + i).innerHTML = pk
      ? `${av >= bunch ? `<span class="pill ok">${ic("check", 12)} ${L("Stock hai", "In stock")}: ${nf(av)} bunch</span>` : `<span class="pill warn">${L("Taiyaar stock", "Ready stock")}: ${nf(av)} bunch · ${nf(bunch - av)} bunch ${L("banana padega", "to be made")}</span>`} <span class="psub">${L("Rakam", "Amount")} ${rs(bunch * rate)}</span>`
      : "";
  });
  const p = PTY[draft.party],
    pi = partyInfo(p.id),
    after = pi.out + val * 1.18,
    over = after > p.limit;
  document.getElementById("osum").innerHTML =
    `<div class="sumbox"><div><span>${L("Order (bina GST)", "Order (before GST)")}</span><b>${rs(val)}</b></div><div><span>${L("Party ka abhi baaki", "Party owes now")}</span><b>${rs(pi.out)}</b></div><div class="tot"><span>${L("Order ke baad (GST ke saath, andaaza)", "After this order (with GST, est.)")}</span><b>${rs(after)}</b></div></div>
   ${over ? `<div class="note bad">${ic("alert", 16)}<span>${L(`Credit limit ${rs(p.limit)} paar ho jaayegi.`, `This crosses the ${rs(p.limit)} credit limit.`)}<label style="display:flex;gap:8px;align-items:center;margin-top:6px;color:var(--ink)"><input type="checkbox" name="over" ${draft.over ? "checked" : ""}> ${L("Phir bhi order lo (Admin)", "Take the order anyway (Admin)")}</label></span></div>` : ""}`;
  const sv = document.getElementById("osave"),
    c = f.querySelector("[name=over]");
  sv.disabled =
    (over && !(c && c.checked)) || !draft.lines.some((l) => +l.pk > 0);
};
FORMS.order = function (f) {
  syncDraft(f);
  const ls = [];
  for (let i = 0; i < draft.lines.length; i++) {
    const l = draft.lines[i],
      pk = Math.round(+l.pk || 0),
      r = rlItem(l.it);
    if (!(pk > 0) || !r) continue;
    let color = l.color;
    if (color === "__new") {
      color = addColour(l.grade, l.nc);
      if (!color) {
        f["nc_" + i].focus();
        return;
      }
    }
    const pack = r.pack || 1,
      pid = getProduct(r.no, l.grade, color, l.coat, l.line);
    ls.push({
      kind: "fin",
      ref: pid,
      uom: "bunch",
      qty: pk * pack,
      pk,
      pack,
      rate: +l.rate || rlRate(r, l.coat),
      disp: 0,
    });
  }
  if (!ls.length) return;
  const no = S.seq.order++,
    pr = f.promise.value
      ? new Date(f.promise.value).getTime()
      : Date.now() + 7 * DAY;
  const o = {
    id: "o" + no,
    no,
    party: draft.party,
    lines: ls,
    ts: Date.now(),
    promise: pr,
    cancelled: false,
    reason: "",
  };
  S.orders.push(o);
  logA(
    `Order #${no} banaya · ${PTY[o.party].n}${draft.over ? " (limit override)" : ""}`,
    `Order #${no} created · ${PTY[o.party].n}${draft.over ? " (limit override)" : ""}`,
  );
  closeModal();
  S.view = "orders";
  S.ui.orderTab = "all";
  render();
  orderNextModal(o.id);
};
ACT.addLine = () => {
  const f = document.querySelector("form[data-f=order]");
  syncDraft(f);
  const last = draft.lines[draft.lines.length - 1];
  draft.lines.push(
    Object.assign(newOL(), {
      grade: last.grade,
      line: last.line,
      color: cols(last.grade)[0],
    }),
  );
  renderOrderModal();
};
ACT.delLine = (el) => {
  const f = document.querySelector("form[data-f=order]");
  syncDraft(f);
  draft.lines.splice(+el.dataset.i, 1);
  renderOrderModal();
};

/* stock reserved by bills that are not dispatched yet */
const pendBills = () => S.dispatches.filter((d) => d.pending);
const reserved = (pid) =>
  sum(
    pendBills().flatMap((d) => {
      const o = S.orders.find((x) => x.id === d.order);
      return d.lines.filter(({ i }) => o.lines[i].ref === pid);
    }),
    (x) => x.q,
  );
const freeAvail = (l) => Math.max(0, lineAvail(l) - reserved(l.ref));
const remBill = (o, i) =>
  Math.max(
    0,
    o.lines[i].qty -
      o.lines[i].disp -
      sum(
        pendBills()
          .filter((d) => d.order === o.id)
          .flatMap((d) => d.lines.filter((x) => x.i === i)),
        (x) => x.q,
      ),
  );
const shortOf = (o, i) => Math.max(0, remBill(o, i) - freeAvail(o.lines[i]));
const lineTask = (o, i) =>
  S.tasks.find(
    (t) => t.order === o.id && t.oline === i && t.status === "open",
  ) ||
  S.tasks.find(
    (t) =>
      t.order === o.id && t.product === o.lines[i].ref && t.status === "open",
  );
function orderNextModal(oid) {
  const o = S.orders.find((x) => x.id === oid),
    rows = o.lines.map((l, i) => ({ l, i, sh: shortOf(o, i) }));
  const anyShort = rows.some((x) => x.sh > 0),
    anyBill = rows.some((x) => remBill(o, x.i) > 0 && freeAvail(x.l) > 0);
  openModal(
    L(`Order #${o.no} save ho gaya`, `Order #${o.no} saved`),
    esc(PTY[o.party].n),
    `<p>${L("Ab aap tay karo: jo maal taiyaar hai uska bill banao, jo kam hai uske liye Pearl / Metalizing unit ko coating task do.", "Now decide: bill what is ready, and give the Pearl / Metalizing unit a coating task for what is short.")}</p>
   <div class="list">${rows
     .map(({ l, i, sh }) => {
       const p = PM[l.ref];
       return `<div class="item" style="flex-wrap:wrap">${thumb(p)}<div class="grow" style="min-width:180px"><div class="t1">${esc(pname(p))} · ${esc(psub(p))}</div><div class="t2">${nf(l.pk)} packet = ${nf(l.qty)} bunch · ${L("taiyaar", "ready")} ${nf(freeAvail(l))} bunch</div></div>${sh > 0 ? `<button type="button" class="btn sm pri" data-a="orderTask" data-id="${o.id}" data-i="${i}">${ic("send", 14)} ${L("Coating task do", "Assign coating task")} (${nf(Math.ceil(sh / S.bpf))} frame)</button>` : `<span class="pill ok">${ic("check", 12)} ${L("Stock se", "From stock")}</span>`}</div>`;
     })
     .join("")}</div>`,
    `<button type="button" class="btn" data-a="close">${L("Baad mein", "Later")}</button>${anyBill ? `<button type="button" class="btn pri" data-a="billOrder" data-id="${o.id}">${ic("receipt", 16)} ${L("Taiyaar maal ka bill banao", "Bill the ready goods")}</button>` : ""}`,
    { wide: true },
  );
}
ACT.orderTask = (el) => {
  const o = S.orders.find((x) => x.id === el.dataset.id),
    i = +el.dataset.i,
    l = o.lines[i],
    p = PM[l.ref],
    sh = shortOf(o, i);
  coatTaskModal({
    order: o.id,
    orderNo: o.no,
    party: PTY[o.party].n,
    it: p.it,
    grade: p.grade,
    color: p.color,
    coat: p.coat,
    line: p.unit,
    target: Math.max(1, Math.ceil(sh / S.bpf)),
    note: `Order #${o.no}`,
  });
  const f = document.querySelector("form[data-f=coatTask]");
  f.insertAdjacentHTML(
    "beforeend",
    `<input type="hidden" name="oline" value="${i}">`,
  );
};
const _fctV9 = FORMS.coatTask;
FORMS.coatTask = (f) => {
  const n0 = S.tasks.length;
  _fctV9(f);
  if (S.tasks.length > n0 && f.oline) {
    S.tasks[S.tasks.length - 1].oline = +f.oline.value;
    save();
  }
};
ACT.billOrder = (el) => billOrderModal(el.dataset.id);
function billOrderModal(oid) {
  const o = S.orders.find((x) => x.id === oid),
    p = PTY[o.party],
    rows = o.lines
      .map((l, i) => ({ l, i, rem: remBill(o, i), av: freeAvail(l) }))
      .filter((x) => x.rem > 0);
  openModal(
    L("Bill banao", "Make bill"),
    `#${o.no} · ${esc(p.n)} · ${esc(p.state)}`,
    `<div class="note">${ic("truck", 16)}<span>${L('Pehle bill banta hai. Maal gaadi mein jaate hi "Dispatch karo" dabao, tab stock se minus hoga.', 'The bill comes first. When the goods leave, tap "Dispatch" and the stock is reduced then.')}</span></div>
   <div class="fld"><span class="lb">${L("Kaunsa bill?", "Bill type")}</span><div class="radios"><label><input type="radio" name="type" value="GST" checked>GST tax invoice</label><label><input type="radio" name="type" value="KACHCHA">${L("Kachcha bill", "Estimate (kachcha)")}</label></div></div>
   ${
     rows
       .map(({ l, i, rem, av }) => {
         const pr = PM[l.ref],
           pack = l.pack || 1,
           mx = Math.floor(Math.min(rem, av) / pack);
         return `<div class="fld"><label for="bq${i}">${esc(pname(pr))} · ${esc(psub(pr))} · ${L("packet", "packets")}</label><input id="bq${i}" name="pk${i}" class="big-in" type="number" inputmode="numeric" min="0" step="1" max="${mx}" value="${mx}"><span class="hint">${pack} bunch / packet · ${L("order mein baaki", "left on order")} ${nf(Math.round(rem / pack))} packet · ${L("taiyaar", "ready")} ${nf(Math.floor(av / pack))} packet · ₹${nf(l.rate, 2)} / bunch</span></div>`;
       })
       .join("") ||
     `<div class="empty">${L("Is order ka sab bill ho chuka.", "Everything on this order is billed.")}</div>`
   }
   <div class="sumbox" id="bsum"></div><p class="err" id="berr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("receipt", 16)} ${L("Bill banao", "Make bill")}</button>`,
    { form: "billOrder", live: "billOrder", id: oid, wide: true },
  );
}
function billParts(f, o) {
  const parts = [];
  o.lines.forEach((l, i) => {
    const el = f["pk" + i];
    if (!el) return;
    const pk = Math.round(+el.value || 0);
    if (pk > 0) parts.push({ i, pk, q: pk * (l.pack || 1) });
  });
  return parts;
}
LIVE.billOrder = (f) => {
  const o = S.orders.find((x) => x.id === f.dataset.id),
    p = PTY[o.party],
    parts = billParts(f, o),
    tx = sum(parts, (x) => x.q * o.lines[x.i].rate),
    g = f.querySelector("[name=type]:checked").value === "GST",
    intra = p.state === "Maharashtra";
  document.getElementById("bsum").innerHTML =
    `${parts.map((x) => `<div><span>${nf(x.pk)} packet × ${o.lines[x.i].pack || 1} bunch × ₹${nf(o.lines[x.i].rate, 2)}</span><b>${rs(x.q * o.lines[x.i].rate)}</b></div>`).join("")}<div><span>Taxable</span><b>${rs(tx)}</b></div>${g ? (intra ? `<div><span>CGST 9% + SGST 9%</span><b>${rs(tx * 0.18)}</b></div>` : `<div><span>IGST 18% (${esc(p.state)})</span><b>${rs(tx * 0.18)}</b></div>`) : ""}<div class="tot"><span>${L("Bill ki rakam", "Bill amount")}</span><b>${rs(Math.round(g ? tx * 1.18 : tx))}</b></div>`;
  const bad = parts.find(
    (x) => x.q > Math.min(remBill(o, x.i), freeAvail(o.lines[x.i])) + 0.001,
  );
  document.getElementById("berr").textContent = bad
    ? L(
        "Itna taiyaar stock nahi hai, ya order se zyada hai.",
        "More than the ready stock or the order.",
      )
    : "";
};
FORMS.billOrder = (f) => {
  const o = S.orders.find((x) => x.id === f.dataset.id),
    parts = billParts(f, o),
    type = f.querySelector("[name=type]:checked").value;
  if (!parts.length) {
    document.getElementById("berr").textContent = L(
      "Kam se kam ek item ke packet daalo.",
      "Enter packets for at least one item.",
    );
    return;
  }
  if (
    parts.some(
      (x) => x.q > Math.min(remBill(o, x.i), freeAvail(o.lines[x.i])) + 0.001,
    )
  )
    return LIVE.billOrder(f);
  const d = {
    id: nid(),
    order: o.id,
    unit: PM[o.lines[parts[0].i].ref].unit,
    lines: parts.map((x) => ({ i: x.i, q: x.q, pk: x.pk })),
    ts: Date.now(),
    vehicle: "",
    by: user().n,
    invoice: null,
    pending: true,
  };
  S.dispatches.push(d);
  const inv = makeInvoice(d, type);
  closeModal();
  render();
  invoiceModal(inv.id);
  toast(
    L(
      "Bill ban gaya. Dispatch ke baad stock se minus hoga.",
      "Bill made. Stock is reduced after dispatch.",
    ),
  );
};
const _miV9 = makeInvoice;
makeInvoice = function (d, type, ts, silent) {
  const inv = _miV9(d, type, ts, silent),
    o = S.orders.find((x) => x.id === d.order);
  inv.lines.forEach((ln, k) => {
    const dl = d.lines[k],
      ol = o.lines[dl.i];
    ln.pack = ol.pack || null;
    ln.pk = dl.pk != null ? dl.pk : ol.pack ? Math.round(dl.q / ol.pack) : null;
  });
  return inv;
};
invoiceModal = function (id) {
  const inv = S.invoices.find((x) => x.id === id),
    p = PTY[inv.party],
    gst = inv.type === "GST",
    ps = invPaid(inv),
    d = S.dispatches.find((x) => x.id === inv.disp);
  openModal(
    inv.no,
    `${gst ? "GST tax invoice" : L("Kachcha bill", "Estimate")} · ${fdate(inv.ts)}${d && d.pending ? " · " + L("dispatch baaki", "not dispatched yet") : ""}`,
    `<div class="paper"><div class="ph"><div><h3>MK Plastics</h3><div class="m">Beads Bazaar · Bhiwandi, Mumbai 421302, Maharashtra</div>${gst ? `<div class="m">GSTIN 27XXXXXXXXXX1Z0 (sample)</div>` : ""}</div><div style="text-align:right"><div class="stamp">${gst ? "Tax Invoice" : "Estimate"}</div><b>${inv.no}</b><div class="m">${new Date(inv.ts).toLocaleDateString("en-IN")}</div></div></div>
  <div><div class="m">Bill to</div><b>${esc(p.n)}</b><div class="m">${esc(p.city)}, ${esc(p.state)}${gst ? " · GSTIN " + p.gst : ""}</div></div>
  <div class="tw" style="margin-inline:0;padding-inline:0"><table><thead><tr><th>#</th><th>${L("Vivran", "Description")}</th>${gst ? "<th>HSN</th>" : ""}<th class="r">Packet</th><th class="r">Bunch</th><th class="r">Rate</th><th class="r">${L("Rakam", "Amount")}</th></tr></thead><tbody>${inv.lines.map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.desc)}${l.pack ? `<div class="m">${l.pack} bunch / packet</div>` : ""}</td>${gst ? "<td>3926</td>" : ""}<td class="r">${l.pk != null ? nf(l.pk) : "–"}</td><td class="r">${fq(l.qty, l.uom)}</td><td class="r">₹${nf(l.rate, 2)}</td><td class="r">${nf(l.amt, 2)}</td></tr>`).join("")}</tbody></table></div>
  <div class="tots"><div><span>Taxable</span><span class="num">${nf(inv.taxable, 2)}</span></div>${inv.cgst ? `<div><span>CGST 9%</span><span class="num">${nf(inv.cgst, 2)}</span></div><div><span>SGST 9%</span><span class="num">${nf(inv.sgst, 2)}</span></div>` : ""}${inv.igst ? `<div><span>IGST 18%</span><span class="num">${nf(inv.igst, 2)}</span></div>` : ""}<div><span>Round off</span><span class="num">${nf(inv.round, 2)}</span></div><div class="g"><span>Total</span><span class="num">${rs(inv.total)}</span></div></div>
  <div class="m">${words(inv.total)}</div><div class="m">${L("Sample bill · HSN aur GST rate CA se confirm karna hai", "Sample bill · confirm HSN and GST rate with the CA")}</div></div>
  <div class="btns">${ps === "paid" ? `<span class="pill ok">Paid</span>` : ps === "part" ? `<span class="pill warn">${L("Aadha paid", "Part paid")}</span>` : `<span class="pill bad">${L("Payment baaki", "Unpaid")}</span>`} ${d && d.pending ? `<span class="pill warn">${ic("truck", 12)} ${L("Dispatch baaki", "Not dispatched")}</span>` : d && d.vehicle ? `<span class="pill ok">${ic("truck", 12)} ${L("Dispatch ho gaya", "Dispatched")} · ${esc(d.vehicle)}</span>` : ""}</div>`,
    `<button type="button" class="btn" data-a="waShare">${ic("send", 16)} WhatsApp</button><span class="grow"></span>${d && d.pending ? `<button type="button" class="btn pri" data-a="dispBill" data-id="${d.id}">${ic("truck", 16)} ${L("Dispatch karo", "Dispatch")}</button>` : `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "Done")}</button>`}`,
    { wide: true },
  );
};
function dispatchBillModal(did) {
  const d = S.dispatches.find((x) => x.id === did),
    o = S.orders.find((x) => x.id === d.order),
    inv = S.invoices.find((x) => x.id === d.invoice);
  openModal(
    L("Dispatch karo", "Dispatch"),
    `#${o.no} · ${esc(PTY[o.party].n)} · ${inv ? inv.no : ""}`,
    `<div class="sumbox">${d.lines
      .map(({ i, q, pk }) => {
        const p = PM[o.lines[i].ref];
        return `<div><span>${esc(pname(p))} · ${esc(psub(p))}</span><b>${pk != null ? nf(pk) + " packet · " : ""}${nf(q)} bunch</b></div>`;
      })
      .join("")}</div>
   <div class="row2"><div class="fld"><label for="dv">${L("Gaadi number", "Vehicle no.")}</label><input id="dv" name="vehicle" placeholder="MH04 AB 1234" required></div><div class="fld"><label for="dp">${ic("camera", 14)} ${L("Maal ki photo", "Photo of the load")}</label><input id="dp" name="photo" type="file" accept="image/*"></div></div>
   <div class="note">${ic("box", 16)}<span>${L('Dispatch hote hi yeh maal "Dispatch ke liye taiyaar" stock se minus ho jaayega. Record bill ke saath rahega.', "On dispatch these goods leave the ready-to-dispatch stock. The record stays with the bill.")}</span></div><p class="err" id="derr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("truck", 16)} ${L("Dispatch ho gaya", "Mark dispatched")}</button>`,
    { form: "dispBill", id: did },
  );
}
ACT.dispBill = (el) => dispatchBillModal(el.dataset.id);
FORMS.dispBill = (f) => {
  const d = S.dispatches.find((x) => x.id === f.dataset.id),
    o = S.orders.find((x) => x.id === d.order);
  if (!f.vehicle.value.trim()) {
    f.vehicle.focus();
    return;
  }
  const bad = d.lines.find(({ i, q }) => lineAvail(o.lines[i]) < q - 0.001);
  if (bad) {
    document.getElementById("derr").textContent = L(
      "Stock mein itna maal nahi hai. Stock check karo.",
      "Not enough stock. Check the stock.",
    );
    return;
  }
  d.lines.forEach(({ i, q }) => {
    lineTake(o.lines[i], q);
    o.lines[i].disp += q;
  });
  Object.assign(d, {
    pending: false,
    ts: Date.now(),
    vehicle: f.vehicle.value.trim(),
    by: user().n,
  });
  logA(
    `Dispatch #${o.no} · ${PTY[o.party].n} · stock se minus`,
    `Dispatched #${o.no} · ${PTY[o.party].n} · stock reduced`,
  );
  closeModal();
  render();
  toast(
    L(
      "Dispatch ho gaya. Stock se minus, record bill ke saath.",
      "Dispatched. Stock reduced; the record stays with the bill.",
    ),
  );
};
const _osV9 = orderStatus;
orderStatus = function (o) {
  const s = _osV9(o);
  if (o.cancelled) return s;
  if (pendBills().some((d) => d.order === o.id)) return "billed";
  return s;
};
OST.billed = ["warn", "Bill bana · dispatch baaki", "Billed · to dispatch"];
ACT.dispatch = (el) => {
  const d = pendBills().find((x) => x.order === el.dataset.id);
  if (d) return dispatchBillModal(d.id);
  billOrderModal(el.dataset.id);
};
const _dvV9 = dispatchView;
dispatchView = function (u) {
  return _dvV9(u).replace(
    /data-a="dispatch" data-id="([^"]+)"([^>]*)>[\s\S]*?<\/button>/g,
    (m, id, rest) => {
      const pend = pendBills().some((d) => d.order === id);
      return `data-a="dispatch" data-id="${id}"${pend ? "" : rest}>${pend ? ic("truck", 16) + " " + L("Dispatch karo", "Dispatch") : ic("receipt", 16) + " " + L("Bill banao", "Make bill")}</button>`;
    },
  );
};
orderDetailModal = function (id) {
  const o = S.orders.find((x) => x.id === id),
    st = orderStatus(o),
    ds = S.dispatches.filter((d) => d.order === o.id),
    canBill =
      !o.cancelled &&
      o.lines.some((l, i) => remBill(o, i) > 0 && freeAvail(l) > 0);
  openModal(
    `Order #${o.no}`,
    `${esc(PTY[o.party].n)} · ${fdate(o.ts)} · ${L("delivery", "due")} ${fdate(o.promise)}`,
    `<div>${opill(st)}${o.cancelled ? ` <span class="psub">${esc(o.reason)}</span>` : ""}</div>
  <div class="tw"><table><thead><tr><th>Product</th><th class="r">Packet</th><th class="r">Bunch</th><th class="r">${L("Gaya", "Sent")}</th><th class="r">${L("Taiyaar", "Ready")}</th><th class="r">Rate</th><th class="r">${L("Rakam", "Amount")}</th><th></th></tr></thead><tbody>${o.lines
    .map((l, i) => {
      const sh = o.cancelled ? 0 : shortOf(o, i),
        tk = lineTask(o, i);
      return `<tr><td>${itemCell(l.kind, l.ref)}</td><td class="r">${l.pk != null ? nf(l.pk) : "–"}</td><td class="r">${fq(l.qty, l.uom)}</td><td class="r">${fq(l.disp, l.uom)}</td><td class="r">${fq(freeAvail(l), l.uom)}</td><td class="r">${rs(l.rate)}</td><td class="r"><b>${rs(l.qty * l.rate)}</b></td><td>${sh > 0 ? (tk ? `<span class="pill info">Task #${tk.no}</span>` : `<button type="button" class="btn sm" data-a="orderTask" data-id="${o.id}" data-i="${i}">${ic("send", 14)} ${L("Coating task", "Coating task")}</button>`) : ""}</td></tr>`;
    })
    .join("")}</tbody></table></div>
  <div class="sumbox"><div class="tot"><span>${L("Order ki rakam (bina GST)", "Order value (before GST)")}</span><b>${rs(orderValue(o))}</b></div></div>
  ${
    ds.length
      ? `<div class="fld"><span class="lb">${L("Bill aur dispatch", "Bills and dispatch")}</span><div class="list">${ds
          .map((d) => {
            const inv = d.invoice && S.invoices.find((i) => i.id === d.invoice);
            return `<div class="item" style="flex-wrap:wrap"><span class="ico-c ${d.pending ? "warn" : "ok"}">${ic(d.pending ? "receipt" : "truck", 16)}</span><div class="grow"><div class="t1" style="font-weight:500">${d.lines.map(({ i, q, pk }) => (pk != null ? nf(pk) + " packet · " : "") + fq(q, o.lines[i].uom)).join(" + ")}</div><div class="t2">${d.pending ? L("Bill bana, dispatch baaki", "Billed, not dispatched") : fwhen(d.ts) + " · " + esc(d.vehicle || "") + " · " + esc(d.by)}</div></div><div class="btns">${inv ? `<button type="button" class="btn sm" data-a="invoice" data-id="${inv.id}">${inv.no}</button>` : `<button type="button" class="btn sm" data-a="bill" data-id="${d.id}">${L("Bill banao", "Make bill")}</button>`}${d.pending ? `<button type="button" class="btn sm pri" data-a="dispBill" data-id="${d.id}">${ic("truck", 14)} ${L("Dispatch karo", "Dispatch")}</button>` : ""}</div></div>`;
          })
          .join("")}</div></div>`
      : ""
  }
  ${!o.cancelled && !ds.length ? `<div class="fld" id="cxl" hidden><label for="cr">${L("Cancel kyun?", "Why cancel?")}</label><input id="cr" placeholder="${L("Jaise: party ne mana kiya", "e.g. party withdrew")}"><button type="button" class="btn danger sm" data-a="cancelOrderGo" data-id="${o.id}" style="justify-self:start">${L("Haan, cancel karo", "Yes, cancel")}</button></div>` : ""}`,
    `${!o.cancelled && !ds.length ? `<button type="button" class="btn danger" data-a="cancelOrder">${L("Order cancel", "Cancel order")}</button>` : ""}<span class="grow"></span>${canBill ? `<button type="button" class="btn pri" data-a="billOrder" data-id="${o.id}">${ic("receipt", 16)} ${L("Bill banao", "Make bill")}</button>` : ""}<button type="button" class="btn" data-a="close">${L("Theek hai", "Done")}</button>`,
    { wide: true },
  );
};

/* ---------- rate list page (replaces brochure products) ---------- */
AV.products = function () {
  const admin = (user() || {}).role === "admin";
  return `<section class="card"><div class="card-h"><div><h3>${L("Rate list", "Rate list")} · ${S.rl.length} item</h3><p>${L('Owner ki "All items rate list" (No. 1–35). Rate ₹ per bunch. Bunch/kg = 1 kg mein kitne bunch. Packing = ek packet mein kitne bunch.', 'The owner\'s "All items rate list" (No. 1–35). Rates are ₹ per bunch. Bunch/kg = bunches per kg. Packing = bunches per packet.')}</p></div>${admin ? `<button type="button" class="btn sm" data-a="bpfEdit">${ic("edit", 14)} 1 frame = ${S.bpf} bunch</button>` : ""}</div>
   <div class="tw"><table><thead><tr><th>No</th><th>Item</th><th class="r">Bunch / kg</th><th class="r">Single ₹</th><th class="r">Double ₹</th><th class="r">Packing</th><th></th></tr></thead><tbody>${S.rl.map((r) => `<tr><td>${r.no}</td><td><b>${esc(rlName(r))}</b><div class="psub">${rlShape(r)}${r.note ? " · " + esc(r.note) : ""}</div></td><td class="r">${r.bpk ? nf(r.bpk, 2) : "–"}</td><td class="r">${r.s ? nf(r.s, 2) : "–"}</td><td class="r">${r.d ? nf(r.d, 2) : "–"}</td><td class="r">${r.pack ? nf(r.pack) + " bunch" : "–"}</td><td>${admin ? `<button type="button" class="btn sm" data-a="rlEdit" data-id="${r.no}">${ic("edit", 14)} ${L("Badlo", "Edit")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>
   <p class="psub">${L('"–" matlab abhi tay nahi (WIP ya ??????). Double ₹ khaali = double coating nahi bikta. Rate badalne se sirf naye order par asar.', '"–" means not set yet (WIP or ??????). Empty Double ₹ = not sold with double coating. Rate changes apply to new orders only.')}</p></section>
   <section class="card"><div class="card-h"><div><h3>${L("Rang ki list", "Colour lists")}</h3><p>${L("Coating entry aur order mein grade ke hisaab se yahi rang dikhte hain. Naya rang wahin se bhi jod sakte ho.", "Coating entries and orders show these colours by grade. New colours can also be added there.")}</p></div>${admin ? `<button type="button" class="btn sm pri" data-a="colourNew">${ic("plus", 14)} ${L("Naya rang", "New colour")}</button>` : ""}</div>
   ${GRADES.map(
     (g) =>
       `<div class="eyebrow">${g} · ${g === "SR" ? "Shalimar" : "Treemurti"} · ${cols(g).length}</div><div class="chips">${cols(
         g,
       )
         .map(
           (c) => `<span class="chip" style="cursor:default">${esc(c)}</span>`,
         )
         .join("")}</div>`,
   ).join("")}</section>
   ${
     S.fp.length
       ? `<section class="card"><div class="card-h"><h3>${L("Bane hue product", "Products in use")} · ${S.fp.length}</h3></div><div class="tw"><table><thead><tr><th>Product</th><th>Line</th><th class="r">Rate</th><th class="r">${L("Taiyaar", "Ready")}</th></tr></thead><tbody>${S.fp
           .map((f) => {
             const p = PM[f.id];
             return p
               ? `<tr><td>${itemCell("fin", p.id)}</td><td>${lineChip(p.unit)}</td><td class="r">₹${nf(S.prices[p.id].bunch, 2)}</td><td class="r"><b>${nf(qty("FIN:" + p.unit, p.id, "bunch"))}</b> bunch</td></tr>`
               : "";
           })
           .join("")}</tbody></table></div></section>`
       : ""
   }`;
};
ACT.product = (el) => {
  const p = PM[el.dataset.id];
  if (p) ACT.rlEdit({ dataset: { id: p.it } });
};
ACT.rlEdit = (el) => {
  const r = rlItem(el.dataset.id);
  openModal(
    `${r.no}. ${esc(rlName(r))}`,
    L("Rate list badlo", "Edit rate list"),
    `<div class="row2"><div class="fld"><label for="rb1">Bunch / kg</label><input id="rb1" name="bpk" type="number" inputmode="decimal" min="0" step="0.01" value="${r.bpk || ""}"></div><div class="fld"><label for="rp1">Packing (bunch / packet)</label><input id="rp1" name="pack" type="number" inputmode="numeric" min="0" step="1" value="${r.pack || ""}"></div></div>
   <div class="row2"><div class="fld"><label for="rs1">Single ₹ / bunch</label><input id="rs1" name="s" type="number" inputmode="decimal" min="0" step="0.1" value="${r.s || ""}"></div><div class="fld"><label for="rd1">Double ₹ / bunch</label><input id="rd1" name="d" type="number" inputmode="decimal" min="0" step="0.1" value="${r.d || ""}"><span class="hint">${L("Khaali = double nahi bikta", "Blank = no double coating")}</span></div></div>
   <div class="fld"><label for="rn1">Note</label><input id="rn1" name="note" value="${esc(r.note || "")}"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "rlEdit", id: r.no },
  );
};
FORMS.rlEdit = (f) => {
  const r = rlItem(f.dataset.id);
  Object.assign(r, {
    bpk: +f.bpk.value || null,
    pack: Math.round(+f.pack.value || 0),
    s: +f.s.value || 0,
    d: +f.d.value || 0,
    note: f.note.value.trim(),
  });
  regAll();
  logA(
    `Rate list badli: ${r.no}. ${rlName(r)}`,
    `Rate list updated: ${r.no}. ${rlName(r)}`,
  );
  closeModal();
  render();
  toast(
    L(
      "Rate save. Sirf naye order par lagega.",
      "Rate saved. Applies to new orders only.",
    ),
  );
};
ACT.bpfEdit = () =>
  openModal(
    L("Frame ka hisaab", "Frame size"),
    L(
      "Ek frame mein kitne bunch aate hain",
      "How many bunches fit on one frame",
    ),
    `<div class="fld"><label for="bpf">1 frame = ? bunch</label><input id="bpf" name="bpf" class="big-in" type="number" inputmode="numeric" min="1" step="1" value="${S.bpf}"><span class="hint">${L("Owner se poochh ke sahi number daalo. Abhi sample 10 hai.", "Confirm the real number with the owner. The sample is 10.")}</span></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "bpf" },
  );
FORMS.bpf = (f) => {
  const v = Math.round(+f.bpf.value || 0);
  if (!(v > 0)) {
    f.bpf.focus();
    return;
  }
  S.bpf = v;
  logA(`1 frame = ${v} bunch`, `1 frame = ${v} bunches`);
  closeModal();
  render();
  toast(L("Save ho gaya.", "Saved."));
};
ACT.colourNew = () =>
  openModal(
    L("Naya rang", "New colour"),
    L("Kis grade ka rang hai", "Which grade it belongs to"),
    `<div class="fld"><span class="lb">Grade</span><div class="radios">${GRADES.map((g, i) => `<label><input type="radio" name="grade" value="${g}" ${i ? "" : "checked"}>${g}</label>`).join("")}</div></div><div class="fld"><label for="ncn">${L("Rang ka naam", "Colour name")}</label><input id="ncn" name="name" required placeholder="Golden"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("plus", 16)} ${L("Jodo", "Add")}</button>`,
    { form: "colourNew" },
  );
FORMS.colourNew = (f) => {
  const c = addColour(
    f.querySelector("[name=grade]:checked").value,
    f.name.value,
  );
  if (!c) {
    f.name.focus();
    return;
  }
  closeModal();
  render();
  toast(L(`${c} jud gaya.`, `${c} added.`));
};

/* ---------- add stock: ready goods from the rate list ---------- */
const _stkItemsV9 = stkItems;
stkItems = function (st, u) {
  if (st !== "fin") return _stkItemsV9(st, u);
  return [
    ...PRODUCTS.filter((p) => p.unit === u).map((p) => [
      p.id,
      pname(p) + " · " + psub(p),
      "bunch",
    ]),
    [
      "__new",
      "+ " +
        L(
          "Naya product (item, rang, coating)",
          "New product (item, colour, coating)",
        ),
      "bunch",
    ],
  ];
};
const _lasV9 = LIVE.addStock;
LIVE.addStock = (f) => {
  _lasV9(f);
  let box = document.getElementById("fnew");
  const on = f.item.value === "__new";
  if (on && !box) {
    f.item
      .closest(".fld")
      .insertAdjacentHTML(
        "afterend",
        `<div id="fnew" style="display:grid;gap:10px"><div class="row2"><div class="fld"><label for="fni">Item (rate list)</label><select id="fni" name="fn_it">${itemOpts(3)}</select></div><div class="fld"><label for="fng">Grade</label><select id="fng" name="fn_gr">${GRADES.map((g) => `<option>${g}</option>`).join("")}</select></div></div><div class="row2"><div class="fld"><label for="fnc">${L("Rang", "Colour")}</label><select id="fnc" name="fn_cl">${colourOpts("SR", "Off White")}</select><input name="fn_nc" placeholder="${L("Naye rang ka naam", "New colour name")}" hidden></div><div class="fld"><label for="fnco">Coating</label><select id="fnco" name="fn_co"><option value="S">Single</option><option value="D">Double</option></select></div></div></div>`,
      );
    box = document.getElementById("fnew");
    box.dataset.g = "SR";
  }
  if (box) {
    box.hidden = !on;
    if (on) {
      const g = f.fn_gr.value;
      if (box.dataset.g !== g) {
        box.dataset.g = g;
        f.fn_cl.innerHTML = colourOpts(g, cols(g)[0]);
      }
      f.fn_nc.hidden = f.fn_cl.value !== "__new";
      const r = rlItem(f.fn_it.value);
      f.fn_co.querySelector("[value=D]").disabled = !(r && r.d > 0);
      if (!(r && r.d > 0)) f.fn_co.value = "S";
    }
  }
};
const _stlV9 = stkTakeLine;
stkTakeLine = function (f) {
  if (
    f.item.value !== "__new" ||
    f.querySelector("[name=stage]:checked").value !== "fin"
  )
    return _stlV9(f);
  let q = Math.round(+f.qty.value || 0);
  if (!(q > 0)) return null;
  let c = f.fn_cl.value;
  if (c === "__new") {
    c = addColour(f.fn_gr.value, f.fn_nc.value);
    if (!c) return null;
  }
  const pid = getProduct(
    +f.fn_it.value,
    f.fn_gr.value,
    c,
    f.fn_co.value,
    f.loc.value,
  );
  return { loc: "FIN:" + f.loc.value, item: pid, uom: "bunch", qty: q };
};

/* ---------- home, nav, alerts ---------- */
const _ahV9 = AV.home;
AV.home = function (u) {
  const h = _ahV9(u);
  if (!u || u.role !== "admin") return h;
  const k = h.indexOf('<div class="kpis">');
  return k < 0 ? liveWork() + h : h.slice(0, k) + liveWork() + h.slice(k);
};
const _navV9 = navItems;
navItems = function (u) {
  const n = _navV9(u);
  const p = n.find((x) => x.id === "products");
  if (p) p.l = L("Rate list", "Rate list");
  const o = n.find((x) => x.id === "orders");
  if (o) o.b = (o.b || 0) + pendBills().length;
  return n;
};
const _gaV9 = getAlerts;
getAlerts = function () {
  const A = _gaV9();
  const pb = pendBills().length;
  if (pb)
    A.unshift([
      "warn",
      "truck",
      L(
        `${pb} bill ban gaye, dispatch baaki`,
        `${pb} ${pb > 1 ? "bills" : "bill"} made, not dispatched`,
      ),
      "dispatch",
    ]);
  const cqN = S.thr.filter(
    (l) =>
      l.status === "cq" &&
      l.bunch > 0 &&
      !S.tasks.some(
        (t) => t.kind === "coat" && t.status === "open" && t.line === l.line,
      ),
  ).length;
  if (cqN)
    A.push([
      "info",
      "list",
      L(
        `${cqN} lot coating mein hai par koi coating task nahi`,
        `${cqN} ${cqN > 1 ? "lots are" : "lot is"} in coating with no coating task`,
      ),
      "tasks",
    ]);
  const sh = S.orders.filter(
    (o) =>
      !o.cancelled &&
      o.lines.some((l, i) => shortOf(o, i) > 0 && !lineTask(o, i)),
  ).length;
  if (sh)
    A.push([
      "warn",
      "receipt",
      L(
        `${sh} order ke liye maal kam: coating task do`,
        `${sh} ${sh > 1 ? "orders" : "order"} short of goods: assign a coating task`,
      ),
      "orders",
    ]);
  return A;
};
const _quickV9 = ACT.quick;
ACT.quick = (el) => {
  if (el.dataset.q === "ctask") return coatTaskModal();
  _quickV9(el);
};

/* ---------- guide ---------- */
UCS.push({
  id: "UC-25",
  r: ["admin"],
  t: [
    "Coating task dena (Pearl / Metalizing)",
    "Assign a coating task (Pearl / Metalizing)",
  ],
  k: [
    "Threaded maal coating mein jaane ke baad",
    "After threaded goods move to coating",
  ],
  s: [
    ['Tasks → "Coating task"', 'Tasks → "Coating task"'],
    [
      "Machine (P1 Salman, P2, MZ1 Hamidur), lot, item, grade, rang, single/double",
      "Machine (P1 Salman, P2, MZ1 Hamidur), lot, item, grade, colour, single/double",
    ],
    ['Kitne frame → "Task do"', 'How many frames → "Assign task"'],
  ],
});
UCS.push({
  id: "UC-26",
  r: ["staff"],
  t: ["Task chun ke kaam shuru karna", "Pick a task and start work"],
  k: ["Har shift ki shuruaat mein", "At the start of each shift"],
  s: [
    ['Home → "Mere task"', 'Home → "My tasks"'],
    [
      'Jis task par kaam ho, "Yeh kaam shuru karo"',
      'On the task you are doing, "Start this task"',
    ],
    [
      'Admin ko "kaun kya kar raha" mein dikhta hai',
      'The Admin sees it under "Who is working on what"',
    ],
  ],
});
UCS.push({
  id: "UC-27",
  r: ["staff"],
  t: ["Coating entry frames mein", "Coating entry in frames"],
  k: ["Coating + packing ke baad", "After coating + packing"],
  s: [
    ['"Entry Daalo" → task chuno', '"Add entry" → pick the task'],
    [
      "Lot ka grade (SR/TR) apne aap; usi grade ke rang dikhenge, naya rang bhi jod sakte ho",
      "The lot's grade (SR/TR) fills in; colours for that grade show, and you can add a new one",
    ],
    [
      "Single/Double, frames liye, frames pack, reject",
      "Single/Double, frames taken, frames packed, rejects",
    ],
  ],
});
UCS.push({
  id: "UC-28",
  r: ["admin"],
  t: ["Order se bill aur dispatch", "Order to bill to dispatch"],
  k: ["Party ka order aaye", "When a party orders"],
  s: [
    [
      'Orders → "Naya order": item, grade, rang, single/double, packet',
      'Orders → "New order": item, grade, colour, single/double, packets',
    ],
    [
      'Maal kam ho toh "Coating task do", taiyaar ho toh "Bill banao" (packet × rate)',
      'If short, "Assign coating task"; if ready, "Make bill" (packets × rate)',
    ],
    [
      'Gaadi jaate hi "Dispatch karo" → stock se minus, record bill ke saath',
      'When the vehicle leaves, "Dispatch" → stock reduced, record kept with the bill',
    ],
  ],
});
if (typeof UCIL === "object") {
  UCIL["UC-25"] = "task";
  UCIL["UC-26"] = "task";
  UCIL["UC-27"] = "coat";
  UCIL["UC-28"] = "dispatch";
}

/* ---------- Hindi (Devanagari) ---------- */
const DV9 = (() => {
  const m = {};
  `ya:या hi:ही user:यूज़र line:लाइन raste:रास्ते limit:लिमिट likha:लिखा wage:मज़दूरी vivran:विवरण teeno:तीनों users:यूज़र manager:मैनेजर work:काम physical:फ़िज़िकल saari:सारी optional:ऑप्शनल wahi:वही screen:स्क्रीन step:स्टेप lene:लेने niyam:नियम roles:रोल zimmedari:ज़िम्मेदारी rakhta:रखता sticker:स्टिकर sign:साइन good:गुड wahan:वहाँ uska:उसका turant:तुरंत thi:थी reason:कारण uske:उसके tha:था mana:मना rahenge:रहेंगे update:अपडेट yaad:याद role:रोल set:सेट kahani:कहानी neeche:नीचे jawabdeh:जवाबदेह screens:स्क्रीन leta:लेता lautata:लौटाता reminder:रिमाइंडर peela:पीला shart:शर्त worker:वर्कर maksad:मकसद pirona:पिरोना taraf:तरफ़ maaf:माफ़ jaan:जान boojh:बूझ dikhaya:दिखाया chhoda:छोड़ा maana:माना pichhli:पिछली mahina:महीना woh:वो pahunchne:पहुँचने pada:पड़ा poori:पूरी pichhle:पिछले nikle:निकले leke:लेके lal:लाल taaki:ताकि dikhe:दिखे kisne:किसने jinka:जिनका minute:मिनट sudharna:सुधारना lagaye:लगाए jabki:जबकि rukegi:रुकेगी rakhne:रखने zarurat:ज़रूरत chalaye:चलाए kaho:कहो milte:मिलते mitao:मिटाओ koshish:कोशिश bhoolne:भूलने saamne:सामने wo:वो sabke:सबके teen:तीन sunehre:सुनहरे nishaan:निशान pooche:पूछे sawal:सवाल nateeja:नतीजा us:उस pahunchoge:पहुँचोगे rakhte:रखते milti:मिलती roop:रूप khola:खोला judwao:जुड़वाओ pakki:पक्की saal:साल kata:कटा gine:गिने gina:गिना usmein:उसमें maujooda:मौजूदा pade:पड़े na:न uski:उसकी dikhegi:दिखेगी bharose:भरोसे purani:पुरानी jab:जब aata:आता badal:बदल rahega:रहेगा badalne:बदलने asar:असर dikhte:दिखते machines:मशीनें mark:मार्क aa:आ aadha:आधा aage:आगे aaj:आज aane:आने aao:आओ aap:आप aate:आते aaya:आया aaye:आए aayega:आएगा ab:अब abhi:अभी account:अकाउंट achha:अच्छा admin:एडमिन advance:एडवांस agle:अगले aksar:अक्सर alert:अलर्ट alerts:अलर्ट andaaza:अंदाज़ा andaazit:अंदाज़ित andar:अंदर ank:अंक apna:अपना apne:अपने apni:अपनी app:ऐप approval:अप्रूवल approvals:अप्रूवल approve:अप्रूव approved:अप्रूव्ड asli:असली aur:और baad:बाद baaki:बाकी baar:बार baat:बात bacha:बचा badalta:बदलता bade:बड़े badh:बढ़ badho:बढ़ो badlav:बदलाव badlega:बदलेगा badlegi:बदलेगी badlenge:बदलेंगे badlo:बदलो badli:बदली bags:बैग bahar:बाहर ban:बन bana:बना banana:बनाना banao:बनाओ banayega:बनाएगा band:बंद bane:बने banenge:बनेंगे banke:बनके banta:बनता barabar:बराबर batao:बताओ bataya:बताया bazaar:बाज़ार bead:बीड beads:बीड्स behtar:बेहतर bhar:भर bharega:भरेगा bharna:भरना bharo:भरो bharte:भरते bhej:भेज bheja:भेजा bhejna:भेजना bhejne:भेजने bhejo:भेजो bhejoge:भेजोगे bhi:भी bhool:भूल bika:बिका bikta:बिकता bikri:बिक्री bill:बिल bina:बिना bolo:बोलो bori:बोरी bunch:बंच button:बटन cancel:कैंसल chahiye:चाहिए chal:चल chala:चला chali:चली challan:चालान chalu:चालू check:चेक cheez:चीज़ chhodo:छोड़ो chhoot:छूट chipkao:चिपकाओ chuka:चुका chuki:चुकी chun:चुन chunega:चुनेगा chunenge:चुनेंगे chunna:चुनना chuno:चुनो chunoge:चुनोगे coat:कोट coated:कोटेड coating:कोटिंग confirm:कन्फ़र्म copy:कॉपी cost:लागत credit:क्रेडिट daala:डाला daalo:डालो dabao:दबाओ data:डेटा de:दे dega:देगा dekh:देख dekho:देखो delivery:डिलीवरी demo:डेमो dena:देना detail:विवरण dhaaga:धागा dhaage:धागे dhyan:ध्यान di:दी diya:दिया dikhega:दिखेगा dikhenge:दिखेंगे dikhta:दिखता dikh:दिख din:दिन dispatch:डिस्पैच do:दो dobara:दोबारा dono:दोनों double:डबल doosra:दूसरा doosri:दूसरी ek:एक entries:एंट्री entry:एंट्री example:उदाहरण faisla:फ़ैसला farak:फ़र्क final:फ़ाइनल flow:फ़्लो frame:फ़्रेम frames:फ़्रेम gaadi:गाड़ी galat:गलत garam:गरम gaya:गया gaye:गए gayi:गई gin:गिन gino:गिनो ginti:गिनती godown:गोदाम grade:ग्रेड guide:गाइड haal:हाल haalat:हालत haan:हाँ hafte:हफ़्ते hai:है hain:हैं har:हर hatao:हटाओ hinglish:हिंदी hisaab:हिसाब ho:हो hoga:होगा hogi:होगी home:होम hone:होने hota:होता hote:होते hoti:होती hua:हुआ hue:हुए hui:हुई inka:इनका internet:इंटरनेट intezaar:इंतज़ार inward:इनवर्ड is:इस iske:इसके isliye:इसलिए item:आइटम itna:इतना jaane:जाने jaata:जाता jaate:जाते jaati:जाती jaayega:जाएगा jaayegi:जाएगी jagah:जगह jaise:जैसे jama:जमा jis:जिस jo:जो job:जॉब jod:जोड़ joda:जोड़ा jode:जोड़े jodo:जोड़ो jud:जुड़ judegi:जुड़ेगी judta:जुड़ता ka:का kaam:काम kab:कब kachcha:कच्चा kahan:कहाँ kaise:कैसे kal:कल kam:कम kamai:कमाई kar:कर karega:करेगा karegi:करेगी karein:करें karigar:कारीगर karke:करके karna:करना karne:करने karo:करो karta:करता karte:करते katega:कटेगा kaun:कौन kaunsa:कौनसा kaunse:कौनसे kaunsi:कौनसी ke:के keemat:कीमत kg:किलो khaali:खाली khaata:खाता khata:खाता kharcha:खर्चा khatam:ख़त्म kholo:खोलो khud:खुद khul:खुल khula:खुला khulegi:खुलेगी ki:की kilo:किलो kis:किस kisi:किसी kiske:किसके kitna:कितना kitne:कितने kiya:किया ko:को koi:कोई kuch:कुछ kul:कुल kya:क्या kyun:क्यों lagaya:लगाया lage:लगे lagega:लगेगा list:लिस्ट liye:लिए likho:लिखो lo:लो lock:लॉक login:लॉगिन logout:लॉगआउट loose:लूज़ lot:लॉट maal:माल maango:माँगो machine:मशीन madad:मदद mahine:महीने mangwao:मँगवाओ matlab:मतलब material:मटेरियल mein:में mere:मेरे meri:मेरी metalizing:मेटलाइज़िंग mila:मिला minus:माइनस mobile:मोबाइल moulded:मोल्डेड moulding:मोल्डिंग move:मूव naam:नाम nahi:नहीं namaste:नमस्ते naya:नया naye:नए nayi:नई ne:ने net:नेट number:नंबर offline:ऑफ़लाइन online:ऑनलाइन operator:ऑपरेटर order:ऑर्डर orders:ऑर्डर owner:मालिक paar:पार paas:पास pack:पैक packet:पैकेट packing:पैकिंग padega:पड़ेगा pahunch:पहुँच paid:पेड paisa:पैसा par:पर party:पार्टी pata:पता payment:पेमेंट pearl:पर्ल pehle:पहले penalty:पेनल्टी pending:पेंडिंग phir:फिर phone:फ़ोन photo:फ़ोटो pichhla:पिछला pin:पिन plain:प्लेन plan:प्लान poochh:पूछ print:प्रिंट product:प्रोडक्ट production:प्रोडक्शन products:प्रोडक्ट prototype:प्रोटोटाइप pura:पूरा purana:पुराना purane:पुराने pure:पूरे raha:रहा rahe:रहे rahi:रही rakam:रकम rakha:रखा rang:रंग rate:रेट raw:रॉ ready:रेडी record:रिकॉर्ड regrind:रीग्राइंड rehne:रहने reject:रिजेक्ट reorder:रीऑर्डर report:रिपोर्ट reports:रिपोर्ट reset:रीसेट rok:रोक roka:रोका roz:रोज़ ruki:रुकी saara:सारा saath:साथ sab:सब sabse:सबसे safar:सफ़र sahi:सही sakta:सकता sakte:सकते sample:सैंपल save:सेव se:से second:सेकंड seedha:सीधा setting:सेटिंग settings:सेटिंग्स shift:शिफ़्ट shuru:शुरू shuruaat:शुरुआत single:सिंगल sirf:सिर्फ़ slip:स्लिप staff:स्टाफ़ stage:स्टेज stock:स्टॉक sudhar:सुधार sudhari:सुधारी sudharo:सुधारो supplier:सप्लायर tab:तब taiyaar:तैयार tak:तक tap:टैप taraazu:तराज़ू target:टारगेट tarikh:तारीख task:टास्क tasks:टास्क tay:तय team:टीम theek:ठीक threaded:थ्रेडेड threading:थ्रेडिंग toh:तो toul:तौल type:टाइप unit:यूनिट units:यूनिट upar:ऊपर wahin:वहीं wala:वाला wale:वाले wali:वाली wapas:वापस wastage:वेस्टेज waste:वेस्ट wazan:वज़न whatsapp:व्हाट्सऐप yahan:यहाँ yahi:यही yahin:यहीं yeh:यह yield:यील्ड zero:ज़ीरो zyada:ज़्यादा record:रिकॉर्ड khaata:खाता approvals:अप्रूवल rehne:रहने dispatched:डिस्पैच billed:बिल`
    .split(/\s+/)
    .forEach((p) => {
      const i = p.indexOf(":");
      if (i > 0) m[p.slice(0, i)] = p.slice(i + 1);
    });
  return m;
})();
const toDv = (s) => s.replace(/[A-Za-z]+/g, (w) => DV9[w.toLowerCase()] || w);
function dvWalk(root) {
  if (!S || !S.deva || S.lang === "en" || !root) return;
  if (root.nodeType === 3) {
    const v = toDv(root.nodeValue);
    if (v !== root.nodeValue) root.nodeValue = v;
    return;
  }
  if (root.nodeType !== 1) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentElement;
      if (
        !p ||
        /^(SCRIPT|STYLE|TEXTAREA|TITLE)$/.test(p.tagName) ||
        (p.tagName === "OPTION" && !p.hasAttribute("value")) ||
        p.closest('[translate="no"],.num,code')
      )
        return NodeFilter.FILTER_REJECT;
      return /[A-Za-z]/.test(n.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });
  const ns = [];
  while (tw.nextNode()) ns.push(tw.currentNode);
  ns.forEach((n) => {
    const v = toDv(n.nodeValue);
    if (v !== n.nodeValue) n.nodeValue = v;
  });
  root.querySelectorAll("[placeholder]").forEach((e) => {
    const v = toDv(e.placeholder);
    if (v !== e.placeholder) e.placeholder = v;
  });
}
new MutationObserver((ms) => {
  if (!S || !S.deva || S.lang === "en") return;
  ms.forEach((m) => {
    if (m.type === "characterData") dvWalk(m.target);
    else m.addedNodes.forEach(dvWalk);
  });
}).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
document.head.insertAdjacentHTML(
  "beforeend",
  '<style>html[lang="hi"] :is(h1,h2,h3,.hero h2,.lab,.val){font-family:"Poppins",system-ui,sans-serif}</style>',
);
ACT.toggleLang = () => {
  if (S.lang !== "en" && !S.deva) S.deva = true;
  else if (S.deva) {
    S.deva = false;
    S.lang = "en";
  } else S.lang = "hi";
  closeModal();
  render();
};
const _rV9 = render;
render = function () {
  _rV9();
  if (S.deva && S.lang !== "en") {
    document.documentElement.lang = "hi";
    dvWalk(document.getElementById("app"));
  }
};
