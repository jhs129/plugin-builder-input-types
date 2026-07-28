import React from "react";
import { CMSLink } from "@builder-plugins";
import appState from "@builder.io/app-context";

export interface CMSLinkInputProps {
  value?: {
    get(key: "type" | "href" | "model" | "referenceId"): string | undefined;
    type: "url" | "model";
    href: string;
    model?: string;
    referenceId?: string;
  };
  onChange?: (value: {
    type: "url" | "model";
    href: string;
    model?: string;
    referenceId?: string;
  }) => void;
  defaultType?: "url" | "model";
}

const CMSLinkInput: React.FC<CMSLinkInputProps> = ({ value, onChange, defaultType = "url" }) => {
  // Get plugin settings from appState
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginSettings = (appState as any)?.user?.organization?.value?.settings?.plugins?.get?.("@jhsdc/builder-input-types");

  const appState2 = (appState as any).user?.organization;
  console.log("App State 2", appState2);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiKey = pluginSettings?.get?.("CMSLinkSettings")?.get?.("apiKey") || (appState as any).user?.mainSpaceApiKey || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const models = pluginSettings?.get?.("CMSLinkSettings")?.toJSON?.()?.models?.map?.((model: any) => ({
    name: model.name,
    displayName: model.displayName || model.name,
  })) || [
    { name: "page", displayName: "Page" },
    { name: "data", displayName: "Data" },
  ];

  const defaultValue = {
    get: (key: "type" | "href" | "model" | "referenceId") => {
      switch (key) {
        case "type": return defaultType;
        case "href": return "";
        case "model": return "";
        case "referenceId": return "";
        default: return "";
      }
    },
    type: defaultType,
    href: "",
    model: "",
    referenceId: "",
  };

  const currentValue = value || defaultValue;

  const handleChange = (newValue: {
    type: "url" | "model";
    href: string;
    model?: string;
    referenceId?: string;
  }) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <CMSLink
      value={currentValue}
      onChange={handleChange}
      defaultType={defaultType}
      apiKey={apiKey}
      models={models}
    />
  );
};

export default CMSLinkInput;
