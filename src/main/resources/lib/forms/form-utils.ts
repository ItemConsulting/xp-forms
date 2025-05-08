import { sanitize } from "/lib/xp/common";
import {
  maxItemsValidator,
  maxLengthValidator,
  minItemsValidator,
  minLengthValidator,
  patternValidator,
  requiredValidator,
  validate,
  type Errors,
  type ValidatorConfig,
} from "/lib/forms/validation";
import { flatMap, forceArray } from "/lib/forms/arrays";
import type { PickSelectedValue, Unarray } from "/lib/forms/types";
import type { Form as FormRaw } from "/site/content-types";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";

export type { Errors } from "/lib/forms/validation";
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

export function getErrors(params: SubmittedValues, page: FormPageRaw | undefined, locale: string): Errors {
  const validators = flatMap(forceArray(page?.fields), (field) => getValidators(field, locale));

  return validate(params, validators);
}

function getValidators(field: FormFieldRaw, locale: string): ValidatorConfig[] {
  const validators: ValidatorConfig[] = [];
  switch (field._selected) {
    case "input":
    case "textarea":
      const inputName = getName(field._selected === "input" ? field.input : field.textarea);
      const inputProperties = field._selected === "input" ? field.input.properties : field.textarea.properties;

      if (hasSelectedValue(inputProperties, "validationRequired")) {
        validators.push(requiredValidator(inputName, inputProperties.validationRequired, locale));
      }

      if (hasSelectedValue(inputProperties, "validationMinLength")) {
        validators.push(minLengthValidator(inputName, inputProperties.validationMinLength, locale));
      }

      if (hasSelectedValue(inputProperties, "validationMaxLength")) {
        validators.push(maxLengthValidator(inputName, inputProperties.validationMaxLength, locale));
      }

      if (hasSelectedValue(inputProperties, "validationPattern")) {
        validators.push(patternValidator(inputName, inputProperties.validationPattern, locale));
      }

      break;
    case "select":
    case "radiobuttons":
      const selectName = getName(field._selected === "select" ? field.select : field.radiobuttons);
      const properties = field._selected === "select" ? field.select.properties : field.radiobuttons.properties;

      if (hasSelectedValue(properties, "validationRequired")) {
        validators.push(requiredValidator(selectName, properties.validationRequired, locale));
      }

      break;
    case "checkboxes":
      const checkboxesName = getName(field.checkboxes);
      if (hasSelectedValue(field.checkboxes.properties, "validationRequired")) {
        validators.push(requiredValidator(checkboxesName, field.checkboxes.properties.validationRequired, locale));
      }

      if (hasSelectedValue(field.checkboxes.properties, "validationMinItems")) {
        validators.push(minItemsValidator(checkboxesName, field.checkboxes.properties.validationMinItems, locale));
      }

      if (hasSelectedValue(field.checkboxes.properties, "validationMaxItems")) {
        validators.push(maxItemsValidator(checkboxesName, field.checkboxes.properties.validationMaxItems, locale));
      }

      break;
  }

  return validators;
}
