import { describe, expect, it } from "@jest/globals";
import { arrayRange, difference, find, flatMap, forceArray, intersection } from "/lib/forms/arrays";

describe("forceArray", () => {
  it("wraps a scalar in an array", () => {
    expect(forceArray("a")).toEqual(["a"]);
    expect(forceArray(0)).toEqual([0]);
    expect(forceArray(false)).toEqual([false]);
  });

  it("returns an empty array for null/undefined", () => {
    expect(forceArray(undefined)).toEqual([]);
    expect(forceArray(null)).toEqual([]);
  });

  it("returns an existing array unchanged", () => {
    expect(forceArray(["a", "b"])).toEqual(["a", "b"]);
    expect(forceArray([])).toEqual([]);
  });
});

describe("flatMap", () => {
  it("maps and flattens one level", () => {
    expect(flatMap([1, 2, 3], (n) => [n, n * 2])).toEqual([1, 2, 2, 4, 3, 6]);
  });

  it("drops items that map to an empty array", () => {
    expect(flatMap([1, 2, 3], (n) => (n % 2 === 0 ? [n] : []))).toEqual([2]);
  });
});

describe("difference", () => {
  it("returns items in xs not present in ys (by identity)", () => {
    expect(difference([1, 2, 3], [2])).toEqual([1, 3]);
  });

  it("supports a custom predicate", () => {
    const xs = [{ id: 1 }, { id: 2 }];
    expect(difference(xs, [2], (x, y) => x.id === y)).toEqual([{ id: 1 }]);
  });
});

describe("intersection", () => {
  it("returns items present in both arrays", () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    expect(intersection([1, 2], [3, 4])).toEqual([]);
  });
});

describe("find", () => {
  it("returns the first matching item", () => {
    expect(find([1, 2, 3], (n) => n > 1)).toBe(2);
  });

  it("returns undefined when nothing matches", () => {
    expect(find([1, 2, 3], (n) => n > 5)).toBeUndefined();
  });
});

describe("arrayRange", () => {
  it("builds a range with the default step", () => {
    expect(arrayRange(0, 3)).toEqual([0, 1, 2]);
  });

  it("supports a custom step", () => {
    expect(arrayRange(2, 3, 2)).toEqual([2, 4, 6]);
  });
});
