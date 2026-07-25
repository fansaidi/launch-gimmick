import { jsonb, pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Supabase Auth owns this table; we only reference it, never write to it.
const authSchema = pgSchema('auth')
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
})

export const flows = pgTable('flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('Untitled Flow'),
  // FlowStep[] from the builder/player - kept as a single JSON blob rather
  // than a normalized steps table since step shape varies per component
  // type and there's no query need yet to filter/join on individual steps.
  steps: jsonb('steps').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type FlowRow = typeof flows.$inferSelect
export type NewFlowRow = typeof flows.$inferInsert
