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

const centralProbabilityArbitrary = fc.double({
  min: 1e-8,
  max: 1 - 1e-6,
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

function erlangCDF(shape: number, x: number): number {
  const sum = erlangSeriesSum(shape, x);
  return -Math.expm1(Math.log(sum) - x);
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

function adjacentPositiveFloat(value: number, direction: -1 | 1): number {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value);
  view.setBigUint64(0, view.getBigUint64(0) + BigInt(direction));
  return view.getFloat64(0);
}

describe('numerical properties', () => {
  describe('logGamma', () => {
    it('matches log factorial for positive integers', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (n) => {
          assertClose(logGamma(n), logFactorial(n), {
            absoluteTolerance: 2e-10,
            relativeTolerance: 1e-14,
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
            absoluteTolerance: 5e-12,
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
            absoluteTolerance: 1e-10,
            relativeTolerance: 1e-10,
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
      for (const shape of [0.1, 1, 10, 10_000, 1e6]) {
        const boundary = shape + 1;
        const below = regLowGamma(shape, adjacentPositiveFloat(boundary, -1));
        const at = regLowGamma(shape, boundary);
        const tolerance = shape <= 10_000 ? 2e-10 : 2e-9;

        assert.ok(
          Math.abs(at - below) <= tolerance,
          `unexpected jump at x = a + 1 for a = ${shape}: ${at - below}`,
        );
      }

      const belowLargeShape = adjacentPositiveFloat(2e6, -1);
      assert.ok(
        Math.abs(
          regLowGamma(2e6, 2e6) - regLowGamma(belowLargeShape, belowLargeShape),
        ) <= 1e-9,
      );

      const belowSmallShape = adjacentPositiveFloat(1e-8, -1);
      const belowSmallX = adjacentPositiveFloat(0.1, -1);
      assert.ok(
        Math.abs(
          regUpperGamma(belowSmallShape, belowSmallX) -
            regUpperGamma(1e-8, 0.1),
        ) <= 2e-15,
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
        fc.property(centralProbabilityArbitrary, (probability) => {
          const expected = -Math.log1p(-probability);

          assertClose(invRegLowGamma(probability, 1), expected, {
            absoluteTolerance: 5e-10,
            relativeTolerance: 1e-12,
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

    it('inverts tail probabilities using the independent Erlang formulas', () => {
      for (const shape of [1, 2, 5, 25, 50]) {
        for (const probability of [1e-8, 0.01, 0.5, 1 - 1e-8]) {
          const inverse = invRegLowGamma(probability, shape);
          const actualTail =
            probability <= 0.5
              ? erlangCDF(shape, inverse)
              : erlangSurvival(shape, inverse);
          const expectedTail = Math.min(probability, 1 - probability);

          assertClose(actualTail, expectedTail, {
            absoluteTolerance: 0,
            relativeTolerance: 2e-7,
          });
        }
      }
    });

    it('documents inverse accuracy at 1e-12 tails', () => {
      for (const shape of [1, 2, 5, 25, 50]) {
        for (const probability of [1e-12, 1 - 1e-12]) {
          const inverse = invRegLowGamma(probability, shape);
          const actualTail =
            probability < 0.5
              ? erlangCDF(shape, inverse)
              : erlangSurvival(shape, inverse);

          assertClose(actualTail, Math.min(probability, 1 - probability), {
            absoluteTolerance: 0,
            relativeTolerance: 5e-4,
          });
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
        fc.property(centralProbabilityArbitrary, (probability) => {
          const expected = -2 * Math.log1p(-probability);

          assertClose(invChiSquareCDF(probability, 2), expected, {
            absoluteTolerance: 1e-9,
            relativeTolerance: 1e-12,
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
      const valueArbitrary = fc.double({ min: 0, max: 200, noNaN: true });

      fc.assert(
        fc.property(
          fc.tuple(valueArbitrary, valueArbitrary),
          positiveShapeArbitrary,
          ([firstValue, secondValue], degreesOfFreedom) => {
            const lowerValue = Math.min(firstValue, secondValue);
            const upperValue = Math.max(firstValue, secondValue);

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
