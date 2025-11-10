/**
 * Supplier API
 * Handles supplier CRUD operations
 * Requirement 5.6: Build supplier contact management and validation system
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suppliersRepository } from '@/lib/database/suppliers-repository'

/**
 * GET /api/suppliers/[id]
 * Get supplier by ID
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

    const supplier = await suppliersRepository.getSupplierById(user.id, id)

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    console.error('Error getting supplier:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get supplier'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/suppliers/[id]
 * Update supplier information
 * Requirement 5.6: Build supplier contact management and validation system
 */
export async function PATCH(
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

    const body = await request.json()
    const { contact_email, contact_phone, address, name, lead_time_days } = body

    // Build update object
    const updates: Record<string, unknown> = {}
    if (contact_email !== undefined) updates.contact_email = contact_email
    if (contact_phone !== undefined) updates.contact_phone = contact_phone
    if (address !== undefined) updates.address = address
    if (name !== undefined) updates.name = name
    if (lead_time_days !== undefined) updates.lead_time_days = lead_time_days

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update supplier
    const { data: updatedSupplier, error: updateError } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !updatedSupplier) {
      return NextResponse.json(
        { success: false, error: 'Failed to update supplier' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedSupplier,
      message: 'Supplier updated successfully'
    })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update supplier'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/suppliers/[id]
 * Delete supplier
 */
export async function DELETE(
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

    const { error: deleteError } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete supplier' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete supplier'
      },
      { status: 500 }
    )
  }
}
