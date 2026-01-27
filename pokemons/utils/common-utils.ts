export function throttleFactory<T extends any[], R>(
  fn: (...args: T) => R,
  timeinMs: number = 100
) {
  let lastInvokingTime = Date.now();
  let lastResult: R | undefined = undefined;
  return (
    ...args: T
  ): [result: R, invoked: true] | [result: R | undefined, invoked: false] => {
    const now = Date.now();
    const shouldInvoke = now - lastInvokingTime >= timeinMs;
    if (shouldInvoke) {
      lastInvokingTime = now;
      lastResult = fn(...args);
      return [lastResult, true];
    }
    return [lastResult, false];
  };
}
