import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { chiSquareCDF, chiSquareSurvival } from '../src/chiSquareCDF.js';
import { assertClose } from './assertClose.js';

describe('chi-square distribution', () => {
  it('returns lower- and upper-tail probabilities', () => {
    assertClose(chiSquareCDF(1.28, 5), 0.06302385399246933);
    assertClose(chiSquareSurvival(1.28, 5), 0.9369761460075307);
    assertClose(chiSquareCDF(18.307038053275143, 10), 0.95);
    assertClose(chiSquareSurvival(18.307038053275143, 10), 0.05);
  });

  it('preserves very small upper-tail probabilities', () => {
    assert.strictEqual(chiSquareCDF(100, 2), 1);
    assertClose(chiSquareSurvival(100, 2) / 1.9287498479639178e-22, 1);
    assertClose(chiSquareSurvival(1, 2e-15) / 5.597735947761609e-16, 1);
  });

  it('returns the distribution boundaries', () => {
    assert.strictEqual(chiSquareCDF(0, 5), 0);
    assert.strictEqual(chiSquareSurvival(0, 5), 1);
    assert.strictEqual(chiSquareCDF(Infinity, 5), 1);
    assert.strictEqual(chiSquareSurvival(Infinity, 5), 0);
    assert.strictEqual(chiSquareCDF(1, Number.MIN_VALUE), 1);
    assert.strictEqual(chiSquareSurvival(1, Number.MIN_VALUE), 0);
  });

  it('handles large degrees of freedom without shape-sized iteration', () => {
    const degreesOfFreedom = 2e10;
    const value = degreesOfFreedom;
    const lower = chiSquareCDF(value, degreesOfFreedom);
    const upper = chiSquareSurvival(value, degreesOfFreedom);

    assertClose(lower, 0.5000013298076014, {
      absoluteTolerance: 1e-10,
      relativeTolerance: 0,
    });
    assertClose(upper, 0.4999986701923986, {
      absoluteTolerance: 1e-10,
      relativeTolerance: 0,
    });
    assertClose(lower + upper, 1);
  });

  it('rejects non-numeric inputs', () => {
    for (const fn of [chiSquareCDF, chiSquareSurvival]) {
      assert.throws(() => fn('Not a number' as unknown as number, 5), {
        message: 'The value in param "value" is not a number.',
      });
      assert.throws(() => fn(Number.NaN, 5), {
        message: 'The value in param "value" is not a number.',
      });
      assert.throws(() => fn(1, 'Not a number' as unknown as number), {
        message: 'The value in param "degreesOfFreedom" is not a number.',
      });
      assert.throws(() => fn(1, Infinity), {
        message: 'The value in param "degreesOfFreedom" is not a number.',
      });
    }
  });

  it('rejects values outside the valid domain', () => {
    for (const fn of [chiSquareCDF, chiSquareSurvival]) {
      assert.throws(() => fn(-1, 5), {
        message: 'The number in param "value" must be non-negative.',
      });

      for (const degreesOfFreedom of [0, -1]) {
        assert.throws(() => fn(1, degreesOfFreedom), {
          message:
            'The number in param "degreesOfFreedom" must be greater than 0.',
        });
      }
    }
  });
});
