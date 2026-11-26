"use strict";
/* ---------- v11: UI layer. Tap inputs + polish. No change to data, rules or flow. ----------
   Every chip, toggle, swatch and stepper writes into the original field and fires the same
   input/change events, so LIVE, FORMS and all checks run exactly as before. */
const TAP = { auto: false };
ICONS.minus = ICONS.minus || '<path d="M5 12h14"/>';
ICONS.search =
  ICONS.search || '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>';
const tapFire = (el, ev) =>
  el.dispatchEvent(new Event(ev || "change", { bubbles: true }));
const tapSig = (s) =>
  [...s.options]
    .map(
      (o) => o.value + "\u0001" + o.textContent + (o.disabled ? "\u0002" : ""),
    )
    .join("|") +
  "#" +
  s.value +
  (s.disabled ? "!" : "");
const tapLabel = (s) => {
  const l = s.id && s.form && s.form.querySelector(`label[for="${s.id}"]`);
  return l ? l.textContent.trim() : s.name || "";
};
const SWATCH = {
  "off white": "#F1EBDB",
  white: "#FFFFFF",
  cream: "#EFDDB4",
  ferozi: "#2FB3AE",
  orange: "#EE8530",
  lcd: "#9AA9C9",
  artery: "#B5475B",
  "baby pink": "#F4C3CF",
  unique: "#B8A4D8",
  yellow: "#F1CF45",
  red: "#D23A3A",
  maroon: "#7B2131",
  peach: "#F5BE9C",
  pink: "#EC84A6",
  magenta: "#C2358C",
  pista: "#B6D486",
  golden: "#D2A93B",
  gold: "#D2A93B",
  silver: "#BFC2CB",
  black: "#26252E",
  blue: "#3F66C9",
  "sky blue": "#7CB8E6",
  green: "#3C9A5F",
  purple: "#7D52B8",
  brown: "#8A5A36",
  grey: "#9A98A3",
  gray: "#9A98A3",
  copper: "#B8733D",
  "rose gold": "#D9A08F",
};
function swHex(n) {
  const k = (n || "").trim().toLowerCase();
  if (SWATCH[k]) return SWATCH[k];
  let h = 0;
  for (const c of k) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 42% 68%)`;
}
const isItemSel = (s) =>
  s.options.length >= 12 &&
  [...s.options].every(
    (o) =>
      /^\d+$/.test(o.value) &&
      rlItem(o.value) &&
      o.textContent.trim().startsWith(o.value + "."),
  );
const isColourSel = (s) =>
  !!s.querySelector('option[value="__new"]') &&
  /(^|_)(color|cl)(_|$)|colou?r/i.test(s.name + " " + s.id + " " + tapLabel(s));

function tapHost(s, cls) {
  let b = s.nextElementSibling;
  if (!b || !b.classList.contains("tapbox")) {
    b = document.createElement("div");
    b.className = "tapbox " + cls;
    b.setAttribute("role", "radiogroup");
    b.setAttribute("aria-label", tapLabel(s));
    s.after(b);
    s.classList.add("tap-src");
    s.tabIndex = -1;
    s.setAttribute("aria-hidden", "true");
    (s.closest(".fld") || s.parentNode).classList.add("has-tap");
    b._sel = s;
  }
  return b;
}
const tchip = (o, on, extra = "") =>
  `<button type="button" class="tchip${on ? " on" : ""}" role="radio" aria-checked="${on}" data-tv="${esc(o.value)}" ${o.disabled ? "disabled" : ""} ${extra}>${o.html || esc(o.textContent)}</button>`;

function tapChips(s) {
  const opts = [...s.options],
    seg =
      opts.length <= 3 && opts.every((o) => o.textContent.trim().length <= 12);
  const b = tapHost(s, seg ? "seg-t" : "chips");
  b.className =
    "tapbox " + (seg ? "seg-t" : "chips") + (s.disabled ? " off" : "");
  b.innerHTML = opts
    .map((o) => tchip(o, o.value === s.value, s.disabled ? "disabled" : ""))
    .join("");
}

function tapItem(s) {
  const b = tapHost(s, "itempick"),
    cur = rlItem(s.value),
    sizes = [],
    seen = {};
  [...s.options].forEach((o) => {
    const r = rlItem(o.value);
    if (r && !seen[r.size]) {
      seen[r.size] = 1;
      sizes.push(r.size);
    }
  });
  sizes.sort((a, c) => parseFloat(a) - parseFloat(c));
  const sz =
    b.dataset.size && seen[b.dataset.size]
      ? b.dataset.size
      : cur
        ? cur.size
        : sizes[0];
  b.dataset.size = sz;
  const items = [...s.options]
    .map((o) => ({ o, r: rlItem(o.value) }))
    .filter((x) => x.r && x.r.size === sz);
  b.innerHTML = `<div class="ip-sz" role="group" aria-label="Size">${sizes
    .map((z) => {
      const any = [...s.options].some((o) => {
        const r = rlItem(o.value);
        return r && r.size === z && !o.disabled;
      });
      return `<button type="button" class="szchip${z === sz ? " on" : ""}" data-sz="${esc(z)}" ${any ? "" : "disabled"}>${esc(z.replace("MM", ""))}<small>mm</small></button>`;
    })
    .join("")}</div>
   <div class="ip-ty">${items
     .map(({ o, r }) => {
       const on = o.value === s.value,
         bp = rlDupe(r) && r.bpk ? +r.bpk + "B" : "";
       return `<button type="button" class="tchip ty${on ? " on" : ""}" role="radio" aria-checked="${on}" data-tv="${o.value}" ${o.disabled ? "disabled" : ""}><b>${esc(r.kind)}${bp ? " · " + bp : ""}</b><small>#${r.no}${o.disabled ? " · " + L("rate baaki", "rate pending") : r.pack ? " · " + r.pack + " " + L("bunch/packet", "bunch/packet") : ""}</small></button>`;
     })
     .join("")}</div>`;
  const on = b.querySelector(".szchip.on");
  if (on && b.dataset.scrolled !== sz) {
    b.dataset.scrolled = sz;
    requestAnimationFrame(() => {
      const row = on.parentNode;
      row.scrollLeft = Math.max(
        0,
        on.offsetLeft - row.clientWidth / 2 + on.offsetWidth / 2,
      );
    });
  }
}

function tapColour(s) {
  const b = tapHost(s, "swpick"),
    opts = [...s.options],
    q = (b.dataset.q || "").toLowerCase(),
    many = opts.length > 10;
  const list = opts.filter(
    (o) =>
      o.value === "__new" ||
      o.value === "" ||
      o.value === s.value ||
      !q ||
      o.textContent.toLowerCase().includes(q),
  );
  const head = many
    ? `<div class="sw-q">${ic("search", 15)}<input type="search" class="sw-in" placeholder="${L("Rang dhundo", "Find colour")}" value="${esc(b.dataset.q || "")}" aria-label="${L("Rang dhundo", "Find colour")}"></div>`
    : "";
  const chips = list
    .map((o) => {
      const nw = o.value === "__new",
        none = o.value === "";
      o.html = nw
        ? `${ic("plus", 14)}<span>${esc(o.textContent.replace(/^\+\s*/, ""))}</span>`
        : none
          ? `<i class="sw none"></i><span>${esc(o.textContent)}</span>`
          : `<i class="sw" style="--sw:${swHex(o.textContent)}"></i><span>${esc(o.textContent)}</span>`;
      return tchip(o, o.value === s.value, nw ? 'data-new="1"' : "");
    })
    .join("");
  const keep = b.querySelector(".sw-in"),
    had = keep && document.activeElement === keep,
    pos = had ? keep.selectionStart : 0;
  if (!b.querySelector(".sw-grid") || b.dataset.many !== String(many)) {
    b.dataset.many = String(many);
    b.innerHTML = head + `<div class="sw-grid">${chips}</div>`;
  } else b.querySelector(".sw-grid").innerHTML = chips;
  b.classList.toggle("off", s.disabled);
  if (had) {
    const i = b.querySelector(".sw-in");
    i.focus();
    try {
      i.setSelectionRange(pos, pos);
    } catch (e) {}
  }
}

function tapSelect(s) {
  if (s.multiple) return;
  const sig = tapSig(s);
  if (
    s._tsig === sig &&
    s.nextElementSibling &&
    s.nextElementSibling.classList.contains("tapbox")
  )
    return;
  s._tsig = sig;
  if (s._tkind === undefined)
    s._tkind = isItemSel(s)
      ? "item"
      : isColourSel(s)
        ? "colour"
        : s.options.length >= 1 &&
            s.options.length <= 8 &&
            [...s.options].reduce(
              (a, o) => a + o.textContent.trim().length,
              0,
            ) <= 150 &&
            !/party/i.test(s.name)
          ? "chips"
          : s.options.length <= 20 &&
              [...s.options].every((o) => o.textContent.trim().length <= 6)
            ? "row"
            : "";
  if (s._tkind === "item") tapItem(s);
  else if (s._tkind === "colour") tapColour(s);
  else if (s._tkind === "chips") tapChips(s);
  else if (s._tkind === "row") tapRow(s);
}
function tapRow(s) {
  const b = tapHost(s, "chiprow");
  b.className = "tapbox chiprow";
  b.innerHTML = [...s.options]
    .map(
      (o) =>
        `<button type="button" class="szchip tchip-r${o.value === s.value ? " on" : ""}" role="radio" aria-checked="${o.value === s.value}" data-tv="${esc(o.value)}" ${o.disabled ? "disabled" : ""}>${esc(o.textContent.replace(/MM$/, ""))}${/MM$/.test(o.textContent) ? "<small>mm</small>" : ""}</button>`,
    )
    .join("");
  const on = b.querySelector(".on");
  if (on && b.dataset.scrolled !== s.value) {
    b.dataset.scrolled = s.value;
    requestAnimationFrame(() => {
      b.scrollLeft = Math.max(
        0,
        on.offsetLeft - b.clientWidth / 2 + on.offsetWidth / 2,
      );
    });
  }
}

/* steppers + quick chips on whole-number fields */
const NOSTEP =
  /rate|amt|amount|cost|price|limit|paid|pay|pin|mobile|phone|gst|bpf/i;
function tapNum(inp) {
  if (inp._tstep || inp.type !== "number" || NOSTEP.test(inp.name || ""))
    return;
  const whole = inp.step === "1" || inp.getAttribute("inputmode") === "numeric";
  if (!whole) return;
  inp._tstep = 1;
  const w = document.createElement("div");
  w.className = "stp" + (inp.classList.contains("big-in") ? " big" : "");
  inp.parentNode.insertBefore(w, inp);
  w.insertAdjacentHTML(
    "afterbegin",
    `<button type="button" class="stb" data-st="-1" aria-label="${L("Kam karo", "Decrease")}" tabindex="-1">${ic("minus", 18)}</button>`,
  );
  w.appendChild(inp);
  w.insertAdjacentHTML(
    "beforeend",
    `<button type="button" class="stb" data-st="1" aria-label="${L("Badhao", "Increase")}" tabindex="-1">${ic("plus", 18)}</button><span class="autob" aria-hidden="true">auto</span>`,
  );
  if (/^pk_\d+$/.test(inp.name))
    w.insertAdjacentHTML(
      "afterend",
      `<div class="qadd" role="group" aria-label="${L("Jaldi jodo", "Quick add")}">${[1, 5, 10, 25].map((n) => `<button type="button" class="qchip" data-qa="${n}">+${n}</button>`).join("")}<button type="button" class="qchip ghost" data-qa="0">${L("Saaf", "Clear")}</button></div>`,
    );
  const f = inp.form;
  if (f && f.dataset.live === "coatEntry9" && inp.name === "input")
    w.insertAdjacentHTML("afterend", `<div class="qadd" data-lotq></div>`);
}
function lotQuick(f) {
  const box = f.querySelector("[data-lotq]");
  if (!box) return;
  const l = S.thr.find((x) => x.id === (f.lot && f.lot.value)),
    av = l ? Math.floor(l.bunch / S.bpf) : 0;
  const k = String(av);
  if (box.dataset.k === k) return;
  box.dataset.k = k;
  box.innerHTML =
    av > 0
      ? `<button type="button" class="qchip" data-qset="${av}">${L("Poora lot", "Whole lot")} · ${nf(av)}</button>${av > 1 ? `<button type="button" class="qchip" data-qset="${Math.floor(av / 2)}">${L("Aadha", "Half")} · ${nf(Math.floor(av / 2))}</button>` : ""}`
      : "";
}

function setNum(inp, v, auto) {
  TAP.auto = !!auto;
  inp.value = v;
  tapFire(inp, "input");
  TAP.auto = false;
}

/* pre-fill: coating packed = taken - reject; moulding waste = raw - good. Always editable. */
const ENTRY_F = ["input", "out", "reject"];
function entryInit(f) {
  if (f.dataset.f !== "entry" || f._tinit) return;
  f._tinit = 1;
  ENTRY_F.forEach((n) => {
    const i = f[n];
    if (i && i.value !== "") i.dataset.touched = "1";
  });
}
function autoFill(f, src) {
  const coat = f.dataset.live === "coatEntry9",
    I = f.input,
    O = f.out,
    R = f.reject;
  if (!I || !O || !R) return;
  const i = +I.value;
  const mark = (el, on) => {
    const w = el.closest(".stp");
    (w || el).classList.toggle("autof", on);
  };
  if (!(i > 0)) return;
  const rd = (v) =>
    coat ? Math.max(0, Math.round(v)) : Math.max(0, Math.round(v * 10) / 10);
  if (src !== "out" && !O.dataset.touched && (coat || R.dataset.touched)) {
    const v = rd(i - (+R.value || 0));
    if (String(v) !== O.value) {
      setNum(O, v, true);
    }
    mark(O, true);
  } else if (
    src !== "reject" &&
    !R.dataset.touched &&
    O.dataset.touched &&
    O.value !== ""
  ) {
    const d = i - (+O.value || 0);
    if (d >= 0) {
      const v = rd(d);
      if (String(v) !== R.value) setNum(R, v, true);
      mark(R, true);
    }
  }
}

function tapRefresh(root) {
  root = root || document.getElementById("modal-root");
  if (!root) return;
  root.querySelectorAll("form select").forEach(tapSelect);
  root.querySelectorAll("form input[type=number]").forEach(tapNum);
  root.querySelectorAll("form[data-live=coatEntry9]").forEach(lotQuick);
  root.querySelectorAll("form[data-f=entry]").forEach(entryInit);
  root.querySelectorAll(".stp").forEach((w) => {
    const i = w.querySelector("input");
    w.classList.toggle("dis", !!i && i.disabled);
  });
}

/* events */
document.addEventListener("click", (e) => {
  const t = e.target;
  const c = t.closest(".tapbox .tchip,.tapbox .tchip-r");
  if (c && !c.disabled) {
    const b = c.closest(".tapbox"),
      s = b._sel;
    if (s && !s.disabled && s.value !== c.dataset.tv) {
      s.value = c.dataset.tv;
      tapFire(s);
    }
    tapRefresh();
    if (c.dataset.new)
      setTimeout(() => {
        const x = s
          .closest(".fld")
          .querySelector("input:not([type=search]):not([hidden])");
        if (x) x.focus();
      }, 30);
    return;
  }
  const z = t.closest(".szchip");
  if (z && !z.disabled) {
    const b = z.closest(".tapbox"),
      s = b._sel;
    b.dataset.size = z.dataset.sz;
    const first = [...s.options].find((o) => {
      const r = rlItem(o.value);
      return r && r.size === z.dataset.sz && !o.disabled;
    });
    if (first && s.value !== first.value) {
      s.value = first.value;
      tapFire(s);
    }
    s._tsig = "";
    tapRefresh();
    return;
  }
  const st = t.closest(".stb");
  if (st) {
    const inp = st.parentNode.querySelector("input");
    if (inp.disabled) return;
    const step = +inp.step || 1,
      min = inp.min !== "" ? +inp.min : 0,
      max = inp.max !== "" ? +inp.max : Infinity;
    const v = Math.min(
      max,
      Math.max(
        min,
        Math.round(((+inp.value || 0) + step * +st.dataset.st) * 100) / 100,
      ),
    );
    setNum(inp, v);
    return;
  }
  const q = t.closest(".qchip");
  if (q) {
    const box = q.closest(".qadd"),
      inp =
        box.previousElementSibling &&
        box.previousElementSibling.querySelector("input");
    if (!inp) return;
    if (q.dataset.qset != null) setNum(inp, +q.dataset.qset);
    else {
      const n = +q.dataset.qa;
      setNum(inp, n ? (+inp.value || 0) + n : "");
    }
  }
});
document.addEventListener(
  "input",
  (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains("sw-in")) {
      e.stopPropagation();
      const b = t.closest(".tapbox");
      b.dataset.q = t.value;
      tapColour(b._sel);
      return;
    }
    const f = t.form;
    if (!f || f.dataset.f !== "entry" || !ENTRY_F.includes(t.name)) return;
    if (!TAP.auto) {
      t.dataset.touched = "1";
      const w = t.closest(".stp");
      (w || t).classList.remove("autof");
      autoFill(f, t.name);
    }
  },
  true,
);
/* keep chips in step with code that sets values and then calls LIVE */
Object.keys(LIVE).forEach((k) => {
  const fn = LIVE[k];
  LIVE[k] = function (f) {
    const r = fn.apply(this, arguments);
    try {
      tapRefresh();
    } catch (err) {}
    return r;
  };
});
document.addEventListener("change", () => tapRefresh());
const _openV11 = openModal;
openModal = function (...a) {
  _openV11(...a);
  tapRefresh();
};

/* role class for staff-sized controls */
const _rV11 = render;
render = function () {
  _rV11();
  const u = typeof user === "function" ? user() : null;
  document.body.classList.toggle("is-staff", !!u && u.role !== "admin");
};
/* Hindi words for the new controls */
Object.entries({
  dhundo: "ढूंढो",
  saaf: "साफ़",
  poora: "पूरा",
  aadha: "आधा",
  badhao: "बढ़ाओ",
  lot: "लॉट",
  bunch: "बंच",
  packet: "पैकेट",
}).forEach(([k, v]) => {
  if (!DV9[k]) DV9[k] = v;
});
