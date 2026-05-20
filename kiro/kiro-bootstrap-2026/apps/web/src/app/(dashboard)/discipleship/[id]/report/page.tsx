'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@community-os/ui';
import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddCheckIn } from '@/features/discipleship/hooks/use-discipleship';
import { checkInSchema, type CheckInInput } from '@/features/discipleship/schemas/discipleship.schema';

export default function DiscipleshipReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const addCheckIn = useAddCheckIn(id);
  const [hoverRating, setHoverRating] = React.useState(0);

  const {
    register,
    handleSubmit,
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
      topics: '',
    },
  });

  const currentRating = watch('rating');

  const onSubmit = handleSubmit(async (data) => {
    try {
      await addCheckIn.mutateAsync(data);
      toast.success('Reporte de check-in enviado correctamente');
      router.push(`/discipleship/${id}`);
    } catch {
      toast.error('Error al enviar el reporte');
    }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={`/discipleship/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al detalle
      </Link>

      <PageHeader
        title="Nuevo Reporte de Reunión"
        description="Registra los detalles de la reunión de discipulado"
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 space-y-5">
          {/* Meeting date */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Fecha de reunión</label>
            <Input
              {...register('date')}
              type="date"
            />
            {errors.date && (
              <p className="text-xs text-destructive mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Calificación de la reunión</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setValue('rating', star, { shouldValidate: true })}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      (hoverRating || currentRating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30',
                    )}
                  />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-3">{currentRating} de 5</span>
            </div>
            {errors.rating && (
              <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Topics */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Temas tratados</label>
            <textarea
              {...register('topics')}
              rows={3}
              placeholder="Temas principales discutidos en la reunión..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Notas</label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="Observaciones, compromisos, próximos pasos..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            {errors.notes && (
              <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Attendees */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Asistentes <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Input
              {...register('attendees')}
              placeholder="Nombres de los asistentes a la reunión"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href={`/discipleship/${id}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={addCheckIn.isPending}>
            {addCheckIn.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Enviar Reporte
          </Button>
        </div>
      </form>
    </div>
  );
}
