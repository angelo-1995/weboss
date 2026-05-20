'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormModal } from '@/components/forms/form-modal';
import { Input } from '@/components/ui/input';
import { api, ApiError } from '@/lib/api-client';
import { useCreateInvitation } from '../hooks/use-invitations';

const createInvitationSchema = z.object({
  email: z.string().email('Email inválido'),
  groupId: z.string().optional(),
});

type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

interface Group {
  id: string;
  name: string;
}

interface CreateInvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateInvitationModal({ open, onOpenChange, onSuccess }: CreateInvitationModalProps) {
  const createInvitation = useCreateInvitation();
  const [groups, setGroups] = useState<Group[]>([]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      email: '',
      groupId: undefined,
    },
  });

  // Load groups for the select
  useEffect(() => {
    if (!open) return;
    async function loadGroups() {
      try {
        const res = await api.get<{ data: Group[] } | Group[]>('/groups');
        const items = Array.isArray(res) ? res : (res as any).data ?? [];
        setGroups(items);
      } catch {
        /* ignore */
      }
    }
    loadGroups();
  }, [open]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: { email: string; groupId?: string } = { email: data.email };
      if (data.groupId) payload.groupId = data.groupId;

      await createInvitation.mutateAsync(payload);
      toast.success('Invitación enviada exitosamente');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('email', { message: 'Ya existe una invitación pendiente para este email' });
      } else {
        toast.error('Error al enviar la invitación');
      }
    }
  });

  return (
    <FormModal
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="Nueva Invitación"
      description="Enviar una invitación por email para unirse a la plataforma"
      onSubmit={onSubmit}
      isLoading={createInvitation.isPending}
      submitLabel="Enviar Invitación"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="groupId" className="text-sm font-medium">
            Grupo <span className="text-muted-foreground">(opcional)</span>
          </label>
          <select
            id="groupId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue=""
            {...register('groupId')}
          >
            <option value="">Sin grupo</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </FormModal>
  );
}
