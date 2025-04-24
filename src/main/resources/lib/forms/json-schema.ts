import { flatMap, forceArray } from "/lib/forms/arrays";
import { serviceUrl, type Content } from "/lib/xp/portal";
import { getName, hasSelectedValue, type FormFieldRaw, type Properties } from "/lib/forms/form-utils";
import type { Form } from "/site/content-types";

type SchemaProperty =
  | {
      type: "string";
      description?: string;
    }
  | {
      type: "array";
      description?: string;
      items: {
        type: string;
      };
      minItems?: number;
      maxItems?: number;
    };

type FormFieldNormalized =
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
    }
  | {
      type: "checkboxes";
      name: string;
      description?: string;
      properties: Properties<"checkboxes">;
    }
  | {
      type: "radiobuttons";
      name: string;
      description?: string;
      properties: Properties<"radiobuttons">;
    }
  | {
      type: "hidden";
      name: string;
      description?: string;
      properties: Record<string, unknown>;
    };

/*
const EXAMPLE_SCHEMA = `
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "age": {
      "type": "number",
      "minimum": 0
    },
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "required": ["name", "email"]
  }
}`;
*/
// TODO Warning when not required field are missing

// Kan man generere er json schema fra content og sammenligne?

export type JSONSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  $id: string;
  title: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
};

export function getJsonSchema(content: Content<Form>): JSONSchema {
  //const jsonSchema = JSON.parse(EXAMPLE_SCHEMA);
  const pages = forceArray(content.data.pages);

  const fields = flatMap(pages, (page) => page.fields).map(normalizeField);

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: serviceUrl({
      service: "json-schema",
      params: {
        id: content._id,
      },
      type: "absolute",
    }),
    title: content.displayName,
    type: "object",
    properties: fields.map(getProperty).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    required: flatMap(fields, getRequired),
  };
}

function getProperty(field: FormFieldNormalized): Record<string, SchemaProperty> {
  return field.type === "checkboxes"
    ? {
        [field.name]: {
          type: "array",
          items: {
            type: "string",
          },
          description: field.description,
          minItems: field.properties.validationMinItems?.minItems,
          maxItems: field.properties.validationMaxItems?.maxItems,
        },
      }
    : {
        [field.name]: {
          type: "string",
          description: field.description,
          // TODO minLength, maxLength, pattern
        },
      };
}

function getRequired(field: FormFieldNormalized): string[] {
  return field.type !== "hidden" && hasSelectedValue(field.properties, "validationRequired") ? [field.name] : [];
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
      };
    case "checkboxes":
      return {
        type: "checkboxes",
        name: getName(field.checkboxes),
        description: field.checkboxes.label,
        properties: field.checkboxes.properties,
      };
    case "radiobuttons":
      return {
        type: "radiobuttons",
        name: getName(field.radiobuttons),
        description: field.radiobuttons.label,
        properties: field.radiobuttons.properties,
      };
    case "hidden":
      return {
        type: "hidden",
        name: getName(field.hidden),
        properties: {},
      };
  }
}
