import type { Errors } from "/cms/partials/error-summary/error-summary";

export type FreemarkerParams = {
  frameId: string;
  pages: string[];
  errors: Errors;
  values: SubmittedValues;
};

export type SubmittedValue = string[] | string | undefined;
export type SubmittedValues = Record<string, SubmittedValue>;
