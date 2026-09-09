import { logGamma } from './logGamma.js';

/**
 * Computes the lower regularized incomplete gamma function `P(a, x)`.
 *
 * The result is the lower incomplete gamma function evaluated at `a` and `x`,
 * divided by `Gamma(a)`.
 *
 * @param a - Positive shape parameter of the gamma function.
 * @param x - Non-negative upper integration limit.
 * @returns The regularized value, normally between 0 and 1.
 * @throws {Error} If an argument is not a number or is `NaN`.
 * @throws {Error} If `a <= 0` or `x < 0`.
 *
 * @example
 * ```js
 * import { regLowGamma } from 'inv-chisquare-cdf';
 *
 * const probability = regLowGamma(5, 5); // ~0.5595067149347875
 * ```
 */
export function regLowGamma(a: number, x: number): number {
  if (typeof a !== 'number' || Number.isNaN(a)) {
    throw new Error('The value in param a is not a number.');
  }

  if (typeof x !== 'number' || Number.isNaN(x)) {
    throw new Error('The value in param x is not a number.');
  }

  if (a <= 0) {
    throw new Error('The number in param a is equal or less tham 0.');
  }

  if (x < 0) {
    throw new Error('The number in param x is a negative number.');
  }

  const logGammaOfA = logGamma(a);
  let b = x + 1 - a;
  let c = 1 / 1.0e-30;
  let d = 1 / b;
  let h = d;
  let iteration = 1;
  const maximumIterations = -~(
    Math.log(a >= 1 ? a : 1 / a) * 8.5 +
    a * 0.4 +
    17
  );

  if (x < a + 1) {
    let sum = 1 / a;
    let delta = sum;

    for (let ap = a; iteration <= maximumIterations; iteration++) {
      delta *= x / ++ap;
      sum += delta;
    }

    return sum * Math.exp(-x + a * Math.log(x) - logGammaOfA);
  }

  for (; iteration <= maximumIterations; iteration++) {
    const an = -iteration * (iteration - a);
    b += 2;
    d = an * d + b;
    c = b + an / c;
    d = 1 / d;
    h *= d * c;
  }

  return 1 - h * Math.exp(-x + a * Math.log(x) - logGammaOfA);
}
