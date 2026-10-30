import { forceArray } from "/lib/forms/arrays";
import { getName, hasSelectedValue, processHelpText, setChecked } from "/lib/forms/form-utils";
import type { InputSelect as InputSelectRaw } from ".";
import type { InputSelect } from "./input-select.freemarker";

export function process(raw: InputSelectRaw, pageId: string, submittedValue: string | undefined): InputSelect {
  const value = submittedValue ?? raw.value;

  return {
    type: "select",
    id: `${pageId}-${getName(raw)}`,
    label: raw.label,
    name: getName(raw),
    helpText: processHelpText(raw.helpText),
    value,
    options: forceArray(raw.options)
      .filter((option) => option.value && option.text)
      .map(setChecked(value)),
    autocomplete: raw.autocomplete,
    required: hasSelectedValue(raw.properties, "validationRequired"),
  };
}
