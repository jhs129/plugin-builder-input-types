"use client";

import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import type { Theme } from "./theme";

/** Resolves an explicit theme against the nearest ThemeContext, falling back to "light". */
export const useResolvedTheme = (explicitTheme?: Theme, inheritTheme = false): Theme => {
  const context = useContext(ThemeContext);

  if (inheritTheme && context?.theme) return context.theme;
  if (explicitTheme) return explicitTheme;
  if (context?.theme) return context.theme;
  return "light";
};
