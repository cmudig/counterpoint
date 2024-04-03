import {
  AnimationCurve,
  Animator,
  Interpolator,
  curveEaseInOut,
  interpolateTo,
} from './animator';
import { Attribute, AttributeDefinition, AttributeListener } from './attribute';
import { Advanceable } from './ticker';
import { TimeProvider, approxEquals } from './utils';

const ExcessiveUpdateThreshold = 5000;

interface MarkBase {}

export type MarkListener<T extends AttributeSetBase> = (
  mark: Mark<T>,
  attrName: keyof T,
  animated: boolean
) => void;

export type AttributeSetBase = { [key: string]: Attribute<any, any, any> };

export type SimpleAnimationOptions = {
  duration?: number;
  curve?: AnimationCurve;
  delay?: number;
};
export type AnimationOptions<ValueType> = SimpleAnimationOptions & {
  interpolator?: Interpolator<ValueType>;
};

/**
 * Base interface describing attributes that a mark can have.
 */
export interface MarkAttributes extends AttributeSetBase {
  x?: Attribute<number, number, any>;
  y?: Attribute<number, number, any>;
  alpha?: Attribute<number, number, any>;
}

export type MarkUpdateListener<
  AttributeSet extends AttributeSetBase,
  K extends keyof AttributeSet,
  AttributeType extends AttributeSet[K]
> = (
  mark: Mark<AttributeSet>,
  finalValue: AttributeType['value']
) => Promise<void> | undefined;

export type MarkEventListener<AttributeSet extends AttributeSetBase> = (
  mark: Mark<AttributeSet>,
  details: any,
  eventName: string
) => Promise<void> | undefined;

export type MarkGraphListener<T extends AttributeSetBase> = (
  mark: Mark<T>,
  edge: string,
  oldAdjacency: Mark<T>[],
  newAdjacency: Mark<T>[]
) => void;

/**
 * Represents initialization for an attribute set where the values can be
 * provided as Attributes, or simply as their values or value functions.
 */
export type ImplicitAttributeSet<AttributeSet extends AttributeSetBase> = {
  [K in keyof AttributeSet]?:
    | AttributeSet[K]['value']
    | AttributeSet[K]['valueFn']
    | AttributeDefinition<AttributeSet[K]['value']>
    | AttributeSet[K];
};

/**
 * An object representing something visually depicted, that is described by
 * one or more `Attribute`s.
 */
export class Mark<AttributeSet extends AttributeSetBase = MarkAttributes>
  implements MarkBase, Advanceable
{
  private _timeProvider: TimeProvider = null;
  public id: any;
  public attributes: AttributeSet;
  private _listeners: MarkListener<AttributeSet>[] = [];
  private _graphListeners: MarkGraphListener<AttributeSet>[] = [];
  private _defaultDuration: number = 1000;
  private _defaultCurve: AnimationCurve = curveEaseInOut;
  private _changedLastTick: boolean = false;

  // named edges
  private _adjacency: { [key: string]: Set<Mark<AttributeSet>> } = {};
  // marks that have an edge to this mark
  private _reverseAdjacency: Set<Mark<AttributeSet>> = new Set();

  /** The object that this Mark represents. */
  public represented: any | undefined = undefined;

  private _updateListeners: {
    [key in keyof AttributeSet]?: MarkUpdateListener<
      AttributeSet,
      key,
      AttributeSet[key]
    >;
  } = {};
  private _eventListeners: {
    [key: string]: MarkEventListener<AttributeSet>;
  } = {};

  constructor(id: any, attributes: ImplicitAttributeSet<AttributeSet>) {
    this.id = id;
    if (attributes === undefined)
      console.error(
        `Mark constructor requires an ID and an object defining attributes`
      );
    let attribs = {} as AttributeSet;
    Object.keys(attributes).forEach(
      <K extends keyof AttributeSet>(attrName: K) => {
        let attrib = new Attribute(
          Object.assign(
            Object.assign(
              {},
              attributes[attrName] instanceof Attribute
                ? attributes[attrName]
                : new Attribute(attributes[attrName])
            ),
            {
              computeArg: this,
            }
          )
        );
        attrib.addListener((a, animated) =>
          this._attributesChanged(attrName, animated)
        );
        attribs[attrName] = attrib as AttributeSet[K];
      }
    );
    this.attributes = attribs;
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
  configure(opts: {
    animationDuration?: number;
    animationCurve?: AnimationCurve;
  }): Mark<AttributeSet> {
    if (opts.animationDuration !== undefined)
      this._defaultDuration = opts.animationDuration;
    if (opts.animationCurve !== undefined)
      this._defaultCurve = opts.animationCurve;
    return this;
  }

  onUpdate<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K,
    action: MarkUpdateListener<AttributeSet, K, AttributeType>
  ): Mark<AttributeSet> {
    this._updateListeners[attrName] = action;
    return this;
  }

  onEvent(
    eventName: string,
    action: MarkEventListener<AttributeSet>
  ): Mark<AttributeSet> {
    this._eventListeners[eventName] = action;
    return this;
  }

  /**
   * Sends an event to the mark and runs its event listener if it has one.
   *
   * @param eventName The name of the event
   * @param details A details object to pass to the event listener
   * @returns a Promise if the event listener for this event name returns a Promise,
   *  otherwise nothing
   */
  dispatch(
    eventName: string,
    details: any = undefined
  ): Promise<void> | undefined {
    if (!!this._eventListeners[eventName]) {
      return this._eventListeners[eventName](this, details, eventName);
    }
  }

  addListener(listener: MarkListener<AttributeSet>): Mark<AttributeSet> {
    this._listeners.push(listener);
    return this;
  }

  removeListener(listener: MarkListener<AttributeSet>): Mark<AttributeSet> {
    let idx = this._listeners.indexOf(listener);
    if (idx >= 0) this._listeners = this._listeners.splice(idx, 1);
    return this;
  }

  addGraphListener(
    listener: MarkGraphListener<AttributeSet>
  ): Mark<AttributeSet> {
    this._graphListeners.push(listener);
    return this;
  }

  removeGraphListener(
    listener: MarkGraphListener<AttributeSet>
  ): Mark<AttributeSet> {
    let idx = this._graphListeners.indexOf(listener);
    if (idx >= 0) this._graphListeners = this._graphListeners.splice(idx, 1);
    return this;
  }

  private _attributesChanged(attrName: keyof AttributeSet, animated: boolean) {
    this._changedLastTick = true;
    this._listeners.forEach((l) => l(this, attrName, animated));
    if (!!this._updateListeners[attrName])
      this._updateListeners[attrName](this, this.attributes[attrName].future());
  }

  setTimeProvider(timeProvider: TimeProvider): Mark<AttributeSet> {
    this._timeProvider = timeProvider;
    Object.values(this.attributes).forEach((attr) =>
      attr.setTimeProvider(this._timeProvider)
    );
    return this;
  }

  /**
   * Modifies the mark to indicate that it represents the given object. The value
   * will be stored in the `represented` property.
   *
   * @param rep The object that this mark represents
   * @return this Mark
   */
  representing(rep: any): Mark<AttributeSet> {
    this.represented = rep;
    return this;
  }

  // Warning system to detect when an attribute is being listed as animated
  // for no reason
  private framesWithUpdate: number = 0;

  /**
   * Advances the time of the animations by the given number of msec, and
   * returns whether or not a redraw is needed.
   *
   * @param dt the number of milliseconds between this call and the previous
   *    call to advance(). If not passed, the mark's time provider will be used
   *    to compute the current time.
   * @returns True if any mark attribute has been updated, or false otherwise.
   */
  advance(dt: number | undefined = undefined): boolean {
    let updated = false;
    Object.values(this.attributes).forEach((attr) => {
      if (attr.advance(dt)) updated = true;
    });
    if (updated) {
      this.framesWithUpdate += 1;
      if (this.framesWithUpdate > ExcessiveUpdateThreshold) {
        console.warn('Marks are being updated excessively!');
      }
      this._changedLastTick = true;
      return true;
    }
    this.framesWithUpdate = 0;
    this._changedLastTick = false;
    return false;
  }

  /**
   * Instantaneously sets the value of an attribute, either taking the new
   * provided value or re-computing the value.
   *
   * @param attrName Attribute name to update.
   * @param newValue The new value of the attribute, or undefined if the
   *  attribute should recompute its value using its value function.
   */
  setAttr<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K,
    newValue: AttributeType['value'] | undefined = undefined
  ): Mark<AttributeSet> {
    let attr = this.attributes[attrName] as AttributeType;
    if (attr === undefined)
      console.error(`No attribute named '${String(attrName)}'`);
    let oldValue = attr.last();
    if (newValue === undefined) attr.compute();
    else attr.set(newValue);

    if (!approxEquals(oldValue, attr.data()))
      this._listeners.forEach((l) => l(this, attrName, false));
    return this;
  }

  /**
   * Gets the (potentially transformed) value of an attribute.
   *
   * @param attrName Name of the attribute to retrieve.
   * @returns The value of the attribute
   *
   * * @see Attribute.get
   */
  attr<
    K extends keyof AttributeSet,
    AttributeType extends AttributeSet[K],
    T extends Boolean
  >(
    attrName: K,
    transformed: T = true as T
  ): T extends true
    ? ReturnType<AttributeType['get']>
    : ReturnType<AttributeType['getUntransformed']> {
    if (!this.attributes[attrName]) {
      console.error(`No attribute named '${String(attrName)}'`);
    }
    if (transformed) return (this.attributes[attrName] as AttributeType).get();
    else return (this.attributes[attrName] as AttributeType).getUntransformed();
  }

  /**
   * Gets the true data value (non-animated) for an attribute.
   *
   * @param attrName Name of the attribute to retrieve.
   * @returns The non-animated value of the attribute
   *
   * @see Attribute.data
   */
  data<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K
  ): AttributeType['value'] {
    if (this.attributes[attrName] === undefined)
      console.error(`No attribute named '${String(attrName)}'`);
    return (this.attributes[attrName] as AttributeType).data();
  }

  /**
   * Marks that the transform has changed for the given attribute.
   *
   * @param attrName Name of the attribute for which to update the transform.
   * @returns this mark
   *
   * @see Attribute.updateTransform
   */
  updateTransform<K extends keyof AttributeSet>(
    attrName: K
  ): Mark<AttributeSet> {
    if (this.attributes[attrName] === undefined)
      console.error(`No attribute named '${String(attrName)}'`);
    (this.attributes[attrName] as Attribute<any, any, any>).updateTransform();
    return this;
  }

  animateTo<
    K extends keyof AttributeSet,
    AttributeType extends AttributeSet[K]
  >(
    attrName: K,
    finalValue:
      | AttributeType['value']
      | ((computeArg: AttributeType['computeArg']) => AttributeType['value']),
    options: SimpleAnimationOptions = {}
  ): Mark<AttributeSet> {
    if (!this.attributes.hasOwnProperty(attrName)) {
      console.error(`No attribute named '${String(attrName)}'`);
      return this;
    }

    if (typeof finalValue === 'function') {
      // set all the value functions and animate computed
      (this.attributes[attrName] as AttributeType).set(finalValue);
      this.animate(attrName, {
        duration: options.duration,
        curve: options.curve,
      });
      return this;
    }

    let duration =
      options.duration === undefined ? this._defaultDuration : options.duration;
    let curve =
      options.curve === undefined ? this._defaultCurve : options.curve;

    let animation = new Animator(
      interpolateTo(finalValue),
      duration,
      curve
    ).withDelay(options.delay || 0);

    (this.attributes[attrName] as AttributeType).animate(animation);
    return this;
  }

  animate<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K,
    options:
      | AnimationOptions<AttributeType['value']>
      | Animator<AttributeType['value']> = {}
  ): Mark<AttributeSet> {
    if (!this.attributes.hasOwnProperty(attrName)) {
      console.error(
        `Attempting to animate undefined property ${String(attrName)}`
      );
      return this;
    }

    let animation: Animator<AttributeType['value']>;

    if (options instanceof Animator) {
      animation = options as Animator<AttributeType['value']>;
    } else if (options.interpolator !== undefined) {
      let interpolator = options.interpolator;
      animation = new Animator(
        interpolator,
        options.duration !== undefined
          ? options.duration
          : this._defaultDuration,
        options.curve !== undefined ? options.curve : this._defaultCurve
      ).withDelay(options.delay || 0);
    } else {
      let newValue = this.data(attrName);
      if (
        !approxEquals(newValue, this.attributes[attrName].last()) ||
        !approxEquals(newValue, this.attributes[attrName].future())
      ) {
        let duration =
          options.duration !== undefined
            ? options.duration
            : this._defaultDuration;
        let curve =
          options.curve !== undefined ? options.curve : this._defaultCurve;
        animation = new Animator(
          interpolateTo(newValue),
          duration,
          curve
        ).withDelay(options.delay || 0);
      } else return this;
    }

    (this.attributes[attrName] as AttributeType).animate(animation);
    return this;
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
  wait<K extends keyof AttributeSet>(
    attrNames: K | K[],
    rejectOnCancel: boolean = true
  ): Promise<any> {
    let names: K[] = Array.isArray(attrNames) ? attrNames : [attrNames];
    return Promise.all(
      names.map((name) => this.attributes[name].wait(rejectOnCancel))
    );
  }

  /**
   * @param attrNames the attributes to check for changes in (if none provided,
   *  checks all attributes)
   *
   * @returns whether or not this mark changed value (due to animation or
   * other updates) on the last call to `advance`
   */
  changed<K extends keyof AttributeSet>(
    attrNames: K | K[] | undefined = undefined
  ): boolean {
    if (attrNames === undefined) return this._changedLastTick;
    if (Array.isArray(attrNames))
      return (
        this._changedLastTick &&
        attrNames.some((attr) => this.attributes[attr].changed())
      );

    return this._changedLastTick && this.attributes[attrNames as K].changed();
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
  copy(
    id: any,
    newValues: ImplicitAttributeSet<AttributeSet> = {}
  ): Mark<AttributeSet> {
    return new Mark<AttributeSet>(id, {
      ...this.attributes,
      ...Object.fromEntries(
        Object.entries(newValues).map(([attrName, newVal]) => {
          if (newVal instanceof Attribute) return [attrName, newVal];
          else if (typeof newVal === 'function')
            return [
              attrName,
              this.attributes[attrName].copy({ valueFn: newVal }),
            ];
          else if (newVal.value !== undefined || newVal.valueFn !== undefined)
            return [attrName, new Attribute(newVal)];
          return [attrName, this.attributes[attrName].copy({ value: newVal })];
        })
      ),
    });
  }

  /**
   * Gets the marks associated with following the given edge name from this mark.
   * @param edge the name of the edge to follow
   */
  adj(edge: string): Mark<AttributeSet>[];
  /**
   * Sets the marks associated with the given edge name from this mark.
   * @param edge the name of the edge to define or edit
   * @param newMarks an array of marks to set at that edge, overwriting any
   *  previous marks on that edge
   */
  adj(edge: string, newMarks: Mark<AttributeSet>[] | Mark<AttributeSet>): void;
  adj(
    edge: string,
    newMarks: Mark<AttributeSet>[] | Mark<AttributeSet> | undefined = undefined
  ): void | Mark<AttributeSet>[] {
    if (newMarks !== undefined) {
      // setting the adjacency
      let markArray = Array.isArray(newMarks) ? newMarks : [newMarks];
      let oldAdj = this._adjacency[edge] ?? new Set();
      this._graphListeners.forEach((l) =>
        l(this, edge, Array.from(oldAdj), markArray)
      );
      oldAdj.forEach((m) => m._removeEdgeFrom(this));
      this._adjacency[edge] = new Set(markArray);
      markArray.forEach((m) => m._addEdgeFrom(this));
      return;
    }

    return Array.from(this._adjacency[edge] ?? new Set());
  }

  /**
   * Returns the marks that have an edge to this mark.
   */
  sourceMarks(): Mark<AttributeSet>[] {
    return Array.from(this._reverseAdjacency);
  }

  /**
   * TODO make sure if you remove a source edge but another named edge to the
   * same mark exists, it's not removed from _reverseAdjacency!!
   *
   * Tells the mark that it has an edge from the given mark.
   * @param sourceMark the mark that has an edge to this mark
   */
  _addEdgeFrom(sourceMark: Mark<AttributeSet>): Mark<AttributeSet> {
    this._reverseAdjacency.add(sourceMark);
    return this;
  }

  /**
   * Tells the mark that it no longer has an edge from the given mark.
   * @param sourceMark the mark that has no longer has an edge to this mark
   */
  _removeEdgeFrom(sourceMark: Mark<AttributeSet>): Mark<AttributeSet> {
    this._reverseAdjacency.delete(sourceMark);
    return this;
  }
}

type AttributeConstructorShorthand<
  AttributeSet extends AttributeSetBase,
  K extends keyof AttributeSet
> =
  | ((val: AttributeSet[K]['value']) => AttributeSet[K])
  | ((val: AttributeSet[K]['valueFn']) => AttributeSet[K]);
export type AttributeSetConstructor<AttributeSet extends AttributeSetBase> = {
  [K in keyof AttributeSet]:
    | AttributeSet[K]
    | AttributeConstructorShorthand<AttributeSet, K>;
};

/**
 * Defines a new type of mark with a shorthand constructor function.
 *
 * @param constructorFn A function that takes an ID
 */
export function defineMark<
  AttributeSet extends AttributeSetBase = MarkAttributes
>(
  constructorFn:
    | ((
        id: any,
        values?: ImplicitAttributeSet<AttributeSet>
      ) => Mark<AttributeSet> | AttributeSet)
    | AttributeSetConstructor<AttributeSet>
) {
  let initializer: (
    id: any,
    values?: ImplicitAttributeSet<AttributeSet>
  ) => Mark<AttributeSet> | AttributeSet;
  if (typeof initializer === 'function')
    initializer = constructorFn as (
      id: any,
      values?: ImplicitAttributeSet<AttributeSet>
    ) => Mark<AttributeSet> | AttributeSet;
  else {
    let initObj = constructorFn as AttributeSetConstructor<AttributeSet>;
    initializer = (id: any, values?: ImplicitAttributeSet<AttributeSet>) =>
      new Mark<AttributeSet>(
        id,
        Object.fromEntries(
          Object.entries(initObj).map(([field, initFn]) => {
            if (typeof initFn === 'function')
              return [field, initFn(values[field])];
            else if (!!values[field]) {
              if (values[field] instanceof Attribute)
                return [field, values[field]];
              return [field, new Attribute(values[field])];
            } else return [field, initFn.copy()];
          })
        ) as AttributeSet
      );
  }
  return {
    create: (id: any, values?: ImplicitAttributeSet<AttributeSet>) => {
      let result = initializer(id, values);
      if (result instanceof Mark) return result;
      return new Mark(id, result);
    },
  };
}
