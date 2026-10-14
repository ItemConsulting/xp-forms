import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import { controlAutocomplete, controlInputMode } from "../../../storybook-utils";
import type { InputText } from "./input-text.freemarker";
import id from "./input-text.ftlh";

const meta: Meta<InputText> = {
  title: "Field/Input",
  argTypes: {
    autocomplete: controlAutocomplete,
    inputmode: controlInputMode,
  },
  parameters: {
    server: {
      id,
      params: {
        template: `
        [#import "/cms/partials/input-text/input-text.ftlh" as Input]
        [@Input.render field={
        "type": "input",
        "id": "input-1",
        "label": label,
        "name": "name",
        "autocomplete": autocomplete,
        "helpText": helpText,
        "inputmode": inputmode,
        "placeholder": placeholder,
        "required": required
        } errors=errorText?has_content?then({ "name": [errorText] }, {}) /]
        `,
      },
    },
  },
};

export default meta;

export const input: StoryObj<InputText> = {
  args: {
    label: "Navn",
    autocomplete: "name",
    helpText: "Fullt navn",
    inputmode: "text",
    placeholder: "Skriv inn navnet ditt",
    required: false,
  },
};

export const withError: StoryObj<InputText & { errorText?: string }> = {
  args: {
    label: "Navn",
    autocomplete: "name",
    helpText: "Fullt navn",
    inputmode: "text",
    placeholder: "Skriv inn navnet ditt",
    errorText: "Du kan ikke ha mellomnavn i etternavnet ditt",
    required: true,
  },
};
