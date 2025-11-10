/**
 * API route for sales metrics
 * Provides real-time sales statistics for dashboard
 * Requirements: 4.5 - Business impact prioritization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SalesMetrics } from '@/types/business'

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

    // Mock data for now - in real implementation, this would query the database
    const mockMetrics: SalesMetrics = {
      total_sales_7_days: 12450.75,
      total_sales_30_days: 48920.30,
      top_selling_items: [
        {
          sku: 'WIDGET-001',
          name: 'Premium Widget',
          quantity_sold: 45,
          revenue: 2250.00
        },
        {
          sku: 'GADGET-002',
          name: 'Smart Gadget Pro',
          quantity_sold: 32,
          revenue: 1920.00
        },
        {
          sku: 'TOOL-003',
          name: 'Multi-Tool Deluxe',
          quantity_sold: 28,
          revenue: 1680.00
        }
      ],
      sales_trend: 'increasing'
    }

    // In a real implementation, you would query like this:
    /*
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get 7-day sales
    const { data: sales7Days, error: sales7Error } = await supabase
      .from('sales_data')
      .select('quantity_sold, unit_price')
      .eq('user_id', user.id)
      .gte('sale_date', sevenDaysAgo.toISOString().split('T')[0])

    // Get 30-day sales
    const { data: sales30Days, error: sales30Error } = await supabase
      .from('sales_data')
      .select('quantity_sold, unit_price')
      .eq('user_id', user.id)
      .gte('sale_date', thirtyDaysAgo.toISOString().split('T')[0])

    // Get top selling items
    const { data: topItems, error: topItemsError } = await supabase
      .from('sales_data')
      .select('sku, quantity_sold, unit_price, inventory_items(name)')
      .eq('user_id', user.id)
      .gte('sale_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('quantity_sold', { ascending: false })
      .limit(5)

    if (sales7Error || sales30Error || topItemsError) {
      throw new Error('Database query failed')
    }

    const total7Days = sales7Days?.reduce((sum, sale) => 
      sum + (sale.quantity_sold * sale.unit_price), 0) || 0
    
    const total30Days = sales30Days?.reduce((sum, sale) => 
      sum + (sale.quantity_sold * sale.unit_price), 0) || 0

    const metrics: SalesMetrics = {
      total_sales_7_days: total7Days,
      total_sales_30_days: total30Days,
      top_selling_items: topItems?.map(item => ({
        sku: item.sku,
        name: item.inventory_items?.name || 'Unknown',
        quantity_sold: item.quantity_sold,
        revenue: item.quantity_sold * item.unit_price
      })) || [],
      sales_trend: total7Days > (total30Days / 4) ? 'increasing' : 'decreasing'
    }
    */

    return NextResponse.json({
      success: true,
      data: mockMetrics
    })

  } catch (error) {
    console.error('Error fetching sales metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sales metrics' 
      },
      { status: 500 }
    )
  }
}