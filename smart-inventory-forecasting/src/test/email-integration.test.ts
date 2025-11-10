/**
 * Email Integration Tests
 * Tests for email template generation and purchase order email functionality
 * Requirements: 5.3, 5.5, 5.6
 */

import { describe, it, expect } from 'vitest'
import { emailTemplateService } from '@/lib/services/email-template-service'
import { PurchaseOrderWithItems, POLineItem } from '@/types/business'
import { Supplier } from '@/types/database'

describe('Email Template Service', () => {
  const mockSupplier: Supplier = {
    id: 'supplier-1',
    user_id: 'user-1',
    name: 'Test Supplier Inc',
    contact_email: 'supplier@test.com',
    contact_phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    lead_time_days: 7,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockLineItems: POLineItem[] = [
    {
      sku: 'SKU-001',
      name: 'Test Product 1',
      quantity: 10,
      unit_cost: 25.50,
      line_total: 255.00
    },
    {
      sku: 'SKU-002',
      name: 'Test Product 2',
      quantity: 5,
      unit_cost: 50.00,
      line_total: 250.00
    }
  ]

  const mockPurchaseOrder: PurchaseOrderWithItems = {
    id: 'po-1',
    supplier_id: 'supplier-1',
    supplier_name: 'Test Supplier Inc',
    supplier_email: 'supplier@test.com',
    po_number: 'PO-20240101-001',
    items: mockLineItems,
    total_amount: 505.00,
    generated_at: '2024-01-01T10:00:00Z',
    status: 'draft'
  }

  describe('generatePurchaseOrderEmail', () => {
    it('should generate email template with correct subject', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )

      expect(email.subject).toContain('PO-20240101-001')
      expect(email.subject).toContain('Purchase Order')
    })

    it('should include supplier email in to field', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )

      expect(email.to).toBe('supplier@test.com')
    })

    it('should include greeting when option is enabled', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier,
        { includeGreeting: true }
      )

      expect(email.body).toContain('Dear Test Supplier Inc Team')
    })

    it('should exclude greeting when option is disabled', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier,
        { includeGreeting: false }
      )

      expect(email.body).not.toContain('Dear')
    })

    it('should include all line items in body', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )

      expect(email.body).toContain('SKU-001')
      expect(email.body).toContain('Test Product 1')
      expect(email.body).toContain('SKU-002')
      expect(email.body).toContain('Test Product 2')
    })

    it('should include total amount in body', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )

      expect(email.body).toContain('505.00')
      expect(email.body).toContain('Total Order Amount')
    })

    it('should include lead time information', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )

      expect(email.body).toContain('7 days')
      expect(email.body).toContain('Expected Lead Time')
    })

    it('should include custom message when provided', () => {
      const customMessage = 'Please expedite this order'
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier,
        { customMessage }
      )

      expect(email.body).toContain(customMessage)
    })

    it('should include closing when option is enabled', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier,
        { includeClosing: true }
      )

      expect(email.body).toContain('Thank you')
      expect(email.body).toContain('Best regards')
    })
  })

  describe('generateMailtoLink', () => {
    it('should generate valid mailto link', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )
      const mailtoLink = emailTemplateService.generateMailtoLink(email)

      expect(mailtoLink).toContain('mailto:supplier@test.com')
      expect(mailtoLink).toContain('subject=')
      expect(mailtoLink).toContain('body=')
    })

    it('should include attachment note when enabled', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )
      const mailtoLink = emailTemplateService.generateMailtoLink(email, true)

      expect(mailtoLink).toContain('attach')
    })

    it('should URL encode special characters', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )
      const mailtoLink = emailTemplateService.generateMailtoLink(email)

      // Check that spaces are encoded
      expect(mailtoLink).not.toContain(' ')
    })
  })

  describe('validateSupplierForEmail', () => {
    it('should validate supplier with all required fields', () => {
      const validation = emailTemplateService.validateSupplierForEmail(mockSupplier)

      expect(validation.valid).toBe(true)
      expect(validation.missingFields).toHaveLength(0)
    })

    it('should detect missing email', () => {
      const supplierWithoutEmail = {
        ...mockSupplier,
        contact_email: undefined
      }
      const validation = emailTemplateService.validateSupplierForEmail(supplierWithoutEmail)

      expect(validation.valid).toBe(false)
      expect(validation.missingFields).toContain('contact_email')
    })

    it('should detect missing name', () => {
      const supplierWithoutName = {
        ...mockSupplier,
        name: ''
      }
      const validation = emailTemplateService.validateSupplierForEmail(supplierWithoutName)

      expect(validation.valid).toBe(false)
      expect(validation.missingFields).toContain('name')
    })

    it('should detect multiple missing fields', () => {
      const incompleteSupplier = {
        ...mockSupplier,
        name: '',
        contact_email: undefined
      }
      const validation = emailTemplateService.validateSupplierForEmail(incompleteSupplier)

      expect(validation.valid).toBe(false)
      expect(validation.missingFields).toHaveLength(2)
      expect(validation.missingFields).toContain('name')
      expect(validation.missingFields).toContain('contact_email')
    })
  })

  describe('generateEmailPreviewHTML', () => {
    it('should generate HTML preview', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )
      const html = emailTemplateService.generateEmailPreviewHTML(email)

      expect(html).toContain('<div')
      expect(html).toContain('To:')
      expect(html).toContain('Subject:')
      expect(html).toContain(email.to)
      expect(html).toContain(email.subject)
    })

    it('should include CC field when present', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )
      email.cc = 'cc@test.com'
      const html = emailTemplateService.generateEmailPreviewHTML(email)

      expect(html).toContain('CC:')
      expect(html).toContain('cc@test.com')
    })

    it('should handle missing email address', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        { ...mockSupplier, contact_email: undefined }
      )
      const html = emailTemplateService.generateEmailPreviewHTML(email)

      expect(html).toContain('(No email address)')
    })
  })

  describe('Email Template Formatting', () => {
    it('should format items table correctly', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )

      // Check table headers
      expect(email.body).toContain('SKU')
      expect(email.body).toContain('Item Name')
      expect(email.body).toContain('Quantity')
      expect(email.body).toContain('Unit Cost')
      expect(email.body).toContain('Total')
    })

    it('should handle long item names', () => {
      const longNamePO = {
        ...mockPurchaseOrder,
        items: [{
          sku: 'SKU-LONG',
          name: 'This is a very long product name that should be truncated in the email',
          quantity: 1,
          unit_cost: 10.00,
          line_total: 10.00
        }]
      }

      const email = emailTemplateService.generatePurchaseOrderEmail(
        longNamePO,
        mockSupplier
      )

      expect(email.body).toContain('SKU-LONG')
    })

    it('should format currency correctly', () => {
      const email = emailTemplateService.generatePurchaseOrderEmail(
        mockPurchaseOrder,
        mockSupplier
      )

      // Check that amounts are formatted with 2 decimal places
      expect(email.body).toMatch(/\$\d+\.\d{2}/)
    })
  })
})
