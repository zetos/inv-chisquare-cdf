import assert from 'node:assert/strict';

export function assertClose(actual: number, expected: number, relativeTolerance = 1e-12): void {
  const difference = Math.abs(actual - expected);
  const tolerance = relativeTolerance * Math.max(1, Math.abs(expected));

  assert.ok(
    difference <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}; difference was ${difference}`,
  );
}
