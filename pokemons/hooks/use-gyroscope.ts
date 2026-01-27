import { GyroscopeListener } from "@/modules/gyroscope";
import { Gyroscope } from "@/modules/gyroscope/src/GyroscopeModule";
import { useCallback, useEffect, useRef, useState } from "react";

const EMPTY_CLEANUP = () => {};

export type UseGyroscopeOptions = {
  intervalMs?: number;
  deps?: unknown[];
  shouldStart?: boolean;
};

export type UseGyroscopeResult = {
  subscribe: () => void;
  cleanup: () => void;
  isAvailable: boolean;
};

export function useGyroscope(
  listener: GyroscopeListener,
  { shouldStart = true, ...options }: UseGyroscopeOptions = {}
): UseGyroscopeResult {
  const gyroscopeRef = useRef(Gyroscope.use());
  const cleanupRef = useRef<() => void>(EMPTY_CLEANUP);
  const [isAvailable, setIsAvailable] = useState(false);

  const deps = options?.deps
    ? [...options.deps, options.intervalMs]
    : [listener, options.intervalMs];

  const subscribe = useCallback(() => {
    cleanupRef.current();
    const cleanup = gyroscopeRef.current.subscribe(listener, options);
    cleanupRef.current = () => {
      cleanup();
      cleanupRef.current = EMPTY_CLEANUP;
    };
    return cleanup;
  }, deps);

  useEffect(() => {
    const available = gyroscopeRef.current.isAvailable();
    setIsAvailable(available);

    if (shouldStart) {
      subscribe();
    }
    return () => {
      cleanupRef.current();
    };
  }, [subscribe, shouldStart]);

  return {
    subscribe,
    cleanup: cleanupRef.current,
    isAvailable,
  };
}
