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
  private _callback: () => void;
  private _lastTick: number | undefined = undefined;
  public stopped: boolean = true;

  constructor(toAdvance: Advanceable | Advanceable[], callback: () => void) {
    if (toAdvance.hasOwnProperty('advance'))
      this.toAdvance = [toAdvance as Advanceable];
    else this.toAdvance = toAdvance as Advanceable[];
    this._callback = callback;
    this.start();
  }

  start() {
    this._lastTick = window.performance.now();
    this.stopped = false;
    this._callback();
    requestAnimationFrame((t) => this.tick(t));
  }

  stop() {
    this._lastTick = undefined;
    this.stopped = true;
  }

  tick(t: number) {
    if (this._lastTick === undefined) this._lastTick = window.performance.now();
    if (
      this.toAdvance
        .map((item) => item.advance(t - this._lastTick))
        .some((v) => v)
    )
      this._callback();
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
  private _callback: () => void;
  private _lastTick: number | undefined = undefined;
  public stopped: boolean = true;

  constructor(toAdvance: Advanceable | Advanceable[], callback: () => void) {
    if (toAdvance.hasOwnProperty('advance'))
      this.toAdvance = [toAdvance as Advanceable];
    else this.toAdvance = toAdvance as Advanceable[];
    this._callback = callback;
    this.start();
  }

  start() {
    if (!this.stopped) return;
    this._lastTick = window.performance.now();
    this.stopped = false;
    this._callback();
    requestAnimationFrame((t) => this.tick(t));
  }

  stop() {
    this._lastTick = undefined;
    this.stopped = true;
  }

  tick(t: number) {
    if (this._lastTick === undefined) this._lastTick = window.performance.now();
    if (
      this.toAdvance
        .map((item) => item.advance(t - this._lastTick))
        .some((v) => v)
    ) {
      this._callback();
      if (!this.stopped) requestAnimationFrame((t) => this.tick(t));
      this._lastTick = t;
    } else {
      this.stop();
    }
  }
}
