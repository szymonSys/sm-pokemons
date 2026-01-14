export function throttleFactory<T extends any[], R>(
  fn: (...args: T) => R,
  timeinMs: number = 100
) {
  let lastInvokingTime = Date.now();
  return (
    ...args: T
  ): [result: R, invoked: true] | [result: undefined, invoked: false] => {
    const now = Date.now();
    const shouldInvoke = now - lastInvokingTime >= timeinMs;
    if (shouldInvoke) {
      lastInvokingTime = now;
      return [fn(...args), true];
    }
    return [undefined, false];
  };
}
