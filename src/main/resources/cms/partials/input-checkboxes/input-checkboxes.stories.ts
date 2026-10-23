import type { Meta, StoryObj } from "@itemconsulting/storybook-framework-enonic-xp";
import type { InputCheckboxes } from "./input-checkboxes.freemarker";
import id from "./input-checkboxes.ftlh";

const meta: Meta<InputCheckboxes> = {
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
          "options": options,
          "required": required
        } errors=errorText?has_content?then({ "fruits": [errorText] }, {}) /]
        `,
      },
    },
  },
};

export default meta;

export const checkboxes: StoryObj<InputCheckboxes> = {
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
    required: false,
  },
};

export const withError: StoryObj<InputCheckboxes & { errorText?: string }> = {
  args: {
    label: "Frukt",
    helpText: "Velg frukten du vil ha til lunsj",
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
        value: "apple",
      },
      {
        text: "Melon",
        value: "melon",
      },
    ],
    errorText: "Du må velge minst ett alternativ",
    required: true,
  },
};

export const singleRequired: StoryObj<InputCheckboxes> = {
  args: {
    label: "Samtykke",
    helpText: "Vi trenger ditt samtykke for å behandle henvendelsen",
    options: [
      {
        text: "Jeg samtykker til at opplysningene lagres",
        value: "consent",
      },
    ],
    required: true,
  },
};
