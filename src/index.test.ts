import { GlobalRegistrator } from "@happy-dom/global-registrator";
import * as matchers from "@testing-library/jest-dom/matchers";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, jest } from "bun:test";

import {
  createSignal,
  createComputed,
  createEffect,
  createSignalScope,
  unstable_createAsyncComputed,
  unstable_createAsyncEffect,
  unstable_createComputedArray,
  unstable_createComputedSet,
  unstable_createEqualityComputed,
  // React hooks
  useSignal,
  useSignalValue,
  useSetSignal,
  useSignalEffect,
  useSignalScope,
  unstable_useAsyncComputedValue,
  unstable_useAsyncEffect,
} from "./index";

/**
 * Minimal mock of `Dependency` from Alien Signals.
 */
function mockDependency(id: number) {
  return {
    subs: undefined,
    subsTail: undefined,
    lastTrackedId: id,
    flags: 0, // SubscriberFlags if needed
  };
}

// Register Happy DOM environment and jest-dom matchers
GlobalRegistrator.register();
expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("Alien React Library", () => {
  /* ------------------------------------------------------------------
   *  1) BASIC & COMPUTED SIGNALS
   * ------------------------------------------------------------------ */
  it("should create a writable signal", () => {
    const mySignal = createSignal(0);
    expect(mySignal.get()).toBe(0);

    mySignal.set(10);
    expect(mySignal.get()).toBe(10);
  });

  it("should create and update a computed signal", () => {
    const countSignal = createSignal(1);
    const doubleSignal = createComputed(() => countSignal.get() * 2);

    expect(doubleSignal.get()).toBe(2);

    countSignal.set(2);
    expect(doubleSignal.get()).toBe(4);

    // Another update
    countSignal.set(3);
    expect(doubleSignal.get()).toBe(6);
  });

  it("should not recompute equalityComputed if values are deeply equal", () => {
    const spy = jest.fn();
    const eqComp = unstable_createEqualityComputed(() => {
      spy();
      return { foo: "bar" };
    });

    const val1 = eqComp.get();
    expect(val1).toEqual({ foo: "bar" });
    expect(spy).toHaveBeenCalledTimes(1);

    // Re-read without changing the underlying data
    const val2 = eqComp.get();
    expect(val2).toBe(val1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  /* ------------------------------------------------------------------
   *  2) EFFECTS & SCOPES
   * ------------------------------------------------------------------ */
  it("should create and run an effect", () => {
    const countSignal = createSignal(1);
    let observed = 0;

    createEffect(() => {
      observed = countSignal.get();
    });

    expect(observed).toBe(1);

    countSignal.set(2);
    expect(observed).toBe(2);
  });

  it("should create a signal scope", () => {
    const scope = createSignalScope();
    expect(scope).toBeDefined();

    let value = 0;
    scope.run(() => {
      createEffect(() => {
        value = 99;
      });
    });
    expect(value).toBe(99);

    scope.stop(); // stop the scope
  });

  /* ------------------------------------------------------------------
   *  3) ASYNC COMPUTED & EFFECT
   * ------------------------------------------------------------------ */
  it("should create an async computed signal", async () => {
    // yield a mock Dependency, then return final
    const asyncComp = unstable_createAsyncComputed<number>(async function* () {
      yield mockDependency(42);
      return 100;
    });

    const val = await asyncComp.get();
    expect(val).toBe(100);
  });

  it("should update an async computed if dependencies change", async () => {
    const baseSignal = createSignal(2);

    const asyncComp = unstable_createAsyncComputed<number>(async function* () {
      // Create a dependency that tracks the signal value
      yield mockDependency(baseSignal.get());
      // Return double the current baseSignal value
      return baseSignal.get() * 2;
    });

    // First read => 2 => 4
    const initial = await asyncComp.get();
    expect(initial).toBe(4);

    // Change baseSignal => 3 => expect 6
    baseSignal.set(3);
    // Force a recomputation by yielding the new dependency value
    await asyncComp.update();
    const nextVal = await asyncComp.get();
    expect(nextVal).toBe(6);
  });
  it("should create an async effect", async () => {
    let result = 0;

    /**
     * Because we patched `unstable_createAsyncEffect` to return a Promise,
     * we can now await it. Inside, we yield a mock dependency, then set `result`.
     */
    await unstable_createAsyncEffect(async function* () {
      yield mockDependency(1);
      result = 42;
    });

    expect(result).toBe(42);
  });

  /* ------------------------------------------------------------------
   *  4) COMPUTED ARRAYS & SETS
   * ------------------------------------------------------------------ */
  it("should create and update a computed array", () => {
    const numbersSignal = createSignal([1, 2, 3]);
    const compArray = unstable_createComputedArray(
      numbersSignal,
      (itemSignal) => () => {
        return itemSignal.get() * 2;
      },
    );

    // The returned object might be a proxy. Spread to compare as normal array.
    expect([...compArray]).toEqual([2, 4, 6]);

    numbersSignal.set([2, 3, 4]);
    expect([...compArray]).toEqual([4, 6, 8]);
  });

  it("should handle a computed array with increased length", () => {
    const arraySignal = createSignal([1]);
    const compArray = unstable_createComputedArray(
      arraySignal,
      (itemSignal, i) => () => {
        // Just for demonstration, sum the item + index
        return itemSignal.get() + i;
      },
    );

    expect([...compArray]).toEqual([1]);

    arraySignal.set([1, 2, 3]);
    expect([...compArray]).toEqual([1, 3, 5]);
  });

  it("should create a computed set and detect changes", () => {
    const setSignal = createSignal(new Set([1, 2]));
    const compSet = unstable_createComputedSet(setSignal);

    expect(compSet.get()).toEqual(new Set([1, 2]));

    // Modify the set
    setSignal.set(new Set([1, 2, 3]));
    expect(compSet.get()).toEqual(new Set([1, 2, 3]));
  });

  /* ------------------------------------------------------------------
   *  5) REACT HOOKS: Sync
   * ------------------------------------------------------------------ */
  it("useSignal should return [value, setter]", () => {
    const countSignal = createSignal(0);
    const { result } = renderHook(() => useSignal(countSignal));
    const [count, setCount] = result.current;

    expect(count).toBe(0);
    act(() => setCount(10));
    expect(result.current[0]).toBe(10);
  });

  it("useSignalValue should return read-only value from a signal", () => {
    const countSignal = createSignal(0);
    const { result } = renderHook(() => useSignalValue(countSignal));

    expect(result.current).toBe(0);
    act(() => countSignal.set(5));
    expect(result.current).toBe(5);
  });

  it("useSetSignal should return setter only", () => {
    const countSignal = createSignal(0);
    const { result } = renderHook(() => useSetSignal(countSignal));

    act(() => {
      result.current(10);
    });
    expect(countSignal.get()).toBe(10);

    // Functional update
    act(() => {
      result.current((prev) => prev + 5);
    });
    expect(countSignal.get()).toBe(15);
  });

  it("useSignalEffect should register an effect in React", () => {
    const countSignal = createSignal(0);
    const effectFn = jest.fn(() => {
      countSignal.get(); // track
    });

    renderHook(() => useSignalEffect(effectFn));
    expect(effectFn).toHaveBeenCalledTimes(1);

    act(() => countSignal.set(5));
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it("useSignalScope should create and manage an effect scope in React", () => {
    const { result, unmount } = renderHook(() => useSignalScope());
    expect(result.current).toBeDefined();
    unmount(); // triggers scope.stop() internally
  });

  /* ------------------------------------------------------------------
   *  6) REACT HOOKS: Async
   * ------------------------------------------------------------------ */
  it("useAsyncComputedValue should read an async computed signal", async () => {
    const asyncComp = unstable_createAsyncComputed<number>(async function* () {
      yield mockDependency(1);
      return 42;
    });

    const { result } = renderHook(() =>
      unstable_useAsyncComputedValue(asyncComp),
    );

    // Initially undefined (since we haven't awaited yet)
    expect(result.current).toBeUndefined();

    // Force resolution
    await act(async () => {
      await asyncComp.get();
    });
    expect(result.current).toBe(42);
  });

  //   it("useAsyncComputedValue should re-resolve if dependency changes", async () => {
  //     const baseSignal = createSignal(2);
  //     const asyncComp = unstable_createAsyncComputed<number>(async function* () {
  //       yield baseSignal;
  //       return baseSignal.get() * 2;
  //     });

  //     const { result } = renderHook(() =>
  //       unstable_useAsyncComputedValue(asyncComp)
  //     );

  //     // Initially undefined
  //     expect(result.current).toBeUndefined();

  //     // Resolve first => 2 => 4
  //     await act(async () => {
  //       await asyncComp.get();
  //     });
  //     expect(result.current).toBe(4);

  //     // Now set baseSignal => 5 => expect 10
  //     act(() => {
  //       baseSignal.set(5);
  //     });
  //     await act(async () => {
  //       await asyncComp.get();
  //     });
  //     expect(result.current).toBe(10);
  //   });

  it("useAsyncEffect should run an async effect in a React component", async () => {
    const effectFn = jest.fn(async function* () {
      yield mockDependency(1);
    });

    // Because we patched `unstable_createAsyncEffect` to run, the effect is started immediately
    renderHook(() => unstable_useAsyncEffect(effectFn));
    expect(effectFn).toHaveBeenCalledTimes(1);
  });
});
