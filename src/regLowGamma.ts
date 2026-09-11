import { logGamma } from './logGamma.js';

const EPSILON = 1e-15;
const MAXIMUM_ITERATIONS = 100_000;
const LARGE_SHAPE = 2e6;
const SMALL_SHAPE = 1e-8;
const EULER_MASCHERONI = 0.5772156649015329;
const TEMME_COEFFICIENTS = [
  1, -0.333333333333333370341, 0.0833333333333333287074,
  -0.0148148148148148153802, 0.00115740740740740734316,
  0.00035273368606701936993, -0.000178755144032921825352,
  0.0000391926317852243766954, -0.00000218544851067999240532,
  -0.00000185406221071515996597, 8.29671134095308545622e-7,
  -1.76659527368260808474e-7, 6.70785354340149841119e-9,
  1.02618097842403069078e-8, -4.38203601845335376897e-9,
  9.14769958223679020897e-10, -2.55141939949462514346e-11,
  -5.83077213255042560744e-11, 2.43619480206674150369e-11,
  -5.02766928011417632057e-12, 1.10043920319561347525e-13,
  3.37176326240098513631e-13,
] as const;
const STIRLING_COEFFICIENTS = [
  0.166638948045186324721, -0.0000138494817606756384303,
  9.81082564692472942616e-9, -1.80912947557249419426e-11,
  6.22109804189260522713e-14, -3.3996150054177219443e-16,
  2.68318199848269874896e-18,
] as const;
// Cephes double-precision erf/erfc rational approximations.
const ERF_T = [
  9.60497373987051638749, 90.0260197203842689217, 2232.00534594684319226,
  7003.32514112805075473, 55592.3013010394958377,
] as const;
const ERF_U = [
  33.5617141647503099647, 521.357949780152679795, 4594.32382970980127987,
  22629.0000613890934246, 49267.3942608635921086,
] as const;
const ERFC_P = [
  2.46196981473530512524e-10, 0.564189564831068821977, 7.46321056442269912687,
  48.6371970985681366614, 196.520832956077098242, 526.445194995477358631,
  934.52852717195760754, 1027.55188689515710272, 557.535335369399327526,
] as const;
const ERFC_Q = [
  13.2281951154744992508, 86.7072140885989742329, 354.937778887819891062,
  975.708501743205489753, 1823.90916687909736289, 2246.33760818710981792,
  1656.66309194161350182, 557.535340817727675546,
] as const;
const ERFC_R = [
  0.564189583547755073984, 1.27536670759978104416, 5.01905042251180477414,
  6.16021097993053585195, 7.4097426995044893916, 2.9788666537210024067,
] as const;
const ERFC_S = [
  2.2605286322011727659, 9.39603524938001434673, 12.0489539808096656051,
  17.0814407474660043162, 9.60896809063285878198, 3.3690764510008151605,
] as const;

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

  if (a > 20 && Math.abs(x - a) / a < 0.4) {
    return temmeExpansion(a, x, upperTail);
  }

  if (upperTail && a < SMALL_SHAPE && x < 0.1) {
    return clampProbability(a * exponentialIntegral(x));
  }

  if (x < a + 1) {
    const lower = lowerGammaSeries(a, x);

    if (!upperTail) {
      return lower;
    }

    return lower >= 1 - 1e-8 && x >= 0.1 ? upperGammaFraction(a, x) : 1 - lower;
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

function exponentialIntegral(x: number): number {
  let sum = 0;
  let term = 1;

  for (let iteration = 1; iteration <= MAXIMUM_ITERATIONS; iteration++) {
    term *= -x / iteration;
    const delta = term / iteration;
    sum += delta;

    if (Math.abs(delta) <= Math.abs(sum) * EPSILON) {
      break;
    }
  }

  return -EULER_MASCHERONI - Math.log(x) - sum;
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

function temmeExpansion(a: number, x: number, upperTail: boolean): number {
  const mu = (x - a) / a;
  const y = -log1pmx(mu);
  const eta = Math.sign(mu) * Math.sqrt(2 * y);
  let previous: number = TEMME_COEFFICIENTS[21];
  let current: number = TEMME_COEFFICIENTS[20];
  let sum = 0;

  for (let index = 19; index > 0; index--) {
    const next = TEMME_COEFFICIENTS[index]! + ((index + 1) * previous) / a;
    sum = eta * sum + next;
    previous = current;
    current = next;
  }

  const correction =
    (Math.exp(-a * y) * sum) /
    (Math.sqrt(2 * Math.PI * a) * Math.exp(logGammaCorrection(a)));
  const leading =
    complementaryErrorFunction((upperTail ? eta : -eta) * Math.sqrt(a / 2)) / 2;

  return clampProbability(leading + (upperTail ? correction : -correction));
}

function log1pmx(x: number): number {
  if (Math.abs(x) < Number.EPSILON) return (-x * x) / 2;

  let term = 0.5;
  let sum = term;

  for (let denominator = 3; ; denominator++) {
    term *= (-x * (denominator - 1)) / denominator;
    sum += term;
    if (Math.abs(term) <= Math.abs(sum) * Number.EPSILON) break;
  }

  return -x * x * sum;
}

function logGammaCorrection(x: number): number {
  const argument = 2 * (10 / x) ** 2 - 1;
  let current = 0;
  let previous = 0;
  let beforePrevious = 0;

  for (let index = STIRLING_COEFFICIENTS.length - 1; index >= 0; index--) {
    const next =
      STIRLING_COEFFICIENTS[index]! + 2 * argument * current - previous;
    beforePrevious = previous;
    previous = current;
    current = next;
  }

  return (current - beforePrevious) / (2 * x);
}

function complementaryErrorFunction(x: number): number {
  const absoluteX = Math.abs(x);

  if (absoluteX < 1) {
    const squared = x * x;
    return (
      1 -
      (x * evaluatePolynomial(squared, ERF_T)) /
        evaluatePolynomial(squared, ERF_U, 1)
    );
  }

  if (absoluteX > 37.519379347) return x < 0 ? 2 : 0;

  const numerator = evaluatePolynomial(
    absoluteX,
    absoluteX < 8 ? ERFC_P : ERFC_R,
  );
  const denominator = evaluatePolynomial(
    absoluteX,
    absoluteX < 8 ? ERFC_Q : ERFC_S,
    1,
  );
  const result = (Math.exp(-absoluteX * absoluteX) * numerator) / denominator;

  return x < 0 ? 2 - result : result;
}

function evaluatePolynomial(
  x: number,
  coefficients: readonly number[],
  leading = 0,
): number {
  return coefficients.reduce(
    (sum, coefficient) => sum * x + coefficient,
    leading,
  );
}

function clampProbability(probability: number): number {
  return Math.min(1, Math.max(0, probability));
}
