import type { PartComponent, Request, Response } from "@enonic-types/core";
import { assetUrl } from "/lib/enonic/asset";
import { compareSchemas, type SchemaError } from "/lib/forms/admin-schema-validation";
import { forceArray } from "/lib/forms/arrays";
import type { ContentForm } from "/lib/forms/contents";
import { deleteFromStore, loadFromStore, saveToStore } from "/lib/forms/data-store";
import {
  getIntegration,
  getPrepopulationValues,
  getReferenceJsonSchema,
  type Integration,
} from "/lib/forms/extensions";
import { getValidators } from "/lib/forms/form-utils";
import { type FormFieldNormalized, getJsonSchema, normalizeFields } from "/lib/forms/json-schema";
import { getLocale } from "/lib/forms/locale";
import { getPages, RETURN_ALL_PAGES, RETURN_REVIEW_PAGE, SUCCESS_PAGE_COUNT } from "/lib/forms/pages";
import type { StandardSchemaV1 } from "/lib/forms/standard-schema";
import type { Errors } from "/lib/forms/types";
import { assertIsDefined, partPathToId } from "/lib/forms/utils";
import { createFormSchema } from "/lib/forms/validation";
import { render } from "/lib/freemarker";
import { getUser } from "/lib/xp/auth";
import { send as sendEvent } from "/lib/xp/event";
import { getComponent, getContent, getSite, getSiteConfig, pageUrl } from "/lib/xp/portal";
import type { FreemarkerParams, SubmittedValues } from "/site/parts/form-view/form-view.freemarker";
import { HEADER_KEY_REDIRECT } from "/site/processors/redirect";

export type FormEvent<Values extends SubmittedValues> = {
  siteId: string;
  formId: string;
  branch: string | undefined;
  integration?: Integration;
  fields: FormFieldNormalized[];
  values: Values;
  userKey?: string;
};

type FormViewPart = PartComponent<"no.item.forms:form-view">;

const view = resolve("./form-view.ftlh");

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
  const hasReviewPage = content.data.reviewPage?._selected === "showReviewPage";
  const totalPages = pagesRaw.length + (hasReviewPage ? 1 : 0) + SUCCESS_PAGE_COUNT;
  const currentPageNumber = Math.max(parseInt(page ?? part.config.firstPageNumber ?? "1", 10), RETURN_REVIEW_PAGE);
  const currentPageIndex = Math.min(currentPageNumber, totalPages) - 1; // zero indexed
  const currentPageRaw = pagesRaw[currentPageIndex];
  const locale = getLocale({ content });

  const values: SubmittedValues = {
    ...getPrepopulationValues(content.data.integrationId),
    ...loadFromStore(req, content._id),
    ...valuesFromUser,
  };

  const integration = content.data.integrationId ? getIntegration(content.data.integrationId) : undefined;

  const validators = forceArray(currentPageRaw?.fields)
    .map(getValidators)
    .reduce((acc, fieldValidators) => ({ ...acc, ...fieldValidators }), {});
  const formSchema = createFormSchema(validators);

  const result: StandardSchemaV1.Result<SubmittedValues> =
    req.method === "POST"
      ? formSchema["~standard"].validate(values, { libraryOptions: { locale } })
      : { value: values };
  const errors = issuesToErrors(result.issues);

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
        userKey: getUser()?.key,
        integration,
        fields,
        values: resolveValues(values, fields),
      },
      distributed: false,
    });

    deleteFromStore(req, content._id);
  }
  // If form submit, save values and redirect to next page
  else if (req.method === "POST" && !result.issues) {
    if (isHoneypotFilledOut(content, currentPageIndex, req.params)) {
      return redirectToPage(content, currentPageNumber);
    }
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
    status: result.issues ? 400 : 200,
    headers: {
      "Cache-Control": "private, no-store",
    },
    body: render<FreemarkerParams>(view, {
      errors,
      pages,
      values,
      frameId: `${partPathToId(part.path)}-frame`,
      adminErrors: getAdminErrors(req, content, locale, integration),
    }),
    pageContributions: {
      headEnd: ([] as string[])
        .concat(createStyleTag("styles/content-studio.min.css", req.mode !== "live"))
        .concat(createStyleTag("styles/main.min.css", siteConfig.includeStyles ?? true))
        .concat(createStyleTag("styles/form-h.min.css", siteConfig.includeStyles ?? true)),
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

/** Groups Standard Schema issues by their first path segment into the `Errors` shape the views consume. */
export function issuesToErrors(issues: ReadonlyArray<StandardSchemaV1.Issue> = []): Errors {
  return issues.reduce<Errors>((errors, issue) => {
    const key = getIssueKey(issue);

    if (key !== undefined) {
      errors[key] = errors[key] ?? [];
      errors[key].push(issue.message);
    }

    return errors;
  }, {});
}

function getIssueKey(issue: StandardSchemaV1.Issue): string | undefined {
  const segment = issue.path?.[0];

  if (segment === undefined) {
    return undefined;
  }

  return (typeof segment === "object" ? segment.key : segment).toString();
}

function createStyleTag(path: string, include: boolean): string[] {
  return include ? [`<link href="${assetUrl({ path })}" rel="stylesheet">`] : [];
}

function isHoneypotFilledOut(content: ContentForm, currentPageIndex: number, params: Request["params"]): boolean {
  const lookupPageIndex = currentPageIndex > 0 ? currentPageIndex - 1 : 0;
  const currentPage = forceArray(content.data.pages)[lookupPageIndex];
  if (currentPage?.enableHoneypot && currentPage.honeypotFiledId) {
    if (params[currentPage.honeypotFiledId] !== "") {
      return true;
    }
  }

  return false;
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
    default:
      return singleValue ?? "";
  }
}
