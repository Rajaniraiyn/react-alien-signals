import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { createStore as createTanStackStore, useSelector } from "@tanstack/react-store";
import { act, cleanup, renderHook } from "@testing-library/react";
import { atom, createStore as createJotaiStore, Provider, useAtomValue } from "jotai";
import { type ReactNode, useState } from "react";
import { useStore as useZustandStore } from "zustand";
import { createStore as createZustandStore } from "zustand/vanilla";

import { batch, createEffect, createSignal, useSignalValue } from "../src";

GlobalRegistrator.register();

const CORE_ITERATIONS = 100_000;
const REACT_ITERATIONS = 2_000;
const BATCHED_REACT_WRITES = 10_000;
const SAMPLES = 7;

interface Result {
  benchmark: string;
  medianOpsPerSecond: number;
  relativeToBaseline: string;
}

interface Case {
  name: string;
  run: () => void;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)]!;
}

function measure(cases: Case[], iterations: number): Result[] {
  const samplesByName = new Map(cases.map(({ name }) => [name, [] as number[]]));

  for (const benchmark of cases) benchmark.run();
  for (let sample = 0; sample < SAMPLES; sample++) {
    for (let offset = 0; offset < cases.length; offset++) {
      const benchmark = cases[(sample + offset) % cases.length]!;
      const startedAt = performance.now();
      benchmark.run();
      const elapsed = performance.now() - startedAt;
      samplesByName.get(benchmark.name)!.push((iterations * 1_000) / elapsed);
    }
  }

  const measurements = cases.map(({ name }) => ({
    name,
    ops: median(samplesByName.get(name)!),
  }));
  const baseline = measurements[0]!.ops;

  return measurements.map(({ name, ops }) => ({
    benchmark: name,
    medianOpsPerSecond: Math.round(ops),
    relativeToBaseline: `${(ops / baseline).toFixed(2)}x`,
  }));
}

function coreCases(): Case[] {
  return [
    {
      name: "Raw listener store",
      run() {
        let value = 0;
        const listeners = new Set<() => void>([() => void value]);
        for (let index = 0; index < CORE_ITERATIONS; index++) {
          value = index;
          for (const listener of listeners) listener();
        }
      },
    },
    {
      name: "React Alien Signals core",
      run() {
        const value = createSignal(0);
        const stop = createEffect(() => void value());
        for (let index = 0; index < CORE_ITERATIONS; index++) value(index);
        stop();
      },
    },
    {
      name: "TanStack Store core",
      run() {
        const store = createTanStackStore(0);
        const subscription = store.subscribe(() => void store.state);
        for (let index = 0; index < CORE_ITERATIONS; index++) {
          store.setState(() => index);
        }
        subscription.unsubscribe();
      },
    },
    {
      name: "Jotai core",
      run() {
        const value = atom(0);
        const store = createJotaiStore();
        const unsubscribe = store.sub(value, () => void store.get(value));
        for (let index = 0; index < CORE_ITERATIONS; index++) store.set(value, index);
        unsubscribe();
      },
    },
    {
      name: "Zustand core",
      run() {
        const store = createZustandStore(() => 0);
        const unsubscribe = store.subscribe(() => void store.getState());
        for (let index = 0; index < CORE_ITERATIONS; index++) {
          store.setState(index, true);
        }
        unsubscribe();
      },
    },
  ];
}

function reactCases(): Case[] {
  return [
    {
      name: "Raw React useState",
      run() {
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useState(0);
        });
        for (let index = 1; index <= REACT_ITERATIONS; index++) {
          act(() => hook.result.current[1](index));
        }
        if (renders < REACT_ITERATIONS + 1) throw new Error(`Skipped React renders: ${renders}`);
        hook.unmount();
      },
    },
    {
      name: "React Alien Signals",
      run() {
        const value = createSignal(0);
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useSignalValue(value);
        });
        for (let index = 1; index <= REACT_ITERATIONS; index++) {
          act(() => value(index));
        }
        if (renders < REACT_ITERATIONS + 1) throw new Error(`Skipped signal renders: ${renders}`);
        hook.unmount();
      },
    },
    {
      name: "TanStack React Store",
      run() {
        const store = createTanStackStore(0);
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useSelector(store);
        });
        for (let index = 1; index <= REACT_ITERATIONS; index++) {
          act(() => store.setState(() => index));
        }
        if (renders < REACT_ITERATIONS + 1) throw new Error(`Skipped TanStack renders: ${renders}`);
        hook.unmount();
      },
    },
    {
      name: "Jotai React",
      run() {
        const value = atom(0);
        const store = createJotaiStore();
        const Wrapper = ({ children }: { children: ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        );
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useAtomValue(value);
        }, { wrapper: Wrapper });
        for (let index = 1; index <= REACT_ITERATIONS; index++) {
          act(() => store.set(value, index));
        }
        if (renders < REACT_ITERATIONS + 1) throw new Error(`Skipped Jotai renders: ${renders}`);
        hook.unmount();
      },
    },
    {
      name: "Zustand React",
      run() {
        const store = createZustandStore(() => 0);
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useZustandStore(store);
        });
        for (let index = 1; index <= REACT_ITERATIONS; index++) {
          act(() => store.setState(index, true));
        }
        if (renders < REACT_ITERATIONS + 1) throw new Error(`Skipped Zustand renders: ${renders}`);
        hook.unmount();
      },
    },
  ];
}

function automaticallyBatchedReactCases(): Case[] {
  return [
    {
      name: "Raw React useState",
      run() {
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useState(0);
        });
        const initialRenders = renders;
        act(() => {
          for (let index = 1; index <= BATCHED_REACT_WRITES; index++) {
            hook.result.current[1](index);
          }
        });
        if (hook.result.current[0] !== BATCHED_REACT_WRITES || renders !== initialRenders + 1) {
          throw new Error(`Invalid raw React batch: value=${hook.result.current[0]}, renders=${renders}`);
        }
        hook.unmount();
      },
    },
    {
      name: "React Alien Signals",
      run() {
        const value = createSignal(0);
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useSignalValue(value);
        });
        const initialRenders = renders;
        act(() => {
          for (let index = 1; index <= BATCHED_REACT_WRITES; index++) value(index);
        });
        if (hook.result.current !== BATCHED_REACT_WRITES || renders !== initialRenders + 1) {
          throw new Error(`Invalid signal batch: value=${hook.result.current}, renders=${renders}`);
        }
        hook.unmount();
      },
    },
    {
      name: "React Alien Signals + graph batch",
      run() {
        const value = createSignal(0);
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useSignalValue(value);
        });
        const initialRenders = renders;
        act(() => {
          batch(() => {
            for (let index = 1; index <= BATCHED_REACT_WRITES; index++) value(index);
          });
        });
        if (hook.result.current !== BATCHED_REACT_WRITES || renders !== initialRenders + 1) {
          throw new Error(`Invalid graph batch: value=${hook.result.current}, renders=${renders}`);
        }
        hook.unmount();
      },
    },
    {
      name: "TanStack React Store",
      run() {
        const store = createTanStackStore(0);
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useSelector(store);
        });
        const initialRenders = renders;
        act(() => {
          for (let index = 1; index <= BATCHED_REACT_WRITES; index++) {
            store.setState(() => index);
          }
        });
        if (hook.result.current !== BATCHED_REACT_WRITES || renders !== initialRenders + 1) {
          throw new Error(`Invalid TanStack batch: value=${hook.result.current}, renders=${renders}`);
        }
        hook.unmount();
      },
    },
    {
      name: "Jotai React",
      run() {
        const value = atom(0);
        const store = createJotaiStore();
        const Wrapper = ({ children }: { children: ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        );
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useAtomValue(value);
        }, { wrapper: Wrapper });
        const initialRenders = renders;
        act(() => {
          for (let index = 1; index <= BATCHED_REACT_WRITES; index++) store.set(value, index);
        });
        if (hook.result.current !== BATCHED_REACT_WRITES || renders !== initialRenders + 1) {
          throw new Error(`Invalid Jotai batch: value=${hook.result.current}, renders=${renders}`);
        }
        hook.unmount();
      },
    },
    {
      name: "Zustand React",
      run() {
        const store = createZustandStore(() => 0);
        let renders = 0;
        const hook = renderHook(() => {
          renders++;
          return useZustandStore(store);
        });
        const initialRenders = renders;
        act(() => {
          for (let index = 1; index <= BATCHED_REACT_WRITES; index++) {
            store.setState(index, true);
          }
        });
        if (hook.result.current !== BATCHED_REACT_WRITES || renders !== initialRenders + 1) {
          throw new Error(`Invalid Zustand batch: value=${hook.result.current}, renders=${renders}`);
        }
        hook.unmount();
      },
    },
  ];
}

console.log(`Bun ${Bun.version}; React DOM benchmark uses ${REACT_ITERATIONS} committed updates per sample.`);
console.log("Core notifications (higher is better)");
console.table(measure(coreCases(), CORE_ITERATIONS));
console.log("React committed updates (higher is better)");
console.table(measure(reactCases(), REACT_ITERATIONS));
console.log(`React automatic batching (${BATCHED_REACT_WRITES} writes, one update render; higher is better)`);
console.table(measure(automaticallyBatchedReactCases(), BATCHED_REACT_WRITES));
cleanup();
