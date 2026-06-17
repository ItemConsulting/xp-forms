import { describe, expect, it } from "@jest/globals";
import type { StandardSchemaV1 } from "/lib/forms/standard-schema";
import {
  combineValidators,
  createFormSchema,
  maxItemsValidator,
  maxLengthValidator,
  minItemsValidator,
  minLengthValidator,
  patternValidator,
  requiredValidator,
} from "/lib/forms/validation";
import type { SubmittedValue, SubmittedValues } from "/site/parts/form-view/form-view.freemarker";

/** Runs a single-value field schema. */
function run(schema: StandardSchemaV1<SubmittedValue, SubmittedValue>, value: SubmittedValue) {
  return schema["~standard"].validate(value);
}

/** Runs a whole-form schema. */
function runForm(schema: StandardSchemaV1<SubmittedValues, SubmittedValues>, value: SubmittedValues) {
  return schema["~standard"].validate(value);
}

describe("requiredValidator", () => {
  it("passes for a non-empty string and a non-empty array", () => {
    expect(run(requiredValidator(["f"], {}), "x")).toEqual({ value: "x" });
    expect(run(requiredValidator(["f"], {}), ["a"])).toEqual({ value: ["a"] });
  });

  it("fails for empty string, undefined and empty array", () => {
    const validator = requiredValidator(["email"], { errorMessage: "Required" });
    const expected = { issues: [{ message: "Required", path: ["email"] }] };

    expect(run(validator, "")).toEqual(expected);
    expect(run(validator, undefined)).toEqual(expected);
    expect(run(validator, [])).toEqual(expected);
  });

  it("falls back to the localized message key when no errorMessage is given", () => {
    expect(run(requiredValidator(["email"], {}), "")).toEqual({
      issues: [{ message: "validation.required", path: ["email"] }],
    });
  });
});

describe("minLengthValidator", () => {
  const validator = minLengthValidator(["f"], { minLength: 3, errorMessage: "too short" });

  it("passes when length >= minLength", () => {
    expect(run(validator, "abc")).toEqual({ value: "abc" });
    expect(run(validator, ["a", "b", "c"])).toEqual({ value: ["a", "b", "c"] });
  });

  it("fails when shorter (including undefined → length 0)", () => {
    expect(run(validator, "ab")).toEqual({ issues: [{ message: "too short", path: ["f"] }] });
    expect(run(validator, undefined)).toEqual({ issues: [{ message: "too short", path: ["f"] }] });
  });
});

describe("maxLengthValidator", () => {
  const validator = maxLengthValidator(["f"], { maxLength: 3, errorMessage: "too long" });

  it("passes when length <= maxLength (undefined counts as 0)", () => {
    expect(run(validator, "abc")).toEqual({ value: "abc" });
    expect(run(validator, undefined)).toEqual({ value: undefined });
  });

  it("fails when longer", () => {
    expect(run(validator, "abcd")).toEqual({ issues: [{ message: "too long", path: ["f"] }] });
  });
});

describe("patternValidator", () => {
  const validator = patternValidator(["f"], { regexString: "/^\\d+$/", errorMessage: "bad" });

  it("passes when the value matches", () => {
    expect(run(validator, "123")).toEqual({ value: "123" });
  });

  it("lets empty values pass (left to requiredValidator)", () => {
    expect(run(validator, "")).toEqual({ value: "" });
    expect(run(validator, undefined)).toEqual({ value: undefined });
  });

  it("fails on a non-matching value and never matches arrays", () => {
    expect(run(validator, "12a")).toEqual({ issues: [{ message: "bad", path: ["f"] }] });
    expect(run(validator, ["1"])).toEqual({ issues: [{ message: "bad", path: ["f"] }] });
  });

  it("accepts a RegExp instance for regexString", () => {
    const re = patternValidator(["f"], { regexString: /^\d+$/, errorMessage: "bad" });
    expect(run(re, "42")).toEqual({ value: "42" });
    expect(run(re, "x")).toEqual({ issues: [{ message: "bad", path: ["f"] }] });
  });
});

describe("minItemsValidator", () => {
  const validator = minItemsValidator(["f"], { minItems: 2, errorMessage: "need more" });

  it("counts via forceArray", () => {
    expect(run(validator, ["a", "b"])).toEqual({ value: ["a", "b"] });
    expect(run(validator, ["a"])).toEqual({ issues: [{ message: "need more", path: ["f"] }] });
    expect(run(validator, "x")).toEqual({ issues: [{ message: "need more", path: ["f"] }] });
    expect(run(validator, undefined)).toEqual({ issues: [{ message: "need more", path: ["f"] }] });
  });
});

describe("maxItemsValidator", () => {
  const validator = maxItemsValidator(["f"], { maxItems: 2, errorMessage: "too many" });

  it("counts via forceArray", () => {
    expect(run(validator, ["a", "b"])).toEqual({ value: ["a", "b"] });
    expect(run(validator, "x")).toEqual({ value: "x" });
    expect(run(validator, ["a", "b", "c"])).toEqual({ issues: [{ message: "too many", path: ["f"] }] });
  });
});

describe("combineValidators", () => {
  it("concatenates issues from every validator, in order", () => {
    const schema = combineValidators([
      requiredValidator(["f"], { errorMessage: "req" }),
      minLengthValidator(["f"], { minLength: 3, errorMessage: "min" }),
    ]);

    expect(run(schema, "")).toEqual({
      issues: [
        { message: "req", path: ["f"] },
        { message: "min", path: ["f"] },
      ],
    });
  });

  it("only reports the validators that fail", () => {
    const schema = combineValidators([
      requiredValidator(["f"], { errorMessage: "req" }),
      minLengthValidator(["f"], { minLength: 3, errorMessage: "min" }),
    ]);

    // non-empty but too short → required passes, minLength fails
    expect(run(schema, "ab")).toEqual({ issues: [{ message: "min", path: ["f"] }] });
  });

  it("returns the value when everything passes", () => {
    const schema = combineValidators([
      requiredValidator(["f"], { errorMessage: "req" }),
      minLengthValidator(["f"], { minLength: 3, errorMessage: "min" }),
    ]);

    expect(run(schema, "abcd")).toEqual({ value: "abcd" });
  });

  it("passes for an empty list of validators", () => {
    expect(run(combineValidators([]), "x")).toEqual({ value: "x" });
  });
});

describe("createFormSchema", () => {
  const schema = createFormSchema({
    name: requiredValidator(["name"], { errorMessage: "name required" }),
    age: minLengthValidator(["age"], { minLength: 2, errorMessage: "age too short" }),
  });

  it("collects issues across fields, keeping each issue's path (no double-pathing)", () => {
    expect(runForm(schema, { name: "", age: "1" })).toEqual({
      issues: [
        { message: "name required", path: ["name"] },
        { message: "age too short", path: ["age"] },
      ],
    });
  });

  it("reports only the fields that fail", () => {
    expect(runForm(schema, { name: "John", age: "1" })).toEqual({
      issues: [{ message: "age too short", path: ["age"] }],
    });
  });

  it("returns the validated field values when everything passes", () => {
    expect(runForm(schema, { name: "John", age: "12" })).toEqual({
      value: { name: "John", age: "12" },
    });
  });

  it("includes only validated fields in the success value (ignores un-validated keys)", () => {
    const result = runForm(schema, { name: "John", age: "12", extra: "ignored" });
    expect(result).toEqual({ value: { name: "John", age: "12" } });
  });

  it("composes combined per-field validators (multiple issues for one field)", () => {
    const composed = createFormSchema({
      f: combineValidators([
        requiredValidator(["f"], { errorMessage: "req" }),
        minLengthValidator(["f"], { minLength: 3, errorMessage: "min" }),
      ]),
    });

    expect(runForm(composed, { f: "" })).toEqual({
      issues: [
        { message: "req", path: ["f"] },
        { message: "min", path: ["f"] },
      ],
    });
  });

  it("returns an empty value object for an empty validator record", () => {
    expect(runForm(createFormSchema({}), { a: "x" })).toEqual({ value: {} });
  });
});
