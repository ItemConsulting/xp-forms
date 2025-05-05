import { findRepoThatContainsContentWithId, runAsAdmin } from "/lib/forms/contexts";
import { localize } from "/lib/xp/i18n";
import { get as getOne, getSite, getSiteConfig, type Content } from "/lib/xp/content";
import { send as sendEmail } from "/lib/xp/mail";
import { assertIsDefined } from "/lib/forms/utils";
import { normalizeFields, type FormFieldNormalized } from "/lib/forms/json-schema";
import { forceArray } from "/lib/forms/arrays";
import { getLocaleFromRequest } from "/lib/forms/locale";
import type { Form } from "/site/content-types";
import type { Request } from "@enonic-types/core";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";

export type JSONSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  $id?: string;
  title: string;
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
};

export type FormEvent<Values extends SubmittedValues> = {
  siteId: string;
  formId: string;
  branch: string | undefined;
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
          minLength: 3,
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
  const repository = findRepoThatContainsContentWithId(data.siteId);

  runAsAdmin(
    () => {
      log.info("Handling email form submission...");

      const content = getOne<Content<Form>>({
        key: data.formId,
      });

      const site = getSite<XP.SiteConfig>({
        key: data.siteId,
      });

      const formSubmissionReceiverEmail = getSiteConfig<XP.SiteConfig>({
        applicationKey: app.name,
        key: data.siteId,
      })?.formSubmissionReceiverEmail;

      assertIsDefined(content, "content");
      assertIsDefined(site, "site");
      assertIsDefined(formSubmissionReceiverEmail, "formSubmissionReceiverEmail");

      sendEmail({
        subject: data.values.subject,
        from: `${data.values.name} <${data.values.email}>`,
        to: formSubmissionReceiverEmail,
        body: createEmailByFormSubmission(data, content),
      });

      log.info("E-mail with content-form info sent.");
    },
    {
      repository,
      branch: data.branch ?? "master",
    },
  );
}

export function createEmailByFormSubmission(data: EmailFormData, content: Content<Form>): string {
  const fields = normalizeFields(content);

  return fields
    .map((field) => {
      const resolvedValue = resolveValue(field, data.values[field.name]);
      return `${field.description ?? field.name}: ${resolvedValue}`;
    })
    .join("\n\n");
}

function resolveValue(field: FormFieldNormalized, value: string | string[]): string {
  const singleValue = forceArray(value)[0];

  switch (field.type) {
    // Look up label for single value
    case "select":
    case "radiobuttons":
      return field.options[singleValue];

    // Look up labels for multiple values
    case "checkboxes":
      return forceArray(value)
        .map((value) => field.options[value])
        .join(", ");

    // Return single value
    case "input":
    case "textarea":
    case "hidden":
    default:
      return singleValue ?? "";
  }
}
