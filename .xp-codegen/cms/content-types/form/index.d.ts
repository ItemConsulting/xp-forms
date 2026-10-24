export type Form = {
  /**
   * Form type
   */
  integrationId?: string;

  /**
   * Page
   */
  pages: Array<import("../../form-fragments").FormPageForm>;

  /**
   * Review page
   */
  reviewPage:
    | {
        /**
         * Selected
         */
        _selected: "showReviewPage";

        /**
         * Show review page
         */
        showReviewPage: import("../../form-fragments").FormPageReview;
      };

  /**
   * Success page
   */
  successPageSections: import("../../form-fragments").FormPageSuccess;
};
