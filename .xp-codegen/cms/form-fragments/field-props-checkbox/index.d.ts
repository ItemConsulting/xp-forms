export type FieldPropsCheckbox = {
  /**
   * Properties
   */
  properties: {
    /**
     * Selected
     */
    _selected: Array<"validationRequired" | "validationMinItems" | "validationMaxItems">;

    /**
     * Validation: Required
     */
    validationRequired: {
      /**
       * Error message
       */
      errorMessage?: string;
    };

    /**
     * Validation: min items
     */
    validationMinItems: {
      /**
       * Min required
       */
      minItems: number;

      /**
       * Error message
       */
      errorMessage?: string;
    };

    /**
     * Validation: max items
     */
    validationMaxItems: {
      /**
       * Max required
       */
      maxItems: number;

      /**
       * Error message
       */
      errorMessage?: string;
    };
  };
};
