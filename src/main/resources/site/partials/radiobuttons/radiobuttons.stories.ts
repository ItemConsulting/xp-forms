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
            "type": type,
            "id": id,
            "label": label,
            "name": name,
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
    type: "radiobuttons",
    id: "input-1",
    label: "Frukt",
    name: "fruit",
    helpText: "Yndlingsfrukt",
    value: "pear",
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
