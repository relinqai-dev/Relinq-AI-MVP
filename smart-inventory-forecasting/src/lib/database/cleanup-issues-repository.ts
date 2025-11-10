// Cleanup issues repository with CRUD operations
import { BaseRepository } from './base-repository';
import { CleanupIssue, CreateCleanupIssue, UpdateCleanupIssue, ApiResponse } from '@/types';

export class CleanupIssuesRepository extends BaseRepository<CleanupIssue, CreateCleanupIssue, UpdateCleanupIssue> {
  protected tableName = 'cleanup_issues';

  async findByType(
    issueType: 'duplicate' | 'missing_supplier' | 'no_sales_history',
    userId: string
  ): Promise<ApiResponse<CleanupIssue[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('issue_type', issueType)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async findUnresolved(userId: string): Promise<ApiResponse<CleanupIssue[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('resolved', false)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async markResolved(id: string, userId: string): Promise<ApiResponse<CleanupIssue>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({ resolved: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
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

  async markMultipleResolved(ids: string[], userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({ resolved: true })
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

  async getIssuesSummary(userId: string): Promise<ApiResponse<{
    total_issues: number;
    issues_by_type: Record<string, number>;
    issues_by_severity: Record<string, number>;
    completion_percentage: number;
    blocking_forecasting: boolean;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('issue_type, severity, resolved')
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      const issues = data || [];
      const total_issues = issues.length;
      const resolved_issues = issues.filter((issue: { resolved: boolean }) => issue.resolved).length;

      const issues_by_type = issues.reduce((acc: Record<string, number>, issue: { issue_type: string }) => {
        acc[issue.issue_type] = (acc[issue.issue_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const issues_by_severity = issues.reduce((acc: Record<string, number>, issue: { severity: string }) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const completion_percentage = total_issues > 0 ? (resolved_issues / total_issues) * 100 : 100;
      
      // Forecasting is blocked if there are any unresolved high or medium severity issues
      const blocking_forecasting = issues.some((issue: { resolved?: boolean; severity?: string }) => 
        !issue.resolved && (issue.severity === 'high' || issue.severity === 'medium')
      );

      return {
        success: true,
        data: {
          total_issues,
          issues_by_type,
          issues_by_severity,
          completion_percentage,
          blocking_forecasting
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async clearResolvedIssues(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('resolved', true);

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
}

// Export singleton instance
export const cleanupIssuesRepository = new CleanupIssuesRepository();