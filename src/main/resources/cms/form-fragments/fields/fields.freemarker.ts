import type { InputCheckboxes } from "../input-checkboxes/input-checkboxes.freemarker";
import type { InputHidden } from "../input-hidden/input-hidden.freemarker";
import type { InputRadioButtons } from "../input-radiobuttons/input-radiobuttons.freemarker";
import type { InputSelect } from "../input-select/input-select.freemarker";
import type { InputText } from "../input-text/input-text.freemarker";
import type { InputTextArea } from "../input-text-area/input-text-area.freemarker";

export type Field = InputText | InputTextArea | InputSelect | InputCheckboxes | InputRadioButtons | InputHidden;
