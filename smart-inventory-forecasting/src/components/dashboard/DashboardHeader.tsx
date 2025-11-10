/**
 * Dashboard Header Component
 * Responsive navigation header for the main dashboard
 * Requirements: 6.1, 6.2 - Responsive design for all device sizes
 */

'use client'

import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  Bell,
  Settings
} from 'lucide-react'

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const storeName = user?.user_metadata?.store_name || 'My Store'
  const userEmail = user?.email || 'user@example.com'

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Smart Inventory
              </h1>
            </div>
            <div className="hidden sm:block ml-4">
              <span className="text-sm text-gray-500">
                {storeName}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {storeName}
                </div>
                <div className="text-xs text-gray-500">
                  {userEmail}
                </div>
              </div>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Sign Out */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-2">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {storeName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userEmail}
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-2 px-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-3" />
                  Notifications
                  <span className="ml-auto h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}