/**
 * Reorder List Page
 * Displays reorder recommendations grouped by supplier
 * Requirements: 5.1, 5.6
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReorderListDashboard } from '@/components/reorder'

export default async function ReorderPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <ReorderListDashboard />
      </main>
    </div>
  )
}
