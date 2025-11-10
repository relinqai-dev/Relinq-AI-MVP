/**
 * Purchase Order PDF API Route
 * Handles PDF regeneration for existing POs
 * Requirements: 5.2
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { poGenerationService } from '@/lib/services/po-generation-service'

/**
 * GET /api/purchase-orders/[id]/pdf
 * Regenerate PDF for an existing purchase order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Regenerate PDF
    const pdfBase64 = await poGenerationService.regeneratePDF(user.id, id)

    if (!pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate PDF or purchase order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        pdf_base64: pdfBase64
      }
    })
  } catch (error) {
    console.error('Error in GET /api/purchase-orders/[id]/pdf:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
