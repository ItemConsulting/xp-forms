export type InputSelect = {
  type: "select";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value?: string;
  autocomplete?: string;
  required: boolean;
  options: SelectFieldOption[];
};

export type SelectFieldOption = {
  text: string;
  value: string;
};
