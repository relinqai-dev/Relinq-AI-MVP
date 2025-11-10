/**
 * Hook to detect touch-capable devices
 * Requirement 6.2: Touch-friendly interactions and gestures for mobile devices
 */

'use client'

import { useEffect, useState } from 'react'

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is legacy IE property
        navigator.msMaxTouchPoints > 0
      )
    }
    return false
  })

  useEffect(() => {
    // Re-check on mount in case initial state was wrong
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is legacy IE property
        navigator.msMaxTouchPoints > 0
      )
    }

    const isTouchEnabled = checkTouchDevice()
    if (isTouchEnabled !== isTouchDevice) {
      setIsTouchDevice(isTouchEnabled)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isTouchDevice
}
