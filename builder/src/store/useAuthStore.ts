import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  status: 'loading' | 'signed-in' | 'signed-out'
  init: () => void
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

let initialized = false

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: 'loading',

  init: () => {
    if (initialized) return
    initialized = true

    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, status: data.session ? 'signed-in' : 'signed-out' })
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, status: session ? 'signed-in' : 'signed-out' })
    })
  },

  signInWithPassword: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
  },
}))
