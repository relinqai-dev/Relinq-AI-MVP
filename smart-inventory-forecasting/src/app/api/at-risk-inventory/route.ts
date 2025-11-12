import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FORECASTING ENGINE (Mathematician) - Works with BOTH data sources:
    // 1. CSV Upload: Data stored in Supabase after upload
    // 2. API Integration: Data fetched from POS and stored in Supabase
    
    // Fetch inventory and sales data from Supabase (regardless of source)
    const { data: inventoryData } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id);

    const { data: salesData } = await supabase
      .from('sales_data')
      .select('*')
      .eq('user_id', user.id)
      .gte('sale_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Check if we have data (from either CSV upload or API)
    if (!inventoryData || inventoryData.length === 0) {
      // No data yet - user needs to upload CSV or connect POS
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'No inventory data found. Please upload CSV or connect your POS system.'
      });
    }

    // Calculate at-risk items using forecasting algorithm
    // TODO: Implement actual time-series forecasting
    // For now, use simple velocity-based calculation
    interface InventoryItem {
      id: string;
      sku: string;
      name: string;
      current_stock: number;
    }
    
    interface SaleData {
      sku: string;
      quantity: number;
    }
    
    const atRiskItems = inventoryData
      .map((item: InventoryItem) => {
        // Calculate sales velocity from sales data
        const itemSales = salesData?.filter((sale: SaleData) => sale.sku === item.sku) || [];
        const totalSold = itemSales.reduce((sum: number, sale: SaleData) => sum + (sale.quantity || 0), 0);
        const daysOfData = 30;
        const salesVelocity = totalSold / daysOfData;
        
        // Calculate days until stockout
        const daysUntilStockout = salesVelocity > 0 ? Math.floor(item.current_stock / salesVelocity) : 999;
        
        // Only include items at risk (< 7 days until stockout)
        if (daysUntilStockout < 7 && daysUntilStockout > 0) {
          // Calculate recommended order quantity (2 weeks of supply)
          const recommendedQty = Math.ceil(salesVelocity * 14);
          
          return {
            id: item.id,
            sku: item.sku,
            itemName: item.name,
            currentStock: item.current_stock,
            salesVelocity: parseFloat(salesVelocity.toFixed(1)),
            forecastedStockoutDate: `${daysUntilStockout} days`,
            recommendedQty,
            confidence: 0.85, // TODO: Calculate actual confidence
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        // Sort by urgency (days until stockout)
        const aDays = parseInt(a.forecastedStockoutDate);
        const bDays = parseInt(b.forecastedStockoutDate);
        return aDays - bDays;
      })
      .slice(0, 10); // Top 10 at-risk items

    return NextResponse.json({ success: true, data: atRiskItems });
  } catch (error) {
    console.error('Error fetching at-risk inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch at-risk inventory' },
      { status: 500 }
    );
  }
}
