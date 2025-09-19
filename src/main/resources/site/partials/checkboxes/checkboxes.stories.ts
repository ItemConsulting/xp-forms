import id from "./checkboxes.ftlh";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { CheckboxesField } from "./checkboxes.freemarker";

const meta: Meta<CheckboxesField> = {
  title: "Field/Checkboxes",
  parameters: {
    server: {
      id,
      params: {
        template: `
        [#import "${id}" as Checkboxes]
        [@Checkboxes.render field={
        "type": "checkboxes",
        "id": "input-1",
        "label": label,
        "name": "fruits",
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
    label: "Frukt",
    helpText: "Velg frukten du vil ha til lunsj",
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
