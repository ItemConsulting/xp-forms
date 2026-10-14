import type { Errors } from "/lib/forms/types";
import type { InputCheckboxes } from "/cms/partials/input-checkboxes/input-checkboxes.freemarker";
import type { InputRadioButtons } from "/cms/partials/input-radiobuttons/input-radiobuttons.freemarker";
import type { InputSelect } from "/cms/partials/input-select/input-select.freemarker";
import type { InputText } from "/cms/partials/input-text/input-text.freemarker";
import type { InputTextArea } from "/cms/partials/input-text-area/input-text-area.freemarker";
import type { SpamPreventionConfig } from "/cms/partials/page-utils/page-utils.freemarker";

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

export type Field = InputText | InputTextArea | InputSelect | InputCheckboxes | InputRadioButtons | HiddenField;

export type HiddenField = {
  type: "hidden";
  id: string;
  name: string;
  value: string;
};
