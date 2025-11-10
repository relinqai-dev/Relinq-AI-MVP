// API route for merging duplicate inventory items
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
    const { primaryItemId, itemsToMerge, mergedData } = body;

    if (!primaryItemId || !itemsToMerge || !Array.isArray(itemsToMerge) || !mergedData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const inventoryRepo = new InventoryRepository();

    // Get the primary item
    const primaryItemResult = await inventoryRepo.findById(primaryItemId, (user as User).id);
    if (!primaryItemResult.success || !primaryItemResult.data) {
      return NextResponse.json(
        { success: false, error: 'Primary item not found' },
        { status: 404 }
      );
    }

    // Get items to merge
    const itemsToMergeData = [];
    for (const itemId of itemsToMerge) {
      const itemResult = await inventoryRepo.findById(itemId, (user as User).id);
      if (itemResult.success && itemResult.data) {
        itemsToMergeData.push(itemResult.data);
      }
    }

    // Calculate total stock from all items
    const totalStock = itemsToMergeData.reduce((sum, item) => sum + item.current_stock, 0) + 
                      primaryItemResult.data.current_stock;

    // Update the primary item with merged data
    const updateResult = await inventoryRepo.update(primaryItemId, {
      ...mergedData,
      current_stock: totalStock
    }, (user as User).id);

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update primary item' },
        { status: 500 }
      );
    }

    // Delete the items that were merged
    for (const itemId of itemsToMerge) {
      await inventoryRepo.delete(itemId, (user as User).id);
    }

    return NextResponse.json({
      success: true,
      data: updateResult.data,
      message: `Successfully merged ${itemsToMerge.length} items`
    });

  } catch (error) {
    console.error('Merge duplicates API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}