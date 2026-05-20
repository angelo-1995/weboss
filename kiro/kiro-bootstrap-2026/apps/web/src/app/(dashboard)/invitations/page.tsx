'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { InvitationsTable } from '@/features/invitations/components/invitations-table';
import { CreateInvitationModal } from '@/features/invitations/components/create-invitation-modal';
import { useInvitations } from '@/features/invitations/hooks/use-invitations';

export default function InvitationsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useInvitations();

  return (
    <div className="space-y-4">
      <PageHeader title="Invitaciones" description="Gestión de invitaciones enviadas">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva Invitación
        </Button>
      </PageHeader>

      <InvitationsTable
        data={data?.items ?? []}
        isLoading={isLoading}
      />

      <CreateInvitationModal
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
