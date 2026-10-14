export type FieldPropsSelect = {
  /**
   * Properties
   */
  properties: {
    /**
     * Selected
     */
    _selected: Array<"validationRequired">;

    /**
     * Validation: Required
     */
    validationRequired: {
      /**
       * Error message
       */
      errorMessage?: string;
    };
  };
};
