import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {logGamma} from '../src/logGamma.js';
import {assertClose} from './assertClose.js';

describe('logGamma', () => {
  it('returns the logarithm of the gamma function', () => {
    assertClose(logGamma(3.5), 1.2009736023470738);
    assertClose(logGamma(0.0001), 9.210282658633963);
    assertClose(logGamma(5), 3.1780538303479453);
    assert.strictEqual(logGamma(1), 0);
    assert.strictEqual(logGamma(2), 0);
    assert.strictEqual(logGamma(0), Infinity);
  });

  it('rejects invalid inputs', () => {
    assert.throws(
      () => logGamma('Not a number' as unknown as number),
      {message: 'The value is not a number.'},
    );
    assert.throws(
      () => logGamma(-666),
      {message: 'The value is a negative number.'},
    );
  });
});
