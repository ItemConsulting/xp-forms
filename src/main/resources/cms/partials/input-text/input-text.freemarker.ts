export type InputText = {
  type: "text";
  id: string;
  label: string;
  name: string;
  helpText?: string;
  value?: string;
  placeholder?: string;
  inputmode?: string;
  autocomplete?: string;
  required: boolean;
};
