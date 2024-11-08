export type RadioButtonsField = {
  type: "radiobuttons";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value?: string;
  options: RadioButtonsFieldOption[];
};

export type RadioButtonsFieldOption = {
  text: string;
  value: string;
  checked?: boolean;
};
