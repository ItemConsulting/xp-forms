import { getContent, getComponent, getSite, pageUrl, processHtml, type Content } from "/lib/xp/portal";
import { assertIsDefined, notNullOrUndefined, partPathToId } from "/lib/forms/utils";
import { render } from "/lib/tineikt/freemarker";
import { flatMap, forceArray } from "/lib/forms/arrays";
import { localize } from "/lib/xp/i18n";
import { getLocale } from "/lib/forms/locale";
import { getMap } from "/lib/xp/grid";
import { send as sendEvent } from "/lib/xp/event";
import { HEADER_KEY_REDIRECT } from "/site/processors/redirect";
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
import { getName, hasSelectedValue, type FormFieldRaw, type FormPageRaw } from "/lib/forms/form-utils";
import { getJsonSchema, normalizeFields, type FormFieldNormalized } from "/lib/forms/json-schema";
import { compareSchemas } from "/lib/forms/admin-schema-validation";
import {
  getIntegration,
  getPrepopulationValues,
  getReferenceJsonSchema,
  type Integration,
} from "/lib/forms/extensions";
import type { Form as FormRaw } from "/site/content-types";
import type {
  FreemarkerParams,
  Field,
  SubmittedValues,
  Option,
  Page,
} from "/site/parts/form-view/form-view.freemarker";
import type { Request, Response, PartComponent } from "@enonic-types/core";

export type FormEvent<Values extends SubmittedValues> = {
  siteId: string;
  formId: string;
  branch: string | undefined;
  integration?: Integration;
  fields: FormFieldNormalized[];
  values: Values;
};

type FormViewPart = PartComponent<"no.item.forms:form-view">;
type ContentForm = Content<FormRaw, "no.item.forms:form">;

const view = resolve("./form-view.ftl");
const store = getMap<Record<string, string>>("no.item.forms");
const SUCCESS_PAGE_COUNT = 1;

type QueryParams = {
  page: string;
};

export function all(req: Request<{ params: QueryParams }>): Response {
  const content = getContent<ContentForm>();
  const part = getComponent<FormViewPart>();

  assertIsDefined(content);
  assertIsDefined(part);

  const { page, ...formValues } = req.params;
  const pagesRaw = forceArray(content.data.pages);
  const pageNumber = parseInt(page ?? "1");
  const pageIndex = Math.min(pageNumber - 1, pagesRaw.length - 1 + SUCCESS_PAGE_COUNT); // zero indexed
  const locale = getLocale({ content });
  const partId = partPathToId(part.path);
  const usersFormKey = `${req.cookies.JSESSIONID}-${content._id}`;

  const values: SubmittedValues = {
    ...getPrepopulationValues(content.data.integrationId),
    ...loadFromStore(usersFormKey),
    ...formValues,
  };

  const integration = content.data.integrationId ? getIntegration(content.data.integrationId) : undefined;

  const errors = req.method === "POST" ? getErrors(values, content, locale) : {};

  // If after last page
  if (pageNumber > pagesRaw.length) {
    const site = getSite();

    assertIsDefined(site);

    const fields = normalizeFields(content);

    sendEvent<FormEvent<SubmittedValues>>({
      type: "form.submit",
      data: {
        siteId: site._id,
        formId: content._id,
        branch: req.branch,
        integration,
        fields,
        values: resolveValues(values, fields),
      },
      distributed: false,
    });

    store.delete(usersFormKey);
  } else if (req.method === "POST" && !hasErrors(errors)) {
    saveToStore(usersFormKey, values);

    return {
      status: 303,
      headers: {
        [HEADER_KEY_REDIRECT]: pageUrl({
          path: content._path,
          params: {
            page: (pageNumber + 1).toString(),
          },
        }),
      },
    };
  }

  const pages = pagesRaw
    .map((page, index) =>
      getFormPage({
        id: `${partId}-page${index}`,
        page,
        locale,
        values,
        content,
        pageNumber: index + 1,
      }),
    )
    .concat(getSuccessPage(forceArray(content.data.successPageSections), locale));

  const referenceSchema = content.data.integrationId ? getReferenceJsonSchema(content.data.integrationId) : undefined;
  const adminErrors =
    referenceSchema && integration
      ? compareSchemas(referenceSchema, getJsonSchema(content), locale, integration)
      : undefined;

  // Form-content with errors in them will probably fail on submission, so it's better to fail early in live mode.
  if (req.mode === "live" && adminErrors && adminErrors.errors.length > 0) {
    throw new Error(adminErrors.errors[0]);
  }

  return {
    body: render<FreemarkerParams>(view, {
      locale,
      errors,
      pages: req.mode === "edit" ? pages : [pages[Math.min(pageIndex, pages.length)]],
      values,
      mode: req.mode,
      adminErrors: req.mode !== "live" ? adminErrors : undefined,
    }),
  };
}

function loadFromStore(usersFormKey: string): SubmittedValues {
  return JSON.parse(store.get(usersFormKey) ?? "{}");
}

function saveToStore(usersFormKey: string, values: SubmittedValues): void {
  store.set({
    key: usersFormKey,
    value: JSON.stringify(values),
    ttlSeconds: 3600,
  });
}

function getErrors(params: SubmittedValues, content: ContentForm, locale: string): Errors {
  const allFields = flatMap(forceArray(content.data.pages), (page) => page.fields);
  const validators = flatMap(allFields, (field) => getValidator(field, locale));

  return validate(params, validators);
}

function hasErrors(errors: Errors): boolean {
  return Object.keys(errors).length > 0;
}

type GetPageParams = {
  id: string;
  page: FormPageRaw;
  locale: string;
  values: SubmittedValues;
  content: Content;
  pageNumber: number;
};

function getFormPage({ page, id, locale, values, content, pageNumber }: GetPageParams): Page {
  return {
    type: "form-page",
    title: page.title,
    text: page.text,
    submitButtonText:
      page.submitButtonText ??
      localize({
        key: "part.formView.submit",
        locale,
      }),
    fields: forceArray(page.fields)
      .map((field, index) => getField(field, `${id}-field${index}`, values))
      .filter(notNullOrUndefined),
    backUrl:
      pageNumber > 1
        ? pageUrl({
            path: content._path,
            params: {
              page: (pageNumber - 1).toString(),
            },
          })
        : undefined,
  };
}

function getSuccessPage(sections: { text?: string }[], locale: string): Page {
  return {
    type: "success-page",
    sections: sections.map((section) => ({
      text: processHtml({
        value:
          section.text ??
          localize({
            key: "part.formView.success",
            locale,
          }),
      }),
    })),
  };
}

function getField(field: FormFieldRaw, fieldId: string, values: SubmittedValues): Field | undefined {
  switch (field._selected) {
    case "input":
      return {
        type: "input",
        id: fieldId,
        label: field.input.label,
        name: getName(field.input),
        helpText: field.input.helpText,
        value: getFirstValue(values, field.input) ?? field.input.value,
        placeholder: field.input.properties?.placeholder?.placeholder,
        autocomplete: field.input.properties?.autocomplete?.autocomplete,
        inputmode: field.input.properties?.inputMode?.inputmode,
        required: hasSelectedValue(field.input.properties, "validationRequired"),
      };

    case "textarea":
      return {
        type: "textarea",
        id: fieldId,
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

    case "select":
      const selectValue = getFirstValue(values, field.select) ?? field.select.value;
      return {
        type: "select",
        id: fieldId,
        label: field.select.label,
        name: getName(field.select),
        helpText: field.select.helpText,
        value: selectValue,
        options: forceArray(field.select.options).map(setChecked(selectValue)),
        required: hasSelectedValue(field.select.properties, "validationRequired"),
      };

    case "checkboxes":
      const checkboxesValue = forceArray(values[getName(field.checkboxes)] ?? field.checkboxes.value);

      return {
        type: "checkboxes",
        id: fieldId,
        label: field.checkboxes.label,
        name: getName(field.checkboxes),
        helpText: field.checkboxes.helpText,
        value: checkboxesValue,
        options: forceArray(field.checkboxes.options).map(setChecked(checkboxesValue)),
        required: hasSelectedValue(field.checkboxes.properties, "validationRequired"),
      };

    case "radiobuttons":
      const radioButtonsValue = getFirstValue(values, field.radiobuttons) ?? field.radiobuttons.value;
      return {
        type: "radiobuttons",
        id: fieldId,
        label: field.radiobuttons.label,
        name: getName(field.radiobuttons),
        helpText: field.radiobuttons.helpText,
        value: radioButtonsValue,
        options: forceArray(field.radiobuttons.options).map(setChecked(radioButtonsValue)),
        required: hasSelectedValue(field.radiobuttons.properties, "validationRequired"),
      };

    case "hidden":
      return {
        type: "hidden",
        id: fieldId,
        name: field.hidden.name,
        value: field.hidden.value,
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

function getValidator(field: FormFieldRaw, locale: string): ValidatorConfig[] {
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

export function resolveValues(data: SubmittedValues, fields: FormFieldNormalized[]): SubmittedValues {
  return fields.reduce<SubmittedValues>((res, value) => {
    const dataValue = data[value.name];

    if (dataValue) {
      res[value.name] = resolveValue(value, dataValue);
    }
    return res;
  }, {});
}

function resolveValue(field: FormFieldNormalized, value: string | string[]): string {
  const singleValue = forceArray(value)[0];

  switch (field.type) {
    // Look up label for single value
    case "select":
    case "radiobuttons":
      return field.options[singleValue];

    // Look up labels for multiple values
    case "checkboxes":
      return forceArray(value)
        .map((value) => field.options[value])
        .join(", ");

    // Return single value
    case "input":
    case "textarea":
    case "hidden":
    default:
      return singleValue ?? "";
  }
}
