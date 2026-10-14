import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertIsDefined,
  isEmptyOrUndefined,
  notEmptyOrUndefined,
  notNullOrUndefined,
  objectKeys,
  partPathToId,
  stringToRegex,
} from "/lib/forms/utils";

describe("notNullOrUndefined", () => {
  it("is false for null/undefined, true otherwise", () => {
    assert.equal(notNullOrUndefined(null), false);
    assert.equal(notNullOrUndefined(undefined), false);
    assert.equal(notNullOrUndefined(0), true);
    assert.equal(notNullOrUndefined(""), true);
  });
});

describe("notEmptyOrUndefined / isEmptyOrUndefined", () => {
  it("treats empty string, null and undefined as empty", () => {
    for (const empty of ["", null, undefined]) {
      assert.equal(isEmptyOrUndefined(empty), true);
      assert.equal(notEmptyOrUndefined(empty), false);
    }
  });

  it("treats a non-empty string as non-empty", () => {
    assert.equal(isEmptyOrUndefined("x"), false);
    assert.equal(notEmptyOrUndefined("x"), true);
  });
});

describe("stringToRegex", () => {
  it("parses a /pattern/flags string into a RegExp", () => {
    const regex = stringToRegex("/^\\d+$/");
    assert.ok(regex instanceof RegExp);
    assert.equal(regex?.test("123"), true);
    assert.equal(regex?.test("12a"), false);
  });

  it("keeps the flags", () => {
    assert.equal(stringToRegex("/abc/i")?.flags, "i");
  });

  it("returns undefined for a string that is not in /.../ form", () => {
    assert.equal(stringToRegex("abc"), undefined);
  });
});

describe("objectKeys", () => {
  it("returns the keys of an object", () => {
    assert.deepEqual(objectKeys({ a: 1, b: 2 }), ["a", "b"]);
  });
});

describe("partPathToId", () => {
  it("strips the leading slash and replaces the rest with dashes", () => {
    assert.equal(partPathToId("/main/0/my-part"), "main-0-my-part");
  });

  it("generates a non-empty id when the path is undefined", () => {
    const id = partPathToId(undefined);
    assert.equal(typeof id, "string");
    assert.ok(id.length > 0);
  });
});

describe("assertIsDefined", () => {
  it("throws for null/undefined", () => {
    assert.throws(() => assertIsDefined(null, "thing"), { message: "thing is not defined" });
    assert.throws(() => assertIsDefined(undefined, "thing"));
  });

  it("does not throw for a defined value", () => {
    assert.doesNotThrow(() => assertIsDefined(0));
    assert.doesNotThrow(() => assertIsDefined(""));
  });
});
