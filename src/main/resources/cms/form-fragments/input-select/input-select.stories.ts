import type { Meta, StoryObj } from "@storybook/server";
import { controlAutocomplete } from "../../../storybook-utils";
import type { InputSelect } from "./input-select.freemarker";
import id from "./input-select.ftlh";

const meta: Meta<InputSelect> = {
  title: "Field/Select",
  argTypes: {
    autocomplete: {
      ...controlAutocomplete,
      options: [
        "off",
        "on",
        "honorific-prefix",
        "honorific-suffix",
        "sex",
        "country",
        "country-name",
        "address-level1",
        "address-level2",
        "bday-day",
        "bday-month",
        "bday-year",
      ],
    },
  },
  parameters: {
    server: {
      id,
      params: {
        template: `
        [#import "/cms/form-fragments/input-select/input-select.ftlh" as Select]
        [@Select.render field={
        "type": "select",
        "id": "input-1",
        "label": label,
        "name": "fruit",
        "helpText": helpText,
        "options": options,
        "autocomplete": autocomplete!,
        "required": required
        } errors=errorText?has_content?then({ "fruit": [errorText] }, {}) /]
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
    required: false,
  },
};

export const withAutocomplete: StoryObj<InputSelect> = {
  args: {
    label: "Land",
    helpText: "Landet du bor i",
    options: [
      {
        text: "Norge",
        value: "NO",
      },
      {
        text: "Sverige",
        value: "SE",
      },
      {
        text: "Danmark",
        value: "DK",
      },
    ],
    autocomplete: "country",
    required: false,
  },
};

export const withError: StoryObj<InputSelect & { errorText?: string }> = {
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
    ],
    errorText: "Du må velge en frukt",
    required: true,
  },
};
