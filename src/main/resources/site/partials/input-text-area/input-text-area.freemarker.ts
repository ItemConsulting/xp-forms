export type InputTextArea = {
  type: "textarea";
  id: string;
  label: string;
  name: string;
  rows?: number;
  cols?: number;
  helpText?: string;
  value?: string;
  placeholder?: string;
  inputmode?: string;
  autocomplete?: string;
  required: boolean;
};
