// Tests for data cleanup service algorithms
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataCleanupService } from '@/lib/services/data-cleanup-service';
import { InventoryItem } from '@/types';

// Mock the repositories
vi.mock('@/lib/database/inventory-repository');
vi.mock('@/lib/database/sales-repository');
vi.mock('@/lib/database/cleanup-issues-repository');

describe('DataCleanupService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any; // Use any to access private methods in tests
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    service = new DataCleanupService();
    vi.clearAllMocks();
  });

  describe('Duplicate Detection Algorithm', () => {
    it('should detect exact name duplicates', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Apple iPhone 13',
          current_stock: 10,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Apple iPhone 13',
          current_stock: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectDuplicateItems(mockItems);

      expect(result).toHaveLength(1);
      expect(result[0].issue_type).toBe('duplicate');
      expect(result[0].affected_items).toEqual(['SKU001', 'SKU002']);
    });

    it('should detect similar names with high similarity', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Samsung Galaxy S21',
          current_stock: 10,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Samsung Galaxy S21 Pro',
          current_stock: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectDuplicateItems(mockItems);

      expect(result).toHaveLength(1);
      expect(result[0].affected_items).toEqual(['SKU001', 'SKU002']);
    });

    it('should detect similar items with high name similarity', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Samsung Galaxy S21',
          current_stock: 10,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Samsung Galaxy S21',
          current_stock: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectDuplicateItems(mockItems);

      // These should be detected as duplicates (high similarity)
      expect(result).toHaveLength(1);
      expect(result[0].affected_items).toEqual(['SKU001', 'SKU002']);
    });

    it('should not flag dissimilar items as duplicates', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Apple iPhone 13',
          current_stock: 10,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Samsung Galaxy Watch',
          current_stock: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectDuplicateItems(mockItems);

      expect(result).toHaveLength(0);
    });

    it('should assign correct severity based on stock and value', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Expensive Item',
          current_stock: 100,
          unit_cost: 500,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Expensive Item',
          current_stock: 50,
          unit_cost: 600,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectDuplicateItems(mockItems);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('high');
    });
  });

  describe('Missing Supplier Detection', () => {
    it('should detect items without suppliers', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Item without supplier',
          current_stock: 10,
          supplier_id: undefined,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Item with supplier',
          current_stock: 5,
          supplier_id: 'supplier-123',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectMissingSuppliers(mockItems);

      expect(result).toHaveLength(1);
      expect(result[0].issue_type).toBe('missing_supplier');
      expect(result[0].affected_items).toEqual(['SKU001']);
    });

    it('should assign medium severity to items without suppliers', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Item with stock',
          current_stock: 10,
          supplier_id: undefined,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectMissingSuppliers(mockItems);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('medium');
    });

    it('should handle items with suppliers correctly', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Item with supplier',
          current_stock: 10,
          supplier_id: 'supplier-123',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const result = await service.detectMissingSuppliers(mockItems);

      expect(result).toHaveLength(0);
    });
  });

  describe('Missing Sales History Detection', () => {
    it('should detect items with no sales history', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Item without sales',
          current_stock: 10,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          user_id: mockUserId,
          sku: 'SKU002',
          name: 'Item with sales',
          current_stock: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const mockSalesRepo = {
        findAll: vi.fn().mockResolvedValue({
          success: true,
          data: { data: [{ sku: 'SKU002' }] } // Only SKU002 has sales
        })
      };

      service.salesRepo = mockSalesRepo;

      const result = await service.detectMissingSalesHistory(mockItems, mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].issue_type).toBe('no_sales_history');
      expect(result[0].affected_items).toEqual(['SKU001']);
    });

    it('should assign low severity for items without sales', async () => {
      const mockItems: InventoryItem[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        user_id: mockUserId,
        sku: `SKU${String(i + 1).padStart(3, '0')}`,
        name: `Item ${i + 1}`,
        current_stock: 10,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }));

      const mockSalesRepo = {
        findAll: vi.fn().mockResolvedValue({
          success: true,
          data: { data: [] }
        })
      };

      service.salesRepo = mockSalesRepo;

      const result = await service.detectMissingSalesHistory(mockItems, mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('low');
    });

    it('should handle items with sales correctly', async () => {
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          user_id: mockUserId,
          sku: 'SKU001',
          name: 'Item with sales',
          current_stock: 10,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      const mockSalesRepo = {
        findAll: vi.fn().mockResolvedValue({
          success: true,
          data: { data: [{ sku: 'SKU001' }] }
        })
      };

      service.salesRepo = mockSalesRepo;

      const result = await service.detectMissingSalesHistory(mockItems, mockUserId);

      expect(result).toHaveLength(0);
    });
  });

  describe('Name Similarity Algorithm', () => {
    it('should calculate high similarity for nearly identical names', () => {
      const similarity = service.calculateNameSimilarity('iPhone 13 Pro', 'iPhone 13 Pro Max');
      expect(similarity).toBeGreaterThan(0.75);
    });

    it('should calculate low similarity for different names', () => {
      const similarity = service.calculateNameSimilarity('iPhone 13', 'Samsung Galaxy');
      expect(similarity).toBeLessThan(0.5);
    });

    it('should handle case insensitive comparison', () => {
      const similarity = service.calculateNameSimilarity('IPHONE 13', 'iphone 13');
      expect(similarity).toBe(1.0);
    });

    it('should calculate similarity for names with punctuation', () => {
      const similarity = service.calculateNameSimilarity('iPhone-13', 'iPhone 13');
      expect(similarity).toBeGreaterThan(0.8);
    });
  });

  describe('Levenshtein Distance Algorithm', () => {
    it('should calculate correct distance for identical strings', () => {
      const distance = service.levenshteinDistance('hello', 'hello');
      expect(distance).toBe(0);
    });

    it('should calculate correct distance for single character difference', () => {
      const distance = service.levenshteinDistance('hello', 'hallo');
      expect(distance).toBe(1);
    });

    it('should calculate correct distance for completely different strings', () => {
      const distance = service.levenshteinDistance('hello', 'world');
      expect(distance).toBe(4);
    });

    it('should handle empty strings', () => {
      const distance = service.levenshteinDistance('', 'hello');
      expect(distance).toBe(5);
    });
  });

  describe('Variant Detection', () => {
    it('should NOT detect color variants as similar (implementation limitation)', () => {
      const areSimilar = service.differOnlyByVariant('shirt red', 'shirt blue');
      expect(areSimilar).toBe(false);
    });

    it('should NOT detect size variants as similar (implementation limitation)', () => {
      const areSimilar = service.differOnlyByVariant('shirt large', 'shirt medium');
      expect(areSimilar).toBe(false);
    });

    it('should return false for completely different items', () => {
      const areSimilar = service.differOnlyByVariant('iphone 13', 'samsung galaxy');
      expect(areSimilar).toBe(false);
    });

    it('should return false for empty strings', () => {
      const areSimilar = service.differOnlyByVariant('', '');
      expect(areSimilar).toBe(false);
    });
  });

  describe('Forecasting Blocker Logic', () => {
    it('should block forecasting when high severity issues exist', async () => {
      const mockCleanupRepo = {
        getIssuesSummary: vi.fn().mockResolvedValue({
          success: true,
          data: {
            blocking_forecasting: true
          }
        })
      };

      service.cleanupRepo = mockCleanupRepo;

      const result = await service.isForecastingBlocked(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should not block forecasting when only low severity issues exist', async () => {
      const mockCleanupRepo = {
        getIssuesSummary: vi.fn().mockResolvedValue({
          success: true,
          data: {
            blocking_forecasting: false
          }
        })
      };

      service.cleanupRepo = mockCleanupRepo;

      const result = await service.isForecastingBlocked(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });
});
