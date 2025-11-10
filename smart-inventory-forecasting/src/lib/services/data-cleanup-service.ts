// Data cleanup service for detecting and resolving data quality issues
import { InventoryItem, CleanupIssue, CleanupReport, ApiResponse } from '@/types';
import { inventoryRepository } from '@/lib/database/inventory-repository';
import { salesRepository } from '@/lib/database/sales-repository';
import { cleanupIssuesRepository } from '@/lib/database/cleanup-issues-repository';

export class DataCleanupService {
  private inventoryRepo = inventoryRepository;
  private salesRepo = salesRepository;
  private cleanupRepo = cleanupIssuesRepository;

  /**
   * Runs a comprehensive data cleanup scan
   */
  async runCleanupScan(userId: string): Promise<ApiResponse<CleanupReport>> {
    try {
      // Get all inventory items for the user
      const inventoryResult = await this.inventoryRepo.findAll(userId);
      if (!inventoryResult.success) {
        return { success: false, error: inventoryResult.error };
      }

      const items = inventoryResult.data?.data || [];

      // Clear existing issues for this user
      await this.cleanupRepo.deleteMany([], userId);

      // Run all detection algorithms
      const duplicateIssues = await this.detectDuplicateItems(items);
      const supplierIssues = await this.detectMissingSuppliers(items);
      const salesHistoryIssues = await this.detectMissingSalesHistory(items, userId);

      // Combine all issues
      const allIssues = [...duplicateIssues, ...supplierIssues, ...salesHistoryIssues];

      // Store issues in database
      for (const issue of allIssues) {
        await this.cleanupRepo.create(issue, userId);
      }

      // Generate report
      return await this.generateCleanupReport(userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during cleanup scan'
      };
    }
  }

  /**
   * Generates a cleanup report
   */
  async generateCleanupReport(userId: string): Promise<ApiResponse<CleanupReport>> {
    try {
      const summaryResult = await this.cleanupRepo.getIssuesSummary(userId);
      if (!summaryResult.success) {
        return { success: false, error: summaryResult.error };
      }

      const summary = summaryResult.data!;

      // Get all issues
      const issuesResult = await this.cleanupRepo.findAll(userId);
      if (!issuesResult.success) {
        return { success: false, error: issuesResult.error };
      }

      const issues = issuesResult.data?.data || [];

      const report: CleanupReport = {
        total_issues: summary.total_issues,
        issues_by_type: summary.issues_by_type,
        completion_percentage: summary.completion_percentage,
        blocking_forecasting: summary.blocking_forecasting,
        issues
      };

      return { success: true, data: report };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating report'
      };
    }
  }

  /**
   * Checks if forecasting is blocked
   */
  async isForecastingBlocked(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const summaryResult = await this.cleanupRepo.getIssuesSummary(userId);
      if (!summaryResult.success) {
        return { success: false, error: summaryResult.error };
      }

      return { success: true, data: summaryResult.data!.blocking_forecasting };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error checking forecasting status'
      };
    }
  }

  /**
   * Resolves a single issue
   */
  async resolveIssue(issueId: string, userId: string): Promise<ApiResponse<CleanupIssue>> {
    try {
      return await this.cleanupRepo.markResolved(issueId, userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error resolving issue'
      };
    }
  }

  /**
   * Resolves multiple issues
   */
  async resolveMultipleIssues(issueIds: string[], userId: string): Promise<ApiResponse<void>> {
    try {
      return await this.cleanupRepo.markMultipleResolved(issueIds, userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error resolving issues'
      };
    }
  }

  // Private methods for issue detection

  private async detectDuplicateItems(items: InventoryItem[]): Promise<Omit<CleanupIssue, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]> {
    const issues: Omit<CleanupIssue, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      if (processed.has(items[i].sku)) continue;

      const duplicates = [];
      for (let j = i + 1; j < items.length; j++) {
        if (this.calculateNameSimilarity(items[i].name, items[j].name) > 0.8) {
          duplicates.push(items[j].sku);
          processed.add(items[j].sku);
        }
      }

      if (duplicates.length > 0) {
        issues.push({
          issue_type: 'duplicate',
          severity: 'high',
          affected_items: [items[i].sku, ...duplicates],
          suggested_action: `Merge similar items: ${items[i].name}`,
          resolved: false
        });
        processed.add(items[i].sku);
      }
    }

    return issues;
  }

  private async detectMissingSuppliers(items: InventoryItem[]): Promise<Omit<CleanupIssue, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]> {
    const issues: Omit<CleanupIssue, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];

    const itemsWithoutSupplier = items.filter(item => !item.supplier_id);

    if (itemsWithoutSupplier.length > 0) {
      issues.push({
        issue_type: 'missing_supplier',
        severity: 'medium',
        affected_items: itemsWithoutSupplier.map(item => item.sku),
        suggested_action: 'Assign suppliers to enable purchase order generation',
        resolved: false
      });
    }

    return issues;
  }

  private async detectMissingSalesHistory(items: InventoryItem[], userId: string): Promise<Omit<CleanupIssue, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]> {
    const issues: Omit<CleanupIssue, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];

    // Get all SKUs with sales data
    const salesResult = await this.salesRepo.findAll(userId);
    if (!salesResult.success) {
      return issues;
    }

    const salesData = salesResult.data?.data || [];
    const skusWithSales = new Set(salesData.map(sale => sale.sku));

    const itemsWithoutSales = items.filter(item => !skusWithSales.has(item.sku));

    if (itemsWithoutSales.length > 0) {
      issues.push({
        issue_type: 'no_sales_history',
        severity: 'low',
        affected_items: itemsWithoutSales.map(item => item.sku),
        suggested_action: 'Add sales history data for accurate forecasting',
        resolved: false
      });
    }

    return issues;
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    const s1 = name1.toLowerCase().trim();
    const s2 = name2.toLowerCase().trim();

    if (s1 === s2) return 1;

    // Check if they differ only by variant indicators
    if (this.differOnlyByVariant(s1, s2)) return 0.9;

    // Use Levenshtein distance for similarity
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private differOnlyByVariant(name1: string, name2: string): boolean {
    const variants = ['small', 'medium', 'large', 'xl', 'xxl', 'red', 'blue', 'green', 'black', 'white'];
    
    for (const variant of variants) {
      const pattern1 = name1.replace(new RegExp(`\\b${variant}\\b`, 'gi'), '').trim();
      const pattern2 = name2.replace(new RegExp(`\\b${variant}\\b`, 'gi'), '').trim();
      
      if (pattern1 === pattern2 && pattern1.length > 0) {
        return true;
      }
    }
    
    return false;
  }
}