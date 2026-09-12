# inv-chisquare-cdf

## 2.2.2

### Patch Changes

- [`50f4aef`](https://github.com/zetos/inv-chisquare-cdf/commit/50f4aefb2797afe12bb507db47b788d1b1017611) Thanks [@zetos](https://github.com/zetos)! - Remove the Node.js engine restriction so ESM-capable runtimes such as Bun can install and run the package. Improve npm package search keywords.

## 2.2.1

### Patch Changes

- [#43](https://github.com/zetos/inv-chisquare-cdf/pull/43) [`8600484`](https://github.com/zetos/inv-chisquare-cdf/commit/8600484680844872bdbd0766c1c30975b1793b41) Thanks [@zetos](https://github.com/zetos)! - Improve incomplete gamma precision for large shapes near the transition zone.

## 2.2.0

### Minor Changes

- [#41](https://github.com/zetos/inv-chisquare-cdf/pull/41) [`efe374e`](https://github.com/zetos/inv-chisquare-cdf/commit/efe374e8fd5ade69f6ffea5cec2cfd9ba9774dda) Thanks [@zetos](https://github.com/zetos)! - Add Pearson chi-square statistic and goodness-of-fit helpers, plus confidence intervals for the variance of a normal population.

## 2.1.1

### Patch Changes

- [#38](https://github.com/zetos/inv-chisquare-cdf/pull/38) [`81f0172`](https://github.com/zetos/inv-chisquare-cdf/commit/81f01720e87ba0168f9f0fed338a2a3eaa7cc7f2) Thanks [@zetos](https://github.com/zetos)! - Correct upper-tail probabilities for small shape and argument values, and improve accuracy and runtime near the large-shape transition.

## 2.1.0

### Minor Changes

- [#36](https://github.com/zetos/inv-chisquare-cdf/pull/36) [`8fd0610`](https://github.com/zetos/inv-chisquare-cdf/commit/8fd0610a0963055076ac3e8d5dc21afb9a3f0fb1) Thanks [@zetos](https://github.com/zetos)! - Add chi-square cumulative distribution and numerically stable survival functions.

### Patch Changes

- [#36](https://github.com/zetos/inv-chisquare-cdf/pull/36) [`8fd0610`](https://github.com/zetos/inv-chisquare-cdf/commit/8fd0610a0963055076ac3e8d5dc21afb9a3f0fb1) Thanks [@zetos](https://github.com/zetos)! - Improve gamma-function precision and performance with convergence-based evaluation, stable upper-tail calculations, and safe handling of very small or large shape parameters.

## 2.0.1

### Patch Changes

- [`f1edb77`](https://github.com/zetos/inv-chisquare-cdf/commit/f1edb773cace7398d65b43382f029131c88e5ebc) Thanks [@zetos](https://github.com/zetos)! - Add editor documentation and usage examples for every public function.

## 2.0.0

### Major Changes

- [#33](https://github.com/zetos/inv-chisquare-cdf/pull/33) [`eff3652`](https://github.com/zetos/inv-chisquare-cdf/commit/eff3652812bd8bd5cd3bea0cadfe1aa90d5aba49) Thanks [@zetos](https://github.com/zetos)! - Migrate the package to TypeScript and an ESM-only distribution. Node.js 24 or later is now required.
