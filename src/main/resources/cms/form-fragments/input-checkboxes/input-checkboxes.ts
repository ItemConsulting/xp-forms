import { forceArray } from "/lib/forms/arrays";
import { getName, hasSelectedValue, processHelpText, setChecked } from "/lib/forms/form-utils";
import type { InputCheckboxes as InputCheckboxesRaw } from ".";
import type { InputCheckboxes } from "./input-checkboxes.freemarker";

export function process(
  raw: InputCheckboxesRaw,
  pageId: string,
  submittedValue: string[] | string | undefined,
): InputCheckboxes {
  const value = forceArray(submittedValue ?? raw.value);

  return {
    type: "checkboxes",
    id: `${pageId}-${getName(raw)}`,
    label: raw.label,
    name: getName(raw),
    helpText: processHelpText(raw.helpText),
    value,
    options: forceArray(raw.options)
      .filter((option) => option.value && option.text)
      .map(setChecked(value)),
    required: hasSelectedValue(raw.properties, "validationRequired"),
  };
}
