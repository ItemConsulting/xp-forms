import id from "./form-view.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import { FreemarkerParams } from "./form-view.freemarker";

const meta: Meta<FreemarkerParams> = {
  title: "Part/Form View",
  parameters: {
    server: {
      id,
    },
  },
};

export default meta;

export const formView: StoryObj<FreemarkerParams> = {
  args: {
    locale: "no",
    errors: {
      name: ["Missing required field"],
    },
    pages: [
      {
        type: "form-page",
        title: "Innmeldingsskjema",
        text: "This is some intro text",
        submitButtonText: "Send inn",
        fields: [
          {
            type: "input",
            id: "input-1",
            label: "Navn",
            name: "name",
            autocomplete: "name",
            helpText: "Fullt navn",
            inputmode: "text",
            placeholder: "Skriv inn navnet ditt",
            required: true,
          },
          {
            type: "textarea",
            id: "input-2",
            label: "Kommentar",
            name: "comment",
            placeholder: "Skriv en kommentar",
            required: false,
          },
        ],
      },
    ],
  },
};
