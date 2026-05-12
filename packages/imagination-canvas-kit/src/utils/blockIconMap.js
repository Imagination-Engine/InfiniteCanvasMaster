// @ts-nocheck
import * as Icons from "lucide-react";
import { blockRegistry } from "@iem/core";
/**
 * Robust icon mapping for blocks.
 * Fallback hierarchy: Exact ID -> Short Type -> Studio -> Category -> Generic Box.
 */
export function resolveBlockIcon(id, category, studio) {
  // 1. Try to get definition from registry
  const def =
    blockRegistry.get(id) ||
    blockRegistry.list().find((b) => b.id.endsWith(`.${id}`));
  const iconName =
    def?.icon ||
    getIconNameByStudio(studio) ||
    getIconNameByCategory(category) ||
    "Box";
  return Icons[iconName] || Icons.Box;
}
function getIconNameByStudio(studio) {
  if (!studio) return null;
  const mapping = {
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
function getIconNameByCategory(category) {
  if (!category) return null;
  const mapping = {
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
