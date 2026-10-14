import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { arrayRange, difference, find, flatMap, forceArray, intersection } from "/lib/forms/arrays";

describe("forceArray", () => {
  it("wraps a scalar in an array", () => {
    assert.deepEqual(forceArray("a"), ["a"]);
    assert.deepEqual(forceArray(0), [0]);
    assert.deepEqual(forceArray(false), [false]);
  });

  it("returns an empty array for null/undefined", () => {
    assert.deepEqual(forceArray(undefined), []);
    assert.deepEqual(forceArray(null), []);
  });

  it("returns an existing array unchanged", () => {
    assert.deepEqual(forceArray(["a", "b"]), ["a", "b"]);
    assert.deepEqual(forceArray([]), []);
  });
});

describe("flatMap", () => {
  it("maps and flattens one level", () => {
    assert.deepEqual(flatMap([1, 2, 3], (n) => [n, n * 2]), [1, 2, 2, 4, 3, 6]);
  });

  it("drops items that map to an empty array", () => {
    assert.deepEqual(flatMap([1, 2, 3], (n) => (n % 2 === 0 ? [n] : [])), [2]);
  });
});

describe("difference", () => {
  it("returns items in xs not present in ys (by identity)", () => {
    assert.deepEqual(difference([1, 2, 3], [2]), [1, 3]);
  });

  it("supports a custom predicate", () => {
    const xs = [{ id: 1 }, { id: 2 }];
    assert.deepEqual(difference(xs, [2], (x, y) => x.id === y), [{ id: 1 }]);
  });
});

describe("intersection", () => {
  it("returns items present in both arrays", () => {
    assert.deepEqual(intersection([1, 2, 3], [2, 3, 4]), [2, 3]);
    assert.deepEqual(intersection([1, 2], [3, 4]), []);
  });
});

describe("find", () => {
  it("returns the first matching item", () => {
    assert.equal(find([1, 2, 3], (n) => n > 1), 2);
  });

  it("returns undefined when nothing matches", () => {
    assert.equal(find([1, 2, 3], (n) => n > 5), undefined);
  });
});

describe("arrayRange", () => {
  it("builds a range with the default step", () => {
    assert.deepEqual(arrayRange(0, 3), [0, 1, 2]);
  });

  it("supports a custom step", () => {
    assert.deepEqual(arrayRange(2, 3, 2), [2, 4, 6]);
  });
});
