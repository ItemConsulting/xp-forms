import type { Errors } from "/cms/partials/error-summary/error-summary";
import type { SpamPreventionConfig } from "/cms/partials/spam-prevention/spam-prevention.freemarker";

export type PageReview = {
  frameId: string;
  isPreviewReviewPage: boolean;
  editUrl: string;
  backUrl: string;
  title: string;
  text?: string;
  sections: Section[];
  submitButtonText: string;
  errors: Errors;
  pageId: string;
  spamPreventionConfig: SpamPreventionConfig;
};

export type Section = {
  title: string;
  fields: Field[];
};

export type Field = {
  id: string;
  name: string;
  label: string;
  values: string[];
  valuesResolved: string[];
};
