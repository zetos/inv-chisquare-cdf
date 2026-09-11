import assert from 'node:assert/strict';

type CloseTolerance = {
  absoluteTolerance?: number;
  relativeTolerance?: number;
};

export function assertClose(
  actual: number,
  expected: number,
  { absoluteTolerance = 1e-12, relativeTolerance = 0 }: CloseTolerance = {},
): void {
  const difference = Math.abs(actual - expected);
  const tolerance = absoluteTolerance + relativeTolerance * Math.abs(expected);

  assert.ok(
    difference <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected} ` +
      `(absolute tolerance ${absoluteTolerance}, relative tolerance ${relativeTolerance}); ` +
      `difference was ${difference}`,
  );
}
