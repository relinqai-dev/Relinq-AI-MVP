import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingClient } from './onboarding-client'
import type { User } from '@supabase/supabase-js'

export default async function OnboardingPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', (user as User).id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  // Type assertion needed due to auth-guard returning simplified user type
  return <OnboardingClient user={user as import('@supabase/supabase-js').User} />
}