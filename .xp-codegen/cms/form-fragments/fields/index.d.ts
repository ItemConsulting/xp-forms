export type Fields = {
  /**
   * Field
   */
  fields: Array<
    | {
        /**
         * Selected
         */
        _selected: "input";

        /**
         * Input field
         */
        input: import("..").InputText;
      }
    | {
        /**
         * Selected
         */
        _selected: "textarea";

        /**
         * TextArea field
         */
        textarea: import("..").InputTextArea;
      }
    | {
        /**
         * Selected
         */
        _selected: "radiobuttons";

        /**
         * Radio buttons field
         */
        radiobuttons: import("..").InputRadiobuttons;
      }
    | {
        /**
         * Selected
         */
        _selected: "select";

        /**
         * Select field
         */
        select: import("..").InputSelect;
      }
    | {
        /**
         * Selected
         */
        _selected: "checkboxes";

        /**
         * Checkboxes
         */
        checkboxes: import("..").InputCheckboxes;
      }
    | {
        /**
         * Selected
         */
        _selected: "hidden";

        /**
         * Hidden field
         */
        hidden: import("..").InputHidden;
      }
  >;
};
