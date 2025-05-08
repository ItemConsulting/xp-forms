import id from "./page-form.ftl";
import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { PageForm } from "./page-form.freemarker";

const meta: Meta<PageForm> = {
  title: "Part/Form View",
  parameters: {
    server: {
      id,
    },
  },
};

export default meta;

export const formPage: StoryObj<PageForm> = {
  args: {
    title: "Innmeldingsskjema",
    text: "This is some intro text",
    submitButtonText: "Send inn",
    frameId: "frame",
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
        value: "test",
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
};
