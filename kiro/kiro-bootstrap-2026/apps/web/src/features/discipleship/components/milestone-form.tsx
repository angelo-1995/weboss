'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddMilestone } from '../hooks/use-discipleship';
import { milestoneSchema, type MilestoneInput } from '../schemas/discipleship.schema';

interface MilestoneFormProps {
  relationshipId: string;
}

export function MilestoneForm({ relationshipId }: MilestoneFormProps) {
  const addMilestone = useAddMilestone(relationshipId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneInput>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      order: 1,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await addMilestone.mutateAsync(data);
      toast.success('Hito agregado');
      reset();
    } catch {
      toast.error('Error al agregar el hito');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Input
          {...register('title')}
          placeholder="Título del hito"
          className="text-sm"
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register('description')}
          placeholder="Descripción (opcional)"
          rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            {...register('order')}
            type="number"
            min={1}
            placeholder="Orden"
            className="text-sm"
          />
          {errors.order && (
            <p className="text-xs text-destructive mt-1">{errors.order.message}</p>
          )}
        </div>
        <Button type="submit" size="sm" disabled={addMilestone.isPending}>
          {addMilestone.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
          Agregar
        </Button>
      </div>
    </form>
  );
}
