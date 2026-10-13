import type { Errors } from "/lib/forms/types";
import type { SpamPreventionConfig } from "/site/partials/page-utils/page-utils.freemarker";

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
