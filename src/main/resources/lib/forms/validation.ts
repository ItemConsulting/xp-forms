import { forceArray } from "/lib/forms/arrays";
import type { StandardSchemaV1 } from "/lib/forms/standard-schema";
import { isEmptyOrUndefined, notEmptyOrUndefined, notNullOrUndefined, stringToRegex } from "/lib/forms/utils";
import { localize } from "/lib/xp/i18n";
import type { SubmittedValue, SubmittedValues } from "/site/parts/form-view/form-view.freemarker";

/**
 * Combines several single-value [Standard Schemas](https://standardschema.dev) into one that runs
 * them all against the same value and concatenates their issues. Used to merge the multiple
 * validators a single field can have (e.g. required + minLength + pattern) into one schema, so they
 * can be keyed by field name in {@link createFormSchema}.
 */
export function combineValidators(
  validators: StandardSchemaV1<SubmittedValue, SubmittedValue>[],
): StandardSchemaV1<SubmittedValue, SubmittedValue> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValue;

        const issues = validators.reduce<StandardSchemaV1.Issue[]>(
          (acc, validator) => acc.concat(validator["~standard"].validate(value, options).issues ?? []),
          [],
        );

        return issues.length > 0 ? { issues } : { value };
      },
    },
  };
}

/**
 * Composes a record of field schemas (keyed by field name) into a single
 * [Standard Schema](https://standardschema.dev) over the submitted values. Each field schema runs
 * against its own value and is responsible for setting its own issue `path` (to the field name).
 * Implemented without `Proxy`/ES2015+ runtime APIs so it runs on the Nashorn (ES5) server engine.
 */
export function createFormSchema(
  validators: Record<string, StandardSchemaV1<SubmittedValue, SubmittedValue>>,
): StandardSchemaV1<SubmittedValues, SubmittedValues> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValues;

        const result = Object.keys(validators).reduce<{ value: SubmittedValues; issues: StandardSchemaV1.Issue[] }>(
          (rec, name) => {
            if (validators[name]) {
              const fieldResult = validators[name]["~standard"].validate(value[name], options);

              if ("value" in fieldResult) {
                rec.value[name] = fieldResult.value;
              }

              rec.issues = rec.issues.concat(fieldResult.issues ?? []);
            }

            return rec;
          },
          { value: {}, issues: [] },
        );

        return result.issues.length > 0 ? { issues: result.issues } : { value: result.value };
      },
    },
  };
}

/**
 * Creates a single-value [Standard Schema](https://standardschema.dev) that fails when the value is
 * empty — an empty/`undefined` string, or an empty array for multi-value fields. On failure it emits
 * one issue at the given `path`.
 *
 * @param path the path set on emitted issues, e.g. `[fieldName]`.
 * @param props optional `errorMessage` overriding the localized `validation.required` message.
 */
export function requiredValidator(
  path: string[],
  props: { errorMessage?: string },
): StandardSchemaV1<SubmittedValue, SubmittedValue> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValue;
        const isValid = Array.isArray(value) ? value.length > 0 : notEmptyOrUndefined(value);
        return isValid
          ? { value }
          : {
              issues: [
                {
                  message:
                    props.errorMessage ??
                    localize({
                      key: "validation.required",
                      locale: getLocaleFromOptions(options),
                    }),
                  path,
                },
              ],
            };
      },
    },
  };
}

/**
 * Creates a single-value [Standard Schema](https://standardschema.dev) that fails when the value is
 * shorter than `props.minLength` (by string/array length). On failure it emits one issue at
 * the given `path`.
 *
 * @param path the path set on emitted issues, e.g. `[fieldName]`.
 * @param props the `minLength` to enforce, and an optional `errorMessage` overriding the localized
 *   `validation.minLength` message.
 */
export function minLengthValidator(
  path: string[],
  props: { minLength: number; errorMessage?: string },
): StandardSchemaV1<SubmittedValue, SubmittedValue> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValue;
        const isValid = (value?.length ?? 0) >= props.minLength;
        return isValid
          ? {
              value,
            }
          : {
              issues: [
                {
                  message:
                    props.errorMessage ??
                    localize({
                      key: "validation.minLength",
                      values: [props.minLength?.toString()],
                      locale: getLocaleFromOptions(options),
                    }),
                  path,
                },
              ],
            };
      },
    },
  };
}

/**
 * Creates a single-value [Standard Schema](https://standardschema.dev) that fails when the value is
 * longer than `props.maxLength` (by string/array length). On failure it emits one issue at
 * the given `path`.
 *
 * @param path the path set on emitted issues, e.g. `[fieldName]`.
 * @param props the `maxLength` to enforce, and an optional `errorMessage` overriding the localized
 *   `validation.maxLength` message.
 */
export function maxLengthValidator(
  path: string[],
  props: { maxLength: number; errorMessage?: string },
): StandardSchemaV1<SubmittedValue, SubmittedValue> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValue;
        const isValid = (value?.length ?? 0) <= props.maxLength;
        return isValid
          ? { value }
          : {
              issues: [
                {
                  message:
                    props.errorMessage ??
                    localize({
                      key: "validation.maxLength",
                      values: [props.maxLength?.toString()],
                      locale: getLocaleFromOptions(options),
                    }),
                  path,
                },
              ],
            };
      },
    },
  };
}

/**
 * Creates a single-value [Standard Schema](https://standardschema.dev) that fails when the value does
 * not match `props.regexString`. Empty values pass (left to {@link requiredValidator}) and array
 * values never match. On failure it emits one issue at the given `path`.
 *
 * @param path the path set on emitted issues, e.g. `[fieldName]`.
 * @param props the `regexString` (a string or `RegExp`) to test against, and an optional
 *   `errorMessage` overriding the localized `validation.pattern` message.
 */
export function patternValidator(
  path: string[],
  props: { regexString: string | RegExp; errorMessage?: string },
): StandardSchemaV1<SubmittedValue, SubmittedValue> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValue;

        // "requiredValidator" is responsible for handling missing values with the correct error message
        if (!Array.isArray(value) && isEmptyOrUndefined(value)) {
          return { value };
        }

        const regex = typeof props.regexString === "string" ? stringToRegex(props.regexString) : props.regexString;
        const isValid =
          notNullOrUndefined(value) && notNullOrUndefined(regex) && !Array.isArray(value) && regex.test(value);

        return isValid
          ? { value }
          : {
              issues: [
                {
                  message:
                    props.errorMessage ??
                    localize({
                      key: "validation.pattern",
                      values: [props.regexString.toString()],
                      locale: getLocaleFromOptions(options),
                    }),
                  path,
                },
              ],
            };
      },
    },
  };
}

/**
 * Creates a single-value [Standard Schema](https://standardschema.dev) that fails when the value has
 * fewer than `props.minItems` entries (counted via `forceArray`, for multi-value fields like
 * checkboxes). On failure it emits one issue at the given `path`.
 *
 * @param path the path set on emitted issues, e.g. `[fieldName]`.
 * @param props the `minItems` to enforce, and an optional `errorMessage` overriding the localized
 *   `validation.minItems` message.
 */
export function minItemsValidator(
  path: string[],
  props: { minItems: number; errorMessage?: string },
): StandardSchemaV1<SubmittedValue, SubmittedValue> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValue;
        const isValid = forceArray(value).length >= props.minItems;
        return isValid
          ? { value }
          : {
              issues: [
                {
                  message:
                    props.errorMessage ??
                    localize({
                      key: "validation.minItems",
                      values: [props.minItems?.toString()],
                      locale: getLocaleFromOptions(options),
                    }),
                  path,
                },
              ],
            };
      },
    },
  };
}

/**
 * Creates a single-value [Standard Schema](https://standardschema.dev) that fails when the value has
 * more than `props.maxItems` entries (counted via `forceArray`, for multi-value fields like
 * checkboxes). On failure it emits one issue at the given `path`.
 *
 * @param path the path set on emitted issues, e.g. `[fieldName]`.
 * @param props the `maxItems` to enforce, and an optional `errorMessage` overriding the localized
 *   `validation.maxItems` message.
 */
export function maxItemsValidator(
  path: string[],
  props: { maxItems: number; errorMessage?: string },
): StandardSchemaV1<SubmittedValue, SubmittedValue> {
  return {
    "~standard": {
      version: 1,
      vendor: "xp-forms",
      validate: (valueRaw, options) => {
        const value = valueRaw as SubmittedValue;
        const isValid = forceArray(value).length <= props.maxItems;
        return isValid
          ? { value }
          : {
              issues: [
                {
                  message:
                    props.errorMessage ??
                    localize({
                      key: "validation.maxItems",
                      values: [props.maxItems?.toString()],
                      locale: getLocaleFromOptions(options),
                    }),
                  path,
                },
              ],
            };
      },
    },
  };
}

function getLocaleFromOptions(options: StandardSchemaV1.Options | undefined): string | undefined {
  if (typeof options?.libraryOptions?.locale === "string") {
    return options.libraryOptions.locale;
  }
}
