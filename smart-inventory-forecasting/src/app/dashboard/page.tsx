import { requireAuth } from '@/lib/auth-guard'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  await requireAuth()

  return <DashboardClient />
}