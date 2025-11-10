'use client'

import { useState } from 'react'
import { TouchFriendlyButton } from '@/components/layout/ResponsiveLayout'

interface POSSelectionStepProps {
  selectedPOS: 'square' | 'clover' | 'manual' | null
  onSelect: (posType: 'square' | 'clover' | 'manual') => void
  onConnect: (credentials?: Record<string, string>) => void
  isLoading: boolean
  error: string | null
}

interface POSOption {
  id: 'square' | 'clover' | 'manual'
  name: string
  description: string
  icon: string
  features: string[]
  setupTime: string
}

export function POSSelectionStep({ selectedPOS, onSelect, onConnect, isLoading, error }: POSSelectionStepProps) {
  const [showCredentials, setShowCredentials] = useState(false)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const posOptions: POSOption[] = [
    {
      id: 'square',
      name: 'Square',
      description: 'Connect directly to your Square POS system',
      icon: '⬜',
      features: [
        'Automatic inventory sync',
        'Real-time sales data',
        'Historical transaction import',
        'Product catalog integration'
      ],
      setupTime: '2-3 minutes'
    },
    {
      id: 'clover',
      name: 'Clover',
      description: 'Connect directly to your Clover POS system',
      icon: '🍀',
      features: [
        'Automatic inventory sync',
        'Real-time sales data',
        'Historical transaction import',
        'Product catalog integration'
      ],
      setupTime: '2-3 minutes'
    },
    {
      id: 'manual',
      name: 'CSV Upload',
      description: 'Upload your sales data manually via CSV files',
      icon: '📊',
      features: [
        'Works with any POS system',
        'Import historical data',
        'Flexible data format',
        'No API setup required'
      ],
      setupTime: '1 minute'
    }
  ]

  const handlePOSSelect = (posType: 'square' | 'clover' | 'manual') => {
    onSelect(posType)
    setShowCredentials(posType !== 'manual')
    setCredentials({})
    setValidationErrors({})
  }

  const validateCredentials = () => {
    const errors: Record<string, string> = {}
    
    if (selectedPOS === 'square') {
      if (!credentials.applicationId) {
        errors.applicationId = 'Application ID is required'
      }
      if (!credentials.accessToken) {
        errors.accessToken = 'Access Token is required'
      }
    } else if (selectedPOS === 'clover') {
      if (!credentials.merchantId) {
        errors.merchantId = 'Merchant ID is required'
      }
      if (!credentials.apiToken) {
        errors.apiToken = 'API Token is required'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleConnect = () => {
    if (selectedPOS === 'manual') {
      onConnect()
    } else if (validateCredentials()) {
      onConnect(credentials)
    }
  }

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const renderCredentialsForm = () => {
    if (!showCredentials || !selectedPOS || selectedPOS === 'manual') return null

    return (
      <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {selectedPOS === 'square' ? 'Square' : 'Clover'} Connection Details
        </h3>
        
        {selectedPOS === 'square' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700 mb-2">
                Application ID *
              </label>
              <input
                id="applicationId"
                type="text"
                value={credentials.applicationId || ''}
                onChange={(e) => handleCredentialChange('applicationId', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-md text-base
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${validationErrors.applicationId ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your Square Application ID"
                disabled={isLoading}
              />
              {validationErrors.applicationId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.applicationId}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
                Access Token *
              </label>
              <input
                id="accessToken"
                type="password"
                value={credentials.accessToken || ''}
                onChange={(e) => handleCredentialChange('accessToken', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-md text-base
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${validationErrors.accessToken ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your Square Access Token"
                disabled={isLoading}
              />
              {validationErrors.accessToken && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.accessToken}</p>
              )}
            </div>
          </div>
        )}

        {selectedPOS === 'clover' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700 mb-2">
                Merchant ID *
              </label>
              <input
                id="merchantId"
                type="text"
                value={credentials.merchantId || ''}
                onChange={(e) => handleCredentialChange('merchantId', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-md text-base
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${validationErrors.merchantId ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your Clover Merchant ID"
                disabled={isLoading}
              />
              {validationErrors.merchantId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.merchantId}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-2">
                API Token *
              </label>
              <input
                id="apiToken"
                type="password"
                value={credentials.apiToken || ''}
                onChange={(e) => handleCredentialChange('apiToken', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-md text-base
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${validationErrors.apiToken ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your Clover API Token"
                disabled={isLoading}
              />
              {validationErrors.apiToken && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.apiToken}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Security:</strong> Your credentials are encrypted and stored securely. We only use them to sync your data and never share them with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your POS System
        </h2>
        <p className="text-gray-600">
          Choose how you&apos;d like to sync your sales data for accurate inventory forecasting.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {posOptions.map((option) => (
          <div
            key={option.id}
            className={`
              relative border-2 rounded-lg p-6 cursor-pointer transition-all
              ${selectedPOS === option.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
            onClick={() => handlePOSSelect(option.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {option.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Setup: {option.setupTime}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">
                  {option.description}
                </p>
                <ul className="mt-3 space-y-1">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selectedPOS === option.id 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {selectedPOS === option.id && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderCredentialsForm()}

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

      {selectedPOS && (
        <div className="flex justify-end">
          <TouchFriendlyButton
            variant="primary"
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Connecting...' : `Connect ${posOptions.find(p => p.id === selectedPOS)?.name}`}
          </TouchFriendlyButton>
        </div>
      )}
    </div>
  )
}