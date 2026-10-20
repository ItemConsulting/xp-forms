import { forceArray } from "/lib/forms/arrays";
import type { PickSelectedValue } from "/lib/forms/types";
import { sanitize } from "/lib/xp/common";
import type { Form as FormRaw } from "/cms/content-types";

export type FormPageRaw = NonNullable<FormRaw["pages"]>[number];
export type FormFieldRaw = FormPageRaw["fields"][number];
export type FormFieldTypes = FormFieldRaw["_selected"];
export type Properties<Type extends Exclude<FormFieldTypes, "hidden">> = PickSelectedValue<
  FormFieldRaw,
  Type
>["properties"];

export function getName(field: { label?: string; name?: string }): string {
  return field.name ?? sanitize(field.label ?? "");
}

export function hasSelectedValue<T extends string>(properties: { _selected: T[] }, value: NoInfer<T>): boolean {
  return forceArray(properties._selected).indexOf(value) !== -1;
}
