import type { Request, Response } from "@enonic-types/core";
import { forceArray } from "/lib/forms/arrays";
import type { ContentForm } from "/lib/forms/contents";
import { getFormType } from "/lib/forms/extensions";
import { verify as verifyHoneypot } from "/lib/forms/honeypot";
import { getLocale } from "/lib/forms/locale";
import { getSpamPreventionType } from "/lib/forms/spam-prevention";
import { sendFormEvent, validatePages } from "/lib/forms/submission";
import { FIELD_TURNSTILE_RESPONSE, verifyTurnstile } from "/lib/forms/turnstile";
import type { Errors } from "/lib/forms/types";
import { get as getOne, getSite as getSiteOfContent } from "/lib/xp/content";
import { localize } from "/lib/xp/i18n";
import { getSite, getSiteConfig } from "/lib/xp/portal";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";

/*
  A frontend that renders the form itself validates each page as the visitor goes, against the JSON
  Schema of the page in Guillotine, and posts here once, when the visitor sends the form. The values of
  every page arrive as form parameters (application/x-www-form-urlencoded). The form's id is the last
  segment of the path, as in ".../_/no.item.forms:submit/<id>", so that no field name can clash with it.

  The values are validated again here, against the schema of every page, before the same "form.submit"
  event as the form-view part is sent. Only a form on the site the API is called on can be sent, and,
  as with the form-view part in live mode, not one with errors for the editor to fix.

  The spam prevention chosen in the site's config applies here too. With Turnstile, the frontend sends
  the token from the widget as "cf-turnstile-response". With the honeypot, the frontend may send the
  field, empty, under its name from the site's config.
*/

export type SubmitResult =
  // The values did not pass validation. The messages are keyed by field name.
  | { status: "invalid"; errors: Errors }
  // The form has been sent
  | { status: "submitted" };

export function POST(req: Request<{ params: SubmittedValues }>): Response {
  const values = req.params;
  const formId = getFormIdFromPath(req.path);
  const content = formId ? getOne<ContentForm>({ key: formId }) : null;
  const site = getSite();

  // The site decides the spam prevention, and is sent along in the event, so it has to be the form's
  if (content?.type !== "no.item.forms:form" || !site || getSiteOfContent({ key: content._id })?._id !== site._id) {
    return { status: 404 };
  }

  const locale = getLocale({ content, site });
  const formType = getFormType(content.data.integrationId, content._id);

  // FormValidator found problems with the form when it was saved, which Content Studio shows
  if (!content.valid) {
    throw new Error(`The form ${content._id} is not valid`);
  }

  const errors = validatePages(forceArray(content.data.pages), values, locale);

  if (Object.keys(errors).length > 0) {
    return json(400, { status: "invalid", errors });
  }

  // Checked after validation, so that a Turnstile token is not used up on values that are sent again
  const spamPreventionType = getSpamPreventionType(getSiteConfig<XP.SiteConfig>());

  if (spamPreventionType === "turnstile" && !verifyTurnstile(req)) {
    return json(400, {
      status: "invalid",
      errors: {
        [FIELD_TURNSTILE_RESPONSE]: [localize({ key: "part.formView.verify.error.turnstile", locale })],
      },
    });
  }

  // A bot that filled in the honeypot is told that the form was sent, so that it does not try again
  if (spamPreventionType === "honeypot" && !verifyHoneypot(req)) {
    return json(200, { status: "submitted" });
  }

  sendFormEvent(req, site, content, values, formType?.integration);

  return json(200, { status: "submitted" });
}

/** The segment of the path after the API's name, or undefined when there is none */
function getFormIdFromPath(path: string): string | undefined {
  const marker = `/${app.name}:submit/`;
  const index = path.indexOf(marker);
  const formId = index === -1 ? "" : path.substring(index + marker.length).split("/")[0];

  return formId ? decodeURIComponent(formId) : undefined;
}

function json(status: number, body: SubmitResult): Response {
  return {
    status,
    contentType: "application/json",
    headers: {
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}
