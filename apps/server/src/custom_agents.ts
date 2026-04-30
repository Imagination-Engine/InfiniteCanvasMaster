import { eq, desc } from "drizzle-orm";
import { customAgents } from "@iem/db";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@iem/db";

export interface CustomAgentData {
  userId: string;
  name: string;
  tagline?: string;
  avatarUrl?: string;
  story?: string;
  persona: any;
  skills: string[];
  contextSources?: any;
  capabilities: any;
  purpose: string;
  blockDefinition: any;
}

export function validateCustomAgentData(data: any): data is CustomAgentData {
  if (!data || typeof data !== "object") return false;
  if (typeof data.userId !== "string" || data.userId.trim() === "")
    return false;
  if (typeof data.name !== "string" || data.name.trim() === "") return false;
  if (typeof data.purpose !== "string" || data.purpose.trim() === "")
    return false;
  if (
    !Array.isArray(data.skills) ||
    !data.skills.every((s: any) => typeof s === "string")
  )
    return false;

  // Adversarial input boundaries
  if (data.name.length > 255) return false;
  if (data.purpose.length > 2000) return false;
  if (data.tagline && data.tagline.length > 500) return false;

  return true;
}

/**
 * Saves a new custom agent to the database.
 */
export async function saveCustomAgent(
  db: NodePgDatabase<typeof schema>,
  data: CustomAgentData,
) {
  if (!validateCustomAgentData(data)) {
    throw new Error("Invalid custom agent data provided");
  }

  try {
    const [result] = await db.insert(customAgents).values({
      ownerId: data.userId,
      name: data.name,
      tagline: data.tagline || null,
      avatarUrl: data.avatarUrl || null,
      story: data.story || null,
      persona: data.persona || null,
      skills: data.skills,
      contextSources: data.contextSources || null,
      capabilities: data.capabilities || null,
      purpose: data.purpose,
      blockDefinition: data.blockDefinition || null,
    }).returning();
    
    return result.id;
  } catch (error) {
    throw new Error(
      `Failed to save custom agent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Retrieves custom agents for a specific user.
 */
export async function getCustomAgents(db: NodePgDatabase<typeof schema>, userId: string) {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("Invalid userId provided");
  }

  try {
    return await db.select()
      .from(customAgents)
      .where(eq(customAgents.ownerId, userId))
      .orderBy(desc(customAgents.createdAt));
  } catch (error) {
    throw new Error(
      `Failed to retrieve custom agents: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
