import "../src/app/styles"
import type { Preview } from "@storybook/react";
import '../src/app/styles/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: { expanded: true },
  },
};

export default preview;
