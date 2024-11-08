import id from "./input.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { InputField } from "./input.freemarker";

const meta: Meta<InputField> = {
  title: "Field/Input",
  parameters: {
    server: {
      id,
      params: {
        template: `
          [#import "/site/partials/input/input.ftl" as Input]
          [@Input.render field={
            "type": type,
            "id": id,
            "label": label,
            "name": name,
            "autocomplete": autocomplete,
            "helpText": helpText,
            "inputmode": inputmode,
            "placeholder": placeholder
          } /]
        `,
      },
    },
  },
};

export default meta;

export const input: StoryObj<InputField> = {
  args: {
    type: "input",
    id: "input-1",
    label: "Navn",
    name: "name",
    autocomplete: "name",
    helpText: "Fullt navn",
    inputmode: "text",
    placeholder: "Skriv inn navnet ditt",
  },
};
