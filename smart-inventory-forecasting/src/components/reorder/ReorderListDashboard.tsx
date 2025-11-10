/**
 * Reorder List Dashboard Component
 * Displays reorder recommendations grouped by supplier
 * Requirements: 5.1, 5.6
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { EmailPreviewDialog } from '@/components/purchase-orders'
import { SupplierContactForm } from '@/components/suppliers/SupplierContactForm'
import { 
  Package, 
  AlertTriangle, 
  RefreshCw,
  Mail,
  FileText,
  User,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Loader2
} from 'lucide-react'
import { ReorderListBySupplier, ReorderRecommendation } from '@/types/business'

interface ReorderListDashboardProps {
  className?: string
}

export function ReorderListDashboard({ className }: ReorderListDashboardProps) {
  const [reorderList, setReorderList] = useState<ReorderListBySupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map())
  const [generatingPO, setGeneratingPO] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null)
  const [supplierFormOpen, setSupplierFormOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<ReorderListBySupplier | null>(null)

  useEffect(() => {
    loadReorderList()
  }, [])

  const loadReorderList = async () => {
    try {
      setError(null)
      const response = await fetch('/api/reorder-list')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load reorder list')
      }

      setReorderList(result.data)
      
      // Initialize quantities with recommended values
      const initialQuantities = new Map<string, number>()
      result.data.forEach((group: ReorderListBySupplier) => {
        group.items.forEach((item: ReorderRecommendation) => {
          initialQuantities.set(item.sku, item.recommended_quantity)
        })
      })
      setQuantities(initialQuantities)
    } catch (err) {
      console.error('Error loading reorder list:', err)
      setError(err instanceof Error ? err.message : 'Failed to load reorder list')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReorderList()
    setRefreshing(false)
  }

  const handleItemToggle = (sku: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(sku)) {
      newSelected.delete(sku)
    } else {
      newSelected.add(sku)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAllInGroup = (group: ReorderListBySupplier) => {
    const newSelected = new Set(selectedItems)
    const allSelected = group.items.every(item => selectedItems.has(item.sku))
    
    if (allSelected) {
      // Deselect all
      group.items.forEach(item => newSelected.delete(item.sku))
    } else {
      // Select all
      group.items.forEach(item => newSelected.add(item.sku))
    }
    
    setSelectedItems(newSelected)
  }

  const handleQuantityChange = (sku: string, value: string) => {
    const quantity = parseInt(value) || 0
    const newQuantities = new Map(quantities)
    newQuantities.set(sku, quantity)
    setQuantities(newQuantities)
  }

  const getUrgencyColor = (urgency: ReorderRecommendation['urgency']) => {
    switch (urgency) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'secondary'
      case 'medium':
        return 'outline'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getTotalSelectedItems = () => selectedItems.size

  const getTotalSelectedValue = () => {
    let total = 0
    reorderList.forEach(group => {
      group.items.forEach(item => {
        if (selectedItems.has(item.sku)) {
          total += quantities.get(item.sku) || 0
        }
      })
    })
    return total
  }

  const handleGeneratePO = async (supplierId: string, items: ReorderRecommendation[]) => {
    try {
      setGeneratingPO(supplierId)
      setError(null)

      // Get selected items for this supplier
      const selectedSupplierItems = items
        .filter(item => selectedItems.has(item.sku))
        .map(item => ({
          sku: item.sku,
          quantity: quantities.get(item.sku) || item.recommended_quantity
        }))

      if (selectedSupplierItems.length === 0) {
        setError('Please select at least one item to generate a purchase order')
        return
      }

      // Generate PO
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supplier_id: supplierId,
          items: selectedSupplierItems
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate purchase order')
      }

      // Open email dialog
      setSelectedPOId(result.data.purchase_order.id)
      setEmailDialogOpen(true)
    } catch (err) {
      console.error('Error generating purchase order:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate purchase order')
    } finally {
      setGeneratingPO(null)
    }
  }

  const handleEmailSent = () => {
    // Refresh the reorder list after email is sent
    loadReorderList()
  }

  const handleUpdateSupplier = (group: ReorderListBySupplier) => {
    setSelectedSupplier(group)
    setSupplierFormOpen(true)
  }

  const handleSupplierUpdated = () => {
    // Refresh the reorder list after supplier is updated
    loadReorderList()
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Reorder List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading reorder recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Reorder List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (reorderList.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Reorder List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              No items need reordering at this time. All inventory levels look good!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Reorder List
              </CardTitle>
              <CardDescription>
                Items grouped by supplier for easy purchase order generation
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>

        {/* Summary Stats */}
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{getTotalSelectedItems()}</p>
                <p className="text-sm text-muted-foreground">Items Selected</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{reorderList.length}</p>
                <p className="text-sm text-muted-foreground">Suppliers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{getTotalSelectedValue()}</p>
                <p className="text-sm text-muted-foreground">Total Units</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Groups */}
      <div className="space-y-6">
        {reorderList.map((group) => (
          <SupplierGroupCard
            key={group.supplier_id}
            group={group}
            selectedItems={selectedItems}
            quantities={quantities}
            onItemToggle={handleItemToggle}
            onSelectAll={handleSelectAllInGroup}
            onQuantityChange={handleQuantityChange}
            getUrgencyColor={getUrgencyColor}
            onGeneratePO={handleGeneratePO}
            generatingPO={generatingPO === group.supplier_id}
            onUpdateSupplier={handleUpdateSupplier}
          />
        ))}
      </div>

      {/* Email Preview Dialog */}
      {selectedPOId && (
        <EmailPreviewDialog
          purchaseOrderId={selectedPOId}
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          onEmailSent={handleEmailSent}
        />
      )}

      {/* Supplier Contact Form - Requirement 5.6 */}
      {selectedSupplier && (
        <SupplierContactForm
          supplierId={selectedSupplier.supplier_id}
          supplierName={selectedSupplier.supplier_name}
          currentEmail={selectedSupplier.supplier_email}
          missingFields={selectedSupplier.missing_supplier_fields}
          open={supplierFormOpen}
          onOpenChange={setSupplierFormOpen}
          onSuccess={handleSupplierUpdated}
        />
      )}
    </div>
  )
}

interface SupplierGroupCardProps {
  group: ReorderListBySupplier
  selectedItems: Set<string>
  quantities: Map<string, number>
  onItemToggle: (sku: string) => void
  onSelectAll: (group: ReorderListBySupplier) => void
  onQuantityChange: (sku: string, value: string) => void
  getUrgencyColor: (urgency: ReorderRecommendation['urgency']) => string
  onGeneratePO: (supplierId: string, items: ReorderRecommendation[]) => void
  generatingPO: boolean
  onUpdateSupplier: (group: ReorderListBySupplier) => void
}

function SupplierGroupCard({
  group,
  selectedItems,
  quantities,
  onItemToggle,
  onSelectAll,
  onQuantityChange,
  getUrgencyColor,
  onGeneratePO,
  generatingPO,
  onUpdateSupplier
}: SupplierGroupCardProps) {
  const allSelected = group.items.every(item => selectedItems.has(item.sku))
  const selectedCount = group.items.filter(item => selectedItems.has(item.sku)).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => onSelectAll(group)}
                className="mt-1"
              />
              <div>
                <CardTitle className="text-lg">{group.supplier_name}</CardTitle>
                {group.supplier_id !== 'unassigned' && (
                  <CardDescription className="flex items-center gap-4 mt-1">
                    {group.supplier_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {group.supplier_email}
                      </span>
                    )}
                  </CardDescription>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
              <span>{group.total_items} items</span>
              {selectedCount > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{selectedCount} selected</span>
                </>
              )}
            </div>
          </div>

          {/* Supplier Validation Status - Requirement 5.6 */}
          <div className="flex flex-col items-end gap-2">
            {group.can_generate_po ? (
              <Badge variant="outline" className="border-green-500 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready for PO
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-700">
                <XCircle className="h-3 w-3 mr-1" />
                Missing Info
              </Badge>
            )}
          </div>
        </div>

        {/* Missing Fields Warning - Requirement 5.6: Prompt when supplier info missing */}
        {!group.can_generate_po && group.missing_supplier_fields.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cannot generate purchase order. Missing: {group.missing_supplier_fields.join(', ')}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => onUpdateSupplier(group)}
              >
                Update Supplier Info
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {group.items.map((item) => (
            <ReorderItemRow
              key={item.sku}
              item={item}
              selected={selectedItems.has(item.sku)}
              quantity={quantities.get(item.sku) || item.recommended_quantity}
              onToggle={() => onItemToggle(item.sku)}
              onQuantityChange={(value) => onQuantityChange(item.sku, value)}
              getUrgencyColor={getUrgencyColor}
            />
          ))}
        </div>

        {/* Action Buttons - Requirements 5.3, 5.5 */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
          <Button 
            size="sm" 
            disabled={!group.can_generate_po || selectedCount === 0 || generatingPO}
            onClick={() => onGeneratePO(group.supplier_id, group.items)}
            className="flex items-center gap-2"
          >
            {generatingPO ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate PO & Email ({selectedCount} items)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ReorderItemRowProps {
  item: ReorderRecommendation
  selected: boolean
  quantity: number
  onToggle: () => void
  onQuantityChange: (value: string) => void
  getUrgencyColor: (urgency: ReorderRecommendation['urgency']) => string
}

function ReorderItemRow({
  item,
  selected,
  quantity,
  onToggle,
  onQuantityChange,
  getUrgencyColor
}: ReorderItemRowProps) {
  return (
    <div className={`border rounded-lg p-4 ${selected ? 'bg-blue-50 border-blue-200' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="mt-1"
        />

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="font-medium">{item.item_name}</div>
              <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
            </div>
            <Badge variant={getUrgencyColor(item.urgency) as "default" | "secondary" | "destructive" | "outline"}>
              {item.urgency.toUpperCase()}
            </Badge>
          </div>

          {/* Stock Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-2">
            <div>
              <span className="text-muted-foreground">Current Stock:</span>
              <span className="ml-2 font-medium">{item.current_stock}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Recommended:</span>
              <span className="ml-2 font-medium">{item.recommended_quantity}</span>
            </div>
          </div>

          {/* Reasoning */}
          <div className="text-sm text-muted-foreground mb-3">
            {item.reasoning}
          </div>

          {/* Quantity Adjustment - Requirement: quantity adjustment controls */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Order Quantity:</label>
            <Input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              className="w-24"
              disabled={!selected}
            />
            <span className="text-sm text-muted-foreground">units</span>
          </div>
        </div>
      </div>
    </div>
  )
}
