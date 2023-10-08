import {
  AnimationCurve,
  Animator,
  Interpolator,
  curveEaseInOut,
  interpolateTo,
} from './animator';
import { Attribute, AttributeListener } from './attribute';
import { TimeProvider, approxEquals } from './utils';

const ExcessiveUpdateThreshold = 5000;

interface MarkBase {}

export type MarkListener<T extends AttributeSetBase> = (
  mark: Mark<T>,
  attrName: keyof T,
  animated: boolean
) => void;

export type AttributeSetBase = { [key: string]: Attribute<any, any, MarkBase> };

type SimpleAnimationOptions = { duration?: number; curve?: AnimationCurve };
type AnimationOptions<ValueType> = SimpleAnimationOptions & {
  interpolator?: Interpolator<ValueType>;
};

/**
 * Base interface describing attributes that a mark can have.
 */
export interface MarkAttributes extends AttributeSetBase {
  x?: Attribute<number, number, MarkBase>;
  y?: Attribute<number, number, MarkBase>;
  alpha?: Attribute<number, number, MarkBase>;
}

/**
 * An object representing something visually depicted, that is described by
 * one or more `Attribute`s.
 */
export class Mark<AttributeSet extends AttributeSetBase = MarkAttributes>
  implements MarkBase
{
  private _timeProvider: TimeProvider = null;
  public id: any;
  public attributes: AttributeSet;
  private _listeners: MarkListener<AttributeSet>[] = [];
  private _defaultDuration: number = 1000;
  private _defaultCurve: AnimationCurve = curveEaseInOut;

  constructor(id: any, attributes: AttributeSet) {
    this.id = id;
    let attribs = {} as AttributeSet;
    Object.keys(attributes).forEach(
      <K extends keyof AttributeSet>(attrName: K) => {
        let attrib = new Attribute(
          Object.assign(Object.assign({}, attributes[attrName]), {
            computeArg: this,
          })
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

  addListener(listener: MarkListener<AttributeSet>): Mark<AttributeSet> {
    this._listeners.push(listener);
    return this;
  }

  removeListener(listener: MarkListener<AttributeSet>): Mark<AttributeSet> {
    let idx = this._listeners.indexOf(listener);
    if (idx >= 0) this._listeners = this._listeners.splice(idx, 1);
    return this;
  }

  private _attributesChanged(attrName: keyof AttributeSet, animated: boolean) {
    this._listeners.forEach((l) => l(this, attrName, animated));
  }

  setTimeProvider(timeProvider: TimeProvider): Mark<AttributeSet> {
    this._timeProvider = timeProvider;
    Object.values(this.attributes).forEach((attr) =>
      attr.setTimeProvider(this._timeProvider)
    );
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
      return true;
    }
    this.framesWithUpdate = 0;
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
  attr<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K
  ): ReturnType<AttributeType['get']> {
    if (!this.attributes[attrName]) {
      return undefined;
    }
    return (this.attributes[attrName] as AttributeType).get();
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
    if (typeof finalValue === 'function') {
      // set all the value functions and animate computed
      (this.attributes[attrName] as AttributeType).set(finalValue);
      this.animate(attrName, {
        duration: options.duration,
        curve: options.curve,
      });
      return this;
    }

    if (!this.attributes.hasOwnProperty(attrName)) {
      console.error(
        `Attempting to animate undefined property ${String(attrName)}`
      );
      return this;
    }

    let duration =
      options.duration === undefined ? this._defaultDuration : options.duration;
    let curve =
      options.curve === undefined ? this._defaultCurve : options.curve;

    let animation = new Animator(interpolateTo(finalValue), duration, curve);

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
      if (!!interpolator) {
        animation = new Animator(
          interpolator,
          options.duration !== undefined
            ? options.duration
            : this._defaultDuration,
          options.curve !== undefined ? options.curve : this._defaultCurve
        );
      }
    } else {
      let newValue = this.data(attrName);
      if (
        !approxEquals(newValue, this.attributes[attrName].last()) ||
        !approxEquals(newValue, this.attributes[attrName].future())
      ) {
        animation = new Animator(
          interpolateTo(newValue),
          options.duration !== undefined
            ? options.duration
            : this._defaultDuration,
          options.curve !== undefined ? options.curve : this._defaultCurve
        );
      } else return this;
    }

    (this.attributes[attrName] as AttributeType).animate(animation);
    return this;
  }
}
