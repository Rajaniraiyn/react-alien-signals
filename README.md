# React Alien Signals

[![License](https://img.shields.io/github/license/rajaniraiyn/react-alien-signals)](https://github.com/rajaniraiyn/react-alien-signals/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/react-alien-signals)](https://www.npmjs.com/package/react-alien-signals)
[![Build](https://img.shields.io/github/actions/workflow/status/rajaniraiyn/react-alien-signals/ci.yml?branch=main)](https://github.com/rajaniraiyn/react-alien-signals/actions/workflows/ci.yml)

React Alien Signals is a **TypeScript** library that provides hooks built on top of [Alien Signals](https://github.com/stackblitz/alien-signals). It offers a seamless integration with React, ensuring concurrency-safe re-renders without tearing.

## Table of Contents

<details>
    <summary>Click to expand</summary>

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Signals](#basic-signals)
  - [Computed Signals](#computed-signals)
  - [Effects & Effect Scopes](#effects--effect-scopes)
- [React Hooks](#react-hooks)
- [Concurrent Rendering](#concurrent-rendering)
- [Benchmarks](#benchmarks)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

</details>

## Features

- **Basic Signals**: Create and manage reactive state with `createSignal`
- **Computed Signals**: Derive reactive values based on other signals using `createComputed`
- **Effects & Effect Scopes**: Run side effects in response to state changes with `createEffect` and manage multiple effects with `createSignalScope`
- **Tear-free React integration**: Shares stable `useSyncExternalStore` adapters between subscribers
- **Selective subscriptions**: Avoid unrelated renders with `useSignalSelector`
- **Concurrent UI tools**: Defer signal-driven UI with `useDeferredSignalValue`
- **Lifecycle effects**: Run explicit signal dependencies in React's insertion, layout, or passive phase
- **Batching**: Coalesce multiple signal writes with `batch`
- **React Compiler compatible**: Every exported hook is checked by React Compiler in CI
- **TypeScript Support**: Fully typed APIs for type safety and IntelliSense

## Installation

Install `react-alien-signals` and its peer dependency `alien-signals` via npm:

```bash
npm install react-alien-signals alien-signals
```

The current release line targets React 19.2 or newer and Alien Signals 3.2.

## Usage

### Basic Signals

Create a writable signal and use it within your components:

```tsx
import { createSignal, useSignal } from "react-alien-signals";

const count = createSignal(0);

function Counter() {
  const [value, setValue] = useSignal(count);

  return (
    <button onClick={() => setValue(value + 1)}>
      Count: {value}
    </button>
  );
}
```

### Computed Signals

Create derived state that automatically updates:

```tsx
import { createSignal, createComputed, useSignalValue } from "react-alien-signals";

const count = createSignal(1);
const double = createComputed(() => count() * 2);

function Display() {
  const doubleValue = useSignalValue(double);
  return <div>Double: {doubleValue}</div>;
}
```

### Effects & Effect Scopes

Run side effects in response to signal changes:

```tsx
import { createSignal, createEffect, useSignalScope } from "react-alien-signals";

const count = createSignal(0);

function Logger() {
  useSignalScope(() => {
    createEffect(() => {
      console.log('Count changed:', count());
    });
  });

  return null;
}
```

## React Hooks

React Alien Signals provides several hooks to interact with signals:

- `useSignal(signal)`: Returns `[value, setValue]` tuple for reading and writing
- `useSignalValue(signal)`: Returns the current value (read-only)
- `useDeferredSignalValue(signal, initialValue?)`: Returns a deferred signal snapshot
- `useSignalSelector(signal, selector)`: Subscribes only to the selected value
- `useSetSignal(signal)`: Returns a setter function (write-only)
- `useSignalEffect(effectFn)`: Runs a side effect based on signal changes
- `useSignalPassiveEffect(signals, effectFn, deps?)`: Runs explicit signal dependencies in React's passive phase
- `useSignalLayoutEffect(signals, effectFn, deps?)`: Runs explicit signal dependencies in React's layout phase
- `useSignalInsertionEffect(signals, effectFn, deps?)`: Runs explicit signal dependencies in React's insertion phase
- `useSignalScope(callback)`: Manages effect scopes within a component
- `useComputed(getter, deps)`: Creates and subscribes to a computed signal

### `useComputed(getter, deps)`

The `useComputed` hook expects a getter and a dependency array.
The dependency array is similar to a dependency array used in [`useMemo`](https://react.dev/reference/react/useMemo) or [`useEffect`](https://react.dev/reference/react/useEffect)
Here is an example

```ts
function Component({ a }) {
  useComputed(
    () => {
      return a + mySignal();
    },
    [a, mySignal],
  );
}
```

### Batching writes

```ts
import { batch } from "react-alien-signals";

batch(() => {
  firstName("Ada");
  lastName("Lovelace");
});
```

## Concurrent Rendering

Signal snapshots remain consistent across concurrent React renders through
`useSyncExternalStore`. External-store writes are synchronous by React's design,
including when they happen inside `startTransition`; use
`useDeferredSignalValue` when a signal-driven subtree may render later.

React automatically batches component renders caused by multiple signal writes in
the same event or task. Most application code therefore needs no batching API.
Use `batch` only when you also need to prevent intermediate Alien Signals
computed values and effects from propagating between a group of writes.

`useOptimistic` is best kept for Action-owned optimistic state rather than used as
a second signal store. Effect scopes start only after a component commits, so
server rendering and abandoned renders do not leak effects. Lifecycle-specific
signal effects require an explicit, referentially stable signal list so React can
run them in the requested phase.

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) before getting started.

## Releasing

Releases are automated from version tags. Update the version in `package.json`, commit the change, then create and push the matching tag:

```bash
git tag v0.4.0
git push origin v0.4.0
```

The release workflow verifies, tests, and builds the package, stages it on npm through trusted publishing for manual approval, deploys the API documentation to GitHub Pages, and creates a GitHub Release with automatically generated notes. The tag must exactly match `v` followed by the version in `package.json`.

## Benchmarks

Run the local comparison against raw React state, TanStack Store, Jotai, and
Zustand:

```bash
bun run benchmark
```

The benchmark validates committed render counts and reports medians across
multiple interleaved samples. It reports automatic React render batching and
explicit Alien signal-graph batching separately: React batching removes extra
commits, while `batch` additionally removes intermediate computed/effect
propagation. Treat the numbers as a local regression signal rather than a
universal ranking; hardware, runtime versions, application shape, and scheduler
load all affect results.

## License

[MIT](LICENSE)

## Acknowledgements

- [Alien Signals](https://github.com/stackblitz/alien-signals) by [StackBlitz](https://stackblitz.com) for the foundational signal implementation
