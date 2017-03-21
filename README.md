# Inverse Chi-squared cumulative distribution function [![Build Status](https://travis-ci.org/zetos/inv-chisquare-cdf.svg?branch=master)](https://travis-ci.org/zetos/inv-chisquare-cdf) [![Coverage Status](https://coveralls.io/repos/github/zetos/inv-chisquare-cdf/badge.svg?branch=master)](https://coveralls.io/github/zetos/inv-chisquare-cdf?branch=master)

**inv-chisquare-cdf** is an alternative implementation of the `jStat.chisquare.inv` in the *jStat* package using ES6.

## Install
`$ npm install --save inv-chisquare-cdf`

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
