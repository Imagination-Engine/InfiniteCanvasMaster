// @ts-nocheck
import * as Icons from "lucide-react";
import { blockRegistry } from "@iem/core";

/**
 * Robust icon mapping for blocks.
 * Fallback hierarchy: Exact ID -> Short Type -> Studio -> Category -> Generic Box.
 */
export function resolveBlockIcon(
  id: string,
  category?: string,
  studio?: string,
): React.FC {
  // 1. Try to get definition from registry
  const def =
    blockRegistry.get(id) ||
    blockRegistry.list().find((b) => b.id.endsWith(`.${id}`));

  const iconName =
    def?.icon ||
    getIconNameByStudio(studio) ||
    getIconNameByCategory(category) ||
    "Box";

  return (Icons as any)[iconName] || Icons.Box;
}

function getIconNameByStudio(studio?: string): string | null {
  if (!studio) return null;

  const mapping: Record<string, string> = {
    "Agent Studio": "Bot",
    "Automation Studio": "Workflow",
    "Research Studio": "Search",
    "App Creation Studio": "Code2",
    "Media Studio": "Image",
    "Video Studio": "Video",
    "Game Studio": "Gamepad2",
    "Writer’s Studio": "PenTool",
    "Launch Studio": "Rocket",
    "Knowledge Studio": "Library",
    "Brand Studio": "Award",
    "Commerce Studio": "Store",
  };

  return mapping[studio] || null;
}

function getIconNameByCategory(category?: string): string | null {
  if (!category) return null;

  const mapping: Record<string, string> = {
    "Agents & Swarms": "Bot",
    "Chat & Communication": "MessageSquare",
    "Text & Knowledge": "FileText",
    "Generative Media": "Sparkles",
    Studios: "Layout",
    "Runtime & Apps": "AppWindow",
    "Commerce & Intentcasting": "Wallet",
    "Files & Data": "File",
    "System & Utility": "Settings",
  };

  return mapping[category] || null;
}
