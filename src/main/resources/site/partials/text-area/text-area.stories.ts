import id from "./text-area.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { TextAreaField } from "./text-area.freemarker";
import { controlAutocomplete, controlInputMode } from "../../../storybook-utils";

const meta: Meta<TextAreaField> = {
  title: "Field/TextArea",
  argTypes: {
    autocomplete: controlAutocomplete,
    inputmode: controlInputMode,
  },
  parameters: {
    server: {
      id,
      params: {
        template: `
          [#import "/site/partials/text-area/text-area.ftl" as TextArea]
          [@TextArea.render field={
            "type": "textarea",
            "id": "input-1",
            "label": label,
            "name": "name",
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
    label: "Adresse",
    cols: 60,
    rows: 4,
    autocomplete: "street-address",
    helpText: "Leveringsadresse",
    inputmode: "text",
    placeholder: "Stedveien 4\nPoststed 0000\nNorge",
  },
};
