"use client";

import React from "react";
import Link from "next/link";
import { ThemeProvider } from "./ThemeProvider";
import type { Themeable } from "./theme";
import type { CMSLinkProps, Stylable } from "./types";

interface DynamicLinkProps extends Themeable, Stylable {
  link?: CMSLinkProps | string;
  label?: string;
  children?: React.ReactNode;
  openInNewTab?: boolean;
  title?: string;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

function resolveHref(link: CMSLinkProps | string | undefined): string {
  if (!link) return "#";
  if (typeof link === "string") return link;
  if (link.type === "model") {
    if (!link.model || !link.referenceId) return link.href || "#";
    // Matches the app/dynamiclink/[model]/[type]/[id]/route.ts redirect handler.
    return `/dynamiclink/${link.model}/builder/${link.referenceId}`;
  }
  return link.href || "#";
}

function shouldOpenInNewTab(link: CMSLinkProps | string | undefined, override?: boolean): boolean {
  if (override) return true;
  if (link && typeof link !== "string" && link.openInNewTab) return true;
  return false;
}

export const DynamicLink = ({
  link,
  label,
  children,
  className = "",
  openInNewTab,
  title,
  ariaLabel,
  onClick,
  theme,
  inheritTheme = true,
}: DynamicLinkProps) => {
  const href = resolveHref(link);
  const newTab = shouldOpenInNewTab(link, openInNewTab);
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  const linkProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
    className,
    title,
    onClick,
    ...(ariaLabel && { "aria-label": ariaLabel }),
    ...(newTab || isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };

  const content = label ?? children;

  const linkElement = (
    <Link href={href} {...linkProps}>
      {content}
    </Link>
  );

  if (inheritTheme !== false) return linkElement;

  return (
    <ThemeProvider theme={theme} inheritTheme={false}>
      {linkElement}
    </ThemeProvider>
  );
};

export default DynamicLink;
export type { DynamicLinkProps, CMSLinkProps };
