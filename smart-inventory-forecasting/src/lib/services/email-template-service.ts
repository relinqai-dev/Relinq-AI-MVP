/**
 * Email Template Service
 * Generates pre-written email templates for purchase orders
 * Requirements: 5.3, 5.5
 */

import { PurchaseOrderWithItems, POLineItem } from '@/types/business'
import { Supplier } from '@/types/database'

export interface EmailTemplate {
  subject: string
  body: string
  to: string
  cc?: string
  bcc?: string
}

export interface GenerateEmailOptions {
  includeGreeting?: boolean
  includeClosing?: boolean
  customMessage?: string
}

export class EmailTemplateService {
  /**
   * Generate email template for purchase order
   * Requirement 5.3: Create pre-written email drafts with supplier contact information
   */
  generatePurchaseOrderEmail(
    purchaseOrder: PurchaseOrderWithItems,
    supplier: Supplier,
    options: GenerateEmailOptions = {}
  ): EmailTemplate {
    const {
      includeGreeting = true,
      includeClosing = true,
      customMessage
    } = options

    // Build email subject
    const subject = `Purchase Order ${purchaseOrder.po_number} - ${new Date(purchaseOrder.generated_at).toLocaleDateString()}`

    // Build email body
    let body = ''

    // Greeting
    if (includeGreeting) {
      body += `Dear ${supplier.name} Team,\n\n`
    }

    // Opening paragraph
    body += `Please find our purchase order ${purchaseOrder.po_number} attached. We would like to place an order for the following items:\n\n`

    // Items table
    body += this.formatItemsTable(purchaseOrder.items)
    body += '\n\n'

    // Total
    body += `Total Order Amount: $${(purchaseOrder.total_amount || 0).toFixed(2)}\n\n`

    // Custom message if provided
    if (customMessage) {
      body += `${customMessage}\n\n`
    }

    // Delivery information
    if (supplier.lead_time_days) {
      body += `Expected Lead Time: ${supplier.lead_time_days} days\n`
    }
    body += `Please confirm receipt of this order and provide an estimated delivery date.\n\n`

    // Closing
    if (includeClosing) {
      body += `Thank you for your continued partnership.\n\n`
      body += `Best regards,\n`
      body += `Inventory Management Team`
    }

    return {
      subject,
      body,
      to: supplier.contact_email || '',
      cc: undefined,
      bcc: undefined
    }
  }

  /**
   * Format items as a text table for email
   */
  private formatItemsTable(items: POLineItem[]): string {
    let table = ''
    
    // Header
    table += 'SKU'.padEnd(15) + 
             'Item Name'.padEnd(35) + 
             'Quantity'.padEnd(12) + 
             'Unit Cost'.padEnd(12) + 
             'Total\n'
    table += '-'.repeat(86) + '\n'

    // Items
    for (const item of items) {
      const sku = item.sku.substring(0, 14).padEnd(15)
      const name = item.name.substring(0, 34).padEnd(35)
      const quantity = item.quantity.toString().padEnd(12)
      const unitCost = `$${(item.unit_cost || 0).toFixed(2)}`.padEnd(12)
      const total = `$${(item.line_total || 0).toFixed(2)}`
      
      table += `${sku}${name}${quantity}${unitCost}${total}\n`
    }

    return table
  }

  /**
   * Generate mailto link for one-click email sending
   * Requirement 5.5: Allow one-click email sending via mailto links
   */
  generateMailtoLink(
    email: EmailTemplate,
    attachmentNote: boolean = true
  ): string {
    const params = new URLSearchParams()
    
    if (email.to) {
      // to is part of the mailto: scheme, not a parameter
    }
    
    if (email.subject) {
      params.append('subject', email.subject)
    }
    
    let body = email.body
    if (attachmentNote) {
      body += '\n\n[Note: Please attach the PDF purchase order before sending]'
    }
    
    if (body) {
      params.append('body', body)
    }
    
    if (email.cc) {
      params.append('cc', email.cc)
    }
    
    if (email.bcc) {
      params.append('bcc', email.bcc)
    }

    const queryString = params.toString()
    return `mailto:${email.to}${queryString ? '?' + queryString : ''}`
  }

  /**
   * Validate supplier has required contact information
   * Requirement 5.6: Implement supplier information prompting when details are missing
   */
  validateSupplierForEmail(supplier: Supplier): {
    valid: boolean
    missingFields: string[]
  } {
    const missingFields: string[] = []

    if (!supplier.contact_email) {
      missingFields.push('contact_email')
    }

    if (!supplier.name) {
      missingFields.push('name')
    }

    return {
      valid: missingFields.length === 0,
      missingFields
    }
  }

  /**
   * Generate email preview HTML for display in UI
   */
  generateEmailPreviewHTML(email: EmailTemplate): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
          <div style="margin-bottom: 10px;">
            <strong style="color: #6b7280;">To:</strong> 
            <span style="color: #1f2937;">${email.to || '(No email address)'}</span>
          </div>
          ${email.cc ? `
            <div style="margin-bottom: 10px;">
              <strong style="color: #6b7280;">CC:</strong> 
              <span style="color: #1f2937;">${email.cc}</span>
            </div>
          ` : ''}
          <div style="margin-bottom: 10px;">
            <strong style="color: #6b7280;">Subject:</strong> 
            <span style="color: #1f2937;">${email.subject}</span>
          </div>
        </div>
        <div style="white-space: pre-wrap; color: #1f2937; line-height: 1.6;">
${email.body}
        </div>
      </div>
    `
  }
}

// Singleton instance
export const emailTemplateService = new EmailTemplateService()
