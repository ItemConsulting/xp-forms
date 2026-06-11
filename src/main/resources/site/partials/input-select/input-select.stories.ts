import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { InputSelect } from "./input-select.freemarker";
import id from "./input-select.ftlh";

const meta: Meta<InputSelect> = {
  title: "Field/Select",
  parameters: {
    server: {
      id,
      params: {
        template: `
        [#import "/site/partials/input-select/input-select.ftlh" as Select]
        [@Select.render field={
        "type": "select",
        "id": "input-1",
        "label": label,
        "name": "fruit",
        "helpText": helpText,
        "options": options
        } /]
        `,
      },
    },
  },
};

export default meta;

export const select: StoryObj<InputSelect> = {
  args: {
    label: "Frukt",
    helpText: "Yndlingsfrukt",
    options: [
      {
        text: "Pære",
        value: "pear",
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
