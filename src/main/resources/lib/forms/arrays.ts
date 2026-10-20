export function forceArray<A>(data: A | Array<A> | undefined | null): Array<A>;
export function forceArray<A>(data: A | ReadonlyArray<A> | undefined | null): ReadonlyArray<A>;
export function forceArray<A>(data: A | Array<A> | undefined | null): ReadonlyArray<A> {
  data = data ?? [];
  return Array.isArray(data) ? data : [data];
}

export function first<A>(data: A | A[] | undefined | null): A | undefined {
  return Array.isArray(data) ? data[0] : (data ?? undefined);
}

export function flatMap<A, B>(arr: Array<A>, f: (a: A) => Array<B>): Array<B> {
  return arr.reduce<B[]>((acc, val) => acc.concat(f(val)), []);
}

export function difference<A>(xs: readonly A[], ys: readonly A[]): A[];
export function difference<A, B>(xs: readonly A[], ys: readonly B[], predicate: (x: A, y: B) => boolean): A[];
export function difference<A, B>(xs: readonly A[], ys: readonly B[], predicate?: (x: A, y: B) => boolean): A[] {
  return xs.filter((x) => !ys.some((y) => (predicate ? predicate(x, y) : (x as unknown) === (y as unknown))));
}

export function intersection<A>(xs: readonly A[], ys: readonly A[]): A[] {
  return xs.filter((x) => ys.indexOf(x) !== -1);
}

/**
 * Returns the first value from an Array that matches a predicate
 */
export function find<T, S extends T>(arr: T[], predicate: (value: T) => value is S): S | undefined;
export function find<T>(arr: T[], predicate: (value: T) => boolean): T | undefined;
export function find<T>(arr: T[], predicate: (value: T) => boolean): T | undefined {
  for (const key in arr) {
    if (predicate(arr[key])) {
      return arr[key];
    }
  }
}

/**
 * Create an array of numbers based on start and stop
 */
export function arrayRange(start: number, count: number, step = 1): number[] {
  return [...Array<number>(count)].map((_, i) => start + i * step);
}
