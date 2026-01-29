export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isNotNullish<T>(value: T): value is NonNullable<T> {
  return !isNullish(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && !Array.isArray(value) && isNotNullish(value);
}
