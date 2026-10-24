import { getName, hasSelectedValue, processHelpText } from "/lib/forms/form-utils";
import type { InputText as InputTextRaw } from ".";
import type { InputText } from "./input-text.freemarker";

export function process(raw: InputTextRaw, pageId: string, submittedValue: string | undefined): InputText {
  return {
    type: "text",
    id: `${pageId}-${getName(raw)}`,
    label: raw.label,
    name: getName(raw),
    helpText: processHelpText(raw.helpText),
    value: submittedValue ?? raw.value,
    placeholder: raw.properties?.placeholder?.placeholder,
    autocomplete: raw.properties?.autocomplete?.autocomplete,
    inputmode: raw.properties?.inputMode?.inputmode,
    required: hasSelectedValue(raw.properties, "validationRequired"),
  };
}
