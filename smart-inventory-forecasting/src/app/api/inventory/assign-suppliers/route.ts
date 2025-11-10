// API route for assigning suppliers to inventory items
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InventoryRepository } from '@/lib/database/inventory-repository';
import type { User } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assignments } = body;

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { success: false, error: 'Assignments array is required' },
        { status: 400 }
      );
    }

    const inventoryRepo = new InventoryRepository();
    const results = [];
    const errors = [];

    // Process each assignment
    for (const assignment of assignments) {
      const { itemId, supplierId } = assignment;
      
      if (!itemId || !supplierId) {
        errors.push(`Invalid assignment: missing itemId or supplierId`);
        continue;
      }

      try {
        const updateResult = await inventoryRepo.update(itemId, {
          supplier_id: supplierId
        }, (user as User).id);

        if (updateResult.success) {
          results.push({
            itemId,
            supplierId,
            success: true
          });
        } else {
          errors.push(`Failed to assign supplier to item ${itemId}: ${updateResult.error}`);
        }
      } catch (error) {
        errors.push(`Error assigning supplier to item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    if (successCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No assignments were successful', errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        successCount,
        errorCount,
        results,
        errors: errorCount > 0 ? errors : undefined
      },
      message: `Successfully assigned suppliers to ${successCount} items${errorCount > 0 ? ` (${errorCount} errors)` : ''}`
    });

  } catch (error) {
    console.error('Assign suppliers API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}