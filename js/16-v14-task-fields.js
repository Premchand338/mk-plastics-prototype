'use strict';
/* ===== v14.7 · Section 5: line routing + coating task form · client review 24 Nov · V8, V9, V12 =====
   5.1 Pearl goods go to the Pearl unit, Metalizing goods to Metalizing: already built in. The line comes from the raw
       material (moulding task → moulded stock PLAIN:P/Z → karigar job → threaded lot → coating queue), and a coating
       task only lists lots of its machine's line. This layer only makes the line visible on the coating task form.
   5.2 Pearl first; Metal coating requirements come later (owner): no change.
   5.3 the owner's own coating-task format: he will send how he writes a task by hand (Q6, not received yet).
       So nothing is guessed: the owner adds his own boxes (number / text / tick) under "Task ke box", and every new
       coating task shows them. When his message comes, the boxes are added here, no code change. */

const _initV14g = initV14;
initV14 = function () {
  _initV14g();
  S.taskFields = S.taskFields || []; // [{id, n: label, k: "num"|"text"|"check", u: unit}]
};
const TF_KINDS = () => [
  ["num", L("Number", "Number")],
  ["text", L("Likhne ka", "Text")],
  ["check", L("Tick (haan / nahi)", "Tick (yes / no)")],
];
const tfVal14 = (f, v) => (f.k === "check" ? (v ? L("Haan", "Yes") : L("Nahi", "No")) : `${esc(String(v))}${f.u ? " " + esc(f.u) : ""}`);

/* ---------- coating task form: owner's boxes + the line it routes to ---------- */
const _ctmV147 = coatTaskModal;
coatTaskModal = function (pre) {
  _ctmV147(pre);
  const f = document.querySelector("form[data-f=coatTask]");
  if (!f) return;
  const fs = S.taskFields || [],
    admin = (user() || {}).role === "admin",
    note = f.note.closest(".row2") || f.note.closest(".fld");
  note.insertAdjacentHTML(
    "afterend",
    `<div class="tf14" id="tf14">${
      fs.length
        ? `<div class="eyebrow">${L("Owner ke task ke box", "Owner's task boxes")}</div>${fs
            .map((x) =>
              x.k === "check"
                ? `<label class="chk"><input type="checkbox" name="tf_${x.id}"> ${esc(x.n)}</label>`
                : `<div class="fld"><label for="tf_${x.id}">${esc(x.n)}${x.u ? ` (${esc(x.u)})` : ""}</label><input id="tf_${x.id}" name="tf_${x.id}" ${x.k === "num" ? 'type="number" inputmode="decimal" step="any" min="0"' : ""}></div>`,
            )
            .join("")}`
        : `<p class="psub">${L("Owner jaise haath se task likhte hain, woh box yahan jod sakte ho (Q6).", "Add the boxes the owner writes on a task by hand here (Q6).")}</p>`
    }${admin ? `<button type="button" class="btn sm" data-a="taskFields14" style="justify-self:start">${ic("edit", 14)} ${L("Task ke box", "Task boxes")}</button>` : ""}</div>`,
  );
  f.querySelector(".radios")?.insertAdjacentHTML("afterend", `<span class="hint" id="tfline"></span>`);
  if (typeof tapRefresh === "function") tapRefresh();
  LIVE.coatTask(f);
};
const _lctV147 = LIVE.coatTask;
LIVE.coatTask = (f) => {
  _lctV147(f);
  const h = document.getElementById("tfline"),
    m = f.querySelector("[name=machine]:checked");
  if (!h || !m) return;
  const line = lineOfM(m.value),
    n = S.thr.filter((l) => l.status === "cq" && l.line === line && l.bunch > 0).length;
  h.textContent = L(
    `${LINE[line]} line · sirf ${LINE[line]} raw material ka maal (${n} lot coating mein)`,
    `${LINE[line]} line · only goods from ${LINE[line]} raw material (${n} lots in coating)`,
  );
};
const _fctV147 = FORMS.coatTask;
FORMS.coatTask = (f) => {
  const vals = {};
  (S.taskFields || []).forEach((x) => {
    const el = f["tf_" + x.id];
    if (!el) return;
    const v = x.k === "check" ? el.checked : el.value.trim();
    if (x.k === "check" ? v : v !== "") vals[x.id] = x.k === "num" ? +v : v;
  });
  const n0 = S.tasks.length;
  _fctV147(f);
  if (S.tasks.length === n0 || !Object.keys(vals).length) return;
  S.tasks[S.tasks.length - 1].tf = vals;
  save();
  render();
};
/* task card (admin + staff): the owner's boxes */
const _tc9V147 = taskCard9;
taskCard9 = function (t, mode) {
  const h = _tc9V147(t, mode);
  if (t.kind !== "coat" || !t.tf) return h;
  const parts = (S.taskFields || []).filter((x) => t.tf[x.id] !== undefined).map((x) => `${esc(x.n)}: <b>${tfVal14(x, t.tf[x.id])}</b>`);
  if (!parts.length) return h;
  const i = h.indexOf('<div class="yield"');
  return i < 0 ? h : h.slice(0, i) + `<div class="t2 tfv14">${parts.join(" · ")}</div>` + h.slice(i);
};

/* ---------- 5.3 the owner manages his boxes ---------- */
let tfBack14 = false; // opened from the coating task form → go back to it after saving
ACT.taskFields14 = () => {
  if ((user() || {}).role !== "admin") return;
  tfBack14 = !!document.querySelector("form[data-f=coatTask]");
  const fs = S.taskFields || [],
    kinds = TF_KINDS();
  const kindOpts = (sel) => kinds.map(([k, l]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${l}</option>`).join("");
  openModal(
    L("Coating task ke box", "Coating task boxes"),
    L("Owner haath se task mein jo likhte hain, uske box. Naye task mein dikhenge.", "Boxes for what the owner writes on a task by hand. They show on new tasks."),
    `${fs.length ? fs.map((x, i) => `<div class="tfrow"><div class="fld"><label for="tfn${i}">${L("Naam", "Name")}</label><input id="tfn${i}" name="n${i}" value="${esc(x.n)}"></div><div class="fld"><label for="tfk${i}">Type</label><select id="tfk${i}" name="k${i}">${kindOpts(x.k)}</select></div><div class="fld"><label for="tfu${i}">Unit</label><input id="tfu${i}" name="u${i}" value="${esc(x.u || "")}" placeholder="kg"></div><label class="chk"><input type="checkbox" name="del${i}"> ${L("Hatao", "Remove")}</label></div>`).join("") : `<p class="psub">${L("Abhi koi box nahi.", "No boxes yet.")}</p>`}
     <div class="eyebrow">${L("Naya box", "New box")}</div>
     <div class="tfrow"><div class="fld"><label for="tfnn">${L("Naam", "Name")}</label><input id="tfnn" name="nn" placeholder="${L("Jaise: Lacquer", "e.g. Lacquer")}"></div><div class="fld"><label for="tfkn">Type</label><select id="tfkn" name="kn">${kindOpts("num")}</select></div><div class="fld"><label for="tfun">Unit</label><input id="tfun" name="un" placeholder="kg"></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "taskFields14", wide: true },
  );
};
FORMS.taskFields14 = (f) => {
  const fs = S.taskFields || [];
  const keep = fs
    .map((x, i) => (f["del" + i].checked ? null : Object.assign(x, { n: f["n" + i].value.trim() || x.n, k: f["k" + i].value, u: f["u" + i].value.trim() })))
    .filter(Boolean);
  const nn = f.nn.value.trim();
  if (nn) keep.push({ id: "tf" + nid(), n: nn, k: f.kn.value, u: f.un.value.trim() });
  S.taskFields = keep;
  logA(`Coating task ke box: ${keep.map((x) => x.n).join(", ") || "–"}`, `Coating task boxes: ${keep.map((x) => x.n).join(", ") || "–"}`);
  closeModal();
  render();
  if (tfBack14) coatTaskModal();
  tfBack14 = false;
  toast(L("Box save ho gaye. Naye task mein dikhenge.", "Boxes saved. They show on new tasks."));
};

/* ---------- Hindi words used above ---------- */
Object.entries({ box: "बॉक्स", likhte: "लिखते", likhne: "लिखने", tick: "टिक" }).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
