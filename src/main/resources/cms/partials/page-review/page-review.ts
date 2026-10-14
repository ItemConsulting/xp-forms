import { forceArray } from "/lib/forms/arrays";
import type { ContentForm } from "/lib/forms/contents";
import { normalizeFields, resolveValues } from "/lib/forms/json-schema";
import type { Errors } from "/lib/forms/types";
import { render } from "/lib/freemarker";
import { localize } from "/lib/xp/i18n";
import { pageUrl } from "/lib/xp/portal";
import { getFields } from "/cms/partials/page-form/page-form";
import type { PageReview } from "/cms/partials/page-review/page-review.freemarker";
import type { SpamPreventionConfig } from "/cms/partials/page-utils/page-utils.freemarker";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";

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

const view = resolve("/cms/partials/page-review/page-review.ftlh");

export function process(params: ProcessParams): string {
  const resolvedValues = resolveValues(params.values, normalizeFields(params.content));

  const pageId = `${params.partId}-page-${params.pageNumber}`;

  return render<PageReview>(view, {
    frameId: `${params.partId}-frame`,
    isPreviewReviewPage: params.isPreviewReviewPage,
    title:
      params.content.data.reviewPage.showReviewPage?.title ??
      localize({
        key: "part.formView.reviewPageTitle",
        locale: params.locale,
      }),
    sections: forceArray(params.content.data.pages).map((page, index) => ({
      title: page.title,
      fields: getFields(page.fields, `${params.partId}-page${index}`, params.values).map((field) => {
        return {
          id: field.id,
          label: field.type === "hidden" ? field.name : field.label,
          name: field.name,
          values: forceArray(params.values[field.name]),
          valuesResolved: forceArray(resolvedValues[field.name]),
        };
      }),
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
      params.content.data.reviewPage.showReviewPage?.submitButtonText ??
      localize({
        key: "part.formView.reviewPageButtonText",
        locale: params.locale,
      }),
    errors: params.errors,
    pageId,
    spamPreventionConfig: params.spamPreventionConfig,
  });
}
