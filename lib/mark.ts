import { Animator } from './animator';
import { Attribute } from './attribute';
import { TimeProvider } from './utils';

const ExcessiveUpdateThreshold = 5000;

interface MarkBase {}

export type AttributeSetBase = { [key: string]: Attribute<any, any, MarkBase> };

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
  protected attributes: AttributeSet;

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
        attribs[attrName] = attrib as AttributeSet[K];
      }
    );
    this.attributes = attribs;
  }

  setTimeProvider(timeProvider: TimeProvider) {
    this._timeProvider = timeProvider;
    Object.values(this.attributes).forEach((attr) =>
      attr.setTimeProvider(this._timeProvider)
    );
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
   * Instantaneously sets the value of an attribute.
   *
   * @param attrName Attribute name to update.
   * @param newValue The new value of the attribute.
   */
  setAttr<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K,
    newValue: AttributeType['value']
  ) {
    // Set the value in case there will be an animation from this point
    (this.attributes[attrName] as AttributeType).set(newValue);
  }

  attr<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K
  ): ReturnType<AttributeType['get']> {
    if (!this.attributes[attrName]) {
      return undefined;
    }
    return (this.attributes[attrName] as AttributeType).get();
  }

  // Gets the true data value (non-animated)
  data<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K
  ): AttributeType['value'] {
    return (this.attributes[attrName] as AttributeType).data();
  }

  // Marks that the transform has changed for the given attribute
  updateTransform<K extends keyof AttributeSet>(attrName: K) {
    (this.attributes[attrName] as Attribute<any, any, any>).updateTransform();
  }

  // Animations should have an evaluate()
  // method that takes as parameter an initial value and a time
  // delta from start (in msec) and returns a new value for the
  // attribute, and a duration property in msec
  animate<K extends keyof AttributeSet, AttributeType extends AttributeSet[K]>(
    attrName: K,
    animation: Animator<AttributeType['value']>
  ) {
    if (!this.attributes.hasOwnProperty(attrName)) {
      console.error(
        `Attempting to animate undefined property ${String(attrName)}`
      );
      return;
    }

    (this.attributes[attrName] as AttributeType).animate(animation);
  }
}
