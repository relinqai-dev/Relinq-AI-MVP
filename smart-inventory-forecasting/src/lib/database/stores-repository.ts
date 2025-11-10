// Store repository with CRUD operations
import { BaseRepository } from './base-repository';
import { Store, CreateStore, UpdateStore, ApiResponse } from '@/types';

export class StoresRepository extends BaseRepository<Store, CreateStore, UpdateStore> {
  protected tableName = 'stores';

  async findByUserId(userId: string): Promise<ApiResponse<Store>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
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

  async createOrUpdate(data: CreateStore, userId: string): Promise<ApiResponse<Store>> {
    try {
      // Check if store already exists for user
      const existingStore = await this.findByUserId(userId);
      
      if (existingStore.success && existingStore.data) {
        // Update existing store
        return this.update(existingStore.data.id, data, userId);
      } else {
        // Create new store
        return this.create(data, userId);
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}