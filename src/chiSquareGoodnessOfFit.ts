import { chiSquareSurvival } from './chiSquareCDF.js';

/**
 * Selects how `chiSquareGoodnessOfFit` determines the degrees of freedom.
 *
 * Omit the options to use `number of categories - 1`. Use
 * `estimatedParameters` when parameters of the expected distribution were
 * estimated from the observations, or provide `degreesOfFreedom` directly for
 * a model with a different degrees-of-freedom calculation.
 */
export type DegreesOfFreedomOptions =
  | {
      estimatedParameters?: number;
      degreesOfFreedom?: never;
    }
  | {
      degreesOfFreedom: number;
      estimatedParameters?: never;
    };

/** The result of Pearson's chi-square goodness-of-fit test. */
export type ChiSquareGoodnessOfFitResult = {
  statistic: number;
  degreesOfFreedom: number;
  pValue: number;
};

/**
 * Calculates Pearson's chi-square statistic for observed and expected values.
 *
 * This is an assumption-light arithmetic helper. It does not require integer
 * observations, matching totals, or a minimum number of categories. Callers
 * are responsible for deciding whether the statistic is appropriate for their
 * data and how its degrees of freedom should be calculated.
 *
 * @param observed - Finite, non-negative observed values.
 * @param expected - Finite expected values greater than zero.
 * @returns `sum((observed - expected)^2 / expected)`.
 * @throws {Error} If the arrays are empty, have different lengths, or contain
 * invalid values.
 *
 * @example
 * ```js
 * import { chiSquareStatistic } from 'inv-chisquare-cdf';
 *
 * const statistic = chiSquareStatistic([8, 9, 11], [10, 10, 10]);
 * // 0.6
 * ```
 */
export function chiSquareStatistic(
  observed: readonly number[],
  expected: readonly number[],
): number {
  validateFrequencies(observed, expected);

  return observed.reduce((sum, value, index) => {
    const expectedValue = expected[index]!;
    return sum + (value - expectedValue) ** 2 / expectedValue;
  }, 0);
}

/**
 * Performs Pearson's chi-square goodness-of-fit test for category counts.
 *
 * `observed` and `expected` are counts, not probabilities or relative weights,
 * and their totals must match apart from floating-point summation error. The
 * returned p-value is the probability of a statistic at least this large under
 * the chi-square approximation; it does not by itself accept or reject a
 * hypothesis.
 *
 * Expected counts below five can make the chi-square approximation unreliable.
 * This function leaves decisions about combining small categories to callers.
 *
 * @param observed - Finite, non-negative integer counts for each category.
 * @param expected - Finite expected counts greater than zero.
 * @param options - Optional estimated-parameter count or explicit degrees of
 * freedom. If omitted, the degrees of freedom are `categories - 1`.
 * @returns The statistic, degrees of freedom, and upper-tail p-value.
 * @throws {Error} If the counts, totals, or degrees-of-freedom options are
 * invalid.
 *
 * @example
 * ```js
 * import { chiSquareGoodnessOfFit } from 'inv-chisquare-cdf';
 *
 * const result = chiSquareGoodnessOfFit(
 *   [8, 9, 11, 10, 12, 10],
 *   [10, 10, 10, 10, 10, 10],
 * );
 * // result is approximately { statistic: 1, degreesOfFreedom: 5,
 * //   pValue: 0.9626 }
 * ```
 */
export function chiSquareGoodnessOfFit(
  observed: readonly number[],
  expected: readonly number[],
  options: DegreesOfFreedomOptions = {},
): ChiSquareGoodnessOfFitResult {
  validateFrequencies(observed, expected);

  if (observed.length < 2) {
    throw new Error(
      'Goodness-of-fit testing requires at least two categories.',
    );
  }

  if (!observed.every(Number.isInteger)) {
    throw new Error('Every observed count must be an integer.');
  }

  const observedTotal = observed.reduce((sum, count) => sum + count, 0);
  const expectedTotal = expected.reduce((sum, count) => sum + count, 0);
  const totalTolerance =
    4 *
    Number.EPSILON *
    observed.length *
    Math.max(1, observedTotal, expectedTotal);

  if (Math.abs(observedTotal - expectedTotal) > totalTolerance) {
    throw new Error(
      'Expected values must be counts whose total matches the observed total; relative weights are not scaled automatically.',
    );
  }

  const degreesOfFreedom = resolveDegreesOfFreedom(observed.length, options);
  const statistic = chiSquareStatistic(observed, expected);

  return {
    statistic,
    degreesOfFreedom,
    pValue: chiSquareSurvival(statistic, degreesOfFreedom),
  };
}

function validateFrequencies(
  observed: readonly number[],
  expected: readonly number[],
): void {
  if (!Array.isArray(observed) || !Array.isArray(expected)) {
    throw new Error('The observed and expected values must be arrays.');
  }

  if (observed.length === 0) {
    throw new Error('The observed and expected arrays must not be empty.');
  }

  if (observed.length !== expected.length) {
    throw new Error(
      'The observed and expected arrays must have the same length.',
    );
  }

  if (
    !observed.every(
      (value) =>
        typeof value === 'number' && Number.isFinite(value) && value >= 0,
    )
  ) {
    throw new Error('Every observed value must be finite and non-negative.');
  }

  if (
    !expected.every(
      (value) =>
        typeof value === 'number' && Number.isFinite(value) && value > 0,
    )
  ) {
    throw new Error('Every expected value must be finite and greater than 0.');
  }
}

function resolveDegreesOfFreedom(
  categoryCount: number,
  options: DegreesOfFreedomOptions,
): number {
  if (
    typeof options !== 'object' ||
    options === null ||
    Array.isArray(options)
  ) {
    throw new Error('The degrees-of-freedom options must be an object.');
  }

  const hasEstimatedParameters = options.estimatedParameters !== undefined;
  const hasDegreesOfFreedom = options.degreesOfFreedom !== undefined;

  if (hasEstimatedParameters && hasDegreesOfFreedom) {
    throw new Error(
      'Provide either "estimatedParameters" or "degreesOfFreedom", not both.',
    );
  }

  if (hasDegreesOfFreedom) {
    if (
      typeof options.degreesOfFreedom !== 'number' ||
      !Number.isFinite(options.degreesOfFreedom) ||
      options.degreesOfFreedom <= 0
    ) {
      throw new Error(
        'The explicit degrees of freedom must be greater than 0.',
      );
    }

    return options.degreesOfFreedom;
  }

  const estimatedParameters = options.estimatedParameters ?? 0;

  if (!Number.isInteger(estimatedParameters) || estimatedParameters < 0) {
    throw new Error(
      'The number of estimated parameters must be a non-negative integer.',
    );
  }

  const degreesOfFreedom = categoryCount - 1 - estimatedParameters;

  if (degreesOfFreedom <= 0) {
    throw new Error('The resulting degrees of freedom must be greater than 0.');
  }

  return degreesOfFreedom;
}
