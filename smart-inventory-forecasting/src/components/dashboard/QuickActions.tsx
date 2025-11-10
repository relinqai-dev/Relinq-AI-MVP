/**
 * Quick Actions Component
 * Provides quick access to common dashboard actions
 * Requirements: 6.1, 6.2 - Responsive design with action buttons
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  FileText, 
  Settings, 
  BarChart3,
  Package,
  Users,
  Download,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'Import Data',
      description: 'Upload CSV files or connect POS',
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => router.push('/dashboard/import')
    },
    {
      title: 'Generate Reports',
      description: 'View inventory and sales reports',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => router.push('/dashboard/reports')
    },
    {
      title: 'Manage Inventory',
      description: 'View and edit inventory items',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => router.push('/dashboard/inventory')
    },
    {
      title: 'Manage Suppliers',
      description: 'Add and edit supplier information',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => router.push('/dashboard/suppliers')
    },
    {
      title: 'Purchase Orders',
      description: 'Create and manage purchase orders',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => router.push('/dashboard/purchase-orders')
    },
    {
      title: 'Settings',
      description: 'Configure system preferences',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      onClick: () => router.push('/dashboard/settings')
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-50"
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {action.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Additional Quick Actions for Mobile */}
        <div className="mt-6 pt-4 border-t border-gray-200 sm:hidden">
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-3" />
              Export Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-3" />
              Sync All Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}