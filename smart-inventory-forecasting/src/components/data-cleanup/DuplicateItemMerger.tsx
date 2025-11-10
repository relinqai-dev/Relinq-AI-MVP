'use client';

import { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Copy, 
  AlertTriangle, 
  Check,
  X,
  Package
} from 'lucide-react';

interface DuplicateItemMergerProps {
  duplicateItems: InventoryItem[];
  onMerge: (primaryItem: InventoryItem, itemsToMerge: InventoryItem[], mergedData: Partial<InventoryItem>) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DuplicateItemMerger({
  duplicateItems,
  onMerge,
  onCancel,
  isLoading = false
}: DuplicateItemMergerProps) {
  const [primaryItemId, setPrimaryItemId] = useState<string>('');
  const [mergedName, setMergedName] = useState<string>('');
  const [mergedSku, setMergedSku] = useState<string>('');

  // Calculate totals using useMemo to avoid cascading renders
  const { totalStock, averageCost } = useMemo(() => {
    const total = duplicateItems.reduce((sum, item) => sum + item.current_stock, 0);
    const weightedCostSum = duplicateItems.reduce((sum, item) => {
      const cost = item.unit_cost || 0;
      const stock = item.current_stock;
      return sum + (cost * stock);
    }, 0);
    const avgCost = total > 0 ? weightedCostSum / total : 0;
    
    return { totalStock: total, averageCost: avgCost };
  }, [duplicateItems]);

  // Set default primary item only once when component mounts
  useEffect(() => {
    if (duplicateItems.length > 0 && !primaryItemId) {
      const primaryItem = duplicateItems.reduce((prev, current) => 
        current.current_stock > prev.current_stock ? current : prev
      );
      // Batch state updates to prevent cascading renders
      setPrimaryItemId(primaryItem.id);
      setMergedName(primaryItem.name);
      setMergedSku(primaryItem.sku);
    }
  // Only run when duplicateItems changes, not primaryItemId
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicateItems]);

  const handlePrimaryItemChange = (itemId: string) => {
    setPrimaryItemId(itemId);
    const selectedItem = duplicateItems.find(item => item.id === itemId);
    if (selectedItem) {
      setMergedName(selectedItem.name);
      setMergedSku(selectedItem.sku);
    }
  };

  const handleMerge = async () => {
    const primaryItem = duplicateItems.find(item => item.id === primaryItemId);
    if (!primaryItem) return;

    const itemsToMerge = duplicateItems.filter(item => item.id !== primaryItemId);
    const mergedData: Partial<InventoryItem> = {
      name: mergedName,
      sku: mergedSku,
      current_stock: totalStock,
      unit_cost: averageCost
    };

    await onMerge(primaryItem, itemsToMerge, mergedData);
  };

  const canMerge = primaryItemId && mergedName.trim() && mergedSku.trim();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="h-5 w-5" />
          Merge Duplicate Items
        </CardTitle>
        <CardDescription>
          Select the primary item and review the merged data before confirming
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Items */}
        <div>
          <h3 className="font-medium mb-3">Items to Merge</h3>
          <div className="grid gap-3">
            {duplicateItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg ${
                  item.id === primaryItemId ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.current_stock} units</p>
                    <p className="text-sm text-muted-foreground">
                      ${(item.unit_cost || 0).toFixed(2)} each
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Primary Item Selection */}
        <div>
          <Label className="text-base font-medium">Select Primary Item</Label>
          <p className="text-sm text-muted-foreground mb-3">
            The primary item will be kept, and other items will be merged into it
          </p>
          <RadioGroup value={primaryItemId} onValueChange={handlePrimaryItemChange}>
            {duplicateItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <RadioGroupItem value={item.id} id={item.id} />
                <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>{item.name} ({item.sku})</span>
                    <Badge variant="outline">
                      {item.current_stock} units
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Merged Item Preview */}
        <div>
          <h3 className="font-medium mb-3">Merged Item Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="merged-name">Item Name</Label>
              <Input
                id="merged-name"
                value={mergedName}
                onChange={(e) => setMergedName(e.target.value)}
                placeholder="Enter merged item name"
              />
            </div>
            <div>
              <Label htmlFor="merged-sku">SKU</Label>
              <Input
                id="merged-sku"
                value={mergedSku}
                onChange={(e) => setMergedSku(e.target.value)}
                placeholder="Enter merged SKU"
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Calculated Values</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label className="text-sm text-muted-foreground">Total Stock</Label>
                <p className="font-medium">{totalStock} units</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Average Unit Cost</Label>
                <p className="font-medium">${averageCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action cannot be undone. The non-primary items will be removed from your inventory,
            and their stock quantities will be added to the primary item.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={!canMerge || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Merging...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Merge Items
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}