import type { Request } from "@enonic-types/core";
import { find, forceArray } from "/lib/forms/arrays";
import { findRepoThatContainsContentWithId, runAsAdmin } from "/lib/forms/contexts";
import type { FormExtensions } from "/lib/forms/extensions";
import { getLocaleFromRequest } from "/lib/forms/locale";
import { assertIsDefined, notNullOrUndefined } from "/lib/forms/utils";
import { getUser } from "/lib/xp/auth";
import { getSiteConfig } from "/lib/xp/content";
import { localize } from "/lib/xp/i18n";
import { send as sendEmail } from "/lib/xp/mail";
import { getSiteConfig as getPortalSiteConfig } from "/lib/xp/portal";
import type { FormEvent } from "/cms/parts/form-view/form-view";

export type EmailFormData = FormEvent<{
  email: string;
  name: string;
  subject: string;
  [key: string]: string[] | string;
}>;

export function extensions(req: Request): FormExtensions | FormExtensions[] {
  const locale = getLocaleFromRequest(req);
  const siteConfig = getPortalSiteConfig<XP.SiteConfig>();

  return forceArray(siteConfig?.formTypes)
    .map((formType) => {
      switch (formType._selected) {
        case "email":
          return createEmailExtension(locale);

        default:
          return undefined;
      }
    })
    .filter(notNullOrUndefined);
}

function createEmailExtension(locale: string): FormExtensions {
  return {
    id: "email",
    displayName: localize({
      key: "site.formTypes.email",
      locale,
    }),
    description: localize({
      key: "site.formTypes.emailHelpText",
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
    values() {
      const user = getUser();

      return {
        name: user?.displayName,
        email: user?.email,
      };
    },
  };
}

export function handleEmailForm(data: EmailFormData): void {
  const { formSubmissionSenderEmail, formSubmissionReceiverEmail } = runAsAdmin(
    () => {
      const siteConfig = getSiteConfig<XP.SiteConfig>({
        applicationKey: app.name,
        key: data.siteId,
      });

      const config = find(forceArray(siteConfig?.formTypes), (formType) => {
        return formType._selected === "email";
      })?.email;

      return {
        formSubmissionSenderEmail: config?.formSubmissionSenderEmail,
        formSubmissionReceiverEmail: config?.formSubmissionReceiverEmail,
      };
    },
    {
      repository: findRepoThatContainsContentWithId(data.siteId),
      branch: data.branch ?? "master",
    },
  );

  assertIsDefined(formSubmissionSenderEmail, "formSubmissionSenderEmail");
  assertIsDefined(formSubmissionReceiverEmail, "formSubmissionReceiverEmail");

  const body = data.fields
    .map((field) => `${field.description ?? field.name}: ${forceArray(data.values[field.name]).join(", ")}`)
    .join("\n\n");

  sendEmail({
    subject: data.values.subject,
    from: formSubmissionSenderEmail,
    to: formSubmissionReceiverEmail,
    body,
  });
}
