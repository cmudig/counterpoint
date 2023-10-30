import {
  Animator,
  basicAnimationTo,
  curveEaseInOut,
  interpolateTo,
} from './animator';
import { Attribute } from './attribute';
import { Mark, MarkAttributes } from './mark';
import {
  TimeProvider,
  boundingBox,
  makeTimeProvider,
  padExtent,
} from './utils';

export type ScalesOptions = {
  animationDuration?: number;
  padding?:
    | number
    | { top?: number; left?: number; right?: number; bottom?: number };
  minScale?: number;
  maxScale?: number;
};

type ReadWriteExtent = {
  (extent: [number, number]): LinearScale;
  (extent?: undefined): [number, number];
};

export type TransformInfo = {
  k?: number;
  kx?: number;
  ky?: number;
  x?: number;
  y?: number;
};

export type OutputTransformInfo = Required<TransformInfo>;

export type LinearScale = ((domainVal: number) => number) & {
  domain: ReadWriteExtent;
  range: ReadWriteExtent;
  invert(rangeVal: number): number;
};

/**
 * A class that manages a linked x and y scale.
 */
export class Scales {
  animationDuration: number = 1000;
  squareAspect: boolean = true;
  _xDomain: [number, number];
  _yDomain: [number, number];
  _xDExtent: number;
  _yDExtent: number;
  _xRange: [number, number];
  _yRange: [number, number];
  _xRExtent: number;
  _yRExtent: number;
  minScale: number;
  maxScale: number;

  private _xScaleFactor: Attribute<number> = new Attribute(1.0);
  private _yScaleFactor: Attribute<number> = new Attribute(1.0);
  private _translateX: Attribute<number> = new Attribute(0.0);
  private _translateY: Attribute<number> = new Attribute(0.0);
  xScale: LinearScale;
  yScale: LinearScale;

  timeProvider: TimeProvider = makeTimeProvider();

  controller: ScalesController | null = null;

  private _updatedNoAdvance: boolean = false;
  private listeners: ((scales: Scales) => void)[] = [];

  constructor(opts: ScalesOptions = {}) {
    this.xScale = Object.assign(
      (val: number): number => {
        let base =
          ((val - this._xDomain[0]) * this._xRExtent) / this._xDExtent +
          this._xRange[0];
        return base * this._xScaleFactor.get() + this._translateX.get();
      },
      {
        domain: ((
          extent: [number, number] | undefined = undefined
        ): LinearScale | [number, number] => {
          if (extent === undefined) return this._xDomain;
          this._xDomain = extent;
          this._xDExtent = this._xDomain[1] - this._xDomain[0];
          return this.xScale;
        }) as ReadWriteExtent,
        range: ((
          extent: [number, number] | undefined = undefined
        ): LinearScale | [number, number] => {
          if (extent === undefined) return this._xRange;
          this._xRange = extent;
          this._xRExtent = this._xRange[1] - this._xRange[0];
          return this.xScale;
        }) as ReadWriteExtent,
        invert: (val: number): number => {
          let base = (val - this._translateX.get()) / this._xScaleFactor.get();
          return (
            ((base - this._xRange[0]) * this._xDExtent) / this._xRExtent +
            this._xDomain[0]
          );
        },
      }
    );
    this.yScale = Object.assign(
      (val: number): number => {
        let base =
          ((val - this._yDomain[0]) * this._yRExtent) / this._yDExtent +
          this._yRange[0];
        return base * this._yScaleFactor.get() + this._translateY.get();
      },
      {
        domain: ((
          extent: [number, number] | undefined = undefined
        ): LinearScale | [number, number] => {
          if (extent === undefined) return this._yDomain;
          this._yDomain = extent;
          this._yDExtent = this._yDomain[1] - this._yDomain[0];
          return this.yScale;
        }) as ReadWriteExtent,
        range: ((
          extent: [number, number] | undefined = undefined
        ): LinearScale | [number, number] => {
          if (extent === undefined) return this._yRange;
          this._yRange = extent;
          this._yRExtent = this._yRange[1] - this._yRange[0];
          return this.yScale;
        }) as ReadWriteExtent,
        invert: (val: number): number => {
          let base = (val - this._translateY.get()) / this._yScaleFactor.get();
          return (
            ((base - this._yRange[0]) * this._yDExtent) / this._yRExtent +
            this._yDomain[0]
          );
        },
      }
    );
    this.xDomain([0, 1]);
    this.yDomain([0, 1]);
    this.xRange([0, 1]);
    this.yRange([0, 1]);
    this.configure(opts);
    this._xScaleFactor.setTimeProvider(this.timeProvider);
    this._yScaleFactor.setTimeProvider(this.timeProvider);
    this._translateX.setTimeProvider(this.timeProvider);
    this._translateY.setTimeProvider(this.timeProvider);
  }

  configure(opts: ScalesOptions = {}): Scales {
    this.animationDuration =
      opts.animationDuration !== undefined ? opts.animationDuration : 1000;
    this.minScale = opts.minScale !== undefined ? opts.minScale : 0.1;
    this.maxScale = opts.maxScale !== undefined ? opts.maxScale : 14.0;

    return this;
  }

  xDomain(extent: [number, number]): Scales;
  xDomain(extent: undefined): [number, number];
  xDomain(
    extent: [number, number] | undefined = undefined
  ): Scales | [number, number] {
    if (extent === undefined) return this.xScale.domain();
    this.xScale.domain(extent);
    return this;
  }

  yDomain(extent: [number, number]): Scales;
  yDomain(extent: undefined): [number, number];
  yDomain(
    extent: [number, number] | undefined = undefined
  ): Scales | [number, number] {
    if (extent === undefined) return this.yScale.domain();
    this.yScale.domain(extent);
    return this;
  }

  xRange(extent: [number, number]): Scales;
  xRange(extent: undefined): [number, number];
  xRange(
    extent: [number, number] | undefined = undefined
  ): Scales | [number, number] {
    if (extent === undefined) return this.xScale.range();
    this.xScale.range(extent);
    return this;
  }

  yRange(extent: [number, number]): Scales;
  yRange(extent: undefined): [number, number];
  yRange(
    extent: [number, number] | undefined = undefined
  ): Scales | [number, number] {
    if (extent === undefined) return this.yScale.range();
    this.yScale.range(extent);
    return this;
  }

  /**
   * Changes the domains of the scales so that the aspect ratio is square.
   *
   * @returns this Scales instance
   */
  makeSquareAspect(): Scales {
    // Rescale one to the other based on whichever has the smallest scale factor
    let xScale = this._xRExtent / this._xDExtent;
    let yScale = this._yRExtent / this._yDExtent;
    if (xScale < yScale) {
      let yMid = (this._yDomain[0] + this._yDomain[1]) * 0.5;
      let newWidth = this._yRExtent / xScale;
      this.yDomain([yMid - newWidth * 0.5, yMid + newWidth * 0.5]);
    } else {
      let xMid = (this._xDomain[0] + this._xDomain[1]) * 0.5;
      let newWidth = this._xRExtent / yScale;
      this.xDomain([xMid - newWidth * 0.5, xMid + newWidth * 0.5]);
    }
    return this;
  }

  onUpdate(fn: (scales: Scales) => void): Scales {
    this.listeners.push(fn);
    return this;
  }

  isNeutral(): boolean {
    return (
      Math.abs(this._xScaleFactor.get() - 1.0) <= 0.01 &&
      Math.abs(this._yScaleFactor.get() - 1.0) <= 0.01 &&
      Math.abs(this._translateX.get()) <= 5.0 &&
      Math.abs(this._translateY.get()) <= 5.0
    );
  }

  advance(dt: number | undefined = undefined): boolean {
    this.timeProvider.advance(dt);
    let updated: boolean[] = [
      this._xScaleFactor.advance(dt),
      this._yScaleFactor.advance(dt),
      this._translateX.advance(dt),
      this._translateY.advance(dt),
    ];
    if (updated.some((v) => v)) {
      this._updatedNoAdvance = false;
      this.listeners.forEach((fn) => fn(this));
      return true;
    }
    if (!this._updatedNoAdvance) {
      this.listeners.forEach((fn) => fn(this));
      this._updatedNoAdvance = true;
    }
    return false;
  }

  // Increases the scale by the given amount, optionally centering by the given
  // point in transformed pixel space
  scaleBy(
    ds: number | [number, number],
    centerPoint: [number, number] | null = null
  ): Scales {
    this.unfollow();

    let tx = this._translateX.get();
    let ty = this._translateY.get();
    let sx = this._xScaleFactor.get();
    let sy = this._yScaleFactor.get();

    if (!centerPoint) {
      centerPoint = [
        (this.xRange[0] + this.xRange[1]) * 0.5,
        (this.yRange[0] + this.yRange[1]) * 0.5,
      ];
    } else {
      centerPoint = [(centerPoint[0] - tx) / sx, (centerPoint[1] - ty) / sy];
    }

    let dsx = typeof ds === 'number' ? ds : ds[0];
    let dsy = typeof ds === 'number' ? ds : ds[1];
    let newScaleFactor = sx + dsx;
    if (newScaleFactor <= this.maxScale && newScaleFactor >= this.minScale) {
      this._xScaleFactor.set(newScaleFactor);
      this._translateX.set(tx - dsx * centerPoint[0]);
    }
    newScaleFactor = sy + dsy;
    if (newScaleFactor <= this.maxScale && newScaleFactor >= this.minScale) {
      this._yScaleFactor.set(newScaleFactor);
      this._translateY.set(ty - dsy * centerPoint[1]);
    }

    return this;
  }

  // Translates the scales by the given amount
  translateBy(dx: number, dy: number): Scales {
    this.unfollow();
    this._translateX.set(this._translateX.get() + dx);
    this._translateY.set(this._translateY.get() + dy);
    return this;
  }

  // These parameters tell the scales how to transform the coordinates after
  // they have been converted into pixel space.
  transform(): OutputTransformInfo;
  transform(scaleInfo: TransformInfo): Scales;
  transform(scaleInfo: TransformInfo, animated: boolean): Scales;
  transform(
    scaleInfo: TransformInfo | undefined = undefined,
    animated: boolean | undefined = false
  ): Scales | OutputTransformInfo {
    if (scaleInfo !== undefined) {
      this.unfollow();

      if (animated) {
        let animator = (val: number) =>
          new Animator(
            interpolateTo(val),
            this.animationDuration,
            curveEaseInOut
          );
        if (scaleInfo.kx !== undefined)
          this._xScaleFactor.animate(animator(scaleInfo.kx));
        else if (scaleInfo.k !== undefined)
          this._xScaleFactor.animate(animator(scaleInfo.k));
        if (scaleInfo.ky !== undefined)
          this._yScaleFactor.animate(animator(scaleInfo.ky));
        else if (scaleInfo.k !== undefined)
          this._yScaleFactor.animate(animator(scaleInfo.k));

        if (scaleInfo.x !== undefined)
          this._translateX.animate(animator(scaleInfo.x));
        if (scaleInfo.y !== undefined)
          this._translateY.animate(animator(scaleInfo.y));
      } else {
        if (scaleInfo.kx !== undefined) this._xScaleFactor.set(scaleInfo.kx);
        else if (scaleInfo.k !== undefined) this._xScaleFactor.set(scaleInfo.k);
        if (scaleInfo.ky !== undefined) this._yScaleFactor.set(scaleInfo.ky);
        else if (scaleInfo.k !== undefined) this._yScaleFactor.set(scaleInfo.k);
        if (scaleInfo.x !== undefined) this._translateX.set(scaleInfo.x);
        if (scaleInfo.y !== undefined) this._translateY.set(scaleInfo.y);
      }

      return this;
    } else {
      let kx = this._xScaleFactor.last();
      let ky = this._yScaleFactor.last();
      let ret = {
        k: (kx + ky) * 0.5,
        kx,
        ky,
        x: this._translateX.last(),
        y: this._translateY.last(),
      };
      return ret;
    }
  }

  reset(animated: boolean = false): Scales {
    return this.transform({ k: 1, x: 0, y: 0 }, animated);
  }

  /**
   * Animates the scale and translate factors to show the given marks.
   *
   * @param marks An array of marks to zoom to.
   * @param animated Whether to animate the transition (default `true`)
   *
   * @returns this `Scales` instance
   */
  zoomTo(controller: ScalesController, animated: boolean = true): Scales {
    return this.transform(controller.transform(this), animated);
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
  follow(controller: ScalesController, animated: boolean = true): Scales {
    this.controller = controller;
    this._xScaleFactor.set(() => {
      let t = this.controller.transform(this);
      return t.kx || t.k;
    });
    this._yScaleFactor.set(() => {
      let t = this.controller.transform(this);
      return t.ky || t.k;
    });
    this._translateX.set(() => this.controller.transform(this).x);
    this._translateY.set(() => this.controller.transform(this).y);
    if (animated) {
      let animator = (val: number) =>
        new Animator(
          interpolateTo(val),
          this.animationDuration,
          curveEaseInOut
        );
      this._xScaleFactor.animate(animator(this._xScaleFactor.data()));
      this._yScaleFactor.animate(animator(this._yScaleFactor.data()));
      this._translateX.animate(animator(this._translateX.data()));
      this._translateY.animate(animator(this._translateY.data()));
    }

    return this;
  }

  /**
   * Removes the controller that the scales are currently following.
   *
   * @returns this `Scales` instance
   */
  unfollow(): Scales {
    if (this.controller != null) {
      this._xScaleFactor.set(this._xScaleFactor.get());
      this._yScaleFactor.set(this._yScaleFactor.get());
      this._translateX.set(this._translateX.get());
      this._translateY.set(this._translateY.get());
    }
    this.controller = null;
    return this;
  }
}

export interface ScalesController {
  transform(scales: Scales): TransformInfo;
}

/**
 * A class that directs a `Scales` instance to follow positional coordinates
 * for a set of marks. Centering a single mark and/or following a set of marks
 * are supported.
 *
 * It is important to make sure that the `Scales` instance has its domain and
 * range correctly set according to the data and the viewport, respectively,
 * for the zooming calculations to work.
 */
export class MarkFollower<AttributeSet extends MarkAttributes>
  implements ScalesController
{
  marks: Mark<AttributeSet>[];
  centerMark: Mark<AttributeSet> | undefined;
  xAttr: keyof AttributeSet;
  yAttr: keyof AttributeSet;
  padding: number; // padding around followed mark locations in pixels
  transformCoordinates: boolean;
  lastCompute:
    | {
        time: number;
        scales: Scales;
        result: TransformInfo;
      }
    | undefined = undefined;

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
  constructor(
    marks: Mark<AttributeSet>[],
    opts: {
      centerMark?: Mark<AttributeSet>;
      xAttr?: keyof AttributeSet;
      yAttr?: keyof AttributeSet;
      padding?: number;
      transformCoordinates?: boolean;
    } = {}
  ) {
    this.marks = marks;
    this.centerMark =
      opts.centerMark !== undefined ? opts.centerMark : undefined;
    if (!!this.centerMark && !this.marks.includes(this.centerMark))
      this.marks = [...this.marks, this.centerMark];
    this.xAttr = opts.xAttr !== undefined ? opts.xAttr : 'x';
    this.yAttr = opts.yAttr !== undefined ? opts.yAttr : 'y';
    this.padding = opts.padding !== undefined ? opts.padding : 20;
    this.transformCoordinates =
      opts.transformCoordinates !== undefined
        ? opts.transformCoordinates
        : false;
  }

  transform(scales: Scales): TransformInfo {
    if (
      !!this.lastCompute &&
      this.lastCompute.scales === scales &&
      this.lastCompute.time == scales.timeProvider()
    ) {
      return this.lastCompute.result;
    }

    let points = this.marks.map((m) => this._getMarkLocation(m));
    let newCenterX: number,
      newCenterY: number,
      newScaleX: number,
      newScaleY: number;
    let fixedCenter =
      this.centerMark !== undefined
        ? this._getMarkLocation(this.centerMark)
        : null;
    let currentTransform = scales.transform();

    let { x: xExtent, y: yExtent } = boundingBox(points);
    if (!!fixedCenter) {
      // Adjust the extents so that the center point is centered
      let xDist = Math.max(
        xExtent[1] - fixedCenter.x,
        fixedCenter.x - xExtent[0]
      );
      let yDist = Math.max(
        yExtent[1] - fixedCenter.y,
        fixedCenter.y - yExtent[0]
      );
      xExtent = [fixedCenter.x - xDist, fixedCenter.x + xDist];
      yExtent = [fixedCenter.y - yDist, fixedCenter.y + yDist];
    }

    let xScale: number | undefined;
    let yScale: number | undefined;
    // only update scales if there is a nonzero bounding box in that direction
    if (Math.abs(xExtent[1] - xExtent[0]) > 0) {
      xScale =
        (scales._xRExtent - this.padding * 2) /
        (xExtent[1] - xExtent[0]) /
        (scales._xRExtent / scales._xDExtent);
    } else xScale = currentTransform.kx;
    if (Math.abs(yExtent[1] - yExtent[0]) > 0) {
      yScale =
        (scales._yRExtent - this.padding * 2) /
        (yExtent[1] - yExtent[0]) /
        (scales._yRExtent / scales._yDExtent);
    } else yScale = currentTransform.ky;

    // Calculate new scale x and y preserving existing aspect ratio
    let aspectRatio = currentTransform.ky / currentTransform.kx;
    xScale = Math.min(xScale, scales.maxScale);
    yScale = Math.min(yScale, scales.maxScale);
    if (yScale < xScale * aspectRatio) {
      newScaleX = yScale / aspectRatio;
      newScaleY = yScale;
    } else {
      newScaleX = xScale;
      newScaleY = xScale * aspectRatio;
    }

    // in domain space
    newCenterX = (xExtent[0] + xExtent[1]) * 0.5;
    newCenterY = (yExtent[0] + yExtent[1]) * 0.5;

    // in range space
    newCenterX =
      ((newCenterX - scales._xDomain[0]) * scales._xRExtent) /
        scales._xDExtent +
      scales._xRange[0];
    newCenterY =
      ((newCenterY - scales._yDomain[0]) * scales._yRExtent) /
        scales._yDExtent +
      scales._yRange[0];

    // translated from center to origin and accounting for scale
    let newTranslateX =
      -newCenterX * newScaleX + (scales._xRange[0] + scales._xRange[1]) * 0.5;
    let newTranslateY =
      -newCenterY * newScaleY + (scales._yRange[0] + scales._yRange[1]) * 0.5;

    let result = {
      kx: newScaleX,
      ky: newScaleY,
      x: newTranslateX,
      y: newTranslateY,
    };
    this.lastCompute = { scales, time: scales.timeProvider(), result };
    return result;
  }

  _getMarkLocation(mark: Mark<AttributeSet>): { x: number; y: number } {
    let loc = {
      x: (this.transformCoordinates
        ? mark.attr(this.xAttr)
        : mark.attributes[this.xAttr].getUntransformed()) as number,
      y: (this.transformCoordinates
        ? mark.attr(this.yAttr)
        : mark.attributes[this.yAttr].getUntransformed()) as number,
    };
    return loc;
  }
}

/**
 * Creates a scales controller that centers the given mark in the frame, while
 * keeping the zoom scale the same.
 * @param mark The mark to center on
 * @param opts Options for the mark follower
 */
export function centerOn<AttributeSet extends MarkAttributes>(
  mark: Mark<AttributeSet>,
  opts: {
    xAttr?: keyof AttributeSet;
    yAttr?: keyof AttributeSet;
    padding?: number;
    transformCoordinates?: boolean;
  } = {}
): MarkFollower<AttributeSet> {
  return new MarkFollower([mark], { centerMark: mark, ...opts });
}

/**
 * Creates a scales controller that keeps the given set of marks in frame.
 * @param marks The marks to place in the viewport
 * @param opts Options for the mark follower
 */
export function markBox<AttributeSet extends MarkAttributes>(
  marks: Mark<AttributeSet>[],
  opts: {
    xAttr?: keyof AttributeSet;
    yAttr?: keyof AttributeSet;
    padding?: number;
    transformCoordinates?: boolean;
  } = {}
): MarkFollower<AttributeSet> {
  return new MarkFollower(marks, { ...opts });
}
