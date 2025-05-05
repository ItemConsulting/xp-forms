import { findRepoThatContainsContentWithId, runAsAdmin } from "/lib/forms/contexts";
import { localize } from "/lib/xp/i18n";
import { getSiteConfig } from "/lib/xp/content";
import { send as sendEmail } from "/lib/xp/mail";
import { assertIsDefined } from "/lib/forms/utils";
import { forceArray } from "/lib/forms/arrays";
import { getLocaleFromRequest } from "/lib/forms/locale";
import type { Request } from "@enonic-types/core";
import type { FormExtensions } from "/lib/forms/extensions";
import type { FormEvent } from "/site/parts/form-view/form-view";

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
  const formSubmissionReceiverEmail = runAsAdmin(
    () =>
      getSiteConfig<XP.SiteConfig>({
        applicationKey: app.name,
        key: data.siteId,
      })?.formSubmissionReceiverEmail,
    {
      repository: findRepoThatContainsContentWithId(data.siteId),
      branch: data.branch ?? "master",
    },
  );

  assertIsDefined(formSubmissionReceiverEmail, "formSubmissionReceiverEmail");

  log.info("Handling email form submission...");

  const body = data.fields
    .map((field) => `${field.description ?? field.name}: ${forceArray(data.values[field.name]).join(", ")}`)
    .join("\n\n");

  sendEmail({
    subject: data.values.subject,
    from: `${data.values.name} <${data.values.email}>`,
    to: formSubmissionReceiverEmail,
    body,
  });

  log.info("E-mail with content-form info sent.");
}
