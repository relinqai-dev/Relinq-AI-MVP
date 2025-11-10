import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateStore } from '@/types/database'
import type { User } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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
    const body: CreateStore = await request.json()
    
    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    // Check if user already has a store
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', (user as User).id)
      .single()

    if (existingStore) {
      // Update existing store
      const { data: store, error } = await supabase
        .from('stores')
        .update({
          name: body.name.trim(),
          address: body.address?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (user as User).id)
        .select()
        .single()

      if (error) {
        console.error('Error updating store:', error)
        return NextResponse.json(
          { error: 'Failed to update store information' },
          { status: 500 }
        )
      }

      return NextResponse.json(store)
    } else {
      // Create new store
      const { data: store, error } = await supabase
        .from('stores')
        .insert({
          user_id: (user as User).id,
          name: body.name.trim(),
          address: body.address?.trim() || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating store:', error)
        return NextResponse.json(
          { error: 'Failed to create store' },
          { status: 500 }
        )
      }

      return NextResponse.json(store)
    }
  } catch (error) {
    console.error('Store API error:', error)
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

    // Get user's store
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', (user as User).id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching store:', error)
      return NextResponse.json(
        { error: 'Failed to fetch store information' },
        { status: 500 }
      )
    }

    return NextResponse.json(store || null)
  } catch (error) {
    console.error('Store API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}