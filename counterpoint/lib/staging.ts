import { AttributeSetBase, Mark } from './mark';

export type StageManagerCallback<MarkType> = {
  /**
   * Initialize an element for an entry animation. This method should not be
   * asynchronous.
   *
   * @param element The element to initialize.
   */
  initialize?(element: MarkType): void;
  /**
   * Modify an element after it has been added to the render group so that it
   * is visible (e.g. by animating the alpha).
   *
   * @param element The element to show
   *
   * @returns a Promise that resolves when the animation would be completed.
   *  If no animation is performed, the method can simply be declared `async`
   *  and return as normal.
   */
  enter?(element: MarkType): Promise<void> | void;
  /**
   * Modify an element after it has been added to the render group so that it
   * is invisible (e.g. by animating the alpha).
   *
   * @param element The element to show
   *
   * @returns a Promise that resolves when the animation would be completed.
   *  If no animation is performed, the method can simply be declared `async`
   *  and return as normal.
   */
  exit?(element: MarkType): Promise<void> | void;
};

/**
 * Describes the state of a mark as it transitions from being added to the
 * render group and removed from it.
 */
export enum StagingState {
  Waiting = 'waiting',
  Entering = 'entering',
  Visible = 'visible',
  Exiting = 'exiting',
  Completed = 'completed',
}

/**
 * Describes actions that should be performed on a mark.
 */
export enum StagingAction {
  Show = 'show',
  Hide = 'hide',
}

/**
 * A class that coordinates the entry and exit of marks. The stage manager handles
 * the complexity of adding marks to the canvas and removing them at the right
 * time, allowing you to simply call the `{@link show}` or `{@link hide}` method
 * to specify when an element should be rendered. Additionally, show and hide
 * calls can be configured to execute on the next run loop using the {@link defer}
 * property, so a call to `show` can be canceled by an equivalent call to `hide`.
 */
export class StageManager<AttributeSet extends AttributeSetBase> {
  private _callbacks: Required<StageManagerCallback<Mark<AttributeSet>>>;
  // States are keyed by the mark objects themselves, meaning that if the user
  // chooses, they can have multiple marks with the same ID (i.e. exiting one
  // version and entering another version).
  private markStates: Map<Mark<AttributeSet>, StagingState> = new Map();
  // Marks by ID allows the user to retrieve existing marks and reuse them if
  // desired.
  private marksByID: Map<any, Mark<AttributeSet>> = new Map();
  private queuedAnimations: Map<Mark<AttributeSet>, StagingAction> = new Map();
  private _flushTimer: number | null = null;

  // The set of marks that are currently being animated
  public animatingMarks: Set<Mark<AttributeSet>> = new Set();

  /**
   * Whether or not to defer changes in presence/absence of marks to the
   * next frame. The default is `false`.
   */
  public defer: boolean = false;

  /**
   * Whether or not to save marks that have been removed. This may cause high
   * memory usage if marks are frequently added and removed.
   */
  public saveExitedMarks: boolean = false;

  constructor(callbacks: StageManagerCallback<Mark<AttributeSet>> = {}) {
    this._callbacks = {
      initialize: callbacks.initialize || (() => {}),
      enter: callbacks.enter || (() => {}),
      exit: callbacks.exit || (() => {}),
    };
  }

  /**
   * Tells the stage manager that the given set of marks is already visible.
   *
   * @param marks The marks that are already visible
   *
   * @returns This stage manager object
   */
  setVisibleMarks(marks: Mark<AttributeSet>[]): StageManager<AttributeSet> {
    marks.forEach((m) => {
      this.markStates.set(m, StagingState.Visible);
      this.marksByID.set(m.id, m);
    });
    return this;
  }

  /**
   * Sets options on the stage manager.
   *
   * @param opts Options to configure. Currently the only option supported is
   *  `{@link defer}`.
   * @returns This stage manager object with the options updated
   */
  configure(
    opts: { defer?: boolean; saveExitedMarks?: boolean } = {}
  ): StageManager<AttributeSet> {
    this.defer = opts.defer ?? this.defer;
    this.saveExitedMarks = opts.saveExitedMarks ?? this.saveExitedMarks;
    return this;
  }

  onInitialize(cb: StageManagerCallback<Mark<AttributeSet>>['initialize']) {
    this._callbacks.initialize = cb || (() => {});
  }

  onEnter(cb: StageManagerCallback<Mark<AttributeSet>>['enter']) {
    this._callbacks.enter = cb || (() => {});
  }

  onExit(cb: StageManagerCallback<Mark<AttributeSet>>['exit']) {
    this._callbacks.exit = cb || (() => {});
  }

  /**
   * Performs the action for the mark with the given ID, and calls the
   * appropriate callbacks.
   */
  _perform(element: Mark<AttributeSet>, action: StagingAction) {
    if (!element) return;

    if (action == StagingAction.Show) {
      if (this.markStates.get(element) === StagingState.Visible) return;
      this.markStates.set(element, StagingState.Entering);
      this.marksByID.set(element.id, element);
      let result = this._callbacks.enter(element);
      if (!!result && result instanceof Promise) {
        this.animatingMarks.add(element);
        result.then(
          () => {
            if (
              this.markStates.has(element) &&
              this.markStates.get(element) == StagingState.Entering
            ) {
              this.markStates.set(element, StagingState.Visible);
              this.animatingMarks.delete(element);
            }
          },
          () => {
            this.animatingMarks.delete(element);
          }
        );
      } else {
        this.markStates.set(element, StagingState.Visible);
      }
    } else if (action == StagingAction.Hide) {
      let existingState = this.markStates.get(element) ?? null;

      if (
        existingState === StagingState.Waiting ||
        existingState === StagingState.Completed
      )
        return;
      this.markStates.set(element, StagingState.Exiting);
      this.marksByID.set(element.id, element);
      let result = this._callbacks.exit(element);
      if (!!result && result instanceof Promise) {
        this.animatingMarks.add(element);
        result.then(
          () => {
            // Resolve if it's still gone, otherwise reject
            if (
              this.markStates.has(element) &&
              this.markStates.get(element) == StagingState.Exiting
            ) {
              if (this.saveExitedMarks) {
                this.markStates.set(element, StagingState.Completed);
              } else {
                this.marksByID.delete(element.id);
                this.markStates.delete(element);
                this.animatingMarks.delete(element);
              }
            }
          },
          () => {
            this.animatingMarks.delete(element);
          }
        );
      } else {
        if (this.saveExitedMarks) {
          this.markStates.set(element, StagingState.Completed);
        } else {
          this.marksByID.delete(element.id);
          this.markStates.delete(element);
        }
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
  _enqueue(element: Mark<AttributeSet>, action: StagingAction): boolean {
    let state = this.markStates.get(element);
    if (state === undefined) return false;

    if (action == StagingAction.Show) {
      if (state == StagingState.Entering || state == StagingState.Visible)
        return false;
      this.markStates.set(element, StagingState.Entering);
    } else if (action == StagingAction.Hide) {
      if (state == StagingState.Exiting || state == StagingState.Completed)
        return false;
      this.markStates.set(element, StagingState.Exiting);
    } else {
      console.error('Unknown action enqueued:', action);
    }

    if (this.defer) {
      this.queuedAnimations.set(element, action);
      if (!this._flushTimer) {
        this._flushTimer = window.setTimeout(() => this._flush(), 0);
      }
    } else {
      this._perform(element, action);
    }
    return true;
  }

  /**
   * Performs all actions that have been queued and clears the queue.
   */
  _flush() {
    this._flushTimer = null;
    this.queuedAnimations.forEach((action, mark) => {
      this._perform(mark, action);
    });
    this.queuedAnimations.clear();
  }

  /**
   * Attempts to show a given mark.
   *
   * @param id The ID of the mark to show, which should contain sufficient
   *    information to uniquely describe the mark.
   * @returns `true` if the mark was not visible and will be made visible, or
   *    `false` otherwise.
   */
  show(element: Mark<AttributeSet>): boolean {
    if (!this.markStates.has(element)) {
      this._callbacks.initialize(element);
      this.markStates.set(element, StagingState.Waiting);
      this.marksByID.set(element.id, element);
    }

    return this._enqueue(element, StagingAction.Show);
  }

  /**
   * Attempts to hide a mark with the given ID.
   *
   * @param id The ID of the mark to hide.
   * @returns `true` if the mark was visible and will be made invisible and
   *    subsequently destroyed, or `false` otherwise.
   */
  hide(element: Mark<AttributeSet>): boolean {
    if (!this.markStates.has(element)) {
      return false;
    }
    return this._enqueue(element, StagingAction.Hide);
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
  get(id: any, visibleOnly: boolean = false): Mark<AttributeSet> | undefined {
    let mark = this.marksByID.get(id);
    if (!!mark && visibleOnly) {
      let state = this.markStates.get(mark);
      if (state === StagingState.Exiting || state === StagingState.Completed)
        return undefined;
    }
    return mark;
  }

  forEach(
    callbackfn: (value: Mark<AttributeSet>, index: number) => void | any
  ) {
    let index = 0;
    this.markStates.forEach((state, mark) => {
      if (
        state === StagingState.Entering ||
        state === StagingState.Visible ||
        state === StagingState.Exiting
      ) {
        callbackfn(mark, index);
        index++;
      }
    });
  }

  /**
   * Returns all marks that this stage manager knows about.
   */
  getMarks(): Mark<AttributeSet>[] {
    return Array.from(this.markStates.keys());
  }

  /**
   * Returns the number of marks that this stage manager knows about.
   */
  count(): number {
    return this.markStates.size;
  }

  /**
   * Returns all marks that are either waiting, entering, or visible.
   */
  getVisibleMarks(): Mark<AttributeSet>[] {
    return Array.from(this.markStates.keys()).filter((m) =>
      [
        StagingState.Waiting,
        StagingState.Entering,
        StagingState.Visible,
      ].includes(this.markStates.get(m)!)
    );
  }
}
