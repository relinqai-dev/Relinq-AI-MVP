'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: { message: string } }>
  signUp: (email: string, password: string, metadata?: { store_name: string; onboarding_completed: boolean }) => Promise<{ error?: { message: string } }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Login error:', error)
        return { error: { message: error.message } }
      }
      
      console.log('Login successful:', data)
      return { error: undefined }
    } catch (err) {
      console.error('Login exception:', err)
      return { error: { message: err instanceof Error ? err.message : 'Login failed' } }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error: error ? { message: error.message } : undefined }
  }

  const signUp = async (
    email: string,
    password: string,
    metadata?: { store_name: string; onboarding_completed: boolean }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error('Signup error:', error)
        return { error: { message: error.message } }
      }
      
      console.log('Signup successful:', data)
      return { error: undefined }
    } catch (err) {
      console.error('Signup exception:', err)
      return { error: { message: err instanceof Error ? err.message : 'Signup failed' } }
    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword,
    signUp,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}