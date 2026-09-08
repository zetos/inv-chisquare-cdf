import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {invRegLowGamma} from '../src/invRegLowGamma.js';
import {assertClose} from './assertClose.js';

describe('invRegLowGamma', () => {
  it('returns the inverse lower regularized incomplete gamma function', () => {
    assertClose(invRegLowGamma(5, 5), 228.60679774997897);
    assertClose(invRegLowGamma(0.5, 5.75), 5.420322349497806);
    assertClose(invRegLowGamma(5, 0), 100);
    assertClose(invRegLowGamma(0.5, 2), 1.678346990016661);
    assertClose(invRegLowGamma(0.5, 0.666), 0.3759413598815398);
    assert.strictEqual(invRegLowGamma(-1, 2), 0);
  });

  it('rejects non-numeric inputs', () => {
    assert.throws(
      () => invRegLowGamma('Not a number' as unknown as number, 6),
      {message: 'The value in param "p" is not an number.'},
    );
    assert.throws(
      () => invRegLowGamma(6, 'Not a number' as unknown as number),
      {message: 'The value in param "a" is not an number.'},
    );
  });
});
