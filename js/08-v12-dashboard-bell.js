"use strict";
/* ---------- v12: admin home dashboard + "Dhyan do" bell. Reads the same data, changes nothing. ---------- */
ICONS.bell =
  ICONS.bell ||
  '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>';
ICONS.trend =
  ICONS.trend || '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>';
ICONS.rupee =
  ICONS.rupee || '<path d="M6 4h12M6 9h12M13 20 6 13h3a4 4 0 0 0 0-9"/>';
const D12 = { sevRank: { bad: 0, warn: 1, info: 2 } };

/* ----- bell ----- */
function alertGroup(a) {
  const v = a[3];
  return v === "production" || v === "approve"
    ? ["appr", L("Approval", "Approvals"), "check"]
    : v === "stock"
      ? ["stock", L("Stock", "Stock"), "box"]
      : /orders|khaata|dispatch/.test(v)
        ? ["money", L("Order aur paisa", "Orders and money"), "receipt"]
        : /karigar|coating|tasks/.test(v)
          ? ["work", L("Kaam aur karigar", "Work and karigars"), "thread"]
          : ["other", L("Baaki", "Other"), "alert"];
}
function bellHTML() {
  const A = getAlerts(),
    bad = A.filter((a) => a[0] === "bad").length,
    warn = A.filter((a) => a[0] === "warn").length;
  return `<div class="bellw"><button type="button" class="bell${A.length ? " has" : ""}${bad ? " bad" : ""}" data-a="bell" aria-expanded="false" aria-haspopup="dialog" aria-label="${L("Dhyan do", "Needs attention")}: ${A.length}">${ic("bell", 19)}${A.length ? `<span class="bdg">${A.length > 99 ? "99+" : A.length}</span>` : ""}</button>
   <div class="bellp" role="dialog" aria-label="${L("Dhyan do", "Needs attention")}" hidden></div></div>`;
}
function bellPanel() {
  const A = getAlerts()
      .slice()
      .sort((x, y) => D12.sevRank[x[0]] - D12.sevRank[y[0]]),
    g = {},
    order = [];
  A.forEach((a) => {
    const [k, n, i] = alertGroup(a);
    if (!g[k]) {
      g[k] = { n, i, l: [] };
      order.push(k);
    }
    g[k].l.push(a);
  });
  const cnt = (s) => A.filter((a) => a[0] === s).length;
  const row = ([s, i, t, v, tab]) =>
    `<button type="button" class="bi" data-a="nav" data-v="${v}" ${tab ? `data-tab="${tab}"` : ""}><i class="sd ${s}"></i><span>${esc(t)}</span>${ic("chev", 14)}</button>`;
  return `<div class="bp-h"><div><b>${L("Dhyan do", "Needs attention")}</b><small>${A.length ? L(`${A.length} cheezein dekhni hain`, `${A.length} things to check`) : L("Sab theek hai", "All clear")}</small></div><button type="button" class="xbtn" data-a="bellClose" aria-label="${L("Band karo", "Close")}">${ic("x", 16)}</button></div>
   ${
     A.length
       ? `<div class="bp-s">${[
           ["bad", L("Zaroori", "Urgent")],
           ["warn", L("Dhyan", "Watch")],
           ["info", "Info"],
         ]
           .map(
             ([s, l]) =>
               `<span class="sv ${s}"><i class="sd ${s}"></i>${l}<b>${cnt(s)}</b></span>`,
           )
           .join("")}</div>
   <div class="bp-b">${order
     .map((k) => {
       const x = g[k],
         open = x.l.length <= 4 || x.l.some((a) => a[0] === "bad");
       return `<details class="bg" ${open ? "open" : ""}><summary><span class="bgi">${ic(x.i, 14)}</span>${x.n}<b>${x.l.length}</b>${ic("chev", 14)}</summary><div>${x.l.map(row).join("")}</div></details>`;
     })
     .join("")}</div>`
       : `<div class="bp-e">${ic("check", 22)}<span>${L("Koi alert nahi. Sab kaam theek chal raha hai.", "No alerts. Everything is on track.")}</span></div>`
   }`;
}
function bellSet(open) {
  const w = document.querySelector(".bellw");
  if (!w) return;
  const b = w.querySelector(".bell"),
    p = w.querySelector(".bellp");
  if (open) {
    p.innerHTML = bellPanel();
    p.hidden = false;
    b.setAttribute("aria-expanded", "true");
    w.classList.add("open");
    if (S.deva && S.lang !== "en") dvWalk(p);
  } else {
    p.hidden = true;
    b.setAttribute("aria-expanded", "false");
    w.classList.remove("open");
  }
}
ACT.bell = () => {
  const w = document.querySelector(".bellw");
  bellSet(!(w && w.classList.contains("open")));
};
ACT.bellClose = () => bellSet(false);
document.addEventListener(
  "click",
  (e) => {
    const w = document.querySelector(".bellw.open");
    if (w && !w.contains(e.target)) bellSet(false);
  },
  true,
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.querySelector(".bellw.open")) {
    bellSet(false);
    const b = document.querySelector(".bell");
    if (b) b.focus();
  }
});
const _shellV12 = shell;
shell = function (u) {
  const h = _shellV12(u);
  if (!u || u.role !== "admin") return h;
  return h
    .replace('<div class="top-r">', '<div class="top-r">')
    .replace(
      /(<div class="top-r">[\s\S]*?)(<\/div><\/header>)/,
      (m, a, b) => a + bellHTML() + b,
    );
};

/* ----- helpers ----- */
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
function ring(frac, c, size = 58, sw = 6) {
  const r = (size - sw) / 2,
    C = 2 * Math.PI * r,
    f = Math.max(0, Math.min(1, frac || 0));
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--surface-2)" stroke-width="${sw}" fill="none"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${c}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-dasharray="${C * f} ${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
}
function week7() {
  const t0 = today0();
  return [...Array(7)].map((_, i) => {
    const d = t0 - (6 - i) * DAY,
      es = S.entries.filter(
        (e) => e.status === "approved" && e.ts >= d && e.ts < d + DAY,
      );
    return {
      d,
      M: sum(
        es.filter((e) => e.unit === "M"),
        kgEq,
      ),
      P: sum(
        es.filter((e) => e.unit === "P"),
        kgEq,
      ),
      Z: sum(
        es.filter((e) => e.unit === "Z"),
        kgEq,
      ),
    };
  });
}
function chart12(data) {
  const mx = Math.max(...data.map((x) => x.M + x.P + x.Z), 1),
    step = mx > 2000 ? 1000 : mx > 800 ? 250 : mx > 300 ? 100 : 50,
    top = Math.ceil(mx / step) * step;
  const sm = matchMedia("(max-width:640px)").matches,
    W = sm ? 360 : 640,
    H = sm ? 200 : 190,
    l = sm ? 34 : 40,
    r = 6,
    t = 14,
    b = 26,
    cw = (W - l - r) / 7,
    bw = Math.min(38, cw * 0.5),
    y = (v) => t + (H - t - b) * (1 - v / top);
  let g = "";
  for (let v = 0; v <= top; v += step)
    g += `<line class="gl" x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${l - 8}" y="${y(v) + 4}" text-anchor="end">${nf(v)}</text>`;
  let bars = "";
  data.forEach((x, i) => {
    const cx = l + cw * i + cw / 2;
    let base = 0;
    ["M", "P", "Z"].forEach((u) => {
      const v = x[u];
      if (!v) return;
      const y1 = y(base + v),
        y0 = y(base);
      bars += `<rect x="${cx - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(1, y0 - y1 - 1)}" rx="3" style="fill:var(${UNITS[u].c})"><title>${UNITS[u].n}: ${kg(v)}</title></rect>`;
      base += v;
    });
    const tot = x.M + x.P + x.Z;
    if (tot)
      bars += `<text class="ax vl" x="${cx}" y="${y(tot) - 5}" text-anchor="middle">${nf(Math.round(tot))}</text>`;
    const dl =
      i === 6
        ? L("Aaj", "Today")
        : new Date(x.d).toLocaleDateString("en-IN", { weekday: "short" });
    bars += `<text class="ax" x="${cx}" y="${H - 7}" text-anchor="middle" ${i === 6 ? 'style="font-weight:600;fill:var(--ink)"' : ""}>${dl}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L("Pichhle 7 din ka production", "Production, last 7 days")}">${g}${bars}</svg>`;
}

/* ----- dashboard ----- */
function kpiTile(o) {
  return `<button type="button" class="dk${o.tone ? " " + o.tone : ""}" data-a="nav" data-v="${o.go}" ${o.tab ? `data-tab="${o.tab}"` : ""}><span class="dk-l"><i class="dk-i">${ic(o.i, 15)}</i>${o.l}</span><b class="num">${o.v}</b><span class="dk-s">${o.s}</span>${o.m != null ? `<span class="dk-m"><i style="width:${Math.max(0, Math.min(100, o.m))}%"></i></span>` : ""}</button>`;
}
function adminDash() {
  const now = new Date(),
    h = now.getHours(),
    greet =
      h < 12
        ? "Good morning"
        : h < 17
          ? L("Namaste", "Good afternoon")
          : "Good evening",
    A = getAlerts();
  const empty = !Object.values(S.stock).some((v) => v > 0);
  const recv = sum(PARTIES, (p) => partyInfo(p.id).out),
    recvN = PARTIES.filter((p) => partyInfo(p.id).out > 0.5).length,
    overN = PARTIES.filter((p) => partyInfo(p.id).out > p.limit).length;
  const mi = S.invoices.filter((i) => i.ts >= month0()),
    sales = sum(mi, (i) => i.total),
    mp = S.payments.filter((p) => p.ts >= month0()),
    got = sum(mp, (p) => p.amount),
    exp = sum(
      S.expenses.filter((e) => e.ts >= month0()),
      (e) => e.amount,
    );
  const tM = unitToday("M"),
    tP = unitToday("P"),
    tZ = unitToday("Z"),
    coatOut = tP.out + tZ.out;
  const fin = sum(PRODUCTS, (p) => qty("FIN:" + p.unit, p.id, "bunch")),
    pb = pendBills(),
    pbB = sum(pb, (d) => sum(d.lines, (l) => l.q || 0));
  const kp = [
    {
      i: "wallet",
      l: L("Bazaar mein baaki", "Receivable"),
      v: rs(recv),
      s: `${recvN} ${L("party", "parties")}${overN ? ` · <em class="bad">${overN} ${L("limit paar", "over limit")}</em>` : ""}`,
      go: "khaata",
      tone: overN ? "bad" : "",
    },
    {
      i: "receipt",
      l: L("Is mahine bikri", "Billed this month"),
      v: rs(sales),
      s: `${mi.length} ${L("bill", "bills")}`,
      go: "orders",
    },
    {
      i: "coins",
      l: L("Aaya paisa", "Received"),
      v: rs(got),
      s: sales
        ? `${pct(got, sales)}% ${L("bikri ka", "of billing")}`
        : `${mp.length} payment`,
      go: "khaata",
      m: sales ? pct(got, sales) : null,
    },
    {
      i: "sheet",
      l: L("Kharcha", "Expenses"),
      v: rs(exp),
      s: L("is mahine, teeno units", "this month, all units"),
      go: "kharcha",
    },
    {
      i: "factory",
      l: L("Aaj moulding", "Moulded today"),
      v: kg(tM.out),
      s: tM.inp
        ? `${L("yield", "yield")} ${nf((tM.out / tM.inp) * 100, 1)}% · ${tM.n} entry`
        : `${tM.n} entry`,
      go: "production",
      m: tM.inp ? (tM.out / tM.inp) * 100 : null,
    },
    {
      i: "pearl",
      l: L("Taiyaar maal", "Ready stock"),
      v: nf(fin) + " <small>bunch</small>",
      s: pb.length
        ? `${pb.length} ${L("bill dispatch baaki", "bills to dispatch")}`
        : L("dispatch ke liye", "ready to dispatch"),
      go: "stock",
      tab: "fin",
      tone: pb.length ? "warn" : "",
    },
  ];
  const st = journeyStages();
  /* units today */
  const unitRow = (u, t) => {
    const y = t.inp ? t.out / t.inp : 0,
      ms = UNITS[u].machines;
    return `<div class="ur"><div class="ur-r">${ring(y, `var(${UNITS[u].c})`, 54, 6)}<span class="num">${t.inp ? nf(y * 100, 0) + "%" : "–"}</span></div>
    <div class="ur-t"><b>${UNITS[u].n}</b><span>${t.n} entry${t.pend ? ` · <em class="warn">${t.pend} ${L("baaki", "pending")}</em>` : ""}</span><span class="mdots">${ms
      .map((m) => {
        const s = machineState(m)[0];
        return `<i class="${s}" title="${m}: ${esc(machineState(m)[1])}"></i>${m}`;
      })
      .join(" ")}</span></div>
    <div class="ur-v"><b class="num">${fq(t.out, uomU(u))}</b><span>${L("aaj", "today")}</span></div></div>`;
  };
  /* week */
  const wk = week7(),
    wM = sum(wk, (x) => x.M),
    wC = sum(wk, (x) => x.P + x.Z),
    wes = S.entries.filter(
      (e) => e.status === "approved" && e.ts >= today0() - 6 * DAY,
    ),
    wy = sum(wes, (e) => e.input)
      ? sum(wes, (e) => e.out) / sum(wes, (e) => e.input)
      : 0;
  /* machines */
  const ms = ["M1", "M2", "P1", "P2", "MZ1"];
  const mt = (m) => {
    const t = S.tasks.find(
        (x) => x.machine === m && x.status === "open" && x.working,
      ),
      open = S.tasks.filter(
        (x) => x.machine === m && x.status === "open",
      ).length,
      st = machineState(m)[0];
    return `<div class="mc ${t ? "on" : ""}"><div class="mc-h"><b>${m}</b><span class="mst ${t ? "run" : open ? "wait" : "idle"}"><i></i>${t ? L("Kaam chalu", "Working") : open ? L("Task diya", "Assigned") : L("Khaali", "Idle")}</span></div>
     <span class="mc-n">${esc(staffOn(m))}</span><span class="mc-t">${t ? `#${t.no} · ${esc(taskTitle(t))}` : open ? L(`${open} task, shuru nahi`, `${open} task, not started`) : L("Koi task nahi", "No task")}</span>${t ? `<span class="mc-s">${ftime(t.working.ts)} ${L("se", "since")}</span>` : ""}</div>`;
  };
  /* orders */
  const os = S.orders.filter((o) => !o.cancelled),
    oc = {};
  os.forEach((o) => {
    const s = orderStatus(o);
    oc[s] = (oc[s] || 0) + 1;
  });
  const okeys = [
      "waiting",
      "ready",
      "billed",
      "partial",
      "dispatched",
      "closed",
    ].filter((k) => oc[k]),
    otot = os.length;
  const toneC = {
    warn: "var(--warn)",
    info: "var(--u-m)",
    ok: "var(--ok)",
    mute: "var(--muted)",
    bad: "var(--bad)",
  };
  const top = PARTIES.map((p) => ({ p, o: partyInfo(p.id).out }))
    .filter((x) => x.o > 0.5)
    .sort((a, b) => b.o - a.o)
    .slice(0, 3);
  /* stock health */
  const raws = RAW.filter((r) => r.re > 0)
    .map((r) => {
      const q = qty("RAW:" + r.unit, r.id, r.uom);
      return { r, q, f: q / r.re };
    })
    .sort((a, b) => a.f - b.f);
  const low = raws.filter((x) => x.f < 1).length;
  /* karigar + coating */
  const jobs = S.jobs
    .map((j) => ({ j, b: jobBal(j) }))
    .filter((x) => x.b.bal > 0)
    .sort((a, b) => b.b.d - a.b.d);
  const thr = S.thr.filter((l) => l.status === "thr" && l.bunch > 0),
    cq = S.thr.filter((l) => l.status === "cq" && l.bunch > 0);
  return `<div class="dash">
  ${empty ? `<section class="dc s12 d-start"><div><b>${L("Shuru karo: apna maujooda stock jodo", "Start here: add your current stock")}</b><span>${L("Godown mein jo maal pada hai, ek baar mein jod do.", "Add what is already in your store, in one go.")}</span></div><button type="button" class="btn pri sm" data-a="addStock">${ic("box", 15)} ${L("Stock jodo", "Add stock")}</button></section>` : ""}
  <section class="dc s12 d-cmd"><div class="cmd-t"><span class="eyebrow">${greet} · ${now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span><h2>${L("Aaj ka control room", "Today's control room")}</h2></div>
   <div class="cmd-a">${[
     ["inward", "inbox", "Inward", "Inward"],
     ["task", "factory", "Moulding task", "Moulding task"],
     ["ctask", "pearl", "Coating task", "Coating task"],
     ["kar", "thread", "Karigar ko bhejo", "Send to karigar"],
     ["stock", "box", "Stock jodo", "Add stock"],
   ]
     .map(
       ([q, i, h, e]) =>
         `<button type="button" class="qa" data-a="quick" data-q="${q}"><i>${ic(i, 16)}</i><span>${L(h, e)}</span></button>`,
     )
     .join("")}</div></section>
  <div class="s12 d-kpis">${kp.map(kpiTile).join("")}</div>
  <section class="dc s12"><div class="dc-h"><div><h3>${L("Maal ka safar", "Material journey")}</h3><p>${L("Har stage par abhi kitna maal hai. Tap karo, detail khulegi.", "How much material sits at each stage now. Tap for detail.")}</p></div></div>
   <div class="flow">${st.map((s, i) => `<button type="button" class="fs" data-a="nav" data-v="${s.go}" ${s.tab ? `data-tab="${s.tab}"` : ""}><span class="fs-n">0${i + 1}</span><span class="pearl" style="--c:${s.c}"></span><span class="fs-l">${s.l}</span><b class="num">${s.v}</b><span class="fs-s">${s.s}</span></button>`).join("")}</div></section>
  <section class="dc s8"><div class="dc-h"><div><h3>${L("Pichhle 7 din ka production", "Production, last 7 days")}</h3><p>${L("Approved entries, kg mein (bunch ko kg mein badla)", "Approved entries in kg (bunches converted)")}</p></div><div class="legend">${Object.keys(
    UNITS,
  )
    .map(
      (u) => `<span><i style="--c:var(${UNITS[u].c})"></i>${UNITS[u].n}</span>`,
    )
    .join("")}</div></div>
   <div class="wk-s"><div><span>${L("Moulding (7 din)", "Moulding (7 days)")}</span><b class="num">${kg(wM)}</b></div><div><span>${L("Coating (kg barabar)", "Coating (kg equiv.)")}</span><b class="num">${kg(wC)}</b></div><div><span>${L("Average yield", "Average yield")}</span><b class="num">${wy ? nf(wy * 100, 1) + "%" : "–"}</b></div><div><span>Approved entry</span><b class="num">${wes.length}</b></div></div>
   <div class="chart">${chart12(wk)}</div></section>
  <section class="dc s4"><div class="dc-h"><div><h3>${L("Aaj ki units", "Units today")}</h3><p>${L("Output aur yield", "Output and yield")}</p></div><button type="button" class="lnk" data-a="nav" data-v="production">${L("Sab", "All")} ${ic("chev", 14)}</button></div>
   <div class="urs">${unitRow("M", tM)}${unitRow("P", tP)}${unitRow("Z", tZ)}</div>
   <div class="u-foot"><span>${L("Coating aaj", "Coated today")}</span><b class="num">${nf(coatOut)} bunch</b></div></section>
  <section class="dc s7"><div class="dc-h"><div><h3>${L("Abhi kaun kya kar raha hai", "Who is working on what")}</h3><p>${L('Staff "Shuru karo" dabata hai tab yahan dikhta hai', 'Appears when staff tap "Start"')}</p></div><button type="button" class="lnk" data-a="nav" data-v="tasks">Tasks ${ic("chev", 14)}</button></div>
   <div class="mcs">${ms.map(mt).join("")}</div></section>
  <section class="dc s5"><div class="dc-h"><div><h3>${L("Orders ki haalat", "Order status")}</h3><p>${otot} ${L("order", "orders")} · ${L("bill bane", "billed")} ${S.invoices.length}</p></div><button type="button" class="lnk" data-a="nav" data-v="orders">Orders ${ic("chev", 14)}</button></div>
   ${
     otot
       ? `<div class="ob">${okeys.map((k) => `<i style="flex:${oc[k]};background:${toneC[OST[k][0]]}" title="${L(OST[k][1], OST[k][2])}: ${oc[k]}"></i>`).join("")}</div>
   <div class="ol">${okeys.map((k) => `<div><i style="background:${toneC[OST[k][0]]}"></i><span>${L(OST[k][1], OST[k][2])}</span><b class="num">${oc[k]}</b></div>`).join("")}</div>`
       : `<div class="mini-e">${L("Abhi koi order nahi.", "No orders yet.")}</div>`
   }
   <div class="sub-h">${L("Sabse zyada baaki", "Highest receivable")}</div>
   ${top.length ? `<div class="tp">${top.map((x) => `<button type="button" data-a="nav" data-v="khaata"><span><b>${esc(x.p.n)}</b><small>${esc(x.p.city || "")}</small></span><span class="num${x.o > x.p.limit ? " bad" : ""}">${rs(x.o)}</span><span class="tp-m"><i style="width:${Math.min(100, pct(x.o, x.p.limit))}%;background:${x.o > x.p.limit ? "var(--bad)" : "var(--gold)"}"></i></span></button>`).join("")}</div>` : `<div class="mini-e">${L("Kisi party ka baaki nahi.", "Nothing owed.")}</div>`}</section>
  <section class="dc s7"><div class="dc-h"><div><h3>${L("Raw material ki haalat", "Raw material health")}</h3><p>${low ? L(`${low} item reorder se neeche`, `${low} below reorder level`) : L("Sab reorder level se upar", "All above reorder level")}</p></div><button type="button" class="lnk" data-a="nav" data-v="stock" data-tab="raw">Stock ${ic("chev", 14)}</button></div>
   <div class="sh">${raws
     .slice(0, 8)
     .map((x) => {
       const tone = x.f < 0.25 ? "bad" : x.f < 1 ? "warn" : "ok";
       return `<div class="shr"><span class="shn">${esc(x.r.n)}</span><span class="shb"><i class="${tone}" style="width:${Math.max(2, Math.min(100, x.f * 100))}%"></i><em style="left:100%"></em></span><span class="shq num"><b>${fq(x.q, x.r.uom)}</b> / ${fq(x.r.re, x.r.uom)}</span></div>`;
     })
     .join("")}</div>
   ${raws.length > 8 ? `<div class="more-n">+${raws.length - 8} ${L("aur item Stock page par", "more on the Stock page")}</div>` : ""}</section>
  <section class="dc s5"><div class="dc-h"><div><h3>${L("Karigar aur coating", "Karigars and coating")}</h3><p>${L("Bahar gaya maal aur coating ki line", "Goods outside and the coating queue")}</p></div><button type="button" class="lnk" data-a="nav" data-v="karigar">Karigar ${ic("chev", 14)}</button></div>
   <div class="kc3"><div><span>${L("Karigar ke paas", "With karigars")}</span><b class="num">${kg(sum(jobs, (x) => x.b.bal))}</b><small>${jobs.length} ${L("kaam", "jobs")}</small></div><div><span>${L("Threaded aaya", "Threaded in")}</span><b class="num">${nf(sum(thr, (l) => l.bunch))}</b><small>bunch · ${thr.length} lot</small></div><div><span>${L("Coating mein", "In coating")}</span><b class="num">${nf(sum(cq, (l) => l.bunch))}</b><small>bunch · ${cq.length} lot</small></div></div>
   ${
     jobs.length
       ? `<div class="kl">${jobs
           .slice(0, 4)
           .map(
             (x) =>
               `<button type="button" data-a="nav" data-v="karigar"><span><b>${esc(KM[x.j.kar] ? KM[x.j.kar].n : "Karigar")}</b><small>${x.b.d} ${L("din se", "days")}</small></span><span class="num${x.b.d > 15 ? " bad" : ""}">${kg(x.b.bal)}</span></button>`,
           )
           .join("")}</div>`
       : `<div class="mini-e">${L("Koi karigar ke paas maal nahi.", "Nothing with karigars.")}</div>`
   }
   <div class="sub-h">${L("Coating ki line", "Coating queue")}</div>
   ${
     [...thr, ...cq].length
       ? `<div class="kl">${[...cq, ...thr]
           .slice(0, 3)
           .map(
             (l) =>
               `<button type="button" data-a="nav" data-v="coating" data-tab="${l.status}"><span><b>${esc(plainName(l.key))}</b><small>${l.status === "cq" ? L("Coating mein", "In coating") : L("Threaded, bhejna hai", "Threaded, to move")} · ${LINE[l.line] || ""}</small></span><span class="num">${nf(l.bunch)} bunch</span></button>`,
           )
           .join("")}</div>`
       : `<div class="mini-e">${L("Coating ki line khaali hai.", "Coating queue is empty.")}</div>`
   }</section>
  </div>`;
}
const _ahV12 = AV.home;
AV.home = function (u) {
  if (!u || u.role !== "admin") return _ahV12(u);
  return adminDash();
};
/* home header: keep "Naya order" + "Stock jodo" buttons as before */
DV9 &&
  Object.entries({
    control: "कंट्रोल",
    room: "रूम",
    health: "हेल्थ",
    haalat: "हालत",
    sabse: "सबसे",
    urgent: "अर्जेंट",
    zaroori: "ज़रूरी",
    dhyan: "ध्यान",
    cheezein: "चीज़ें",
    dekhni: "देखनी",
    equiv: "बराबर",
    barabar: "बराबर",
    average: "एवरेज",
    khaali: "खाली",
    diya: "दिया",
  }).forEach(([k, v]) => {
    if (!DV9[k]) DV9[k] = v;
  });
