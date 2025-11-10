import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/auth/login')
    }
    
    return user
  } catch {
    redirect('/auth/login')
  }
}

export async function redirectIfAuthenticated() {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      redirect('/dashboard')
    }
  } catch {
    // User not authenticated, continue
  }
}