# React Alien Signals

![License](https://img.shields.io/github/license/rajaniraiyn/react-alien-signals)
![npm](https://img.shields.io/npm/v/react-alien-signals)
![Build](https://img.shields.io/github/actions/workflow/status/rajaniraiyn/react-alien-signals/docs.yml?branch=main)

React Alien Signals is a **TypeScript** library that provides Jotai-like state management APIs built on top of [Alien Signals](https://github.com/stackblitz/alien-signals). It offers a seamless integration with React, leveraging `useSyncExternalStore` to ensure concurrency-safe re-renders and prevent tearing in concurrent React applications.

## Table of Contents

<details>
    <summary>Click to expand</summary>

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Signals](#basic-signals)
  - [Computed Signals](#computed-signals)
  - [Effects & Effect Scopes](#effects--effect-scopes)
  - [Async Signals](#async-signals)
  - [Computed Collections](#computed-collections)
- [React Hooks](#react-hooks)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

</details>

## Features

- **Basic Signals**: Create and manage reactive state with `createSignal`.
- **Computed Signals**: Derive reactive values based on other signals using `createComputed`.
- **Effects & Effect Scopes**: Run side effects in response to state changes with `createEffect` and manage multiple effects with `createSignalScope`.
- **Async Signals**: Handle asynchronous state with `createAsyncComputed` and `createAsyncEffect`.
- **Computed Collections**: Manage reactive arrays and sets with `createComputedArray` and `createComputedSet`.
- **Equality Computed**: Optimize re-renders with `createEqualityComputed`.
- **React Integration**: Utilize React hooks like `useSignal`, `useSignalValue`, and `useSetSignal` for seamless state management.
- **TypeScript Support**: Fully typed APIs for type safety and IntelliSense.

## Installation

Install `react-alien-signals` and its peer dependency `alien-signals` via npm:

```bash
npm install react-alien-signals alien-signals
```

## Usage

### Basic Signals

Create a writable signal and use it within your components.

```tsx
import React from "react";
import { createSignal, useSignal } from "react-alien-signals";

const countSignal = createSignal(0);

function Counter() {
  const [count, setCount] = useSignal(countSignal);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default Counter;
```

### Computed Signals

Derive reactive values based on other signals.

```tsx
import React from "react";
import {
  createSignal,
  createComputed,
  useSignalValue,
} from "react-alien-signals";

const countSignal = createSignal(1);
const doubleCount = createComputed(() => countSignal.get() * 2);

function Display() {
  const double = useSignalValue(doubleCount);

  return <div>Double Count: {double}</div>;
}

export default Display;
```

### Effects & Effect Scopes

Run side effects in response to state changes and manage multiple effects.

```tsx
import React from "react";
import {
  createSignal,
  createEffect,
  useSignalScope,
} from "react-alien-signals";

const countSignal = createSignal(0);

function Logger() {
  const scope = useSignalScope();

  scope.run(() => {
    createEffect(() => {
      console.log("Count changed:", countSignal.get());
    });
  });

  return null;
}

export default Logger;
```

### Async Signals

Handle asynchronous state with async computed signals and effects.

```tsx
import React from "react";
import {
  createSignal,
  unstable_createAsyncComputed,
  unstable_useAsyncComputedValue,
} from "react-alien-signals";

const dataSignal = createSignal("initial");

const asyncData = unstable_createAsyncComputed<string>(async function* () {
  yield dataSignal;
  const response = await fetch(
    `https://api.example.com/data?query=${dataSignal.get()}`,
  );
  const data = await response.text();
  return data;
});

function AsyncDisplay() {
  const data = unstable_useAsyncComputedValue(asyncData);

  return <div>Async Data: {data ?? "Loading..."}</div>;
}

export default AsyncDisplay;
```

### Computed Collections

Manage reactive arrays and sets.

```tsx
import React from "react";
import {
  createSignal,
  unstable_createComputedArray,
  unstable_createComputedSet,
  useSignalValue,
} from "react-alien-signals";

const numbersSignal = createSignal([1, 2, 3]);
const doubledNumbers = unstable_createComputedArray(
  numbersSignal,
  (itemSignal) => () => itemSignal.get() * 2,
);

const numberSetSignal = createSignal(new Set([1, 2]));
const doubledSet = unstable_createComputedSet(numberSetSignal);

function CollectionsDisplay() {
  const doubled = useSignalValue(doubledNumbers);
  const doubledSetValue = useSignalValue(doubledSet);

  return (
    <div>
      <p>Doubled Numbers: {doubled.join(", ")}</p>
      <p>Doubled Set: {[...doubledSetValue].join(", ")}</p>
    </div>
  );
}

export default CollectionsDisplay;
```

## React Hooks

React Alien Signals provides several hooks to interact with signals:

- `useSignal(signal)`: Returns `[value, setValue]`.
- `useSignalValue(signal)`: Returns the current value (read-only).
- `useSetSignal(signal)`: Returns a setter function (write-only).
- `useSignalEffect(effectFn)`: Runs a side effect based on signal changes.
- `useSignalScope()`: Manages effect scopes within a component.
- `unstable_useAsyncComputedValue(asyncComputed)`: Retrieves the value from an async computed signal.
- `unstable_useAsyncEffect(asyncEffectFn)`: Runs an asynchronous effect.

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) before getting started.

## License

[MIT](LICENSE)

## Acknowledgements

- [Alien Signals](https://github.com/stackblitz/alien-signals) by [StackBlitz](https://stackblitz.com) for the foundational signal implementation.
- [Jotai](https://github.com/pmndrs/jotai) for inspiring the API design.
