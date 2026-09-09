---
name: functional-refactoring
description: Use when refactoring TypeScript or JavaScript numerical, array-processing, or iterative code toward immutable functional patterns such as folds, reducers, pure state transitions, or safely bounded recursion.
compatibility: opencode
metadata:
  project: inv-chisquare-cdf
  language: typescript
---

# Functional Refactoring

Refactor incrementally toward clear, immutable code without sacrificing numerical behavior, runtime safety, or readability. Treat functional techniques as tools, not requirements.

## Core Principles

- Inspect the implementation, tests, call sites, and repository instructions before proposing a rewrite.
- Establish current behavior before editing, including validation order, errors, boundary values, and floating-point results.
- Prefer `const`, immutable module-level tables, expressions, and pure state transitions over reassignment when they simplify the code.
- Prefer the smallest correct change. Do not introduce helpers, abstractions, state objects, or intermediate arrays solely to make code appear functional.
- Preserve imperative iteration when it is clearer, safer, or more efficient than the functional alternatives.
- Follow `AGENTS.md` and the existing project conventions throughout the work.

## Learn From Haskell

Consult established Haskell implementations when they provide useful precedent for folds, recurrence relations, polynomial evaluation, or explicit state transitions. For special functions, the `haskell/math-functions` package is a useful reference.

Translate semantics rather than syntax:

- A strict left fold over a finite vector generally maps to a left-to-right `reduce` over an existing JavaScript array.
- An accumulator should represent the minimal state needed for the next calculation.
- A Haskell tail-recursive function does not imply safe JavaScript recursion. JavaScript engines do not guarantee tail-call optimization.
- Haskell's immutable data structures and compiler optimizations do not make repeated JavaScript object or array allocation free.

Record the source and the specific idea it supports when external code materially influences a refactor. Do not replace the project's algorithm merely because the reference uses a different approximation.

## Choose The Construct

Classify each loop before changing it.

### Fixed Collection

Prefer a left-to-right `reduce` when every element is processed, the collection already exists, and the accumulator remains simple.

Verify that the reducer preserves:

- Element order.
- Initial accumulator value.
- Index offsets.
- Floating-point grouping.
- Return behavior.

Do not use `reduceRight`, reorder terms, or split a numerical sum unless the changed rounding behavior is intentional and tested.

### Small Bounded Recurrence

Consider recursion only when the maximum depth is statically known, small, and independent of untrusted or potentially large input. State the maximum depth before choosing recursion.

Prefer a loop when recursion requires complex parameter threading, obscures early returns, or makes the code larger. Never rely on tail-call optimization for stack safety.

### Input-Dependent Or Convergent Iteration

Retain iteration when the number of steps depends on input size, numerical convergence, or a potentially large bound. Do not materialize `Array.from({ length: n })` merely to replace a loop with `reduce`; that changes constant-space iteration into linear-space allocation.

If mutable state is difficult to understand, first improve names, narrow its scope, or isolate a pure step calculation. Do not force the entire control flow into immutable object copies when that creates allocation pressure in a numerical hot path.

### Early Exit

Loops are usually the clearest representation for `break`, `continue`, and early `return`. A reducer carrying a `done` flag still invokes its callback for remaining elements and is not an equivalent simplification.

## Numerical Safety

Treat arithmetic structure as observable behavior.

- Preserve coefficient values and order exactly.
- Preserve left-to-right accumulation unless accuracy analysis justifies a change.
- Check pre-increment and post-increment translations for off-by-one errors.
- Avoid algebraic regrouping that changes overflow, underflow, cancellation, or rounding.
- Preserve validation order, exact error messages, special values, and public return conventions.
- Inspect downstream exponential, logarithmic, and inverse calculations that may amplify small differences.

For a floating-point refactor, compare the old and new implementations over representative boundaries and a broad deterministic input range. Report the largest difference and confirm that it is within the project's accepted tolerance. Use `test/assertClose.ts` in committed tests rather than strict equality unless exact equality is part of the contract.

## Complexity Gate

Before editing, compare the existing and proposed implementations:

| Concern | Required check |
| --- | --- |
| Time | Do not worsen asymptotic complexity or perform avoidable extra iterations. |
| Space | Do not allocate an input-sized range or repeated state objects without a concrete benefit. |
| Stack | Prove a small recursion bound; otherwise avoid recursion. |
| Numerical behavior | Preserve order and compare outputs when arithmetic structure changes. |
| Readability | The resulting control flow should be shorter or easier to reason about. |

Reject or narrow the refactor if it fails any gate. Explain why retaining a loop is the more functional engineering choice when it keeps effects local and behavior explicit.

## Repository Guidance

Apply these current classifications unless the implementation changes:

- `src/logGamma.ts`: its fixed Lanczos coefficient table is suitable for a left fold. Keep coefficients immutable and module-scoped, and preserve denominator indexing and accumulation order.
- `src/regLowGamma.ts`: its iteration limit depends on the shape parameter. Avoid recursive conversion and avoid constructing a range proportional to that limit.
- `src/invRegLowGamma.ts`: its Newton iteration is bounded to 12 steps, but it has early exits and convergence termination. Consider recursion only if it makes those transitions clearer without changing evaluation behavior.
- `src/invChiSquareCDF.ts`: it has no iterative mutation to remove; do not refactor code merely for stylistic churn.
- Test-only recurrences can have different performance constraints, but still check their maximum depth and failure behavior.

Reassess these classifications from the current source on every invocation rather than assuming this document is permanently current.

## Workflow

1. Read the target code, tests, callers, and `AGENTS.md`.
2. Identify each mutation and classify each loop using the categories above.
3. Establish a test baseline and note missing edge coverage.
4. Research a Haskell or other trusted functional implementation when it can clarify the algorithm or folding pattern.
5. Compare the existing loop, a fold, and recursion for time, space, stack depth, early exits, allocations, readability, and numerical order.
6. Present the recommended approach before a substantial or risky rewrite. For a small safe change, implement directly.
7. Make the smallest coherent edit and preserve the public API unless the user explicitly requests a behavior change.
8. Run focused tests when useful, then run `npm run typecheck` followed by `npm run coverage`.
9. Perform deterministic differential testing when the floating-point operation sequence may have changed.
10. Review the final diff for accidental churn and report retained loops along with the safety reason.

## Completion Criteria

A refactor is complete only when:

- Mutation was removed or contained where doing so improved the implementation.
- Every recursion has a documented safe depth.
- No reducer introduced unnecessary input-sized allocation.
- Numerical and boundary behavior remains within the established contract.
- Direct and downstream tests pass.
- The final explanation includes the chosen construct, rejected alternatives, complexity impact, and verification results.

Do not add a Changeset for an internal behavior-preserving refactor. Add the smallest appropriate Changeset only when published consumer behavior changes.
