import id from "./radiobuttons.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { RadioButtonsField } from "./radiobuttons.freemarker";

const meta: Meta<RadioButtonsField> = {
  title: "Field/Radiobuttons",
  parameters: {
    server: {
      id,
      params: {
        template: `
          [#import "/site/partials/radiobuttons/radiobuttons.ftl" as RadioButtons]
          [@RadioButtons.render field={
            "type": "radiobuttons",
            "id": "input-1",
            "label": label,
            "name": "fruit",
            "helpText": helpText,
            "options": options
          } locale=locale /]
        `,
      },
    },
  },
};

export default meta;

export const radiobuttons: StoryObj<RadioButtonsField> = {
  args: {
    label: "Frukt",
    helpText: "Yndlingsfrukt",
    options: [
      {
        text: "Pære",
        value: "pear",
        checked: true,
      },
      {
        text: "Banan",
        value: "banana",
      },
      {
        text: "Appelsin",
        value: "organge",
      },
    ],
  },
};
