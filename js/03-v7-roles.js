"use strict";
/* ---------- v7: only two roles, Admin + Staff. Admin does all unit-manager work ---------- */
const deMgr = (s) =>
  String(s)
    .replace(/Pearl \/ Metalizing [Mm]anager/g, "Admin")
    .replace(/(Moulding|Pearl|Metalizing|Unit) Manager/g, "Admin")
    .replace(
      /\b(your |the )?[Mm]anagers?\b/g,
      (m, a) => (a === "the " ? "the " : "") + "Admin",
    );
const _ROLE_ADMIN = ["admin"];

/* nav with groups */
navItems = function (u) {
  if (u.role !== "admin") return [{ id: "home", i: "home", l: "Home" }];
  const g1 = L("Roz ka kaam", "Daily work"),
    g2 = L("Bikri aur paisa", "Sales & money"),
    g3 = L("Stock", "Stock"),
    g4 = "Admin";
  return [
    { id: "home", i: "home", l: "Home", g: g1 },
    {
      id: "production",
      i: "factory",
      l: "Production",
      b: pendingEntries().length,
      g: g1,
    },
    {
      id: "maal",
      i: "swap",
      l: L("Maal", "Material"),
      b: S.transfers.filter((t) => t.status === "transit").length,
      g: g1,
    },
    { id: "karigar", i: "thread", l: "Karigar", g: g1 },
    {
      id: "dispatch",
      i: "truck",
      l: "Dispatch",
      b: dispatchQueue().filter((o) =>
        o.lines.some((l) => l.disp < l.qty && lineAvail(l) > 0),
      ).length,
      g: g1,
    },
    { id: "orders", i: "receipt", l: "Orders", b: uninvoiced().length, g: g2 },
    { id: "khaata", i: "wallet", l: L("Khaata", "Accounts"), g: g2 },
    { id: "kharcha", i: "coins", l: L("Kharcha", "Expenses"), g: g2 },
    { id: "reports", i: "sheet", l: "Reports", g: g2 },
    {
      id: "stock",
      i: "box",
      l: "Stock",
      b: S.counts.filter((c) => c.status === "pending").length,
      g: g3,
    },
    { id: "products", i: "pearl", l: "Products", g: g3 },
    { id: "log", i: "list", l: L("Record", "Activity"), g: g4 },
    { id: "team", i: "users", l: "Team", g: g4 },
    { id: "guide", i: "book", l: "Guide", g: g4 },
  ];
};

/* production = approvals for every unit */
const _prodView = productionView;
AV.production = function () {
  const tab = S.ui.prodTab || "pending";
  if (tab !== "pending") return _prodView();
  const uf = S.ui.prodUnit || "all",
    n = pendingEntries().length;
  const tabs = [
    ["pending", L("Approval baaki", "Awaiting approval"), n],
    ["today", L("Aaj", "Today")],
    ["week", L("7 din", "7 days")],
  ];
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, c]) => `<button type="button" data-a="ui" data-k="prodTab" data-val="${k}" aria-pressed="${tab === k}">${l}${c ? `<span class="badge">${c}</span>` : ""}</button>`).join("")}</div>
   <div class="chips">${[["all", L("Sab units", "All units")], ...Object.keys(UNITS).map((k) => [k, UNITS[k].n])].map(([k, l]) => `<button type="button" class="chip" data-a="ui" data-k="prodUnit" data-val="${k}" aria-pressed="${uf === k}">${l}${k !== "all" && pendingEntries(k).length ? " · " + pendingEntries(k).length : ""}</button>`).join("")}</div></div>
   ${approveView(uf === "all" ? {} : { unit: uf })}`;
};

/* material: in transit, inward, history (all units) */
AV.maal = function () {
  const tab = ["in", "inward", "hist"].includes(S.ui.maalTab)
      ? S.ui.maalTab
      : "in",
    inc = S.transfers.filter((t) => t.status === "transit");
  const tabs = [
    ["in", L("Raste mein", "In transit"), inc.length],
    ["inward", "Inward", S.inwards.filter((i) => i.rate == null).length],
    ["hist", L("Record", "History")],
  ];
  let body = "";
  if (tab === "in")
    body = `<div class="card-h"><div><h3>${L("Raste mein maal", "Material in transit")}</h3><p>${L("Moulding se bheja gaya maal. Pahunchne par toul ke asli kg daalo. Farak hua toh Record aur alert mein dikhega.", "Material sent from Moulding. When it arrives, weigh it and enter the actual kg. Any gap shows in Activity and alerts.")}</p></div></div>
   ${inc.length ? `<div class="list">${inc.map((t) => `<form class="item" data-f="receive" data-id="${t.id}" style="flex-wrap:wrap">${pthumb()}<div class="grow" style="min-width:180px"><div class="t1">${esc(plainName(t.item))}</div><div class="t2">${UNITS[t.from].n} → ${uchip(t.to)} · ${L("Bheja", "Sent")} <b>${kg(t.sent)}</b> · ${fwhen(t.ts)}</div></div><div class="fld" style="width:130px"><label for="rv-${t.id}">${L("Mila (kg)", "Received (kg)")}</label><input id="rv-${t.id}" name="kg" type="number" inputmode="decimal" step="0.1" min="0" placeholder="${t.sent}" required></div><button class="btn pri" type="submit">${ic("check", 16)} ${L("Maal Mila", "Received")}</button></form>`).join("")}</div>` : `<div class="empty">${ic("check")}${L("Abhi kuch raste mein nahi", "Nothing in transit")}</div>`}`;
  else if (tab === "inward")
    body = `<div class="card-h"><div><h3>Raw material inward</h3><p>${L("Supplier se aaya maal, bill ki photo ke saath. Rate abhi pata na ho toh baad mein Khaata → Inward rate mein bharo.", "Goods from suppliers, with the bill photo. If the rate is not known yet, add it later in Accounts → Inward rates.")}</p></div><button type="button" class="btn pri sm" data-a="inward">${ic("plus", 15)} Inward</button></div>
   <div class="list">${
     S.inwards
       .slice()
       .sort((a, b) => b.ts - a.ts)
       .map(
         (i) =>
           `<div class="item"><span class="ico-c ${i.rate == null ? "warn" : "ok"}">${ic("inbox", 17)}</span><div class="grow"><div class="t1">${fq(i.qty, RM[i.mat].uom)} ${esc(RM[i.mat].n)} ${uchip(i.unit)}</div><div class="t2">${esc(i.supplier)} · Bill ${esc(i.bill)} · ${fwhen(i.ts)}</div></div><div class="end">${i.rate == null ? `<span class="pill warn">${L("Rate baaki", "No rate")}</span>` : `<b class="num">${rs(i.rate)}/${RM[i.mat].uom}</b>`}</div></div>`,
       )
       .join("") ||
     `<div class="empty">${L("Abhi koi inward nahi", "No inwards yet")}</div>`
   }</div>`;
  else
    body = `<div class="list">${
      S.transfers
        .slice()
        .sort((a, b) => b.ts - a.ts)
        .map((t) => {
          const diff = t.recv != null ? r1(t.recv - t.sent) : 0;
          return `<div class="item">${pthumb()}<div class="grow"><div class="t1">${esc(plainName(t.item))}</div><div class="t2">${UNITS[t.from].n} → ${UNITS[t.to].n} · ${fwhen(t.ts)}</div></div><div class="end"><b class="num">${kg(t.sent)}</b>${t.status === "transit" ? `<span class="pill warn">${L("Raste mein", "In transit")}</span>` : diff ? `<span class="pill bad">${L("Mila", "Got")} ${kg(t.recv)} (${diff} kg)</span>` : `<span class="pill ok">${L("Pura mila", "Fully received")}</span>`}</div></div>`;
        })
        .join("") ||
      `<div class="empty">${L("Koi record nahi", "No records")}</div>`
    }</div>`;
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, n]) => `<button type="button" data-a="ui" data-k="maalTab" data-val="${k}" aria-pressed="${tab === k}">${l}${n ? `<span class="badge">${n}</span>` : ""}</button>`).join("")}</div></div><section class="card">${body}</section>`;
};
AV.dispatch = () => dispatchView({});

/* inward: any unit, rate optional */
inwardModal = function () {
  const opt = Object.keys(UNITS)
    .map(
      (k) =>
        `<optgroup label="${UNITS[k].n}">${RAW.filter((r) => r.unit === k)
          .map((r) => `<option value="${r.id}">${r.n} (${r.uom})</option>`)
          .join("")}</optgroup>`,
    )
    .join("");
  openModal(
    "Raw material inward",
    L(
      "Material chuno, unit apne aap judegi",
      "Pick the material; its unit is set automatically",
    ),
    `<div class="row2"><div class="fld"><label for="is">Supplier</label><select id="is" name="supplier">${SUPPLIERS.map((s) => `<option>${s}</option>`).join("")}</select></div><div class="fld"><label for="ib">Bill no.</label><input id="ib" name="bill" required placeholder="SP/2301"></div></div>
  <div class="row2"><div class="fld"><label for="im">Material</label><select id="im" name="mat">${opt}</select></div><div class="fld"><label for="iq">${L("Kitna aaya", "Quantity")}</label><input id="iq" name="qty" type="number" inputmode="decimal" step="0.1" min="0" required></div></div>
  <div class="row2"><div class="fld"><label for="ir">${L("Rate ₹ (pata ho toh)", "Rate ₹ (if known)")}</label><input id="ir" name="rate" type="number" inputmode="decimal" step="0.01" min="0"></div><div class="fld"><label for="ip">${ic("camera", 14)} ${L("Bill ki photo", "Photo of the bill")}</label><input id="ip" name="photo" type="file" accept="image/*" capture="environment"></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "inward" },
  );
};
FORMS.inward = function (f) {
  const u = user(),
    q = +f.qty.value,
    b = f.bill.value.trim(),
    m = f.mat.value,
    unit = RM[m].unit,
    rt = +f.rate.value;
  if (!(q > 0) || !b) {
    (!b ? f.bill : f.qty).focus();
    return;
  }
  const ph = f.photo.files && f.photo.files[0] ? f.photo.files[0].name : "";
  move("RAW:" + unit, m, RM[m].uom, q);
  S.inwards.push({
    id: nid(),
    unit,
    supplier: f.supplier.value,
    mat: m,
    qty: q,
    bill: b,
    photo: ph,
    rate: rt > 0 ? rt : null,
    ts: Date.now(),
    by: u.n,
  });
  logA(
    `Inward: ${fq(q, RM[m].uom)} ${RM[m].n} · ${f.supplier.value}${rt > 0 ? " @ " + rs(rt) : ""}`,
    `Inward: ${fq(q, RM[m].uom)} ${RM[m].n} · ${f.supplier.value}${rt > 0 ? " @ " + rs(rt) : ""}`,
  );
  closeModal();
  toast(L("Inward save. Stock badh gaya.", "Inward saved. Stock increased."));
  render();
};

/* karigar send: products of both coating units */
karSendModal = function () {
  const ps = PRODUCTS.filter(
    (p) => p.unit !== "M" && qty("COAT:" + p.unit, p.id, "kg") > 0,
  );
  openModal(
    L("Karigar ko bhejo", "Send to karigar"),
    L("Coated maal threading ke liye", "Coated beads for threading"),
    ps.length
      ? `<div class="fld"><span class="lb">Karigar</span><div class="radios">${KARIGARS.map((k, i) => `<label><input type="radio" name="kar" value="${k.id}" ${i ? "" : "checked"}>${k.n}</label>`).join("")}</div></div>
  <div class="fld"><label for="kp">Product</label><select id="kp" name="product">${[
    "P",
    "Z",
  ]
    .map(
      (k) =>
        `<optgroup label="${UNITS[k].n}">${ps
          .filter((p) => p.unit === k)
          .map(
            (p) =>
              `<option value="${p.id}">${esc(pname(p))} · ${p.grade} · ${kg(qty("COAT:" + k, p.id, "kg"))}</option>`,
          )
          .join("")}</optgroup>`,
    )
    .join("")}</select></div>
  <div class="fld"><label for="kk">${L("Kitna (kg)", "How much (kg)")}</label><input id="kk" name="kg" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" required><span class="hint" id="kh"></span></div><div class="note" id="kslip"></div>`
      : `<div class="empty">${L('Abhi koi coated maal stock mein nahi. Pehle Pearl / Metalizing ki entry approve karo, ya "Stock jodo" se coated stock daalo.', 'No coated stock yet. Approve a Pearl / Metalizing entry first, or add coated stock with "Add stock".')}</div>`,
    ps.length
      ? `${cancelBtn()}<button class="btn pri" type="submit">${ic("send", 16)} ${L("Bhejo + challan banao", "Send + make challan")}</button>`
      : `<button type="button" class="btn" data-a="close">${L("Theek hai", "OK")}</button>`,
    ps.length ? { form: "karSend", live: "karSend" } : {},
  );
};
LIVE.karSend = function (f) {
  const p = PM[f.product.value];
  if (!p) return;
  const av = qty("COAT:" + p.unit, p.id, "kg"),
    v = +f.kg.value || 0,
    k = KM[f.kar.value];
  document.getElementById("kh").textContent =
    `Coated stock (${UNITS[p.unit].n}): ${kg(av)}${v > av ? " · " + L("itna stock nahi hai", "not enough stock") : ""}`;
  document.getElementById("kslip").innerHTML =
    `${ic("receipt", 16)}<span><b>Challan</b> · ${esc(k.n)} · ${esc(pname(p))} ${p.grade} · ${v ? kg(v) : "– kg"} · ~${v ? nf(v / S.kpb[p.id]) : "–"} bunch ${L("banenge (sample)", "expected (sample)")}</span>`;
};
FORMS.karSend = function (f) {
  const u = user(),
    pid = f.product.value,
    p = PM[pid],
    v = +f.kg.value;
  if (!p || !(v > 0) || v > qty("COAT:" + p.unit, pid, "kg")) {
    LIVE.karSend(f);
    f.kg.focus();
    return;
  }
  move("COAT:" + p.unit, pid, "kg", -v);
  const jb = {
    id: nid(),
    kar: f.kar.value,
    unit: p.unit,
    product: pid,
    sent: v,
    ts: Date.now(),
    by: u.n,
    receipts: [],
    challan: "JW/26-27/" + String(S.seq.jw++).padStart(4, "0"),
  };
  S.jobs.push(jb);
  logA(
    `${KM[jb.kar].n} ko ${kg(v)} ${pname(p)} bheja · ${jb.challan}`,
    `Sent ${kg(v)} ${pname(p)} to ${KM[jb.kar].n} · ${jb.challan}`,
  );
  render();
  challanModal(jb.id);
  toast(L("Bhej diya. Challan taiyaar.", "Sent. Challan ready."));
};

/* stock count: Admin counts any unit, reviews gaps, then approves */
countModal = function (unit) {
  const items = countItems(unit);
  let g = "";
  draft = { items, unit };
  openModal(
    L("Physical stock ginti", "Physical stock count"),
    `${UNITS[unit].n} · ${new Date().toLocaleDateString("en-IN")}`,
    `<div class="note">${ic("scale", 16)}<span>${L('Jo godown mein hai wahi gino aur toul ke daalo. System ka number jaan-boojh ke nahi dikhaya. Khaali chhoda toh "barabar" maana jaayega. Save ke baad farak dikhega, phir Approve karo.', "Count and weigh what is physically there. The system figure is hidden on purpose. Left blank means it matches. After saving you review the gaps, then approve.")}</span></div>
   ${
     items.length
       ? `<div class="list">${items
           .map((it, i) => {
             const h =
               it.g !== g
                 ? `<div class="eyebrow" style="margin-top:6px">${it.g}</div>`
                 : "";
             g = it.g;
             return (
               h +
               `<div class="toolbar cline"><label for="cc${i}" style="flex:1;min-width:0;font-size:13.5px">${esc(it.n)}</label><div class="phone-in" style="width:150px"><input id="cc${i}" name="c${i}" type="number" inputmode="decimal" step="0.1" min="0" style="font-size:16px;min-height:42px;padding:6px 10px;border:0;width:100%"><span style="font-size:12px;padding:0 10px">${it.uom}</span></div></div>`
             );
           })
           .join("")}</div>`
       : `<div class="empty">${L("Is unit mein abhi kuch stock nahi", "No stock in this unit yet")}</div>`
   }`,
    `${cancelBtn()}<button class="btn pri" type="submit" ${items.length ? "" : "disabled"}>${ic("check", 16)} ${L("Ginti save, farak dekho", "Save count, review gaps")}</button>`,
    { form: "count", wide: true, nofocus: true },
  );
};
FORMS.count = function (f) {
  const u = user(),
    items = draft.items,
    unit = draft.unit,
    lines = items.map((it, i) => {
      const v = f["c" + i].value,
        sys = qty(it.loc, it.item, it.uom);
      return {
        loc: it.loc,
        item: it.item,
        uom: it.uom,
        sys,
        cnt: v === "" ? sys : intUom(it.uom) ? Math.round(+v) : r1(+v),
      };
    });
  S.counts.push({
    id: nid(),
    unit,
    by: u.n,
    ts: Date.now(),
    status: "pending",
    lines,
  });
  const d = lines.filter((l) => Math.abs(l.cnt - l.sys) > 0.001).length;
  logA(
    `${UNITS[unit].n}: stock ginti (${d} farak)`,
    `${UNITS[unit].n}: stock count (${d} gaps)`,
  );
  closeModal();
  S.view = "stock";
  S.ui.stockTab = "counts";
  render();
  scrollTo(0, 0);
  toast(
    L(
      "Ginti save. Farak dekh ke Approve karo.",
      "Count saved. Review the gaps and approve.",
    ),
  );
};
countsAdmin = function () {
  const pend = S.counts.filter((c) => c.status === "pending"),
    done = S.counts
      .filter((c) => c.status !== "pending")
      .sort((a, b) => b.ts - a.ts);
  return `<div class="card-h"><div><h3>${L("Physical stock ginti", "Physical stock count")}</h3><p>${L("Hafte mein ek baar har unit gino. Save ke baad farak aur uski keemat dikhegi. Approve karne par stock theek ho jaata hai (Record mein likha).", "Count each unit once a week. After saving you see each gap and its value. Approving corrects the stock (written to Activity).")}</p></div>
   <div class="btns">${Object.keys(UNITS)
     .map(
       (k) =>
         `<button type="button" class="btn sm" data-a="countNew" data-u="${k}">${ic("plus", 14)} ${UNITS[k].n}</button>`,
     )
     .join("")}</div></div>
   <div class="list">${pend.map((c) => countCard(c, true)).join("") || `<div class="empty">${ic("scale")}${L("Koi ginti baaki nahi. Upar unit chun ke nayi ginti shuru karo.", "No counts waiting. Pick a unit above to start a count.")}</div>`}</div>${done.length ? `<div class="eyebrow">${L("Pichhli ginti", "Earlier counts")}</div><div class="list">${done.map((c) => countCard(c, true)).join("")}</div>` : ""}`;
};
ACT.countNew = (el) => countModal(el.dataset.u || "M");

/* team: add Staff or Admin */
addUserModal = function () {
  openModal(
    L("Naya user", "New user"),
    L("Machine operator ya doosra Admin", "Machine operator or another Admin"),
    `<div class="row2"><div class="fld"><label for="un">${L("Naam", "Name")}</label><input id="un" name="name" required></div><div class="fld"><label for="umob">Mobile</label><div class="phone-in"><span>+91</span><input id="umob" name="mobile" type="tel" inputmode="numeric" maxlength="11" required></div></div></div>
  <div class="fld"><span class="lb">Role</span><div class="radios"><label><input type="radio" name="role" value="staff" checked>Staff</label><label><input type="radio" name="role" value="admin">Admin</label></div></div>
  <div class="row2" id="umf"><div class="fld"><label for="uu">Unit</label><select id="uu" name="unit">${Object.keys(
    UNITS,
  )
    .map((k) => `<option value="${k}">${UNITS[k].n}</option>`)
    .join(
      "",
    )}</select></div><div class="fld"><label for="um">Machine</label><select id="um" name="machine"></select></div></div>
  <div class="note" id="uadm" hidden>${ic("lock", 16)}<span>${L("Admin ko sab dikhta hai: rate, paisa, profit, users. Sirf bharose wale partner ya accountant ko banao.", "An Admin sees everything: rates, money, profit, users. Only add a trusted partner or accountant.")}</span></div><p class="err" id="uerr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("plus", 16)} ${L("User banao", "Create user")}</button>`,
    { form: "addUser", live: "addUser" },
  );
};
LIVE.addUser = (f) => {
  const u = f.unit.value,
    role = f.querySelector("[name=role]:checked").value,
    sel = f.machine,
    cur = sel.value;
  sel.innerHTML = UNITS[u].machines
    .map((m) => `<option ${m === cur ? "selected" : ""}>${m}</option>`)
    .join("");
  document.getElementById("umf").hidden = role !== "staff";
  document.getElementById("uadm").hidden = role !== "admin";
};
FORMS.addUser = function (f) {
  const n = f.name.value.trim(),
    m = f.mobile.value.replace(/\D/g, "").slice(-10),
    role = f.querySelector("[name=role]:checked").value,
    unit = f.unit.value,
    mach = f.machine.value,
    err = document.getElementById("uerr");
  if (!n) {
    err.textContent = L("Naam daalo.", "Enter a name.");
    f.name.focus();
    return;
  }
  if (m.length !== 10) {
    err.textContent = L(
      "10 ank ka mobile number daalo.",
      "Enter a 10-digit mobile number.",
    );
    f.mobile.focus();
    return;
  }
  if (S.users.some((x) => x.mobile === m)) {
    err.textContent = L(
      "Yeh number pehle se kisi user ka hai.",
      "This number already belongs to a user.",
    );
    f.mobile.focus();
    return;
  }
  const u =
    role === "admin"
      ? {
          id: "u" + nid(),
          role,
          n,
          c: "var(--gold)",
          mobile: m,
          pin: String(Math.floor(1000 + Math.random() * 9000)),
          active: true,
          last: null,
          fails: 0,
        }
      : {
          id: "u" + nid(),
          role,
          unit,
          machine: mach,
          n,
          c: `var(${UNITS[unit].c})`,
          mobile: m,
          pin: String(Math.floor(1000 + Math.random() * 9000)),
          active: true,
          last: null,
          fails: 0,
        };
  S.users.push(u);
  logA(
    `Naya user: ${n} (${role === "staff" ? "Staff " + mach : "Admin"})`,
    `New user: ${n} (${role === "staff" ? "Staff " + mach : "Admin"})`,
  );
  render();
  newCredModal(u);
};

/* top-right actions, home quick actions, alerts */
const _taV7 = topAction;
topAction = function (u) {
  if (u.role === "admin") {
    if (S.view === "maal")
      return `<button type="button" class="btn" data-a="inward">${ic("inbox")}Inward</button><button type="button" class="btn pri" data-a="transferSend">${ic("send")}${L("Maal bhejo", "Send material")}</button>`;
    if (S.view === "karigar")
      return `<button type="button" class="btn pri" data-a="karSend">${ic("send")}${L("Karigar ko bhejo", "Send to karigar")}</button>`;
  }
  return _taV7(u);
};
const _gaV7 = getAlerts;
getAlerts = function () {
  const A = _gaV7();
  const tr = S.transfers.filter((t) => t.status === "transit");
  if (tr.length)
    A.unshift([
      "warn",
      "swap",
      L(
        `${tr.length} maal raste mein, pahunchne par "Maal Mila" karo`,
        `${tr.length} ${tr.length > 1 ? "loads" : "load"} in transit: confirm on arrival`,
      ),
      "maal",
    ]);
  const dq = dispatchQueue().filter((o) =>
    o.lines.some((l) => l.disp < l.qty && lineAvail(l) >= l.qty - l.disp),
  ).length;
  if (dq)
    A.push([
      "info",
      "truck",
      L(
        `${dq} order dispatch ke liye taiyaar`,
        `${dq} ${dq > 1 ? "orders" : "order"} ready to dispatch`,
      ),
      "dispatch",
    ]);
  return A.filter((a) => a[3] !== "production" || true);
};
ACT.quick = (el) => {
  ({
    inward: inwardModal,
    send: transferModal,
    kar: karSendModal,
    stock: addStockModal,
    order: newOrderModal,
  })[el.dataset.q]();
};

/* guide content for two roles */
JOURNEY.forEach((j) => {
  j[0] = j[0].map(deMgr);
  j[1] = j[1].map(deMgr);
  j[2] = [...new Set(j[2].map((r) => (r === "manager" ? "admin" : r)))];
  if (j[3] === "Approve") j[3] = "Production → Approval";
  if (j[3] === "Entry Daalo · Approve")
    j[3] = "Entry Daalo · Production → Approval";
  if (j[3] === "Orders · Dispatch") j[3] = "Orders → Dispatch";
});
JOURNEY[3][1] = [
  'Admin Moulding se bhejta hai. Pahunchne par toul ke "Maal Mila" karta hai, farak ho toh Record mein.',
  "The Admin sends from Moulding, then weighs and confirms on arrival. Any gap is recorded.",
];
RHYTHM.splice(
  0,
  RHYTHM.length,
  [
    ["Subah 8:00", "8:00 am"],
    ["Shift Shuru", "Start shift"],
    [
      "Home: maal ka safar, alerts, raw material",
      "Home: material journey, alerts, raw material",
    ],
  ],
  [
    ["Din bhar", "During the day"],
    [
      "Har batch ki entry, bori slip + QR. Machine ruke toh reason.",
      "An entry per batch, bag slip + QR. Reason when the machine stops.",
    ],
    [
      "Approval, inward, maal bhejo / Maal Mila, karigar, dispatch",
      "Approvals, inward, send / receive material, karigars, dispatch",
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
    [
      "Koi entry approval mein na bache. Aaj ka production check.",
      "Leave no entry waiting. Check today's production.",
    ],
  ],
  [
    ["Har hafte / mahine", "Weekly / monthly"],
    ["–", "–"],
    [
      "Stock ginti, karigar hisaab, wage, GSTR-1, Tally",
      "Stock count, karigar accounts, wages, GSTR-1, Tally",
    ],
  ],
);
STORY.forEach((s) => {
  if (s[0] === "m") s[0] = "a";
  s[3] = deMgr(s[3]);
  s[1] = s[1].map(deMgr);
  s[2] = s[2].map(deMgr);
});
gWorkflow = function () {
  return `<section class="card gsec"><h3>${L("Maal ka safar, step by step", "The material journey, step by step")}</h3><p>${L("Har tir ek entry hai. Kaun karta hai aur kis screen par, dono likha hai.", "Each arrow is an entry. It says who does it and on which screen.")}</p>
   <div class="procs">${JOURNEY.map(([t, d, r, sc], i) => `<article class="proc">${illo(JIL[i], P(t))}<div class="proc-b"><div class="toolbar"><span class="pnum">${String(i + 1).padStart(2, "0")}</span><div class="btns">${r.map(rchip).join("")}</div></div><h4>${P(t)}</h4><p>${P(d)}</p><span class="pill mute" style="justify-self:start">${sc}</span></div></article>`).join("")}</div></section>
  <section class="card gsec"><h3>${L("Roz ka rhythm", "The daily rhythm")}</h3><div class="tw"><table><thead><tr><th>${L("Kab", "When")}</th><th>Staff</th><th>Admin</th></tr></thead><tbody>${RHYTHM.map((r) => `<tr><td style="white-space:nowrap"><b>${P(r[0])}</b></td><td>${P(r[1])}</td><td>${P(r[2])}</td></tr>`).join("")}</tbody></table></div></section>
  <section class="card gsec"><h3>${L("Ek order ki kahani", "One order, start to finish")}</h3><p>${L('Example party "Shree Ganesh Garments" ka order, dono roles ke saath.', 'An example order from "Shree Ganesh Garments", across both roles.')}</p>
   <div class="lanes two"><div class="lane-h uchip k" style="display:block">Admin</div><div class="lane-h uchip m" style="display:block">Staff</div>
   ${STORY.map(([l, t, d, w], i) => `<div class="ev ${l}"><span class="n"><i></i>${i + 1}<span class="whom"> · ${w}</span></span><b>${P(t)}</b><span>${P(d)}</span></div>`).join("")}</div></section>`;
};
(() => {
  const i15 = UCS.findIndex((u) => u.id === "UC-15");
  if (i15 > -1) UCS.splice(i15, 1);
  UCS.forEach((u) => {
    u.r = [...new Set(u.r.map((r) => (r === "manager" ? "admin" : r)))];
    u.t = u.t.map(deMgr);
    u.k = u.k.map(deMgr);
    u.s = u.s.map((s) => s.map(deMgr));
    u.o = u.o.map(deMgr);
    if (/^mgr/.test(u.u)) u.u = "admin";
    if (u.v === "approve") {
      u.v = "production";
      u.tk = "prodTab";
      u.tv = "pending";
    }
  });
  const g = (id) => UCS.find((u) => u.id === id);
  g("UC-01").s[3] = [
    "Rate pata ho toh abhi, warna baad mein Khaata → Inward rate",
    "Add the rate now if known, or later in Accounts → Inward rates",
  ];
  g("UC-01").o = [
    "Stock turant badhta hai, bill photo ke saath.",
    "Stock rises at once, with the bill photo kept.",
  ];
  g("UC-03").s[0] = [
    "Production → Approval kholo",
    "Open Production → Approval",
  ];
  g("UC-03").s.splice(1, 0, [
    "Unit chuno ya sab ek saath dekho",
    "Filter by unit or see all",
  ]);
  g("UC-04").s[0] = ['Maal → "Maal bhejo"', 'Material → "Send material"'];
  g("UC-05").s[0] = ["Maal → Raste mein", "Material → In transit"];
  g("UC-13").o = [
    "Downtime minute mein record. Admin ko machine ki haalat Production mein dikhti hai.",
    "Downtime is recorded in minutes. The Admin sees machine status under Production.",
  ];
  g("UC-23").s = [
    [
      "Stock → Ginti approval → unit chuno",
      "Stock → Count approvals → pick the unit",
    ],
    [
      "Har item gin/toul ke daalo (system number chhupa)",
      "Count or weigh each item (system figure hidden)",
    ],
    [
      "Save: har farak aur uski ₹ keemat dikhti hai",
      "Save: every gap and its ₹ value is shown",
    ],
    ["Approve, ya reason ke saath wapas", "Approve, or reject with a reason"],
  ];
  g("UC-23").u = "admin";
  g("UC-23").v = "stock";
  g("UC-23").tk = "stockTab";
  g("UC-23").tv = "counts";
})();
ROLES.splice(
  0,
  ROLES.length,
  {
    r: "admin",
    n: ["Admin (Owner)", "Admin (Owner)"],
    who: [
      "Malik. Teeno unit ka saara kaam: approval, maal, karigar, dispatch, paisa. Zarurat ho toh ek se zyada Admin (partner ya accountant).",
      "The owner. All work across the three units: approvals, material, karigars, dispatch, money. More than one Admin is possible (a partner or accountant).",
    ],
    daily: [
      [
        "Subah Home: maal ka safar, alerts, raw material",
        "Morning Home: material journey, alerts, raw material",
      ],
      [
        "Staff ki entry approve ya wapas (Production → Approval)",
        "Approve or send back staff entries (Production → Approval)",
      ],
      [
        "Raw material inward, bill photo ke saath",
        "Raw material inward, with the bill photo",
      ],
      [
        'Moulding se plain beads bhejna, pahunchne par "Maal Mila"',
        "Send plain beads from Moulding, confirm on arrival",
      ],
      [
        "Karigar ko maal + challan, wapas lena, hisaab band",
        "Send to karigars with a challan, receive back, close jobs",
      ],
      [
        "Order lena, dispatch, bill, payment",
        "Take orders, dispatch, bill, record payments",
      ],
    ],
    period: [
      [
        "Hafte mein: har unit ki stock ginti, karigar pending",
        "Weekly: stock count per unit, karigar balances",
      ],
      [
        "Mahine mein: operator wage, karigar wage, GSTR-1, Tally",
        "Monthly: operator wages, karigar wages, GSTR-1, Tally",
      ],
      [
        "Rate list, piece rate, kg/bunch",
        "Rate list, piece rates, kg per bunch",
      ],
      ["Users, PIN, credit limit", "Users, PINs, credit limits"],
    ],
    acc: [
      ["Stock app se match kare", "Stock matches the app"],
      ["Rate, bill aur paisa sahi ho", "Rates, bills and money are right"],
      [
        "Koi entry raat bhar approval mein na atke",
        "No entry waits overnight for approval",
      ],
      ["Bheja-mila aur karigar ka farak", "Sent-vs-received and karigar gaps"],
    ],
    sc: [
      "Home, Production, Maal, Karigar, Dispatch, Orders, Khaata, Kharcha, Reports, Stock, Products, Record, Team",
      "Home, Production, Material, Karigar, Dispatch, Orders, Accounts, Expenses, Reports, Stock, Products, Activity, Team",
    ],
    no: [
      ["Kuch chhupa nahi", "Nothing is hidden"],
      [
        "Entry delete nahi kar sakta, sirf reverse",
        "Cannot delete entries, only reverse them",
      ],
    ],
  },
  {
    r: "staff",
    n: ["Staff (Machine operator)", "Staff (Machine operator)"],
    who: [
      "Har machine ka operator: Moulding M1–M2, Pearl P1–P2, Metalizing MZ1. Kamai piece-rate (₹ per kg achha maal).",
      "The operator of each machine: Moulding M1–M2, Pearl P1–P2, Metalizing MZ1. Paid piece-rate (₹ per good kg).",
    ],
    daily: [
      [
        'Machine garam hone ke baad "Shift Shuru"',
        '"Start shift" once the machine is hot',
      ],
      [
        'Har batch toul ke "Entry Daalo"',
        '"Add entry" after weighing each batch',
      ],
      [
        "Slip aur har bori par QR sticker",
        "A slip and a QR sticker on every bag",
      ],
      [
        "Machine ruke toh turant reason",
        "Log the reason as soon as the machine stops",
      ],
      ['Shift ke end mein "Shift Khatam"', '"End shift" at the end'],
    ],
    period: [
      [
        "Admin ne wapas bheji entry sudharna",
        "Fix entries the Admin sends back",
      ],
    ],
    acc: [
      ["Sahi weight, andaaza nahi", "Correct weights, never guesses"],
      ["Sahi bori par sahi sticker", "The right sticker on the right bag"],
      ["Downtime ka sahi reason", "The right downtime reason"],
      ["Apna PIN kisi ko na dena", "Not sharing their PIN"],
    ],
    sc: [
      "Ek screen: Shift Shuru, Entry Daalo, Machine Ruki, Shift Khatam, Madad",
      "One screen: Start shift, Add entry, Machine stopped, End shift, Help",
    ],
    no: [
      ["Bechne ka rate, bill, payment", "Selling rates, bills, payments"],
      ["Doosri machine aur stock", "Other machines and stock"],
      [
        "15 minute baad purani entry badalna",
        "Editing an entry after 15 minutes",
      ],
    ],
  },
);
PERMS.splice(
  0,
  PERMS.length,
  [
    ["Machine production entry", "Machine production entry"],
    "y",
    "y:apni machine|own machine",
  ],
  [["Entry approve / wapas", "Approve / send back entries"], "y", "x"],
  [
    ["Raw material inward (rate ke saath)", "Raw material inward (with rate)"],
    "y",
    "x",
  ],
  [
    ["Unit se unit maal bhejna / Maal Mila", "Send / receive between units"],
    "y",
    "x",
  ],
  [
    ["Karigar bhejo / wapas lo / challan", "Karigar send / receive / challan"],
    "y",
    "x",
  ],
  [
    [
      "Karigar hisaab band, penalty, payment",
      "Close karigar jobs, penalty, payment",
    ],
    "y",
    "x",
  ],
  [["Dispatch, packing slip", "Dispatch, packing slip"], "y", "x"],
  [["Order, rate, bill, payment", "Orders, rates, bills, payments"], "y", "x"],
  [
    ["Kharcha, profit, reports, export", "Expenses, profit, reports, exports"],
    "y",
    "x",
  ],
  [
    [
      "Stock jodna, ginti, adjust / reverse",
      "Add stock, count, adjust / reverse",
    ],
    "y",
    "x",
  ],
  [
    ["Bori slip / QR sticker", "Bag slip / QR sticker"],
    "y",
    "y:apni entry|own entries",
  ],
  [["Apni piece-rate kamai dekhna", "See own piece-rate earnings"], "y", "y"],
  [
    ["Entry sudharna", "Edit an entry"],
    "y:kabhi bhi, log ke saath|any time, logged",
    "p:15 min tak|within 15 min",
  ],
  [["Users, PIN, settings", "Users, PINs, settings"], "y", "x"],
);
gRoles = function () {
  const node = (cls, b, s) =>
      `<div class="node ${cls}"><b>${b}</b><small>${s}</small></div>`,
    ulist = (a, cls = "") =>
      `<ul class="${cls}">${a.map((x) => `<li>${P(x)}</li>`).join("")}</ul>`;
  const staffOf = (k) =>
    UNITS[k].machines
      .map((m) => {
        const su = S.users.find(
          (x) => x.role === "staff" && x.machine === m && x.active,
        );
        return `<span class="schip">${m} · ${esc(su ? su.n : MSTAFF[m] || "Staff")}</span>`;
      })
      .join("");
  return `<section class="card gsec"><h3>${L("Kaun kiske neeche", "Who reports to whom")}</h3><div class="treewrap"><div class="tree">
   ${node("top", "Admin · Owner", L("Teeno unit ka saara kaam, paisa, users", "All three units, money, users"))}<div class="vline"></div>
   <div class="tier">${["M", "P", "Z"].map((k) => `<div class="branch">${node(UNITS[k].cls, UNITS[k].n, L("Staff (machine operator)", "Staff (machine operators)"))}<div class="staffs">${staffOf(k)}</div></div>`).join("")}
   <div class="kar-band">${ic("thread", 14)} ${L("Karigar (bahar ke, login nahi). Inka maal, challan aur hisaab Admin rakhta hai.", "Karigars (outside, no login). The Admin handles their material, challans and accounts.")}</div></div></div></div></section>
  <div class="rgrid">${ROLES.map(
    (
      R,
    ) => `<article class="rcard">${rchip(R.r)}<h4>${P(R.n)}</h4><p class="muted" style="font-size:13.5px">${P(R.who)}</p>
   <div><div class="lb">${L("Roz ki zimmedari", "Daily responsibilities")}</div>${ulist(R.daily)}</div><div><div class="lb">${L("Hafte / mahine mein", "Weekly / monthly")}</div>${ulist(R.period)}</div>
   <div><div class="lb">${L("Kis cheez ka jawabdeh", "Accountable for")}</div>${ulist(R.acc, "acc")}</div><div><div class="lb">${L("App mein screens", "Screens in the app")}</div><p style="font-size:13.5px;margin-top:4px">${P(R.sc)}</p></div>
   <div><div class="lb">${L("Nahi dikhta / nahi kar sakta", "Cannot see / cannot do")}</div>${ulist(R.no, "no")}</div></article>`,
  ).join("")}</div>
  <section class="card gsec"><h3>${L("Bahar ke log (login nahi)", "Outside people (no login)")}</h3><div class="grid-3">
   <div class="rolebox"><span class="uchip k">Karigar</span><ul><li>${L("Kg mein maal leta hai, bunch mein lautata hai", "Takes kg, returns bunches")}</li><li>${L("Challan WhatsApp / print par", "Gets the challan on WhatsApp / print")}</li><li>${L("Hisaab Admin rakhta hai", "The Admin keeps the account")}</li></ul></div>
   <div class="rolebox"><span class="uchip p">Party · customer</span><ul><li>${L("Order phone ya WhatsApp par", "Orders by phone or WhatsApp")}</li><li>${L("Bill aur reminder WhatsApp par", "Bills and reminders on WhatsApp")}</li><li>${L("Credit limit Admin tay karta hai", "The Admin sets the credit limit")}</li></ul></div>
   <div class="rolebox"><span class="uchip m">Supplier</span><ul><li>${L("GPPS, coating material, bags", "GPPS, coating materials, bags")}</li><li>${L("Admin inward karta hai, rate ke saath", "The Admin records inward, with the rate")}</li></ul></div></div></section>
  <section class="card gsec"><h3>${L("Kaun kya kar sakta hai", "Who can do what")}</h3><div class="tw"><table><thead><tr><th>${L("Kaam", "Task")}</th><th class="c">Admin</th><th class="c">Staff</th></tr></thead><tbody>${PERMS.map((p) => `<tr><td>${P(p[0])}</td>${permCell(p[1])}${permCell(p[2])}</tr>`).join("")}</tbody></table></div>
   <p class="muted" style="font-size:12.5px">${L("✓ kar sakta hai · peela = shart ke saath · – nahi kar sakta", "✓ can · amber = with conditions · – cannot")}</p></section>`;
};

/* migrate stored data: drop manager logins, keep everything else */
function migrateV7() {
  S.users = S.users.filter((u) => u.role !== "manager");
  const has = (id) => S.users.some((u) => u.id === id);
  if (S.user && !has(S.user)) S.user = null;
  if (S.lastUser && !has(S.lastUser)) S.lastUser = null;
  if (S.login && S.login.uid && !has(S.login.uid))
    S.login = { step: "phone", phone: "", pin: "", err: "", uid: null };
  if (S.view === "approve") S.view = "production";
  if (S.ui.maalTab === "count") S.ui.maalTab = "in";
}
