import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

// Falls back to a placeholder so createClient doesn't throw when Supabase
// hasn't been configured yet - callers should check isSupabaseConfigured
// (see RequireAuth) before relying on auth/session state.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key',
  {
    auth: {
      // Confirmation/magic-link redirects land with the session in the URL.
      // The implicit flow puts it in a #hash fragment, which HashRouter
      // (see main.tsx) also owns for routing - the two collide. PKCE uses
      // a ?code= query param instead, which HashRouter never touches.
      flowType: 'pkce',
    },
  },
)
