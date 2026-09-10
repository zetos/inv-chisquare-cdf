import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  chiSquareCDF,
  chiSquareGoodnessOfFit,
  chiSquareStatistic,
  chiSquareSurvival,
  invChiSquareCDF,
  invRegLowGamma,
  logGamma,
  normalVarianceConfidenceInterval,
  regLowGamma,
} from '../src/index.js';

describe('public API', () => {
  it('exports all functions', () => {
    assert.strictEqual(typeof chiSquareCDF, 'function');
    assert.strictEqual(typeof chiSquareGoodnessOfFit, 'function');
    assert.strictEqual(typeof chiSquareSurvival, 'function');
    assert.strictEqual(typeof chiSquareStatistic, 'function');
    assert.strictEqual(typeof invChiSquareCDF, 'function');
    assert.strictEqual(typeof invRegLowGamma, 'function');
    assert.strictEqual(typeof logGamma, 'function');
    assert.strictEqual(typeof normalVarianceConfidenceInterval, 'function');
    assert.strictEqual(typeof regLowGamma, 'function');
  });
});
