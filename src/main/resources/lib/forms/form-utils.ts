import { forceArray } from "/lib/forms/arrays";
import { sanitize } from "/lib/xp/common";
import { processHtml } from "/lib/xp/portal";

export function getName(field: { label?: string; name?: string }): string {
  return field.name ?? sanitize(field.label ?? "");
}

// The help text is written in an HtmlArea, so links and macros in it must be processed
export function processHelpText(helpText: string | undefined): string | undefined {
  return helpText ? processHtml({ value: helpText }) : undefined;
}

export function hasSelectedValue<T extends string>(properties: { _selected: T[] }, value: NoInfer<T>): boolean {
  return forceArray(properties._selected).indexOf(value) !== -1;
}

export type Option = {
  text: string;
  value: string;
  checked?: boolean;
};

export function setChecked(
  currentValue: string[] | string | undefined,
): ({ text, value }: { text: string; value: string }) => Option {
  return ({ text, value }) => ({
    text,
    value,
    checked: Array.isArray(currentValue) ? currentValue.indexOf(value) !== -1 : currentValue === value,
  });
}
