export function forceArray<A>(data: A | Array<A> | undefined | null): Array<A>;
export function forceArray<A>(data: A | ReadonlyArray<A> | undefined | null): ReadonlyArray<A>;
export function forceArray<A>(data: A | Array<A> | undefined | null): ReadonlyArray<A> {
  data = data ?? [];
  return Array.isArray(data) ? data : [data];
}

export function flatMap<A, B>(arr: Array<A>, f: (a: A) => Array<B>): Array<B> {
  return arr.reduce<B[]>((acc, val) => acc.concat(f(val)), []);
}

export function difference<A>(xs: A[], ys: A[]): A[];
export function difference<A, B>(xs: A[], ys: B[], predicate: (x: A, y: B) => boolean): A[];
export function difference<A, B>(xs: A[], ys: B[], predicate?: (x: A, y: B) => boolean): A[] {
  return xs.filter((x) => !ys.some((y) => (predicate ? predicate(x, y) : (x as unknown) === (y as unknown))));
}

export function intersection<A>(xs: readonly A[], ys: readonly A[]): A[] {
  return xs.filter((x) => ys.indexOf(x) !== -1);
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
