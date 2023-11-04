import Color from 'colorjs.io';

export type AnimationCurve = (t: number) => number;

export function curveLinear(t: number): number {
  return t;
}

export function curveEaseInOut(t: number): number {
  return t * t * (3.0 - 2.0 * t);
}

/**
 * A type representing an interpolator that can be called with two arguments, the
 * initial value of the interpolation and the interpolant (a number ranging from
 * 0 to 1). The function returns a value of the same type as the initial value
 * representing the interpolated value.
 */
export interface Interpolator<T> {
  interpolate: (initialValue: T, interpolant: number) => T;
}

/**
 * A type representing an interpolator that has a definite final value.
 */
export interface DeterminateInterpolator<T> extends Interpolator<T> {
  finalValue: T;
}

export type MixingFunction<T> = (v1: T, p1: number, v2: T, p2: number) => T;

export function numericalMixingFunction<T>(
  v1: T,
  p1: number,
  v2: T,
  p2: number
): T {
  return ((v1 as number) * p1 + (v2 as number) * p2) as T;
}

export function colorMixingFunction(
  v1: Color,
  p1: number,
  v2: Color,
  p2: number
): string {
  let result = [
    Math.round((v1.r * p1 + v2.r * p2) * 255),
    Math.round((v1.g * p1 + v2.g * p2) * 255),
    Math.round((v1.b * p1 + v2.b * p2) * 255),
  ];
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

export function numericalArrayMixingFunction<T>(
  v1: T,
  p1: number,
  v2: T,
  p2: number
): T {
  return (v1 as any[]).map((subv1, i) =>
    numericalMixingFunction(subv1, p1, (v2 as any[])[i], p2)
  ) as T;
}

export function autoMixingFunction<T>(
  finalValue: T
): (v1: T, p1: number, v2: T, p2: number) => T {
  if (typeof finalValue === 'number') {
    return numericalMixingFunction;
  } else if (typeof finalValue === 'string') {
    // store colors in a cache associated with the function to save on repeated
    // parsing of the color values
    let cache: { [key: string]: any } = {};
    return (v1: T, p1: number, v2: T, p2: number): T => {
      if (!cache[v1 as string])
        cache[v1 as string] = new Color(v1 as string).srgb;
      if (!cache[v2 as string])
        cache[v2 as string] = new Color(v2 as string).srgb;
      return colorMixingFunction(
        cache[v1 as string],
        p1,
        cache[v2 as string],
        p2
      ) as T;
    };
  } else if (Array.isArray(finalValue)) {
    return numericalArrayMixingFunction;
  }
  return (v1: T, p1: number, v2: T, p2: number): T => (p1 < 1 ? v1 : v2);
}

/**
 * A simple interpolator that applies a mixing function to interpolate between
 * an initial value and the given final value.
 * @param finalValue The destination value of the interpolation.
 * @param mixingFunction A function that takes a pair of values of the
 *  interpolating data type and proportions of each one, and returns a mixed
 *  value. The default is a linear interpolation and assumes the inputs are numbers.
 * @returns A determinate interpolator that can be called to execute the interpolation.
 */
export function interpolateTo<T>(
  finalValue: T,
  mixingFunction: MixingFunction<T> | undefined = undefined
): DeterminateInterpolator<T> {
  if (mixingFunction === undefined)
    mixingFunction = autoMixingFunction(finalValue);
  return {
    finalValue,
    interpolate: (initialValue: T, interpolant: number) => {
      return mixingFunction(
        initialValue,
        1 - Math.min(interpolant, 1.0),
        finalValue,
        Math.min(interpolant, 1.0)
      );
    },
  };
}

/**
 * Interpolator that interpolates to a potentially changing final value.
 *
 * @param finalValueFn A function that takes no arguments and returns the final
 *  value. This is called every time the interpolator is evaluated.
 * @param mixingFunction A function that takes a pair of values of the
 *  interpolating data type and proportions of each one, and returns a mixed
 *  value. The default is a linear interpolation and assumes the inputs are numbers.
 * @returns An interpolator that can be called to execute the interpolation.
 */
export function interpolateToFunction<T>(
  finalValueFn: () => T,
  mixingFunction: MixingFunction<T> | undefined = undefined
): Interpolator<T> {
  if (mixingFunction === undefined)
    mixingFunction = autoMixingFunction(finalValueFn());
  return {
    interpolate: (initialValue: T, interpolant: number) =>
      mixingFunction(
        initialValue,
        1 - Math.min(interpolant, 1.0),
        finalValueFn(),
        Math.min(interpolant, 1.0)
      ),
  };
}

/**
 * Interpolator that interpolates along a sequence of values keyframe-style,
 * with each value in the sequence taking up an equal amount of "width" in the
 * interpolator.
 *
 * @param path A sequence of values that will be interpolated between. For a path
 *  with n values numbered 1 through n, each value x_i will be hit at t = i / n.
 * @param mixingFunction A function that takes a pair of values of the
 *  interpolating data type and proportions of each one, and returns a mixed
 *  value. The default is a linear interpolation and assumes the inputs are numbers.
 * @returns An interpolator that can be called to execute the interpolation.
 */
export function interpolateAlongPath<T>(
  path: T[],
  mixingFunction: MixingFunction<T> | undefined = undefined
): Interpolator<T> {
  if (mixingFunction === undefined)
    mixingFunction = autoMixingFunction(path[0]);
  return {
    interpolate: (initialValue: T, interpolant: number) => {
      let interpIndex = Math.min(interpolant, 1.0) * (path.length - 1) - 1;
      let stepInterpolant = Math.min(
        interpIndex - Math.floor(interpIndex),
        1.0
      );
      if (interpIndex < 0.0)
        return mixingFunction(
          initialValue,
          1 - stepInterpolant,
          path[0],
          stepInterpolant
        );
      else
        return mixingFunction(
          path[Math.floor(interpIndex)],
          1 - stepInterpolant,
          path[Math.floor(interpIndex) + 1],
          stepInterpolant
        );
    },
  };
}

/**
 * A type that represents an interpolation to a potentially variable final value
 * using an animation curve.
 */
export class Animator<T> {
  duration = 0;
  finalValue: T | undefined = undefined;
  interpolator: Interpolator<T> = null;
  curve: AnimationCurve;

  constructor(
    interpolator: Interpolator<T>,
    duration = 1000,
    curve: AnimationCurve = curveLinear
  ) {
    this.duration = duration;
    if (interpolator.hasOwnProperty('finalValue')) {
      this.finalValue = (interpolator as DeterminateInterpolator<T>).finalValue;
    } else {
      this.finalValue = undefined;
    }
    this.interpolator = interpolator;

    this.curve = curve;
  }

  evaluate(initialValue: T, dt: number) {
    let t = this.curve(this.duration > 0 ? dt / this.duration : 1.0);
    return this.interpolator.interpolate(initialValue, t);
  }

  withDelay(delay: number): Animator<T> {
    if (!delay) return this;
    return new DelayedAnimator<T>(this, delay);
  }
}

/**
 * Implements a basic ease-in-out animation with a final value. This is required
 * for preloadable animations, which cannot be used with indeterminate
 * interpolations.
 */
export class PreloadableAnimator<T> extends Animator<T> {
  constructor(finalValue: T, duration: number) {
    super(interpolateTo(finalValue), duration, curveEaseInOut);
  }
}

/**
 * Defines an animator that begins after a specified delay.
 */
class DelayedAnimator<T> extends Animator<T> {
  /**
   * Time before the animation should start, in milliseconds.
   */
  public delay: number;

  constructor(animator: Animator<T>, delay: number) {
    super(animator.interpolator, animator.duration + delay, animator.curve);
    this.delay = delay;
  }

  evaluate(initialValue: T, dt: number): T {
    if (dt <= this.delay) return initialValue;
    return super.evaluate(
      initialValue,
      ((dt - this.delay) * this.duration) / (this.duration - this.delay)
    );
  }
}

/**
 * Shorthand for a basic interpolating animation with a given duration and
 * easing function.
 *
 * @param finalValue The final value to animate to
 * @param duration The duration of the animation in milliseconds
 * @param curve The animation curve or easing function (default is linear)
 * @returns An `{@link Animator}` object representing the animation
 */
export function basicAnimationTo<T>(
  finalValue: T,
  duration: number = 1000,
  curve: AnimationCurve = curveLinear
): Animator<T> {
  return new Animator(interpolateTo(finalValue), duration, curve);
}
