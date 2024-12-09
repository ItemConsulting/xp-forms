import id from "./text-area.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { TextAreaField } from "./text-area.freemarker";

const meta: Meta<TextAreaField> = {
  title: "Field/TextArea",
  parameters: {
    server: {
      id,
      params: {
        template: `
          [#import "/site/partials/text-area/text-area.ftl" as TextArea]
          [@TextArea.render field={
            "type": type,
            "id": id,
            "label": label,
            "name": name,
            "cols": cols,
            "rows": rows,
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

export const textArea: StoryObj<TextAreaField> = {
  args: {
    type: "textarea",
    id: "input-1",
    label: "Navn",
    name: "name",
    cols: 60,
    rows: 5,
    autocomplete: "name",
    helpText: "Fullt navn",
    inputmode: "text",
    placeholder: "Skriv inn navnet ditt",
  },
};
