import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {invChiSquareCDF} from '../src/invChiSquareCDF.js';
import {assertClose} from './assertClose.js';

describe('invChiSquareCDF', () => {
  it('returns the inverse chi-square CDF', () => {
    assertClose(invChiSquareCDF(0.05, 2), 0.10258658877510105);
    assertClose(invChiSquareCDF(0.95, 10), 18.307038053275143);
  });

  it('rejects non-numeric inputs', () => {
    assert.throws(
      () => invChiSquareCDF('Not a number' as unknown as number, 6),
      {message: 'The value in param "probability" is not an number.'},
    );
    assert.throws(
      () => invChiSquareCDF(true as unknown as number, 6),
      {message: 'The value in param "probability" is not an number.'},
    );
    assert.throws(
      () => invChiSquareCDF(0.05, 'Not a number' as unknown as number),
      {message: 'The value in param "degreeOfFreedom" is not an number.'},
    );
  });

  it('rejects values outside the valid domain', () => {
    for (const probability of [0, -1, 1, 666]) {
      assert.throws(
        () => invChiSquareCDF(probability, 2),
        {message: 'The number in param "probability" must lie in the interval [0 1].'},
      );
    }

    for (const degreeOfFreedom of [0, -2]) {
      assert.throws(
        () => invChiSquareCDF(0.05, degreeOfFreedom),
        {message: 'The number in param "degreeOfFreedom" must be greater than 0.'},
      );
    }
  });
});
