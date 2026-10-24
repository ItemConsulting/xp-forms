import type { PartComponent } from "@enonic-types/core";
import { process as processFormPage } from "/cms/form-fragments/form-page-form/form-page-form";
import { process as processReviewPage } from "/cms/form-fragments/form-page-review/form-page-review";
import { process as processSuccessPage } from "/cms/form-fragments/form-page-success/form-page-success";
import type { Errors } from "/cms/partials/error-summary/error-summary";
import type { SpamPreventionConfig } from "/cms/partials/spam-prevention/spam-prevention.freemarker";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";
import { forceArray } from "/lib/forms/arrays";
import type { ContentForm } from "/lib/forms/contents";
import { partPathToId } from "/lib/forms/utils";

export const RETURN_ALL_PAGES = -2;
export const RETURN_REVIEW_PAGE = -1;
export const SUCCESS_PAGE_COUNT = 1;

type GetPagesParams = {
  locale: string;
  part: PartComponent;
  content: ContentForm;
  values: SubmittedValues;
  errors: Errors;
  pageIndex: number;
  spamPreventionConfig: SpamPreventionConfig;
};

export function getPages({
  locale,
  part,
  content,
  values,
  errors,
  pageIndex,
  spamPreventionConfig,
}: GetPagesParams): string[] {
  const partId = partPathToId(part.path);
  const pagesRaw = forceArray(content.data.pages);
  const hasReviewPage = content.data.reviewPage?._selected === "showReviewPage";
  const totalPages = pagesRaw.length + (hasReviewPage ? 1 : 0) + SUCCESS_PAGE_COUNT;
  const isPreviewReviewPage = pageIndex === RETURN_REVIEW_PAGE;

  if (pageIndex === RETURN_ALL_PAGES) {
    const formPages = pagesRaw.map((page, index) =>
      processFormPage(page, {
        partId,
        locale,
        values,
        errors,
        content,
        pageNumber: index + 1,
        spamPreventionConfig,
      }),
    );

    const reviewPage = hasReviewPage
      ? [
          processReviewPage(content.data.reviewPage.showReviewPage, {
            locale,
            content,
            partId,
            values,
            isPreviewReviewPage,
            pageNumber: pageIndex + 1,
            errors,
            spamPreventionConfig,
          }),
        ]
      : [];

    return ([] as string[])
      .concat(formPages)
      .concat(reviewPage)
      .concat(processSuccessPage(content.data.successPageSections));
  }
  // Is success page
  else if (pageIndex === totalPages - 1) {
    return [processSuccessPage(content.data.successPageSections)];
  }
  // Is review page
  else if ((hasReviewPage && pageIndex === totalPages - 2) || isPreviewReviewPage) {
    const reviewPage = processReviewPage(content.data.reviewPage?.showReviewPage, {
      locale,
      content,
      partId,
      values,
      isPreviewReviewPage,
      pageNumber: pageIndex + 1,
      errors,
      spamPreventionConfig,
    });

    return [reviewPage];
  } else {
    // Is form page
    return [
      processFormPage(pagesRaw[pageIndex], {
        partId,
        locale,
        values,
        errors,
        content,
        pageNumber: pageIndex + 1,
        spamPreventionConfig,
      }),
    ];
  }
}
