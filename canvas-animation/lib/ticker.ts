/**
 * Represents any object that can maintain an internal clock and run functions
 * after a time delta.
 */
export interface Advanceable {
  advance(dt: number | undefined): boolean;
}

/**
 * A wrapper for `requestAnimationFrame` that runs every frame. The callback
 * is only called when the `{@link Advanceable.advance()}` function returns
 * `true` or when the ticker is started, signifying that an update is needed.
 */
export class Ticker {
  private toAdvance: Advanceable[];
  private _callbacks: (() => void)[] = [];
  private _lastTick: number | undefined = undefined;
  public stopped: boolean = true;

  constructor(toAdvance: Advanceable | Advanceable[]) {
    if (typeof (toAdvance as Advanceable).advance === 'function')
      this.toAdvance = [toAdvance as Advanceable];
    else this.toAdvance = toAdvance as Advanceable[];
    this.start();
  }

  onChange(cb: () => void): Ticker {
    this._callbacks.push(cb);
    return this;
  }

  start(): Ticker {
    this._lastTick = window.performance.now();
    this.stopped = false;
    this._callbacks.forEach((cb) => cb());
    requestAnimationFrame((t) => this.tick(t));
    return this;
  }

  stop(): Ticker {
    this._lastTick = undefined;
    this.stopped = true;
    return this;
  }

  tick(t: number) {
    if (this._lastTick === undefined) this._lastTick = window.performance.now();
    if (
      this.toAdvance
        .map((item) => item.advance(t - this._lastTick))
        .some((v) => v)
    )
      this._callbacks.forEach((cb) => cb());
    if (!this.stopped) requestAnimationFrame((t) => this.tick(t));
    this._lastTick = t;
  }
}

/**
 * A ticker that _only_ requests frames when an animation is in progress. In
 * other words, the ticker stops when the `{@link Advanceable.advance()}`
 * function returns `false`. You must restart it when an animation has been
 * started by calling `{@link start}`. The callback is only called when the
 * `{@link Advanceable.advance()}` function returns `true` or when the ticker is
 * started, signifying that an update is needed.
 */
export class LazyTicker {
  private toAdvance: Advanceable[];
  private _callbacks: (() => void)[] = [];
  private _lastTick: number | undefined = undefined;
  public stopped: boolean = true;

  constructor(toAdvance: Advanceable | Advanceable[]) {
    if (typeof (toAdvance as Advanceable).advance === 'function')
      this.toAdvance = [toAdvance as Advanceable];
    else this.toAdvance = toAdvance as Advanceable[];
    this.start();
  }

  onChange(cb: () => void): LazyTicker {
    this._callbacks.push(cb);
    return this;
  }

  start(): LazyTicker {
    if (!this.stopped) return;
    this._lastTick = window.performance.now();
    this.stopped = false;
    this._callbacks.forEach((cb) => cb());
    requestAnimationFrame((t) => this.tick(t));
    return this;
  }

  stop(): LazyTicker {
    this._lastTick = undefined;
    this.stopped = true;
    return this;
  }

  tick(t: number) {
    if (this._lastTick === undefined) this._lastTick = window.performance.now();
    if (
      this.toAdvance
        .map((item) => item.advance(t - this._lastTick))
        .some((v) => v)
    ) {
      this._callbacks.forEach((cb) => cb());
      if (!this.stopped) requestAnimationFrame((t) => this.tick(t));
      this._lastTick = t;
    } else {
      this.stop();
    }
  }
}
