/**
 * Tests for PO Generation Service
 * Requirements: 5.2, 5.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POGenerationService } from '@/lib/services/po-generation-service'
import { purchaseOrdersRepository } from '@/lib/database/purchase-orders-repository'
import { suppliersRepository } from '@/lib/database/suppliers-repository'
import { inventoryRepository } from '@/lib/database/inventory-repository'
import { PurchaseOrder, Supplier, InventoryItem } from '@/types/database'

// Mock the repositories
vi.mock('@/lib/database/purchase-orders-repository')
vi.mock('@/lib/database/suppliers-repository')
vi.mock('@/lib/database/inventory-repository')

describe('POGenerationService', () => {
  let service: POGenerationService
  const mockUserId = 'test-user-123'

  beforeEach(() => {
    service = new POGenerationService()
    vi.clearAllMocks()
  })

  describe('generatePurchaseOrder', () => {
    it('should generate a purchase order with PDF - Requirement 5.2', async () => {
      // Mock data
      const mockSupplier: Supplier = {
        id: 'supplier-1',
        user_id: mockUserId,
        name: 'Test Supplier',
        contact_email: 'supplier@test.com',
        contact_phone: '123-456-7890',
        lead_time_days: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockInventoryItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Product 1',
          current_stock: 10,
          supplier_id: 'supplier-1',
          lead_time_days: 7,
          unit_cost: 10.50,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Product 2',
          current_stock: 5,
          supplier_id: 'supplier-1',
          lead_time_days: 5,
          unit_cost: 15.00,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const mockPO: PurchaseOrder = {
        id: 'po-1',
        user_id: mockUserId,
        supplier_id: 'supplier-1',
        po_number: 'PO-20240101-001',
        total_amount: 375.00,
        status: 'draft',
        generated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      // Setup mocks
      vi.mocked(suppliersRepository.getSupplierById).mockResolvedValue(mockSupplier)
      vi.mocked(inventoryRepository.getItemsBySKUs).mockResolvedValue(mockInventoryItems)
      vi.mocked(purchaseOrdersRepository.generatePONumber).mockResolvedValue('PO-20240101-001')
      vi.mocked(purchaseOrdersRepository.createPurchaseOrder).mockResolvedValue(mockPO)
      vi.mocked(purchaseOrdersRepository.addPurchaseOrderItems).mockResolvedValue([
        {
          id: 'item-1',
          purchase_order_id: 'po-1',
          sku: 'SKU001',
          item_name: 'Product 1',
          quantity: 20,
          unit_cost: 10.50,
          line_total: 210.00,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'item-2',
          purchase_order_id: 'po-1',
          sku: 'SKU002',
          item_name: 'Product 2',
          quantity: 11,
          unit_cost: 15.00,
          line_total: 165.00,
          created_at: '2024-01-01T00:00:00Z'
        }
      ])

      // Execute
      const result = await service.generatePurchaseOrder(mockUserId, {
        supplier_id: 'supplier-1',
        items: [
          { sku: 'SKU001', quantity: 20 },
          { sku: 'SKU002', quantity: 11 }
        ]
      })

      // Verify - Requirement 5.2: Create clean, professional PO documents
      expect(result.success).toBe(true)
      expect(result.purchase_order).toBeDefined()
      expect(result.purchase_order?.po_number).toBe('PO-20240101-001')
      expect(result.purchase_order?.items).toHaveLength(2)
      expect(result.pdf_base64).toBeDefined()
      expect(result.pdf_base64).toContain('data:application/pdf')
    })

    it('should validate PO data and return errors - Requirement 5.4', async () => {
      // Missing supplier
      vi.mocked(suppliersRepository.getSupplierById).mockResolvedValue(null)

      const result = await service.generatePurchaseOrder(mockUserId, {
        supplier_id: 'invalid-supplier',
        items: [{ sku: 'SKU001', quantity: 10 }]
      })

      expect(result.success).toBe(false)
      expect(result.validation_errors).toBeDefined()
      expect(result.validation_errors).toContain('Supplier not found')
    })

    it('should validate supplier has required contact information - Requirement 5.4', async () => {
      // Supplier missing email
      const mockIncompleteSupplier: Supplier = {
        id: 'supplier-1',
        user_id: mockUserId,
        name: 'Test Supplier',
        contact_email: undefined,
        lead_time_days: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      vi.mocked(suppliersRepository.getSupplierById).mockResolvedValue(mockIncompleteSupplier)

      const result = await service.generatePurchaseOrder(mockUserId, {
        supplier_id: 'supplier-1',
        items: [{ sku: 'SKU001', quantity: 10 }]
      })

      expect(result.success).toBe(false)
      expect(result.validation_errors).toContain('Supplier email is missing')
    })

    it('should validate items exist in inventory - Requirement 5.4', async () => {
      const mockSupplier: Supplier = {
        id: 'supplier-1',
        user_id: mockUserId,
        name: 'Test Supplier',
        contact_email: 'supplier@test.com',
        lead_time_days: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      vi.mocked(suppliersRepository.getSupplierById).mockResolvedValue(mockSupplier)
      vi.mocked(inventoryRepository.getItemsBySKUs).mockResolvedValue([])

      const result = await service.generatePurchaseOrder(mockUserId, {
        supplier_id: 'supplier-1',
        items: [{ sku: 'INVALID-SKU', quantity: 10 }]
      })

      expect(result.success).toBe(false)
      expect(result.validation_errors?.some(e => e.includes('not found in inventory'))).toBe(true)
    })

    it('should validate item quantities are positive - Requirement 5.4', async () => {
      const mockSupplier: Supplier = {
        id: 'supplier-1',
        user_id: mockUserId,
        name: 'Test Supplier',
        contact_email: 'supplier@test.com',
        lead_time_days: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      vi.mocked(suppliersRepository.getSupplierById).mockResolvedValue(mockSupplier)

      const result = await service.generatePurchaseOrder(mockUserId, {
        supplier_id: 'supplier-1',
        items: [{ sku: 'SKU001', quantity: -5 }]
      })

      expect(result.success).toBe(false)
      expect(result.validation_errors?.some(e => e.includes('Invalid quantity'))).toBe(true)
    })

    it('should calculate total amount correctly - Requirement 5.4', async () => {
      const mockSupplier: Supplier = {
        id: 'supplier-1',
        user_id: mockUserId,
        name: 'Test Supplier',
        contact_email: 'supplier@test.com',
        lead_time_days: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockInventoryItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Product 1',
          current_stock: 10,
          supplier_id: 'supplier-1',
          lead_time_days: 7,
          unit_cost: 10.00,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const mockPO: PurchaseOrder = {
        id: 'po-1',
        user_id: mockUserId,
        supplier_id: 'supplier-1',
        po_number: 'PO-20240101-001',
        total_amount: 100.00,
        status: 'draft',
        generated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      vi.mocked(suppliersRepository.getSupplierById).mockResolvedValue(mockSupplier)
      vi.mocked(inventoryRepository.getItemsBySKUs).mockResolvedValue(mockInventoryItems)
      vi.mocked(purchaseOrdersRepository.generatePONumber).mockResolvedValue('PO-20240101-001')
      vi.mocked(purchaseOrdersRepository.createPurchaseOrder).mockResolvedValue(mockPO)
      vi.mocked(purchaseOrdersRepository.addPurchaseOrderItems).mockResolvedValue([
        {
          id: 'item-1',
          purchase_order_id: 'po-1',
          sku: 'SKU001',
          item_name: 'Product 1',
          quantity: 10,
          unit_cost: 10.00,
          line_total: 100.00,
          created_at: '2024-01-01T00:00:00Z'
        }
      ])

      const result = await service.generatePurchaseOrder(mockUserId, {
        supplier_id: 'supplier-1',
        items: [{ sku: 'SKU001', quantity: 10 }]
      })

      expect(result.success).toBe(true)
      expect(result.purchase_order?.total_amount).toBe(100.00)
      expect(result.purchase_order?.items[0].line_total).toBe(100.00)
    })
  })

  describe('getPurchaseOrderWithItems', () => {
    it('should retrieve purchase order with all items', async () => {
      const mockPO: PurchaseOrder = {
        id: 'po-1',
        user_id: mockUserId,
        supplier_id: 'supplier-1',
        po_number: 'PO-20240101-001',
        total_amount: 100.00,
        status: 'draft',
        generated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockSupplier: Supplier = {
        id: 'supplier-1',
        user_id: mockUserId,
        name: 'Test Supplier',
        contact_email: 'supplier@test.com',
        lead_time_days: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      vi.mocked(purchaseOrdersRepository.getPurchaseOrderById).mockResolvedValue(mockPO)
      vi.mocked(suppliersRepository.getSupplierById).mockResolvedValue(mockSupplier)
      vi.mocked(purchaseOrdersRepository.getPurchaseOrderItems).mockResolvedValue([
        {
          id: 'item-1',
          purchase_order_id: 'po-1',
          sku: 'SKU001',
          item_name: 'Product 1',
          quantity: 10,
          unit_cost: 10.00,
          line_total: 100.00,
          created_at: '2024-01-01T00:00:00Z'
        }
      ])

      const result = await service.getPurchaseOrderWithItems(mockUserId, 'po-1')

      expect(result).toBeDefined()
      expect(result?.po_number).toBe('PO-20240101-001')
      expect(result?.supplier_name).toBe('Test Supplier')
      expect(result?.items).toHaveLength(1)
    })
  })
})
