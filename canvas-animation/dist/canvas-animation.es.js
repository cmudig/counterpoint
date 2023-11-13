var pr = Object.defineProperty;
var _r = (r, t, e) => t in r ? pr(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var At = (r, t, e) => (_r(r, typeof t != "symbol" ? t + "" : t, e), e);
function M(r, t) {
  let e = r.length;
  Array.isArray(r[0]) || (r = [r]), Array.isArray(t[0]) || (t = t.map((s) => [s]));
  let i = t[0].length, a = t[0].map((s, o) => t.map((l) => l[o])), n = r.map((s) => a.map((o) => {
    let l = 0;
    if (!Array.isArray(s)) {
      for (let h of o)
        l += s * h;
      return l;
    }
    for (let h = 0; h < s.length; h++)
      l += s[h] * (o[h] || 0);
    return l;
  }));
  return e === 1 && (n = n[0]), i === 1 ? n.map((s) => s[0]) : n;
}
function it(r) {
  return O(r) === "string";
}
function O(r) {
  return (Object.prototype.toString.call(r).match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}
function bt(r, t) {
  r = +r, t = +t;
  let e = (Math.floor(r) + "").length;
  if (t > e)
    return +r.toFixed(t - e);
  {
    let i = 10 ** (e - t);
    return Math.round(r / i) * i;
  }
}
function Ee(r) {
  if (!r)
    return;
  r = r.trim();
  const t = /^([a-z]+)\((.+?)\)$/i, e = /^-?[\d.]+$/;
  let i = r.match(t);
  if (i) {
    let a = [];
    return i[2].replace(/\/?\s*([-\w.]+(?:%|deg)?)/g, (n, s) => {
      /%$/.test(s) ? (s = new Number(s.slice(0, -1) / 100), s.type = "<percentage>") : /deg$/.test(s) ? (s = new Number(+s.slice(0, -3)), s.type = "<angle>", s.unit = "deg") : e.test(s) && (s = new Number(s), s.type = "<number>"), n.startsWith("/") && (s = s instanceof Number ? s : new Number(s), s.alpha = !0), a.push(s);
    }), {
      name: i[1].toLowerCase(),
      rawName: i[1],
      rawArgs: i[2],
      // An argument could be (as of css-color-4):
      // a number, percentage, degrees (hue), ident (in color())
      args: a
    };
  }
}
function Be(r) {
  return r[r.length - 1];
}
function yt(r, t, e) {
  return isNaN(r) ? t : isNaN(t) ? r : r + (t - r) * e;
}
function ze(r, t, e) {
  return (e - r) / (t - r);
}
function Gt(r, t, e) {
  return yt(t[0], t[1], ze(r[0], r[1], e));
}
function Fe(r) {
  return r.map((t) => t.split("|").map((e) => {
    e = e.trim();
    let i = e.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);
    if (i) {
      let a = new String(i[1]);
      return a.range = [+i[2], +i[3]], a;
    }
    return e;
  }));
}
var br = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  interpolate: yt,
  interpolateInv: ze,
  isString: it,
  last: Be,
  mapRange: Gt,
  multiplyMatrices: M,
  parseCoordGrammar: Fe,
  parseFunction: Ee,
  toPrecision: bt,
  type: O
});
class yr {
  add(t, e, i) {
    if (typeof arguments[0] != "string") {
      for (var t in arguments[0])
        this.add(t, arguments[0][t], arguments[1]);
      return;
    }
    (Array.isArray(t) ? t : [t]).forEach(function(a) {
      this[a] = this[a] || [], e && this[a][i ? "unshift" : "push"](e);
    }, this);
  }
  run(t, e) {
    this[t] = this[t] || [], this[t].forEach(function(i) {
      i.call(e && e.context ? e.context : e, e);
    });
  }
}
const X = new yr();
var F = {
  gamut_mapping: "lch.c",
  precision: 5,
  deltaE: "76"
  // Default deltaE method
};
const E = {
  // for compatibility, the four-digit chromaticity-derived ones everyone else uses
  D50: [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585],
  D65: [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329]
};
function Yt(r) {
  return Array.isArray(r) ? r : E[r];
}
function Mt(r, t, e, i = {}) {
  if (r = Yt(r), t = Yt(t), !r || !t)
    throw new TypeError(`Missing white point to convert ${r ? "" : "from"}${!r && !t ? "/" : ""}${t ? "" : "to"}`);
  if (r === t)
    return e;
  let a = { W1: r, W2: t, XYZ: e, options: i };
  if (X.run("chromatic-adaptation-start", a), a.M || (a.W1 === E.D65 && a.W2 === E.D50 ? a.M = [
    [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
    [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
    [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008]
  ] : a.W1 === E.D50 && a.W2 === E.D65 && (a.M = [
    [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
    [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
    [0.012314001688319899, -0.020507696433477912, 1.3303659366080753]
  ])), X.run("chromatic-adaptation-end", a), a.M)
    return M(a.M, a.XYZ);
  throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
}
const Mr = 75e-6, C = class C {
  constructor(t) {
    var a, n, s;
    this.id = t.id, this.name = t.name, this.base = t.base ? C.get(t.base) : null, this.aliases = t.aliases, this.base && (this.fromBase = t.fromBase, this.toBase = t.toBase);
    let e = t.coords ?? this.base.coords;
    for (let o in e)
      "name" in e[o] || (e[o].name = o);
    this.coords = e;
    let i = t.white ?? this.base.white ?? "D65";
    this.white = Yt(i), this.formats = t.formats ?? {};
    for (let o in this.formats) {
      let l = this.formats[o];
      l.type || (l.type = "function"), l.name || (l.name = o);
    }
    t.cssId && !((a = this.formats.functions) != null && a.color) ? (this.formats.color = { id: t.cssId }, Object.defineProperty(this, "cssId", { value: t.cssId })) : (n = this.formats) != null && n.color && !((s = this.formats) != null && s.color.id) && (this.formats.color.id = this.id), this.referred = t.referred, Object.defineProperty(this, "path", {
      value: vr(this).reverse(),
      writable: !1,
      enumerable: !0,
      configurable: !0
    }), X.run("colorspace-init-end", this);
  }
  inGamut(t, { epsilon: e = Mr } = {}) {
    if (this.isPolar)
      return t = this.toBase(t), this.base.inGamut(t, { epsilon: e });
    let i = Object.values(this.coords);
    return t.every((a, n) => {
      let s = i[n];
      if (s.type !== "angle" && s.range) {
        if (Number.isNaN(a))
          return !0;
        let [o, l] = s.range;
        return (o === void 0 || a >= o - e) && (l === void 0 || a <= l + e);
      }
      return !0;
    });
  }
  get cssId() {
    var t, e;
    return ((e = (t = this.formats.functions) == null ? void 0 : t.color) == null ? void 0 : e.id) || this.id;
  }
  get isPolar() {
    for (let t in this.coords)
      if (this.coords[t].type === "angle")
        return !0;
    return !1;
  }
  getFormat(t) {
    if (typeof t == "object")
      return t = ee(t, this), t;
    let e;
    return t === "default" ? e = Object.values(this.formats)[0] : e = this.formats[t], e ? (e = ee(e, this), e) : null;
  }
  // We cannot rely on simple === because then ColorSpace objects cannot be proxied
  equals(t) {
    return t ? this === t || this.id === t.id : !1;
  }
  to(t, e) {
    if (arguments.length === 1 && ([t, e] = [t.space, t.coords]), t = C.get(t), this.equals(t))
      return e;
    e = e.map((o) => Number.isNaN(o) ? 0 : o);
    let i = this.path, a = t.path, n, s;
    for (let o = 0; o < i.length && i[o].equals(a[o]); o++)
      n = i[o], s = o;
    if (!n)
      throw new Error(`Cannot convert between color spaces ${this} and ${t}: no connection space was found`);
    for (let o = i.length - 1; o > s; o--)
      e = i[o].toBase(e);
    for (let o = s + 1; o < a.length; o++)
      e = a[o].fromBase(e);
    return e;
  }
  from(t, e) {
    return arguments.length === 1 && ([t, e] = [t.space, t.coords]), t = C.get(t), t.to(this, e);
  }
  toString() {
    return `${this.name} (${this.id})`;
  }
  getMinCoords() {
    let t = [];
    for (let e in this.coords) {
      let i = this.coords[e], a = i.range || i.refRange;
      t.push((a == null ? void 0 : a.min) ?? 0);
    }
    return t;
  }
  // Returns array of unique color spaces
  static get all() {
    return [...new Set(Object.values(C.registry))];
  }
  static register(t, e) {
    if (arguments.length === 1 && (e = arguments[0], t = e.id), e = this.get(e), this.registry[t] && this.registry[t] !== e)
      throw new Error(`Duplicate color space registration: '${t}'`);
    if (this.registry[t] = e, arguments.length === 1 && e.aliases)
      for (let i of e.aliases)
        this.register(i, e);
    return e;
  }
  /**
   * Lookup ColorSpace object by name
   * @param {ColorSpace | string} name
   */
  static get(t, ...e) {
    if (!t || t instanceof C)
      return t;
    if (O(t) === "string") {
      let a = C.registry[t.toLowerCase()];
      if (!a)
        throw new TypeError(`No color space found with id = "${t}"`);
      return a;
    }
    if (e.length)
      return C.get(...e);
    throw new TypeError(`${t} is not a valid color space`);
  }
  /**
   * Get metadata about a coordinate of a color space
   *
   * @static
   * @param {Array | string} ref
   * @param {ColorSpace | string} [workingSpace]
   * @return {Object}
   */
  static resolveCoord(t, e) {
    var l;
    let i = O(t), a, n;
    if (i === "string" ? t.includes(".") ? [a, n] = t.split(".") : [a, n] = [, t] : Array.isArray(t) ? [a, n] = t : (a = t.space, n = t.coordId), a = C.get(a), a || (a = e), !a)
      throw new TypeError(`Cannot resolve coordinate reference ${t}: No color space specified and relative references are not allowed here`);
    if (i = O(n), i === "number" || i === "string" && n >= 0) {
      let h = Object.entries(a.coords)[n];
      if (h)
        return { space: a, id: h[0], index: n, ...h[1] };
    }
    a = C.get(a);
    let s = n.toLowerCase(), o = 0;
    for (let h in a.coords) {
      let u = a.coords[h];
      if (h.toLowerCase() === s || ((l = u.name) == null ? void 0 : l.toLowerCase()) === s)
        return { space: a, id: h, index: o, ...u };
      o++;
    }
    throw new TypeError(`No "${n}" coordinate found in ${a.name}. Its coordinates are: ${Object.keys(a.coords).join(", ")}`);
  }
};
At(C, "registry", {}), At(C, "DEFAULT_FORMAT", {
  type: "functions",
  name: "color"
});
let d = C;
function vr(r) {
  let t = [r];
  for (let e = r; e = e.base; )
    t.push(e);
  return t;
}
function ee(r, { coords: t } = {}) {
  if (r.coords && !r.coordGrammar) {
    r.type || (r.type = "function"), r.name || (r.name = "color"), r.coordGrammar = Fe(r.coords);
    let e = Object.entries(t).map(([i, a], n) => {
      let s = r.coordGrammar[n][0], o = a.range || a.refRange, l = s.range, h = "";
      return s == "<percentage>" ? (l = [0, 100], h = "%") : s == "<angle>" && (h = "deg"), { fromRange: o, toRange: l, suffix: h };
    });
    r.serializeCoords = (i, a) => i.map((n, s) => {
      let { fromRange: o, toRange: l, suffix: h } = e[s];
      return o && l && (n = Gt(o, l, n)), n = bt(n, a), h && (n += h), n;
    });
  }
  return r;
}
var R = new d({
  id: "xyz-d65",
  name: "XYZ D65",
  coords: {
    x: { name: "X" },
    y: { name: "Y" },
    z: { name: "Z" }
  },
  white: "D65",
  formats: {
    color: {
      ids: ["xyz-d65", "xyz"]
    }
  },
  aliases: ["xyz"]
});
class k extends d {
  /**
   * Creates a new RGB ColorSpace.
   * If coords are not specified, they will use the default RGB coords.
   * Instead of `fromBase()` and `toBase()` functions,
   * you can specify to/from XYZ matrices and have `toBase()` and `fromBase()` automatically generated.
   * @param {*} options - Same options as {@link ColorSpace} plus:
   * @param {number[][]} options.toXYZ_M - Matrix to convert to XYZ
   * @param {number[][]} options.fromXYZ_M - Matrix to convert from XYZ
   */
  constructor(t) {
    t.coords || (t.coords = {
      r: {
        range: [0, 1],
        name: "Red"
      },
      g: {
        range: [0, 1],
        name: "Green"
      },
      b: {
        range: [0, 1],
        name: "Blue"
      }
    }), t.base || (t.base = R), t.toXYZ_M && t.fromXYZ_M && (t.toBase ?? (t.toBase = (e) => {
      let i = M(t.toXYZ_M, e);
      return this.white !== this.base.white && (i = Mt(this.white, this.base.white, i)), i;
    }), t.fromBase ?? (t.fromBase = (e) => (e = Mt(this.base.white, this.white, e), M(t.fromXYZ_M, e)))), t.referred ?? (t.referred = "display"), super(t);
  }
}
function Ye(r, { meta: t } = {}) {
  var i, a, n, s, o;
  let e = { str: (i = String(r)) == null ? void 0 : i.trim() };
  if (X.run("parse-start", e), e.color)
    return e.color;
  if (e.parsed = Ee(e.str), e.parsed) {
    let l = e.parsed.name;
    if (l === "color") {
      let h = e.parsed.args.shift(), u = e.parsed.rawArgs.indexOf("/") > 0 ? e.parsed.args.pop() : 1;
      for (let f of d.all) {
        let m = f.getFormat("color");
        if (m && (h === m.id || (a = m.ids) != null && a.includes(h))) {
          const p = Object.keys(f.coords).map((b, y) => e.parsed.args[y] || 0);
          return t && (t.formatId = "color"), { spaceId: f.id, coords: p, alpha: u };
        }
      }
      let c = "";
      if (h in d.registry) {
        let f = (o = (s = (n = d.registry[h].formats) == null ? void 0 : n.functions) == null ? void 0 : s.color) == null ? void 0 : o.id;
        f && (c = `Did you mean color(${f})?`);
      }
      throw new TypeError(`Cannot parse color(${h}). ` + (c || "Missing a plugin?"));
    } else
      for (let h of d.all) {
        let u = h.getFormat(l);
        if (u && u.type === "function") {
          let c = 1;
          (u.lastAlpha || Be(e.parsed.args).alpha) && (c = e.parsed.args.pop());
          let f = e.parsed.args, m;
          return u.coordGrammar && (m = Object.entries(h.coords).map(([p, b], y) => {
            var U;
            let v = u.coordGrammar[y], w = (U = f[y]) == null ? void 0 : U.type, D = v.find(($) => $ == w);
            if (!D) {
              let $ = b.name || p;
              throw new TypeError(`${w} not allowed for ${$} in ${l}()`);
            }
            let x = D.range;
            w === "<percentage>" && (x || (x = [0, 1]));
            let L = b.range || b.refRange;
            return x && L && (f[y] = Gt(x, L, f[y])), D;
          })), t && Object.assign(t, { formatId: u.name, types: m }), {
            spaceId: h.id,
            coords: f,
            alpha: c
          };
        }
      }
  } else
    for (let l of d.all)
      for (let h in l.formats) {
        let u = l.formats[h];
        if (u.type !== "custom" || u.test && !u.test(e.str))
          continue;
        let c = u.parse(e.str);
        if (c)
          return c.alpha ?? (c.alpha = 1), t && (t.formatId = h), c;
      }
  throw new TypeError(`Could not parse ${r} as a color. Missing a plugin?`);
}
function g(r) {
  if (!r)
    throw new TypeError("Empty color reference");
  it(r) && (r = Ye(r));
  let t = r.space || r.spaceId;
  return t instanceof d || (r.space = d.get(t)), r.alpha === void 0 && (r.alpha = 1), r;
}
function at(r, t) {
  return t = d.get(t), t.from(r);
}
function P(r, t) {
  let { space: e, index: i } = d.resolveCoord(t, r.space);
  return at(r, e)[i];
}
function $e(r, t, e) {
  return t = d.get(t), r.coords = t.to(r.space, e), r;
}
function I(r, t, e) {
  if (r = g(r), arguments.length === 2 && O(arguments[1]) === "object") {
    let i = arguments[1];
    for (let a in i)
      I(r, a, i[a]);
  } else {
    typeof e == "function" && (e = e(P(r, t)));
    let { space: i, index: a } = d.resolveCoord(t, r.space), n = at(r, i);
    n[a] = e, $e(r, i, n);
  }
  return r;
}
var Zt = new d({
  id: "xyz-d50",
  name: "XYZ D50",
  white: "D50",
  base: R,
  fromBase: (r) => Mt(R.white, "D50", r),
  toBase: (r) => Mt("D50", R.white, r),
  formats: {
    color: {}
  }
});
const wr = 216 / 24389, re = 24 / 116, ot = 24389 / 27;
let Rt = E.D50;
var T = new d({
  id: "lab",
  name: "Lab",
  coords: {
    l: {
      refRange: [0, 100],
      name: "L"
    },
    a: {
      refRange: [-125, 125]
    },
    b: {
      refRange: [-125, 125]
    }
  },
  // Assuming XYZ is relative to D50, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  white: Rt,
  base: Zt,
  // Convert D50-adapted XYX to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(r) {
    let e = r.map((i, a) => i / Rt[a]).map((i) => i > wr ? Math.cbrt(i) : (ot * i + 16) / 116);
    return [
      116 * e[1] - 16,
      // L
      500 * (e[0] - e[1]),
      // a
      200 * (e[1] - e[2])
      // b
    ];
  },
  // Convert Lab to D50-adapted XYZ
  // Same result as CIE 15.3:2004 Appendix D although the derivation is different
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  toBase(r) {
    let t = [];
    return t[1] = (r[0] + 16) / 116, t[0] = r[1] / 500 + t[1], t[2] = t[1] - r[2] / 200, [
      t[0] > re ? Math.pow(t[0], 3) : (116 * t[0] - 16) / ot,
      r[0] > 8 ? Math.pow((r[0] + 16) / 116, 3) : r[0] / ot,
      t[2] > re ? Math.pow(t[2], 3) : (116 * t[2] - 16) / ot
    ].map((i, a) => i * Rt[a]);
  },
  formats: {
    lab: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function St(r) {
  return (r % 360 + 360) % 360;
}
function kr(r, t) {
  if (r === "raw")
    return t;
  let [e, i] = t.map(St), a = i - e;
  return r === "increasing" ? a < 0 && (i += 360) : r === "decreasing" ? a > 0 && (e += 360) : r === "longer" ? -180 < a && a < 180 && (a > 0 ? e += 360 : i += 360) : r === "shorter" && (a > 180 ? e += 360 : a < -180 && (i += 360)), [e, i];
}
var tt = new d({
  id: "lch",
  name: "LCH",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    c: {
      refRange: [0, 150],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: T,
  fromBase(r) {
    let [t, e, i] = r, a;
    const n = 0.02;
    return Math.abs(e) < n && Math.abs(i) < n ? a = NaN : a = Math.atan2(i, e) * 180 / Math.PI, [
      t,
      // L is still L
      Math.sqrt(e ** 2 + i ** 2),
      // Chroma
      St(a)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(r) {
    let [t, e, i] = r;
    return e < 0 && (e = 0), isNaN(i) && (i = 0), [
      t,
      // L is still L
      e * Math.cos(i * Math.PI / 180),
      // a
      e * Math.sin(i * Math.PI / 180)
      // b
    ];
  },
  formats: {
    lch: {
      coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"]
    }
  }
});
const ie = 25 ** 7, vt = Math.PI, ae = 180 / vt, N = vt / 180;
function $t(r, t, { kL: e = 1, kC: i = 1, kH: a = 1 } = {}) {
  let [n, s, o] = T.from(r), l = tt.from(T, [n, s, o])[1], [h, u, c] = T.from(t), f = tt.from(T, [h, u, c])[1];
  l < 0 && (l = 0), f < 0 && (f = 0);
  let p = ((l + f) / 2) ** 7, b = 0.5 * (1 - Math.sqrt(p / (p + ie))), y = (1 + b) * s, v = (1 + b) * u, w = Math.sqrt(y ** 2 + o ** 2), D = Math.sqrt(v ** 2 + c ** 2), x = y === 0 && o === 0 ? 0 : Math.atan2(o, y), L = v === 0 && c === 0 ? 0 : Math.atan2(c, v);
  x < 0 && (x += 2 * vt), L < 0 && (L += 2 * vt), x *= ae, L *= ae;
  let U = h - n, $ = D - w, z = L - x, H = x + L, Ht = Math.abs(z), W;
  w * D === 0 ? W = 0 : Ht <= 180 ? W = z : z > 180 ? W = z - 360 : z < -180 ? W = z + 360 : console.log("the unthinkable has happened");
  let Wt = 2 * Math.sqrt(D * w) * Math.sin(W * N / 2), cr = (n + h) / 2, Dt = (w + D) / 2, Jt = Math.pow(Dt, 7), Y;
  w * D === 0 ? Y = H : Ht <= 180 ? Y = H / 2 : H < 360 ? Y = (H + 360) / 2 : Y = (H - 360) / 2;
  let Qt = (cr - 50) ** 2, fr = 1 + 0.015 * Qt / Math.sqrt(20 + Qt), Kt = 1 + 0.045 * Dt, J = 1;
  J -= 0.17 * Math.cos((Y - 30) * N), J += 0.24 * Math.cos(2 * Y * N), J += 0.32 * Math.cos((3 * Y + 6) * N), J -= 0.2 * Math.cos((4 * Y - 63) * N);
  let te = 1 + 0.015 * Dt * J, dr = 30 * Math.exp(-1 * ((Y - 275) / 25) ** 2), mr = 2 * Math.sqrt(Jt / (Jt + ie)), gr = -1 * Math.sin(2 * dr * N) * mr, st = (U / (e * fr)) ** 2;
  return st += ($ / (i * Kt)) ** 2, st += (Wt / (a * te)) ** 2, st += gr * ($ / (i * Kt)) * (Wt / (a * te)), Math.sqrt(st);
}
const xr = 75e-6;
function K(r, t = r.space, { epsilon: e = xr } = {}) {
  r = g(r), t = d.get(t);
  let i = r.coords;
  return t !== r.space && (i = t.from(r)), t.inGamut(i, { epsilon: e });
}
function et(r) {
  return {
    space: r.space,
    coords: r.coords.slice(),
    alpha: r.alpha
  };
}
function j(r, { method: t = F.gamut_mapping, space: e = r.space } = {}) {
  if (it(arguments[1]) && (e = arguments[1]), e = d.get(e), K(r, e, { epsilon: 0 }))
    return g(r);
  let i = A(r, e);
  if (t !== "clip" && !K(r, e)) {
    let a = j(et(i), { method: "clip", space: e });
    if ($t(r, a) > 2) {
      let n = d.resolveCoord(t), s = n.space, o = n.id, l = A(i, s), u = (n.range || n.refRange)[0], c = 0.01, f = u, m = P(l, o);
      for (; m - f > c; ) {
        let p = et(l);
        p = j(p, { space: e, method: "clip" }), $t(l, p) - 2 < c ? f = P(l, o) : m = P(l, o), I(l, o, (f + m) / 2);
      }
      i = A(l, e);
    } else
      i = a;
  }
  if (t === "clip" || !K(i, e, { epsilon: 0 })) {
    let a = Object.values(e.coords).map((n) => n.range || []);
    i.coords = i.coords.map((n, s) => {
      let [o, l] = a[s];
      return o !== void 0 && (n = Math.max(o, n)), l !== void 0 && (n = Math.min(n, l)), n;
    });
  }
  return e !== r.space && (i = A(i, r.space)), r.coords = i.coords, r;
}
j.returns = "color";
function A(r, t, { inGamut: e } = {}) {
  r = g(r), t = d.get(t);
  let i = t.from(r), a = { space: t, coords: i, alpha: r.alpha };
  return e && (a = j(a)), a;
}
A.returns = "color";
function wt(r, {
  precision: t = F.precision,
  format: e = "default",
  inGamut: i = !0,
  ...a
} = {}) {
  var l;
  let n;
  r = g(r);
  let s = e;
  e = r.space.getFormat(e) ?? r.space.getFormat("default") ?? d.DEFAULT_FORMAT, i || (i = e.toGamut);
  let o = r.coords;
  if (o = o.map((h) => h || 0), i && !K(r) && (o = j(et(r), i === !0 ? void 0 : i).coords), e.type === "custom")
    if (a.precision = t, e.serialize)
      n = e.serialize(o, r.alpha, a);
    else
      throw new TypeError(`format ${s} can only be used to parse colors, not for serialization`);
  else {
    let h = e.name || "color";
    e.serializeCoords ? o = e.serializeCoords(o, t) : t !== null && (o = o.map((m) => bt(m, t)));
    let u = [...o];
    if (h === "color") {
      let m = e.id || ((l = e.ids) == null ? void 0 : l[0]) || r.space.id;
      u.unshift(m);
    }
    let c = r.alpha;
    t !== null && (c = bt(c, t));
    let f = r.alpha < 1 && !e.noAlpha ? `${e.commas ? "," : " /"} ${c}` : "";
    n = `${h}(${u.join(e.commas ? ", " : " ")}${f})`;
  }
  return n;
}
const Sr = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791]
], Cr = [
  [1.716651187971268, -0.355670783776392, -0.25336628137366],
  [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
  [0.017639857445311, -0.042770613257809, 0.942103121235474]
];
var Ct = new k({
  id: "rec2020-linear",
  name: "Linear REC.2020",
  white: "D65",
  toXYZ_M: Sr,
  fromXYZ_M: Cr,
  formats: {
    color: {}
  }
});
const lt = 1.09929682680944, ne = 0.018053968510807;
var Oe = new k({
  id: "rec2020",
  name: "REC.2020",
  base: Ct,
  // Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
  toBase(r) {
    return r.map(function(t) {
      return t < ne * 4.5 ? t / 4.5 : Math.pow((t + lt - 1) / lt, 1 / 0.45);
    });
  },
  fromBase(r) {
    return r.map(function(t) {
      return t >= ne ? lt * Math.pow(t, 0.45) - (lt - 1) : 4.5 * t;
    });
  },
  formats: {
    color: {}
  }
});
const Tr = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976]
], Dr = [
  [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
  [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
  [0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
];
var Xe = new k({
  id: "p3-linear",
  name: "Linear P3",
  white: "D65",
  toXYZ_M: Tr,
  fromXYZ_M: Dr
});
const Ar = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
], Rr = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
];
var Ie = new k({
  id: "srgb-linear",
  name: "Linear sRGB",
  white: "D65",
  toXYZ_M: Ar,
  fromXYZ_M: Rr,
  formats: {
    color: {}
  }
}), se = {
  aliceblue: [240 / 255, 248 / 255, 1],
  antiquewhite: [250 / 255, 235 / 255, 215 / 255],
  aqua: [0, 1, 1],
  aquamarine: [127 / 255, 1, 212 / 255],
  azure: [240 / 255, 1, 1],
  beige: [245 / 255, 245 / 255, 220 / 255],
  bisque: [1, 228 / 255, 196 / 255],
  black: [0, 0, 0],
  blanchedalmond: [1, 235 / 255, 205 / 255],
  blue: [0, 0, 1],
  blueviolet: [138 / 255, 43 / 255, 226 / 255],
  brown: [165 / 255, 42 / 255, 42 / 255],
  burlywood: [222 / 255, 184 / 255, 135 / 255],
  cadetblue: [95 / 255, 158 / 255, 160 / 255],
  chartreuse: [127 / 255, 1, 0],
  chocolate: [210 / 255, 105 / 255, 30 / 255],
  coral: [1, 127 / 255, 80 / 255],
  cornflowerblue: [100 / 255, 149 / 255, 237 / 255],
  cornsilk: [1, 248 / 255, 220 / 255],
  crimson: [220 / 255, 20 / 255, 60 / 255],
  cyan: [0, 1, 1],
  darkblue: [0, 0, 139 / 255],
  darkcyan: [0, 139 / 255, 139 / 255],
  darkgoldenrod: [184 / 255, 134 / 255, 11 / 255],
  darkgray: [169 / 255, 169 / 255, 169 / 255],
  darkgreen: [0, 100 / 255, 0],
  darkgrey: [169 / 255, 169 / 255, 169 / 255],
  darkkhaki: [189 / 255, 183 / 255, 107 / 255],
  darkmagenta: [139 / 255, 0, 139 / 255],
  darkolivegreen: [85 / 255, 107 / 255, 47 / 255],
  darkorange: [1, 140 / 255, 0],
  darkorchid: [153 / 255, 50 / 255, 204 / 255],
  darkred: [139 / 255, 0, 0],
  darksalmon: [233 / 255, 150 / 255, 122 / 255],
  darkseagreen: [143 / 255, 188 / 255, 143 / 255],
  darkslateblue: [72 / 255, 61 / 255, 139 / 255],
  darkslategray: [47 / 255, 79 / 255, 79 / 255],
  darkslategrey: [47 / 255, 79 / 255, 79 / 255],
  darkturquoise: [0, 206 / 255, 209 / 255],
  darkviolet: [148 / 255, 0, 211 / 255],
  deeppink: [1, 20 / 255, 147 / 255],
  deepskyblue: [0, 191 / 255, 1],
  dimgray: [105 / 255, 105 / 255, 105 / 255],
  dimgrey: [105 / 255, 105 / 255, 105 / 255],
  dodgerblue: [30 / 255, 144 / 255, 1],
  firebrick: [178 / 255, 34 / 255, 34 / 255],
  floralwhite: [1, 250 / 255, 240 / 255],
  forestgreen: [34 / 255, 139 / 255, 34 / 255],
  fuchsia: [1, 0, 1],
  gainsboro: [220 / 255, 220 / 255, 220 / 255],
  ghostwhite: [248 / 255, 248 / 255, 1],
  gold: [1, 215 / 255, 0],
  goldenrod: [218 / 255, 165 / 255, 32 / 255],
  gray: [128 / 255, 128 / 255, 128 / 255],
  green: [0, 128 / 255, 0],
  greenyellow: [173 / 255, 1, 47 / 255],
  grey: [128 / 255, 128 / 255, 128 / 255],
  honeydew: [240 / 255, 1, 240 / 255],
  hotpink: [1, 105 / 255, 180 / 255],
  indianred: [205 / 255, 92 / 255, 92 / 255],
  indigo: [75 / 255, 0, 130 / 255],
  ivory: [1, 1, 240 / 255],
  khaki: [240 / 255, 230 / 255, 140 / 255],
  lavender: [230 / 255, 230 / 255, 250 / 255],
  lavenderblush: [1, 240 / 255, 245 / 255],
  lawngreen: [124 / 255, 252 / 255, 0],
  lemonchiffon: [1, 250 / 255, 205 / 255],
  lightblue: [173 / 255, 216 / 255, 230 / 255],
  lightcoral: [240 / 255, 128 / 255, 128 / 255],
  lightcyan: [224 / 255, 1, 1],
  lightgoldenrodyellow: [250 / 255, 250 / 255, 210 / 255],
  lightgray: [211 / 255, 211 / 255, 211 / 255],
  lightgreen: [144 / 255, 238 / 255, 144 / 255],
  lightgrey: [211 / 255, 211 / 255, 211 / 255],
  lightpink: [1, 182 / 255, 193 / 255],
  lightsalmon: [1, 160 / 255, 122 / 255],
  lightseagreen: [32 / 255, 178 / 255, 170 / 255],
  lightskyblue: [135 / 255, 206 / 255, 250 / 255],
  lightslategray: [119 / 255, 136 / 255, 153 / 255],
  lightslategrey: [119 / 255, 136 / 255, 153 / 255],
  lightsteelblue: [176 / 255, 196 / 255, 222 / 255],
  lightyellow: [1, 1, 224 / 255],
  lime: [0, 1, 0],
  limegreen: [50 / 255, 205 / 255, 50 / 255],
  linen: [250 / 255, 240 / 255, 230 / 255],
  magenta: [1, 0, 1],
  maroon: [128 / 255, 0, 0],
  mediumaquamarine: [102 / 255, 205 / 255, 170 / 255],
  mediumblue: [0, 0, 205 / 255],
  mediumorchid: [186 / 255, 85 / 255, 211 / 255],
  mediumpurple: [147 / 255, 112 / 255, 219 / 255],
  mediumseagreen: [60 / 255, 179 / 255, 113 / 255],
  mediumslateblue: [123 / 255, 104 / 255, 238 / 255],
  mediumspringgreen: [0, 250 / 255, 154 / 255],
  mediumturquoise: [72 / 255, 209 / 255, 204 / 255],
  mediumvioletred: [199 / 255, 21 / 255, 133 / 255],
  midnightblue: [25 / 255, 25 / 255, 112 / 255],
  mintcream: [245 / 255, 1, 250 / 255],
  mistyrose: [1, 228 / 255, 225 / 255],
  moccasin: [1, 228 / 255, 181 / 255],
  navajowhite: [1, 222 / 255, 173 / 255],
  navy: [0, 0, 128 / 255],
  oldlace: [253 / 255, 245 / 255, 230 / 255],
  olive: [128 / 255, 128 / 255, 0],
  olivedrab: [107 / 255, 142 / 255, 35 / 255],
  orange: [1, 165 / 255, 0],
  orangered: [1, 69 / 255, 0],
  orchid: [218 / 255, 112 / 255, 214 / 255],
  palegoldenrod: [238 / 255, 232 / 255, 170 / 255],
  palegreen: [152 / 255, 251 / 255, 152 / 255],
  paleturquoise: [175 / 255, 238 / 255, 238 / 255],
  palevioletred: [219 / 255, 112 / 255, 147 / 255],
  papayawhip: [1, 239 / 255, 213 / 255],
  peachpuff: [1, 218 / 255, 185 / 255],
  peru: [205 / 255, 133 / 255, 63 / 255],
  pink: [1, 192 / 255, 203 / 255],
  plum: [221 / 255, 160 / 255, 221 / 255],
  powderblue: [176 / 255, 224 / 255, 230 / 255],
  purple: [128 / 255, 0, 128 / 255],
  rebeccapurple: [102 / 255, 51 / 255, 153 / 255],
  red: [1, 0, 0],
  rosybrown: [188 / 255, 143 / 255, 143 / 255],
  royalblue: [65 / 255, 105 / 255, 225 / 255],
  saddlebrown: [139 / 255, 69 / 255, 19 / 255],
  salmon: [250 / 255, 128 / 255, 114 / 255],
  sandybrown: [244 / 255, 164 / 255, 96 / 255],
  seagreen: [46 / 255, 139 / 255, 87 / 255],
  seashell: [1, 245 / 255, 238 / 255],
  sienna: [160 / 255, 82 / 255, 45 / 255],
  silver: [192 / 255, 192 / 255, 192 / 255],
  skyblue: [135 / 255, 206 / 255, 235 / 255],
  slateblue: [106 / 255, 90 / 255, 205 / 255],
  slategray: [112 / 255, 128 / 255, 144 / 255],
  slategrey: [112 / 255, 128 / 255, 144 / 255],
  snow: [1, 250 / 255, 250 / 255],
  springgreen: [0, 1, 127 / 255],
  steelblue: [70 / 255, 130 / 255, 180 / 255],
  tan: [210 / 255, 180 / 255, 140 / 255],
  teal: [0, 128 / 255, 128 / 255],
  thistle: [216 / 255, 191 / 255, 216 / 255],
  tomato: [1, 99 / 255, 71 / 255],
  turquoise: [64 / 255, 224 / 255, 208 / 255],
  violet: [238 / 255, 130 / 255, 238 / 255],
  wheat: [245 / 255, 222 / 255, 179 / 255],
  white: [1, 1, 1],
  whitesmoke: [245 / 255, 245 / 255, 245 / 255],
  yellow: [1, 1, 0],
  yellowgreen: [154 / 255, 205 / 255, 50 / 255]
};
let oe = Array(3).fill("<percentage> | <number>[0, 255]"), le = Array(3).fill("<number>[0, 255]");
var rt = new k({
  id: "srgb",
  name: "sRGB",
  base: Ie,
  fromBase: (r) => r.map((t) => {
    let e = t < 0 ? -1 : 1, i = t * e;
    return i > 31308e-7 ? e * (1.055 * i ** (1 / 2.4) - 0.055) : 12.92 * t;
  }),
  toBase: (r) => r.map((t) => {
    let e = t < 0 ? -1 : 1, i = t * e;
    return i < 0.04045 ? t / 12.92 : e * ((i + 0.055) / 1.055) ** 2.4;
  }),
  formats: {
    rgb: {
      coords: oe
    },
    rgb_number: {
      name: "rgb",
      commas: !0,
      coords: le,
      noAlpha: !0
    },
    color: {
      /* use defaults */
    },
    rgba: {
      coords: oe,
      commas: !0,
      lastAlpha: !0
    },
    rgba_number: {
      name: "rgba",
      commas: !0,
      coords: le
    },
    hex: {
      type: "custom",
      toGamut: !0,
      test: (r) => /^#([a-f0-9]{3,4}){1,2}$/i.test(r),
      parse(r) {
        r.length <= 5 && (r = r.replace(/[a-f0-9]/gi, "$&$&"));
        let t = [];
        return r.replace(/[a-f0-9]{2}/gi, (e) => {
          t.push(parseInt(e, 16) / 255);
        }), {
          spaceId: "srgb",
          coords: t.slice(0, 3),
          alpha: t.slice(3)[0]
        };
      },
      serialize: (r, t, {
        collapse: e = !0
        // collapse to 3-4 digit hex when possible?
      } = {}) => {
        t < 1 && r.push(t), r = r.map((n) => Math.round(n * 255));
        let i = e && r.every((n) => n % 17 === 0);
        return "#" + r.map((n) => i ? (n / 17).toString(16) : n.toString(16).padStart(2, "0")).join("");
      }
    },
    keyword: {
      type: "custom",
      test: (r) => /^[a-z]+$/i.test(r),
      parse(r) {
        r = r.toLowerCase();
        let t = { spaceId: "srgb", coords: null, alpha: 1 };
        if (r === "transparent" ? (t.coords = se.black, t.alpha = 0) : t.coords = se[r], t.coords)
          return t;
      }
    }
  }
}), je = new k({
  id: "p3",
  name: "P3",
  base: Xe,
  // Gamma encoding/decoding is the same as sRGB
  fromBase: rt.fromBase,
  toBase: rt.toBase,
  formats: {
    color: {
      id: "display-p3"
    }
  }
});
F.display_space = rt;
if (typeof CSS < "u" && CSS.supports)
  for (let r of [T, Oe, je]) {
    let t = r.getMinCoords(), i = wt({ space: r, coords: t, alpha: 1 });
    if (CSS.supports("color", i)) {
      F.display_space = r;
      break;
    }
  }
function Pr(r, { space: t = F.display_space, ...e } = {}) {
  let i = wt(r, e);
  if (typeof CSS > "u" || CSS.supports("color", i) || !F.display_space)
    i = new String(i), i.color = r;
  else {
    let a = A(r, t);
    i = new String(wt(a, e)), i.color = a;
  }
  return i;
}
function qe(r, t, e = "lab") {
  e = d.get(e);
  let i = e.from(r), a = e.from(t);
  return Math.sqrt(i.reduce((n, s, o) => {
    let l = a[o];
    return isNaN(s) || isNaN(l) ? n : n + (l - s) ** 2;
  }, 0));
}
function Lr(r, t) {
  return r = g(r), t = g(t), r.space === t.space && r.alpha === t.alpha && r.coords.every((e, i) => e === t.coords[i]);
}
function q(r) {
  return P(r, [R, "y"]);
}
function Ge(r, t) {
  I(r, [R, "y"], t);
}
function Er(r) {
  Object.defineProperty(r.prototype, "luminance", {
    get() {
      return q(this);
    },
    set(t) {
      Ge(this, t);
    }
  });
}
var Br = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getLuminance: q,
  register: Er,
  setLuminance: Ge
});
function zr(r, t) {
  r = g(r), t = g(t);
  let e = Math.max(q(r), 0), i = Math.max(q(t), 0);
  return i > e && ([e, i] = [i, e]), (e + 0.05) / (i + 0.05);
}
const Fr = 0.56, Yr = 0.57, $r = 0.62, Or = 0.65, he = 0.022, Xr = 1.414, Ir = 0.1, jr = 5e-4, qr = 1.14, ue = 0.027, Gr = 1.14;
function ce(r) {
  return r >= he ? r : r + (he - r) ** Xr;
}
function V(r) {
  let t = r < 0 ? -1 : 1, e = Math.abs(r);
  return t * Math.pow(e, 2.4);
}
function Zr(r, t) {
  t = g(t), r = g(r);
  let e, i, a, n, s, o;
  t = A(t, "srgb"), [n, s, o] = t.coords;
  let l = V(n) * 0.2126729 + V(s) * 0.7151522 + V(o) * 0.072175;
  r = A(r, "srgb"), [n, s, o] = r.coords;
  let h = V(n) * 0.2126729 + V(s) * 0.7151522 + V(o) * 0.072175, u = ce(l), c = ce(h), f = c > u;
  return Math.abs(c - u) < jr ? i = 0 : f ? (e = c ** Fr - u ** Yr, i = e * qr) : (e = c ** Or - u ** $r, i = e * Gr), Math.abs(i) < Ir ? a = 0 : i > 0 ? a = i - ue : a = i + ue, a * 100;
}
function Ur(r, t) {
  r = g(r), t = g(t);
  let e = Math.max(q(r), 0), i = Math.max(q(t), 0);
  i > e && ([e, i] = [i, e]);
  let a = e + i;
  return a === 0 ? 0 : (e - i) / a;
}
const Nr = 5e4;
function Vr(r, t) {
  r = g(r), t = g(t);
  let e = Math.max(q(r), 0), i = Math.max(q(t), 0);
  return i > e && ([e, i] = [i, e]), i === 0 ? Nr : (e - i) / i;
}
function Hr(r, t) {
  r = g(r), t = g(t);
  let e = P(r, [T, "l"]), i = P(t, [T, "l"]);
  return Math.abs(e - i);
}
const Wr = 216 / 24389, fe = 24 / 116, ht = 24389 / 27;
let Pt = E.D65;
var Ot = new d({
  id: "lab-d65",
  name: "Lab D65",
  coords: {
    l: {
      refRange: [0, 100],
      name: "L"
    },
    a: {
      refRange: [-125, 125]
    },
    b: {
      refRange: [-125, 125]
    }
  },
  // Assuming XYZ is relative to D65, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  white: Pt,
  base: R,
  // Convert D65-adapted XYZ to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(r) {
    let e = r.map((i, a) => i / Pt[a]).map((i) => i > Wr ? Math.cbrt(i) : (ht * i + 16) / 116);
    return [
      116 * e[1] - 16,
      // L
      500 * (e[0] - e[1]),
      // a
      200 * (e[1] - e[2])
      // b
    ];
  },
  // Convert Lab to D65-adapted XYZ
  // Same result as CIE 15.3:2004 Appendix D although the derivation is different
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  toBase(r) {
    let t = [];
    return t[1] = (r[0] + 16) / 116, t[0] = r[1] / 500 + t[1], t[2] = t[1] - r[2] / 200, [
      t[0] > fe ? Math.pow(t[0], 3) : (116 * t[0] - 16) / ht,
      r[0] > 8 ? Math.pow((r[0] + 16) / 116, 3) : r[0] / ht,
      t[2] > fe ? Math.pow(t[2], 3) : (116 * t[2] - 16) / ht
    ].map((i, a) => i * Pt[a]);
  },
  formats: {
    "lab-d65": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
const Lt = Math.pow(5, 0.5) * 0.5 + 0.5;
function Jr(r, t) {
  r = g(r), t = g(t);
  let e = P(r, [Ot, "l"]), i = P(t, [Ot, "l"]), a = Math.abs(Math.pow(e, Lt) - Math.pow(i, Lt)), n = Math.pow(a, 1 / Lt) * Math.SQRT2 - 40;
  return n < 7.5 ? 0 : n;
}
var pt = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  contrastAPCA: Zr,
  contrastDeltaPhi: Jr,
  contrastLstar: Hr,
  contrastMichelson: Ur,
  contrastWCAG21: zr,
  contrastWeber: Vr
});
function Qr(r, t, e = {}) {
  it(e) && (e = { algorithm: e });
  let { algorithm: i, ...a } = e;
  if (!i) {
    let n = Object.keys(pt).map((s) => s.replace(/^contrast/, "")).join(", ");
    throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${n}`);
  }
  r = g(r), t = g(t);
  for (let n in pt)
    if ("contrast" + i.toLowerCase() === n.toLowerCase())
      return pt[n](r, t, a);
  throw new TypeError(`Unknown contrast algorithm: ${i}`);
}
function Ze(r) {
  let [t, e, i] = at(r, R), a = t + 15 * e + 3 * i;
  return [4 * t / a, 9 * e / a];
}
function Ue(r) {
  let [t, e, i] = at(r, R), a = t + e + i;
  return [t / a, e / a];
}
function Kr(r) {
  Object.defineProperty(r.prototype, "uv", {
    get() {
      return Ze(this);
    }
  }), Object.defineProperty(r.prototype, "xy", {
    get() {
      return Ue(this);
    }
  });
}
var ti = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  register: Kr,
  uv: Ze,
  xy: Ue
});
function ei(r, t) {
  return qe(r, t, "lab");
}
const ri = Math.PI, de = ri / 180;
function ii(r, t, { l: e = 2, c: i = 1 } = {}) {
  let [a, n, s] = T.from(r), [, o, l] = tt.from(T, [a, n, s]), [h, u, c] = T.from(t), f = tt.from(T, [h, u, c])[1];
  o < 0 && (o = 0), f < 0 && (f = 0);
  let m = a - h, p = o - f, b = n - u, y = s - c, v = b ** 2 + y ** 2 - p ** 2, w = 0.511;
  a >= 16 && (w = 0.040975 * a / (1 + 0.01765 * a));
  let D = 0.0638 * o / (1 + 0.0131 * o) + 0.638, x;
  Number.isNaN(l) && (l = 0), l >= 164 && l <= 345 ? x = 0.56 + Math.abs(0.2 * Math.cos((l + 168) * de)) : x = 0.36 + Math.abs(0.4 * Math.cos((l + 35) * de));
  let L = Math.pow(o, 4), U = Math.sqrt(L / (L + 1900)), $ = D * (U * x + 1 - U), z = (m / (e * w)) ** 2;
  return z += (p / (i * D)) ** 2, z += v / $ ** 2, Math.sqrt(z);
}
const me = 203;
var Ut = new d({
  // Absolute CIE XYZ, with a D65 whitepoint,
  // as used in most HDR colorspaces as a starting point.
  // SDR spaces are converted per BT.2048
  // so that diffuse, media white is 203 cd/m²
  id: "xyz-abs-d65",
  name: "Absolute XYZ D65",
  coords: {
    x: {
      refRange: [0, 9504.7],
      name: "Xa"
    },
    y: {
      refRange: [0, 1e4],
      name: "Ya"
    },
    z: {
      refRange: [0, 10888.3],
      name: "Za"
    }
  },
  base: R,
  fromBase(r) {
    return r.map((t) => Math.max(t * me, 0));
  },
  toBase(r) {
    return r.map((t) => Math.max(t / me, 0));
  }
});
const ut = 1.15, ct = 0.66, ge = 2610 / 2 ** 14, ai = 2 ** 14 / 2610, pe = 3424 / 2 ** 12, _e = 2413 / 2 ** 7, be = 2392 / 2 ** 7, ni = 1.7 * 2523 / 2 ** 5, ye = 2 ** 5 / (1.7 * 2523), ft = -0.56, Et = 16295499532821565e-27, si = [
  [0.41478972, 0.579999, 0.014648],
  [-0.20151, 1.120649, 0.0531008],
  [-0.0166008, 0.2648, 0.6684799]
], oi = [
  [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
  [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
  [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603]
], li = [
  [0.5, 0.5, 0],
  [3.524, -4.066708, 0.542708],
  [0.199076, 1.096799, -1.295875]
], hi = [
  [1, 0.1386050432715393, 0.05804731615611886],
  [0.9999999999999999, -0.1386050432715393, -0.05804731615611886],
  [0.9999999999999998, -0.09601924202631895, -0.8118918960560388]
];
var Ne = new d({
  id: "jzazbz",
  name: "Jzazbz",
  coords: {
    jz: {
      refRange: [0, 1],
      name: "Jz"
    },
    az: {
      refRange: [-0.5, 0.5]
    },
    bz: {
      refRange: [-0.5, 0.5]
    }
  },
  base: Ut,
  fromBase(r) {
    let [t, e, i] = r, a = ut * t - (ut - 1) * i, n = ct * e - (ct - 1) * t, o = M(si, [a, n, i]).map(function(f) {
      let m = pe + _e * (f / 1e4) ** ge, p = 1 + be * (f / 1e4) ** ge;
      return (m / p) ** ni;
    }), [l, h, u] = M(li, o);
    return [(1 + ft) * l / (1 + ft * l) - Et, h, u];
  },
  toBase(r) {
    let [t, e, i] = r, a = (t + Et) / (1 + ft - ft * (t + Et)), s = M(hi, [a, e, i]).map(function(f) {
      let m = pe - f ** ye, p = be * f ** ye - _e;
      return 1e4 * (m / p) ** ai;
    }), [o, l, h] = M(oi, s), u = (o + (ut - 1) * h) / ut, c = (l + (ct - 1) * u) / ct;
    return [u, c, h];
  },
  formats: {
    // https://drafts.csswg.org/css-color-hdr/#Jzazbz
    color: {}
  }
}), Xt = new d({
  id: "jzczhz",
  name: "JzCzHz",
  coords: {
    jz: {
      refRange: [0, 1],
      name: "Jz"
    },
    cz: {
      refRange: [0, 1],
      name: "Chroma"
    },
    hz: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: Ne,
  fromBase(r) {
    let [t, e, i] = r, a;
    const n = 2e-4;
    return Math.abs(e) < n && Math.abs(i) < n ? a = NaN : a = Math.atan2(i, e) * 180 / Math.PI, [
      t,
      // Jz is still Jz
      Math.sqrt(e ** 2 + i ** 2),
      // Chroma
      St(a)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(r) {
    return [
      r[0],
      // Jz is still Jz
      r[1] * Math.cos(r[2] * Math.PI / 180),
      // az
      r[1] * Math.sin(r[2] * Math.PI / 180)
      // bz
    ];
  },
  formats: {
    color: {}
  }
});
function ui(r, t) {
  let [e, i, a] = Xt.from(r), [n, s, o] = Xt.from(t), l = e - n, h = i - s;
  Number.isNaN(a) && Number.isNaN(o) ? (a = 0, o = 0) : Number.isNaN(a) ? a = o : Number.isNaN(o) && (o = a);
  let u = a - o, c = 2 * Math.sqrt(i * s) * Math.sin(u / 2 * (Math.PI / 180));
  return Math.sqrt(l ** 2 + h ** 2 + c ** 2);
}
const Ve = 3424 / 4096, He = 2413 / 128, We = 2392 / 128, Me = 2610 / 16384, ci = 2523 / 32, fi = 16384 / 2610, ve = 32 / 2523, di = [
  [0.3592, 0.6976, -0.0358],
  [-0.1922, 1.1004, 0.0755],
  [7e-3, 0.0749, 0.8434]
], mi = [
  [2048 / 4096, 2048 / 4096, 0],
  [6610 / 4096, -13613 / 4096, 7003 / 4096],
  [17933 / 4096, -17390 / 4096, -543 / 4096]
], gi = [
  [0.9999888965628402, 0.008605050147287059, 0.11103437159861648],
  [1.00001110343716, -0.008605050147287059, -0.11103437159861648],
  [1.0000320633910054, 0.56004913547279, -0.3206339100541203]
], pi = [
  [2.0701800566956137, -1.326456876103021, 0.20661600684785517],
  [0.3649882500326575, 0.6804673628522352, -0.04542175307585323],
  [-0.04959554223893211, -0.04942116118675749, 1.1879959417328034]
];
var It = new d({
  id: "ictcp",
  name: "ICTCP",
  // From BT.2100-2 page 7:
  // During production, signal values are expected to exceed the
  // range E′ = [0.0 : 1.0]. This provides processing headroom and avoids
  // signal degradation during cascaded processing. Such values of E′,
  // below 0.0 or exceeding 1.0, should not be clipped during production
  // and exchange.
  // Values below 0.0 should not be clipped in reference displays (even
  // though they represent “negative” light) to allow the black level of
  // the signal (LB) to be properly set using test signals known as “PLUGE”
  coords: {
    i: {
      refRange: [0, 1],
      // Constant luminance,
      name: "I"
    },
    ct: {
      refRange: [-0.5, 0.5],
      // Full BT.2020 gamut in range [-0.5, 0.5]
      name: "CT"
    },
    cp: {
      refRange: [-0.5, 0.5],
      name: "CP"
    }
  },
  base: Ut,
  fromBase(r) {
    let t = M(di, r);
    return _i(t);
  },
  toBase(r) {
    let t = bi(r);
    return M(pi, t);
  },
  formats: {
    color: {}
  }
});
function _i(r) {
  let t = r.map(function(e) {
    let i = Ve + He * (e / 1e4) ** Me, a = 1 + We * (e / 1e4) ** Me;
    return (i / a) ** ci;
  });
  return M(mi, t);
}
function bi(r) {
  return M(gi, r).map(function(i) {
    let a = Math.max(i ** ve - Ve, 0), n = He - We * i ** ve;
    return 1e4 * (a / n) ** fi;
  });
}
function yi(r, t) {
  let [e, i, a] = It.from(r), [n, s, o] = It.from(t);
  return 720 * Math.sqrt((e - n) ** 2 + 0.25 * (i - s) ** 2 + (a - o) ** 2);
}
const Mi = [
  [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
  [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
  [0.048177199566046255, 0.26423952494422764, 0.6335478258136937]
], vi = [
  [1.2268798733741557, -0.5578149965554813, 0.28139105017721583],
  [-0.04057576262431372, 1.1122868293970594, -0.07171106666151701],
  [-0.07637294974672142, -0.4214933239627914, 1.5869240244272418]
], wi = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766]
], ki = [
  [0.9999999984505198, 0.39633779217376786, 0.2158037580607588],
  [1.0000000088817609, -0.10556134232365635, -0.06385417477170591],
  [1.0000000546724108, -0.08948418209496575, -1.2914855378640917]
];
var kt = new d({
  id: "oklab",
  name: "Oklab",
  coords: {
    l: {
      refRange: [0, 1],
      name: "L"
    },
    a: {
      refRange: [-0.4, 0.4]
    },
    b: {
      refRange: [-0.4, 0.4]
    }
  },
  // Note that XYZ is relative to D65
  white: "D65",
  base: R,
  fromBase(r) {
    let e = M(Mi, r).map((i) => Math.cbrt(i));
    return M(wi, e);
  },
  toBase(r) {
    let e = M(ki, r).map((i) => i ** 3);
    return M(vi, e);
  },
  formats: {
    oklab: {
      coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function xi(r, t) {
  let [e, i, a] = kt.from(r), [n, s, o] = kt.from(t), l = e - n, h = i - s, u = a - o;
  return Math.sqrt(l ** 2 + h ** 2 + u ** 2);
}
var xt = {
  deltaE76: ei,
  deltaECMC: ii,
  deltaE2000: $t,
  deltaEJz: ui,
  deltaEITP: yi,
  deltaEOK: xi
};
function Q(r, t, e = {}) {
  it(e) && (e = { method: e });
  let { method: i = F.deltaE, ...a } = e;
  r = g(r), t = g(t);
  for (let n in xt)
    if ("deltae" + i.toLowerCase() === n.toLowerCase())
      return xt[n](r, t, a);
  throw new TypeError(`Unknown deltaE method: ${i}`);
}
function Si(r, t = 0.25) {
  let i = [d.get("oklch", "lch"), "l"];
  return I(r, i, (a) => a * (1 + t));
}
function Ci(r, t = 0.25) {
  let i = [d.get("oklch", "lch"), "l"];
  return I(r, i, (a) => a * (1 - t));
}
var Ti = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  darken: Ci,
  lighten: Si
});
function Je(r, t, e = 0.5, i = {}) {
  [r, t] = [g(r), g(t)], O(e) === "object" && ([e, i] = [0.5, e]);
  let { space: a, outputSpace: n, premultiplied: s } = i;
  return nt(r, t, { space: a, outputSpace: n, premultiplied: s })(e);
}
function Qe(r, t, e = {}) {
  let i;
  Nt(r) && ([i, e] = [r, t], [r, t] = i.rangeArgs.colors);
  let {
    maxDeltaE: a,
    deltaEMethod: n,
    steps: s = 2,
    maxSteps: o = 1e3,
    ...l
  } = e;
  i || ([r, t] = [g(r), g(t)], i = nt(r, t, l));
  let h = Q(r, t), u = a > 0 ? Math.max(s, Math.ceil(h / a) + 1) : s, c = [];
  if (o !== void 0 && (u = Math.min(u, o)), u === 1)
    c = [{ p: 0.5, color: i(0.5) }];
  else {
    let f = 1 / (u - 1);
    c = Array.from({ length: u }, (m, p) => {
      let b = p * f;
      return { p: b, color: i(b) };
    });
  }
  if (a > 0) {
    let f = c.reduce((m, p, b) => {
      if (b === 0)
        return 0;
      let y = Q(p.color, c[b - 1].color, n);
      return Math.max(m, y);
    }, 0);
    for (; f > a; ) {
      f = 0;
      for (let m = 1; m < c.length && c.length < o; m++) {
        let p = c[m - 1], b = c[m], y = (b.p + p.p) / 2, v = i(y);
        f = Math.max(f, Q(v, p.color), Q(v, b.color)), c.splice(m, 0, { p: y, color: i(y) }), m++;
      }
    }
  }
  return c = c.map((f) => f.color), c;
}
function nt(r, t, e = {}) {
  if (Nt(r)) {
    let [l, h] = [r, t];
    return nt(...l.rangeArgs.colors, { ...l.rangeArgs.options, ...h });
  }
  let { space: i, outputSpace: a, progression: n, premultiplied: s } = e;
  r = g(r), t = g(t), r = et(r), t = et(t);
  let o = { colors: [r, t], options: e };
  if (i ? i = d.get(i) : i = d.registry[F.interpolationSpace] || r.space, a = a ? d.get(a) : i, r = A(r, i), t = A(t, i), r = j(r), t = j(t), i.coords.h && i.coords.h.type === "angle") {
    let l = e.hue = e.hue || "shorter", h = [i, "h"], [u, c] = [P(r, h), P(t, h)];
    [u, c] = kr(l, [u, c]), I(r, h, u), I(t, h, c);
  }
  return s && (r.coords = r.coords.map((l) => l * r.alpha), t.coords = t.coords.map((l) => l * t.alpha)), Object.assign((l) => {
    l = n ? n(l) : l;
    let h = r.coords.map((f, m) => {
      let p = t.coords[m];
      return yt(f, p, l);
    }), u = yt(r.alpha, t.alpha, l), c = { space: i, coords: h, alpha: u };
    return s && (c.coords = c.coords.map((f) => f / u)), a !== i && (c = A(c, a)), c;
  }, {
    rangeArgs: o
  });
}
function Nt(r) {
  return O(r) === "function" && !!r.rangeArgs;
}
F.interpolationSpace = "lab";
function Di(r) {
  r.defineFunction("mix", Je, { returns: "color" }), r.defineFunction("range", nt, { returns: "function<color>" }), r.defineFunction("steps", Qe, { returns: "array<color>" });
}
var Ai = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  isRange: Nt,
  mix: Je,
  range: nt,
  register: Di,
  steps: Qe
}), Ke = new d({
  id: "hsl",
  name: "HSL",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    l: {
      range: [0, 100],
      name: "Lightness"
    }
  },
  base: rt,
  // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
  fromBase: (r) => {
    let t = Math.max(...r), e = Math.min(...r), [i, a, n] = r, [s, o, l] = [NaN, 0, (e + t) / 2], h = t - e;
    if (h !== 0) {
      switch (o = l === 0 || l === 1 ? 0 : (t - l) / Math.min(l, 1 - l), t) {
        case i:
          s = (a - n) / h + (a < n ? 6 : 0);
          break;
        case a:
          s = (n - i) / h + 2;
          break;
        case n:
          s = (i - a) / h + 4;
      }
      s = s * 60;
    }
    return [s, o * 100, l * 100];
  },
  // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
  toBase: (r) => {
    let [t, e, i] = r;
    t = t % 360, t < 0 && (t += 360), e /= 100, i /= 100;
    function a(n) {
      let s = (n + t / 30) % 12, o = e * Math.min(i, 1 - i);
      return i - o * Math.max(-1, Math.min(s - 3, 9 - s, 1));
    }
    return [a(0), a(8), a(4)];
  },
  formats: {
    hsl: {
      toGamut: !0,
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
    },
    hsla: {
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"],
      commas: !0,
      lastAlpha: !0
    }
  }
}), tr = new d({
  id: "hsv",
  name: "HSV",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    v: {
      range: [0, 100],
      name: "Value"
    }
  },
  base: Ke,
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  fromBase(r) {
    let [t, e, i] = r;
    e /= 100, i /= 100;
    let a = i + e * Math.min(i, 1 - i);
    return [
      t,
      // h is the same
      a === 0 ? 0 : 200 * (1 - i / a),
      // s
      100 * a
    ];
  },
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  toBase(r) {
    let [t, e, i] = r;
    e /= 100, i /= 100;
    let a = i * (1 - e / 2);
    return [
      t,
      // h is the same
      a === 0 || a === 1 ? 0 : (i - a) / Math.min(a, 1 - a) * 100,
      a * 100
    ];
  },
  formats: {
    color: {
      toGamut: !0
    }
  }
}), Ri = new d({
  id: "hwb",
  name: "HWB",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    w: {
      range: [0, 100],
      name: "Whiteness"
    },
    b: {
      range: [0, 100],
      name: "Blackness"
    }
  },
  base: tr,
  fromBase(r) {
    let [t, e, i] = r;
    return [t, i * (100 - e) / 100, 100 - i];
  },
  toBase(r) {
    let [t, e, i] = r;
    e /= 100, i /= 100;
    let a = e + i;
    if (a >= 1) {
      let o = e / a;
      return [t, 0, o * 100];
    }
    let n = 1 - i, s = n === 0 ? 0 : 1 - e / n;
    return [t, s * 100, n * 100];
  },
  formats: {
    hwb: {
      toGamut: !0,
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
    }
  }
});
const Pi = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]
], Li = [
  [2.0415879038107465, -0.5650069742788596, -0.34473135077832956],
  [-0.9692436362808795, 1.8759675015077202, 0.04155505740717557],
  [0.013444280632031142, -0.11836239223101838, 1.0151749943912054]
];
var er = new k({
  id: "a98rgb-linear",
  name: "Linear Adobe® 98 RGB compatible",
  white: "D65",
  toXYZ_M: Pi,
  fromXYZ_M: Li
}), Ei = new k({
  id: "a98rgb",
  name: "Adobe® 98 RGB compatible",
  base: er,
  toBase: (r) => r.map((t) => Math.pow(Math.abs(t), 563 / 256) * Math.sign(t)),
  fromBase: (r) => r.map((t) => Math.pow(Math.abs(t), 256 / 563) * Math.sign(t)),
  formats: {
    color: {
      id: "a98-rgb"
    }
  }
});
const Bi = [
  [0.7977604896723027, 0.13518583717574031, 0.0313493495815248],
  [0.2880711282292934, 0.7118432178101014, 8565396060525902e-20],
  [0, 0, 0.8251046025104601]
], zi = [
  [1.3457989731028281, -0.25558010007997534, -0.05110628506753401],
  [-0.5446224939028347, 1.5082327413132781, 0.02053603239147973],
  [0, 0, 1.2119675456389454]
];
var rr = new k({
  id: "prophoto-linear",
  name: "Linear ProPhoto",
  white: "D50",
  base: Zt,
  toXYZ_M: Bi,
  fromXYZ_M: zi
});
const Fi = 1 / 512, Yi = 16 / 512;
var $i = new k({
  id: "prophoto",
  name: "ProPhoto",
  base: rr,
  toBase(r) {
    return r.map((t) => t < Yi ? t / 16 : t ** 1.8);
  },
  fromBase(r) {
    return r.map((t) => t >= Fi ? t ** (1 / 1.8) : 16 * t);
  },
  formats: {
    color: {
      id: "prophoto-rgb"
    }
  }
}), Oi = new d({
  id: "oklch",
  name: "Oklch",
  coords: {
    l: {
      refRange: [0, 1],
      name: "Lightness"
    },
    c: {
      refRange: [0, 0.4],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  white: "D65",
  base: kt,
  fromBase(r) {
    let [t, e, i] = r, a;
    const n = 2e-4;
    return Math.abs(e) < n && Math.abs(i) < n ? a = NaN : a = Math.atan2(i, e) * 180 / Math.PI, [
      t,
      // OKLab L is still L
      Math.sqrt(e ** 2 + i ** 2),
      // Chroma
      St(a)
      // Hue, in degrees [0 to 360)
    ];
  },
  // Convert from polar form
  toBase(r) {
    let [t, e, i] = r, a, n;
    return isNaN(i) ? (a = 0, n = 0) : (a = e * Math.cos(i * Math.PI / 180), n = e * Math.sin(i * Math.PI / 180)), [t, a, n];
  },
  formats: {
    oklch: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[0,1]", "<number> | <angle>"]
    }
  }
});
const we = 203, ke = 2610 / 2 ** 14, Xi = 2 ** 14 / 2610, Ii = 2523 / 2 ** 5, xe = 2 ** 5 / 2523, Se = 3424 / 2 ** 12, Ce = 2413 / 2 ** 7, Te = 2392 / 2 ** 7;
var ji = new k({
  id: "rec2100pq",
  name: "REC.2100-PQ",
  base: Ct,
  toBase(r) {
    return r.map(function(t) {
      return (Math.max(t ** xe - Se, 0) / (Ce - Te * t ** xe)) ** Xi * 1e4 / we;
    });
  },
  fromBase(r) {
    return r.map(function(t) {
      let e = Math.max(t * we / 1e4, 0), i = Se + Ce * e ** ke, a = 1 + Te * e ** ke;
      return (i / a) ** Ii;
    });
  },
  formats: {
    color: {
      id: "rec2100-pq"
    }
  }
});
const De = 0.17883277, Ae = 0.28466892, Re = 0.55991073, Bt = 3.7743;
var qi = new k({
  id: "rec2100hlg",
  cssid: "rec2100-hlg",
  name: "REC.2100-HLG",
  referred: "scene",
  base: Ct,
  toBase(r) {
    return r.map(function(t) {
      return t <= 0.5 ? t ** 2 / 3 * Bt : (Math.exp((t - Re) / De) + Ae) / 12 * Bt;
    });
  },
  fromBase(r) {
    return r.map(function(t) {
      return t /= Bt, t <= 1 / 12 ? Math.sqrt(3 * t) : De * Math.log(12 * t - Ae) + Re;
    });
  },
  formats: {
    color: {
      id: "rec2100-hlg"
    }
  }
});
const ir = {};
X.add("chromatic-adaptation-start", (r) => {
  r.options.method && (r.M = ar(r.W1, r.W2, r.options.method));
});
X.add("chromatic-adaptation-end", (r) => {
  r.M || (r.M = ar(r.W1, r.W2, r.options.method));
});
function Tt({ id: r, toCone_M: t, fromCone_M: e }) {
  ir[r] = arguments[0];
}
function ar(r, t, e = "Bradford") {
  let i = ir[e], [a, n, s] = M(i.toCone_M, r), [o, l, h] = M(i.toCone_M, t), u = [
    [o / a, 0, 0],
    [0, l / n, 0],
    [0, 0, h / s]
  ], c = M(u, i.toCone_M);
  return M(i.fromCone_M, c);
}
Tt({
  id: "von Kries",
  toCone_M: [
    [0.40024, 0.7076, -0.08081],
    [-0.2263, 1.16532, 0.0457],
    [0, 0, 0.91822]
  ],
  fromCone_M: [
    [1.8599364, -1.1293816, 0.2198974],
    [0.3611914, 0.6388125, -64e-7],
    [0, 0, 1.0890636]
  ]
});
Tt({
  id: "Bradford",
  // Convert an array of XYZ values in the range 0.0 - 1.0
  // to cone fundamentals
  toCone_M: [
    [0.8951, 0.2664, -0.1614],
    [-0.7502, 1.7135, 0.0367],
    [0.0389, -0.0685, 1.0296]
  ],
  // and back
  fromCone_M: [
    [0.9869929, -0.1470543, 0.1599627],
    [0.4323053, 0.5183603, 0.0492912],
    [-85287e-7, 0.0400428, 0.9684867]
  ]
});
Tt({
  id: "CAT02",
  // with complete chromatic adaptation to W2, so D = 1.0
  toCone_M: [
    [0.7328, 0.4296, -0.1624],
    [-0.7036, 1.6975, 61e-4],
    [3e-3, 0.0136, 0.9834]
  ],
  fromCone_M: [
    [1.0961238, -0.278869, 0.1827452],
    [0.454369, 0.4735332, 0.0720978],
    [-96276e-7, -5698e-6, 1.0153256]
  ]
});
Tt({
  id: "CAT16",
  toCone_M: [
    [0.401288, 0.650173, -0.051461],
    [-0.250268, 1.204414, 0.045854],
    [-2079e-6, 0.048952, 0.953127]
  ],
  // the extra precision is needed to avoid roundtripping errors
  fromCone_M: [
    [1.862067855087233, -1.011254630531685, 0.1491867754444518],
    [0.3875265432361372, 0.6214474419314753, -0.008973985167612518],
    [-0.01584149884933386, -0.03412293802851557, 1.04996443687785]
  ]
});
Object.assign(E, {
  // whitepoint values from ASTM E308-01 with 10nm spacing, 1931 2 degree observer
  // all normalized to Y (luminance) = 1.00000
  // Illuminant A is a tungsten electric light, giving a very warm, orange light.
  A: [1.0985, 1, 0.35585],
  // Illuminant C was an early approximation to daylight: illuminant A with a blue filter.
  C: [0.98074, 1, 1.18232],
  // The daylight series of illuminants simulate natural daylight.
  // The color temperature (in degrees Kelvin/100) ranges from
  // cool, overcast daylight (D50) to bright, direct sunlight (D65).
  D55: [0.95682, 1, 0.92149],
  D75: [0.94972, 1, 1.22638],
  // Equal-energy illuminant, used in two-stage CAT16
  E: [1, 1, 1],
  // The F series of illuminants represent fluorescent lights
  F2: [0.99186, 1, 0.67393],
  F7: [0.95041, 1, 1.08747],
  F11: [1.00962, 1, 0.6435]
});
E.ACES = [0.32168 / 0.33767, 1, (1 - 0.32168 - 0.33767) / 0.33767];
const Gi = [
  [0.6624541811085053, 0.13400420645643313, 0.1561876870049078],
  [0.27222871678091454, 0.6740817658111484, 0.05368951740793705],
  [-0.005574649490394108, 0.004060733528982826, 1.0103391003129971]
], Zi = [
  [1.6410233796943257, -0.32480329418479, -0.23642469523761225],
  [-0.6636628587229829, 1.6153315916573379, 0.016756347685530137],
  [0.011721894328375376, -0.008284441996237409, 0.9883948585390215]
];
var nr = new k({
  id: "acescg",
  name: "ACEScg",
  // ACEScg – A scene-referred, linear-light encoding of ACES Data
  // https://docs.acescentral.com/specifications/acescg/
  // uses the AP1 primaries, see section 4.3.1 Color primaries
  coords: {
    r: {
      range: [0, 65504],
      name: "Red"
    },
    g: {
      range: [0, 65504],
      name: "Green"
    },
    b: {
      range: [0, 65504],
      name: "Blue"
    }
  },
  referred: "scene",
  white: E.ACES,
  toXYZ_M: Gi,
  fromXYZ_M: Zi,
  formats: {
    color: {}
  }
});
const dt = 2 ** -16, zt = -0.35828683, mt = (Math.log2(65504) + 9.72) / 17.52;
var Ui = new k({
  id: "acescc",
  name: "ACEScc",
  // see S-2014-003 ACEScc – A Logarithmic Encoding of ACES Data
  // https://docs.acescentral.com/specifications/acescc/
  // uses the AP1 primaries, see section 4.3.1 Color primaries
  // Appendix A: "Very small ACES scene referred values below 7 1/4 stops
  // below 18% middle gray are encoded as negative ACEScc values.
  // These values should be preserved per the encoding in Section 4.4
  // so that all positive ACES values are maintained."
  coords: {
    r: {
      range: [zt, mt],
      name: "Red"
    },
    g: {
      range: [zt, mt],
      name: "Green"
    },
    b: {
      range: [zt, mt],
      name: "Blue"
    }
  },
  referred: "scene",
  base: nr,
  // from section 4.4.2 Decoding Function
  toBase(r) {
    const t = -0.3013698630136986;
    return r.map(function(e) {
      return e <= t ? (2 ** (e * 17.52 - 9.72) - dt) * 2 : e < mt ? 2 ** (e * 17.52 - 9.72) : 65504;
    });
  },
  // Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
  fromBase(r) {
    return r.map(function(t) {
      return t <= 0 ? (Math.log2(dt) + 9.72) / 17.52 : t < dt ? (Math.log2(dt + t * 0.5) + 9.72) / 17.52 : (Math.log2(t) + 9.72) / 17.52;
    });
  },
  // encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
  // encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
  formats: {
    color: {}
  }
}), Pe = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  A98RGB: Ei,
  A98RGB_Linear: er,
  ACEScc: Ui,
  ACEScg: nr,
  HSL: Ke,
  HSV: tr,
  HWB: Ri,
  ICTCP: It,
  JzCzHz: Xt,
  Jzazbz: Ne,
  LCH: tt,
  Lab: T,
  Lab_D65: Ot,
  OKLCH: Oi,
  OKLab: kt,
  P3: je,
  P3_Linear: Xe,
  ProPhoto: $i,
  ProPhoto_Linear: rr,
  REC_2020: Oe,
  REC_2020_Linear: Ct,
  REC_2100_HLG: qi,
  REC_2100_PQ: ji,
  XYZ_ABS_D65: Ut,
  XYZ_D50: Zt,
  XYZ_D65: R,
  sRGB: rt,
  sRGB_Linear: Ie
});
class _ {
  /**
   * Creates an instance of Color.
   * Signatures:
   * - `new Color(stringToParse)`
   * - `new Color(otherColor)`
   * - `new Color({space, coords, alpha})`
   * - `new Color(space, coords, alpha)`
   * - `new Color(spaceId, coords, alpha)`
   */
  constructor(...t) {
    let e;
    t.length === 1 && (e = g(t[0]));
    let i, a, n;
    e ? (i = e.space || e.spaceId, a = e.coords, n = e.alpha) : [i, a, n] = t, Object.defineProperty(this, "space", {
      value: d.get(i),
      writable: !1,
      enumerable: !0,
      configurable: !0
      // see note in https://262.ecma-international.org/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
    }), this.coords = a ? a.slice() : [0, 0, 0], this.alpha = n < 1 ? n : 1;
    for (let s = 0; s < this.coords.length; s++)
      this.coords[s] === "NaN" && (this.coords[s] = NaN);
    for (let s in this.space.coords)
      Object.defineProperty(this, s, {
        get: () => this.get(s),
        set: (o) => this.set(s, o)
      });
  }
  get spaceId() {
    return this.space.id;
  }
  clone() {
    return new _(this.space, this.coords, this.alpha);
  }
  toJSON() {
    return {
      spaceId: this.spaceId,
      coords: this.coords,
      alpha: this.alpha
    };
  }
  display(...t) {
    let e = Pr(this, ...t);
    return e.color = new _(e.color), e;
  }
  /**
   * Get a color from the argument passed
   * Basically gets us the same result as new Color(color) but doesn't clone an existing color object
   */
  static get(t, ...e) {
    return t instanceof _ ? t : new _(t, ...e);
  }
  static defineFunction(t, e, i = e) {
    let { instance: a = !0, returns: n } = i, s = function(...o) {
      let l = e(...o);
      if (n === "color")
        l = _.get(l);
      else if (n === "function<color>") {
        let h = l;
        l = function(...u) {
          let c = h(...u);
          return _.get(c);
        }, Object.assign(l, h);
      } else
        n === "array<color>" && (l = l.map((h) => _.get(h)));
      return l;
    };
    t in _ || (_[t] = s), a && (_.prototype[t] = function(...o) {
      return s(this, ...o);
    });
  }
  static defineFunctions(t) {
    for (let e in t)
      _.defineFunction(e, t[e], t[e]);
  }
  static extend(t) {
    if (t.register)
      t.register(_);
    else
      for (let e in t)
        _.defineFunction(e, t[e]);
  }
}
_.defineFunctions({
  get: P,
  getAll: at,
  set: I,
  setAll: $e,
  to: A,
  equals: Lr,
  inGamut: K,
  toGamut: j,
  distance: qe,
  toString: wt
});
Object.assign(_, {
  util: br,
  hooks: X,
  WHITES: E,
  Space: d,
  spaces: d.registry,
  parse: Ye,
  // Global defaults one may want to configure
  defaults: F
});
for (let r of Object.keys(Pe))
  d.register(Pe[r]);
for (let r in d.registry)
  jt(r, d.registry[r]);
X.add("colorspace-init-end", (r) => {
  var t;
  jt(r.id, r), (t = r.aliases) == null || t.forEach((e) => {
    jt(e, r);
  });
});
function jt(r, t) {
  Object.keys(t.coords), Object.values(t.coords).map((i) => i.name);
  let e = r.replace(/-/g, "_");
  Object.defineProperty(_.prototype, e, {
    // Convert coords to coords in another colorspace and return them
    // Source colorspace: this.spaceId
    // Target colorspace: id
    get() {
      let i = this.getAll(r);
      return typeof Proxy > "u" ? i : new Proxy(i, {
        has: (a, n) => {
          try {
            return d.resolveCoord([t, n]), !0;
          } catch {
          }
          return Reflect.has(a, n);
        },
        get: (a, n, s) => {
          if (n && typeof n != "symbol" && !(n in a)) {
            let { index: o } = d.resolveCoord([t, n]);
            if (o >= 0)
              return a[o];
          }
          return Reflect.get(a, n, s);
        },
        set: (a, n, s, o) => {
          if (n && typeof n != "symbol" && !(n in a) || n >= 0) {
            let { index: l } = d.resolveCoord([t, n]);
            if (l >= 0)
              return a[l] = s, this.setAll(r, a), !0;
          }
          return Reflect.set(a, n, s, o);
        }
      });
    },
    // Convert coords in another colorspace to internal coords and set them
    // Target colorspace: this.spaceId
    // Source colorspace: id
    set(i) {
      this.setAll(r, i);
    },
    configurable: !0,
    enumerable: !0
  });
}
_.extend(xt);
_.extend({ deltaE: Q });
Object.assign(_, { deltaEMethods: xt });
_.extend(Ti);
_.extend({ contrast: Qr });
_.extend(ti);
_.extend(Br);
_.extend(Ai);
_.extend(pt);
function sr(r) {
  return r;
}
function G(r) {
  return r * r * (3 - 2 * r);
}
function or(r, t, e, i) {
  return r * t + e * i;
}
function Ni(r, t, e, i) {
  let a = [
    Math.round((r.r * t + e.r * i) * 255),
    Math.round((r.g * t + e.g * i) * 255),
    Math.round((r.b * t + e.b * i) * 255)
  ];
  return `rgb(${a[0]}, ${a[1]}, ${a[2]})`;
}
function Vi(r, t, e, i) {
  return r.map(
    (a, n) => or(a, t, e[n], i)
  );
}
function Vt(r) {
  if (typeof r == "number")
    return or;
  if (typeof r == "string") {
    let t = {};
    return (e, i, a, n) => (t[e] || (t[e] = new _(e).srgb), t[a] || (t[a] = new _(a).srgb), Ni(
      t[e],
      i,
      t[a],
      n
    ));
  } else if (Array.isArray(r))
    return Vi;
  return (t, e, i, a) => e < 1 ? t : i;
}
function Z(r, t = void 0) {
  return t === void 0 && (t = Vt(r)), {
    finalValue: r,
    interpolate: (e, i) => t(
      e,
      1 - Math.min(i, 1),
      r,
      Math.min(i, 1)
    )
  };
}
function aa(r, t = void 0) {
  return t === void 0 && (t = Vt(r())), {
    interpolate: (e, i) => t(
      e,
      1 - Math.min(i, 1),
      r(),
      Math.min(i, 1)
    )
  };
}
function na(r, t = void 0) {
  return t === void 0 && (t = Vt(r[0])), {
    interpolate: (e, i) => {
      let a = Math.min(i, 1) * (r.length - 1) - 1, n = Math.min(
        a - Math.floor(a),
        1
      );
      return a < 0 ? t(
        e,
        1 - n,
        r[0],
        n
      ) : t(
        r[Math.floor(a)],
        1 - n,
        r[Math.floor(a) + 1],
        n
      );
    }
  };
}
class B {
  constructor(t, e = 1e3, i = sr) {
    this.duration = 0, this.finalValue = void 0, this.interpolator = null, this.duration = e, t.hasOwnProperty("finalValue") ? this.finalValue = t.finalValue : this.finalValue = void 0, this.interpolator = t, this.curve = i;
  }
  evaluate(t, e) {
    let i = this.curve(this.duration > 0 ? e / this.duration : 1);
    return this.interpolator.interpolate(t, i);
  }
  withDelay(t) {
    return t ? new Hi(this, t) : this;
  }
}
class qt extends B {
  constructor(t, e) {
    super(Z(t), e, G);
  }
}
class Hi extends B {
  constructor(t, e) {
    super(t.interpolator, t.duration + e, t.curve), this.delay = e;
  }
  evaluate(t, e) {
    return e <= this.delay ? t : super.evaluate(
      t,
      (e - this.delay) * this.duration / (this.duration - this.delay)
    );
  }
}
function sa(r, t = 1e3, e = sr) {
  return new B(Z(r), t, e);
}
function _t(r, t) {
  return typeof r == "number" && typeof t == "number" ? Math.abs(r - t) <= 1e-3 : r == t;
}
function lr() {
  var r = 0;
  return Object.assign(function() {
    return r;
  }, {
    advance: (e) => {
      r += e;
    }
  });
}
function Wi(r) {
  let t = /* @__PURE__ */ new Set();
  for (; r = Reflect.getPrototypeOf(r); )
    Reflect.ownKeys(r).forEach((i) => t.add(i));
  return t;
}
class Ji {
  constructor(t = void 0) {
    this.info = t, this.promise = new Promise((e, i) => {
      this.reject = i, this.resolve = e;
    });
  }
}
function Qi(r) {
  let t = 1e12, e = -1e12, i = 1e12, a = -1e12;
  return r.forEach((n) => {
    n.x < t && (t = n.x), n.x > e && (e = n.x), n.y < i && (i = n.y), n.y > a && (a = n.y);
  }), { x: [t, e], y: [i, a] };
}
var Ki = /* @__PURE__ */ ((r) => (r[r.DEFAULT = 0] = "DEFAULT", r[r.ALWAYS = 1] = "ALWAYS", r[r.WHEN_UPDATED = 2] = "WHEN_UPDATED", r))(Ki || {});
class S {
  /**
   *
   * @param info Arguments describing how to populate the attribute, or a single
   *    value that should be stored as the `value` or `valueFn` of the attribute.
   */
  constructor(t) {
    if (this.valueFn = void 0, this.transform = void 0, this.cacheTransform = !1, this._cachedValue = null, this.computeArg = void 0, this.recompute = 0, this.needsUpdate = !1, this.animation = null, this.label = null, this._computedValue = null, this._lastTickValue = void 0, this._animatedValue = null, this._hasComputed = !1, this._timeProvider = null, this.currentTime = 0, this._changedLastTick = !1, this._listeners = [], this._animationCompleteCallbacks = [], t == null || t == null || !(t.hasOwnProperty("value") || t.hasOwnProperty("valueFn")))
      typeof t == "function" ? this.valueFn = t : this.value = t;
    else {
      let e = t;
      e.valueFn !== void 0 ? this.valueFn = e.valueFn : e.value !== void 0 ? this.value = e.value : console.error(
        "One of `value` or `valueFn` must be defined to create an Attribute"
      ), this.transform = e.transform ?? null, this.cacheTransform = e.cacheTransform ?? !1, this._cachedValue = null, this.computeArg = e.computeArg ?? null, this.recompute = e.recompute ?? 0;
    }
  }
  addListener(t) {
    this._listeners.push(t);
  }
  removeListener(t) {
    let e = this._listeners.indexOf(t);
    e >= 0 && (this._listeners = this._listeners.splice(e, 1));
  }
  setTimeProvider(t) {
    this._timeProvider = t;
  }
  _getComputeArg() {
    return this.computeArg !== void 0 ? this.computeArg : this;
  }
  /**
   * Synchronously computes the value of the attribute.
   */
  compute() {
    this.valueFn && (this._computedValue = this.valueFn(this._getComputeArg()));
  }
  // Advances the time of the animation by the given number of msec,
  // and returns whether or not a redraw is needed
  advance(t = void 0) {
    return (this.animation != null || this.needsUpdate || this.valueFn) && (this._timeProvider === null ? this.currentTime += t : this.currentTime = this._timeProvider()), this.animation == null && this._animationCompleteCallbacks.length > 0 && (console.warn(
      "Found animation-complete callbacks for a non-existent animation"
    ), this._cleanUpAnimation(!0)), this._lastTickValue = this.getUntransformed(), this.animation != null || this.needsUpdate ? (this.needsUpdate = !1, this._changedLastTick = !0, !0) : (this._changedLastTick = !1, !1);
  }
  _computeAnimation(t = !0) {
    if (!this.animation)
      return;
    this._timeProvider && (this.currentTime = this._timeProvider());
    let { animator: e, start: i, initial: a } = this.animation, n = e.evaluate(
      a,
      Math.min(this.currentTime - i, e.duration)
      // can add a debug flag here
    );
    this._animationFinished() && t ? (this.valueFn ? this.compute() : this.value = n, this._cleanUpAnimation(!1), this._animatedValue = null) : this._animatedValue = n;
  }
  _animationFinished() {
    return this.animation ? this.animation.animator.duration + 20 <= this.currentTime - this.animation.start : !0;
  }
  _transform(t) {
    let e;
    if (this.transform) {
      let i = this._cachedValue;
      if (i && _t(i.raw, t))
        e = i.result;
      else {
        let a = t;
        e = this.transform(t, this._getComputeArg()), this.cacheTransform && (this._cachedValue = {
          raw: a,
          result: e
        });
      }
    } else
      e = t;
    return e;
  }
  _cleanUpAnimation(t = !1) {
    this.animation = null, this._animationCompleteCallbacks.forEach((e) => {
      !t || !e.info.rejectOnCancel ? e.resolve(this) : e.reject({ newValue: this.last() });
    }), this._animationCompleteCallbacks = [];
  }
  /**
   * Retrieves the current (transformed) value.
   */
  get() {
    return this._transform(this.getUntransformed());
  }
  /**
   * Retrieves the current un-transformed value.
   */
  getUntransformed() {
    this._computeAnimation();
    let t;
    return this._animatedValue != null ? t = this._animatedValue : this.valueFn ? ((this.recompute !== 2 || !this._hasComputed) && (this.compute(), this._hasComputed = !0), t = this._computedValue) : t = this.value, this._lastTickValue === void 0 && (this._lastTickValue = t), t;
  }
  /**
   * Returns an object that tells a renderer how to animate this attribute,
   * including four properties: `start` and `end` (the initial and final values of
   * the attribute) and `startTime` and `endTime` (the timestamps for the start and
   * end of the animation, in ms). If there is no animation, `startTime` and
   * `endTime` will be equal.
   *
   * @param currentTime A timestamp. If provided, the `startTime` and `endTime`
   *  values will be converted (assuming that the stored animation is computed
   *  with respect to the attribute's internal time representation).
   * @returns A preloadable animation for the attribute, where the `start` and
   *  `end` values are expressed as transformed values.
   */
  getPreload(t = null) {
    if (this._timeProvider && (this.currentTime = this._timeProvider()), !this.animation) {
      let i = this.get();
      return {
        start: i,
        end: i,
        startTime: t || this.currentTime,
        endTime: t || this.currentTime
      };
    }
    let e = this.getPreloadUntransformed(t);
    return {
      start: this._transform(e.start),
      end: this._transform(e.end),
      startTime: e.startTime,
      endTime: e.endTime
    };
  }
  /**
   * Returns an object that tells a renderer how to animate this attribute,
   * including four properties: `start` and `end` (the initial and final values of
   * the attribute) and `startTime` and `endTime` (the timestamps for the start and
   * end of the animation, in ms). If there is no animation, `startTime` and
   * `endTime` will be equal.
   *
   * @param currentTime A timestamp. If provided, the `startTime` and `endTime`
   *  values will be converted (assuming that the stored animation is computed
   *  with respect to the attribute's internal time representation).
   * @returns A preloadable animation for the attribute, where the `start` and
   *  `end` values are expressed as un-transformed values.
   */
  getPreloadUntransformed(t = null) {
    if (this._timeProvider && (this.currentTime = this._timeProvider()), !this.animation) {
      let n = this.getUntransformed();
      return {
        start: n,
        end: n,
        startTime: t || this.currentTime,
        endTime: t || this.currentTime
      };
    }
    if (!(this.animation.animator instanceof qt))
      return console.error(
        "Calling getPreload for a non-preloadable animation is forbidden. If using MarkSet, make sure this attribute is registered as preloadable."
      ), null;
    if (this._animationFinished())
      return this._computeAnimation(), this.getPreloadUntransformed(t);
    let e;
    this.valueFn ? ((this.recompute !== 2 || !this._hasComputed) && (this.compute(), this._hasComputed = !0), e = this._computedValue) : e = this.value;
    let i = this.animation.animator.finalValue, a = (t || this.currentTime) - this.currentTime;
    return {
      start: e,
      end: i,
      startTime: this.animation.start + a,
      endTime: this.animation.start + this.animation.animator.duration + a
    };
  }
  /**
   * Synchronously sets the value of the attribute and marks that it needs to
   * be updated on the next call to `advance()`.
   *
   * @param newValue The new value or value function.
   */
  set(t) {
    typeof t == "function" ? (this.value != null && (this._computedValue = this.value), this.valueFn = t, this.value = void 0, this._animatedValue = null, this._lastTickValue = void 0) : (this.value = t, this.valueFn = null, this._animatedValue = null, this._lastTickValue = t), this.needsUpdate = !0, this.animation && this._cleanUpAnimation(!0), this._listeners.forEach((e) => e(this, !1));
  }
  /**
   * Retrieves the non-animated value for the attribute, i.e. the final value
   * if an animation is in progress or the current value otherwise. This method
   * computes the value if specified as a value function.
   */
  data() {
    return this.valueFn ? this.valueFn(this._getComputeArg()) : this.value;
  }
  /**
   * Returns the last value known for this attribute _without_ running the value
   * function.
   */
  last() {
    return this.animation && this._computeAnimation(!1), this._lastTickValue !== void 0 ? this._lastTickValue : this._animatedValue != null ? this._animatedValue : this.value !== void 0 ? this.value : this._computedValue;
  }
  /**
   * Returns the value that this attribute is approaching if animating (or `null`
   * if not available), or the current value if not animating. This method does
   * _not_ compute a new value for the attribute.
   */
  future() {
    return this.animation ? this.animation.animator.finalValue : this._animatedValue != null ? this._animatedValue : this.value !== void 0 ? this.value : this._computedValue;
  }
  /**
   * Marks that the transform has changed for this attribute. Only applies when
   * `cached` is set to true.
   */
  updateTransform() {
    this._cachedValue = null;
  }
  /**
   * @returns Whether or not the attribute is currently being animated
   */
  animating() {
    return this.animation != null;
  }
  /**
   * Applies an animation to this attribute. The attribute will call the
   * `evaluate` method on the animation every time the attribute's `advance()`
   * method runs, until the time delta since the start of the animation exceeds
   * the duration of the animation.
   * @param animation an animation to run
   */
  animate(t) {
    this._timeProvider && (this.currentTime = this._timeProvider()), this.animation && (this.valueFn ? this._computedValue = this._animatedValue : this.value = this._animatedValue, this._cleanUpAnimation(!0)), this.animation = {
      animator: t,
      initial: this.last(),
      start: this.currentTime
    }, this._computeAnimation(), this._listeners.forEach((e) => e(this, !0));
  }
  /**
   * Wait until the attribute's current animation has finished.
   *
   * @param rejectOnCancel Whether or not to throw a promise rejection if the
   *  animation is canceled. The default is true.
   * @returns A `Promise` that resolves when the animation has completed, and
   *  rejects if the animation is canceled or superseded by a different animation.
   *  If `rejectOnCancel` is set to `false`, the promise resolves in both
   *  situations. If there is no active animation, the promise resolves immediately.
   */
  wait(t = !0) {
    if (!this.animation)
      return new Promise((i, a) => i(this));
    let e = new Ji({ rejectOnCancel: t });
    return this._animationCompleteCallbacks.push(e), e.promise;
  }
  /**
   * @returns whether or not this attribute changed value (due to animation or
   * other updates) on the last call to `advance`
   */
  changed() {
    return this._changedLastTick;
  }
}
function Ft(r, t, e) {
  return Object.fromEntries(
    Object.entries(r).map(([i, a]) => [
      i,
      typeof a == "function" ? a(t, e) : a
    ])
  );
}
class hr {
  /**
   * @param marks The set of marks that this group should manage, all including
   *  the same set of attributes.
   * @param opts Options for the mark group (see {@link configure})
   */
  constructor(t = [], e = {
    animationDuration: 1e3,
    animationCurve: G
  }) {
    this.timeProvider = null, this.lazyUpdates = !0, this.animatingMarks = /* @__PURE__ */ new Set(), this.updatedMarks = /* @__PURE__ */ new Set(), this.preloadableProperties = /* @__PURE__ */ new Set(), this._forceUpdate = !1, this._markListChanged = !1, this._changedLastTick = !1, this.timeProvider = lr(), this.lazyUpdates = !0, this._defaultDuration = 1e3, this._defaultCurve = G, this.configure(e), this.marks = t, this.marksByID = /* @__PURE__ */ new Map(), this.marks.forEach((i) => {
      if (this.marksByID.has(i.id)) {
        console.error(`ID '${i.id}' is duplicated in mark render group`);
        return;
      }
      this.marksByID.set(i.id, i), this._configureMark(i);
    });
  }
  /**
   * Applies configuration options to the render group.
   *
   * @param opts Options for the mark group, including:
   *  - `timeProvider`: a shared `TimeProvider` object to be used among all
   *    marks. By default a new time provider is created.
   *  - `lazyUpdates`: whether to iterate over only the updated marks in each
   *    iteration, or every mark. The default is `false`, meaning every mark
   *    is updated every iteration.
   *  - `animationDuration`: the default animation duration in milliseconds
   *    (default 1000)
   *  - `animationCurve`: the default animation curve to use (default ease-in-out)
   * @returns this render group
   */
  configure(t) {
    return t.timeProvider !== void 0 && (this.timeProvider = t.timeProvider), t.lazyUpdates !== void 0 && (this.lazyUpdates = t.lazyUpdates), t.animationDuration !== void 0 && (this._defaultDuration = t.animationDuration), t.animationCurve !== void 0 && (this._defaultCurve = t.animationCurve), this.marks && this.getMarks().forEach((e) => this._configureMark(e)), this;
  }
  /**
   * Configures a mark's callbacks and default properties.
   * @param m the mark to configure
   */
  _configureMark(t) {
    t.setTimeProvider(this.timeProvider), t.configure({
      animationDuration: this._defaultDuration,
      animationCurve: this._defaultCurve
    }), t.addListener((e, i, a) => {
      this.updatedMarks.add(e), !this.preloadableProperties.has(i) && a && this.animatingMarks.add(e), this._changedLastTick = !0;
    });
  }
  /**
   * Triggers the mark group to run an update even when no marks have been
   * explicitly updated. This only changes behavior when `lazyUpdates` is
   * set to `true`.
   *
   * @returns this render group
   *
   * @see lazyUpdates
   */
  forceUpdate() {
    return this._forceUpdate = !0, this;
  }
  /**
   * @returns The current time that all contained marks have
   */
  currentTime() {
    return this.timeProvider();
  }
  /**
   * @returns The set of marks that this render group knows about
   */
  getMarks() {
    return this.marks;
  }
  /**
   * Declares that the given attribute will only ever use preloadable animations.
   * Preloadable attributes will not be counted in calls to {@link marksAnimating}, and
   * only initial changes will be reflected in {@link marksChanged}. This permits
   * faster rendering by computing animations in shaders, and only computing
   * them on the CPU when explicitly requested through a call to {@link Attribute.get()}.
   * Note that animations to these properties must be created through
   * {@link animatePreload}, {@link animateComputed}, or {@link animateOne} with a
   * {@link PreloadableAnimator}.
   *
   * @param attrName the attribute to register
   * @returns this render group
   */
  registerPreloadableProperty(t) {
    return this.preloadableProperties.add(t), this;
  }
  /**
   * Advances all of the marks (or the updated marks, if `lazyUpdates` is set
   * to `true`) and returns whether a redraw is needed.
   *
   * @param dt The time elapsed since the last call to `advance`.
   *
   * @returns `true` if marks have changed and a redraw is needed, or `false`
   *  otherwise.
   */
  advance(t) {
    this.timeProvider.advance(t);
    let e = this.lazyUpdates ? [...this.animatingMarks, ...this.updatedMarks] : this.getMarks();
    if (this.updatedMarks = /* @__PURE__ */ new Set(), e.length == 0 && !this._forceUpdate && !this._markListChanged)
      return this._changedLastTick = !1, !1;
    for (let i of e)
      i.advance() || this.animatingMarks.delete(i);
    return this._forceUpdate = !1, this._markListChanged = !1, this._changedLastTick = !0, !0;
  }
  /**
   * @returns whether any marks are currently animating, excluding any marks that
   *  have a preloadable animation (since these are not regularly updated)
   */
  marksAnimating() {
    return this.animatingMarks.size > 0;
  }
  /**
   * Animates all marks to the value defined by the given function.
   *
   * @param attrName the attribute name to update
   * @param finalValueFn a function that takes a mark and its index, and returns
   *  a value or value function for that mark
   * @param options options for the animation, including the duration and curve
   *  to use
   * @returns this render group
   */
  animateTo(t, e, i = {}) {
    return this.preloadableProperties.has(t) ? this.forEach((n, s) => {
      let o = Ft(i, n, s), l = o.duration === void 0 ? this._defaultDuration : o.duration;
      n.animate(
        t,
        new qt(
          typeof e == "function" ? e(n, s) : e,
          l
        ).withDelay(o.delay || 0)
      );
    }) : this.forEach((n, s) => {
      n.animateTo(
        t,
        typeof e == "function" ? e(n, s) : e,
        Ft(i, n, s)
      );
    }), this;
  }
  /**
   * Animates all marks to their new computed value, or uses a custom
   * interpolator.
   *
   * @param attrName the attribute name to update
   * @param options options for the animation, including the duration and curve
   *  to use. The `interpolator` option takes a function that allows you to
   *  specify a custom interpolator for each mark.
   * @returns this render group
   */
  animate(t, e = {}) {
    let i = this.preloadableProperties.has(t);
    return i && e.interpolator ? (console.error(
      "Cannot apply custom interpolator function on preloadable property."
    ), this) : (this.forEach((a, n) => {
      let s = Ft(e, a, n);
      if (i) {
        let o = s.duration === void 0 ? this._defaultDuration : s.duration, l = a.data(t);
        a.animate(
          t,
          new qt(l, o).withDelay(
            s.delay || 0
          )
        );
      } else
        a.animate(t, s);
    }), this);
  }
  /**
   * Updates the value of the given attribute in every mark.
   *
   * @param attrName the attribute name to update
   * @param newValueFn an optional function that takes a mark and its index, and
   *  returns the new value or value function for that mark. If not provided,
   *  the attribute values will be recomputed using the existing value or value
   *  function.
   * @returns this render group
   */
  update(t, e = void 0) {
    return this.forEach((i, a) => {
      i.setAttr(
        t,
        e === void 0 ? void 0 : typeof e == "function" ? e(i, a) : e
      );
    }), this;
  }
  /**
   * Waits for the animations on the specified attribute name(s) to complete.
   *
   * @param attrNames An attribute name or array of attribute names to wait for.
   * @param rejectOnCancel If true (default), reject the promise if any animation is
   *  canceled or superseded. If false, resolve the promise in this case.
   * @returns a `Promise` that resolves when all the animations for the given
   *  attributes have completed, and rejects if any of their animations are
   *  canceled or superseded by another animation (unless `rejectOnCancel` is set
   *  to `false`). If none of the listed attributes have an active animation,
   *  the promise resolves immediately.
   */
  wait(t, e = !0) {
    return Promise.all(
      this.map((i) => i.wait(t, e))
    );
  }
  /**
   * Retrieves the mark with the given ID, or undefined if it does not exist.
   * @param id the ID of the mark to search for
   * @returns the `Mark` instance with the given ID or undefined if it doesn't
   * exist
   */
  getMarkByID(t) {
    return this.marksByID.get(t);
  }
  forEach(t) {
    this.getMarks().forEach(t);
  }
  map(t) {
    return this.getMarks().map(t);
  }
  /**
   * Filters the marks so that a subsequent action can be performed.
   *
   * @example ```markSet.filter([...]).animateTo("alpha", 0.0)
   * @param filterer Predicate function
   * @returns a view of the render group with only a subset of the marks
   */
  filter(t) {
    let e = Object.assign({}, this), i = this.getMarks().filter(t);
    return Object.keys(this).forEach((a) => {
      e[a] = this[a];
    }), e.marks = i, e.marksByID = /* @__PURE__ */ new Map(), i.forEach((a) => {
      e.marksByID.set(a.id, a);
    }), Wi(this).forEach((a) => {
      a == "getMarks" ? e[a] = () => i : e[a] = (...n) => {
        let s = this.getMarks();
        this.marks = i;
        let o = this[a](...n);
        return this.marks = s, o === this ? e : o;
      };
    }), e;
  }
  /**
   * Notifies every mark that the transform for the given attribute has changed.
   *
   * @param attrName the attribute whose transform has changed
   * @returns this render group
   *
   * @see Attribute.updateTransform
   */
  updateTransform(t) {
    return this.getMarks().forEach((e) => e.updateTransform(t)), this;
  }
  /**
   * Adds a mark to the render group.
   *
   * @param mark the mark to add
   * @returns this render group
   */
  addMark(t) {
    if (this.marksByID.has(t.id))
      return console.error("Attempted to add mark with ID that exists:", t.id), this;
    this.marks.push(t), this.marksByID.set(t.id, t), this._configureMark(t), this._markListChanged = !0;
  }
  /**
   * Removes a mark from the render group.
   *
   * @param mark the mark to remove
   * @returns this render group
   */
  removeMark(t) {
    let e = this.marks.indexOf(t);
    if (e < 0)
      return console.warn("Attempted to remove mark that does not exist"), this;
    this.marks.splice(e, 1), this.marksByID.delete(t.id), this._markListChanged = !0;
  }
  /**
   * @returns the number of marks in the render group
   */
  count() {
    return this.getMarks().length;
  }
  /**
   * @param attrNames the attributes to check for changes in (if none provided,
   *  checks all attributes)
   *
   * @returns whether or not any mark in the render group changed value (due to
   *  animation or other updates) on the last call to `advance`
   */
  changed(t = void 0) {
    return t === void 0 ? this._changedLastTick : this._changedLastTick && this.getMarks().some((e) => e.changed(t));
  }
}
function oa(r = []) {
  return new hr(r);
}
const ta = 5e3;
class Le {
  constructor(t, e) {
    this._timeProvider = null, this._listeners = [], this._defaultDuration = 1e3, this._defaultCurve = G, this._changedLastTick = !1, this.framesWithUpdate = 0, this.id = t, e === void 0 && console.error(
      "Mark constructor requires an ID and an object defining attributes"
    );
    let i = {};
    Object.keys(e).forEach(
      (a) => {
        let n = new S(
          Object.assign(Object.assign({}, e[a]), {
            computeArg: this
          })
        );
        n.addListener(
          (s, o) => this._attributesChanged(a, o)
        ), i[a] = n;
      }
    ), this.attributes = i;
  }
  /**
   * Applies configuration options to the mark.
   *
   * @param opts Options for the mark group, including:
   *  - `animationDuration`: the default animation duration in milliseconds
   *    (default 1000)
   *  - `animationCurve`: the default animation curve to use (default ease-in-out)
   * @returns this render group
   */
  configure(t) {
    return t.animationDuration !== void 0 && (this._defaultDuration = t.animationDuration), t.animationCurve !== void 0 && (this._defaultCurve = t.animationCurve), this;
  }
  addListener(t) {
    return this._listeners.push(t), this;
  }
  removeListener(t) {
    let e = this._listeners.indexOf(t);
    return e >= 0 && (this._listeners = this._listeners.splice(e, 1)), this;
  }
  _attributesChanged(t, e) {
    this._changedLastTick = !0, this._listeners.forEach((i) => i(this, t, e));
  }
  setTimeProvider(t) {
    return this._timeProvider = t, Object.values(this.attributes).forEach(
      (e) => e.setTimeProvider(this._timeProvider)
    ), this;
  }
  /**
   * Advances the time of the animations by the given number of msec, and
   * returns whether or not a redraw is needed.
   *
   * @param dt the number of milliseconds between this call and the previous
   *    call to advance(). If not passed, the mark's time provider will be used
   *    to compute the current time.
   * @returns True if any mark attribute has been updated, or false otherwise.
   */
  advance(t = void 0) {
    let e = !1;
    return Object.values(this.attributes).forEach((i) => {
      i.advance(t) && (e = !0);
    }), e ? (this.framesWithUpdate += 1, this.framesWithUpdate > ta && console.warn("Marks are being updated excessively!"), this._changedLastTick = !0, !0) : (this.framesWithUpdate = 0, this._changedLastTick = !1, !1);
  }
  /**
   * Instantaneously sets the value of an attribute, either taking the new
   * provided value or re-computing the value.
   *
   * @param attrName Attribute name to update.
   * @param newValue The new value of the attribute, or undefined if the
   *  attribute should recompute its value using its value function.
   */
  setAttr(t, e = void 0) {
    let i = this.attributes[t];
    i === void 0 && console.error(`No attribute named '${String(t)}'`);
    let a = i.last();
    return e === void 0 ? i.compute() : i.set(e), _t(a, i.data()) || this._listeners.forEach((n) => n(this, t, !1)), this;
  }
  /**
   * Gets the (potentially transformed) value of an attribute.
   *
   * @param attrName Name of the attribute to retrieve.
   * @returns The value of the attribute
   *
   * * @see Attribute.get
   */
  attr(t, e = !0) {
    return this.attributes[t] || console.error(`No attribute named '${String(t)}'`), e ? this.attributes[t].get() : this.attributes[t].getUntransformed();
  }
  /**
   * Gets the true data value (non-animated) for an attribute.
   *
   * @param attrName Name of the attribute to retrieve.
   * @returns The non-animated value of the attribute
   *
   * @see Attribute.data
   */
  data(t) {
    return this.attributes[t] === void 0 && console.error(`No attribute named '${String(t)}'`), this.attributes[t].data();
  }
  /**
   * Marks that the transform has changed for the given attribute.
   *
   * @param attrName Name of the attribute for which to update the transform.
   * @returns this mark
   *
   * @see Attribute.updateTransform
   */
  updateTransform(t) {
    return this.attributes[t] === void 0 && console.error(`No attribute named '${String(t)}'`), this.attributes[t].updateTransform(), this;
  }
  animateTo(t, e, i = {}) {
    if (!this.attributes.hasOwnProperty(t))
      return console.error(`No attribute named '${String(t)}'`), this;
    if (typeof e == "function")
      return this.attributes[t].set(e), this.animate(t, {
        duration: i.duration,
        curve: i.curve
      }), this;
    let a = i.duration === void 0 ? this._defaultDuration : i.duration, n = i.curve === void 0 ? this._defaultCurve : i.curve, s = new B(
      Z(e),
      a,
      n
    ).withDelay(i.delay || 0);
    return this.attributes[t].animate(s), this;
  }
  animate(t, e = {}) {
    if (!this.attributes.hasOwnProperty(t))
      return console.error(
        `Attempting to animate undefined property ${String(t)}`
      ), this;
    let i;
    if (e instanceof B)
      i = e;
    else if (e.interpolator !== void 0) {
      let a = e.interpolator;
      i = new B(
        a,
        e.duration !== void 0 ? e.duration : this._defaultDuration,
        e.curve !== void 0 ? e.curve : this._defaultCurve
      ).withDelay(e.delay || 0);
    } else {
      let a = this.data(t);
      if (!_t(a, this.attributes[t].last()) || !_t(a, this.attributes[t].future()))
        i = new B(
          Z(a),
          e.duration !== void 0 ? e.duration : this._defaultDuration,
          e.curve !== void 0 ? e.curve : this._defaultCurve
        ).withDelay(e.delay || 0);
      else
        return this;
    }
    return this.attributes[t].animate(i), this;
  }
  /**
   * Waits for the animations on the specified attribute name(s) to complete.
   *
   * @param attrNames An attribute name or array of attribute names to wait for.
   * @param rejectOnCancel If true (default), reject the promise if any animation is
   *  canceled or superseded. If false, resolve the promise in this case.
   * @returns a `Promise` that resolves when all the animations for the given
   *  attributes have completed, and rejects if any of their animations are
   *  canceled or superseded by another animation (unless `rejectOnCancel` is set
   *  to `false`). If none of the listed attributes have an active animation,
   *  the promise resolves immediately.
   */
  wait(t, e = !0) {
    let i = Array.isArray(t) ? t : [t];
    return Promise.all(
      i.map((a) => this.attributes[a].wait(e))
    );
  }
  /**
   * @param attrNames the attributes to check for changes in (if none provided,
   *  checks all attributes)
   *
   * @returns whether or not this mark changed value (due to animation or
   * other updates) on the last call to `advance`
   */
  changed(t = void 0) {
    return t === void 0 ? this._changedLastTick : Array.isArray(t) ? this._changedLastTick && t.some((e) => this.attributes[e].changed()) : this._changedLastTick && this.attributes[t].changed();
  }
}
class la {
  constructor(t) {
    this._callbacks = [], this._lastTick = void 0, this.stopped = !0, typeof t.advance == "function" ? this.toAdvance = [t] : this.toAdvance = t, this.start();
  }
  onChange(t) {
    return this._callbacks.push(t), this;
  }
  start() {
    return this._lastTick = window.performance.now(), this.stopped = !1, this._callbacks.forEach((t) => t()), requestAnimationFrame((t) => this.tick(t)), this;
  }
  stop() {
    return this._lastTick = void 0, this.stopped = !0, this;
  }
  tick(t) {
    this._lastTick === void 0 && (this._lastTick = window.performance.now()), this.toAdvance.map((e) => e.advance(t - this._lastTick)).some((e) => e) && this._callbacks.forEach((e) => e()), this.stopped || requestAnimationFrame((e) => this.tick(e)), this._lastTick = t;
  }
}
class ha {
  constructor(t) {
    this._callbacks = [], this._lastTick = void 0, this.stopped = !0, typeof t.advance == "function" ? this.toAdvance = [t] : this.toAdvance = t, this.start();
  }
  onChange(t) {
    return this._callbacks.push(t), this;
  }
  start() {
    if (this.stopped)
      return this._lastTick = window.performance.now(), this.stopped = !1, this._callbacks.forEach((t) => t()), requestAnimationFrame((t) => this.tick(t)), this;
  }
  stop() {
    return this._lastTick = void 0, this.stopped = !0, this;
  }
  tick(t) {
    this._lastTick === void 0 && (this._lastTick = window.performance.now()), this.toAdvance.map((e) => e.advance(t - this._lastTick)).some((e) => e) ? (this._callbacks.forEach((e) => e()), this.stopped || requestAnimationFrame((e) => this.tick(e)), this._lastTick = t) : this.stop();
  }
}
var ea = /* @__PURE__ */ ((r) => (r.Waiting = "waiting", r.Entering = "entering", r.Visible = "visible", r.Exiting = "exiting", r))(ea || {}), ra = /* @__PURE__ */ ((r) => (r.Show = "show", r.Hide = "hide", r))(ra || {});
class ua {
  constructor(t) {
    this.pool = /* @__PURE__ */ new Map(), this.queuedAnimations = /* @__PURE__ */ new Map(), this._flushTimer = null, this._renderGroup = null, this.defer = !1, t.create || console.error("StageManager requires a create callback"), this._callbacks = {
      create: t.create,
      show: t.show || (async () => {
      }),
      hide: t.hide || (async () => {
      }),
      destroy: t.destroy || (() => {
      })
    };
  }
  /**
   * Sets options on the stage manager.
   *
   * @param opts Options to configure. Currently the only option supported is
   *  `{@link defer}`.
   * @returns This stage manager object with the options updated
   */
  configure(t = {}) {
    return t.defer !== void 0 && (this.defer = t.defer), this;
  }
  /**
   * Attaches this stage manager to a render group so that it can add and remove
   * marks before showing and after hiding them.
   *
   * @param renderGroup the render group to add and remove marks from
   * @returns this stage manager
   */
  attach(t) {
    return this._renderGroup = t, this;
  }
  /**
   * Performs the action for the mark with the given ID, and calls the
   * appropriate callbacks.
   */
  _perform(t, e) {
    let i = this.pool.get(t);
    if (!(!i || !i.element)) {
      if (e == "show") {
        if (i.lastState == "visible")
          return;
        i.lastState = "entering", this._callbacks.show(i.element, i.info).then(
          () => {
            i.state == "entering" && (i.state = "visible", i.lastState = "visible");
          },
          () => {
          }
        );
      } else if (e == "hide") {
        if (i.lastState == "exiting" || i.lastState == "waiting")
          return;
        i.lastState = "exiting", this._callbacks.hide(i.element, i.info).then(
          () => {
            let a = this.pool.get(t);
            a && a.lastState == "exiting" && (this._renderGroup && this._renderGroup.removeMark(a.element), this._callbacks.destroy(t, a.info), this.pool.delete(t));
          },
          () => {
          }
        );
      }
    }
  }
  /**
   * Adds the given action to the queue if `{@link defer}` is `true`, otherwise
   * performs the action immediately.
   *
   * @returns `true` if the action was performed or queued successfully, or
   *  `false` if the current state of the mark indicated that a similar action
   *  has already been queued.
   */
  _enqueue(t, e) {
    let i = this.pool.get(t);
    if (!i.element)
      return !1;
    if (e == "show") {
      if (i.state == "entering" || i.state == "visible")
        return !1;
      i.state = "entering";
    } else if (e == "hide") {
      if (i.state == "exiting")
        return !1;
      i.state = "exiting";
    } else
      console.error("Unknown action enqueued:", e);
    return this.defer ? (this.queuedAnimations.set(t, e), this._flushTimer || (this._flushTimer = window.setTimeout(() => this._flush(), 0))) : this._perform(t, e), !0;
  }
  /**
   * Performs all actions that have been queued and clears the queue.
   */
  _flush() {
    this._flushTimer = null, this.queuedAnimations.forEach((t, e) => {
      this._perform(e, t);
    }), this.queuedAnimations.clear();
  }
  /**
   * Attempts to show a mark with the given ID.
   *
   * @param id The ID of the mark to show, which should contain sufficient
   *    information to uniquely describe the mark.
   * @param infoCB Additional info about the mark to create. This info will be
   *    stored along with the mark and passed in subsequent callbacks involving
   *    this ID. If this value is a function, the function will be called with
   *    the ID as a parameter (only if the mark does not already exist). This
   *    can allow for saving computation when repeatedly showing a mark for the
   *    same ID.
   * @returns `true` if the mark was not visible and will be made visible, or
   *    `false` otherwise.
   */
  show(t, e = void 0) {
    if (!this.pool.has(t)) {
      let i = e != null ? typeof e == "function" ? e(t) : e : null, a = this._callbacks.create(t, i);
      this._renderGroup && this._renderGroup.addMark(a), this.pool.set(t, {
        element: a,
        info: i,
        state: "waiting",
        lastState: "waiting"
        /* Waiting */
      });
    }
    return this._enqueue(
      t,
      "show"
      /* Show */
    );
  }
  /**
   * Attempts to hide a mark with the given ID.
   *
   * @param id The ID of the mark to hide.
   * @returns `true` if the mark was visible and will be made invisible and
   *    subsequently destroyed, or `false` otherwise.
   */
  hide(t) {
    return this.pool.has(t) ? this._enqueue(
      t,
      "hide"
      /* Hide */
    ) : !1;
  }
  /**
   * Retrieves the stored information for the mark with the given ID
   * @param id the ID of the mark to look up
   * @returns the stored information for this mark, or `null` if the mark is not
   *  currently visible, entering, or exiting.
   */
  getInfo(t) {
    return this.pool.has(t) ? this.pool.get(t).info : null;
  }
  /**
   * Retrieves the mark element with the given ID
   * @param id the ID of the mark to look up
   * @returns the mark element if it is visible or being staged, or `null`
   *    otherwise
   */
  getElement(t) {
    return this.pool.has(t) ? this.pool.get(t).element : null;
  }
  /**
   * @returns a `Map` where the keys are mark IDs, and the values are instances
   *   of `{@link StagedMark}` representing the mark elements and their current
   *   and previous states
   *
   * @see getAllVisible
   */
  getAll() {
    return new Map(this.pool);
  }
  /**
   * @returns an array of the mark IDs that are currently visible or being
   *    staged (including those that are exiting)
   * @see getAllVisibleIDs
   */
  getAllIDs() {
    return Array.from(this.pool.keys());
  }
  /**
   * @returns a `Map` where the keys are mark IDs for marks that are either
   *   visible or currently entering, and the values are instances of
   *   `{@link StagedMark}` representing the mark elements and their current
   *   and previous states
   *
   * @see getAll
   */
  getAllVisible() {
    let t = /* @__PURE__ */ new Map();
    for (let [e, i] of this.pool)
      (i.state == "visible" || i.state == "entering") && i.element && t.set(e, i);
    return t;
  }
  /**
   * @returns an array of the mark IDs that are currently visible or entering
   * @see getAllIDs
   */
  getAllVisibleIDs() {
    return Array.from(this.pool.keys()).filter(
      (t) => (this.pool.get(t).state == "visible" || this.pool.get(t).state == "entering") && !!this.pool.get(t).element
    );
  }
  /**
   * @returns whether the mark with the given ID is visible or entering
   */
  isVisible(t) {
    return this.pool.has(t) && (this.pool.get(t).state == "visible" || this.pool.get(t).state == "entering");
  }
}
function gt(r, t, e) {
  e > 0 ? (r[0].animate(
    new B(Z(t[0]), e, G)
  ), r[1].animate(
    new B(Z(t[1]), e, G)
  )) : (r[0].set(t[0]), r[1].set(t[1]));
}
class ca {
  constructor(t = {}) {
    this.animationDuration = 1e3, this.squareAspect = !0, this._xDomain = [
      new S(0),
      new S(1)
    ], this._yDomain = [
      new S(0),
      new S(1)
    ], this._xRange = [
      new S(0),
      new S(1)
    ], this._yRange = [
      new S(0),
      new S(1)
    ], this._xScaleFactor = new S(1), this._yScaleFactor = new S(1), this._translateX = new S(0), this._translateY = new S(0), this._calculatingTransform = !1, this.timeProvider = lr(), this.controller = null, this._updatedNoAdvance = !1, this.listeners = [], this.xScale = Object.assign(
      (e) => ((e - this.xDomain()[0]) * this.xRSpan() / this.xDSpan() + this.xRange()[0]) * this._xScaleFactor.get() + this._translateX.get(),
      {
        domain: () => {
          let e = this.xRange();
          return [this.xScale.invert(e[0]), this.xScale.invert(e[1])];
        },
        range: () => [this._xRange[0].get(), this._xRange[1].get()],
        invert: (e) => ((e - this._translateX.get()) / this._xScaleFactor.get() - this.xRange()[0]) * this.xDSpan() / this.xRSpan() + this.xDomain()[0]
      }
    ), this.yScale = Object.assign(
      (e) => ((e - this.yDomain()[0]) * this.yRSpan() / this.yDSpan() + this.yRange()[0]) * this._yScaleFactor.get() + this._translateY.get(),
      {
        domain: () => {
          let e = this.yRange();
          return [this.yScale.invert(e[0]), this.yScale.invert(e[1])];
        },
        range: () => [this._yRange[0].get(), this._yRange[1].get()],
        invert: (e) => ((e - this._translateY.get()) / this._yScaleFactor.get() - this.yRange()[0]) * this.yDSpan() / this.yRSpan() + this.yDomain()[0]
      }
    ), this.xDomain([0, 1]), this.yDomain([0, 1]), this.xRange([0, 1]), this.yRange([0, 1]), this.configure(t), this._xScaleFactor.setTimeProvider(this.timeProvider), this._yScaleFactor.setTimeProvider(this.timeProvider), this._translateX.setTimeProvider(this.timeProvider), this._translateY.setTimeProvider(this.timeProvider);
  }
  configure(t = {}) {
    return this.animationDuration = t.animationDuration !== void 0 ? t.animationDuration : 1e3, this.minScale = t.minScale !== void 0 ? t.minScale : 0.1, this.maxScale = t.maxScale !== void 0 ? t.maxScale : 14, this;
  }
  xDomain(t = void 0, e = !1) {
    return t === void 0 ? [this._xDomain[0].get(), this._xDomain[1].get()] : (gt(
      this._xDomain,
      t,
      e ? this.animationDuration : 0
    ), this);
  }
  yDomain(t = void 0, e = !1) {
    return t === void 0 ? [this._yDomain[0].get(), this._yDomain[1].get()] : (gt(
      this._yDomain,
      t,
      e ? this.animationDuration : 0
    ), this);
  }
  xRange(t = void 0, e = !1) {
    return t === void 0 ? [this._xRange[0].get(), this._xRange[1].get()] : (gt(
      this._xRange,
      t,
      e ? this.animationDuration : 0
    ), this);
  }
  yRange(t = void 0, e = !1) {
    return t === void 0 ? [this._yRange[0].get(), this._yRange[1].get()] : (gt(
      this._yRange,
      t,
      e ? this.animationDuration : 0
    ), this);
  }
  xDSpan() {
    return this._xDomain[1].get() - this._xDomain[0].get();
  }
  yDSpan() {
    return this._yDomain[1].get() - this._yDomain[0].get();
  }
  xRSpan() {
    return this._xRange[1].get() - this._xRange[0].get();
  }
  yRSpan() {
    return this._yRange[1].get() - this._yRange[0].get();
  }
  /**
   * Changes the domains of the scales so that the aspect ratio is square.
   *
   * @returns this Scales instance
   */
  makeSquareAspect() {
    let t = this.xRSpan() / this.xDSpan(), e = this.yRSpan() / this.yDSpan(), i = this.yDomain(), a = this.xDomain();
    if (t < e) {
      let n = (i[0] + i[1]) * 0.5, s = this.yRSpan() / t;
      this.yDomain([n - s * 0.5, n + s * 0.5]);
    } else {
      let n = (a[0] + a[1]) * 0.5, s = this.xRSpan() / e;
      this.xDomain([n - s * 0.5, n + s * 0.5]);
    }
    return this;
  }
  onUpdate(t) {
    return this.listeners.push(t), this;
  }
  isNeutral() {
    return Math.abs(this._xScaleFactor.get() - 1) <= 0.01 && Math.abs(this._yScaleFactor.get() - 1) <= 0.01 && Math.abs(this._translateX.get()) <= 5 && Math.abs(this._translateY.get()) <= 5;
  }
  advance(t = void 0) {
    return this.timeProvider.advance(t), [
      this._xDomain[0].advance(t),
      this._xDomain[1].advance(t),
      this._yDomain[0].advance(t),
      this._yDomain[1].advance(t),
      this._xRange[0].advance(t),
      this._xRange[1].advance(t),
      this._yRange[0].advance(t),
      this._yRange[1].advance(t),
      this._xScaleFactor.advance(t),
      this._yScaleFactor.advance(t),
      this._translateX.advance(t),
      this._translateY.advance(t)
    ].some((i) => i) ? (this._updatedNoAdvance = !1, this.listeners.forEach((i) => i(this)), !0) : (this._updatedNoAdvance || (this.listeners.forEach((i) => i(this)), this._updatedNoAdvance = !0), !1);
  }
  // Increases the scale by the given amount, optionally centering by the given
  // point in transformed pixel space
  scaleBy(t, e = null) {
    this.unfollow();
    let i = this._translateX.get(), a = this._translateY.get(), n = this._xScaleFactor.get(), s = this._yScaleFactor.get();
    e ? e = [(e[0] - i) / n, (e[1] - a) / s] : e = [
      (this.xRange[0] + this.xRange[1]) * 0.5,
      (this.yRange[0] + this.yRange[1]) * 0.5
    ];
    let o = typeof t == "number" ? t : t[0], l = typeof t == "number" ? t : t[1], h = n + o;
    return h <= this.maxScale && h >= this.minScale && (this._xScaleFactor.set(h), this._translateX.set(i - o * e[0])), h = s + l, h <= this.maxScale && h >= this.minScale && (this._yScaleFactor.set(h), this._translateY.set(a - l * e[1])), this;
  }
  // Translates the scales by the given amount
  translateBy(t, e) {
    return this.unfollow(), this._translateX.set(this._translateX.get() + t), this._translateY.set(this._translateY.get() + e), this;
  }
  transform(t = void 0, e = !1) {
    if (t !== void 0) {
      if (this.unfollow(), e) {
        let i = (a) => new B(
          Z(a),
          this.animationDuration,
          G
        );
        t.kx !== void 0 ? this._xScaleFactor.animate(i(t.kx)) : t.k !== void 0 && this._xScaleFactor.animate(i(t.k)), t.ky !== void 0 ? this._yScaleFactor.animate(i(t.ky)) : t.k !== void 0 && this._yScaleFactor.animate(i(t.k)), t.x !== void 0 && this._translateX.animate(i(t.x)), t.y !== void 0 && this._translateY.animate(i(t.y));
      } else
        t.kx !== void 0 ? this._xScaleFactor.set(t.kx) : t.k !== void 0 && this._xScaleFactor.set(t.k), t.ky !== void 0 ? this._yScaleFactor.set(t.ky) : t.k !== void 0 && this._yScaleFactor.set(t.k), t.x !== void 0 && this._translateX.set(t.x), t.y !== void 0 && this._translateY.set(t.y);
      return this;
    } else {
      let i = this._xScaleFactor.last(), a = this._yScaleFactor.last();
      return {
        k: (i + a) * 0.5,
        kx: i,
        ky: a,
        x: this._translateX.last(),
        y: this._translateY.last()
      };
    }
  }
  /**
   * Resets the zoom transform to the identity transform.
   * @param animated Whether to animate the change
   * @returns this `Scales` instance
   */
  reset(t = !1) {
    return this.transform({ k: 1, x: 0, y: 0 }, t);
  }
  /**
   * Animates or changes the scale and translate factors to change to the
   * viewport specified by the given controller. The controller is not followed
   * or saved after the initial transformation.
   *
   * @param controller An object specifying the new zoom transform through the
   *    `transform()` method
   * @param animated Whether to animate the transition (default `true`)
   *
   * @returns this `Scales` instance
   */
  zoomTo(t, e = !0) {
    return this.transform(t.transform(this), e);
  }
  _calculateControllerTransform() {
    this._calculatingTransform = !0;
    let t = this.controller.transform(this);
    return this._calculatingTransform = !1, t;
  }
  /**
   * Causes the scales to automatically update whenever the given scales
   * controller returns a different transform.
   *
   * @param controller An object specifying the correct zoom transform at any
   *    given time
   * @param animated Whether to animate the initial zoom to the controller's
   *    value.
   */
  follow(t, e = !0) {
    if (this.controller = t, this._xScaleFactor.set(() => {
      if (this._calculatingTransform)
        return this._xScaleFactor.last();
      let i = this._calculateControllerTransform();
      return i.kx || i.k;
    }), this._yScaleFactor.set(() => {
      if (this._calculatingTransform)
        return this._yScaleFactor.last();
      let i = this._calculateControllerTransform();
      return i.ky || i.k;
    }), this._translateX.set(() => this._calculatingTransform ? this._translateX.last() : this._calculateControllerTransform().x), this._translateY.set(() => this._calculatingTransform ? this._translateY.last() : this._calculateControllerTransform().y), e) {
      let i = (a) => new B(
        Z(a),
        this.animationDuration,
        G
      );
      this._xScaleFactor.animate(i(this._xScaleFactor.data())), this._yScaleFactor.animate(i(this._yScaleFactor.data())), this._translateX.animate(i(this._translateX.data())), this._translateY.animate(i(this._translateY.data()));
    }
    return this;
  }
  /**
   * Removes the controller that the scales are currently following.
   *
   * @returns this `Scales` instance
   */
  unfollow() {
    return this.controller != null && (this._xScaleFactor.set(this._xScaleFactor.get()), this._yScaleFactor.set(this._yScaleFactor.get()), this._translateX.set(this._translateX.get()), this._translateY.set(this._translateY.get())), this.controller = null, this;
  }
  /**
   * Waits until all animations on the scales have finished, then resolves the
   * promise.
   */
  wait(t = !0) {
    return Promise.all(
      [
        ...this._xDomain,
        ...this._yDomain,
        ...this._xRange,
        ...this._yRange,
        this._xScaleFactor,
        this._yScaleFactor,
        this._translateX,
        this._translateY
      ].map((e) => e.wait(t))
    );
  }
}
class ur {
  /**
   * @param marks An array of marks to follow.
   * @param opts Options for the zoom calculation:
   *  - `centerMark`: The mark to place at the center of the viewport
   *  - `xAttr`: The attribute name that defines the x coordinate of each mark
   *    (default `x`). If `transformCoordinates` is `false`, the un-transformed
   *    value of the attribute will be taken.
   *  - `yAttr`: The attribute name that defines the y coordinate of each mark
   *    (default `y`) If `transformCoordinates` is `false`, the un-transformed
   *    value of the attribute will be taken.
   *  - `padding`: The amount of padding around the box bounding the given marks
   *    to include in the zoom transform.
   *  - `transformCoordinates`: Whether or not to transform the coordinates using
   *    the x/y attributes' transform functions. Typically if using the Scales
   *    to perform the transformation, you will want to keep this value at its
   *    default of `false`. Running the transform function while computing the
   *    scale transforms can lead to infinite recursions. Only set this to true
   *    if you are using the `Scales` outside of the main `Attribute` value
   *    calculation and transformation pipeline.
   */
  constructor(t, e = {}) {
    this.lastCompute = void 0, this.marks = t, this.centerMark = e.centerMark !== void 0 ? e.centerMark : void 0, this.centerMark && !this.marks.includes(this.centerMark) && (this.marks = [...this.marks, this.centerMark]), this.xAttr = e.xAttr !== void 0 ? e.xAttr : "x", this.yAttr = e.yAttr !== void 0 ? e.yAttr : "y", this.padding = e.padding !== void 0 ? e.padding : 20, this.transformCoordinates = e.transformCoordinates ?? !1, this.inverseTransformCoordinates = e.inverseTransformCoordinates ?? !1;
  }
  transform(t) {
    if (this.lastCompute && this.lastCompute.scales === t && this.lastCompute.time == t.timeProvider())
      return this.lastCompute.result;
    let e = this.marks.map((v) => this._getMarkLocation(t, v)), i, a, n, s, o = this.centerMark !== void 0 ? this._getMarkLocation(t, this.centerMark) : null, l = t.transform(), { x: h, y: u } = Qi(e);
    if (o) {
      let v = Math.max(
        h[1] - o.x,
        o.x - h[0]
      ), w = Math.max(
        u[1] - o.y,
        o.y - u[0]
      );
      h = [o.x - v, o.x + v], u = [o.y - w, o.y + w];
    }
    let c, f;
    Math.abs(h[1] - h[0]) > 0 ? c = (Math.abs(t.xRSpan()) - this.padding * 2) / (h[1] - h[0]) / (Math.abs(t.xRSpan()) / Math.abs(t.xDSpan())) : c = l.kx, Math.abs(u[1] - u[0]) > 0 ? f = (Math.abs(t.yRSpan()) - this.padding * 2) / (u[1] - u[0]) / (Math.abs(t.yRSpan()) / Math.abs(t.yDSpan())) : f = l.ky;
    let m = l.ky / l.kx;
    c = Math.min(c, t.maxScale), f = Math.min(f, t.maxScale), f < c * m ? (n = f / m, s = f) : (n = c, s = c * m), i = (h[0] + h[1]) * 0.5, a = (u[0] + u[1]) * 0.5, i = (i - t.xDomain()[0]) * t.xRSpan() / t.xDSpan() + t.xRange()[0], a = (a - t.yDomain()[0]) * t.yRSpan() / t.yDSpan() + t.yRange()[0];
    let p = -i * n + (t.xRange()[0] + t.xRange()[1]) * 0.5, b = -a * s + (t.yRange()[0] + t.yRange()[1]) * 0.5, y = {
      kx: n,
      ky: s,
      x: p,
      y: b
    };
    return this.lastCompute = { scales: t, time: t.timeProvider(), result: y }, y;
  }
  _getMarkLocation(t, e) {
    let i = {
      x: e.attr(this.xAttr, this.transformCoordinates),
      y: e.attr(this.yAttr, this.transformCoordinates)
    };
    return this.inverseTransformCoordinates && (i = {
      x: t.xScale.invert(i.x),
      y: t.yScale.invert(i.y)
    }), i;
  }
}
function fa(r, t = {}) {
  return new ur([r], { centerMark: r, ...t });
}
function da(r, t = {}) {
  return new ur(r, { ...t });
}
class ma {
  constructor(t = {}) {
    this.markCollections = [], this._positionMap = null, this._binSizes = null, this._extents = null, this._numBins = null, this._numMarks = null, this._avgMarksPerBin = null, this._coordinateAttributes = t.coordinateAttributes ?? ["x", "y"], this._transformCoordinates = t.transformCoordinates ?? !0, this._avgMarksPerBin = t.marksPerBin ?? null;
  }
  /**
   * Adds a mark collection to the position map so that the coordinates of the
   * marks it contains will be tracked, and its marks can be returned by
   * `{@link marksNear}`.
   *
   * @param markCollection A collection of marks, such as a render group, a
   *  single mark, an array of marks, or a function returning a mark or array of
   *  marks.
   * @returns this `PositionMap` instance
   */
  add(t) {
    return this.markCollections.push(t), this;
  }
  /**
   * Removes a mark collection from the position map.
   *
   * @param markCollection The collection to remove (must be identical by ===
   *  to the mark collection that was originally added)
   * @returns This `PositionMap` instance
   */
  remove(t) {
    let e = this.markCollections.indexOf(t);
    return e < 0 && console.error(
      "Tried to remove mark collection which does not exist:",
      t
    ), this.markCollections.splice(e, 1), this;
  }
  /**
   * Notifies the position map that positions have changed and the mark positions
   * need to be recalculated. This does not recalculate the positions immediately.
   *
   * @returns this `PositionMap` instance
   */
  invalidate() {
    return this._positionMap = null, this._binSizes = null, this._extents = null, this._numBins = null, this._numMarks = null, this;
  }
  /**
   * Retrieves the mark positions and produces the internal representation to
   * calculate distances. This method should most likely not be called by user
   * code, as it will automatically be called when `marksNear` is called.
   *
   * @returns this `PositionMap` instance
   */
  compute() {
    return console.log("computing interaction map"), this._extents = new Array(this._coordinateAttributes.length).fill([
      1e12,
      -1e12
    ]), this._numMarks = 0, this._forEachMark((t) => {
      this._coordinateAttributes.forEach((e, i) => {
        let a = t.attr(e, this._transformCoordinates);
        a < this._extents[i][0] && (this._extents[i][0] = a), a > this._extents[i][1] && (this._extents[i][1] = a);
      }), this._numMarks += 1;
    }), this._numMarks == 0 ? this : (this._numBins = Math.round(
      this._numMarks / (this._avgMarksPerBin ?? Math.min(Math.max(1, this._numMarks / 100), 10))
    ), this._binSizes = this._extents.map(
      (t) => Math.ceil((t[1] - t[0]) / this._numBins)
    ), this._positionMap = /* @__PURE__ */ new Map(), this._forEachMark((t) => {
      let e = this._coordinateAttributes.map(
        (a) => t.attr(a, this._transformCoordinates)
      ), i = this._getPositionID(e);
      this._positionMap.has(i) ? this._positionMap.get(i).push(t) : this._positionMap.set(i, [t]);
    }), this);
  }
  _forEachMark(t) {
    this.markCollections.forEach((e) => {
      if (e instanceof hr)
        e.forEach(t);
      else if (e instanceof Le)
        t(e);
      else if (typeof e.forEach == "function")
        e.forEach(t);
      else if (typeof e == "function") {
        let i = e();
        i instanceof Le ? t(i) : i.forEach(t);
      } else
        console.error(
          "Unrecognized mark collection type in position map:",
          e
        );
    });
  }
  _getPositionID(t) {
    return (this._numBins === null || !this._extents || !this._binSizes) && console.error("Cannot hash position without computing first"), t.length != this._coordinateAttributes.length && console.error(
      `Need exactly ${this._coordinateAttributes.length} coordinates, got ${t.length}`
    ), t.reduce(
      (e, i, a) => e * this._numBins + Math.floor((i - this._extents[a][0]) / this._binSizes[a]),
      0
    );
  }
  /**
   * Retrieves all marks that are within the given distance of the given set of
   * coordinates.
   *
   * @param location The coordinates of a point to search by.
   * @param distance The maximum Euclidean distance allowed for points to be
   *  included in the results.
   * @param exact If `false`, return a list of candidates that is guaranteed to
   *  include all points within `distance` of `location`, but may include some
   *  false positives.
   *
   * @returns a list of marks whose coordinates are within `distance` of `location`,
   *  as well as potentially some false positives if `exact` is set to `false`.
   *  If `exact` is `true`, the returned array is sorted by Euclidean distance.
   */
  marksNear(t, e, i = !0) {
    if (this._positionMap || this.compute(), this._numMarks == 0)
      return [];
    let a = this._recursiveBinWalk(t, e);
    return i ? a.map((s) => {
      let o = this._coordinateAttributes.map(
        (l) => s.attr(l, this._transformCoordinates)
      );
      return [
        s,
        Math.sqrt(
          o.reduce(
            (l, h, u) => l + (h - t[u]) * (h - t[u]),
            0
          )
        )
      ];
    }).filter(([s, o]) => o <= e).sort((s, o) => s[1] - o[1]).map(([s, o]) => s) : a;
  }
  _recursiveBinWalk(t, e, i = []) {
    let a = i.length;
    if (a == t.length)
      return this._positionMap.get(this._getPositionID(i)) ?? [];
    let n = Math.ceil(e / this._binSizes[a]), s = new Array(n * 2 + 1).fill(0).map(
      (l, h) => (h - n) * this._binSizes[a] + t[a]
    ), o = [];
    return s.forEach((l) => {
      o = [
        ...o,
        ...this._recursiveBinWalk(t, e, [
          ...i,
          l
        ])
      ];
    }), o;
  }
}
export {
  B as Animator,
  S as Attribute,
  Ki as AttributeRecompute,
  ha as LazyTicker,
  Le as Mark,
  ur as MarkFollower,
  hr as MarkRenderGroup,
  ma as PositionMap,
  qt as PreloadableAnimator,
  ca as Scales,
  ua as StageManager,
  ra as StagingAction,
  ea as StagingState,
  la as Ticker,
  Vt as autoMixingFunction,
  sa as basicAnimationTo,
  fa as centerOn,
  Ni as colorMixingFunction,
  oa as createRenderGroup,
  G as curveEaseInOut,
  sr as curveLinear,
  na as interpolateAlongPath,
  Z as interpolateTo,
  aa as interpolateToFunction,
  da as markBox,
  Vi as numericalArrayMixingFunction,
  or as numericalMixingFunction
};
