'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const steps = [
    {
      title: 'Welcome to Smart Inventory Forecasting',
      description: 'Let&apos;s get you set up with intelligent inventory management',
      content: (
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <p className="text-lg">
            Welcome! We&apos;ll help you set up your inventory forecasting system in just a few steps.
          </p>
        </div>
      )
    },
    {
      title: 'Setup Complete',
      description: 'You&apos;re ready to start forecasting',
      content: (
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <p className="text-lg">
            Great! Your account is now set up. You can start by uploading your inventory data or connecting your POS system.
          </p>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      // Mark onboarding as completed
      await fetch('/api/users/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      })
      
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStepData.content}
            
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </div>
              <Button 
                onClick={handleNext}
                disabled={loading}
              >
                {currentStep === steps.length - 1 ? 
                  (loading ? 'Completing...' : 'Get Started') : 
                  'Next'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}