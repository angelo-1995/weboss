'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usersService } from '../services/users.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const contactSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

type ContactInput = z.infer<typeof contactSchema>;

interface UserContactTabProps {
  user: {
    id: string;
    profile?: {
      address?: string | null;
      city?: string | null;
      country?: string | null;
      postalCode?: string | null;
    } | null;
  };
  onUpdate?: () => void;
}

export function UserContactTab({ user, onUpdate }: UserContactTabProps) {
  const { accessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      address: user.profile?.address ?? '',
      city: user.profile?.city ?? '',
      country: user.profile?.country ?? '',
      postalCode: user.profile?.postalCode ?? '',
    },
  });

  const onSubmit = async (data: ContactInput) => {
    if (!accessToken) return;

    const changedFields: Record<string, unknown> = {};
    for (const key of Object.keys(dirtyFields) as (keyof ContactInput)[]) {
      changedFields[key] = data[key];
    }

    if (Object.keys(changedFields).length === 0) {
      toast.info('No hay cambios para guardar');
      return;
    }

    try {
      await usersService.updateProfile(accessToken, user.id, changedFields);
      toast.success('Contacto actualizado correctamente');
      reset(data);
      onUpdate?.();
    } catch (error) {
      toast.error('Error al actualizar el contacto');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium">Dirección</label>
        <Input {...register('address')} placeholder="Calle, número, colonia" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ciudad</label>
          <Input {...register('city')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">País</label>
          <Input {...register('country')} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Código Postal</label>
        <Input {...register('postalCode')} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
