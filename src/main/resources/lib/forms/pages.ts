import type { PartComponent } from "@enonic-types/core";
import { forceArray } from "/lib/forms/arrays";
import type { ContentForm } from "/lib/forms/contents";
import type { Errors } from "/lib/forms/types";
import { partPathToId } from "/lib/forms/utils";
import { process as processFormPage } from "/cms/partials/page-form/page-form";
import { process as processReviewPage } from "/cms/partials/page-review/page-review";
import { process as processSuccessPage } from "/cms/partials/page-success/page-success";
import type { SpamPreventionConfig } from "/cms/partials/page-utils/page-utils.freemarker";
import type { SubmittedValues } from "/cms/parts/form-view/form-view.freemarker";

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
      processFormPage({
        partId,
        page,
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
          processReviewPage({
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

    return ([] as string[]).concat(formPages).concat(reviewPage).concat(processSuccessPage(content));
  }
  // Is success page
  else if (pageIndex === totalPages - 1) {
    return [processSuccessPage(content)];
  }
  // Is review page
  else if ((hasReviewPage && pageIndex === totalPages - 2) || isPreviewReviewPage) {
    const reviewPage = processReviewPage({
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
      processFormPage({
        page: pagesRaw[pageIndex],
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
