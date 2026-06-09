import { render } from "/lib/freemarker";
import { getName, hasSelectedValue, type FormFieldRaw, type FormPageRaw, type Errors } from "/lib/forms/form-utils";
import { pageUrl, processHtml, type Content } from "/lib/xp/portal";
import { localize } from "/lib/xp/i18n";
import { forceArray } from "/lib/forms/arrays";
import { notNullOrUndefined } from "/lib/forms/utils";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";
import type { Field, PageForm } from "/site/partials/page-form/page-form.freemarker";

export type Option = {
  text: string;
  value: string;
  checked?: boolean;
};

export type ProcessParams = {
  locale: string;
  partId: string;
  page: FormPageRaw;
  values: SubmittedValues;
  errors: Errors;
  content: Content;
  pageNumber: number;
};

const view = resolve("/site/partials/page-form/page-form.ftlh");

export function process(params: ProcessParams): string {
  const pageId = `${params.partId}-page-${params.pageNumber}`;
  return render<PageForm>(view, {
    frameId: `${params.partId}-frame`,
    pageId,
    title: params.page.title,
    text: processHtml({
      value: params.page.text ?? "",
    }),
    submitButtonText:
      params.page.submitButtonText ??
      localize({
        key: "part.formView.submit",
        locale: params.locale,
      }),
    errors: params.errors,
    fields: getFields(params.page.fields, pageId, params.values),
    enableHoneypot: params.page?.enableHoneypot ?? false,
    honeypotFiledId: params.page.honeypotFiledId as unknown as string,
    backUrl:
      params.pageNumber > 1
        ? pageUrl({
            path: params.content._path,
            params: {
              page: (params.pageNumber - 1).toString(),
            },
          })
        : undefined,
  });
}

export function getFields(fields: FormPageRaw["fields"], pageId: string, values: SubmittedValues): Field[] {
  return forceArray(fields)
    .map((field) => getField(field, pageId, values))
    .filter(notNullOrUndefined);
}

function getField(field: FormFieldRaw, pageId: string, values: SubmittedValues): Field | undefined {
  switch (field?._selected) {
    case "input":
      return {
        type: "input",
        id: `${pageId}-${getName(field.input)}`,
        label: field.input.label,
        name: getName(field.input),
        helpText: processHtml({
          value: field.input.helpText ?? "",
        }),
        value: getFirstValue(values, field.input) ?? field.input.value,
        placeholder: field.input.properties?.placeholder?.placeholder,
        autocomplete: field.input.properties?.autocomplete?.autocomplete,
        inputmode: field.input.properties?.inputMode?.inputmode,
        required: hasSelectedValue(field.input.properties, "validationRequired"),
      };

    case "textarea":
      return {
        type: "textarea",
        id: `${pageId}-${getName(field.textarea)}`,
        label: field.textarea.label,
        name: getName(field.textarea),
        cols: field.textarea.cols,
        rows: field.textarea.rows,
        helpText: field.textarea.helpText,
        value: getFirstValue(values, field.textarea) ?? field.textarea.value,
        placeholder: field.textarea.properties?.placeholder?.placeholder,
        autocomplete: field.textarea.properties?.autocomplete?.autocomplete,
        inputmode: field.textarea.properties?.inputMode?.inputmode,
        required: hasSelectedValue(field.textarea.properties, "validationRequired"),
      };

    case "select": {
      const selectValue = getFirstValue(values, field.select) ?? field.select.value;
      return {
        type: "select",
        id: `${pageId}-${getName(field.select)}`,
        label: field.select.label,
        name: getName(field.select),
        helpText: field.select.helpText,
        value: selectValue,
        options: forceArray(field.select.options)
          .filter((option) => option.value && option.text)
          .map(setChecked(selectValue)),
        required: hasSelectedValue(field.select.properties, "validationRequired"),
      };
    }

    case "checkboxes": {
      const checkboxesValue = forceArray(values[getName(field.checkboxes)] ?? field.checkboxes.value);

      return {
        type: "checkboxes",
        id: `${pageId}-${getName(field.checkboxes)}`,
        label: field.checkboxes.label,
        name: getName(field.checkboxes),
        helpText: field.checkboxes.helpText,
        value: checkboxesValue,
        options: forceArray(field.checkboxes.options)
          .filter((option) => option.value && option.text)
          .map(setChecked(checkboxesValue)),
        required: hasSelectedValue(field.checkboxes.properties, "validationRequired"),
      };
    }

    case "radiobuttons": {
      const radioButtonsValue = getFirstValue(values, field.radiobuttons) ?? field.radiobuttons.value;
      return {
        type: "radiobuttons",
        id: `${pageId}-${getName(field.radiobuttons)}`,
        label: field.radiobuttons.label,
        name: getName(field.radiobuttons),
        helpText: field.radiobuttons.helpText,
        value: radioButtonsValue,
        options: forceArray(field.radiobuttons.options)
          .filter((option) => option.value && option.text)
          .map(setChecked(radioButtonsValue)),
        required: hasSelectedValue(field.radiobuttons.properties, "validationRequired"),
      };
    }

    case "hidden":
      return {
        type: "hidden",
        id: `${pageId}-${field.hidden.name}`,
        name: field.hidden.name,
        value: getFirstValue(values, { label: field.hidden.name, name: field.hidden.name }) ?? field.hidden.value ?? "",
      };
  }
}

function setChecked(
  currentValue: string[] | string | undefined,
): ({ text, value }: { text: string; value: string }) => Option {
  return ({ text, value }) => ({
    text,
    value,
    checked: Array.isArray(currentValue) ? currentValue.indexOf(value) !== -1 : currentValue === value,
  });
}

function getFirstValue(values: SubmittedValues, field: { label: string; name?: string }): string | undefined {
  const value = values[getName(field)];
  return value && Array.isArray(value) ? value[0] : value;
}
