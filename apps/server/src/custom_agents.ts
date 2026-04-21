import { pool } from './db.js';

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

/**
 * Saves a new custom agent to the database.
 */
export async function saveCustomAgent(data: CustomAgentData) {
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
    data.tagline,
    data.avatarUrl,
    data.story,
    data.persona,
    data.skills,
    data.contextSources,
    data.capabilities,
    data.purpose,
    data.blockDefinition
  ];

  const result = await pool.query(query, values);
  return result.rows[0].id;
}

/**
 * Retrieves custom agents for a specific user.
 */
export async function getCustomAgents(userId: string) {
  const query = `
    SELECT * FROM custom_agents 
    WHERE owner_id = $1 
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}
