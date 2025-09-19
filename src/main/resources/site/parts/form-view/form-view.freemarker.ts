import type { Errors } from "/lib/forms/validation";

export type FreemarkerParams = {
  frameId: string;
  pages: string[];
  errors: Errors;
  values: Record<string, string[] | string | undefined>;
  adminErrors?: Errors;
};

export type SubmittedValues = Record<string, string[] | string | undefined>;
