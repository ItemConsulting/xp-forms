import { render } from "/lib/tineikt/freemarker";
import { forceArray } from "/lib/forms/arrays";
import { localize } from "/lib/xp/i18n";
import { pageUrl } from "/lib/xp/portal";
import { getFields } from "/site/partials/page-form/page-form";
import { resolveValues } from "/site/parts/form-view/form-view";
import { normalizeFields } from "/lib/forms/json-schema";
import type { PageReview } from "/site/partials/page-review/page-review.freemarker";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";
import type { ContentForm } from "/lib/forms/contents";

export type ProcessParams = {
  locale: string;
  partId: string;
  content: ContentForm;
  values: SubmittedValues;
  isPreviewReviewPage: boolean;
  pageNumber: number;
};

const view = resolve("/site/partials/page-review/page-review.ftl");

export function process({ locale, partId, content, values, pageNumber, isPreviewReviewPage }: ProcessParams): string {
  const resolvedValues = resolveValues(values, normalizeFields(content));

  return render<PageReview>(view, {
    locale: locale,
    frameId: `${partId}-frame`,
    isPreviewReviewPage,
    title:
      content.data.reviewPage.showReviewPage?.title ??
      localize({
        key: "part.formView.reviewPageTitle",
        locale,
      }),
    sections: forceArray(content.data.pages).map((page, index) => ({
      title: page.title,
      fields: getFields(page.fields, `${partId}-page${index}`, values).map((field) => {
        return {
          id: field.id,
          label: field.type === "hidden" ? field.name : field.label,
          name: field.name,
          values: forceArray(values[field.name]),
          valuesResolved: forceArray(resolvedValues[field.name]),
        };
      }),
    })),
    backUrl: pageUrl({
      path: content._path,
      params: {
        page: (pageNumber - 1).toString(),
      },
    }),
    editUrl: pageUrl({
      path: content._path,
      params: {
        page: "1",
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
