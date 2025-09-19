import id from "./select.ftlh";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { SelectField } from "./select.freemarker";

const meta: Meta<SelectField> = {
  title: "Field/Select",
  parameters: {
    server: {
      id,
      params: {
        template: `
        [#import "/site/partials/select/select.ftlh" as Select]
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

export const select: StoryObj<SelectField> = {
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
