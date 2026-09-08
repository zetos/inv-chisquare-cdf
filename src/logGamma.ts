export function logGamma(x: number): number {
  if (typeof x !== 'number' || Number.isNaN(x)) {
    throw new Error('The value is not a number.');
  }

  if (x === 1 || x === 2) {
    return 0;
  }

  if (x === 0) {
    return Infinity;
  }

  if (x < 0) {
    throw new Error('The value is a negative number.');
  }

  const coefficients = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let series = 1.000000000190015;
  let denominator = x;
  let temporary = denominator + 5.5;
  temporary -= (denominator + 0.5) * Math.log(temporary);

  for (const coefficient of coefficients) {
    series += coefficient / ++denominator;
  }

  return Math.log((2.5066282746310005 * series) / x) - temporary;
}
