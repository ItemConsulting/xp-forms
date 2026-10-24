import type { InputHidden as InputHiddenRaw } from ".";
import type { InputHidden } from "./input-hidden.freemarker";

export function process(raw: InputHiddenRaw, pageId: string, submittedValue: string | undefined): InputHidden {
  return {
    type: "hidden",
    id: `${pageId}-${raw.name}`,
    name: raw.name,
    value: submittedValue ?? raw.value ?? "",
  };
}
