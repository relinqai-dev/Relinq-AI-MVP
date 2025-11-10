// Inventory items repository with CRUD operations
import { BaseRepository } from './base-repository';
import { InventoryItem, CreateInventoryItem, UpdateInventoryItem, ApiResponse, InventoryFilters } from '@/types';

export class InventoryRepository extends BaseRepository<InventoryItem, CreateInventoryItem, UpdateInventoryItem> {
  protected tableName = 'inventory_items';

  async findBySku(sku: string, userId: string): Promise<ApiResponse<InventoryItem>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('sku', sku)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async findWithFilters(
    userId: string, 
    filters: InventoryFilters = {},
    page: number = 1, 
    limit: number = 50
  ): Promise<ApiResponse<{ data: InventoryItem[]; total: number; page: number; limit: number; has_more: boolean }>> {
    try {
      const offset = (page - 1) * limit;
      let query = this.supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers:supplier_id (
            id,
            name,
            contact_email,
            lead_time_days
          )
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters.low_stock_only) {
        query = query.lte('current_stock', 10); // Configurable threshold
      }

      if (filters.out_of_stock_only) {
        query = query.eq('current_stock', 0);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

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

  async getLowStockItems(userId: string, threshold: number = 10): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          suppliers:supplier_id (
            id,
            name,
            contact_email,
            lead_time_days
          )
        `)
        .eq('user_id', userId)
        .lte('current_stock', threshold)
        .order('current_stock', { ascending: true });

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

  async updateStock(sku: string, newStock: number, userId: string): Promise<ApiResponse<InventoryItem>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({ current_stock: newStock })
        .eq('sku', sku)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async bulkCreate(items: CreateInventoryItem[], userId: string): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const itemsWithUserId = items.map(item => ({ ...item, user_id: userId }));
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(itemsWithUserId)
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

  // Methods needed by AI recommendations API
  async getItemsBySKUs(userId: string, skus: string[]): Promise<InventoryItem[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .in('sku', skus);

      if (error) {
        console.error('Error getting items by SKUs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getItemsBySKUs:', error);
      return [];
    }
  }

  async getItemBySKU(userId: string, sku: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('sku', sku)
        .single();

      if (error) {
        if ('code' in error && error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting item by SKU:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getItemBySKU:', error);
      return null;
    }
  }
}

// Singleton instance
export const inventoryRepository = new InventoryRepository();