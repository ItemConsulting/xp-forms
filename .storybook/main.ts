import type { StorybookConfig } from "@itemconsulting/storybook-framework-enonic-xp";

const config: StorybookConfig = {
  typescript: {
    check: false,
  },
  stories: ["../src/**/*.stories.ts"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
  ],
  staticDirs: ["../src/main/resources/assets"],
  framework: {
    name: "@itemconsulting/storybook-framework-enonic-xp",
    options: {},
  },
};

export default config;
