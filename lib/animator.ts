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
export type Interpolator<T> = (initialValue: T, interpolant: number) => T;

// TODO convert this to a subtype of Interpolator with an attached finalValue property
export type DeterminateInterpolator<T> = {
  finalValue: T;
  interpolator: Interpolator<T>;
};

export type MixingFunction<T> = (v1: T, p1: number, v2: T, p2: number) => T;

export function numericalMixingFunction<T>(
  v1: T,
  p1: number,
  v2: T,
  p2: number
): T {
  return ((v1 as number) * p1 + (v2 as number) * p2) as T;
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
  mixingFunction: MixingFunction<T> = numericalMixingFunction
): DeterminateInterpolator<T> {
  return {
    finalValue,
    interpolator: (initialValue: T, interpolant: number) => {
      if (typeof initialValue != 'number' || typeof finalValue != 'number') {
        return finalValue;
      }
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
  mixingFunction: MixingFunction<T> = numericalMixingFunction
): Interpolator<T> {
  return (initialValue: T, interpolant: number) =>
    mixingFunction(
      initialValue,
      1 - Math.min(interpolant, 1.0),
      finalValueFn(),
      Math.min(interpolant, 1.0)
    );
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
  mixingFunction: MixingFunction<T> = numericalMixingFunction
): Interpolator<T> {
  return (initialValue: T, interpolant: number) => {
    let interpIndex = Math.min(interpolant, 1.0) * (path.length - 1) - 1;
    let stepInterpolant = Math.min(interpIndex - Math.floor(interpIndex), 1.0);
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
    interpolator: Interpolator<T> | DeterminateInterpolator<T>,
    duration = 1000,
    curve: AnimationCurve = curveLinear
  ) {
    this.duration = duration;
    if (interpolator.hasOwnProperty('finalValue')) {
      this.finalValue = (interpolator as DeterminateInterpolator<T>).finalValue;
      this.interpolator = (
        interpolator as DeterminateInterpolator<T>
      ).interpolator;
    } else {
      this.finalValue = undefined;
      this.interpolator = interpolator as Interpolator<T>;
    }

    this.curve = curve;
  }

  evaluate(initialValue: T, dt: number) {
    let t = this.curve(this.duration > 0 ? dt / this.duration : 1.0);
    console.log(t, initialValue, this.interpolator(initialValue, t));
    return this.interpolator(initialValue, t);
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
