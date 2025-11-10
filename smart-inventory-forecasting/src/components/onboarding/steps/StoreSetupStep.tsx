'use client'

import { useState } from 'react'
import { TouchFriendlyButton } from '@/components/layout/ResponsiveLayout'

interface StoreSetupStepProps {
  initialData: { name: string; address: string }
  onSubmit: (data: { name: string; address: string }) => void
  isLoading: boolean
  error: string | null
}

export function StoreSetupStep({ initialData, onSubmit, isLoading, error }: StoreSetupStepProps) {
  const [formData, setFormData] = useState(initialData)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Store name is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let&apos;s set up your store
        </h2>
        <p className="text-gray-600">
          We need some basic information about your store to get started with inventory forecasting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-2">
            Store Name *
          </label>
          <input
            id="store-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`
              w-full px-4 py-3 border rounded-md text-base
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${validationErrors.name ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Enter your store name"
            disabled={isLoading}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="store-address" className="block text-sm font-medium text-gray-700 mb-2">
            Store Address (Optional)
          </label>
          <textarea
            id="store-address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your store address"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            This helps us provide location-specific insights and supplier recommendations.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <TouchFriendlyButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </TouchFriendlyButton>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Privacy Note:</strong> Your store information is securely stored and only used to improve your forecasting experience. We never share your data with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}