/**
 * AI Recommendations Dashboard Component
 * Displays today's to-do list with AI-powered recommendations
 * Requirements: 4.1, 4.2, 4.5, 4.6
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Package, 
  RefreshCw,
  Lightbulb,
  Calendar
} from 'lucide-react'
import { DailyTodoList, AIRecommendation } from '@/types/business'

interface AIRecommendationsDashboardProps {
  className?: string
}

export function AIRecommendationsDashboard({ className }: AIRecommendationsDashboardProps) {
  const [todoList, setTodoList] = useState<DailyTodoList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadRecommendations()
    
    // Set up real-time updates using Supabase subscriptions
    // This would subscribe to changes in inventory, sales, or forecasts tables
    // For now, we'll use polling as a fallback
    const interval = setInterval(loadRecommendations, 60000) // Refresh every minute
    
    return () => clearInterval(interval)
  }, [])

  const loadRecommendations = async () => {
    try {
      setError(null)
      const response = await fetch('/api/ai-recommendations')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load recommendations')
      }

      setTodoList(result.data)
    } catch (err) {
      console.error('Error loading AI recommendations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRecommendations()
    setRefreshing(false)
  }

  const getPriorityIcon = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Package className="h-4 w-4 text-blue-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'secondary'
      case 'medium':
        return 'outline'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s To-Do List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s To-Do List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!todoList) {
    return null
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s To-Do List
              </CardTitle>
              <CardDescription>
                {formatDate(todoList.date)}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        {/* Positive Status - Requirement 4.6 */}
        {todoList.positive_status && (
          <CardContent>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {todoList.positive_status}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Summary Stats */}
      {todoList.total_action_count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{todoList.urgent_actions.length}</p>
                  <p className="text-sm text-muted-foreground">Urgent Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{todoList.routine_actions.length}</p>
                  <p className="text-sm text-muted-foreground">Routine Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{todoList.total_action_count}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Urgent Actions */}
      {todoList.urgent_actions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Urgent Actions Required
            </CardTitle>
            <CardDescription>
              These items need immediate attention to prevent stockouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todoList.urgent_actions.map((recommendation, index) => (
              <RecommendationCard 
                key={`urgent-${recommendation.sku}-${index}`}
                recommendation={recommendation}
                getPriorityIcon={getPriorityIcon}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Routine Actions */}
      {todoList.routine_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Routine Actions
            </CardTitle>
            <CardDescription>
              Items to monitor and consider for reordering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todoList.routine_actions.map((recommendation, index) => (
              <RecommendationCard 
                key={`routine-${recommendation.sku}-${index}`}
                recommendation={recommendation}
                getPriorityIcon={getPriorityIcon}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: AIRecommendation
  getPriorityIcon: (priority: AIRecommendation['priority']) => React.ReactNode
  getPriorityColor: (priority: AIRecommendation['priority']) => string
}

function RecommendationCard({ 
  recommendation, 
  getPriorityIcon, 
  getPriorityColor 
}: RecommendationCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header with SKU and Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPriorityIcon(recommendation.priority)}
          <span className="font-medium">SKU: {recommendation.sku}</span>
        </div>
        <Badge variant={getPriorityColor(recommendation.priority) as "default" | "secondary" | "destructive" | "outline"}>
          {recommendation.priority.toUpperCase()}
        </Badge>
      </div>

      {/* Action */}
      <div className="font-semibold text-lg">
        {recommendation.action}
      </div>

      {/* Timeline Warning - Requirement 4.4 */}
      {recommendation.timeline_warning && (
        <Alert variant="destructive" className="py-2">
          <Clock className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {recommendation.timeline_warning}
          </AlertDescription>
        </Alert>
      )}

      {/* Explanation - Requirement 4.2, 4.3 */}
      <div className="text-sm text-muted-foreground">
        {recommendation.explanation}
      </div>

      {/* Reasoning Context */}
      {recommendation.reasoning_context && (
        <>
          <Separator />
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {recommendation.reasoning_context}
          </div>
        </>
      )}

      {/* Action Buttons - Requirement: Create action buttons for each recommendation type */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button size="sm" variant="default" className="flex-1 sm:flex-none">
          Add to Reorder List
        </Button>
        <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
          View Details
        </Button>
        <Button size="sm" variant="ghost" className="flex-1 sm:flex-none">
          Dismiss
        </Button>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Confidence: {Math.round(recommendation.confidence * 100)}%</span>
        <div className="w-16 bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full" 
            style={{ width: `${recommendation.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}