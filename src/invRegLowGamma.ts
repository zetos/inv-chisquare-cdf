import { logGamma } from './logGamma.js';
import { regLowGamma } from './regLowGamma.js';

/**
 * Approximates the inverse of the lower regularized incomplete gamma function.
 *
 * For `0 < p < 1`, returns `x` such that `regLowGamma(a, x)` is approximately
 * `p`. Values of `p <= 0` return 0; values of `p >= 1` return a finite upper
 * sentinel because the mathematical inverse approaches infinity.
 *
 * @param p - Regularized probability. Use a value between 0 and 1 for an inverse.
 * @param a - Positive shape parameter of the gamma function.
 * @returns The approximate inverse value for `p`, or the boundary value described above.
 * @throws {Error} If an argument is not a number or is `NaN`.
 *
 * @example
 * ```js
 * import { invRegLowGamma } from 'inv-chisquare-cdf';
 *
 * const x = invRegLowGamma(0.5, 2); // ~1.678346990016661
 * ```
 */
export function invRegLowGamma(p: number, a: number): number {
  if (typeof p !== 'number' || Number.isNaN(p)) {
    throw new Error('The value in param "p" is not an number.');
  }

  if (typeof a !== 'number' || Number.isNaN(a)) {
    throw new Error('The value in param "a" is not an number.');
  }

  if (p >= 1) {
    return Math.max(100, a + 100 * Math.sqrt(a));
  }

  if (p <= 0) {
    return 0;
  }

  const a1 = a - 1;
  const epsilon = 1e-8;
  const logGammaOfA = logGamma(a);
  let inverseRegLowGamma: number;
  let iterationParameters: { afac: number; lna1: number } | undefined;

  if (a > 1) {
    const lna1 = Math.log(a1);
    const afac = Math.exp(a1 * (lna1 - 1) - logGammaOfA);
    const probabilityTail = p < 0.5 ? p : 1 - p;
    const t = Math.sqrt(-2 * Math.log(probabilityTail));
    const approximation =
      (p < 0.5 ? -1 : 1) *
      ((2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t);

    inverseRegLowGamma = Math.max(
      1e-3,
      a * Math.pow(1 - 1 / (9 * a) - approximation / (3 * Math.sqrt(a)), 3),
    );
    iterationParameters = { afac, lna1 };
  } else {
    const threshold = 1 - a * (0.253 + a * 0.12);
    inverseRegLowGamma =
      p < threshold
        ? Math.pow(p / threshold, 1 / a)
        : 1 - Math.log(1 - (p - threshold) / (1 - threshold));
  }

  for (let iteration = 0; iteration < 12; iteration++) {
    if (inverseRegLowGamma <= 0) {
      return 0;
    }

    const error = regLowGamma(a, inverseRegLowGamma) - p;
    const derivative =
      iterationParameters === undefined
        ? Math.exp(
            -inverseRegLowGamma +
              a1 * Math.log(inverseRegLowGamma) -
              logGammaOfA,
          )
        : iterationParameters.afac *
          Math.exp(
            -(inverseRegLowGamma - a1) +
              a1 * (Math.log(inverseRegLowGamma) - iterationParameters.lna1),
          );
    const correction = error / derivative;
    const step =
      correction /
      (1 - 0.5 * Math.min(1, correction * ((a - 1) / inverseRegLowGamma - 1)));
    const candidate = inverseRegLowGamma - step;
    inverseRegLowGamma = candidate <= 0 ? 0.5 * (candidate + step) : candidate;

    if (Math.abs(step) < epsilon * inverseRegLowGamma) {
      break;
    }
  }

  return inverseRegLowGamma;
}
