export type SelectField = {
  type: "select";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value?: string;
  options: SelectFieldOption[];
};

export type SelectFieldOption = {
  text: string;
  value: string;
};
