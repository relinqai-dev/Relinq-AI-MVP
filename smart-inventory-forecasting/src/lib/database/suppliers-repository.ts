// Suppliers repository with CRUD operations
import { BaseRepository } from './base-repository';
import { Supplier, CreateSupplier, UpdateSupplier, ApiResponse } from '@/types';

export class SuppliersRepository extends BaseRepository<Supplier, CreateSupplier, UpdateSupplier> {
  protected tableName = 'suppliers';

  async findByName(name: string, userId: string): Promise<ApiResponse<Supplier[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${name}%`);

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

  async validateForPurchaseOrder(supplierId: string, userId: string): Promise<ApiResponse<{
    valid: boolean;
    missing_fields: string[];
    supplier: Supplier | null;
  }>> {
    try {
      const supplierResult = await this.findById(supplierId, userId);
      
      if (!supplierResult.success || !supplierResult.data) {
        return { 
          success: true, 
          data: { 
            valid: false, 
            missing_fields: ['supplier_not_found'], 
            supplier: null 
          } 
        };
      }

      const supplier = supplierResult.data;
      const missing_fields: string[] = [];

      if (!supplier.contact_email) missing_fields.push('contact_email');
      if (!supplier.name) missing_fields.push('name');

      return {
        success: true,
        data: {
          valid: missing_fields.length === 0,
          missing_fields,
          supplier
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Methods needed by AI recommendations API
  async getAllSuppliers(userId: string): Promise<Supplier[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        console.error('Error getting all suppliers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSuppliers:', error);
      return [];
    }
  }

  async getSupplierById(userId: string, supplierId: string): Promise<Supplier | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('id', supplierId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting supplier by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSupplierById:', error);
      return null;
    }
  }
}

// Singleton instance
export const suppliersRepository = new SuppliersRepository();