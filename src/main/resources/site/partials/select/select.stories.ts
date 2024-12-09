import id from "./select.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { SelectField } from "./select.freemarker";

const meta: Meta<SelectField> = {
  title: "Field/Select",
  parameters: {
    server: {
      id,
      params: {
        template: `
          [#import "/site/partials/select/select.ftl" as Select]
          [@Select.render field={
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

export const select: StoryObj<SelectField> = {
  args: {
    type: "select",
    id: "input-1",
    label: "Frukt",
    name: "fruit",
    helpText: "Yndlingsfrukt",
    value: "pear",
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
