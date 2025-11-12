import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PODraftClient from './po-draft-client';

export default async function PODraftPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <PODraftClient poId={params.id} />;
}
