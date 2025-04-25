import { runOnDraftAsAdmin } from "/lib/forms/contexts";
import { localize } from "/lib/xp/i18n";
import { get as getOne, type Content } from "/lib/xp/content";
import { send as sendEmail } from "/lib/xp/mail";
import { assertIsDefined, objectKeys } from "/lib/forms/utils";
import { getJsonSchema } from "/lib/forms/json-schema";
import { forceArray } from "/lib/forms/arrays";
import { getLocaleFromRequest } from "/lib/forms/locale";
import type { Form } from "/site/content-types";
import type { Request } from "@enonic-types/core";

export type JSONSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  $id?: string;
  title: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
};

export type FormEvent<Values extends Record<string, string[] | string>> = {
  siteId: string;
  formId: string;
  integrationId?: string;
  values: Values;
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

export type EmailFormData = FormEvent<{
  email: string;
  name: string;
  subject: string;
  [key: string]: string[] | string;
}>;

export function extensions(req: Request): FormExtensions | FormExtensions[] {
  const locale = getLocaleFromRequest(req);

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
          description: "Email",
        },
        subject: {
          type: "string",
          description: "Subject",
        },
      },
      required: ["name", "email", "subject"],
    },
  };
}

export function handleEmailForm(data: EmailFormData): void {
  runOnDraftAsAdmin(() => {
    if (!app.config.emailReceiver) {
      throw new Error(`No "emailReceiver" has been configured for "${app.name}"}`);
    }

    const content = getOne<Content<Form>>({
      key: data.formId,
    });

    assertIsDefined(content);

    sendEmail({
      subject: data.values.subject,
      from: `${data.values.name} <${data.values.email}>`,
      to: app.config.emailReceiver,
      body: createEmailByFormSubmission(data, content),
    });

    log.info("E-mail with content-form info sent.");
  });
}

export function createEmailByFormSubmission(data: EmailFormData, content: Content<Form>): string {
  const schema = getJsonSchema(content);

  return objectKeys(schema.properties)
    .map((name) => {
      const label = schema.properties[name].description ?? name;

      return `${label}: ${forceArray(data.values[name]).join(", ")}`;
    })
    .join("\n");
}
