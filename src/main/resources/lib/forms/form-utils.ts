import { sanitize } from "/lib/xp/common";
import { forceArray } from "/lib/forms/arrays";
import type { PickSelectedValue, Unarray } from "/lib/forms/types";
import type { Form as FormRaw } from "/site/content-types";

export type FormPageRaw = NonNullable<Unarray<FormRaw["pages"]>>;
export type FormFieldRaw = Unarray<FormPageRaw["fields"]>;
export type FormFieldTypes = FormFieldRaw["_selected"];
export type Properties<Type extends Exclude<FormFieldTypes, "hidden">> = PickSelectedValue<
  FormFieldRaw,
  Type
>["properties"];

export function getName(field: { name: string; label?: string }): string;
export function getName(field: { label: string; name?: string }): string;
export function getName(field: { label?: string; name?: string }): string {
  return field.name ?? sanitize(field.label ?? "");
}

export function hasSelectedValue<T extends string>(properties: { _selected: T[] }, value: NoInfer<T>): boolean {
  return forceArray(properties._selected).indexOf(value) !== -1;
}
