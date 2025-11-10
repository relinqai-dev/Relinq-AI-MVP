/**
 * Email Template Service Tests
 * Tests for email generation and validation
 * Requirements: 5.3, 5.5, 5.6
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { EmailTemplateService } from '@/lib/services/email-template-service'
import { PurchaseOrderWithItems, POLineItem } from '@/types/business'
import { Supplier } from '@/types/database'

describe('EmailTemplateService', () => {
  let service: EmailTemplateService
  let mockSupplier: Supplier
  let mockPO: PurchaseOrderWithItems

  beforeEach(() => {
    service = new EmailTemplateService()

    mockSupplier = {
      id: 'supplier-1',
      user_id: 'user-123',
      name: 'Test Supplier Co.',
      contact_email: 'orders@testsupplier.com',
      contact_phone: '555-1234',
      lead_time_days: 7,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockItems: POLineItem[] = [
      {
        sku: 'SKU001',
        name: 'Product One',
        quantity: 50,
        unit_cost: 10.50,
        line_total: 525.00
      },
      {
        sku: 'SKU002',
        name: 'Product Two',
        quantity: 25,
        unit_cost: 20.00,
        line_total: 500.00
      }
    ]

    mockPO = {
      id: 'po-1',
      supplier_id: 'supplier-1',
      supplier_name: 'Test Supplier Co.',
      supplier_email: 'orders@testsupplier.com',
      po_number: 'PO-20240101-001',
      items: mockItems,
      total_amount: 1025.00,
      generated_at: '2024-01-01T00:00:00Z',
      status: 'draft'
    }
  })

  describe('generatePurchaseOrderEmail - Requirement 5.3', () => {
    it('should generate complete email with all sections', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)

      expect(email.subject).toContain('PO-20240101-001')
      expect(email.to).toBe('orders@testsupplier.com')
      expect(email.body).toContain('Dear Test Supplier Co. Team')
      expect(email.body).toContain('PO-20240101-001')
      expect(email.body).toContain('SKU001')
      expect(email.body).toContain('SKU002')
      expect(email.body).toContain('1025.00')
      expect(email.body).toContain('Expected Lead Time: 7 days')
      expect(email.body).toContain('Thank you for your continued partnership')
    })

    it('should format items table correctly', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)

      expect(email.body).toContain('SKU')
      expect(email.body).toContain('Item Name')
      expect(email.body).toContain('Quantity')
      expect(email.body).toContain('Unit Cost')
      expect(email.body).toContain('Total')
      expect(email.body).toContain('Product One')
      expect(email.body).toContain('Product Two')
      expect(email.body).toContain('50')
      expect(email.body).toContain('25')
    })

    it('should exclude greeting when option is false', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier, {
        includeGreeting: false
      })

      expect(email.body).not.toContain('Dear')
    })

    it('should exclude closing when option is false', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier, {
        includeClosing: false
      })

      expect(email.body).not.toContain('Thank you for your continued partnership')
      expect(email.body).not.toContain('Best regards')
    })

    it('should include custom message when provided', () => {
      const customMessage = 'Please expedite this order as we have urgent demand.'

      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier, {
        customMessage
      })

      expect(email.body).toContain(customMessage)
    })

    it('should handle missing lead time gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { lead_time_days, ...supplierNoLeadTime } = mockSupplier

      const email = service.generatePurchaseOrderEmail(mockPO, supplierNoLeadTime as Supplier)

      expect(email.body).not.toContain('Expected Lead Time')
      expect(email.body).toContain('confirm receipt')
    })
  })

  describe('generateMailtoLink - Requirement 5.5', () => {
    it('should generate valid mailto link with all parameters', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      const mailtoLink = service.generateMailtoLink(email)

      expect(mailtoLink).toContain('mailto:orders@testsupplier.com')
      expect(mailtoLink).toContain('subject=')
      expect(mailtoLink).toContain('body=')
      expect(mailtoLink).toContain('PO-20240101-001')
    })

    it('should include attachment note by default', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      const mailtoLink = service.generateMailtoLink(email)

      // Check for the encoded version of the attachment note
      expect(mailtoLink).toContain('attach+the+PDF+purchase+order')
    })

    it('should exclude attachment note when option is false', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      const mailtoLink = service.generateMailtoLink(email, false)

      expect(decodeURIComponent(mailtoLink)).not.toContain('attach the PDF purchase order')
    })

    it('should handle CC and BCC fields', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      email.cc = 'manager@company.com'
      email.bcc = 'accounting@company.com'

      const mailtoLink = service.generateMailtoLink(email)

      // Check for URL-encoded email addresses
      expect(mailtoLink).toContain('cc=manager%40company.com')
      expect(mailtoLink).toContain('bcc=accounting%40company.com')
    })
  })

  describe('validateSupplierForEmail - Requirement 5.6', () => {
    it('should validate complete supplier information', () => {
      const result = service.validateSupplierForEmail(mockSupplier)

      expect(result.valid).toBe(true)
      expect(result.missingFields).toHaveLength(0)
    })

    it('should detect missing email', () => {
      const supplierNoEmail = { ...mockSupplier, contact_email: undefined }

      const result = service.validateSupplierForEmail(supplierNoEmail)

      expect(result.valid).toBe(false)
      expect(result.missingFields).toContain('contact_email')
    })

    it('should detect missing name', () => {
      const supplierNoName = { ...mockSupplier, name: '' }

      const result = service.validateSupplierForEmail(supplierNoName)

      expect(result.valid).toBe(false)
      expect(result.missingFields).toContain('name')
    })

    it('should detect multiple missing fields', () => {
      const incompleteSupplier = {
        ...mockSupplier,
        name: '',
        contact_email: undefined
      }

      const result = service.validateSupplierForEmail(incompleteSupplier)

      expect(result.valid).toBe(false)
      expect(result.missingFields).toHaveLength(2)
      expect(result.missingFields).toContain('name')
      expect(result.missingFields).toContain('contact_email')
    })
  })

  describe('generateEmailPreviewHTML', () => {
    it('should generate HTML preview with proper structure', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      const html = service.generateEmailPreviewHTML(email)

      expect(html).toContain('<div')
      expect(html).toContain('To:')
      expect(html).toContain('orders@testsupplier.com')
      expect(html).toContain('Subject:')
      expect(html).toContain('PO-20240101-001')
      expect(html).toContain('Dear Test Supplier Co. Team')
    })

    it('should include CC field when present', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      email.cc = 'manager@company.com'

      const html = service.generateEmailPreviewHTML(email)

      expect(html).toContain('CC:')
      expect(html).toContain('manager@company.com')
    })

    it('should handle missing email address', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      email.to = ''

      const html = service.generateEmailPreviewHTML(email)

      expect(html).toContain('(No email address)')
    })

    it('should preserve whitespace in body', () => {
      const email = service.generatePurchaseOrderEmail(mockPO, mockSupplier)
      const html = service.generateEmailPreviewHTML(email)

      expect(html).toContain('white-space: pre-wrap')
    })
  })
})
