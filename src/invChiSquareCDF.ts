import { invRegLowGamma } from './invRegLowGamma.js';

/**
 * Computes a quantile of the chi-square distribution.
 *
 * Returns the non-negative value `x` for which a chi-square random variable
 * with the given degrees of freedom has `P(X <= x) = probability`.
 *
 * @param probability - Cumulative probability, strictly between 0 and 1.
 * @param degreeOfFreedom - Number of degrees of freedom, greater than 0.
 * @returns The chi-square quantile corresponding to `probability`.
 * @throws {Error} If an argument is not a number or is `NaN`.
 * @throws {Error} If `probability` or `degreeOfFreedom` is outside its domain.
 *
 * @example
 * ```js
 * import { invChiSquareCDF } from 'inv-chisquare-cdf';
 *
 * const quantile = invChiSquareCDF(0.95, 10); // ~18.307038053275143
 * ```
 */
export function invChiSquareCDF(
  probability: number,
  degreeOfFreedom: number,
): number {
  if (typeof probability !== 'number' || Number.isNaN(probability)) {
    throw new Error('The value in param "probability" is not an number.');
  }

  if (typeof degreeOfFreedom !== 'number' || Number.isNaN(degreeOfFreedom)) {
    throw new Error('The value in param "degreeOfFreedom" is not an number.');
  }

  if (probability >= 1 || probability <= 0) {
    throw new Error(
      'The number in param "probability" must lie in the interval [0 1].',
    );
  }

  if (degreeOfFreedom <= 0) {
    throw new Error(
      'The number in param "degreeOfFreedom" must be greater than 0.',
    );
  }

  return 2 * invRegLowGamma(probability, 0.5 * degreeOfFreedom);
}
