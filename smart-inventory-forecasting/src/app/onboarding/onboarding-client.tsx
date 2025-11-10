'use client'

import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

interface OnboardingClientProps {
  user: User
}

export function OnboardingClient({ }: OnboardingClientProps) {
  const router = useRouter()

  const handleOnboardingComplete = () => {
    // Redirect to dashboard after successful onboarding
    router.push('/dashboard')
  }

  return (
    <OnboardingWizard onComplete={handleOnboardingComplete} />
  )
}