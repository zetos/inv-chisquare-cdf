const LANCZOS_COEFFICIENTS = [
  76.18009172947146, -86.50532032941677, 24.01409824083091,
  -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
] as const;

/**
 * Approximates the natural logarithm of the gamma function.
 *
 * At `x = 0`, where the gamma function has a pole, this function returns
 * `Infinity`.
 *
 * @param x - Non-negative argument at which to evaluate `log(Gamma(x))`.
 * @returns The natural logarithm of `Gamma(x)`, or `Infinity` when `x` is 0.
 * @throws {Error} If `x` is not a number, is `NaN`, or is negative.
 *
 * @example
 * ```js
 * import { logGamma } from 'inv-chisquare-cdf';
 *
 * const value = logGamma(5); // ~3.1780538303479453
 * ```
 */
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

  const shifted = x + 5.5;
  const temporary = shifted - (x + 0.5) * Math.log(shifted);
  const series = LANCZOS_COEFFICIENTS.reduce(
    (sum, coefficient, index) => sum + coefficient / (x + index + 1),
    1.000000000190015,
  );

  return Math.log((2.5066282746310005 * series) / x) - temporary;
}
