import { getContent, getComponent, getSite, pageUrl, getSiteConfig, assetUrl } from "/lib/xp/portal";
import { assertIsDefined, partPathToId } from "/lib/forms/utils";
import { render } from "/lib/tineikt/freemarker";
import { forceArray } from "/lib/forms/arrays";
import { getLocale } from "/lib/forms/locale";
import { send as sendEvent } from "/lib/xp/event";
import { HEADER_KEY_REDIRECT } from "/site/processors/redirect";
import { getJsonSchema, normalizeFields, type FormFieldNormalized } from "/lib/forms/json-schema";
import { compareSchemas } from "/lib/forms/admin-schema-validation";
import {
  getIntegration,
  getPrepopulationValues,
  getReferenceJsonSchema,
  type Integration,
} from "/lib/forms/extensions";
import { getFields, process as processFormPage } from "/site/partials/page-form/page-form";
import { process as processReviewPage } from "/site/partials/page-review/page-review";
import { process as processSuccessPage } from "/site/partials/page-success/page-success";
import { localize } from "/lib/xp/i18n";
import { getErrors, type FormPageRaw, type Errors } from "/lib/forms/form-utils";
import { deleteFromStore, loadFromStore, saveToStore } from "/lib/forms/data-store";
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
const SUCCESS_PAGE_COUNT = 1;

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
  const currentPageNumber = parseInt(page ?? "1");
  const currentPageIndex = Math.min(currentPageNumber, totalPages) - 1; // zero indexed
  const currentPageRaw = forceArray(content.data.pages)[currentPageIndex];
  const locale = getLocale({ content });
  const partId = partPathToId(part.path);

  const values: SubmittedValues = {
    ...getPrepopulationValues(content.data.integrationId),
    ...loadFromStore(req, content._id),
    ...valuesFromUser,
  };

  const integration = content.data.integrationId ? getIntegration(content.data.integrationId) : undefined;

  const errors = req.method === "POST" ? getErrors(values, currentPageRaw, locale) : {};

  if (currentPageNumber > totalPages) {
    // If after last page, send back to first page
    return {
      status: 303,
      headers: {
        [HEADER_KEY_REDIRECT]: pageUrl({
          path: content._path,
          params: {
            page: "1",
          },
        }),
      },
    };
  } else if (currentPageNumber === totalPages) {
    // If on the success page
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
  } else if (req.method === "POST" && !hasErrors(errors)) {
    saveToStore(req, content._id, values);

    return {
      status: 303,
      headers: {
        [HEADER_KEY_REDIRECT]: pageUrl({
          path: content._path,
          params: {
            page: (currentPageNumber + 1).toString(),
          },
        }),
      },
    };
  }

  // TODO Look at performance. If we only are rendering one page, we should not always do the work for all

  const formPages: string[] = pagesRaw.map((page, index) =>
    processFormPage({
      id: `${partId}-page${index}`,
      page,
      locale,
      values,
      content,
      pageNumber: index + 1,
    }),
  );

  const pages = ([] as string[])
    .concat(formPages)
    .concat(
      hasReviewPage
        ? getReviewPage(
            locale,
            partId,
            pagesRaw,
            resolveValues(values, normalizeFields(content)),
            content,
            currentPageIndex,
          )
        : [],
    )
    .concat(processSuccessPage(content, locale));

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
      pages: req.mode === "edit" ? pages : [pages[Math.min(currentPageIndex, pages.length)]],
      values,
      adminErrors: req.mode !== "live" ? adminErrors : undefined,
    }),
    pageContributions: {
      headEnd: ([] as string[])
        .concat(createStyleTag("styles/content-studio.min.css", req.mode !== "live"))
        .concat(createStyleTag("styles/main.min.css", siteConfig.includeStyles ?? true)),
    },
  };
}

function createStyleTag(path: string, include: boolean): string[] {
  return include ? [`<link href="${assetUrl({ path })}" rel="stylesheet">`] : [];
}

function hasErrors(errors: Errors): boolean {
  return Object.keys(errors).length > 0;
}

function getReviewPage(
  locale: string,
  partId: string,
  pages: FormPageRaw[],
  values: SubmittedValues,
  content: ContentForm,
  pageIndex: number,
): string {
  return processReviewPage({
    locale,
    title:
      content.data.reviewPage.showReviewPage?.title ??
      localize({
        key: "part.formView.reviewPageTitle",
        locale,
      }),
    sections: pages.map((page, index) => {
      return {
        title: page.title,
        fields: getFields(page.fields, `${partId}-page${index}`, values),
      };
    }),
    values,
    backUrl: pageUrl({
      path: content._path,
      params: {
        page: (pageIndex - 1).toString(),
      },
    }),
    submitButtonText:
      content.data.reviewPage.showReviewPage?.submitButtonText ??
      localize({
        key: "part.formView.reviewPageButtonText",
        locale,
      }),
  });
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
