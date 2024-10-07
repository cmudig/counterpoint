var gi = Object.defineProperty;
var pi = (i, t, e) => t in i ? gi(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var Lt = (i, t, e) => (pi(i, typeof t != "symbol" ? t + "" : t, e), e);
function K(i, t) {
  return typeof i == "number" && typeof t == "number" ? Math.abs(i - t) <= 1e-3 : i == t;
}
function Re() {
  var i = 0;
  return Object.assign(function() {
    return i;
  }, {
    advance: (e) => {
      i += e;
    }
  });
}
function _i(i) {
  let t = /* @__PURE__ */ new Set();
  for (; i = Reflect.getPrototypeOf(i); )
    Reflect.ownKeys(i).forEach((r) => t.add(r));
  return t;
}
class yi {
  constructor(t = void 0) {
    this.info = t, this.promise = new Promise((e, r) => {
      this.reject = r, this.resolve = e;
    });
  }
}
function bi(i) {
  let t = 1e12, e = -1e12, r = 1e12, a = -1e12;
  return i.forEach((s) => {
    s.x < t && (t = s.x), s.x > e && (e = s.x), s.y < r && (r = s.y), s.y > a && (a = s.y);
  }), { x: [t, e], y: [r, a] };
}
var Mi = /* @__PURE__ */ ((i) => (i[i.DEFAULT = 0] = "DEFAULT", i[i.ALWAYS = 1] = "ALWAYS", i[i.WHEN_UPDATED = 2] = "WHEN_UPDATED", i))(Mi || {});
class M {
  /**
   *
   * @param info Arguments describing how to populate the attribute, or a single
   *    value that should be stored as the `value` or `valueFn` of the attribute.
   */
  constructor(t) {
    if (this.valueFn = void 0, this.transform = void 0, this.cacheTransform = !1, this._cachedValue = null, this.computeArg = void 0, this.recompute = 0, this.needsUpdate = !1, this.animation = null, this.label = null, this._computedValue = null, this._lastTickValue = void 0, this._animatedValue = null, this._hasComputed = !1, this._timeProvider = null, this.currentTime = 0, this._changedLastTick = !1, this._preload = !1, this._listeners = [], this._animationCompleteCallbacks = [], this._animationCompleteTimeout = null, t == null || t == null || !(t.hasOwnProperty("value") || t.hasOwnProperty("valueFn")))
      typeof t == "function" ? this.valueFn = t : this.value = t;
    else {
      let e = t;
      e.valueFn !== void 0 ? this.valueFn = e.valueFn : e.value !== void 0 ? this.value = e.value : console.error(
        "One of `value` or `valueFn` must be defined to create an Attribute"
      ), this.transform = e.transform ?? null, this.cacheTransform = e.cacheTransform ?? !1, this._cachedValue = null, this.computeArg = e.computeArg ?? null, this.recompute = e.recompute ?? 0, this._preload = e.preload ?? !1;
    }
  }
  /**
   * Registers this attribute as preloadable.
   */
  registerPreloadable() {
    return this._preload = !0, this;
  }
  /**
   * Creates a new Attribute with identical options and values except for the
   * parameters specified in the given options object.
   *
   * @param newOptions An object containing options to apply to the new attribute
   * @returns the new copied attribute
   */
  copy(t = {}) {
    let e = { ...this, ...t };
    return t.value !== void 0 && (e.valueFn = void 0), t.valueFn !== void 0 && (e.value = void 0), new M(e);
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
    ), this._cleanUpAnimation(!0)), this._lastTickValue = void 0, this._lastTickValue = this.getUntransformed(), this.animation != null || this.needsUpdate ? (this.needsUpdate = !1, this._changedLastTick = !0, !0) : (this._changedLastTick = !1, !1);
  }
  _computeAnimation(t = !0) {
    if (!this.animation)
      return;
    this._timeProvider && (this.currentTime = this._timeProvider());
    let { animator: e, start: r, initial: a } = this.animation, s = e.evaluate(
      a,
      Math.min(this.currentTime - r, e.duration)
      // can add a debug flag here
    );
    this._animationFinished() && t ? (this.valueFn ? (this.recompute !== 2 || !this._hasComputed) && (this.compute(), this._hasComputed = !0) : this.value = s, this._cleanUpAnimation(!1), this._animatedValue = null) : this._animatedValue = s;
  }
  _animationFinished() {
    return this.animation ? this.animation.animator.duration + 20 <= this.currentTime - this.animation.start : !0;
  }
  _performTransform(t) {
    let e;
    if (this.transform) {
      let r = this._cachedValue;
      if (r && K(r.raw, t))
        e = r.result;
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
    this._preload && this.animation && !t && (this.valueFn ? ((this.recompute !== 2 || !this._hasComputed) && (this.compute(), this._hasComputed = !0), this._lastTickValue = this.animation.animator.finalValue) : (this.value = this.animation.animator.finalValue, this._lastTickValue = this.value)), this.animation = null, this._animatedValue = null, this._animationCompleteCallbacks.forEach((e) => {
      !t || !e.info.rejectOnCancel ? e.resolve(this) : e.reject({ newValue: this.last() });
    }), this._animationCompleteCallbacks = [], this._animationCompleteTimeout && (clearTimeout(this._animationCompleteTimeout), this._animationCompleteTimeout = null);
  }
  /**
   * Retrieves the current (transformed) value. If a context is not provided,
   * the value returned will be the final value of any active transitions being
   * rendered.
   */
  get() {
    return this._performTransform(this.getUntransformed());
  }
  /**
   * Retrieves the current un-transformed value.
   */
  getUntransformed() {
    if (this._lastTickValue !== void 0 && !this.needsUpdate && this._timeProvider !== null && this.currentTime == this._timeProvider())
      return this._lastTickValue;
    this._computeAnimation();
    let t;
    return this._animatedValue != null ? t = this._animatedValue : this.valueFn ? ((this.recompute !== 2 || !this._hasComputed) && (this.compute(), this._hasComputed = !0), t = this._computedValue) : t = this.value, this._lastTickValue = t, t;
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
    if (this._preload || console.error("Cannot call getPreload on a non-preloadable attribute."), this._timeProvider && (this.currentTime = this._timeProvider()), !this.animation) {
      let r = this.get();
      return {
        start: r,
        end: r,
        startTime: t || this.currentTime,
        endTime: t || this.currentTime
      };
    }
    let e = this.getPreloadUntransformed(t);
    return {
      start: this._performTransform(e.start),
      end: this._performTransform(e.end),
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
    if (this._animationFinished())
      return this._computeAnimation(), this.getPreloadUntransformed(t);
    let e;
    this.valueFn ? ((this.recompute !== 2 || !this._hasComputed) && (this.compute(), this._hasComputed = !0), e = this._computedValue) : e = this.value;
    let r = this.animation.animator.finalValue;
    r === void 0 && console.error(
      "Animations on preloadable attributes must have a final value"
    );
    let a = (t || this.currentTime) - this.currentTime;
    return {
      start: e,
      end: r,
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
    typeof t == "function" ? (this.value != null && (this._computedValue = this.getUntransformed()), this.valueFn = t, this.value = void 0, this._hasComputed = !1, this._animatedValue = null) : (this.value = t, this.valueFn = null, this._animatedValue = null), this.needsUpdate = !0, this._lastTickValue = void 0, this.animation && this._cleanUpAnimation(!0), this._listeners.forEach((e) => e(this, !1));
  }
  /**
   * Retrieves the non-animated value for the attribute, i.e. the final value
   * if an animation is in progress or the current value otherwise. This method
   * computes the value if specified as a value function.
   */
  data() {
    return this.valueFn ? this.valueFn(this._getComputeArg()) : this.animation ? this.animation.animator.finalValue : this.value;
  }
  /**
   * Returns the last value known for this attribute _without_ running the value
   * function.
   */
  last() {
    return this.animation && this._preload && this._computeAnimation(!1), this._lastTickValue !== void 0 ? this._lastTickValue : this._animatedValue != null ? this._animatedValue : this.value !== void 0 ? this.value : this._computedValue;
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
   * @param context the context in which the animation runs
   */
  animate(t) {
    if (this._timeProvider && (this.currentTime = this._timeProvider()), this.animation) {
      this._computeAnimation();
      let e = this._preload ? this.last() : this._animatedValue;
      this.valueFn ? this._computedValue = e : this.value = e, this._lastTickValue = this._animatedValue, this._cleanUpAnimation(!0);
    }
    return this.animation = {
      animator: t,
      initial: this.last(),
      start: this.currentTime
    }, this._computeAnimation(), this._listeners.forEach((e) => e(this, !0)), this;
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
      return new Promise((r, a) => r(this));
    let e = new yi({ rejectOnCancel: t });
    if (this._animationCompleteCallbacks.push(e), this._preload) {
      let { endTime: r } = this.getPreloadUntransformed(), a = this._timeProvider();
      this._animationCompleteTimeout || (this._animationCompleteTimeout = setTimeout(() => {
        this._cleanUpAnimation();
      }, r - a));
    }
    return e.promise;
  }
  /**
   * "Freezes" this attribute by setting it to its last value. This removes any
   * value functions and animations and replaces them with static values. The
   * value function will not be re-run.
   */
  freeze() {
    return this.animation && this._cleanUpAnimation(!0), this.value = this.last(), this.valueFn = void 0, this;
  }
  /**
   * Sets transform of an attribute to a new function, can be applied to an Attribute,
   * a Mark, or a MarkRenderGroup
   * @param attrToModify attribute to modify
   * @param newFunc new function to set transform to
   */
  setTransform(t) {
    this.transform = t, this.updateTransform();
  }
  /**
   * @returns whether or not this attribute changed value (due to animation or
   * other updates) on the last call to `advance`
   */
  changed() {
    return this._changedLastTick;
  }
}
function v(i, t) {
  let e = i.length;
  Array.isArray(i[0]) || (i = [i]), Array.isArray(t[0]) || (t = t.map((n) => [n]));
  let r = t[0].length, a = t[0].map((n, o) => t.map((h) => h[o])), s = i.map((n) => a.map((o) => {
    let h = 0;
    if (!Array.isArray(n)) {
      for (let l of o)
        h += n * l;
      return h;
    }
    for (let l = 0; l < n.length; l++)
      h += n[l] * (o[l] || 0);
    return h;
  }));
  return e === 1 && (s = s[0]), r === 1 ? s.map((n) => n[0]) : s;
}
function st(i) {
  return $(i) === "string";
}
function $(i) {
  return (Object.prototype.toString.call(i).match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}
function bt(i, t) {
  i = +i, t = +t;
  let e = (Math.floor(i) + "").length;
  if (t > e)
    return +i.toFixed(t - e);
  {
    let r = 10 ** (e - t);
    return Math.round(i / r) * r;
  }
}
function Be(i) {
  if (!i)
    return;
  i = i.trim();
  const t = /^([a-z]+)\((.+?)\)$/i, e = /^-?[\d.]+$/;
  let r = i.match(t);
  if (r) {
    let a = [];
    return r[2].replace(/\/?\s*([-\w.]+(?:%|deg)?)/g, (s, n) => {
      /%$/.test(n) ? (n = new Number(n.slice(0, -1) / 100), n.type = "<percentage>") : /deg$/.test(n) ? (n = new Number(+n.slice(0, -3)), n.type = "<angle>", n.unit = "deg") : e.test(n) && (n = new Number(n), n.type = "<number>"), s.startsWith("/") && (n = n instanceof Number ? n : new Number(n), n.alpha = !0), a.push(n);
    }), {
      name: r[1].toLowerCase(),
      rawName: r[1],
      rawArgs: r[2],
      // An argument could be (as of css-color-4):
      // a number, percentage, degrees (hue), ident (in color())
      args: a
    };
  }
}
function ze(i) {
  return i[i.length - 1];
}
function Mt(i, t, e) {
  return isNaN(i) ? t : isNaN(t) ? i : i + (t - i) * e;
}
function Fe(i, t, e) {
  return (e - i) / (t - i);
}
function qt(i, t, e) {
  return Mt(t[0], t[1], Fe(i[0], i[1], e));
}
function Oe(i) {
  return i.map((t) => t.split("|").map((e) => {
    e = e.trim();
    let r = e.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);
    if (r) {
      let a = new String(r[1]);
      return a.range = [+r[2], +r[3]], a;
    }
    return e;
  }));
}
var vi = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  interpolate: Mt,
  interpolateInv: Fe,
  isString: st,
  last: ze,
  mapRange: qt,
  multiplyMatrices: v,
  parseCoordGrammar: Oe,
  parseFunction: Be,
  toPrecision: bt,
  type: $
});
class ki {
  add(t, e, r) {
    if (typeof arguments[0] != "string") {
      for (var t in arguments[0])
        this.add(t, arguments[0][t], arguments[1]);
      return;
    }
    (Array.isArray(t) ? t : [t]).forEach(function(a) {
      this[a] = this[a] || [], e && this[a][r ? "unshift" : "push"](e);
    }, this);
  }
  run(t, e) {
    this[t] = this[t] || [], this[t].forEach(function(r) {
      r.call(e && e.context ? e.context : e, e);
    });
  }
}
const X = new ki();
var F = {
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
function Yt(i) {
  return Array.isArray(i) ? i : R[i];
}
function vt(i, t, e, r = {}) {
  if (i = Yt(i), t = Yt(t), !i || !t)
    throw new TypeError(`Missing white point to convert ${i ? "" : "from"}${!i && !t ? "/" : ""}${t ? "" : "to"}`);
  if (i === t)
    return e;
  let a = { W1: i, W2: t, XYZ: e, options: r };
  if (X.run("chromatic-adaptation-start", a), a.M || (a.W1 === R.D65 && a.W2 === R.D50 ? a.M = [
    [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
    [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
    [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008]
  ] : a.W1 === R.D50 && a.W2 === R.D65 && (a.M = [
    [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
    [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
    [0.012314001688319899, -0.020507696433477912, 1.3303659366080753]
  ])), X.run("chromatic-adaptation-end", a), a.M)
    return v(a.M, a.XYZ);
  throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
}
const wi = 75e-6, C = class C {
  constructor(t) {
    var a, s, n;
    this.id = t.id, this.name = t.name, this.base = t.base ? C.get(t.base) : null, this.aliases = t.aliases, this.base && (this.fromBase = t.fromBase, this.toBase = t.toBase);
    let e = t.coords ?? this.base.coords;
    for (let o in e)
      "name" in e[o] || (e[o].name = o);
    this.coords = e;
    let r = t.white ?? this.base.white ?? "D65";
    this.white = Yt(r), this.formats = t.formats ?? {};
    for (let o in this.formats) {
      let h = this.formats[o];
      h.type || (h.type = "function"), h.name || (h.name = o);
    }
    t.cssId && !((a = this.formats.functions) != null && a.color) ? (this.formats.color = { id: t.cssId }, Object.defineProperty(this, "cssId", { value: t.cssId })) : (s = this.formats) != null && s.color && !((n = this.formats) != null && n.color.id) && (this.formats.color.id = this.id), this.referred = t.referred, Object.defineProperty(this, "path", {
      value: xi(this).reverse(),
      writable: !1,
      enumerable: !0,
      configurable: !0
    }), X.run("colorspace-init-end", this);
  }
  inGamut(t, { epsilon: e = wi } = {}) {
    if (this.isPolar)
      return t = this.toBase(t), this.base.inGamut(t, { epsilon: e });
    let r = Object.values(this.coords);
    return t.every((a, s) => {
      let n = r[s];
      if (n.type !== "angle" && n.range) {
        if (Number.isNaN(a))
          return !0;
        let [o, h] = n.range;
        return (o === void 0 || a >= o - e) && (h === void 0 || a <= h + e);
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
    let r = this.path, a = t.path, s, n;
    for (let o = 0; o < r.length && r[o].equals(a[o]); o++)
      s = r[o], n = o;
    if (!s)
      throw new Error(`Cannot convert between color spaces ${this} and ${t}: no connection space was found`);
    for (let o = r.length - 1; o > n; o--)
      e = r[o].toBase(e);
    for (let o = n + 1; o < a.length; o++)
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
      let r = this.coords[e], a = r.range || r.refRange;
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
      for (let r of e.aliases)
        this.register(r, e);
    return e;
  }
  /**
   * Lookup ColorSpace object by name
   * @param {ColorSpace | string} name
   */
  static get(t, ...e) {
    if (!t || t instanceof C)
      return t;
    if ($(t) === "string") {
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
    var h;
    let r = $(t), a, s;
    if (r === "string" ? t.includes(".") ? [a, s] = t.split(".") : [a, s] = [, t] : Array.isArray(t) ? [a, s] = t : (a = t.space, s = t.coordId), a = C.get(a), a || (a = e), !a)
      throw new TypeError(`Cannot resolve coordinate reference ${t}: No color space specified and relative references are not allowed here`);
    if (r = $(s), r === "number" || r === "string" && s >= 0) {
      let l = Object.entries(a.coords)[s];
      if (l)
        return { space: a, id: l[0], index: s, ...l[1] };
    }
    a = C.get(a);
    let n = s.toLowerCase(), o = 0;
    for (let l in a.coords) {
      let u = a.coords[l];
      if (l.toLowerCase() === n || ((h = u.name) == null ? void 0 : h.toLowerCase()) === n)
        return { space: a, id: l, index: o, ...u };
      o++;
    }
    throw new TypeError(`No "${s}" coordinate found in ${a.name}. Its coordinates are: ${Object.keys(a.coords).join(", ")}`);
  }
};
Lt(C, "registry", {}), Lt(C, "DEFAULT_FORMAT", {
  type: "functions",
  name: "color"
});
let f = C;
function xi(i) {
  let t = [i];
  for (let e = i; e = e.base; )
    t.push(e);
  return t;
}
function ee(i, { coords: t } = {}) {
  if (i.coords && !i.coordGrammar) {
    i.type || (i.type = "function"), i.name || (i.name = "color"), i.coordGrammar = Oe(i.coords);
    let e = Object.entries(t).map(([r, a], s) => {
      let n = i.coordGrammar[s][0], o = a.range || a.refRange, h = n.range, l = "";
      return n == "<percentage>" ? (h = [0, 100], l = "%") : n == "<angle>" && (l = "deg"), { fromRange: o, toRange: h, suffix: l };
    });
    i.serializeCoords = (r, a) => r.map((s, n) => {
      let { fromRange: o, toRange: h, suffix: l } = e[n];
      return o && h && (s = qt(o, h, s)), s = bt(s, a), l && (s += l), s;
    });
  }
  return i;
}
var L = new f({
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
class x extends f {
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
    }), t.base || (t.base = L), t.toXYZ_M && t.fromXYZ_M && (t.toBase ?? (t.toBase = (e) => {
      let r = v(t.toXYZ_M, e);
      return this.white !== this.base.white && (r = vt(this.white, this.base.white, r)), r;
    }), t.fromBase ?? (t.fromBase = (e) => (e = vt(this.base.white, this.white, e), v(t.fromXYZ_M, e)))), t.referred ?? (t.referred = "display"), super(t);
  }
}
function Ye(i, { meta: t } = {}) {
  var r, a, s, n, o;
  let e = { str: (r = String(i)) == null ? void 0 : r.trim() };
  if (X.run("parse-start", e), e.color)
    return e.color;
  if (e.parsed = Be(e.str), e.parsed) {
    let h = e.parsed.name;
    if (h === "color") {
      let l = e.parsed.args.shift(), u = e.parsed.rawArgs.indexOf("/") > 0 ? e.parsed.args.pop() : 1;
      for (let d of f.all) {
        let m = d.getFormat("color");
        if (m && (l === m.id || (a = m.ids) != null && a.includes(l))) {
          const p = Object.keys(d.coords).map((y, b) => e.parsed.args[b] || 0);
          return t && (t.formatId = "color"), { spaceId: d.id, coords: p, alpha: u };
        }
      }
      let c = "";
      if (l in f.registry) {
        let d = (o = (n = (s = f.registry[l].formats) == null ? void 0 : s.functions) == null ? void 0 : n.color) == null ? void 0 : o.id;
        d && (c = `Did you mean color(${d})?`);
      }
      throw new TypeError(`Cannot parse color(${l}). ` + (c || "Missing a plugin?"));
    } else
      for (let l of f.all) {
        let u = l.getFormat(h);
        if (u && u.type === "function") {
          let c = 1;
          (u.lastAlpha || ze(e.parsed.args).alpha) && (c = e.parsed.args.pop());
          let d = e.parsed.args, m;
          return u.coordGrammar && (m = Object.entries(l.coords).map(([p, y], b) => {
            var q;
            let k = u.coordGrammar[b], w = (q = d[b]) == null ? void 0 : q.type, D = k.find((Y) => Y == w);
            if (!D) {
              let Y = y.name || p;
              throw new TypeError(`${w} not allowed for ${Y} in ${h}()`);
            }
            let S = D.range;
            w === "<percentage>" && (S || (S = [0, 1]));
            let E = y.range || y.refRange;
            return S && E && (d[b] = qt(S, E, d[b])), D;
          })), t && Object.assign(t, { formatId: u.name, types: m }), {
            spaceId: l.id,
            coords: d,
            alpha: c
          };
        }
      }
  } else
    for (let h of f.all)
      for (let l in h.formats) {
        let u = h.formats[l];
        if (u.type !== "custom" || u.test && !u.test(e.str))
          continue;
        let c = u.parse(e.str);
        if (c)
          return c.alpha ?? (c.alpha = 1), t && (t.formatId = l), c;
      }
  throw new TypeError(`Could not parse ${i} as a color. Missing a plugin?`);
}
function g(i) {
  if (!i)
    throw new TypeError("Empty color reference");
  st(i) && (i = Ye(i));
  let t = i.space || i.spaceId;
  return t instanceof f || (i.space = f.get(t)), i.alpha === void 0 && (i.alpha = 1), i;
}
function nt(i, t) {
  return t = f.get(t), t.from(i);
}
function P(i, t) {
  let { space: e, index: r } = f.resolveCoord(t, i.space);
  return nt(i, e)[r];
}
function $e(i, t, e) {
  return t = f.get(t), i.coords = t.to(i.space, e), i;
}
function j(i, t, e) {
  if (i = g(i), arguments.length === 2 && $(arguments[1]) === "object") {
    let r = arguments[1];
    for (let a in r)
      j(i, a, r[a]);
  } else {
    typeof e == "function" && (e = e(P(i, t)));
    let { space: r, index: a } = f.resolveCoord(t, i.space), s = nt(i, r);
    s[a] = e, $e(i, r, s);
  }
  return i;
}
var Gt = new f({
  id: "xyz-d50",
  name: "XYZ D50",
  white: "D50",
  base: L,
  fromBase: (i) => vt(L.white, "D50", i),
  toBase: (i) => vt("D50", L.white, i),
  formats: {
    color: {}
  }
});
const Si = 216 / 24389, ie = 24 / 116, lt = 24389 / 27;
let Pt = R.D50;
var T = new f({
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
  white: Pt,
  base: Gt,
  // Convert D50-adapted XYX to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(i) {
    let e = i.map((r, a) => r / Pt[a]).map((r) => r > Si ? Math.cbrt(r) : (lt * r + 16) / 116);
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
  toBase(i) {
    let t = [];
    return t[1] = (i[0] + 16) / 116, t[0] = i[1] / 500 + t[1], t[2] = t[1] - i[2] / 200, [
      t[0] > ie ? Math.pow(t[0], 3) : (116 * t[0] - 16) / lt,
      i[0] > 8 ? Math.pow((i[0] + 16) / 116, 3) : i[0] / lt,
      t[2] > ie ? Math.pow(t[2], 3) : (116 * t[2] - 16) / lt
    ].map((r, a) => r * Pt[a]);
  },
  formats: {
    lab: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function Ct(i) {
  return (i % 360 + 360) % 360;
}
function Ci(i, t) {
  if (i === "raw")
    return t;
  let [e, r] = t.map(Ct), a = r - e;
  return i === "increasing" ? a < 0 && (r += 360) : i === "decreasing" ? a > 0 && (e += 360) : i === "longer" ? -180 < a && a < 180 && (a > 0 ? e += 360 : r += 360) : i === "shorter" && (a > 180 ? e += 360 : a < -180 && (r += 360)), [e, r];
}
var it = new f({
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
  fromBase(i) {
    let [t, e, r] = i, a;
    const s = 0.02;
    return Math.abs(e) < s && Math.abs(r) < s ? a = NaN : a = Math.atan2(r, e) * 180 / Math.PI, [
      t,
      // L is still L
      Math.sqrt(e ** 2 + r ** 2),
      // Chroma
      Ct(a)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(i) {
    let [t, e, r] = i;
    return e < 0 && (e = 0), isNaN(r) && (r = 0), [
      t,
      // L is still L
      e * Math.cos(r * Math.PI / 180),
      // a
      e * Math.sin(r * Math.PI / 180)
      // b
    ];
  },
  formats: {
    lch: {
      coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"]
    }
  }
});
const re = 25 ** 7, kt = Math.PI, ae = 180 / kt, V = kt / 180;
function $t(i, t, { kL: e = 1, kC: r = 1, kH: a = 1 } = {}) {
  let [s, n, o] = T.from(i), h = it.from(T, [s, n, o])[1], [l, u, c] = T.from(t), d = it.from(T, [l, u, c])[1];
  h < 0 && (h = 0), d < 0 && (d = 0);
  let p = ((h + d) / 2) ** 7, y = 0.5 * (1 - Math.sqrt(p / (p + re))), b = (1 + y) * n, k = (1 + y) * u, w = Math.sqrt(b ** 2 + o ** 2), D = Math.sqrt(k ** 2 + c ** 2), S = b === 0 && o === 0 ? 0 : Math.atan2(o, b), E = k === 0 && c === 0 ? 0 : Math.atan2(c, k);
  S < 0 && (S += 2 * kt), E < 0 && (E += 2 * kt), S *= ae, E *= ae;
  let q = l - s, Y = D - w, B = E - S, N = S + E, Wt = Math.abs(B), J;
  w * D === 0 ? J = 0 : Wt <= 180 ? J = B : B > 180 ? J = B - 360 : B < -180 ? J = B + 360 : console.log("the unthinkable has happened");
  let Nt = 2 * Math.sqrt(D * w) * Math.sin(J * V / 2), ui = (s + l) / 2, At = (w + D) / 2, Jt = Math.pow(At, 7), O;
  w * D === 0 ? O = N : Wt <= 180 ? O = N / 2 : N < 360 ? O = (N + 360) / 2 : O = (N - 360) / 2;
  let Qt = (ui - 50) ** 2, ci = 1 + 0.015 * Qt / Math.sqrt(20 + Qt), Kt = 1 + 0.045 * At, Q = 1;
  Q -= 0.17 * Math.cos((O - 30) * V), Q += 0.24 * Math.cos(2 * O * V), Q += 0.32 * Math.cos((3 * O + 6) * V), Q -= 0.2 * Math.cos((4 * O - 63) * V);
  let te = 1 + 0.015 * At * Q, di = 30 * Math.exp(-1 * ((O - 275) / 25) ** 2), fi = 2 * Math.sqrt(Jt / (Jt + re)), mi = -1 * Math.sin(2 * di * V) * fi, ht = (q / (e * ci)) ** 2;
  return ht += (Y / (r * Kt)) ** 2, ht += (Nt / (a * te)) ** 2, ht += mi * (Y / (r * Kt)) * (Nt / (a * te)), Math.sqrt(ht);
}
const Ti = 75e-6;
function et(i, t = i.space, { epsilon: e = Ti } = {}) {
  i = g(i), t = f.get(t);
  let r = i.coords;
  return t !== i.space && (r = t.from(i)), t.inGamut(r, { epsilon: e });
}
function rt(i) {
  return {
    space: i.space,
    coords: i.coords.slice(),
    alpha: i.alpha
  };
}
function I(i, { method: t = F.gamut_mapping, space: e = i.space } = {}) {
  if (st(arguments[1]) && (e = arguments[1]), e = f.get(e), et(i, e, { epsilon: 0 }))
    return g(i);
  let r = A(i, e);
  if (t !== "clip" && !et(i, e)) {
    let a = I(rt(r), { method: "clip", space: e });
    if ($t(i, a) > 2) {
      let s = f.resolveCoord(t), n = s.space, o = s.id, h = A(r, n), u = (s.range || s.refRange)[0], c = 0.01, d = u, m = P(h, o);
      for (; m - d > c; ) {
        let p = rt(h);
        p = I(p, { space: e, method: "clip" }), $t(h, p) - 2 < c ? d = P(h, o) : m = P(h, o), j(h, o, (d + m) / 2);
      }
      r = A(h, e);
    } else
      r = a;
  }
  if (t === "clip" || !et(r, e, { epsilon: 0 })) {
    let a = Object.values(e.coords).map((s) => s.range || []);
    r.coords = r.coords.map((s, n) => {
      let [o, h] = a[n];
      return o !== void 0 && (s = Math.max(o, s)), h !== void 0 && (s = Math.min(s, h)), s;
    });
  }
  return e !== i.space && (r = A(r, i.space)), i.coords = r.coords, i;
}
I.returns = "color";
function A(i, t, { inGamut: e } = {}) {
  i = g(i), t = f.get(t);
  let r = t.from(i), a = { space: t, coords: r, alpha: i.alpha };
  return e && (a = I(a)), a;
}
A.returns = "color";
function wt(i, {
  precision: t = F.precision,
  format: e = "default",
  inGamut: r = !0,
  ...a
} = {}) {
  var h;
  let s;
  i = g(i);
  let n = e;
  e = i.space.getFormat(e) ?? i.space.getFormat("default") ?? f.DEFAULT_FORMAT, r || (r = e.toGamut);
  let o = i.coords;
  if (o = o.map((l) => l || 0), r && !et(i) && (o = I(rt(i), r === !0 ? void 0 : r).coords), e.type === "custom")
    if (a.precision = t, e.serialize)
      s = e.serialize(o, i.alpha, a);
    else
      throw new TypeError(`format ${n} can only be used to parse colors, not for serialization`);
  else {
    let l = e.name || "color";
    e.serializeCoords ? o = e.serializeCoords(o, t) : t !== null && (o = o.map((m) => bt(m, t)));
    let u = [...o];
    if (l === "color") {
      let m = e.id || ((h = e.ids) == null ? void 0 : h[0]) || i.space.id;
      u.unshift(m);
    }
    let c = i.alpha;
    t !== null && (c = bt(c, t));
    let d = i.alpha < 1 && !e.noAlpha ? `${e.commas ? "," : " /"} ${c}` : "";
    s = `${l}(${u.join(e.commas ? ", " : " ")}${d})`;
  }
  return s;
}
const Di = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791]
], Ai = [
  [1.716651187971268, -0.355670783776392, -0.25336628137366],
  [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
  [0.017639857445311, -0.042770613257809, 0.942103121235474]
];
var Tt = new x({
  id: "rec2020-linear",
  name: "Linear REC.2020",
  white: "D65",
  toXYZ_M: Di,
  fromXYZ_M: Ai,
  formats: {
    color: {}
  }
});
const ut = 1.09929682680944, se = 0.018053968510807;
var Xe = new x({
  id: "rec2020",
  name: "REC.2020",
  base: Tt,
  // Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
  toBase(i) {
    return i.map(function(t) {
      return t < se * 4.5 ? t / 4.5 : Math.pow((t + ut - 1) / ut, 1 / 0.45);
    });
  },
  fromBase(i) {
    return i.map(function(t) {
      return t >= se ? ut * Math.pow(t, 0.45) - (ut - 1) : 4.5 * t;
    });
  },
  formats: {
    color: {}
  }
});
const Li = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976]
], Pi = [
  [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
  [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
  [0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
];
var je = new x({
  id: "p3-linear",
  name: "Linear P3",
  white: "D65",
  toXYZ_M: Li,
  fromXYZ_M: Pi
});
const Ei = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
], Ri = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
];
var Ie = new x({
  id: "srgb-linear",
  name: "Linear sRGB",
  white: "D65",
  toXYZ_M: Ei,
  fromXYZ_M: Ri,
  formats: {
    color: {}
  }
}), ne = {
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
let oe = Array(3).fill("<percentage> | <number>[0, 255]"), he = Array(3).fill("<number>[0, 255]");
var at = new x({
  id: "srgb",
  name: "sRGB",
  base: Ie,
  fromBase: (i) => i.map((t) => {
    let e = t < 0 ? -1 : 1, r = t * e;
    return r > 31308e-7 ? e * (1.055 * r ** (1 / 2.4) - 0.055) : 12.92 * t;
  }),
  toBase: (i) => i.map((t) => {
    let e = t < 0 ? -1 : 1, r = t * e;
    return r < 0.04045 ? t / 12.92 : e * ((r + 0.055) / 1.055) ** 2.4;
  }),
  formats: {
    rgb: {
      coords: oe
    },
    rgb_number: {
      name: "rgb",
      commas: !0,
      coords: he,
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
      coords: he
    },
    hex: {
      type: "custom",
      toGamut: !0,
      test: (i) => /^#([a-f0-9]{3,4}){1,2}$/i.test(i),
      parse(i) {
        i.length <= 5 && (i = i.replace(/[a-f0-9]/gi, "$&$&"));
        let t = [];
        return i.replace(/[a-f0-9]{2}/gi, (e) => {
          t.push(parseInt(e, 16) / 255);
        }), {
          spaceId: "srgb",
          coords: t.slice(0, 3),
          alpha: t.slice(3)[0]
        };
      },
      serialize: (i, t, {
        collapse: e = !0
        // collapse to 3-4 digit hex when possible?
      } = {}) => {
        t < 1 && i.push(t), i = i.map((s) => Math.round(s * 255));
        let r = e && i.every((s) => s % 17 === 0);
        return "#" + i.map((s) => r ? (s / 17).toString(16) : s.toString(16).padStart(2, "0")).join("");
      }
    },
    keyword: {
      type: "custom",
      test: (i) => /^[a-z]+$/i.test(i),
      parse(i) {
        i = i.toLowerCase();
        let t = { spaceId: "srgb", coords: null, alpha: 1 };
        if (i === "transparent" ? (t.coords = ne.black, t.alpha = 0) : t.coords = ne[i], t.coords)
          return t;
      }
    }
  }
}), Ue = new x({
  id: "p3",
  name: "P3",
  base: je,
  // Gamma encoding/decoding is the same as sRGB
  fromBase: at.fromBase,
  toBase: at.toBase,
  formats: {
    color: {
      id: "display-p3"
    }
  }
});
F.display_space = at;
if (typeof CSS < "u" && CSS.supports)
  for (let i of [T, Xe, Ue]) {
    let t = i.getMinCoords(), r = wt({ space: i, coords: t, alpha: 1 });
    if (CSS.supports("color", r)) {
      F.display_space = i;
      break;
    }
  }
function Bi(i, { space: t = F.display_space, ...e } = {}) {
  let r = wt(i, e);
  if (typeof CSS > "u" || CSS.supports("color", r) || !F.display_space)
    r = new String(r), r.color = i;
  else {
    let a = A(i, t);
    r = new String(wt(a, e)), r.color = a;
  }
  return r;
}
function qe(i, t, e = "lab") {
  e = f.get(e);
  let r = e.from(i), a = e.from(t);
  return Math.sqrt(r.reduce((s, n, o) => {
    let h = a[o];
    return isNaN(n) || isNaN(h) ? s : s + (h - n) ** 2;
  }, 0));
}
function zi(i, t) {
  return i = g(i), t = g(t), i.space === t.space && i.alpha === t.alpha && i.coords.every((e, r) => e === t.coords[r]);
}
function U(i) {
  return P(i, [L, "y"]);
}
function Ge(i, t) {
  j(i, [L, "y"], t);
}
function Fi(i) {
  Object.defineProperty(i.prototype, "luminance", {
    get() {
      return U(this);
    },
    set(t) {
      Ge(this, t);
    }
  });
}
var Oi = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getLuminance: U,
  register: Fi,
  setLuminance: Ge
});
function Yi(i, t) {
  i = g(i), t = g(t);
  let e = Math.max(U(i), 0), r = Math.max(U(t), 0);
  return r > e && ([e, r] = [r, e]), (e + 0.05) / (r + 0.05);
}
const $i = 0.56, Xi = 0.57, ji = 0.62, Ii = 0.65, le = 0.022, Ui = 1.414, qi = 0.1, Gi = 5e-4, Zi = 1.14, ue = 0.027, Vi = 1.14;
function ce(i) {
  return i >= le ? i : i + (le - i) ** Ui;
}
function H(i) {
  let t = i < 0 ? -1 : 1, e = Math.abs(i);
  return t * Math.pow(e, 2.4);
}
function Hi(i, t) {
  t = g(t), i = g(i);
  let e, r, a, s, n, o;
  t = A(t, "srgb"), [s, n, o] = t.coords;
  let h = H(s) * 0.2126729 + H(n) * 0.7151522 + H(o) * 0.072175;
  i = A(i, "srgb"), [s, n, o] = i.coords;
  let l = H(s) * 0.2126729 + H(n) * 0.7151522 + H(o) * 0.072175, u = ce(h), c = ce(l), d = c > u;
  return Math.abs(c - u) < Gi ? r = 0 : d ? (e = c ** $i - u ** Xi, r = e * Zi) : (e = c ** Ii - u ** ji, r = e * Vi), Math.abs(r) < qi ? a = 0 : r > 0 ? a = r - ue : a = r + ue, a * 100;
}
function Wi(i, t) {
  i = g(i), t = g(t);
  let e = Math.max(U(i), 0), r = Math.max(U(t), 0);
  r > e && ([e, r] = [r, e]);
  let a = e + r;
  return a === 0 ? 0 : (e - r) / a;
}
const Ni = 5e4;
function Ji(i, t) {
  i = g(i), t = g(t);
  let e = Math.max(U(i), 0), r = Math.max(U(t), 0);
  return r > e && ([e, r] = [r, e]), r === 0 ? Ni : (e - r) / r;
}
function Qi(i, t) {
  i = g(i), t = g(t);
  let e = P(i, [T, "l"]), r = P(t, [T, "l"]);
  return Math.abs(e - r);
}
const Ki = 216 / 24389, de = 24 / 116, ct = 24389 / 27;
let Et = R.D65;
var Xt = new f({
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
  white: Et,
  base: L,
  // Convert D65-adapted XYZ to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(i) {
    let e = i.map((r, a) => r / Et[a]).map((r) => r > Ki ? Math.cbrt(r) : (ct * r + 16) / 116);
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
  toBase(i) {
    let t = [];
    return t[1] = (i[0] + 16) / 116, t[0] = i[1] / 500 + t[1], t[2] = t[1] - i[2] / 200, [
      t[0] > de ? Math.pow(t[0], 3) : (116 * t[0] - 16) / ct,
      i[0] > 8 ? Math.pow((i[0] + 16) / 116, 3) : i[0] / ct,
      t[2] > de ? Math.pow(t[2], 3) : (116 * t[2] - 16) / ct
    ].map((r, a) => r * Et[a]);
  },
  formats: {
    "lab-d65": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
const Rt = Math.pow(5, 0.5) * 0.5 + 0.5;
function tr(i, t) {
  i = g(i), t = g(t);
  let e = P(i, [Xt, "l"]), r = P(t, [Xt, "l"]), a = Math.abs(Math.pow(e, Rt) - Math.pow(r, Rt)), s = Math.pow(a, 1 / Rt) * Math.SQRT2 - 40;
  return s < 7.5 ? 0 : s;
}
var yt = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  contrastAPCA: Hi,
  contrastDeltaPhi: tr,
  contrastLstar: Qi,
  contrastMichelson: Wi,
  contrastWCAG21: Yi,
  contrastWeber: Ji
});
function er(i, t, e = {}) {
  st(e) && (e = { algorithm: e });
  let { algorithm: r, ...a } = e;
  if (!r) {
    let s = Object.keys(yt).map((n) => n.replace(/^contrast/, "")).join(", ");
    throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${s}`);
  }
  i = g(i), t = g(t);
  for (let s in yt)
    if ("contrast" + r.toLowerCase() === s.toLowerCase())
      return yt[s](i, t, a);
  throw new TypeError(`Unknown contrast algorithm: ${r}`);
}
function Ze(i) {
  let [t, e, r] = nt(i, L), a = t + 15 * e + 3 * r;
  return [4 * t / a, 9 * e / a];
}
function Ve(i) {
  let [t, e, r] = nt(i, L), a = t + e + r;
  return [t / a, e / a];
}
function ir(i) {
  Object.defineProperty(i.prototype, "uv", {
    get() {
      return Ze(this);
    }
  }), Object.defineProperty(i.prototype, "xy", {
    get() {
      return Ve(this);
    }
  });
}
var rr = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  register: ir,
  uv: Ze,
  xy: Ve
});
function ar(i, t) {
  return qe(i, t, "lab");
}
const sr = Math.PI, fe = sr / 180;
function nr(i, t, { l: e = 2, c: r = 1 } = {}) {
  let [a, s, n] = T.from(i), [, o, h] = it.from(T, [a, s, n]), [l, u, c] = T.from(t), d = it.from(T, [l, u, c])[1];
  o < 0 && (o = 0), d < 0 && (d = 0);
  let m = a - l, p = o - d, y = s - u, b = n - c, k = y ** 2 + b ** 2 - p ** 2, w = 0.511;
  a >= 16 && (w = 0.040975 * a / (1 + 0.01765 * a));
  let D = 0.0638 * o / (1 + 0.0131 * o) + 0.638, S;
  Number.isNaN(h) && (h = 0), h >= 164 && h <= 345 ? S = 0.56 + Math.abs(0.2 * Math.cos((h + 168) * fe)) : S = 0.36 + Math.abs(0.4 * Math.cos((h + 35) * fe));
  let E = Math.pow(o, 4), q = Math.sqrt(E / (E + 1900)), Y = D * (q * S + 1 - q), B = (m / (e * w)) ** 2;
  return B += (p / (r * D)) ** 2, B += k / Y ** 2, Math.sqrt(B);
}
const me = 203;
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
  base: L,
  fromBase(i) {
    return i.map((t) => Math.max(t * me, 0));
  },
  toBase(i) {
    return i.map((t) => Math.max(t / me, 0));
  }
});
const dt = 1.15, ft = 0.66, ge = 2610 / 2 ** 14, or = 2 ** 14 / 2610, pe = 3424 / 2 ** 12, _e = 2413 / 2 ** 7, ye = 2392 / 2 ** 7, hr = 1.7 * 2523 / 2 ** 5, be = 2 ** 5 / (1.7 * 2523), mt = -0.56, Bt = 16295499532821565e-27, lr = [
  [0.41478972, 0.579999, 0.014648],
  [-0.20151, 1.120649, 0.0531008],
  [-0.0166008, 0.2648, 0.6684799]
], ur = [
  [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
  [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
  [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603]
], cr = [
  [0.5, 0.5, 0],
  [3.524, -4.066708, 0.542708],
  [0.199076, 1.096799, -1.295875]
], dr = [
  [1, 0.1386050432715393, 0.05804731615611886],
  [0.9999999999999999, -0.1386050432715393, -0.05804731615611886],
  [0.9999999999999998, -0.09601924202631895, -0.8118918960560388]
];
var He = new f({
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
  fromBase(i) {
    let [t, e, r] = i, a = dt * t - (dt - 1) * r, s = ft * e - (ft - 1) * t, o = v(lr, [a, s, r]).map(function(d) {
      let m = pe + _e * (d / 1e4) ** ge, p = 1 + ye * (d / 1e4) ** ge;
      return (m / p) ** hr;
    }), [h, l, u] = v(cr, o);
    return [(1 + mt) * h / (1 + mt * h) - Bt, l, u];
  },
  toBase(i) {
    let [t, e, r] = i, a = (t + Bt) / (1 + mt - mt * (t + Bt)), n = v(dr, [a, e, r]).map(function(d) {
      let m = pe - d ** be, p = ye * d ** be - _e;
      return 1e4 * (m / p) ** or;
    }), [o, h, l] = v(ur, n), u = (o + (dt - 1) * l) / dt, c = (h + (ft - 1) * u) / ft;
    return [u, c, l];
  },
  formats: {
    // https://drafts.csswg.org/css-color-hdr/#Jzazbz
    color: {}
  }
}), jt = new f({
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
  base: He,
  fromBase(i) {
    let [t, e, r] = i, a;
    const s = 2e-4;
    return Math.abs(e) < s && Math.abs(r) < s ? a = NaN : a = Math.atan2(r, e) * 180 / Math.PI, [
      t,
      // Jz is still Jz
      Math.sqrt(e ** 2 + r ** 2),
      // Chroma
      Ct(a)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(i) {
    return [
      i[0],
      // Jz is still Jz
      i[1] * Math.cos(i[2] * Math.PI / 180),
      // az
      i[1] * Math.sin(i[2] * Math.PI / 180)
      // bz
    ];
  },
  formats: {
    color: {}
  }
});
function fr(i, t) {
  let [e, r, a] = jt.from(i), [s, n, o] = jt.from(t), h = e - s, l = r - n;
  Number.isNaN(a) && Number.isNaN(o) ? (a = 0, o = 0) : Number.isNaN(a) ? a = o : Number.isNaN(o) && (o = a);
  let u = a - o, c = 2 * Math.sqrt(r * n) * Math.sin(u / 2 * (Math.PI / 180));
  return Math.sqrt(h ** 2 + l ** 2 + c ** 2);
}
const We = 3424 / 4096, Ne = 2413 / 128, Je = 2392 / 128, Me = 2610 / 16384, mr = 2523 / 32, gr = 16384 / 2610, ve = 32 / 2523, pr = [
  [0.3592, 0.6976, -0.0358],
  [-0.1922, 1.1004, 0.0755],
  [7e-3, 0.0749, 0.8434]
], _r = [
  [2048 / 4096, 2048 / 4096, 0],
  [6610 / 4096, -13613 / 4096, 7003 / 4096],
  [17933 / 4096, -17390 / 4096, -543 / 4096]
], yr = [
  [0.9999888965628402, 0.008605050147287059, 0.11103437159861648],
  [1.00001110343716, -0.008605050147287059, -0.11103437159861648],
  [1.0000320633910054, 0.56004913547279, -0.3206339100541203]
], br = [
  [2.0701800566956137, -1.326456876103021, 0.20661600684785517],
  [0.3649882500326575, 0.6804673628522352, -0.04542175307585323],
  [-0.04959554223893211, -0.04942116118675749, 1.1879959417328034]
];
var It = new f({
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
  fromBase(i) {
    let t = v(pr, i);
    return Mr(t);
  },
  toBase(i) {
    let t = vr(i);
    return v(br, t);
  },
  formats: {
    color: {}
  }
});
function Mr(i) {
  let t = i.map(function(e) {
    let r = We + Ne * (e / 1e4) ** Me, a = 1 + Je * (e / 1e4) ** Me;
    return (r / a) ** mr;
  });
  return v(_r, t);
}
function vr(i) {
  return v(yr, i).map(function(r) {
    let a = Math.max(r ** ve - We, 0), s = Ne - Je * r ** ve;
    return 1e4 * (a / s) ** gr;
  });
}
function kr(i, t) {
  let [e, r, a] = It.from(i), [s, n, o] = It.from(t);
  return 720 * Math.sqrt((e - s) ** 2 + 0.25 * (r - n) ** 2 + (a - o) ** 2);
}
const wr = [
  [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
  [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
  [0.048177199566046255, 0.26423952494422764, 0.6335478258136937]
], xr = [
  [1.2268798733741557, -0.5578149965554813, 0.28139105017721583],
  [-0.04057576262431372, 1.1122868293970594, -0.07171106666151701],
  [-0.07637294974672142, -0.4214933239627914, 1.5869240244272418]
], Sr = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766]
], Cr = [
  [0.9999999984505198, 0.39633779217376786, 0.2158037580607588],
  [1.0000000088817609, -0.10556134232365635, -0.06385417477170591],
  [1.0000000546724108, -0.08948418209496575, -1.2914855378640917]
];
var xt = new f({
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
  base: L,
  fromBase(i) {
    let e = v(wr, i).map((r) => Math.cbrt(r));
    return v(Sr, e);
  },
  toBase(i) {
    let e = v(Cr, i).map((r) => r ** 3);
    return v(xr, e);
  },
  formats: {
    oklab: {
      coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function Tr(i, t) {
  let [e, r, a] = xt.from(i), [s, n, o] = xt.from(t), h = e - s, l = r - n, u = a - o;
  return Math.sqrt(h ** 2 + l ** 2 + u ** 2);
}
var St = {
  deltaE76: ar,
  deltaECMC: nr,
  deltaE2000: $t,
  deltaEJz: fr,
  deltaEITP: kr,
  deltaEOK: Tr
};
function tt(i, t, e = {}) {
  st(e) && (e = { method: e });
  let { method: r = F.deltaE, ...a } = e;
  i = g(i), t = g(t);
  for (let s in St)
    if ("deltae" + r.toLowerCase() === s.toLowerCase())
      return St[s](i, t, a);
  throw new TypeError(`Unknown deltaE method: ${r}`);
}
function Dr(i, t = 0.25) {
  let r = [f.get("oklch", "lch"), "l"];
  return j(i, r, (a) => a * (1 + t));
}
function Ar(i, t = 0.25) {
  let r = [f.get("oklch", "lch"), "l"];
  return j(i, r, (a) => a * (1 - t));
}
var Lr = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  darken: Ar,
  lighten: Dr
});
function Qe(i, t, e = 0.5, r = {}) {
  [i, t] = [g(i), g(t)], $(e) === "object" && ([e, r] = [0.5, e]);
  let { space: a, outputSpace: s, premultiplied: n } = r;
  return ot(i, t, { space: a, outputSpace: s, premultiplied: n })(e);
}
function Ke(i, t, e = {}) {
  let r;
  Vt(i) && ([r, e] = [i, t], [i, t] = r.rangeArgs.colors);
  let {
    maxDeltaE: a,
    deltaEMethod: s,
    steps: n = 2,
    maxSteps: o = 1e3,
    ...h
  } = e;
  r || ([i, t] = [g(i), g(t)], r = ot(i, t, h));
  let l = tt(i, t), u = a > 0 ? Math.max(n, Math.ceil(l / a) + 1) : n, c = [];
  if (o !== void 0 && (u = Math.min(u, o)), u === 1)
    c = [{ p: 0.5, color: r(0.5) }];
  else {
    let d = 1 / (u - 1);
    c = Array.from({ length: u }, (m, p) => {
      let y = p * d;
      return { p: y, color: r(y) };
    });
  }
  if (a > 0) {
    let d = c.reduce((m, p, y) => {
      if (y === 0)
        return 0;
      let b = tt(p.color, c[y - 1].color, s);
      return Math.max(m, b);
    }, 0);
    for (; d > a; ) {
      d = 0;
      for (let m = 1; m < c.length && c.length < o; m++) {
        let p = c[m - 1], y = c[m], b = (y.p + p.p) / 2, k = r(b);
        d = Math.max(d, tt(k, p.color), tt(k, y.color)), c.splice(m, 0, { p: b, color: r(b) }), m++;
      }
    }
  }
  return c = c.map((d) => d.color), c;
}
function ot(i, t, e = {}) {
  if (Vt(i)) {
    let [h, l] = [i, t];
    return ot(...h.rangeArgs.colors, { ...h.rangeArgs.options, ...l });
  }
  let { space: r, outputSpace: a, progression: s, premultiplied: n } = e;
  i = g(i), t = g(t), i = rt(i), t = rt(t);
  let o = { colors: [i, t], options: e };
  if (r ? r = f.get(r) : r = f.registry[F.interpolationSpace] || i.space, a = a ? f.get(a) : r, i = A(i, r), t = A(t, r), i = I(i), t = I(t), r.coords.h && r.coords.h.type === "angle") {
    let h = e.hue = e.hue || "shorter", l = [r, "h"], [u, c] = [P(i, l), P(t, l)];
    [u, c] = Ci(h, [u, c]), j(i, l, u), j(t, l, c);
  }
  return n && (i.coords = i.coords.map((h) => h * i.alpha), t.coords = t.coords.map((h) => h * t.alpha)), Object.assign((h) => {
    h = s ? s(h) : h;
    let l = i.coords.map((d, m) => {
      let p = t.coords[m];
      return Mt(d, p, h);
    }), u = Mt(i.alpha, t.alpha, h), c = { space: r, coords: l, alpha: u };
    return n && (c.coords = c.coords.map((d) => d / u)), a !== r && (c = A(c, a)), c;
  }, {
    rangeArgs: o
  });
}
function Vt(i) {
  return $(i) === "function" && !!i.rangeArgs;
}
F.interpolationSpace = "lab";
function Pr(i) {
  i.defineFunction("mix", Qe, { returns: "color" }), i.defineFunction("range", ot, { returns: "function<color>" }), i.defineFunction("steps", Ke, { returns: "array<color>" });
}
var Er = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  isRange: Vt,
  mix: Qe,
  range: ot,
  register: Pr,
  steps: Ke
}), ti = new f({
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
  base: at,
  // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
  fromBase: (i) => {
    let t = Math.max(...i), e = Math.min(...i), [r, a, s] = i, [n, o, h] = [NaN, 0, (e + t) / 2], l = t - e;
    if (l !== 0) {
      switch (o = h === 0 || h === 1 ? 0 : (t - h) / Math.min(h, 1 - h), t) {
        case r:
          n = (a - s) / l + (a < s ? 6 : 0);
          break;
        case a:
          n = (s - r) / l + 2;
          break;
        case s:
          n = (r - a) / l + 4;
      }
      n = n * 60;
    }
    return [n, o * 100, h * 100];
  },
  // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
  toBase: (i) => {
    let [t, e, r] = i;
    t = t % 360, t < 0 && (t += 360), e /= 100, r /= 100;
    function a(s) {
      let n = (s + t / 30) % 12, o = e * Math.min(r, 1 - r);
      return r - o * Math.max(-1, Math.min(n - 3, 9 - n, 1));
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
}), ei = new f({
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
  base: ti,
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  fromBase(i) {
    let [t, e, r] = i;
    e /= 100, r /= 100;
    let a = r + e * Math.min(r, 1 - r);
    return [
      t,
      // h is the same
      a === 0 ? 0 : 200 * (1 - r / a),
      // s
      100 * a
    ];
  },
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  toBase(i) {
    let [t, e, r] = i;
    e /= 100, r /= 100;
    let a = r * (1 - e / 2);
    return [
      t,
      // h is the same
      a === 0 || a === 1 ? 0 : (r - a) / Math.min(a, 1 - a) * 100,
      a * 100
    ];
  },
  formats: {
    color: {
      toGamut: !0
    }
  }
}), Rr = new f({
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
  base: ei,
  fromBase(i) {
    let [t, e, r] = i;
    return [t, r * (100 - e) / 100, 100 - r];
  },
  toBase(i) {
    let [t, e, r] = i;
    e /= 100, r /= 100;
    let a = e + r;
    if (a >= 1) {
      let o = e / a;
      return [t, 0, o * 100];
    }
    let s = 1 - r, n = s === 0 ? 0 : 1 - e / s;
    return [t, n * 100, s * 100];
  },
  formats: {
    hwb: {
      toGamut: !0,
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
    }
  }
});
const Br = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]
], zr = [
  [2.0415879038107465, -0.5650069742788596, -0.34473135077832956],
  [-0.9692436362808795, 1.8759675015077202, 0.04155505740717557],
  [0.013444280632031142, -0.11836239223101838, 1.0151749943912054]
];
var ii = new x({
  id: "a98rgb-linear",
  name: "Linear Adobe® 98 RGB compatible",
  white: "D65",
  toXYZ_M: Br,
  fromXYZ_M: zr
}), Fr = new x({
  id: "a98rgb",
  name: "Adobe® 98 RGB compatible",
  base: ii,
  toBase: (i) => i.map((t) => Math.pow(Math.abs(t), 563 / 256) * Math.sign(t)),
  fromBase: (i) => i.map((t) => Math.pow(Math.abs(t), 256 / 563) * Math.sign(t)),
  formats: {
    color: {
      id: "a98-rgb"
    }
  }
});
const Or = [
  [0.7977604896723027, 0.13518583717574031, 0.0313493495815248],
  [0.2880711282292934, 0.7118432178101014, 8565396060525902e-20],
  [0, 0, 0.8251046025104601]
], Yr = [
  [1.3457989731028281, -0.25558010007997534, -0.05110628506753401],
  [-0.5446224939028347, 1.5082327413132781, 0.02053603239147973],
  [0, 0, 1.2119675456389454]
];
var ri = new x({
  id: "prophoto-linear",
  name: "Linear ProPhoto",
  white: "D50",
  base: Gt,
  toXYZ_M: Or,
  fromXYZ_M: Yr
});
const $r = 1 / 512, Xr = 16 / 512;
var jr = new x({
  id: "prophoto",
  name: "ProPhoto",
  base: ri,
  toBase(i) {
    return i.map((t) => t < Xr ? t / 16 : t ** 1.8);
  },
  fromBase(i) {
    return i.map((t) => t >= $r ? t ** (1 / 1.8) : 16 * t);
  },
  formats: {
    color: {
      id: "prophoto-rgb"
    }
  }
}), Ir = new f({
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
  base: xt,
  fromBase(i) {
    let [t, e, r] = i, a;
    const s = 2e-4;
    return Math.abs(e) < s && Math.abs(r) < s ? a = NaN : a = Math.atan2(r, e) * 180 / Math.PI, [
      t,
      // OKLab L is still L
      Math.sqrt(e ** 2 + r ** 2),
      // Chroma
      Ct(a)
      // Hue, in degrees [0 to 360)
    ];
  },
  // Convert from polar form
  toBase(i) {
    let [t, e, r] = i, a, s;
    return isNaN(r) ? (a = 0, s = 0) : (a = e * Math.cos(r * Math.PI / 180), s = e * Math.sin(r * Math.PI / 180)), [t, a, s];
  },
  formats: {
    oklch: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[0,1]", "<number> | <angle>"]
    }
  }
});
const ke = 203, we = 2610 / 2 ** 14, Ur = 2 ** 14 / 2610, qr = 2523 / 2 ** 5, xe = 2 ** 5 / 2523, Se = 3424 / 2 ** 12, Ce = 2413 / 2 ** 7, Te = 2392 / 2 ** 7;
var Gr = new x({
  id: "rec2100pq",
  name: "REC.2100-PQ",
  base: Tt,
  toBase(i) {
    return i.map(function(t) {
      return (Math.max(t ** xe - Se, 0) / (Ce - Te * t ** xe)) ** Ur * 1e4 / ke;
    });
  },
  fromBase(i) {
    return i.map(function(t) {
      let e = Math.max(t * ke / 1e4, 0), r = Se + Ce * e ** we, a = 1 + Te * e ** we;
      return (r / a) ** qr;
    });
  },
  formats: {
    color: {
      id: "rec2100-pq"
    }
  }
});
const De = 0.17883277, Ae = 0.28466892, Le = 0.55991073, zt = 3.7743;
var Zr = new x({
  id: "rec2100hlg",
  cssid: "rec2100-hlg",
  name: "REC.2100-HLG",
  referred: "scene",
  base: Tt,
  toBase(i) {
    return i.map(function(t) {
      return t <= 0.5 ? t ** 2 / 3 * zt : (Math.exp((t - Le) / De) + Ae) / 12 * zt;
    });
  },
  fromBase(i) {
    return i.map(function(t) {
      return t /= zt, t <= 1 / 12 ? Math.sqrt(3 * t) : De * Math.log(12 * t - Ae) + Le;
    });
  },
  formats: {
    color: {
      id: "rec2100-hlg"
    }
  }
});
const ai = {};
X.add("chromatic-adaptation-start", (i) => {
  i.options.method && (i.M = si(i.W1, i.W2, i.options.method));
});
X.add("chromatic-adaptation-end", (i) => {
  i.M || (i.M = si(i.W1, i.W2, i.options.method));
});
function Dt({ id: i, toCone_M: t, fromCone_M: e }) {
  ai[i] = arguments[0];
}
function si(i, t, e = "Bradford") {
  let r = ai[e], [a, s, n] = v(r.toCone_M, i), [o, h, l] = v(r.toCone_M, t), u = [
    [o / a, 0, 0],
    [0, h / s, 0],
    [0, 0, l / n]
  ], c = v(u, r.toCone_M);
  return v(r.fromCone_M, c);
}
Dt({
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
Dt({
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
Dt({
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
Dt({
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
const Vr = [
  [0.6624541811085053, 0.13400420645643313, 0.1561876870049078],
  [0.27222871678091454, 0.6740817658111484, 0.05368951740793705],
  [-0.005574649490394108, 0.004060733528982826, 1.0103391003129971]
], Hr = [
  [1.6410233796943257, -0.32480329418479, -0.23642469523761225],
  [-0.6636628587229829, 1.6153315916573379, 0.016756347685530137],
  [0.011721894328375376, -0.008284441996237409, 0.9883948585390215]
];
var ni = new x({
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
  toXYZ_M: Vr,
  fromXYZ_M: Hr,
  formats: {
    color: {}
  }
});
const gt = 2 ** -16, Ft = -0.35828683, pt = (Math.log2(65504) + 9.72) / 17.52;
var Wr = new x({
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
      range: [Ft, pt],
      name: "Red"
    },
    g: {
      range: [Ft, pt],
      name: "Green"
    },
    b: {
      range: [Ft, pt],
      name: "Blue"
    }
  },
  referred: "scene",
  base: ni,
  // from section 4.4.2 Decoding Function
  toBase(i) {
    const t = -0.3013698630136986;
    return i.map(function(e) {
      return e <= t ? (2 ** (e * 17.52 - 9.72) - gt) * 2 : e < pt ? 2 ** (e * 17.52 - 9.72) : 65504;
    });
  },
  // Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
  fromBase(i) {
    return i.map(function(t) {
      return t <= 0 ? (Math.log2(gt) + 9.72) / 17.52 : t < gt ? (Math.log2(gt + t * 0.5) + 9.72) / 17.52 : (Math.log2(t) + 9.72) / 17.52;
    });
  },
  // encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
  // encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
  formats: {
    color: {}
  }
}), Pe = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  A98RGB: Fr,
  A98RGB_Linear: ii,
  ACEScc: Wr,
  ACEScg: ni,
  HSL: ti,
  HSV: ei,
  HWB: Rr,
  ICTCP: It,
  JzCzHz: jt,
  Jzazbz: He,
  LCH: it,
  Lab: T,
  Lab_D65: Xt,
  OKLCH: Ir,
  OKLab: xt,
  P3: Ue,
  P3_Linear: je,
  ProPhoto: jr,
  ProPhoto_Linear: ri,
  REC_2020: Xe,
  REC_2020_Linear: Tt,
  REC_2100_HLG: Zr,
  REC_2100_PQ: Gr,
  XYZ_ABS_D65: Zt,
  XYZ_D50: Gt,
  XYZ_D65: L,
  sRGB: at,
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
    let r, a, s;
    e ? (r = e.space || e.spaceId, a = e.coords, s = e.alpha) : [r, a, s] = t, Object.defineProperty(this, "space", {
      value: f.get(r),
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
    let e = Bi(this, ...t);
    return e.color = new _(e.color), e;
  }
  /**
   * Get a color from the argument passed
   * Basically gets us the same result as new Color(color) but doesn't clone an existing color object
   */
  static get(t, ...e) {
    return t instanceof _ ? t : new _(t, ...e);
  }
  static defineFunction(t, e, r = e) {
    let { instance: a = !0, returns: s } = r, n = function(...o) {
      let h = e(...o);
      if (s === "color")
        h = _.get(h);
      else if (s === "function<color>") {
        let l = h;
        h = function(...u) {
          let c = l(...u);
          return _.get(c);
        }, Object.assign(h, l);
      } else
        s === "array<color>" && (h = h.map((l) => _.get(l)));
      return h;
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
  get: P,
  getAll: nt,
  set: j,
  setAll: $e,
  to: A,
  equals: zi,
  inGamut: et,
  toGamut: I,
  distance: qe,
  toString: wt
});
Object.assign(_, {
  util: vi,
  hooks: X,
  WHITES: R,
  Space: f,
  spaces: f.registry,
  parse: Ye,
  // Global defaults one may want to configure
  defaults: F
});
for (let i of Object.keys(Pe))
  f.register(Pe[i]);
for (let i in f.registry)
  Ut(i, f.registry[i]);
X.add("colorspace-init-end", (i) => {
  var t;
  Ut(i.id, i), (t = i.aliases) == null || t.forEach((e) => {
    Ut(e, i);
  });
});
function Ut(i, t) {
  Object.keys(t.coords), Object.values(t.coords).map((r) => r.name);
  let e = i.replace(/-/g, "_");
  Object.defineProperty(_.prototype, e, {
    // Convert coords to coords in another colorspace and return them
    // Source colorspace: this.spaceId
    // Target colorspace: id
    get() {
      let r = this.getAll(i);
      return typeof Proxy > "u" ? r : new Proxy(r, {
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
            let { index: h } = f.resolveCoord([t, s]);
            if (h >= 0)
              return a[h] = n, this.setAll(i, a), !0;
          }
          return Reflect.set(a, s, n, o);
        }
      });
    },
    // Convert coords in another colorspace to internal coords and set them
    // Target colorspace: this.spaceId
    // Source colorspace: id
    set(r) {
      this.setAll(i, r);
    },
    configurable: !0,
    enumerable: !0
  });
}
_.extend(St);
_.extend({ deltaE: tt });
Object.assign(_, { deltaEMethods: St });
_.extend(Lr);
_.extend({ contrast: er });
_.extend(rr);
_.extend(Oi);
_.extend(Er);
_.extend(yt);
function oi(i) {
  return i;
}
function Z(i) {
  return i * i * (3 - 2 * i);
}
function hi(i, t, e, r) {
  return i * t + e * r;
}
function Nr(i, t, e, r) {
  let a = [
    Math.round((i.r * t + e.r * r) * 255),
    Math.round((i.g * t + e.g * r) * 255),
    Math.round((i.b * t + e.b * r) * 255)
  ];
  return `rgb(${a[0]}, ${a[1]}, ${a[2]})`;
}
function Jr(i, t, e, r) {
  return i.map(
    (a, s) => hi(a, t, e[s], r)
  );
}
function Ht(i) {
  if (typeof i == "number")
    return hi;
  if (typeof i == "string") {
    let t = {};
    return (e, r, a, s) => r == 1 ? e : s == 1 ? a : (t[e] || (t[e] = new _(e).srgb), t[a] || (t[a] = new _(a).srgb), Nr(
      t[e],
      r,
      t[a],
      s
    ));
  } else if (Array.isArray(i))
    return Jr;
  return (t, e, r, a) => e < 1 ? t : r;
}
function W(i, t = void 0) {
  return t === void 0 && (t = Ht(i)), {
    finalValue: i,
    interpolate: (e, r) => t(
      e,
      1 - Math.min(r, 1),
      i,
      Math.min(r, 1)
    )
  };
}
function Qr(i, t = void 0) {
  return t === void 0 && (t = Ht(i())), {
    interpolate: (e, r) => t(
      e,
      1 - Math.min(r, 1),
      i(),
      Math.min(r, 1)
    )
  };
}
function la(i, t = void 0) {
  return t === void 0 && (t = Ht(i[0])), {
    interpolate: (e, r) => {
      let a = Math.min(r, 1) * (i.length - 1) - 1, s = Math.min(
        a - Math.floor(a),
        1
      );
      return a < 0 ? t(
        e,
        1 - s,
        i[0],
        s
      ) : t(
        i[Math.floor(a)],
        1 - s,
        i[Math.floor(a) + 1],
        s
      );
    }
  };
}
class z {
  constructor(t, e = 1e3, r = oi) {
    this.duration = 0, this.finalValue = void 0, this.interpolator = null, this.duration = e, t.hasOwnProperty("finalValue") ? this.finalValue = t.finalValue : this.finalValue = void 0, this.interpolator = t, this.curve = r;
  }
  evaluate(t, e) {
    let r = this.curve(this.duration > 0 ? e / this.duration : 1);
    return this.interpolator.interpolate(t, r);
  }
  withDelay(t) {
    return t ? new Kr(this, t) : this;
  }
}
class Kr extends z {
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
function ua(i, t = 1e3, e = oi) {
  return new z(W(i), t, e);
}
var ta = /* @__PURE__ */ ((i) => (i.Waiting = "waiting", i.Entering = "entering", i.Visible = "visible", i.Exiting = "exiting", i.Completed = "completed", i))(ta || {}), ea = /* @__PURE__ */ ((i) => (i.Show = "show", i.Hide = "hide", i))(ea || {});
class ia {
  constructor(t = {}) {
    this.markStates = /* @__PURE__ */ new Map(), this.marksByID = /* @__PURE__ */ new Map(), this.queuedAnimations = /* @__PURE__ */ new Map(), this._flushTimer = null, this.animatingMarks = /* @__PURE__ */ new Set(), this._updated = !1, this.defer = !1, this._showedPromiseWarning = !1, this.saveExitedMarks = !1, this._callbacks = {
      initialize: t.initialize,
      enter: t.enter,
      exit: t.exit
    };
  }
  /**
   * Tells the stage manager that the given set of marks is already visible.
   *
   * @param marks The marks that are already visible
   *
   * @returns This stage manager object
   */
  setVisibleMarks(t) {
    return t.forEach((e) => {
      this.markStates.set(
        e,
        "visible"
        /* Visible */
      ), this.marksByID.set(e.id, e);
    }), this;
  }
  /**
   * Sets options on the stage manager.
   *
   * @param opts Options to configure. Currently the only option supported is
   *  `{@link defer}`.
   * @returns This stage manager object with the options updated
   */
  configure(t = {}) {
    return this.defer = t.defer ?? this.defer, this.saveExitedMarks = t.saveExitedMarks ?? this.saveExitedMarks, this;
  }
  onInitialize(t) {
    this._callbacks.initialize = t;
  }
  onEnter(t) {
    this._callbacks.enter = t;
  }
  onExit(t) {
    this._callbacks.exit = t;
  }
  advance(t) {
    return this._updated ? (this._updated = !1, !0) : !1;
  }
  /**
   * Performs the action for the mark with the given ID, and calls the
   * appropriate callbacks.
   */
  _perform(t, e) {
    if (t) {
      if (e == "show") {
        if (this.markStates.get(t) === "visible")
          return;
        this.markStates.set(
          t,
          "entering"
          /* Entering */
        ), this.marksByID.set(t.id, t);
        let r = this._callbacks.enter ? this._callbacks.enter(t) : void 0;
        r && r instanceof Promise ? (this.animatingMarks.add(t), r.then(
          () => {
            this.markStates.has(t) && this.markStates.get(t) == "entering" && (this.markStates.set(
              t,
              "visible"
              /* Visible */
            ), this.animatingMarks.delete(t), this._updated = !0);
          },
          () => {
            this.animatingMarks.delete(t);
          }
        )) : (this._callbacks.enter && !this._showedPromiseWarning && (console.warn(
          "The enter function did not return a Promise, assuming the animation is synchronous."
        ), this._showedPromiseWarning = !0), this.markStates.set(
          t,
          "visible"
          /* Visible */
        ));
      } else if (e == "hide") {
        let r = this.markStates.get(t) ?? null;
        if (r === "waiting" || r === "completed")
          return;
        this.markStates.set(
          t,
          "exiting"
          /* Exiting */
        ), this.marksByID.set(t.id, t);
        let a = this._callbacks.exit ? this._callbacks.exit(t) : void 0;
        a && a instanceof Promise ? (this.animatingMarks.add(t), a.then(
          () => {
            this.markStates.has(t) && this.markStates.get(t) == "exiting" && (this.saveExitedMarks ? this.markStates.set(
              t,
              "completed"
              /* Completed */
            ) : (this.marksByID.delete(t.id), this.markStates.delete(t), this.animatingMarks.delete(t)), this._updated = !0);
          },
          () => {
            this.animatingMarks.delete(t);
          }
        )) : (this._callbacks.exit && !this._showedPromiseWarning && (console.warn(
          "The exit function did not return a Promise, assuming the animation is synchronous."
        ), this._showedPromiseWarning = !0), this.saveExitedMarks ? this.markStates.set(
          t,
          "completed"
          /* Completed */
        ) : (this.marksByID.delete(t.id), this.markStates.delete(t)));
      }
      this._updated = !0;
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
    let r = this.markStates.get(t);
    if (r === void 0)
      return !1;
    if (e == "show") {
      if (r == "entering" || r == "visible")
        return !1;
      this.markStates.set(
        t,
        "entering"
        /* Entering */
      );
    } else if (e == "hide") {
      if (r == "exiting" || r == "completed")
        return !1;
      this.markStates.set(
        t,
        "exiting"
        /* Exiting */
      );
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
   * Attempts to show a given mark.
   *
   * @param id The ID of the mark to show, which should contain sufficient
   *    information to uniquely describe the mark.
   * @returns `true` if the mark was not visible and will be made visible, or
   *    `false` otherwise.
   */
  show(t) {
    return this.markStates.has(t) || (this._callbacks.initialize && this._callbacks.initialize(t), this.markStates.set(
      t,
      "waiting"
      /* Waiting */
    ), this.marksByID.set(t.id, t)), this._enqueue(
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
    return this.markStates.has(t) ? this._enqueue(
      t,
      "hide"
      /* Hide */
    ) : !1;
  }
  /**
   * Returns the Mark with the given ID if it exists (in any state, including
   * exiting), or undefined if none exists.
   *
   * @param id The ID to lookup
   * @param visibleOnly If true, only return marks that are visible or scheduled
   *  to be visible. Otherwise, return any mark in the pool (including exiting).
   * @returns the mark with the given ID or undefined
   */
  get(t, e = !1) {
    let r = this.marksByID.get(t);
    if (r && e) {
      let a = this.markStates.get(r);
      if (a === "exiting" || a === "completed")
        return;
    }
    return r;
  }
  forEach(t) {
    let e = 0;
    this.markStates.forEach((r, a) => {
      (r === "entering" || r === "visible" || r === "exiting") && (t(a, e), e++);
    });
  }
  /**
   * Returns all marks that this stage manager knows about.
   */
  getMarks() {
    return Array.from(this.markStates.keys());
  }
  /**
   * Returns the number of marks that are entering, visible, or exiting.
   */
  count() {
    return Array.from(this.markStates.keys()).filter(
      (t) => [
        "entering",
        "visible",
        "exiting"
        /* Exiting */
      ].includes(this.markStates.get(t))
    ).length;
  }
  /**
   * Returns all marks that are either entering, visible, or exiting.
   */
  getVisibleMarks() {
    return Array.from(this.markStates.keys()).filter(
      (t) => [
        "entering",
        "visible",
        "exiting"
        /* Exiting */
      ].includes(this.markStates.get(t))
    );
  }
}
function Ee(i, t, e) {
  return Object.fromEntries(
    Object.entries(i).map(([r, a]) => [
      r,
      typeof a == "function" ? a(t, e) : a
    ])
  );
}
class ra {
  /**
   * @param marks The set of marks that this group should manage, all including
   *  the same set of attributes.
   * @param opts Options for the mark group (see {@link configure})
   */
  constructor(t = [], e = {
    animationDuration: 1e3,
    animationCurve: Z
  }) {
    this.timeProvider = null, this.marks = [], this.factory = null, this.lazyUpdates = !0, this.useStaging = !0, this.stage = null, this.markArrayDirty = !1, this.animatingMarks = /* @__PURE__ */ new Set(), this.updatedMarks = /* @__PURE__ */ new Set(), this.preloadableProperties = /* @__PURE__ */ new Set(), this._forceUpdate = !1, this._markListChanged = !1, this._changedLastTick = !1, this._updateListeners = {}, this._eventListeners = {}, this.timeProvider = Re(), this.lazyUpdates = !0, this._defaultDuration = 1e3, this._defaultCurve = Z, this.configure(e), typeof t == "function" ? this.factory = t : this.marks = t, this.marksByID = /* @__PURE__ */ new Map(), this.markSet = /* @__PURE__ */ new Set(), this.marks.forEach((r, a) => {
      if (this.marksByID.has(r.id)) {
        console.warn(`ID '${r.id}' is duplicated in mark render group`);
        return;
      }
      this.marksByID.set(r.id, r), this.markSet.add(r), this._setupMark(r);
    }), this._setupStage();
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
   *  - `hitTest`: a function to run when the Mark's hitTest method is called,
   *    that takes the Mark and a coordinate array and returns true if the
   *    coordinates intersect with the mark.
   * @returns this render group
   */
  configure(t) {
    return t.timeProvider !== void 0 && (this.timeProvider = t.timeProvider), t.lazyUpdates !== void 0 && (this.lazyUpdates = t.lazyUpdates), t.animationDuration !== void 0 && (this._defaultDuration = t.animationDuration), t.animationCurve !== void 0 && (this._defaultCurve = t.animationCurve), t.hitTest !== void 0 && (this._hitTest = t.hitTest), this.marks && this.getMarks().forEach((e) => this._configureMark(e)), this.useStaging = t.useStaging ?? this.useStaging, this._setupStage(), this;
  }
  configureStaging(t, e = void 0) {
    return this.useStaging || console.error(
      "Can't configure staging without setting useStaging to true"
    ), this.stage.onInitialize(t.initialize), this.stage.onEnter(t.enter), this.stage.onExit(t.exit), e && this.stage.configure(e), this;
  }
  /**
   * Sets up the stage manager if it has not already been set up.
   */
  _setupStage() {
    this.useStaging ? (this.stage || (this.stage = new ia()), this.marks && this.stage.setVisibleMarks(this.getMarks())) : this.stage = null;
  }
  /**
   * Sets up a mark for the first time.
   */
  _setupMark(t) {
    this._configureMark(t), t.addListener((e, r, a) => {
      this.updatedMarks.add(e), !this.preloadableProperties.has(r) && a && this.animatingMarks.add(e), this._changedLastTick = !0;
    }), t.addGraphListener((e, r, a, s) => {
      a.forEach((n) => {
        !s.includes(n) && n.sourceMarks().length == 1 && this.deleteMark(n);
      }), s.forEach((n) => {
        a.includes(n) || this.addMark(n);
      });
    });
  }
  /**
   * Configures a mark's default properties.
   * @param m the mark to configure
   */
  _configureMark(t) {
    t.setTimeProvider(this.timeProvider), t.configure({
      animationDuration: this._defaultDuration,
      animationCurve: this._defaultCurve,
      ...this._hitTest !== void 0 ? { hitTest: this._hitTest } : {}
    }), Object.entries(this._updateListeners).forEach(
      ([e, r]) => t.onUpdate(e, r)
    ), Object.entries(this._eventListeners).forEach(
      ([e, r]) => t.onEvent(e, r)
    ), this.preloadableProperties.forEach(
      (e) => t.attributes[e].registerPreloadable()
    );
  }
  onUpdate(t, e) {
    return this._updateListeners[t] = e, this.getMarks().forEach((r) => r.onUpdate(t, e)), this;
  }
  onEvent(t, e) {
    return this._eventListeners[t] = e, this.getMarks().forEach((r) => r.onEvent(t, e)), this;
  }
  /**
   * Sends an event to the mark and runs its event listener if it has one.
   *
   * @param eventName The name of the event
   * @param details A details object to pass to the event listener
   * @returns a Promise if the event listener for this event name returns a Promise,
   *  otherwise nothing
   */
  dispatch(t, e = void 0) {
    let r = this.getMarks().map((a) => a.dispatch(t, e)).filter((a) => a instanceof Promise);
    if (r.length > 0)
      return new Promise((a, s) => {
        Promise.all(r).then(() => a()).catch(s);
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
    return this.markArrayDirty && (this.marks = Array.from(this.markSet)), this.markArrayDirty = !1, this.marks;
  }
  /**
   * Declares that the given attribute will only ever use preloadable animations.
   * Preloadable attributes will not be counted in calls to {@link marksAnimating}, and
   * only initial changes will be reflected in {@link marksChanged}. This permits
   * faster rendering by computing animations in shaders, and only computing
   * them on the CPU when explicitly requested through a call to {@link Attribute.get()}.
   *
   * @param attrName the attribute to register
   * @returns this render group
   */
  registerPreloadableProperty(t) {
    return this.preloadableProperties.add(t), this.getMarks().forEach(
      (e) => e.attributes[t].registerPreloadable()
    ), this;
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
    var a;
    this.timeProvider.advance(t);
    let e = this.lazyUpdates ? [...this.animatingMarks, ...this.updatedMarks] : this.stage ? this.stage.getMarks() : this.getMarks();
    if (this.updatedMarks = /* @__PURE__ */ new Set(), !(((a = this.stage) == null ? void 0 : a.advance(t)) ?? !1) && e.length == 0 && !this._forceUpdate && !this._markListChanged)
      return this._changedLastTick = !1, !1;
    let r = /* @__PURE__ */ new Set();
    for (let s of e)
      r.has(s) || (s.advance() || this.animatingMarks.delete(s), r.add(s));
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
  animateTo(t, e, r = {}) {
    return this.forEach((a, s) => {
      a.animateTo(
        t,
        typeof e == "function" ? e(a, s) : e,
        Ee(r, a, s)
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
    return this.preloadableProperties.has(t) && e.interpolator ? (console.error(
      "Cannot apply custom interpolator function on preloadable property."
    ), this) : (this.forEach((a, s) => {
      let n = Ee(e, a, s);
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
    return this.forEach((r, a) => {
      r.setAttr(
        t,
        e === void 0 ? void 0 : typeof e == "function" ? e(r, a) : e
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
      this.map((r) => r.wait(t, e))
    );
  }
  /**
   * Retrieves the mark with the given ID, or undefined if it does not exist.
   * NOTE: Use of this method assumes there is only one mark ever added with the
   * given ID.
   *
   * @param id the ID of the mark to search for
   * @returns the `Mark` instance with the given ID or undefined
   */
  get(t) {
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
    let e = Object.assign({}, this), r = this.getMarks().filter(t);
    return Object.keys(this).forEach((a) => {
      e[a] = this[a];
    }), e.marks = r, e.marksByID = /* @__PURE__ */ new Map(), e.markSet = /* @__PURE__ */ new Set(), r.forEach((a) => {
      e.marksByID.set(a.id, a), e.markSet.add(a);
    }), _i(this).forEach((a) => {
      a == "getMarks" ? e[a] = () => r : e[a] = (...s) => {
        let n = this.getMarks(), o = this.marksByID, h = this.markSet;
        this.marks = r, this.marksByID = e.marksByID, this.markSet = e.markSet;
        let l = this[a](...s);
        return this.marks = n, this.marksByID = o, this.markSet = h, l === this ? e : l;
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
    return this.markSet.has(t) ? this : (this.marks.push(t), this.marksByID.set(t.id, t), this.markSet.add(t), this._setupMark(t), this._markListChanged = !0, this.stage && this.stage.show(t), this);
  }
  /**
   * Removes a mark from the render group.
   *
   * @param mark the mark to remove
   * @returns this render group
   */
  deleteMark(t) {
    return this.markSet.has(t) ? (this.marksByID.delete(t.id), this.markSet.delete(t), this.markArrayDirty = !0, this._markListChanged = !0, this.stage && this.stage.hide(t), this) : this;
  }
  /**
   * Adds a mark to the render group with the given ID. Use of this method
   * requires that the render group was instantiated with a factory function
   * instead of a static list.
   *
   * If the mark already exists, this method does nothing. If an existing mark
   * with the same ID is currently exiting the stage, that mark is reused.
   *
   * @param id the ID of the mark to create
   * @returns this render group
   */
  add(t) {
    if (!this.factory)
      return console.error(
        "Cannot use the add method of MarkRenderGroup without defining a factory function at initialization"
      ), this;
    if (this.has(t))
      return this;
    let e;
    return this.useStaging && (e = this.stage.get(t)), e || (e = this.factory(t)), this.addMark(e);
  }
  /**
   * Removes a mark with the given ID from the render group, or does nothing if
   * it does not exist.
   *
   * @param mark the mark to remove
   * @returns this render group
   */
  delete(t) {
    return this.has(t) ? this.deleteMark(this.get(t)) : this;
  }
  /**
   * Returns true if the render group has the given mark (and it is visible if
   * using staging) or false otherwise.
   *
   * @param markID the mark ID to search for
   */
  has(t) {
    return this.marksByID.has(t);
  }
  /**
   * @returns the number of marks in the render group
   */
  count() {
    return this.markSet.size;
  }
  /**
   * Sets transform of an attribute to a new function, can be applied to an Attribute,
   * a Mark, or a MarkRenderGroup
   * @param attrToModify attribute to modify
   * @param newFunc new function to set transform to
   */
  setTransform(t, e) {
    this.forEach((r) => r.setTransform(t, e));
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
const aa = 5e3;
class G {
  constructor(t, e) {
    this._timeProvider = null, this._attrNames = [], this._listeners = [], this._graphListeners = [], this._defaultDuration = 1e3, this._defaultCurve = Z, this._changedLastTick = !1, this._changedAttributes = {}, this._hitTest = null, this._adjacency = {}, this._reverseAdjacency = /* @__PURE__ */ new Set(), this.represented = void 0, this._updateListeners = {}, this._eventListeners = {}, this.framesWithUpdate = 0, this.id = t, e === void 0 && console.error(
      "Mark constructor requires an ID and an object defining attributes"
    );
    let r = {};
    Object.keys(e).forEach(
      (a) => {
        let s = new M(
          Object.assign(
            Object.assign(
              {},
              e[a] instanceof M ? e[a] : new M(e[a])
            ),
            {
              computeArg: this
            }
          )
        );
        s.addListener(
          (n, o) => this._attributesChanged(a, o)
        ), r[a] = s;
      }
    ), this.attributes = r, this._attrNames = Object.keys(r), this._changedAttributes = Object.fromEntries(
      this._attrNames.map((a) => [a, !0])
    );
  }
  /**
   * Applies configuration options to the mark.
   *
   * @param opts Options for the mark group, including:
   *  - `animationDuration`: the default animation duration in milliseconds
   *    (default 1000)
   *  - `animationCurve`: the default animation curve to use (default ease-in-out)
   *  - `hitTest`: a function to run when the Mark's hitTest method is called,
   *    that takes the Mark and a coordinate array and returns true if the
   *    coordinates intersect with the mark.
   * @returns this Mark
   */
  configure(t) {
    return t.animationDuration !== void 0 && (this._defaultDuration = t.animationDuration), t.animationCurve !== void 0 && (this._defaultCurve = t.animationCurve), t.hitTest !== void 0 && (this._hitTest = t.hitTest), this;
  }
  onUpdate(t, e) {
    return this._updateListeners[t] = e, this;
  }
  onEvent(t, e) {
    return this._eventListeners[t] = e, this;
  }
  /**
   * Sends an event to the mark and runs its event listener if it has one.
   *
   * @param eventName The name of the event
   * @param details A details object to pass to the event listener
   * @returns a Promise if the event listener for this event name returns a Promise,
   *  otherwise nothing
   */
  dispatch(t, e = void 0) {
    if (this._eventListeners[t])
      return this._eventListeners[t](this, e, t);
  }
  addListener(t) {
    return this._listeners.push(t), this;
  }
  removeListener(t) {
    let e = this._listeners.indexOf(t);
    return e >= 0 && (this._listeners = this._listeners.splice(e, 1)), this;
  }
  addGraphListener(t) {
    return this._graphListeners.push(t), this;
  }
  removeGraphListener(t) {
    let e = this._graphListeners.indexOf(t);
    return e >= 0 && (this._graphListeners = this._graphListeners.splice(e, 1)), this;
  }
  _attributesChanged(t, e) {
    this._changedLastTick = !0, this._changedAttributes[t] = !0, this._listeners.forEach((r) => r(this, t, e)), this._updateListeners[t] && this._updateListeners[t](this, this.attributes[t].future());
  }
  /**
   * Tests whether a given coordinate array intersects with the Mark. If no
   * hit test function has been configured for the Mark through the `configure`
   * method, this method returns true for any location.
   *
   * @param location an array of numerical coordinates to test
   * @returns true if the coordinates intersect with the mark, otherwise false
   */
  hitTest(t) {
    return this._hitTest ? this._hitTest(this, t) : !0;
  }
  setTimeProvider(t) {
    return this._timeProvider = t, Object.values(this.attributes).forEach(
      (e) => e.setTimeProvider(this._timeProvider)
    ), this;
  }
  /**
   * Modifies the mark to indicate that it represents the given object. The value
   * will be stored in the `represented` property.
   *
   * @param rep The object that this mark represents
   * @return this Mark
   */
  representing(t) {
    return this.represented = t, this;
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
    for (let r of this._attrNames) {
      if (!this._changedAttributes[r])
        continue;
      this.attributes[r].advance(t) ? e = !0 : this._changedAttributes[r] = !1;
    }
    return e ? (this.framesWithUpdate += 1, this.framesWithUpdate > aa && console.warn("Marks are being updated excessively!"), this._changedLastTick = !0, !0) : (this.framesWithUpdate = 0, this._changedLastTick = !1, !1);
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
    let r = this.attributes[t];
    r === void 0 && console.error(`No attribute named '${String(t)}'`);
    let a = r.last();
    return e === void 0 ? r.compute() : r.set(e), K(a, r.data()) || this._listeners.forEach((s) => s(this, t, !1)), this;
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
   * Returns a plain JS object containing all attribute values at the given
   * instance. Useful for destructuring object attributes, for instance:
   *
   * let { x, y, alpha } = mark.get();
   *
   * **NOTE:** This method may return incorrect values for preloadable attributes
   * since these are not updated at every frame.
   *
   * @param transformed whether or not to apply transforms to the attributes. Can
   *  be a boolean value or an object keyed by attribute names where the values
   *  are booleans. The default is true for all attributes.
   */
  get(t = !0) {
    let e = Object.entries(t).length > 0;
    return Object.fromEntries(
      this._attrNames.map((r) => {
        let a = e ? t[r] ?? !0 : t;
        return [
          r,
          a ? this.attributes[r].get() : this.attributes[r].getUntransformed()
        ];
      })
    );
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
  animateTo(t, e, r = {}) {
    if (!this.attributes.hasOwnProperty(t))
      return console.error(`No attribute named '${String(t)}'`), this;
    if (typeof e == "function")
      return this.attributes[t].set(e), this.animate(t, {
        duration: r.duration,
        curve: r.curve
      }), this;
    if (this.attributes[t].valueFn && this.attributes[t].set(
      this.attributes[t].last()
    ), (r.overrideIfIdentical ?? !0) || !K(e, this.attributes[t].data())) {
      let a = r.duration === void 0 ? this._defaultDuration : r.duration, s = r.curve === void 0 ? this._defaultCurve : r.curve, n = new z(
        W(e),
        a,
        s
      ).withDelay(r.delay || 0);
      this.attributes[t].animate(n);
    }
    return this;
  }
  animate(t, e = {}) {
    if (!this.attributes.hasOwnProperty(t))
      return console.error(
        `Attempting to animate undefined property ${String(t)}`
      ), this;
    let r;
    if (e instanceof z)
      r = e;
    else if (e.interpolator !== void 0) {
      let a = e.interpolator;
      r = new z(
        a,
        e.duration !== void 0 ? e.duration : this._defaultDuration,
        e.curve !== void 0 ? e.curve : this._defaultCurve
      ).withDelay(e.delay || 0);
    } else {
      let a = this.data(t);
      if (!K(a, this.attributes[t].last()) || !K(a, this.attributes[t].future())) {
        let s = e.duration !== void 0 ? e.duration : this._defaultDuration, n = e.curve !== void 0 ? e.curve : this._defaultCurve;
        r = new z(
          W(a),
          s,
          n
        ).withDelay(e.delay || 0);
      } else
        return this;
    }
    return this.attributes[t].animate(r), this;
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
    let r = Array.isArray(t) ? t : [t];
    return Promise.all(
      r.map((a) => this.attributes[a].wait(e))
    );
  }
  /**
   * "Freezes" the given attributes by setting them to their last values. This
   * removes any reactive value functions and replaces them with static values.
   * The value functions will not be re-run.
   *
   * @param attrNames An attribute name or array of names to freeze
   * @returns this mark
   */
  freeze(t) {
    return (Array.isArray(t) ? t : [t]).forEach((r) => this.attributes[r].freeze()), this;
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
  /**
   * Returns a copy of the mark with the given ID and new attribute values. The
   * Mark's adjacency data is not copied.
   *
   * @param id the ID for the new mark
   * @param newValues new values for the mark's attributes. Each entry in the
   *  given object should be keyed by an attribute name, and its value should be
   *  either a value of the same type as the attribute's value, a new value
   *  function, or a new attribute of the same type.
   * @returns a new `Mark` instance
   */
  copy(t, e = {}) {
    return new G(t, {
      ...this.attributes,
      ...Object.fromEntries(
        Object.entries(e).map(([r, a]) => a instanceof M ? [r, a] : typeof a == "function" ? [
          r,
          this.attributes[r].copy({ valueFn: a })
        ] : a.value !== void 0 || a.valueFn !== void 0 ? [r, new M(a)] : [r, this.attributes[r].copy({ value: a })])
      )
    });
  }
  adj(t, e = void 0) {
    if (e !== void 0) {
      let r = Array.isArray(e) ? e : [e], a = this._adjacency[t] ?? /* @__PURE__ */ new Set();
      this._graphListeners.forEach(
        (s) => s(this, t, Array.from(a), r)
      ), a.forEach((s) => s._removeEdgeFrom(this)), this._adjacency[t] = new Set(r), r.forEach((s) => s._addEdgeFrom(this));
      return;
    }
    return Array.from(this._adjacency[t] ?? /* @__PURE__ */ new Set());
  }
  /**
   * Returns the marks that have an edge to this mark.
   */
  sourceMarks() {
    return Array.from(this._reverseAdjacency);
  }
  /**
   * TODO make sure if you remove a source edge but another named edge to the
   * same mark exists, it's not removed from _reverseAdjacency!!
   *
   * Tells the mark that it has an edge from the given mark.
   * @param sourceMark the mark that has an edge to this mark
   */
  _addEdgeFrom(t) {
    return this._reverseAdjacency.add(t), this;
  }
  /**
   * Tells the mark that it no longer has an edge from the given mark.
   * @param sourceMark the mark that has no longer has an edge to this mark
   */
  _removeEdgeFrom(t) {
    return this._reverseAdjacency.delete(t), this;
  }
  /**
   * Sets transform of an attribute to a new function, can be applied to an Attribute,
   * a Mark, or a MarkRenderGroup
   * @param attrToModify attribute to modify
   * @param newFunc new function to set transform to
   */
  setTransform(t, e) {
    this.attributes[t].setTransform(e);
  }
}
function ca(i) {
  let t;
  if (typeof t == "function")
    t = i;
  else {
    let e = i;
    t = (r, a) => new G(
      r,
      Object.fromEntries(
        Object.entries(e).map(([s, n]) => typeof n == "function" ? [s, n(a[s])] : a[s] ? a[s] instanceof M ? [s, a[s]] : [s, new M(a[s])] : [s, n.copy()])
      )
    );
  }
  return {
    create: (e, r) => {
      let a = t(e, r);
      return a instanceof G ? a : new G(e, a);
    }
  };
}
class da {
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
class fa {
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
function _t(i, t, e) {
  e > 0 ? (i[0].animate(
    new z(W(t[0]), e, Z)
  ), i[1].animate(
    new z(W(t[1]), e, Z)
  )) : (i[0].set(t[0]), i[1].set(t[1]));
}
class ma {
  constructor(t = {}) {
    this.animationDuration = 1e3, this.squareAspect = !0, this._xDomain = [
      new M(0),
      new M(1)
    ], this._yDomain = [
      new M(0),
      new M(1)
    ], this._xRange = [
      new M(0),
      new M(1)
    ], this._yRange = [
      new M(0),
      new M(1)
    ], this._xScaleFactor = new M(1), this._yScaleFactor = new M(1), this._translateX = new M(0), this._translateY = new M(0), this._calculatingTransform = !1, this.timeProvider = Re(), this.controller = null, this._updatedNoAdvance = !1, this.listeners = [], this.xScale = Object.assign(
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
    return t === void 0 ? [this._xDomain[0].get(), this._xDomain[1].get()] : (_t(
      this._xDomain,
      t,
      e ? this.animationDuration : 0
    ), this);
  }
  yDomain(t = void 0, e = !1) {
    return t === void 0 ? [this._yDomain[0].get(), this._yDomain[1].get()] : (_t(
      this._yDomain,
      t,
      e ? this.animationDuration : 0
    ), this);
  }
  xRange(t = void 0, e = !1) {
    return t === void 0 ? [this._xRange[0].get(), this._xRange[1].get()] : (_t(
      this._xRange,
      t,
      e ? this.animationDuration : 0
    ), this);
  }
  yRange(t = void 0, e = !1) {
    return t === void 0 ? [this._yRange[0].get(), this._yRange[1].get()] : (_t(
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
    let t = this.xRSpan() / this.xDSpan(), e = this.yRSpan() / this.yDSpan(), r = this.yDomain(), a = this.xDomain();
    if (t < e) {
      let s = (r[0] + r[1]) * 0.5, n = this.yRSpan() / t;
      this.yDomain([s - n * 0.5, s + n * 0.5]);
    } else {
      let s = (a[0] + a[1]) * 0.5, n = this.xRSpan() / e;
      this.xDomain([s - n * 0.5, s + n * 0.5]);
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
    ].some((r) => r) ? (this._updatedNoAdvance = !1, this.listeners.forEach((r) => r(this)), !0) : (this._updatedNoAdvance || (this.listeners.forEach((r) => r(this)), this._updatedNoAdvance = !0), !1);
  }
  // Increases the scale by the given amount, optionally centering by the given
  // point in transformed pixel space
  scaleBy(t, e = null) {
    this.unfollow();
    let r = this._translateX.get(), a = this._translateY.get(), s = this._xScaleFactor.get(), n = this._yScaleFactor.get();
    e ? e = [(e[0] - r) / s, (e[1] - a) / n] : e = [
      (this.xRange[0] + this.xRange[1]) * 0.5,
      (this.yRange[0] + this.yRange[1]) * 0.5
    ];
    let o = typeof t == "number" ? t : t[0], h = typeof t == "number" ? t : t[1], l = s + o;
    return l <= this.maxScale && l >= this.minScale && (this._xScaleFactor.set(l), this._translateX.set(r - o * e[0])), l = n + h, l <= this.maxScale && l >= this.minScale && (this._yScaleFactor.set(l), this._translateY.set(a - h * e[1])), this;
  }
  // Translates the scales by the given amount
  translateBy(t, e) {
    return this.unfollow(), this._translateX.set(this._translateX.get() + t), this._translateY.set(this._translateY.get() + e), this;
  }
  transform(t = void 0, e = !1) {
    if (t !== void 0) {
      if (this.unfollow(), e) {
        let r = (a) => new z(
          W(a),
          this.animationDuration,
          Z
        );
        t.kx !== void 0 ? this._xScaleFactor.animate(r(t.kx)) : t.k !== void 0 && this._xScaleFactor.animate(r(t.k)), t.ky !== void 0 ? this._yScaleFactor.animate(r(t.ky)) : t.k !== void 0 && this._yScaleFactor.animate(r(t.k)), t.x !== void 0 && this._translateX.animate(r(t.x)), t.y !== void 0 && this._translateY.animate(r(t.y));
      } else
        t.kx !== void 0 ? this._xScaleFactor.set(t.kx) : t.k !== void 0 && this._xScaleFactor.set(t.k), t.ky !== void 0 ? this._yScaleFactor.set(t.ky) : t.k !== void 0 && this._yScaleFactor.set(t.k), t.x !== void 0 && this._translateX.set(t.x), t.y !== void 0 && this._translateY.set(t.y);
      return this;
    } else {
      let r = this._xScaleFactor.last(), a = this._yScaleFactor.last();
      return {
        k: (r + a) * 0.5,
        kx: r,
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
      let r = this._calculateControllerTransform();
      return r.kx || r.k;
    }), this._yScaleFactor.set(() => {
      if (this._calculatingTransform)
        return this._yScaleFactor.last();
      let r = this._calculateControllerTransform();
      return r.ky || r.k;
    }), this._translateX.set(() => this._calculatingTransform ? this._translateX.last() : this._calculateControllerTransform().x), this._translateY.set(() => this._calculatingTransform ? this._translateY.last() : this._calculateControllerTransform().y), e) {
      let r = (a) => new z(
        Qr(() => a.data()),
        this.animationDuration,
        Z
      );
      this._xScaleFactor.animate(r(this._xScaleFactor)), this._yScaleFactor.animate(r(this._yScaleFactor)), this._translateX.animate(r(this._translateX)), this._translateY.animate(r(this._translateY));
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
class li {
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
    let e = this.marks.map((k) => this._getMarkLocation(t, k)), r, a, s, n, o = this.centerMark !== void 0 ? this._getMarkLocation(t, this.centerMark) : null, h = t.transform(), { x: l, y: u } = bi(e);
    if (o) {
      let k = Math.max(
        l[1] - o.x,
        o.x - l[0]
      ), w = Math.max(
        u[1] - o.y,
        o.y - u[0]
      );
      l = [o.x - k, o.x + k], u = [o.y - w, o.y + w];
    }
    let c, d;
    Math.abs(l[1] - l[0]) > 0 ? c = (Math.abs(t.xRSpan()) - this.padding * 2) / (l[1] - l[0]) / (Math.abs(t.xRSpan()) / Math.abs(t.xDSpan())) : c = h.kx, Math.abs(u[1] - u[0]) > 0 ? d = (Math.abs(t.yRSpan()) - this.padding * 2) / (u[1] - u[0]) / (Math.abs(t.yRSpan()) / Math.abs(t.yDSpan())) : d = h.ky;
    let m = h.ky / h.kx;
    c = Math.min(c, t.maxScale), d = Math.min(d, t.maxScale), d < c * m ? (s = d / m, n = d) : (s = c, n = c * m), r = (l[0] + l[1]) * 0.5, a = (u[0] + u[1]) * 0.5, r = (r - t.xDomain()[0]) * t.xRSpan() / t.xDSpan() + t.xRange()[0], a = (a - t.yDomain()[0]) * t.yRSpan() / t.yDSpan() + t.yRange()[0];
    let p = -r * s + (t.xRange()[0] + t.xRange()[1]) * 0.5, y = -a * n + (t.yRange()[0] + t.yRange()[1]) * 0.5, b = {
      kx: s,
      ky: n,
      x: p,
      y
    };
    return this.lastCompute = { scales: t, time: t.timeProvider(), result: b }, b;
  }
  _getMarkLocation(t, e) {
    let r = {
      x: e.attr(this.xAttr, this.transformCoordinates),
      y: e.attr(this.yAttr, this.transformCoordinates)
    };
    return this.inverseTransformCoordinates && (r = {
      x: t.xScale.invert(r.x),
      y: t.yScale.invert(r.y)
    }), r;
  }
}
function ga(i, t = {}) {
  return new li([i], { centerMark: i, ...t });
}
function pa(i, t = {}) {
  return new li(i, { ...t });
}
class _a {
  constructor(t = {}) {
    this.markCollections = [], this._positionMap = null, this._binSizes = null, this._extents = null, this._numBins = null, this._numMarks = null, this._avgMarksPerBin = null, this._coordinateAttributes = t.coordinateAttributes ?? ["x", "y"], this._transformCoordinates = t.transformCoordinates ?? !0, this._avgMarksPerBin = t.marksPerBin ?? null, this._maximumHitTestDistance = t.maximumHitTestDistance ?? 1e12;
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
    return this._extents = new Array(this._coordinateAttributes.length).fill(0).map((t) => [1e12, -1e12]), this._numMarks = 0, this._forEachMark((t) => {
      this._coordinateAttributes.forEach((e, r) => {
        let a = t.attr(e, this._transformCoordinates);
        a < this._extents[r][0] && (this._extents[r][0] = a), a > this._extents[r][1] && (this._extents[r][1] = a);
      }), this._numMarks += 1;
    }), this._extents.forEach((t, e) => {
      t[0] == t[1] ? this._extents[e] = [t[0], t[1] + 1] : this._extents[e] = [t[0], t[1] + (t[1] - t[0]) * 0.01];
    }), this._numMarks == 0 ? this : (this._numBins = Math.round(
      this._numMarks / (this._avgMarksPerBin ?? Math.min(Math.max(1, this._numMarks / 100), 10))
    ), this._binSizes = this._extents.map(
      (t) => Math.ceil((t[1] - t[0]) / this._numBins)
    ), this._positionMap = /* @__PURE__ */ new Map(), this._forEachMark((t) => {
      let e = this._coordinateAttributes.map(
        (a) => t.attr(a, this._transformCoordinates)
      ), r = this._getPositionID(e);
      this._positionMap.has(r) ? this._positionMap.get(r).push(t) : this._positionMap.set(r, [t]);
    }), this);
  }
  _forEachMark(t) {
    this.markCollections.forEach((e) => {
      if (e instanceof ra)
        e.forEach(t);
      else if (e instanceof G)
        t(e);
      else if (typeof e.forEach == "function")
        e.forEach(t);
      else if (typeof e == "function") {
        let r = e();
        r instanceof G ? t(r) : r.forEach(t);
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
      (e, r, a) => e * this._numBins + Math.floor((r - this._extents[a][0]) / this._binSizes[a]),
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
  marksNear(t, e, r = !0) {
    if (this._positionMap || this.compute(), this._numMarks == 0)
      return [];
    let a = this._recursiveBinWalk(t, e);
    return r ? a.map((n) => {
      let o = this._coordinateAttributes.map(
        (h) => n.attr(h, this._transformCoordinates)
      );
      return [
        n,
        Math.sqrt(
          o.reduce(
            (h, l, u) => h + (l - t[u]) * (l - t[u]),
            0
          )
        )
      ];
    }).filter(([n, o]) => o <= e).sort((n, o) => n[1] - o[1]).map(([n, o]) => n) : a;
  }
  _recursiveBinWalk(t, e, r = [], a = {}) {
    let s = r.length;
    if (s == t.length)
      return this._positionMap.get(this._getPositionID(r)) ?? [];
    let n = a.distanceInBins ? e : Math.ceil(e / this._binSizes[s]), o = (a.outerOnly && r.length == this._binSizes.length - 1 ? [-n, n] : new Array(n * 2 + 1).fill(0).map((l, u) => u - n)).map((l) => l * this._binSizes[s] + t[s]).filter(
      (l) => l >= this._extents[s][0] && l <= this._extents[s][1]
    ), h = [];
    return o.forEach((l, u) => {
      h = [
        ...h,
        ...this._recursiveBinWalk(
          t,
          e,
          [...r, l],
          {
            ...a,
            outerOnly: a.outerOnly && u > 0 && u < o.length - 1
          }
        )
      ];
    }), h;
  }
  /**
   * Performs a hit-test near the given coordinates and returns the first mark
   * that returns true according to the mark's `hitTest` function.
   *
   * @param location the coordinates to perform a hit-test near
   * @param maximumDistance the maximum distance to search within before stopping
   *
   * @returns the first Mark whose hit-test returns true for the given location,
   *  or null if none do.
   */
  hitTest(t, e = null) {
    if (this._positionMap || this.compute(), this._numMarks == 0)
      return null;
    e == null && (e = this._maximumHitTestDistance);
    let r = this._binSizes.reduce(
      (a, s) => Math.min(
        this._numBins,
        Math.floor(Math.max(a, e / s))
      ),
      0
    ) + 1;
    for (let a = 0; a < r; a++) {
      let s = this._recursiveBinWalk(t, a, [], {
        outerOnly: !0,
        distanceInBins: !0
      });
      if (s.length == 0)
        continue;
      let o = s.map((h) => {
        let l = this._coordinateAttributes.map(
          (u) => h.attr(u, this._transformCoordinates)
        );
        return [
          h,
          Math.sqrt(
            l.reduce(
              (u, c, d) => u + (c - t[d]) * (c - t[d]),
              0
            )
          )
        ];
      }).filter(([h, l]) => l <= e).sort((h, l) => h[1] - l[1]).map(([h, l]) => h);
      for (let h of o)
        if (h.hitTest(t))
          return h;
    }
    return null;
  }
  /**
   * Performs a hit-test at the given location and dispatches an event to the mark
   * closest to it, if it exists.
   *
   * @param location the location at which to fire the event
   * @param eventName the event type to dispatch
   * @param details an optional object representing information about the event
   * @returns the mark that received the event, or null if no mark was found
   */
  dispatchAt(t, e, r = void 0) {
    let a = this.hitTest(t);
    return a && a.dispatch(e, r), a;
  }
}
var sa = /* @__PURE__ */ ((i) => (i.none = "no-preference", i.more = "more", i.less = "less", i))(sa || {}), na = /* @__PURE__ */ ((i) => (i.light = "light", i.dark = "dark", i))(na || {});
class oa {
  constructor() {
    this._hasChanged = !1;
    let t = window.matchMedia("(prefers-reduced-motion: reduce)");
    this._prefersReducedMotion = t.matches, t.addEventListener("change", (h) => this._handleMotion(h));
    let e = window.matchMedia(
      "(prefers-reduced-transparency: reduce)"
    );
    this._prefersReducedTransparency = e.matches, e.addEventListener(
      "change",
      (h) => this._handleTransparency(h)
    );
    let r = window.matchMedia("(prefers-contrast: none)");
    this._contrastPreference = "no-preference", r.addEventListener("change", (h) => this._handleContrastNone(h));
    let a = window.matchMedia("(prefers-contrast: more)");
    a.matches && (this._contrastPreference = "more"), a.addEventListener("change", (h) => this._handleContrastMore(h));
    let s = window.matchMedia("(prefers-contrast: less)");
    a.matches && (this._contrastPreference = "less"), s.addEventListener("change", (h) => this._handleContrastLess(h));
    let n = window.matchMedia("(prefers-color-scheme: light)");
    this._colorSchemePreference = "light", n.addEventListener(
      "change",
      (h) => this._handleColorSchemeLight(h)
    );
    let o = window.matchMedia("(prefers-color-scheme: dark)");
    o.matches && (this._colorSchemePreference = "dark"), o.addEventListener("change", (h) => this._handleColorSchemeDark(h));
  }
  _handleMotion(t) {
    this._prefersReducedMotion = t.matches, this._hasChanged = !0;
  }
  _handleTransparency(t) {
    this._prefersReducedTransparency = t.matches, this._hasChanged = !0;
  }
  _handleContrastMore(t) {
    t.matches && (this._contrastPreference = "more"), this._hasChanged = !0;
  }
  _handleContrastLess(t) {
    t.matches && (this._contrastPreference = "less"), this._hasChanged = !0;
  }
  _handleContrastNone(t) {
    t.matches && (this._contrastPreference = "no-preference"), this._hasChanged = !0;
  }
  _handleColorSchemeLight(t) {
    t.matches && (this._colorSchemePreference = "light"), this._hasChanged = !0;
  }
  _handleColorSchemeDark(t) {
    t.matches && (this._colorSchemePreference = "dark"), this._hasChanged = !0;
  }
  get prefersReducedMotion() {
    return this._prefersReducedMotion;
  }
  get prefersReducedTransparency() {
    return this._prefersReducedTransparency;
  }
  get contrastPreference() {
    return this._contrastPreference;
  }
  get colorSchemePreference() {
    return this._colorSchemePreference;
  }
  advance(t) {
    return this._hasChanged ? (this._hasChanged = !1, !0) : !1;
  }
}
let Ot;
function ya() {
  return Ot || (Ot = new oa()), Ot;
}
export {
  z as Animator,
  M as Attribute,
  Mi as AttributeRecompute,
  na as ColorSchemePreference,
  sa as ContrastPreference,
  fa as LazyTicker,
  G as Mark,
  li as MarkFollower,
  ra as MarkRenderGroup,
  _a as PositionMap,
  oa as RenderContext,
  ma as Scales,
  ia as StageManager,
  ea as StagingAction,
  ta as StagingState,
  da as Ticker,
  Ht as autoMixingFunction,
  ua as basicAnimationTo,
  ga as centerOn,
  Nr as colorMixingFunction,
  Z as curveEaseInOut,
  oi as curveLinear,
  ca as defineMark,
  ya as getRenderContext,
  la as interpolateAlongPath,
  W as interpolateTo,
  Qr as interpolateToFunction,
  pa as markBox,
  Jr as numericalArrayMixingFunction,
  hi as numericalMixingFunction
};
