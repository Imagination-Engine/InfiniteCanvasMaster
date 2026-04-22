import { Client } from "pg";

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
  client: Client | any,
  data: CustomAgentData,
) {
  if (!validateCustomAgentData(data)) {
    throw new Error("Invalid custom agent data provided");
  }

  const query = `
    INSERT INTO custom_agents (
      owner_id, name, tagline, avatar_url, story, 
      persona, skills, context_sources, capabilities, 
      purpose, block_definition
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id;
  `;

  const values = [
    data.userId,
    data.name,
    data.tagline || null,
    data.avatarUrl || null,
    data.story || null,
    data.persona ? JSON.stringify(data.persona) : null,
    JSON.stringify(data.skills),
    data.contextSources ? JSON.stringify(data.contextSources) : null,
    data.capabilities ? JSON.stringify(data.capabilities) : null,
    data.purpose,
    data.blockDefinition ? JSON.stringify(data.blockDefinition) : null,
  ];

  try {
    const result = await client.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    throw new Error(
      `Failed to save custom agent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Retrieves custom agents for a specific user.
 */
export async function getCustomAgents(client: Client | any, userId: string) {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("Invalid userId provided");
  }

  const query = `
    SELECT * FROM custom_agents 
    WHERE owner_id = $1 
    ORDER BY created_at DESC;
  `;
  try {
    const result = await client.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw new Error(
      `Failed to retrieve custom agents: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
