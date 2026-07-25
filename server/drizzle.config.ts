import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Supabase owns the auth schema; only manage our own tables.
  schemaFilter: ['public'],
})
