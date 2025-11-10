// API routes for supplier management
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SuppliersRepository } from '@/lib/database/suppliers-repository';
import type { User } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const suppliersRepo = new SuppliersRepository();
    const result = await suppliersRepo.findAll((user as User).id, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Suppliers GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, contact_email, contact_phone, address, lead_time_days } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Supplier name is required' },
        { status: 400 }
      );
    }

    const suppliersRepo = new SuppliersRepository();
    const result = await suppliersRepo.create({
      name: name.trim(),
      contact_email: contact_email?.trim() || undefined,
      contact_phone: contact_phone?.trim() || undefined,
      address: address?.trim() || undefined,
      lead_time_days: lead_time_days || 7
    }, (user as User).id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Suppliers POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}