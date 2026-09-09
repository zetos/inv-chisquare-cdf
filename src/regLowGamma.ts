import { logGamma } from './logGamma.js';

const EPSILON = 1e-15;
const MAXIMUM_ITERATIONS = 100_000;
const LARGE_SHAPE = 1e7;
const ERFC_COEFFICIENTS = [
  1.00002368, 0.37409196, 0.09678418, -0.18628806, 0.27886807, -1.13520398,
  1.48851587, -0.82215223, 0.17087277,
] as const;
const ERFC_AT_ZERO = Math.exp(
  -1.26551223 +
    ERFC_COEFFICIENTS.reduce((sum, coefficient) => sum + coefficient, 0),
);

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
  return regularizedGamma(a, x, false);
}

/**
 * Computes the upper regularized incomplete gamma function `Q(a, x)`.
 *
 * This is kept as an internal building block for upper-tail distributions so
 * that small probabilities are not obtained by subtracting from one.
 */
export function regUpperGamma(a: number, x: number): number {
  return regularizedGamma(a, x, true);
}

function regularizedGamma(a: number, x: number, upperTail: boolean): number {
  if (typeof a !== 'number' || !Number.isFinite(a)) {
    throw new Error('The value in param a is not a number.');
  }

  if (typeof x !== 'number' || Number.isNaN(x)) {
    throw new Error('The value in param x is not a number.');
  }

  if (a <= 0) {
    throw new Error('The number in param a is equal or less than 0.');
  }

  if (x < 0) {
    throw new Error('The number in param x is a negative number.');
  }

  if (x === 0 || x === Infinity) {
    return (x === 0) === upperTail ? 1 : 0;
  }

  if (a >= LARGE_SHAPE) {
    return approximateLargeShapeTail(a, x, upperTail);
  }

  if (x < a + 1) {
    const lower = lowerGammaSeries(a, x);

    return upperTail
      ? lower < 0.9
        ? 1 - lower
        : upperGammaFraction(a, x)
      : lower;
  }

  const upper = upperGammaFraction(a, x);

  return upperTail ? upper : 1 - upper;
}

function lowerGammaSeries(a: number, x: number): number {
  let sum = 1 / a;
  let term = sum;

  for (let iteration = 1; iteration <= MAXIMUM_ITERATIONS; iteration++) {
    term *= x / (a + iteration);
    sum += term;

    if (Math.abs(term) <= Math.abs(sum) * EPSILON) {
      break;
    }
  }

  return clampProbability(sum * Math.exp(-x + a * Math.log(x) - logGamma(a)));
}

function upperGammaFraction(a: number, x: number): number {
  let b = x + 1 - a;
  let c = 1e300;
  let d = 1 / b;
  let h = d;

  for (let iteration = 1; iteration <= MAXIMUM_ITERATIONS; iteration++) {
    const an = -iteration * (iteration - a);
    b += 2;
    d = an * d + b;
    c = b + an / c;
    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) <= EPSILON) {
      break;
    }
  }

  return clampProbability(h * Math.exp(-x + a * Math.log(x) - logGamma(a)));
}

function approximateLargeShapeTail(
  a: number,
  x: number,
  upperTail: boolean,
): number {
  // Wilson-Hilferty's cube-root transform avoids shape-sized iteration.
  const z = 3 * Math.sqrt(a) * (Math.cbrt(x / a) - 1 + 1 / (9 * a));

  return complementaryErrorFunction((upperTail ? z : -z) / Math.SQRT2) / 2;
}

function complementaryErrorFunction(x: number): number {
  // Numerical Recipes section 6.2 polynomial, normalized at zero.
  const absoluteX = Math.abs(x);
  const t = 1 / (1 + absoluteX / 2);
  const polynomial = ERFC_COEFFICIENTS.reduceRight(
    (sum, coefficient) => coefficient + t * sum,
    0,
  );
  const result =
    (t * Math.exp(-absoluteX * absoluteX - 1.26551223 + t * polynomial)) /
    ERFC_AT_ZERO;

  return x >= 0 ? result : 2 - result;
}

function clampProbability(probability: number): number {
  return Math.min(1, Math.max(0, probability));
}
