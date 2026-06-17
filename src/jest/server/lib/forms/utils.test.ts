import { describe, expect, it } from "@jest/globals";
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
    expect(notNullOrUndefined(null)).toBe(false);
    expect(notNullOrUndefined(undefined)).toBe(false);
    expect(notNullOrUndefined(0)).toBe(true);
    expect(notNullOrUndefined("")).toBe(true);
  });
});

describe("notEmptyOrUndefined / isEmptyOrUndefined", () => {
  it("treats empty string, null and undefined as empty", () => {
    for (const empty of ["", null, undefined]) {
      expect(isEmptyOrUndefined(empty)).toBe(true);
      expect(notEmptyOrUndefined(empty)).toBe(false);
    }
  });

  it("treats a non-empty string as non-empty", () => {
    expect(isEmptyOrUndefined("x")).toBe(false);
    expect(notEmptyOrUndefined("x")).toBe(true);
  });
});

describe("stringToRegex", () => {
  it("parses a /pattern/flags string into a RegExp", () => {
    const regex = stringToRegex("/^\\d+$/");
    expect(regex).toBeInstanceOf(RegExp);
    expect(regex?.test("123")).toBe(true);
    expect(regex?.test("12a")).toBe(false);
  });

  it("keeps the flags", () => {
    expect(stringToRegex("/abc/i")?.flags).toBe("i");
  });

  it("returns undefined for a string that is not in /.../ form", () => {
    expect(stringToRegex("abc")).toBeUndefined();
  });
});

describe("objectKeys", () => {
  it("returns the keys of an object", () => {
    expect(objectKeys({ a: 1, b: 2 })).toEqual(["a", "b"]);
  });
});

describe("partPathToId", () => {
  it("strips the leading slash and replaces the rest with dashes", () => {
    expect(partPathToId("/main/0/my-part")).toBe("main-0-my-part");
  });

  it("generates a non-empty id when the path is undefined", () => {
    const id = partPathToId(undefined);
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});

describe("assertIsDefined", () => {
  it("throws for null/undefined", () => {
    expect(() => assertIsDefined(null, "thing")).toThrow("thing is not defined");
    expect(() => assertIsDefined(undefined, "thing")).toThrow();
  });

  it("does not throw for a defined value", () => {
    expect(() => assertIsDefined(0)).not.toThrow();
    expect(() => assertIsDefined("")).not.toThrow();
  });
});
