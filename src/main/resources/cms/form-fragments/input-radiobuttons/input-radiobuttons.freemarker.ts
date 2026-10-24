export type InputRadioButtons = {
  type: "radiobuttons";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value?: string;
  required: boolean;
  options: RadioButtonsFieldOption[];
};

export type RadioButtonsFieldOption = {
  text: string;
  value: string;
  checked?: boolean;
};
