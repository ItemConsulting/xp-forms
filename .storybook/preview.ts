import { createPreviewServerParams, type Preview } from "@itemconsulting/xp-storybook-utils";
import "../src/main/resources/assets/styles/content-studio.css";
import "../src/main/resources/assets/styles/main.css";
import "../src/main/resources/assets/styles/preview.css";

if (!process.env.STORYBOOK_SERVER_URL) {
  throw Error(`You need to create a file named ".env" with "STORYBOOK_SERVER_URL" in it. Then restart storybook.`);
}

const preview: Preview = {
  parameters: {
    server: {
      url: process.env.STORYBOOK_SERVER_URL,
      params: createPreviewServerParams({
        zonedDateTime: /Date$/,
        region: /Region$/i,
      }),
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    locale: {
      description: "Internationalization locale",
      defaultValue: "no",
      toolbar: {
        icon: "globe",
        items: [
          { value: "no", right: "🇳🇴", title: "Norsk" },
          { value: "en", right: "🇬🇧", title: "English" },
        ],
      },
    },
  },
};

export default preview;
