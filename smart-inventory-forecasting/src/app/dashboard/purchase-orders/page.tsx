import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PurchaseOrdersPageClient from './purchase-orders-client';

export default async function PurchaseOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <PurchaseOrdersPageClient />;
}
