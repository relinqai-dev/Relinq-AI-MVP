'use client';

import React from 'react';
import { CleanupReport } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, Target } from 'lucide-react';

interface ProgressTrackerProps {
  report: CleanupReport;
}

export function ProgressTracker({ report }: ProgressTrackerProps) {
  const getStatusIcon = () => {
    if (report.completion_percentage === 100) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (report.blocking_forecasting) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    } else {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (report.completion_percentage === 100) {
      return 'All data quality issues resolved!';
    } else if (report.blocking_forecasting) {
      return 'Critical issues blocking forecasting';
    } else {
      return 'Data cleanup in progress';
    }
  };

  const getStatusColor = () => {
    if (report.completion_percentage === 100) {
      return 'default';
    } else if (report.blocking_forecasting) {
      return 'destructive';
    } else {
      return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Cleanup Progress
            </CardTitle>
            <CardDescription>
              Track your data quality improvement progress
            </CardDescription>
          </div>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusMessage()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{Math.round(report.completion_percentage)}%</span>
          </div>
          <Progress value={report.completion_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {report.total_issues}
            </div>
            <div className="text-sm text-muted-foreground">Total Issues</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((report.total_issues * report.completion_percentage) / 100)}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {report.total_issues - Math.round((report.total_issues * report.completion_percentage) / 100)}
            </div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
        </div>

        {Object.keys(report.issues_by_type).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Issues by Type</h4>
            {Object.entries(report.issues_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="capitalize">{type.replace('_', ' ')}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}