import { getContent, getComponent, getSite, pageUrl, getSiteConfig } from "/lib/xp/portal";
import { assetUrl } from "/lib/enonic/asset";
import { assertIsDefined, partPathToId } from "/lib/forms/utils";
import { render } from "/lib/tineikt/freemarker";
import { forceArray } from "/lib/forms/arrays";
import { getLocale } from "/lib/forms/locale";
import { send as sendEvent } from "/lib/xp/event";
import { HEADER_KEY_REDIRECT } from "/site/processors/redirect";
import { getJsonSchema, normalizeFields, type FormFieldNormalized } from "/lib/forms/json-schema";
import { compareSchemas, type SchemaError } from "/lib/forms/admin-schema-validation";
import {
  getIntegration,
  getPrepopulationValues,
  getReferenceJsonSchema,
  type Integration,
} from "/lib/forms/extensions";
import { getErrors, type Errors } from "/lib/forms/form-utils";
import { deleteFromStore, loadFromStore, saveToStore } from "/lib/forms/data-store";
import { getPages, RETURN_ALL_PAGES, RETURN_REVIEW_PAGE, SUCCESS_PAGE_COUNT } from "/lib/forms/pages";
import type { FreemarkerParams, SubmittedValues } from "/site/parts/form-view/form-view.freemarker";
import type { Request, Response, PartComponent } from "@enonic-types/core";
import type { ContentForm } from "/lib/forms/contents";

export type FormEvent<Values extends SubmittedValues> = {
  siteId: string;
  formId: string;
  branch: string | undefined;
  integration?: Integration;
  fields: FormFieldNormalized[];
  values: Values;
};

type FormViewPart = PartComponent<"no.item.forms:form-view">;

const view = resolve("./form-view.ftl");

type QueryParams = {
  page: string;
};

export function all(req: Request<{ params: QueryParams }>): Response {
  const content = getContent<ContentForm>();
  const part = getComponent<FormViewPart>();
  const siteConfig = getSiteConfig<XP.SiteConfig>();

  assertIsDefined(content);
  assertIsDefined(part);
  assertIsDefined(siteConfig);

  const { page, ...valuesFromUser } = req.params;
  const pagesRaw = forceArray(content.data.pages);
  const hasReviewPage = content.data.reviewPage._selected === "showReviewPage";
  const totalPages = pagesRaw.length + (hasReviewPage ? 1 : 0) + SUCCESS_PAGE_COUNT;
  const currentPageNumber = Math.max(parseInt(page ?? part.config.firstPageNumber ?? "1"), RETURN_REVIEW_PAGE);
  const currentPageIndex = Math.min(currentPageNumber, totalPages) - 1; // zero indexed
  const currentPageRaw = pagesRaw[currentPageIndex];
  const locale = getLocale({ content });

  const values: SubmittedValues = {
    ...getPrepopulationValues(content.data.integrationId),
    ...loadFromStore(req, content._id),
    ...valuesFromUser,
  };

  const integration = content.data.integrationId ? getIntegration(content.data.integrationId) : undefined;

  const errors = req.method === "POST" ? getErrors(values, currentPageRaw, locale) : {};

  // If after last page, send back to first page
  if (currentPageNumber > totalPages) {
    return redirectToPage(content, 1);
  }
  // If on the success page, send event
  else if (currentPageNumber === totalPages) {
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

    deleteFromStore(req, content._id);
  }
  // If form submit, save values and redirect to next page
  else if (req.method === "POST" && !hasErrors(errors)) {
    saveToStore(req, content._id, values);
    return redirectToPage(content, currentPageNumber + 1);
  }

  const pages = getPages({
    locale,
    part,
    content,
    values,
    errors,
    pageIndex: req.mode === "edit" ? RETURN_ALL_PAGES : currentPageIndex,
  });

  return {
    body: render<FreemarkerParams>(view, {
      locale,
      errors,
      pages,
      values,
      frameId: `${partPathToId(part.path)}-frame`,
      adminErrors: getAdminErrors(req, content, locale, integration),
    }),
    pageContributions: {
      headEnd: ([] as string[])
        .concat(createStyleTag("styles/content-studio.min.css", req.mode !== "live"))
        .concat(createStyleTag("styles/main.min.css", siteConfig.includeStyles ?? true)),
    },
  };
}

function getAdminErrors(
  req: Request,
  content: ContentForm,
  locale: string,
  integration?: Integration,
): SchemaError | undefined {
  const referenceSchema = content.data.integrationId ? getReferenceJsonSchema(content.data.integrationId) : undefined;
  const adminErrors =
    referenceSchema && integration
      ? compareSchemas(referenceSchema, getJsonSchema(content), locale, integration)
      : undefined;

  // Form-content with errors in them will probably fail on submission, so it's better to fail early in live mode.
  if (req.mode === "live" && adminErrors && adminErrors.errors.length > 0) {
    throw new Error(adminErrors.errors[0]);
  }

  return adminErrors;
}

function redirectToPage(content: ContentForm, pageNumber: number): Response {
  return {
    status: 303,
    headers: {
      [HEADER_KEY_REDIRECT]: pageUrl({
        path: content._path,
        params: {
          page: pageNumber.toString(),
        },
      }),
    },
  };
}

function createStyleTag(path: string, include: boolean): string[] {
  return include ? [`<link href="${assetUrl({ path })}" rel="stylesheet">`] : [];
}

function hasErrors(errors: Errors): boolean {
  return Object.keys(errors).length > 0;
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

function resolveValue(field: FormFieldNormalized, value: string | string[]): string | string[] {
  const singleValue = forceArray(value)[0];

  switch (field.type) {
    // Look up label for single value
    case "select":
    case "radiobuttons":
      return field.options[singleValue];

    // Look up labels for multiple values
    case "checkboxes":
      return forceArray(value).map((value) => field.options[value]);

    // Return single value
    case "input":
    case "textarea":
    case "hidden":
    default:
      return singleValue ?? "";
  }
}
