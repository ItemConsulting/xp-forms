import type { Meta, StoryObj } from "@itemconsulting/xp-storybook-utils";
import type { FreemarkerParams } from "./form-view.freemarker";
import id from "./form-view.ftlh";

const meta: Meta<FreemarkerParams> = {
  title: "Part/Form View",
  parameters: {
    server: {
      id,
    },
  },
};

export default meta;

export const frame: StoryObj<FreemarkerParams> = {
  args: {
    frameId: "myframe",
    adminErrors: {
      errors: ["Dette er en error"],
      warnings: ["Dette er en warning"],
    },
    pages: [],
  },
};
