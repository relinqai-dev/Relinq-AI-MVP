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
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="group relative bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div className={`inline-flex p-4 rounded-2xl ${action.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-7 w-7 ${action.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {action.description}
                </p>
              </button>
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