import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Načti aktuální session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setState((s) => ({ ...s, loading: false }))
      }
    })

    // Poslouchej změny auth stavu
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchProfile(session.user)
        } else {
          setState({ user: null, profile: null, loading: false, error: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(user: User) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      setState({ user, profile: null, loading: false, error: error.message })
    } else {
      setState({ user, profile: data as Profile, loading: false, error: null })
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setState((s) => ({ ...s, error: error.message }))
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) setState((s) => ({ ...s, error: error.message }))
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!state.user,
  }
}
