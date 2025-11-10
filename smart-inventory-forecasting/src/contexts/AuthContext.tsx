/**
 * Mock Auth Context for Testing
 */

'use client'

import React, { createContext, useContext } from 'react'

interface User {
  id: string
  email: string
}

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
  const value: AuthContextValue = {
    user: null,
    loading: false,
    signIn: async () => ({ error: undefined }),
    signOut: async () => {},
    resetPassword: async () => ({ error: undefined }),
    signUp: async () => ({ error: undefined })
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}