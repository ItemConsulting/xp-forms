import { flatMap, forceArray } from "/lib/forms/arrays";
import { serviceUrl, type Content } from "/lib/xp/portal";
import { getName, hasSelectedValue, type FormFieldRaw, type Properties } from "/lib/forms/form-utils";
import type { Form } from "/site/content-types";

export type JSONSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  $id?: string;
  title: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  required?: string[];
};

type SchemaPropertyString = {
  type: "string";
  description?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

type SchemaPropertyArray = {
  type: "array";
  description?: string;
  items: {
    type: string;
  };
  minItems?: number;
  maxItems?: number;
};

type SchemaProperty = SchemaPropertyString | SchemaPropertyArray;

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

export function getJsonSchema(content: Content<Form>, baseUrl?: string): JSONSchema {
  const fields = normalizeFields(content);

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: getSchemaId(content._id, baseUrl),
    title: content.displayName,
    type: "object",
    properties: fields.map(getProperty).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    required: flatMap(fields, getRequired),
  };
}

function getSchemaId(id: string, baseUrl?: string): string {
  if (baseUrl) {
    return `${baseUrl}/_/service/no.item.forms/json-schema?id=${id}`;
  } else {
    return serviceUrl({
      service: "json-schema",
      params: { id },
      type: "absolute",
    });
  }
}

function getProperty(field: FormFieldNormalized): Record<string, SchemaProperty> {
  switch (field.type) {
    case "checkboxes": {
      const arrProperty: SchemaPropertyArray = {
        type: "array",
        items: {
          type: "string",
        },
        description: field.description,
      };

      if (field.properties.validationMinItems?.minItems) {
        arrProperty.minItems = field.properties.validationMinItems.minItems;
      }

      if (field.properties.validationMaxItems?.maxItems) {
        arrProperty.maxItems = field.properties.validationMaxItems.maxItems;
      }

      return {
        [field.name]: arrProperty,
      };
    }
    case "input":
    case "textarea": {
      const strProperty: SchemaPropertyString = {
        type: "string",
        description: field.description,
      };

      if (field.properties.validationMinLength?.minLength) {
        strProperty.minLength = field.properties.validationMinLength.minLength;
      }

      if (field.properties.validationMaxLength?.maxLength) {
        strProperty.maxLength = field.properties.validationMaxLength.maxLength;
      }

      if (field.properties.validationPattern?.regexString) {
        strProperty.pattern = field.properties.validationPattern.regexString;
      }

      return {
        [field.name]: strProperty,
      };
    }
    default:
      return {
        [field.name]: {
          type: "string",
          description: field.description,
        },
      };
  }
}

function getRequired(field: FormFieldNormalized): string[] {
  return field.type !== "hidden" && hasSelectedValue(field.properties, "validationRequired") ? [field.name] : [];
}

export function normalizeFields(content: Content<Form>): FormFieldNormalized[] {
  return flatMap(forceArray(content.data.pages), (page) => page.fields).map(normalizeField);
}

function normalizeField(field: FormFieldRaw): FormFieldNormalized {
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
        options: field.checkboxes.options.reduce(getOptionsReducer, {}),
      };
    case "radiobuttons":
      return {
        type: "radiobuttons",
        name: getName(field.radiobuttons),
        description: field.radiobuttons.label,
        properties: field.radiobuttons.properties,
        options: field.radiobuttons.options.reduce(getOptionsReducer, {}),
      };
    case "hidden":
      return {
        type: "hidden",
        name: getName(field.hidden),
        properties: {},
      };
  }
}

function getOptionsReducer(
  result: Record<string, string>,
  option: { text: string; value: string },
): Record<string, string> {
  result[option.value] = option.text;
  return result;
}
