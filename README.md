# React Alien Signals

![License](https://img.shields.io/github/license/rajaniraiyn/react-alien-signals)
![npm](https://img.shields.io/npm/v/react-alien-signals)
![Build](https://img.shields.io/github/actions/workflow/status/rajaniraiyn/react-alien-signals/docs.yml?branch=main)

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
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

</details>

## Features

- **Basic Signals**: Create and manage reactive state with `createSignal`
- **Computed Signals**: Derive reactive values based on other signals using `createComputed`
- **Effects & Effect Scopes**: Run side effects in response to state changes with `createEffect` and manage multiple effects with `createSignalScope`
- **React Integration**: Utilize hooks like `useSignal`, `useSignalValue`, and `useSetSignal` for seamless state management
- **TypeScript Support**: Fully typed APIs for type safety and IntelliSense

## Installation

Install `react-alien-signals` and its peer dependency `alien-signals` via npm:

```bash
npm install react-alien-signals alien-signals
```

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
- `useSetSignal(signal)`: Returns a setter function (write-only)
- `useSignalEffect(effectFn)`: Runs a side effect based on signal changes
- `useSignalScope(callback)`: Manages effect scopes within a component
- `useComputed(getter)`: Creates and subscribes to a computed signal

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) before getting started.

## License

[MIT](LICENSE)

## Acknowledgements

- [Alien Signals](https://github.com/stackblitz/alien-signals) by [StackBlitz](https://stackblitz.com) for the foundational signal implementation
