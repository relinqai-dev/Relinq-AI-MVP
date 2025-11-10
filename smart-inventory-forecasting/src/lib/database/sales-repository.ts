// Sales data repository with CRUD operations
import { BaseRepository } from './base-repository';
import { SalesData, CreateSalesData, ApiResponse, SalesDataFilters } from '@/types';

export class SalesRepository extends BaseRepository<SalesData, CreateSalesData, never> {
  protected tableName = 'sales_data';

  async findBySku(
    sku: string, 
    userId: string, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<ApiResponse<SalesData[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('sku', sku);

      if (dateFrom) {
        query = query.gte('sale_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('sale_date', dateTo);
      }

      const { data, error } = await query.order('sale_date', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async findWithFilters(
    userId: string, 
    filters: SalesDataFilters = {},
    page: number = 1, 
    limit: number = 50
  ): Promise<ApiResponse<{ data: SalesData[]; total: number; page: number; limit: number; has_more: boolean }>> {
    try {
      const offset = (page - 1) * limit;
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.sku) {
        query = query.eq('sku', filters.sku);
      }

      if (filters.date_from) {
        query = query.gte('sale_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('sale_date', filters.date_to);
      }

      if (filters.min_quantity) {
        query = query.gte('quantity_sold', filters.min_quantity);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('sale_date', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const result = {
        data: data || [],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit
      };

      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getTopSellingItems(
    userId: string, 
    days: number = 30, 
    limit: number = 10
  ): Promise<ApiResponse<Array<{
    sku: string;
    item_name: string;
    total_quantity: number;
    total_revenue: number;
  }>>> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('sku, item_name, quantity_sold, unit_price')
        .eq('user_id', userId)
        .gte('sale_date', dateFrom.toISOString().split('T')[0]);

      if (error) {
        return { success: false, error: error.message };
      }

      // Aggregate data by SKU
      const aggregated = (data || []).reduce((acc: Record<string, { sku: string; item_name: string; total_quantity: number; total_revenue: number }>, sale: { sku: string; item_name?: string; quantity_sold: number; unit_price?: number }) => {
        const key = sale.sku;
        if (!acc[key]) {
          acc[key] = {
            sku: sale.sku,
            item_name: sale.item_name || sale.sku,
            total_quantity: 0,
            total_revenue: 0
          };
        }
        acc[key].total_quantity += sale.quantity_sold;
        acc[key].total_revenue += (sale.unit_price || 0) * sale.quantity_sold;
        return acc;
      }, {} as Record<string, { sku: string; item_name: string; total_quantity: number; total_revenue: number }>);

      const result = (Object.values(aggregated) as { sku: string; item_name: string; total_quantity: number; total_revenue: number }[])
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, limit);

      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async bulkCreate(salesData: CreateSalesData[], userId: string): Promise<ApiResponse<SalesData[]>> {
    try {
      const salesWithUserId = salesData.map(sale => ({ ...sale, user_id: userId }));
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(salesWithUserId)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getSalesMetrics(userId: string, days: number = 30): Promise<ApiResponse<{
    total_sales: number;
    total_revenue: number;
    average_order_value: number;
    unique_items_sold: number;
  }>> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('quantity_sold, unit_price, sku')
        .eq('user_id', userId)
        .gte('sale_date', dateFrom.toISOString().split('T')[0]);

      if (error) {
        return { success: false, error: error.message };
      }

      const sales = data || [];
      const total_sales = sales.reduce((sum: number, sale: { quantity_sold: number }) => sum + sale.quantity_sold, 0);
      const total_revenue = sales.reduce((sum: number, sale: { unit_price?: number; quantity_sold: number }) => sum + ((sale.unit_price || 0) * sale.quantity_sold), 0);
      const unique_items_sold = new Set(sales.map((sale: { sku: string }) => sale.sku)).size;
      const average_order_value = sales.length > 0 ? total_revenue / sales.length : 0;

      return {
        success: true,
        data: {
          total_sales,
          total_revenue,
          average_order_value,
          unique_items_sold
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Method needed by AI recommendations API
  async getSalesDataForItem(userId: string, sku: string, days: number = 30): Promise<SalesData[]> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('sku', sku)
        .gte('sale_date', dateFrom.toISOString().split('T')[0])
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('Error getting sales data for item:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSalesDataForItem:', error);
      return [];
    }
  }
}

// Singleton instance
export const salesRepository = new SalesRepository();