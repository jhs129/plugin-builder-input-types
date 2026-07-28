"use client";

import React, { createContext, ReactNode } from "react";
import type { Theme } from "./theme";

interface ThemeContextValue {
  theme: Theme;
  parentTheme?: Theme;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeContextProviderProps {
  children: ReactNode;
  theme: Theme;
  parentTheme?: Theme;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
  children,
  theme,
  parentTheme,
}) => {
  return (
    <ThemeContext.Provider value={{ theme, parentTheme }}>{children}</ThemeContext.Provider>
  );
};
