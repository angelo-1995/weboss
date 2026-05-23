'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/feedback/page-skeleton';

const OrganigramaContent = dynamic(
  () => import('@/features/organigrama/components/OrganigramaPageContent').then(m => ({ default: m.OrganigramaPageContent })),
  { ssr: false, loading: () => <PageSkeleton type="detail" /> }
);

export default function OrganigramaPage() {
  return (
    <Suspense fallback={<PageSkeleton type="detail" />}>
      <OrganigramaContent />
    </Suspense>
  );
}
