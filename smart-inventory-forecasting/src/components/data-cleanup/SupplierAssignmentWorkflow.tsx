'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem, Supplier, CreateSupplier } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Check,
  X,
  Package,
  Building,
  Mail,
  Phone
} from 'lucide-react';

interface SupplierAssignmentWorkflowProps {
  items: InventoryItem[];
  suppliers: Supplier[];
  onAssignSuppliers: (assignments: Array<{ itemId: string; supplierId: string }>) => Promise<boolean>;
  onCreateSupplier: (supplier: CreateSupplier) => Promise<Supplier | null>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SupplierAssignmentWorkflow({
  items,
  suppliers,
  onAssignSuppliers,
  onCreateSupplier,
  onCancel,
  isLoading = false
}: SupplierAssignmentWorkflowProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkSupplierId, setBulkSupplierId] = useState<string>('');
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState<CreateSupplier>({
    name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    lead_time_days: 7
  });

  // Initialize with all items selected
  useEffect(() => {
    if (items.length > 0) {
      const newSet = new Set(items.map(item => item.id));
      // Only update if different to prevent cascading renders
      setSelectedItems(prevSelected => {
        if (prevSelected.size !== newSet.size || 
            !Array.from(newSet).every(id => prevSelected.has(id))) {
          return newSet;
        }
        return prevSelected;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleItemSelection = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleAssignmentChange = (itemId: string, supplierId: string) => {
    setAssignments(prev => ({
      ...prev,
      [itemId]: supplierId
    }));
  };

  const handleBulkAssignment = () => {
    if (!bulkSupplierId) return;
    
    const newAssignments = { ...assignments };
    selectedItems.forEach(itemId => {
      newAssignments[itemId] = bulkSupplierId;
    });
    setAssignments(newAssignments);
    setBulkSupplierId('');
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name.trim()) return;
    
    const created = await onCreateSupplier(newSupplier);
    if (created) {
      setShowNewSupplierDialog(false);
      setNewSupplier({
        name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        lead_time_days: 7
      });
      // Auto-select the new supplier for bulk assignment
      setBulkSupplierId(created.id);
    }
  };

  const handleSaveAssignments = async () => {
    const assignmentList = Object.entries(assignments)
      .filter(([, supplierId]) => supplierId)
      .map(([itemId, supplierId]) => ({ itemId, supplierId }));
    
    if (assignmentList.length === 0) return;
    
    await onAssignSuppliers(assignmentList);
  };

  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const canSave = assignedCount > 0;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assign Suppliers to Items
        </CardTitle>
        <CardDescription>
          Assign suppliers to items that are missing supplier information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bulk Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bulk Assignment</CardTitle>
            <CardDescription>
              Assign the same supplier to multiple items at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span>{selectedItems.size} of {items.length} items selected</span>
              <Button variant="link" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="link" size="sm" onClick={handleClearSelection}>
                Clear All
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={bulkSupplierId} onValueChange={setBulkSupplierId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select supplier for bulk assignment" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                    <DialogDescription>
                      Create a new supplier to assign to your items
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="supplier-name">Supplier Name *</Label>
                      <Input
                        id="supplier-name"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier-email">Contact Email</Label>
                      <Input
                        id="supplier-email"
                        type="email"
                        value={newSupplier.contact_email}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_email: e.target.value }))}
                        placeholder="supplier@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier-phone">Contact Phone</Label>
                      <Input
                        id="supplier-phone"
                        value={newSupplier.contact_phone}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier-address">Address</Label>
                      <Textarea
                        id="supplier-address"
                        value={newSupplier.address}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Supplier address"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-time">Lead Time (days)</Label>
                      <Input
                        id="lead-time"
                        type="number"
                        min="1"
                        value={newSupplier.lead_time_days}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, lead_time_days: parseInt(e.target.value) || 7 }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewSupplierDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSupplier} disabled={!newSupplier.name.trim()}>
                        Create Supplier
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                onClick={handleBulkAssignment}
                disabled={!bulkSupplierId || selectedItems.size === 0}
              >
                Assign to Selected
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Individual Item Assignments */}
        <div>
          <h3 className="font-medium mb-4">Individual Item Assignments</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg ${
                  selectedItems.has(item.id) ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline">{item.sku}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.current_stock} units
                      {item.unit_cost && ` • Cost: $${item.unit_cost.toFixed(2)}`}
                    </p>
                  </div>
                  
                  <div className="w-64">
                    <Select
                      value={assignments[item.id] || ''}
                      onValueChange={(value) => handleAssignmentChange(item.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{supplier.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {supplier.contact_email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {supplier.contact_email}
                                    </span>
                                  )}
                                  {supplier.contact_phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {supplier.contact_phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Assignment Summary</p>
                <p className="text-sm text-muted-foreground">
                  {assignedCount} of {items.length} items have suppliers assigned
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAssignments}
                  disabled={!canSave || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Assignments ({assignedCount})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}