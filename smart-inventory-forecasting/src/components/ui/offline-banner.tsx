/**
 * Offline Banner Component
 * Requirement 6.4: Offline detection with appropriate connectivity messaging
 */

'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()

  if (isOnline && !wasOffline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-area-padding">
      {!isOnline ? (
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Some features may not be available.
          </AlertDescription>
        </Alert>
      ) : wasOffline ? (
        <Alert className="rounded-none border-x-0 border-t-0 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Connection restored. You are back online.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
