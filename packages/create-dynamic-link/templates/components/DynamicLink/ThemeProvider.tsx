"use client";

import React, { ReactNode } from "react";
import { ThemeContextProvider } from "./ThemeContext";
import { useResolvedTheme } from "./useTheme";
import type { Theme } from "./theme";

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
  inheritTheme?: boolean;
  className?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme,
  inheritTheme = false,
  className = "",
}) => {
  const resolvedTheme = useResolvedTheme(theme, inheritTheme);

  return (
    <ThemeContextProvider theme={resolvedTheme} parentTheme={theme}>
      <div
        data-theme={resolvedTheme}
        className={`bg-theme-bg text-theme-text transition-colors duration-200 ${className}`}
      >
        {children}
      </div>
    </ThemeContextProvider>
  );
};

export default ThemeProvider;
