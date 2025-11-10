/**
 * Hook to maintain session consistency across device switches
 * Requirement 6.5: Session consistency across device switches
 */

'use client'

import { useEffect, useState, useCallback } from 'react'

interface SessionData {
  lastActive: number
  deviceInfo: string
  sessionId: string
}

// Helper functions outside component to avoid recreating
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

const getDeviceInfo = () => {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

const getInitialSession = (): SessionData => {
  const stored = localStorage.getItem('session_data')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Fall through to create new session
    }
  }
  
  const data: SessionData = {
    lastActive: Date.now(),
    deviceInfo: getDeviceInfo(),
    sessionId: getSessionId()
  }
  localStorage.setItem('session_data', JSON.stringify(data))
  return data
}

export function useSessionPersistence() {
  // Use lazy initialization to avoid effect
  const [sessionData, setSessionData] = useState<SessionData>(() => getInitialSession())

  // Update activity handler
  const updateActivity = useCallback(() => {
    setSessionData(prev => {
      const updated = { ...prev, lastActive: Date.now() }
      localStorage.setItem('session_data', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [updateActivity])

  return sessionData
}
