import type { JSONSchema as Standard } from "json-schema-typed/draft-2020-12";
import type { Form } from "/cms/content-types";
import type { Fields, FormPageForm } from "/cms/form-fragments";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import { flatMap, forceArray } from "/lib/forms/arrays";
import { getName, hasSelectedValue } from "/lib/forms/form-utils";
import type { PickSelectedValue } from "/lib/forms/types";
import { localize } from "/lib/xp/i18n";
import { apiUrl, type Content } from "/lib/xp/portal";

type RawField = Fields["fields"][number];

export type Properties<Type extends Exclude<RawField["_selected"], "hidden">> = PickSelectedValue<
  RawField,
  Type
>["properties"];

/*
  The rules an editor sets on the fields of a form, as a JSON Schema (draft 2020-12). The same schema
  is what the form is validated against, here and in a headless frontend, and what a form type's
  schema is compared with.

  The schema describes the values once they are normalized (see `normalizeValues` in
  /lib/forms/validation): a field that holds one value is a string, checkboxes are an array of
  strings, and a field left empty is missing. That is what lets `required` mean "not empty".

  Every rule comes with the message to show when it fails, in `errorMessages`, keyed by the keyword
  of the rule. The message for `required` sits on the field too, although the keyword sits on the
  object. A pattern is an ECMAScript regular expression without the "u" flag, the way XP's script
  engine runs it.

  JSON Schema has no flags for a pattern. A pattern with the flags "i" or "m" is given in `regexp`
  instead, as `{ pattern, flags }`, the way the "regexp" keyword of ajv-keywords reads it, so that it
  is checked with its flags here, and in a frontend that adds that keyword to Ajv.
*/

// The keywords of JSON Schema draft 2020-12, with their descriptions from the specification
type Keywords = Standard.Interface;

// Only names a keyword of JSON Schema, so that a misspelled one does not compile
type Keyword<Name extends keyof Keywords> = Name;

/*
  The types below name only the keywords the schema of a form uses, so that the validator in
  /lib/forms/validation has to check each of them, and nothing else. `errorMessages` is our own.
*/

export type JSONSchema = Pick<Keywords, "$id" | "title" | "required"> & {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  type: "object";
  properties: Record<string, SchemaProperty>;
};

export type ValidationKeyword =
  | Keyword<"required" | "minLength" | "maxLength" | "pattern" | "enum" | "minItems" | "maxItems">
  // Our own, a pattern with flags
  | "regexp";

export type ErrorMessages = Partial<Record<ValidationKeyword, string>>;

export type SchemaPropertyString = Pick<Keywords, "description" | "minLength" | "maxLength" | "pattern"> & {
  type: "string";
  enum?: string[];
  regexp?: ParsedRegExp;
  errorMessages?: ErrorMessages;
};

export type SchemaPropertyArray = Pick<Keywords, "description" | "minItems" | "maxItems"> & {
  type: "array";
  items: {
    type: "string";
    enum?: string[];
  };
  errorMessages?: ErrorMessages;
};

export type SchemaProperty = SchemaPropertyString | SchemaPropertyArray;

export type FormFieldNormalized =
  | {
      type: "input";
      name: string;
      description?: string;
      properties: Properties<"input">;
    }
  | {
      type: "textarea";
      name: string;
      description?: string;
      properties: Properties<"textarea">;
    }
  | {
      type: "select";
      name: string;
      description?: string;
      properties: Properties<"select">;
      options: Record<string, string>;
    }
  | {
      type: "checkboxes";
      name: string;
      description?: string;
      properties: Properties<"checkboxes">;
      options: Record<string, string>;
    }
  | {
      type: "radiobuttons";
      name: string;
      description?: string;
      properties: Properties<"radiobuttons">;
      options: Record<string, string>;
    }
  | {
      type: "hidden";
      name: string;
      description?: string;
      properties: Record<string, unknown>;
    };

/** A pattern as an editor wrote it, split into the regular expression and the flags after it */
export type ParsedPattern = {
  source: string;
  flags: string;
};

/** A pattern with flags, as the "regexp" keyword of ajv-keywords reads it */
export type ParsedRegExp = {
  pattern: string;
  flags: string;
};

// The flags XP's script engine knows, but for "g", which does not change whether a pattern matches
const PATTERN_FLAGS = ["i", "m"];

/** The schema of every field in the form, with the messages in the given language */
export function getJsonSchema(content: Content<Form>, locale: string): JSONSchema {
  return {
    ...fieldsToJsonSchema(normalizeFields(content), locale),
    $id: getSchemaId(content._id),
    title: content.displayName,
  };
}

/** The schema of the fields on one page of a form */
export function getPageJsonSchema(page: FormPageForm, locale: string): JSONSchema {
  return {
    ...fieldsToJsonSchema(normalizePageFields(page), locale),
    title: page.title,
  };
}

function fieldsToJsonSchema(fields: FormFieldNormalized[], locale: string): JSONSchema {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: fields.reduce<Record<string, SchemaProperty>>((properties, field) => {
      properties[field.name] = getProperty(field, locale);
      return properties;
    }, {}),
    required: flatMap(fields, getRequired),
  };
}

function getSchemaId(id: string): string {
  return apiUrl({
    api: "no.item.forms:json-schema",
    params: { id },
    type: "absolute",
  });
}

function getProperty(field: FormFieldNormalized, locale: string): SchemaProperty {
  const errorMessages: ErrorMessages = {};

  if (field.type !== "hidden" && hasSelectedValue(field.properties, "validationRequired")) {
    errorMessages.required = message(locale, "required", field.properties.validationRequired?.errorMessage);
  }

  switch (field.type) {
    case "checkboxes": {
      const { validationMinItems, validationMaxItems } = field.properties;
      const property: SchemaPropertyArray = {
        type: "array",
        description: field.description,
        items: {
          type: "string",
          enum: Object.keys(field.options),
        },
      };

      if (hasSelectedValue(field.properties, "validationMinItems") && validationMinItems?.minItems) {
        property.minItems = validationMinItems.minItems;
        errorMessages.minItems = message(locale, "minItems", validationMinItems.errorMessage, property.minItems);
      }

      if (hasSelectedValue(field.properties, "validationMaxItems") && validationMaxItems?.maxItems) {
        property.maxItems = validationMaxItems.maxItems;
        errorMessages.maxItems = message(locale, "maxItems", validationMaxItems.errorMessage, property.maxItems);
      }

      errorMessages.enum = message(locale, "enum");

      return withErrorMessages(property, errorMessages);
    }
    case "input":
    case "textarea": {
      const { validationMinLength, validationMaxLength, validationPattern } = field.properties;
      const property: SchemaPropertyString = {
        type: "string",
        description: field.description,
      };

      if (hasSelectedValue(field.properties, "validationMinLength") && validationMinLength?.minLength) {
        property.minLength = validationMinLength.minLength;
        errorMessages.minLength = message(locale, "minLength", validationMinLength.errorMessage, property.minLength);
      }

      if (hasSelectedValue(field.properties, "validationMaxLength") && validationMaxLength?.maxLength) {
        property.maxLength = validationMaxLength.maxLength;
        errorMessages.maxLength = message(locale, "maxLength", validationMaxLength.errorMessage, property.maxLength);
      }

      // A pattern that is not a regular expression is left out, and reported to the editor
      const pattern = hasSelectedValue(field.properties, "validationPattern")
        ? parsePattern(validationPattern?.regexString)
        : undefined;

      if (pattern && isValidRegExp(pattern.source)) {
        const flags = getCheckedFlags(pattern.flags);
        const keyword = flags ? "regexp" : "pattern";

        if (flags) {
          property.regexp = { pattern: pattern.source, flags };
        } else {
          property.pattern = pattern.source;
        }

        // Both have the default message of "pattern"
        errorMessages[keyword] = message(
          locale,
          "pattern",
          validationPattern?.errorMessage,
          validationPattern?.regexString,
        );
      }

      return withErrorMessages(property, errorMessages);
    }
    case "select":
    case "radiobuttons":
      return withErrorMessages(
        {
          type: "string",
          description: field.description,
          enum: Object.keys(field.options),
        },
        { ...errorMessages, enum: message(locale, "enum") },
      );
    case "hidden":
      return {
        type: "string",
      };
  }
}

function withErrorMessages<Property extends SchemaProperty>(
  property: Property,
  errorMessages: ErrorMessages,
): Property {
  if (Object.keys(errorMessages).length > 0) {
    property.errorMessages = errorMessages;
  }

  return property;
}

/** The editor's own message, or the default one in the form's language */
function message(locale: string, keyword: ValidationKeyword, errorMessage?: string, value?: string | number): string {
  return (
    errorMessage ||
    localize({
      key: `validation.${keyword}`,
      values: value === undefined ? [] : [value.toString()],
      locale,
    })
  );
}

function getRequired(field: FormFieldNormalized): string[] {
  return field.type !== "hidden" && hasSelectedValue(field.properties, "validationRequired") ? [field.name] : [];
}

/**
 * Reads a pattern the way an editor writes it: either between slashes, with flags after it, as in
 * "/^\d+$/i", or as the bare regular expression. Only what can be flags of a JavaScript regular
 * expression, each at most once, is read as flags, so that "/kontakt/oss" is a bare pattern.
 */
export function parsePattern(regexString: string | undefined): ParsedPattern | undefined {
  if (!regexString) {
    return undefined;
  }

  const match = /^\/(.+)\/([dgimsuvy]*)$/.exec(regexString);

  return match && !hasRepeatedCharacter(match[2])
    ? { source: match[1], flags: match[2] }
    : { source: regexString, flags: "" };
}

function hasRepeatedCharacter(value: string): boolean {
  return value.split("").some((character, index) => value.indexOf(character) !== index);
}

/** The flags of a pattern that are checked, in a fixed order. The others are reported to the editor. */
export function getCheckedFlags(flags: string): string {
  return PATTERN_FLAGS.filter((flag) => flags.indexOf(flag) !== -1).join("");
}

export function isValidRegExp(source: string): boolean {
  try {
    new RegExp(source);
    return true;
  } catch (_e) {
    return false;
  }
}

export function normalizeFields(content: Content<Form>): FormFieldNormalized[] {
  return flatMap(forceArray(content.data.pages), normalizePageFields);
}

export function normalizePageFields(page: FormPageForm): FormFieldNormalized[] {
  return forceArray(page.fields).map(normalizeField);
}

function normalizeField(field: RawField): FormFieldNormalized {
  switch (field._selected) {
    case "input":
      return {
        type: "input",
        name: getName(field.input),
        description: field.input.label,
        properties: field.input.properties,
      };
    case "textarea":
      return {
        type: "textarea",
        name: getName(field.textarea),
        description: field.textarea.label,
        properties: field.textarea.properties,
      };
    case "select":
      return {
        type: "select",
        name: getName(field.select),
        description: field.select.label,
        properties: field.select.properties,
        options: forceArray(field.select.options).reduce(getOptionsReducer, {}),
      };
    case "checkboxes":
      return {
        type: "checkboxes",
        name: getName(field.checkboxes),
        description: field.checkboxes.label,
        properties: field.checkboxes.properties,
        options: forceArray(field.checkboxes.options).reduce(getOptionsReducer, {}),
      };
    case "radiobuttons":
      return {
        type: "radiobuttons",
        name: getName(field.radiobuttons),
        description: field.radiobuttons.label,
        properties: field.radiobuttons.properties,
        options: forceArray(field.radiobuttons.options).reduce(getOptionsReducer, {}),
      };
    case "hidden":
      return {
        type: "hidden",
        name: getName(field.hidden),
        properties: {},
      };
  }
}

// An option missing its text or value cannot be shown or sent, and is left out
function getOptionsReducer(
  result: Record<string, string>,
  option: { text: string; value: string },
): Record<string, string> {
  if (option.value && option.text) {
    result[option.value] = option.text;
  }
  return result;
}

export function resolveValues(data: SubmittedValues, fields: FormFieldNormalized[]): SubmittedValues {
  return fields.reduce<SubmittedValues>((res, value) => {
    const dataValue = data[value.name];

    if (dataValue) {
      res[value.name] = resolveValue(value, dataValue);
    }
    return res;
  }, {});
}

function resolveValue(field: FormFieldNormalized, value: string | string[]): string | string[] {
  const singleValue = forceArray(value)[0];

  switch (field.type) {
    // Look up label for single value
    case "select":
    case "radiobuttons":
      return field.options[singleValue];

    // Look up labels for multiple values
    case "checkboxes":
      return forceArray(value).map((value) => field.options[value]);
    default:
      return singleValue ?? "";
  }
}
