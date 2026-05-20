'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateUserSchema, type UpdateUserInput } from '../schemas/user.schema';
import { usersService } from '../services/users.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

interface UserGeneralTabProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    bio?: string | null;
  };
  onUpdate?: () => void;
}

export function UserGeneralTab({ user, onUpdate }: UserGeneralTabProps) {
  const { accessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    reset,
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber ?? '',
    },
  });

  const onSubmit = async (data: UpdateUserInput) => {
    if (!accessToken) return;

    // Only send changed fields
    const changedFields: Record<string, unknown> = {};
    for (const key of Object.keys(dirtyFields) as (keyof UpdateUserInput)[]) {
      changedFields[key] = data[key];
    }

    if (Object.keys(changedFields).length === 0) {
      toast.info('No hay cambios para guardar');
      return;
    }

    try {
      await usersService.update(accessToken, user.id, changedFields);
      toast.success('Datos actualizados correctamente');
      reset(data);
      onUpdate?.();
    } catch (error) {
      toast.error('Error al actualizar los datos');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre</label>
          <Input {...register('firstName')} />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Apellido</label>
          <Input {...register('lastName')} />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" {...register('email')} />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Teléfono</label>
        <Input {...register('phoneNumber')} placeholder="+1 234 567 890" />
        {errors.phoneNumber && (
          <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
        )}
      </div>

      {isDirty && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar cambios
          </Button>
        </div>
      )}
    </form>
  );
}
