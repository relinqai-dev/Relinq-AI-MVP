/**
 * AI Agent Service
 * Converts forecast data into human-readable recommendations using LLM
 * Requirements: 4.2, 4.3, 4.4, 4.5, 4.6
 */

import OpenAI from 'openai'
import { AIRecommendation, DailyTodoList, ItemForecast } from '@/types/business'
import { InventoryItem, Supplier, SalesData } from '@/types/database'

export interface RecommendationContext {
  item: InventoryItem
  forecast: ItemForecast
  supplier?: Supplier
  recentSales: SalesData[]
  averageDailySales: number
  daysUntilStockout: number
}

export interface PriorityFactors {
  stockoutRisk: number // 0-1 scale
  salesVelocity: number // 0-1 scale  
  businessImpact: number // 0-1 scale
  urgencyScore: number // 0-1 scale
}

export class AIAgentService {
  private openai: OpenAI
  private model: string = 'gpt-4o-mini' // Cost-effective model for recommendations

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    })
  }

  /**
   * Generate daily todo list with AI recommendations
   * Requirements: 4.1, 4.5, 4.6 - Display dashboard, prioritize by urgency, positive confirmation
   */
  async generateDailyTodoList(
    userId: string,
    contexts: RecommendationContext[]
  ): Promise<DailyTodoList> {
    try {
      // Filter contexts that need action
      const actionableContexts = contexts.filter(ctx => 
        ctx.daysUntilStockout <= 14 || ctx.item.current_stock <= 0
      )

      if (actionableContexts.length === 0) {
        // Requirement 4.6: Positive confirmation when no actions needed
        return {
          date: new Date().toISOString().split('T')[0],
          urgent_actions: [],
          routine_actions: [],
          positive_status: "Great news! Your inventory levels look healthy today. No immediate actions required.",
          total_action_count: 0
        }
      }

      // Generate recommendations for actionable items
      const recommendations = await Promise.all(
        actionableContexts.map(ctx => this.generateRecommendation(ctx))
      )

      // Sort by priority and urgency
      const sortedRecommendations = this.prioritizeRecommendations(recommendations)

      // Split into urgent and routine actions
      const urgentActions = sortedRecommendations.filter(r => 
        r.priority === 'urgent' || r.priority === 'high'
      )
      const routineActions = sortedRecommendations.filter(r => 
        r.priority === 'medium' || r.priority === 'low'
      )

      return {
        date: new Date().toISOString().split('T')[0],
        urgent_actions: urgentActions,
        routine_actions: routineActions,
        total_action_count: recommendations.length
      }
    } catch (error) {
      console.error('Error generating daily todo list:', error)
      
      // Fallback response
      return {
        date: new Date().toISOString().split('T')[0],
        urgent_actions: [],
        routine_actions: [],
        positive_status: "Unable to generate recommendations at this time. Please check your inventory manually.",
        total_action_count: 0
      }
    }
  }

  /**
   * Generate AI recommendation for a single item
   * Requirements: 4.2, 4.3, 4.4 - LLM explanations, contextual reasoning, timeline warnings
   */
  async generateRecommendation(context: RecommendationContext): Promise<AIRecommendation> {
    try {
      const prompt = this.buildRecommendationPrompt(context)
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI inventory management assistant. Generate clear, actionable recommendations for retail store owners. Be concise, specific, and focus on business impact. Always include specific timeline warnings when stockout risk exists.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for consistent, factual responses
        max_tokens: 200
      })

      const aiResponse = completion.choices[0]?.message?.content || ''
      
      // Parse AI response and create structured recommendation
      return this.parseAIResponse(context, aiResponse)
    } catch (error) {
      console.error('Error generating AI recommendation:', error)
      
      // Fallback to rule-based recommendation
      return this.generateFallbackRecommendation(context)
    }
  }

  /**
   * Build prompt for LLM with context data
   * Requirements: 4.2, 4.3 - Convert forecast data into human-readable explanations
   */
  private buildRecommendationPrompt(context: RecommendationContext): string {
    const { item, forecast, supplier, recentSales, averageDailySales, daysUntilStockout } = context

    // Calculate sales trend context
    const recentAverage = recentSales.length > 0 
      ? recentSales.reduce((sum, sale) => sum + sale.quantity_sold, 0) / recentSales.length
      : 0
    
    const trendContext = this.calculateSalesTrendContext(averageDailySales, recentAverage)

    return `
Analyze this inventory item and provide a recommendation:

ITEM: ${item.name} (SKU: ${item.sku})
CURRENT STOCK: ${item.current_stock} units
FORECASTED 7-DAY DEMAND: ${forecast.forecast_7_day} units
RECOMMENDED ORDER: ${forecast.recommended_order} units
CONFIDENCE: ${Math.round(forecast.confidence_score * 100)}%
TREND: ${forecast.trend}
DAYS UNTIL STOCKOUT: ${daysUntilStockout}
SUPPLIER: ${supplier?.name || 'Not assigned'}
LEAD TIME: ${forecast.lead_time_factored} days

SALES CONTEXT: ${trendContext}

Provide:
1. A clear action (e.g., "Order 50 units immediately")
2. Brief explanation with sales context (e.g., "Sales 30% higher than average")
3. Specific timeline warning if stockout risk exists (e.g., "Risk of stockout in 2 days")
4. Priority level: urgent/high/medium/low

Keep response under 150 words, be specific and actionable.
    `.trim()
  }

  /**
   * Calculate sales trend context for explanations
   * Requirements: 4.3 - Contextual reasoning generation
   */
  private calculateSalesTrendContext(averageDailySales: number, recentAverage: number): string {
    if (averageDailySales === 0) {
      return "No historical sales data available"
    }

    const percentChange = ((recentAverage - averageDailySales) / averageDailySales) * 100

    if (Math.abs(percentChange) < 5) {
      return "Sales consistent with historical average"
    } else if (percentChange > 20) {
      return `Sales ${Math.round(percentChange)}% higher than average`
    } else if (percentChange > 10) {
      return `Sales moderately higher than average (+${Math.round(percentChange)}%)`
    } else if (percentChange < -20) {
      return `Sales ${Math.round(Math.abs(percentChange))}% lower than average`
    } else if (percentChange < -10) {
      return `Sales moderately lower than average (${Math.round(percentChange)}%)`
    } else {
      return `Sales ${percentChange > 0 ? 'slightly higher' : 'slightly lower'} than average`
    }
  }

  /**
   * Parse AI response into structured recommendation
   * Requirements: 4.4, 4.5 - Timeline warnings, priority scoring
   */
  private parseAIResponse(context: RecommendationContext, aiResponse: string): AIRecommendation {
    const { item, daysUntilStockout } = context

    // Extract timeline warning from AI response
    const timelineWarningMatch = aiResponse.match(/(?:risk of stockout|stockout risk|will run out).*?(\d+)\s*days?/i)
    const timelineWarning = timelineWarningMatch ? timelineWarningMatch[0] : undefined

    // Determine priority based on urgency detection
    const priority = this.detectUrgencyFromResponse(aiResponse, daysUntilStockout, context.item.current_stock)

    // Extract action (usually the first sentence or line)
    const actionMatch = aiResponse.match(/^([^.!?]+[.!?])/m)
    const action = actionMatch ? actionMatch[1].trim() : `Review ${item.name} inventory`

    return {
      sku: item.sku,
      priority,
      action,
      explanation: aiResponse.trim(),
      confidence: context.forecast?.confidence_score || 0.5,
      timeline_warning: timelineWarning,
      reasoning_context: this.calculateSalesTrendContext(
        context.averageDailySales, 
        context.recentSales.length > 0 
          ? context.recentSales.reduce((sum, sale) => sum + sale.quantity_sold, 0) / context.recentSales.length
          : 0
      )
    }
  }

  /**
   * Detect urgency level from AI response and context
   * Requirements: 4.5 - Priority scoring and urgency detection
   */
  private detectUrgencyFromResponse(
    response: string, 
    daysUntilStockout: number, 
    currentStock: number
  ): 'urgent' | 'high' | 'medium' | 'low' {
    const urgentKeywords = ['immediately', 'urgent', 'critical', 'emergency', 'asap']
    const highKeywords = ['soon', 'quickly', 'priority', 'important']
    
    const lowerResponse = response.toLowerCase()
    
    // Check for urgent keywords or critical stock situation
    if (urgentKeywords.some(keyword => lowerResponse.includes(keyword)) || 
        currentStock <= 0 || 
        daysUntilStockout <= 2) {
      return 'urgent'
    }
    
    // Check for high priority keywords or near-term stockout
    if (highKeywords.some(keyword => lowerResponse.includes(keyword)) || 
        daysUntilStockout <= 5) {
      return 'high'
    }
    
    // Medium priority for moderate timeline
    if (daysUntilStockout <= 10) {
      return 'medium'
    }
    
    return 'low'
  }

  /**
   * Generate fallback recommendation when AI is unavailable
   * Requirements: 4.2, 4.3, 4.4 - Fallback explanations with context
   */
  private generateFallbackRecommendation(context: RecommendationContext): AIRecommendation {
    const { item, forecast, daysUntilStockout, averageDailySales, recentSales } = context

    let action: string
    let explanation: string
    let priority: 'urgent' | 'high' | 'medium' | 'low'
    let timelineWarning: string | undefined

    if (item.current_stock <= 0) {
      action = `Order ${forecast.recommended_order} units of ${item.name} immediately`
      explanation = `Out of stock. Recommended order: ${forecast.recommended_order} units based on forecasted demand.`
      priority = 'urgent'
      timelineWarning = 'Currently out of stock'
    } else if (daysUntilStockout <= 2) {
      action = `Order ${forecast.recommended_order} units of ${item.name} urgently`
      explanation = `Low stock with ${daysUntilStockout} days until stockout. Immediate reorder needed.`
      priority = 'urgent'
      timelineWarning = `Risk of stockout in ${daysUntilStockout} days`
    } else if (daysUntilStockout <= 7) {
      action = `Order ${forecast.recommended_order} units of ${item.name}`
      explanation = `Stock running low. Current inventory will last approximately ${daysUntilStockout} days.`
      priority = 'high'
      timelineWarning = `Stock will run out in ${daysUntilStockout} days`
    } else {
      action = `Consider ordering ${forecast.recommended_order} units of ${item.name}`
      explanation = `Inventory levels adequate for now. Monitor for future reorder needs.`
      priority = 'medium'
    }

    return {
      sku: item.sku,
      priority,
      action,
      explanation,
      confidence: forecast.confidence_score || 0.5,
      timeline_warning: timelineWarning,
      reasoning_context: this.calculateSalesTrendContext(
        averageDailySales,
        recentSales.length > 0 
          ? recentSales.reduce((sum, sale) => sum + sale.quantity_sold, 0) / recentSales.length
          : 0
      )
    }
  }

  /**
   * Prioritize recommendations by urgency and business impact
   * Requirements: 4.5 - Priority scoring and urgency detection algorithms
   */
  private prioritizeRecommendations(recommendations: AIRecommendation[]): AIRecommendation[] {
    return recommendations.sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const aPriorityScore = priorityOrder[a.priority]
      const bPriorityScore = priorityOrder[b.priority]

      if (aPriorityScore !== bPriorityScore) {
        return bPriorityScore - aPriorityScore
      }

      // If same priority, sort by confidence (higher confidence first)
      return b.confidence - a.confidence
    })
  }

  /**
   * Calculate priority factors for business impact scoring
   * Requirements: 4.5 - Priority scoring algorithms
   */
  calculatePriorityFactors(context: RecommendationContext): PriorityFactors {
    const { item, forecast, daysUntilStockout, averageDailySales } = context

    // Stockout risk (0-1 scale, higher = more risk)
    let stockoutRisk = 0
    if (item.current_stock <= 0) {
      stockoutRisk = 1.0
    } else if (daysUntilStockout <= 2) {
      stockoutRisk = 0.9
    } else if (daysUntilStockout <= 5) {
      stockoutRisk = 0.7
    } else if (daysUntilStockout <= 10) {
      stockoutRisk = 0.4
    } else {
      stockoutRisk = Math.max(0, 1 - (daysUntilStockout / 30))
    }

    // Sales velocity (0-1 scale, higher = faster moving)
    const salesVelocity = Math.min(1, averageDailySales / 10) // Normalize to 10 units/day max

    // Business impact (0-1 scale, based on forecast confidence and sales volume)
    const businessImpact = (forecast.confidence_score || 0.5) * Math.min(1, averageDailySales / 5)

    // Overall urgency score
    const urgencyScore = (stockoutRisk * 0.5) + (salesVelocity * 0.3) + (businessImpact * 0.2)

    return {
      stockoutRisk,
      salesVelocity,
      businessImpact,
      urgencyScore
    }
  }

  /**
   * Test AI service connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5
      })
      
      return completion.choices.length > 0
    } catch (error) {
      console.error('AI service connection test failed:', error)
      return false
    }
  }
}

// Class is already exported above