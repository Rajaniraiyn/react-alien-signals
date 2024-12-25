/**
 *
 * React Alien Signals is a **TypeScript** library that provides hooks built on top of [Alien Signals](https://github.com/stackblitz/alien-signals).
 * It offers a seamless integration with React, ensuring concurrency-safe re-renders without tearing.
 *
 * @module react-alien-signals
 */

import {
  computed as alienComputed,
  effect as alienEffect,
  effectScope as alienEffectScope,
  signal as alienSignal,
  unstable as alienUnstable,
  Effect,
  type Computed,
  type Dependency,
  type EffectScope,
  type ISignal,
  type IWritableSignal,
} from "alien-signals";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

declare class AsyncComputed<T = any> extends Computed {
    get(): Promise<T>;
    //@ts-expect-error
    update(): Promise<boolean>;
}

/**
 * Creates a writable Alien Signal.
 *
 * @example
 * ```typescript
 * const countSignal = createSignal(0);
 * countSignal.set(10); // sets the value to 10
 * ```
 *
 * @template T - The type of the signal value.
 * @param {T} initialValue - The initial value of the signal.
 * @returns {IWritableSignal<T>} The created Alien Signal.
 */
export function createSignal<T>(initialValue: T): IWritableSignal<T> {
  return alienSignal<T>(initialValue);
}

/**
 * Creates a computed Alien Signal based on a getter function.
 *
 * @example
 * ```typescript
 * const countSignal = createSignal(1);
 * const doubleSignal = createComputed(() => countSignal.get() * 2);
 * ```
 *
 * @template T - The type of the computed value.
 * @param {() => T} fn - A getter function returning a computed value.
 * @returns {ISignal<T>} The created computed signal.
 */
export function createComputed<T>(fn: () => T): ISignal<T> {
  return alienComputed<T>(fn);
}

/**
 * Creates a side effect in Alien Signals.
 *
 * @example
 * ```typescript
 * const countSignal = createSignal(1);
 * createEffect(() => {
 *   console.log('Count is', countSignal.get());
 * });
 * ```
 *
 * @template T - The type of the effect value.
 * @param {() => T} fn - A function that will run whenever its tracked signals update.
 * @returns {Effect<T>} The created effect object.
 */
export function createEffect<T>(fn: () => T): Effect<T> {
  return alienEffect(fn);
}

/**
 * Creates an Alien Signals effect scope. This scope can manage multiple effects,
 * allowing you to stop or start them together.
 *
 * @example
 * ```typescript
 * const scope = createSignalScope();
 * scope.run(() => {
 *   // create effects in here...
 * });
 * ```
 *
 * @returns {EffectScope} The created effect scope.
 */
export function createSignalScope(): EffectScope {
  return alienEffectScope();
}

/**
 * Creates an async computed signal in Alien Signals. The getter is an async generator
 * that yields dependencies and finally resolves to a computed value.
 *
 * @example
 * ```typescript
 * const asyncComp = createAsyncComputed<number>(async function* () {
 *   yield someDependency;
 *   return 42;
 * });
 * ```
 *
 * @template T - The type of the computed value.
 * @param {() => AsyncGenerator<Dependency, T>} getter - An async generator returning dependencies and ultimately a value.
 * @returns {AsyncComputed<T>} The created async computed signal.
 * @experimental
 */
export function unstable_createAsyncComputed<T>(
  getter: () => AsyncGenerator<Dependency, T>,
): AsyncComputed<T> {
  return alienUnstable.asyncComputed<T>(getter);
}

/**
 * Creates an async effect in Alien Signals. The function is an async generator
 * that yields dependencies as they are discovered.
 *
 * @example
 * ```typescript
 * createAsyncEffect(async function* () {
 *   yield someDependency;
 *   console.log('Async effect done!');
 * });
 * ```
 *
 * @template T - The type of the effect value.
 * @param {() => AsyncGenerator<Dependency, T>} fn - An async generator returning dependencies.
 * @returns {Promise<T>} The created async effect object.
 */
export async function unstable_createAsyncEffect<T>(
  fn: () => AsyncGenerator<Dependency, T>,
): Promise<T> {
  const eff = alienUnstable.asyncEffect(fn);

  // Immediately run the effect and return its promise
  const final = await eff.run();
  return final;
}

/**
 * Creates a computed array signal in Alien Signals, deriving a reactive
 * array from an original signal array.
 *
 * @example
 * ```typescript
 * const numbersSignal = createSignal([1, 2, 3]);
 * const compArray = createComputedArray(numbersSignal, (itemSignal, i) => () => {
 *   return itemSignal.get() * 2;
 * });
 * ```
 *
 * @template I - The type of the items in the input array.
 * @template O - The type of the items in the output array.
 * @param {ISignal<I[]>} arr - Signal containing an array.
 * @param {(itemSignal: ISignal<I>, index: number) => () => O} getGetter - A function returning a getter for each item signal.
 * @returns {Readonly<O[]>} A proxied array signal.
 * @experimental
 */
export function unstable_createComputedArray<I, O>(
  arr: ISignal<I[]>,
  getGetter: (itemSignal: ISignal<I>, index: number) => () => O,
): Readonly<O[]> {
  return alienUnstable.computedArray<I, O>(arr, getGetter);
}

/**
 * Creates a computed Set signal in Alien Signals that tracks changes
 * to a source Set signal.
 *
 * @example
 * ```typescript
 * const setSignal = createSignal(new Set([1, 2]));
 * const compSet = createComputedSet(setSignal);
 * ```
 *
 * @template T - The type of the items in the Set.
 * @param {IWritableSignal<Set<T>>} source - A signal containing a Set.
 * @returns {ISignal<Set<T>>} A computed signal referencing that Set.
 * @experimental
 */
export function unstable_createComputedSet<T>(
  source: IWritableSignal<Set<T>>,
): ISignal<Set<T>> {
  return alienUnstable.computedSet<T>(source);
}

/**
 * Creates an equality-based computed signal, only updating when the new value
 * is not deeply equal to the old value.
 *
 * @example
 * ```typescript
 * const eqComp = createEqualityComputed(() => {
 *   return { foo: 'bar' };
 * });
 * ```
 *
 * @template T - The type of the computed value.
 * @param {() => T} getter - A function returning the value to compare.
 * @returns {ISignal<T>} An equality computed signal.
 * @experimental
 */
export function unstable_createEqualityComputed<T>(
  getter: () => T,
): ISignal<T> {
  return alienUnstable.equalityComputed(getter);
}

/**
 * React hook returning `[value, setValue]` for a given Alien Signal.
 * Uses useSyncExternalStore for concurrency-safe re-renders.
 *
 * @example
 * ```typescript
 * const countSignal = createSignal(0);
 * function Counter() {
 *   const [count, setCount] = useSignal(countSignal);
 *   return <button onClick={() => setCount(count + 1)}>{count}</button>;
 * }
 * ```
 *
 * @template T - The type of the signal value.
 * @param {IWritableSignal<T>} alienSignal - The signal to read/write.
 * @returns {[T, (val: T | ((oldVal: T) => T)) => void]} A tuple [currentValue, setValue].
 */
export function useSignal<T>(
  alienSignal: IWritableSignal<T>,
): [T, (val: T | ((oldVal: T) => T)) => void] {
  const value = useSyncExternalStore(
    (callback) => {
      const eff = alienEffect(() => {
        alienSignal.get(); // track
        callback();
      });
      return () => eff.stop();
    },
    () => alienSignal.get(),
  );

  const setValue = (val: T | ((oldVal: T) => T)) => {
    if (typeof val === "function") {
      alienSignal.set((val as (oldVal: T) => T)(alienSignal.get()));
    } else {
      alienSignal.set(val);
    }
  };

  return [value, setValue];
}

/**
 * React hook returning only the current value of an Alien Signal (or computed).
 * No setter is provided.
 *
 * @example
 * ```typescript
 * const countSignal = createSignal(0);
 * const doubleSignal = createComputed(() => countSignal.get() * 2);
 * function Display() {
 *   const count = useSignalValue(countSignal);
 *   const double = useSignalValue(doubleSignal);
 *   return <div>{count}, {double}</div>;
 * }
 * ```
 *
 * @template T - The type of the signal value.
 * @param {IWritableSignal<T>} alienSignal - The signal to read.
 * @returns {T} The current value.
 */
export function useSignalValue<T>(alienSignal: IWritableSignal<T>): T {
  return useSyncExternalStore(
    (callback) => {
      const eff = alienEffect(() => {
        alienSignal.get();
        callback();
      });
      return () => eff.stop();
    },
    () => alienSignal.get(),
  );
}

/**
 * React hook returning only a setter function for an Alien Signal.
 * No current value is provided, similar to Jotai's useSetAtom.
 *
 * @example
 * ```typescript
 * const countSignal = createSignal(0);
 * function Incrementor() {
 *   const setCount = useSetSignal(countSignal);
 *   return <button onClick={() => setCount((c) => c + 1)}>+1</button>;
 * }
 * ```
 *
 * @template T - The type of the signal value.
 * @param {IWritableSignal<T>} alienSignal - The signal to write.
 * @returns {(val: T | ((oldVal: T) => T)) => void} A setter function.
 */
export function useSetSignal<T>(
  alienSignal: IWritableSignal<T>,
): (val: T | ((oldVal: T) => T)) => void {
  return (val) => {
    if (typeof val === "function") {
      alienSignal.set((val as (oldVal: T) => T)(alienSignal.get()));
    } else {
      alienSignal.set(val);
    }
  };
}

/**
 * React hook for running a side effect whenever Alien Signals' dependencies
 * used in `fn` change. The effect is cleaned up on component unmount.
 *
 * @example
 * ```typescript
 * function Logger() {
 *   useSignalEffect(() => {
 *     console.log('Signal changed:', someSignal.get());
 *   });
 *   return null;
 * }
 * ```
 *
 * @param {() => void} fn - The effect function to run.
 */
export function useSignalEffect(fn: () => void): void {
  useEffect(() => {
    const eff = alienEffect(fn);
    return () => eff.stop();
  }, [fn]);
}

/**
 * React hook for managing an Alien Signals effect scope.
 * All signals/effects created inside this scope run when the component mounts,
 * and are stopped automatically when the component unmounts.
 *
 * @example
 * ```typescript
 * function ScopedEffects() {
 *   const scope = useSignalScope();
 *   useEffect(() => {
 *     scope.run(() => {
 *       createEffect(() => {
 *         console.log('Scoped effect:', someSignal.get());
 *       });
 *     });
 *   }, [scope]);
 *   return null;
 * }
 * ```
 *
 * @returns {EffectScope} The created effect scope.
 */
export function useSignalScope(): EffectScope {
  const scope = useMemo(() => alienEffectScope(), []);
  useEffect(() => {
    return () => {
      scope.stop();
    };
  }, [scope]);
  return scope;
}

/**
 * React hook to read from an async computed signal.
 * The hook fetches the current value, subscribing to changes via useSyncExternalStore,
 * and triggers a get() call to retrieve updated data. Maintains an internal state
 * for the resolved value of the promise.
 *
 * @example
 * ```typescript
 * const asyncSignal = createAsyncComputed<number>(async function*() {
 *   const val = someSignal.get();
 *   yield Promise.resolve(someSignal); // track async dep
 *   return val * 2;
 * });
 *
 * function AsyncDisplay() {
 *   const value = useAsyncComputedValue(asyncSignal);
 *   return <div>Value: {String(value)}</div>;
 * }
 * ```
 *
 * @template T - The type of the computed value.
 * @param {AsyncComputed<T>} alienAsyncComp - The async computed signal to read.
 * @returns {T | undefined} The resolved value (or undefined if not yet resolved).
 * @experimental
 */
export function unstable_useAsyncComputedValue<T>(
  alienAsyncComp: AsyncComputed<T>,
): T | undefined {
  const [value, setValue] = useState<T | undefined>(
    alienAsyncComp.currentValue,
  );

  useSyncExternalStore(
    (callback) => {
      const eff = alienEffect(() => {
        alienAsyncComp.currentValue; // track
        callback();
      });
      return () => eff.stop();
    },
    () => alienAsyncComp.currentValue,
  );

  useEffect(() => {
    let active = true;
    const fetchValue = async () => {
      const val = await alienAsyncComp.get();
      if (active) setValue(val);
    };
    fetchValue();
    return () => {
      active = false;
    };
  }, [alienAsyncComp]);

  return value;
}

/**
 * React hook to run an asynchronous effect whenever the component mounts,
 * cleaning up when it unmounts.
 *
 * @example
 * ```typescript
 * useAsyncEffect(async function* () {
 *   yield someDependency;
 *   console.log('Async side effect complete!');
 * });
 * ```
 *
 * @template T - The type of the effect value.
 * @param {() => AsyncGenerator<Dependency, T>} fn - An async generator representing the effect logic.
 * @experimental
 */
export function unstable_useAsyncEffect<T>(
  fn: () => AsyncGenerator<Dependency, T>,
): void {
  useEffect(() => {
    const eff = alienUnstable.asyncEffect(fn);
    return () => eff.stop();
  }, [fn]);
}
