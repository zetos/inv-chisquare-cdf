# Repository Guide

## Setup and layout

- Use Node.js 24 (`.nvmrc`) and install locked dependencies with `npm ci`.
- This is an ESM-only TypeScript library. Keep `.js` extensions on relative imports and exports in `.ts` source files; `tsconfig.json` uses `NodeNext` resolution.
- `src/index.ts` is the public package surface. Source and `node:test` tests compile together into the ignored `dist/` directory.

## Validation

- CI runs `npm run typecheck` followed by `npm run coverage`; use that order for complete verification.
- Tests run against compiled output. For a focused test, run `npm run build && node --test --test-reporter=spec dist/test/<name>.test.js`.
- Use `test/assertClose.ts` for floating-point assertions rather than strict equality.
- When changing exports or package contents, run `npm run check:package` to inspect the npm tarball file list.

## Releases

- Add a Changeset (`npm run changeset`) for every consumer-visible published-package change, using the smallest appropriate SemVer bump.
- Do not edit `CHANGELOG.md` manually; Changesets generates it during versioning. The release workflow publishes after the generated version pull request is merged to `master`.
