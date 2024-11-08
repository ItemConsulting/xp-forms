export type CheckboxesField = {
  type: "checkboxes";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value: string[];

  options: CheckboxOption[];
};

export type CheckboxOption = {
  text: string;
  value: string;
  checked?: boolean;
};
