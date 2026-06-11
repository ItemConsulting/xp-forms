import { DEFAULT_XP_SERVER, type Preview } from "@itemconsulting/xp-storybook-utils";
import "@digdir/designsystemet-css/index.css";
import "@digdir/designsystemet-css/theme.css";
import "../src/main/resources/assets/styles/content-studio.css";
import "../src/main/resources/assets/styles/main.css";

const preview: Preview = {
  parameters: {
    server: DEFAULT_XP_SERVER,
  },
  decorators: [
    (story) => {
      const root = document.getElementById("storybook-root");
      root?.classList.add("forms");
      return story();
    },
  ],
};

export default preview;
