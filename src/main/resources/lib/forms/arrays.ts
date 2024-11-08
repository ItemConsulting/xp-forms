export function forceArray<A>(data: A | Array<A> | undefined | null): Array<A>;
export function forceArray<A>(data: A | ReadonlyArray<A> | undefined | null): ReadonlyArray<A>;
export function forceArray<A>(data: A | Array<A> | undefined | null): ReadonlyArray<A> {
  data = data ?? [];
  return Array.isArray(data) ? data : [data];
}

export function flatMap<A, B>(arr: Array<A>, f: (a: A) => Array<B>): Array<B> {
  return arr.reduce<B[]>((acc, val) => acc.concat(f(val)), []);
}

/**
 * Returns the first value from an Array that matches a predicate
 */
export function find<T>(arr: T[], predicate: (value: T) => boolean): T | undefined {
  return arr.filter(predicate)[0];
}

/**
 * Create an array of numbers based on start and stop
 */
export function arrayRange(start: number, count: number, step = 1) {
  return [...Array(count)].map((_, i) => start + i * step);
}
