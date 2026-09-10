import { invChiSquareCDF } from './invChiSquareCDF.js';

/** The lower and upper endpoints of a confidence interval. */
export type ConfidenceInterval = {
  lower: number;
  upper: number;
};

/**
 * Calculates a confidence interval for the variance of a normal population.
 *
 * `sampleVariance` must be the usual unbiased sample variance calculated with
 * an `n - 1` denominator. The interval also assumes that the observations are
 * independent and normally distributed; it is not a distribution-free
 * interval for arbitrary data.
 *
 * @param sampleVariance - Finite, non-negative unbiased sample variance.
 * @param sampleSize - Integer number of observations, greater than one.
 * @param confidenceLevel - Confidence level strictly between zero and one.
 * Defaults to `0.95`.
 * @returns The lower and upper population-variance endpoints.
 * @throws {Error} If an argument is invalid or the confidence level is too
 * close to one to represent the required probability below one.
 *
 * @example
 * ```js
 * import { normalVarianceConfidenceInterval } from 'inv-chisquare-cdf';
 *
 * const interval = normalVarianceConfidenceInterval(4, 20, 0.95);
 * // approximately { lower: 2.31, upper: 8.53 }
 *
 * const standardDeviationInterval = {
 *   lower: Math.sqrt(interval.lower),
 *   upper: Math.sqrt(interval.upper),
 * };
 * ```
 */
export function normalVarianceConfidenceInterval(
  sampleVariance: number,
  sampleSize: number,
  confidenceLevel = 0.95,
): ConfidenceInterval {
  if (
    typeof sampleVariance !== 'number' ||
    !Number.isFinite(sampleVariance) ||
    sampleVariance < 0
  ) {
    throw new Error('The sample variance must be finite and non-negative.');
  }

  if (!Number.isInteger(sampleSize) || sampleSize <= 1) {
    throw new Error('The sample size must be an integer greater than 1.');
  }

  if (
    typeof confidenceLevel !== 'number' ||
    !Number.isFinite(confidenceLevel) ||
    confidenceLevel <= 0 ||
    confidenceLevel >= 1
  ) {
    throw new Error('The confidence level must be strictly between 0 and 1.');
  }

  const alpha = 1 - confidenceLevel;
  const lowerProbability = alpha / 2;
  const upperProbability = 1 - lowerProbability;

  if (upperProbability === 1) {
    throw new Error(
      'The confidence level is too close to 1 for its chi-square quantiles to be represented.',
    );
  }

  if (sampleVariance === 0) {
    return { lower: 0, upper: 0 };
  }

  const degreesOfFreedom = sampleSize - 1;
  const scaledVariance = degreesOfFreedom * sampleVariance;

  return {
    lower: scaledVariance / invChiSquareCDF(upperProbability, degreesOfFreedom),
    upper: scaledVariance / invChiSquareCDF(lowerProbability, degreesOfFreedom),
  };
}
