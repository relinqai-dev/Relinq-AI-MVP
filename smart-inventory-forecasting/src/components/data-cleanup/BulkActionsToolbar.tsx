'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, X } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onResolveSelected: () => Promise<void>;
  onClearSelection: () => void;
  isResolving: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  onResolveSelected,
  onClearSelection,
  isResolving
}: BulkActionsToolbarProps) {
  return (
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg">
      <CardContent className="flex items-center gap-4 p-4">
        <span className="text-sm font-medium">
          {selectedCount} issue{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center gap-2">
          <Button
            onClick={onResolveSelected}
            disabled={isResolving}
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isResolving ? 'Resolving...' : 'Resolve Selected'}
          </Button>
          <Button
            onClick={onClearSelection}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}