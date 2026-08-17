# Contributing

Issues and pull requests are welcome. For bugs, include a minimal reproduction,
the expected behavior, the actual behavior, and your React and runtime versions.

## Local setup

```bash
git clone https://github.com/your-username/react-alien-signals.git
cd react-alien-signals
bun install
```

Use the Bun version declared in `package.json` so the lockfile and CI environment
stay consistent.

## Checks

Run these before opening a pull request:

```bash
bun run typecheck
bun run compiler:check
bun test
bun run build
```

For performance-related changes, also run:

```bash
bun run benchmark
```

Benchmarks should validate their result as well as measure it. Compare several
runs and avoid presenting a single local result as universal.

## Pull requests

- Keep changes focused and explain why they are needed.
- Add tests for observable behavior changes and regressions.
- Update public API documentation when signatures or semantics change.
- Use clear commit subjects such as `feat:`, `fix:`, `perf:`, `test:`, or `docs:`.
