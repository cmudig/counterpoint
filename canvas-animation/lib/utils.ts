export function approxEquals(obj1: any, obj2: any): boolean {
  if (typeof obj1 == 'number' && typeof obj2 == 'number') {
    return Math.abs((obj1 as number) - (obj2 as number)) <= 0.001;
  }
  return obj1 == obj2;
}

export type TimeProvider = (() => number) & { advance: (dt: number) => void };

export function makeTimeProvider(): TimeProvider {
  var currentTime = 0;
  let fn = function () {
    return currentTime;
  };
  return Object.assign(fn, {
    advance: (dt: number) => {
      currentTime += dt;
    },
  });
}

/**
 * Enumerates all methods of an object.
 * @param obj the object to inspect
 * @returns a `Set` containing all methods that can be called on the object
 */
export function getAllMethodNames(obj: any): Set<string | symbol> {
  let methods = new Set<string | symbol>();
  while ((obj = Reflect.getPrototypeOf(obj))) {
    let keys = Reflect.ownKeys(obj);
    keys.forEach((k) => methods.add(k));
  }
  return methods;
}

/**
 * A utility to create "deferred" actions such as callbacks, allowing for
 * async/await syntax.
 *
 * source: https://stackoverflow.com/a/34637436/2152503
 */
export class Deferred<T> {
  promise: Promise<T>;
  info: any;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: any) => void;

  constructor(info: any = undefined) {
    this.info = info;
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

/**
 * Pads a value range outward.
 *
 * @param extent The minimum and maximum of the value range to pad
 * @param padding The amount to pad outward in both directions, or an array of
 *  amounts to specify left and right separately
 * @returns The new padded value range
 */
export function padExtent(
  extent: [number, number],
  padding: number | [number, number]
): [number, number] {
  if (typeof padding === 'number') {
    return [extent[0] - (padding as number), extent[1] + (padding as number)];
  }
  return [extent[0] - padding[0], extent[1] + padding[1]];
}

/**
 * Computes the bounding box over a set of coordinates.
 *
 * @param points Set of points to compute the bounding box over
 * @returns Bounds in the x and y directions
 */
export function boundingBox(points: { x: number; y: number }[]): {
  x: [number, number];
  y: [number, number];
} {
  let minX = 1e12;
  let maxX = -1e12;
  let minY = 1e12;
  let maxY = -1e12;
  points.forEach((point) => {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  });
  return { x: [minX, maxX], y: [minY, maxY] };
}
