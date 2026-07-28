import type { RegisteredComponent } from "@builder.io/sdk-react";
import { themeableInputs } from "./theme";
import { DynamicLink } from "./index";

// Optional insert-menu thumbnail — set NEXT_DEFAULT_COMPONENT_IMAGE if you want
// every registered component to fall back to a shared placeholder image.
const image = process.env.NEXT_DEFAULT_COMPONENT_IMAGE;

export const registration: RegisteredComponent[] = [
  {
    component: DynamicLink,
    name: "DynamicLink",
    ...(image ? { image } : {}),
    canHaveChildren: true,
    inputs: [
      ...themeableInputs,
      {
        name: "link",
        type: "CMSLink",
        required: true,
        defaultValue: { type: "url", href: "#" },
        helperText: "The destination URL or model reference for the link",
      },
      {
        name: "label",
        type: "string",
        defaultValue: "Learn More",
        helperText: "Link text — leave blank to use child content instead",
      },
      {
        name: "openInNewTab",
        type: "boolean",
        defaultValue: false,
        helperText: "Force the link to open in a new browser tab",
      },
      {
        name: "title",
        type: "string",
        advanced: true,
        helperText: "HTML title attribute shown on hover",
      },
      {
        name: "ariaLabel",
        type: "string",
        advanced: true,
        helperText: "Accessible label for screen readers (overrides visible text)",
      },
    ],
  },
];
