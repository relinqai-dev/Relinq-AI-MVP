import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SKUDetailClient from './sku-detail-client';

export default async function SKUDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <SKUDetailClient itemId={params.id} />;
}
