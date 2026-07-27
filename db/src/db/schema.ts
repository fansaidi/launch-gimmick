import { sql } from 'drizzle-orm'
import { jsonb, pgPolicy, pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Supabase Auth owns this table; we only reference it, never write to it.
const authSchema = pgSchema('auth')
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
})

// No API server sits in front of this anymore - the builder queries
// Supabase (PostgREST) directly with the user's JWT, so these RLS
// policies are what actually keeps one user's flows private from
// another's, not application code.
export const flows = pgTable(
  'flows',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .default(sql`auth.uid()`)
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull().default('Untitled Flow'),
    // FlowStep[] from the builder/player - kept as a single JSON blob rather
    // than a normalized steps table since step shape varies per component
    // type and there's no query need yet to filter/join on individual steps.
    steps: jsonb('steps').notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    pgPolicy('select_own_flows', {
      for: 'select',
      to: 'authenticated',
      using: sql`${table.userId} = auth.uid()`,
    }),
    pgPolicy('insert_own_flows', {
      for: 'insert',
      to: 'authenticated',
      withCheck: sql`${table.userId} = auth.uid()`,
    }),
    pgPolicy('update_own_flows', {
      for: 'update',
      to: 'authenticated',
      using: sql`${table.userId} = auth.uid()`,
      withCheck: sql`${table.userId} = auth.uid()`,
    }),
    pgPolicy('delete_own_flows', {
      for: 'delete',
      to: 'authenticated',
      using: sql`${table.userId} = auth.uid()`,
    }),
  ],
).enableRLS()

export type FlowRow = typeof flows.$inferSelect
export type NewFlowRow = typeof flows.$inferInsert
