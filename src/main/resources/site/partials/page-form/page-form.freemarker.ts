import type { InputField } from "/site/partials/input/input.freemarker";
import type { TextAreaField } from "/site/partials/text-area/text-area.freemarker";
import type { SelectField } from "/site/partials/select/select.freemarker";
import type { CheckboxesField } from "/site/partials/checkboxes/checkboxes.freemarker";
import type { RadioButtonsField } from "/site/partials/radiobuttons/radiobuttons.freemarker";
import type { Errors } from "/lib/forms/validation";

export type PageForm = {
  locale: string;
  title: string;
  text?: string;
  fields: Field[];
  errors: Errors;
  submitButtonText: string;
  backUrl?: string;
};

export type Field = InputField | TextAreaField | SelectField | CheckboxesField | RadioButtonsField | HiddenField;

export type HiddenField = {
  type: "hidden";
  id: string;
  name: string;
  value: string;
};
