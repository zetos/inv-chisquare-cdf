import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import { normalVarianceConfidenceInterval } from '../src/normalVarianceConfidenceInterval.js';
import { assertClose } from './assertClose.js';

describe('normalVarianceConfidenceInterval', () => {
  it('returns a reference confidence interval for population variance', () => {
    const interval = normalVarianceConfidenceInterval(4, 20, 0.95);

    assertClose(interval.lower, 2.313382559472031);
    assertClose(interval.upper, 8.533078016943891);
  });

  it('defaults to a 95% confidence level', () => {
    const defaultInterval = normalVarianceConfidenceInterval(25, 30);
    const explicitInterval = normalVarianceConfidenceInterval(25, 30, 0.95);

    assertClose(defaultInterval.lower, explicitInterval.lower);
    assertClose(defaultInterval.upper, explicitInterval.upper);
  });

  it('returns a zero interval for zero sample variance', () => {
    assert.deepStrictEqual(normalVarianceConfidenceInterval(0, 20), {
      lower: 0,
      upper: 0,
    });
  });

  it('widens as the confidence level increases', () => {
    const narrow = normalVarianceConfidenceInterval(4, 20, 0.9);
    const wide = normalVarianceConfidenceInterval(4, 20, 0.99);

    assert.ok(wide.lower < narrow.lower);
    assert.ok(wide.upper > narrow.upper);
  });

  it('matches the closed form for a sample size of three', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1e-6, max: 1e6, noNaN: true }),
        fc.double({ min: 1e-6, max: 1 - 1e-4, noNaN: true }),
        (sampleVariance, confidenceLevel) => {
          const alpha = 1 - confidenceLevel;
          const interval = normalVarianceConfidenceInterval(
            sampleVariance,
            3,
            confidenceLevel,
          );
          const expectedLowerCoefficient = 1 / -Math.log(alpha / 2);
          const expectedUpperCoefficient = 1 / -Math.log1p(-alpha / 2);

          assertClose(
            interval.lower / sampleVariance,
            expectedLowerCoefficient,
            { absoluteTolerance: 0, relativeTolerance: 5e-12 },
          );
          assertClose(
            interval.upper / sampleVariance,
            expectedUpperCoefficient,
            { absoluteTolerance: 0, relativeTolerance: 5e-12 },
          );
        },
      ),
      { numRuns: 200 },
    );
  });

  it('rejects invalid sample variances', () => {
    for (const sampleVariance of [-1, Infinity, Number.NaN]) {
      assert.throws(
        () => normalVarianceConfidenceInterval(sampleVariance, 20),
        { message: 'The sample variance must be finite and non-negative.' },
      );
    }
  });

  it('rejects invalid sample sizes', () => {
    for (const sampleSize of [1, 1.5, Infinity, Number.NaN]) {
      assert.throws(() => normalVarianceConfidenceInterval(4, sampleSize), {
        message: 'The sample size must be an integer greater than 1.',
      });
    }
  });

  it('rejects invalid or unrepresentable confidence levels', () => {
    for (const confidenceLevel of [0, 1, -1, Infinity, Number.NaN]) {
      assert.throws(
        () => normalVarianceConfidenceInterval(4, 20, confidenceLevel),
        { message: 'The confidence level must be strictly between 0 and 1.' },
      );
    }

    assert.throws(
      () => normalVarianceConfidenceInterval(4, 20, 1 - Number.EPSILON / 2),
      {
        message:
          'The confidence level is too close to 1 for its chi-square quantiles to be represented.',
      },
    );
  });
});
