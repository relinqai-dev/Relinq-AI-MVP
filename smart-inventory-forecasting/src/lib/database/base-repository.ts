// Base repository class with common CRUD operations
import { createClient } from '@/lib/supabase/client';
import { ApiResponse, PaginatedResponse } from '@/types';

export abstract class BaseRepository<T, CreateT, UpdateT> {
  protected supabase = createClient();
  protected abstract tableName: string;

  async findById(id: string, userId: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
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

  async findAll(
    userId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const result: PaginatedResponse<T> = {
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

  async create(data: CreateT, userId: string): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async update(id: string, data: UpdateT, userId: string): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async delete(id: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async deleteMany(ids: string[], userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .in('id', ids)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async count(userId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}