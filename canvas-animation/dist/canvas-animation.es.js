var mr = Object.defineProperty;
var gr = (r, t, e) => t in r ? mr(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var Lt = (r, t, e) => (gr(r, typeof t != "symbol" ? t + "" : t, e), e);
function M(r, t) {
  let e = r.length;
  Array.isArray(r[0]) || (r = [r]), Array.isArray(t[0]) || (t = t.map((n) => [n]));
  let i = t[0].length, a = t[0].map((n, o) => t.map((l) => l[o])), s = r.map((n) => a.map((o) => {
    let l = 0;
    if (!Array.isArray(n)) {
      for (let h of o)
        l += n * h;
      return l;
    }
    for (let h = 0; h < n.length; h++)
      l += n[h] * (o[h] || 0);
    return l;
  }));
  return e === 1 && (s = s[0]), i === 1 ? s.map((n) => n[0]) : s;
}
function it(r) {
  return $(r) === "string";
}
function $(r) {
  return (Object.prototype.toString.call(r).match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}
function _t(r, t) {
  r = +r, t = +t;
  let e = (Math.floor(r) + "").length;
  if (t > e)
    return +r.toFixed(t - e);
  {
    let i = 10 ** (e - t);
    return Math.round(r / i) * i;
  }
}
function Re(r) {
  if (!r)
    return;
  r = r.trim();
  const t = /^([a-z]+)\((.+?)\)$/i, e = /^-?[\d.]+$/;
  let i = r.match(t);
  if (i) {
    let a = [];
    return i[2].replace(/\/?\s*([-\w.]+(?:%|deg)?)/g, (s, n) => {
      /%$/.test(n) ? (n = new Number(n.slice(0, -1) / 100), n.type = "<percentage>") : /deg$/.test(n) ? (n = new Number(+n.slice(0, -3)), n.type = "<angle>", n.unit = "deg") : e.test(n) && (n = new Number(n), n.type = "<number>"), s.startsWith("/") && (n = n instanceof Number ? n : new Number(n), n.alpha = !0), a.push(n);
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
function Ee(r) {
  return r[r.length - 1];
}
function bt(r, t, e) {
  return isNaN(r) ? t : isNaN(t) ? r : r + (t - r) * e;
}
function Be(r, t, e) {
  return (e - r) / (t - r);
}
function qt(r, t, e) {
  return bt(t[0], t[1], Be(r[0], r[1], e));
}
function ze(r) {
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
var pr = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  interpolate: bt,
  interpolateInv: Be,
  isString: it,
  last: Ee,
  mapRange: qt,
  multiplyMatrices: M,
  parseCoordGrammar: ze,
  parseFunction: Re,
  toPrecision: _t,
  type: $
});
class _r {
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
const O = new _r();
var B = {
  gamut_mapping: "lch.c",
  precision: 5,
  deltaE: "76"
  // Default deltaE method
};
const R = {
  // for compatibility, the four-digit chromaticity-derived ones everyone else uses
  D50: [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585],
  D65: [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329]
};
function Yt(r) {
  return Array.isArray(r) ? r : R[r];
}
function yt(r, t, e, i = {}) {
  if (r = Yt(r), t = Yt(t), !r || !t)
    throw new TypeError(`Missing white point to convert ${r ? "" : "from"}${!r && !t ? "/" : ""}${t ? "" : "to"}`);
  if (r === t)
    return e;
  let a = { W1: r, W2: t, XYZ: e, options: i };
  if (O.run("chromatic-adaptation-start", a), a.M || (a.W1 === R.D65 && a.W2 === R.D50 ? a.M = [
    [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
    [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
    [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008]
  ] : a.W1 === R.D50 && a.W2 === R.D65 && (a.M = [
    [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
    [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
    [0.012314001688319899, -0.020507696433477912, 1.3303659366080753]
  ])), O.run("chromatic-adaptation-end", a), a.M)
    return M(a.M, a.XYZ);
  throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
}
const br = 75e-6, S = class S {
  constructor(t) {
    var a, s, n;
    this.id = t.id, this.name = t.name, this.base = t.base ? S.get(t.base) : null, this.aliases = t.aliases, this.base && (this.fromBase = t.fromBase, this.toBase = t.toBase);
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
    t.cssId && !((a = this.formats.functions) != null && a.color) ? (this.formats.color = { id: t.cssId }, Object.defineProperty(this, "cssId", { value: t.cssId })) : (s = this.formats) != null && s.color && !((n = this.formats) != null && n.color.id) && (this.formats.color.id = this.id), this.referred = t.referred, Object.defineProperty(this, "path", {
      value: yr(this).reverse(),
      writable: !1,
      enumerable: !0,
      configurable: !0
    }), O.run("colorspace-init-end", this);
  }
  inGamut(t, { epsilon: e = br } = {}) {
    if (this.isPolar)
      return t = this.toBase(t), this.base.inGamut(t, { epsilon: e });
    let i = Object.values(this.coords);
    return t.every((a, s) => {
      let n = i[s];
      if (n.type !== "angle" && n.range) {
        if (Number.isNaN(a))
          return !0;
        let [o, l] = n.range;
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
      return t = te(t, this), t;
    let e;
    return t === "default" ? e = Object.values(this.formats)[0] : e = this.formats[t], e ? (e = te(e, this), e) : null;
  }
  // We cannot rely on simple === because then ColorSpace objects cannot be proxied
  equals(t) {
    return t ? this === t || this.id === t.id : !1;
  }
  to(t, e) {
    if (arguments.length === 1 && ([t, e] = [t.space, t.coords]), t = S.get(t), this.equals(t))
      return e;
    e = e.map((o) => Number.isNaN(o) ? 0 : o);
    let i = this.path, a = t.path, s, n;
    for (let o = 0; o < i.length && i[o].equals(a[o]); o++)
      s = i[o], n = o;
    if (!s)
      throw new Error(`Cannot convert between color spaces ${this} and ${t}: no connection space was found`);
    for (let o = i.length - 1; o > n; o--)
      e = i[o].toBase(e);
    for (let o = n + 1; o < a.length; o++)
      e = a[o].fromBase(e);
    return e;
  }
  from(t, e) {
    return arguments.length === 1 && ([t, e] = [t.space, t.coords]), t = S.get(t), t.to(this, e);
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
    return [...new Set(Object.values(S.registry))];
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
    if (!t || t instanceof S)
      return t;
    if ($(t) === "string") {
      let a = S.registry[t.toLowerCase()];
      if (!a)
        throw new TypeError(`No color space found with id = "${t}"`);
      return a;
    }
    if (e.length)
      return S.get(...e);
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
    let i = $(t), a, s;
    if (i === "string" ? t.includes(".") ? [a, s] = t.split(".") : [a, s] = [, t] : Array.isArray(t) ? [a, s] = t : (a = t.space, s = t.coordId), a = S.get(a), a || (a = e), !a)
      throw new TypeError(`Cannot resolve coordinate reference ${t}: No color space specified and relative references are not allowed here`);
    if (i = $(s), i === "number" || i === "string" && s >= 0) {
      let h = Object.entries(a.coords)[s];
      if (h)
        return { space: a, id: h[0], index: s, ...h[1] };
    }
    a = S.get(a);
    let n = s.toLowerCase(), o = 0;
    for (let h in a.coords) {
      let u = a.coords[h];
      if (h.toLowerCase() === n || ((l = u.name) == null ? void 0 : l.toLowerCase()) === n)
        return { space: a, id: h, index: o, ...u };
      o++;
    }
    throw new TypeError(`No "${s}" coordinate found in ${a.name}. Its coordinates are: ${Object.keys(a.coords).join(", ")}`);
  }
};
Lt(S, "registry", {}), Lt(S, "DEFAULT_FORMAT", {
  type: "functions",
  name: "color"
});
let f = S;
function yr(r) {
  let t = [r];
  for (let e = r; e = e.base; )
    t.push(e);
  return t;
}
function te(r, { coords: t } = {}) {
  if (r.coords && !r.coordGrammar) {
    r.type || (r.type = "function"), r.name || (r.name = "color"), r.coordGrammar = ze(r.coords);
    let e = Object.entries(t).map(([i, a], s) => {
      let n = r.coordGrammar[s][0], o = a.range || a.refRange, l = n.range, h = "";
      return n == "<percentage>" ? (l = [0, 100], h = "%") : n == "<angle>" && (h = "deg"), { fromRange: o, toRange: l, suffix: h };
    });
    r.serializeCoords = (i, a) => i.map((s, n) => {
      let { fromRange: o, toRange: l, suffix: h } = e[n];
      return o && l && (s = qt(o, l, s)), s = _t(s, a), h && (s += h), s;
    });
  }
  return r;
}
var D = new f({
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
class k extends f {
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
    }), t.base || (t.base = D), t.toXYZ_M && t.fromXYZ_M && (t.toBase ?? (t.toBase = (e) => {
      let i = M(t.toXYZ_M, e);
      return this.white !== this.base.white && (i = yt(this.white, this.base.white, i)), i;
    }), t.fromBase ?? (t.fromBase = (e) => (e = yt(this.base.white, this.white, e), M(t.fromXYZ_M, e)))), t.referred ?? (t.referred = "display"), super(t);
  }
}
function Ye(r, { meta: t } = {}) {
  var i, a, s, n, o;
  let e = { str: (i = String(r)) == null ? void 0 : i.trim() };
  if (O.run("parse-start", e), e.color)
    return e.color;
  if (e.parsed = Re(e.str), e.parsed) {
    let l = e.parsed.name;
    if (l === "color") {
      let h = e.parsed.args.shift(), u = e.parsed.rawArgs.indexOf("/") > 0 ? e.parsed.args.pop() : 1;
      for (let d of f.all) {
        let m = d.getFormat("color");
        if (m && (h === m.id || (a = m.ids) != null && a.includes(h))) {
          const p = Object.keys(d.coords).map((b, y) => e.parsed.args[y] || 0);
          return t && (t.formatId = "color"), { spaceId: d.id, coords: p, alpha: u };
        }
      }
      let c = "";
      if (h in f.registry) {
        let d = (o = (n = (s = f.registry[h].formats) == null ? void 0 : s.functions) == null ? void 0 : n.color) == null ? void 0 : o.id;
        d && (c = `Did you mean color(${d})?`);
      }
      throw new TypeError(`Cannot parse color(${h}). ` + (c || "Missing a plugin?"));
    } else
      for (let h of f.all) {
        let u = h.getFormat(l);
        if (u && u.type === "function") {
          let c = 1;
          (u.lastAlpha || Ee(e.parsed.args).alpha) && (c = e.parsed.args.pop());
          let d = e.parsed.args, m;
          return u.coordGrammar && (m = Object.entries(h.coords).map(([p, b], y) => {
            var q;
            let v = u.coordGrammar[y], w = (q = d[y]) == null ? void 0 : q.type, A = v.find((F) => F == w);
            if (!A) {
              let F = b.name || p;
              throw new TypeError(`${w} not allowed for ${F} in ${l}()`);
            }
            let x = A.range;
            w === "<percentage>" && (x || (x = [0, 1]));
            let P = b.range || b.refRange;
            return x && P && (d[y] = qt(x, P, d[y])), A;
          })), t && Object.assign(t, { formatId: u.name, types: m }), {
            spaceId: h.id,
            coords: d,
            alpha: c
          };
        }
      }
  } else
    for (let l of f.all)
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
  return t instanceof f || (r.space = f.get(t)), r.alpha === void 0 && (r.alpha = 1), r;
}
function at(r, t) {
  return t = f.get(t), t.from(r);
}
function T(r, t) {
  let { space: e, index: i } = f.resolveCoord(t, r.space);
  return at(r, e)[i];
}
function Fe(r, t, e) {
  return t = f.get(t), r.coords = t.to(r.space, e), r;
}
function X(r, t, e) {
  if (r = g(r), arguments.length === 2 && $(arguments[1]) === "object") {
    let i = arguments[1];
    for (let a in i)
      X(r, a, i[a]);
  } else {
    typeof e == "function" && (e = e(T(r, t)));
    let { space: i, index: a } = f.resolveCoord(t, r.space), s = at(r, i);
    s[a] = e, Fe(r, i, s);
  }
  return r;
}
var Gt = new f({
  id: "xyz-d50",
  name: "XYZ D50",
  white: "D50",
  base: D,
  fromBase: (r) => yt(D.white, "D50", r),
  toBase: (r) => yt("D50", D.white, r),
  formats: {
    color: {}
  }
});
const Mr = 216 / 24389, ee = 24 / 116, ot = 24389 / 27;
let Dt = R.D50;
var C = new f({
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
  white: Dt,
  base: Gt,
  // Convert D50-adapted XYX to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(r) {
    let e = r.map((i, a) => i / Dt[a]).map((i) => i > Mr ? Math.cbrt(i) : (ot * i + 16) / 116);
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
      t[0] > ee ? Math.pow(t[0], 3) : (116 * t[0] - 16) / ot,
      r[0] > 8 ? Math.pow((r[0] + 16) / 116, 3) : r[0] / ot,
      t[2] > ee ? Math.pow(t[2], 3) : (116 * t[2] - 16) / ot
    ].map((i, a) => i * Dt[a]);
  },
  formats: {
    lab: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function xt(r) {
  return (r % 360 + 360) % 360;
}
function vr(r, t) {
  if (r === "raw")
    return t;
  let [e, i] = t.map(xt), a = i - e;
  return r === "increasing" ? a < 0 && (i += 360) : r === "decreasing" ? a > 0 && (e += 360) : r === "longer" ? -180 < a && a < 180 && (a > 0 ? e += 360 : i += 360) : r === "shorter" && (a > 180 ? e += 360 : a < -180 && (i += 360)), [e, i];
}
var tt = new f({
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
  base: C,
  fromBase(r) {
    let [t, e, i] = r, a;
    const s = 0.02;
    return Math.abs(e) < s && Math.abs(i) < s ? a = NaN : a = Math.atan2(i, e) * 180 / Math.PI, [
      t,
      // L is still L
      Math.sqrt(e ** 2 + i ** 2),
      // Chroma
      xt(a)
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
const re = 25 ** 7, Mt = Math.PI, ie = 180 / Mt, G = Mt / 180;
function Ft(r, t, { kL: e = 1, kC: i = 1, kH: a = 1 } = {}) {
  let [s, n, o] = C.from(r), l = tt.from(C, [s, n, o])[1], [h, u, c] = C.from(t), d = tt.from(C, [h, u, c])[1];
  l < 0 && (l = 0), d < 0 && (d = 0);
  let p = ((l + d) / 2) ** 7, b = 0.5 * (1 - Math.sqrt(p / (p + re))), y = (1 + b) * n, v = (1 + b) * u, w = Math.sqrt(y ** 2 + o ** 2), A = Math.sqrt(v ** 2 + c ** 2), x = y === 0 && o === 0 ? 0 : Math.atan2(o, y), P = v === 0 && c === 0 ? 0 : Math.atan2(c, v);
  x < 0 && (x += 2 * Mt), P < 0 && (P += 2 * Mt), x *= ie, P *= ie;
  let q = h - s, F = A - w, E = P - x, H = x + P, Ht = Math.abs(E), V;
  w * A === 0 ? V = 0 : Ht <= 180 ? V = E : E > 180 ? V = E - 360 : E < -180 ? V = E + 360 : console.log("the unthinkable has happened");
  let Vt = 2 * Math.sqrt(A * w) * Math.sin(V * G / 2), hr = (s + h) / 2, At = (w + A) / 2, Wt = Math.pow(At, 7), z;
  w * A === 0 ? z = H : Ht <= 180 ? z = H / 2 : H < 360 ? z = (H + 360) / 2 : z = (H - 360) / 2;
  let Jt = (hr - 50) ** 2, ur = 1 + 0.015 * Jt / Math.sqrt(20 + Jt), Qt = 1 + 0.045 * At, W = 1;
  W -= 0.17 * Math.cos((z - 30) * G), W += 0.24 * Math.cos(2 * z * G), W += 0.32 * Math.cos((3 * z + 6) * G), W -= 0.2 * Math.cos((4 * z - 63) * G);
  let Kt = 1 + 0.015 * At * W, cr = 30 * Math.exp(-1 * ((z - 275) / 25) ** 2), dr = 2 * Math.sqrt(Wt / (Wt + re)), fr = -1 * Math.sin(2 * cr * G) * dr, nt = (q / (e * ur)) ** 2;
  return nt += (F / (i * Qt)) ** 2, nt += (Vt / (a * Kt)) ** 2, nt += fr * (F / (i * Qt)) * (Vt / (a * Kt)), Math.sqrt(nt);
}
const wr = 75e-6;
function K(r, t = r.space, { epsilon: e = wr } = {}) {
  r = g(r), t = f.get(t);
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
function I(r, { method: t = B.gamut_mapping, space: e = r.space } = {}) {
  if (it(arguments[1]) && (e = arguments[1]), e = f.get(e), K(r, e, { epsilon: 0 }))
    return g(r);
  let i = L(r, e);
  if (t !== "clip" && !K(r, e)) {
    let a = I(et(i), { method: "clip", space: e });
    if (Ft(r, a) > 2) {
      let s = f.resolveCoord(t), n = s.space, o = s.id, l = L(i, n), u = (s.range || s.refRange)[0], c = 0.01, d = u, m = T(l, o);
      for (; m - d > c; ) {
        let p = et(l);
        p = I(p, { space: e, method: "clip" }), Ft(l, p) - 2 < c ? d = T(l, o) : m = T(l, o), X(l, o, (d + m) / 2);
      }
      i = L(l, e);
    } else
      i = a;
  }
  if (t === "clip" || !K(i, e, { epsilon: 0 })) {
    let a = Object.values(e.coords).map((s) => s.range || []);
    i.coords = i.coords.map((s, n) => {
      let [o, l] = a[n];
      return o !== void 0 && (s = Math.max(o, s)), l !== void 0 && (s = Math.min(s, l)), s;
    });
  }
  return e !== r.space && (i = L(i, r.space)), r.coords = i.coords, r;
}
I.returns = "color";
function L(r, t, { inGamut: e } = {}) {
  r = g(r), t = f.get(t);
  let i = t.from(r), a = { space: t, coords: i, alpha: r.alpha };
  return e && (a = I(a)), a;
}
L.returns = "color";
function vt(r, {
  precision: t = B.precision,
  format: e = "default",
  inGamut: i = !0,
  ...a
} = {}) {
  var l;
  let s;
  r = g(r);
  let n = e;
  e = r.space.getFormat(e) ?? r.space.getFormat("default") ?? f.DEFAULT_FORMAT, i || (i = e.toGamut);
  let o = r.coords;
  if (o = o.map((h) => h || 0), i && !K(r) && (o = I(et(r), i === !0 ? void 0 : i).coords), e.type === "custom")
    if (a.precision = t, e.serialize)
      s = e.serialize(o, r.alpha, a);
    else
      throw new TypeError(`format ${n} can only be used to parse colors, not for serialization`);
  else {
    let h = e.name || "color";
    e.serializeCoords ? o = e.serializeCoords(o, t) : t !== null && (o = o.map((m) => _t(m, t)));
    let u = [...o];
    if (h === "color") {
      let m = e.id || ((l = e.ids) == null ? void 0 : l[0]) || r.space.id;
      u.unshift(m);
    }
    let c = r.alpha;
    t !== null && (c = _t(c, t));
    let d = r.alpha < 1 && !e.noAlpha ? `${e.commas ? "," : " /"} ${c}` : "";
    s = `${h}(${u.join(e.commas ? ", " : " ")}${d})`;
  }
  return s;
}
const kr = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791]
], xr = [
  [1.716651187971268, -0.355670783776392, -0.25336628137366],
  [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
  [0.017639857445311, -0.042770613257809, 0.942103121235474]
];
var St = new k({
  id: "rec2020-linear",
  name: "Linear REC.2020",
  white: "D65",
  toXYZ_M: kr,
  fromXYZ_M: xr,
  formats: {
    color: {}
  }
});
const lt = 1.09929682680944, ae = 0.018053968510807;
var $e = new k({
  id: "rec2020",
  name: "REC.2020",
  base: St,
  // Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
  toBase(r) {
    return r.map(function(t) {
      return t < ae * 4.5 ? t / 4.5 : Math.pow((t + lt - 1) / lt, 1 / 0.45);
    });
  },
  fromBase(r) {
    return r.map(function(t) {
      return t >= ae ? lt * Math.pow(t, 0.45) - (lt - 1) : 4.5 * t;
    });
  },
  formats: {
    color: {}
  }
});
const Sr = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976]
], Cr = [
  [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
  [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
  [0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
];
var Oe = new k({
  id: "p3-linear",
  name: "Linear P3",
  white: "D65",
  toXYZ_M: Sr,
  fromXYZ_M: Cr
});
const Ar = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
], Lr = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
];
var Xe = new k({
  id: "srgb-linear",
  name: "Linear sRGB",
  white: "D65",
  toXYZ_M: Ar,
  fromXYZ_M: Lr,
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
let ne = Array(3).fill("<percentage> | <number>[0, 255]"), oe = Array(3).fill("<number>[0, 255]");
var rt = new k({
  id: "srgb",
  name: "sRGB",
  base: Xe,
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
      coords: ne
    },
    rgb_number: {
      name: "rgb",
      commas: !0,
      coords: oe,
      noAlpha: !0
    },
    color: {
      /* use defaults */
    },
    rgba: {
      coords: ne,
      commas: !0,
      lastAlpha: !0
    },
    rgba_number: {
      name: "rgba",
      commas: !0,
      coords: oe
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
        t < 1 && r.push(t), r = r.map((s) => Math.round(s * 255));
        let i = e && r.every((s) => s % 17 === 0);
        return "#" + r.map((s) => i ? (s / 17).toString(16) : s.toString(16).padStart(2, "0")).join("");
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
}), Ie = new k({
  id: "p3",
  name: "P3",
  base: Oe,
  // Gamma encoding/decoding is the same as sRGB
  fromBase: rt.fromBase,
  toBase: rt.toBase,
  formats: {
    color: {
      id: "display-p3"
    }
  }
});
B.display_space = rt;
if (typeof CSS < "u" && CSS.supports)
  for (let r of [C, $e, Ie]) {
    let t = r.getMinCoords(), i = vt({ space: r, coords: t, alpha: 1 });
    if (CSS.supports("color", i)) {
      B.display_space = r;
      break;
    }
  }
function Dr(r, { space: t = B.display_space, ...e } = {}) {
  let i = vt(r, e);
  if (typeof CSS > "u" || CSS.supports("color", i) || !B.display_space)
    i = new String(i), i.color = r;
  else {
    let a = L(r, t);
    i = new String(vt(a, e)), i.color = a;
  }
  return i;
}
function je(r, t, e = "lab") {
  e = f.get(e);
  let i = e.from(r), a = e.from(t);
  return Math.sqrt(i.reduce((s, n, o) => {
    let l = a[o];
    return isNaN(n) || isNaN(l) ? s : s + (l - n) ** 2;
  }, 0));
}
function Tr(r, t) {
  return r = g(r), t = g(t), r.space === t.space && r.alpha === t.alpha && r.coords.every((e, i) => e === t.coords[i]);
}
function j(r) {
  return T(r, [D, "y"]);
}
function qe(r, t) {
  X(r, [D, "y"], t);
}
function Pr(r) {
  Object.defineProperty(r.prototype, "luminance", {
    get() {
      return j(this);
    },
    set(t) {
      qe(this, t);
    }
  });
}
var Rr = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getLuminance: j,
  register: Pr,
  setLuminance: qe
});
function Er(r, t) {
  r = g(r), t = g(t);
  let e = Math.max(j(r), 0), i = Math.max(j(t), 0);
  return i > e && ([e, i] = [i, e]), (e + 0.05) / (i + 0.05);
}
const Br = 0.56, zr = 0.57, Yr = 0.62, Fr = 0.65, le = 0.022, $r = 1.414, Or = 0.1, Xr = 5e-4, Ir = 1.14, he = 0.027, jr = 1.14;
function ue(r) {
  return r >= le ? r : r + (le - r) ** $r;
}
function Z(r) {
  let t = r < 0 ? -1 : 1, e = Math.abs(r);
  return t * Math.pow(e, 2.4);
}
function qr(r, t) {
  t = g(t), r = g(r);
  let e, i, a, s, n, o;
  t = L(t, "srgb"), [s, n, o] = t.coords;
  let l = Z(s) * 0.2126729 + Z(n) * 0.7151522 + Z(o) * 0.072175;
  r = L(r, "srgb"), [s, n, o] = r.coords;
  let h = Z(s) * 0.2126729 + Z(n) * 0.7151522 + Z(o) * 0.072175, u = ue(l), c = ue(h), d = c > u;
  return Math.abs(c - u) < Xr ? i = 0 : d ? (e = c ** Br - u ** zr, i = e * Ir) : (e = c ** Fr - u ** Yr, i = e * jr), Math.abs(i) < Or ? a = 0 : i > 0 ? a = i - he : a = i + he, a * 100;
}
function Gr(r, t) {
  r = g(r), t = g(t);
  let e = Math.max(j(r), 0), i = Math.max(j(t), 0);
  i > e && ([e, i] = [i, e]);
  let a = e + i;
  return a === 0 ? 0 : (e - i) / a;
}
const Zr = 5e4;
function Ur(r, t) {
  r = g(r), t = g(t);
  let e = Math.max(j(r), 0), i = Math.max(j(t), 0);
  return i > e && ([e, i] = [i, e]), i === 0 ? Zr : (e - i) / i;
}
function Nr(r, t) {
  r = g(r), t = g(t);
  let e = T(r, [C, "l"]), i = T(t, [C, "l"]);
  return Math.abs(e - i);
}
const Hr = 216 / 24389, ce = 24 / 116, ht = 24389 / 27;
let Tt = R.D65;
var $t = new f({
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
  white: Tt,
  base: D,
  // Convert D65-adapted XYZ to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(r) {
    let e = r.map((i, a) => i / Tt[a]).map((i) => i > Hr ? Math.cbrt(i) : (ht * i + 16) / 116);
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
      t[0] > ce ? Math.pow(t[0], 3) : (116 * t[0] - 16) / ht,
      r[0] > 8 ? Math.pow((r[0] + 16) / 116, 3) : r[0] / ht,
      t[2] > ce ? Math.pow(t[2], 3) : (116 * t[2] - 16) / ht
    ].map((i, a) => i * Tt[a]);
  },
  formats: {
    "lab-d65": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
const Pt = Math.pow(5, 0.5) * 0.5 + 0.5;
function Vr(r, t) {
  r = g(r), t = g(t);
  let e = T(r, [$t, "l"]), i = T(t, [$t, "l"]), a = Math.abs(Math.pow(e, Pt) - Math.pow(i, Pt)), s = Math.pow(a, 1 / Pt) * Math.SQRT2 - 40;
  return s < 7.5 ? 0 : s;
}
var gt = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  contrastAPCA: qr,
  contrastDeltaPhi: Vr,
  contrastLstar: Nr,
  contrastMichelson: Gr,
  contrastWCAG21: Er,
  contrastWeber: Ur
});
function Wr(r, t, e = {}) {
  it(e) && (e = { algorithm: e });
  let { algorithm: i, ...a } = e;
  if (!i) {
    let s = Object.keys(gt).map((n) => n.replace(/^contrast/, "")).join(", ");
    throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${s}`);
  }
  r = g(r), t = g(t);
  for (let s in gt)
    if ("contrast" + i.toLowerCase() === s.toLowerCase())
      return gt[s](r, t, a);
  throw new TypeError(`Unknown contrast algorithm: ${i}`);
}
function Ge(r) {
  let [t, e, i] = at(r, D), a = t + 15 * e + 3 * i;
  return [4 * t / a, 9 * e / a];
}
function Ze(r) {
  let [t, e, i] = at(r, D), a = t + e + i;
  return [t / a, e / a];
}
function Jr(r) {
  Object.defineProperty(r.prototype, "uv", {
    get() {
      return Ge(this);
    }
  }), Object.defineProperty(r.prototype, "xy", {
    get() {
      return Ze(this);
    }
  });
}
var Qr = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  register: Jr,
  uv: Ge,
  xy: Ze
});
function Kr(r, t) {
  return je(r, t, "lab");
}
const ti = Math.PI, de = ti / 180;
function ei(r, t, { l: e = 2, c: i = 1 } = {}) {
  let [a, s, n] = C.from(r), [, o, l] = tt.from(C, [a, s, n]), [h, u, c] = C.from(t), d = tt.from(C, [h, u, c])[1];
  o < 0 && (o = 0), d < 0 && (d = 0);
  let m = a - h, p = o - d, b = s - u, y = n - c, v = b ** 2 + y ** 2 - p ** 2, w = 0.511;
  a >= 16 && (w = 0.040975 * a / (1 + 0.01765 * a));
  let A = 0.0638 * o / (1 + 0.0131 * o) + 0.638, x;
  Number.isNaN(l) && (l = 0), l >= 164 && l <= 345 ? x = 0.56 + Math.abs(0.2 * Math.cos((l + 168) * de)) : x = 0.36 + Math.abs(0.4 * Math.cos((l + 35) * de));
  let P = Math.pow(o, 4), q = Math.sqrt(P / (P + 1900)), F = A * (q * x + 1 - q), E = (m / (e * w)) ** 2;
  return E += (p / (i * A)) ** 2, E += v / F ** 2, Math.sqrt(E);
}
const fe = 203;
var Zt = new f({
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
  base: D,
  fromBase(r) {
    return r.map((t) => Math.max(t * fe, 0));
  },
  toBase(r) {
    return r.map((t) => Math.max(t / fe, 0));
  }
});
const ut = 1.15, ct = 0.66, me = 2610 / 2 ** 14, ri = 2 ** 14 / 2610, ge = 3424 / 2 ** 12, pe = 2413 / 2 ** 7, _e = 2392 / 2 ** 7, ii = 1.7 * 2523 / 2 ** 5, be = 2 ** 5 / (1.7 * 2523), dt = -0.56, Rt = 16295499532821565e-27, ai = [
  [0.41478972, 0.579999, 0.014648],
  [-0.20151, 1.120649, 0.0531008],
  [-0.0166008, 0.2648, 0.6684799]
], si = [
  [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
  [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
  [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603]
], ni = [
  [0.5, 0.5, 0],
  [3.524, -4.066708, 0.542708],
  [0.199076, 1.096799, -1.295875]
], oi = [
  [1, 0.1386050432715393, 0.05804731615611886],
  [0.9999999999999999, -0.1386050432715393, -0.05804731615611886],
  [0.9999999999999998, -0.09601924202631895, -0.8118918960560388]
];
var Ue = new f({
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
  base: Zt,
  fromBase(r) {
    let [t, e, i] = r, a = ut * t - (ut - 1) * i, s = ct * e - (ct - 1) * t, o = M(ai, [a, s, i]).map(function(d) {
      let m = ge + pe * (d / 1e4) ** me, p = 1 + _e * (d / 1e4) ** me;
      return (m / p) ** ii;
    }), [l, h, u] = M(ni, o);
    return [(1 + dt) * l / (1 + dt * l) - Rt, h, u];
  },
  toBase(r) {
    let [t, e, i] = r, a = (t + Rt) / (1 + dt - dt * (t + Rt)), n = M(oi, [a, e, i]).map(function(d) {
      let m = ge - d ** be, p = _e * d ** be - pe;
      return 1e4 * (m / p) ** ri;
    }), [o, l, h] = M(si, n), u = (o + (ut - 1) * h) / ut, c = (l + (ct - 1) * u) / ct;
    return [u, c, h];
  },
  formats: {
    // https://drafts.csswg.org/css-color-hdr/#Jzazbz
    color: {}
  }
}), Ot = new f({
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
  base: Ue,
  fromBase(r) {
    let [t, e, i] = r, a;
    const s = 2e-4;
    return Math.abs(e) < s && Math.abs(i) < s ? a = NaN : a = Math.atan2(i, e) * 180 / Math.PI, [
      t,
      // Jz is still Jz
      Math.sqrt(e ** 2 + i ** 2),
      // Chroma
      xt(a)
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
function li(r, t) {
  let [e, i, a] = Ot.from(r), [s, n, o] = Ot.from(t), l = e - s, h = i - n;
  Number.isNaN(a) && Number.isNaN(o) ? (a = 0, o = 0) : Number.isNaN(a) ? a = o : Number.isNaN(o) && (o = a);
  let u = a - o, c = 2 * Math.sqrt(i * n) * Math.sin(u / 2 * (Math.PI / 180));
  return Math.sqrt(l ** 2 + h ** 2 + c ** 2);
}
const Ne = 3424 / 4096, He = 2413 / 128, Ve = 2392 / 128, ye = 2610 / 16384, hi = 2523 / 32, ui = 16384 / 2610, Me = 32 / 2523, ci = [
  [0.3592, 0.6976, -0.0358],
  [-0.1922, 1.1004, 0.0755],
  [7e-3, 0.0749, 0.8434]
], di = [
  [2048 / 4096, 2048 / 4096, 0],
  [6610 / 4096, -13613 / 4096, 7003 / 4096],
  [17933 / 4096, -17390 / 4096, -543 / 4096]
], fi = [
  [0.9999888965628402, 0.008605050147287059, 0.11103437159861648],
  [1.00001110343716, -0.008605050147287059, -0.11103437159861648],
  [1.0000320633910054, 0.56004913547279, -0.3206339100541203]
], mi = [
  [2.0701800566956137, -1.326456876103021, 0.20661600684785517],
  [0.3649882500326575, 0.6804673628522352, -0.04542175307585323],
  [-0.04959554223893211, -0.04942116118675749, 1.1879959417328034]
];
var Xt = new f({
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
  base: Zt,
  fromBase(r) {
    let t = M(ci, r);
    return gi(t);
  },
  toBase(r) {
    let t = pi(r);
    return M(mi, t);
  },
  formats: {
    color: {}
  }
});
function gi(r) {
  let t = r.map(function(e) {
    let i = Ne + He * (e / 1e4) ** ye, a = 1 + Ve * (e / 1e4) ** ye;
    return (i / a) ** hi;
  });
  return M(di, t);
}
function pi(r) {
  return M(fi, r).map(function(i) {
    let a = Math.max(i ** Me - Ne, 0), s = He - Ve * i ** Me;
    return 1e4 * (a / s) ** ui;
  });
}
function _i(r, t) {
  let [e, i, a] = Xt.from(r), [s, n, o] = Xt.from(t);
  return 720 * Math.sqrt((e - s) ** 2 + 0.25 * (i - n) ** 2 + (a - o) ** 2);
}
const bi = [
  [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
  [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
  [0.048177199566046255, 0.26423952494422764, 0.6335478258136937]
], yi = [
  [1.2268798733741557, -0.5578149965554813, 0.28139105017721583],
  [-0.04057576262431372, 1.1122868293970594, -0.07171106666151701],
  [-0.07637294974672142, -0.4214933239627914, 1.5869240244272418]
], Mi = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766]
], vi = [
  [0.9999999984505198, 0.39633779217376786, 0.2158037580607588],
  [1.0000000088817609, -0.10556134232365635, -0.06385417477170591],
  [1.0000000546724108, -0.08948418209496575, -1.2914855378640917]
];
var wt = new f({
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
  base: D,
  fromBase(r) {
    let e = M(bi, r).map((i) => Math.cbrt(i));
    return M(Mi, e);
  },
  toBase(r) {
    let e = M(vi, r).map((i) => i ** 3);
    return M(yi, e);
  },
  formats: {
    oklab: {
      coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function wi(r, t) {
  let [e, i, a] = wt.from(r), [s, n, o] = wt.from(t), l = e - s, h = i - n, u = a - o;
  return Math.sqrt(l ** 2 + h ** 2 + u ** 2);
}
var kt = {
  deltaE76: Kr,
  deltaECMC: ei,
  deltaE2000: Ft,
  deltaEJz: li,
  deltaEITP: _i,
  deltaEOK: wi
};
function J(r, t, e = {}) {
  it(e) && (e = { method: e });
  let { method: i = B.deltaE, ...a } = e;
  r = g(r), t = g(t);
  for (let s in kt)
    if ("deltae" + i.toLowerCase() === s.toLowerCase())
      return kt[s](r, t, a);
  throw new TypeError(`Unknown deltaE method: ${i}`);
}
function ki(r, t = 0.25) {
  let i = [f.get("oklch", "lch"), "l"];
  return X(r, i, (a) => a * (1 + t));
}
function xi(r, t = 0.25) {
  let i = [f.get("oklch", "lch"), "l"];
  return X(r, i, (a) => a * (1 - t));
}
var Si = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  darken: xi,
  lighten: ki
});
function We(r, t, e = 0.5, i = {}) {
  [r, t] = [g(r), g(t)], $(e) === "object" && ([e, i] = [0.5, e]);
  let { space: a, outputSpace: s, premultiplied: n } = i;
  return st(r, t, { space: a, outputSpace: s, premultiplied: n })(e);
}
function Je(r, t, e = {}) {
  let i;
  Ut(r) && ([i, e] = [r, t], [r, t] = i.rangeArgs.colors);
  let {
    maxDeltaE: a,
    deltaEMethod: s,
    steps: n = 2,
    maxSteps: o = 1e3,
    ...l
  } = e;
  i || ([r, t] = [g(r), g(t)], i = st(r, t, l));
  let h = J(r, t), u = a > 0 ? Math.max(n, Math.ceil(h / a) + 1) : n, c = [];
  if (o !== void 0 && (u = Math.min(u, o)), u === 1)
    c = [{ p: 0.5, color: i(0.5) }];
  else {
    let d = 1 / (u - 1);
    c = Array.from({ length: u }, (m, p) => {
      let b = p * d;
      return { p: b, color: i(b) };
    });
  }
  if (a > 0) {
    let d = c.reduce((m, p, b) => {
      if (b === 0)
        return 0;
      let y = J(p.color, c[b - 1].color, s);
      return Math.max(m, y);
    }, 0);
    for (; d > a; ) {
      d = 0;
      for (let m = 1; m < c.length && c.length < o; m++) {
        let p = c[m - 1], b = c[m], y = (b.p + p.p) / 2, v = i(y);
        d = Math.max(d, J(v, p.color), J(v, b.color)), c.splice(m, 0, { p: y, color: i(y) }), m++;
      }
    }
  }
  return c = c.map((d) => d.color), c;
}
function st(r, t, e = {}) {
  if (Ut(r)) {
    let [l, h] = [r, t];
    return st(...l.rangeArgs.colors, { ...l.rangeArgs.options, ...h });
  }
  let { space: i, outputSpace: a, progression: s, premultiplied: n } = e;
  r = g(r), t = g(t), r = et(r), t = et(t);
  let o = { colors: [r, t], options: e };
  if (i ? i = f.get(i) : i = f.registry[B.interpolationSpace] || r.space, a = a ? f.get(a) : i, r = L(r, i), t = L(t, i), r = I(r), t = I(t), i.coords.h && i.coords.h.type === "angle") {
    let l = e.hue = e.hue || "shorter", h = [i, "h"], [u, c] = [T(r, h), T(t, h)];
    [u, c] = vr(l, [u, c]), X(r, h, u), X(t, h, c);
  }
  return n && (r.coords = r.coords.map((l) => l * r.alpha), t.coords = t.coords.map((l) => l * t.alpha)), Object.assign((l) => {
    l = s ? s(l) : l;
    let h = r.coords.map((d, m) => {
      let p = t.coords[m];
      return bt(d, p, l);
    }), u = bt(r.alpha, t.alpha, l), c = { space: i, coords: h, alpha: u };
    return n && (c.coords = c.coords.map((d) => d / u)), a !== i && (c = L(c, a)), c;
  }, {
    rangeArgs: o
  });
}
function Ut(r) {
  return $(r) === "function" && !!r.rangeArgs;
}
B.interpolationSpace = "lab";
function Ci(r) {
  r.defineFunction("mix", We, { returns: "color" }), r.defineFunction("range", st, { returns: "function<color>" }), r.defineFunction("steps", Je, { returns: "array<color>" });
}
var Ai = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  isRange: Ut,
  mix: We,
  range: st,
  register: Ci,
  steps: Je
}), Qe = new f({
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
    let t = Math.max(...r), e = Math.min(...r), [i, a, s] = r, [n, o, l] = [NaN, 0, (e + t) / 2], h = t - e;
    if (h !== 0) {
      switch (o = l === 0 || l === 1 ? 0 : (t - l) / Math.min(l, 1 - l), t) {
        case i:
          n = (a - s) / h + (a < s ? 6 : 0);
          break;
        case a:
          n = (s - i) / h + 2;
          break;
        case s:
          n = (i - a) / h + 4;
      }
      n = n * 60;
    }
    return [n, o * 100, l * 100];
  },
  // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
  toBase: (r) => {
    let [t, e, i] = r;
    t = t % 360, t < 0 && (t += 360), e /= 100, i /= 100;
    function a(s) {
      let n = (s + t / 30) % 12, o = e * Math.min(i, 1 - i);
      return i - o * Math.max(-1, Math.min(n - 3, 9 - n, 1));
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
}), Ke = new f({
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
  base: Qe,
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
}), Li = new f({
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
  base: Ke,
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
    let s = 1 - i, n = s === 0 ? 0 : 1 - e / s;
    return [t, n * 100, s * 100];
  },
  formats: {
    hwb: {
      toGamut: !0,
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
    }
  }
});
const Di = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]
], Ti = [
  [2.0415879038107465, -0.5650069742788596, -0.34473135077832956],
  [-0.9692436362808795, 1.8759675015077202, 0.04155505740717557],
  [0.013444280632031142, -0.11836239223101838, 1.0151749943912054]
];
var tr = new k({
  id: "a98rgb-linear",
  name: "Linear Adobe® 98 RGB compatible",
  white: "D65",
  toXYZ_M: Di,
  fromXYZ_M: Ti
}), Pi = new k({
  id: "a98rgb",
  name: "Adobe® 98 RGB compatible",
  base: tr,
  toBase: (r) => r.map((t) => Math.pow(Math.abs(t), 563 / 256) * Math.sign(t)),
  fromBase: (r) => r.map((t) => Math.pow(Math.abs(t), 256 / 563) * Math.sign(t)),
  formats: {
    color: {
      id: "a98-rgb"
    }
  }
});
const Ri = [
  [0.7977604896723027, 0.13518583717574031, 0.0313493495815248],
  [0.2880711282292934, 0.7118432178101014, 8565396060525902e-20],
  [0, 0, 0.8251046025104601]
], Ei = [
  [1.3457989731028281, -0.25558010007997534, -0.05110628506753401],
  [-0.5446224939028347, 1.5082327413132781, 0.02053603239147973],
  [0, 0, 1.2119675456389454]
];
var er = new k({
  id: "prophoto-linear",
  name: "Linear ProPhoto",
  white: "D50",
  base: Gt,
  toXYZ_M: Ri,
  fromXYZ_M: Ei
});
const Bi = 1 / 512, zi = 16 / 512;
var Yi = new k({
  id: "prophoto",
  name: "ProPhoto",
  base: er,
  toBase(r) {
    return r.map((t) => t < zi ? t / 16 : t ** 1.8);
  },
  fromBase(r) {
    return r.map((t) => t >= Bi ? t ** (1 / 1.8) : 16 * t);
  },
  formats: {
    color: {
      id: "prophoto-rgb"
    }
  }
}), Fi = new f({
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
  base: wt,
  fromBase(r) {
    let [t, e, i] = r, a;
    const s = 2e-4;
    return Math.abs(e) < s && Math.abs(i) < s ? a = NaN : a = Math.atan2(i, e) * 180 / Math.PI, [
      t,
      // OKLab L is still L
      Math.sqrt(e ** 2 + i ** 2),
      // Chroma
      xt(a)
      // Hue, in degrees [0 to 360)
    ];
  },
  // Convert from polar form
  toBase(r) {
    let [t, e, i] = r, a, s;
    return isNaN(i) ? (a = 0, s = 0) : (a = e * Math.cos(i * Math.PI / 180), s = e * Math.sin(i * Math.PI / 180)), [t, a, s];
  },
  formats: {
    oklch: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[0,1]", "<number> | <angle>"]
    }
  }
});
const ve = 203, we = 2610 / 2 ** 14, $i = 2 ** 14 / 2610, Oi = 2523 / 2 ** 5, ke = 2 ** 5 / 2523, xe = 3424 / 2 ** 12, Se = 2413 / 2 ** 7, Ce = 2392 / 2 ** 7;
var Xi = new k({
  id: "rec2100pq",
  name: "REC.2100-PQ",
  base: St,
  toBase(r) {
    return r.map(function(t) {
      return (Math.max(t ** ke - xe, 0) / (Se - Ce * t ** ke)) ** $i * 1e4 / ve;
    });
  },
  fromBase(r) {
    return r.map(function(t) {
      let e = Math.max(t * ve / 1e4, 0), i = xe + Se * e ** we, a = 1 + Ce * e ** we;
      return (i / a) ** Oi;
    });
  },
  formats: {
    color: {
      id: "rec2100-pq"
    }
  }
});
const Ae = 0.17883277, Le = 0.28466892, De = 0.55991073, Et = 3.7743;
var Ii = new k({
  id: "rec2100hlg",
  cssid: "rec2100-hlg",
  name: "REC.2100-HLG",
  referred: "scene",
  base: St,
  toBase(r) {
    return r.map(function(t) {
      return t <= 0.5 ? t ** 2 / 3 * Et : (Math.exp((t - De) / Ae) + Le) / 12 * Et;
    });
  },
  fromBase(r) {
    return r.map(function(t) {
      return t /= Et, t <= 1 / 12 ? Math.sqrt(3 * t) : Ae * Math.log(12 * t - Le) + De;
    });
  },
  formats: {
    color: {
      id: "rec2100-hlg"
    }
  }
});
const rr = {};
O.add("chromatic-adaptation-start", (r) => {
  r.options.method && (r.M = ir(r.W1, r.W2, r.options.method));
});
O.add("chromatic-adaptation-end", (r) => {
  r.M || (r.M = ir(r.W1, r.W2, r.options.method));
});
function Ct({ id: r, toCone_M: t, fromCone_M: e }) {
  rr[r] = arguments[0];
}
function ir(r, t, e = "Bradford") {
  let i = rr[e], [a, s, n] = M(i.toCone_M, r), [o, l, h] = M(i.toCone_M, t), u = [
    [o / a, 0, 0],
    [0, l / s, 0],
    [0, 0, h / n]
  ], c = M(u, i.toCone_M);
  return M(i.fromCone_M, c);
}
Ct({
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
Ct({
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
Ct({
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
Ct({
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
Object.assign(R, {
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
R.ACES = [0.32168 / 0.33767, 1, (1 - 0.32168 - 0.33767) / 0.33767];
const ji = [
  [0.6624541811085053, 0.13400420645643313, 0.1561876870049078],
  [0.27222871678091454, 0.6740817658111484, 0.05368951740793705],
  [-0.005574649490394108, 0.004060733528982826, 1.0103391003129971]
], qi = [
  [1.6410233796943257, -0.32480329418479, -0.23642469523761225],
  [-0.6636628587229829, 1.6153315916573379, 0.016756347685530137],
  [0.011721894328375376, -0.008284441996237409, 0.9883948585390215]
];
var ar = new k({
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
  white: R.ACES,
  toXYZ_M: ji,
  fromXYZ_M: qi,
  formats: {
    color: {}
  }
});
const ft = 2 ** -16, Bt = -0.35828683, mt = (Math.log2(65504) + 9.72) / 17.52;
var Gi = new k({
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
      range: [Bt, mt],
      name: "Red"
    },
    g: {
      range: [Bt, mt],
      name: "Green"
    },
    b: {
      range: [Bt, mt],
      name: "Blue"
    }
  },
  referred: "scene",
  base: ar,
  // from section 4.4.2 Decoding Function
  toBase(r) {
    const t = -0.3013698630136986;
    return r.map(function(e) {
      return e <= t ? (2 ** (e * 17.52 - 9.72) - ft) * 2 : e < mt ? 2 ** (e * 17.52 - 9.72) : 65504;
    });
  },
  // Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
  fromBase(r) {
    return r.map(function(t) {
      return t <= 0 ? (Math.log2(ft) + 9.72) / 17.52 : t < ft ? (Math.log2(ft + t * 0.5) + 9.72) / 17.52 : (Math.log2(t) + 9.72) / 17.52;
    });
  },
  // encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
  // encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
  formats: {
    color: {}
  }
}), Te = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  A98RGB: Pi,
  A98RGB_Linear: tr,
  ACEScc: Gi,
  ACEScg: ar,
  HSL: Qe,
  HSV: Ke,
  HWB: Li,
  ICTCP: Xt,
  JzCzHz: Ot,
  Jzazbz: Ue,
  LCH: tt,
  Lab: C,
  Lab_D65: $t,
  OKLCH: Fi,
  OKLab: wt,
  P3: Ie,
  P3_Linear: Oe,
  ProPhoto: Yi,
  ProPhoto_Linear: er,
  REC_2020: $e,
  REC_2020_Linear: St,
  REC_2100_HLG: Ii,
  REC_2100_PQ: Xi,
  XYZ_ABS_D65: Zt,
  XYZ_D50: Gt,
  XYZ_D65: D,
  sRGB: rt,
  sRGB_Linear: Xe
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
    let i, a, s;
    e ? (i = e.space || e.spaceId, a = e.coords, s = e.alpha) : [i, a, s] = t, Object.defineProperty(this, "space", {
      value: f.get(i),
      writable: !1,
      enumerable: !0,
      configurable: !0
      // see note in https://262.ecma-international.org/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
    }), this.coords = a ? a.slice() : [0, 0, 0], this.alpha = s < 1 ? s : 1;
    for (let n = 0; n < this.coords.length; n++)
      this.coords[n] === "NaN" && (this.coords[n] = NaN);
    for (let n in this.space.coords)
      Object.defineProperty(this, n, {
        get: () => this.get(n),
        set: (o) => this.set(n, o)
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
    let e = Dr(this, ...t);
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
    let { instance: a = !0, returns: s } = i, n = function(...o) {
      let l = e(...o);
      if (s === "color")
        l = _.get(l);
      else if (s === "function<color>") {
        let h = l;
        l = function(...u) {
          let c = h(...u);
          return _.get(c);
        }, Object.assign(l, h);
      } else
        s === "array<color>" && (l = l.map((h) => _.get(h)));
      return l;
    };
    t in _ || (_[t] = n), a && (_.prototype[t] = function(...o) {
      return n(this, ...o);
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
  get: T,
  getAll: at,
  set: X,
  setAll: Fe,
  to: L,
  equals: Tr,
  inGamut: K,
  toGamut: I,
  distance: je,
  toString: vt
});
Object.assign(_, {
  util: pr,
  hooks: O,
  WHITES: R,
  Space: f,
  spaces: f.registry,
  parse: Ye,
  // Global defaults one may want to configure
  defaults: B
});
for (let r of Object.keys(Te))
  f.register(Te[r]);
for (let r in f.registry)
  It(r, f.registry[r]);
O.add("colorspace-init-end", (r) => {
  var t;
  It(r.id, r), (t = r.aliases) == null || t.forEach((e) => {
    It(e, r);
  });
});
function It(r, t) {
  Object.keys(t.coords), Object.values(t.coords).map((i) => i.name);
  let e = r.replace(/-/g, "_");
  Object.defineProperty(_.prototype, e, {
    // Convert coords to coords in another colorspace and return them
    // Source colorspace: this.spaceId
    // Target colorspace: id
    get() {
      let i = this.getAll(r);
      return typeof Proxy > "u" ? i : new Proxy(i, {
        has: (a, s) => {
          try {
            return f.resolveCoord([t, s]), !0;
          } catch {
          }
          return Reflect.has(a, s);
        },
        get: (a, s, n) => {
          if (s && typeof s != "symbol" && !(s in a)) {
            let { index: o } = f.resolveCoord([t, s]);
            if (o >= 0)
              return a[o];
          }
          return Reflect.get(a, s, n);
        },
        set: (a, s, n, o) => {
          if (s && typeof s != "symbol" && !(s in a) || s >= 0) {
            let { index: l } = f.resolveCoord([t, s]);
            if (l >= 0)
              return a[l] = n, this.setAll(r, a), !0;
          }
          return Reflect.set(a, s, n, o);
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
_.extend(kt);
_.extend({ deltaE: J });
Object.assign(_, { deltaEMethods: kt });
_.extend(Si);
_.extend({ contrast: Wr });
_.extend(Qr);
_.extend(Rr);
_.extend(Ai);
_.extend(gt);
function sr(r) {
  return r;
}
function U(r) {
  return r * r * (3 - 2 * r);
}
function Zi(r, t, e, i) {
  return r * t + e * i;
}
function Ui(r, t, e, i) {
  let a = [
    Math.round((r.r * t + e.r * i) * 255),
    Math.round((r.g * t + e.g * i) * 255),
    Math.round((r.b * t + e.b * i) * 255)
  ];
  return `rgb(${a[0]}, ${a[1]}, ${a[2]})`;
}
function Nt(r) {
  if (typeof r == "number")
    return Zi;
  if (typeof r == "string") {
    let t = {};
    return (e, i, a, s) => (t[e] || (t[e] = new _(e).srgb), t[a] || (t[a] = new _(a).srgb), Ui(
      t[e],
      i,
      t[a],
      s
    ));
  }
  return (t, e, i, a) => e < 1 ? t : i;
}
function N(r, t = void 0) {
  return t === void 0 && (t = Nt(r)), {
    finalValue: r,
    interpolate: (e, i) => t(
      e,
      1 - Math.min(i, 1),
      r,
      Math.min(i, 1)
    )
  };
}
function ea(r, t = void 0) {
  return t === void 0 && (t = Nt(r())), {
    interpolate: (e, i) => t(
      e,
      1 - Math.min(i, 1),
      r(),
      Math.min(i, 1)
    )
  };
}
function ra(r, t = void 0) {
  return t === void 0 && (t = Nt(r[0])), {
    interpolate: (e, i) => {
      let a = Math.min(i, 1) * (r.length - 1) - 1, s = Math.min(
        a - Math.floor(a),
        1
      );
      return a < 0 ? t(
        e,
        1 - s,
        r[0],
        s
      ) : t(
        r[Math.floor(a)],
        1 - s,
        r[Math.floor(a) + 1],
        s
      );
    }
  };
}
class Y {
  constructor(t, e = 1e3, i = sr) {
    this.duration = 0, this.finalValue = void 0, this.interpolator = null, this.duration = e, t.hasOwnProperty("finalValue") ? this.finalValue = t.finalValue : this.finalValue = void 0, this.interpolator = t, this.curve = i;
  }
  evaluate(t, e) {
    let i = this.curve(this.duration > 0 ? e / this.duration : 1);
    return this.interpolator.interpolate(t, i);
  }
  withDelay(t) {
    return t ? new Ni(this, t) : this;
  }
}
class jt extends Y {
  constructor(t, e) {
    super(N(t), e, U);
  }
}
class Ni extends Y {
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
function ia(r, t = 1e3, e = sr) {
  return new Y(N(r), t, e);
}
function pt(r, t) {
  return typeof r == "number" && typeof t == "number" ? Math.abs(r - t) <= 1e-3 : r == t;
}
function nr() {
  var r = 0;
  return Object.assign(function() {
    return r;
  }, {
    advance: (e) => {
      r += e;
    }
  });
}
function Hi(r) {
  let t = /* @__PURE__ */ new Set();
  for (; r = Reflect.getPrototypeOf(r); )
    Reflect.ownKeys(r).forEach((i) => t.add(i));
  return t;
}
class Vi {
  constructor(t = void 0) {
    this.info = t, this.promise = new Promise((e, i) => {
      this.reject = i, this.resolve = e;
    });
  }
}
function Wi(r) {
  let t = 1e12, e = -1e12, i = 1e12, a = -1e12;
  return r.forEach((s) => {
    s.x < t && (t = s.x), s.x > e && (e = s.x), s.y < i && (i = s.y), s.y > a && (a = s.y);
  }), { x: [t, e], y: [i, a] };
}
class Q {
  /**
   *
   * @param info Arguments describing how to populate the attribute, or a single
   *    value that should be stored as the `value` or `valueFn` of the attribute.
   */
  constructor(t) {
    if (this.valueFn = void 0, this.transform = void 0, this.cached = !1, this._cachedValue = null, this.computeArg = void 0, this.precompute = !1, this.lazy = !1, this.needsUpdate = !1, this.animation = null, this.label = null, this._getterValue = null, this._computedLastValue = null, this._hasComputed = !1, this._timeProvider = null, this.currentTime = 0, this._changedLastTick = !1, this._listeners = [], this._animationCompleteCallbacks = [], t == null || t == null || !(t.hasOwnProperty("value") || t.hasOwnProperty("valueFn")))
      typeof t == "function" ? this.valueFn = t : this.value = t;
    else {
      let e = t;
      e.valueFn !== void 0 ? this.valueFn = e.valueFn : e.value !== void 0 ? this.value = e.value : console.error(
        "One of `value` or `valueFn` must be defined to create an Attribute"
      ), this.transform = e.transform || null, this.cached = e.cached || !1, this._cachedValue = null, this.computeArg = e.computeArg || null, this.precompute = e.precompute || !1, this.lazy = e.lazy || !1;
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
    this.valueFn && (this._computedLastValue = this.valueFn(this._getComputeArg()));
  }
  // Advances the time of the animation by the given number of msec,
  // and returns whether or not a redraw is needed
  advance(t = void 0) {
    return (this.animation != null || this.needsUpdate || this.valueFn) && (this._timeProvider === null ? this.currentTime += t : this.currentTime = this._timeProvider()), this.animation == null && this._animationCompleteCallbacks.length > 0 && (console.warn(
      "Found animation-complete callbacks for a non-existent animation"
    ), this._cleanUpAnimation(!0)), this._animationFinished() && this._computeAnimation(), this.animation != null || this.needsUpdate ? (this.needsUpdate = !1, this._changedLastTick = !0, !0) : (this.precompute && this.compute(), this._changedLastTick = !1, !1);
  }
  _computeAnimation(t = !0) {
    if (!this.animation)
      return;
    this._timeProvider && (this.currentTime = this._timeProvider());
    let { animator: e, start: i } = this.animation, a = e.evaluate(
      this.valueFn ? this._computedLastValue : this.value,
      Math.min(this.currentTime - i, e.duration)
      // can add a debug flag here
    );
    this._animationFinished() && t ? (this.valueFn ? this.compute() : this.value = a, this._cleanUpAnimation(!1), this._getterValue = null) : this._getterValue = a;
  }
  _animationFinished() {
    return this.animation ? this.animation.animator.duration - 20 <= this.currentTime - this.animation.start : !0;
  }
  _transform(t) {
    let e;
    if (this.transform) {
      let i = this._cachedValue;
      if (i && pt(i.raw, t))
        e = i.result;
      else {
        let a = t;
        e = this.transform(t, this._getComputeArg()), this.cached && (this._cachedValue = {
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
    return this._getterValue != null ? t = this._getterValue : this.valueFn ? ((!this.lazy || !this._hasComputed) && (this.compute(), this._hasComputed = !0), t = this._computedLastValue) : t = this.value, t;
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
      let s = this.getUntransformed();
      return {
        start: s,
        end: s,
        startTime: t || this.currentTime,
        endTime: t || this.currentTime
      };
    }
    if (!(this.animation.animator instanceof jt))
      return console.error(
        "Calling getPreload for a non-preloadable animation is forbidden. If using MarkSet, make sure this attribute is registered as preloadable."
      ), null;
    if (this._animationFinished())
      return this._computeAnimation(), this.getPreloadUntransformed(t);
    let e;
    this.valueFn ? ((!this.lazy || !this._hasComputed) && (this.compute(), this._hasComputed = !0), e = this._computedLastValue) : e = this.value;
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
    typeof t == "function" ? (this.value != null && (this._computedLastValue = this.value), this.valueFn = t, this.value = void 0, this._getterValue = null) : (this.value = t, this.valueFn = null, this._getterValue = null), this.needsUpdate = !0, this.animation && this._cleanUpAnimation(!0), this._listeners.forEach((e) => e(this, !1));
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
    return this.animation && this._computeAnimation(!1), this._getterValue != null ? this._getterValue : this.value !== void 0 ? this.value : this._computedLastValue;
  }
  /**
   * Returns the value that this attribute is approaching if animating (or `null`
   * if not available), or the current value if not animating. This method does
   * _not_ compute a new value for the attribute.
   */
  future() {
    return this.animation ? this.animation.animator.finalValue : this.last();
  }
  /**
   * Marks that the transform has changed for this attribute. Only applies when
   * `cached` is set to true.
   */
  updateTransform() {
    this._cachedValue = null;
  }
  /**
   * Applies an animation to this attribute. The attribute will call the
   * `evaluate` method on the animation every time the attribute's `advance()`
   * method runs, until the time delta since the start of the animation exceeds
   * the duration of the animation.
   * @param animation an animation to run
   */
  animate(t) {
    this._timeProvider && (this.currentTime = this._timeProvider()), this.animation && (this.valueFn ? this._computedLastValue = this.last() : this.value = this.last(), this._cleanUpAnimation(!0)), this.animation = {
      animator: t,
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
    let e = new Vi({ rejectOnCancel: t });
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
function zt(r, t, e) {
  return Object.fromEntries(
    Object.entries(r).map(([i, a]) => [
      i,
      typeof a == "function" ? a(t, e) : a
    ])
  );
}
class or {
  /**
   * @param marks The set of marks that this group should manage, all including
   *  the same set of attributes.
   * @param opts Options for the mark group (see {@link configure})
   */
  constructor(t = [], e = {
    animationDuration: 1e3,
    animationCurve: U
  }) {
    this.timeProvider = null, this.lazyUpdates = !0, this.animatingMarks = /* @__PURE__ */ new Set(), this.updatedMarks = /* @__PURE__ */ new Set(), this.preloadableProperties = /* @__PURE__ */ new Set(), this._forceUpdate = !1, this._markListChanged = !1, this._changedLastTick = !1, this.timeProvider = nr(), this.lazyUpdates = !0, this._defaultDuration = 1e3, this._defaultCurve = U, this.configure(e), this.marks = t, this.marksByID = /* @__PURE__ */ new Map(), this.marks.forEach((i) => {
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
    return this.preloadableProperties.has(t) ? this.forEach((s, n) => {
      let o = zt(i, s, n), l = o.duration === void 0 ? this._defaultDuration : o.duration;
      s.animate(
        t,
        new jt(
          typeof e == "function" ? e(s, n) : e,
          l
        ).withDelay(o.delay || 0)
      );
    }) : this.forEach((s, n) => {
      s.animateTo(
        t,
        typeof e == "function" ? e(s, n) : e,
        zt(i, s, n)
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
    ), this) : (this.forEach((a, s) => {
      let n = zt(e, a, s);
      if (i) {
        let o = n.duration === void 0 ? this._defaultDuration : n.duration, l = a.data(t);
        a.animate(
          t,
          new jt(l, o).withDelay(
            n.delay || 0
          )
        );
      } else
        a.animate(t, n);
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
    }), Hi(this).forEach((a) => {
      a == "getMarks" ? e[a] = () => i : e[a] = (...s) => {
        let n = this.getMarks();
        this.marks = i;
        let o = this[a](...s);
        return this.marks = n, o === this ? e : o;
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
function aa(r = []) {
  return new or(r);
}
const Ji = 5e3;
class Pe {
  constructor(t, e) {
    this._timeProvider = null, this._listeners = [], this._defaultDuration = 1e3, this._defaultCurve = U, this._changedLastTick = !1, this.framesWithUpdate = 0, this.id = t;
    let i = {};
    Object.keys(e).forEach(
      (a) => {
        let s = new Q(
          Object.assign(Object.assign({}, e[a]), {
            computeArg: this
          })
        );
        s.addListener(
          (n, o) => this._attributesChanged(a, o)
        ), i[a] = s;
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
    }), e ? (this.framesWithUpdate += 1, this.framesWithUpdate > Ji && console.warn("Marks are being updated excessively!"), this._changedLastTick = !0, !0) : (this.framesWithUpdate = 0, this._changedLastTick = !1, !1);
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
    let i = this.attributes[t], a = i.last();
    return e === void 0 ? i.compute() : i.set(e), pt(a, i.data()) || this._listeners.forEach((s) => s(this, t, !1)), this;
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
    if (this.attributes[t])
      return e ? this.attributes[t].get() : this.attributes[t].getUntransformed();
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
    return this.attributes[t].data();
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
    return this.attributes[t].updateTransform(), this;
  }
  animateTo(t, e, i = {}) {
    if (typeof e == "function")
      return this.attributes[t].set(e), this.animate(t, {
        duration: i.duration,
        curve: i.curve
      }), this;
    if (!this.attributes.hasOwnProperty(t))
      return console.error(
        `Attempting to animate undefined property ${String(t)}`
      ), this;
    let a = i.duration === void 0 ? this._defaultDuration : i.duration, s = i.curve === void 0 ? this._defaultCurve : i.curve, n = new Y(
      N(e),
      a,
      s
    ).withDelay(i.delay || 0);
    return this.attributes[t].animate(n), this;
  }
  animate(t, e = {}) {
    if (!this.attributes.hasOwnProperty(t))
      return console.error(
        `Attempting to animate undefined property ${String(t)}`
      ), this;
    let i;
    if (e instanceof Y)
      i = e;
    else if (e.interpolator !== void 0) {
      let a = e.interpolator;
      i = new Y(
        a,
        e.duration !== void 0 ? e.duration : this._defaultDuration,
        e.curve !== void 0 ? e.curve : this._defaultCurve
      ).withDelay(e.delay || 0);
    } else {
      let a = this.data(t);
      if (!pt(a, this.attributes[t].last()) || !pt(a, this.attributes[t].future()))
        i = new Y(
          N(a),
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
class sa {
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
class na {
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
var Qi = /* @__PURE__ */ ((r) => (r.Waiting = "waiting", r.Entering = "entering", r.Visible = "visible", r.Exiting = "exiting", r))(Qi || {}), Ki = /* @__PURE__ */ ((r) => (r.Show = "show", r.Hide = "hide", r))(Ki || {});
class oa {
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
class la {
  constructor(t = {}) {
    this.animationDuration = 1e3, this.squareAspect = !0, this._xScaleFactor = new Q(1), this._yScaleFactor = new Q(1), this._translateX = new Q(0), this._translateY = new Q(0), this.timeProvider = nr(), this.controller = null, this._updatedNoAdvance = !1, this.listeners = [], this.xScale = Object.assign(
      (e) => ((e - this._xDomain[0]) * this.xRSpan() / this.xDSpan() + this._xRange[0]) * this._xScaleFactor.get() + this._translateX.get(),
      {
        domain: (e = void 0) => e === void 0 ? this._xDomain : (this._xDomain = e, this.xScale),
        range: (e = void 0) => e === void 0 ? this._xRange : (this._xRange = e, this.xScale),
        invert: (e) => ((e - this._translateX.get()) / this._xScaleFactor.get() - this._xRange[0]) * this.xDSpan() / this.xRSpan() + this._xDomain[0]
      }
    ), this.yScale = Object.assign(
      (e) => ((e - this._yDomain[0]) * this.yRSpan() / this.yDSpan() + this._yRange[0]) * this._yScaleFactor.get() + this._translateY.get(),
      {
        domain: (e = void 0) => e === void 0 ? this._yDomain : (this._yDomain = e, this.yScale),
        range: (e = void 0) => e === void 0 ? this._yRange : (this._yRange = e, this.yScale),
        invert: (e) => ((e - this._translateY.get()) / this._yScaleFactor.get() - this._yRange[0]) * this.yDSpan() / this.yRSpan() + this._yDomain[0]
      }
    ), this.xDomain([0, 1]), this.yDomain([0, 1]), this.xRange([0, 1]), this.yRange([0, 1]), this.configure(t), this._xScaleFactor.setTimeProvider(this.timeProvider), this._yScaleFactor.setTimeProvider(this.timeProvider), this._translateX.setTimeProvider(this.timeProvider), this._translateY.setTimeProvider(this.timeProvider);
  }
  configure(t = {}) {
    return this.animationDuration = t.animationDuration !== void 0 ? t.animationDuration : 1e3, this.minScale = t.minScale !== void 0 ? t.minScale : 0.1, this.maxScale = t.maxScale !== void 0 ? t.maxScale : 14, this;
  }
  xDomain(t = void 0) {
    return t === void 0 ? this.xScale.domain() : (this.xScale.domain(t), this);
  }
  yDomain(t = void 0) {
    return t === void 0 ? this.yScale.domain() : (this.yScale.domain(t), this);
  }
  xRange(t = void 0) {
    return t === void 0 ? this.xScale.range() : (this.xScale.range(t), this);
  }
  yRange(t = void 0) {
    return t === void 0 ? this.yScale.range() : (this.yScale.range(t), this);
  }
  xDSpan() {
    return this._xDomain[1] - this._xDomain[0];
  }
  yDSpan() {
    return this._yDomain[1] - this._yDomain[0];
  }
  xRSpan() {
    return this._xRange[1] - this._xRange[0];
  }
  yRSpan() {
    return this._yRange[1] - this._yRange[0];
  }
  /**
   * Changes the domains of the scales so that the aspect ratio is square.
   *
   * @returns this Scales instance
   */
  makeSquareAspect() {
    let t = this.xRSpan() / this.xDSpan(), e = this.yRSpan() / this.yDSpan();
    if (t < e) {
      let i = (this._yDomain[0] + this._yDomain[1]) * 0.5, a = this.yRSpan() / t;
      this.yDomain([i - a * 0.5, i + a * 0.5]);
    } else {
      let i = (this._xDomain[0] + this._xDomain[1]) * 0.5, a = this.xRSpan() / e;
      this.xDomain([i - a * 0.5, i + a * 0.5]);
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
    let i = this._translateX.get(), a = this._translateY.get(), s = this._xScaleFactor.get(), n = this._yScaleFactor.get();
    e ? e = [(e[0] - i) / s, (e[1] - a) / n] : e = [
      (this.xRange[0] + this.xRange[1]) * 0.5,
      (this.yRange[0] + this.yRange[1]) * 0.5
    ];
    let o = typeof t == "number" ? t : t[0], l = typeof t == "number" ? t : t[1], h = s + o;
    return h <= this.maxScale && h >= this.minScale && (this._xScaleFactor.set(h), this._translateX.set(i - o * e[0])), h = n + l, h <= this.maxScale && h >= this.minScale && (this._yScaleFactor.set(h), this._translateY.set(a - l * e[1])), this;
  }
  // Translates the scales by the given amount
  translateBy(t, e) {
    return this.unfollow(), this._translateX.set(this._translateX.get() + t), this._translateY.set(this._translateY.get() + e), this;
  }
  transform(t = void 0, e = !1) {
    if (t !== void 0) {
      if (this.unfollow(), e) {
        let i = (a) => new Y(
          N(a),
          this.animationDuration,
          U
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
      let i = this.controller.transform(this);
      return i.kx || i.k;
    }), this._yScaleFactor.set(() => {
      let i = this.controller.transform(this);
      return i.ky || i.k;
    }), this._translateX.set(() => this.controller.transform(this).x), this._translateY.set(() => this.controller.transform(this).y), e) {
      let i = (a) => new Y(
        N(a),
        this.animationDuration,
        U
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
}
class lr {
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
    this.lastCompute = void 0, this.marks = t, this.centerMark = e.centerMark !== void 0 ? e.centerMark : void 0, this.centerMark && !this.marks.includes(this.centerMark) && (this.marks = [...this.marks, this.centerMark]), this.xAttr = e.xAttr !== void 0 ? e.xAttr : "x", this.yAttr = e.yAttr !== void 0 ? e.yAttr : "y", this.padding = e.padding !== void 0 ? e.padding : 20, this.transformCoordinates = e.transformCoordinates !== void 0 ? e.transformCoordinates : !1;
  }
  transform(t) {
    if (this.lastCompute && this.lastCompute.scales === t && this.lastCompute.time == t.timeProvider())
      return this.lastCompute.result;
    let e = this.marks.map((v) => this._getMarkLocation(v)), i, a, s, n, o = this.centerMark !== void 0 ? this._getMarkLocation(this.centerMark) : null, l = t.transform(), { x: h, y: u } = Wi(e);
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
    let c, d;
    Math.abs(h[1] - h[0]) > 0 ? c = (Math.abs(t.xRSpan()) - this.padding * 2) / (h[1] - h[0]) / (Math.abs(t.xRSpan()) / Math.abs(t.xDSpan())) : c = l.kx, Math.abs(u[1] - u[0]) > 0 ? d = (Math.abs(t.yRSpan()) - this.padding * 2) / (u[1] - u[0]) / (Math.abs(t.yRSpan()) / Math.abs(t.yDSpan())) : d = l.ky;
    let m = l.ky / l.kx;
    c = Math.min(c, t.maxScale), d = Math.min(d, t.maxScale), d < c * m ? (s = d / m, n = d) : (s = c, n = c * m), i = (h[0] + h[1]) * 0.5, a = (u[0] + u[1]) * 0.5, i = (i - t.xDomain()[0]) * t.xRSpan() / t.xDSpan() + t.xRange()[0], a = (a - t.yDomain()[0]) * t.yRSpan() / t.yDSpan() + t.yRange()[0];
    let p = -i * s + (t.xRange()[0] + t.xRange()[1]) * 0.5, b = -a * n + (t.yRange()[0] + t.yRange()[1]) * 0.5, y = {
      kx: s,
      ky: n,
      x: p,
      y: b
    };
    return this.lastCompute = { scales: t, time: t.timeProvider(), result: y }, y;
  }
  _getMarkLocation(t) {
    return {
      x: t.attr(this.xAttr, this.transformCoordinates),
      y: t.attr(this.yAttr, this.transformCoordinates)
    };
  }
}
function ha(r, t = {}) {
  return new lr([r], { centerMark: r, ...t });
}
function ua(r, t = {}) {
  return new lr(r, { ...t });
}
class ca {
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
      if (e instanceof or)
        e.forEach(t);
      else if (e instanceof Pe)
        t(e);
      else if (Array.isArray(e))
        e.forEach(t);
      else if (typeof e == "function") {
        let i = e();
        i instanceof Pe ? t(i) : i.forEach(t);
      }
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
    return i ? a.map((n) => {
      let o = this._coordinateAttributes.map(
        (l) => n.attr(l, this._transformCoordinates)
      );
      return [
        n,
        Math.sqrt(
          o.reduce(
            (l, h, u) => l + (h - t[u]) * (h - t[u]),
            0
          )
        )
      ];
    }).filter(([n, o]) => o <= e).map(([n, o]) => n) : a;
  }
  _recursiveBinWalk(t, e, i = []) {
    let a = i.length;
    if (a == t.length)
      return this._positionMap.get(this._getPositionID(i)) ?? [];
    let s = Math.ceil(e / this._binSizes[a]), n = new Array(s * 2 + 1).fill(0).map(
      (l, h) => (h - s) * this._binSizes[a] + t[a]
    ), o = [];
    return n.forEach((l) => {
      o = [
        ...o,
        ...this._recursiveBinWalk(t, s, [
          ...i,
          l
        ])
      ];
    }), o;
  }
}
export {
  Y as Animator,
  Q as Attribute,
  na as LazyTicker,
  Pe as Mark,
  lr as MarkFollower,
  or as MarkRenderGroup,
  ca as PositionMap,
  jt as PreloadableAnimator,
  la as Scales,
  oa as StageManager,
  Ki as StagingAction,
  Qi as StagingState,
  sa as Ticker,
  Nt as autoMixingFunction,
  ia as basicAnimationTo,
  ha as centerOn,
  Ui as colorMixingFunction,
  aa as createRenderGroup,
  U as curveEaseInOut,
  sr as curveLinear,
  ra as interpolateAlongPath,
  N as interpolateTo,
  ea as interpolateToFunction,
  ua as markBox,
  Zi as numericalMixingFunction
};