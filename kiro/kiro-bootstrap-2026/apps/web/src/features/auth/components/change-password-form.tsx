'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/forms/password-input';
import { changePasswordSchema, type ChangePasswordInput } from '../schemas/password.schema';
import { api, ApiError } from '@/lib/api-client';

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await api.patch('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Contraseña actualizada correctamente');
      reset();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError('currentPassword', {
          message: 'Contraseña actual incorrecta',
        });
      } else {
        toast.error('Error al cambiar la contraseña');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium">Contraseña actual</label>
        <PasswordInput {...register('currentPassword')} placeholder="••••••••" />
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nueva contraseña</label>
        <PasswordInput
          {...register('newPassword')}
          placeholder="••••••••"
          showStrength
          value={newPasswordValue}
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirmar nueva contraseña</label>
        <PasswordInput {...register('confirmPassword')} placeholder="••••••••" />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Cambiar contraseña
        </Button>
      </div>
    </form>
  );
}
