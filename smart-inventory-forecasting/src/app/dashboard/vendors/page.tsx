import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VendorsPageClient from './vendors-client';

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <VendorsPageClient />;
}
