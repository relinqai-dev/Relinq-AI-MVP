/**
 * Email Preview Dialog Component
 * Shows email preview and provides send functionality
 * Requirements: 5.3, 5.5
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, ExternalLink, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface EmailTemplate {
  subject: string
  body: string
  to: string
  cc?: string
  bcc?: string
}

interface EmailPreviewDialogProps {
  purchaseOrderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onEmailSent?: () => void
}

export function EmailPreviewDialog({
  purchaseOrderId,
  open,
  onOpenChange,
  onEmailSent
}: EmailPreviewDialogProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailData, setEmailData] = useState<{
    email: EmailTemplate
    mailto_link: string
    preview_html: string
    supplier: {
      id: string
      name: string
      email: string
    }
  } | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (open) {
      loadEmailPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, purchaseOrderId])

  const loadEmailPreview = async () => {
    try {
      setLoading(true)
      setError(null)
      setSent(false)

      const response = await fetch(`/api/purchase-orders/${purchaseOrderId}/email`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load email preview')
      }

      setEmailData(result.data)
    } catch (err) {
      console.error('Error loading email preview:', err)
      setError(err instanceof Error ? err.message : 'Failed to load email preview')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailData) return

    try {
      setSending(true)

      // Open mailto link - Requirement 5.5: One-click email sending via mailto links
      window.location.href = emailData.mailto_link

      // Mark as sent after a short delay (user has time to send)
      setTimeout(async () => {
        try {
          const response = await fetch(`/api/purchase-orders/${purchaseOrderId}/email`, {
            method: 'POST'
          })

          const result = await response.json()

          if (result.success) {
            setSent(true)
            if (onEmailSent) {
              onEmailSent()
            }
          }
        } catch (err) {
          console.error('Error marking email as sent:', err)
        } finally {
          setSending(false)
        }
      }, 2000)
    } catch (err) {
      console.error('Error sending email:', err)
      setSending(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!emailData) return

    try {
      await navigator.clipboard.writeText(emailData.email.body)
      // Could add a toast notification here
    } catch (err) {
      console.error('Error copying to clipboard:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preview
          </DialogTitle>
          <DialogDescription>
            Review the email before sending to supplier
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading email preview...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadEmailPreview}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && emailData && (
          <>
            {/* Email Preview - Requirement: Create email preview functionality before sending */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="mb-4 pb-4 border-b">
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">To:</span>{' '}
                  <span className="text-gray-900">{emailData.email.to}</span>
                </div>
                {emailData.email.cc && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">CC:</span>{' '}
                    <span className="text-gray-900">{emailData.email.cc}</span>
                  </div>
                )}
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Subject:</span>{' '}
                  <span className="text-gray-900">{emailData.email.subject}</span>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-gray-900 font-mono text-sm bg-white p-4 rounded border">
                {emailData.email.body}
              </div>
            </div>

            {/* Success Message */}
            {sent && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Email client opened successfully. Purchase order marked as sent.
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Clicking &quot;Send Email&quot; will open your default email client with the message pre-filled.
                Don&apos;t forget to attach the PDF purchase order before sending!
              </AlertDescription>
            </Alert>
          </>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Close
          </Button>
          
          {emailData && (
            <>
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                disabled={sending}
              >
                Copy Text
              </Button>
              
              <Button
                onClick={handleSendEmail}
                disabled={sending || sent}
                className="flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Email Client...
                  </>
                ) : sent ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Email Sent
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
