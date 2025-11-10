/**
 * Purchase Order Generation Service
 * Handles PO creation, PDF generation, and validation
 * Requirements: 5.2, 5.4
 */

import jsPDF from 'jspdf'
import { purchaseOrdersRepository } from '@/lib/database/purchase-orders-repository'
import { suppliersRepository } from '@/lib/database/suppliers-repository'
import { inventoryRepository } from '@/lib/database/inventory-repository'
import { emailTemplateService } from '@/lib/services/email-template-service'
import { 
  PurchaseOrder, 
  Supplier,
  InventoryItem 
} from '@/types/database'
import { POLineItem, PurchaseOrderWithItems } from '@/types/business'

export interface GeneratePORequest {
  supplier_id: string
  items: Array<{
    sku: string
    quantity: number
  }>
}

export interface GeneratePOResult {
  success: boolean
  purchase_order?: PurchaseOrderWithItems
  pdf_base64?: string
  error?: string
  validation_errors?: string[]
}

export class POGenerationService {
  /**
   * Generate a purchase order with PDF
   * Requirements: 5.2, 5.4
   */
  async generatePurchaseOrder(
    userId: string,
    request: GeneratePORequest
  ): Promise<GeneratePOResult> {
    try {
      // Validate request
      const validation = await this.validatePORequest(userId, request)
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          validation_errors: validation.errors
        }
      }

      // Get supplier details
      const supplier = await suppliersRepository.getSupplierById(
        userId, 
        request.supplier_id
      )
      
      if (!supplier) {
        return {
          success: false,
          error: 'Supplier not found'
        }
      }

      // Get inventory items for the SKUs
      const skus = request.items.map(item => item.sku)
      const inventoryItems = await inventoryRepository.getItemsBySKUs(userId, skus)
      const inventoryMap = new Map<string, InventoryItem>()
      inventoryItems.forEach(item => inventoryMap.set(item.sku, item))

      // Build line items with costs
      const lineItems: POLineItem[] = []
      let totalAmount = 0

      for (const item of request.items) {
        const inventoryItem = inventoryMap.get(item.sku)
        if (!inventoryItem) continue

        const unitCost = inventoryItem.unit_cost || 0
        const lineTotal = unitCost * item.quantity

        lineItems.push({
          sku: item.sku,
          name: inventoryItem.name,
          quantity: item.quantity,
          unit_cost: unitCost,
          line_total: lineTotal
        })

        totalAmount += lineTotal
      }

      // Generate PO number
      const poNumber = await purchaseOrdersRepository.generatePONumber(userId)

      // Create purchase order in database
      const po = await purchaseOrdersRepository.createPurchaseOrder(userId, {
        supplier_id: request.supplier_id,
        po_number: poNumber,
        total_amount: totalAmount,
        status: 'draft'
      })

      if (!po) {
        return {
          success: false,
          error: 'Failed to create purchase order'
        }
      }

      // Add line items
      const poItems = await purchaseOrdersRepository.addPurchaseOrderItems(
        lineItems.map(item => ({
          purchase_order_id: po.id,
          sku: item.sku,
          item_name: item.name,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          line_total: item.line_total
        }))
      )

      if (poItems.length === 0) {
        return {
          success: false,
          error: 'Failed to add line items to purchase order'
        }
      }

      // Generate PDF
      const pdfBase64 = await this.generatePDF(po, supplier, lineItems)

      // Generate email draft - Requirement 5.3
      const emailTemplate = emailTemplateService.generatePurchaseOrderEmail(
        {
          id: po.id,
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          supplier_email: supplier.contact_email,
          po_number: po.po_number,
          items: lineItems,
          total_amount: totalAmount,
          generated_at: po.generated_at,
          status: po.status
        },
        supplier
      )

      // Store email draft in database
      await purchaseOrdersRepository.updatePurchaseOrder(userId, po.id, {
        email_draft: emailTemplate.body
      })

      // Build response
      const purchaseOrderWithItems: PurchaseOrderWithItems = {
        id: po.id,
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_email: supplier.contact_email,
        po_number: po.po_number,
        items: lineItems,
        total_amount: totalAmount,
        generated_at: po.generated_at,
        status: po.status,
        email_draft: emailTemplate.body
      }

      return {
        success: true,
        purchase_order: purchaseOrderWithItems,
        pdf_base64: pdfBase64
      }
    } catch (error) {
      console.error('Error generating purchase order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Validate PO request
   * Requirement 5.4: Create PO data validation and error checking
   */
  private async validatePORequest(
    userId: string,
    request: GeneratePORequest
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Check supplier exists
    if (!request.supplier_id) {
      errors.push('Supplier ID is required')
    } else {
      const supplier = await suppliersRepository.getSupplierById(
        userId, 
        request.supplier_id
      )
      
      if (!supplier) {
        errors.push('Supplier not found')
      } else {
        // Validate supplier has required information
        if (!supplier.name) {
          errors.push('Supplier name is missing')
        }
        if (!supplier.contact_email) {
          errors.push('Supplier email is missing')
        }
      }
    }

    // Check items
    if (!request.items || request.items.length === 0) {
      errors.push('At least one item is required')
    } else {
      // Validate each item
      for (const item of request.items) {
        if (!item.sku) {
          errors.push('Item SKU is required')
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Invalid quantity for SKU ${item.sku}`)
        }
      }

      // Check if items exist in inventory
      const skus = request.items.map(item => item.sku)
      const inventoryItems = await inventoryRepository.getItemsBySKUs(userId, skus)
      
      if (inventoryItems.length !== skus.length) {
        const foundSkus = new Set(inventoryItems.map(item => item.sku))
        const missingSkus = skus.filter(sku => !foundSkus.has(sku))
        errors.push(`Items not found in inventory: ${missingSkus.join(', ')}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Generate PDF for purchase order
   * Requirement 5.2: Build professional PO template with company branding
   */
  private async generatePDF(
    po: PurchaseOrder,
    supplier: Supplier,
    items: POLineItem[]
  ): Promise<string> {
    const doc = new jsPDF()
    
    // Set font
    doc.setFont('helvetica')
    
    // Header - Company branding
    doc.setFontSize(24)
    doc.setTextColor(31, 41, 55) // gray-800
    doc.text('PURCHASE ORDER', 105, 20, { align: 'center' })
    
    // PO Number and Date
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(`PO Number: ${po.po_number}`, 20, 35)
    doc.text(`Date: ${new Date(po.generated_at).toLocaleDateString()}`, 20, 42)
    
    // Supplier Information
    doc.setFontSize(12)
    doc.setTextColor(31, 41, 55)
    doc.text('Supplier:', 20, 55)
    
    doc.setFontSize(10)
    doc.text(supplier.name, 20, 62)
    if (supplier.contact_email) {
      doc.text(`Email: ${supplier.contact_email}`, 20, 69)
    }
    if (supplier.contact_phone) {
      doc.text(`Phone: ${supplier.contact_phone}`, 20, 76)
    }
    if (supplier.address) {
      doc.text(`Address: ${supplier.address}`, 20, 83)
    }
    
    // Line separator
    doc.setDrawColor(229, 231, 235) // gray-200
    doc.line(20, 95, 190, 95)
    
    // Table header
    doc.setFontSize(10)
    doc.setTextColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    
    const tableTop = 105
    doc.text('SKU', 20, tableTop)
    doc.text('Item Name', 50, tableTop)
    doc.text('Qty', 130, tableTop)
    doc.text('Unit Cost', 150, tableTop)
    doc.text('Total', 175, tableTop)
    
    // Table line
    doc.line(20, tableTop + 2, 190, tableTop + 2)
    
    // Table rows
    doc.setFont('helvetica', 'normal')
    let yPosition = tableTop + 10
    
    for (const item of items) {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.text(item.sku, 20, yPosition)
      
      // Truncate long names
      const itemName = item.name.length > 30 
        ? item.name.substring(0, 27) + '...' 
        : item.name
      doc.text(itemName, 50, yPosition)
      
      doc.text(item.quantity.toString(), 130, yPosition)
      doc.text(`$${(item.unit_cost || 0).toFixed(2)}`, 150, yPosition)
      doc.text(`$${(item.line_total || 0).toFixed(2)}`, 175, yPosition)
      
      yPosition += 7
    }
    
    // Total line
    yPosition += 5
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Total Amount:', 130, yPosition)
    doc.text(`$${(po.total_amount || 0).toFixed(2)}`, 175, yPosition)
    
    // Footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    const footerY = 280
    doc.text('Thank you for your business!', 105, footerY, { align: 'center' })
    doc.text('Please confirm receipt of this order.', 105, footerY + 5, { align: 'center' })
    
    // Convert to base64
    const pdfBase64 = doc.output('datauristring')
    return pdfBase64
  }

  /**
   * Get purchase order with items
   */
  async getPurchaseOrderWithItems(
    userId: string,
    poId: string
  ): Promise<PurchaseOrderWithItems | null> {
    try {
      const po = await purchaseOrdersRepository.getPurchaseOrderById(userId, poId)
      if (!po) return null

      const items = await purchaseOrdersRepository.getPurchaseOrderItems(poId)
      const supplier = await suppliersRepository.getSupplierById(userId, po.supplier_id)
      
      if (!supplier) return null

      const lineItems: POLineItem[] = items.map(item => ({
        sku: item.sku,
        name: item.item_name,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        line_total: item.line_total
      }))

      return {
        id: po.id,
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_email: supplier.contact_email,
        po_number: po.po_number,
        items: lineItems,
        total_amount: po.total_amount,
        generated_at: po.generated_at,
        status: po.status,
        email_draft: po.email_draft
      }
    } catch (error) {
      console.error('Error getting purchase order with items:', error)
      return null
    }
  }

  /**
   * Regenerate PDF for existing purchase order
   */
  async regeneratePDF(userId: string, poId: string): Promise<string | null> {
    try {
      const po = await purchaseOrdersRepository.getPurchaseOrderById(userId, poId)
      if (!po) return null

      const items = await purchaseOrdersRepository.getPurchaseOrderItems(poId)
      const supplier = await suppliersRepository.getSupplierById(userId, po.supplier_id)
      
      if (!supplier) return null

      const lineItems: POLineItem[] = items.map(item => ({
        sku: item.sku,
        name: item.item_name,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        line_total: item.line_total
      }))

      return await this.generatePDF(po, supplier, lineItems)
    } catch (error) {
      console.error('Error regenerating PDF:', error)
      return null
    }
  }
}

// Singleton instance
export const poGenerationService = new POGenerationService()
