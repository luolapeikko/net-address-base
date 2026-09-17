# AGENTS.md

## Ground rules (always)

- Be conservative, explicit, and boring.
- When unsure, ask; don’t guess.
- Make minimal, targeted changes; avoid refactors unless requested/necessary.
- Preserve existing structure, conventions, and tooling.
- Don’t add dependencies without strong justification.
- Don't try to make git commits.

## TypeScript

- Write strict, idiomatic TS; follow the repo’s tsconfig and lint rules.
- No `any` (use `unknown`, generics, or proper types).
- Prefer `interface` for clear public API or "Adapter" shapes; `type` for other cases.
- Prefer immutability (`readonly`, `ReadonlyArray`) where practical.
- Narrow with type guards; avoid assertions and `!` except as a last resort.
- Prefer exhaustive handling (`never` checks) for unions and switches.
- Treat caught errors as `unknown` and narrow before use.

## Project Structure and Conventions

- Uses pnpm-workspace for managing monorepo packages, where packages are in the `packages` directory.
- root level pnpm handles building `pnpm run build` and testing `pnpm t` (also includes pre-build) for all packages in the monorepo.
- Linting and formatting `pnpm run lint` are handled at the root level for consistency across all packages.
- Type validation is built in and can be run with `pnpm run validate`.
- If public methods possibly have errors, then we should have two methods, one returning a `CoreResult` and another throwing on error (e.g., `from` and `fromOrThrow`) where Result is used and throw is unwrapped with `uw` function.
- Use error types to indicate the nature of failures like RangeError for out-of-range values, TypeError for invalid types, etc.

## Style, docs

- Have clear JSDoc documentation for all methods and functions, including parameter and return types.
- Use JSDoc `{@link xxx}` for referencing other types, methods, or functions within the documentation for typedoc generation even for known global types.(like Promise, Array, Map)

## MUST NOT

- Change public APIs or introduce breaking changes without explicit instruction.
- Perform stylistic rewrites or micro-optimizations.

## Verify after finalizing change

- Validate TypeScript types (`pnpm run validate`).
- Ensure all tests pass (`pnpm t`).
- Confirm linting and formatting are correct (`pnpm run lint`).
- Check no errors on typedoc documentation generation (`pnpm run docs`)
- Check that public APIs remain consistent and no breaking changes were introduced.
