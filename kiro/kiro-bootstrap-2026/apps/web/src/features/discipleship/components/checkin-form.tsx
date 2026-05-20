'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@community-os/ui';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddCheckIn } from '../hooks/use-discipleship';
import { checkInSchema, type CheckInInput } from '../schemas/discipleship.schema';

interface CheckInFormProps {
  relationshipId: string;
}

export function CheckInForm({ relationshipId }: CheckInFormProps) {
  const addCheckIn = useAddCheckIn(relationshipId);
  const [hoverRating, setHoverRating] = React.useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: '',
      rating: 3,
      attendees: '',
    },
  });

  const currentRating = watch('rating');

  const onSubmit = handleSubmit(async (data) => {
    try {
      await addCheckIn.mutateAsync(data);
      toast.success('Check-in registrado');
      reset({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        rating: 3,
        attendees: '',
      });
    } catch {
      toast.error('Error al registrar el check-in');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Date */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha</label>
        <Input
          {...register('date')}
          type="date"
          className="text-sm"
        />
        {errors.date && (
          <p className="text-xs text-destructive mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Rating */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Calificación</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setValue('rating', star, { shouldValidate: true })}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-colors',
                  (hoverRating || currentRating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30',
                )}
              />
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">{currentRating}/5</span>
        </div>
        {errors.rating && (
          <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Notas</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Resumen de la reunión..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
        {errors.notes && (
          <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Attendees */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Asistentes <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Input
          {...register('attendees')}
          placeholder="Nombres de asistentes"
          className="text-sm"
        />
      </div>

      <Button type="submit" size="sm" className="w-full" disabled={addCheckIn.isPending}>
        {addCheckIn.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
        Registrar Check-in
      </Button>
    </form>
  );
}
