'use client';

import React from 'react';
import { CleanupIssue } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface IssuesListProps {
  issues: CleanupIssue[];
  selectedIssues: Set<string>;
  onSelectIssue: (issueId: string, selected: boolean) => void;
  onResolveIssue: (issueId: string) => Promise<void>;
  onSelectAll: (issues: CleanupIssue[]) => void;
  onClearSelection: () => void;
  isResolving: boolean;
  title: string;
  description: string;
  emptyMessage: string;
}

export function IssuesList({
  issues,
  selectedIssues,
  onSelectIssue,
  onResolveIssue,
  onSelectAll,
  onClearSelection,
  isResolving,
  title,
  description,
  emptyMessage
}: IssuesListProps) {
  const unresolvedIssues = issues.filter(issue => !issue.resolved);
  const allSelected = unresolvedIssues.length > 0 && unresolvedIssues.every(issue => selectedIssues.has(issue.id));

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">{emptyMessage}</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {unresolvedIssues.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll(unresolvedIssues);
                  } else {
                    onClearSelection();
                  }
                }}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({unresolvedIssues.length})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={`flex items-center justify-between p-4 border rounded-lg ${
              issue.resolved ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              {!issue.resolved && (
                <Checkbox
                  checked={selectedIssues.has(issue.id)}
                  onCheckedChange={(checked) => onSelectIssue(issue.id, !!checked)}
                />
              )}
              {getSeverityIcon(issue.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getSeverityColor(issue.severity)}>
                    {issue.severity}
                  </Badge>
                  {issue.resolved && (
                    <Badge variant="outline" className="text-green-600">
                      Resolved
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {issue.suggested_action}
                </p>
                <div className="text-xs text-muted-foreground">
                  Affected items: {issue.affected_items?.join(', ') || 'None'}
                </div>
              </div>
            </div>
            {!issue.resolved && (
              <Button
                onClick={() => onResolveIssue(issue.id)}
                disabled={isResolving}
                size="sm"
              >
                Resolve
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}