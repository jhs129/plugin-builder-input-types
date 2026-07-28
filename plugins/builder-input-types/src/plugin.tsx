// Import Tailwind as TEXT so it can be injected into the correct DOM root
import twCssText from "./tw.css";

/** Inject Tailwind CSS into the same root (Shadow DOM or document) the plugin UI renders in */
(function injectTailwindIntoRoot() {
  const style = document.createElement("style");
  style.textContent = twCssText;

  const host =
    document.querySelector("[data-variation-panel]") ||
    document.querySelector("[data-styles-panel]") ||
    document.body;

  const rootNode = host.getRootNode() as Document | ShadowRoot;
  const target = (rootNode as ShadowRoot & { host?: Element })?.host?.shadowRoot || document.head;

  target.appendChild(style);
})();

import appState from "@builder.io/app-context";
import { Builder } from "@builder.io/react";

import pkg from "../package.json";
const pluginId = pkg.name;

import CMSLinkInput from "./components/CMSLinkInput";

Builder.registerEditor({
  name: "CMSLink",
  component: CMSLinkInput,
});

Builder.register("plugin", {
  id: pluginId,
  name: "CMS Link",
  settings: [
    {
      name: "CMSLinkSettings",
      type: "object",
      friendlyName: "CMS Link Settings",
      subFields: [
        {
          name: "models",
          type: "list",
          friendlyName: "Content Models to Search",
          subFields: [
            {
              name: "name",
              type: "string",
              friendlyName: "Model Name",
            },
            {
              name: "displayName",
              type: "string",
              friendlyName: "Display Name",
            },
          ],
        },
      ],
    },
  ],
  ctaText: "Save Changes",
});

// Required to satisfy the module — appState is used only in CMSLinkInput
void appState;
