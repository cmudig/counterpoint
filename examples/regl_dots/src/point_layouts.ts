export function gaussianRandom(mean: number = 0, stdev: number = 1): number {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

export function getCoordinate(
  layout: 'random' | 'gaussian' | 'gradient',
  attrName: 'x' | 'y'
): number {
  if (layout == 'random') return Math.random() * 2 - 1;
  if (layout == 'gaussian') return gaussianRandom(0, 0.5);
  if (layout == 'gradient') {
    if (attrName == 'x') return Math.random() * 2 - 1;
    else if (attrName == 'y')
      return (Math.pow(Math.random() * 10, 3) / 1000) * 2 - 1;
  }
  return 0;
}
