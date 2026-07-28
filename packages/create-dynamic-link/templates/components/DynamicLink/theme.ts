export const standardThemes = [
  "light",
  "dark",
  "accent",
  "warm",
  "gradient",
  "transparent-light",
  "transparent-dark",
] as const;

export type Theme = (typeof standardThemes)[number];

export interface Themeable {
  theme?: Theme;
  inheritTheme?: boolean;
}

export const getThemeClasses = (theme: Theme = "light"): string => `theme theme-${theme}`;

// Builder.io Gen2 input definitions for the theme/inheritTheme fields. Spread
// these into a component registration's `inputs` array alongside your other inputs.
export const themeableInputs = [
  {
    name: "theme",
    type: "string",
    friendlyName: "Color theme",
    advanced: true,
    required: true,
    defaultValue: "light",
    enum: standardThemes as unknown as string[],
    helperText: "Color scheme for this section.",
  },
  {
    name: "inheritTheme",
    type: "boolean",
    friendlyName: "Match the section above",
    advanced: true,
    defaultValue: false,
    helperText: "Use the surrounding section's colors instead.",
  },
];
