import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres@localhost:5432/imagination_canvas";

export const pool = new Pool({ 
  connectionString: databaseUrl,
  // For local dev, we might want to disable SSL, but in production we usually want it.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}
