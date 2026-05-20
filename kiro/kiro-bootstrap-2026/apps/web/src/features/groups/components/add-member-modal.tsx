'use client';

import * as React from 'react';
import { FormModal } from '@/components/forms/form-modal';
import { UserSearchInput } from '@/components/forms/user-search-input';
import { useAddMember } from '../hooks/use-groups';

interface UserResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export function AddMemberModal({ open, onOpenChange, groupId }: AddMemberModalProps) {
  const addMember = useAddMember();
  const [selectedUser, setSelectedUser] = React.useState<UserResult | null>(null);
  const [role, setRole] = React.useState('MEMBER');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    await addMember.mutateAsync({
      groupId,
      userId: selectedUser.id,
      role,
    });

    setSelectedUser(null);
    setRole('MEMBER');
    onOpenChange(false);
  };

  return (
    <FormModal
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelectedUser(null);
          setRole('MEMBER');
        }
        onOpenChange(v);
      }}
      title="Agregar Miembro"
      description="Buscar y agregar una persona al grupo"
      onSubmit={handleSubmit}
      isLoading={addMember.isPending}
      submitLabel="Agregar"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Buscar Persona</label>
          <UserSearchInput
            onSelect={(user) => setSelectedUser(user)}
            placeholder="Buscar por nombre o email..."
          />
          {selectedUser && (
            <div className="mt-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
              <span className="font-medium">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>
              <span className="text-muted-foreground ml-2">{selectedUser.email}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="memberRole" className="text-sm font-medium">
            Rol en el grupo
          </label>
          <select
            id="memberRole"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="LEADER">Líder</option>
            <option value="CO_LEADER">Co-Líder</option>
            <option value="MEMBER">Miembro</option>
            <option value="GUEST">Invitado</option>
          </select>
        </div>
      </div>
    </FormModal>
  );
}
