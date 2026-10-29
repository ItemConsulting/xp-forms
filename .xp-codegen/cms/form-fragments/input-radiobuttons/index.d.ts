export type InputRadiobuttons = {
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
  value?: string;

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
