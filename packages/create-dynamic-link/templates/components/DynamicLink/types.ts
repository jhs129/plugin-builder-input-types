// Matches the value shape produced by the CMSLink Builder.io custom input
// (registered via the @jhsdc/builder-input-types plugin).
export interface CMSLinkProps {
  type: "url" | "model";
  href: string;
  model?: string;
  referenceId?: string;
  openInNewTab?: boolean;
}

export interface Stylable {
  className?: string;
}
