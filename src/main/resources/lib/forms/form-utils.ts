import { forceArray } from "/lib/forms/arrays";
import type { StandardSchemaV1 } from "/lib/forms/standard-schema";
import type { PickSelectedValue } from "/lib/forms/types";
import {
  combineValidators,
  maxItemsValidator,
  maxLengthValidator,
  minItemsValidator,
  minLengthValidator,
  patternValidator,
  requiredValidator,
} from "/lib/forms/validation";
import { sanitize } from "/lib/xp/common";
import type { Form as FormRaw } from "/site/content-types";
import type { SubmittedValue } from "/site/parts/form-view/form-view.freemarker";

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

export function getValidators(field: FormFieldRaw): Record<string, StandardSchemaV1<SubmittedValue, SubmittedValue>> {
  const validators: StandardSchemaV1<SubmittedValue, SubmittedValue>[] = [];

  switch (field._selected) {
    case "input":
    case "textarea": {
      const inputName = getName(field._selected === "input" ? field.input : field.textarea);
      const inputProperties = field._selected === "input" ? field.input.properties : field.textarea.properties;

      if (hasSelectedValue(inputProperties, "validationRequired")) {
        validators.push(requiredValidator([inputName], inputProperties.validationRequired));
      }

      if (hasSelectedValue(inputProperties, "validationMinLength")) {
        validators.push(minLengthValidator([inputName], inputProperties.validationMinLength));
      }

      if (hasSelectedValue(inputProperties, "validationMaxLength")) {
        validators.push(maxLengthValidator([inputName], inputProperties.validationMaxLength));
      }

      if (hasSelectedValue(inputProperties, "validationPattern")) {
        validators.push(patternValidator([inputName], inputProperties.validationPattern));
      }

      return validators.length > 0 ? { [inputName]: combineValidators(validators) } : {};
    }
    case "select":
    case "radiobuttons": {
      const selectName = getName(field._selected === "select" ? field.select : field.radiobuttons);
      const properties = field._selected === "select" ? field.select.properties : field.radiobuttons.properties;

      if (hasSelectedValue(properties, "validationRequired")) {
        validators.push(requiredValidator([selectName], properties.validationRequired));
      }

      return validators.length > 0 ? { [selectName]: combineValidators(validators) } : {};
    }
    case "checkboxes": {
      const checkboxesName = getName(field.checkboxes);
      if (hasSelectedValue(field.checkboxes.properties, "validationRequired")) {
        validators.push(requiredValidator([checkboxesName], field.checkboxes.properties.validationRequired));
      }

      if (hasSelectedValue(field.checkboxes.properties, "validationMinItems")) {
        validators.push(minItemsValidator([checkboxesName], field.checkboxes.properties.validationMinItems));
      }

      if (hasSelectedValue(field.checkboxes.properties, "validationMaxItems")) {
        validators.push(maxItemsValidator([checkboxesName], field.checkboxes.properties.validationMaxItems));
      }

      return validators.length > 0 ? { [checkboxesName]: combineValidators(validators) } : {};
    }
    default:
      return {};
  }
}
