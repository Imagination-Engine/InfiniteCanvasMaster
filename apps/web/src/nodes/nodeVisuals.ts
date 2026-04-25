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
  BookOpen,
  Gamepad2,
  Database,
  Film,
  GitBranch,
  Hammer,
  Network,
  User,
  Trophy,
  Timer,
  Cpu,
  Search,
  Zap,
  Bot,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProviderKey =
  | "zoom"
  | "discord"
  | "slack"
  | "trello"
  | "calendly"
  | "gmail"
  | "sheets";

export const PROVIDER_META: Record<
  ProviderKey,
  { label: string; icon: LucideIcon; colorClass: string }
> = {
  zoom: { label: "Zoom Actions", icon: Video, colorClass: "text-sky-300" },
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
  trello: { label: "Trello Actions", icon: Table, colorClass: "text-cyan-300" },
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
  // Core creative
  refiner: PenTool,
  summarizer: FileText,
  translator: Globe,
  colorSwapper: Image,
  filter: List,
  webScraper: Globe,
  formatter: FileText,
  programmer: Code,
  fileUpload: Upload,
  // Triggers
  "trigger.time": Timer,
  "trigger.webhook": GitBranch,
  "trigger.slackMessage": MessageSquare,
  "trigger.calendlyEvent": Globe,
  // Scribe blocks
  "scribe.prose": PenTool,
  "scribe.chapter": BookOpen,
  "scribe.characterProfile": User,
  "scribe.worldLore": Globe,
  "scribe.dialogueTree": MessageSquare,
  "scribe.editor": PenTool,
  "scribe.proofreader": FileText,
  // Playable blocks
  "playable.joystick": Gamepad2,
  "playable.collider": Zap,
  "playable.score": Trophy,
  "playable.spawner": Zap,
  "playable.timer": Timer,
  "playable.sprite": Cpu,
  "playable.physicsEntity": Cpu,
  // Atlas blocks
  "atlas.documentLoader": Upload,
  "atlas.chunker": Database,
  "atlas.vectorSearch": Search,
  "atlas.graphKnowledge": Network,
  "atlas.indexer": Database,
  "atlas.semanticRouter": GitBranch,
  // Reel blocks
  "reel.timeline": Film,
  "reel.scene": Layers,
  "reel.character": User,
  "reel.vfx": Zap,
  "reel.transition": Film,
  "reel.export": Upload,
  // Conductor blocks
  "conductor.router": GitBranch,
  "conductor.forEach": List,
  "conductor.delay": Timer,
  "conductor.webhook": Globe,
  "conductor.state": Database,
  "conductor.errorBoundary": Zap,
  "conductor.subGraph": Layers,
  "conductor.agent": Bot,
  "conductor.saas": Globe,
  // Forge blocks
  "forge.architect": Network,
  "forge.designer": Image,
  "forge.builder": Hammer,
  "forge.tester": Code,
};

const NODE_ICON_BY_PREFIX: Record<string, LucideIcon> = {
  zoom: Video,
  discord: MessageSquare,
  slack: MessageSquare,
  trello: Table,
  calendly: Globe,
  gmail: FileText,
  sheets: Table,
  scribe: BookOpen,
  playable: Gamepad2,
  atlas: Database,
  reel: Film,
  conductor: GitBranch,
  forge: Hammer,
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
