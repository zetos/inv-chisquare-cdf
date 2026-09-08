import { invRegLowGamma } from './invRegLowGamma.js';

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
