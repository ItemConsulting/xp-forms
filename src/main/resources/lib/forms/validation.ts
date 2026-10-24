import type { Errors } from "/cms/partials/error-summary/error-summary";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import { forceArray } from "/lib/forms/arrays";
import type {
  JSONSchema,
  SchemaProperty,
  SchemaPropertyArray,
  SchemaPropertyString,
  ValidationKeyword,
} from "/lib/forms/json-schema";

/*
  Validates the values of a form against the JSON Schema made from its fields (see
  /lib/forms/json-schema). Only the keywords that schema uses are checked, the way a JSON Schema
  validator checks them, so that a headless frontend validating the same schema with a library such
  as Ajv gets the same result. Written for XP's script engine, which runs ES5.
*/

export type NormalizedValues = Record<string, string | string[]>;

/**
 * The values in the shape the schema describes. A field that holds one value gets the first one sent
 * as a string, checkboxes get an array, and empty strings are left out, so that a field left empty is
 * missing. Values for fields the schema does not know are left out too.
 */
export function normalizeValues(schema: JSONSchema, values: SubmittedValues): NormalizedValues {
  return Object.keys(schema.properties).reduce<NormalizedValues>((normalized, name) => {
    const nonEmpty = forceArray(values[name]).filter((value) => typeof value === "string" && value !== "");

    if (nonEmpty.length > 0) {
      normalized[name] = schema.properties[name].type === "array" ? nonEmpty : nonEmpty[0];
    }

    return normalized;
  }, {});
}

/**
 * Validates the values against the schema, and returns the messages of the rules that failed, keyed by
 * field name. Empty when the values are valid.
 */
export function validate(schema: JSONSchema, values: SubmittedValues): Errors {
  const normalized = normalizeValues(schema, values);
  const required = schema.required ?? [];

  return Object.keys(schema.properties).reduce<Errors>((errors, name) => {
    const property = schema.properties[name];
    const value = normalized[name];
    const failed: ValidationKeyword[] =
      value === undefined ? (required.indexOf(name) !== -1 ? ["required"] : []) : validateProperty(property, value);

    if (failed.length > 0) {
      errors[name] = failed.map((keyword) => getErrorMessage(property, keyword));
    }

    return errors;
  }, {});
}

function validateProperty(property: SchemaProperty, value: string | string[]): ValidationKeyword[] {
  return property.type === "array"
    ? validateArray(property, forceArray(value))
    : validateString(property, typeof value === "string" ? value : value[0]);
}

function validateString(property: SchemaPropertyString, value: string): ValidationKeyword[] {
  const failed: ValidationKeyword[] = [];
  const length = codePointLength(value);

  if (property.minLength !== undefined && length < property.minLength) {
    failed.push("minLength");
  }

  if (property.maxLength !== undefined && length > property.maxLength) {
    failed.push("maxLength");
  }

  if (property.pattern !== undefined && !new RegExp(property.pattern).test(value)) {
    failed.push("pattern");
  }

  if (property.regexp !== undefined && !new RegExp(property.regexp.pattern, property.regexp.flags).test(value)) {
    failed.push("regexp");
  }

  if (property.enum !== undefined && property.enum.indexOf(value) === -1) {
    failed.push("enum");
  }

  return failed;
}

function validateArray(property: SchemaPropertyArray, value: string[]): ValidationKeyword[] {
  const failed: ValidationKeyword[] = [];
  const allowed = property.items.enum;

  if (property.minItems !== undefined && value.length < property.minItems) {
    failed.push("minItems");
  }

  if (property.maxItems !== undefined && value.length > property.maxItems) {
    failed.push("maxItems");
  }

  // One message for the field, however many of its values are not among the options
  if (allowed !== undefined && value.some((item) => allowed.indexOf(item) === -1)) {
    failed.push("enum");
  }

  return failed;
}

function getErrorMessage(property: SchemaProperty, keyword: ValidationKeyword): string {
  return property.errorMessages?.[keyword] ?? keyword;
}

/** The length the way JSON Schema counts it: in characters, where JavaScript counts UTF-16 code units */
export function codePointLength(value: string): number {
  const surrogatePairs = value.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
  return value.length - (surrogatePairs ? surrogatePairs.length : 0);
}
