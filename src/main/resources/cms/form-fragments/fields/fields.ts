import { process as processInputCheckboxes } from "/cms/form-fragments/input-checkboxes/input-checkboxes";
import { process as processInputHidden } from "/cms/form-fragments/input-hidden/input-hidden";
import { process as processInputRadioButtons } from "/cms/form-fragments/input-radiobuttons/input-radiobuttons";
import { process as processInputSelect } from "/cms/form-fragments/input-select/input-select";
import { process as processInputText } from "/cms/form-fragments/input-text/input-text";
import { process as processInputTextArea } from "/cms/form-fragments/input-text-area/input-text-area";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import { forceArray } from "/lib/forms/arrays";
import { getName } from "/lib/forms/form-utils";
import { notNullOrUndefined } from "/lib/forms/utils";
import type { Fields as RawFields } from ".";
import type { Field } from "./fields.freemarker";

export function process(rawFields: RawFields, pageId: string, values: SubmittedValues): Field[] {
  return forceArray(rawFields.fields)
    .map((field) => getField(field, pageId, values))
    .filter(notNullOrUndefined);
}

export type FieldSummary = {
  id: string;
  label: string;
  name: string;
};

/** Identifies the fields without rendering them, for pages that only list the answers */
export function getFieldSummaries(rawFields: RawFields, pageId: string): FieldSummary[] {
  return forceArray(rawFields.fields)
    .map(getRawField)
    .filter(notNullOrUndefined)
    .map((raw) => {
      const name = getName(raw);
      return { id: `${pageId}-${name}`, label: raw.label ?? name, name };
    });
}

function getRawField(field: RawFields["fields"][number]): { label?: string; name?: string } | undefined {
  switch (field?._selected) {
    case "input":
      return field.input;
    case "textarea":
      return field.textarea;
    case "select":
      return field.select;
    case "checkboxes":
      return field.checkboxes;
    case "radiobuttons":
      return field.radiobuttons;
    case "hidden":
      return field.hidden;
  }
}

function getField(field: RawFields["fields"][number], pageId: string, values: SubmittedValues): Field | undefined {
  switch (field?._selected) {
    case "input":
      return processInputText(field.input, pageId, getFirstValue(values, field.input));

    case "textarea":
      return processInputTextArea(field.textarea, pageId, getFirstValue(values, field.textarea));

    case "select":
      return processInputSelect(field.select, pageId, getFirstValue(values, field.select));

    case "checkboxes":
      return processInputCheckboxes(field.checkboxes, pageId, values[getName(field.checkboxes)]);

    case "radiobuttons":
      return processInputRadioButtons(field.radiobuttons, pageId, getFirstValue(values, field.radiobuttons));

    case "hidden":
      return processInputHidden(field.hidden, pageId, getFirstValue(values, field.hidden));
  }
}

function getFirstValue(values: SubmittedValues, field: { label?: string; name?: string }): string | undefined {
  const value = values[getName(field)];
  return value && Array.isArray(value) ? value[0] : value;
}
