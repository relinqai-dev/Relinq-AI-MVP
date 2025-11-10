/**
 * Purchase Orders API Route
 * Handles PO generation and retrieval
 * Requirements: 5.2, 5.4
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { poGenerationService } from '@/lib/services/po-generation-service'
import { purchaseOrdersRepository } from '@/lib/database/purchase-orders-repository'

/**
 * POST /api/purchase-orders
 * Generate a new purchase order
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { supplier_id, items } = body

    if (!supplier_id || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request. supplier_id and items array are required.' 
        },
        { status: 400 }
      )
    }

    // Generate purchase order
    const result = await poGenerationService.generatePurchaseOrder(user.id, {
      supplier_id,
      items
    })

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          validation_errors: result.validation_errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        purchase_order: result.purchase_order,
        pdf_base64: result.pdf_base64
      }
    })
  } catch (error) {
    console.error('Error in POST /api/purchase-orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/purchase-orders
 * Get all purchase orders for the user
 */
export async function GET(request: NextRequest) {
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

    // Check if requesting a specific PO
    const { searchParams } = new URL(request.url)
    const poId = searchParams.get('id')

    if (poId) {
      // Get specific PO with items
      const po = await poGenerationService.getPurchaseOrderWithItems(user.id, poId)
      
      if (!po) {
        return NextResponse.json(
          { success: false, error: 'Purchase order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: po
      })
    }

    // Get all POs
    const orders = await purchaseOrdersRepository.getPurchaseOrders(user.id)

    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('Error in GET /api/purchase-orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
