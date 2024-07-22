import { Animator } from './animator';
import {
  Deferred,
  TimeProvider,
  approxEquals,
  makeTimeProvider,
} from './utils';
import { Advanceable } from './ticker';

export type AttributeListener<T, U, V> = (
  attribute: Attribute<T, U, V>,
  animated: boolean
) => void;

export enum AttributeRecompute {
  DEFAULT = 0,
  ALWAYS,
  WHEN_UPDATED,
}

/**
 * Options to create an `Attribute`.
 * @memberof Attribute
 */
export interface AttributeDefinition<
  TransformedValueType extends Exclude<any, Function>,
  ValueType = TransformedValueType,
  ComputeArgumentType = any
> {
  /**
   * The value of the attribute, if it is not updated using a dynamic function.
   */
  value?: ValueType;
  /**
   * A function that takes the attribute's compute argument and returns the
   * attribute's value. This overrides a static `value` property value.
   */
  valueFn?: ((computeArg: ComputeArgumentType) => ValueType) | null;
  /**
   * A function that transforms the value of the attribute before being returned.
   */
  transform?:
    | ((
        raw: ValueType,
        computeArg: ComputeArgumentType
      ) => TransformedValueType)
    | null;
  /**
   * If true, specifies that the transformed value should be cached and reused
   * when the raw value does not change (suitable when the transform function is
   * fixed). If false, specifies that the transform should be rerun every time
   * the value is requested - suitable when the transform function's behavior
   * may change from frame to frame. When the value is cached, the transform can
   * be updated by calling `updateTransform()` on the attribute.
   */
  cacheTransform?: boolean;
  /**
   * An argument to be passed to the attribute's `valueFn`. If undefined,
   * the attribute itself is passed as the argument.
   */
  computeArg?: ComputeArgumentType | undefined;
  /**
   * Defines the behavior of the attribute's computation when specified using a
   * value function. The default value of `AttributeRecompute.DEFAULT` causes the
   * value function to be called every time `get()`, `compute()`, or `animate()`
   * is called. If set to `AttributeRecompute.ALWAYS`, the value function is
   * called every time the `advance()` method is called (i.e. every tick). If
   * set to `AttributeRecompute.WHEN_UPDATED`, it will only be called when `compute()`
   * or `animate()` is called.
   */
  recompute?: AttributeRecompute;
  /**
   * If set to true, animations will be run without affecting the result of
   * the `advance()` method. This assumes that you will be responsible for
   * running the animation by calling `getPreload()`.
   */
  preload?: boolean;
}

export type PreloadAttributeValue<T> = {
  start: T;
  end: T;
  startTime: number;
  endTime: number;
};

type AttributeAnimation<T> = {
  animator: Animator<T>;
  initial: T;
  start: number;
};

type AttributeCopySpec<
  TransformedValueType extends Exclude<any, Function>,
  ValueType,
  ComputeArgumentType
> = {
  [K in keyof AttributeDefinition<
    TransformedValueType,
    ValueType,
    ComputeArgumentType
  >]?: AttributeDefinition<
    TransformedValueType,
    ValueType,
    ComputeArgumentType
  >[K];
};

/**
 * An `Attribute` contains a value representing some aspect of state in a data
 * mark.
 */
export class Attribute<
  TransformedValueType,
  ValueType = TransformedValueType,
  ComputeArgumentType = any
> implements
    AttributeDefinition<TransformedValueType, ValueType, ComputeArgumentType>,
    Advanceable
{
  public value: ValueType;
  public valueFn: ((computeArg: ComputeArgumentType) => ValueType) | undefined =
    undefined;
  public transform:
    | ((
        raw: ValueType,
        computeArg: ComputeArgumentType
      ) => TransformedValueType)
    | undefined = undefined;
  public cacheTransform = false;
  private _cachedValue: {
    raw: ValueType;
    result: TransformedValueType;
  } | null = null;
  public computeArg: ComputeArgumentType | undefined = undefined;
  public recompute: AttributeRecompute = AttributeRecompute.DEFAULT;
  private needsUpdate = false;
  private animation: AttributeAnimation<ValueType> | null = null;
  public label = null; // for debugging
  private _computedValue: ValueType = null; // this is always a stable value, i.e. non-animated
  private _lastTickValue: ValueType = undefined;
  private _animatedValue: ValueType = null; // value if an animation is ongoing
  private _hasComputed = false;
  private _timeProvider: TimeProvider = null; // REQUIRED for animation
  private currentTime = 0;
  private _changedLastTick = false;
  private _preload: boolean = false; // if only preload gets are allowed

  private _listeners: AttributeListener<
    TransformedValueType,
    ValueType,
    ComputeArgumentType
  >[] = [];

  private _animationCompleteCallbacks: Deferred<
    Attribute<TransformedValueType, ValueType, ComputeArgumentType>
  >[] = [];
  private _animationCompleteTimeout: NodeJS.Timeout | null = null;

  /**
   *
   * @param info Arguments describing how to populate the attribute, or a single
   *    value that should be stored as the `value` or `valueFn` of the attribute.
   */
  constructor(
    info:
      | TransformedValueType
      | ((computeArg: ComputeArgumentType) => ValueType)
      | AttributeDefinition<
          TransformedValueType,
          ValueType,
          ComputeArgumentType
        >
  ) {
    if (
      info == undefined ||
      info == null ||
      !(info.hasOwnProperty('value') || info.hasOwnProperty('valueFn'))
    ) {
      if (typeof info === 'function')
        this.valueFn = info as (computeArg: ComputeArgumentType) => ValueType;
      else this.value = info as ValueType;
    } else {
      let args = info as AttributeDefinition<
        TransformedValueType,
        ValueType,
        ComputeArgumentType
      >;
      if (args.valueFn !== undefined) {
        this.valueFn = args.valueFn;
      } else if (args.value !== undefined) {
        this.value = args.value;
      } else {
        console.error(
          'One of `value` or `valueFn` must be defined to create an Attribute'
        );
      }
      this.transform = args.transform ?? null;
      this.cacheTransform = args.cacheTransform ?? false;
      this._cachedValue = null;
      this.computeArg = args.computeArg ?? null;
      this.recompute = args.recompute ?? AttributeRecompute.DEFAULT;
      this._preload = args.preload ?? false;
    }
  }

  /**
   * Registers this attribute as preloadable.
   */
  registerPreloadable(): Attribute<
    TransformedValueType,
    ValueType,
    ComputeArgumentType
  > {
    this._preload = true;
    return this;
  }

  /**
   * Creates a new Attribute with identical options and values except for the
   * parameters specified in the given options object.
   *
   * @param newOptions An object containing options to apply to the new attribute
   * @returns the new copied attribute
   */
  copy(
    newOptions: AttributeCopySpec<
      TransformedValueType,
      ValueType,
      ComputeArgumentType
    > = {}
  ): Attribute<TransformedValueType, ValueType, ComputeArgumentType> {
    let newDefinition = { ...this, ...newOptions };
    // Make sure the new options control which of value/valueFn is populated
    if (newOptions.value !== undefined) newDefinition.valueFn = undefined;
    if (newOptions.valueFn !== undefined) newDefinition.value = undefined;
    return new Attribute(newDefinition);
  }

  addListener(
    listener: AttributeListener<
      TransformedValueType,
      ValueType,
      ComputeArgumentType
    >
  ) {
    this._listeners.push(listener);
  }

  removeListener(
    listener: AttributeListener<
      TransformedValueType,
      ValueType,
      ComputeArgumentType
    >
  ) {
    let idx = this._listeners.indexOf(listener);
    if (idx >= 0) this._listeners = this._listeners.splice(idx, 1);
  }

  setTimeProvider(timeProvider) {
    this._timeProvider = timeProvider;
  }

  _getComputeArg(): ComputeArgumentType {
    return this.computeArg !== undefined
      ? this.computeArg
      : (this as unknown as ComputeArgumentType);
  }

  /**
   * Synchronously computes the value of the attribute.
   */
  compute() {
    if (!!this.valueFn) {
      this._computedValue = this.valueFn(this._getComputeArg());
    }
  }

  // Advances the time of the animation by the given number of msec,
  // and returns whether or not a redraw is needed
  advance(dt: number | undefined = undefined): boolean {
    if (this.animation != null || this.needsUpdate || !!this.valueFn) {
      if (this._timeProvider === null) this.currentTime += dt;
      else this.currentTime = this._timeProvider();
    }

    if (this.animation == null && this._animationCompleteCallbacks.length > 0) {
      // Clean up animation callbacks for animations that were somehow removed
      console.warn(
        'Found animation-complete callbacks for a non-existent animation'
      );
      this._cleanUpAnimation(true);
    }

    this._lastTickValue = undefined;
    this._lastTickValue = this.getUntransformed();
    if (this.animation != null || this.needsUpdate) {
      this.needsUpdate = false;
      this._changedLastTick = true;
      return true;
    }
    this._changedLastTick = false;
    return false;
  }

  _computeAnimation(recomputeOnComplete = true) {
    if (!this.animation) return;
    if (!!this._timeProvider) this.currentTime = this._timeProvider();

    // Evaluate the animation
    let { animator, start, initial } = this.animation;
    let value = animator.evaluate(
      initial,
      Math.min(this.currentTime - start, animator.duration)
      // can add a debug flag here
    );
    // Complete the animation if within one frame
    if (this._animationFinished() && recomputeOnComplete) {
      if (!!this.valueFn) this.compute();
      else this.value = value;
      this._cleanUpAnimation(false);
      this._animatedValue = null;
    } else {
      this._animatedValue = value;
    }
  }

  _animationFinished() {
    if (!this.animation) return true;
    return (
      this.animation.animator.duration + 20 <=
      this.currentTime - this.animation.start
    );
  }

  _performTransform(value: ValueType): TransformedValueType {
    let transformedValue: TransformedValueType;
    if (!!this.transform) {
      let cached = this._cachedValue;
      if (!!cached && approxEquals(cached.raw, value)) {
        transformedValue = cached.result;
      } else {
        let raw = value;
        transformedValue = this.transform(value, this._getComputeArg());

        if (this.cacheTransform) {
          this._cachedValue = {
            raw,
            result: transformedValue,
          };
        }
      }
    } else transformedValue = value as unknown as TransformedValueType;
    return transformedValue;
  }

  _cleanUpAnimation(canceled = false) {
    if (this._preload && !!this.animation && !canceled) {
      // set the value to the final value of the animation
      if (!this.valueFn) {
        this.value = this.animation.animator.finalValue;
        this._lastTickValue = this.value;
      } else {
        this.compute();
        this._lastTickValue = this._computedValue;
      }
    }
    this.animation = null;
    this._animatedValue = null;
    this._animationCompleteCallbacks.forEach((cb) => {
      if (!canceled || !cb.info.rejectOnCancel) cb.resolve(this);
      else cb.reject({ newValue: this.last() });
    });
    this._animationCompleteCallbacks = [];
    if (!!this._animationCompleteTimeout) {
      clearTimeout(this._animationCompleteTimeout);
      this._animationCompleteTimeout = null;
    }
  }

  /**
   * Retrieves the current (transformed) value. If a context is not provided,
   * the value returned will be the final value of any active transitions being
   * rendered.
   */
  get(): TransformedValueType {
    return this._performTransform(this.getUntransformed());
  }

  /**
   * Retrieves the current un-transformed value.
   */
  getUntransformed(): ValueType {
    if (
      this._lastTickValue !== undefined &&
      !this.needsUpdate &&
      this._timeProvider !== null &&
      this.currentTime == this._timeProvider()
    ) {
      return this._lastTickValue;
    }

    this._computeAnimation();

    let value: ValueType;
    if (this._animatedValue != null) value = this._animatedValue;
    else if (!!this.valueFn) {
      if (
        this.recompute !== AttributeRecompute.WHEN_UPDATED ||
        !this._hasComputed
      ) {
        this.compute();
        this._hasComputed = true;
      }
      value = this._computedValue;
    } else value = this.value;
    this._lastTickValue = value;
    return value;
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
  getPreload(
    currentTime: number | null = null
  ): PreloadAttributeValue<TransformedValueType> {
    if (!this._preload)
      console.error('Cannot call getPreload on a non-preloadable attribute.');
    if (!!this._timeProvider) this.currentTime = this._timeProvider();

    if (!this.animation) {
      let value = this.get();
      return {
        start: value,
        end: value,
        startTime: currentTime || this.currentTime,
        endTime: currentTime || this.currentTime,
      };
    }
    let untransformed = this.getPreloadUntransformed(currentTime);
    return {
      start: this._performTransform(untransformed.start),
      end: this._performTransform(untransformed.end),
      startTime: untransformed.startTime,
      endTime: untransformed.endTime,
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
  getPreloadUntransformed(
    currentTime: number | null = null
  ): PreloadAttributeValue<ValueType> {
    if (!!this._timeProvider) this.currentTime = this._timeProvider();

    if (!this.animation) {
      let value = this.getUntransformed();
      return {
        start: value,
        end: value,
        startTime: currentTime || this.currentTime,
        endTime: currentTime || this.currentTime,
      };
    }

    if (this._animationFinished()) {
      this._computeAnimation();
      return this.getPreloadUntransformed(currentTime);
    }

    let rawValue: ValueType;
    if (!!this.valueFn) {
      if (
        this.recompute !== AttributeRecompute.WHEN_UPDATED ||
        !this._hasComputed
      ) {
        this.compute();
        this._hasComputed = true;
      }
      rawValue = this._computedValue;
    } else rawValue = this.value;

    let finalValue = this.animation.animator.finalValue;
    if (finalValue === undefined) {
      console.error(
        'Animations on preloadable attributes must have a final value'
      );
    }

    let timeDelta = (currentTime || this.currentTime) - this.currentTime;
    return {
      start: rawValue,
      end: finalValue,
      startTime: this.animation.start + timeDelta,
      endTime:
        this.animation.start + this.animation.animator.duration + timeDelta,
    };
  }

  /**
   * Synchronously sets the value of the attribute and marks that it needs to
   * be updated on the next call to `advance()`.
   *
   * @param newValue The new value or value function.
   */
  set(newValue: ValueType | ((computeArg: ComputeArgumentType) => ValueType)) {
    if (typeof newValue == 'function') {
      if (this.value != null) this._computedValue = this.value;
      this.valueFn = newValue as (computeArg: ComputeArgumentType) => ValueType;
      this.value = undefined;
      this._animatedValue = null;
    } else {
      this.value = newValue;
      this.valueFn = null;
      this._animatedValue = null;
    }
    this.needsUpdate = true;
    this._lastTickValue = undefined;
    if (this.animation) this._cleanUpAnimation(true);
    this._listeners.forEach((l) => l(this, false));
  }

  /**
   * Retrieves the non-animated value for the attribute, i.e. the final value
   * if an animation is in progress or the current value otherwise. This method
   * computes the value if specified as a value function.
   */
  data(): ValueType {
    if (!!this.valueFn) {
      return this.valueFn(this._getComputeArg());
    } else {
      return this.value;
    }
  }

  /**
   * Returns the last value known for this attribute _without_ running the value
   * function.
   */
  last(): ValueType {
    if (!!this.animation) {
      // We're in a dirty state - a preloadable animation is underway and
      // the attribute hasn't been updated using the advance() method yet.
      // Because any updates to the attribute would result in the proper values
      // being set, we can just evaluate the animation here (without recomputing
      // if the animation is finished).
      this._computeAnimation(false);
    }

    if (this._lastTickValue !== undefined) return this._lastTickValue;
    if (this._animatedValue != null) return this._animatedValue;
    if (this.value !== undefined) return this.value;
    return this._computedValue;
  }

  /**
   * Returns the value that this attribute is approaching if animating (or `null`
   * if not available), or the current value if not animating. This method does
   * _not_ compute a new value for the attribute.
   */
  future(): ValueType {
    if (!!this.animation) {
      return this.animation.animator.finalValue;
    }
    if (this._animatedValue != null) return this._animatedValue;
    if (this.value !== undefined) return this.value;
    return this._computedValue;
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
  animating(): boolean {
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
  animate(
    animation: Animator<ValueType>
  ): Attribute<TransformedValueType, ValueType, ComputeArgumentType> {
    if (!!this._timeProvider) this.currentTime = this._timeProvider();

    if (!!this.animation) {
      // Set the current value of the property to wherever it is now
      this._computeAnimation();
      if (!this.valueFn) {
        this.value = this._animatedValue;
      } else {
        this._computedValue = this._animatedValue;
      }
      this._lastTickValue = this._animatedValue;
      this._cleanUpAnimation(true);
    }

    this.animation = {
      animator: animation,
      initial: this.last(),
      start: this.currentTime,
    };
    this._computeAnimation();
    this._listeners.forEach((l) => l(this, true));
    return this;
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
  wait(
    rejectOnCancel: boolean = true
  ): Promise<Attribute<TransformedValueType, ValueType, ComputeArgumentType>> {
    if (!this.animation) {
      // Simply resolve the promise as there is nothing to wait for
      return new Promise((resolve, reject) => resolve(this));
    }
    let cb = new Deferred<
      Attribute<TransformedValueType, ValueType, ComputeArgumentType>
    >({ rejectOnCancel });
    this._animationCompleteCallbacks.push(cb);
    if (this._preload) {
      // the advance method will not notify that this animation is finished, so
      // create a timeout to call the callbacks
      let { endTime } = this.getPreloadUntransformed();
      let currentTime = this._timeProvider();
      if (!this._animationCompleteTimeout)
        this._animationCompleteTimeout = setTimeout(() => {
          this._cleanUpAnimation();
        }, endTime - currentTime);
    }
    return cb.promise;
  }

  /**
   * "Freezes" this attribute by setting it to its last value. This removes any
   * value functions and animations and replaces them with static values. The
   * value function will not be re-run.
   */
  freeze(): Attribute<TransformedValueType, ValueType, ComputeArgumentType> {
    if (this.animation) this._cleanUpAnimation(true);
    this.value = this.last();
    this.valueFn = undefined;
    return this;
  }
  /**
   * Sets transform of an attribute to a new function, can be applied to an Attribute,
   * a Mark, or a MarkRenderGroup
   * @param attrToModify attribute to modify
   * @param newFunc new function to set transform to
   */
  setTransform(attrToModify: Attribute<TransformedValueType, ValueType, ComputeArgumentType> = this, newFunc : (raw : ValueType, computeArg : ComputeArgumentType) => TransformedValueType) : void {
    attrToModify.transform = newFunc;
  }
  /**
   * @returns whether or not this attribute changed value (due to animation or
   * other updates) on the last call to `advance`
   */
  changed(): boolean {
    return this._changedLastTick;
  }
}
