export interface ContentItem {
  id?: string;
  name?: string;
  data?: Record<string, unknown>;
}

export interface ModelSelection {
  id: string;
  name: string;
  href: string;
  type: string;
}
