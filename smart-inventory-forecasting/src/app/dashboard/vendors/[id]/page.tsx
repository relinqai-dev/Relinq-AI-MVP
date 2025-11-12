import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VendorDetailClient from './vendor-detail-client';

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <VendorDetailClient vendorId={params.id} />;
}
