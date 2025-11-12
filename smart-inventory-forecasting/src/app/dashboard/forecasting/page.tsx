import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ForecastingPageClient from './forecasting-client';

export default async function ForecastingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <ForecastingPageClient />;
}
