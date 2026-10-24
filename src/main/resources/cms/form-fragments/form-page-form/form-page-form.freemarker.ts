import type { Field } from "/cms/form-fragments/fields/fields.freemarker";
import type { Errors } from "/cms/partials/error-summary/error-summary";
import type { SpamPreventionConfig } from "/cms/partials/spam-prevention/spam-prevention.freemarker";

export type PageForm = {
  frameId: string;
  pageId: string;
  title: string;
  text?: string;
  fields: Field[];
  errors: Errors;
  submitButtonText: string;
  backUrl?: string;
  spamPreventionConfig: SpamPreventionConfig;
};
