import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { FormPageForm } from "/cms/form-fragments";
import { getPageJsonSchema, type JSONSchema, parsePattern } from "/lib/forms/json-schema";
import { codePointLength, normalizeValues, validate } from "/lib/forms/validation";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";

/*
  The i18n stub returns the phrase key, so a default message reads "validation.<keyword>", which tells
  which rule failed.
*/

const PAGE = {
  title: "Om deg",
  fields: [
    {
      _selected: "input",
      input: {
        label: "Navn",
        name: "name",
        properties: {
          _selected: ["validationRequired", "validationMinLength", "validationMaxLength"],
          validationRequired: { errorMessage: "Skriv navnet ditt" },
          validationMinLength: { minLength: 2 },
          validationMaxLength: { maxLength: 5 },
        },
      },
    },
    {
      _selected: "input",
      input: {
        label: "Telefon",
        name: "phone",
        properties: {
          _selected: ["validationPattern"],
          validationPattern: { regexString: "/^\\d{8}$/" },
        },
      },
    },
    {
      _selected: "textarea",
      textarea: {
        label: "Kommentar",
        name: "comment",
        properties: {
          // Not selected, so the minimum length that is stored is not a rule
          _selected: [],
          validationMinLength: { minLength: 10 },
        },
      },
    },
    {
      _selected: "select",
      select: {
        label: "Emne",
        name: "topic",
        options: [
          { text: "Frivillig", value: "volunteer" },
          { text: "Gave", value: "donate" },
          // Without a value, and left out
          { text: "Tom" },
        ],
        properties: {
          _selected: ["validationRequired"],
          validationRequired: {},
        },
      },
    },
    {
      _selected: "checkboxes",
      checkboxes: {
        label: "Interesser",
        name: "interests",
        options: [
          { text: "A", value: "a" },
          { text: "B", value: "b" },
          { text: "C", value: "c" },
        ],
        properties: {
          _selected: ["validationMinItems", "validationMaxItems"],
          validationMinItems: { minItems: 1 },
          validationMaxItems: { maxItems: 2, errorMessage: "Velg høyst to" },
        },
      },
    },
    {
      _selected: "hidden",
      hidden: { name: "source", value: "web" },
    },
  ],
} as unknown as FormPageForm;

const schema = getPageJsonSchema(PAGE, "no");

const VALID: SubmittedValues = {
  name: "Kari",
  phone: "12345678",
  topic: "donate",
  interests: ["a", "c"],
};

describe("getPageJsonSchema", () => {
  it("describes each field with the rules the editor selected, and their messages", () => {
    assert.deepEqual(JSON.parse(JSON.stringify(schema)), {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Om deg",
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Navn",
          minLength: 2,
          maxLength: 5,
          errorMessages: {
            required: "Skriv navnet ditt",
            minLength: "validation.minLength",
            maxLength: "validation.maxLength",
          },
        },
        phone: {
          type: "string",
          description: "Telefon",
          pattern: "^\\d{8}$",
          errorMessages: { pattern: "validation.pattern" },
        },
        comment: {
          type: "string",
          description: "Kommentar",
        },
        topic: {
          type: "string",
          description: "Emne",
          enum: ["volunteer", "donate"],
          errorMessages: { required: "validation.required", enum: "validation.enum" },
        },
        interests: {
          type: "array",
          description: "Interesser",
          items: { type: "string", enum: ["a", "b", "c"] },
          minItems: 1,
          maxItems: 2,
          errorMessages: { minItems: "validation.minItems", maxItems: "Velg høyst to", enum: "validation.enum" },
        },
        source: {
          type: "string",
        },
      },
      required: ["name", "topic"],
    });
  });

  it("leaves out a pattern that is not a regular expression", () => {
    const page = {
      fields: [
        {
          _selected: "input",
          input: {
            label: "Kode",
            name: "code",
            properties: { _selected: ["validationPattern"], validationPattern: { regexString: "/[a-/" } },
          },
        },
      ],
    } as unknown as FormPageForm;

    assert.deepEqual(getPageJsonSchema(page, "no").properties.code, { type: "string", description: "Kode" });
  });
});

describe("a pattern with flags", () => {
  const page = {
    fields: [
      {
        _selected: "input",
        input: {
          label: "Kode",
          name: "code",
          properties: { _selected: ["validationPattern"], validationPattern: { regexString: "/^[a-z]+$/gi" } },
        },
      },
    ],
  } as unknown as FormPageForm;
  const flagged = getPageJsonSchema(page, "no");

  it("is given in regexp, with the flags that are checked", () => {
    assert.deepEqual(JSON.parse(JSON.stringify(flagged.properties.code)), {
      type: "string",
      description: "Kode",
      regexp: { pattern: "^[a-z]+$", flags: "i" },
      errorMessages: { regexp: "validation.pattern" },
    });
  });

  it("is checked with its flags, as with the regexp keyword of ajv-keywords", () => {
    const ajv = new Ajv2020({ allErrors: true, unicodeRegExp: false });
    ajv.addKeyword("errorMessages");
    ajv.addKeyword({
      keyword: "regexp",
      type: "string",
      schemaType: "object",
      validate: (regexp: { pattern: string; flags: string }, data: string) =>
        new RegExp(regexp.pattern, regexp.flags).test(data),
    });
    const ajvValidate = ajv.compile(JSON.parse(JSON.stringify(flagged)) as JSONSchema);

    assert.deepEqual(validate(flagged, { code: "Ola" }), {});
    assert.equal(ajvValidate(normalizeValues(flagged, { code: "Ola" })), true);
    assert.deepEqual(validate(flagged, { code: "Ola1" }), { code: ["validation.pattern"] });
    assert.equal(ajvValidate(normalizeValues(flagged, { code: "Ola1" })), false);
  });
});

describe("parsePattern", () => {
  it("reads a pattern between slashes, with its flags", () => {
    assert.deepEqual(parsePattern("/^\\d+$/i"), { source: "^\\d+$", flags: "i" });
  });

  it("reads a bare pattern as it is", () => {
    assert.deepEqual(parsePattern("^\\d+$"), { source: "^\\d+$", flags: "" });
  });

  it("reads a pattern between slashes as bare when what follows cannot be flags", () => {
    assert.deepEqual(parsePattern("/kontakt/oss"), { source: "/kontakt/oss", flags: "" });
    assert.deepEqual(parsePattern("/a/ii"), { source: "/a/ii", flags: "" });
  });

  it("is undefined without a pattern", () => {
    assert.equal(parsePattern(undefined), undefined);
    assert.equal(parsePattern(""), undefined);
  });
});

describe("normalizeValues", () => {
  it("gives single-value fields a string, checkboxes an array, and leaves empty values and unknown fields out", () => {
    assert.deepEqual(
      normalizeValues(schema, {
        name: ["Kari", "Ola"],
        phone: "",
        comment: [""],
        topic: "donate",
        interests: "a",
        unknown: "x",
      }),
      { name: "Kari", topic: "donate", interests: ["a"] },
    );
  });
});

describe("validate", () => {
  it("passes valid values", () => {
    assert.deepEqual(validate(schema, VALID), {});
  });

  it("reports a required field left empty with its required message", () => {
    assert.deepEqual(validate(schema, { ...VALID, name: "", topic: undefined }), {
      name: ["Skriv navnet ditt"],
      topic: ["validation.required"],
    });
  });

  it("does not check the length or pattern of an optional field left empty", () => {
    assert.deepEqual(validate(schema, { ...VALID, phone: "" }), {});
  });

  it("checks length, pattern and number of items", () => {
    assert.deepEqual(validate(schema, { ...VALID, name: "K", phone: "123", interests: ["a", "b", "c"] }), {
      name: ["validation.minLength"],
      phone: ["validation.pattern"],
      interests: ["Velg høyst to"],
    });
  });

  it("refuses a value that is not one of the options, once per field", () => {
    assert.deepEqual(validate(schema, { ...VALID, topic: "other", interests: ["x", "y"] }), {
      topic: ["validation.enum"],
      interests: ["validation.enum"],
    });
  });

  it("counts characters, not UTF-16 code units", () => {
    assert.equal(codePointLength("😀😀"), 2);
    assert.deepEqual(validate(schema, { ...VALID, name: "😀😀😀😀😀" }), {});
  });
});

describe("validate agrees with Ajv", () => {
  // The way a headless frontend is meant to set Ajv up for the schema
  const ajv = new Ajv2020({ allErrors: true, unicodeRegExp: false });
  ajv.addKeyword("errorMessages");
  const ajvValidate = ajv.compile(JSON.parse(JSON.stringify(schema)) as JSONSchema);

  // The rules that failed, as "field:keyword", in the order of the schema
  function failedWithAjv(values: SubmittedValues): string[] {
    ajvValidate(normalizeValues(schema, values));

    const failed = (ajvValidate.errors ?? []).map((error) => {
      const field =
        error.keyword === "required" ? (error.params as { missingProperty: string }).missingProperty : error.instancePath.split("/")[1];
      return `${field}:${error.keyword}`;
    });

    return dedupe(failed).sort();
  }

  function failedWithXp(values: SubmittedValues): string[] {
    const errors = validate(schema, values);
    const failed = Object.keys(errors).flatMap((field) =>
      errors[field].map((message) => `${field}:${keywordOf(schema, field, message)}`),
    );

    return failed.sort();
  }

  const cases: Record<string, SubmittedValues> = {
    valid: VALID,
    empty: {},
    "too short and bad pattern": { ...VALID, name: "K", phone: "1234567a" },
    "too long": { ...VALID, name: "Kari Nordmann" },
    "pattern unanchored inside": { ...VALID, phone: "tlf 12345678" },
    "unknown option": { ...VALID, topic: "other", interests: ["a", "x", "y"] },
    "too many items": { ...VALID, interests: ["a", "b", "c"] },
    "astral characters": { ...VALID, name: "😀" },
  };

  for (const [name, values] of Object.entries(cases)) {
    it(name, () => {
      assert.deepEqual(failedWithXp(values), failedWithAjv(values));
    });
  }
});

function dedupe(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

// The keyword whose message this is, read back from the schema
function keywordOf(schema: JSONSchema, field: string, message: string): string {
  const errorMessages = schema.properties[field].errorMessages ?? {};
  return Object.keys(errorMessages).find((keyword) => errorMessages[keyword as keyof typeof errorMessages] === message) ?? message;
}
