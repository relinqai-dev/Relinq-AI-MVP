import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    if (typeof body.completed !== 'boolean') {
      return NextResponse.json(
        { error: 'completed field must be a boolean' },
        { status: 400 }
      )
    }

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', (user as User).id)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: body.completed,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (user as User).id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return NextResponse.json(
          { error: 'Failed to update onboarding status' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, profile })
    } else {
      // Create new profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: (user as User).id,
          onboarding_completed: body.completed
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, profile })
    }
  } catch (error) {
    console.error('User onboarding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's onboarding status
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('onboarding_completed, created_at, updated_at')
      .eq('user_id', (user as User).id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch onboarding status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      onboarding_completed: profile?.onboarding_completed || false,
      created_at: profile?.created_at,
      updated_at: profile?.updated_at
    })
  } catch (error) {
    console.error('User onboarding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}