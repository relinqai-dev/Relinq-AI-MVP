'use client'

import { TouchFriendlyButton } from '@/components/layout/ResponsiveLayout'

interface ConnectionStatusStepProps {
  storeData: { name: string; address: string }
  posConnection: {
    id: string
    pos_type: 'square' | 'clover' | 'manual'
    status: 'active' | 'error' | 'pending'
    last_sync?: string
  } | null
  onComplete: () => void
  isLoading: boolean
  error: string | null
}

export function ConnectionStatusStep({ 
  storeData, 
  posConnection, 
  onComplete, 
  isLoading, 
  error 
}: ConnectionStatusStepProps) {
  const getPOSDisplayName = (posType: string) => {
    switch (posType) {
      case 'square': return 'Square'
      case 'clover': return 'Clover'
      case 'manual': return 'CSV Upload'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'pending':
      default:
        return (
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )
    }
  }

  const getStatusMessage = (status: string, posType: string) => {
    switch (status) {
      case 'active':
        return `Successfully connected to ${getPOSDisplayName(posType)}! Your sales data will be automatically synced.`
      case 'error':
        return `There was an issue connecting to ${getPOSDisplayName(posType)}. Please check your credentials and try again.`
      case 'pending':
        return `Connecting to ${getPOSDisplayName(posType)}... This may take a few moments.`
      default:
        return 'Connection status unknown.'
    }
  }

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never'
    
    const date = new Date(lastSync)
    return date.toLocaleString()
  }

  const getNextSteps = () => {
    if (!posConnection) return []

    const steps = []
    
    if (posConnection.status === 'active') {
      if (posConnection.pos_type === 'manual') {
        steps.push('Upload your first CSV file to start forecasting')
        steps.push('Set up your suppliers for purchase order generation')
      } else {
        steps.push('Review and clean up your imported data')
        steps.push('Set up your suppliers for purchase order generation')
      }
      steps.push('Start generating AI-powered inventory forecasts')
    } else if (posConnection.status === 'error') {
      steps.push('Check your POS connection settings')
      steps.push('Verify your credentials are correct')
      steps.push('Contact support if the issue persists')
    }

    return steps
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Setup Complete!
        </h2>
        <p className="text-gray-600">
          Your store is configured and ready for smart inventory forecasting.
        </p>
      </div>

      {/* Store Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Store Name:</span>
            <span className="font-medium text-gray-900">{storeData.name}</span>
          </div>
          {storeData.address && (
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium text-gray-900 text-right max-w-xs">
                {storeData.address}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {posConnection && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">POS Connection Status</h3>
          
          <div className="flex items-start space-x-4">
            {getStatusIcon(posConnection.status)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {getPOSDisplayName(posConnection.pos_type)}
                </h4>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${posConnection.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : posConnection.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }
                `}>
                  {posConnection.status.charAt(0).toUpperCase() + posConnection.status.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3">
                {getStatusMessage(posConnection.status, posConnection.pos_type)}
              </p>
              
              <div className="text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Connection ID:</span>
                  <span className="font-mono">{posConnection.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Last Sync:</span>
                  <span>{formatLastSync(posConnection.last_sync)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">What&apos;s Next?</h3>
        <ul className="space-y-2">
          {getNextSteps().map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                {index + 1}
              </span>
              <span className="text-blue-800">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Error Display */}
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {posConnection?.status === 'error' && (
          <TouchFriendlyButton
            variant="secondary"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Retry Connection
          </TouchFriendlyButton>
        )}
        
        {posConnection?.pos_type === 'manual' && posConnection?.status === 'active' && (
          <TouchFriendlyButton
            variant="secondary"
            onClick={() => window.open('/dashboard/import', '_blank')}
            className="w-full sm:w-auto"
          >
            Upload CSV File
          </TouchFriendlyButton>
        )}
        
        <TouchFriendlyButton
          variant="primary"
          onClick={onComplete}
          disabled={isLoading || posConnection?.status === 'pending'}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Completing Setup...' : 'Go to Dashboard'}
        </TouchFriendlyButton>
      </div>

      {/* Success Message */}
      {posConnection?.status === 'active' && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            🎉 Welcome to Smart Inventory Forecasting!
          </div>
        </div>
      )}
    </div>
  )
}