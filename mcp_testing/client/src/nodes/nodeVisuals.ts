import {
  Code,
  FileText,
  Globe,
  Group,
  Image,
  List,
  MessageSquare,
  Table,
  Upload,
  Video,
  PenTool,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProviderKey = "zoom" | "discord" | "slack" | "trello" | "calendly" | "gmail" | "sheets";

export const PROVIDER_META: Record<ProviderKey, { label: string; icon: LucideIcon; colorClass: string }> = {
  zoom: {
    label: "Zoom Actions",
    icon: Video,
    colorClass: "text-sky-300",
  },
  discord: {
    label: "Discord Actions",
    icon: MessageSquare,
    colorClass: "text-indigo-300",
  },
  slack: {
    label: "Slack Actions",
    icon: MessageSquare,
    colorClass: "text-emerald-300",
  },
  trello: {
    label: "Trello Actions",
    icon: Table,
    colorClass: "text-cyan-300",
  },
  calendly: {
    label: "Calendly Actions",
    icon: Globe,
    colorClass: "text-blue-300",
  },
  gmail: {
    label: "Gmail Actions",
    icon: FileText,
    colorClass: "text-rose-300",
  },
  sheets: {
    label: "Google Sheets Actions",
    icon: Table,
    colorClass: "text-lime-300",
  },
};

const NODE_ICON_BY_TYPE: Record<string, LucideIcon> = {
  refiner: PenTool,
  summarizer: FileText,
  translator: Globe,
  colorSwapper: Image,
  filter: List,
  webScraper: Globe,
  formatter: FileText,
  programmer: Code,
  fileUpload: Upload,
  "trigger.time": FileText,
  "trigger.webhook": Globe,
  "trigger.slackMessage": MessageSquare,
  "trigger.calendlyEvent": Globe,
};

const NODE_ICON_BY_PREFIX: Record<string, LucideIcon> = {
  zoom: Video,
  discord: MessageSquare,
  slack: MessageSquare,
  trello: Table,
  calendly: Globe,
  gmail: FileText,
  sheets: Table,
};

export const getNodeIcon = (nodeType: string): LucideIcon => {
  if (NODE_ICON_BY_TYPE[nodeType]) {
    return NODE_ICON_BY_TYPE[nodeType];
  }

  const prefix = nodeType.split(".")[0] ?? "";
  if (NODE_ICON_BY_PREFIX[prefix]) {
    return NODE_ICON_BY_PREFIX[prefix];
  }

  return Group;
};
