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
    errors: {
      name: ["Missing required field"],
    },
    pages: [
      {
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
          },
          {
            type: "textarea",
            id: "input-1",
            label: "Kommentar",
            name: "comment",
            placeholder: "Skriv en kommentar",
          },
        ],
      },
    ],
  },
};
