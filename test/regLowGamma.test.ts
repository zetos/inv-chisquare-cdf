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
    assertClose(regUpperGamma(1e-15, 0.5), 5.597735947761609e-16, {
      absoluteTolerance: 0,
      relativeTolerance: 1e-12,
    });
    assertClose(regUpperGamma(1e-12, 1e-18) / 4.086931600899129e-11, 1);
    assert.strictEqual(regUpperGamma(5, 0), 1);
    assert.strictEqual(regUpperGamma(5, Infinity), 0);
    assert.strictEqual(regLowGamma(5, Infinity), 1);
    assertClose(regLowGamma(2e6, 2e6), 0.5000940315975192, {
      absoluteTolerance: 1e-9,
      relativeTolerance: 0,
    });
  });

  it('matches independent references at observed worst cases', () => {
    assertClose(regLowGamma(10_000, 10_000.99999999), 0.5053189319223275, {
      absoluteTolerance: 2e-10,
      relativeTolerance: 0,
    });
    assertClose(regLowGamma(1e6, 1_000_001.00000001), 0.5005319227460616, {
      absoluteTolerance: 2e-9,
      relativeTolerance: 0,
    });
    assertClose(regLowGamma(2_000_001, 2_000_001), 0.5000940315740112, {
      absoluteTolerance: 1e-9,
      relativeTolerance: 0,
    });
    assertClose(regUpperGamma(0.1, 0.1), 0.17244824041413334, {
      absoluteTolerance: 1e-12,
      relativeTolerance: 0,
    });
    assertClose(regUpperGamma(1e-6, 1), 2.193841588705015e-7, {
      absoluteTolerance: 0,
      relativeTolerance: 1e-8,
    });
  });

  it('retains high precision through the large-shape transition zone', () => {
    for (const [a, x, expected, absoluteTolerance] of [
      [20, 21, 0.6157372277356585, 1e-11],
      [100, 101, 0.5528962934345113, 1e-12],
      [1000, 1001, 0.5168114529297863, 1e-12],
      [10_000, 10_001, 0.5053189319622187, 1e-12],
      [100_000, 100_001, 0.5016820789097073, 1e-12],
      [1e6, 1_000_001, 0.5005319227420676, 1e-12],
    ] as const) {
      assertClose(regLowGamma(a, x), expected, { absoluteTolerance });
      assertClose(regUpperGamma(a, x), 1 - expected, {
        absoluteTolerance,
      });
    }

    assert.strictEqual(regLowGamma(2000, 2780), 1);
    assertClose(regUpperGamma(2000, 2780), 4.337627635862428e-55, {
      absoluteTolerance: 0,
      relativeTolerance: 5e-10,
    });
    assert.strictEqual(regLowGamma(100_000, 139_000), 1);
    assert.strictEqual(regUpperGamma(100_000, 139_000), 0);
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
