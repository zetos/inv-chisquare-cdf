import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { regLowGamma, regUpperGamma } from '../src/regLowGamma.js';
import { assertClose } from './assertClose.js';

describe('regLowGamma', () => {
  it('returns the lower regularized incomplete gamma function', () => {
    assertClose(regLowGamma(5, 5), 0.5595067149347875);
    assertClose(regLowGamma(0.666, 5.75), 0.9987538088133204);
    assert.strictEqual(regLowGamma(5, 0), 0);
    assertClose(regUpperGamma(5, 5), 0.4404932850652124);
    assertClose(regUpperGamma(0.1, 1), 0.02412734372632778);
    assertClose(regUpperGamma(1e-15, 0.5), 5.597735947761609e-16);
    assert.strictEqual(regUpperGamma(5, 0), 1);
    assert.strictEqual(regUpperGamma(5, Infinity), 0);
    assert.strictEqual(regLowGamma(5, Infinity), 1);
  });

  it('rejects invalid inputs', () => {
    assert.throws(() => regLowGamma('Not a number' as unknown as number, 6), {
      message: 'The value in param a is not a number.',
    });
    assert.throws(() => regLowGamma(6, 'Not a number' as unknown as number), {
      message: 'The value in param x is not a number.',
    });
    assert.throws(() => regLowGamma(0, 2), {
      message: 'The number in param a is equal or less than 0.',
    });
    assert.throws(() => regLowGamma(-666, 2), {
      message: 'The number in param a is equal or less than 0.',
    });
    assert.throws(() => regUpperGamma(Infinity, 2), {
      message: 'The value in param a is not a number.',
    });
    assert.throws(() => regLowGamma(2, -666), {
      message: 'The number in param x is a negative number.',
    });
  });
});
