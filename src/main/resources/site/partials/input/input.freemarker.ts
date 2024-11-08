export type InputField = {
  type: "input";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value?: string;
  placeholder?: string;
  inputmode?: string;
  autocomplete?: string;
};
