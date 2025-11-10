'use client';

import React, { useEffect, useState } from 'react';
import { useDataCleanup } from '@/hooks/useDataCleanup';
import { CleanupIssue } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Users, 
  Copy, 
  TrendingDown,
  Play,
  AlertCircle
} from 'lucide-react';
import { IssueResolutionPanel } from './IssueResolutionPanel';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { IssuesList } from './IssuesList';
import { ProgressTracker } from './ProgressTracker';

interface DataCleanupDashboardProps {
  onComplete?: () => void;
}

export function DataCleanupDashboard({ onComplete }: DataCleanupDashboardProps) {
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const {
    report,
    isLoading,
    isScanning,
    isResolvingIssues,
    error,
    lastScanTime,
    forecastingBlocked,
    runScan,
    generateReport,
    resolveIssue,
    resolveMultipleIssues,
    clearError,
    getIssuesByType,
    getIssuesBySeverity,
    getUnresolvedIssues,
    getForecastingBlockedMessage,
    getCompletionPercentage,
    getTotalIssues,
    getResolvedIssues
  } = useDataCleanup({
    autoRefresh: true,
    refreshInterval: 30000,
    onScanComplete: (report) => {
      if (report.completion_percentage === 100) {
        onComplete?.();
      }
    },
    onError: (error) => {
      console.error('Data cleanup error:', error);
    }
  });

  // Load initial report on mount
  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const handleRunScan = async () => {
    await runScan();
    setSelectedIssues(new Set()); // Clear selections after scan
  };

  const handleResolveSelected = async () => {
    if (selectedIssues.size === 0) return;
    
    const success = await resolveMultipleIssues(Array.from(selectedIssues));
    if (success) {
      setSelectedIssues(new Set());
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    const success = await resolveIssue(issueId);
    if (success) {
      setSelectedIssues(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  const handleSelectIssue = (issueId: string, selected: boolean) => {
    setSelectedIssues(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(issueId);
      } else {
        newSet.delete(issueId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (issues: CleanupIssue[]) => {
    const unresolvedIssueIds = issues.filter(issue => !issue.resolved).map(issue => issue.id);
    setSelectedIssues(new Set(unresolvedIssueIds));
  };

  const handleClearSelection = () => {
    setSelectedIssues(new Set());
  };

  const unresolvedIssues = getUnresolvedIssues();
  const completionPercentage = getCompletionPercentage();
  const totalIssues = getTotalIssues();
  const resolvedIssues = getResolvedIssues();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Cleanup</h1>
          <p className="text-muted-foreground">
            Review and resolve data quality issues to enable accurate forecasting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={generateReport}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <Play className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Forecasting Status Alert */}
      {forecastingBlocked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Forecasting Blocked</AlertTitle>
          <AlertDescription>
            {getForecastingBlockedMessage()}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {completionPercentage === 100 && totalIssues > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Data Cleanup Complete!</AlertTitle>
          <AlertDescription>
            All data quality issues have been resolved. Forecasting is now available.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {unresolvedIssues.length} unresolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionPercentage)}%</div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getIssuesBySeverity('high').filter(issue => !issue.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastScanTime ? lastScanTime.toLocaleDateString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastScanTime ? lastScanTime.toLocaleTimeString() : 'Run your first scan'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker */}
      {report && (
        <ProgressTracker report={report} />
      )}

      {/* Main Content */}
      {report && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="duplicates">
              Duplicates ({getIssuesByType('duplicate').filter(issue => !issue.resolved).length})
            </TabsTrigger>
            <TabsTrigger value="suppliers">
              Missing Suppliers ({getIssuesByType('missing_supplier').filter(issue => !issue.resolved).length})
            </TabsTrigger>
            <TabsTrigger value="sales">
              No Sales History ({getIssuesByType('no_sales_history').filter(issue => !issue.resolved).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cleanup Summary</CardTitle>
                <CardDescription>
                  Overview of all data quality issues found in your inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(report.issues_by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type === 'duplicate' ? <Copy className="h-4 w-4" /> : 
                       type === 'missing_supplier' ? <Users className="h-4 w-4" /> : 
                       <TrendingDown className="h-4 w-4" />}
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="outline">{count} issues</Badge>
                  </div>
                ))}
                
                {totalIssues === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Issues Found</h3>
                    <p className="text-muted-foreground">
                      Your data is clean and ready for forecasting!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duplicates" className="space-y-4">
            <IssuesList
              issues={getIssuesByType('duplicate')}
              selectedIssues={selectedIssues}
              onSelectIssue={handleSelectIssue}
              onResolveIssue={handleResolveIssue}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              isResolving={isResolvingIssues}
              title="Duplicate Items"
              description="Items with similar names that might be duplicates"
              emptyMessage="No duplicate items found"
            />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <IssuesList
              issues={getIssuesByType('missing_supplier')}
              selectedIssues={selectedIssues}
              onSelectIssue={handleSelectIssue}
              onResolveIssue={handleResolveIssue}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              isResolving={isResolvingIssues}
              title="Missing Supplier Information"
              description="Items that need supplier assignment for purchase orders"
              emptyMessage="All items have supplier information"
            />
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <IssuesList
              issues={getIssuesByType('no_sales_history')}
              selectedIssues={selectedIssues}
              onSelectIssue={handleSelectIssue}
              onResolveIssue={handleResolveIssue}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              isResolving={isResolvingIssues}
              title="No Sales History"
              description="Items without any recorded sales data"
              emptyMessage="All items have sales history"
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedIssues.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIssues.size}
          onResolveSelected={handleResolveSelected}
          onClearSelection={handleClearSelection}
          isResolving={isResolvingIssues}
        />
      )}

      {/* Issue Resolution Panel */}
      {unresolvedIssues.length > 0 && (
        <IssueResolutionPanel
          issues={unresolvedIssues}
          onResolveIssue={handleResolveIssue}
          isResolving={isResolvingIssues}
        />
      )}
    </div>
  );
}