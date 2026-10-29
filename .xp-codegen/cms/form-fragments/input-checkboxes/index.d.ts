export type InputCheckboxes = {
  /**
   * Label
   */
  label: string;

  /**
   * name
   */
  name?: string;

  /**
   * Help text
   */
  helpText?: string;

  /**
   * Initialize field with this value
   */
  value?: Array<string> | string;

  /**
   * Options
   */
  options: Array<{
    /**
     * Text
     */
    text: string;

    /**
     * Value
     */
    value: string;
  }>;

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
