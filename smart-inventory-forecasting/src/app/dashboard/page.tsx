import { requireAuth } from '@/lib/auth-guard'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const user = await requireAuth()

  // Type assertion needed due to auth-guard returning simplified user type
  return <DashboardClient user={user as import('@supabase/supabase-js').User} />
}