import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreatePOSConnection } from '@/types/database'
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
    const body: CreatePOSConnection = await request.json()
    
    // Validate required fields
    if (!body.pos_type || !['square', 'clover', 'manual'].includes(body.pos_type)) {
      return NextResponse.json(
        { error: 'Valid POS type is required (square, clover, or manual)' },
        { status: 400 }
      )
    }

    // Validate credentials based on POS type
    if (body.pos_type === 'square') {
      if (!body.credentials?.applicationId || !body.credentials?.accessToken) {
        return NextResponse.json(
          { error: 'Square Application ID and Access Token are required' },
          { status: 400 }
        )
      }
    } else if (body.pos_type === 'clover') {
      if (!body.credentials?.merchantId || !body.credentials?.apiToken) {
        return NextResponse.json(
          { error: 'Clover Merchant ID and API Token are required' },
          { status: 400 }
        )
      }
    }

    // Check if user already has a POS connection
    const { data: existingConnection } = await supabase
      .from('pos_connections')
      .select('id')
      .eq('user_id', (user as User).id)
      .single()

    let connectionStatus: 'active' | 'error' | 'pending' = 'pending'
    
    // For manual connections, set as active immediately
    if (body.pos_type === 'manual') {
      connectionStatus = 'active'
    } else {
      // For API connections, we would normally test the connection here
      // For now, we'll simulate a successful connection
      connectionStatus = 'active'
      
      // In a real implementation, you would:
      // 1. Test the API credentials
      // 2. Fetch initial data
      // 3. Set status based on success/failure
    }

    if (existingConnection) {
      // Update existing connection
      const { data: connection, error } = await supabase
        .from('pos_connections')
        .update({
          pos_type: body.pos_type,
          credentials: body.credentials || {},
          status: connectionStatus,
          last_sync: body.pos_type === 'manual' ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (user as User).id)
        .select()
        .single()

      if (error) {
        console.error('Error updating POS connection:', error)
        return NextResponse.json(
          { error: 'Failed to update POS connection' },
          { status: 500 }
        )
      }

      return NextResponse.json(connection)
    } else {
      // Create new connection
      const { data: connection, error } = await supabase
        .from('pos_connections')
        .insert({
          user_id: (user as User).id,
          pos_type: body.pos_type,
          credentials: body.credentials || {},
          status: connectionStatus,
          last_sync: body.pos_type === 'manual' ? null : new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating POS connection:', error)
        return NextResponse.json(
          { error: 'Failed to create POS connection' },
          { status: 500 }
        )
      }

      return NextResponse.json(connection)
    }
  } catch (error) {
    console.error('POS connection API error:', error)
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

    // Get user's POS connection
    const { data: connection, error } = await supabase
      .from('pos_connections')
      .select('id, pos_type, status, last_sync, created_at, updated_at')
      .eq('user_id', (user as User).id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching POS connection:', error)
      return NextResponse.json(
        { error: 'Failed to fetch POS connection' },
        { status: 500 }
      )
    }

    return NextResponse.json(connection || null)
  } catch (error) {
    console.error('POS connection API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}