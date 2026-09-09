import { regLowGamma, regUpperGamma } from './regLowGamma.js';

/**
 * Computes the cumulative distribution function of the chi-square distribution.
 *
 * @param value - Non-negative value at which to evaluate the distribution.
 * @param degreesOfFreedom - Number of degrees of freedom, greater than 0.
 * @returns The lower-tail probability `P(X <= value)`.
 * @throws {Error} If an argument is not a number or is outside its domain.
 *
 * @example
 * ```js
 * import {chiSquareCDF} from 'inv-chisquare-cdf';
 *
 * const probability = chiSquareCDF(18.307, 10); // ~0.95
 * ```
 */
export function chiSquareCDF(value: number, degreesOfFreedom: number): number {
  validateParameters(value, degreesOfFreedom);

  const shape = degreesOfFreedom / 2;

  return value === Infinity || (value > 0 && shape === 0)
    ? 1
    : regLowGamma(shape, value / 2);
}

/**
 * Computes the survival function of the chi-square distribution.
 *
 * The survival function is the upper-tail probability `P(X > value)`. It is
 * evaluated directly to retain precision when the probability is very small.
 *
 * @param value - Non-negative value at which to evaluate the distribution.
 * @param degreesOfFreedom - Number of degrees of freedom, greater than 0.
 * @returns The upper-tail probability `P(X > value)`.
 * @throws {Error} If an argument is not a number or is outside its domain.
 *
 * @example
 * ```js
 * import {chiSquareSurvival} from 'inv-chisquare-cdf';
 *
 * const pValue = chiSquareSurvival(1.28, 5); // ~0.937
 * ```
 */
export function chiSquareSurvival(
  value: number,
  degreesOfFreedom: number,
): number {
  validateParameters(value, degreesOfFreedom);

  const shape = degreesOfFreedom / 2;

  return value === Infinity || (value > 0 && shape === 0)
    ? 0
    : regUpperGamma(shape, value / 2);
}

function validateParameters(value: number, degreesOfFreedom: number): void {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error('The value in param "value" is not a number.');
  }

  if (
    typeof degreesOfFreedom !== 'number' ||
    !Number.isFinite(degreesOfFreedom)
  ) {
    throw new Error('The value in param "degreesOfFreedom" is not a number.');
  }

  if (value < 0) {
    throw new Error('The number in param "value" must be non-negative.');
  }

  if (degreesOfFreedom <= 0) {
    throw new Error(
      'The number in param "degreesOfFreedom" must be greater than 0.',
    );
  }
}
