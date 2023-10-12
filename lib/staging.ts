import { AttributeSetBase, Mark } from './mark';
import { MarkRenderGroup } from './rendergroup';

/**
 *
 * *   - create(id, info):
 *   - show(element): Show the given element and return a Promise that resolves
 *       after the animation would be completed.
 *   - hide(element): Hide the given element and return a Promise that resolves
 *       after the animation would be completed.
 *   - destroy(element): Destroy the element.
 */
export type StageManagerCallback<MarkType> = {
  /**
   * Create an element based on the given ID and info. The returned element
   * will be added to the stage manager's render group.
   *
   * @param id The ID of the element to create.
   * @param info An object representing information about the element that was
   *  provided to the stage manager when the {@link StageManager.show} method
   *  was called.
   *
   * @returns the element to render
   */
  create(id: any, info: any): MarkType;
  /**
   * Modify an element after it has been added to the render group so that it
   * is visible (e.g. by animating the alpha).
   *
   * @param element The element to show
   * @param info An object representing information about the element that was
   *  provided to the stage manager when the {@link StageManager.show} method
   *  was called.
   *
   * @returns a Promise that resolves when the animation would be completed.
   *  If no animation is performed, the method can simply be declared `async`
   *  and return as normal.
   */
  show?(element: MarkType, info: any): Promise<void>;
  /**
   * Modify an element after it has been added to the render group so that it
   * is invisible (e.g. by animating the alpha).
   *
   * @param element The element to show
   * @param info An object representing information about the element that was
   *  provided to the stage manager when the {@link StageManager.show} method
   *  was called.
   *
   * @returns a Promise that resolves when the animation would be completed.
   *  If no animation is performed, the method can simply be declared `async`
   *  and return as normal.
   */
  hide?(element: MarkType, info: any): Promise<void>;
  /**
   * Perform any necessary logic after an element has been destroyed and
   * removed from the render group.
   *
   * @param id The ID of the element that was destroyed
   * @param info An object representing information about the element that was
   *  provided to the stage manager when the {@link StageManager.show} method
   *  was called.
   */
  destroy?(id: any, info: any): void;
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
}

/**
 * Describes actions that should be performed on a mark.
 */
export enum StagingAction {
  Show = 'show',
  Hide = 'hide',
}

/**
 * Stores a mark and its associated state.
 */
export type StagedMark<MarkType> = {
  element: MarkType;
  info: any;
  state: StagingState;
  lastState: StagingState;
};

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
  private pool: Map<any, StagedMark<Mark<AttributeSet>>> = new Map();
  private queuedAnimations: Map<any, StagingAction> = new Map();
  private _flushTimer: number | null = null;
  private _renderGroup: MarkRenderGroup<AttributeSet> | null = null;

  /**
   * Whether or not to defer changes in presence/absence of marks to the
   * next frame. The default is `false`.
   */
  public defer: boolean = false;

  constructor(callbacks: StageManagerCallback<Mark<AttributeSet>>) {
    if (!callbacks.create)
      console.error('StageManager requires a create callback');
    this._callbacks = {
      create: callbacks.create,
      show: callbacks.show || (async () => {}),
      hide: callbacks.hide || (async () => {}),
      destroy: callbacks.destroy || (() => {}),
    };
  }

  /**
   * Sets options on the stage manager.
   *
   * @param opts Options to configure. Currently the only option supported is
   *  `{@link defer}`.
   * @returns This stage manager object with the options updated
   */
  configure(opts: { defer?: boolean } = {}): StageManager<AttributeSet> {
    if (opts.defer !== undefined) this.defer = opts.defer;
    return this;
  }

  /**
   * Attaches this stage manager to a render group so that it can add and remove
   * marks before showing and after hiding them.
   *
   * @param renderGroup the render group to add and remove marks from
   * @returns this stage manager
   */
  attach(
    renderGroup: MarkRenderGroup<AttributeSet> | null
  ): StageManager<AttributeSet> {
    this._renderGroup = renderGroup;
    return this;
  }

  /**
   * Performs the action for the mark with the given ID, and calls the
   * appropriate callbacks.
   */
  _perform(id: any, action: StagingAction) {
    let item = this.pool.get(id);
    if (!item || !item.element) return;

    if (action == StagingAction.Show) {
      if (item.lastState == StagingState.Visible) return;
      item.lastState = StagingState.Entering;
      this._callbacks.show(item.element, item.info).then(
        () => {
          if (item.state == StagingState.Entering) {
            item.state = StagingState.Visible;
            item.lastState = StagingState.Visible;
          }
        },
        () => {}
      );
    } else if (action == StagingAction.Hide) {
      if (
        item.lastState == StagingState.Exiting ||
        item.lastState == StagingState.Waiting
      )
        return;
      item.lastState = StagingState.Exiting;
      this._callbacks.hide(item.element, item.info).then(
        () => {
          // Resolve if it's still gone, otherwise reject
          let item = this.pool.get(id);
          if (!!item && item.lastState == StagingState.Exiting) {
            if (!!this._renderGroup) this._renderGroup.removeMark(item.element);
            this._callbacks.destroy(id, item.info);
            this.pool.delete(id);
          }
        },
        () => {}
      );
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
  _enqueue(id: any, action: StagingAction): boolean {
    let item = this.pool.get(id);
    if (!item.element) return false;
    if (action == StagingAction.Show) {
      if (
        item.state == StagingState.Entering ||
        item.state == StagingState.Visible
      )
        return false;
      item.state = StagingState.Entering;
    } else if (action == StagingAction.Hide) {
      if (item.state == StagingState.Exiting) return false;
      item.state = StagingState.Exiting;
    } else {
      console.error('Unknown action enqueued:', action);
    }

    if (this.defer) {
      this.queuedAnimations.set(id, action);
      if (!this._flushTimer) {
        this._flushTimer = window.setTimeout(() => this._flush(), 0);
      }
    } else {
      this._perform(id, action);
    }
    return true;
  }

  /**
   * Performs all actions that have been queued and clears the queue.
   */
  _flush() {
    this._flushTimer = null;
    this.queuedAnimations.forEach((action, id) => {
      this._perform(id, action);
    });
    this.queuedAnimations.clear();
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
  show(id: any, infoCB: any | ((id: any) => any) = undefined) {
    if (!this.pool.has(id)) {
      let info =
        infoCB != undefined
          ? typeof infoCB === 'function'
            ? infoCB(id)
            : infoCB
          : null;
      let element = this._callbacks.create(id, info);
      if (!!this._renderGroup) this._renderGroup.addMark(element);
      this.pool.set(id, {
        element: element,
        info,
        state: StagingState.Waiting,
        lastState: StagingState.Waiting,
      });
    }

    return this._enqueue(id, StagingAction.Show);
  }

  /**
   * Attempts to hide a mark with the given ID.
   *
   * @param id The ID of the mark to hide.
   * @returns `true` if the mark was visible and will be made invisible and
   *    subsequently destroyed, or `false` otherwise.
   */
  hide(id: any): boolean {
    if (!this.pool.has(id)) {
      return false;
    }
    return this._enqueue(id, StagingAction.Hide);
  }

  /**
   * Retrieves the stored information for the mark with the given ID
   * @param id the ID of the mark to look up
   * @returns the stored information for this mark, or `null` if the mark is not
   *  currently visible, entering, or exiting.
   */
  getInfo(id: any): any {
    if (!this.pool.has(id)) return null;
    return this.pool.get(id).info;
  }

  /**
   * Retrieves the mark element with the given ID
   * @param id the ID of the mark to look up
   * @returns the mark element if it is visible or being staged, or `null`
   *    otherwise
   */
  getElement(id: any): Mark<AttributeSet> | null {
    if (!this.pool.has(id)) return null;
    return this.pool.get(id).element;
  }

  /**
   * @returns a `Map` where the keys are mark IDs, and the values are instances
   *   of `{@link StagedMark}` representing the mark elements and their current
   *   and previous states
   *
   * @see getAllVisible
   */
  getAll(): Map<any, StagedMark<Mark<AttributeSet>>> {
    return new Map(this.pool);
  }

  /**
   * @returns an array of the mark IDs that are currently visible or being
   *    staged (including those that are exiting)
   * @see getAllVisibleIDs
   */
  getAllIDs(): any[] {
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
  getAllVisible(): Map<any, StagedMark<Mark<AttributeSet>>> {
    let result = new Map();
    for (let [key, value] of this.pool) {
      if (
        (value.state == StagingState.Visible ||
          value.state == StagingState.Entering) &&
        !!value.element
      )
        result.set(key, value);
    }
    return result;
  }

  /**
   * @returns an array of the mark IDs that are currently visible or entering
   * @see getAllIDs
   */
  getAllVisibleIDs(): any[] {
    return Array.from(this.pool.keys()).filter(
      (key) =>
        (this.pool.get(key).state == StagingState.Visible ||
          this.pool.get(key).state == StagingState.Entering) &&
        !!this.pool.get(key).element
    );
  }

  /**
   * @returns whether the mark with the given ID is visible or entering
   */
  isVisible(id: any): boolean {
    return (
      this.pool.has(id) &&
      (this.pool.get(id).state == StagingState.Visible ||
        this.pool.get(id).state == StagingState.Entering)
    );
  }
}
