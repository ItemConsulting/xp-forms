import type { InputField } from "/site/partials/input/input.freemarker";
import type { SelectField } from "/site/partials/select/select.freemarker";
import type { TextAreaField } from "/site/partials/text-area/text-area.freemarker";
import type { CheckboxesField } from "/site/partials/checkboxes/checkboxes.freemarker";
import type { RadioButtonsField } from "/site/partials/radiobuttons/radiobuttons.freemarker";
import type { Errors } from "/lib/forms/validation";

export type FreemarkerParams = {
  mode: string;
  locale: string;
  pages: Page[];
  errors: Errors;
  values: Record<string, string[] | string | undefined>;
  adminErrors?: Errors;
};

export type Page = FormPage | SuccessPage;

export type FormPage = {
  type: "form-page";
  title: string;
  text?: string;
  fields: Field[];
  submitButtonText: string;
  backUrl?: string;
};

export type SuccessPage = {
  type: "success-page";
  sections: {
    text: string;
  }[];
};

export type HiddenField = {
  type: "hidden";
  id: string;
  name: string;
  value: string;
};

export type Option = {
  text: string;
  value: string;
  checked?: boolean;
};

export type Field = InputField | TextAreaField | SelectField | CheckboxesField | RadioButtonsField | HiddenField;

export type SubmittedValues = Record<string, string[] | string | undefined>;
