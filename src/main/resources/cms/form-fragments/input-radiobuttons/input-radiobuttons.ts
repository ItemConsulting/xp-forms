import { forceArray } from "/lib/forms/arrays";
import { getName, hasSelectedValue, processHelpText, setChecked } from "/lib/forms/form-utils";
import type { InputRadiobuttons as InputRadioButtonsRaw } from ".";
import type { InputRadioButtons } from "./input-radiobuttons.freemarker";

export function process(
  raw: InputRadioButtonsRaw,
  pageId: string,
  submittedValue: string | undefined,
): InputRadioButtons {
  const value = submittedValue ?? raw.value;

  return {
    type: "radiobuttons",
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
