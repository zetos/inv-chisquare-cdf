# Chi-square distribution functions [![CI](https://github.com/zetos/inv-chisquare-cdf/actions/workflows/ci.yml/badge.svg)](https://github.com/zetos/inv-chisquare-cdf/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/zetos/inv-chisquare-cdf/graph/badge.svg)](https://codecov.io/gh/zetos/inv-chisquare-cdf)

**inv-chisquare-cdf** is a small TypeScript library for working with the chi-square distribution. It provides cumulative, survival, and inverse distribution functions, plus helpers for Pearson goodness-of-fit tests and normal-population variance intervals.

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

## Goodness Of Fit: Is This Die Fair?

Pearson's chi-square goodness-of-fit test can check whether observed die rolls are inconsistent with a fair die. Suppose 100 rolls produced these counts for faces one through six:

```typescript
import { chiSquareGoodnessOfFit } from 'inv-chisquare-cdf';

// Indexes 0 through 5 represent faces 1 through 6. Each value is the number
// of times that face appeared in the 100 rolls.
const observedCounts = [16, 18, 16, 14, 20, 16];
const expectedCounts = [100 / 6, 100 / 6, 100 / 6, 100 / 6, 100 / 6, 100 / 6];
const result = chiSquareGoodnessOfFit(observedCounts, expectedCounts);

console.log(result.statistic); // approximately 1.28
console.log(result.degreesOfFreedom); // 5
console.log(result.pValue); // approximately 0.937
```

The null hypothesis is that every face has probability `1 / 6`. Here the p-value is large, so these rolls do not provide evidence that the die is unfair. The helper deliberately returns no `rejected` decision: callers choose a significance level appropriate to their application.

> Failing to reject the null hypothesis **does not prove that the die is fair**. The test also assumes independent rolls, and the chi-square approximation generally requires an expected count of at least five in each category.

`expectedCounts` contains counts, not probabilities or relative weights. Its total must match the observed total; the function does not silently rescale expected values.

## Variance Confidence Interval

For independent observations from a normal population, a chi-square interval can describe the uncertainty in the population variance. The sample variance must be the unbiased variance calculated with an `n - 1` denominator.

```typescript
import { normalVarianceConfidenceInterval } from 'inv-chisquare-cdf';

// Twenty fill measurements have an unbiased sample variance of 4 mL^2.
const interval = normalVarianceConfidenceInterval(4, 20, 0.95);

console.log(interval.lower); // approximately 2.31
console.log(interval.upper); // approximately 8.53

const standardDeviationInterval = {
  lower: Math.sqrt(interval.lower),
  upper: Math.sqrt(interval.upper),
};
```

The interval relies on normality and independence. It is not a distribution-free confidence interval for arbitrary data.

## API

### `chiSquareCDF(value, degreesOfFreedom)`

Returns the lower-tail probability `P(X <= value)` for a chi-square random variable. `value` must be non-negative and `degreesOfFreedom` must be greater than zero.

### `chiSquareSurvival(value, degreesOfFreedom)`

Returns the upper-tail probability `P(X > value)` for a chi-square random variable. This is commonly the p-value for a chi-square test. `value` must be non-negative and `degreesOfFreedom` must be greater than zero.

### `chiSquareStatistic(observed, expected)`

Returns Pearson's statistic `sum((observed - expected)^2 / expected)`. Both arrays must be non-empty and have the same length. Observed values may be any finite non-negative frequencies, while expected values must be finite and greater than zero.

This primitive does not require matching totals or choose degrees of freedom, making it suitable when a caller needs to apply domain-specific rules:

```typescript
import { chiSquareStatistic, chiSquareSurvival } from 'inv-chisquare-cdf';

const statistic = chiSquareStatistic([20.5, 29.5], [25, 25]);
const pValue = chiSquareSurvival(statistic, 1);
```

### `chiSquareGoodnessOfFit(observed, expected, options?)`

Performs Pearson's goodness-of-fit test and returns `{ statistic, degreesOfFreedom, pValue }`. It requires at least two categories, non-negative integer observed counts, positive expected counts, and matching observed and expected totals. Only small floating-point summation differences between totals are tolerated.

By default, degrees of freedom are `number of categories - 1`. If parameters of the expected distribution were estimated from these observations, provide their count:

```typescript
const result = chiSquareGoodnessOfFit(
  [18, 22, 27, 33],
  [20, 20, 30, 30],
  { estimatedParameters: 1 },
);
```

For models with another degrees-of-freedom calculation, provide the final value explicitly. Positive fractional values are supported:

```typescript
const result = chiSquareGoodnessOfFit(
  [18, 22, 27, 33],
  [20, 20, 30, 30],
  { degreesOfFreedom: 2.5 },
);
```

`estimatedParameters` and `degreesOfFreedom` are mutually exclusive. The expected-count recommendation of at least five is documented but not enforced because combining sparse categories requires subject-matter judgment.

### `invChiSquareCDF(probability, degreeOfFreedom)`

Returns the non-negative value `x` for which `P(X <= x) = probability`. `probability` must be strictly between zero and one, and `degreeOfFreedom` must be greater than zero.

### `normalVarianceConfidenceInterval(sampleVariance, sampleSize, confidenceLevel?)`

Returns `{ lower, upper }` for the variance of a normally distributed population. `sampleVariance` must be a finite, non-negative unbiased sample variance, `sampleSize` must be an integer greater than one, and `confidenceLevel` must be strictly between zero and one. The confidence level defaults to `0.95`; a zero sample variance returns `{ lower: 0, upper: 0 }`.

Confidence levels so close to one that JavaScript rounds the required upper-tail quantile probability to one are rejected rather than returning a misleading interval.

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
