"use strict";
/* ---------- constants ---------- */
const DAY = 864e5,
  HR = 36e5,
  MIN = 6e4;
const UNITS = {
  M: { n: "Moulding", cls: "m", c: "--u-m", machines: ["M1", "M2"] },
  P: { n: "Pearl", cls: "p", c: "--u-p", machines: ["P1", "P2"] },
  Z: { n: "Metalizing", cls: "z", c: "--u-z", machines: ["MZ1"] },
};
const MSTAFF = {
  M1: "Pawan Kumar",
  M2: "Raju Vishwakarma",
  P1: "Ramesh",
  P2: "Vijay",
  MZ1: "Anil",
};
const PROD_RAW = [
  ["p01", "3MM", "Round", "Off White", "Semi", "SR", "007", "P"],
  ["p02", "3MM", "Round", "Off White", "Semi", "TR", "002", "P"],
  ["p03", "3MM", "Round", "White", "Super", "TR", "003", "P"],
  ["p04", "4MM", "Round", "Orange", "Super", "TR", "006", "P"],
  ["p05", "5MM", "Round", "Ferozi", "Semi", "SR", "005", "P"],
  ["p06", "5MM", "Round", "Orange", "Semi", "SR", "004", "P"],
  ["p07", "6MM", "Round", "Peach", "Super", "TR", "013", "P"],
  ["p08", "6MM", "Round", "Pink", "Super", "TR", "008", "P"],
  ["p09", "8MM", "Round", "LCD", "Super", "SR", "012", "Z"],
  ["p10", "8MM", "Round", "Magenta", "Crylo", "TR", "011", "P"],
  ["p11", "8MM", "Round", "Artery", "SL", "SR", "009", "Z"],
  ["p12", "8MM", "Round", "Maroon", "Crylo", "TR", "010", "P"],
  ["p13", "8MM", "Round", "Red", "Crylo", "TR", "017", "P"],
  ["p14", "10MM", "Round", "Baby Pink", "Crylo", "SR", "016", "P"],
  ["p15", "8MM", "Round", "Unique", "PS", "SR", "014", "Z"],
  ["p16", "8MM", "Round", "Yellow", "DB", "SR", "015", "Z"],
  ["p17", "8MM", "Half Round", "Red", "Crylo", "SR", "022", "P"],
  ["p18", "8MM", "Half Round", "White", "Semi", "SR", "018", "P"],
  ["p19", "9MM", "Drop", "Baby Pink", "Semi", "TR", "021", "P"],
  ["p20", "9MM", "Drop", "Pista", "Semi", "TR", "020", "P"],
  ["p21", "11MM", "Drop", "Off White", "Semi", "TR", "019", "P"],
  ["p22", "3MM", "Munga", "Off White", "Semi", "SR", "024", "P"],
  ["p23", "10MM", "Sujni", "Cream", "Semi", "TR", "023", "P"],
];
const PRODUCTS = PROD_RAW.map(
  ([id, size, shape, color, mat, grade, img, unit]) => ({
    id,
    size,
    shape,
    color,
    mat,
    grade,
    img: "i" + img,
    unit,
  }),
);
const PM = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const plainKey = (p) => [p.size, p.shape, p.mat, p.grade].join("|");
const PLAINS = [...new Set(PRODUCTS.map(plainKey))];
const SHAPES = ["Round", "Half Round", "Drop", "Munga", "Sujni"];
const RAW = [
  { id: "gSemi", unit: "M", n: "GPPS Semi", uom: "kg", re: 500 },
  { id: "gSuper", unit: "M", n: "GPPS Super", uom: "kg", re: 400 },
  { id: "gCrylo", unit: "M", n: "GPPS Crylo", uom: "kg", re: 300 },
  { id: "gOther", unit: "M", n: "GPPS SL / PS / DB", uom: "kg", re: 200 },
  { id: "bag", unit: "M", n: "Packing bag 25 kg", uom: "pcs", re: 200 },
  { id: "essence", unit: "P", n: "Pearl essence", uom: "kg", re: 20 },
  { id: "lacquer", unit: "P", n: "Lacquer", uom: "L", re: 40 },
  { id: "pigment", unit: "P", n: "Colour pigment", uom: "kg", re: 10 },
  { id: "thread", unit: "P", n: "Thread", uom: "roll", re: 50 },
  { id: "alu", unit: "Z", n: "Aluminium wire", uom: "kg", re: 15 },
  { id: "base", unit: "Z", n: "Base coat", uom: "L", re: 30 },
  { id: "top", unit: "Z", n: "Top coat", uom: "L", re: 30 },
];
const RM = Object.fromEntries(RAW.map((r) => [r.id, r]));
const gppsFor = (k) => {
  const m = k.split("|")[2];
  return m === "Semi"
    ? "gSemi"
    : m === "Super"
      ? "gSuper"
      : m === "Crylo"
        ? "gCrylo"
        : "gOther";
};
const KARIGARS = [
  { id: "k1", n: "Salim bhai", a: "Shanti Nagar" },
  { id: "k2", n: "Rukhsana ben", a: "Kalher" },
  { id: "k3", n: "Ganesh Mistry", a: "Padgha" },
];
const KM = Object.fromEntries(KARIGARS.map((k) => [k.id, k]));
const SUPPLIERS = ["Shiv Polymers", "Om Chemicals", "Mahavir Packaging"];
const PARTIES = [
  {
    id: "c1",
    n: "Shree Ganesh Garments",
    city: "Surat",
    state: "Gujarat",
    gst: "24ABCDE1234F1Z5",
    limit: 300000,
    open: 42000,
  },
  {
    id: "c2",
    n: "Laxmi Lace Works",
    city: "Mumbai",
    state: "Maharashtra",
    gst: "27ABCDE2345G1Z2",
    limit: 200000,
    open: 0,
  },
  {
    id: "c3",
    n: "Patel Fashion House",
    city: "Ahmedabad",
    state: "Gujarat",
    gst: "24ABCDE3456H1Z9",
    limit: 250000,
    open: 0,
  },
  {
    id: "c4",
    n: "Noor Embroidery",
    city: "Bhiwandi",
    state: "Maharashtra",
    gst: "27ABCDE4567J1Z6",
    limit: 150000,
    open: 0,
  },
  {
    id: "c5",
    n: "Raja Textiles",
    city: "Bhiwandi",
    state: "Maharashtra",
    gst: "27ABCDE5678K1Z3",
    limit: 100000,
    open: 0,
  },
  {
    id: "c6",
    n: "Ambika Sarees",
    city: "Surat",
    state: "Gujarat",
    gst: "24ABCDE6789L1Z1",
    limit: 150000,
    open: 162500,
  },
];
const PTY = Object.fromEntries(PARTIES.map((p) => [p.id, p]));
const USERS = [
  {
    id: "admin",
    role: "admin",
    n: "Owner",
    c: "var(--gold)",
    mobile: "9800000001",
    pin: "1111",
  },
  {
    id: "stM1",
    role: "staff",
    unit: "M",
    machine: "M1",
    n: "Pawan Kumar",
    c: "var(--u-m)",
    mobile: "9800000020",
    pin: "3320",
  },
  {
    id: "stM2",
    role: "staff",
    unit: "M",
    machine: "M2",
    n: "Raju Vishwakarma",
    c: "var(--u-m)",
    mobile: "9800000021",
    pin: "3321",
  },
  {
    id: "stP1",
    role: "staff",
    unit: "P",
    machine: "P1",
    n: "Ramesh",
    c: "var(--u-p)",
    mobile: "9800000022",
    pin: "3322",
  },
  {
    id: "stZ1",
    role: "staff",
    unit: "Z",
    machine: "MZ1",
    n: "Anil",
    c: "var(--u-z)",
    mobile: "9800000023",
    pin: "3323",
  },
];
const STOP_REASONS = [
  ["power", "Bijli nahi", "No power"],
  ["mould", "Mould change", "Mould change"],
  ["repair", "Repair", "Repair"],
  ["material", "Maal khatam", "Out of material"],
  ["break", "Operator break", "Operator break"],
  ["other", "Kuch aur", "Other"],
];
const EXP_CATS = [
  "Bijli / Electricity",
  "Majdoori / Labour",
  "Salary",
  "Transport",
  "Packing",
  "Machine repair",
  "Kiraya / Rent",
  "Raw material",
  "Other",
];
const COLORHEX = {
  "Off White": "#E9E1CF",
  White: "#F2F1EC",
  Orange: "#E8762B",
  Ferozi: "#1F6E8C",
  Peach: "#F2A26B",
  Pink: "#E6338A",
  LCD: "#E0A64A",
  Magenta: "#A4206B",
  Artery: "#5C9A6A",
  Maroon: "#7A1F33",
  Red: "#C8232C",
  "Baby Pink": "#E2468A",
  Unique: "#4E8C8A",
  Yellow: "#D99A1E",
  Pista: "#B8D49A",
  Cream: "#E8D6B0",
};

/* ---------- state ---------- */
const LS = "mk-proto-v6";
let S;
let draft = null;
function rng(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function today0() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function month0() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
const nid = () => "x" + S.seq.id++;
const sk = (loc, item, uom) => loc + "|" + item + "|" + uom;
const qty = (loc, item, uom) => S.stock[sk(loc, item, uom)] || 0;
function move(loc, item, uom, d) {
  const k = sk(loc, item, uom);
  S.stock[k] = Math.round(((S.stock[k] || 0) + d) * 1000) / 1000;
}

function seed() {
  const R = rng(42),
    ri = (a, b) => Math.round(a + R() * (b - a)),
    pick = (a) => a[Math.floor(R() * a.length)];
  const t = Date.now(),
    t0 = today0();
  S = {
    v: 6,
    seeded: t,
    users: USERS.map((u) =>
      Object.assign({ active: true, last: null, fails: 0 }, u),
    ),
    lastUser: null,
    login: { step: "phone", phone: "", pin: "", err: "", uid: null },
    lang: "hi",
    theme: null,
    online: true,
    user: null,
    view: "home",
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
    log: [],
    outbox: [],
    shift: {},
    closed: {},
    seq: { order: 1043, gst: 118, kb: 57, id: 1 },
    kpb: {},
    prices: {},
    plainRate: {},
    ui: {
      guideTab: "start",
      ucRole: "all",
      shape: "all",
      grade: "all",
      punit: "all",
      stockTab: "fin",
      stockUnit: "all",
      orderTab: "all",
      khaataTab: "parties",
      maalTab: "in",
      prodTab: "pending",
      lastProd: {},
    },
  };
  PRODUCTS.forEach((p) => {
    const mm = parseInt(p.size);
    S.prices[p.id] = {
      bunch: Math.round(52 + mm * 6 + (p.grade === "SR" ? 10 : 0)),
      kg: p.unit === "Z" ? 240 + mm * 3 : null,
    };
    S.kpb[p.id] = 0.5;
  });
  PLAINS.forEach((k) => {
    S.plainRate[k] = 150 + parseInt(k) * 2 + (k.endsWith("SR") ? 8 : 0);
  });
  const set = (loc, item, uom, q) => {
    S.stock[sk(loc, item, uom)] = q;
  };
  [
    ["gSemi", 2350],
    ["gSuper", 1180],
    ["gCrylo", 260],
    ["gOther", 640],
    ["bag", 420],
  ].forEach(([i, q]) => set("RAW:M", i, RM[i].uom, q));
  [
    ["essence", 34],
    ["lacquer", 52],
    ["pigment", 7.5],
    ["thread", 120],
  ].forEach(([i, q]) => set("RAW:P", i, RM[i].uom, q));
  [
    ["alu", 22],
    ["base", 26],
    ["top", 41],
  ].forEach(([i, q]) => set("RAW:Z", i, RM[i].uom, q));
  PLAINS.forEach((k) => {
    set("PLAIN:M", k, "kg", ri(60, 420));
    set("PLAIN:P", k, "kg", ri(10, 90));
    set("PLAIN:Z", k, "kg", ri(0, 40));
  });
  PRODUCTS.forEach((p) => {
    set("COAT:" + p.unit, p.id, "kg", ri(15, 90));
    set("FIN:" + p.unit, p.id, "bunch", ri(30, 240));
  });
  set("FIN:P", "p13", "bunch", 40);
  set("COAT:P", "p13", "kg", 22);
  set("PLAIN:M", "8MM|Round|Crylo|TR", "kg", 310);
  set("PLAIN:P", "8MM|Round|Crylo|TR", "kg", 35);
  set("PLAIN:P", "3MM|Round|Semi|TR", "kg", 80);
  set("COAT:Z", "p15", "kg", 64);
  set("FIN:P", "p02", "bunch", 150);
  set("FIN:P", "p18", "bunch", 95);
  set("PLAIN:M", "3MM|Round|Semi|SR", "kg", 380);
  set("FIN:P", "p22", "bunch", 70);
  // history
  for (let d = 14; d >= 1; d--) {
    const day = t0 - d * DAY;
    Object.entries(UNITS).forEach(([u, U]) =>
      U.machines.forEach((m) => {
        if (R() < 0.08) return;
        const out =
          u === "M" ? ri(260, 380) : u === "P" ? ri(85, 140) : ri(45, 80);
        const rej =
          Math.round(
            out * (u === "M" ? 0.04 + R() * 0.05 : 0.01 + R() * 0.03) * 10,
          ) / 10;
        const prod =
          u === "M"
            ? pick(PLAINS)
            : pick(PRODUCTS.filter((p) => p.unit === u)).id;
        S.entries.push({
          id: nid(),
          unit: u,
          machine: m,
          staff: MSTAFF[m],
          shift: "Day",
          ts: day + 11 * HR,
          product: prod,
          input: Math.round((out + rej) * 10) / 10,
          out,
          reject: rej,
          down: R() < 0.2 ? ri(15, 90) : 0,
          status: "approved",
          hist: true,
          note: "",
        });
      }),
    );
  }
  const add = (o) =>
    S.entries.push(
      Object.assign(
        { id: nid(), shift: "Day", hist: false, down: 0, note: "" },
        o,
      ),
    );
  add({
    unit: "M",
    machine: "M1",
    staff: "Pawan Kumar",
    ts: t - 4 * HR,
    product: "3MM|Round|Semi|SR",
    input: 104,
    out: 98,
    reject: 6,
    status: "approved",
    by: "Sameer",
  });
  add({
    unit: "M",
    machine: "M1",
    staff: "Pawan Kumar",
    ts: t - 3 * HR,
    product: "6MM|Round|Super|TR",
    input: 118,
    out: 111.5,
    reject: 6.5,
    status: "approved",
    by: "Sameer",
  });
  add({
    unit: "M",
    machine: "M2",
    staff: "Raju Vishwakarma",
    ts: t - 50 * MIN,
    product: "8MM|Round|Crylo|TR",
    input: 102,
    out: 96,
    reject: 6,
    status: "pending",
  });
  add({
    unit: "P",
    machine: "P1",
    staff: "Ramesh",
    ts: t - 3.5 * HR,
    product: "p08",
    input: 52,
    out: 50.6,
    reject: 1.4,
    status: "approved",
    by: "Imran",
  });
  add({
    unit: "P",
    machine: "P1",
    staff: "Ramesh",
    ts: t - 40 * MIN,
    product: "p13",
    input: 49.7,
    out: 48.5,
    reject: 1.2,
    status: "pending",
  });
  add({
    unit: "P",
    machine: "P2",
    staff: "Vijay",
    ts: t - 2 * HR,
    product: "p02",
    input: 61,
    out: 59.2,
    reject: 1.8,
    status: "pending",
  });
  add({
    unit: "Z",
    machine: "MZ1",
    staff: "Anil",
    ts: t - 2.5 * HR,
    product: "p15",
    input: 30,
    out: 28.9,
    reject: 1.1,
    status: "approved",
    by: "Rakesh",
  });
  ["M1", "M2", "P1", "P2", "MZ1"].forEach(
    (m) =>
      (S.shift[m] = {
        start: t - 5 * HR,
        stop: null,
        reason: null,
        down: 0,
        ended: false,
      }),
  );
  S.ui.lastProd = { M2: "8MM|Round|Crylo|TR", P1: "p13", MZ1: "p15" };
  S.transfers.push({
    id: nid(),
    from: "M",
    to: "P",
    item: "8MM|Round|Crylo|TR",
    sent: 150,
    recv: null,
    ts: t - 90 * MIN,
    by: "Sameer",
    status: "transit",
  });
  S.transfers.push({
    id: nid(),
    from: "M",
    to: "Z",
    item: "8MM|Round|PS|SR",
    sent: 75,
    recv: null,
    ts: t - 30 * MIN,
    by: "Sameer",
    status: "transit",
  });
  S.transfers.push({
    id: nid(),
    from: "M",
    to: "P",
    item: "6MM|Round|Super|TR",
    sent: 120,
    recv: 118,
    ts: t - DAY - 2 * HR,
    rts: t - DAY - HR,
    by: "Sameer",
    rby: "Imran",
    status: "received",
  });
  S.inwards.push({
    id: nid(),
    unit: "M",
    supplier: "Shiv Polymers",
    mat: "gSemi",
    qty: 1000,
    bill: "SP/2291",
    photo: "bill_SP2291.jpg",
    rate: null,
    ts: t - 2 * HR,
    by: "Sameer",
  });
  S.inwards.push({
    id: nid(),
    unit: "P",
    supplier: "Om Chemicals",
    mat: "lacquer",
    qty: 40,
    bill: "OC/874",
    photo: "bill_OC874.jpg",
    rate: null,
    ts: t - DAY,
    by: "Imran",
  });
  S.inwards.push({
    id: nid(),
    unit: "M",
    supplier: "Shiv Polymers",
    mat: "gSuper",
    qty: 500,
    bill: "SP/2270",
    photo: "bill_SP2270.jpg",
    rate: 118,
    ts: t - 3 * DAY,
    by: "Sameer",
  });
  S.jobs.push({
    id: nid(),
    kar: "k1",
    unit: "P",
    product: "p13",
    sent: 145,
    ts: t - 3 * DAY,
    by: "Imran",
    receipts: [{ bunch: 90, loose: 8, waste: 2, ts: t - DAY }],
  });
  S.jobs.push({
    id: nid(),
    kar: "k2",
    unit: "P",
    product: "p08",
    sent: 80,
    ts: t - 18 * DAY,
    by: "Imran",
    receipts: [{ bunch: 60, loose: 5, waste: 1.5, ts: t - 10 * DAY }],
  });
  S.jobs.push({
    id: nid(),
    kar: "k3",
    unit: "Z",
    product: "p15",
    sent: 60,
    ts: t - 6 * DAY,
    by: "Rakesh",
    receipts: [],
  });
  S.jobs.push({
    id: nid(),
    kar: "k1",
    unit: "P",
    product: "p02",
    sent: 70,
    ts: t - 9 * DAY,
    by: "Imran",
    receipts: [{ bunch: 120, loose: 6, waste: 2, ts: t - 2 * DAY }],
  });
  const ord = (no, party, lines, ts) => {
    const o = {
      id: "o" + no,
      no,
      party,
      lines: lines.map((l) => Object.assign({ disp: 0 }, l)),
      ts,
      promise: ts + 7 * DAY,
      cancelled: false,
      reason: "",
    };
    S.orders.push(o);
    return o;
  };
  const dsp = (o, unit, parts, ts, veh) => {
    const d = {
      id: nid(),
      order: o.id,
      unit,
      lines: parts.map(([i, q]) => ({ i, q })),
      ts,
      vehicle: veh,
      by: unit === "M" ? "Sameer" : unit === "P" ? "Imran" : "Rakesh",
      invoice: null,
    };
    parts.forEach(([i, q]) => (o.lines[i].disp += q));
    S.dispatches.push(d);
    return d;
  };
  const o37 = ord(
    1037,
    "c5",
    [{ kind: "fin", ref: "p20", uom: "bunch", qty: 100, rate: 90 }],
    t - 8 * DAY,
  );
  const d37 = dsp(o37, "P", [[0, 100]], t - 6 * DAY, "MH04 GH 2231");
  makeInvoice(d37, "GST", t - 6 * DAY, true);
  const o38 = ord(
    1038,
    "c4",
    [
      {
        kind: "plain",
        ref: "3MM|Round|Semi|SR",
        uom: "kg",
        qty: 500,
        rate: 165,
      },
    ],
    t - 6 * DAY,
  );
  const d38 = dsp(o38, "M", [[0, 500]], t - 4 * DAY, "MH04 KL 7710");
  makeInvoice(d38, "GST", t - 4 * DAY, true);
  const o39 = ord(
    1039,
    "c3",
    [{ kind: "fin", ref: "p15", uom: "kg", qty: 80, rate: 260 }],
    t - 4 * DAY,
  );
  const d39 = dsp(o39, "Z", [[0, 50]], t - 2 * DAY, "GJ01 AB 4420");
  makeInvoice(d39, "GST", t - 2 * DAY, true);
  ord(
    1040,
    "c2",
    [
      { kind: "fin", ref: "p02", uom: "bunch", qty: 60, rate: 85 },
      { kind: "fin", ref: "p18", uom: "bunch", qty: 40, rate: 110 },
    ],
    t - DAY,
  );
  ord(
    1041,
    "c1",
    [{ kind: "fin", ref: "p13", uom: "bunch", qty: 120, rate: 95 }],
    t - 5 * HR,
  );
  const o42 = ord(
    1042,
    "c4",
    [{ kind: "fin", ref: "p22", uom: "bunch", qty: 30, rate: 120 }],
    t - DAY - 3 * HR,
  );
  dsp(o42, "P", [[0, 30]], t - 2 * HR, "MH04 GH 2231");
  const inv37 = S.invoices.find((i) => i.order === "o1037");
  S.payments.push({
    id: nid(),
    party: "c5",
    amount: inv37.total,
    mode: "UPI",
    ref: "UTR 4471 0093",
    ts: t - 5 * DAY,
  });
  S.payments.push({
    id: nid(),
    party: "c4",
    amount: 50000,
    mode: "Cheque",
    ref: "Chq 004512 · HDFC",
    ts: t - 2 * DAY,
  });
  S.payments.push({
    id: nid(),
    party: "c1",
    amount: 20000,
    mode: "Bank",
    ref: "NEFT 88213",
    ts: t - 9 * DAY,
  });
  const ex = (unit, cat, amount, days, note) =>
    S.expenses.push({
      id: nid(),
      unit,
      cat,
      amount,
      ts: Math.max(month0(), t - days * DAY),
      note,
    });
  ex("M", "Bijli / Electricity", 48500, 6, "MSEDCL bill");
  ex("P", "Bijli / Electricity", 21200, 6, "");
  ex("Z", "Bijli / Electricity", 16800, 6, "");
  ex("M", "Majdoori / Labour", 36000, 3, "Waste chhaantne wali labour");
  ex("P", "Salary", 28000, 2, "");
  ex("ALL", "Transport", 9400, 1, "Surat delivery");
  ex("M", "Machine repair", 6400, 2, "M2 heater band");
  logA(
    "Order #1041 banaya · Shree Ganesh Garments",
    "Order #1041 created · Shree Ganesh Garments",
    { n: "Owner", role: "admin" },
    t - 5 * HR,
  );
  logA(
    "150 kg 8MM Round Crylo TR Pearl ko bheja",
    "Sent 150 kg 8MM Round Crylo TR to Pearl",
    { n: "Sameer", role: "manager" },
    t - 90 * MIN,
  );
  logA(
    "Dispatch #1042 · 30 bunch Munga",
    "Dispatched #1042 · 30 bunch Munga",
    { n: "Imran", role: "manager" },
    t - 2 * HR,
  );
  seedV5();
}
function makeInvoice(d, type, ts, silent) {
  const o = S.orders.find((x) => x.id === d.order),
    p = PTY[o.party];
  const lines = d.lines.map(({ i, q }) => {
    const l = o.lines[i];
    return {
      desc: itemName(l),
      qty: q,
      uom: l.uom,
      rate: l.rate,
      amt: q * l.rate,
    };
  });
  const taxable = lines.reduce((a, b) => a + b.amt, 0);
  let cgst = 0,
    sgst = 0,
    igst = 0;
  if (type === "GST") {
    if (p.state === "Maharashtra") {
      cgst = taxable * 0.09;
      sgst = taxable * 0.09;
    } else igst = taxable * 0.18;
  }
  const raw = taxable + cgst + sgst + igst,
    total = Math.round(raw);
  const no =
    type === "GST"
      ? "MK/26-27/" + String(S.seq.gst++).padStart(4, "0")
      : "KB/26-27/" + String(S.seq.kb++).padStart(4, "0");
  const inv = {
    id: nid(),
    no,
    type,
    party: o.party,
    order: o.id,
    disp: d.id,
    lines,
    taxable,
    cgst,
    sgst,
    igst,
    round: total - raw,
    total,
    ts: ts || Date.now(),
  };
  S.invoices.push(inv);
  d.invoice = inv.id;
  if (!silent)
    logA(
      `Bill ${no} banaya · ${p.n} · ${rs(total)}`,
      `Bill ${no} created · ${p.n} · ${rs(total)}`,
    );
  return inv;
}
function save() {
  try {
    localStorage.setItem(LS, JSON.stringify(S));
  } catch (e) {}
}
function load() {
  try {
    const r = localStorage.getItem(LS);
    if (r) {
      const s = JSON.parse(r);
      if (s && s.v === 6) return s;
    }
  } catch (e) {}
  return null;
}

/* ---------- helpers ---------- */
const L = (h, e) => (S.lang === "en" ? e : h);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const r1 = (n) => Math.round(n * 10) / 10;
const nf = (n, d = 0) =>
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
const kg = (n) => nf(r1(n), 1) + " kg";
const rs = (n) => "₹" + nf(Math.round(n));
const fq = (n, u) =>
  u === "kg"
    ? kg(n)
    : u === "bunch"
      ? nf(Math.round(n)) + " bunch"
      : nf(r1(n), n % 1 ? 1 : 0) + " " + u;
const fdate = (ts) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const ftime = (ts) =>
  new Date(ts).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
const fwhen = (ts) => (ts >= today0() ? ftime(ts) : fdate(ts));
const days = (ts) => Math.floor((Date.now() - ts) / DAY);
const sum = (a, f) => a.reduce((x, y) => x + f(y), 0);
const user = () => S.users.find((u) => u.id === S.user);
const UN = (u) => (UNITS[u] ? UNITS[u].n : L("Common", "Common"));
const uchip = (u) =>
  u === "ALL"
    ? `<span class="uchip k">${L("Sab units", "All units")}</span>`
    : `<span class="uchip ${UNITS[u].cls}">${UNITS[u].n}</span>`;
const pname = (p) => `${p.size} ${p.shape} ${p.color}`;
const psub = (p) => `${p.mat} (${p.grade})`;
const plainName = (k) => {
  const [s, sh, m, g] = k.split("|");
  return `${s} ${sh} · ${m} (${g})`;
};
const thumb = (p) => `<img class="thumb" src="${IMG[p.img]}" alt="">`;
const pthumb = () => `<span class="thumb plainb" aria-hidden="true"></span>`;
function itemName(l) {
  return l.kind === "plain"
    ? plainName(l.ref) + " " + L("plain", "plain")
    : pname(PM[l.ref]) + " · " + psub(PM[l.ref]);
}
function itemCell(kind, ref, extra = "") {
  if (kind === "plain")
    return `<div class="prow">${pthumb()}<div><div class="pname">${esc(plainName(ref))}</div><div class="psub">${L("Plain beads (bina rang)", "Plain beads (uncoloured)")}${extra}</div></div></div>`;
  const p = PM[ref];
  return `<div class="prow">${thumb(p)}<div><div class="pname">${esc(pname(p))}</div><div class="psub">${esc(psub(p))}${extra}</div></div></div>`;
}
function entryItemName(e) {
  return e.unit === "M"
    ? plainName(e.product)
    : pname(PM[e.product]) + " · " + psub(PM[e.product]);
}
function lineUnit(l) {
  return l.kind === "plain" ? "M" : PM[l.ref].unit;
}
function lineAvail(l) {
  if (l.kind === "plain") return qty("PLAIN:M", l.ref, "kg");
  const p = PM[l.ref];
  return l.uom === "kg"
    ? qty("COAT:" + p.unit, p.id, "kg")
    : qty("FIN:" + p.unit, p.id, "bunch");
}
function lineTake(l, q) {
  if (l.kind === "plain") return move("PLAIN:M", l.ref, "kg", -q);
  const p = PM[l.ref];
  if (l.uom === "kg") move("COAT:" + p.unit, p.id, "kg", -q);
  else move("FIN:" + p.unit, p.id, "bunch", -q);
}
function beads(frac, n = 10, c = "var(--gold)", lg) {
  const on = Math.max(0, Math.min(n, Math.round(frac * n)));
  return `<span class="bstr${lg ? " lg" : ""}" style="--c:${c}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? "on" : ""}"></i>`).join("")}</span>`;
}
function logA(h, e, who, ts) {
  const u = who || user() || { n: "System", role: "admin" };
  S.log.unshift({
    ts: ts || Date.now(),
    who: u.n,
    role: u.role,
    unit: u.unit,
    h,
    e,
  });
}
function toast(msg) {
  const el = document.createElement("div");
  el.className = "t";
  el.innerHTML = ic("check", 18) + "<span>" + esc(msg) + "</span>";
  const r = document.getElementById("toast");
  r.appendChild(el);
  while (r.children.length > 2) r.firstChild.remove();
  setTimeout(() => el.remove(), 3200);
}
function words(n) {
  n = Math.round(n);
  if (!n) return "Rupees Zero Only";
  const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ],
    b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
  const two = (x) =>
    x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : "");
  const three = (x) =>
    (x >= 100
      ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " : "")
      : "") + (x % 100 ? two(x % 100) : "");
  const cr = Math.floor(n / 1e7);
  n %= 1e7;
  const lk = Math.floor(n / 1e5);
  n %= 1e5;
  const th = Math.floor(n / 1e3);
  n %= 1e3;
  let s = "";
  if (cr) s += three(cr) + " Crore ";
  if (lk) s += two(lk) + " Lakh ";
  if (th) s += two(th) + " Thousand ";
  if (n) s += three(n);
  return "Rupees " + s.trim() + " Only";
}
const isDark = () =>
  S.theme
    ? S.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  receipt:
    '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  pearl: '<circle cx="12" cy="12" r="8"/><circle cx="9.5" cy="9.5" r="2"/>',
  factory: '<path d="M3 21V10l6 4v-4l6 4V6l6-3v18z"/>',
  thread:
    '<path d="M3 12c3-7 6-7 9 0s6 7 9 0"/><circle cx="3" cy="12" r="1"/><circle cx="21" cy="12" r="1"/>',
  wallet:
    '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.2a6 6 0 1 1-6.3 6.3"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  truck:
    '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  camera:
    '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  pause:
    '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  wifi: '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.4a10 10 0 0 1 14 0M8.5 15.9a5 5 0 0 1 7 0M12 19.5h.01"/>',
  wifioff:
    '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.4a10 10 0 0 1 14 0M8.5 15.9a5 5 0 0 1 7 0M12 19.5h.01M3 3l18 18"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  inbox:
    '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6H3v-6z"/>',
  scale:
    '<path d="M12 3v17M7 20h10M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  moonclose: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
};
function ic(n, s = 18) {
  return `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
}

/* ---------- derived data ---------- */
function jobBal(j) {
  const bunch = sum(j.receipts, (r) => r.bunch),
    loose = sum(j.receipts, (r) => r.loose),
    waste = sum(j.receipts, (r) => r.waste);
  const back = bunch * S.kpb[j.product];
  return {
    bunch,
    loose,
    waste,
    bal: Math.max(0, r1(j.sent - back - loose - waste)),
    d: days(j.ts),
  };
}
function partyInfo(pid) {
  const p = PTY[pid],
    invs = S.invoices
      .filter((i) => i.party === pid)
      .sort((a, b) => a.ts - b.ts),
    paid = sum(
      S.payments.filter((x) => x.party === pid),
      (x) => x.amount,
    );
  let rem = paid;
  const openPaid = Math.min(rem, p.open);
  rem -= openPaid;
  const st = invs.map((i) => {
    const a = Math.min(rem, i.total);
    rem -= a;
    return { inv: i, paid: a, due: i.total - a };
  });
  const out = p.open + sum(invs, (i) => i.total) - paid;
  const firstDue = st.find((x) => x.due > 0.5);
  const oldest =
    p.open - openPaid > 0.5 ? 45 : firstDue ? days(firstDue.inv.ts) : 0;
  return { out, st, openDue: p.open - openPaid, oldest, paid };
}
function invPaid(inv) {
  const st = partyInfo(inv.party).st.find((x) => x.inv.id === inv.id);
  return st ? (st.due <= 0.5 ? "paid" : st.paid > 0 ? "part" : "due") : "due";
}
function orderStatus(o) {
  if (o.cancelled) return "cancelled";
  const tq = sum(o.lines, (l) => l.qty),
    dq = sum(o.lines, (l) => l.disp);
  if (dq >= tq - 0.001) {
    const ds = S.dispatches.filter((d) => d.order === o.id);
    const allPaid =
      ds.length &&
      ds.every(
        (d) =>
          d.invoice &&
          invPaid(S.invoices.find((i) => i.id === d.invoice)) === "paid",
      );
    return allPaid ? "closed" : "dispatched";
  }
  if (dq > 0) return "partial";
  return o.lines.some((l) => lineAvail(l) < l.qty - l.disp - 0.001)
    ? "waiting"
    : "ready";
}
const OST = {
  waiting: ["warn", "Maal ka intezaar", "Waiting for stock"],
  ready: ["info", "Ready", "Ready"],
  partial: ["info", "Aadha gaya", "Part dispatched"],
  dispatched: ["ok", "Dispatch ho gaya", "Dispatched"],
  closed: ["mute", "Band · paid", "Closed · paid"],
  cancelled: ["bad", "Cancel", "Cancelled"],
};
const opill = (s) =>
  `<span class="pill ${OST[s][0]}">${L(OST[s][1], OST[s][2])}</span>`;
const orderValue = (o) => sum(o.lines, (l) => l.qty * l.rate);
function epill(e) {
  return e.status === "pending"
    ? `<span class="pill warn">${L("Approval baaki", "Awaiting approval")}</span>`
    : e.status === "approved"
      ? `<span class="pill ok">Approved</span>`
      : `<span class="pill bad">${L("Wapas aaya", "Sent back")}</span>`;
}
const yieldOf = (e) => (e.input > 0 ? e.out / e.input : 0);
function canApprove(e) {
  return e.unit === "M"
    ? qty("RAW:M", gppsFor(e.product), "kg") >= e.input - 0.001
    : qty("PLAIN:" + e.unit, plainKey(PM[e.product]), "kg") >= e.input - 0.001;
}
function lowRaw(unit) {
  return RAW.filter(
    (r) =>
      (!unit || r.unit === unit) && qty("RAW:" + r.unit, r.id, r.uom) < r.re,
  );
}
function todayEntries(unit, machine) {
  return S.entries.filter(
    (e) =>
      !e.hist &&
      e.ts >= today0() &&
      (!unit || e.unit === unit) &&
      (!machine || e.machine === machine) &&
      e.status !== "returned",
  );
}
function pendingEntries(unit) {
  return S.entries.filter(
    (e) => e.status === "pending" && (!unit || e.unit === unit),
  );
}
function incoming(unit) {
  return S.transfers.filter((t) => t.status === "transit" && t.to === unit);
}
function dispatchQueue(unit) {
  return S.orders.filter(
    (o) =>
      !o.cancelled &&
      o.lines.some(
        (l) => (!unit || lineUnit(l) === unit) && l.disp < l.qty - 0.001,
      ),
  );
}
function uninvoiced() {
  return S.dispatches.filter((d) => !d.invoice);
}
function machineState(m) {
  const s = S.shift[m];
  if (!s) return ["idle", L("Shift shuru nahi", "Not started")];
  if (s.ended) return ["idle", L("Shift khatam", "Shift ended")];
  if (s.stop) {
    const r = STOP_REASONS.find((x) => x[0] === s.reason);
    return ["stop", L("Ruki · ", "Stopped · ") + (r ? L(r[1], r[2]) : "")];
  }
  return ["run", L("Chal rahi hai", "Running")];
}

/* ---------- render ---------- */
function render() {
  const root = document.documentElement;
  if (S.theme) root.setAttribute("data-theme", S.theme);
  else root.removeAttribute("data-theme");
  root.lang = S.lang === "en" ? "en" : "hi-Latn";
  const u = user(),
    app = document.getElementById("app");
  document.body.classList.toggle("has-tabs", !!u && u.role !== "staff");
  document.body.classList.toggle(
    "has-tabs",
    (!!u && u.role !== "staff" && S.view !== "guide") ||
      (!!u && u.role !== "staff"),
  );
  if (S.view === "guide" && (!u || u.role === "staff")) {
    document.body.classList.remove("has-tabs");
    app.innerHTML = demoBar() + guidePage();
  } else if (!u) app.innerHTML = demoBar() + loginView();
  else if (u.role === "staff") app.innerHTML = demoBar() + staffView(u);
  else app.innerHTML = demoBar() + shell(u);
  save();
}
function demoBar() {
  return `<div class="demo"><span class="demo-tag"><i class="dot"></i>${L("Prototype", "Prototype")}</span><div class="demo-actions">
  ${S.user ? `<button type="button" data-a="logout">${ic("logout", 16)}<span class="lbl">${L("Logout", "Log out")}</span></button>` : ""}
  <button type="button" data-a="toggleOnline" class="${S.online ? "" : "off"}" aria-pressed="${!S.online}">${ic(S.online ? "wifi" : "wifioff", 16)}<span class="lbl">${S.online ? "Online" : "Offline"}</span></button>
  <button type="button" data-a="toggleLang" aria-label="Language">${ic("globe", 16)}<span>${S.lang === "hi" ? "Hinglish" : "English"}</span></button>
  <button type="button" data-a="toggleTheme" aria-label="${L("Theme badlo", "Toggle theme")}">${ic(isDark() ? "sun" : "moon", 16)}</button>
  <button type="button" data-a="askReset">${ic("refresh", 16)}<span class="lbl">${L("Zero reset", "Reset to zero")}</span></button></div></div>`;
}
function navItems(u) {
  if (u.role === "admin")
    return [
      { id: "home", i: "home", l: L("Home", "Home") },
      { id: "orders", i: "receipt", l: "Orders", b: uninvoiced().length },
      { id: "stock", i: "box", l: "Stock" },
      { id: "products", i: "pearl", l: L("Products", "Products") },
      {
        id: "production",
        i: "factory",
        l: "Production",
        b: pendingEntries().length,
      },
      { id: "karigar", i: "thread", l: "Karigar" },
      { id: "khaata", i: "wallet", l: L("Khaata", "Accounts") },
      { id: "kharcha", i: "coins", l: L("Kharcha", "Expenses") },
      { id: "log", i: "list", l: L("Record", "Activity") },
      { id: "reports", i: "sheet", l: "Reports" },
      { id: "team", i: "users", l: "Team" },
      { id: "guide", i: "book", l: "Guide" },
    ];
  const a = [
    { id: "home", i: "home", l: "Home" },
    {
      id: "approve",
      i: "check",
      l: "Approve",
      b: pendingEntries(u.unit).length,
    },
    {
      id: "maal",
      i: "swap",
      l: L("Maal", "Material"),
      b: incoming(u.unit).length,
    },
  ];
  if (u.unit !== "M") a.push({ id: "karigar", i: "thread", l: "Karigar" });
  a.push({
    id: "dispatch",
    i: "truck",
    l: "Dispatch",
    b: dispatchQueue(u.unit).length,
  });
  a.push({ id: "guide", i: "book", l: "Guide" });
  return a;
}
function shell(u) {
  const items = navItems(u);
  if (!items.find((i) => i.id === S.view)) S.view = "home";
  const cur = items.find((i) => i.id === S.view);
  const nb = (i) =>
    `<button type="button" class="nav-btn" data-a="nav" data-v="${i.id}" ${i.id === S.view ? 'aria-current="page"' : ""}>${ic(i.i)}<span>${i.l}</span>${i.b ? `<span class="badge">${i.b}</span>` : ""}</button>`;
  const mob =
    items.length > 5
      ? [...items.slice(0, 4), { id: "__more", i: "more", l: L("Aur", "More") }]
      : items;
  const tb = (i) =>
    `<button type="button" class="tab" data-a="${i.id === "__more" ? "more" : "nav"}" data-v="${i.id}" ${i.id === S.view || (i.id === "__more" && !mob.slice(0, 4).find((x) => x.id === S.view)) ? 'aria-current="page"' : ""}>${ic(i.i, 20)}<span>${i.l}</span>${i.b ? `<span class="badge">${i.b}</span>` : ""}</button>`;
  const role =
    u.role === "admin"
      ? L("Admin · saari units", "Admin · all units")
      : UN(u.unit) + " · Unit Manager";
  return `<div class="shell"><aside class="side"><div class="brand"><div class="mark"><i></i><i></i><i></i></div><div><b>MK Plastics</b><small>Beads Bazaar</small></div></div>
  <nav class="side-nav" aria-label="Menu">${items.map((i, k) => (i.g && (k === 0 || items[k - 1].g !== i.g) ? `<div class="nav-g">${i.g}</div>` : "") + nb(i)).join("")}</nav>
  <div class="me"><span class="av" style="--c:${u.c}">${u.n[0]}</span><div><b>${esc(u.n)}</b><small>${role}</small></div></div></aside>
  <main class="main"><header class="top"><div><div class="eyebrow">${role}</div><h1>${cur.l}</h1></div><div class="top-r">${syncBadge()}${topAction(u)}</div></header>
  <div class="content fade">${(u.role === "admin" ? AV : MV)[S.view](u)}</div></main>
  <nav class="tabs" aria-label="Menu">${mob.map(tb).join("")}</nav></div>`;
}
function syncBadge() {
  return S.online
    ? S.outbox.length
      ? `<span class="pill warn">${ic("refresh", 14)} ${L("Sync ho raha hai", "Syncing")}</span>`
      : `<span class="pill ok">${ic("wifi", 14)} Online</span>`
    : `<span class="pill warn">${ic("wifioff", 14)} Offline${S.outbox.length ? " · " + S.outbox.length + " " + L("entry baaki", "pending") : ""}</span>`;
}
function topAction(u) {
  if (u.role === "admin") {
    if (S.view === "orders" || S.view === "home")
      return `<button type="button" class="btn pri" data-a="newOrder">${ic("plus")}${L("Naya order", "New order")}</button>`;
    if (S.view === "khaata")
      return `<button type="button" class="btn pri" data-a="payment">${ic("plus")}Payment</button>`;
    if (S.view === "kharcha")
      return `<button type="button" class="btn pri" data-a="expense">${ic("plus")}${L("Kharcha", "Expense")}</button>`;
    if (S.view === "team")
      return `<button type="button" class="btn pri" data-a="addUser">${ic("plus")}${L("Naya user", "New user")}</button>`;
    return "";
  }
  if (S.view === "home")
    return S.closed[u.unit] >= today0()
      ? `<span class="pill ok">${ic("check", 14)} ${L("Aaj ka din band", "Day closed")}</span>`
      : `<button type="button" class="btn pri" data-a="dayClose">${ic("lock")}${L("Din band karo", "Close the day")}</button>`;
  if (S.view === "karigar")
    return `<button type="button" class="btn pri" data-a="karSend">${ic("send")}${L("Karigar ko bhejo", "Send to karigar")}</button>`;
  if (S.view === "maal" && u.unit === "M")
    return `<button type="button" class="btn pri" data-a="transferSend">${ic("send")}${L("Maal bhejo", "Send material")}</button>`;
  return "";
}

/* ---------- admin views ---------- */
const AV = {
  home: adminHome,
  orders: ordersView,
  stock: stockView,
  products: productsView,
  production: productionView,
  karigar: karigarView,
  khaata: khaataView,
  kharcha: kharchaView,
  log: logView,
  team: teamView,
  guide: guideBody,
  reports: (...a) => reportsView(...a),
};
function journeyStages() {
  const raw = sum(
    RAW.filter((r) => r.id.startsWith("g")),
    (r) => qty("RAW:M", r.id, "kg"),
  );
  const plainM = sum(PLAINS, (k) => qty("PLAIN:M", k, "kg"));
  const transit = sum(
    S.transfers.filter((t) => t.status === "transit"),
    (t) => t.sent,
  );
  const coatP =
    sum(PLAINS, (k) => qty("PLAIN:P", k, "kg")) +
    sum(
      PRODUCTS.filter((p) => p.unit === "P"),
      (p) => qty("COAT:P", p.id, "kg"),
    );
  const coatZ =
    sum(PLAINS, (k) => qty("PLAIN:Z", k, "kg")) +
    sum(
      PRODUCTS.filter((p) => p.unit === "Z"),
      (p) => qty("COAT:Z", p.id, "kg"),
    );
  const kar = sum(S.jobs, (j) => jobBal(j).bal);
  const fin = sum(PRODUCTS, (p) => qty("FIN:" + p.unit, p.id, "bunch"));
  const md = S.dispatches.filter((d) => d.ts >= month0());
  let sb = 0,
    sk2 = 0;
  md.forEach((d) => {
    const o = S.orders.find((x) => x.id === d.order);
    d.lines.forEach(({ i, q }) => {
      if (o.lines[i].uom === "bunch") sb += q;
      else sk2 += q;
    });
  });
  return [
    {
      c: "var(--gold)",
      l: L("Raw GPPS", "Raw GPPS"),
      v: kg(raw),
      s: L("Moulding godown", "Moulding store"),
      go: "stock",
      tab: "raw",
    },
    {
      c: "var(--u-m)",
      l: L("Moulding · plain beads", "Moulding · plain beads"),
      v: kg(plainM),
      s: transit ? kg(transit) + " " + L("raste mein", "in transit") : "",
      go: "stock",
      tab: "plain",
    },
    {
      c: "var(--u-p)",
      l: "Pearl",
      v: kg(coatP),
      s: L("plain + coated", "plain + coated"),
      go: "stock",
      tab: "coat",
    },
    {
      c: "var(--u-z)",
      l: "Metalizing",
      v: kg(coatZ),
      s: L("plain + coated", "plain + coated"),
      go: "stock",
      tab: "coat",
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
      c: "var(--navy)",
      l: L("Taiyaar maal", "Finished stock"),
      v: nf(fin) + " bunch",
      s:
        L("Is mahine bika: ", "Sold this month: ") +
        nf(sb) +
        " bunch" +
        (sk2 ? " + " + kg(sk2) : ""),
      go: "stock",
      tab: "fin",
    },
  ];
}
function getAlerts() {
  const A = [];
  pendingEntries().length &&
    Object.keys(UNITS).forEach((u) => {
      const n = pendingEntries(u).length;
      if (n)
        A.push([
          "info",
          "check",
          L(
            `${UN(u)}: ${n} entry approval ke liye ruki hai`,
            `${UN(u)}: ${n} ${n > 1 ? "entries" : "entry"} awaiting approval`,
          ),
          "production",
        ]);
    });
  lowRaw().forEach((r) =>
    A.push([
      "warn",
      "alert",
      L(
        `${r.n} kam hai: ${fq(qty("RAW:" + r.unit, r.id, r.uom), r.uom)} (reorder ${fq(r.re, r.uom)})`,
        `${r.n} is low: ${fq(qty("RAW:" + r.unit, r.id, r.uom), r.uom)} (reorder at ${fq(r.re, r.uom)})`,
      ),
      "stock",
      "raw",
    ]),
  );
  S.jobs.forEach((j) => {
    const b = jobBal(j);
    if (b.bal > 0 && b.d > 15)
      A.push([
        "bad",
        "clock",
        L(
          `${KM[j.kar].n} ke paas ${kg(b.bal)} ${b.d} din se pada hai`,
          `${KM[j.kar].n} has held ${kg(b.bal)} for ${b.d} days`,
        ),
        "karigar",
      ]);
  });
  S.transfers
    .filter(
      (t) =>
        t.status === "received" &&
        Math.abs(t.recv - t.sent) > 0.05 &&
        Date.now() - t.ts < 7 * DAY,
    )
    .forEach((t) =>
      A.push([
        "bad",
        "scale",
        L(
          `${plainName(t.item)}: ${kg(t.sent)} bheja, ${kg(t.recv)} mila (${r1(t.recv - t.sent)} kg farak)`,
          `${plainName(t.item)}: sent ${kg(t.sent)}, received ${kg(t.recv)} (${r1(t.recv - t.sent)} kg gap)`,
        ),
        "stock",
        "plain",
      ]),
    );
  PARTIES.forEach((p) => {
    const o = partyInfo(p.id).out;
    if (o > p.limit)
      A.push([
        "bad",
        "wallet",
        L(
          `${p.n} ki baaki rakam ${rs(o)}, limit ${rs(p.limit)} se zyada`,
          `${p.n} owes ${rs(o)}, above the ${rs(p.limit)} limit`,
        ),
        "khaata",
      ]);
  });
  const w = S.orders.filter((o) => orderStatus(o) === "waiting").length;
  if (w)
    A.push([
      "warn",
      "receipt",
      L(
        `${w} order maal ke intezaar mein`,
        `${w} ${w > 1 ? "orders" : "order"} waiting for stock`,
      ),
      "orders",
    ]);
  const ui = uninvoiced().length;
  if (ui)
    A.push([
      "info",
      "receipt",
      L(
        `${ui} dispatch ka bill banana baaki`,
        `${ui} ${ui > 1 ? "dispatches" : "dispatch"} not billed yet`,
      ),
      "orders",
    ]);
  const ir = S.inwards.filter((i) => i.rate == null).length;
  if (ir)
    A.push([
      "info",
      "inbox",
      L(
        `${ir} inward ka rate bharna baaki`,
        `${ir} ${ir > 1 ? "inwards need" : "inward needs"} a rate`,
      ),
      "khaata",
      "inward",
    ]);
  return A;
}
function alertList(A) {
  return A.length
    ? `<div class="list">${A.map(([s, i, t, v, tab]) => `<button type="button" class="item" data-a="nav" data-v="${v}" ${tab ? `data-tab="${tab}"` : ""}><span class="ico-c ${s}">${ic(i, 17)}</span><span class="grow t1" style="font-weight:500">${esc(t)}</span>${ic("chev", 16)}</button>`).join("")}</div>`
    : `<div class="empty">${ic("check")}${L("Sab theek hai. Koi alert nahi.", "All clear. No alerts.")}</div>`;
}
function unitToday(u) {
  const es = todayEntries(u);
  const ap = es.filter((e) => e.status === "approved");
  return {
    out: sum(es, (e) => e.out),
    inp: sum(es, (e) => e.input),
    n: es.length,
    pend: es.filter((e) => e.status === "pending").length,
    apOut: sum(ap, (e) => e.out),
  };
}
function adminHome() {
  const h = new Date().getHours(),
    greet =
      h < 12
        ? L("Good morning", "Good morning")
        : h < 17
          ? L("Namaste", "Good afternoon")
          : L("Good evening", "Good evening");
  const A = getAlerts();
  const closed = Object.keys(UNITS)
    .map((u) =>
      S.closed[u] >= today0()
        ? `<span class="pill ok">${ic("check", 13)} ${UNITS[u].n}</span>`
        : `<span class="pill mute">${UNITS[u].n} · ${L("khula", "open")}</span>`,
    )
    .join(" ");
  const outT = sum(PARTIES, (p) => partyInfo(p.id).out);
  const sales = sum(
      S.invoices.filter((i) => i.ts >= month0()),
      (i) => i.total,
    ),
    got = sum(
      S.payments.filter((p) => p.ts >= month0()),
      (p) => p.amount,
    ),
    exp = sum(
      S.expenses.filter((e) => e.ts >= month0()),
      (e) => e.amount,
    );
  return `<section class="hero"><div class="hero-h"><div><div class="eyebrow">${greet} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div><h2>${L("Maal ka safar, abhi", "Where the material is, right now")}</h2><p>${L("Kisi bhi stage par tap karo, poori detail khulegi.", "Tap any stage for the full detail.")}</p></div><div class="btns">${[
    ["inward", "inbox", "Inward", "Inward"],
    ["task", "list", "Naya task", "New task"],
    ["kar", "thread", "Karigar ko bhejo", "Send to karigar"],
    ["stock", "box", "Stock jodo", "Add stock"],
  ]
    .map(
      ([q, i, h, e]) =>
        `<button type="button" class="btn sm" data-a="quick" data-q="${q}">${ic(i, 15)} ${L(h, e)}</button>`,
    )
    .join("")}</div></div>
  <div class="journey">${journeyStages()
    .map(
      (s) =>
        `<button type="button" class="stage" data-a="nav" data-v="${s.go}" ${s.tab ? `data-tab="${s.tab}"` : ""}><span class="pearl" style="--c:${s.c}"></span><span class="lab">${s.l}</span><span class="val">${s.v}</span><span class="sub">${s.s}</span></button>`,
    )
    .join("")}</div></section>
  <div class="kpis">
   <div class="kpi"><span>${L("Bazaar mein baaki", "Total receivable")}</span><b>${rs(outT)}</b><small>${PARTIES.filter((p) => partyInfo(p.id).out > 0.5).length} ${L("party", "parties")}</small></div>
   <div class="kpi"><span>${L("Is mahine ki bikri", "Billed this month")}</span><b>${rs(sales)}</b><small>${S.invoices.filter((i) => i.ts >= month0()).length} ${L("bill", "bills")}</small></div>
   <div class="kpi"><span>${L("Is mahine aaya paisa", "Received this month")}</span><b>${rs(got)}</b><small>${S.payments.filter((p) => p.ts >= month0()).length} payment</small></div>
   <div class="kpi"><span>${L("Is mahine ka kharcha", "Expenses this month")}</span><b>${rs(exp)}</b><small>${L("teeno units", "all units")}</small></div></div>
  <div class="grid-2">
   <section class="card"><div class="card-h"><h3>${L("Dhyan do", "Needs attention")}</h3><span class="pill mute">${A.length}</span></div>${alertList(A)}</section>
   <section class="card"><div class="card-h"><h3>${L("Aaj ka production", "Today's production")}</h3><button type="button" class="btn sm ghost" data-a="nav" data-v="production">${L("Sab dekho", "View all")} ${ic("chev", 14)}</button></div>
    <div class="list">${Object.keys(UNITS)
      .map((u) => {
        const t = unitToday(u),
          y = t.inp ? t.out / t.inp : 0;
        return `<div class="item"><span class="pearl" style="--c:var(${UNITS[u].c});width:34px;height:34px;box-shadow:none"></span><div class="grow"><div class="t1">${UNITS[u].n}</div><div class="t2">${t.n} entry · ${UNITS[u].machines.map((m) => `${m} ${machineState(m)[0] === "run" ? "●" : "○"}`).join(" ")}</div></div><div class="end"><b class="num">${fq(t.out, uomU(u))}</b><span class="psub">${beads(y, 10, `var(${UNITS[u].c})`)} ${t.inp ? nf(y * 100, 1) + "%" : "–"}</span>${t.pend ? `<span class="pill warn">${t.pend} ${L("baaki", "pending")}</span>` : ""}</div></div>`;
      })
      .join("")}</div></section></div>
  <section class="card"><div class="card-h"><div><h3>${L("Pichhle 7 din ka production", "Production, last 7 days")}</h3><p>${L("Approved entries, kg mein", "Approved entries, in kg")}</p></div><div class="legend">${Object.keys(
    UNITS,
  )
    .map(
      (u) => `<span><i style="--c:var(${UNITS[u].c})"></i>${UNITS[u].n}</span>`,
    )
    .join("")}</div></div><div class="chart">${chart7()}</div></section>`;
}
function chart7() {
  const t0 = today0(),
    ds = [...Array(7)].map((_, i) => t0 - (6 - i) * DAY);
  const data = ds.map((d) => {
    const es = S.entries.filter(
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
  const mx = Math.max(...data.map((x) => x.M + x.P + x.Z), 1),
    step = mx > 1000 ? 500 : 200,
    top = Math.ceil(mx / step) * step;
  const W = 700,
    H = 220,
    l = 48,
    r = 8,
    t = 10,
    b = 30,
    cw = (W - l - r) / 7,
    bw = Math.min(46, cw * 0.56),
    y = (v) => t + (H - t - b) * (1 - v / top);
  let g = "";
  for (let v = 0; v <= top; v += step)
    g += `<line class="gl" x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${l - 8}" y="${y(v) + 4}" text-anchor="end">${nf(v)}</text>`;
  let bars = "";
  data.forEach((x, i) => {
    const cx = l + cw * i + cw / 2;
    let base = 0;
    ["M", "P", "Z"].forEach((u, k) => {
      const v = x[u];
      if (!v) return;
      const y1 = y(base + v),
        y0 = y(base);
      bars += `<rect x="${cx - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(0, y0 - y1 - (k < 2 ? 1.5 : 0))}" rx="4" style="fill:var(${UNITS[u].c})"><title>${UNITS[u].n}: ${kg(v)}</title></rect>`;
      base += v;
    });
    bars += `<text class="ax" x="${cx}" y="${H - 10}" text-anchor="middle">${i === 6 ? L("Aaj", "Today") : new Date(x.d).toLocaleDateString("en-IN", { weekday: "short" })}</text>`;
    if (i === 6)
      bars += `<text class="ax" x="${cx}" y="${y(x.M + x.P + x.Z) - 6}" text-anchor="middle" style="font-weight:600;fill:var(--ink)">${nf(x.M + x.P + x.Z)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L("7 din ka production", "7-day production")}">${g}${bars}</svg>`;
}
function ordersView() {
  const tab = S.ui.orderTab,
    list = S.orders.slice().sort((a, b) => b.ts - a.ts);
  const cnt = (k) => list.filter((o) => orderStatus(o) === k).length;
  const tabs = [
    ["all", L("Sab", "All")],
    ["waiting", L("Maal ka intezaar", "Waiting")],
    ["ready", "Ready"],
    ["partial", L("Aadha gaya", "Part sent")],
    ["dispatched", L("Gaya", "Dispatched")],
    ["closed", L("Band", "Closed")],
  ];
  const shown = list.filter((o) => tab === "all" || orderStatus(o) === tab);
  const ui = uninvoiced();
  return `${
    ui.length
      ? `<section class="card" style="background:var(--gold-soft);border-color:transparent"><div class="card-h"><div><h3>${L("Bill banana baaki", "Waiting to be billed")}</h3><p>${L("Yeh maal dispatch ho chuka hai", "These dispatches have left the factory")}</p></div></div><div class="list">${ui
          .map((d) => {
            const o = S.orders.find((x) => x.id === d.order);
            return `<div class="item"><span class="ico-c info">${ic("truck", 17)}</span><div class="grow"><div class="t1">#${o.no} · ${esc(PTY[o.party].n)}</div><div class="t2">${d.lines.map(({ i, q }) => fq(q, o.lines[i].uom) + " " + esc(itemName(o.lines[i]))).join(", ")} · ${fwhen(d.ts)} · ${esc(d.vehicle || "")}</div></div><button type="button" class="btn sm pri" data-a="bill" data-id="${d.id}">${L("Bill banao", "Make bill")}</button></div>`;
          })
          .join("")}</div></section>`
      : ""
  }
  <div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l]) => `<button type="button" data-a="ui" data-k="orderTab" data-val="${k}" aria-pressed="${tab === k}">${l}${k !== "all" && cnt(k) ? `<span class="badge">${cnt(k)}</span>` : ""}</button>`).join("")}</div></div>
  <div class="list">${
    shown.length
      ? shown
          .map((o) => {
            const st = orderStatus(o),
              tq = sum(o.lines, (l) => l.qty),
              dq = sum(o.lines, (l) => l.disp);
            return `<button type="button" class="item" data-a="orderDetail" data-id="${o.id}">${o.lines[0].kind === "plain" ? pthumb() : thumb(PM[o.lines[0].ref])}<div class="grow"><div class="t1">#${o.no} · ${esc(PTY[o.party].n)}</div><div class="t2">${o.lines.map((l) => fq(l.qty, l.uom) + " " + esc(itemName(l))).join(" + ")}</div><div class="t2">${fdate(o.ts)} · ${L("Delivery", "Due")} ${fdate(o.promise)}</div></div><div class="end">${opill(st)}<b class="num">${rs(orderValue(o))}</b>${beads(tq ? dq / tq : 0, 8, "var(--ok)")}</div></button>`;
          })
          .join("")
      : `<div class="empty">${L("Is filter mein koi order nahi", "No orders in this filter")}</div>`
  }</div>`;
}
function stockView(u) {
  const tab = S.ui.stockTab,
    un = S.ui.stockUnit;
  const tabs = [
    ["fin", L("Taiyaar maal", "Finished")],
    ["coat", L("Coated (bina dhaage)", "Coated (unthreaded)")],
    ["plain", "Plain beads"],
    ["raw", "Raw material"],
    [
      "counts",
      L("Ginti approval", "Count approvals"),
      S.counts.filter((c) => c.status === "pending").length,
    ],
  ];
  let body = "";
  if (tab === "counts") {
    body = countsAdmin();
  } else if (tab === "fin" || tab === "coat") {
    const ps = PRODUCTS.filter((p) => un === "all" || p.unit === un);
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
    <div class="tw"><table><thead><tr><th>Product</th><th>Unit</th>${tab === "fin" ? `<th class="r">Bunch</th><th class="r">≈ kg</th>` : `<th class="r">kg</th>`}<th>${L("Haalat", "Status")}</th></tr></thead><tbody>${ps
      .map((p) => {
        const q =
          tab === "fin"
            ? qty("FIN:" + p.unit, p.id, "bunch")
            : qty("COAT:" + p.unit, p.id, "kg");
        const low = tab === "fin" ? q < 50 : q < 20;
        return `<tr class="click" data-a="product" data-id="${p.id}"><td>${itemCell("fin", p.id)}</td><td>${uchip(p.unit)}</td>${tab === "fin" ? `<td class="r"><b>${nf(q)}</b></td><td class="r">${kg(q * S.kpb[p.id])}</td>` : `<td class="r"><b>${kg(q)}</b></td>`}<td>${low ? `<span class="pill warn">${L("Kam", "Low")}</span>` : `<span class="pill ok">OK</span>`}</td></tr>`;
      })
      .join("")}</tbody></table></div>`;
  } else if (tab === "plain") {
    body = `<p class="muted" style="font-size:13px">${L("Moulding se nikle bina rang ke beads. Pearl aur Metalizing column = wahan pahunch chuka maal.", "Uncoloured beads from moulding. Pearl and Metalizing columns show what has reached those units.")}</p><div class="tw"><table><thead><tr><th>Plain bead</th><th class="r">Moulding</th><th class="r">Pearl</th><th class="r">Metalizing</th><th class="r">${L("Kul", "Total")}</th></tr></thead><tbody>${PLAINS.map(
      (k) => {
        const a = qty("PLAIN:M", k, "kg"),
          b = qty("PLAIN:P", k, "kg"),
          c = qty("PLAIN:Z", k, "kg");
        return `<tr><td>${itemCell("plain", k)}</td><td class="r">${kg(a)}</td><td class="r">${kg(b)}</td><td class="r">${kg(c)}</td><td class="r"><b>${kg(a + b + c)}</b></td></tr>`;
      },
    ).join("")}</tbody></table></div>`;
  } else {
    body = `<div class="tw"><table><thead><tr><th>Material</th><th>Unit</th><th class="r">${L("Stock", "Stock")}</th><th>${L("Reorder tak", "vs reorder level")}</th><th>${L("Haalat", "Status")}</th></tr></thead><tbody>${RAW.map(
      (r) => {
        const q = qty("RAW:" + r.unit, r.id, r.uom),
          f = Math.min(1, q / (r.re * 3)),
          low = q < r.re;
        return `<tr><td><div class="pname">${esc(r.n)}</div><div class="psub">reorder ${fq(r.re, r.uom)}</div></td><td>${uchip(r.unit)}</td><td class="r"><b>${fq(q, r.uom)}</b></td><td><div class="meter" style="--c:${low ? "var(--bad)" : "var(--ok)"}"><i style="width:${f * 100}%"></i></div></td><td>${low ? `<span class="pill bad">${L("Mangwao", "Reorder")}</span>` : `<span class="pill ok">OK</span>`}</td></tr>`;
      },
    ).join(
      "",
    )}</tbody></table></div><p class="muted" style="font-size:12.5px">${L("Raw material ki list sample hai. Owner se asli list leke settings mein badlegi.", "This raw material list is a sample. It will be replaced with the owner's real list in settings.")}</p>`;
  }
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, n]) => `<button type="button" data-a="ui" data-k="stockTab" data-val="${k}" aria-pressed="${tab === k}">${l}${n ? `<span class="badge">${n}</span>` : ""}</button>`).join("")}</div></div><section class="card">${body}</section>`;
}
function productsView() {
  const f = S.ui,
    ps = PRODUCTS.filter(
      (p) =>
        (f.shape === "all" || p.shape === f.shape) &&
        (f.grade === "all" || p.grade === f.grade) &&
        (f.punit === "all" || p.unit === f.punit),
    );
  const chipRow = (k, opts) =>
    `<div class="chips">${opts.map(([v, l]) => `<button type="button" class="chip" data-a="ui" data-k="${k}" data-val="${v}" aria-pressed="${f[k] === v}">${l}</button>`).join("")}</div>`;
  return `<section class="card"><div class="card-h"><div><h3>${L("Catalogue", "Catalogue")} · ${ps.length} ${L("product", "products")}</h3><p>${L("Beads Bazaar brochure se. SR = Shalimar (heavyweight), TR = Treemurti (lightweight).", "From the Beads Bazaar brochure. SR = Shalimar (heavyweight), TR = Treemurti (lightweight).")}</p></div></div>
  ${chipRow("shape", [["all", L("Sab shape", "All shapes")], ...SHAPES.map((s) => [s, s])])}
  <div class="toolbar">${chipRow("grade", [
    ["all", L("Dono grade", "Both grades")],
    ["SR", "SR · Shalimar"],
    ["TR", "TR · Treemurti"],
  ])}${chipRow("punit", [
    ["all", L("Dono unit", "Both units")],
    ["P", "Pearl"],
    ["Z", "Metalizing"],
  ])}</div></section>
  <div class="pgrid">${
    ps
      .map(
        (
          p,
        ) => `<button type="button" class="pcard" data-a="product" data-id="${p.id}"><img src="${IMG[p.img]}" alt="${esc(pname(p))}" loading="lazy">${uchip(p.unit)}<div class="ptitle">${esc(pname(p))} – ${esc(psub(p))}</div>
   <dl class="spec"><dt>Shape</dt><dd>${p.shape}</dd><dt>Color</dt><dd>${p.color}</dd><dt>Size</dt><dd>${p.size}</dd><dt>Material</dt><dd>${p.mat}</dd><dt>Grade</dt><dd>${p.grade}</dd></dl>
   <div class="pfoot"><span><b class="num">${nf(qty("FIN:" + p.unit, p.id, "bunch"))}</b> bunch</span><span class="num">${rs(S.prices[p.id].bunch)}/bunch</span></div></button>`,
      )
      .join("") ||
    `<div class="empty">${L("Is filter mein koi product nahi", "No products match")}</div>`
  }</div>`;
}
function productionView() {
  const tab = S.ui.prodTab;
  const pend = pendingEntries();
  const tabs = [
    ["pending", L("Approval baaki", "Awaiting approval"), pend.length],
    ["today", L("Aaj", "Today")],
    ["week", L("7 din", "7 days")],
  ];
  let rows =
    tab === "pending"
      ? pend
      : tab === "today"
        ? S.entries.filter((e) => e.ts >= today0())
        : S.entries.filter((e) => e.ts >= today0() - 6 * DAY);
  rows = rows
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 80);
  const machines = Object.entries(UNITS).flatMap(([u, U]) =>
    U.machines.map((m) => ({ u, m })),
  );
  return `<section class="card"><div class="card-h"><h3>${L("Machines abhi", "Machines right now")}</h3></div><div class="mgrid">${machines
    .map(({ u, m }) => {
      const [st, lab] = machineState(m),
        es = todayEntries(u, m),
        o = sum(es, (e) => e.out),
        inp = sum(es, (e) => e.input),
        sh = S.shift[m];
      return `<div class="mcard"><div class="toolbar"><b class="mn">${m}</b>${uchip(u)}</div><span class="status ${st}"><i></i>${lab}</span><div class="t2 muted" style="font-size:12.5px">${MSTAFF[m]} · ${es.length} entry${sh && sh.down ? ` · ${sh.down} min ${L("ruki", "down")}` : ""}</div><div class="toolbar"><b class="num">${fq(o, uomU(u))}</b>${beads(inp ? o / inp : 0, 8, `var(${UNITS[u].c})`)}</div></div>`;
    })
    .join("")}</div></section>
  <div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, n]) => `<button type="button" data-a="ui" data-k="prodTab" data-val="${k}" aria-pressed="${tab === k}">${l}${n ? `<span class="badge">${n}</span>` : ""}</button>`).join("")}</div></div>
  <section class="card">${rows.length ? `<div class="tw"><table><thead><tr><th>${L("Kab", "When")}</th><th>Machine</th><th>Product</th><th class="r">${L("Lagaya", "Input")}</th><th class="r">${L("Achha", "Good")}</th><th class="r">Reject</th><th class="r">Yield</th><th>Status</th><th></th></tr></thead><tbody>${rows.map((e) => `<tr><td class="num">${fwhen(e.ts)}</td><td><div class="pname">${e.machine}</div><div class="psub">${esc(e.staff)}${e.lotNo || e.lot ? " · " + (e.lotNo || e.lot) : ""}</div></td><td>${e.unit === "M" ? itemCell("plain", e.product) : itemCell("fin", e.product)}</td><td class="r">${eq(e, e.input)}</td><td class="r"><b>${eq(e, e.out)}</b></td><td class="r">${eq(e, e.reject)}</td><td class="r">${nf(yieldOf(e) * 100, 1)}%</td><td>${epill(e)}</td><td>${e.status === "pending" ? `<div class="btns"><button type="button" class="btn sm ok" data-a="approve" data-id="${e.id}" ${canApprove(e) ? "" : 'disabled title="' + L("Stock kam hai", "Not enough stock") + '"'}>${ic("check", 15)}</button><button type="button" class="btn sm danger" data-a="returnEntry" data-id="${e.id}" aria-label="${L("Wapas bhejo", "Send back")}">${ic("undo", 15)}</button></div>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">${ic("check")}${L("Koi entry approval ke liye nahi ruki", "Nothing waiting for approval")}</div>`}</section>`;
}
function karigarView(u) {
  const unitF = u.role === "manager" ? u.unit : null,
    jobs = S.jobs
      .filter((j) => !unitF || j.unit === unitF)
      .map((j) => ({ j, b: jobBal(j) }))
      .sort((a, b) => b.b.bal - a.b.bal || b.j.ts - a.j.ts);
  const sumK = KARIGARS.map((k) => {
    const js = jobs.filter((x) => x.j.kar === k.id && x.b.bal > 0);
    return {
      k,
      bal: sum(js, (x) => x.b.bal),
      n: js.length,
      old: js.length ? Math.max(...js.map((x) => x.b.d)) : 0,
    };
  });
  return `<div class="grid-3">${sumK.map(({ k, bal, n, old }) => `<div class="kpi"><span>${esc(k.n)} · ${esc(k.a)}</span><b>${kg(bal)}</b><small>${n} ${L("kaam khula", "open jobs")}${old > 15 ? ` · <span style="color:var(--bad);font-weight:600">${old} ${L("din purana", "days old")}</span>` : old ? ` · ${old} ${L("din", "days")}` : ""}</small>${u.role === "admin" ? `<div class="toolbar" style="margin-top:6px"><span class="psub">${L("Dena baaki", "Wages due")} <b style="color:var(--ink)">${rs(karInfo(k.id).due)}</b></span><button type="button" class="btn sm" data-a="karKhata" data-id="${k.id}">${ic("wallet", 14)} Khata</button></div>` : ""}</div>`).join("")}</div>
  <section class="card"><div class="card-h"><div><h3>${L("Karigar ka hisaab", "Karigar jobs")}</h3><p>${L("Baaki = bheja − (wapas bunch × kg/bunch) − loose − wastage. 15 din se zyada = lal.", "Balance = sent − (bunches back × kg per bunch) − loose − wastage. Over 15 days turns red.")} ${L(`Chhoot ${S.tol}%, ₹${S.karRate}/bunch.`, `Tolerance ${S.tol}%, ₹${S.karRate}/bunch.`)}</p></div></div>
  ${jobs.length ? `<div class="tw"><table><thead><tr><th>Product</th><th>Karigar</th>${unitF ? "" : "<th>Unit</th>"}<th class="r">${L("Bheja", "Sent")}</th><th class="r">${L("Wapas bunch", "Bunches back")}</th><th class="r">Loose + waste</th><th class="r">${L("Baaki", "Balance")}</th><th>${L("Din", "Days")}</th><th></th></tr></thead><tbody>${jobs.map(({ j, b }) => `<tr><td>${itemCell("fin", j.product)}</td><td>${esc(KM[j.kar].n)}</td>${unitF ? "" : `<td>${uchip(j.unit)}</td>`}<td class="r">${kg(j.sent)}<div class="psub">${fdate(j.ts)}</div></td><td class="r">${nf(b.bunch)}</td><td class="r">${kg(b.loose)} + ${kg(b.waste)}</td><td class="r"><b>${kg(b.bal)}</b></td><td>${j.closed ? `<span class="pill ${j.penalty ? "bad" : "ok"}">${L("Band", "Closed")}${j.penalty ? " · −" + rs(j.penalty) : ""}</span>` : b.bal > 0 ? `<span class="pill ${b.d > 15 ? "bad" : b.d > 7 ? "warn" : "mute"}">${b.d} ${L("din", "d")}</span>` : `<span class="pill ok">${L("Pura", "Done")}</span>`}</td><td><div class="btns" style="justify-content:flex-end">${!j.closed && b.bal > 0 ? `<button type="button" class="btn sm" data-a="karRecv" data-id="${j.id}">${L("Wapas lo", "Receive")}</button>` : ""}<button type="button" class="btn sm" data-a="challan" data-id="${j.id}">Challan</button>${u.role === "admin" && !j.closed && j.receipts.length && rawBal(j).bal <= j.sent * 0.05 ? `<button type="button" class="btn sm pri" data-a="closeJob" data-id="${j.id}">${L("Hisaab band", "Close job")}</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">${L("Abhi koi maal karigar ke paas nahi", "Nothing is with karigars right now")}</div>`}</section>`;
}
function khaataView() {
  const tab = S.ui.khaataTab,
    ir = S.inwards.filter((i) => i.rate == null);
  const tabs = [
    ["parties", L("Party", "Parties")],
    ["bills", L("Bill", "Bills")],
    ["pays", "Payments"],
    ["inward", L("Inward rate", "Inward rates"), ir.length],
  ];
  let body = "";
  if (tab === "parties")
    body = `<div class="tw"><table><thead><tr><th>Party</th><th class="r">${L("Baaki", "Outstanding")}</th><th>${L("Credit limit", "Credit limit")}</th><th>${L("Sabse purana", "Oldest due")}</th><th></th></tr></thead><tbody>${PARTIES.map(
      (p) => {
        const pi = partyInfo(p.id),
          f = Math.min(1, pi.out / p.limit),
          over = pi.out > p.limit;
        return `<tr class="click" data-a="ledger" data-id="${p.id}"><td><div class="pname">${esc(p.n)}</div><div class="psub">${esc(p.city)}, ${esc(p.state)}</div></td><td class="r"><b>${rs(pi.out)}</b></td><td><div class="meter" style="--c:${over ? "var(--bad)" : f > 0.8 ? "var(--warn)" : "var(--ok)"}"><i style="width:${f * 100}%"></i></div><div class="psub">${rs(p.limit)}${over ? ` · <span style="color:var(--bad);font-weight:600">${L("limit paar", "over limit")}</span>` : ""}</div></td><td>${pi.oldest ? `<span class="pill ${pi.oldest > 30 ? "bad" : pi.oldest > 15 ? "warn" : "mute"}">${pi.oldest} ${L("din", "days")}</span>` : "–"}</td><td><button type="button" class="btn sm" data-a="payment" data-id="${p.id}">+ Payment</button></td></tr>`;
      },
    ).join("")}</tbody></table></div>`;
  else if (tab === "bills")
    body = S.invoices.length
      ? `<div class="tw"><table><thead><tr><th>Bill</th><th>Party</th><th>${L("Tarikh", "Date")}</th><th class="r">Total</th><th>Status</th></tr></thead><tbody>${S.invoices
          .slice()
          .sort((a, b) => b.ts - a.ts)
          .map((i) => {
            const ps = invPaid(i);
            return `<tr class="click" data-a="invoice" data-id="${i.id}"><td><div class="pname">${i.no}</div><div class="psub">${i.type === "GST" ? "GST tax invoice" : L("Kachcha bill", "Estimate")}</div></td><td>${esc(PTY[i.party].n)}</td><td>${fdate(i.ts)}</td><td class="r"><b>${rs(i.total)}</b></td><td>${ps === "paid" ? `<span class="pill ok">Paid</span>` : ps === "part" ? `<span class="pill warn">${L("Aadha paid", "Part paid")}</span>` : `<span class="pill bad">${L("Baaki", "Unpaid")}</span>`}</td></tr>`;
          })
          .join("")}</tbody></table></div>`
      : `<div class="empty">${L("Abhi koi bill nahi", "No bills yet")}</div>`;
  else if (tab === "pays")
    body = `<div class="tw"><table><thead><tr><th>${L("Tarikh", "Date")}</th><th>Party</th><th>Mode</th><th>Ref</th><th class="r">${L("Rakam", "Amount")}</th></tr></thead><tbody>${S.payments
      .slice()
      .sort((a, b) => b.ts - a.ts)
      .map(
        (p) =>
          `<tr><td>${fdate(p.ts)}</td><td>${esc(PTY[p.party].n)}</td><td><span class="pill mute">${p.mode}</span></td><td class="psub">${esc(p.ref)}</td><td class="r"><b>${rs(p.amount)}</b></td></tr>`,
      )
      .join("")}</tbody></table></div>`;
  else
    body = `<p class="muted" style="font-size:13px">${L("Jo inward bina rate ke save hua, uska rate yahan bharo (bill photo dekh ke).", "Inwards saved without a rate show here. Add the rate from the bill photo.")}</p>${
      S.inwards.length
        ? `<div class="list">${S.inwards
            .slice()
            .sort((a, b) => b.ts - a.ts)
            .map(
              (i) =>
                `<div class="item"><span class="ico-c ${i.rate == null ? "warn" : "ok"}">${ic("inbox", 17)}</span><div class="grow"><div class="t1">${fq(i.qty, RM[i.mat].uom)} ${esc(RM[i.mat].n)}</div><div class="t2">${esc(i.supplier)} · Bill ${esc(i.bill)} · ${fwhen(i.ts)} · ${esc(i.by)} ${uchip(i.unit)}</div><div class="t2">${ic("camera", 13)} ${esc(i.photo || L("photo nahi", "no photo"))}</div></div>${i.rate == null ? `<div class="end"><div class="fld" style="width:120px"><label for="rate-${i.id}">₹ / ${RM[i.mat].uom}</label><input id="rate-${i.id}" type="number" inputmode="decimal" min="0" step="0.01"></div><button type="button" class="btn sm pri" data-a="saveRate" data-id="${i.id}">Save</button></div>` : `<div class="end"><b class="num">${rs(i.rate)}/${RM[i.mat].uom}</b><span class="psub">${rs(i.rate * i.qty)}</span></div>`}</div>`,
            )
            .join("")}</div>`
        : ""
    }`;
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, n]) => `<button type="button" data-a="ui" data-k="khaataTab" data-val="${k}" aria-pressed="${tab === k}">${l}${n ? `<span class="badge">${n}</span>` : ""}</button>`).join("")}</div></div><section class="card">${body}</section>`;
}
function kharchaView() {
  const ms = S.expenses.filter((e) => e.ts >= month0()),
    tot = sum(ms, (e) => e.amount);
  const byU = ["M", "P", "Z", "ALL"].map((u) => ({
    u,
    a: sum(
      ms.filter((e) => e.unit === u),
      (e) => e.amount,
    ),
  }));
  const mx = Math.max(...byU.map((x) => x.a), 1);
  return `<section class="card"><div class="card-h"><div><h3>${L("Is mahine", "This month")}: ${rs(tot)}</h3><p>${L("Har kharcha ek unit ke naam par, taaki har unit ka asli kharcha dikhe.", "Each expense is tagged to a unit, so each unit's real cost is visible.")}</p></div></div>
  <div class="list">${byU.map(({ u, a }) => `<div class="toolbar"><span style="min-width:110px">${uchip(u)}</span><div class="meter" style="flex:1;--c:var(${u === "ALL" ? "--u-k" : UNITS[u].c})"><i style="width:${(a / mx) * 100}%"></i></div><b class="num" style="min-width:90px;text-align:right">${rs(a)}</b></div>`).join("")}</div></section>
  <section class="card"><div class="tw"><table><thead><tr><th>${L("Tarikh", "Date")}</th><th>${L("Kis cheez ka", "Category")}</th><th>Unit</th><th>Note</th><th class="r">${L("Rakam", "Amount")}</th></tr></thead><tbody>${S.expenses
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .map(
      (e) =>
        `<tr><td>${fdate(e.ts)}</td><td>${esc(e.cat)}</td><td>${uchip(e.unit)}</td><td class="psub">${esc(e.note)}</td><td class="r"><b>${rs(e.amount)}</b></td></tr>`,
    )
    .join("")}</tbody></table></div></section>`;
}
function logView() {
  return `<section class="card"><div class="card-h"><div><h3>${L("Kisne, kab, kya kiya", "Who did what, when")}</h3><p>${L("Har badlav yahan likha jaata hai. Koi entry delete nahi hoti, sirf reverse.", "Every change is recorded here. Nothing is deleted, only reversed.")}</p></div></div><div class="list">${S.log
    .slice(0, 60)
    .map(
      (x) =>
        `<div class="item"><span class="av" style="--c:${x.role === "admin" ? "var(--gold)" : x.unit ? `var(${UNITS[x.unit].c})` : "var(--u-p)"};width:32px;height:32px;font-size:12px">${esc(x.who[0])}</span><div class="grow"><div class="t1" style="font-weight:500">${esc(L(x.h, x.e))}</div><div class="t2">${esc(x.who)} · ${x.role === "admin" ? "Admin" : x.role === "manager" ? "Manager" : "Staff"}${x.unit ? " · " + UNITS[x.unit].n : ""}</div></div><span class="psub num">${fwhen(x.ts)}</span></div>`,
    )
    .join("")}</div></section>`;
}

/* ---------- manager views ---------- */
const MV = {
  home: managerHome,
  approve: approveView,
  maal: maalView,
  karigar: karigarView,
  dispatch: dispatchView,
  guide: guideBody,
};
function managerHome(u) {
  const U = UNITS[u.unit],
    t = unitToday(u.unit),
    y = t.inp ? t.out / t.inp : 0,
    pend = pendingEntries(u.unit).length,
    inc = incoming(u.unit),
    dq = dispatchQueue(u.unit).length;
  const karBal = sum(
    S.jobs.filter((j) => j.unit === u.unit),
    (j) => jobBal(j).bal,
  );
  const tiles = [
    ["approve", "check", L("Approve karo", "Approve"), pend + " entry", pend],
    [
      "maal",
      "swap",
      L("Aane wala maal", "Incoming material"),
      inc.length ? kg(sum(inc, (x) => x.sent)) : L("Kuch nahi", "Nothing"),
      inc.length,
    ],
    ["dispatch", "truck", "Dispatch", dq + " order", dq],
  ];
  if (u.unit !== "M")
    tiles.splice(2, 0, [
      "karigar",
      "thread",
      L("Karigar ke paas", "With karigars"),
      kg(karBal),
      0,
    ]);
  return `<section class="hero" style="--c:var(${U.c})"><div class="hero-h"><div><div class="eyebrow">${L("Aaj", "Today")} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</div><h2>${U.n} unit</h2><p>${L("Approved + approval baaki, dono", "Approved and awaiting approval")}</p></div></div>
  <div class="hstats"><div class="stats"><div><b>${kg(t.out)}</b><span>${L("aaj ka output", "output today")}</span></div><div><b>${t.inp ? nf(y * 100, 1) + "%" : "–"}</b><span>yield</span></div><div><b>${t.n}</b><span>entry</span></div></div>${beads(y, 20, `var(${U.c})`, true)}</div></section>
  <div class="grid-3">${tiles.map(([v, i, l, s, b]) => `<button type="button" class="item" data-a="nav" data-v="${v}"><span class="ico-c ${b ? "warn" : "info"}">${ic(i, 17)}</span><div class="grow"><div class="t1">${l}</div><div class="t2">${s}</div></div>${b ? `<span class="badge">${b}</span>` : ""}${ic("chev", 16)}</button>`).join("")}</div>
  <section class="card"><div class="card-h"><h3>Machines</h3></div><div class="mgrid">${U.machines
    .map((m) => {
      const [st, lab] = machineState(m),
        es = todayEntries(u.unit, m),
        o = sum(es, (e) => e.out),
        inp = sum(es, (e) => e.input),
        sh = S.shift[m];
      return `<div class="mcard"><b class="mn">${m}</b><span class="status ${st}"><i></i>${lab}</span><div class="psub">${MSTAFF[m]} · ${es.length} entry${sh && sh.down ? ` · ${sh.down} min ${L("ruki", "down")}` : ""}</div><div class="toolbar"><b class="num">${fq(o, uomU(u))}</b>${beads(inp ? o / inp : 0, 8, `var(${U.c})`)}</div></div>`;
    })
    .join("")}</div></section>
  <section class="card"><div class="card-h"><div><h3>Raw material</h3><p>${L("Inward maal aate hi yahan judta hai", "Inward adds here as soon as it arrives")}</p></div><button type="button" class="btn sm" data-a="inward">${ic("inbox", 15)} Inward</button></div><div class="list">${RAW.filter(
    (r) => r.unit === u.unit,
  )
    .map((r) => {
      const q = qty("RAW:" + r.unit, r.id, r.uom),
        low = q < r.re;
      return `<div class="toolbar"><div style="min-width:150px"><div class="pname">${esc(r.n)}</div><div class="psub">reorder ${fq(r.re, r.uom)}</div></div><div class="meter" style="flex:1;--c:${low ? "var(--bad)" : "var(--ok)"}"><i style="width:${Math.min(1, q / (r.re * 3)) * 100}%"></i></div><b class="num" style="min-width:90px;text-align:right">${fq(q, r.uom)}</b>${low ? `<span class="pill bad">${L("Kam", "Low")}</span>` : ""}</div>`;
    })
    .join("")}</div></section>`;
}
function approveView(u) {
  const pend = pendingEntries(u.unit).sort((a, b) => a.ts - b.ts),
    done = S.entries
      .filter(
        (e) =>
          !e.hist &&
          (!u.unit || e.unit === u.unit) &&
          e.status !== "pending" &&
          e.ts >= today0(),
      )
      .sort((a, b) => b.ts - a.ts);
  return `<section class="card"><div class="card-h"><div><h3>${L("Approval ke liye", "Awaiting approval")} · ${pend.length}</h3><p>${L("Approve karte hi stock mein judta hai. Galat lage toh note ke saath staff ko wapas bhejo.", "Stock updates the moment you approve. If something looks wrong, send it back to the staff with a note.")}</p></div></div>
  ${
    pend.length
      ? `<div class="list">${pend
          .map((e) => {
            const ok = canApprove(e),
              y = yieldOf(e);
            return `<div class="item" style="align-items:flex-start;flex-wrap:wrap">${e.unit === "M" ? pthumb() : thumb(PM[e.product])}<div class="grow" style="min-width:200px"><div class="t1">${esc(entryItemName(e))}</div><div class="t2">${uchip(e.unit)} ${e.machine} · ${esc(e.staff)} · ${ftime(e.ts)}</div>
   <div class="t2 num" style="margin-top:4px">${L("Lagaya", "Input")} <b>${eq(e, e.input)}</b> → ${L("Achha", "Good")} <b>${eq(e, e.out)}</b> · Reject <b>${eq(e, e.reject)}</b></div><div class="yield" style="margin-top:4px">${beads(y, 10, `var(${UNITS[e.unit].c})`)}<b>${nf(y * 100, 1)}%</b></div>
   ${ok ? "" : `<div class="note warn" style="margin-top:8px">${ic("alert", 16)}<span>${approveNote(e)}</span></div>`}</div>
   <div class="btns"><button type="button" class="btn ok" data-a="approve" data-id="${e.id}" ${ok ? "" : "disabled"}>${ic("check", 16)} Approve</button><button type="button" class="btn danger" data-a="returnEntry" data-id="${e.id}">${ic("undo", 16)} ${L("Wapas bhejo", "Send back")}</button></div></div>`;
          })
          .join("")}</div>`
      : `<div class="empty">${ic("check")}${L("Sab entry approve ho gayi", "All entries approved")}</div>`
  }</section>
  ${done.length ? `<section class="card"><div class="card-h"><h3>${L("Aaj ka faisla", "Decided today")}</h3></div><div class="list">${done.map((e) => `<div class="item"><div class="grow"><div class="t1" style="font-weight:500">${esc(entryItemName(e))}</div><div class="t2">${e.machine} · ${esc(e.staff)} · ${eq(e, e.out)} · ${ftime(e.ts)}${e.note ? " · “" + esc(e.note) + "”" : ""}</div></div>${epill(e)}</div>`).join("")}</div></section>` : ""}`;
}
function maalView(u) {
  const tab = S.ui.maalTab,
    inc = incoming(u.unit);
  const tabs = [
    ["in", L("Aane wala", "Incoming"), inc.length],
    ["inward", "Inward"],
    ["count", L("Stock ginti", "Stock count")],
    ["hist", L("Record", "History")],
  ];
  let body = "";
  if (tab === "in") {
    if (u.unit === "M") {
      const out = S.transfers.filter(
        (t) => t.from === "M" && t.status === "transit",
      );
      body = `<div class="card-h"><div><h3>${L("Raste mein", "In transit")}</h3><p>${L("Moulding se bheja gaya maal jo abhi tak doosri unit ne confirm nahi kiya", "Material sent from moulding that the other unit has not confirmed yet")}</p></div></div>${out.length ? `<div class="list">${out.map((t) => `<div class="item">${pthumb()}<div class="grow"><div class="t1">${esc(plainName(t.item))}</div><div class="t2">→ ${UNITS[t.to].n} · ${ftime(t.ts)}</div></div><div class="end"><b class="num">${kg(t.sent)}</b><span class="pill warn">${L("Confirm baaki", "Not confirmed")}</span></div></div>`).join("")}</div>` : `<div class="empty">${L("Sab maal pahunch gaya", "Everything has been received")}</div>`}`;
    } else
      body = `<div class="card-h"><div><h3>${L("Moulding se aane wala maal", "Material coming from Moulding")}</h3><p>${L("Toul ke asli kg daalo. Farak hua toh Admin ko turant dikhega.", "Weigh it and enter the actual kg. Any gap shows up for the Admin straight away.")}</p></div></div>${inc.length ? `<div class="list">${inc.map((t) => `<form class="item" data-f="receive" data-id="${t.id}" style="flex-wrap:wrap">${pthumb()}<div class="grow" style="min-width:180px"><div class="t1">${esc(plainName(t.item))}</div><div class="t2">${L("Bheja", "Sent")} <b>${kg(t.sent)}</b> · ${esc(t.by)} · ${ftime(t.ts)}</div></div><div class="fld" style="width:130px"><label for="rv-${t.id}">${L("Mila (kg)", "Received (kg)")}</label><input id="rv-${t.id}" name="kg" type="number" inputmode="decimal" step="0.1" min="0" placeholder="${t.sent}" required></div><button class="btn pri" type="submit">${ic("check", 16)} ${L("Maal Mila", "Received")}</button></form>`).join("")}</div>` : `<div class="empty">${ic("check")}${L("Abhi kuch nahi aa raha", "Nothing incoming right now")}</div>`}`;
  } else if (tab === "inward") {
    const list = S.inwards
      .filter((i) => i.unit === u.unit)
      .sort((a, b) => b.ts - a.ts);
    body = `<div class="card-h"><div><h3>Raw material inward</h3><p>${L("Rate aap nahi bharte. Admin bill ki photo dekh ke bharega.", "You don't enter the rate. The Admin fills it from the bill photo.")}</p></div><button type="button" class="btn pri sm" data-a="inward">${ic("plus", 15)} Inward</button></div><div class="list">${list.map((i) => `<div class="item"><span class="ico-c info">${ic("inbox", 17)}</span><div class="grow"><div class="t1">${fq(i.qty, RM[i.mat].uom)} ${esc(RM[i.mat].n)}</div><div class="t2">${esc(i.supplier)} · Bill ${esc(i.bill)} · ${fwhen(i.ts)}</div></div></div>`).join("") || `<div class="empty">${L("Abhi koi inward nahi", "No inwards yet")}</div>`}</div>`;
  } else if (tab === "count") {
    body = countsManager(u);
  } else {
    const ts = S.transfers
      .filter((t) => t.from === u.unit || t.to === u.unit)
      .sort((a, b) => b.ts - a.ts);
    body = `<div class="list">${
      ts
        .map((t) => {
          const diff = t.recv != null ? r1(t.recv - t.sent) : 0;
          return `<div class="item">${pthumb()}<div class="grow"><div class="t1">${esc(plainName(t.item))}</div><div class="t2">${UNITS[t.from].n} → ${UNITS[t.to].n} · ${fwhen(t.ts)}</div></div><div class="end"><b class="num">${kg(t.sent)}</b>${t.status === "transit" ? `<span class="pill warn">${L("Raste mein", "In transit")}</span>` : diff ? `<span class="pill bad">${L("Mila", "Got")} ${kg(t.recv)} (${diff} kg)</span>` : `<span class="pill ok">${L("Pura mila", "Fully received")}</span>`}</div></div>`;
        })
        .join("") ||
      `<div class="empty">${L("Koi record nahi", "No records")}</div>`
    }</div>`;
  }
  return `<div class="toolbar"><div class="seg" role="group">${tabs.map(([k, l, n]) => `<button type="button" data-a="ui" data-k="maalTab" data-val="${k}" aria-pressed="${tab === k}">${l}${n ? `<span class="badge">${n}</span>` : ""}</button>`).join("")}</div></div><section class="card">${body}</section>`;
}
function dispatchView(u) {
  const q = dispatchQueue(u.unit).sort((a, b) => a.promise - b.promise),
    done = S.dispatches
      .filter((d) => !u.unit || d.unit === u.unit)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8);
  return `<section class="card"><div class="card-h"><div><h3>${L("Bhejna baaki", "To dispatch")} · ${q.length}</h3><p>${L("Orders jinka maal bhejna baaki hai. Aadha bhi bhej sakte ho.", "Orders still to ship. Partial dispatch is fine.")}</p></div></div>
  ${
    q.length
      ? `<div class="list">${q
          .map((o) => {
            const ls = o.lines
              .map((l, i) => ({ l, i }))
              .filter(
                (x) =>
                  (!u.unit || lineUnit(x.l) === u.unit) && x.l.disp < x.l.qty,
              );
            const canAny = ls.some((x) => lineAvail(x.l) > 0);
            return `<div class="item" style="align-items:flex-start;flex-wrap:wrap"><div class="grow" style="min-width:220px"><div class="toolbar"><div class="t1">#${o.no} · ${esc(PTY[o.party].n)}</div>${opill(orderStatus(o))}</div><div class="t2">${L("Delivery", "Due")} ${fdate(o.promise)} · ${esc(PTY[o.party].city)}</div>
   <div class="list" style="margin-top:8px">${ls
     .map(({ l }) => {
       const rem = l.qty - l.disp,
         av = lineAvail(l);
       return `<div class="toolbar">${itemCell(l.kind, l.ref)}<div class="psub num" style="text-align:right">${L("Baaki", "Left")} <b style="color:var(--ink)">${fq(rem, l.uom)}</b><br>${L("Stock", "Stock")} ${fq(av, l.uom)} ${av < rem ? `<span class="pill warn">${L("Kam", "Short")}</span>` : ""}</div></div>`;
     })
     .join("")}</div></div>
   <button type="button" class="btn pri" data-a="dispatch" data-id="${o.id}" ${canAny ? "" : "disabled"}>${ic("truck", 16)} Dispatch</button></div>`;
          })
          .join("")}</div>`
      : `<div class="empty">${ic("check")}${L("Koi dispatch baaki nahi", "Nothing to dispatch")}</div>`
  }</section>
  ${
    done.length
      ? `<section class="card"><div class="card-h"><h3>${L("Haal hi mein bheja", "Recently dispatched")}</h3></div><div class="list">${done
          .map((d) => {
            const o = S.orders.find((x) => x.id === d.order);
            return `<div class="item"><span class="ico-c ok">${ic("truck", 17)}</span><div class="grow"><div class="t1" style="font-weight:500">#${o.no} · ${esc(PTY[o.party].n)}</div><div class="t2">${d.lines.map(({ i, q }) => fq(q, o.lines[i].uom) + " " + esc(itemName(o.lines[i]))).join(", ")} · ${esc(d.vehicle || "")}</div></div><div class="end"><span class="psub">${fwhen(d.ts)}</span><button type="button" class="btn sm" data-a="packing" data-id="${d.id}">${ic("qr", 14)} Slip</button></div></div>`;
          })
          .join("")}</div></section>`
      : ""
  }`;
}

/* ---------- staff ---------- */
function staffView(u) {
  const m = u.machine,
    U = UNITS[u.unit],
    sh = S.shift[m],
    [st, lab] = machineState(m),
    es = S.entries
      .filter((e) => !e.hist && e.machine === m && e.ts >= today0())
      .sort((a, b) => b.ts - a.ts);
  const ob = S.outbox.filter((e) => e.machine === m);
  const live = es.filter((e) => e.status !== "returned"),
    o = sum(live, (e) => e.out) + sum(ob, (e) => e.out),
    inp = sum(live, (e) => e.input) + sum(ob, (e) => e.input),
    y = inp ? o / inp : 0;
  let btns = "";
  if (!sh || sh.ended)
    btns = `<button type="button" class="bigbtn pri" data-a="shiftStart"><span class="ib">${ic("play", 24)}</span><span>${sh && sh.ended ? L("Nayi shift shuru karo", "Start a new shift") : L("Shift Shuru", "Start shift")}<small>${L("Machine garam hone ke baad dabao", "Tap once the machine has heated up")}</small></span></button>`;
  else
    btns = `<button type="button" class="bigbtn pri" data-a="entry" ${sh.stop ? 'disabled style="opacity:.5"' : ""}><span class="ib">${ic("scale", 24)}</span><span>${L("Entry Daalo", "Add entry")}<small>${L("Toul ke kg daalo · 30 second", "Weigh and enter kg · 30 seconds")}</small></span></button>
   ${sh.stop ? `<button type="button" class="bigbtn go" data-a="machineGo"><span class="ib">${ic("play", 24)}</span><span>${L("Machine Chalu", "Machine running again")}<small>${L("Ruki thi", "Stopped at")} ${ftime(sh.stop)}</small></span></button>` : `<button type="button" class="bigbtn warn" data-a="machineStop"><span class="ib">${ic("pause", 24)}</span><span>${L("Machine Ruki", "Machine stopped")}<small>${L("Reason chuno, Admin ko alert jaayega", "Pick a reason, the Admin is alerted")}</small></span></button>`}
   <button type="button" class="bigbtn" data-a="shiftEnd"><span class="ib">${ic("stop", 24)}</span><span>${L("Shift Khatam", "End shift")}<small>${L("Din ka hisaab check karke bhejo", "Check the summary and send")}</small></span></button>`;
  return `<div class="staff fade"><div class="toolbar"><div><div class="eyebrow">${L("Namaste", "Hello")}</div><h1 style="font-family:var(--display);font-weight:400;font-size:28px;color:var(--navy)">${esc(u.n)}</h1></div><div class="btns" style="align-items:center">${syncBadge()}<button type="button" class="btn sm" data-a="nav" data-v="guide">${ic("help", 15)} ${L("Madad", "Help")}</button></div></div>
  <section class="mach" style="--c:var(${U.c})"><div class="toolbar" style="position:relative;z-index:1"><b class="mn">${m}</b>${uchip(u.unit)}</div><span class="status ${st}" style="position:relative;z-index:1"><i></i>${lab}${sh && sh.start && !sh.ended ? ` · ${L("shift", "shift")} ${ftime(sh.start)} ${L("se", "since")}` : ""}</span>
   <div class="stats"><div><b>${uq(o)}</b><span>${L("aaj achha maal", "good output today")}</span></div><div><b>${inp ? nf(y * 100, 1) + "%" : "–"}</b><span>yield</span></div><div><b>${sh ? sh.down : 0} min</b><span>${L("ruki", "downtime")}</span></div><div><b>${rs(
     sum(
       live.filter((e) => e.status === "approved"),
       estEarn,
     ),
   )}</b><span>${L("aaj ki kamai", "earned today")}${
     sum(
       live.filter((e) => e.status === "pending"),
       estEarn,
     ) +
       sum(ob, estEarn) >
     0
       ? ` · +${rs(
           sum(
             live.filter((e) => e.status === "pending"),
             estEarn,
           ) + sum(ob, estEarn),
         )} ${L("baaki", "pending")}`
       : ""
   }</span></div></div><div style="position:relative;z-index:1">${beads(y, 16, `var(${U.c})`, true)}</div></section>
  <div class="bigbtns">${btns}</div>
  ${!S.online ? `<div class="note warn">${ic("wifioff", 16)}<span>${L("Internet nahi hai. Entry phone mein save ho rahi hai, net aate hi apne aap chali jaayegi.", "No internet. Entries are saved on the phone and will send automatically when the connection is back.")}</span></div>` : ""}
  <section class="card"><div class="card-h"><h3>${L("Aaj ki meri entry", "My entries today")}</h3><span class="pill mute">${es.length + ob.length}</span></div>
  ${
    es.length || ob.length
      ? `<div class="list">${ob.map((e) => `<div class="item">${e.unit === "M" ? pthumb() : thumb(PM[e.product])}<div class="grow"><div class="t1">${eq(e, e.out)} · ${esc(entryItemName(e))}</div><div class="t2">${ftime(e.ts)} · reject ${eq(e, e.reject)}</div></div><div class="end"><span class="pill warn">${ic("wifioff", 12)} ${L("Phone mein", "On phone")}</span><button type="button" class="btn sm" data-a="slip" data-id="${e.id}">${ic("qr", 14)} Slip</button></div></div>`).join("")}${es
          .map((e) => {
            const canEdit =
              e.status === "returned" ||
              (e.status === "pending" && Date.now() - e.ts < 15 * MIN);
            return `<div class="item" style="flex-wrap:wrap">${e.unit === "M" ? pthumb() : thumb(PM[e.product])}<div class="grow" style="min-width:160px"><div class="t1">${eq(e, e.out)} · ${esc(entryItemName(e))}</div><div class="t2">${ftime(e.ts)} · ${e.lotNo || e.lot || ""} · reject ${eq(e, e.reject)} · ${nf(yieldOf(e) * 100, 1)}% · ${rs(estEarn(e))}</div>${e.status === "returned" && e.note ? `<div class="note bad" style="margin-top:6px">${ic("undo", 15)}<span>Admin: “${esc(e.note)}”</span></div>` : ""}</div><div class="end">${epill(e)}<div class="btns" style="justify-content:flex-end"><button type="button" class="btn sm" data-a="slip" data-id="${e.id}">${ic("qr", 14)} Slip</button>${canEdit ? `<button type="button" class="btn sm" data-a="entry" data-id="${e.id}">${ic("edit", 14)} ${L("Sudharo", "Fix")}</button>` : ""}</div></div></div>`;
          })
          .join("")}</div>`
      : `<div class="empty">${ic("scale")}${L('Abhi tak koi entry nahi. "Entry Daalo" dabao.', 'No entries yet. Tap "Add entry".')}</div>`
  }
  <p class="psub">${L("Pending entry 15 minute tak sudhar sakte ho. Uske baad Admin se bolo.", "You can fix a pending entry for 15 minutes. After that, ask the Admin.")}</p></section></div>`;
}

/* ---------- modals ---------- */
function openModal(title, sub, body, foot, opts = {}) {
  const r = document.getElementById("modal-root");
  r.innerHTML = `<div class="ov"><div class="sheet ${opts.wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="mt">${opts.form ? `<form data-f="${opts.form}" ${opts.live ? `data-live="${opts.live}"` : ""} ${opts.id ? `data-id="${opts.id}"` : ""} style="display:contents" novalidate>` : ""}
  <div class="sh-h"><div><h2 id="mt">${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div><button type="button" class="xbtn" data-a="close" aria-label="${L("Band karo", "Close")}">${ic("x")}</button></div>
  <div class="sh-b">${body}</div>${foot ? `<div class="sh-f">${foot}</div>` : ""}${opts.form ? "</form>" : ""}</div></div>`;
  const f = r.querySelector(
    "input:not([type=radio]):not([type=hidden]),select,textarea",
  );
  if (f && !opts.nofocus && matchMedia("(min-width:601px)").matches) f.focus();
  else r.querySelector(".xbtn").focus();
  if (opts.live) LIVE[opts.live](r.querySelector("form"));
}
function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
  draft = null;
}
const cancelBtn = () =>
  `<button type="button" class="btn ghost" data-a="close">${L("Rehne do", "Cancel")}</button>`;

function entryModal(id) {
  const u = user(),
    m = u.machine,
    e = id ? S.entries.find((x) => x.id === id) : null;
  const sel = e
    ? e.product
    : S.ui.lastProd[m] ||
      (u.unit === "M" ? PLAINS[0] : PRODUCTS.find((p) => p.unit === u.unit).id);
  const picker =
    u.unit === "M"
      ? `<div class="pick plain" role="radiogroup">${PLAINS.map((k) => `<label><input type="radio" name="product" value="${k}" ${k === sel ? "checked" : ""}><b>${k.split("|").slice(0, 2).join(" ")}</b><span class="psub">${k.split("|")[2]} (${k.split("|")[3]})</span></label>`).join("")}</div>`
      : `<div class="pick" role="radiogroup">${PRODUCTS.filter(
          (p) => p.unit === u.unit,
        )
          .map(
            (p) =>
              `<label><input type="radio" name="product" value="${p.id}" ${p.id === sel ? "checked" : ""}><img src="${IMG[p.img]}" alt=""><span>${p.size} ${p.shape}<br><b>${p.color}</b> · ${p.grade}</span></label>`,
          )
          .join("")}</div>`;
  const inL =
    u.unit === "M"
      ? L("GPPS kitna lagaya (kg)", "GPPS used (kg)")
      : L("Plain beads kitna lagaya (kg)", "Plain beads used (kg)");
  const outL =
    u.unit === "M"
      ? L("Achha maal (kg)", "Good beads (kg)")
      : L("Taiyaar maal (kg)", "Finished beads (kg)");
  const rejL =
    u.unit === "M"
      ? L("Waste (kg)", "Waste (kg)")
      : L("Reject (kg)", "Reject (kg)");
  openModal(
    e ? L("Entry sudharo", "Fix entry") : L("Entry Daalo", "Add entry"),
    `${m} · ${UNITS[u.unit].n} · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
    `<div class="fld"><span class="lb">${L("Kaunsa maal bana?", "What did you make?")}</span>${picker}</div>
   <div class="row3"><div class="fld"><label for="f-in">${inL}</label><input id="f-in" name="input" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" value="${e ? e.input : ""}" required></div>
   <div class="fld"><label for="f-out">${outL}</label><input id="f-out" name="out" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" value="${e ? e.out : ""}" required></div>
   <div class="fld"><label for="f-rej">${rejL}</label><input id="f-rej" name="reject" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" value="${e ? e.reject : ""}"></div></div>
   <div class="yield" id="yl"></div><p class="err" id="ferr" role="alert"></p>
   <div class="fld"><label for="f-ph">${ic("camera", 14)} ${L("Taraazu ki photo (optional)", "Photo of the scale (optional)")}</label><input id="f-ph" name="photo" type="file" accept="image/*" capture="environment"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Save karo", "Save")}</button>`,
    { form: "entry", live: "entry", id: id || "" },
  );
}
function shiftEndModal() {
  const u = user(),
    m = u.machine,
    es = S.entries
      .filter(
        (e) =>
          !e.hist &&
          e.machine === m &&
          e.ts >= today0() &&
          e.status !== "returned",
      )
      .concat(S.outbox.filter((e) => e.machine === m)),
    o = sum(es, (e) => e.out),
    inp = sum(es, (e) => e.input),
    rj = sum(es, (e) => e.reject),
    sh = S.shift[m];
  openModal(
    L("Shift Khatam", "End shift"),
    `${m} · ${u.n}`,
    `<div class="sumbox"><div><span>${L("Entry", "Entries")}</span><b>${es.length}</b></div><div><span>${L("Lagaya", "Input")}</span><b>${uq(inp)}</b></div><div><span>${L("Achha maal", "Good output")}</span><b>${uq(o)}</b></div><div><span>Reject / waste</span><b>${uq(rj)}</b></div><div><span>${L("Machine ruki", "Downtime")}</span><b>${sh.down} min</b></div><div class="tot"><span>Yield</span><b>${inp ? nf((o / inp) * 100, 1) + "%" : "–"}</b></div></div>
  <p class="muted" style="font-size:13px">${L("Check karke bhejo. Admin approve karega.", "Check and send. The Admin will approve.")}</p>`,
    `${cancelBtn()}<button type="button" class="btn pri" data-a="shiftEndGo">${ic("send", 16)} ${L("Bhejo", "Send")}</button>`,
  );
}
function stopModal() {
  openModal(
    L("Machine kyun ruki?", "Why did the machine stop?"),
    user().machine,
    `<div class="radios" role="radiogroup">${STOP_REASONS.map(([k, h, e], i) => `<label><input type="radio" name="reason" value="${k}" ${i === 0 ? "checked" : ""}>${L(h, e)}</label>`).join("")}</div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("pause", 16)} ${L("Ruki hai", "Mark stopped")}</button>`,
    { form: "stop" },
  );
}
function returnModal(id) {
  const e = S.entries.find((x) => x.id === id);
  openModal(
    L("Wapas bhejo", "Send back"),
    `${e.machine} · ${esc(e.staff)} · ${eq(e, e.out)}`,
    `<div class="fld"><label for="rn">${L("Staff ko kya sudharna hai?", "What should the staff fix?")}</label><textarea id="rn" name="note" required placeholder="${L("Jaise: reject dobara toul ke daalo", "e.g. weigh the reject again")}"></textarea></div>`,
    `${cancelBtn()}<button class="btn danger" type="submit">${ic("undo", 16)} ${L("Wapas bhejo", "Send back")}</button>`,
    { form: "return", id },
  );
}
function transferModal() {
  const opts = PLAINS.filter((k) => qty("PLAIN:M", k, "kg") > 0)
    .map(
      (k) =>
        `<option value="${k}">${esc(plainName(k))} · ${kg(qty("PLAIN:M", k, "kg"))}</option>`,
    )
    .join("");
  openModal(
    L("Maal bhejo", "Send material"),
    L(
      "Moulding se Pearl ya Metalizing",
      "From Moulding to Pearl or Metalizing",
    ),
    `<div class="fld"><span class="lb">${L("Kahan bhejna hai?", "Send to")}</span><div class="radios"><label><input type="radio" name="to" value="P" checked>Pearl</label><label><input type="radio" name="to" value="Z">Metalizing</label></div></div>
  <div class="fld"><label for="tb">Plain bead</label><select id="tb" name="item">${opts}</select></div><div class="fld"><label for="tk">${L("Kitna (kg)", "How much (kg)")}</label><input id="tk" name="kg" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" required><span class="hint" id="th"></span></div>
  <div class="note">${ic("scale", 16)}<span>${L("Lene wali unit bhi toul ke confirm karegi. Farak hua toh Admin ko dikhega.", "The receiving unit will weigh and confirm too. Any gap is shown to the Admin.")}</span></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("send", 16)} ${L("Bhejo", "Send")}</button>`,
    { form: "transfer", live: "transfer" },
  );
}
function inwardModal() {
  const u = user(),
    unit = u.role === "manager" ? u.unit : "M";
  openModal(
    "Raw material inward",
    UNITS[unit].n + " · " + L("rate Admin bharega", "Admin adds the rate"),
    `<div class="row2"><div class="fld"><label for="is">Supplier</label><select id="is" name="supplier">${SUPPLIERS.map((s) => `<option>${s}</option>`).join("")}</select></div><div class="fld"><label for="ib">Bill no.</label><input id="ib" name="bill" required placeholder="SP/2301"></div></div>
  <div class="row2"><div class="fld"><label for="im">Material</label><select id="im" name="mat">${RAW.filter(
    (r) => r.unit === unit,
  )
    .map((r) => `<option value="${r.id}">${r.n} (${r.uom})</option>`)
    .join(
      "",
    )}</select></div><div class="fld"><label for="iq">${L("Kitna aaya", "Quantity")}</label><input id="iq" name="qty" type="number" inputmode="decimal" step="0.1" min="0" required></div></div>
  <div class="fld"><label for="ip">${ic("camera", 14)} ${L("Bill ki photo", "Photo of the bill")}</label><input id="ip" name="photo" type="file" accept="image/*" capture="environment"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "inward" },
  );
}
function karSendModal() {
  const u = user(),
    ps = PRODUCTS.filter(
      (p) => p.unit === u.unit && qty("COAT:" + u.unit, p.id, "kg") > 0,
    );
  openModal(
    L("Karigar ko bhejo", "Send to karigar"),
    L("Coated maal threading ke liye", "Coated beads for threading"),
    `<div class="fld"><span class="lb">Karigar</span><div class="radios">${KARIGARS.map((k, i) => `<label><input type="radio" name="kar" value="${k.id}" ${i ? "" : "checked"}>${k.n}</label>`).join("")}</div></div>
  <div class="fld"><label for="kp">Product</label><select id="kp" name="product">${ps.map((p) => `<option value="${p.id}">${esc(pname(p))} · ${p.grade} · ${kg(qty("COAT:" + u.unit, p.id, "kg"))}</option>`).join("")}</select></div>
  <div class="fld"><label for="kk">${L("Kitna (kg)", "How much (kg)")}</label><input id="kk" name="kg" class="big-in" type="number" inputmode="decimal" step="0.1" min="0" required><span class="hint" id="kh"></span></div>
  <div class="note" id="kslip"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("send", 16)} ${L("Bhejo + slip banao", "Send + make slip")}</button>`,
    { form: "karSend", live: "karSend" },
  );
}
function karRecvModal(id) {
  const j = S.jobs.find((x) => x.id === id),
    b = jobBal(j),
    p = PM[j.product];
  openModal(
    L("Karigar se wapas lo", "Receive from karigar"),
    `${KM[j.kar].n} · ${pname(p)} ${p.grade}`,
    `<div class="sumbox"><div><span>${L("Bheja tha", "Sent")}</span><b>${kg(j.sent)} · ${fdate(j.ts)}</b></div><div><span>${L("Abhi baaki", "Balance now")}</span><b>${kg(b.bal)}</b></div><div><span>kg / bunch</span><b>${S.kpb[p.id]} kg <span class="psub">(sample)</span></b></div></div>
  <div class="row3"><div class="fld"><label for="rb">Bunch</label><input id="rb" name="bunch" class="big-in" type="number" inputmode="numeric" step="1" min="0" required></div><div class="fld"><label for="rl">Loose (kg)</label><input id="rl" name="loose" class="big-in" type="number" inputmode="decimal" step="0.1" min="0"></div><div class="fld"><label for="rw">Wastage (kg)</label><input id="rw" name="waste" class="big-in" type="number" inputmode="decimal" step="0.1" min="0"></div></div>
  <div class="sumbox" id="rsum"></div><p class="err" id="rerr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} ${L("Wapas mila", "Received")}</button>`,
    { form: "karRecv", live: "karRecv", id },
  );
}
function dispatchModal(oid) {
  const u = user(),
    o = S.orders.find((x) => x.id === oid),
    ls = o.lines
      .map((l, i) => ({ l, i }))
      .filter(
        (x) => (!u.unit || lineUnit(x.l) === u.unit) && x.l.disp < x.l.qty,
      );
  openModal(
    "Dispatch",
    `#${o.no} · ${esc(PTY[o.party].n)}`,
    `${ls
      .map(({ l, i }) => {
        const rem = l.qty - l.disp,
          mx = Math.min(rem, lineAvail(l));
        return `<div class="fld"><label for="dq${i}">${esc(itemName(l))}</label><input id="dq${i}" name="q${i}" class="big-in" type="number" inputmode="decimal" step="${l.uom === "bunch" ? 1 : 0.1}" min="0" max="${mx}" value="${Math.max(0, Math.floor(mx * 10) / 10)}"><span class="hint">${L("Baaki", "Left")} ${fq(rem, l.uom)} · ${L("stock", "stock")} ${fq(lineAvail(l), l.uom)}. ${L("Kam bhejoge toh baaki baad mein jaayega.", "Send less and the rest goes later.")}</span></div>`;
      })
      .join("")}
  <div class="row2"><div class="fld"><label for="dv">${L("Gaadi number", "Vehicle no.")}</label><input id="dv" name="vehicle" placeholder="MH04 AB 1234" required></div><div class="fld"><label for="dp">${ic("camera", 14)} ${L("Maal ki photo", "Photo of the load")}</label><input id="dp" name="photo" type="file" accept="image/*"></div></div><p class="err" id="derr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("truck", 16)} ${L("Dispatch ho gaya", "Mark dispatched")}</button>`,
    { form: "dispatch", id: oid },
  );
}
function dayCloseModal() {
  const u = user(),
    un = u.unit,
    t0 = today0();
  const prod = S.entries.filter(
      (e) => !e.hist && e.unit === un && e.ts >= t0 && e.status === "approved",
    ),
    pend = pendingEntries(un).length;
  const inw = S.inwards.filter((i) => i.unit === un && i.ts >= t0),
    tin = S.transfers.filter(
      (t) => t.to === un && t.status === "received" && t.rts >= t0,
    ),
    tout = S.transfers.filter((t) => t.from === un && t.ts >= t0);
  const ks = S.jobs.filter((j) => j.unit === un && j.ts >= t0),
    kr = S.jobs
      .filter((j) => j.unit === un)
      .flatMap((j) => j.receipts.filter((r) => r.ts >= t0)),
    ds = S.dispatches.filter((d) => d.unit === un && d.ts >= t0);
  const row = (a, b) => `<div><span>${a}</span><b>${b}</b></div>`;
  openModal(
    L("Aaj ka hisaab", "Today's summary"),
    `${UNITS[un].n} · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`,
    `<div class="sumbox">${row(L("Production (approved)", "Production (approved)"), kg(sum(prod, (e) => e.out)) + " · " + prod.length + " entry")}${row("Inward", inw.length ? inw.map((i) => fq(i.qty, RM[i.mat].uom) + " " + RM[i.mat].n).join(", ") : "–")}${row(L("Maal aaya (unit se)", "Received from units"), kg(sum(tin, (t) => t.recv)))}${row(L("Maal gaya (unit ko)", "Sent to units"), kg(sum(tout, (t) => t.sent)))}${un !== "M" ? row(L("Karigar ko gaya / aaya", "Karigar out / in"), kg(sum(ks, (j) => j.sent)) + " / " + nf(sum(kr, (r) => r.bunch)) + " bunch") : ""}${row("Dispatch", ds.length + " " + L("gaadi", "loads"))}</div>
  ${pend ? `<div class="note warn">${ic("alert", 16)}<span>${pend} ${L("entry abhi approve nahi hui. Pehle approve karo ya wapas bhejo.", "entries still need approval. Approve or send them back first.")}</span></div>` : `<div class="note ok">${ic("check", 16)}<span>${L("Sab entry approve ho chuki hai.", "All entries are approved.")}</span></div>`}`,
    `${cancelBtn()}<button type="button" class="btn pri" data-a="dayCloseGo" ${pend ? "disabled" : ""}>${ic("send", 16)} ${L("Din band karo, Admin ko bhejo", "Close the day and send to Admin")}</button>`,
  );
}
function newOrderModal() {
  draft = {
    party: "c1",
    lines: [{ item: "fin|p13|bunch", qty: "", rate: S.prices.p13.bunch }],
    over: false,
  };
  renderOrderModal();
}
function itemOptions(sel) {
  const o = (v, t) =>
    `<option value="${v}" ${v === sel ? "selected" : ""}>${t}</option>`;
  return `<optgroup label="Pearl · bunch">${PRODUCTS.filter(
    (p) => p.unit === "P",
  )
    .map((p) => o(`fin|${p.id}|bunch`, `${pname(p)} · ${psub(p)}`))
    .join("")}</optgroup>
  <optgroup label="Metalizing · bunch">${PRODUCTS.filter((p) => p.unit === "Z")
    .map((p) => o(`fin|${p.id}|bunch`, `${pname(p)} · ${psub(p)}`))
    .join("")}</optgroup>
  <optgroup label="Metalizing · kg">${PRODUCTS.filter((p) => p.unit === "Z")
    .map((p) => o(`fin|${p.id}|kg`, `${pname(p)} · ${psub(p)} (kg)`))
    .join("")}</optgroup>
  <optgroup label="${L("Plain loose · kg", "Loose plain · kg")}">${PLAINS.map((k) => o(`plain|${k}|kg`, plainName(k) + " (kg)")).join("")}</optgroup>`;
}
function defRate(item) {
  const [kind, ref, uom] = item.split("|");
  return kind === "plain" ? S.plainRate[ref] : S.prices[ref][uom];
}
function renderOrderModal() {
  openModal(
    L("Naya order", "New order"),
    L(
      "Party, maal aur rate. Stock aur credit limit apne aap check hote hain.",
      "Party, items and rate. Stock and credit limit are checked automatically.",
    ),
    `<div class="fld"><label for="op">Party</label><select id="op" name="party">${PARTIES.map((p) => `<option value="${p.id}" ${p.id === draft.party ? "selected" : ""}>${p.n} · ${p.city}</option>`).join("")}</select></div>
  <div class="list">${draft.lines.map((l, i) => `<div class="line"><div class="fld"><label for="oi${i}">Product</label><select id="oi${i}" name="item_${i}" data-line="${i}">${itemOptions(l.item)}</select></div><div class="fld"><label for="oq${i}">Qty</label><input id="oq${i}" name="qty_${i}" type="number" inputmode="decimal" min="0" step="0.1" value="${l.qty}" required></div><div class="fld"><label for="or${i}">${L("Rate ₹", "Rate ₹")}</label><input id="or${i}" name="rate_${i}" type="number" inputmode="decimal" min="0" step="0.5" value="${l.rate}"></div><button type="button" class="xbtn" data-a="delLine" data-i="${i}" aria-label="${L("Line hatao", "Remove line")}" ${draft.lines.length < 2 ? "disabled" : ""}>${ic("trash", 16)}</button><div class="avl" id="av${i}"></div></div>`).join("")}</div>
  <button type="button" class="btn sm" data-a="addLine" style="justify-self:start">${ic("plus", 15)} ${L("Aur product", "Add product")}</button>
  <div class="fld"><label for="od">${L("Delivery kab tak", "Delivery by")}</label><input id="od" name="promise" type="date" value="${new Date(Date.now() + 7 * DAY).toISOString().slice(0, 10)}"></div>
  <div id="osum"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit" id="osave">${ic("check", 16)} ${L("Order save karo", "Save order")}</button>`,
    { form: "order", live: "order", wide: true, nofocus: true },
  );
}
function syncDraft(f) {
  if (!f || !draft) return;
  draft.party = f.party.value;
  draft.lines.forEach((l, i) => {
    l.item = f["item_" + i].value;
    l.qty = f["qty_" + i].value;
    l.rate = f["rate_" + i].value;
  });
  const c = f.querySelector("[name=over]");
  draft.over = c ? c.checked : false;
}
function orderDetailModal(id) {
  const o = S.orders.find((x) => x.id === id),
    st = orderStatus(o),
    ds = S.dispatches.filter((d) => d.order === o.id),
    invs = S.invoices.filter((i) => i.order === o.id);
  openModal(
    `Order #${o.no}`,
    `${esc(PTY[o.party].n)} · ${fdate(o.ts)} · ${L("delivery", "due")} ${fdate(o.promise)}`,
    `<div>${opill(st)}${o.cancelled ? ` <span class="psub">${esc(o.reason)}</span>` : ""}</div>
  <div class="tw"><table><thead><tr><th>Product</th><th class="r">Order</th><th class="r">${L("Gaya", "Sent")}</th><th class="r">Stock</th><th class="r">Rate</th><th class="r">${L("Rakam", "Amount")}</th></tr></thead><tbody>${o.lines.map((l) => `<tr><td>${itemCell(l.kind, l.ref)}</td><td class="r">${fq(l.qty, l.uom)}</td><td class="r">${fq(l.disp, l.uom)}</td><td class="r">${fq(lineAvail(l), l.uom)}</td><td class="r">${rs(l.rate)}</td><td class="r"><b>${rs(l.qty * l.rate)}</b></td></tr>`).join("")}</tbody></table></div>
  <div class="sumbox"><div class="tot"><span>${L("Order ki rakam (bina GST)", "Order value (before GST)")}</span><b>${rs(orderValue(o))}</b></div></div>
  ${ds.length ? `<div class="fld"><span class="lb">Dispatch</span><div class="list">${ds.map((d) => `<div class="item"><span class="ico-c ok">${ic("truck", 16)}</span><div class="grow"><div class="t1" style="font-weight:500">${d.lines.map(({ i, q }) => fq(q, o.lines[i].uom)).join(" + ")} · ${UNITS[d.unit].n}</div><div class="t2">${fwhen(d.ts)} · ${esc(d.vehicle || "")} · ${esc(d.by)}</div></div>${d.invoice ? `<button type="button" class="btn sm" data-a="invoice" data-id="${d.invoice}">${S.invoices.find((i) => i.id === d.invoice).no}</button>` : `<button type="button" class="btn sm pri" data-a="bill" data-id="${d.id}">${L("Bill banao", "Make bill")}</button>`}</div>`).join("")}</div></div>` : ""}
  ${st === "waiting" ? `<div class="note warn">${ic("clock", 16)}<span>${L("Stock kam hai. Jaise hi maal taiyaar hoga, order Ready ho jaayega aur unit ki dispatch list mein dikhega.", "Not enough stock. As soon as the goods are ready the order turns Ready and appears in the unit's dispatch list.")}</span></div>` : ""}
  ${!o.cancelled && !ds.length ? `<div class="fld" id="cxl" hidden><label for="cr">${L("Cancel kyun?", "Why cancel?")}</label><input id="cr" placeholder="${L("Jaise: party ne mana kiya", "e.g. party withdrew")}"><button type="button" class="btn danger sm" data-a="cancelOrderGo" data-id="${o.id}" style="justify-self:start">${L("Haan, cancel karo", "Yes, cancel")}</button></div>` : ""}`,
    `${!o.cancelled && !ds.length ? `<button type="button" class="btn danger" data-a="cancelOrder">${L("Order cancel", "Cancel order")}</button>` : ""}<span class="grow"></span><button type="button" class="btn" data-a="close">${L("Theek hai", "Done")}</button>`,
    { wide: true },
  );
}
function billModal(did) {
  const d = S.dispatches.find((x) => x.id === did),
    o = S.orders.find((x) => x.id === d.order),
    p = PTY[o.party];
  openModal(
    L("Bill banao", "Make bill"),
    `#${o.no} · ${esc(p.n)} · ${esc(p.state)}`,
    `<div class="fld"><span class="lb">${L("Kaunsa bill?", "Bill type")}</span><div class="radios"><label><input type="radio" name="type" value="GST" checked>GST tax invoice</label><label><input type="radio" name="type" value="KACHCHA">${L("Kachcha bill", "Estimate (kachcha)")}</label></div></div>
  <div class="tw"><table><thead><tr><th>Product</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">${L("Rakam", "Amount")}</th></tr></thead><tbody>${d.lines
    .map(({ i, q }) => {
      const l = o.lines[i];
      return `<tr><td>${esc(itemName(l))}</td><td class="r">${fq(q, l.uom)}</td><td class="r">${rs(l.rate)}</td><td class="r">${rs(q * l.rate)}</td></tr>`;
    })
    .join("")}</tbody></table></div><div class="sumbox" id="bsum"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("receipt", 16)} ${L("Bill banao", "Make bill")}</button>`,
    { form: "bill", live: "bill", id: did },
  );
}
function invoiceModal(id) {
  const inv = S.invoices.find((x) => x.id === id),
    p = PTY[inv.party],
    gst = inv.type === "GST",
    ps = invPaid(inv);
  openModal(
    inv.no,
    `${gst ? "GST tax invoice" : L("Kachcha bill", "Estimate")} · ${fdate(inv.ts)}`,
    `<div class="paper"><div class="ph"><div><h3>MK Plastics</h3><div class="m">Beads Bazaar · Bhiwandi, Mumbai 421302, Maharashtra</div>${gst ? `<div class="m">GSTIN 27XXXXXXXXXX1Z0 (sample)</div>` : ""}</div><div style="text-align:right"><div class="stamp">${gst ? "Tax Invoice" : "Estimate"}</div><b>${inv.no}</b><div class="m">${new Date(inv.ts).toLocaleDateString("en-IN")}</div></div></div>
  <div><div class="m">${L("Bill to", "Bill to")}</div><b>${esc(p.n)}</b><div class="m">${esc(p.city)}, ${esc(p.state)}${gst ? " · GSTIN " + p.gst : ""}</div></div>
  <div class="tw" style="margin-inline:0;padding-inline:0"><table><thead><tr><th>#</th><th>${L("Vivran", "Description")}</th>${gst ? "<th>HSN</th>" : ""}<th class="r">Qty</th><th class="r">Rate</th><th class="r">${L("Rakam", "Amount")}</th></tr></thead><tbody>${inv.lines.map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.desc)}</td>${gst ? "<td>3926</td>" : ""}<td class="r">${fq(l.qty, l.uom)}</td><td class="r">${rs(l.rate)}</td><td class="r">${nf(l.amt, 2)}</td></tr>`).join("")}</tbody></table></div>
  <div class="tots"><div><span>Taxable</span><span class="num">${nf(inv.taxable, 2)}</span></div>${inv.cgst ? `<div><span>CGST 9%</span><span class="num">${nf(inv.cgst, 2)}</span></div><div><span>SGST 9%</span><span class="num">${nf(inv.sgst, 2)}</span></div>` : ""}${inv.igst ? `<div><span>IGST 18%</span><span class="num">${nf(inv.igst, 2)}</span></div>` : ""}<div><span>Round off</span><span class="num">${nf(inv.round, 2)}</span></div><div class="g"><span>Total</span><span class="num">${rs(inv.total)}</span></div></div>
  <div class="m">${words(inv.total)}</div><div class="m">${L("Sample bill · HSN aur GST rate CA se confirm karna hai", "Sample bill · confirm HSN and GST rate with the CA")}</div></div>
  <div>${ps === "paid" ? `<span class="pill ok">Paid</span>` : ps === "part" ? `<span class="pill warn">${L("Aadha paid", "Part paid")}</span>` : `<span class="pill bad">${L("Payment baaki", "Unpaid")}</span>`}</div>`,
    `<span class="grow">${L("Prototype mein PDF aur WhatsApp nahi jaata", "The prototype does not send PDFs or WhatsApp")}</span><button type="button" class="btn" data-a="waShare">${ic("send", 16)} WhatsApp</button><button type="button" class="btn pri" data-a="close">${L("Theek hai", "Done")}</button>`,
    { wide: true },
  );
}
function paymentModal(pid) {
  openModal(
    "Payment",
    L(
      "Paisa purane bill se pehle judta hai (FIFO)",
      "Money settles the oldest bill first (FIFO)",
    ),
    `<div class="fld"><label for="pp">Party</label><select id="pp" name="party">${PARTIES.map((p) => `<option value="${p.id}" ${p.id === pid ? "selected" : ""}>${p.n} · ${L("baaki", "due")} ${rs(partyInfo(p.id).out)}</option>`).join("")}</select></div>
  <div class="fld"><label for="pa">${L("Rakam ₹", "Amount ₹")}</label><input id="pa" name="amount" class="big-in" type="number" inputmode="decimal" min="1" step="1" required></div>
  <div class="fld"><span class="lb">Mode</span><div class="radios">${["Cash", "UPI", "Bank", "Cheque"].map((m, i) => `<label><input type="radio" name="mode" value="${m}" ${i === 1 ? "checked" : ""}>${m}</label>`).join("")}</div></div>
  <div class="fld"><label for="pr">Ref (UTR / cheque no.)</label><input id="pr" name="ref" placeholder="UTR 1234 5678"></div><div class="sumbox" id="psum"></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Payment save</button>`,
    { form: "payment", live: "payment" },
  );
}
function ledgerModal(pid) {
  const p = PTY[pid],
    pi = partyInfo(pid);
  const rows = [
    ...(p.open
      ? [
          {
            ts: Date.now() - 45 * DAY,
            d: L("Purana baaki (opening)", "Opening balance"),
            dr: p.open,
            cr: 0,
          },
        ]
      : []),
    ...S.invoices
      .filter((i) => i.party === pid)
      .map((i) => ({
        ts: i.ts,
        d: "Bill " + i.no,
        dr: i.total,
        cr: 0,
        inv: i.id,
      })),
    ...S.payments
      .filter((x) => x.party === pid)
      .map((x) => ({
        ts: x.ts,
        d: x.mode + " · " + x.ref,
        dr: 0,
        cr: x.amount,
      })),
  ].sort((a, b) => a.ts - b.ts);
  let bal = 0;
  openModal(
    esc(p.n),
    `${esc(p.city)}, ${esc(p.state)} · limit ${rs(p.limit)}`,
    `<div class="tw"><table><thead><tr><th>${L("Tarikh", "Date")}</th><th>${L("Vivran", "Details")}</th><th class="r">${L("Bill", "Debit")}</th><th class="r">${L("Jama", "Credit")}</th><th class="r">${L("Baaki", "Balance")}</th></tr></thead><tbody>${rows
      .map((r) => {
        bal += r.dr - r.cr;
        return `<tr ${r.inv ? `class="click" data-a="invoice" data-id="${r.inv}"` : ""}><td>${fdate(r.ts)}</td><td>${esc(r.d)}</td><td class="r">${r.dr ? rs(r.dr) : ""}</td><td class="r">${r.cr ? rs(r.cr) : ""}</td><td class="r"><b>${rs(bal)}</b></td></tr>`;
      })
      .join("")}</tbody></table></div>
  <div class="sumbox"><div class="tot"><span>${L("Kul baaki", "Total due")}</span><b>${rs(pi.out)}</b></div></div>`,
    `<button type="button" class="btn" data-a="close">${L("Theek hai", "Done")}</button><button type="button" class="btn pri" data-a="payment" data-id="${pid}">+ Payment</button>`,
    { wide: true },
  );
}
function productModal(id) {
  const p = PM[id],
    u = user(),
    admin = u.role === "admin",
    pk = plainKey(p);
  const atKar = sum(
    S.jobs.filter((j) => j.product === id),
    (j) => jobBal(j).bal,
  );
  openModal(
    esc(pname(p)),
    esc(psub(p)) + " · " + UNITS[p.unit].n,
    `<div class="row2" style="align-items:start"><img src="${IMG[p.img]}" alt="${esc(pname(p))}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:24%">
  <div style="display:grid;gap:12px"><dl class="spec" style="font-size:14px"><dt>Shape</dt><dd>${p.shape}</dd><dt>Color</dt><dd>${p.color}</dd><dt>Size</dt><dd>${p.size}</dd><dt>Material</dt><dd>${p.mat}</dd><dt>Grade</dt><dd>${p.grade} · ${p.grade === "SR" ? "Shalimar" : "Treemurti"}</dd></dl>
  <div class="sumbox"><div><span>${L("Plain (Moulding)", "Plain (Moulding)")}</span><b>${kg(qty("PLAIN:M", pk, "kg"))}</b></div><div><span>${L("Plain (", "Plain (")}${UNITS[p.unit].n})</span><b>${kg(qty("PLAIN:" + p.unit, pk, "kg"))}</b></div><div><span>Coated</span><b>${kg(qty("COAT:" + p.unit, id, "kg"))}</b></div><div><span>${L("Karigar ke paas", "With karigars")}</span><b>${kg(atKar)}</b></div><div class="tot"><span>${L("Taiyaar", "Finished")}</span><b>${nf(qty("FIN:" + p.unit, id, "bunch"))} bunch</b></div></div></div></div>
  ${admin ? `<div class="row3"><div class="fld"><label for="pb">₹ / bunch</label><input id="pb" name="bunch" type="number" inputmode="decimal" step="0.5" min="0" value="${S.prices[id].bunch}"></div>${p.unit === "Z" ? `<div class="fld"><label for="pk">₹ / kg</label><input id="pk" name="kg" type="number" inputmode="decimal" step="0.5" min="0" value="${S.prices[id].kg}"></div>` : ""}<div class="fld"><label for="pkb">kg / bunch</label><input id="pkb" name="kpb" type="number" inputmode="decimal" step="0.01" min="0.01" value="${S.kpb[id]}"><span class="hint">${L("Sample. Owner se confirm karo.", "Sample value. Confirm with the owner.")}</span></div></div><p class="muted" style="font-size:12.5px">${L("Naya rate sirf naye order par lagega. Purane bill purane rate par rahenge.", "New rates apply to new orders only. Old bills keep their old rate.")}</p>` : ""}`,
    admin
      ? `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`
      : `<button type="button" class="btn" data-a="close">${L("Theek hai", "Done")}</button>`,
    { form: admin ? "product" : null, id, wide: true, nofocus: true },
  );
}
function expenseModal() {
  openModal(
    L("Naya kharcha", "New expense"),
    "",
    `<div class="row2"><div class="fld"><label for="ec">${L("Kis cheez ka", "Category")}</label><select id="ec" name="cat">${EXP_CATS.map((c) => `<option>${c}</option>`).join("")}</select></div><div class="fld"><label for="eu">Unit</label><select id="eu" name="unit"><option value="M">Moulding</option><option value="P">Pearl</option><option value="Z">Metalizing</option><option value="ALL">${L("Sab units", "All units")}</option></select></div></div>
  <div class="row2"><div class="fld"><label for="ea">${L("Rakam ₹", "Amount ₹")}</label><input id="ea" name="amount" type="number" inputmode="decimal" min="1" required></div><div class="fld"><label for="en">Note</label><input id="en" name="note"></div></div>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("check", 16)} Save</button>`,
    { form: "expense" },
  );
}
function moreModal() {
  const items = navItems(user()).slice(4);
  openModal(
    L("Aur", "More"),
    "",
    `<div class="list">${items.map((i) => `<button type="button" class="item" data-a="nav" data-v="${i.id}">${ic(i.i)}<span class="grow t1">${i.l}</span>${i.b ? `<span class="badge">${i.b}</span>` : ""}${ic("chev", 16)}</button>`).join("")}</div>`,
    "",
  );
}

/* ---------- live form updates ---------- */
const LIVE = {
  entry(f) {
    const i = +f.input.value || 0,
      o = +f.out.value || 0,
      r = +f.reject.value || 0,
      y = i ? o / i : 0,
      u = user();
    document.getElementById("yl").innerHTML =
      i && o
        ? `${beads(y, 12, `var(${UNITS[u.unit].c})`, true)}<b>${nf(y * 100, 1)}%</b><span class="muted">yield${i - o - r > 0.05 ? ` · ${kg(i - o - r)} ${L("ka hisaab nahi", "unaccounted")}` : ""}</span>`
        : `<span class="muted">${L("Teeno number daalo, yield yahan dikhega", "Enter the numbers to see the yield")}</span>`;
    document.getElementById("ferr").textContent =
      i && o + r > i + 0.05
        ? L(
            `Achha + reject (${kg(o + r)}) lagaye hue maal (${kg(i)}) se zyada nahi ho sakta.`,
            `Good + reject (${kg(o + r)}) can't be more than the input (${kg(i)}).`,
          )
        : "";
  },
  transfer(f) {
    const k = f.item.value,
      v = +f.kg.value || 0,
      av = qty("PLAIN:M", k, "kg");
    document.getElementById("th").textContent =
      `${L("Moulding mein", "In Moulding")}: ${kg(av)}${v > av ? " · " + L("itna stock nahi hai", "not enough stock") : ""}`;
  },
  karSend(f) {
    const u = user(),
      p = PM[f.product.value];
    if (!p) return;
    const av = qty("COAT:" + u.unit, p.id, "kg"),
      v = +f.kg.value || 0,
      k = KM[f.kar.value];
    document.getElementById("kh").textContent =
      `Coated stock: ${kg(av)}${v > av ? " · " + L("itna stock nahi hai", "not enough stock") : ""}`;
    document.getElementById("kslip").innerHTML =
      `${ic("receipt", 16)}<span><b>Slip</b> · ${esc(k.n)} · ${esc(pname(p))} ${p.grade} · ${v ? kg(v) : "– kg"} · ${new Date().toLocaleDateString("en-IN")} · ~${v ? nf(v / S.kpb[p.id]) : "–"} bunch ${L("banenge (sample)", "expected (sample)")}</span>`;
  },
  karRecv(f) {
    const j = S.jobs.find((x) => x.id === f.dataset.id),
      b = jobBal(j),
      kp = S.kpb[j.product],
      bu = +f.bunch.value || 0,
      lo = +f.loose.value || 0,
      wa = +f.waste.value || 0,
      used = bu * kp + lo + wa;
    document.getElementById("rsum").innerHTML =
      `<div><span>${nf(bu)} bunch × ${kp} kg</span><b>${kg(bu * kp)}</b></div><div><span>Loose + wastage</span><b>${kg(lo + wa)}</b></div><div class="tot"><span>${L("Iske baad baaki", "Balance after this")}</span><b>${kg(Math.max(0, b.bal - used))}</b></div>`;
    document.getElementById("rerr").textContent =
      used > b.bal + 0.5
        ? L(
            `Yeh ${kg(used)} banta hai, jabki baaki sirf ${kg(b.bal)} hai. Number check karo.`,
            `That adds up to ${kg(used)}, but only ${kg(b.bal)} is outstanding. Check the numbers.`,
          )
        : "";
  },
  order(f) {
    syncDraft(f);
    let val = 0;
    draft.lines.forEach((l, i) => {
      const [kind, ref, uom] = l.item.split("|"),
        q = +l.qty || 0,
        av = lineAvail({ kind, ref, uom });
      val += q * (+l.rate || 0);
      document.getElementById("av" + i).innerHTML = q
        ? av >= q
          ? `<span class="pill ok">${ic("check", 12)} ${L("Stock hai", "In stock")}: ${fq(av, uom)}</span>`
          : `<span class="pill warn">${L("Stock kam", "Short")}: ${fq(av, uom)} ${L("hai", "available")}, ${fq(q - av, uom)} ${L("banana padega", "to be made")}</span>`
        : `<span class="psub">Stock: ${fq(av, uom)}</span>`;
    });
    const p = PTY[draft.party],
      pi = partyInfo(p.id),
      after = pi.out + val * 1.18,
      over = after > p.limit;
    document.getElementById("osum").innerHTML =
      `<div class="sumbox"><div><span>${L("Order (bina GST)", "Order (before GST)")}</span><b>${rs(val)}</b></div><div><span>${L("Party ka abhi baaki", "Party owes now")}</span><b>${rs(pi.out)}</b></div><div class="tot"><span>${L("Order ke baad (GST ke saath, andaaza)", "After this order (with GST, est.)")}</span><b>${rs(after)}</b></div></div>
     ${over ? `<div class="note bad">${ic("alert", 16)}<span>${L(`Credit limit ${rs(p.limit)} paar ho jaayegi.`, `This crosses the ${rs(p.limit)} credit limit.`)}<label style="display:flex;gap:8px;align-items:center;margin-top:6px;color:var(--ink)"><input type="checkbox" name="over" ${draft.over ? "checked" : ""}> ${L("Phir bhi order lo (Admin)", "Take the order anyway (Admin)")}</label></span></div>` : ""}`;
    const sv = document.getElementById("osave");
    const c = f.querySelector("[name=over]");
    sv.disabled =
      (over && !(c && c.checked)) || !draft.lines.some((l) => +l.qty > 0);
  },
  bill(f) {
    const d = S.dispatches.find((x) => x.id === f.dataset.id),
      o = S.orders.find((x) => x.id === d.order),
      p = PTY[o.party],
      tx = sum(d.lines, ({ i, q }) => q * o.lines[i].rate),
      g = f.querySelector("[name=type]:checked").value === "GST",
      intra = p.state === "Maharashtra";
    document.getElementById("bsum").innerHTML =
      `<div><span>Taxable</span><b>${rs(tx)}</b></div>${g ? (intra ? `<div><span>CGST 9% + SGST 9%</span><b>${rs(tx * 0.18)}</b></div>` : `<div><span>IGST 18% (${esc(p.state)})</span><b>${rs(tx * 0.18)}</b></div>`) : ""}<div class="tot"><span>Total</span><b>${rs(g ? tx * 1.18 : tx)}</b></div>`;
  },
  payment(f) {
    const pid = f.party.value,
      amt = +f.amount.value || 0,
      pi = partyInfo(pid);
    let rem = amt;
    const out = [];
    if (pi.openDue > 0.5) {
      const a = Math.min(rem, pi.openDue);
      if (a > 0)
        out.push([L("Purana baaki", "Opening balance"), a, pi.openDue]);
      rem -= a;
    }
    pi.st
      .filter((x) => x.due > 0.5)
      .forEach((x) => {
        const a = Math.min(rem, x.due);
        if (a > 0) out.push([x.inv.no, a, x.due]);
        rem -= a;
      });
    document.getElementById("psum").innerHTML = amt
      ? `${out.map(([n, a, d]) => `<div><span>${n}</span><b>${rs(a)}${a < d - 0.5 ? ` <span class="psub">/ ${rs(d)}</span>` : " ✓"}</b></div>`).join("")}${rem > 0.5 ? `<div><span>${L("Advance", "Advance")}</span><b>${rs(rem)}</b></div>` : ""}<div class="tot"><span>${L("Iske baad baaki", "Due after this")}</span><b>${rs(pi.out - amt)}</b></div>`
      : `<div><span>${L("Abhi baaki", "Due now")}</span><b>${rs(pi.out)}</b></div>`;
  },
};

/* ---------- form submits ---------- */
const FORMS = {
  entry(f) {
    const u = user(),
      i = +f.input.value,
      o = +f.out.value,
      r = +f.reject.value || 0,
      pr = (f.querySelector("[name=product]:checked") || {}).value,
      id = f.dataset.id;
    if (!pr || !(i > 0) || !(o > 0)) {
      document.getElementById("ferr").textContent = L(
        "Product chuno aur lagaya + achha maal ka kg daalo.",
        "Pick the product and enter input and good kg.",
      );
      return;
    }
    if (o + r > i + 0.05) {
      LIVE.entry(f);
      return;
    }
    S.ui.lastProd[u.machine] = pr;
    if (id) {
      const e = S.entries.find((x) => x.id === id);
      Object.assign(e, {
        product: pr,
        input: i,
        out: o,
        reject: r,
        status: "pending",
        note: "",
      });
      logA(
        `${u.machine}: entry sudhari (${kg(o)})`,
        `${u.machine}: entry fixed (${kg(o)})`,
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
    const e = {
      id: nid(),
      unit: u.unit,
      machine: u.machine,
      staff: u.n,
      shift: "Day",
      ts: Date.now(),
      product: pr,
      input: i,
      out: o,
      reject: r,
      down: 0,
      status: "pending",
      hist: false,
      note: "",
      lot: newLot(),
    };
    if (S.online) {
      S.entries.push(e);
      logA(`${u.machine}: ${kg(o)} entry`, `${u.machine}: ${kg(o)} entry`);
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
  },
  stop(f) {
    const u = user(),
      s = S.shift[u.machine],
      r = f.querySelector("[name=reason]:checked").value;
    s.stop = Date.now();
    s.reason = r;
    const rr = STOP_REASONS.find((x) => x[0] === r);
    logA(`${u.machine} ruki · ${rr[1]}`, `${u.machine} stopped · ${rr[2]}`);
    closeModal();
    toast(L("Admin ko alert chala gaya.", "The Admin has been alerted."));
    render();
  },
  return(f) {
    const n = f.note.value.trim();
    if (!n) {
      f.note.focus();
      return;
    }
    const e = S.entries.find((x) => x.id === f.dataset.id);
    e.status = "returned";
    e.note = n;
    logA(
      `${e.machine} ki entry wapas bheji: ${n}`,
      `Sent back ${e.machine} entry: ${n}`,
    );
    closeModal();
    toast(L("Staff ko wapas bhej di.", "Sent back to the staff."));
    render();
  },
  receive(f) {
    const t = S.transfers.find((x) => x.id === f.dataset.id),
      v = +f.kg.value;
    if (!(v > 0)) {
      f.kg.focus();
      return;
    }
    t.recv = v;
    t.status = "received";
    t.rts = Date.now();
    t.rby = user().n;
    move("PLAIN:" + t.to, t.item, "kg", v);
    const d = r1(v - t.sent);
    logA(
      `${plainName(t.item)}: ${kg(t.sent)} bheja, ${kg(v)} mila${d ? ` (${d} kg farak)` : ""}`,
      `${plainName(t.item)}: sent ${kg(t.sent)}, received ${kg(v)}${d ? ` (${d} kg gap)` : ""}`,
    );
    toast(
      d
        ? L(
            `Maal mila. ${d} kg ka farak Admin ko dikhega.`,
            `Received. The ${d} kg gap is flagged to the Admin.`,
          )
        : L("Maal mila. Stock update ho gaya.", "Received. Stock updated."),
    );
    render();
  },
  transfer(f) {
    const to = f.querySelector("[name=to]:checked").value,
      k = f.item.value,
      v = +f.kg.value;
    if (!(v > 0) || v > qty("PLAIN:M", k, "kg")) {
      LIVE.transfer(f);
      f.kg.focus();
      return;
    }
    move("PLAIN:M", k, "kg", -v);
    S.transfers.push({
      id: nid(),
      from: "M",
      to,
      item: k,
      sent: v,
      recv: null,
      ts: Date.now(),
      by: user().n,
      status: "transit",
    });
    logA(
      `${kg(v)} ${plainName(k)} ${UNITS[to].n} ko bheja`,
      `Sent ${kg(v)} ${plainName(k)} to ${UNITS[to].n}`,
    );
    closeModal();
    toast(
      L(
        `${UNITS[to].n} ko bhej diya. Wahan confirm hoga.`,
        `Sent to ${UNITS[to].n}. They will confirm on arrival.`,
      ),
    );
    render();
  },
  inward(f) {
    const u = user(),
      unit = u.role === "manager" ? u.unit : "M",
      q = +f.qty.value,
      b = f.bill.value.trim();
    if (!(q > 0) || !b) {
      (!b ? f.bill : f.qty).focus();
      return;
    }
    const ph = f.photo.files && f.photo.files[0] ? f.photo.files[0].name : "";
    move("RAW:" + unit, f.mat.value, RM[f.mat.value].uom, q);
    S.inwards.push({
      id: nid(),
      unit,
      supplier: f.supplier.value,
      mat: f.mat.value,
      qty: q,
      bill: b,
      photo: ph,
      rate: null,
      ts: Date.now(),
      by: u.n,
    });
    logA(
      `Inward: ${fq(q, RM[f.mat.value].uom)} ${RM[f.mat.value].n} · ${f.supplier.value}`,
      `Inward: ${fq(q, RM[f.mat.value].uom)} ${RM[f.mat.value].n} · ${f.supplier.value}`,
    );
    closeModal();
    toast(L("Inward save. Stock badh gaya.", "Inward saved. Stock increased."));
    render();
  },
  karSend(f) {
    const u = user(),
      pid = f.product.value,
      v = +f.kg.value;
    if (!(v > 0) || v > qty("COAT:" + u.unit, pid, "kg")) {
      LIVE.karSend(f);
      f.kg.focus();
      return;
    }
    move("COAT:" + u.unit, pid, "kg", -v);
    S.jobs.push({
      id: nid(),
      kar: f.kar.value,
      unit: u.unit,
      product: pid,
      sent: v,
      ts: Date.now(),
      by: u.n,
      receipts: [],
    });
    logA(
      `${KM[f.kar.value].n} ko ${kg(v)} ${pname(PM[pid])} bheja`,
      `Sent ${kg(v)} ${pname(PM[pid])} to ${KM[f.kar.value].n}`,
    );
    const jb = S.jobs[S.jobs.length - 1];
    jb.challan = "JW/26-27/" + String(S.seq.jw++).padStart(4, "0");
    render();
    challanModal(jb.id);
    toast(L("Bhej diya. Challan taiyaar.", "Sent. Challan ready."));
  },
  karRecv(f) {
    const j = S.jobs.find((x) => x.id === f.dataset.id),
      bu = Math.round(+f.bunch.value || 0),
      lo = +f.loose.value || 0,
      wa = +f.waste.value || 0,
      b = jobBal(j);
    if (!(bu > 0 || lo > 0 || wa > 0)) {
      f.bunch.focus();
      return;
    }
    if (bu * S.kpb[j.product] + lo + wa > b.bal + 0.5) {
      LIVE.karRecv(f);
      return;
    }
    j.receipts.push({ bunch: bu, loose: lo, waste: wa, ts: Date.now() });
    move("FIN:" + j.unit, j.product, "bunch", bu);
    if (lo) move("COAT:" + j.unit, j.product, "kg", lo);
    logA(
      `${KM[j.kar].n} se ${bu} bunch wapas`,
      `${bu} bunches back from ${KM[j.kar].n}`,
    );
    closeModal();
    toast(
      L(
        `${bu} bunch taiyaar maal mein jud gaye.`,
        `${bu} bunches added to finished stock.`,
      ),
    );
    render();
  },
  dispatch(f) {
    const u = user(),
      o = S.orders.find((x) => x.id === f.dataset.id),
      parts = [];
    o.lines.forEach((l, i) => {
      const el = f["q" + i];
      if (!el) return;
      const q =
        l.uom === "bunch" ? Math.round(+el.value || 0) : r1(+el.value || 0);
      if (q > 0) parts.push([i, q]);
    });
    const bad = parts.find(
      ([i, q]) =>
        q >
        Math.min(o.lines[i].qty - o.lines[i].disp, lineAvail(o.lines[i])) +
          0.001,
    );
    if (!parts.length || bad) {
      document.getElementById("derr").textContent = bad
        ? L(
            "Itna stock nahi hai ya order se zyada hai.",
            "More than the stock or the order.",
          )
        : L(
            "Kam se kam ek product ki quantity daalo.",
            "Enter a quantity for at least one product.",
          );
      return;
    }
    if (!f.vehicle.value.trim()) {
      f.vehicle.focus();
      return;
    }
    parts.forEach(([i, q]) => {
      lineTake(o.lines[i], q);
      o.lines[i].disp += q;
    });
    S.dispatches.push({
      id: nid(),
      order: o.id,
      unit: u.unit || lineUnit(o.lines[parts[0][0]]),
      lines: parts.map(([i, q]) => ({ i, q })),
      ts: Date.now(),
      vehicle: f.vehicle.value.trim(),
      by: u.n,
      invoice: null,
    });
    logA(
      `Dispatch #${o.no} · ${PTY[o.party].n}`,
      `Dispatched #${o.no} · ${PTY[o.party].n}`,
    );
    render();
    packingModal(S.dispatches[S.dispatches.length - 1].id);
    toast(
      L(
        "Dispatch ho gaya. Admin bill banayega.",
        "Dispatched. The Admin will make the bill.",
      ),
    );
  },
  order(f) {
    syncDraft(f);
    const ls = draft.lines
      .filter((l) => +l.qty > 0)
      .map((l) => {
        const [kind, ref, uom] = l.item.split("|");
        return {
          kind,
          ref,
          uom,
          qty: uom === "bunch" ? Math.round(+l.qty) : r1(+l.qty),
          rate: +l.rate || defRate(l.item),
          disp: 0,
        };
      });
    if (!ls.length) return;
    const no = S.seq.order++;
    const pr = f.promise.value
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
    const st = orderStatus(o);
    closeModal();
    S.view = "orders";
    S.ui.orderTab = "all";
    toast(
      st === "waiting"
        ? L(
            `Order #${no} save. Stock kam hai, intezaar mein rakha.`,
            `Order #${no} saved. Not enough stock, marked waiting.`,
          )
        : L(
            `Order #${no} save. Unit ki dispatch list mein gaya.`,
            `Order #${no} saved and sent to the unit's dispatch list.`,
          ),
    );
    render();
  },
  bill(f) {
    const d = S.dispatches.find((x) => x.id === f.dataset.id),
      type = f.querySelector("[name=type]:checked").value;
    const inv = makeInvoice(d, type);
    render();
    invoiceModal(inv.id);
  },
  payment(f) {
    const amt = +f.amount.value;
    if (!(amt > 0)) {
      f.amount.focus();
      return;
    }
    const pid = f.party.value;
    S.payments.push({
      id: nid(),
      party: pid,
      amount: Math.round(amt),
      mode: f.querySelector("[name=mode]:checked").value,
      ref: f.ref.value.trim(),
      ts: Date.now(),
    });
    logA(
      `Payment ${rs(amt)} · ${PTY[pid].n}`,
      `Payment ${rs(amt)} · ${PTY[pid].n}`,
    );
    closeModal();
    toast(L(`${rs(amt)} jama ho gaya.`, `${rs(amt)} recorded.`));
    render();
  },
  product(f) {
    const id = f.dataset.id;
    S.prices[id].bunch = +f.bunch.value || S.prices[id].bunch;
    if (f.kg) S.prices[id].kg = +f.kg.value || S.prices[id].kg;
    S.kpb[id] = +f.kpb.value || S.kpb[id];
    logA(`${pname(PM[id])} ka rate badla`, `Updated rate for ${pname(PM[id])}`);
    closeModal();
    toast(
      L(
        "Rate save. Sirf naye order par lagega.",
        "Rate saved. Applies to new orders only.",
      ),
    );
    render();
  },
  expense(f) {
    const a = +f.amount.value;
    if (!(a > 0)) {
      f.amount.focus();
      return;
    }
    S.expenses.push({
      id: nid(),
      unit: f.unit.value,
      cat: f.cat.value,
      amount: a,
      ts: Date.now(),
      note: f.note.value.trim(),
    });
    logA(
      `Kharcha ${rs(a)} · ${f.cat.value}`,
      `Expense ${rs(a)} · ${f.cat.value}`,
    );
    closeModal();
    toast(L("Kharcha save.", "Expense saved."));
    render();
  },
};

/* ---------- actions ---------- */
const ACT = {
  login(el) {
    S.user = el.dataset.id;
    S.view = "home";
    render();
    scrollTo(0, 0);
  },
  logout() {
    S.user = null;
    closeModal();
    render();
    scrollTo(0, 0);
  },
  nav(el) {
    S.view = el.dataset.v;
    if (el.dataset.tab) {
      if (S.view === "stock") S.ui.stockTab = el.dataset.tab;
      if (S.view === "khaata") S.ui.khaataTab = el.dataset.tab;
    }
    closeModal();
    render();
    scrollTo(0, 0);
  },
  more() {
    moreModal();
  },
  ui(el) {
    S.ui[el.dataset.k] = el.dataset.val;
    render();
  },
  toggleLang() {
    S.lang = S.lang === "hi" ? "en" : "hi";
    closeModal();
    render();
  },
  toggleTheme() {
    S.theme = isDark() ? "light" : "dark";
    render();
  },
  toggleOnline() {
    S.online = !S.online;
    if (S.online && S.outbox.length) {
      const n = S.outbox.length;
      S.entries.push(...S.outbox);
      S.outbox = [];
      logA(`${n} offline entry sync hui`, `${n} offline entries synced`);
      toast(L(`${n} entry sync ho gayi.`, `${n} entries synced.`));
    } else
      toast(
        S.online
          ? L("Online", "Back online")
          : L(
              "Offline mode. Staff ki entry phone mein rukegi.",
              "Offline mode. Staff entries wait on the phone.",
            ),
      );
    render();
  },
  askReset() {
    openModal(
      L("Saara data zero karein?", "Reset all data to zero?"),
      "",
      `<p>${L("Stock, entries, orders, bill, payment, karigar ka hisaab aur record sab mit jaayega. Users, PIN, products, rate aur settings wahi rahenge. Yeh wapas nahi hoga.", "Stock, entries, orders, bills, payments, karigar accounts and the activity log are all erased. Users, PINs, products, rates and settings stay. This cannot be undone.")}</p>`,
      `${cancelBtn()}<button type="button" class="btn danger" data-a="reset">${L("Haan, zero karo", "Yes, reset to zero")}</button>`,
    );
  },
  reset() {
    const lang = S.lang,
      theme = S.theme;
    seed();
    S.lang = lang;
    S.theme = theme;
    closeModal();
    render();
    toast(L("Saara data zero ho gaya.", "All data reset to zero."));
  },
  close() {
    closeModal();
  },
  entry(el) {
    entryModal(el.dataset.id);
  },
  shiftStart() {
    const m = user().machine;
    S.shift[m] = {
      start: Date.now(),
      stop: null,
      reason: null,
      down: 0,
      ended: false,
    };
    logA(`${m} shift shuru`, `${m} shift started`);
    render();
    toast(L("Shift shuru. Achha kaam!", "Shift started."));
  },
  shiftEnd() {
    shiftEndModal();
  },
  shiftEndGo() {
    const m = user().machine;
    const s = S.shift[m];
    if (s.stop) {
      s.down += Math.max(1, Math.round((Date.now() - s.stop) / MIN));
      s.stop = null;
    }
    s.ended = true;
    logA(`${m} shift khatam`, `${m} shift ended`);
    closeModal();
    render();
    toast(
      L(
        "Shift ka hisaab Admin ko chala gaya.",
        "Shift summary sent to the Admin.",
      ),
    );
  },
  machineStop() {
    stopModal();
  },
  machineGo() {
    const m = user().machine,
      s = S.shift[m],
      d = Math.max(1, Math.round((Date.now() - s.stop) / MIN));
    s.down += d;
    s.stop = null;
    s.reason = null;
    logA(
      `${m} wapas chalu (${d} min ruki)`,
      `${m} running again (${d} min down)`,
    );
    render();
    toast(
      L(
        `Machine chalu. ${d} min ruki thi.`,
        `Machine running. Down for ${d} min.`,
      ),
    );
  },
  approve(el) {
    const e = S.entries.find((x) => x.id === el.dataset.id);
    if (!e || !canApprove(e)) return;
    if (e.unit === "M") {
      move("RAW:M", gppsFor(e.product), "kg", -e.input);
      move("PLAIN:M", e.product, "kg", e.out);
    } else {
      const p = PM[e.product];
      move("PLAIN:" + e.unit, plainKey(p), "kg", -e.input);
      move("COAT:" + e.unit, p.id, "kg", e.out);
      if (e.unit === "P") {
        move("RAW:P", "essence", "kg", -e.out * 0.012);
        move("RAW:P", "lacquer", "L", -e.out * 0.02);
      } else {
        move("RAW:Z", "alu", "kg", -e.out * 0.006);
        move("RAW:Z", "base", "L", -e.out * 0.015);
        move("RAW:Z", "top", "L", -e.out * 0.012);
      }
    }
    e.status = "approved";
    e.by = user().n;
    logA(
      `${e.machine} ki ${eq(e, e.out)} entry approve`,
      `Approved ${e.machine} entry of ${eq(e, e.out)}`,
    );
    toast(
      L(
        `${eq(e, e.out)} stock mein jud gaya.`,
        `${eq(e, e.out)} added to stock.`,
      ),
    );
    render();
  },
  returnEntry(el) {
    returnModal(el.dataset.id);
  },
  transferSend() {
    transferModal();
  },
  inward() {
    inwardModal();
  },
  karSend() {
    karSendModal();
  },
  karRecv(el) {
    karRecvModal(el.dataset.id);
  },
  dispatch(el) {
    dispatchModal(el.dataset.id);
  },
  dayClose() {
    dayCloseModal();
  },
  dayCloseGo() {
    const u = user();
    S.closed[u.unit] = Date.now();
    logA(`${UNITS[u.unit].n}: din band`, `${UNITS[u.unit].n}: day closed`);
    closeModal();
    render();
    toast(
      L(
        "Din band. Admin ko report chali gayi.",
        "Day closed. Report sent to the Admin.",
      ),
    );
  },
  newOrder() {
    newOrderModal();
  },
  addLine() {
    const f = document.querySelector("form[data-f=order]");
    syncDraft(f);
    draft.lines.push({
      item: "fin|p02|bunch",
      qty: "",
      rate: S.prices.p02.bunch,
    });
    renderOrderModal();
  },
  delLine(el) {
    const f = document.querySelector("form[data-f=order]");
    syncDraft(f);
    draft.lines.splice(+el.dataset.i, 1);
    renderOrderModal();
  },
  orderDetail(el) {
    orderDetailModal(el.dataset.id);
  },
  cancelOrder() {
    const c = document.getElementById("cxl");
    if (c) {
      c.hidden = false;
      document.getElementById("cr").focus();
    }
  },
  cancelOrderGo(el) {
    const r = document.getElementById("cr").value.trim();
    if (!r) {
      document.getElementById("cr").focus();
      return;
    }
    const o = S.orders.find((x) => x.id === el.dataset.id);
    o.cancelled = true;
    o.reason = r;
    logA(`Order #${o.no} cancel: ${r}`, `Order #${o.no} cancelled: ${r}`);
    closeModal();
    render();
    toast(L("Order cancel ho gaya.", "Order cancelled."));
  },
  bill(el) {
    billModal(el.dataset.id);
  },
  invoice(el) {
    invoiceModal(el.dataset.id);
  },
  waShare() {
    toast(
      L(
        "Asli app mein yeh bill PDF banke party ke WhatsApp par jaayega.",
        "In the real app this bill goes to the party on WhatsApp as a PDF.",
      ),
    );
  },
  payment(el) {
    paymentModal(el.dataset.id || PARTIES[0].id);
  },
  ledger(el) {
    ledgerModal(el.dataset.id);
  },
  product(el) {
    productModal(el.dataset.id);
  },
  expense() {
    expenseModal();
  },
  saveRate(el) {
    const v = +document.getElementById("rate-" + el.dataset.id).value;
    if (!(v > 0)) {
      document.getElementById("rate-" + el.dataset.id).focus();
      return;
    }
    const i = S.inwards.find((x) => x.id === el.dataset.id);
    i.rate = v;
    logA(
      `Inward rate ${rs(v)}/${RM[i.mat].uom} · ${RM[i.mat].n}`,
      `Inward rate ${rs(v)}/${RM[i.mat].uom} · ${RM[i.mat].n}`,
    );
    render();
    toast(
      L(
        "Rate save. Supplier ka khaata update.",
        "Rate saved. Supplier account updated.",
      ),
    );
  },
};
document.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("ov")) {
    closeModal();
    return;
  }
  const el = e.target.closest("[data-a]");
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.a];
  if (fn) {
    e.preventDefault();
    fn(el);
  }
});
document.addEventListener("submit", (e) => {
  const f = e.target.closest("form[data-f]");
  if (!f) return;
  e.preventDefault();
  const fn = FORMS[f.dataset.f];
  if (fn) fn(f);
});
const liveH = (e) => {
  const f = e.target.closest("form[data-live]");
  if (!f) return;
  if (e.type === "change" && e.target.dataset.line != null) {
    const i = e.target.dataset.line;
    const r = f["rate_" + i];
    if (r) r.value = defRate(e.target.value);
  }
  LIVE[f.dataset.live](f);
};
document.addEventListener("input", liveH);
document.addEventListener("change", liveH);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.querySelector("#modal-root .ov"))
    closeModal();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (!S.theme) render();
});

/* ---------- login ---------- */
const fmtMob = (m) => m.slice(0, 5) + " " + m.slice(5);
const RC = {
  admin: ["k", "Admin"],
  manager: ["p", "Manager"],
  staff: ["m", "Staff"],
};
const rchip = (r) => `<span class="uchip ${RC[r][0]}">${RC[r][1]}</span>`;
function roleLabel(u) {
  return u.role === "admin"
    ? L("Admin · saari units", "Admin · all units")
    : u.role === "manager"
      ? UNITS[u.unit].n + " · Manager"
      : L("Staff · machine ", "Staff · machine ") +
        u.machine +
        " · " +
        UNITS[u.unit].n;
}
const loginBlob = `<svg viewBox="0 0 300 300" aria-hidden="true"><path d="M300 0H95c4 52 38 80 84 98 52 20 75 58 72 112 18 22 36 28 49 30z" fill="var(--sand)"/><path d="M70 0c10 70 60 96 112 118 46 20 70 64 66 118" fill="none" stroke="var(--gold)" stroke-width="1.3"/></svg>`;
function loginView() {
  const lg = S.login,
    lu = lg.uid ? S.users.find((x) => x.id === lg.uid) : null,
    last = S.lastUser ? S.users.find((x) => x.id === S.lastUser) : null;
  const brand = `<section class="lg-brand">${loginBlob.replace("<svg", '<svg class="blob"')}${loginBlob.replace("<svg", '<svg class="blob2"')}
   <div class="mark" style="width:46px;height:46px"><i style="width:26px;height:26px;top:10px"></i><i style="width:19px;height:19px;left:22px;top:3px"></i><i style="width:16px;height:16px;left:24px;top:25px"></i></div>
   <p class="tag">Beads Bazaar · Bhiwandi</p><h1>MK Plastics</h1>
   <p class="lede">${L("Moulding, Pearl, Metalizing aur karigar. Har kilo ka hisaab, ek app mein.", "Moulding, Pearl, Metalizing and karigars. Every kilo accounted for, in one app.")}</p>
   <div class="btns">${Object.keys(UNITS).map(uchip).join("")}<span class="uchip k">Karigar</span></div>
   <div class="lg-more">
    <div class="lg-feat"><span class="ico-c">${ic("phone", 17)}</span><div><b>${L("Mobile number + 4 ank ka PIN", "Mobile number + 4-digit PIN")}</b><span>${L("Password yaad rakhne ki zarurat nahi", "No password to remember")}</span></div></div>
    <div class="lg-feat"><span class="ico-c">${ic("lock", 17)}</span><div><b>${L("Har role ko sirf apna kaam", "Each role sees only its own work")}</b><span>${L("Staff ko rate ya paisa nahi dikhta", "Staff never see rates or money")}</span></div></div>
    <div class="lg-feat"><span class="ico-c">${ic("wifioff", 17)}</span><div><b>${L("Internet ke bina bhi entry", "Entries work without internet")}</b><span>${L("Net aate hi apne aap sync", "Syncs on its own when the net is back")}</span></div></div>
   </div>
   <button type="button" class="btn" data-a="nav" data-v="guide" style="justify-self:start">${ic("book", 16)} ${L("App kaise chalaye? User guide", "How to use the app: User guide")}</button></section>`;
  let card;
  if (lg.step === "pin" && lu) {
    const locked = lu.fails >= 5;
    card = `<div class="lg-card"><button type="button" class="linkbtn" data-a="lgBack" style="justify-self:start;padding-left:0">← ${L("Doosra number", "Use another number")}</button>
     <div class="lg-who"><span class="av" style="--c:${lu.c}">${esc(lu.n[0])}</span><div><b>${L("Namaste", "Hello")}, ${esc(lu.n)}</b><small>${roleLabel(lu)} · +91 ${fmtMob(lu.mobile)}</small></div></div>
     <h2>${locked ? L("Account lock hai", "Account locked") : L("Apna 4 ank ka PIN daalo", "Enter your 4-digit PIN")}</h2>
     ${
       locked
         ? `<div class="note bad">${ic("lock", 16)}<span>${L("5 baar galat PIN daala gaya. Admin (Owner) se kaho: Team → PIN reset. Naya PIN milte hi yahan se login karo.", "The PIN was wrong 5 times. Ask the Admin (Owner) to reset it in Team. Log in here once you have the new PIN.")}</span></div>`
         : `<div class="pin-dots ${lg.err ? "shake" : ""}" role="img" aria-label="PIN ${lg.pin.length}/4">${[0, 1, 2, 3].map((i) => `<i class="${i < lg.pin.length ? "on" : ""}"></i>`).join("")}</div>
     <p class="err" role="alert" style="text-align:center;min-height:1.4em">${esc(lg.err || "")}</p>
     <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-a="pinKey" data-k="${n}">${n}</button>`).join("")}<span></span><button type="button" data-a="pinKey" data-k="0">0</button><button type="button" data-a="pinKey" data-k="del" aria-label="${L("Mitao", "Delete")}">${ic("back", 24)}</button></div>`
     }
     <button type="button" class="linkbtn" data-a="forgotPin" style="justify-self:center">${L("PIN bhool gaye?", "Forgot PIN?")}</button></div>`;
  } else {
    card = `<form class="lg-card" data-f="lgPhone" novalidate><div><div class="eyebrow">Login</div><h2>${L("Mobile number se login karo", "Log in with your mobile number")}</h2><p class="muted" style="font-size:13.5px;margin-top:4px">${L("Wahi number jo Admin ne app mein joda hai.", "The number your Admin added to the app.")}</p></div>
     <div class="fld"><label for="lgm">Mobile number</label><div class="phone-in"><span>+91</span><input id="lgm" name="mobile" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="11" value="${esc(lg.phone)}" placeholder="98XXX XXXXX"></div></div>
     <p class="err" role="alert">${esc(lg.err || "")}</p>
     <button class="btn pri big" type="submit">${L("Aage badho", "Continue")} ${ic("chev")}</button>
     ${last ? `<div class="or">${L("ya", "or")}</div><button type="button" class="lg-last" data-a="lgPick" data-id="${last.id}"><span class="av" style="--c:${last.c}">${esc(last.n[0])}</span><span style="flex:1"><b>${L("Wapas aao", "Continue as")} ${esc(last.n)}</b><small>${L("Is phone par yaad hai · sirf PIN", "Remembered on this phone · PIN only")}</small></span>${ic("chev")}</button>` : ""}</form>`;
  }
  const order = { admin: 0, manager: 1, staff: 2 };
  const creds = `<details class="creds" ${lg.step === "pin" ? "" : "open"}><summary>${L("Demo logins (sirf prototype ke liye)", "Demo logins (prototype only)")}</summary><p>${L("Kisi line par tap karo, number bhar jaayega. PIN keypad par daalo.", "Tap a row to fill the number, then type the PIN on the keypad.")}</p>
   <div class="tw"><table><tbody>${S.users
     .filter((u) => u.active)
     .sort((a, b) => order[a.role] - order[b.role])
     .map(
       (u) =>
         `<tr class="click" data-a="lgPick" data-id="${u.id}"><td><b>${esc(u.n)}</b><div class="psub">${roleLabel(u)}</div></td><td class="num">${fmtMob(u.mobile)}</td><td class="num">PIN <b>${u.pin}</b></td></tr>`,
     )
     .join("")}</tbody></table></div></details>`;
  return `<section class="lg fade">${brand}<div class="lg-right">${card}${creds}</div></section>`;
}
function tryPin() {
  const lg = S.login,
    u = S.users.find((x) => x.id === lg.uid);
  if (!u) return;
  if (lg.pin === u.pin) {
    u.fails = 0;
    u.last = Date.now();
    S.user = u.id;
    S.lastUser = u.id;
    S.view = "home";
    S.login = { step: "phone", phone: "", pin: "", err: "", uid: null };
    logA(`${u.n} ne login kiya`, `${u.n} logged in`, u);
    setHash("");
    render();
    scrollTo(0, 0);
    toast(L(`Namaste ${u.n}`, `Welcome, ${u.n}`));
    return;
  }
  u.fails++;
  lg.pin = "";
  if (u.fails >= 5) {
    lg.err = "";
    logA(
      `${u.n} ka account lock (5 galat PIN)`,
      `${u.n} locked out (5 wrong PINs)`,
      u,
    );
  } else
    lg.err = L(
      `Galat PIN. ${5 - u.fails} koshish baaki.`,
      `Wrong PIN. ${5 - u.fails} ${5 - u.fails > 1 ? "tries" : "try"} left.`,
    );
  render();
}

/* ---------- team ---------- */
function teamView() {
  const order = { admin: 0, manager: 1, staff: 2 },
    rows = S.users
      .slice()
      .sort(
        (a, b) =>
          order[a.role] - order[b.role] ||
          (a.unit || "").localeCompare(b.unit || ""),
      );
  return `<section class="card"><div class="card-h"><div><h3>${L("App ke users", "App users")} · ${S.users.length}</h3><p>${L("Har user apne mobile number aur 4 ank ke PIN se login karta hai. PIN bhoolne ya lock hone par yahan se reset karo.", "Each user logs in with a mobile number and a 4-digit PIN. Reset forgotten or locked PINs here.")}</p></div></div>
  <div class="tw"><table><thead><tr><th>${L("Naam", "Name")}</th><th>Role</th><th>Unit / machine</th><th>Mobile</th><th>${L("Pichhla login", "Last login")}</th><th>Status</th><th></th></tr></thead><tbody>${rows
    .map(
      (
        u,
      ) => `<tr><td><div class="prow" style="min-width:140px"><span class="av" style="--c:${u.c};width:32px;height:32px;font-size:12px">${esc(u.n[0])}</span><b>${esc(u.n)}</b></div></td><td>${rchip(u.role)}</td><td>${u.unit ? UNITS[u.unit].n : L("Saari units", "All units")}${u.machine ? " · " + u.machine : ""}</td><td class="num" style="white-space:nowrap">${fmtMob(u.mobile)}</td><td class="psub">${u.last ? fwhen(u.last) : "–"}</td>
   <td>${!u.active ? `<span class="pill bad">${L("Band", "Inactive")}</span>` : u.fails >= 5 ? `<span class="pill warn">${ic("lock", 12)} Lock</span>` : `<span class="pill ok">${L("Chalu", "Active")}</span>`}</td>
   <td><div class="btns" style="flex-wrap:nowrap"><button type="button" class="btn sm" data-a="pinReset" data-id="${u.id}">${ic("key", 14)} PIN reset</button>${u.id !== S.user ? `<button type="button" class="btn sm ${u.active ? "danger" : "ok"}" data-a="toggleUser" data-id="${u.id}">${u.active ? L("Band karo", "Deactivate") : L("Chalu karo", "Activate")}</button>` : ""}</div></td></tr>`,
    )
    .join("")}</tbody></table></div></section>
  <section class="card"><div class="card-h"><h3>${L("Niyam", "Rules")}</h3></div><ol class="steps">
   ${gli("Ek mobile number = ek user", "One mobile number = one user", "Do log ek number share nahi karenge, taaki har entry sahi naam se jude.", "No sharing numbers, so every entry is linked to the right person.")}
   ${gli("PIN sirf user ko batao", "Tell the PIN only to the user", "Naya user ya PIN reset par app 4 ank ka PIN banata hai. Asli app mein pehli login par user apna PIN badlega.", "For a new user or a reset, the app makes a 4-digit PIN. In the real app the user changes it at first login.")}
   ${gli("Kaam chhoda toh account band karo", "Deactivate leavers", "Band account se login nahi hota, lekin purani entries unke naam se record mein rehti hain.", "A deactivated account cannot log in, but past entries stay on record under their name.")}</ol></section>`;
}
function pinResetModal(id) {
  const u = S.users.find((x) => x.id === id);
  draft = { pin: String(Math.floor(1000 + Math.random() * 9000)) };
  openModal(
    L("PIN reset", "Reset PIN"),
    `${esc(u.n)} · ${roleLabel(u)}`,
    `<p>${L("Naya PIN:", "New PIN:")}</p><div class="pinbig">${draft.pin}</div><div class="note">${ic("phone", 16)}<span>${L(`Yeh PIN ${u.n} ko khud batao (phone ya saamne). Purana PIN band ho jaayega aur lock khul jaayega.`, `Tell ${u.n} this PIN yourself (call or in person). The old PIN stops working and any lock is cleared.`)}</span></div>`,
    `${cancelBtn()}<button type="button" class="btn pri" data-a="pinResetGo" data-id="${id}">${ic("key", 16)} ${L("PIN set karo", "Set PIN")}</button>`,
  );
}
function addUserModal() {
  openModal(
    L("Naya user", "New user"),
    L("Manager ya machine operator", "Manager or machine operator"),
    `<div class="row2"><div class="fld"><label for="un">${L("Naam", "Name")}</label><input id="un" name="name" required></div><div class="fld"><label for="umob">Mobile</label><div class="phone-in"><span>+91</span><input id="umob" name="mobile" type="tel" inputmode="numeric" maxlength="11" required></div></div></div>
  <div class="fld"><span class="lb">Role</span><div class="radios"><label><input type="radio" name="role" value="staff" checked>Staff</label><label><input type="radio" name="role" value="manager">Unit Manager</label></div></div>
  <div class="row2"><div class="fld"><label for="uu">Unit</label><select id="uu" name="unit">${Object.keys(
    UNITS,
  )
    .map((k) => `<option value="${k}">${UNITS[k].n}</option>`)
    .join(
      "",
    )}</select></div><div class="fld" id="umf"><label for="um">Machine</label><select id="um" name="machine"></select></div></div><p class="err" id="uerr" role="alert"></p>`,
    `${cancelBtn()}<button class="btn pri" type="submit">${ic("plus", 16)} ${L("User banao", "Create user")}</button>`,
    { form: "addUser", live: "addUser" },
  );
}
function newCredModal(u) {
  openModal(
    L("User ban gaya", "User created"),
    `${esc(u.n)} · ${roleLabel(u)}`,
    `<div class="sumbox"><div><span>Mobile</span><b>+91 ${fmtMob(u.mobile)}</b></div><div class="tot"><span>PIN</span><b style="font-size:22px;letter-spacing:.2em">${u.pin}</b></div></div><p class="muted" style="font-size:13px">${L("Yeh number aur PIN user ko batao. Wo apne phone se login kar sakta hai.", "Give this number and PIN to the user. They can log in from their own phone.")}</p>`,
    `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "Done")}</button>`,
  );
}

/* ---------- guide ---------- */
const GH = {
  guide: "start",
  workflow: "workflow",
  usecases: "usecases",
  roles: "roles",
};
function applyHash() {
  const h = (location.hash || "").slice(1);
  if (GH[h]) {
    S.view = "guide";
    S.ui.guideTab = GH[h];
    return true;
  }
  return false;
}
function setHash(t) {
  try {
    history.replaceState(
      null,
      "",
      t ? "#" + t : location.pathname + location.search,
    );
  } catch (e) {}
}
const gli = (h1, e1, h2, e2, extra = "") =>
  `<li><div><b>${L(h1, e1)}</b>${h2 ? `<span>${L(h2, e2)}</span>` : ""}${extra}</div></li>`;
const P = (a) => L(a[0], a[1]);
function guideBody() {
  const tab = S.ui.guideTab || "start";
  const tabs = [
    ["start", L("Shuruaat", "Getting started")],
    ["workflow", "Workflow"],
    ["usecases", "Use cases"],
    ["roles", L("Roles aur zimmedari", "Roles & responsibilities")],
  ];
  return `<div class="toolbar"><div class="seg" role="tablist" aria-label="Guide">${tabs.map(([k, l]) => `<button type="button" role="tab" data-a="gtab" data-val="${k}" aria-pressed="${tab === k}" aria-selected="${tab === k}">${l}</button>`).join("")}</div></div>
  ${{ start: gStart, workflow: gWorkflow, usecases: gUC, roles: gRoles }[tab]()}`;
}
function guidePage() {
  const u = user();
  return `<div class="gwrap fade"><div class="ghead"><div class="brand"><div class="mark"><i></i><i></i><i></i></div><div><b>MK Plastics</b><small>Beads Bazaar</small></div></div><button type="button" class="btn" data-a="guideBack">← ${u ? L("App par wapas", "Back to the app") : L("Login par wapas", "Back to login")}</button></div>
  <div><div class="eyebrow">${L("Sabke liye", "For everyone")}</div><h1 class="gtitle">User guide</h1></div>${guideBody()}</div>`;
}
function gStart() {
  const roleBox = (r, title, items) =>
    `<div class="rolebox">${rchip(r)}<b>${title}</b><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
  return `<section class="hero"><div class="hero-h"><div style="display:grid;gap:8px"><div class="eyebrow">${L("Yeh app kya karta hai", "What this app does")}</div><h2>${L("Teen unit, ek hisaab", "Three units, one set of books")}</h2>
   <p style="max-width:66ch">${L("MK Plastics ki teeno units (Moulding, Pearl, Metalizing) aur bahar ke karigar ka saara maal aur paisa ek jagah. Har kilo toul ke entry hota hai, maal ek unit se doosri unit jaate hi stock apne aap badalta hai, aur Admin ko har stage ka hisaab live dikhta hai.", "All the material and money across MK Plastics' three units (Moulding, Pearl, Metalizing) and outside karigars, in one place. Every kilo is weighed and entered, stock moves automatically from unit to unit, and the Admin sees every stage live.")}</p></div><div class="hero-illo">${illo("coat", L("Coating drum", "Coating drum"))}</div></div></section>
  <div class="grid-2">
   <section class="card gsec"><h3>${L("Login kaise karein", "How to log in")}</h3><ol class="steps">
    ${gli("Mobile number daalo", "Enter your mobile number", "Wahi number jo Admin ne Team mein joda hai.", "The number the Admin added in Team.")}
    ${gli("4 ank ka PIN daalo", "Enter your 4-digit PIN", "Keypad par. Har role ka PIN alag.", "On the keypad. Everyone has their own PIN.")}
    ${gli("Phone yaad rakhta hai", "The phone remembers you", 'Agli baar sirf PIN. Doosre ka phone ho toh "Doosra number".', 'Next time, just the PIN. On someone else\'s phone, use "Use another number".')}
    ${gli("5 baar galat PIN = lock", "5 wrong PINs = locked", 'Admin Team mein "PIN reset" karke naya PIN dega.', 'The Admin gives a new PIN via "Reset PIN" in Team.')}
    ${gli("PIN kisi ko mat batao", "Never share your PIN", "Har entry aapke naam se record hoti hai.", "Every entry is recorded under your name.")}</ol></section>
   <section class="card gsec"><h3>${L("5 sunehre niyam", "5 golden rules")}</h3><ol class="steps">
    ${gli("Har maal toul ke daalo", "Weigh everything", "Andaaze se nahi. Taraazu ki photo bhi le sakte ho.", "No guessing. You can add a photo of the scale.")}
    ${gli("Bhejne wala aur lene wala dono toulte hain", "Sender and receiver both weigh", "Farak usi din pakda jaata hai.", "Gaps are caught the same day.")}
    ${gli("Staff likhe, Admin approve kare", "Staff enter, the Admin approves", "Approve hone tak entry stock mein nahi judti.", "An entry only counts in stock after approval.")}
    ${gli("Delete nahi, sirf reverse", "Never delete, only reverse", "Galat entry ka ulta record banta hai, reason ke saath.", "A wrong entry gets an opposite entry with a reason.")}
    ${gli("Shaam tak approval khaali", "Clear approvals by evening", "Koi entry raat bhar approval mein na atke, taaki stock hamesha sahi rahe.", "No entry waits overnight, so stock is always right.")}</ol></section></div>
  <section class="card gsec"><h3>${L("Kis role ko kya dikhega", "What each role sees")}</h3><div class="grid-3">
   ${roleBox("admin", "Admin", [L("Home: maal ka safar + alerts", "Home: material journey + alerts"), L("Production (approval), Maal, Karigar, Dispatch", "Production (approvals), Material, Karigar, Dispatch"), "Orders, Stock, Products", L("Khaata, Kharcha", "Accounts, Expenses"), L("Reports, Record, Team, Guide", "Reports, Activity, Team, Guide")])}
   ${roleBox("staff", "Staff", [L("Ek hi screen, 4 bade button", "One screen, 4 big buttons"), "Shift Shuru · Entry Daalo", L("Machine Ruki · Shift Khatam", "Machine stopped · End shift"), L("Aaj ki apni entries", "My entries today")])}</div></section>
  <section class="card gsec"><h3>${L("Upar ke nishaan", "Status badges")}</h3><div class="list">
   <div class="toolbar" style="justify-content:flex-start"><span class="pill ok">${ic("wifi", 14)} Online</span><span class="muted" style="font-size:13.5px">${L("Sab theek, entry turant jaati hai.", "All good, entries send straight away.")}</span></div>
   <div class="toolbar" style="justify-content:flex-start"><span class="pill warn">${ic("wifioff", 14)} Offline · 2 ${L("entry baaki", "pending")}</span><span class="muted" style="font-size:13.5px">${L("Net nahi hai. Entry phone mein save hai, net aate hi jaayegi.", "No internet. Entries are saved on the phone and send when it's back.")}</span></div>
   <div class="toolbar" style="justify-content:flex-start"><span class="badge" style="margin:0">3</span><span class="muted" style="font-size:13.5px">${L("Menu par number = itna kaam baaki hai.", "A number on a menu item = that much work waiting.")}</span></div>
   <div class="toolbar" style="justify-content:flex-start"><span class="pill warn">${L("Approval baaki", "Awaiting approval")}</span><span class="pill ok">Approved</span><span class="pill bad">${L("Wapas aaya", "Sent back")}</span><span class="muted" style="font-size:13.5px">${L("Entry ki haalat", "Entry status")}</span></div></div></section>
  <section class="card gsec"><h3>${L("Aksar pooche jaane wale sawal", "Common questions")}</h3><div class="faq">
   ${[
     [
       "Internet chala gaya toh entry ka kya hoga?",
       "What happens to entries if the internet goes?",
       'Entry phone mein save rehti hai aur upar "Offline" dikhta hai. Net aate hi apne aap chali jaati hai. Koi entry nahi khoti.',
       'Entries stay saved on the phone and "Offline" shows at the top. They send on their own when the net returns. Nothing is lost.',
     ],
     [
       "Galat entry daal di, ab?",
       "I entered something wrong. Now what?",
       '15 minute ke andar staff khud "Sudharo" kar sakta hai. Uske baad Admin "Wapas bhejo" karega. Approve ho chuki entry ko sirf Admin reverse karta hai.',
       'Staff can "Fix" it within 15 minutes. After that, the Admin sends it back. Once approved, only the Admin can reverse it.',
     ],
     [
       "Staff ko rate kyun nahi dikhta?",
       "Why can't staff see rates?",
       "Owner ne yahi chaha hai: rate, bill, payment aur profit sirf Admin ke paas. Staff sirf apni machine ki entry karta hai.",
       "That is the owner's choice: rates, bills, payments and profit stay with the Admin. Staff only enter their own machine's production.",
     ],
     [
       "Bunch aur kg ka hisaab kaise hota hai?",
       "How do bunches and kg relate?",
       'Har product ka "kg per bunch" Admin Products mein set karta hai. Karigar ka baaki isi se nikalta hai. Prototype mein 0.5 kg sample hai.',
       'The Admin sets "kg per bunch" for each product under Products. Karigar balances are worked out from it. The prototype uses a sample 0.5 kg.',
     ],
     [
       "Rate badla toh purane bill ka kya?",
       "If a rate changes, what about old bills?",
       "Purane bill purane rate par hi rehte hain. Naya rate sirf naye order par lagta hai.",
       "Old bills keep their old rate. The new rate applies to new orders only.",
     ],
   ]
     .map(
       ([h, e, a, b]) =>
         `<details><summary>${L(h, e)}</summary><p>${L(a, b)}</p></details>`,
     )
     .join("")}</div></section>`;
}
const JOURNEY = [
  [
    ["Raw material aata hai", "Raw material arrives"],
    [
      "Inward, bill ki photo ke saath. Rate baad mein Admin bharta hai.",
      "Inward with a bill photo. The Admin adds the rate later.",
    ],
    ["manager", "admin"],
    "Maal → Inward",
  ],
  [
    ["Moulding mein beads bante hain", "Beads are moulded"],
    [
      "Staff har batch toul ke entry karta hai: GPPS lagaya, achha maal, waste.",
      "Staff enter each weighed batch: GPPS used, good beads, waste.",
    ],
    ["staff"],
    "Entry Daalo",
  ],
  [
    ["Manager approve karta hai", "The manager approves"],
    [
      "Approve par GPPS ghatta hai aur plain beads badhte hain.",
      "On approval GPPS goes down and plain beads go up.",
    ],
    ["manager"],
    "Approve",
  ],
  [
    [
      "Plain beads Pearl / Metalizing jaate hain",
      "Plain beads go to Pearl / Metalizing",
    ],
    [
      'Moulding Manager bhejta hai, lene wala toul ke "Maal Mila" karta hai.',
      "The Moulding Manager sends; the receiver weighs and confirms.",
    ],
    ["manager"],
    "Maal → Bhejo / Aane wala",
  ],
  [
    ["Coating hoti hai", "Beads are coated"],
    [
      "Staff batch entry karta hai, Manager approve. Coating material apne aap ghatta hai.",
      "Staff log the batch, the manager approves. Coating materials are deducted automatically.",
    ],
    ["staff", "manager"],
    "Entry Daalo · Approve",
  ],
  [
    ["Threading karigar ke paas", "Threading at the karigar"],
    [
      "Manager kg mein bhejta hai, karigar bunch mein lautata hai.",
      "The manager sends kg; the karigar returns bunches.",
    ],
    ["manager"],
    "Karigar",
  ],
  [
    ["Order aur dispatch", "Order and dispatch"],
    [
      "Admin order leta hai. Stock ho toh unit ki Dispatch list mein jaata hai.",
      "The Admin takes the order. If in stock, it goes to the unit's dispatch list.",
    ],
    ["admin", "manager"],
    "Orders · Dispatch",
  ],
  [
    ["Bill aur payment", "Bill and payment"],
    [
      "Admin GST ya kachcha bill banata hai aur payment jama karta hai.",
      "The Admin makes a GST or kachcha bill and records the payment.",
    ],
    ["admin"],
    "Orders · Khaata",
  ],
];
const RHYTHM = [
  [
    ["Subah 8:00", "8:00 am"],
    ["Shift Shuru", "Start shift"],
    ["Machines aur raw material dekho", "Check machines and raw material"],
    ["–", "–"],
  ],
  [
    ["Subah 9:00", "9:00 am"],
    ["Pehli batch ki entry", "First batch entry"],
    ["Inward, aane wala maal confirm", "Inward, confirm incoming material"],
    ["Home: maal ka safar, alerts", "Home: material journey, alerts"],
  ],
  [
    ["Din bhar", "During the day"],
    [
      "Har batch ki entry. Machine ruke toh reason.",
      "An entry per batch. Reason when the machine stops.",
    ],
    ["Approve, karigar, dispatch", "Approvals, karigars, dispatch"],
    [
      "Order, bill, payment, inward rate",
      "Orders, bills, payments, inward rates",
    ],
  ],
  [
    ["Shaam 7:30", "7:30 pm"],
    ["Shift Khatam", "End shift"],
    ["Din band karo", "Close the day"],
    ["Teeno unit ka din band dekho", "Review all three day-closes"],
  ],
  [
    ["Har hafte", "Weekly"],
    ["–", "–"],
    ["Physical stock ginti", "Physical stock count"],
    [
      "Karigar pending, baaki rakam, stock farak",
      "Karigar balances, receivables, stock gaps",
    ],
  ],
];
const STORY = [
  [
    "a",
    ["Order banaya", "Order created"],
    [
      '120 bunch 8MM Round Red. App: 40 hai, 80 kam. "Maal ka intezaar".',
      '120 bunches 8MM Round Red. App: 40 in stock, 80 short. "Waiting for stock".',
    ],
    "Admin",
  ],
  [
    "m",
    ["GPPS inward", "GPPS inward"],
    [
      "500 kg GPPS Crylo aaya, bill photo ke saath.",
      "500 kg GPPS Crylo arrives with the bill photo.",
    ],
    "Moulding Manager",
  ],
  [
    "s",
    ["Moulding entry", "Moulding entry"],
    [
      "M2: 192 kg GPPS → 180 kg achha, 12 kg waste.",
      "M2: 192 kg GPPS → 180 kg good, 12 kg waste.",
    ],
    "Staff · M2",
  ],
  [
    "m",
    ["Approve aur bheja", "Approved and sent"],
    [
      "150 kg plain beads Pearl unit ko.",
      "150 kg plain beads to the Pearl unit.",
    ],
    "Moulding Manager",
  ],
  [
    "m",
    ["Maal Mila", "Received"],
    ["Toul ke 150 kg confirm.", "Weighed and confirmed 150 kg."],
    "Pearl Manager",
  ],
  [
    "s",
    ["Pearl batch", "Pearl batch"],
    [
      "P1: 150 kg → 145 kg Red pearl, 5 kg reject.",
      "P1: 150 kg → 145 kg red pearl, 5 kg reject.",
    ],
    "Staff · P1",
  ],
  [
    "m",
    ["Karigar ko bheja", "Sent to karigar"],
    [
      "145 kg Salim bhai ko, slip WhatsApp par.",
      "145 kg to Salim bhai, slip on WhatsApp.",
    ],
    "Pearl Manager",
  ],
  [
    "m",
    ["Karigar se wapas", "Back from karigar"],
    [
      "90 bunch wapas. Taiyaar: 130 bunch.",
      "90 bunches back. Finished: 130 bunches.",
    ],
    "Pearl Manager",
  ],
  [
    "a",
    ["Order Ready", "Order ready"],
    [
      "App ne alert diya, order dispatch list mein.",
      "The app alerts; the order moves to the dispatch list.",
    ],
    "Admin",
  ],
  [
    "m",
    ["Dispatch", "Dispatch"],
    ["120 bunch, gaadi no. aur photo.", "120 bunches, vehicle no. and photo."],
    "Pearl Manager",
  ],
  [
    "a",
    ["GST bill", "GST bill"],
    [
      "Bill bana, WhatsApp par party ko.",
      "Bill made and sent to the party on WhatsApp.",
    ],
    "Admin",
  ],
  [
    "a",
    ["Do payment", "Two payments"],
    [
      "Aadha UPI, aadha cheque. Baaki ₹0.",
      "Half by UPI, half by cheque. Balance ₹0.",
    ],
    "Admin",
  ],
];
function gWorkflow() {
  return `<section class="card gsec"><h3>${L("Maal ka safar, step by step", "The material journey, step by step")}</h3><p>${L("Har tir ek entry hai. Kaun karta hai aur kis screen par, dono likha hai.", "Each arrow is an entry. It says who does it and on which screen.")}</p>
   <div class="procs">${JOURNEY.map(([t, d, r, sc], i) => `<article class="proc">${illo(JIL[i], P(t))}<div class="proc-b"><div class="toolbar"><span class="pnum">${String(i + 1).padStart(2, "0")}</span><div class="btns">${r.map(rchip).join("")}</div></div><h4>${P(t)}</h4><p>${P(d)}</p><span class="pill mute" style="justify-self:start">${sc}</span></div></article>`).join("")}</div></section>
  <section class="card gsec"><h3>${L("Roz ka rhythm", "The daily rhythm")}</h3><div class="tw"><table><thead><tr><th>${L("Kab", "When")}</th><th>Staff</th><th>Unit Manager</th><th>Admin</th></tr></thead><tbody>${RHYTHM.map((r) => `<tr><td style="white-space:nowrap"><b>${P(r[0])}</b></td><td>${P(r[1])}</td><td>${P(r[2])}</td><td>${P(r[3])}</td></tr>`).join("")}</tbody></table></div></section>
  <section class="card gsec"><h3>${L("Ek order ki kahani", "One order, start to finish")}</h3><p>${L('Example party "Shree Ganesh Garments" ka order, teeno roles ke saath.', 'An example order from "Shree Ganesh Garments", across all three roles.')}</p>
   <div class="lanes"><div class="lane-h uchip k" style="display:block">Admin</div><div class="lane-h uchip p" style="display:block">Unit Manager</div><div class="lane-h uchip m" style="display:block">Staff</div>
   ${STORY.map(([l, t, d, w], i) => `<div class="ev ${l}"><span class="n"><i></i>${i + 1}<span class="whom"> · ${w}</span></span><b>${P(t)}</b><span>${P(d)}</span></div>`).join("")}</div></section>`;
}
const UCS = [
  {
    id: "UC-01",
    r: ["manager", "admin"],
    t: ["Raw material inward", "Raw material inward"],
    k: ["Supplier ka maal gate par aaye", "Supplier goods arrive at the gate"],
    s: [
      ['Maal → Inward → "+ Inward"', 'Material → Inward → "+ Inward"'],
      [
        "Supplier, material, kitna aaya, bill no.",
        "Supplier, material, quantity, bill no.",
      ],
      ["Bill ki photo lo, Save", "Photo of the bill, Save"],
      [
        "Admin: Khaata → Inward rate → rate bharo",
        "Admin: Accounts → Inward rates → add the rate",
      ],
    ],
    o: [
      "Stock turant badhta hai. Rate sirf Admin bharta hai.",
      "Stock rises at once. Only the Admin enters the rate.",
    ],
    u: "mgrM",
    v: "maal",
    tk: "maalTab",
    tv: "inward",
  },
  {
    id: "UC-02",
    r: ["staff"],
    t: ["Moulding production entry", "Moulding production entry"],
    k: [
      "Har batch toul ke pack hone ke baad",
      "After each batch is weighed and packed",
    ],
    s: [
      ['"Entry Daalo"', '"Add entry"'],
      ["Plain bead chuno", "Pick the plain bead"],
      [
        "GPPS lagaya, achha maal, waste (kg)",
        "GPPS used, good beads, waste (kg)",
      ],
      ["Yield dekho, Save", "Check the yield, Save"],
    ],
    o: [
      'Entry "Approval baaki" mein manager ke paas jaati hai.',
      'The entry goes to the manager as "Awaiting approval".',
    ],
    u: "stM2",
    v: "home",
  },
  {
    id: "UC-03",
    r: ["manager"],
    t: ["Entry approve ya wapas bhejna", "Approve or send back an entry"],
    k: ["Staff ki entry aaye", "A staff entry comes in"],
    s: [
      ["Approve kholo", "Open Approve"],
      ["Kg aur yield check karo", "Check kg and yield"],
      ["Sahi hai toh Approve", "If correct, Approve"],
      [
        'Galat hai toh "Wapas bhejo" + note',
        'If wrong, "Send back" with a note',
      ],
    ],
    o: [
      "Approve par GPPS ghatta, plain beads badhte. Wapas bheji entry staff sudharta hai.",
      "On approval GPPS goes down and plain beads go up. Sent-back entries are fixed by the staff.",
    ],
    u: "mgrM",
    v: "approve",
  },
  {
    id: "UC-04",
    r: ["manager"],
    t: [
      "Plain beads doosri unit ko bhejna",
      "Send plain beads to another unit",
    ],
    k: [
      "Pearl ya Metalizing ko maal chahiye",
      "Pearl or Metalizing needs beads",
    ],
    s: [
      ['Maal → "Maal bhejo"', 'Material → "Send material"'],
      ["Pearl ya Metalizing chuno", "Choose Pearl or Metalizing"],
      ["Bead aur kg, Bhejo", "Bead and kg, Send"],
    ],
    o: [
      'Maal "raste mein" dikhta hai jab tak lene wala confirm na kare.',
      'It shows "in transit" until the receiver confirms.',
    ],
    u: "mgrM",
    v: "maal",
    tk: "maalTab",
    tv: "in",
  },
  {
    id: "UC-05",
    r: ["manager"],
    t: ["Maal Mila: toul ke confirm", "Receive: weigh and confirm"],
    k: ["Moulding se maal pahunche", "A load arrives from Moulding"],
    s: [
      ["Maal → Aane wala", "Material → Incoming"],
      ["Toul ke asli kg daalo", "Weigh and enter the actual kg"],
      ['"Maal Mila"', '"Received"'],
    ],
    o: [
      "Stock judta hai. Farak ho toh Admin ko lal alert.",
      "Stock is added. Any gap raises a red alert for the Admin.",
    ],
    u: "mgrP",
    v: "maal",
    tk: "maalTab",
    tv: "in",
  },
  {
    id: "UC-06",
    r: ["staff"],
    t: ["Pearl / Metalizing batch", "Pearl / Metalizing batch"],
    k: ["Coating batch nikle", "A coating batch is done"],
    s: [
      ['"Entry Daalo"', '"Add entry"'],
      ["Photo dekh ke product chuno", "Pick the product by photo"],
      ["Plain lagaya, taiyaar kg, reject", "Plain used, finished kg, reject"],
      ["Save", "Save"],
    ],
    o: [
      "Approve ke baad coated stock badhta hai. Essence, lacquer apne aap ghatte hain.",
      "After approval coated stock rises. Essence and lacquer are deducted automatically.",
    ],
    u: "stP1",
    v: "home",
  },
  {
    id: "UC-07",
    r: ["manager"],
    t: [
      "Karigar ko threading ke liye bhejna",
      "Send to a karigar for threading",
    ],
    k: ["Coated maal pirona hai", "Coated beads need threading"],
    s: [
      ['Karigar → "Karigar ko bhejo"', 'Karigar → "Send to karigar"'],
      ["Karigar, product, kg", "Karigar, product, kg"],
      ["Slip banao", "Make the slip"],
    ],
    o: [
      "Karigar ke khaate mein kg baaki, din ginne lagte hain.",
      "The karigar's kg balance shows and the days start counting.",
    ],
    u: "mgrP",
    v: "karigar",
  },
  {
    id: "UC-08",
    r: ["manager"],
    t: ["Karigar se wapas lena", "Receive from a karigar"],
    k: ["Karigar bunch lekar aaye", "The karigar brings bunches"],
    s: [
      ['Job par "Wapas lo"', '"Receive" on the job'],
      ["Bunch, loose kg, wastage kg", "Bunches, loose kg, wastage kg"],
      ["Thoda thoda bhi le sakte ho", "Partial returns are fine"],
    ],
    o: [
      "Bunch taiyaar maal mein judte hain. 15 din se zyada = lal alert.",
      "Bunches join finished stock. Over 15 days turns red.",
    ],
    u: "mgrP",
    v: "karigar",
  },
  {
    id: "UC-09",
    r: ["admin"],
    t: ["Naya order", "New order"],
    k: ["Party ka phone ya WhatsApp", "A party calls or messages"],
    s: [
      ['"+ Naya order"', '"+ New order"'],
      ["Party, product, qty, tay rate", "Party, product, qty, agreed rate"],
      [
        "Stock aur credit limit apne aap check",
        "Stock and credit limit checked automatically",
      ],
      ["Save", "Save"],
    ],
    o: [
      'Stock hai toh unit ki Dispatch list. Kam hai toh "Maal ka intezaar".',
      'In stock: the unit\'s dispatch list. Short: "Waiting for stock".',
    ],
    u: "admin",
    v: "orders",
  },
  {
    id: "UC-10",
    r: ["manager"],
    t: ["Dispatch (aadha bhi)", "Dispatch (partial too)"],
    k: ["Order ready ho", "An order is ready"],
    s: [
      ['Dispatch → order → "Dispatch"', 'Dispatch → order → "Dispatch"'],
      ["Kitna, gaadi no., photo", "Quantity, vehicle no., photo"],
      ['"Dispatch ho gaya"', '"Mark dispatched"'],
    ],
    o: [
      'Stock ghatta hai, Admin ko "Bill banana baaki" dikhta hai.',
      'Stock goes down and the Admin sees "Waiting to be billed".',
    ],
    u: "mgrP",
    v: "dispatch",
  },
  {
    id: "UC-11",
    r: ["admin"],
    t: ["Bill banana (GST ya kachcha)", "Make a bill (GST or kachcha)"],
    k: ["Maal dispatch ho chuka", "Goods are dispatched"],
    s: [
      ['Orders → "Bill banao"', 'Orders → "Make bill"'],
      ["GST ya Kachcha", "GST or Kachcha"],
      ["Bill, WhatsApp", "Bill, WhatsApp"],
    ],
    o: [
      "Maharashtra = CGST + SGST, bahar = IGST, apne aap.",
      "Maharashtra gets CGST + SGST, others IGST, automatically.",
    ],
    u: "admin",
    v: "orders",
  },
  {
    id: "UC-12",
    r: ["admin"],
    t: ["Payment jama", "Record a payment"],
    k: ["Party paisa bheje", "A party pays"],
    s: [
      ['Khaata → "+ Payment"', 'Accounts → "+ Payment"'],
      ["Party, rakam, mode, ref", "Party, amount, mode, reference"],
      ["Kaunse bill clear honge, dekho", "See which bills it clears"],
      ["Save", "Save"],
    ],
    o: [
      "Paisa sabse purane bill se judta hai.",
      "Money settles the oldest bill first.",
    ],
    u: "admin",
    v: "khaata",
  },
  {
    id: "UC-13",
    r: ["staff"],
    t: ["Machine ruk gayi", "The machine stops"],
    k: [
      "Bijli, mould change, repair, maal khatam",
      "Power cut, mould change, repair, no material",
    ],
    s: [
      ['"Machine Ruki" → reason', '"Machine stopped" → reason'],
      [
        'Chalu hone par "Machine Chalu"',
        'When running, "Machine running again"',
      ],
    ],
    o: [
      "Downtime minute mein record. Manager aur Admin ko haalat dikhti hai.",
      "Downtime is recorded in minutes. Manager and Admin see the status.",
    ],
    u: "stZ1",
    v: "home",
  },
  {
    id: "UC-14",
    r: ["staff"],
    t: ["Internet nahi hai", "No internet"],
    k: ["Factory mein net chala jaaye", "The factory loses internet"],
    s: [
      ['Upar "Offline" dikhega', '"Offline" shows at the top'],
      ["Entry normal daalo", "Add entries as usual"],
      ["Net aate hi apne aap sync", "They sync when the net is back"],
    ],
    o: [
      'Koi entry nahi khoti. Demo mein upar "Online" dabake try karo.',
      'Nothing is lost. In the demo, tap "Online" at the top to try it.',
    ],
    u: "stP1",
    v: "home",
  },
  {
    id: "UC-15",
    r: ["manager"],
    t: ["Din band karna", "Close the day"],
    k: ["Shaam ko", "In the evening"],
    s: [
      ['Home → "Din band karo"', 'Home → "Close the day"'],
      ["Summary check", "Check the summary"],
      ["Pending entry pehle approve", "Approve pending entries first"],
      ["Admin ko bhejo", "Send to the Admin"],
    ],
    o: [
      "Admin ke Home par unit ke aage ✓.",
      "A ✓ appears next to the unit on the Admin home.",
    ],
    u: "mgrZ",
    v: "home",
  },
  {
    id: "UC-16",
    r: ["admin"],
    t: ["Stock ka farak dhundhna", "Trace a stock gap"],
    k: ["Home par lal alert", "A red alert on Home"],
    s: [
      ["Alert par tap", "Tap the alert"],
      ["Stock mein stage dekho", "See the stage in Stock"],
      ["Record mein kisne, kab, kya", "Check who, when, what in Activity"],
    ],
    o: [
      "Har badlav ka record. Delete nahi, sirf reverse.",
      "Every change is recorded. Nothing deleted, only reversed.",
    ],
    u: "admin",
    v: "log",
  },
  {
    id: "UC-17",
    r: ["admin"],
    t: ["Kharcha likhna", "Record an expense"],
    k: ["Bijli bill, salary, repair", "Electricity, salary, repair"],
    s: [
      ['Kharcha → "+ Kharcha"', 'Expenses → "+ Expense"'],
      ["Category, unit, rakam", "Category, unit, amount"],
    ],
    o: [
      "Har unit ka asli kharcha alag dikhta hai.",
      "Each unit's real cost shows separately.",
    ],
    u: "admin",
    v: "kharcha",
  },
  {
    id: "UC-18",
    r: ["admin"],
    t: ["Naya staff / PIN bhool gaya", "New staff / forgotten PIN"],
    k: [
      "Naya operator aaye ya koi PIN bhoole",
      "A new operator joins or forgets a PIN",
    ],
    s: [
      ['Team → "+ Naya user"', 'Team → "+ New user"'],
      [
        "Naam, mobile, role, unit, machine",
        "Name, mobile, role, unit, machine",
      ],
      ['PIN bhoole toh "PIN reset"', 'Forgotten PIN: "Reset PIN"'],
      ["Naya PIN user ko batao", "Give the user the new PIN"],
    ],
    o: [
      "User usi din apne phone se login kar sakta hai.",
      "The user can log in from their own phone the same day.",
    ],
    u: "admin",
    v: "team",
  },
];
function gUC() {
  const f = S.ui.ucRole || "all",
    list = UCS.filter((u) => f === "all" || u.r.includes(f));
  return `<section class="card gsec"><h3>${L("Use cases", "Use cases")} · ${list.length}</h3><p>${L('Har kaam: kab hota hai, kaun karta hai, kaunse steps, aur nateeja. "Demo mein kholo" se seedha us screen par pahunchoge.', 'Each task: when it happens, who does it, the steps and the result. "Open in demo" jumps straight to that screen.')}</p>
   <div class="chips">${[
     ["all", L("Sab", "All")],
     ["admin", "Admin"],
     ["staff", "Staff"],
   ]
     .map(
       ([k, l]) =>
         `<button type="button" class="chip" data-a="ui" data-k="ucRole" data-val="${k}" aria-pressed="${f === k}">${l}</button>`,
     )
     .join("")}</div></section>
  <div class="ucgrid">${list
    .map(
      (
        u,
      ) => `<article class="uc">${illo(UCIL[u.id], P(u.t))}<div class="toolbar"><span class="id">${u.id}</span><div class="btns">${u.r.map(rchip).join("")}</div></div><h4>${P(u.t)}</h4><div class="when">${ic("clock", 14)} ${L("Kab", "When")}: ${P(u.k)}</div>
   <ol class="steps">${u.s.map((s) => `<li><div><span style="color:var(--ink)">${P(s)}</span></div></li>`).join("")}</ol>
   <div class="note ok">${ic("check", 16)}<span>${P(u.o)}</span></div>
   <button type="button" class="btn sm" data-a="tryUC" data-id="${u.id}" style="justify-self:start">${ic("play", 14)} ${L("Demo mein kholo", "Open in demo")}</button></article>`,
    )
    .join("")}</div>`;
}
const ROLES = [
  {
    r: "admin",
    n: ["Admin (Owner)", "Admin (Owner)"],
    who: [
      "Malik. Zarurat ho toh ek se zyada Admin (partner ya accountant).",
      "The owner. More than one Admin is possible (a partner or accountant).",
    ],
    daily: [
      [
        "Subah Home par maal ka safar aur alerts",
        "Check the material journey and alerts each morning",
      ],
      [
        "Order lena: party, rate, delivery date",
        "Take orders: party, rate, delivery date",
      ],
      [
        "Dispatch ke baad bill banana aur bhejna",
        "Bill dispatched goods and send the bill",
      ],
      ["Payment jama karna", "Record payments"],
      ["Inward ka rate bharna", "Add rates to inwards"],
      ["Shaam ko teeno unit ka din band dekhna", "Review the three day-closes"],
    ],
    period: [
      [
        "Hafte mein: karigar pending, baaki rakam, stock farak",
        "Weekly: karigar balances, receivables, stock gaps",
      ],
      [
        "Mahine mein: kharcha, unit-wise production, yield",
        "Monthly: expenses, unit production, yield",
      ],
      ["Rate list aur kg/bunch", "Rate list and kg per bunch"],
      ["Users, PIN aur credit limit", "Users, PINs and credit limits"],
    ],
    acc: [
      ["Rate, bill aur paisa sahi ho", "Rates, bills and money are right"],
      ["Credit limit ka faisla", "Credit limit decisions"],
      [
        "Stock adjust / reverse ka aakhri faisla",
        "The final say on adjustments and reversals",
      ],
    ],
    sc: [
      "Home, Orders, Stock, Products, Production, Karigar, Khaata, Kharcha, Record, Team",
      "Home, Orders, Stock, Products, Production, Karigar, Accounts, Expenses, Activity, Team",
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
    r: "manager",
    n: ["Unit Manager", "Unit Manager"],
    who: [
      "Har unit ka ek: Moulding, Pearl, Metalizing. Sirf apni unit dikhti hai.",
      "One per unit: Moulding, Pearl, Metalizing. Sees only their own unit.",
    ],
    daily: [
      [
        "Subah machines aur raw material check",
        "Check machines and raw material each morning",
      ],
      [
        "Raw material inward (bina rate) + bill photo",
        "Raw material inward (no rate) with a bill photo",
      ],
      [
        "Staff ki entry usi din approve ya wapas",
        "Approve or send back staff entries the same day",
      ],
      [
        'Aane wala maal toul ke "Maal Mila"',
        "Weigh and confirm incoming material",
      ],
      [
        "Karigar bhejo / wapas lo (Pearl, Metalizing)",
        "Send to / receive from karigars (Pearl, Metalizing)",
      ],
      ["Admin ke order ka dispatch", "Dispatch the Admin's orders"],
      ['Shaam ko "Din band karo"', "Close the day each evening"],
    ],
    period: [
      ["Hafte mein physical stock ginti", "Weekly physical stock count"],
      [
        "15 din se purane karigar job ka follow-up",
        "Follow up karigar jobs older than 15 days",
      ],
      [
        "Raw material kam ho toh Admin ko batana",
        "Tell the Admin when raw material runs low",
      ],
    ],
    acc: [
      ["Unit ka stock app se match kare", "The unit's stock matches the app"],
      [
        "Koi entry raat bhar approval mein na atke",
        "No entry waits overnight for approval",
      ],
      ["Bheja-mila farak ka jawab", "Explaining any sent-vs-received gap"],
    ],
    sc: [
      "Home, Approve, Maal, Karigar (Pearl/Metalizing), Dispatch, Guide",
      "Home, Approve, Material, Karigar (Pearl/Metalizing), Dispatch, Guide",
    ],
    no: [
      ["Rate, price, bill ki rakam", "Rates, prices, bill amounts"],
      ["Payment, kharcha, profit", "Payments, expenses, profit"],
      ["Doosri unit ka data", "Other units' data"],
    ],
  },
  {
    r: "staff",
    n: ["Staff (Machine operator)", "Staff (Machine operator)"],
    who: [
      "Har machine ka operator: Moulding M1–M4, Pearl P1–P2, Metalizing MZ1.",
      "The operator of each machine: Moulding M1–M4, Pearl P1–P2, Metalizing MZ1.",
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
        "Machine ruke toh turant reason",
        "Log the reason as soon as the machine stops",
      ],
      ['Shift ke end mein "Shift Khatam"', '"End shift" at the end'],
    ],
    period: [
      [
        "Manager ne wapas bheji entry sudharna",
        "Fix entries the manager sends back",
      ],
    ],
    acc: [
      ["Sahi weight, andaaza nahi", "Correct weights, never guesses"],
      ["Downtime ka sahi reason", "The right downtime reason"],
      ["Apna PIN kisi ko na dena", "Not sharing their PIN"],
    ],
    sc: [
      "Ek screen: Shift Shuru, Entry Daalo, Machine Ruki, Shift Khatam, Madad",
      "One screen: Start shift, Add entry, Machine stopped, End shift, Help",
    ],
    no: [
      ["Rate, bill, payment", "Rates, bills, payments"],
      ["Doosri machine aur unit ka stock", "Other machines and unit stock"],
      [
        "15 minute baad purani entry badalna",
        "Editing an entry after 15 minutes",
      ],
    ],
  },
];
const PERMS = [
  [
    ["Machine production entry", "Machine production entry"],
    "y",
    "y:apni unit|own unit",
    "y:apni machine|own machine",
  ],
  [["Entry approve / wapas", "Approve / send back entries"], "y", "y", "x"],
  [
    ["Raw material inward", "Raw material inward"],
    "y:rate ke saath|with rate",
    "p:bina rate|no rate",
    "x",
  ],
  [
    ["Unit se unit maal bhejna / lena", "Send / receive between units"],
    "y",
    "y",
    "x",
  ],
  [
    ["Karigar bhejo / wapas lo", "Karigar send / receive"],
    "y",
    "y:Pearl, Metalizing|Pearl, Metalizing",
    "x",
  ],
  [["Dispatch", "Dispatch"], "y", "y", "x"],
  [
    ["Order, rate, bill, payment", "Orders, rates, bills, payments"],
    "y",
    "x",
    "x",
  ],
  [["Kharcha aur profit", "Expenses and profit"], "y", "x", "x"],
  [
    ["Stock adjust / reverse", "Stock adjust / reverse"],
    "y",
    "p:request|request",
    "x",
  ],
  [
    ["Entry sudharna", "Edit an entry"],
    "y:kabhi bhi, log ke saath|any time, logged",
    "p:approve se pehle|before approval",
    "p:15 min tak|within 15 min",
  ],
  [["Users, PIN, settings", "Users, PINs, settings"], "y", "x", "x"],
];
function permCell(c) {
  const [k, t] = c.split(":");
  const lab = t ? L(t.split("|")[0], t.split("|")[1]) : "";
  return k === "y"
    ? `<td class="c y">✓${lab ? " " + lab : ""}</td>`
    : k === "p"
      ? `<td class="c pp">${lab}</td>`
      : `<td class="c x">–</td>`;
}
function gRoles() {
  const node = (cls, b, s) =>
    `<div class="node ${cls}"><b>${b}</b><small>${s}</small></div>`;
  const ulist = (a, cls = "") =>
    `<ul class="${cls}">${a.map((x) => `<li>${P(x)}</li>`).join("")}</ul>`;
  return `<section class="card gsec"><h3>${L("Kaun kiske neeche", "Who reports to whom")}</h3><div class="treewrap"><div class="tree">
   ${node("top", "Admin · Owner", L("Saari units, paisa, users", "All units, money, users"))}<div class="vline"></div>
   <div class="tier">${["M", "P", "Z"].map((k) => `<div class="branch">${node(UNITS[k].cls, UNITS[k].n + " Manager", L("Apni unit", "Own unit"))}<div class="staffs">${UNITS[k].machines.map((m) => `<span class="schip">Staff · ${m}</span>`).join("")}</div></div>`).join("")}
   <div class="kar-band">${ic("thread", 14)} ${L("Karigar (bahar ke, login nahi). Pearl aur Metalizing Manager inka hisaab rakhte hain.", "Karigars (outside, no login). The Pearl and Metalizing managers keep their accounts.")}</div></div></div></div></section>
  <div class="rgrid">${ROLES.map(
    (
      R,
    ) => `<article class="rcard">${rchip(R.r)}<h4>${P(R.n)}</h4><p class="muted" style="font-size:13.5px">${P(R.who)}</p>
   <div><div class="lb">${L("Roz ki zimmedari", "Daily responsibilities")}</div>${ulist(R.daily)}</div>
   <div><div class="lb">${L("Hafte / mahine mein", "Weekly / monthly")}</div>${ulist(R.period)}</div>
   <div><div class="lb">${L("Kis cheez ka jawabdeh", "Accountable for")}</div>${ulist(R.acc, "acc")}</div>
   <div><div class="lb">${L("App mein screens", "Screens in the app")}</div><p style="font-size:13.5px;margin-top:4px">${P(R.sc)}</p></div>
   <div><div class="lb">${L("Nahi dikhta / nahi kar sakta", "Cannot see / cannot do")}</div>${ulist(R.no, "no")}</div></article>`,
  ).join("")}</div>
  <section class="card gsec"><h3>${L("Bahar ke log (login nahi)", "Outside people (no login)")}</h3><div class="grid-3">
   <div class="rolebox"><span class="uchip k">Karigar</span><ul><li>${L("Kg mein maal leta hai, bunch mein lautata hai", "Takes kg, returns bunches")}</li><li>${L("Slip WhatsApp par milti hai", "Gets the slip on WhatsApp")}</li><li>${L("Hisaab Pearl / Metalizing Manager rakhta hai", "The Pearl / Metalizing manager keeps the account")}</li></ul></div>
   <div class="rolebox"><span class="uchip p">Party · customer</span><ul><li>${L("Order phone ya WhatsApp par", "Orders by phone or WhatsApp")}</li><li>${L("Bill aur reminder WhatsApp par", "Bills and reminders on WhatsApp")}</li><li>${L("Sirf Admin se baat, credit limit Admin tay karta hai", "Deals only with the Admin, who sets the credit limit")}</li></ul></div>
   <div class="rolebox"><span class="uchip m">Supplier</span><ul><li>${L("GPPS, coating material, bags", "GPPS, coating materials, bags")}</li><li>${L("Manager inward karta hai", "The manager records the inward")}</li><li>${L("Rate aur payment Admin", "Rates and payments by the Admin")}</li></ul></div></div></section>
  <section class="card gsec"><h3>${L("Kaun kya kar sakta hai", "Who can do what")}</h3><div class="tw"><table><thead><tr><th>${L("Kaam", "Task")}</th><th class="c">Admin</th><th class="c">Unit Manager</th><th class="c">Staff</th></tr></thead><tbody>${PERMS.map((p) => `<tr><td>${P(p[0])}</td>${permCell(p[1])}${permCell(p[2])}${permCell(p[3])}</tr>`).join("")}</tbody></table></div>
   <p class="muted" style="font-size:12.5px">${L("✓ kar sakta hai · peela = shart ke saath · – nahi kar sakta", "✓ can · amber = with conditions · – cannot")}</p></section>`;
}

/* ---------- login/team/guide actions ---------- */
Object.assign(ICONS, {
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
  back: '<path d="M21 5H9l-6 7 6 7h12z"/><path d="m12 9 6 6M18 9l-6 6"/>',
  phone:
    '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
});
Object.assign(ACT, {
  logout() {
    S.user = null;
    S.view = "home";
    S.login = {
      step: S.lastUser ? "pin" : "phone",
      uid: S.lastUser,
      phone: "",
      pin: "",
      err: "",
    };
    setHash("");
    closeModal();
    render();
    scrollTo(0, 0);
  },
  nav(el) {
    S.view = el.dataset.v;
    if (el.dataset.tab) {
      if (S.view === "stock") S.ui.stockTab = el.dataset.tab;
      if (S.view === "khaata") S.ui.khaataTab = el.dataset.tab;
    }
    setHash(
      S.view === "guide"
        ? S.ui.guideTab === "start"
          ? "guide"
          : S.ui.guideTab
        : "",
    );
    closeModal();
    render();
    scrollTo(0, 0);
  },
  lgPick(el) {
    const u = S.users.find((x) => x.id === el.dataset.id);
    S.login = { step: "pin", uid: u.id, phone: u.mobile, pin: "", err: "" };
    render();
  },
  lgBack() {
    S.login = { step: "phone", phone: "", pin: "", err: "", uid: null };
    render();
    const i = document.getElementById("lgm");
    if (i) i.focus();
  },
  pinKey(el) {
    const lg = S.login;
    const k = el.dataset.k;
    if (k === "del") lg.pin = lg.pin.slice(0, -1);
    else if (lg.pin.length < 4) lg.pin += k;
    lg.err = "";
    if (lg.pin.length === 4) {
      render();
      setTimeout(tryPin, 160);
    } else render();
  },
  forgotPin() {
    const u = S.users.find((x) => x.id === S.login.uid);
    openModal(
      L("PIN bhool gaye?", "Forgot your PIN?"),
      "",
      `<ol class="steps">${gli("Admin (Owner) ko phone karo", "Call the Admin (Owner)", "", "")}${gli('Admin: Team → aapke naam par "PIN reset"', 'Admin: Team → "Reset PIN" on your name', "", "")}${gli("Naya PIN se yahan login karo", "Log in here with the new PIN", "", "")}</ol>${u && u.role === "admin" ? `<div class="note">${ic("phone", 16)}<span>${L("Admin ka PIN asli app mein registered mobile par OTP se reset hoga.", "In the real app, an Admin PIN is reset by OTP to the registered mobile.")}</span></div>` : ""}`,
      `<button type="button" class="btn pri" data-a="close">${L("Theek hai", "OK")}</button>`,
    );
  },
  gtab(el) {
    S.ui.guideTab = el.dataset.val;
    setHash(el.dataset.val === "start" ? "guide" : el.dataset.val);
    render();
  },
  guideBack() {
    S.view = "home";
    setHash("");
    render();
    scrollTo(0, 0);
  },
  tryUC(el) {
    const uc = UCS.find((x) => x.id === el.dataset.id),
      u = S.users.find((x) => x.id === uc.u);
    S.user = u.id;
    S.view = uc.v;
    if (uc.tk) S.ui[uc.tk] = uc.tv;
    setHash("");
    closeModal();
    render();
    scrollTo(0, 0);
    toast(
      L(
        `Demo: ${u.n} (${roleLabel(u)}) ke roop mein khola`,
        `Demo: opened as ${u.n} (${roleLabel(u)})`,
      ),
    );
  },
  addUser() {
    addUserModal();
  },
  pinReset(el) {
    pinResetModal(el.dataset.id);
  },
  pinResetGo(el) {
    const u = S.users.find((x) => x.id === el.dataset.id);
    u.pin = draft.pin;
    u.fails = 0;
    logA(`${u.n} ka PIN reset`, `Reset PIN for ${u.n}`);
    closeModal();
    render();
    toast(L(`${u.n} ka naya PIN set ho gaya.`, `New PIN set for ${u.n}.`));
  },
  toggleUser(el) {
    const u = S.users.find((x) => x.id === el.dataset.id);
    u.active = !u.active;
    logA(
      `${u.n} ka account ${u.active ? "chalu" : "band"}`,
      `${u.n} ${u.active ? "activated" : "deactivated"}`,
    );
    render();
    toast(
      u.active
        ? L(`${u.n} ab login kar sakta hai.`, `${u.n} can log in again.`)
        : L(`${u.n} ab login nahi kar sakta.`, `${u.n} can no longer log in.`),
    );
  },
});
Object.assign(FORMS, {
  lgPhone(f) {
    const d = f.mobile.value.replace(/\D/g, "").slice(-10);
    S.login.phone = f.mobile.value;
    if (d.length !== 10) {
      S.login.err = L(
        "10 ank ka mobile number daalo.",
        "Enter a 10-digit mobile number.",
      );
      render();
      document.getElementById("lgm").focus();
      return;
    }
    const u = S.users.find((x) => x.mobile === d);
    if (!u) {
      S.login.err = L(
        "Yeh number app mein nahi hai. Admin se apna number judwao.",
        "This number is not in the app. Ask your Admin to add it.",
      );
      render();
      document.getElementById("lgm").focus();
      return;
    }
    if (!u.active) {
      S.login.err = L(
        "Yeh account band hai. Admin se baat karo.",
        "This account is deactivated. Talk to your Admin.",
      );
      render();
      return;
    }
    S.login = { step: "pin", uid: u.id, phone: d, pin: "", err: "" };
    render();
  },
  addUser(f) {
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
    const u = {
      id: "u" + nid(),
      role,
      unit,
      machine: role === "staff" ? mach : undefined,
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
      `Naya user: ${n} (${role === "staff" ? "Staff " + mach : UNITS[unit].n + " Manager"})`,
      `New user: ${n} (${role === "staff" ? "Staff " + mach : UNITS[unit].n + " Manager"})`,
    );
    render();
    newCredModal(u);
  },
});
LIVE.addUser = (f) => {
  const u = f.unit.value,
    role = f.querySelector("[name=role]:checked").value,
    sel = f.machine,
    cur = sel.value;
  sel.innerHTML = UNITS[u].machines
    .map((m) => `<option ${m === cur ? "selected" : ""}>${m}</option>`)
    .join("");
  document.getElementById("umf").hidden = role !== "staff";
};
document.addEventListener("keydown", (e) => {
  if (
    S.user ||
    S.view === "guide" ||
    S.login.step !== "pin" ||
    document.querySelector("#modal-root .ov")
  )
    return;
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    ACT.pinKey({ dataset: { k: e.key } });
  } else if (e.key === "Backspace") {
    e.preventDefault();
    ACT.pinKey({ dataset: { k: "del" } });
  }
});
addEventListener("hashchange", () => {
  if (applyHash()) render();
});

/* ---------- process illustrations ---------- */
const bd = (x, y, r, g, cls = "", st = "") =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gb-${g})" ${cls ? `class="${cls}"` : ""} ${st ? `style="${st}"` : ""}/>`;
const dl = (s) => `animation-delay:${s}s`;
const ILLO = {
  inward: () => `<line x1="16" y1="128" x2="224" y2="128" class="ln2"/>
  <g class="a-slide"><rect x="26" y="34" width="56" height="74" rx="6" class="pap"/><rect x="26" y="34" width="56" height="9" rx="4" style="fill:var(--gold)"/><path d="M36 56h36M36 66h28M36 76h32M36 86h20" class="ln thin"/><text x="36" y="101" class="it">SP/2291</text></g>
  <g class="a-pop"><circle cx="82" cy="36" r="11" style="fill:var(--ok)"/><path d="M77 36l4 4 7-8" class="ck"/></g>
  <rect x="116" y="114" width="92" height="8" rx="3" style="fill:var(--navy)"/><rect x="154" y="122" width="16" height="6" style="fill:var(--navy)"/>
  <g class="a-fall">${bd(150, 18, 3, "white")}</g><g class="a-fall" style="${dl(0.5)}">${bd(162, 14, 3, "white")}</g><g class="a-fall" style="${dl(1)}">${bd(174, 18, 3, "white")}</g><g class="a-fall" style="${dl(1.5)}">${bd(158, 12, 3, "white")}</g>
  <g class="a-drop"><path d="M130 114c-4-26 0-42 10-48h44c10 6 14 22 10 48z" style="fill:var(--sand);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/><path d="M144 66l8-7h20l8 7" class="ln"/><text x="162" y="96" text-anchor="middle" class="it">GPPS</text></g>
  <g class="a-show"><rect x="176" y="22" width="50" height="20" rx="6" style="fill:var(--navy)"/><text x="201" y="35.5" text-anchor="middle" class="it inv">1000 kg</text></g>`,
  mould:
    () => `<path d="M30 16h48l-15 30h-18z" style="fill:var(--u-m-soft);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/>
  <g class="a-fall2">${bd(46, 24, 2.6, "white")}${bd(56, 22, 2.6, "white")}${bd(64, 26, 2.6, "white")}</g><g class="a-fall2" style="${dl(0.6)}">${bd(50, 30, 2.6, "white")}${bd(60, 32, 2.6, "white")}</g>
  <path d="M60 46q4-5 0-9t0-9" class="heat" transform="translate(30 4)"/><path d="M60 46q4-5 0-9t0-9" class="heat" style="${dl(0.4)}" transform="translate(50 4)"/><path d="M60 46q4-5 0-9t0-9" class="heat" style="${dl(0.8)}" transform="translate(70 4)"/>
  <rect x="22" y="52" width="122" height="26" rx="9" class="pap"/>
  <path d="M30 65l6-8 6 16 6-16 6 16 6-16 6 16 6-16 6 16 6-16 6 16 6-16 6 16 6-16 6 16 6-8" class="ln thin a-screw"/>
  <rect x="146" y="38" width="16" height="54" rx="3" style="fill:var(--navy)"/>
  <g class="a-mould"><rect x="164" y="38" width="16" height="54" rx="3" style="fill:var(--u-m)"/></g>
  <g class="a-shot">${bd(170, 64, 5, "white")}</g><g class="a-shot" style="${dl(0.35)}">${bd(170, 64, 5, "white")}</g><g class="a-shot" style="${dl(0.7)}">${bd(170, 64, 5, "white")}</g>
  <path d="M196 98h34l-4 30h-26z" style="fill:var(--sand);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/>${bd(206, 100, 4, "white")}${bd(214, 98, 4, "white")}${bd(221, 101, 4, "white")}
  <line x1="16" y1="128" x2="190" y2="128" class="ln2"/>`,
  approve:
    () => `<g class="a-slide"><rect x="20" y="16" width="94" height="118" rx="14" class="pap"/><circle cx="38" cy="34" r="8" fill="url(#gb-navy)"/><text x="52" y="31" class="it">M2 · Raju</text><text x="52" y="42" class="it mu">8MM Crylo</text>
   <text x="32" y="70" class="it big">96.0 kg</text>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => bd(34 + i * 9, 84, 3.3, i < 7 ? "navy" : "white")).join("")}
   <rect x="32" y="100" width="70" height="20" rx="10" style="fill:var(--ok)"/><text x="67" y="114" text-anchor="middle" class="it inv">Approve</text></g>
  <g class="a-pop"><circle cx="110" cy="22" r="11" style="fill:var(--ok)"/><path d="M105 22l4 4 7-8" class="ck"/></g>
  <path d="M124 76h18m-5-5 5 5-5 5" class="ln"/>
  <rect x="152" y="38" width="26" height="80" rx="6" class="a-shrink" style="fill:var(--gold)"/><rect x="192" y="38" width="26" height="80" rx="6" class="a-grow" style="fill:var(--u-m)"/>
  <line x1="146" y1="118" x2="224" y2="118" class="ln2"/><text x="165" y="132" text-anchor="middle" class="it mu">GPPS</text><text x="205" y="132" text-anchor="middle" class="it mu">Plain</text>`,
  transfer:
    () => `<path d="M14 116V70l35-22 35 22v46z" style="fill:var(--u-m-soft);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/><rect x="41" y="94" width="16" height="22" rx="2" style="fill:var(--u-m)"/>
  <path d="M156 116V70l35-22 35 22v46z" style="fill:var(--u-p-soft);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/><rect x="183" y="94" width="16" height="22" rx="2" style="fill:var(--u-p)"/>
  <line x1="14" y1="116" x2="226" y2="116" class="ln2"/><path d="M86 108h68" class="ln2 dash"/>
  <text x="49" y="134" text-anchor="middle" class="it mu">Moulding</text><text x="191" y="134" text-anchor="middle" class="it mu">Pearl</text>
  <g class="a-carry"><path d="M66 112c-2-12 0-18 5-21h14c5 3 7 9 5 21z" style="fill:var(--sand);stroke:var(--navy)" stroke-width="1.6" stroke-linejoin="round"/></g>
  <rect x="24" y="18" width="50" height="20" rx="6" style="fill:var(--navy)"/><text x="49" y="31.5" text-anchor="middle" class="it inv">150 kg</text>
  <g class="a-show"><rect x="166" y="18" width="50" height="20" rx="6" style="fill:var(--navy)"/><text x="191" y="31.5" text-anchor="middle" class="it inv">148 kg</text></g>
  <g class="a-pop2"><circle cx="220" cy="18" r="11" style="fill:var(--bad)"/><text x="220" y="21.5" text-anchor="middle" class="it inv">−2</text></g>`,
  coat: () => `<path d="M110 12h20l-4 12h-12z" style="fill:var(--navy)"/>
  <circle cx="114" cy="30" r="2" class="a-pulse" style="fill:var(--gold)"/><circle cx="120" cy="34" r="2" class="a-pulse" style="fill:var(--gold);${dl(0.3)}"/><circle cx="126" cy="30" r="2" class="a-pulse" style="fill:var(--gold);${dl(0.6)}"/>
  <circle cx="120" cy="82" r="40" style="fill:var(--u-p-soft);stroke:var(--navy)" stroke-width="2"/>
  <g class="a-spin"><path d="M120 46v72M84 82h72M95 57l50 50M145 57l-50 50" class="ln2"/>${bd(120, 60, 6, "pink")}${bd(142, 82, 6, "steel")}${bd(120, 104, 6, "pink")}${bd(98, 82, 6, "white")}</g>
  <circle cx="120" cy="82" r="6" style="fill:var(--navy)"/>
  <g class="a-in">${bd(30, 82, 5, "white")}${bd(44, 82, 5, "white")}${bd(58, 82, 5, "white")}</g>
  <g class="a-out">${bd(170, 82, 5, "pink")}${bd(184, 82, 5, "steel")}${bd(198, 82, 5, "pink")}</g>
  <line x1="16" y1="132" x2="224" y2="132" class="ln2"/>`,
  thread:
    () => `<path d="M16 75l26-5v10z" style="fill:var(--navy)"/><circle cx="22" cy="75" r="1.6" style="fill:var(--surface)"/>
  <line x1="42" y1="75" x2="160" y2="75" style="stroke:var(--gold)" stroke-width="1.6"/>
  <g class="a-conv">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => bd(46 + i * 14, 75, 5.5, i % 2 ? "pink" : "white")).join("")}</g>
  <path d="M158 75c10 0 14-10 18-14" style="stroke:var(--gold);fill:none" stroke-width="1.6"/>
  <g class="a-spin slow">${Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return bd(
      192 + Math.cos(a) * 24,
      68 + Math.sin(a) * 24,
      5.5,
      i % 3 ? "pink" : "white",
    );
  }).join("")}</g>
  <circle cx="192" cy="44" r="4" style="fill:var(--gold)"/>
  <text x="90" y="126" text-anchor="middle" class="it mu">kg</text><path d="M108 123h22m-4-4 4 4-4 4" class="ln thin"/><text x="140" y="126" class="it mu">bunch</text>`,
  dispatch:
    () => `<rect x="14" y="24" width="46" height="62" rx="5" class="pap"/><path d="M22 40h30M22 50h22M22 60h26M22 70h16" class="ln thin"/><text x="22" y="33" class="it">#1041</text>
  <path d="M64 70h12m-4-4 4 4-4 4" class="ln thin"/>
  <rect x="80" y="64" width="40" height="32" rx="3" style="fill:var(--sand);stroke:var(--navy)" stroke-width="2"/><line x1="100" y1="64" x2="100" y2="96" class="ln thin"/>
  <g class="a-lid"><rect x="78" y="58" width="44" height="7" rx="2" style="fill:var(--gold)"/></g>
  <g class="a-bob"><rect x="134" y="46" width="62" height="44" rx="5" style="fill:var(--u-p-soft);stroke:var(--navy)" stroke-width="2"/><path d="M196 58h16l12 14v18h-28z" style="fill:var(--navy)"/><rect x="201" y="62" width="10" height="9" rx="1.5" style="fill:var(--surface)"/></g>
  <g class="a-spin fast"><circle cx="150" cy="96" r="8" style="fill:var(--navy)"/><circle cx="150" cy="96" r="3" style="fill:var(--surface)"/><path d="M150 89v4" style="stroke:var(--surface)" stroke-width="2" stroke-linecap="round"/></g>
  <g class="a-spin fast"><circle cx="210" cy="96" r="8" style="fill:var(--navy)"/><circle cx="210" cy="96" r="3" style="fill:var(--surface)"/><path d="M210 89v4" style="stroke:var(--surface)" stroke-width="2" stroke-linecap="round"/></g>
  <line x1="10" y1="108" x2="236" y2="108" class="road a-road"/><line x1="10" y1="118" x2="236" y2="118" class="ln2"/>`,
  bill: () => `<rect x="20" y="16" width="88" height="118" rx="7" class="pap"/><rect x="20" y="16" width="88" height="10" rx="5" style="fill:var(--gold)"/>
  <text x="30" y="40" class="it">MK/26-27/0118</text>
  <path d="M30 54h66" class="ln thin draw" pathLength="1"/><path d="M30 66h52" class="ln thin draw" pathLength="1" style="${dl(0.25)}"/><path d="M30 78h60" class="ln thin draw" pathLength="1" style="${dl(0.5)}"/><path d="M30 90h44" class="ln thin draw" pathLength="1" style="${dl(0.75)}"/>
  <rect x="30" y="104" width="30" height="14" rx="7" style="fill:var(--u-m-soft)"/><text x="45" y="114" text-anchor="middle" class="it">GST</text><text x="98" y="115" text-anchor="end" class="it big2">₹15,340</text>
  <circle cx="178" cy="84" r="34" class="ln2" stroke-width="8"/>
  <circle cx="178" cy="84" r="34" class="ring" pathLength="1" transform="rotate(-90 178 84)"/>
  <g class="a-coin">${bd(178, 40, 9, "gold")}<text x="178" y="43.5" text-anchor="middle" class="it inv">₹</text></g><g class="a-coin" style="${dl(0.7)}">${bd(178, 40, 9, "gold")}<text x="178" y="43.5" text-anchor="middle" class="it inv">₹</text></g>
  <g class="a-pop"><circle cx="178" cy="84" r="14" style="fill:var(--ok)"/><path d="M171 84l5 5 9-10" class="ck"/></g>`,
  stop: () => `<rect x="20" y="36" width="116" height="76" rx="12" style="fill:var(--u-m-soft);stroke:var(--navy)" stroke-width="2"/>
  <g class="a-gear"><circle cx="72" cy="74" r="20" style="fill:none;stroke:var(--navy)" stroke-width="8" stroke-dasharray="6 4.47"/><circle cx="72" cy="74" r="14" style="fill:var(--surface);stroke:var(--navy)" stroke-width="2"/><circle cx="72" cy="74" r="4" style="fill:var(--navy)"/></g>
  <circle cx="122" cy="50" r="6" class="a-light"/>
  <g class="a-pausebadge"><rect x="100" y="84" width="28" height="20" rx="6" style="fill:var(--warn)"/><rect x="108" y="89" width="4" height="10" rx="1" style="fill:#fff"/><rect x="116" y="89" width="4" height="10" rx="1" style="fill:#fff"/></g>
  <circle cx="190" cy="74" r="28" class="pap"/>${[0, 1, 2, 3].map((i) => `<line x1="190" y1="${50}" x2="190" y2="${54}" class="ln thin" transform="rotate(${i * 90} 190 74)"/>`).join("")}
  <line x1="190" y1="74" x2="190" y2="56" class="ln a-hand"/><circle cx="190" cy="74" r="3" style="fill:var(--navy)"/>
  <text x="190" y="122" text-anchor="middle" class="it mu">downtime</text><line x1="16" y1="130" x2="224" y2="130" class="ln2"/>`,
  offline:
    () => `<rect x="36" y="18" width="70" height="116" rx="14" class="pap"/><rect x="60" y="24" width="22" height="4" rx="2" style="fill:var(--line)"/>
  <g class="a-wifi"><path d="M52 50a26 26 0 0 1 38 0M58 57a16 16 0 0 1 26 0" class="ln thin"/><circle cx="71" cy="63" r="2" style="fill:var(--navy)"/><path d="M52 44l38 26" style="stroke:var(--warn)" stroke-width="2.4" stroke-linecap="round"/></g>
  <g class="a-up"><rect x="46" y="78" width="50" height="12" rx="4" style="fill:var(--warn-soft);stroke:var(--warn)" stroke-width="1.4"/></g>
  <g class="a-up" style="${dl(0.25)}"><rect x="46" y="94" width="50" height="12" rx="4" style="fill:var(--warn-soft);stroke:var(--warn)" stroke-width="1.4"/></g>
  <g class="a-up" style="${dl(0.5)}"><rect x="46" y="110" width="50" height="12" rx="4" style="fill:var(--warn-soft);stroke:var(--warn)" stroke-width="1.4"/></g>
  <path d="M150 64a16 16 0 0 1 4-31 22 22 0 0 1 42 4 14 14 0 0 1 4 27z" style="fill:var(--u-m-soft);stroke:var(--navy)" stroke-width="2" stroke-linejoin="round"/>
  <g class="a-pop"><circle cx="210" cy="30" r="11" style="fill:var(--ok)"/><path d="M205 30l4 4 7-8" class="ck"/></g>
  <path d="M120 96c20 0 30-10 36-24" class="ln2 dash"/>`,
  dayclose: () => `<line x1="14" y1="98" x2="100" y2="98" class="ln2"/>
  <g class="a-sunset"><circle cx="56" cy="62" r="16" fill="url(#gb-gold)"/></g>
  <g class="a-moonrise"><path d="M64 46a18 18 0 1 0 0 32 14 14 0 1 1 0-32z" style="fill:var(--navy)"/></g>
  <rect x="104" y="20" width="72" height="104" rx="7" class="pap"/>
  ${[0, 1, 2].map((i) => `<rect x="114" y="${38 + i * 26}" width="14" height="14" rx="3" style="fill:none;stroke:var(--navy)" stroke-width="1.6"/><path d="M134 ${45 + i * 26}h32" class="ln thin"/><g class="a-tick" style="${dl(0.5 + i * 0.6)}"><path d="M116.5 ${45 + i * 26}l3.5 3.5 6-7" style="stroke:var(--ok);fill:none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("")}
  <path d="M196 70v-9a10 10 0 0 1 20 0v9" class="ln a-shackle"/><rect x="190" y="70" width="32" height="26" rx="5" style="fill:var(--navy)"/><circle cx="206" cy="82" r="3" style="fill:var(--surface)"/>`,
  trace: () => `<line x1="30" y1="120" x2="210" y2="120" class="ln2"/>
  <rect x="64" y="40" width="34" height="80" rx="5" style="fill:var(--u-m)"/><rect x="132" y="42" width="34" height="78" rx="5" style="fill:var(--u-p)"/>
  <path d="M128 40h42" style="stroke:var(--bad)" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="81" y="134" text-anchor="middle" class="it mu">150</text><text x="149" y="134" text-anchor="middle" class="it mu">148</text>
  <g class="a-scan"><circle cx="80" cy="44" r="18" style="fill:var(--surface);fill-opacity:.35;stroke:var(--navy)" stroke-width="3"/><path d="M93 57l12 12" class="ln" stroke-width="4"/></g>
  <g class="a-pop2"><rect x="176" y="22" width="48" height="20" rx="10" style="fill:var(--bad)"/><text x="200" y="35.5" text-anchor="middle" class="it inv">−2 kg</text></g>`,
  expense:
    () => `${[0, 1, 2, 3].map((i) => `<ellipse cx="54" cy="${112 - i * 10}" rx="22" ry="7" style="fill:var(--gold);stroke:var(--gold-ink)" stroke-width="1.5"/>`).join("")}<text x="54" y="80" text-anchor="middle" class="it">₹</text>
  <g class="a-coin2">${bd(86, 60, 7, "gold")}</g>
  <line x1="104" y1="120" x2="226" y2="120" class="ln2"/>
  <rect x="116" y="50" width="26" height="70" rx="5" class="a-grow" style="fill:var(--u-m)"/><rect x="156" y="74" width="26" height="46" rx="5" class="a-grow" style="fill:var(--u-p);${dl(0.3)}"/><rect x="196" y="86" width="26" height="34" rx="5" class="a-grow" style="fill:var(--u-z);${dl(0.6)}"/>
  <text x="129" y="134" text-anchor="middle" class="it mu">M</text><text x="169" y="134" text-anchor="middle" class="it mu">P</text><text x="209" y="134" text-anchor="middle" class="it mu">Z</text>`,
  team: () => `<circle cx="58" cy="58" r="22" fill="url(#gb-gold)"/><path d="M26 124a32 32 0 0 1 64 0z" style="fill:var(--gold-soft);stroke:var(--gold-ink)" stroke-width="1.5"/>
  <g class="a-key"><circle cx="92" cy="40" r="7" style="fill:none;stroke:var(--navy)" stroke-width="2.4"/><path d="M98 36l12-8m-4 3 3 4m-7-1 3 3" class="ln thin"/></g>
  <rect x="120" y="18" width="96" height="116" rx="14" class="pap"/>
  ${[0, 1, 2, 3].map((i) => `<circle cx="${140 + i * 18}" cy="40" r="6" style="fill:none;stroke:var(--line)" stroke-width="2"/><g class="a-pin" style="${dl(i * 0.45)}">${bd(140 + i * 18, 40, 6, "gold")}</g>`).join("")}
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${136 + (i % 3) * 24}" y="${58 + Math.floor(i / 3) * 22}" width="18" height="16" rx="5" style="fill:var(--surface-2)"/>`).join("")}`,
};
function illo(k, label) {
  return `<svg class="illo" viewBox="0 0 240 150" role="img" aria-label="${esc(label || "")}">${ILLO[k]()}</svg>`;
}
const UCIL = {
  "UC-01": "inward",
  "UC-02": "mould",
  "UC-03": "approve",
  "UC-04": "transfer",
  "UC-05": "transfer",
  "UC-06": "coat",
  "UC-07": "thread",
  "UC-08": "thread",
  "UC-09": "dispatch",
  "UC-10": "dispatch",
  "UC-11": "bill",
  "UC-12": "bill",
  "UC-13": "stop",
  "UC-14": "offline",
  "UC-15": "dayclose",
  "UC-16": "trace",
  "UC-17": "expense",
  "UC-18": "team",
};
const JIL = [
  "inward",
  "mould",
  "approve",
  "transfer",
  "coat",
  "thread",
  "dispatch",
  "bill",
];
