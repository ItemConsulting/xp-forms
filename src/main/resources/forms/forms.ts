import { LanguageRange, Locale } from "/lib/time";
import { getSupportedLocales, localize } from "/lib/xp/i18n";
import type { Request } from "@enonic-types/core";

export type JSONSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  $id?: string;
  title: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
};

type SchemaProperty =
  | {
      type: "string";
      description?: string;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
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

type FormExtensions = {
  id: string;
  displayName: string;
  description?: string;
  jsonSchema?: JSONSchema;
  populateFields?: () => Record<string, unknown> | undefined;
};

export function extensions(req: Request): FormExtensions | FormExtensions[] {
  const locale = getLocale(req);

  return {
    id: "email",
    displayName: localize({
      key: "formPlugin.email.displayName",
      locale,
    }),
    description: localize({
      key: "formPlugin.email.description",
      locale,
    }),
    jsonSchema: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Contact email",
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name",
        },
        email: {
          type: "string",
          description: "Your email address",
        },
      },
      required: ["name", "email"],
    },
  };
}

function getLocale(req: Request): string {
  const acceptLanguage = req.headers["Accept-Language"];

  if (acceptLanguage) {
    const languageRange = LanguageRange.parse(acceptLanguage);
    return Locale.filterTags(languageRange, getSupportedLocales(["i18n/phrases"]))[0] ?? Locale.ENGLISH.toLanguageTag();
  }

  return Locale.ENGLISH.toLanguageTag();
}
