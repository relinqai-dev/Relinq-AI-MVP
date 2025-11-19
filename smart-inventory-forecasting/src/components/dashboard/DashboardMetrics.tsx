/**
 * Dashboard Metrics Component
 * Displays key inventory and sales metrics with real-time updates
 * Requirements: 6.1, 6.2 - Responsive design, 4.5 - Business impact prioritization
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { InventoryMetrics, SalesMetrics } from '@/types/business'

export function DashboardMetrics() {
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics | null>(null)
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadMetrics()
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(loadMetrics, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      setError(null)
      
      // Load inventory metrics
      const inventoryResponse = await fetch('/api/dashboard/inventory-metrics')
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        if (inventoryData.success) {
          setInventoryMetrics(inventoryData.data)
        } else {
          throw new Error(inventoryData.error || 'Failed to load inventory metrics')
        }
      } else {
        throw new Error('Failed to fetch inventory metrics')
      }

      // Load sales metrics
      const salesResponse = await fetch('/api/dashboard/sales-metrics')
      if (salesResponse.ok) {
        const salesData = await salesResponse.json()
        if (salesData.success) {
          setSalesMetrics(salesData.data)
        } else {
          throw new Error(salesData.error || 'Failed to load sales metrics')
        }
      } else {
        throw new Error('Failed to fetch sales metrics')
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading dashboard metrics:', error)
      setError(error instanceof Error ? error.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'decreasing':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-16">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Dashboard Overview
          </h2>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  Failed to load dashboard metrics
                </p>
                <p className="text-sm text-red-600">
                  {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadMetrics}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Last Updated Indicator */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h2>
        <div className="text-sm text-gray-600 font-medium">
          Last updated: {formatLastUpdated()}
        </div>
      </div>

      {/* Metrics Grid - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Items */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Total Items
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {inventoryMetrics?.total_items || 0}
            </div>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-orange-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Low Stock Items
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold text-gray-900">
                {inventoryMetrics?.low_stock_items || 0}
              </div>
              {(inventoryMetrics?.low_stock_items || 0) > 0 && (
                <Badge className="bg-orange-100 text-orange-800 font-semibold border border-orange-200">
                  Action needed
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Items below reorder point
            </p>
          </CardContent>
        </Card>

        {/* Sales Trend */}
        <Card className="border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              7-Day Sales
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(salesMetrics?.total_sales_7_days || 0)}
              </div>
              {salesMetrics?.sales_trend && getTrendIcon(salesMetrics.sales_trend)}
            </div>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Revenue last 7 days
            </p>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Inventory Value
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(inventoryMetrics?.total_inventory_value || 0)}
            </div>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Total stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts - High Priority Items */}
      {(inventoryMetrics?.out_of_stock_items || 0) > 0 && (
        <Card className="border-red-300 bg-red-50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-900 text-lg">
                  {inventoryMetrics?.out_of_stock_items} items are out of stock
                </p>
                <p className="text-sm text-red-700 font-medium mt-1">
                  Immediate attention required to prevent lost sales
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Selling Items - Mobile Responsive */}
      {salesMetrics?.top_selling_items && salesMetrics.top_selling_items.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">
              Top Selling Items (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesMetrics.top_selling_items.slice(0, 3).map((item) => (
                <div key={item.sku} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-gray-600 text-sm font-medium">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">{item.quantity_sold} sold</p>
                    <p className="text-gray-600 text-sm font-semibold">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}