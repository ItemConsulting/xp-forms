import { difference, flatMap, intersection } from "/lib/forms/arrays";
import { localize } from "/lib/xp/i18n";
import type { JSONSchema } from "/lib/forms/json-schema";
import type { Integration } from "/lib/forms/extensions";

export type SchemaError = {
  errors: string[];
  warnings: string[];
};

type MissingValidation = [key: string, validationType: string];

const VALIDATION_TYPES = ["minLength", "maxLength", "minItems", "maxItems", "pattern"] as const;

export function compareSchemas(
  referenceSchema: JSONSchema,
  contentSchema: JSONSchema,
  locale: string,
  integration: Integration,
): SchemaError {
  const errors = difference(referenceSchema.required, contentSchema.required).map((key) => {
    const validationName = localize({
      key: "mixin.fieldPropsInput.validation.required",
      locale,
    });

    return localize({
      key: "adminValidation.validationMissing",
      values: [integration.displayName, key, validationName],
      locale,
    });
  });

  const missingFields = difference(getOptionalKeys(referenceSchema), getOptionalKeys(contentSchema)).map((key) => {
    return localize({
      key: "adminValidation.optionalFieldMissing",
      values: [integration.displayName, key],
      locale,
    });
  });

  const missingValidations = getValidation(referenceSchema, contentSchema).map(([key, validationType]) => {
    const validationName = localize({
      key: `mixin.fieldPropsInput.validation.${validationType}`,
      locale,
    });

    return localize({
      key: "adminValidation.validationMissing",
      values: [integration.displayName, key, validationName],
      locale,
    });
  });

  return {
    errors,
    warnings: missingFields.concat(missingValidations),
  };
}

function getOptionalKeys(schema: JSONSchema): string[] {
  return difference(Object.keys(schema.properties), schema.required);
}

function getValidation(referenceSchema: JSONSchema, contentSchema: JSONSchema): MissingValidation[] {
  const commonKeys = intersection(Object.keys(referenceSchema.properties), Object.keys(contentSchema.properties));

  return flatMap(commonKeys, (key) => {
    const referenceValidation = onlyValidationTypes(Object.keys(referenceSchema.properties[key]));
    const contentValidation = Object.keys(contentSchema.properties[key]);

    return difference(referenceValidation, contentValidation).map((validationType) => [key, validationType]);
  });
}

function onlyValidationTypes(keys: string[]): string[] {
  return intersection(keys, VALIDATION_TYPES);
}
