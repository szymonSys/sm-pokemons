export function throttleFactory<T extends any[], R>(fn: (...args: T) => R, timeinMs: number = 100) {
  let lastInvokingTime = Date.now();
  let lasResult!: R;
  let invokedAllLeastOnce = false;
  return (...args: T): [result: R, invoked: boolean] => {
    const now = Date.now();
    const shouldInvoke = now - lastInvokingTime >= timeinMs || !invokedAllLeastOnce;
    if (shouldInvoke) {
      lastInvokingTime = now;
      lasResult = fn(...args);
      invokedAllLeastOnce = true;
      return [lasResult, true];
    }
    return [lasResult, false];
  };
}

export type DebounceFn<T extends any[], R> = (...args: T) => Promise<R>;

export type CancelDebounceFn = () => void;

export type Debounce<T extends any[], R> = [debounce: DebounceFn<T, R>, cancel: CancelDebounceFn];
export function debounceFactory<T extends any[], R>(
  fn: (...args: T) => R | Promise<R>,
  timeinMs: number = 100,
): Debounce<T, R> {
  let timeout: number | null = null;
  const cancel: CancelDebounceFn = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  const debouncedFn: DebounceFn<T, R> = (...args) => {
    cancel();
    return new Promise<R>((resolve) => {
      timeout = setTimeout(() => {
        const result = fn(...args);
        if (isPromise(result)) {
          result.then(resolve);
        } else {
          resolve(result);
        }
      }, timeinMs);
    });
  };
  return [debouncedFn, cancel];
}

export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return value instanceof Promise;
}

export function isAsyncFunction<T extends any[], R>(
  fn: (...args: T) => R | Promise<R>,
): fn is (...args: T) => Promise<R> {
  return fn.constructor.name === 'AsyncFunction';
}
