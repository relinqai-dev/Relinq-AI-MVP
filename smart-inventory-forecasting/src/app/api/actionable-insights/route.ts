import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { atRiskItems } = await request.json();

    // AI AGENT (Store Manager) - Turns numbers into narrative
    // Works with data from BOTH sources (CSV upload or API integration)
    
    if (!atRiskItems || atRiskItems.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'No at-risk items to generate insights for.'
      });
    }

    // Check for data quality issues
    const { data: cleanupIssues } = await supabase
      .from('cleanup_issues')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(5);

    const insights = [];

    // Generate stockout risk insights from forecasting data
    const urgentItems = atRiskItems.filter((item: any) => {
      const days = parseInt(item.forecastedStockoutDate);
      return days <= 3;
    });

    if (urgentItems.length > 0) {
      const item = urgentItems[0];
      const days = parseInt(item.forecastedStockoutDate);
      insights.push({
        id: `stockout-${item.id}`,
        type: 'stockout',
        title: 'Urgent Stockout Risk',
        message: `You are on track to sell out of '${item.itemName}' in ${days} ${days === 1 ? 'day' : 'days'}. Current velocity is ${item.salesVelocity} units/day. I recommend ordering ${item.recommendedQty} units now.`,
        action: 'Order Now',
        priority: 'high',
      });
    }

    // Generate data quality insights
    if (cleanupIssues && cleanupIssues.length > 0) {
      const duplicates = cleanupIssues.filter((issue: any) => issue.issue_type === 'duplicate');
      if (duplicates.length > 0) {
        insights.push({
          id: 'data-quality-1',
          type: 'anomaly',
          title: 'Data Quality Issue',
          message: `You have ${duplicates.length} duplicate items in your inventory. This may be affecting your forecast accuracy.`,
          action: 'Fix Now',
          priority: 'medium',
        });
      }
    }

    // TODO: Call OpenAI API for more sophisticated insights
    // const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [{
    //       role: 'system',
    //       content: 'You are a helpful inventory management assistant...'
    //     }, {
    //       role: 'user',
    //       content: `Generate actionable insights from this data: ${JSON.stringify(atRiskItems)}`
    //     }]
    //   })
    // });

    // Add trend insights
    if (atRiskItems.length > 3) {
      insights.push({
        id: 'trend-1',
        type: 'trend',
        title: 'Increased Demand',
        message: `${atRiskItems.length} items are showing higher than normal demand. Your forecasts have been adjusted to reflect these trends.`,
        action: 'View Details',
        priority: 'low',
      });
    }

    return NextResponse.json({ success: true, data: insights });
  } catch (error) {
    console.error('Error generating actionable insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
