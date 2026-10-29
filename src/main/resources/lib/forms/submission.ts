import type { Request } from "@enonic-types/core";
import type { FormPageForm } from "/cms/form-fragments";
import type { Errors } from "/cms/partials/error-summary/error-summary";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import type { ContentForm } from "/lib/forms/contents";
import type { Integration } from "/lib/forms/extensions";
import { type FormFieldNormalized, getPageJsonSchema, normalizeFields, resolveValues } from "/lib/forms/json-schema";
import { assertIsDefined } from "/lib/forms/utils";
import { validate } from "/lib/forms/validation";
import { getUser } from "/lib/xp/auth";
import { send as sendEvent } from "/lib/xp/event";
import type { Site } from "/lib/xp/portal";

export type FormEvent<Values extends SubmittedValues> = {
  siteId: string;
  formId: string;
  branch: string | undefined;
  integration?: Integration;
  fields: FormFieldNormalized[];
  values: Values;
  userKey?: string;
};

/**
 * Validates the values against the JSON Schema of each of the given pages, and returns the errors keyed
 * by field name. Values for fields on other pages are not looked at.
 */
export function validatePages(pages: FormPageForm[], values: SubmittedValues, locale: string): Errors {
  return pages.reduce<Errors>((errors, page) => {
    const pageErrors = validate(getPageJsonSchema(page, locale), values);

    for (const name of Object.keys(pageErrors)) {
      errors[name] = (errors[name] ?? []).concat(pageErrors[name]);
    }

    return errors;
  }, {});
}

/**
 * Sends the "form.submit" event that the form types listen for, with every value resolved to the
 * text the visitor saw for it.
 */
export function sendFormEvent(
  req: Request,
  site: Site<unknown> | null,
  content: ContentForm,
  values: SubmittedValues,
  integration: Integration | undefined,
): void {
  assertIsDefined(site, "site");

  const fields = normalizeFields(content);

  sendEvent<FormEvent<SubmittedValues>>({
    type: "form.submit",
    data: {
      siteId: site._id,
      formId: content._id,
      branch: req.branch,
      userKey: getUser()?.key,
      integration,
      fields,
      values: resolveValues(values, fields),
    },
    distributed: false,
  });
}
