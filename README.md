# Inverse Chi-squared cumulative distribution function [![CI](https://github.com/zetos/inv-chisquare-cdf/actions/workflows/ci.yml/badge.svg)](https://github.com/zetos/inv-chisquare-cdf/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/zetos/inv-chisquare-cdf/graph/badge.svg)](https://codecov.io/gh/zetos/inv-chisquare-cdf)

**inv-chisquare-cdf** is an alternative implementation of the `jStat.chisquare.inv` in the *jStat* package using ES6.

## Install

```sh
npm install inv-chisquare-cdf
```

This v2 release requires Node.js 24 or later and is ESM-only.

```js
import {
  invChiSquareCDF,
  invRegLowGamma,
  logGamma,
  regLowGamma,
} from 'inv-chisquare-cdf';
```

CommonJS `require()` is not supported in v2.

## Functions
* `invChiSquareCDF(probability, degreeOfFreedom)` 
Returns the inverse chi-square cdf with "degreeOfFreedom" for the "probability" using the Lanczos approximation.

* `invRegLowGamma(p, a)`
Returns the inverse of the lower regularized incomplete Gamma function evaluated at (p,a).

* `regLowGamma(a, x)`
Returns the lower regularized incomplete gamma function evaluated at (a,x).

* `logGamma(x)`
Returns the logarithm of the gamma function

## Bibliography
* [jStat](https://github.com/jstat/jstat)
* [Lanczos approximation](https://en.wikipedia.org/wiki/Lanczos_approximation)
* [Inverse-chi-squared distribution](https://en.wikipedia.org/wiki/Inverse-chi-squared_distribution)
