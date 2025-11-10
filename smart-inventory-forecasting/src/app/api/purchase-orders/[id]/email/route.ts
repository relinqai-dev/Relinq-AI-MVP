/**
 * Purchase Order Email API
 * Handles email template generation and mailto link creation
 * Requirements: 5.3, 5.5
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { poGenerationService } from '@/lib/services/po-generation-service'
import { emailTemplateService } from '@/lib/services/email-template-service'
import { suppliersRepository } from '@/lib/database/suppliers-repository'

/**
 * GET /api/purchase-orders/[id]/email
 * Get email template and mailto link for a purchase order
 * Requirement 5.3: Create pre-written email drafts with supplier contact information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const poId = id

    // Get purchase order with items
    const purchaseOrder = await poGenerationService.getPurchaseOrderWithItems(
      user.id,
      poId
    )

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    // Get supplier details
    const supplier = await suppliersRepository.getSupplierById(
      user.id,
      purchaseOrder.supplier_id
    )

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Validate supplier has email - Requirement 5.6
    const validation = emailTemplateService.validateSupplierForEmail(supplier)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supplier missing required contact information',
          missing_fields: validation.missingFields
        },
        { status: 400 }
      )
    }

    // Generate email template
    const emailTemplate = emailTemplateService.generatePurchaseOrderEmail(
      purchaseOrder,
      supplier
    )

    // Generate mailto link - Requirement 5.5
    const mailtoLink = emailTemplateService.generateMailtoLink(emailTemplate, true)

    // Generate preview HTML
    const previewHTML = emailTemplateService.generateEmailPreviewHTML(emailTemplate)

    return NextResponse.json({
      success: true,
      data: {
        email: emailTemplate,
        mailto_link: mailtoLink,
        preview_html: previewHTML,
        supplier: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.contact_email
        }
      }
    })
  } catch (error) {
    console.error('Error generating email template:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate email template'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/purchase-orders/[id]/email
 * Mark purchase order as sent and update sent_at timestamp
 * Requirement: Add tracking for sent purchase orders
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const poId = id

    // Update purchase order status to 'sent' and set sent_at timestamp
    const { data: updatedPO, error: updateError } = await supabase
      .from('purchase_orders')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', poId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !updatedPO) {
      return NextResponse.json(
        { success: false, error: 'Failed to update purchase order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPO.id,
        status: updatedPO.status,
        sent_at: updatedPO.sent_at
      },
      message: 'Purchase order marked as sent'
    })
  } catch (error) {
    console.error('Error marking purchase order as sent:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark purchase order as sent'
      },
      { status: 500 }
    )
  }
}
