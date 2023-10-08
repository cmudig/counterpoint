import {
  AttributeSetBase,
  Mark,
  MarkAttributes,
  SimpleAnimationOptions,
  AnimationOptions,
} from './mark';
import { TimeProvider, approxEquals, makeTimeProvider } from './utils';
import {
  AnimationCurve,
  Animator,
  Interpolator,
  PreloadableAnimator,
  curveEaseInOut,
  curveLinear,
  interpolateTo,
} from './animator';

type RenderGroupOptions = {
  timeProvider?: TimeProvider;
  lazyUpdates?: boolean;
  animationDuration?: number;
  animationCurve?: AnimationCurve;
};

type GroupAnimationOptions<
  AttributeSet extends AttributeSetBase,
  ValueType
> = SimpleAnimationOptions & {
  interpolator?: (
    mark: Mark<AttributeSet>,
    i: number
  ) => Interpolator<ValueType> | undefined | null;
};

/**
 * Keeps track of a set of marks. This is helpful to track which
 * marks are being animated, thereby saving on computation in each
 * run loop.
 */
export class MarkRenderGroup<
  AttributeSet extends AttributeSetBase = MarkAttributes
> {
  private timeProvider: TimeProvider = null;

  /**
   * The set of marks that this group contains. All marks have the same set
   * of attributes.
   */
  private marks: Mark<AttributeSet>[];
  /**
   * Controls whether the mark group iterates over the entire set of marks in
   * every call to `advance()`. If set to `true`, only the marks that have
   * been explicitly changed through a call to `set...` or `animate...` will
   * be advanced. The default is `false`.
   */
  public lazyUpdates: boolean = false;

  private marksByID: Map<any, Mark<AttributeSet>>;

  // Marks that have an active animation
  private animatingMarks: Set<Mark<AttributeSet>> = new Set();

  // Marks updated in this frame
  private updatedMarks: Set<Mark<AttributeSet>> = new Set();

  private preloadableProperties: Set<keyof AttributeSet> = new Set();

  private _forceUpdate = false;

  private _defaultDuration: number;
  private _defaultCurve: AnimationCurve;

  /**
   * @param marks The set of marks that this group should manage, all including
   *  the same set of attributes.
   * @param opts Options for the mark group (see {@link configure})
   */
  constructor(
    marks: Mark<AttributeSet>[],
    opts: RenderGroupOptions = {
      animationDuration: 1000,
      animationCurve: curveEaseInOut,
    }
  ) {
    this.timeProvider = makeTimeProvider();
    this.lazyUpdates = false;
    this._defaultDuration = 1000;
    this._defaultCurve = curveEaseInOut;
    this.configure(opts);

    this.marks = marks;
    this.marksByID = new Map();
    this.marks.forEach((m) => {
      this.marksByID.set(m.id, m);
      m.setTimeProvider(this.timeProvider);
      m.configure({
        animationDuration: this._defaultDuration,
        animationCurve: this._defaultCurve,
      });
      m.addListener((mark, attrName, animated) => {
        this.updatedMarks.add(mark);
        if (!this.preloadableProperties.has(attrName) && animated)
          this.animatingMarks.add(mark);
      });
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
  configure(opts: RenderGroupOptions): MarkRenderGroup<AttributeSet> {
    if (opts.timeProvider !== undefined) this.timeProvider = opts.timeProvider;
    if (opts.lazyUpdates !== undefined) this.lazyUpdates = opts.lazyUpdates;
    if (opts.animationDuration !== undefined)
      this._defaultDuration = opts.animationDuration;
    if (opts.animationCurve !== undefined)
      this._defaultCurve = opts.animationCurve;
    return this;
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
  forceUpdate(): MarkRenderGroup<AttributeSet> {
    this._forceUpdate = true;
    return this;
  }

  getMarks(): Mark<AttributeSet>[] {
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
  registerPreloadableProperty(
    attrName: keyof AttributeSet
  ): MarkRenderGroup<AttributeSet> {
    this.preloadableProperties.add(attrName);
    return this;
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
  advance(dt: number): boolean {
    this.timeProvider.advance(dt);

    this.updatedMarks = new Set();
    if (this.animatingMarks.size == 0 && !this._forceUpdate) return false;

    for (let mark of this.animatingMarks) {
      if (!mark.advance()) {
        this.animatingMarks.delete(mark);
      }
    }

    this._forceUpdate = false;

    return true;
  }

  /**
   * @returns whether any mark properties have been changed since the last
   * `advance()` call, or if any animations have been added. If an animation
   * is on a non-preloadable property, this also returns `true`.
   */
  marksChanged(): boolean {
    return this.updatedMarks.size > 0 || this._forceUpdate;
  }

  /**
   * @returns whether any marks are currently animating, excluding any marks that
   *  have a preloadable animation (since these are not regularly updated)
   */
  marksAnimating(): boolean {
    return this.animatingMarks.size > 0;
  }

  animateTo<
    K extends keyof AttributeSet,
    AttributeType extends AttributeSet[K]
  >(
    attrName: K,
    finalValueFn: (
      mark: Mark<AttributeSet>,
      i: number
    ) =>
      | AttributeType['value']
      | ((computeArg: AttributeType['computeArg']) => AttributeType['value']),
    options: SimpleAnimationOptions = {}
  ): MarkRenderGroup<AttributeSet> {
    let preloadable = this.preloadableProperties.has(attrName);
    // this.updatedMarks = new Set(this.getMarks());

    if (preloadable) {
      let duration =
        options.duration === undefined
          ? this._defaultDuration
          : options.duration;

      this.forEach((mark, i) =>
        mark.animate(
          attrName,
          new PreloadableAnimator(finalValueFn(mark, i), duration)
        )
      );
    } else {
      // this.animatingMarks = new Set(this.getMarks());
      this.forEach((mark, i) =>
        mark.animateTo(attrName, finalValueFn(mark, i), options)
      );
    }

    return this;
  }

  animate<
    K extends keyof AttributeSet,
    ValueType extends AttributeSet[K]['value']
  >(
    attrName: K,
    options: GroupAnimationOptions<AttributeSet, ValueType> = {
      duration: 1000,
      curve: curveEaseInOut,
    }
  ): MarkRenderGroup<AttributeSet> {
    let preloadable = this.preloadableProperties.has(attrName);
    if (preloadable && !!options.interpolator) {
      console.error(
        'Cannot apply custom interpolator function on preloadable property.'
      );
      return this;
    }

    this.forEach((mark, i) => {
      if (preloadable) {
        let duration =
          options.duration === undefined
            ? this._defaultDuration
            : options.duration;
        let newValue = mark.data(attrName);
        mark.animate(attrName, new PreloadableAnimator(newValue, duration));
      } else {
        mark.animate(attrName, {
          ...options,
          interpolator:
            options.interpolator !== undefined
              ? options.interpolator(mark, i)
              : interpolateTo,
        });
      }
    });

    return this;
  }

  update<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K,
    newValueFn:
      | ((mark: Mark<AttributeSet>, i: number) => AttributeType['value'])
      | undefined = undefined
  ): MarkRenderGroup<AttributeSet> {
    this.forEach((mark, i) => {
      mark.setAttr(
        attrName,
        newValueFn === undefined ? undefined : newValueFn(mark, i)
      );
    });
    return this;
  }

  /**
   * Retrieves the mark with the given ID, or undefined if it does not exist.
   * @param id the ID of the mark to search for
   * @returns the `Mark` instance with the given ID or undefined if it doesn't
   * exist
   */
  getMarkByID(id: any): Mark<AttributeSet> | undefined {
    return this.marksByID.get(id);
  }

  forEach(
    callbackfn: (
      value: Mark<AttributeSet>,
      index: number,
      array: Mark<AttributeSet>[]
    ) => void | any
  ) {
    this.getMarks().forEach(callbackfn);
  }

  map<T>(
    mapper: (
      value: Mark<AttributeSet>,
      index: number,
      array: Mark<AttributeSet>[]
    ) => T
  ): T[] {
    return this.getMarks().map(mapper);
  }

  filter(
    filterer: (
      value: Mark<AttributeSet>,
      index: number,
      array: Mark<AttributeSet>[]
    ) => boolean
  ): Mark<AttributeSet>[] {
    return this.getMarks().filter(filterer);
  }

  /**
   * Notifies every mark that the transform for the given attribute has changed.
   *
   * @param attrName the attribute whose transform has changed
   * @returns this render group
   *
   * @see Attribute.updateTransform
   */
  updateTransform(attrName: keyof AttributeSet): MarkRenderGroup<AttributeSet> {
    this.getMarks().forEach((m) => m.updateTransform(attrName));
    return this;
  }
}

export function createRenderGroup<AttributeSet extends AttributeSetBase>(
  marks: Mark<AttributeSet>[]
): MarkRenderGroup<AttributeSet> {
  return new MarkRenderGroup(marks);
}
