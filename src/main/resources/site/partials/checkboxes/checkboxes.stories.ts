import id from "./checkboxes.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { CheckboxesField } from "./checkboxes.freemarker";

const meta: Meta<CheckboxesField> = {
  title: "Field/Checkboxes",
  parameters: {
    server: {
      id,
      params: {
        template: `
          [#import "/site/partials/checkboxes/checkboxes.ftl" as Checkboxes]
          [@Checkboxes.render field={
            "type": type,
            "id": id,
            "label": label,
            "name": name,
            "helpText": helpText,
            "options": options
          } /]
        `,
      },
    },
  },
};

export default meta;

export const checkboxes: StoryObj<CheckboxesField> = {
  args: {
    type: "checkboxes",
    id: "input-1",
    label: "Frukt",
    name: "fruitlikes",
    helpText: "Fullt navn",
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
        value: "apple",
      },
      {
        text: "Melon",
        value: "melon",
      },
    ],
  },
};
