// API routes for data cleanup operations
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dataCleanupService } from '@/lib/services';
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
    const action = searchParams.get('action');

    switch (action) {
      case 'report':
        const reportResult = await dataCleanupService.generateCleanupReport((user as User).id);
        return NextResponse.json(reportResult);

      case 'check-blocking':
        const blockingResult = await dataCleanupService.isForecastingBlocked((user as User).id);
        return NextResponse.json(blockingResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Data cleanup API error:', error);
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
    const { action } = body;

    switch (action) {
      case 'scan':
        const scanResult = await dataCleanupService.runCleanupScan((user as User).id);
        return NextResponse.json(scanResult);

      case 'resolve-issue':
        const { issueId } = body;
        if (!issueId) {
          return NextResponse.json(
            { success: false, error: 'Issue ID is required' },
            { status: 400 }
          );
        }
        const resolveResult = await dataCleanupService.resolveIssue(issueId, (user as User).id);
        return NextResponse.json(resolveResult);

      case 'resolve-multiple':
        const { issueIds } = body;
        if (!issueIds || !Array.isArray(issueIds)) {
          return NextResponse.json(
            { success: false, error: 'Issue IDs array is required' },
            { status: 400 }
          );
        }
        const resolveMultipleResult = await dataCleanupService.resolveMultipleIssues(issueIds, (user as User).id);
        return NextResponse.json(resolveMultipleResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Data cleanup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}