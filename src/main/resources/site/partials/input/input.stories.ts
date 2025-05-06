import id from "./input.ftl";
import { controlAutocomplete, controlInputMode } from "../../../storybook-utils";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { InputField } from "./input.freemarker";

const meta: Meta<InputField> = {
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
          [#import "/site/partials/input/input.ftl" as Input]
          [@Input.render field={
            "type": "input",
            "id": "input-1",
            "label": label,
            "name": "name",
            "autocomplete": autocomplete,
            "helpText": helpText,
            "inputmode": inputmode,
            "placeholder": placeholder
          } locale=locale /]
        `,
      },
    },
  },
};

export default meta;

export const input: StoryObj<InputField> = {
  args: {
    label: "Navn",
    autocomplete: "name",
    helpText: "Fullt navn",
    inputmode: "text",
    placeholder: "Skriv inn navnet ditt",
  },
};
