import { partPathToId } from "/lib/forms/utils";
import { forceArray } from "/lib/forms/arrays";
import { process as processReviewPage } from "/site/partials/page-review/page-review";
import { process as processFormPage } from "/site/partials/page-form/page-form";
import { process as processSuccessPage } from "/site/partials/page-success/page-success";
import type { PartComponent } from "@enonic-types/core";
import type { SubmittedValues } from "/site/parts/form-view/form-view.freemarker";
import type { ContentForm } from "/lib/forms/contents";
import type { Errors } from "/lib/forms/validation";

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
};

export function getPages({ locale, part, content, values, errors, pageIndex }: GetPagesParams): string[] {
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
      }),
    ];
  }
}
