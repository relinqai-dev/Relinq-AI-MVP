/**
 * Reorder Service
 * Handles aggregation of reorder recommendations grouped by supplier
 * Requirements: 5.1, 5.6
 */

import { inventoryRepository } from '@/lib/database/inventory-repository'
import { suppliersRepository } from '@/lib/database/suppliers-repository'
import { forecastsRepository } from '@/lib/database/forecasts-repository'
import { ReorderRecommendation, ReorderListBySupplier } from '@/types/business'
import { InventoryItem, Supplier, Forecast } from '@/types/database'

export class ReorderService {
  /**
   * Get reorder recommendations grouped by supplier
   * Requirement 5.1: Group items by assigned supplier
   */
  async getReorderListBySupplier(userId: string): Promise<ReorderListBySupplier[]> {
    try {
      // Get latest forecasts
      const forecasts = await forecastsRepository.getLatestForecasts(userId)
      
      if (forecasts.length === 0) {
        return []
      }

      // Get inventory items for forecasted SKUs
      const skus = forecasts.map(f => f.sku)
      const inventoryItems = await inventoryRepository.getItemsBySKUs(userId, skus)
      
      // Create a map for quick lookup
      const inventoryMap = new Map<string, InventoryItem>()
      inventoryItems.forEach(item => inventoryMap.set(item.sku, item))

      // Filter forecasts that need reordering
      const reorderForecasts = forecasts.filter(forecast => {
        const item = inventoryMap.get(forecast.sku)
        if (!item) return false
        
        // Need reorder if recommended_order > 0 or current stock is low
        return (forecast.recommended_order && forecast.recommended_order > 0) || 
               item.current_stock < forecast.forecast_quantity
      })

      // Group by supplier
      const supplierGroups = new Map<string, ReorderRecommendation[]>()
      const unassignedItems: ReorderRecommendation[] = []

      for (const forecast of reorderForecasts) {
        const item = inventoryMap.get(forecast.sku)
        if (!item) continue

        const recommendation: ReorderRecommendation = {
          sku: item.sku,
          item_name: item.name,
          current_stock: item.current_stock,
          recommended_quantity: forecast.recommended_order || 
            Math.max(0, forecast.forecast_quantity - item.current_stock),
          supplier_id: item.supplier_id,
          urgency: this.calculateUrgency(item, forecast),
          reasoning: this.generateReasoning(item, forecast)
        }

        if (item.supplier_id) {
          const existing = supplierGroups.get(item.supplier_id) || []
          existing.push(recommendation)
          supplierGroups.set(item.supplier_id, existing)
        } else {
          unassignedItems.push(recommendation)
        }
      }

      // Get supplier details and build result
      const result: ReorderListBySupplier[] = []

      // Process assigned suppliers
      for (const [supplierId, items] of supplierGroups.entries()) {
        const supplier = await suppliersRepository.getSupplierById(userId, supplierId)
        
        if (supplier) {
          // Validate supplier information - Requirement 5.6
          const validation = await this.validateSupplierForPO(supplier)
          
          // Add supplier name to items
          const itemsWithSupplier = items.map(item => ({
            ...item,
            supplier_name: supplier.name
          }))

          result.push({
            supplier_id: supplierId,
            supplier_name: supplier.name,
            supplier_email: supplier.contact_email,
            items: itemsWithSupplier,
            total_items: items.length,
            can_generate_po: validation.can_generate_po,
            missing_supplier_fields: validation.missing_fields
          })
        }
      }

      // Add unassigned items group if any
      if (unassignedItems.length > 0) {
        result.push({
          supplier_id: 'unassigned',
          supplier_name: 'Unassigned Supplier',
          supplier_email: undefined,
          items: unassignedItems,
          total_items: unassignedItems.length,
          can_generate_po: false,
          missing_supplier_fields: ['supplier_not_assigned']
        })
      }

      // Sort by urgency (most urgent first)
      result.forEach(group => {
        group.items.sort((a, b) => {
          const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        })
      })

      // Sort groups by total urgency
      result.sort((a, b) => {
        const getGroupUrgency = (group: ReorderListBySupplier) => {
          const urgentCount = group.items.filter(i => i.urgency === 'urgent').length
          const highCount = group.items.filter(i => i.urgency === 'high').length
          return urgentCount * 100 + highCount * 10 + group.items.length
        }
        return getGroupUrgency(b) - getGroupUrgency(a)
      })

      return result
    } catch (error) {
      console.error('Error getting reorder list by supplier:', error)
      return []
    }
  }

  /**
   * Validate supplier information for PO generation
   * Requirement 5.6: Check supplier information completeness
   */
  private async validateSupplierForPO(supplier: Supplier): Promise<{
    can_generate_po: boolean
    missing_fields: string[]
  }> {
    const missing_fields: string[] = []

    if (!supplier.name) missing_fields.push('name')
    if (!supplier.contact_email) missing_fields.push('contact_email')

    return {
      can_generate_po: missing_fields.length === 0,
      missing_fields
    }
  }

  /**
   * Calculate urgency based on stock levels and forecast
   */
  private calculateUrgency(
    item: InventoryItem, 
    forecast: Forecast
  ): 'urgent' | 'high' | 'medium' | 'low' {
    const dailyDemand = forecast.forecast_quantity / 7
    const daysOfStock = dailyDemand > 0 ? item.current_stock / dailyDemand : 999
    const leadTime = item.lead_time_days || 7

    if (daysOfStock <= 2 || item.current_stock === 0) {
      return 'urgent'
    } else if (daysOfStock <= leadTime) {
      return 'high'
    } else if (daysOfStock <= leadTime * 1.5) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * Generate human-readable reasoning for reorder recommendation
   */
  private generateReasoning(item: InventoryItem, forecast: Forecast): string {
    const dailyDemand = forecast.forecast_quantity / 7
    const daysOfStock = item.current_stock > 0 && dailyDemand > 0 ? item.current_stock / dailyDemand : 0
    const leadTime = item.lead_time_days || 7

    if (item.current_stock === 0) {
      return `Out of stock. Expected demand: ${Math.round(dailyDemand)} units/day.`
    } else if (daysOfStock <= 2) {
      return `Critical: Only ${Math.round(daysOfStock)} days of stock remaining. Lead time: ${leadTime} days.`
    } else if (daysOfStock <= leadTime) {
      return `Stock will run out before next delivery. Current: ${Math.round(daysOfStock)} days, Lead time: ${leadTime} days.`
    } else {
      return `Recommended reorder to maintain optimal stock levels. Forecast: ${forecast.forecast_quantity} units over 7 days.`
    }
  }

  /**
   * Update reorder quantity for an item
   */
  async updateReorderQuantity(
    userId: string,
    sku: string,
    newQuantity: number
  ): Promise<boolean> {
    try {
      // This would update a reorder_list table if we had one
      // For now, we'll just validate the input
      if (newQuantity < 0) {
        throw new Error('Quantity cannot be negative')
      }

      // In a full implementation, we'd store this in a reorder_list table
      return true
    } catch (error) {
      console.error('Error updating reorder quantity:', error)
      return false
    }
  }
}

// Singleton instance
export const reorderService = new ReorderService()
