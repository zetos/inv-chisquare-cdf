import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import { chiSquareCDF, chiSquareSurvival } from '../src/chiSquareCDF.js';
import { invChiSquareCDF } from '../src/invChiSquareCDF.js';
import { invRegLowGamma } from '../src/invRegLowGamma.js';
import { logGamma } from '../src/logGamma.js';
import { regLowGamma, regUpperGamma } from '../src/regLowGamma.js';
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

const orderedProbabilityPairArbitrary = fc
  .double({ min: 1e-8, max: 1 - 3e-8, noNaN: true })
  .chain((lowerProbability) =>
    fc
      .double({
        min: lowerProbability + 1e-8,
        max: 1 - 1e-8,
        noNaN: true,
      })
      .map((upperProbability) => [lowerProbability, upperProbability] as const),
  );

const orderedValuePairArbitrary = fc
  .double({ min: 0, max: 200 - 2e-8, noNaN: true })
  .chain((lowerValue) =>
    fc
      .double({ min: lowerValue + 1e-8, max: 200, noNaN: true })
      .map((upperValue) => [lowerValue, upperValue] as const),
  );

function erlangCDF(
  shape: number,
  x: number,
  k = shape,
  term = Math.exp(-x + shape * Math.log(x) - logFactorial(shape + 1)),
  sum = 0,
): number {
  const nextSum = sum + term;
  const nextK = k + 1;
  const nextTerm = term * (x / nextK);

  return nextK > x && nextTerm <= nextSum * Number.EPSILON
    ? nextSum
    : erlangCDF(shape, x, nextK, nextTerm, nextSum);
}

function erlangSurvival(shape: number, x: number): number {
  return Math.exp(Math.log(erlangSeriesSum(shape, x)) - x);
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
  assert.ok(probability >= 0, `expected ${probability} to be at least 0`);
  assert.ok(probability <= 1, `expected ${probability} to be at most 1`);
}

function previousPositiveFloat(value: number): number {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value);
  view.setBigUint64(0, view.getBigUint64(0) - 1n);
  return view.getFloat64(0);
}

describe('numerical properties', () => {
  describe('logGamma', () => {
    it('matches log factorial for positive integers', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (n) => {
          assertClose(logGamma(n), logFactorial(n), {
            absoluteTolerance: 0,
            relativeTolerance: 5e-13,
          });
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
          assertClose(logGamma(x + 1), Math.log(x) + logGamma(x), {
            absoluteTolerance: 1.9e-12,
            relativeTolerance: 3e-15,
          });
        }),
        { numRuns: 200 },
      );
    });

    it('satisfies the reflection identity', () => {
      for (const x of [1e-8, 1e-4, 0.1, 0.25, 0.499]) {
        const expected = Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x));

        assertClose(logGamma(x) + logGamma(1 - x), expected, {
          absoluteTolerance: 2e-13,
          relativeTolerance: 2e-14,
        });
      }
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
          assertClose(regLowGamma(shape, x), erlangCDF(shape, x), {
            absoluteTolerance: 0,
            relativeTolerance: 5e-10,
          });
        }),
        { numRuns: 300 },
      );
    });

    it('matches the independent Erlang survival function, including tiny tails', () => {
      for (const shape of [1, 2, 3, 5, 10, 25, 50]) {
        for (const x of [
          1e-12,
          0.1,
          shape,
          shape + 1 - 1e-8,
          shape + 1 + 1e-8,
          2 * shape,
          50,
          100,
          500,
        ]) {
          assertClose(regUpperGamma(shape, x), erlangSurvival(shape, x), {
            absoluteTolerance: 0,
            relativeTolerance: 2e-10,
          });
        }
      }
    });

    it('remains continuous across numerical branch boundaries', () => {
      for (const shape of [0.1, 1, 10]) {
        const boundary = shape + 1;
        const below = regLowGamma(shape, previousPositiveFloat(boundary));
        const at = regLowGamma(shape, boundary);

        assert.ok(
          Math.abs(at - below) <= 2e-10,
          `unexpected jump at x = a + 1 for a = ${shape}: ${at - below}`,
        );
      }

      const belowLargeShape = previousPositiveFloat(2e6);
      assert.ok(
        Math.abs(regLowGamma(2e6, 2e6) - regLowGamma(belowLargeShape, 2e6)) <=
          1e-9,
      );

      const belowSmallShape = previousPositiveFloat(1e-8);
      const belowSmallX = previousPositiveFloat(0.1);
      assert.ok(
        Math.abs(
          regUpperGamma(belowSmallShape, 0.05) - regUpperGamma(1e-8, 0.05),
        ) <= 2e-15,
      );
      assert.ok(
        Math.abs(
          regUpperGamma(belowSmallShape, belowSmallX) -
            regUpperGamma(belowSmallShape, 0.1),
        ) <= 2e-15,
      );
    });

    it('returns bounded probabilities and is nondecreasing in x', () => {
      fc.assert(
        fc.property(
          positiveShapeArbitrary,
          orderedValuePairArbitrary,
          (shape, [lowerX, upperX]) => {
            const lowerProbability = regLowGamma(shape, lowerX);
            const upperProbability = regLowGamma(shape, upperX);

            assertFiniteProbability(lowerProbability);
            assertFiniteProbability(upperProbability);
            assert.ok(
              lowerProbability <= upperProbability,
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
            assertClose(erlangCDF(shape, inverse), probability, {
              absoluteTolerance: 1e-10,
              relativeTolerance: 1e-10,
            });
          },
        ),
        { numRuns: 150 },
      );
    });

    it('matches the exponential quantile for shape one', () => {
      fc.assert(
        fc.property(probabilityArbitrary, (probability) => {
          const expected = -Math.log1p(-probability);

          assertClose(invRegLowGamma(probability, 1), expected, {
            absoluteTolerance: 4e-10,
            relativeTolerance: 4e-10,
          });
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
            assertClose(regLowGamma(shape, inverse), probability, {
              absoluteTolerance: 1e-11,
              relativeTolerance: 1e-11,
            });
          },
        ),
        { numRuns: 150 },
      );
    });

    it('inverts Erlang tail probabilities with scale-aware accuracy', () => {
      for (const shape of [1, 2, 5, 25, 50]) {
        for (const [tail, relativeTolerance] of [
          [1e-8, 2e-7],
          [1e-12, 5e-4],
        ] as const) {
          for (const probability of [tail, 1 - tail]) {
            const inverse = invRegLowGamma(probability, shape);
            const actualTail =
              probability < 0.5
                ? erlangCDF(shape, inverse)
                : erlangSurvival(shape, inverse);

            assertClose(actualTail, tail, {
              absoluteTolerance: 0,
              relativeTolerance,
            });
          }
        }
      }
    });

    it('is nondecreasing in probability', () => {
      fc.assert(
        fc.property(
          positiveShapeArbitrary,
          orderedProbabilityPairArbitrary,
          (shape, [firstProbability, secondProbability]) => {
            const lowerInverse = invRegLowGamma(firstProbability, shape);
            const upperInverse = invRegLowGamma(secondProbability, shape);
            assert.ok(Number.isFinite(lowerInverse));
            assert.ok(Number.isFinite(upperInverse));
            assert.ok(lowerInverse >= 0);
            assert.ok(upperInverse >= 0);
            assert.ok(
              lowerInverse <= upperInverse,
              `expected P^-1(${firstProbability}, ${shape}) <= P^-1(${secondProbability}, ${shape})`,
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

          assertClose(invChiSquareCDF(probability, 2), expected, {
            absoluteTolerance: 4e-10,
            relativeTolerance: 4e-10,
          });
        }),
        { numRuns: 200 },
      );
    });
  });

  describe('chi-square probabilities', () => {
    it('matches the exponential distribution for two degrees of freedom', () => {
      fc.assert(
        fc.property(fc.double({ min: 0, max: 100, noNaN: true }), (value) => {
          const expectedSurvival = Math.exp(-value / 2);

          assertClose(chiSquareCDF(value, 2), 1 - expectedSurvival, {
            absoluteTolerance: 5e-15,
            relativeTolerance: 5e-15,
          });
          assertClose(chiSquareSurvival(value, 2), expectedSurvival, {
            absoluteTolerance: 0,
            relativeTolerance: 1e-13,
          });
        }),
        { numRuns: 200 },
      );
    });

    it('returns bounded, complementary probabilities', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          positiveShapeArbitrary,
          (value, degreesOfFreedom) => {
            const lower = chiSquareCDF(value, degreesOfFreedom);
            const upper = chiSquareSurvival(value, degreesOfFreedom);

            assertFiniteProbability(lower);
            assertFiniteProbability(upper);
            assertClose(lower + upper, 1);
          },
        ),
        { numRuns: 200 },
      );
    });

    it('is monotonic in the evaluated value', () => {
      fc.assert(
        fc.property(
          orderedValuePairArbitrary,
          positiveShapeArbitrary,
          ([lowerValue, upperValue], degreesOfFreedom) => {
            assert.ok(
              chiSquareCDF(lowerValue, degreesOfFreedom) <=
                chiSquareCDF(upperValue, degreesOfFreedom),
            );
            assert.ok(
              chiSquareSurvival(lowerValue, degreesOfFreedom) >=
                chiSquareSurvival(upperValue, degreesOfFreedom),
            );
          },
        ),
        { numRuns: 200 },
      );
    });

    it('is monotonic in degrees of freedom', () => {
      const degreesOfFreedomValues = [0.1, 0.5, 1, 2, 5, 10, 100, 10_000];

      for (const value of [0.1, 1, 10, 100]) {
        for (let index = 1; index < degreesOfFreedomValues.length; index++) {
          const lowerDegrees = degreesOfFreedomValues[index - 1]!;
          const upperDegrees = degreesOfFreedomValues[index]!;

          assert.ok(
            chiSquareCDF(value, lowerDegrees) >=
              chiSquareCDF(value, upperDegrees),
          );
          assert.ok(
            chiSquareSurvival(value, lowerDegrees) <=
              chiSquareSurvival(value, upperDegrees),
          );
        }
      }

      for (const probability of [0.01, 0.5, 0.99]) {
        for (let index = 1; index < degreesOfFreedomValues.length; index++) {
          assert.ok(
            invChiSquareCDF(probability, degreesOfFreedomValues[index - 1]!) <=
              invChiSquareCDF(probability, degreesOfFreedomValues[index]!),
          );
        }
      }
    });
  });
});
