import { findRepoThatContainsContentWithId, runAsAdmin } from "/lib/forms/contexts";
import { localize } from "/lib/xp/i18n";
import { get as getOne, getSite, getSiteConfig, type Content } from "/lib/xp/content";
import { send as sendEmail } from "/lib/xp/mail";
import { assertIsDefined, objectKeys } from "/lib/forms/utils";
import { getJsonSchema } from "/lib/forms/json-schema";
import { forceArray } from "/lib/forms/arrays";
import { getLocaleFromRequest } from "/lib/forms/locale";
import { list as listVhosts, VirtualHost } from "/lib/xp/vhost";
import type { Form } from "/site/content-types";
import type { Request } from "@enonic-types/core";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";
import { getSubstringAfterLast } from "/lib/forms/strings";

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

  log.info("Found repo: " + repository);

  runAsAdmin(
    () => {
      log.info("Handling email form submission...");

      // TODO We are in main.js mode, and can't access context here
      const content = getOne<Content<Form>>({
        key: data.formId,
      });

      const site = getSite<XP.SiteConfig>({
        key: data.siteId,
      });

      const emailToReceive = getSiteConfig<XP.SiteConfig>({
        applicationKey: app.name,
        key: data.siteId,
      })?.emailToReceive;

      assertIsDefined(content);
      assertIsDefined(site);
      assertIsDefined(emailToReceive);

      log.info("DATA: " + JSON.stringify(data));
      log.info("Site path: " + site._path);

      sendEmail({
        subject: data.values.subject,
        from: `${data.values.name} <${data.values.email}>`,
        to: emailToReceive,
        body: createEmailByFormSubmission(data, content, repository, site._path),
      });

      log.info("E-mail with content-form info sent.");
    },
    {
      repository,
      branch: data.branch ?? "master",
    },
  );
}

export function createEmailByFormSubmission(
  data: EmailFormData,
  content: Content<Form>,
  repository: string | undefined,
  sitePath: string,
): string {
  const vhost: VirtualHost | undefined = listVhosts().vhosts.filter(
    (vhost) => vhost.target === `/site/${getSubstringAfterLast(repository ?? "", ".")}/master/${sitePath}`,
  )[0];

  const host = vhost?.host === "localhost" ? `http://localhost:8080` : `https://${vhost?.host}`;
  const schema = getJsonSchema(content, vhost ? `${host}{vhost.source}` : undefined);

  return objectKeys(schema.properties)
    .map((name) => {
      const label = schema.properties[name].description ?? name;

      return `${label}: ${forceArray(data.values[name]).join(", ")}`;
    })
    .join("\n");
}
