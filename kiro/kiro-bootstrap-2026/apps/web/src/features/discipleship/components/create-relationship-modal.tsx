'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FormModal } from '@/components/forms/form-modal';
import { UserSearchInput } from '@/components/forms/user-search-input';
import { Input } from '@/components/ui/input';
import { useCreateRelationship } from '../hooks/use-discipleship';
import { createRelationshipSchema, relationshipTypes, type CreateRelationshipInput } from '../schemas/discipleship.schema';
import { ApiError } from '@/lib/api-client';

interface CreateRelationshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRelationshipModal({ open, onOpenChange }: CreateRelationshipModalProps) {
  const createMutation = useCreateRelationship();
  const [cycleError, setCycleError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateRelationshipInput>({
    resolver: zodResolver(createRelationshipSchema),
    defaultValues: {
      discipleId: '',
      type: 'MENTOR_MENTEE',
      groupId: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setCycleError(null);
    try {
      await createMutation.mutateAsync(data);
      toast.success('Relación de discipulado creada');
      reset();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setCycleError('No se puede crear: generaría un ciclo en la jerarquía');
      } else {
        toast.error('Error al crear la relación');
      }
    }
  });

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setCycleError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <FormModal
      open={open}
      onOpenChange={handleClose}
      title="Nueva Relación de Discipulado"
      description="Crea una nueva relación de mentoría o seguimiento"
      onSubmit={onSubmit}
      isLoading={createMutation.isPending}
      submitLabel="Crear Relación"
    >
      <div className="space-y-4">
        {/* Disciple search */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Discípulo</label>
          <UserSearchInput
            placeholder="Buscar discípulo..."
            onSelect={(user) => setValue('discipleId', user.id, { shouldValidate: true })}
          />
          {errors.discipleId && (
            <p className="text-xs text-destructive mt-1">{errors.discipleId.message}</p>
          )}
        </div>

        {/* Type select */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Tipo de relación</label>
          <select
            {...register('type')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {relationshipTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-xs text-destructive mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Group (optional) */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Grupo <span className="text-muted-foreground">(opcional)</span>
          </label>
          <Input {...register('groupId')} placeholder="ID del grupo" />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Notas <span className="text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Notas adicionales sobre la relación..."
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Cycle error */}
        {cycleError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{cycleError}</p>
          </div>
        )}
      </div>
    </FormModal>
  );
}
