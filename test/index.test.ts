import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {
  invChiSquareCDF,
  invRegLowGamma,
  logGamma,
  regLowGamma,
} from '../src/index.js';

describe('public API', () => {
  it('exports all functions', () => {
    assert.strictEqual(typeof invChiSquareCDF, 'function');
    assert.strictEqual(typeof invRegLowGamma, 'function');
    assert.strictEqual(typeof logGamma, 'function');
    assert.strictEqual(typeof regLowGamma, 'function');
  });
});
