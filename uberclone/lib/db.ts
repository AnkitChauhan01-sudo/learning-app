import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  // Don't throw in production, allow app to start
  if (process.env.NODE_ENV === 'development') {
    throw new Error('DATABASE_URL is not set');
  }
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

