"use strict";
/* ================= v8: new production flow =================
   Raw material (by line + type) -> Task -> Moulding entry (good + waste) -> Admin approve
   -> Karigar threading -> threaded bunches back -> Move to Pearl / Metalizing coating
   -> Coating + packing entry (staff P1/P2/MZ1) -> Admin final approval -> Ready to dispatch */
const LINE = { P: "Pearl", Z: "Metalizing" };
const RM_TYPES = ["Semi", "Super", "Crylo", "SL", "PS", "DB"];
const SIZES = ["3MM", "4MM", "5MM", "6MM", "8MM", "9MM", "10MM", "11MM"],
  GRADES = ["SR", "TR"];
const lineChip = (l) =>
  `<span class="uchip ${UNITS[l].cls}">${LINE[l]} line</span>`;
const SAMPLE_RMS = [
  ["GPPS Semi", "P", "Semi", 500, 112],
  ["GPPS Super", "P", "Super", 400, 118],
  ["GPPS Crylo", "P", "Crylo", 300, 126],
  ["GPPS Super (metal grade)", "Z", "Super", 200, 120],
  ["GPPS SL", "Z", "SL", 200, 122],
  ["GPPS PS", "Z", "PS", 200, 122],
  ["GPPS DB", "Z", "DB", 200, 124],
];
const uomU = (u) => (u === "M" ? "kg" : "bunch");
function eq(e, v) {
  return fq(v, e && e.uom === "bunch" ? "bunch" : "kg");
}
const uq = (v) => fq(v, uomU((user() || {}).unit || "M"));
const rmOf = (id) => S.rms.find((r) => r.id === id);
const taskKey = (t) => [t.size, t.shape, t.type, t.grade].join("|");
const keysAt = (loc) => [
  ...new Set(
    Object.keys(S.stock)
      .filter((k) => k.startsWith(loc + "|") && S.stock[k] > 0.0001)
      .map((k) => k.slice(loc.length + 1).replace(/\|(kg|bunch)$/, "")),
  ),
];
function jobName(j) {
  return j.key
    ? plainName(j.key) + (j.product ? " → " + PM[j.product].color : "")
    : pname(PM[j.product]);
}

function syncRaw() {
  const cons = RAW.filter((r) => !r.rm && !/^g[A-Z]/.test(r.id));
  const rms = (S.rms || []).map((r) => ({
    id: r.id,
    unit: "M",
    n: `${r.n} · ${r.type} · ${LINE[r.line]}`,
    uom: "kg",
    re: r.re,
    rm: true,
    line: r.line,
    type: r.type,
  }));
  RAW.splice(0, RAW.length, ...rms, ...cons);
  Object.keys(RM).forEach((k) => delete RM[k]);
  RAW.forEach((r) => (RM[r.id] = r));
  (S.rms || []).forEach((r) => {
    COST.raw[r.id] = r.cost || 0;
  });
}
function initV8() {
  if (S.v8) return;
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
  });
  Object.assign(S.seq, {
    order: 1001,
    gst: 1,
    kb: 1,
    lot: 1,
    jw: 1,
    task: 1,
    rm: SAMPLE_RMS.length + 1,
  });
  S.rms = SAMPLE_RMS.map(([n, line, type, re, cost], i) => ({
    id: "rm" + (i + 1),
    n,
    line,
    type,
    re,
    cost,
  }));
  S.tasks = [];
  S.thr = [];
  S.regrinds = [];
  S.threadKg = 0.02;
  S.pieceRate = Object.assign(
    { M: 1.5, P: 1, Z: 1.2 },
    S.pieceRate && S.pieceRate.v8 ? S.pieceRate : {},
  );
  S.pieceRate.v8 = 1;
  S.ui.stockTab = "fin";
  S.ui.prodTab = "pending";
  S.ui.coatTab = "thr";
  S.v8 = true;
  logA(
    "Naya flow shuru: stock zero, sample raw material list",
    "New flow started: stock at zero, sample raw material list",
    { n: "System", role: "admin" },
  );
}
const _seedV8 = seed;
seed = function () {
  _seedV8();
  initV8();
  syncRaw();
};

/* ---------- raw material master ---------- */
function rmNewModal() {
  openModal(
    L("Naya raw material", "New raw material"),
    L("Kis line ka hai aur kis type ka", "Which line and which type"),
    `<div class="fld"><label for="rn">${L("Naam", "Name")}</label><input id="rn" name="name" placeholder="GPPS Semi" required></div>
   <div class="fld"><span class="lb">Line</span><div class="radios"><label><input type="radio" name="line" value="P" checked>Pearl line</label><label><input type="radio" name="line" value="Z">Metalizing line</label></div></div>
   <div class="fld"><span class="lb">Type</span><div class="radios">${RM_TYPES.map((t, i) => `<label><input type="radio" name="type" value="${t}" ${i ? "" : "checked"}>${t}</label>`).join("")}<label><input type="radio" name="type" value="__new">${L("Naya type", "New type")}</label></div></div>
   <div class="fld" id="rtn" hidden><label for="rt">${L("Naye type ka naam", "New type name")}</label><input id="rt" name="newtype"></div>
   <div class="row2"><div class="fld"><label for="rr">Reorder level (kg)</label><input id="rr" name="re" type="number" inputmode="decimal" min="0" value="200"></div><div class="fld"><label for="rc">${L("Rate ₹/kg (pata ho toh)", "Rate ₹/kg (if known)")}</label><input id="rc" name="cost" type="number" inputmode="decimal" min="0"></div></div><p class="err" id="rerr2" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("plus", 16)} ${L("Raw material jodo", "Add raw material")}</button>`,
    { form: "rmNew", live: "rmNew" },
  );
}
LIVE.rmNew = (f) => {
  document.getElementById("rtn").hidden =
    f.querySelector("[name=type]:checked").value !== "__new";
};
FORMS.rmNew = (f) => {
  const n = f.name.value.trim();
  let ty = f.querySelector("[name=type]:checked").value;
  if (ty === "__new") ty = f.newtype.value.trim();
  if (!n || !ty) {
    document.getElementById("rerr2").textContent = L(
      "Naam aur type dono chahiye.",
      "Name and type are both needed.",
    );
    return;
  }
  if (!RM_TYPES.includes(ty)) RM_TYPES.push(ty);
  const r = {
    id: "rm" + S.seq.rm++,
    n,
    line: f.querySelector("[name=line]:checked").value,
    type: ty,
    re: +f.re.value || 0,
    cost: +f.cost.value || 0,
  };
  S.rms.push(r);
  syncRaw();
  logA(
    `Naya raw material: ${n} · ${ty} · ${LINE[r.line]} line`,
    `New raw material: ${n} · ${ty} · ${LINE[r.line]} line`,
  );
  closeModal();
  render();
  toast(
    L("Raw material list mein jud gaya.", "Added to the raw material list."),
  );
};
inwardModal = function () {
  const grp = (lab, list) =>
    list.length
      ? `<optgroup label="${lab}">${list.map((r) => `<option value="${r.id}">${esc(r.rm ? rmOf(r.id).n : r.n)} (${r.uom})</option>`).join("")}</optgroup>`
      : "";
  const opt =
    grp(
      "Pearl line",
      RAW.filter((r) => r.rm && r.line === "P"),
    ) +
    grp(
      "Metalizing line",
      RAW.filter((r) => r.rm && r.line === "Z"),
    ) +
    grp(
      L("Packing", "Packing"),
      RAW.filter((r) => !r.rm && r.unit === "M"),
    ) +
    grp(
      L("Pearl coating material", "Pearl coating materials"),
      RAW.filter((r) => r.unit === "P"),
    ) +
    grp(
      L("Metalizing coating material", "Metalizing coating materials"),
      RAW.filter((r) => r.unit === "Z"),
    );
  openModal(
    "Raw material inward",
    L(
      "Line aur type ke hisaab se material chuno",
      "Pick the material by line and type",
    ),
    `<div class="row2"><div class="fld"><label for="is">Supplier</label><select id="is" name="supplier">${SUPPLIERS.map((s) => `<option>${s}</option>`).join("")}</select></div><div class="fld"><label for="ib">Bill no.</label><input id="ib" name="bill" required placeholder="SP/2301"></div></div>
  <div class="row2"><div class="fld"><label for="im">Material</label><select id="im" name="mat">${opt}</select><button type="button" class="linkbtn" data-a="rmNew" style="justify-self:start;padding-left:0">+ ${L("List mein nahi? Naya raw material", "Not listed? New raw material")}</button></div><div class="fld"><label for="iq">${L("Kitna aaya", "Quantity")}</label><input id="iq" name="qty" type="number" inputmode="decimal" step="0.1" min="0" required></div></div>
  <div class="row2"><div class="fld"><label for="ir">${L("Rate ₹ (pata ho toh)", "Rate ₹ (if known)")}</label><input id="ir" name="rate" type="number" inputmode="decimal" step="0.01" min="0"></div><div class="fld"><label for="ip">${ic("camera", 14)} ${L("Bill ki photo", "Photo of the bill")}</label><input id="ip" name="photo" type="file" accept="image/*" capture="environment"></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "inward" },
  );
};

/* ---------- tasks ---------- */
const taskDone = (t) =>
  sum(
    S.entries.filter((e) => e.task === t.id && e.status !== "returned"),
    (e) => e.out,
  );
const taskApproved = (t) =>
  sum(
    S.entries.filter((e) => e.task === t.id && e.status === "approved"),
    (e) => e.out,
  );
const staffOn = (m) => {
  const u = S.users.find(
    (x) => x.role === "staff" && x.machine === m && x.active,
  );
  return u ? u.n : MSTAFF[m] || "Staff";
};
function taskTitle(t) {
  return plainName(taskKey(t));
}
function taskModal() {
  openModal(
    L("Naya task", "New task"),
    L("Staff ko moulding ka kaam do", "Assign moulding work to staff"),
    `<div class="fld"><span class="lb">Machine</span><div class="radios">${UNITS.M.machines.map((m, i) => `<label><input type="radio" name="machine" value="${m}" ${i ? "" : "checked"}>${m} · ${esc(staffOn(m))}</label>`).join("")}</div></div>
   <div class="fld"><span class="lb">Line</span><div class="radios"><label><input type="radio" name="line" value="P" checked>Pearl line</label><label><input type="radio" name="line" value="Z">Metalizing line</label></div></div>
   <div class="fld"><label for="trm">Raw material</label><select id="trm" name="rm"></select><span class="hint" id="trh"></span></div>
   <div class="row3"><div class="fld"><label for="tsz">Size</label><select id="tsz" name="size">${SIZES.map((s) => `<option ${s === "8MM" ? "selected" : ""}>${s}</option>`).join("")}</select></div><div class="fld"><label for="tsh">Shape</label><select id="tsh" name="shape">${SHAPES.map((s) => `<option>${s}</option>`).join("")}</select></div><div class="fld"><label for="tgr">Grade</label><select id="tgr" name="grade">${GRADES.map((g) => `<option>${g}</option>`).join("")}</select></div></div>
   <div class="fld"><label for="tpr">${L("Final product / rang", "Final product / colour")}</label><select id="tpr" name="product"></select><span class="hint">${L("Abhi chun sakte ho, ya khaali chhodo, coating par chunenge.", "Pick it now, or leave it open to choose at coating.")}</span></div>
   <div class="row2"><div class="fld"><label for="ttg">${L("Target (kg achha maal)", "Target (good kg)")}</label><input id="ttg" name="target" type="number" inputmode="decimal" min="0" step="1" required></div><div class="fld"><label for="tno">Note</label><input id="tno" name="note" placeholder="${L("Jaise: 2 din mein", "e.g. within 2 days")}"></div></div>
   <div class="sumbox" id="tsum"></div><p class="err" id="terr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("send", 16)} ${L("Task do", "Assign task")}</button>`,
    { form: "task", live: "task", wide: true, nofocus: true },
  );
}
LIVE.task = (f) => {
  const line = f.querySelector("[name=line]:checked").value;
  if (f.dataset.l !== line) {
    f.dataset.l = line;
    f.rm.innerHTML =
      S.rms
        .filter((r) => r.line === line)
        .map((r) => `<option value="${r.id}">${esc(r.n)}</option>`)
        .join("") ||
      `<option value="">${L("Is line ka raw material nahi", "No raw material for this line")}</option>`;
  }
  const r = rmOf(f.rm.value),
    type = r ? r.type : "",
    key = [f.size.value, f.shape.value, type, f.grade.value].join("|");
  document.getElementById("trh").textContent = r
    ? `Type: ${type} · ${L("Stock", "Stock")}: ${kg(qty("RAW:M", r.id, "kg"))}`
    : "";
  const k2 = key + line;
  if (f.dataset.k !== k2) {
    f.dataset.k = k2;
    const cur = f.product.value,
      ps = PRODUCTS.filter((p) => p.unit === line && plainKey(p) === key);
    f.product.innerHTML =
      `<option value="">${L("Abhi nahi, coating par chunenge", "Not now, choose at coating")}</option>` +
      ps
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === cur ? "selected" : ""}>${esc(pname(p))} · ${p.grade}</option>`,
        )
        .join("");
  }
  const tg = +f.target.value || 0,
    st = r ? qty("RAW:M", r.id, "kg") : 0;
  document.getElementById("tsum").innerHTML =
    `<div><span>Bead</span><b>${esc(plainName(key))}</b></div><div><span>Line</span><b>${LINE[line]}</b></div><div><span>${L("Rang", "Colour")}</span><b>${f.product.value ? esc(PM[f.product.value].color) : L("Coating par", "At coating")}</b></div>${tg && r && st < tg * 1.05 ? `<div style="color:var(--warn)"><span>${L("Raw material kam ho sakta hai", "Raw material may run short")}</span><b>${kg(st)}</b></div>` : ""}`;
};
FORMS.task = (f) => {
  const r = rmOf(f.rm.value),
    tg = +f.target.value;
  if (!r) {
    document.getElementById("terr").textContent = L(
      "Pehle is line ka raw material jodo.",
      "Add a raw material for this line first.",
    );
    return;
  }
  if (!(tg > 0)) {
    f.target.focus();
    return;
  }
  const t = {
    id: nid(),
    no: S.seq.task++,
    machine: f.querySelector("[name=machine]:checked").value,
    line: r.line,
    rm: r.id,
    type: r.type,
    size: f.size.value,
    shape: f.shape.value,
    grade: f.grade.value,
    product: f.product.value || null,
    target: tg,
    note: f.note.value.trim(),
    ts: Date.now(),
    status: "open",
    by: user().n,
  };
  t.staff = staffOn(t.machine);
  S.tasks.push(t);
  logA(
    `Task #${t.no}: ${t.machine} · ${taskTitle(t)} · ${kg(tg)}`,
    `Task #${t.no}: ${t.machine} · ${taskTitle(t)} · ${kg(tg)}`,
  );
  closeModal();
  S.view = "tasks";
  render();
  toast(
    L(
      `Task #${t.no} ${t.staff} ko de diya.`,
      `Task #${t.no} assigned to ${t.staff}.`,
    ),
  );
};
function taskCard(t, admin) {
  const d = taskDone(t),
    a = taskApproved(t),
    f = t.target ? Math.min(1, d / t.target) : 0,
    r = rmOf(t.rm);
  return `<div class="item" style="flex-wrap:wrap;align-items:flex-start">${pthumb()}<div class="grow" style="min-width:200px"><div class="toolbar"><div class="t1">#${t.no} · ${esc(taskTitle(t))}</div>${t.status === "open" ? `<span class="pill info">${L("Chalu", "Open")}</span>` : `<span class="pill mute">${L("Pura", "Done")}</span>`}</div>
   <div class="t2">${t.machine} · ${esc(t.staff)} · ${lineChip(t.line)} · ${esc(r ? r.n : "")}${r && r.n === t.type ? "" : " (" + t.type + ")"}</div>
   <div class="t2">${L("Rang", "Colour")}: <b style="color:var(--ink)">${t.product ? esc(PM[t.product].color) : L("coating par", "at coating")}</b> · ${fdate(t.ts)}${t.note ? " · " + esc(t.note) : ""}</div>
   <div class="yield" style="margin-top:6px">${beads(f, 12, "var(--u-m)")}<b>${kg(d)}</b><span class="muted">/ ${kg(t.target)} · ${L("approved", "approved")} ${kg(a)}</span></div></div>
   ${admin && t.status === "open" ? `<button type="button" class="btn sm" data-a="taskClose" data-id="${t.id}">${ic("check", 14)} ${L("Pura karo", "Mark done")}</button>` : ""}</div>`;
}
AV.tasks = function () {
  const open = S.tasks
      .filter((t) => t.status === "open")
      .sort((a, b) => b.ts - a.ts),
    done = S.tasks
      .filter((t) => t.status !== "open")
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 12);
  return `<section class="card"><div class="card-h"><div><h3>${L("Chalu task", "Open tasks")} · ${open.length}</h3><p>${L("Raw material inward ke baad staff ko kaam do: kaunsi machine, kaunsa bead, kaunsa raw material, kitna kg. Rang abhi ya coating par.", "After inward, give staff the work: machine, bead, raw material, kg. Colour now or at coating.")}</p></div></div>
   <div class="list">${open.map((t) => taskCard(t, true)).join("") || `<div class="empty">${ic("list")}${L('Koi chalu task nahi. "+ Naya task" se shuru karo.', 'No open tasks. Start with "+ New task".')}</div>`}</div></section>
   ${done.length ? `<section class="card"><div class="card-h"><h3>${L("Pure hue", "Completed")}</h3></div><div class="list">${done.map((t) => taskCard(t, false)).join("")}</div></section>` : ""}`;
};
ACT.taskNew = () => taskModal();
ACT.taskClose = (el) => {
  const t = S.tasks.find((x) => x.id === el.dataset.id);
  t.status = "done";
  t.doneTs = Date.now();
  logA(`Task #${t.no} pura`, `Task #${t.no} completed`);
  render();
  toast(L("Task pura mark ho gaya.", "Task marked done."));
};
ACT.rmNew = () => rmNewModal();

/* ---------- staff entries ---------- */
entryModal = function (id) {
  const u = user(),
    e = id ? S.entries.find((x) => x.id === id) : null;
  if (u.unit === "M") {
    const ts = S.tasks.filter(
      (t) =>
        t.machine === u.machine &&
        (t.status === "open" || (e && e.task === t.id)),
    );
    if (!ts.length)
      return openModal(
        L("Entry Daalo", "Add entry"),
        u.machine,
        `<div class="empty">${ic("list")}${L("Admin ne abhi is machine ko koi task nahi diya. Admin se task maango.", "The Admin has not assigned a task to this machine yet. Ask the Admin.")}</div>`,
        `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "OK")}</button>`,
      );
    const sel = e ? e.task : ts[0].id;
    openModal(
      e ? L("Entry sudharo", "Fix entry") : L("Entry Daalo", "Add entry"),
      `${u.machine} · Moulding · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
      `<div class="fld"><span class="lb">${L("Kaunsa task?", "Which task?")}</span><div class="pick plain" role="radiogroup">${ts.map((t) => `<label><input type="radio" name="task" value="${t.id}" ${t.id === sel ? "checked" : ""}><b>#${t.no} · ${esc(taskTitle(t))}</b><span class="psub">${esc(rmOf(t.rm).n)} · ${LINE[t.line]}</span><span class="psub">${kg(taskDone(t))} / ${kg(t.target)}</span></label>`).join("")}</div></div>
     <div class="row3"><div class="fld"><label for="f-in">${L("Raw material lagaya (kg)", "Raw material used (kg)")}</label><input id="f-in" name="input" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" value="${e ? e.input : ""}" required></div>
     <div class="fld"><label for="f-out">${L("Achha maal (kg)", "Good beads (kg)")}</label><input id="f-out" name="out" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" value="${e ? e.out : ""}" required></div>
     <div class="fld"><label for="f-rej">Waste (kg)</label><input id="f-rej" name="reject" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" value="${e ? e.reject : ""}"></div></div>
     <div class="yield" id="yl"></div><p class="err" id="ferr" role="alert"></p>
     <div class="fld"><label for="f-ph">${ic("camera", 14)} ${L("Taraazu ki photo (optional)", "Photo of the scale (optional)")}</label><input id="f-ph" name="photo" type="file" accept="image/*" capture="environment"></div>`,
      `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
      { form: "entry", live: "entry", id: id || "" },
    );
    return;
  }
  const lots = S.thr.filter(
    (l) =>
      l.status === "cq" &&
      l.line === u.unit &&
      (l.bunch > 0 || (e && e.lot === l.id)),
  );
  if (!lots.length)
    return openModal(
      L("Coating entry", "Coating entry"),
      u.machine,
      `<div class="empty">${ic("box")}${L('Abhi coating ke liye koi threaded maal nahi aaya. Admin "Move to coating" karega tab dikhega.', "No threaded bunches waiting for coating yet. They appear once the Admin moves them to coating.")}</div>`,
      `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "OK")}</button>`,
    );
  const sel = e ? e.lot : lots[0].id;
  openModal(
    e
      ? L("Entry sudharo", "Fix entry")
      : L("Coating + packing entry", "Coating + packing entry"),
    `${u.machine} · ${UNITS[u.unit].n}`,
    `<div class="fld"><span class="lb">${L("Kaunsa threaded maal?", "Which threaded lot?")}</span><div class="pick plain" role="radiogroup">${lots.map((l) => `<label><input type="radio" name="lot" value="${l.id}" ${l.id === sel ? "checked" : ""}><b>${esc(plainName(l.key))}</b><span class="psub">${nf(l.bunch)} bunch · ${kg(l.kg)}</span><span class="psub">${L("Rang", "Colour")}: ${l.product ? esc(PM[l.product].color) : L("chunna hai", "to choose")}</span></label>`).join("")}</div></div>
   <div class="fld"><label for="cprod">${L("Final product (rang)", "Final product (colour)")}</label><select id="cprod" name="cprod"></select></div>
   <div class="row3"><div class="fld"><label for="f-in">${L("Bunch liye", "Bunches taken")}</label><input id="f-in" name="input" class="big-in" type="number" inputmode="numeric" step="1" min="0" value="${e ? e.input : ""}" required></div>
   <div class="fld"><label for="f-out">${L("Coat + pack hue", "Coated + packed")}</label><input id="f-out" name="out" class="big-in" type="number" inputmode="numeric" step="1" min="0" value="${e ? e.out : ""}" required></div>
   <div class="fld"><label for="f-rej">${L("Reject bunch", "Rejected bunches")}</label><input id="f-rej" name="reject" class="big-in" type="number" inputmode="numeric" step="1" min="0" value="${e ? e.reject : ""}"></div></div>
   <div class="fld"><label for="f-pk">${L("Kitne packet bane (optional)", "Packets made (optional)")}</label><input id="f-pk" name="packets" type="number" inputmode="numeric" min="0" step="1" value="${e && e.packets ? e.packets : ""}"></div>
   <div class="yield" id="yl"></div><p class="err" id="ferr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "entry", live: "coatEntry", id: id || "" },
  );
  if (e) {
    const s = document.getElementById("cprod");
    if (s) s.value = e.product;
  }
};
LIVE.coatEntry = (f) => {
  const lot = S.thr.find(
    (x) => x.id === (f.querySelector("[name=lot]:checked") || {}).value,
  );
  if (!lot) return;
  if (f.dataset.lot !== lot.id) {
    f.dataset.lot = lot.id;
    const [sz, sh] = lot.key.split("|");
    let ps = lot.product
      ? [PM[lot.product]]
      : PRODUCTS.filter((p) => p.unit === lot.line && plainKey(p) === lot.key);
    if (!ps.length)
      ps = PRODUCTS.filter(
        (p) => p.unit === lot.line && p.size === sz && p.shape === sh,
      );
    if (!ps.length) ps = PRODUCTS.filter((p) => p.unit === lot.line);
    f.cprod.innerHTML = ps
      .map(
        (p) =>
          `<option value="${p.id}">${esc(pname(p))} · ${esc(psub(p))}</option>`,
      )
      .join("");
    f.cprod.disabled = !!lot.product;
  }
  const i = +f.input.value || 0,
    o = +f.out.value || 0,
    r = +f.reject.value || 0,
    y = i ? o / i : 0;
  document.getElementById("yl").innerHTML =
    i && o
      ? `${beads(y, 12, `var(${UNITS[lot.line].c})`, true)}<b>${nf(y * 100, 1)}%</b><span class="muted">${L("lot mein", "in lot")}: ${nf(lot.bunch)} bunch</span>`
      : `<span class="muted">${L("Lot mein", "In lot")}: ${nf(lot.bunch)} bunch · ${kg(lot.kg)}</span>`;
  document.getElementById("ferr").textContent =
    i > lot.bunch
      ? L(
          `Lot mein sirf ${nf(lot.bunch)} bunch hai.`,
          `Only ${nf(lot.bunch)} bunches in this lot.`,
        )
      : o + r > i
        ? L(
            "Pack + reject, liye hue bunch se zyada nahi ho sakte.",
            "Packed + rejected cannot exceed bunches taken.",
          )
        : "";
};
FORMS.entry = function (f) {
  const u = user(),
    id = f.dataset.id;
  let i = +f.input.value,
    o = +f.out.value,
    r = +f.reject.value || 0,
    extra;
  const err = (t) => {
    document.getElementById("ferr").textContent = t;
  };
  if (u.unit === "M") {
    const t = S.tasks.find(
      (x) => x.id === (f.querySelector("[name=task]:checked") || {}).value,
    );
    if (!t) return err(L("Task chuno.", "Pick a task."));
    if (!(i > 0) || !(o > 0))
      return err(
        L(
          "Raw material aur achha maal ka kg daalo.",
          "Enter raw material used and good kg.",
        ),
      );
    if (o + r > i + 0.05) {
      LIVE.entry(f);
      return;
    }
    extra = {
      task: t.id,
      product: taskKey(t),
      rm: t.rm,
      line: t.line,
      plan: t.product || null,
    };
  } else {
    const lot = S.thr.find(
        (x) => x.id === (f.querySelector("[name=lot]:checked") || {}).value,
      ),
      pid = f.cprod.value;
    i = Math.round(i);
    o = Math.round(o);
    r = Math.round(r);
    if (!lot || !pid)
      return err(L("Lot aur product chuno.", "Pick the lot and product."));
    if (!(i > 0) || !(o > 0))
      return err(
        L(
          "Bunch liye aur pack hue, dono daalo.",
          "Enter bunches taken and packed.",
        ),
      );
    if (i > lot.bunch || o + r > i) {
      LIVE.coatEntry(f);
      return;
    }
    extra = {
      kind: "coat",
      lot: lot.id,
      product: pid,
      line: lot.line,
      uom: "bunch",
      packets: Math.round(+f.packets.value || 0),
    };
  }
  if (id) {
    const e = S.entries.find((x) => x.id === id);
    Object.assign(e, extra, {
      input: i,
      out: o,
      reject: r,
      status: "pending",
      note: "",
    });
    logA(
      `${u.machine}: entry sudhari (${eq(e, o)})`,
      `${u.machine}: entry fixed (${eq(e, o)})`,
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
      reject: r,
      down: 0,
      status: "pending",
      hist: false,
      note: "",
    },
    extra,
  );
  e.lot = e.kind === "coat" ? e.lot : undefined;
  e.lotNo = newLot();
  if (e.kind !== "coat") e.lot = e.lotNo;
  if (S.online) {
    S.entries.push(e);
    logA(`${u.machine}: ${eq(e, o)} entry`, `${u.machine}: ${eq(e, o)} entry`);
    toast(
      L(
        "Entry save ho gayi. Admin approve karega.",
        "Entry saved. The Admin will approve it.",
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
const _slipV8 = slipModal;
slipModal = function (id) {
  const e = findEntry(id);
  if (!e) return;
  if (e.kind !== "coat") return _slipV8(id);
  openModal(
    L("Packing slip", "Packing slip"),
    `${e.lotNo} · 58 mm`,
    `<div class="thermal"><div class="tc"><b style="font-size:14px">MK PLASTICS</b><br>Beads Bazaar · Bhiwandi</div><div class="tc tt">COATING + PACKING</div><hr>
   <div class="tr"><span>Lot</span><b>${e.lotNo}</b></div><div class="tr"><span>${L("Tarikh", "Date")}</span><span>${new Date(e.ts).toLocaleDateString("en-IN")} ${ftime(e.ts)}</span></div><div class="tr"><span>Machine</span><span>${e.machine} · ${UNITS[e.unit].n}</span></div><div class="tr"><span>Operator</span><span>${esc(e.staff)}</span></div><hr>
   <div class="tl">${esc(pname(PM[e.product]))} · ${esc(psub(PM[e.product]))}</div><div class="tr"><span>${L("Bunch liye", "Taken")}</span><span>${nf(e.input)}</span></div><div class="tr tbig"><span>${L("Pack", "Packed")}</span><b>${nf(e.out)} bunch</b></div><div class="tr"><span>Reject</span><span>${nf(e.reject)}</span></div>${e.packets ? `<div class="tr"><span>${L("Packet", "Packets")}</span><span>${nf(e.packets)}</span></div>` : ""}<hr>
   <div class="tr"><span>${L("Kamai", "Earning")} @ ₹${S.pieceRate[e.unit]}/bunch</span><b>₹${nf(estEarn(e), 2)}</b></div><div class="tc tsm">${e.status === "approved" ? "APPROVED · READY" : L("Admin final approval ke baad ready", "Ready after the Admin's final approval")}</div>
   <div class="tqr">${qrSvg(JSON.stringify({ lot: e.lotNo, sku: e.product, bunch: e.out, op: e.staff, m: e.machine }), 112)}</div><div class="sig"><span>Operator</span><span>Admin</span></div></div>`,
    `<span class="grow">${L("Packet par chipkao", "Stick on the packet")}</span><button type="button" class="btn pri" data-a="fakePrint">${ic("print", 16)} Print</button>`,
  );
};
canApprove = function (e) {
  if (e.kind === "coat") {
    const l = S.thr.find((x) => x.id === e.lot);
    return !!l && l.bunch >= e.input;
  }
  if (e.rm) return qty("RAW:M", e.rm, "kg") >= e.input - 0.001;
  return false;
};
function approveNote(e) {
  if (e.kind === "coat") {
    const l = S.thr.find((x) => x.id === e.lot);
    return L(
      `Lot mein sirf ${nf(l ? l.bunch : 0)} bunch bacha hai.`,
      `Only ${nf(l ? l.bunch : 0)} bunches left in the lot.`,
    );
  }
  const r = rmOf(e.rm);
  return r
    ? L(
        `${r.n} sirf ${kg(qty("RAW:M", r.id, "kg"))} hai. Pehle inward karo.`,
        `Only ${kg(qty("RAW:M", r.id, "kg"))} of ${r.n} in stock. Record the inward first.`,
      )
    : L(
        "Purani entry, naye flow mein approve nahi hogi.",
        "Old entry; cannot be approved in the new flow.",
      );
}
ACT.approve = function (el) {
  const e = S.entries.find((x) => x.id === el.dataset.id);
  if (!e || !canApprove(e)) return;
  if (e.kind === "coat") {
    const l = S.thr.find((x) => x.id === e.lot),
      per = l.bunch ? l.kg / l.bunch : 0;
    l.kg = Math.max(0, r1(l.kg - per * e.input));
    l.bunch -= e.input;
    if (l.bunch <= 0) l.status = "done";
    move("FIN:" + e.line, e.product, "bunch", e.out);
    e.status = "approved";
    e.by = user().n;
    logA(
      `Final approval: ${nf(e.out)} bunch ${pname(PM[e.product])} ready`,
      `Final approval: ${nf(e.out)} bunches ${pname(PM[e.product])} ready`,
    );
    toast(
      L(
        `${nf(e.out)} bunch dispatch ke liye taiyaar.`,
        `${nf(e.out)} bunches ready to dispatch.`,
      ),
    );
  } else {
    const r = rmOf(e.rm);
    move("RAW:M", e.rm, "kg", -e.input);
    move("PLAIN:" + e.line, e.product, "kg", e.out);
    if (e.reject > 0) move("WASTE:M", r.type, "kg", e.reject);
    e.status = "approved";
    e.by = user().n;
    logA(
      `${e.machine}: ${kg(e.out)} moulded approve · ${kg(e.reject)} ${r.type} waste`,
      `${e.machine}: ${kg(e.out)} moulded approved · ${kg(e.reject)} ${r.type} waste`,
    );
    toast(
      L(
        `${kg(e.out)} moulded beads stock mein, ${kg(e.reject)} waste page par.`,
        `${kg(e.out)} moulded beads in stock, ${kg(e.reject)} on the Waste page.`,
      ),
    );
  }
  render();
};
entryItemName = (e) =>
  e.kind === "coat"
    ? pname(PM[e.product]) + " · " + psub(PM[e.product])
    : plainName(e.product) + (e.line ? " · " + LINE[e.line] : "");

/* ---------- waste + regrind ---------- */
AV.waste = function () {
  const types = [...new Set([...RM_TYPES, ...keysAt("WASTE:M")])],
    rows = types
      .map((t) => ({
        t,
        q: qty("WASTE:M", t, "kg"),
        m: sum(
          S.entries.filter(
            (e) =>
              e.rm &&
              e.status === "approved" &&
              e.ts >= month0() &&
              (rmOf(e.rm) || {}).type === t,
          ),
          (e) => e.reject,
        ),
        rg: sum(
          S.regrinds.filter((x) => x.type === t),
          (x) => x.kg,
        ),
      }))
      .filter((x) => x.q > 0 || x.m > 0 || x.rg > 0);
  const tot = sum(rows, (x) => x.q);
  return `<div class="kpis"><div class="kpi"><span>${L("Kul waste abhi", "Total waste now")}</span><b>${kg(tot)}</b></div><div class="kpi"><span>${L("Is mahine bana", "Made this month")}</span><b>${kg(sum(rows, (x) => x.m))}</b></div><div class="kpi"><span>${L("Regrind hua (kul)", "Reground (all time)")}</span><b>${kg(sum(S.regrinds, (x) => x.kg))}</b></div></div>
   <section class="card"><div class="card-h"><div><h3>${L("Type ke hisaab se waste", "Waste by type")}</h3><p>${L("Moulding entry approve hote hi waste yahan judta hai, raw material ke type ke hisaab se.", "Waste is added here when a moulding entry is approved, by raw material type.")}</p></div></div>
   ${rows.length ? `<div class="tw"><table><thead><tr><th>Type</th><th class="r">${L("Abhi stock", "In stock")}</th><th class="r">${L("Is mahine bana", "Made this month")}</th><th class="r">${L("Regrind hua", "Reground")}</th><th></th></tr></thead><tbody>${rows.map((x) => `<tr><td><b>${x.t} waste</b></td><td class="r"><b>${kg(x.q)}</b></td><td class="r">${kg(x.m)}</td><td class="r">${kg(x.rg)}</td><td>${x.q > 0 ? `<button type="button" class="btn sm" data-a="regrind" data-t="${x.t}">${ic("refresh", 14)} Regrind</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">${ic("check")}${L("Abhi koi waste nahi.", "No waste yet.")}</div>`}</section>
   ${
     S.regrinds.length
       ? `<section class="card"><div class="card-h"><h3>${L("Regrind record", "Regrind history")}</h3></div><div class="list">${S.regrinds
           .slice()
           .sort((a, b) => b.ts - a.ts)
           .map(
             (x) =>
               `<div class="item"><span class="ico-c ok">${ic("refresh", 16)}</span><div class="grow"><div class="t1">${kg(x.kg)} ${x.type} waste → ${esc(rmOf(x.rm) ? rmOf(x.rm).n : "")}</div><div class="t2">${esc(x.by)} · ${fwhen(x.ts)}</div></div></div>`,
           )
           .join("")}</div></section>`
       : ""
   }`;
};
function regrindModal(t) {
  const rms = S.rms.filter((r) => r.type === t),
    q = qty("WASTE:M", t, "kg");
  openModal(
    L(
      "Regrind: waste wapas raw material mein",
      "Regrind: waste back into raw material",
    ),
    `${t} waste · ${L("stock", "in stock")} ${kg(q)}`,
    rms.length
      ? `<div class="fld"><label for="rgr">${L("Kis raw material mein jode?", "Add to which raw material?")}</label><select id="rgr" name="rm">${rms.map((r) => `<option value="${r.id}">${esc(r.n)} · ${LINE[r.line]} line</option>`).join("")}</select><span class="hint">${L("Sirf same type (", "Same type only (")}${t})</span></div>
   <div class="fld"><label for="rgk">${L("Kitna (kg)", "How much (kg)")}</label><input id="rgk" name="kg" class="big-in" type="number" inputmode="decimal" min="0" step="0.1" value="${r1(q)}"></div>`
      : `<div class="empty">${L(`${t} type ka koi raw material list mein nahi. Pehle raw material jodo.`, `No raw material of type ${t}. Add one first.`)}</div>`,
    rms.length
      ? `${cancelBtn()}<button class="btn pri" type="submit">${ic("refresh", 16)} Regrind</button>`
      : `<button type="button" class="btn" data-a="close">OK</button>`,
    rms.length ? { form: "regrind", id: t } : {},
  );
}
ACT.regrind = (el) => regrindModal(el.dataset.t);
FORMS.regrind = (f) => {
  const t = f.dataset.id,
    v = +f.kg.value,
    q = qty("WASTE:M", t, "kg");
  if (!(v > 0) || v > q + 0.001) {
    f.kg.focus();
    return;
  }
  move("WASTE:M", t, "kg", -v);
  move("RAW:M", f.rm.value, "kg", v);
  S.regrinds.push({
    id: nid(),
    type: t,
    rm: f.rm.value,
    kg: v,
    ts: Date.now(),
    by: user().n,
  });
  logA(
    `Regrind: ${kg(v)} ${t} waste → ${rmOf(f.rm.value).n}`,
    `Regrind: ${kg(v)} ${t} waste → ${rmOf(f.rm.value).n}`,
  );
  closeModal();
  render();
  toast(
    L(`${kg(v)} raw material mein wapas.`, `${kg(v)} back into raw material.`),
  );
};

/* ---------- karigar threading ---------- */
function rawBal(j) {
  if (j.key) {
    const bunch = sum(j.receipts, (r) => r.bunch),
      wt = sum(j.receipts, (r) => r.wt || 0),
      thread = sum(j.receipts, (r) => r.thread || 0),
      loose = sum(j.receipts, (r) => r.loose),
      waste = sum(j.receipts, (r) => r.waste),
      beadBack = r1(wt - thread);
    return {
      bunch,
      wt,
      thread,
      loose,
      waste,
      beadBack,
      bal: Math.max(0, r1(j.sent - beadBack - loose - waste)),
      d: days(j.ts),
    };
  }
  const bunch = sum(j.receipts, (r) => r.bunch),
    loose = sum(j.receipts, (r) => r.loose),
    waste = sum(j.receipts, (r) => r.waste),
    back = bunch * (S.kpb[j.product] || 0);
  return {
    bunch,
    loose,
    waste,
    beadBack: back,
    bal: Math.max(0, r1(j.sent - back - loose - waste)),
    d: days(j.ts),
  };
}
karSendModal = function () {
  const avail = ["P", "Z"].flatMap((l) =>
    keysAt("PLAIN:" + l).map((k) => ({ l, k, q: qty("PLAIN:" + l, k, "kg") })),
  );
  openModal(
    L("Karigar ko threading ke liye bhejo", "Send to karigar for threading"),
    L("Moulded beads (bina rang)", "Moulded beads (uncoloured)"),
    avail.length
      ? `<div class="fld"><span class="lb">Karigar</span><div class="radios">${KARIGARS.map((k, i) => `<label><input type="radio" name="kar" value="${k.id}" ${i ? "" : "checked"}>${k.n}</label>`).join("")}</div></div>
   <div class="fld"><label for="kb">${L("Moulded bead", "Moulded bead")}</label><select id="kb" name="bead">${[
     "P",
     "Z",
   ]
     .map(
       (l) =>
         `<optgroup label="${LINE[l]} line">${avail
           .filter((a) => a.l === l)
           .map(
             (a) =>
               `<option value="${l}~${a.k}">${esc(plainName(a.k))} · ${kg(a.q)}</option>`,
           )
           .join("")}</optgroup>`,
     )
     .join("")}</select></div>
   <div class="fld"><label for="kpl">${L("Rang ka plan (optional)", "Colour plan (optional)")}</label><select id="kpl" name="plan"></select></div>
   <div class="fld"><label for="kk">${L("Kitna (kg)", "How much (kg)")}</label><input id="kk" name="kg" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" required><span class="hint" id="kh"></span></div><div class="note" id="kslip"></div>`
      : `<div class="empty">${L("Abhi moulded beads stock mein nahi. Pehle moulding entry approve karo.", "No moulded beads in stock yet. Approve a moulding entry first.")}</div>`,
    avail.length
      ? `${cancelBtn()}<button class="btn pri" type="submit">${ic("send", 16)} ${L("Bhejo + challan banao", "Send + make challan")}</button>`
      : `<button type="button" class="btn" data-a="close">OK</button>`,
    avail.length ? { form: "karSend", live: "karSend" } : {},
  );
};
LIVE.karSend = (f) => {
  const [l, k] = f.bead.value.split("~"),
    av = qty("PLAIN:" + l, k, "kg"),
    v = +f.kg.value || 0,
    kr = KM[f.kar.value];
  if (f.dataset.b !== f.bead.value) {
    f.dataset.b = f.bead.value;
    const lastT = S.tasks
      .filter((t) => t.line === l && taskKey(t) === k && t.product)
      .sort((a, b) => b.ts - a.ts)[0];
    f.plan.innerHTML =
      `<option value="">${L("Coating par chunenge", "Choose at coating")}</option>` +
      PRODUCTS.filter((p) => p.unit === l && plainKey(p) === k)
        .map(
          (p) =>
            `<option value="${p.id}" ${lastT && lastT.product === p.id ? "selected" : ""}>${esc(pname(p))}</option>`,
        )
        .join("");
  }
  document.getElementById("kh").textContent =
    `${LINE[l]} line · ${L("stock", "stock")} ${kg(av)}${v > av ? " · " + L("itna stock nahi hai", "not enough stock") : ""}`;
  document.getElementById("kslip").innerHTML =
    `${ic("receipt", 16)}<span><b>Challan</b> · ${esc(kr.n)} · ${esc(plainName(k))} · ${v ? kg(v) : "– kg"} · ${L("wapas: dhaage wale bunch", "back as threaded bunches")}</span>`;
};
FORMS.karSend = (f) => {
  const u = user(),
    [l, k] = f.bead.value.split("~"),
    v = +f.kg.value;
  if (!(v > 0) || v > qty("PLAIN:" + l, k, "kg") + 0.001) {
    LIVE.karSend(f);
    f.kg.focus();
    return;
  }
  move("PLAIN:" + l, k, "kg", -v);
  const j = {
    id: nid(),
    kar: f.kar.value,
    unit: l,
    line: l,
    key: k,
    product: f.plan.value || null,
    sent: v,
    ts: Date.now(),
    by: u.n,
    receipts: [],
    challan: "JW/26-27/" + String(S.seq.jw++).padStart(4, "0"),
  };
  S.jobs.push(j);
  logA(
    `${KM[j.kar].n} ko ${kg(v)} ${plainName(k)} threading ke liye · ${j.challan}`,
    `Sent ${kg(v)} ${plainName(k)} to ${KM[j.kar].n} for threading · ${j.challan}`,
  );
  render();
  challanModal(j.id);
  toast(L("Bhej diya. Challan taiyaar.", "Sent. Challan ready."));
};
karRecvModal = function (id) {
  const j = S.jobs.find((x) => x.id === id),
    b = rawBal(j);
  openModal(
    L("Threaded bunch wapas lo", "Receive threaded bunches"),
    `${esc(KM[j.kar].n)} · ${esc(plainName(j.key))} · ${j.challan}`,
    `<div class="sumbox"><div><span>${L("Bheja tha", "Sent")}</span><b>${kg(j.sent)} · ${fdate(j.ts)}</b></div><div><span>${L("Abhi baaki", "Balance now")}</span><b>${kg(b.bal)}</b></div></div>
   <div class="row2"><div class="fld"><label for="rb">${L("Kitne bunch aaye", "Bunches received")}</label><input id="rb" name="bunch" class="big-in" type="number" inputmode="numeric" step="1" min="0" required></div><div class="fld"><label for="rwt">${L("Kul wazan (dhaage ke saath, kg)", "Total weight incl. thread (kg)")}</label><input id="rwt" name="wt" class="big-in" type="number" inputmode="decimal" step="0.01" min="0" required></div></div>
   <div class="row3"><div class="fld"><label for="rth">${L("Dhaage ka wazan (kg)", "Thread weight (kg)")}</label><input id="rth" name="thread" type="number" inputmode="decimal" step="0.01" min="0"><span class="hint">${L("Apne aap: bunch ×", "Auto: bunches ×")} ${S.threadKg} kg</span></div><div class="fld"><label for="rl">Loose (kg)</label><input id="rl" name="loose" type="number" inputmode="decimal" step="0.1" min="0"></div><div class="fld"><label for="rw">Wastage (kg)</label><input id="rw" name="waste" type="number" inputmode="decimal" step="0.1" min="0"></div></div>
   <div class="sumbox" id="rsum"></div><p class="err" id="rerr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Threaded maal aaya", "Threaded goods received")}</button>`,
    { form: "karRecv", live: "karRecv", id },
  );
};
LIVE.karRecv = (f) => {
  const j = S.jobs.find((x) => x.id === f.dataset.id),
    b = rawBal(j),
    bu = Math.round(+f.bunch.value || 0),
    wt = +f.wt.value || 0;
  if (!f.thread.dataset.touched)
    f.thread.value = bu ? r1(bu * S.threadKg * 100) / 100 : "";
  const th = +f.thread.value || 0,
    lo = +f.loose.value || 0,
    wa = +f.waste.value || 0,
    bead = wt - th;
  document.getElementById("rsum").innerHTML =
    `<div><span>${L("Bead ka wazan (kul − dhaaga)", "Bead weight (total − thread)")}</span><b>${kg(Math.max(0, bead))}</b></div><div><span>Loose + wastage</span><b>${kg(lo + wa)}</b></div><div class="tot"><span>${L("Iske baad baaki", "Balance after this")}</span><b>${kg(Math.max(0, b.bal - bead - lo - wa))}</b></div>`;
  document.getElementById("rerr").textContent =
    bead + lo + wa > b.bal + 0.5
      ? L(
          `Yeh ${kg(bead + lo + wa)} banta hai, baaki sirf ${kg(b.bal)} hai. Number check karo.`,
          `That adds up to ${kg(bead + lo + wa)}; only ${kg(b.bal)} is outstanding.`,
        )
      : "";
};
document.addEventListener(
  "input",
  (e) => {
    if (e.target && e.target.id === "rth") e.target.dataset.touched = "1";
  },
  true,
);
FORMS.karRecv = (f) => {
  const j = S.jobs.find((x) => x.id === f.dataset.id),
    b = rawBal(j),
    bu = Math.round(+f.bunch.value || 0),
    wt = +f.wt.value || 0,
    th = +f.thread.value || 0,
    lo = +f.loose.value || 0,
    wa = +f.waste.value || 0;
  if (!(bu > 0) || !(wt > 0)) {
    (bu > 0 ? f.wt : f.bunch).focus();
    return;
  }
  if (wt - th + lo + wa > b.bal + 0.5) {
    LIVE.karRecv(f);
    return;
  }
  j.receipts.push({
    bunch: bu,
    wt,
    thread: th,
    loose: lo,
    waste: wa,
    ts: Date.now(),
  });
  if (lo) move("PLAIN:" + j.line, j.key, "kg", lo);
  const lot = {
    id: nid(),
    job: j.id,
    line: j.line,
    key: j.key,
    product: j.product,
    bunch: bu,
    kg: wt,
    start: bu,
    ts: Date.now(),
    status: "thr",
  };
  S.thr.push(lot);
  logA(
    `${KM[j.kar].n} se ${bu} bunch (${kg(wt)}) threaded aaya`,
    `${bu} threaded bunches (${kg(wt)}) back from ${KM[j.kar].n}`,
  );
  render();
  moveAsk(lot.id);
};
function moveAsk(lid) {
  const l = S.thr.find((x) => x.id === lid);
  openModal(
    L("Threaded maal aa gaya", "Threaded goods received"),
    `${nf(l.bunch)} bunch · ${kg(l.kg)}`,
    `<p>${L(`Yeh maal ${LINE[l.line]} line ke raw material se bana hai, isliye ${LINE[l.line]} coating mein jaayega.`, `This was made from ${LINE[l.line]} line raw material, so it goes to ${LINE[l.line]} coating.`)}</p>`,
    `<button type="button" class="btn" data-a="close">${L("Baad mein", "Later")}</button><button type="button" class="btn pri" data-a="moveCoat" data-id="${l.id}">${ic("send", 16)} ${l.line === "P" ? "Move to Pearl coating" : "Move to Metalizing"}</button>`,
  );
}
ACT.moveCoat = (el) => {
  const l = S.thr.find((x) => x.id === el.dataset.id);
  l.status = "cq";
  l.moved = Date.now();
  logA(
    `${nf(l.bunch)} bunch ${plainName(l.key)} → ${LINE[l.line]} coating`,
    `${nf(l.bunch)} bunches ${plainName(l.key)} → ${LINE[l.line]} coating`,
  );
  closeModal();
  render();
  toast(
    L(
      `${LINE[l.line]} coating ke staff ko dikhega.`,
      `${LINE[l.line]} coating staff will see it now.`,
    ),
  );
};
challanModal = function (jid) {
  const j = S.jobs.find((x) => x.id === jid);
  if (!j.key) return;
  const k = KM[j.kar],
    val = j.sent * COST.plain;
  openModal(
    L("Job work delivery challan", "Job work delivery challan"),
    `${j.challan} · Rule 55`,
    `<div class="paper"><div class="ph"><div><h3>MK Plastics</h3><div class="m">Beads Bazaar · Bhiwandi, Mumbai 421302, Maharashtra</div><div class="m">GSTIN 27XXXXXXXXXX1Z0 (sample)</div></div><div style="text-align:right"><div class="stamp">Delivery Challan · Job work</div><b>${j.challan}</b><div class="m">${new Date(j.ts).toLocaleDateString("en-IN")}</div></div></div>
   <div class="row2"><div><div class="m">${L("Karigar (job worker)", "Job worker")}</div><b>${esc(k.n)}</b><div class="m">${esc(k.a)}, Bhiwandi</div></div><div><div class="m">${L("Maksad", "Purpose")}</div><b>${L("Job work: dhaage mein pirona", "Job work: threading")}</b><div class="m">Sec. 143 CGST Act · Rule 55</div></div></div>
   <div class="tw" style="margin-inline:0;padding-inline:0"><table><thead><tr><th>#</th><th>${L("Vivran", "Description")}</th><th>HSN</th><th class="r">Qty</th><th class="r">${L("Andaazit keemat", "Approx. value")}</th></tr></thead><tbody><tr><td>1</td><td>${esc(plainName(j.key))}<div class="m">${L("Moulded beads, bina rang, bina dhaage", "Moulded beads, uncoloured, unthreaded")} · ${LINE[j.line]} line</div></td><td>3926</td><td class="r">${kg(j.sent)}</td><td class="r">${rs(val)}</td></tr></tbody></table></div>
   <div class="row2"><div><div class="m">${L("Wapas kab tak", "Return by")}</div><b>${new Date(j.ts + 15 * DAY).toLocaleDateString("en-IN")}</b></div><div><div class="m">${L("Wapas kaise aayega", "Comes back as")}</div><b>${L("Dhaage wale bunch (bead + dhaaga)", "Threaded bunches (beads + thread)")}</b><div class="m">${L("Chhoot", "Tolerance")} ${S.tol}% · ₹${S.karRate}/bunch</div></div></div>
   <div class="m">${L("Sample format hai, CA se confirm karein.", "Sample format; confirm with your CA.")}</div><div class="sig2"><span>${L("MK Plastics ki taraf se", "For MK Plastics")}</span><span>${L("Karigar ka sign", "Karigar signature")}</span></div></div>`,
    `<button type="button" class="btn" data-a="waShare">${ic("send", 16)} WhatsApp</button><button type="button" class="btn pri" data-a="fakePrint">${ic("print", 16)} Print</button>`,
    { wide: true },
  );
};
closeJobModal = function (jid) {
  const j = S.jobs.find((x) => x.id === jid),
    b = rawBal(j),
    un = b.bal,
    pct = j.sent ? (un / j.sent) * 100 : 0,
    allow = (j.sent * S.tol) / 100,
    over = Math.max(0, un - allow),
    pen = Math.round(over * S.penRate);
  openModal(
    L("Karigar ka hisaab band karo", "Close the karigar job"),
    `${esc(KM[j.kar].n)} · ${esc(jobName(j))} · ${j.challan || ""}`,
    `<div class="sumbox"><div><span>${L("Bheja", "Issued")}</span><b>${kg(j.sent)}</b></div><div><span>${L("Bunch mein bead", "Beads in bunches")} (${nf(b.bunch)} bunch, ${kg(b.wt)} − ${L("dhaaga", "thread")} ${kg(b.thread)})</span><b>${kg(b.beadBack)}</b></div><div><span>Loose</span><b>${kg(b.loose)}</b></div><div><span>Wastage</span><b>${kg(b.waste)}</b></div><div class="tot"><span>${L("Hisaab nahi mila", "Unaccounted")}</span><b>${kg(un)} · ${nf(pct, 2)}%</b></div></div>
   ${pct <= S.tol ? `<div class="note ok">${ic("check", 16)}<span>${L(`${S.tol}% chhoot ke andar. Koi penalty nahi.`, `Within the ${S.tol}% allowance. No penalty.`)}</span></div>` : `<div class="note bad">${ic("alert", 16)}<span>${L(`Chhoot ${kg(allow)} tak. ${kg(over)} zyada gaya. Penalty ${rs(pen)}.`, `Allowance ${kg(allow)}. ${kg(over)} over. Penalty ${rs(pen)}.`)}</span></div><label class="note" style="cursor:pointer;align-items:center"><input type="checkbox" name="waive"> ${L("Penalty maaf karo", "Waive the penalty")}</label>`}
   <div class="sumbox"><div><span>${L("Is kaam ki kamai", "Wages for this job")} (${nf(b.bunch)} × ₹${S.karRate})</span><b>${rs(b.bunch * S.karRate)}</b></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("lock", 16)} ${L("Hisaab band karo", "Close job")}</button>`,
    { form: "closeJob", id: jid, wide: true },
  );
};
AV.karigar = function () {
  const jobs = S.jobs
    .map((j) => ({ j, b: jobBal(j) }))
    .sort(
      (a, b) =>
        (a.j.closed ? 1 : 0) - (b.j.closed ? 1 : 0) ||
        b.b.bal - a.b.bal ||
        b.j.ts - a.j.ts,
    );
  const sumK = KARIGARS.map((k) => {
    const js = jobs.filter((x) => x.j.kar === k.id && x.b.bal > 0);
    return {
      k,
      bal: sum(js, (x) => x.b.bal),
      n: js.length,
      old: js.length ? Math.max(...js.map((x) => x.b.d)) : 0,
    };
  });
  return `<div class="grid-3">${sumK.map(({ k, bal, n, old }) => `<div class="kpi"><span>${esc(k.n)} · ${esc(k.a)}</span><b>${kg(bal)}</b><small>${n} ${L("kaam khula", "open jobs")}${old > 15 ? ` · <span style="color:var(--bad);font-weight:600">${old} ${L("din purana", "days old")}</span>` : old ? ` · ${old} ${L("din", "days")}` : ""}</small><div class="toolbar" style="margin-top:6px"><span class="psub">${L("Dena baaki", "Wages due")} <b style="color:var(--ink)">${rs(karInfo(k.id).due)}</b></span><button type="button" class="btn sm" data-a="karKhata" data-id="${k.id}">${ic("wallet", 14)} Khata</button></div></div>`).join("")}</div>
  <section class="card"><div class="card-h"><div><h3>${L("Threading ka kaam", "Threading jobs")}</h3><p>${L(`Moulded beads kg mein jaate hain, dhaage wale bunch aate hain. Baaki = bheja − (kul wazan − dhaaga) − loose − wastage. Chhoot ${S.tol}%, ₹${S.karRate}/bunch.`, `Moulded beads go out in kg and come back as threaded bunches. Balance = sent − (total weight − thread) − loose − wastage. Tolerance ${S.tol}%, ₹${S.karRate}/bunch.`)}</p></div></div>
  ${
    jobs.length
      ? `<div class="tw"><table><thead><tr><th>Bead</th><th>Karigar</th><th class="r">${L("Bheja", "Sent")}</th><th class="r">${L("Bunch aaye", "Bunches back")}</th><th class="r">${L("Wazan (dhaage ke saath)", "Weight (incl. thread)")}</th><th class="r">${L("Baaki", "Balance")}</th><th>${L("Haalat", "Status")}</th><th></th></tr></thead><tbody>${jobs
          .map(
            ({
              j,
              b,
            }) => `<tr><td><div class="prow">${pthumb()}<div><div class="pname">${esc(j.key ? plainName(j.key) : jobName(j))}</div><div class="psub">${lineChip(j.line || j.unit)}${j.product ? " · " + esc(PM[j.product].color) : ""}</div></div></div></td><td>${esc(KM[j.kar].n)}<div class="psub">${j.challan || ""}</div></td><td class="r">${kg(j.sent)}<div class="psub">${fdate(j.ts)}</div></td><td class="r">${nf(b.bunch)}</td><td class="r">${kg(b.wt || 0)}</td><td class="r"><b>${kg(b.bal)}</b></td>
   <td>${j.closed ? `<span class="pill ${j.penalty ? "bad" : "ok"}">${L("Band", "Closed")}${j.penalty ? " · −" + rs(j.penalty) : ""}</span>` : b.bal > 0 ? `<span class="pill ${b.d > 15 ? "bad" : b.d > 7 ? "warn" : "mute"}">${b.d} ${L("din", "d")}</span>` : `<span class="pill ok">${L("Pura", "Done")}</span>`}</td>
   <td><div class="btns" style="justify-content:flex-end">${!j.closed && b.bal > 0 ? `<button type="button" class="btn sm pri" data-a="karRecv" data-id="${j.id}">${L("Wapas lo", "Receive")}</button>` : ""}<button type="button" class="btn sm" data-a="challan" data-id="${j.id}">Challan</button>${!j.closed && j.receipts.length && rawBal(j).bal <= j.sent * 0.05 ? `<button type="button" class="btn sm" data-a="closeJob" data-id="${j.id}">${L("Hisaab band", "Close job")}</button>` : ""}</div></td></tr>`,
          )
          .join("")}</tbody></table></div>`
      : `<div class="empty">${ic("thread")}${L('Abhi koi threading ka kaam nahi. Moulding approve hone ke baad "Karigar ko bhejo".', 'No threading jobs yet. After moulding is approved, use "Send to karigar".')}</div>`
  }</section>`;
};

/* ---------- coating page ---------- */
AV.coating = function () {
  const tab = S.ui.coatTab || "thr",
    thr = S.thr.filter((l) => l.status === "thr" && l.bunch > 0),
    cq = S.thr.filter((l) => l.status === "cq" && l.bunch > 0);
  const pendC = S.entries.filter(
    (e) => e.kind === "coat" && e.status === "pending",
  );
  const tabs = [
    ["thr", L("Threaded aaya", "Threaded in"), thr.length],
    ["cq", L("Coating mein", "In coating"), cq.length],
    ["final", L("Final approval", "Final approval"), pendC.length],
  ];
  const lotRow = (l, btn) =>
    `<div class="item" style="flex-wrap:wrap">${pthumb()}<div class="grow" style="min-width:200px"><div class="t1">${esc(plainName(l.key))}</div><div class="t2">${lineChip(l.line)} · ${nf(l.bunch)} bunch · ${kg(l.kg)} · ${fwhen(l.ts)}</div><div class="t2">${L("Rang", "Colour")}: <b style="color:var(--ink)">${l.product ? esc(PM[l.product].color) : L("coating par chunenge", "choose at coating")}</b>${l.job ? " · " + esc(KM[(S.jobs.find((j) => j.id === l.job) || {}).kar]?.n || "") : ""}</div></div>${btn}</div>`;
  let body;
  if (tab === "thr")
    body = `<div class="card-h"><div><h3>${L("Karigar se aaya threaded maal", "Threaded goods from karigars")}</h3><p>${L("Raw material ki line ke hisaab se coating mein bhejo.", "Send to coating by the line of the raw material used.")}</p></div></div>
   <div class="list">${thr.map((l) => lotRow(l, `<button type="button" class="btn pri sm" data-a="moveCoat" data-id="${l.id}">${ic("send", 14)} ${l.line === "P" ? "Move to Pearl coating" : "Move to Metalizing"}</button>`)).join("") || `<div class="empty">${L("Abhi koi threaded maal nahi aaya.", "No threaded goods waiting.")}</div>`}</div>`;
  else if (tab === "cq")
    body = `<div class="card-h"><div><h3>${L("Coating ke liye taiyaar", "Waiting for coating")}</h3><p>${L("P1/P2 (Pearl) aur MZ1 (Metalizing) ke staff yahin se lot chun ke coating + packing entry karte hain.", "P1/P2 (Pearl) and MZ1 (Metalizing) staff pick lots from here for their coating + packing entries.")}</p></div></div>
   <div class="list">${
     cq
       .map((l) => {
         const pe = pendC.filter((e) => e.lot === l.id);
         return lotRow(
           l,
           pe.length
             ? `<span class="pill warn">${pe.length} entry ${L("approval mein", "awaiting approval")}</span>`
             : `<span class="pill mute">${L("Staff ka intezaar", "Waiting for staff")}</span>`,
         );
       })
       .join("") ||
     `<div class="empty">${L("Coating mein abhi kuch nahi.", "Nothing in coating.")}</div>`
   }</div>`;
  else body = approveView({ unit: null, _coatOnly: true });
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, n]) => `<button type="button" data-a="ui" data-k="coatTab" data-val="${k}" aria-pressed="${tab === k}">${l}${n ? `<span class="badge">${n}</span>` : ""}</button>`).join("")}</div></div>${tab === "final" ? body : `<section class="card">${body}</section>`}`;
};
const _approveV8 = approveView;
approveView = function (u) {
  if (u && u._coatOnly) {
    const keep = S.entries;
    S.entries = keep.filter((e) => e.kind === "coat" || e.status !== "pending");
    try {
      return _approveV8({});
    } finally {
      S.entries = keep;
    }
  }
  return _approveV8(u);
};

/* ---------- staff screen extras ---------- */
const _staffV8 = staffView;
staffView = function (u) {
  let h = _staffV8(u);
  let card = "";
  if (u.unit === "M") {
    const ts = S.tasks.filter(
      (t) => t.machine === u.machine && t.status === "open",
    );
    card = `<section class="card"><div class="card-h"><h3>${L("Mere task", "My tasks")}</h3><span class="pill mute">${ts.length}</span></div>${ts.length ? `<div class="list">${ts.map((t) => taskCard(t, false)).join("")}</div>` : `<div class="empty">${L("Abhi koi task nahi. Admin task dega.", "No tasks yet. The Admin will assign one.")}</div>`}</section>`;
  } else {
    const lots = S.thr.filter(
      (l) => l.status === "cq" && l.line === u.unit && l.bunch > 0,
    );
    card = `<section class="card"><div class="card-h"><h3>${L("Coating ke liye maal", "Ready for coating")}</h3><span class="pill mute">${lots.length}</span></div>${lots.length ? `<div class="list">${lots.map((l) => `<div class="item">${pthumb()}<div class="grow"><div class="t1">${esc(plainName(l.key))}</div><div class="t2">${nf(l.bunch)} bunch · ${L("Rang", "Colour")}: ${l.product ? esc(PM[l.product].color) : L("aap chunoge", "you choose")}</div></div></div>`).join("")}</div>` : `<div class="empty">${L('Abhi kuch nahi. Admin "Move to coating" karega.', "Nothing yet. The Admin will move goods to coating.")}</div>`}</section>`;
  }
  return h.replace(
    '<section class="card"><div class="card-h"><h3>' +
      L("Aaj ki meri entry", "My entries today"),
    card +
      '<section class="card"><div class="card-h"><h3>' +
      L("Aaj ki meri entry", "My entries today"),
  );
};

/* ---------- consumers of stock ---------- */
lineAvail = function (l) {
  if (l.kind === "plain")
    return qty("PLAIN:P", l.ref, "kg") + qty("PLAIN:Z", l.ref, "kg");
  const p = PM[l.ref];
  const b = qty("FIN:" + p.unit, p.id, "bunch");
  return l.uom === "kg" ? r1(b * S.kpb[p.id]) : b;
};
lineTake = function (l, q) {
  if (l.kind === "plain") {
    const a = Math.min(q, qty("PLAIN:P", l.ref, "kg"));
    move("PLAIN:P", l.ref, "kg", -a);
    if (q - a > 0) move("PLAIN:Z", l.ref, "kg", -(q - a));
    return;
  }
  const p = PM[l.ref];
  move("FIN:" + p.unit, p.id, "bunch", l.uom === "kg" ? -q / S.kpb[p.id] : -q);
};
journeyStages = function () {
  const raw = sum(
      RAW.filter((r) => r.rm),
      (r) => qty("RAW:M", r.id, "kg"),
    ),
    mould = sum(["P", "Z"], (l) =>
      sum(keysAt("PLAIN:" + l), (k) => qty("PLAIN:" + l, k, "kg")),
    );
  const kar = sum(S.jobs, (j) => jobBal(j).bal),
    thr = S.thr.filter((l) => l.status === "thr"),
    cq = S.thr.filter((l) => l.status === "cq" && l.bunch > 0);
  const fin = sum(PRODUCTS, (p) => qty("FIN:" + p.unit, p.id, "bunch"));
  let sb = 0;
  S.dispatches
    .filter((d) => d.ts >= month0())
    .forEach((d) => {
      const o = S.orders.find((x) => x.id === d.order);
      d.lines.forEach(({ i, q }) => {
        if (o.lines[i].uom === "bunch") sb += q;
      });
    });
  return [
    {
      c: "var(--gold)",
      l: "Raw material",
      v: kg(raw),
      s: L("Pearl + Metalizing line", "Pearl + Metalizing lines"),
      go: "stock",
      tab: "raw",
    },
    {
      c: "var(--u-m)",
      l: L("Moulded beads", "Moulded beads"),
      v: kg(mould),
      s: L("threading ke liye", "for threading"),
      go: "stock",
      tab: "mould",
    },
    {
      c: "var(--u-k)",
      l: L("Karigar ke paas", "With karigars"),
      v: kg(kar),
      s:
        S.jobs.filter((j) => jobBal(j).bal > 0).length +
        " " +
        L("kaam chal rahe", "open jobs"),
      go: "karigar",
    },
    {
      c: "var(--sand)",
      l: L("Threaded aaya", "Threaded in"),
      v: nf(sum(thr, (l) => l.bunch)) + " bunch",
      s: L("coating mein bhejna", "to move to coating"),
      go: "coating",
      tab: "thr",
    },
    {
      c: "var(--u-p)",
      l: L("Coating mein", "In coating"),
      v: nf(sum(cq, (l) => l.bunch)) + " bunch",
      s: L("Pearl + Metalizing", "Pearl + Metalizing"),
      go: "coating",
      tab: "cq",
    },
    {
      c: "var(--navy)",
      l: L("Dispatch ke liye taiyaar", "Ready to dispatch"),
      v: nf(fin) + " bunch",
      s: L("Is mahine bika: ", "Sold this month: ") + nf(sb) + " bunch",
      go: "stock",
      tab: "fin",
    },
  ];
};
const _navV8 = ACT.nav;
ACT.nav = (el) => {
  if (el.dataset.v === "coating" && el.dataset.tab)
    S.ui.coatTab = el.dataset.tab;
  _navV8(el);
};
const _gaV8 = getAlerts;
getAlerts = function () {
  const A = _gaV8().filter((a) => a[3] !== "maal" || a[1] !== "swap");
  const thr = S.thr.filter((l) => l.status === "thr" && l.bunch > 0).length;
  if (thr)
    A.unshift([
      "warn",
      "send",
      L(
        `${thr} threaded lot coating mein bhejna baaki`,
        `${thr} threaded ${thr > 1 ? "lots" : "lot"} to move to coating`,
      ),
      "coating",
      "thr",
    ]);
  const pc = S.entries.filter(
    (e) => e.kind === "coat" && e.status === "pending",
  ).length;
  if (pc)
    A.unshift([
      "info",
      "check",
      L(
        `${pc} coating entry final approval ke liye`,
        `${pc} coating ${pc > 1 ? "entries" : "entry"} awaiting final approval`,
      ),
      "coating",
      "final",
    ]);
  const mo = sum(["P", "Z"], (l) =>
    sum(keysAt("PLAIN:" + l), (k) => qty("PLAIN:" + l, k, "kg")),
  );
  if (mo > 0)
    A.push([
      "info",
      "thread",
      L(
        `${kg(mo)} moulded beads karigar ko bhejne ke liye`,
        `${kg(mo)} moulded beads ready to send for threading`,
      ),
      "karigar",
    ]);
  const idle = UNITS.M.machines.filter(
    (m) => !S.tasks.some((t) => t.machine === m && t.status === "open"),
  );
  if (idle.length)
    A.push([
      "info",
      "list",
      L(
        `${idle.join(", ")} ke paas koi task nahi`,
        `${idle.join(", ")} ${idle.length > 1 ? "have" : "has"} no task`,
      ),
      "tasks",
    ]);
  return A;
};
ACT.quick = (el) => {
  ({
    inward: inwardModal,
    task: taskModal,
    kar: karSendModal,
    stock: addStockModal,
    order: newOrderModal,
  })[el.dataset.q]();
};

/* ---------- nav ---------- */
navItems = function (u) {
  if (u.role !== "admin") return [{ id: "home", i: "home", l: "Home" }];
  const g1 = L("Roz ka kaam", "Daily work"),
    g2 = L("Maal aur stock", "Material & stock"),
    g3 = L("Bikri aur paisa", "Sales & money"),
    g4 = "Admin";
  return [
    { id: "home", i: "home", l: "Home", g: g1 },
    { id: "tasks", i: "list", l: "Tasks", b: 0, g: g1 },
    {
      id: "production",
      i: "factory",
      l: L("Approval", "Approvals"),
      b: pendingEntries().filter((e) => e.kind !== "coat").length,
      g: g1,
    },
    { id: "karigar", i: "thread", l: "Karigar", g: g1 },
    {
      id: "coating",
      i: "pearl",
      l: "Coating",
      b:
        S.thr.filter((l) => l.status === "thr" && l.bunch > 0).length +
        S.entries.filter((e) => e.kind === "coat" && e.status === "pending")
          .length,
      g: g1,
    },
    {
      id: "dispatch",
      i: "truck",
      l: "Dispatch",
      b: dispatchQueue().filter((o) =>
        o.lines.some((l) => l.disp < l.qty && lineAvail(l) > 0),
      ).length,
      g: g1,
    },
    {
      id: "maal",
      i: "inbox",
      l: "Inward",
      b: S.inwards.filter((i) => i.rate == null).length,
      g: g2,
    },
    {
      id: "stock",
      i: "box",
      l: "Stock",
      b: S.counts.filter((c) => c.status === "pending").length,
      g: g2,
    },
    { id: "waste", i: "refresh", l: "Waste", g: g2 },
    { id: "products", i: "pearl", l: "Products", g: g2 },
    { id: "orders", i: "receipt", l: "Orders", b: uninvoiced().length, g: g3 },
    { id: "khaata", i: "wallet", l: L("Khaata", "Accounts"), g: g3 },
    { id: "kharcha", i: "coins", l: L("Kharcha", "Expenses"), g: g3 },
    { id: "reports", i: "sheet", l: "Reports", g: g3 },
    { id: "log", i: "list", l: L("Record", "Activity"), g: g4 },
    { id: "team", i: "users", l: "Team", g: g4 },
    { id: "guide", i: "book", l: "Guide", g: g4 },
  ];
};
AV.production = (function (prev) {
  return function (u) {
    const tab = S.ui.prodTab || "pending";
    if (tab !== "pending") return prev(u);
    const keep = S.entries;
    S.entries = keep.filter((e) => e.kind !== "coat" || e.status !== "pending");
    try {
      return prev(u).replace(
        L("Approval ke liye", "Awaiting approval"),
        L("Moulding approval", "Moulding approvals"),
      );
    } finally {
      S.entries = keep;
    }
  };
})(AV.production);
AV.maal = function () {
  return `<section class="card"><div class="card-h"><div><h3>Raw material inward</h3><p>${L("Supplier se aaya maal. Line (Pearl / Metalizing) aur type ke hisaab se material chuno. Rate baad mein bhi bhar sakte ho.", "Goods from suppliers. Pick the material by line (Pearl / Metalizing) and type. The rate can be added later.")}</p></div><div class="btns"><button type="button" class="btn sm" data-a="rmNew">${ic("plus", 14)} ${L("Naya raw material", "New raw material")}</button><button type="button" class="btn pri sm" data-a="inward">${ic("plus", 15)} Inward</button></div></div>
   <div class="list">${
     S.inwards
       .slice()
       .sort((a, b) => b.ts - a.ts)
       .map(
         (i) =>
           `<div class="item"><span class="ico-c ${i.rate == null ? "warn" : "ok"}">${ic("inbox", 17)}</span><div class="grow"><div class="t1">${fq(i.qty, RM[i.mat] ? RM[i.mat].uom : "kg")} ${esc(RM[i.mat] ? RM[i.mat].n : i.mat)}</div><div class="t2">${esc(i.supplier)} · Bill ${esc(i.bill)} · ${fwhen(i.ts)}</div></div><div class="end">${i.rate == null ? `<span class="pill warn">${L("Rate baaki", "No rate")}</span>` : `<b class="num">${rs(i.rate)}</b>`}</div></div>`,
       )
       .join("") ||
     `<div class="empty">${ic("inbox")}${L("Abhi koi inward nahi.", "No inwards yet.")}</div>`
   }</div></section>`;
};
const _taV8 = topAction;
topAction = function (u) {
  if (u.role === "admin") {
    if (S.view === "tasks")
      return `<button type="button" class="btn pri" data-a="taskNew">${ic("plus")}${L("Naya task", "New task")}</button>`;
    if (S.view === "maal")
      return `<button type="button" class="btn pri" data-a="inward">${ic("inbox")}Inward</button>`;
    if (S.view === "stock" && S.ui.stockTab === "raw")
      return (
        `<button type="button" class="btn" data-a="rmNew">${ic("plus")}${L("Naya raw material", "New raw material")}</button>` +
        _taV8(u)
      );
  }
  return _taV8(u);
};

/* ---------- stock page ---------- */
AV.stock = function () {
  const tab = ["fin", "cq", "thr", "mould", "raw", "counts"].includes(
    S.ui.stockTab,
  )
    ? S.ui.stockTab
    : "fin";
  const tabs = [
    ["fin", L("Dispatch ke liye taiyaar", "Ready to dispatch")],
    ["cq", L("Coating mein", "In coating")],
    ["thr", L("Threaded", "Threaded")],
    ["mould", "Moulded beads"],
    ["raw", "Raw material"],
    [
      "counts",
      L("Ginti", "Counts"),
      S.counts.filter((c) => c.status === "pending").length,
    ],
  ];
  let body = "";
  if (tab === "fin") {
    const un = S.ui.stockUnit === "M" ? "all" : S.ui.stockUnit || "all",
      ps = PRODUCTS.filter((p) => un === "all" || p.unit === un);
    body = `<div class="chips">${[
      ["all", L("Sab", "All")],
      ["P", "Pearl"],
      ["Z", "Metalizing"],
    ]
      .map(
        ([k, l]) =>
          `<button type="button" class="chip" data-a="ui" data-k="stockUnit" data-val="${k}" aria-pressed="${un === k}">${l}</button>`,
      )
      .join("")}</div>
    <div class="tw"><table><thead><tr><th>Product</th><th>Line</th><th class="r">Bunch</th><th class="r">≈ kg</th></tr></thead><tbody>${ps
      .map((p) => {
        const q = qty("FIN:" + p.unit, p.id, "bunch");
        return `<tr class="click" data-a="product" data-id="${p.id}"><td>${itemCell("fin", p.id)}</td><td>${lineChip(p.unit)}</td><td class="r"><b>${nf(q)}</b></td><td class="r">${kg(q * S.kpb[p.id])}</td></tr>`;
      })
      .join("")}</tbody></table></div>`;
  } else if (tab === "cq" || tab === "thr") {
    const ls = S.thr.filter((l) => l.status === tab && l.bunch > 0);
    body = ls.length
      ? `<div class="tw"><table><thead><tr><th>Bead</th><th>Line</th><th>${L("Rang", "Colour")}</th><th class="r">Bunch</th><th class="r">kg</th><th>${L("Kab aaya", "Since")}</th></tr></thead><tbody>${ls.map((l) => `<tr><td>${itemCell("plain", l.key)}</td><td>${lineChip(l.line)}</td><td>${l.product ? esc(PM[l.product].color) : "–"}</td><td class="r"><b>${nf(l.bunch)}</b></td><td class="r">${kg(l.kg)}</td><td>${fdate(l.ts)}</td></tr>`).join("")}</tbody></table></div>`
      : `<div class="empty">${L("Kuch nahi", "Nothing here")}</div>`;
  } else if (tab === "mould") {
    const rows = ["P", "Z"].flatMap((l) =>
      keysAt("PLAIN:" + l).map((k) => ({
        l,
        k,
        q: qty("PLAIN:" + l, k, "kg"),
      })),
    );
    body = `<p class="muted" style="font-size:13px">${L("Moulding se bane bina rang ke beads, karigar ko threading ke liye bhejne hain.", "Uncoloured beads from moulding, to be sent for threading.")}</p>${rows.length ? `<div class="tw"><table><thead><tr><th>Bead</th><th>Line</th><th class="r">kg</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${itemCell("plain", r.k)}</td><td>${lineChip(r.l)}</td><td class="r"><b>${kg(r.q)}</b></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">${L("Abhi koi moulded beads nahi", "No moulded beads yet")}</div>`}`;
  } else if (tab === "raw") {
    const sec = (t, list) =>
      list.length
        ? `<div class="eyebrow">${t}</div><div class="tw"><table><thead><tr><th>Material</th><th class="r">Stock</th><th>${L("Reorder tak", "vs reorder")}</th><th>${L("Haalat", "Status")}</th></tr></thead><tbody>${list
            .map((r) => {
              const q = qty("RAW:" + r.unit, r.id, r.uom),
                low = q < r.re;
              return `<tr><td><div class="pname">${esc(r.rm ? rmOf(r.id).n : r.n)}</div><div class="psub">${r.rm ? "Type " + r.type + " · " : ""}reorder ${fq(r.re, r.uom)}</div></td><td class="r"><b>${fq(q, r.uom)}</b></td><td><div class="meter" style="--c:${low ? "var(--bad)" : "var(--ok)"}"><i style="width:${Math.min(1, q / (r.re * 3 || 1)) * 100}%"></i></div></td><td>${low ? `<span class="pill bad">${L("Mangwao", "Reorder")}</span>` : `<span class="pill ok">OK</span>`}</td></tr>`;
            })
            .join("")}</tbody></table></div>`
        : "";
    body =
      sec(
        "Pearl line",
        RAW.filter((r) => r.rm && r.line === "P"),
      ) +
      sec(
        "Metalizing line",
        RAW.filter((r) => r.rm && r.line === "Z"),
      ) +
      sec(
        L("Packing aur coating material", "Packing and coating materials"),
        RAW.filter((r) => !r.rm && r.unit !== "O"),
      ) +
      `<p class="muted" style="font-size:12.5px">${L('Raw material ki list sample hai. Client ki asli list aane par "Naya raw material" se jodo.', 'This raw material list is a sample. Add the client\'s real list with "New raw material".')}</p>`;
  } else body = countsAdmin();
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, n]) => `<button type="button" data-a="ui" data-k="stockTab" data-val="${k}" aria-pressed="${tab === k}">${l}${n ? `<span class="badge">${n}</span>` : ""}</button>`).join("")}</div></div><section class="card" style="gap:12px">${body}</section>`;
};

/* add stock stages */
STAGES.splice(
  0,
  STAGES.length,
  ["raw", "Raw material", "Raw material"],
  ["mould", "Moulded beads", "Moulded beads"],
  ["fin", "Dispatch ke liye taiyaar", "Ready to dispatch"],
  ["waste", "Waste", "Waste"],
);
const stkKey = (st, u) =>
  ({ raw: "RAW", mould: "PLAIN", fin: "FIN", waste: "WASTE" })[st] + ":" + u;
stkLocs = function (st) {
  return st === "raw"
    ? [
        ["M", "Moulding (GPPS + packing)"],
        ["P", "Pearl coating"],
        ["Z", "Metalizing coating"],
      ]
    : st === "waste"
      ? [["M", "Moulding"]]
      : [
          ["P", "Pearl line"],
          ["Z", "Metalizing line"],
        ];
};
stkItems = function (st, u) {
  if (st === "raw")
    return RAW.filter((r) => r.unit === u).map((r) => [
      r.id,
      r.rm ? rmOf(r.id).n + " · " + LINE[r.line] : r.n,
      r.uom,
    ]);
  if (st === "mould") {
    const ks = [...new Set([...PLAINS, ...keysAt("PLAIN:" + u)])];
    return ks.map((k) => [k, plainName(k), "kg"]);
  }
  if (st === "waste")
    return [...new Set([...RM_TYPES, ...S.rms.map((r) => r.type)])].map((t) => [
      t,
      t + " waste",
      "kg",
    ]);
  return PRODUCTS.filter((p) => p.unit === u).map((p) => [
    p.id,
    pname(p) + " · " + psub(p),
    "bunch",
  ]);
};
stkLineName = function (l) {
  const [k, u] = l.loc.split(":");
  return k === "RAW"
    ? RM[l.item].n
    : k === "PLAIN"
      ? plainName(l.item) + " · " + LINE[u]
      : k === "WASTE"
        ? l.item + " waste"
        : pname(PM[l.item]) + " · " + psub(PM[l.item]);
};
stkTakeLine = function (f) {
  const st = f.querySelector("[name=stage]:checked").value,
    opt = f.item.selectedOptions[0];
  if (!opt) return null;
  const uom = opt.dataset.u;
  let q = +f.qty.value;
  if (!(q > 0)) return null;
  q = intUom(uom) ? Math.round(q) : r1(q);
  return { loc: stkKey(st, f.loc.value), item: f.item.value, uom, qty: q };
};
LIVE.addStock = (f) => {
  const st = f.querySelector("[name=stage]:checked").value;
  if (f.dataset.st !== st) {
    f.dataset.st = st;
    f.loc.innerHTML = stkLocs(st)
      .map(([k, n]) => `<option value="${k}">${n}</option>`)
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
      fq(qty(stkKey(st, f.loc.value), f.item.value, uom), uom)
    : "";
  const ls = (draft && draft.lines) || [];
  document.getElementById("slist").innerHTML = ls.length
    ? `<div class="sumbox">${ls.map((l, i) => `<div><span>${esc(stkLineName(l))}</span><span style="display:flex;gap:8px;align-items:center"><b>+${fq(l.qty, l.uom)}</b><button type="button" class="xbtn" style="width:28px;height:28px" data-a="stkDel" data-i="${i}" aria-label="${L("Hatao", "Remove")}">${ic("x", 14)}</button></span></div>`).join("")}<div class="tot"><span>${ls.length} item</span><span></span></div></div>`
    : "";
  const pend = +f.qty.value > 0 ? 1 : 0;
  document.getElementById("ssave").innerHTML =
    `${ic("check", 16)} ${L("Stock save karo", "Save stock")}${ls.length + pend ? ` (${ls.length + pend})` : ""}`;
};
FORMS.addStock = (f) => {
  const l = stkTakeLine(f);
  if (l) draft.lines.push(l);
  if (!draft.lines.length) {
    document.getElementById("serr").textContent = L(
      "Kam se kam ek item ka stock daalo.",
      "Add stock for at least one item.",
    );
    return;
  }
  const rr = STK_REASONS.find(
      (x) => x[0] === f.querySelector("[name=reason]:checked").value,
    ),
    note = f.note.value.trim();
  draft.lines.forEach((x) => {
    move(x.loc, x.item, x.uom, x.qty);
    logA(
      `Stock joda (${rr[1]}): +${fq(x.qty, x.uom)} ${stkLineName(x)}${note ? " · " + note : ""}`,
      `Stock added (${rr[2]}): +${fq(x.qty, x.uom)} ${stkLineName(x)}${note ? " · " + note : ""}`,
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

/* stock count */
countItems = function (unit) {
  const out = [];
  RAW.filter((r) => r.unit === unit).forEach((r) =>
    out.push({
      g: r.rm ? LINE[r.line] + " line raw material" : "Material",
      loc: "RAW:" + unit,
      item: r.id,
      uom: r.uom,
      n: r.rm ? rmOf(r.id).n : r.n,
    }),
  );
  if (unit === "M") {
    ["P", "Z"].forEach((l) =>
      keysAt("PLAIN:" + l).forEach((k) =>
        out.push({
          g: "Moulded beads",
          loc: "PLAIN:" + l,
          item: k,
          uom: "kg",
          n: plainName(k) + " · " + LINE[l],
        }),
      ),
    );
    keysAt("WASTE:M").forEach((t) =>
      out.push({
        g: "Waste",
        loc: "WASTE:M",
        item: t,
        uom: "kg",
        n: t + " waste",
      }),
    );
  } else
    PRODUCTS.filter(
      (p) => p.unit === unit && qty("FIN:" + unit, p.id, "bunch") > 0,
    ).forEach((p) =>
      out.push({
        g: L("Dispatch ke liye taiyaar", "Ready to dispatch"),
        loc: "FIN:" + unit,
        item: p.id,
        uom: "bunch",
        n: pname(p) + " · " + p.grade,
      }),
    );
  return out;
};
countLineName = function (l) {
  const [k, u] = l.loc.split(":");
  return k === "RAW"
    ? RM[l.item].n
    : k === "PLAIN"
      ? plainName(l.item) + " · " + LINE[u]
      : k === "WASTE"
        ? l.item + " waste"
        : pname(PM[l.item]) + " · " + PM[l.item].grade;
};
countValue = function (l, d) {
  const [k] = l.loc.split(":");
  return (
    d *
    (k === "RAW"
      ? COST.raw[l.item] || 0
      : k === "PLAIN"
        ? COST.plain
        : k === "WASTE"
          ? 0
          : S.kpb[l.item] * COST.coat + S.karRate)
  );
};

/* reports: stock valuation for the new stages; per-unit wage units */
AV.reports = (function (prev) {
  return function (u) {
    if ((S.ui.repTab || "gstr") !== "stockval")
      return prev(u).replace(
        /(Moulding|Pearl|Metalizing) ₹\/kg/g,
        (m, n) => n + (n === "Moulding" ? " ₹/kg" : " ₹/bunch"),
      );
    const R = [],
      th = S.thr.filter((l) => l.bunch > 0);
    RAW.forEach((r) => {
      const q = qty("RAW:" + r.unit, r.id, r.uom);
      if (q > 0)
        R.push([
          "Raw material",
          r.n,
          r.rm ? LINE[r.line] + " line" : UNITS[r.unit].n,
          n2(q),
          r.uom,
          n2(COST.raw[r.id] || 0),
          n2(q * (COST.raw[r.id] || 0)),
        ]);
    });
    ["P", "Z"].forEach((l) =>
      keysAt("PLAIN:" + l).forEach((k) => {
        const q = qty("PLAIN:" + l, k, "kg");
        R.push([
          "Moulded beads",
          plainName(k),
          LINE[l] + " line",
          n2(q),
          "kg",
          n2(COST.plain),
          n2(q * COST.plain),
        ]);
      }),
    );
    S.jobs.forEach((j) => {
      const b = jobBal(j).bal;
      if (b > 0)
        R.push([
          "With karigar",
          jobName(j),
          KM[j.kar].n,
          n2(b),
          "kg",
          n2(COST.plain),
          n2(b * COST.plain),
        ]);
    });
    th.forEach((l) =>
      R.push([
        l.status === "thr" ? "Threaded" : "In coating",
        plainName(l.key),
        LINE[l.line] + " line",
        n2(l.kg),
        "kg",
        n2(COST.plain + 12),
        n2(l.kg * (COST.plain + 12)),
      ]),
    );
    PRODUCTS.forEach((p) => {
      const q = qty("FIN:" + p.unit, p.id, "bunch"),
        c = S.kpb[p.id] * COST.coat + S.karRate;
      if (q > 0)
        R.push([
          "Ready to dispatch",
          pname(p) + " " + p.grade,
          LINE[p.unit],
          n2(q),
          "bunch",
          n2(c),
          n2(q * c),
        ]);
    });
    const rows = [
        [
          "Category",
          "Item",
          "Location",
          "Qty",
          "UOM",
          "Unit cost ₹",
          "Value ₹",
        ],
        ...R,
      ],
      cats = [...new Set(R.map((r) => r[0]))].map((c) => [
        c,
        sum(
          R.filter((r) => r[0] === c),
          (r) => +r[6],
        ),
      ]),
      tot = sum(cats, (c) => c[1]);
    rows.push(["Total", "", "", "", "", "", n2(tot)]);
    CSV.stockval = csvOf(rows);
    const tabs = [
      ["gstr", "GSTR-1"],
      ["wage", L("Operator wage", "Operator wages")],
      ["karwage", L("Karigar wage", "Karigar wages")],
      ["stockval", L("Stock ki keemat", "Stock valuation")],
      ["tally", "Tally XML"],
    ];
    return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l]) => `<button type="button" data-a="ui" data-k="repTab" data-val="${k}" aria-pressed="${k === "stockval"}">${l}</button>`).join("")}</div></div>
   <section class="card"><div class="card-h"><div><h3>${L("Stock ki keemat", "Stock valuation")}</h3><p>${L("Har stage ka stock aur andaazit keemat (sample cost).", "Stock at every stage with estimated value (sample costs).")}</p></div><button type="button" class="btn pri sm" data-a="copyCsv" data-k="stockval">${ic("sheet", 15)} ${L("CSV copy karo", "Copy CSV")}</button></div>
   <div class="kpis">${cats.map(([c, v]) => `<div class="kpi"><span>${c}</span><b>${rs(v)}</b></div>`).join("")}<div class="kpi"><span>${L("Kul", "Total")}</span><b>${rs(tot)}</b></div></div>${tableOf(rows, [3, 5, 6])}</section>`;
  };
})(AV.reports);

/* illustrations for the new steps */
Object.assign(ILLO, {
  task: () => `<rect x="22" y="22" width="78" height="106" rx="8" class="pap"/><rect x="46" y="16" width="30" height="12" rx="4" style="fill:var(--navy)"/>
  ${[0, 1, 2].map((i) => `<rect x="32" y="${44 + i * 24}" width="12" height="12" rx="3" style="fill:none;stroke:var(--navy)" stroke-width="1.6"/><path d="M50 ${50 + i * 24}h40" class="ln thin"/><g class="a-tick" style="${dl(0.4 + i * 0.5)}"><path d="M34 ${50 + i * 24}l3 3 6-7" style="stroke:var(--ok);fill:none" stroke-width="2.2" stroke-linecap="round"/></g>`).join("")}
  <rect x="40" y="112" width="42" height="10" rx="5" style="fill:var(--gold)"/>
  <g class="a-carry2"><path d="M108 75h22m-5-5 5 5-5 5" class="ln"/></g>
  <rect x="140" y="40" width="80" height="66" rx="10" style="fill:var(--u-m-soft);stroke:var(--navy)" stroke-width="2"/>
  <g class="a-spin"><circle cx="180" cy="73" r="15" style="fill:none;stroke:var(--navy)" stroke-width="7" stroke-dasharray="5 4.4"/></g><circle cx="180" cy="73" r="5" style="fill:var(--navy)"/>
  <text x="180" y="122" text-anchor="middle" class="it">M1 · 200 kg</text><line x1="16" y1="134" x2="224" y2="134" class="ln2"/>`,
  regrind:
    () => `<path d="M22 118l8-22 12 4 8-16 14 10 10-6 8 30z" style="fill:var(--surface-2);stroke:var(--muted)" stroke-width="1.6" stroke-linejoin="round"/>
  ${[
    [34, 104],
    [48, 96],
    [60, 108],
    [74, 100],
  ]
    .map(
      ([x, y]) =>
        `<rect x="${x}" y="${y}" width="6" height="4" rx="1" transform="rotate(20 ${x} ${y})" style="fill:var(--muted)"/>`,
    )
    .join("")}
  <text x="58" y="132" text-anchor="middle" class="it mu">Semi waste</text>
  <path d="M96 92c10-30 34-40 56-38" class="ln dash"/><path d="M148 48l6 6-8 3" class="ln"/>
  <path d="M160 30h48l-14 30h-20z" style="fill:var(--u-m-soft);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/><rect x="170" y="60" width="28" height="44" rx="4" class="pap"/>
  <g class="a-fall2">${bd(178, 38, 2.6, "white")}${bd(188, 36, 2.6, "white")}</g><g class="a-fall2" style="${dl(0.6)}">${bd(183, 42, 2.6, "white")}</g>
  <g class="a-spin"><circle cx="184" cy="82" r="9" style="fill:none;stroke:var(--navy)" stroke-width="5" stroke-dasharray="4 3.1"/></g>
  <text x="184" y="122" text-anchor="middle" class="it mu">Raw material</text><line x1="16" y1="134" x2="224" y2="134" class="ln2"/>`,
});

/* ---------- guide for the new flow ---------- */
JIL.splice(
  0,
  JIL.length,
  "inward",
  "task",
  "mould",
  "approve",
  "thread",
  "transfer",
  "coat",
  "slip",
  "dispatch",
);
JOURNEY.splice(
  0,
  JOURNEY.length,
  [
    ["Raw material inward", "Raw material inward"],
    [
      "Pearl line aur Metalizing line ka raw material alag hai. Admin material aur uska type (Semi, Super…) chun ke inward karta hai.",
      "Pearl and Metalizing lines use different raw materials. The Admin picks the material and its type (Semi, Super…) and records the inward.",
    ],
    ["admin"],
    "Inward",
  ],
  [
    ["Staff ko task", "Task to staff"],
    [
      "Admin batata hai: kaunsi machine, kaunsa bead, kaunsa raw material, kitna kg. Rang abhi ya baad mein.",
      "The Admin sets the machine, bead, raw material and kg. Colour now or later.",
    ],
    ["admin"],
    "Tasks → Naya task",
  ],
  [
    ["Moulding entry", "Moulding entry"],
    [
      "Staff har session ka achha maal aur waste kg mein daalta hai.",
      "Staff enter good kg and waste kg for each session.",
    ],
    ["staff"],
    "Entry Daalo",
  ],
  [
    ["Approve: beads + waste", "Approve: beads + waste"],
    [
      "Admin approve karta hai. Achha maal moulded stock mein, waste Waste page par type ke hisaab se (regrind ho sakta hai).",
      "The Admin approves. Good beads go to moulded stock, waste to the Waste page by type (can be reground).",
    ],
    ["admin"],
    "Approval · Waste",
  ],
  [
    ["Karigar threading", "Karigar threading"],
    [
      "Moulded beads kg mein karigar ko, challan ke saath.",
      "Moulded beads go to the karigar in kg, with a challan.",
    ],
    ["admin"],
    "Karigar → Karigar ko bhejo",
  ],
  [
    ["Threaded bunch aaye", "Threaded bunches back"],
    [
      'Wazan = beads + dhaaga. Admin inward karke "Move to Pearl coating" ya "Move to Metalizing" karta hai, raw material ki line ke hisaab se.',
      "Weight = beads + thread. The Admin receives them and moves them to Pearl or Metalizing coating, by the raw material line.",
    ],
    ["admin"],
    "Karigar → Wapas lo · Coating",
  ],
  [
    ["Coating + packing", "Coating + packing"],
    [
      "P1/P2 ya MZ1 ka staff lot chun ke coat aur pack hue bunch daalta hai. Rang yahan chunte hain agar pehle nahi chuna.",
      "P1/P2 or MZ1 staff pick a lot and enter coated, packed bunches. Colour is chosen here if not set earlier.",
    ],
    ["staff"],
    "Entry Daalo (coating)",
  ],
  [
    ["Final approval", "Final approval"],
    [
      'Admin approve karta hai, maal "Dispatch ke liye taiyaar" list mein.',
      "The Admin approves and the goods join the ready-to-dispatch list.",
    ],
    ["admin"],
    "Coating → Final approval",
  ],
  [
    ["Order, dispatch, bill", "Order, dispatch, bill"],
    [
      "Order, dispatch, GST ya kachcha bill, payment.",
      "Order, dispatch, GST or kachcha bill, payment.",
    ],
    ["admin"],
    "Orders · Dispatch · Khaata",
  ],
);
RHYTHM.splice(
  0,
  RHYTHM.length,
  [
    ["Subah", "Morning"],
    ["Shift Shuru, apna task dekho", "Start shift, check your task"],
    ["Home: alerts, raw material, idle machine ko task"],
  ],
  [
    ["Din bhar", "During the day"],
    [
      "Moulding: har session ka achha + waste. Coating: coat + pack bunch.",
      "Moulding: good + waste per session. Coating: coated + packed bunches.",
    ],
    [
      "Approval, inward, karigar bhejo / wapas lo, move to coating, final approval",
      "Approvals, inward, karigar send / receive, move to coating, final approval",
    ],
  ],
  [
    ["Jab order aaye", "When an order comes"],
    ["–", "–"],
    ["Order, dispatch, bill, payment", "Order, dispatch, bill, payment"],
  ],
  [
    ["Shaam", "Evening"],
    ["Shift Khatam", "End shift"],
    ["Koi entry approval mein na bache", "Leave no entry waiting"],
  ],
  [
    ["Hafte / mahine", "Weekly / monthly"],
    ["–", "–"],
    [
      "Ginti, waste regrind, karigar hisaab, wage, GSTR-1",
      "Counts, waste regrind, karigar accounts, wages, GSTR-1",
    ],
  ],
);
RHYTHM[0][2] = [
  "Home: alerts, raw material, khaali machine ko task",
  "Home: alerts, raw material, tasks for idle machines",
];
STORY.splice(
  0,
  STORY.length,
  [
    "a",
    ["Inward", "Inward"],
    [
      "500 kg GPPS Crylo (Pearl line) aaya.",
      "500 kg GPPS Crylo (Pearl line) arrives.",
    ],
    "Admin",
  ],
  [
    "a",
    ["Task", "Task"],
    [
      "M1 ko: 8MM Round Crylo TR, 200 kg, rang Red.",
      "To M1: 8MM Round Crylo TR, 200 kg, colour Red.",
    ],
    "Admin",
  ],
  [
    "s",
    ["Moulding entry", "Moulding entry"],
    [
      "210 kg lagaya, 200 kg achha, 8 kg waste.",
      "210 kg used, 200 kg good, 8 kg waste.",
    ],
    "Staff · M1",
  ],
  [
    "a",
    ["Approve", "Approve"],
    [
      "200 kg moulded stock, 8 kg Crylo waste page par.",
      "200 kg to moulded stock, 8 kg Crylo waste to the Waste page.",
    ],
    "Admin",
  ],
  [
    "a",
    ["Karigar ko", "To karigar"],
    [
      "150 kg Salim bhai ko, challan ke saath.",
      "150 kg to Salim bhai with a challan.",
    ],
    "Admin",
  ],
  [
    "a",
    ["Threaded aaya", "Threaded back"],
    [
      "290 bunch, 151 kg (dhaage ke saath).",
      "290 bunches, 151 kg (incl. thread).",
    ],
    "Admin",
  ],
  [
    "a",
    ["Move to Pearl coating", "Move to Pearl coating"],
    [
      "Crylo Pearl line ka hai, isliye Pearl coating.",
      "Crylo is a Pearl line material, so Pearl coating.",
    ],
    "Admin",
  ],
  [
    "s",
    ["Coating + packing", "Coating + packing"],
    [
      "P1: 290 liye, 284 pack, 6 reject.",
      "P1: 290 taken, 284 packed, 6 rejected.",
    ],
    "Staff · P1",
  ],
  [
    "a",
    ["Final approval", "Final approval"],
    ["284 bunch 8MM Round Red ready.", "284 bunches 8MM Round Red ready."],
    "Admin",
  ],
  [
    "a",
    ["Order + dispatch", "Order + dispatch"],
    [
      "Shree Ganesh Garments: 120 bunch dispatch.",
      "Shree Ganesh Garments: 120 bunches dispatched.",
    ],
    "Admin",
  ],
  [
    "a",
    ["Bill + payment", "Bill + payment"],
    ["GST bill, payment jama.", "GST bill, payment recorded."],
    "Admin",
  ],
);
UCS.splice(
  0,
  UCS.length,
  {
    id: "UC-01",
    r: ["admin"],
    t: ["Raw material list aur inward", "Raw material list and inward"],
    k: ["Supplier ka maal aaye", "Supplier goods arrive"],
    s: [
      [
        'Inward → "Naya raw material" (pehli baar): naam, line, type',
        'Inward → "New raw material" (first time): name, line, type',
      ],
      [
        '"+ Inward": material chuno (Pearl / Metalizing line, type ke saath)',
        '"+ Inward": pick the material (Pearl / Metalizing line, with type)',
      ],
      [
        "Kitna, bill no., rate, bill photo → Save",
        "Quantity, bill no., rate, bill photo → Save",
      ],
    ],
    o: [
      "Raw material stock line aur type ke hisaab se badhta hai.",
      "Raw material stock rises by line and type.",
    ],
    u: "admin",
    v: "maal",
  },
  {
    id: "UC-02",
    r: ["admin"],
    t: ["Staff ko task dena", "Assign a task"],
    k: ["Inward ke baad", "After inward"],
    s: [
      ['Tasks → "+ Naya task"', 'Tasks → "+ New task"'],
      [
        "Machine, line, raw material, size, shape, grade",
        "Machine, line, raw material, size, shape, grade",
      ],
      ['Rang abhi chuno ya "coating par"', 'Pick colour now or "at coating"'],
      ["Target kg → Task do", "Target kg → Assign"],
    ],
    o: [
      'Staff ke screen par "Mere task" mein dikhta hai.',
      'It shows under "My tasks" on the staff screen.',
    ],
    u: "admin",
    v: "tasks",
  },
  {
    id: "UC-03",
    r: ["staff"],
    t: ["Moulding entry (session)", "Moulding entry (session)"],
    k: ["Har session ke baad", "After each session"],
    s: [
      ['"Entry Daalo" → task chuno', '"Add entry" → pick the task'],
      [
        "Raw material lagaya, achha maal, waste (kg)",
        "Raw material used, good beads, waste (kg)",
      ],
      ["Save → slip + bori QR", "Save → slip + bag QR"],
    ],
    o: [
      "Entry Admin ke paas approval ke liye.",
      "The entry goes to the Admin for approval.",
    ],
    u: "stM1",
    v: "home",
  },
  {
    id: "UC-04",
    r: ["admin"],
    t: ["Moulding approve / reject", "Approve / reject moulding"],
    k: ["Staff ki entry aaye", "A staff entry arrives"],
    s: [
      ["Approval → entry check", "Approvals → check the entry"],
      ["Approve, ya note ke saath wapas", "Approve, or send back with a note"],
    ],
    o: [
      "Raw material ghatta, moulded beads badhte, waste Waste page par type ke hisaab se.",
      "Raw material goes down, moulded beads go up, waste goes to the Waste page by type.",
    ],
    u: "admin",
    v: "production",
    tk: "prodTab",
    tv: "pending",
  },
  {
    id: "UC-05",
    r: ["admin"],
    t: ["Waste regrind", "Regrind waste"],
    k: ["Waste jama ho jaaye", "When waste builds up"],
    s: [
      ['Waste → type par "Regrind"', 'Waste → "Regrind" on a type'],
      [
        "Same type ka raw material chuno, kg → Save",
        "Pick a raw material of the same type, kg → Save",
      ],
    ],
    o: [
      "Waste ghatta, raw material badhta. Record mein likha.",
      "Waste goes down, raw material goes up. Logged.",
    ],
    u: "admin",
    v: "waste",
  },
  {
    id: "UC-06",
    r: ["admin"],
    t: ["Karigar ko threading ke liye", "Send for threading"],
    k: ["Moulded beads taiyaar", "Moulded beads ready"],
    s: [
      ['Karigar → "Karigar ko bhejo"', 'Karigar → "Send to karigar"'],
      [
        "Karigar, moulded bead, rang plan (optional), kg",
        "Karigar, moulded bead, colour plan (optional), kg",
      ],
      ["Challan print / WhatsApp", "Print / WhatsApp the challan"],
    ],
    o: [
      "Karigar ke khaate mein kg baaki, din ginne lagte hain.",
      "The karigar's kg balance shows and days start counting.",
    ],
    u: "admin",
    v: "karigar",
  },
  {
    id: "UC-07",
    r: ["admin"],
    t: ["Threaded bunch inward", "Receive threaded bunches"],
    k: ["Karigar bunch lekar aaye", "The karigar brings bunches"],
    s: [
      ['Karigar → "Wapas lo"', 'Karigar → "Receive"'],
      [
        "Bunch, kul wazan (dhaage ke saath), dhaage ka wazan, loose, wastage",
        "Bunches, total weight (incl. thread), thread weight, loose, wastage",
      ],
      [
        '"Move to Pearl coating" / "Move to Metalizing"',
        '"Move to Pearl coating" / "Move to Metalizing"',
      ],
    ],
    o: [
      "Line raw material se tay hoti hai. Coating staff ko lot dikhne lagta hai.",
      "The line comes from the raw material. Coating staff now see the lot.",
    ],
    u: "admin",
    v: "karigar",
  },
  {
    id: "UC-08",
    r: ["staff"],
    t: ["Coating + packing entry", "Coating + packing entry"],
    k: ["Lot coat aur pack hone ke baad", "After a lot is coated and packed"],
    s: [
      [
        '"Entry Daalo" → threaded lot chuno',
        '"Add entry" → pick the threaded lot',
      ],
      [
        "Rang / final product (agar pehle nahi chuna)",
        "Colour / final product (if not set earlier)",
      ],
      [
        "Bunch liye, pack hue, reject, packet",
        "Bunches taken, packed, rejected, packets",
      ],
      ["Save → packing slip", "Save → packing slip"],
    ],
    o: [
      "Entry final approval ke liye Admin ke paas.",
      "The entry goes to the Admin for final approval.",
    ],
    u: "stP1",
    v: "home",
  },
  {
    id: "UC-09",
    r: ["admin"],
    t: ["Final approval", "Final approval"],
    k: ["Coating entry aaye", "A coating entry arrives"],
    s: [
      ["Coating → Final approval", "Coating → Final approval"],
      ["Approve ya wapas", "Approve or send back"],
    ],
    o: [
      'Maal "Dispatch ke liye taiyaar" stock mein.',
      "Goods join the ready-to-dispatch stock.",
    ],
    u: "admin",
    v: "coating",
  },
  {
    id: "UC-10",
    r: ["admin"],
    t: ["Order", "Order"],
    k: ["Party ka call", "A party calls"],
    s: [
      [
        '"+ Naya order" → party, product, qty, rate',
        '"+ New order" → party, product, qty, rate',
      ],
    ],
    o: [
      "Stock aur credit limit apne aap check.",
      "Stock and credit limit checked automatically.",
    ],
    u: "admin",
    v: "orders",
  },
  {
    id: "UC-11",
    r: ["admin"],
    t: ["Dispatch (aadha bhi)", "Dispatch (partial too)"],
    k: ["Maal taiyaar", "Goods ready"],
    s: [
      [
        "Dispatch → order → qty, gaadi no.",
        "Dispatch → order → qty, vehicle no.",
      ],
      ["Packing slip + carton QR", "Packing slip + carton QR"],
    ],
    o: [
      'Stock ghatta, "Bill banana baaki" mein jaata hai.',
      'Stock goes down; it moves to "Waiting to be billed".',
    ],
    u: "admin",
    v: "dispatch",
  },
  {
    id: "UC-12",
    r: ["admin"],
    t: ["Bill aur payment", "Bill and payment"],
    k: ["Dispatch ke baad", "After dispatch"],
    s: [
      [
        'Orders → "Bill banao" (GST / kachcha)',
        'Orders → "Make bill" (GST / kachcha)',
      ],
      ['Khaata → "+ Payment"', 'Accounts → "+ Payment"'],
    ],
    o: [
      "CGST/SGST ya IGST apne aap. Paisa purane bill se judta hai.",
      "CGST/SGST or IGST automatic. Money settles the oldest bill first.",
    ],
    u: "admin",
    v: "orders",
  },
  {
    id: "UC-13",
    r: ["admin"],
    t: ["Karigar hisaab band + payment", "Close karigar job + pay"],
    k: ["Karigar ka kaam poora", "A karigar job is finished"],
    s: [
      ['Karigar → "Hisaab band"', 'Karigar → "Close job"'],
      ["1.5% chhoot, zyada ho toh penalty", "1.5% allowance; penalty if over"],
      ['Khata → "+ Payment"', 'Khata → "+ Payment"'],
    ],
    o: [
      "Kamai, penalty, payment ek khate mein.",
      "Wages, penalties and payments in one account.",
    ],
    u: "admin",
    v: "karigar",
  },
  {
    id: "UC-14",
    r: ["staff"],
    t: ["Machine ruk gayi", "The machine stops"],
    k: ["Bijli, mould change, repair", "Power cut, mould change, repair"],
    s: [
      ['"Machine Ruki" → reason', '"Machine stopped" → reason'],
      ['"Machine Chalu"', '"Machine running again"'],
    ],
    o: [
      "Downtime record, Admin ko alert.",
      "Downtime recorded, the Admin is alerted.",
    ],
    u: "stM1",
    v: "home",
  },
  {
    id: "UC-15",
    r: ["staff"],
    t: ["Internet nahi hai", "No internet"],
    k: ["Net chala jaaye", "The net drops"],
    s: [
      ["Entry normal daalo", "Add entries as usual"],
      ["Net aate hi sync", "Syncs when the net is back"],
    ],
    o: ["Koi entry nahi khoti.", "Nothing is lost."],
    u: "stM1",
    v: "home",
  },
  {
    id: "UC-16",
    r: ["admin"],
    t: ["Stock ginti", "Stock count"],
    k: ["Hafte mein ek baar", "Once a week"],
    s: [
      ["Stock → Ginti → unit chuno", "Stock → Counts → pick the unit"],
      ["Gin ke daalo → farak dekho → Approve", "Count → review gaps → Approve"],
    ],
    o: ["Stock app se match.", "Stock matches the app."],
    u: "admin",
    v: "stock",
    tk: "stockTab",
    tv: "counts",
  },
  {
    id: "UC-17",
    r: ["admin"],
    t: ["Seedha stock jodna", "Add stock directly"],
    k: ["App shuru karte waqt", "When starting the app"],
    s: [
      ['Home → "Stock jodo"', 'Home → "Add stock"'],
      [
        "Raw / Moulded / Taiyaar / Waste → item, kitna",
        "Raw / Moulded / Ready / Waste → item, quantity",
      ],
    ],
    o: ["Opening stock ek baar mein.", "Opening stock in one go."],
    u: "admin",
    v: "home",
  },
  {
    id: "UC-18",
    r: ["admin"],
    t: ["Wage aur reports", "Wages and reports"],
    k: ["Mahine ke end", "Month end"],
    s: [
      [
        "Reports → Operator wage / Karigar wage / GSTR-1 / Tally",
        "Reports → Operator wages / Karigar wages / GSTR-1 / Tally",
      ],
      ["Copy karke Excel ya CA ko", "Copy into Excel or send to the CA"],
    ],
    o: ["Dobara likhne ki zarurat nahi.", "No re-typing."],
    u: "admin",
    v: "reports",
  },
  {
    id: "UC-19",
    r: ["admin"],
    t: ["Naya user / PIN reset", "New user / PIN reset"],
    k: ["Naya operator ya bhoola PIN", "A new operator or a forgotten PIN"],
    s: [
      [
        'Team → "+ Naya user" ya "PIN reset"',
        'Team → "+ New user" or "Reset PIN"',
      ],
    ],
    o: ["Usi din login.", "Log in the same day."],
    u: "admin",
    v: "team",
  },
);
Object.assign(UCIL, {
  "UC-01": "inward",
  "UC-02": "task",
  "UC-03": "mould",
  "UC-04": "approve",
  "UC-05": "regrind",
  "UC-06": "thread",
  "UC-07": "transfer",
  "UC-08": "coat",
  "UC-09": "slip",
  "UC-10": "dispatch",
  "UC-11": "dispatch",
  "UC-12": "bill",
  "UC-13": "khata",
  "UC-14": "stop",
  "UC-15": "offline",
  "UC-16": "count",
  "UC-17": "count",
  "UC-18": "expense",
  "UC-19": "team",
});
(() => {
  const a = ROLES.find((r) => r.r === "admin"),
    s = ROLES.find((r) => r.r === "staff");
  a.daily = [
    [
      "Raw material inward (line + type ke saath)",
      "Raw material inward (by line and type)",
    ],
    ["Machine ko task dena", "Assign tasks to machines"],
    [
      "Moulding entry approve ya wapas",
      "Approve or send back moulding entries",
    ],
    [
      "Moulded beads karigar ko, challan ke saath",
      "Moulded beads to karigars, with a challan",
    ],
    [
      'Threaded bunch inward, "Move to coating"',
      "Receive threaded bunches, move to coating",
    ],
    ["Coating entry ka final approval", "Final approval of coating entries"],
    ["Order, dispatch, bill, payment", "Orders, dispatch, bills, payments"],
  ];
  a.period = [
    ["Waste regrind", "Regrind waste"],
    ["Stock ginti, karigar hisaab", "Stock counts, karigar accounts"],
    ["Operator wage, GSTR-1, Tally", "Operator wages, GSTR-1, Tally"],
    ["Raw material list, rate, users", "Raw material list, rates, users"],
  ];
  a.sc = [
    "Home, Tasks, Approval, Karigar, Coating, Dispatch, Inward, Stock, Waste, Products, Orders, Khaata, Kharcha, Reports, Record, Team",
    "Home, Tasks, Approvals, Karigar, Coating, Dispatch, Inward, Stock, Waste, Products, Orders, Accounts, Expenses, Reports, Activity, Team",
  ];
  s.who = [
    "Moulding (M1–M2): task ke hisaab se achha maal + waste. Coating (P1–P2 Pearl, MZ1 Metalizing): coat + pack hue bunch.",
    "Moulding (M1–M2): good beads + waste against a task. Coating (P1–P2 Pearl, MZ1 Metalizing): coated + packed bunches.",
  ];
  s.daily = [
    [
      '"Shift Shuru", apna task / coating lot dekho',
      '"Start shift", check your task / coating lot',
    ],
    [
      "Moulding: har session ka achha + waste kg",
      "Moulding: good + waste kg per session",
    ],
    [
      "Coating: bunch liye, pack hue, reject, rang",
      "Coating: bunches taken, packed, rejected, colour",
    ],
    ["Slip / QR sticker", "Slip / QR sticker"],
    [
      'Machine ruke toh reason, "Shift Khatam"',
      'Reason when the machine stops, "End shift"',
    ],
  ];
})();
PERMS.splice(
  0,
  PERMS.length,
  [["Raw material list, inward", "Raw material list, inward"], "y", "x"],
  [["Task dena", "Assign tasks"], "y", "x"],
  [
    ["Moulding entry (task ke saath)", "Moulding entry (against a task)"],
    "y",
    "y:M1, M2|M1, M2",
  ],
  [
    ["Coating + packing entry", "Coating + packing entry"],
    "y",
    "y:P1, P2, MZ1|P1, P2, MZ1",
  ],
  [
    [
      "Entry approve / reject, final approval",
      "Approve / reject, final approval",
    ],
    "y",
    "x",
  ],
  [["Waste dekhna, regrind", "See waste, regrind"], "y", "x"],
  [
    [
      "Karigar bhejo / wapas lo / challan / hisaab",
      "Karigar send / receive / challan / accounts",
    ],
    "y",
    "x",
  ],
  [["Move to coating", "Move to coating"], "y", "x"],
  [
    ["Order, dispatch, bill, payment", "Orders, dispatch, bills, payments"],
    "y",
    "x",
  ],
  [["Stock jodna, ginti, reports", "Add stock, counts, reports"], "y", "x"],
  [["Apni kamai dekhna", "See own earnings"], "y", "y"],
  [
    ["Entry sudharna", "Edit an entry"],
    "y:kabhi bhi, log ke saath|any time, logged",
    "p:15 min tak|within 15 min",
  ],
  [["Users, PIN", "Users, PINs"], "y", "x"],
);

function kgEq(e) {
  return e.uom === "bunch" ? e.out * (S.kpb[e.product] || 0.5) : e.out;
}
