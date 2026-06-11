import type { Errors } from "/lib/forms/validation";
import type { InputCheckboxes } from "/site/partials/input-checkboxes/input-checkboxes.freemarker";
import type { InputRadioButtons } from "/site/partials/input-radiobuttons/input-radiobuttons.freemarker";
import type { InputSelect } from "/site/partials/input-select/input-select.freemarker";
import type { InputText } from "/site/partials/input-text/input-text.freemarker";
import type { InputTextArea } from "/site/partials/input-text-area/input-text-area.freemarker";

export type PageForm = {
  frameId: string;
  pageId: string;
  title: string;
  text?: string;
  fields: Field[];
  errors: Errors;
  submitButtonText: string;
  backUrl?: string;
  enableHoneypot?: boolean;
  honeypotFiledId?: string;
};

export type Field = InputText | InputTextArea | InputSelect | InputCheckboxes | InputRadioButtons | HiddenField;

export type HiddenField = {
  type: "hidden";
  id: string;
  name: string;
  value: string;
};
