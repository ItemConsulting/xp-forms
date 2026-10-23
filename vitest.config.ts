import { defineXpStorybookProject } from "@itemconsulting/storybook-framework-enonic-xp/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => ({
  test: {
    projects: [
      await defineXpStorybookProject(),
    ],
  },
}));
