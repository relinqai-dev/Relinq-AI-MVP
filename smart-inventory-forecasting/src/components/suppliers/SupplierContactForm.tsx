/**
 * Supplier Contact Form Component
 * Allows users to add/update supplier contact information
 * Requirement 5.6: Implement supplier information prompting when details are missing
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

interface SupplierContactFormProps {
  supplierId: string
  supplierName: string
  currentEmail?: string
  currentPhone?: string
  currentAddress?: string
  missingFields: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SupplierContactForm({
  supplierId,
  supplierName,
  currentEmail = '',
  currentPhone = '',
  currentAddress = '',
  missingFields,
  open,
  onOpenChange,
  onSuccess
}: SupplierContactFormProps) {
  const [email, setEmail] = useState(currentEmail)
  const [phone, setPhone] = useState(currentPhone)
  const [address, setAddress] = useState(currentAddress)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Validate required fields
      if (missingFields.includes('contact_email') && !email) {
        setError('Email address is required')
        return
      }

      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_email: email || undefined,
          contact_phone: phone || undefined,
          address: address || undefined
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update supplier')
      }

      setSuccess(true)
      
      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      }, 1500)
    } catch (err) {
      console.error('Error updating supplier:', err)
      setError(err instanceof Error ? err.message : 'Failed to update supplier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Supplier Contact Information</DialogTitle>
          <DialogDescription>
            Add contact information for {supplierName} to enable purchase order generation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Missing Fields Warning */}
          {missingFields.length > 0 && !success && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Missing required fields: {missingFields.map(f => f.replace('contact_', '')).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Supplier information updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address {missingFields.includes('contact_email') && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supplier@example.com"
                required={missingFields.includes('contact_email')}
                disabled={saving || success}
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={saving || success}
              />
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State ZIP"
                disabled={saving || success}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || success}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
