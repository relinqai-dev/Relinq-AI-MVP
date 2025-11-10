/**
 * Purchase Orders Repository
 * Handles database operations for purchase orders and line items
 * Requirements: 5.2, 5.4
 */

import { createClient } from '@/lib/supabase/server'
import { 
  PurchaseOrder, 
  PurchaseOrderItem,
  CreatePurchaseOrder,
  CreatePurchaseOrderItem,
  UpdatePurchaseOrder
} from '@/types/database'

export class PurchaseOrdersRepository {
  /**
   * Create a new purchase order
   * Requirement 5.2: Create clean, professional PO documents
   */
  async createPurchaseOrder(
    userId: string, 
    data: CreatePurchaseOrder
  ): Promise<PurchaseOrder | null> {
    try {
      const supabase = await createClient()
      
      const { data: po, error } = await supabase
        .from('purchase_orders')
        .insert({
          user_id: userId,
          ...data
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating purchase order:', error)
        return null
      }

      return po
    } catch (error) {
      console.error('Error creating purchase order:', error)
      return null
    }
  }

  /**
   * Add line items to a purchase order
   * Requirement 5.4: Include item details, quantities, and supplier information
   */
  async addPurchaseOrderItems(
    items: CreatePurchaseOrderItem[]
  ): Promise<PurchaseOrderItem[]> {
    try {
      const supabase = await createClient()
      
      const { data: poItems, error } = await supabase
        .from('purchase_order_items')
        .insert(items)
        .select()

      if (error) {
        console.error('Error adding purchase order items:', error)
        return []
      }

      return poItems || []
    } catch (error) {
      console.error('Error adding purchase order items:', error)
      return []
    }
  }

  /**
   * Get purchase order by ID with items
   */
  async getPurchaseOrderById(
    userId: string, 
    poId: string
  ): Promise<PurchaseOrder | null> {
    try {
      const supabase = await createClient()
      
      const { data: po, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', poId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error getting purchase order:', error)
        return null
      }

      return po
    } catch (error) {
      console.error('Error getting purchase order:', error)
      return null
    }
  }

  /**
   * Get purchase order items
   */
  async getPurchaseOrderItems(poId: string): Promise<PurchaseOrderItem[]> {
    try {
      const supabase = await createClient()
      
      const { data: items, error } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', poId)

      if (error) {
        console.error('Error getting purchase order items:', error)
        return []
      }

      return items || []
    } catch (error) {
      console.error('Error getting purchase order items:', error)
      return []
    }
  }

  /**
   * Get all purchase orders for a user
   */
  async getPurchaseOrders(userId: string): Promise<PurchaseOrder[]> {
    try {
      const supabase = await createClient()
      
      const { data: orders, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting purchase orders:', error)
        return []
      }

      return orders || []
    } catch (error) {
      console.error('Error getting purchase orders:', error)
      return []
    }
  }

  /**
   * Update purchase order status
   */
  async updatePurchaseOrder(
    userId: string,
    poId: string,
    updates: UpdatePurchaseOrder
  ): Promise<PurchaseOrder | null> {
    try {
      const supabase = await createClient()
      
      const { data: po, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', poId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating purchase order:', error)
        return null
      }

      return po
    } catch (error) {
      console.error('Error updating purchase order:', error)
      return null
    }
  }

  /**
   * Generate next PO number for user
   * Format: PO-YYYYMMDD-XXX
   */
  async generatePONumber(userId: string): Promise<string> {
    try {
      const supabase = await createClient()
      
      // Get today's date in YYYYMMDD format
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      
      // Get count of POs created today
      const { data: orders, error } = await supabase
        .from('purchase_orders')
        .select('po_number')
        .eq('user_id', userId)
        .like('po_number', `PO-${today}-%`)

      if (error) {
        console.error('Error getting PO count:', error)
      }

      const count = (orders?.length || 0) + 1
      const sequence = count.toString().padStart(3, '0')
      
      return `PO-${today}-${sequence}`
    } catch (error) {
      console.error('Error generating PO number:', error)
      // Fallback to timestamp-based number
      return `PO-${Date.now()}`
    }
  }

  /**
   * Delete purchase order (and cascade delete items)
   */
  async deletePurchaseOrder(userId: string, poId: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', poId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting purchase order:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting purchase order:', error)
      return false
    }
  }
}

// Singleton instance
export const purchaseOrdersRepository = new PurchaseOrdersRepository()
