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
