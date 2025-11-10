/**
 * Reorder List API Route
 * Provides reorder recommendations grouped by supplier
 * Requirements: 5.1, 5.6
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reorderService } from '@/lib/services/reorder-service'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get reorder list grouped by supplier
    const reorderList = await reorderService.getReorderListBySupplier(user.id)

    return NextResponse.json({
      success: true,
      data: reorderList
    })
  } catch (error) {
    console.error('Error in reorder list API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch reorder list' 
      },
      { status: 500 }
    )
  }
}
