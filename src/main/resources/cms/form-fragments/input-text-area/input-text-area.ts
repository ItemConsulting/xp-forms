import { getName, hasSelectedValue, processHelpText } from "/lib/forms/form-utils";
import type { InputTextArea as InputTextAreaRaw } from ".";
import type { InputTextArea } from "./input-text-area.freemarker";

export function process(raw: InputTextAreaRaw, pageId: string, submittedValue: string | undefined): InputTextArea {
  return {
    type: "textarea",
    id: `${pageId}-${getName(raw)}`,
    label: raw.label,
    name: getName(raw),
    cols: raw.cols,
    rows: raw.rows,
    helpText: processHelpText(raw.helpText),
    value: submittedValue ?? raw.value,
    placeholder: raw.properties?.placeholder?.placeholder,
    autocomplete: raw.properties?.autocomplete?.autocomplete,
    inputmode: raw.properties?.inputMode?.inputmode,
    required: hasSelectedValue(raw.properties, "validationRequired"),
  };
}
