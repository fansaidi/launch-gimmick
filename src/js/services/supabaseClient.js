import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

// The player mostly runs as an anonymous viewer (an event attendee has no
// account), so it doesn't need session persistence the way the builder
// does - a fresh client per page load is fine.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null

// Row Level Security decides what's actually visible: the signed-in owner
// (same-origin session shared with the builder, e.g. when using Preview)
// sees their own flow regardless of `published`; everyone else only sees
// it if `published = true`. See db/src/db/schema.ts.
export async function fetchFlow(flowId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('flows')
    .select('id, name, steps')
    .eq('id', flowId)
    .single()
  if (error) return null
  return data
}
