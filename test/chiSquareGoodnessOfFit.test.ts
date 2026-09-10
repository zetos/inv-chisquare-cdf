import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { chiSquareSurvival } from '../src/chiSquareCDF.js';
import {
  chiSquareGoodnessOfFit,
  chiSquareStatistic,
} from '../src/chiSquareGoodnessOfFit.js';
import { assertClose } from './assertClose.js';

describe('chiSquareStatistic', () => {
  it('calculates Pearson statistics for non-negative frequencies', () => {
    assertClose(chiSquareStatistic([8, 9, 11], [10, 10, 10]), 0.6);
    assertClose(chiSquareStatistic([0.5, 1.5], [1, 1]), 0.5);
  });

  it('accepts a single category without requiring matching totals', () => {
    assert.strictEqual(chiSquareStatistic([2], [1]), 1);
  });

  it('rejects invalid arrays', () => {
    assert.throws(
      () =>
        chiSquareStatistic('not an array' as unknown as readonly number[], [1]),
      { message: 'The observed and expected values must be arrays.' },
    );
    assert.throws(() => chiSquareStatistic([], []), {
      message: 'The observed and expected arrays must not be empty.',
    });
    assert.throws(() => chiSquareStatistic([1, 2], [1]), {
      message: 'The observed and expected arrays must have the same length.',
    });
  });

  it('rejects invalid observed and expected values', () => {
    for (const observed of [[-1], [Infinity], [Number.NaN]]) {
      assert.throws(() => chiSquareStatistic(observed, [1]), {
        message: 'Every observed value must be finite and non-negative.',
      });
    }

    for (const expected of [[0], [-1], [Infinity], [Number.NaN]]) {
      assert.throws(() => chiSquareStatistic([1], expected), {
        message: 'Every expected value must be finite and greater than 0.',
      });
    }
  });
});

describe('chiSquareGoodnessOfFit', () => {
  const observed = [8, 9, 11, 10, 12, 10];
  const expected = [10, 10, 10, 10, 10, 10];

  it('returns the statistic, default degrees of freedom, and p-value', () => {
    const result = chiSquareGoodnessOfFit(observed, expected);

    assert.strictEqual(result.statistic, 1);
    assert.strictEqual(result.degreesOfFreedom, 5);
    assertClose(result.pValue, 0.9625657732472964);
  });

  it('subtracts estimated parameters from the degrees of freedom', () => {
    const result = chiSquareGoodnessOfFit(observed, expected, {
      estimatedParameters: 2,
    });

    assert.strictEqual(result.degreesOfFreedom, 3);
    assertClose(result.pValue, chiSquareSurvival(result.statistic, 3));
  });

  it('accepts explicit fractional degrees of freedom', () => {
    const result = chiSquareGoodnessOfFit(observed, expected, {
      degreesOfFreedom: 2.5,
    });

    assert.strictEqual(result.degreesOfFreedom, 2.5);
    assertClose(result.pValue, chiSquareSurvival(result.statistic, 2.5));
  });

  it('allows floating-point summation error in count totals', () => {
    const result = chiSquareGoodnessOfFit([1, 0, 0], [1 / 3, 1 / 3, 1 / 3]);

    assert.strictEqual(result.degreesOfFreedom, 2);
    assert.ok(Number.isFinite(result.statistic));
  });

  it('rejects inputs that are not category counts with matching totals', () => {
    assert.throws(() => chiSquareGoodnessOfFit([1], [1]), {
      message: 'Goodness-of-fit testing requires at least two categories.',
    });
    assert.throws(() => chiSquareGoodnessOfFit([0.5, 1.5], [1, 1]), {
      message: 'Every observed count must be an integer.',
    });
    assert.throws(() => chiSquareGoodnessOfFit([2, 2], [1, 1]), {
      message:
        'Expected values must be counts whose total matches the observed total; relative weights are not scaled automatically.',
    });
  });

  it('rejects invalid degrees-of-freedom options', () => {
    for (const estimatedParameters of [-1, 0.5, Infinity]) {
      assert.throws(
        () =>
          chiSquareGoodnessOfFit(observed, expected, {
            estimatedParameters,
          }),
        {
          message:
            'The number of estimated parameters must be a non-negative integer.',
        },
      );
    }

    assert.throws(
      () =>
        chiSquareGoodnessOfFit([1, 1], [1, 1], {
          estimatedParameters: 1,
        }),
      { message: 'The resulting degrees of freedom must be greater than 0.' },
    );

    for (const degreesOfFreedom of [0, -1, Infinity]) {
      assert.throws(
        () => chiSquareGoodnessOfFit(observed, expected, { degreesOfFreedom }),
        { message: 'The explicit degrees of freedom must be greater than 0.' },
      );
    }

    assert.throws(
      () =>
        chiSquareGoodnessOfFit(observed, expected, {
          estimatedParameters: 1,
          degreesOfFreedom: 4,
        } as unknown as Parameters<typeof chiSquareGoodnessOfFit>[2]),
      {
        message:
          'Provide either "estimatedParameters" or "degreesOfFreedom", not both.',
      },
    );
    assert.throws(
      () =>
        chiSquareGoodnessOfFit(
          observed,
          expected,
          null as unknown as Parameters<typeof chiSquareGoodnessOfFit>[2],
        ),
      { message: 'The degrees-of-freedom options must be an object.' },
    );
  });
});
