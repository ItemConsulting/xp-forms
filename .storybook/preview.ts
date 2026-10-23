import type { Preview } from "@itemconsulting/storybook-framework-enonic-xp";
import "@fontsource-variable/inter";
import "@digdir/designsystemet-css/index.css";
import "@digdir/designsystemet-css/theme.css";
import "../src/main/resources/assets/styles/content-studio.css";
import "../src/main/resources/assets/styles/main.css";
import "./preview.css";

const preview: Preview = {
  decorators: [
    (story) => {
      const root = document.getElementById("storybook-root");
      root?.classList.add("forms");
      return story();
    },
  ],
};

export default preview;
