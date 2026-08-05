import { supabase } from './supabase'
import type { Flow } from './component-types'

// Talks to Supabase (PostgREST) directly - no API server in between. Row
// Level Security on the `flows` table (see db/src/db/schema.ts) is what
// actually scopes every query to the signed-in user; this layer just picks
// the columns that match our Flow shape.
const FLOW_COLUMNS = 'id, name, steps, published'

export const api = {
  async listFlows(): Promise<Flow[]> {
    const { data, error } = await supabase
      .from('flows')
      .select(FLOW_COLUMNS)
      .order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data as unknown as Flow[]
  },

  async getFlow(id: string): Promise<Flow> {
    const { data, error } = await supabase.from('flows').select(FLOW_COLUMNS).eq('id', id).single()
    if (error) throw new Error(error.message)
    return data as unknown as Flow
  },

  async createFlow(input: { name: string; steps?: Flow['steps'] }): Promise<Flow> {
    const { data, error } = await supabase
      .from('flows')
      .insert({ name: input.name, steps: input.steps ?? [] })
      .select(FLOW_COLUMNS)
      .single()
    if (error) throw new Error(error.message)
    return data as unknown as Flow
  },

  async updateFlow(
    id: string,
    input: { name?: string; steps?: Flow['steps']; published?: boolean },
  ): Promise<Flow> {
    const { data, error } = await supabase
      .from('flows')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(FLOW_COLUMNS)
      .single()
    if (error) throw new Error(error.message)
    return data as unknown as Flow
  },

  async deleteFlow(id: string): Promise<null> {
    const { error } = await supabase.from('flows').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return null
  },
}
