import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import { invChiSquareCDF } from '../src/invChiSquareCDF.js';
import { invRegLowGamma } from '../src/invRegLowGamma.js';
import { logGamma } from '../src/logGamma.js';
import { regLowGamma } from '../src/regLowGamma.js';
import { assertClose } from './assertClose.js';

const probabilityArbitrary = fc.double({
  min: 1e-8,
  max: 1 - 1e-8,
  noNaN: true,
});

const positiveShapeArbitrary = fc.double({
  min: 0.1,
  max: 100,
  noNaN: true,
});

function erlangCDF(shape: number, x: number): number {
  const sum = erlangSeriesSum(shape, x);
  return -Math.expm1(Math.log(sum) - x);
}

function erlangSeriesSum(
  shape: number,
  x: number,
  k = 1,
  term = 1,
  sum = 1,
): number {
  return k >= shape
    ? sum
    : ((nextTerm: number) =>
        erlangSeriesSum(shape, x, k + 1, nextTerm, sum + nextTerm))(
        term * (x / k),
      );
}

function logFactorial(n: number, k = 1, sum = 0): number {
  return k >= n ? sum : logFactorial(n, k + 1, sum + Math.log(k));
}

function assertFiniteProbability(probability: number): void {
  assert.ok(
    Number.isFinite(probability),
    `expected ${probability} to be finite`,
  );
  assert.ok(probability >= -1e-12, `expected ${probability} to be at least 0`);
  assert.ok(
    probability <= 1 + 1e-12,
    `expected ${probability} to be at most 1`,
  );
}

describe('numerical properties', () => {
  describe('logGamma', () => {
    it('matches log factorial for positive integers', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (n) => {
          assertClose(logGamma(n), logFactorial(n), 1e-12);
        }),
        { numRuns: 200 },
      );
    });

    it('satisfies the gamma recurrence', () => {
      const positiveLogScaleArbitrary = fc
        .double({ min: -6, max: 4, noNaN: true })
        .map((exponent) => 10 ** exponent);

      fc.assert(
        fc.property(positiveLogScaleArbitrary, (x) => {
          assertClose(logGamma(x + 1), Math.log(x) + logGamma(x), 2e-12);
        }),
        { numRuns: 200 },
      );
    });
  });

  describe('regLowGamma', () => {
    it('matches the Erlang CDF for positive integer shapes', () => {
      const erlangCaseArbitrary = fc
        .integer({ min: 1, max: 50 })
        .chain((shape) =>
          fc.oneof(
            fc
              .double({ min: 0.01, max: 2 * shape + 30, noNaN: true })
              .map((x) => ({ shape, x })),
            fc
              .constantFrom(-1e-8, 0, 1e-8)
              .map((offset) => ({ shape, x: shape + 1 + offset })),
          ),
        );

      fc.assert(
        fc.property(erlangCaseArbitrary, ({ shape, x }) => {
          assertClose(regLowGamma(shape, x), erlangCDF(shape, x), 1e-9);
        }),
        { numRuns: 300 },
      );
    });

    it('returns bounded probabilities and is nondecreasing in x', () => {
      const xArbitrary = fc.double({ min: 0, max: 200, noNaN: true });

      fc.assert(
        fc.property(
          positiveShapeArbitrary,
          fc.tuple(xArbitrary, xArbitrary),
          (shape, [firstX, secondX]) => {
            const lowerX = Math.min(firstX, secondX);
            const upperX = Math.max(firstX, secondX);
            const lowerProbability = regLowGamma(shape, lowerX);
            const upperProbability = regLowGamma(shape, upperX);

            assertFiniteProbability(lowerProbability);
            assertFiniteProbability(upperProbability);
            assert.ok(
              lowerProbability <= upperProbability + 1e-12,
              `expected P(${shape}, ${lowerX}) <= P(${shape}, ${upperX})`,
            );
          },
        ),
        { numRuns: 150 },
      );
    });
  });

  describe('invRegLowGamma', () => {
    it('inverts the independent Erlang CDF for positive integer shapes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          fc.double({ min: 1e-7, max: 1 - 1e-7, noNaN: true }),
          (shape, probability) => {
            const inverse = invRegLowGamma(probability, shape);

            assert.ok(Number.isFinite(inverse));
            assert.ok(inverse >= 0);
            assertClose(erlangCDF(shape, inverse), probability, 1e-9);
          },
        ),
        { numRuns: 150 },
      );
    });

    it('matches the exponential quantile for shape one', () => {
      fc.assert(
        fc.property(probabilityArbitrary, (probability) => {
          const expected = -Math.log1p(-probability);

          assertClose(invRegLowGamma(probability, 1), expected, 1e-9);
        }),
        { numRuns: 200 },
      );
    });

    it('round-trips probabilities for general positive shapes', () => {
      fc.assert(
        fc.property(
          positiveShapeArbitrary,
          probabilityArbitrary,
          (shape, probability) => {
            const inverse = invRegLowGamma(probability, shape);

            assert.ok(Number.isFinite(inverse));
            assert.ok(inverse >= 0);
            assertClose(regLowGamma(shape, inverse), probability, 1e-9);
          },
        ),
        { numRuns: 150 },
      );
    });

    it('is nondecreasing in probability', () => {
      fc.assert(
        fc.property(
          positiveShapeArbitrary,
          fc.tuple(probabilityArbitrary, probabilityArbitrary),
          (shape, [firstProbability, secondProbability]) => {
            const lowerProbability = Math.min(
              firstProbability,
              secondProbability,
            );
            const upperProbability = Math.max(
              firstProbability,
              secondProbability,
            );
            const lowerInverse = invRegLowGamma(lowerProbability, shape);
            const upperInverse = invRegLowGamma(upperProbability, shape);
            const tolerance = 1e-10 * Math.max(1, lowerInverse, upperInverse);

            assert.ok(Number.isFinite(lowerInverse));
            assert.ok(Number.isFinite(upperInverse));
            assert.ok(lowerInverse >= 0);
            assert.ok(upperInverse >= 0);
            assert.ok(
              lowerInverse <= upperInverse + tolerance,
              `expected P^-1(${lowerProbability}, ${shape}) <= P^-1(${upperProbability}, ${shape})`,
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('invChiSquareCDF', () => {
    it('matches the exponential quantile for two degrees of freedom', () => {
      fc.assert(
        fc.property(probabilityArbitrary, (probability) => {
          const expected = -2 * Math.log1p(-probability);

          assertClose(invChiSquareCDF(probability, 2), expected, 1e-9);
        }),
        { numRuns: 200 },
      );
    });
  });
});
