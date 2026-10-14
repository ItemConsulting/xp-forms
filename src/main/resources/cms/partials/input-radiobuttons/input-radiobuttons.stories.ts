import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { InputRadioButtons } from "./input-radiobuttons.freemarker";
import id from "./input-radiobuttons.ftlh";

const meta: Meta<InputRadioButtons> = {
  title: "Field/Radiobuttons",
  parameters: {
    server: {
      id,
      params: {
        template: `
        [#import "/cms/partials/input-radiobuttons/input-radiobuttons.ftlh" as RadioButtons]
        [@RadioButtons.render field={
        "type": "radiobuttons",
        "id": "input-1",
        "label": label,
        "name": "fruit",
        "helpText": helpText,
        "options": options,
        "required": required
        } errors=errorText?has_content?then({ "fruit": [errorText] }, {}) /]
        `,
      },
    },
  },
};

export default meta;

export const radiobuttons: StoryObj<InputRadioButtons> = {
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
    required: false,
  },
};

export const withError: StoryObj<InputRadioButtons & { errorText: string }> = {
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
    errorText: "Du har valgt feil",
    required: true,
  },
};
