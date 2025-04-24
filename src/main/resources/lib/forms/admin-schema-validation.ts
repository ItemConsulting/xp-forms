import { difference } from "/lib/forms/arrays";
import { localize } from "/lib/xp/i18n";
import type { JSONSchema } from "/lib/forms/json-schema";

export type SchemaError = {
  errors: string[];
  warnings: string[];
};

export function compareSchemas(referenceSchema: JSONSchema, contentSchema: JSONSchema, locale: string): SchemaError {
  const errors = difference(referenceSchema.required, contentSchema.required).map((key) => {
    return localize({
      key: "adminValidation.requiredFieldMissing",
      values: [key],
      locale,
    });
  });

  // TODO Warnings for fields that are not required

  // TODO minLength, maxLength, pattern for "string", minItems, maxItems for "array"

  return {
    errors,
    warnings: [],
  };
}
