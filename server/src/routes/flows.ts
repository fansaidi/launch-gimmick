import { Router } from 'express'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../db/client.js'
import { flows } from '../db/schema.js'

const flowStepSchema = z.object({
  id: z.string(),
  type: z.string(),
  config: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]).optional()),
})

const createFlowSchema = z.object({
  name: z.string().min(1).default('Untitled Flow'),
  steps: z.array(flowStepSchema).default([]),
})

const updateFlowSchema = z.object({
  name: z.string().min(1).optional(),
  steps: z.array(flowStepSchema).optional(),
})

export const flowsRouter = Router()

flowsRouter.get('/', async (req, res) => {
  const { userId } = req
  const rows = await db
    .select()
    .from(flows)
    .where(eq(flows.userId, userId))
    .orderBy(desc(flows.updatedAt))
  res.json(rows)
})

flowsRouter.get('/:id', async (req, res) => {
  const { userId } = req
  const [row] = await db
    .select()
    .from(flows)
    .where(and(eq(flows.id, req.params.id), eq(flows.userId, userId)))
  if (!row) {
    res.status(404).json({ error: 'Flow not found' })
    return
  }
  res.json(row)
})

flowsRouter.post('/', async (req, res) => {
  const { userId } = req
  const parsed = createFlowSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const [row] = await db
    .insert(flows)
    .values({ userId, name: parsed.data.name, steps: parsed.data.steps })
    .returning()
  res.status(201).json(row)
})

flowsRouter.patch('/:id', async (req, res) => {
  const { userId } = req
  const parsed = updateFlowSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const [row] = await db
    .update(flows)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(flows.id, req.params.id), eq(flows.userId, userId)))
    .returning()

  if (!row) {
    res.status(404).json({ error: 'Flow not found' })
    return
  }
  res.json(row)
})

flowsRouter.delete('/:id', async (req, res) => {
  const { userId } = req
  const [row] = await db
    .delete(flows)
    .where(and(eq(flows.id, req.params.id), eq(flows.userId, userId)))
    .returning({ id: flows.id })

  if (!row) {
    res.status(404).json({ error: 'Flow not found' })
    return
  }
  res.status(204).end()
})
