import { getFieldSummaries } from "/cms/form-fragments/fields/fields";
import type { Errors } from "/cms/partials/error-summary/error-summary";
import type { SpamPreventionConfig } from "/cms/partials/spam-prevention/spam-prevention.freemarker";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import { forceArray } from "/lib/forms/arrays";
import type { ContentForm } from "/lib/forms/contents";
import { normalizeFields, resolveValues } from "/lib/forms/json-schema";
import { render } from "/lib/freemarker";
import { localize } from "/lib/xp/i18n";
import { pageUrl } from "/lib/xp/portal";
import type { FormPageReview as FormPageReviewRaw } from ".";
import type { PageReview } from "./form-page-review.freemarker";

export type ProcessParams = {
  locale: string;
  partId: string;
  content: ContentForm;
  values: SubmittedValues;
  errors: Errors;
  isPreviewReviewPage: boolean;
  pageNumber: number;
  spamPreventionConfig: SpamPreventionConfig;
};

const view = resolve("form-page-review.ftlh");

export function process(raw: FormPageReviewRaw | undefined, params: ProcessParams): string {
  const resolvedValues = resolveValues(params.values, normalizeFields(params.content));

  const pageId = `${params.partId}-page-${params.pageNumber}`;

  return render<PageReview>(view, {
    frameId: `${params.partId}-frame`,
    isPreviewReviewPage: params.isPreviewReviewPage,
    title:
      raw?.title ??
      localize({
        key: "part.formView.reviewPageTitle",
        locale: params.locale,
      }),
    sections: forceArray(params.content.data.pages).map((page) => ({
      title: page.title,
      // Prefixed with this page's id, so the links in the error summary point to the answers listed here
      fields: getFieldSummaries(page, pageId).map((field) => ({
        id: field.id,
        label: field.label,
        name: field.name,
        values: forceArray(params.values[field.name]),
        valuesResolved: forceArray(resolvedValues[field.name]),
      })),
    })),
    backUrl: pageUrl({
      path: params.content._path,
      params: {
        page: (params.pageNumber - 1).toString(),
      },
    }),
    editUrl: pageUrl({
      path: params.content._path,
      params: {
        page: "1",
      },
    }),
    submitButtonText:
      raw?.submitButtonText ??
      localize({
        key: "part.formView.reviewPageButtonText",
        locale: params.locale,
      }),
    errors: params.errors,
    pageId,
    spamPreventionConfig: params.spamPreventionConfig,
  });
}
