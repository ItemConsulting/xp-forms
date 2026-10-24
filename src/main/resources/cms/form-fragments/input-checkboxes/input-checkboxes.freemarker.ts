export type InputCheckboxes = {
  type: "checkboxes";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value: string[];
  required: boolean;
  options: CheckboxOption[];
};

export type CheckboxOption = {
  text: string;
  value: string;
  checked?: boolean;
};
