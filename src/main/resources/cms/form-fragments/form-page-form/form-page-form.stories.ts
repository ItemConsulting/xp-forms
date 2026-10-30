import type { Meta, StoryObj } from "@storybook/server";
import type { PageForm } from "./form-page-form.freemarker";
import id from "./form-page-form.ftlh";

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
    pageId: "page-1",
    errors: {},
    spamPreventionConfig: {
      type: "none",
    },
    fields: [
      {
        type: "text",
        id: "input-text-1",
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
        id: "input-text-2",
        label: "Kommentar",
        name: "comment",
        placeholder: "Skriv en kommentar",
        required: false,
      },
    ],
  },
};

export const formPageWithError: StoryObj<PageForm> = {
  args: {
    title: "Newsletter",
    text: "This is some intro text",
    submitButtonText: "Continue",
    frameId: "frame",
    pageId: "page-1",
    backUrl: "#",
    spamPreventionConfig: {
      type: "none",
    },
    errors: {
      email: ["Please provide a valid email address", "Please fill in the email field"],
    },
    fields: [
      {
        type: "text",
        id: "page-1-email",
        label: "Email",
        name: "email",
        autocomplete: "email",
        inputmode: "email",
        placeholder: "Skriv inn navnet ditt",
        required: true,
        value: "test",
      },
      {
        type: "textarea",
        id: "page-1-comment",
        label: "Kommentar",
        name: "comment",
        placeholder: "Skriv en kommentar",
        required: false,
      },
    ],
  },
};
