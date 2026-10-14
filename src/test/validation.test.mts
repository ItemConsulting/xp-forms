import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
import type { SubmittedValue, SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";

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
    assert.deepEqual(run(requiredValidator(["f"], {}), "x"), { value: "x" });
    assert.deepEqual(run(requiredValidator(["f"], {}), ["a"]), { value: ["a"] });
  });

  it("fails for empty string, undefined and empty array", () => {
    const validator = requiredValidator(["email"], { errorMessage: "Required" });
    const expected = { issues: [{ message: "Required", path: ["email"] }] };

    assert.deepEqual(run(validator, ""), expected);
    assert.deepEqual(run(validator, undefined), expected);
    assert.deepEqual(run(validator, []), expected);
  });

  it("falls back to the localized message key when no errorMessage is given", () => {
    assert.deepEqual(run(requiredValidator(["email"], {}), ""), {
      issues: [{ message: "validation.required", path: ["email"] }],
    });
  });
});

describe("minLengthValidator", () => {
  const validator = minLengthValidator(["f"], { minLength: 3, errorMessage: "too short" });

  it("passes when length >= minLength", () => {
    assert.deepEqual(run(validator, "abc"), { value: "abc" });
    assert.deepEqual(run(validator, ["a", "b", "c"]), { value: ["a", "b", "c"] });
  });

  it("fails when shorter (including undefined → length 0)", () => {
    assert.deepEqual(run(validator, "ab"), { issues: [{ message: "too short", path: ["f"] }] });
    assert.deepEqual(run(validator, undefined), { issues: [{ message: "too short", path: ["f"] }] });
  });
});

describe("maxLengthValidator", () => {
  const validator = maxLengthValidator(["f"], { maxLength: 3, errorMessage: "too long" });

  it("passes when length <= maxLength (undefined counts as 0)", () => {
    assert.deepEqual(run(validator, "abc"), { value: "abc" });
    assert.deepEqual(run(validator, undefined), { value: undefined });
  });

  it("fails when longer", () => {
    assert.deepEqual(run(validator, "abcd"), { issues: [{ message: "too long", path: ["f"] }] });
  });
});

describe("patternValidator", () => {
  const validator = patternValidator(["f"], { regexString: "/^\\d+$/", errorMessage: "bad" });

  it("passes when the value matches", () => {
    assert.deepEqual(run(validator, "123"), { value: "123" });
  });

  it("lets empty values pass (left to requiredValidator)", () => {
    assert.deepEqual(run(validator, ""), { value: "" });
    assert.deepEqual(run(validator, undefined), { value: undefined });
  });

  it("fails on a non-matching value and never matches arrays", () => {
    assert.deepEqual(run(validator, "12a"), { issues: [{ message: "bad", path: ["f"] }] });
    assert.deepEqual(run(validator, ["1"]), { issues: [{ message: "bad", path: ["f"] }] });
  });

  it("accepts a RegExp instance for regexString", () => {
    const re = patternValidator(["f"], { regexString: /^\d+$/, errorMessage: "bad" });
    assert.deepEqual(run(re, "42"), { value: "42" });
    assert.deepEqual(run(re, "x"), { issues: [{ message: "bad", path: ["f"] }] });
  });
});

describe("minItemsValidator", () => {
  const validator = minItemsValidator(["f"], { minItems: 2, errorMessage: "need more" });

  it("counts via forceArray", () => {
    assert.deepEqual(run(validator, ["a", "b"]), { value: ["a", "b"] });
    assert.deepEqual(run(validator, ["a"]), { issues: [{ message: "need more", path: ["f"] }] });
    assert.deepEqual(run(validator, "x"), { issues: [{ message: "need more", path: ["f"] }] });
    assert.deepEqual(run(validator, undefined), { issues: [{ message: "need more", path: ["f"] }] });
  });
});

describe("maxItemsValidator", () => {
  const validator = maxItemsValidator(["f"], { maxItems: 2, errorMessage: "too many" });

  it("counts via forceArray", () => {
    assert.deepEqual(run(validator, ["a", "b"]), { value: ["a", "b"] });
    assert.deepEqual(run(validator, "x"), { value: "x" });
    assert.deepEqual(run(validator, ["a", "b", "c"]), { issues: [{ message: "too many", path: ["f"] }] });
  });
});

describe("combineValidators", () => {
  it("concatenates issues from every validator, in order", () => {
    const schema = combineValidators([
      requiredValidator(["f"], { errorMessage: "req" }),
      minLengthValidator(["f"], { minLength: 3, errorMessage: "min" }),
    ]);

    assert.deepEqual(run(schema, ""), {
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
    assert.deepEqual(run(schema, "ab"), { issues: [{ message: "min", path: ["f"] }] });
  });

  it("returns the value when everything passes", () => {
    const schema = combineValidators([
      requiredValidator(["f"], { errorMessage: "req" }),
      minLengthValidator(["f"], { minLength: 3, errorMessage: "min" }),
    ]);

    assert.deepEqual(run(schema, "abcd"), { value: "abcd" });
  });

  it("passes for an empty list of validators", () => {
    assert.deepEqual(run(combineValidators([]), "x"), { value: "x" });
  });
});

describe("createFormSchema", () => {
  const schema = createFormSchema({
    name: requiredValidator(["name"], { errorMessage: "name required" }),
    age: minLengthValidator(["age"], { minLength: 2, errorMessage: "age too short" }),
  });

  it("collects issues across fields, keeping each issue's path (no double-pathing)", () => {
    assert.deepEqual(runForm(schema, { name: "", age: "1" }), {
      issues: [
        { message: "name required", path: ["name"] },
        { message: "age too short", path: ["age"] },
      ],
    });
  });

  it("reports only the fields that fail", () => {
    assert.deepEqual(runForm(schema, { name: "John", age: "1" }), {
      issues: [{ message: "age too short", path: ["age"] }],
    });
  });

  it("returns the validated field values when everything passes", () => {
    assert.deepEqual(runForm(schema, { name: "John", age: "12" }), {
      value: { name: "John", age: "12" },
    });
  });

  it("includes only validated fields in the success value (ignores un-validated keys)", () => {
    const result = runForm(schema, { name: "John", age: "12", extra: "ignored" });
    assert.deepEqual(result, { value: { name: "John", age: "12" } });
  });

  it("composes combined per-field validators (multiple issues for one field)", () => {
    const composed = createFormSchema({
      f: combineValidators([
        requiredValidator(["f"], { errorMessage: "req" }),
        minLengthValidator(["f"], { minLength: 3, errorMessage: "min" }),
      ]),
    });

    assert.deepEqual(runForm(composed, { f: "" }), {
      issues: [
        { message: "req", path: ["f"] },
        { message: "min", path: ["f"] },
      ],
    });
  });

  it("returns an empty value object for an empty validator record", () => {
    assert.deepEqual(runForm(createFormSchema({}), { a: "x" }), { value: {} });
  });
});
