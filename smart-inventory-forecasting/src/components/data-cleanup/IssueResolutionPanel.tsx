'use client';

import React from 'react';
import { CleanupIssue } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface IssueResolutionPanelProps {
  issues: CleanupIssue[];
  onResolveIssue: (issueId: string) => Promise<void>;
  isResolving: boolean;
}

export function IssueResolutionPanel({ 
  issues, 
  onResolveIssue, 
  isResolving 
}: IssueResolutionPanelProps) {
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
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">All Issues Resolved!</h3>
          <p className="text-muted-foreground">
            Great job! All data quality issues have been resolved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Resolution</CardTitle>
        <CardDescription>
          Review and resolve data quality issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-start gap-3 flex-1">
              {getSeverityIcon(issue.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getSeverityColor(issue.severity)}>
                    {issue.severity}
                  </Badge>
                  <Badge variant="outline">
                    {issue.issue_type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {issue.suggested_action}
                </p>
                <div className="text-xs text-muted-foreground">
                  Affected items: {issue.affected_items?.join(', ') || 'None'}
                </div>
              </div>
            </div>
            <Button
              onClick={() => onResolveIssue(issue.id)}
              disabled={isResolving || issue.resolved}
              size="sm"
            >
              {issue.resolved ? 'Resolved' : 'Resolve'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}