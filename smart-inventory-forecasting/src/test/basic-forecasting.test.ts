/**
 * Basic Forecasting Tests
 * Simple tests to verify the forecasting system works
 */

import { describe, it, expect } from 'vitest'
import { ForecastingManager } from '@/lib/forecasting/forecasting-manager'

describe('Basic Forecasting Tests', () => {
  it('should create a forecasting manager with default config', () => {
    const manager = new ForecastingManager()
    const state = manager.getState()
    
    expect(state.config.autoRefreshInterval).toBe(30)
    expect(state.config.cacheTimeout).toBe(15)
    expect(state.config.batchSize).toBe(10)
    expect(state.loading).toBe(false)
    expect(state.forecasts.size).toBe(0)
    
    manager.destroy()
  })

  it('should handle custom configuration', () => {
    const manager = new ForecastingManager({
      autoRefreshInterval: 60,
      cacheTimeout: 30,
      batchSize: 20
    })
    
    const state = manager.getState()
    
    expect(state.config.autoRefreshInterval).toBe(60)
    expect(state.config.cacheTimeout).toBe(30)
    expect(state.config.batchSize).toBe(20)
    
    manager.destroy()
  })

  it('should manage subscribers', () => {
    const manager = new ForecastingManager()
    let callCount = 0
    
    // Add a test alert first
    const initialState = manager.getState()
    initialState.alerts.push({
      id: 'test-alert',
      type: 'stockout_risk',
      severity: 'high',
      sku: 'TEST-SKU',
      itemName: 'Test Item',
      message: 'Test message',
      actionRequired: 'Test action',
      createdAt: new Date(),
      acknowledged: false
    })
    
    const unsubscribe = manager.subscribe(() => {
      callCount++
    })
    
    // Trigger state update by acknowledging existing alert
    manager.acknowledgeAlert('test-alert')
    
    expect(callCount).toBe(1)
    
    unsubscribe()
    
    // Should not be called after unsubscribe
    manager.clearAlerts() // This will trigger updateState
    expect(callCount).toBe(1) // Should still be 1 since we unsubscribed
    
    manager.destroy()
  })

  it('should handle alert acknowledgment', () => {
    const manager = new ForecastingManager()
    const initialState = manager.getState()
    
    // Add a mock alert
    initialState.alerts.push({
      id: 'test-alert',
      type: 'stockout_risk',
      severity: 'high',
      sku: 'TEST-SKU',
      itemName: 'Test Item',
      message: 'Test message',
      actionRequired: 'Test action',
      createdAt: new Date(),
      acknowledged: false
    })
    
    // Acknowledge the alert
    manager.acknowledgeAlert('test-alert')
    
    const updatedState = manager.getState()
    const alert = updatedState.alerts.find(a => a.id === 'test-alert')
    
    expect(alert?.acknowledged).toBe(true)
    
    manager.destroy()
  })

  it('should clear all alerts', () => {
    const manager = new ForecastingManager()
    const initialState = manager.getState()
    
    // Add mock alerts
    initialState.alerts.push(
      {
        id: 'alert-1',
        type: 'stockout_risk',
        severity: 'high',
        sku: 'SKU-1',
        itemName: 'Item 1',
        message: 'Message 1',
        actionRequired: 'Action 1',
        createdAt: new Date(),
        acknowledged: false
      },
      {
        id: 'alert-2',
        type: 'low_confidence',
        severity: 'medium',
        sku: 'SKU-2',
        itemName: 'Item 2',
        message: 'Message 2',
        actionRequired: 'Action 2',
        createdAt: new Date(),
        acknowledged: false
      }
    )
    
    expect(initialState.alerts.length).toBe(2)
    
    // Clear all alerts
    manager.clearAlerts()
    
    const updatedState = manager.getState()
    expect(updatedState.alerts.length).toBe(0)
    
    manager.destroy()
  })
})