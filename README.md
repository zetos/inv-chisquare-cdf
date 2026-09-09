# Chi-square distribution functions [![CI](https://github.com/zetos/inv-chisquare-cdf/actions/workflows/ci.yml/badge.svg)](https://github.com/zetos/inv-chisquare-cdf/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/zetos/inv-chisquare-cdf/graph/badge.svg)](https://codecov.io/gh/zetos/inv-chisquare-cdf)

**inv-chisquare-cdf** is a small TypeScript library for working with the chi-square distribution. It provides its cumulative distribution function (CDF), survival function, and inverse CDF (quantile function), along with the gamma functions used to calculate them.

The inverse CDF answers questions such as: "What chi-square value has 95% of the distribution below it?" This is different from the [inverse-chi-squared distribution](https://en.wikipedia.org/wiki/Inverse-chi-squared_distribution), which is a separate probability distribution.

## Install

```sh
npm install inv-chisquare-cdf
```

Version 2 requires Node.js 24 or later and is ESM-only. CommonJS `require()` is not supported.

## Quick Start

```js
import {
  chiSquareCDF,
  chiSquareSurvival,
  invChiSquareCDF,
} from 'inv-chisquare-cdf';

const criticalValue = invChiSquareCDF(0.95, 5);
console.log(criticalValue); // 11.070497693516351

console.log(chiSquareCDF(criticalValue, 5)); // approximately 0.95
console.log(chiSquareSurvival(criticalValue, 5)); // approximately 0.05
```

`chiSquareSurvival` evaluates the upper tail directly. Prefer it over `1 - chiSquareCDF(...)` when calculating small upper-tail probabilities, because subtraction can lose floating-point precision.

## Example: Is This Die Fair?

Pearson's chi-square goodness-of-fit test can check whether observed die rolls are inconsistent with a fair die. Suppose 100 rolls produced these counts for faces one through six:

```typescript
import { chiSquareSurvival, invChiSquareCDF } from 'inv-chisquare-cdf';

// Indexes 0 through 5 represent faces 1 through 6. Each value is the number
// of times that face appeared in the 100 rolls.
const observedCounts = [16, 18, 16, 14, 20, 16];
const totalRolls = observedCounts.reduce((sum, count) => sum + count, 0);
const expectedCount = totalRolls / observedCounts.length;

const statistic = observedCounts.reduce(
  (sum, count) => sum + (count - expectedCount) ** 2 / expectedCount,
  0,
);

const degreesOfFreedom = observedCounts.length - 1;
const significanceLevel = 0.05;
const criticalValue = invChiSquareCDF(1 - significanceLevel, degreesOfFreedom);
const pValue = chiSquareSurvival(statistic, degreesOfFreedom);

console.log(statistic); // approximately 1.28
console.log(criticalValue); // approximately 11.07
console.log(pValue); // approximately 0.937
console.log(statistic > criticalValue); // false: do not reject fairness
```

The null hypothesis is that every face has probability `1 / 6`. Here the statistic is below the 5% critical value and the p-value is large, so these rolls do not provide evidence that the die is unfair.

> Failing to reject the null hypothesis **does not prove that the die is fair**. The test also assumes independent rolls, and the chi-square approximation generally requires an expected count of at least five in each category.

## API

### `chiSquareCDF(value, degreesOfFreedom)`

Returns the lower-tail probability `P(X <= value)` for a chi-square random variable. `value` must be non-negative and `degreesOfFreedom` must be greater than zero.

### `chiSquareSurvival(value, degreesOfFreedom)`

Returns the upper-tail probability `P(X > value)` for a chi-square random variable. This is commonly the p-value for a chi-square test. `value` must be non-negative and `degreesOfFreedom` must be greater than zero.

### `invChiSquareCDF(probability, degreeOfFreedom)`

Returns the non-negative value `x` for which `P(X <= x) = probability`. `probability` must be strictly between zero and one, and `degreeOfFreedom` must be greater than zero.

### Advanced Functions

These functions support the distribution calculations and are also exported for lower-level numerical use:

- `invRegLowGamma(p, a)` returns the inverse of the lower regularized incomplete gamma function.
- `regLowGamma(a, x)` returns the lower regularized incomplete gamma function `P(a, x)`.
- `logGamma(x)` returns the natural logarithm of the gamma function using the Lanczos approximation.

## Other Uses

Chi-square distribution functions can also be used for:

- Testing whether random digits or roulette outcomes follow expected probabilities.
- Comparing observed genetic traits with expected Mendelian ratios.
- Checking whether manufacturing defects follow an expected category distribution.
- Testing independence in contingency tables after calculating the test statistic.
- Constructing confidence intervals for the variance of normally distributed measurements.
- Setting anomaly thresholds for sums of squared standardized measurements.

## Bibliography

- [Chi-squared distribution](https://en.wikipedia.org/wiki/Chi-squared_distribution)
- [Pearson's chi-squared test](https://en.wikipedia.org/wiki/Pearson%27s_chi-squared_test)
- [Incomplete gamma function](https://en.wikipedia.org/wiki/Incomplete_gamma_function)
- [Lanczos approximation](https://en.wikipedia.org/wiki/Lanczos_approximation)
- [jStat](https://github.com/jstat/jstat)
