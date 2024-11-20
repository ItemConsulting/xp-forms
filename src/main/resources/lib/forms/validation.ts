import { notEmptyOrUndefined, notNullOrUndefined, stringToRegex } from "/lib/forms/utils";
import { localize } from "/lib/xp/i18n";
import { forceArray } from "/lib/forms/arrays";

export type Errors = Record<string, string[]>;

export type ValidatorConfig = {
  name: string;
  errorMessage: string;
  validate: (value: string[] | string | undefined) => boolean;
};

export function validate(obj: Record<string, string[] | string | undefined>, validators: ValidatorConfig[]): Errors {
  return validators.reduce<Errors>((errors, validator) => {
    const value = obj[validator.name];

    if (!validator.validate(value)) {
      errors[validator.name] = errors[validator.name] ?? [];
      errors[validator.name].push(validator.errorMessage);
    }

    return errors;
  }, {});
}

export function requiredValidator(name: string, props: { errorMessage?: string }, locale: string): ValidatorConfig {
  return {
    name,
    errorMessage:
      props.errorMessage ??
      localize({
        key: "validation.required",
        locale,
      }),
    validate: (value) => (Array.isArray(value) ? value.length > 0 : notEmptyOrUndefined(value)),
  };
}

export function minLengthValidator(
  name: string,
  props: { minLength: number; errorMessage?: string },
  locale: string,
): ValidatorConfig {
  return {
    name,
    errorMessage:
      props.errorMessage ??
      localize({
        key: "validation.minLength",
        values: [props.minLength?.toString()],
        locale,
      }),
    validate: (value) => (value?.length ?? 0) >= props.minLength,
  };
}

export function maxLengthValidator(
  name: string,
  props: { maxLength: number; errorMessage?: string },
  locale: string,
): ValidatorConfig {
  return {
    name,
    errorMessage:
      props.errorMessage ??
      localize({
        key: "validation.maxLength",
        values: [props.maxLength?.toString()],
        locale,
      }),
    validate: (value) => (value?.length ?? 0) <= props.maxLength,
  };
}

export function patternValidator(
  name: string,
  props: { regexString: string; errorMessage?: string },
  locale: string,
): ValidatorConfig {
  return {
    name,
    errorMessage:
      props.errorMessage ??
      localize({
        key: "validation.pattern",
        values: [props.regexString],
        locale,
      }),
    validate: (value) => {
      const regex = stringToRegex(props.regexString);
      return notNullOrUndefined(value) && notNullOrUndefined(regex) && !Array.isArray(value) && regex.test(value);
    },
  };
}

export function minItemsValidator(
  name: string,
  props: { minItems: number; errorMessage?: string },
  locale: string,
): ValidatorConfig {
  return {
    name,
    errorMessage:
      props.errorMessage ??
      localize({
        key: "validation.minItems",
        values: [props.minItems?.toString()],
        locale,
      }),
    validate: (value) => forceArray(value).length >= props.minItems,
  };
}

export function maxItemsValidator(
  name: string,
  props: { maxItems: number; errorMessage?: string },
  locale: string,
): ValidatorConfig {
  return {
    name,
    errorMessage:
      props.errorMessage ??
      localize({
        key: "validation.maxItems",
        values: [props.maxItems?.toString()],
        locale,
      }),
    validate: (value) => forceArray(value).length <= props.maxItems,
  };
}
