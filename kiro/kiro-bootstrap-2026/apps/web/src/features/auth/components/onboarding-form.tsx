'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/forms/password-input';
import { api, ApiError } from '@/lib/api-client';

const onboardingSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[0-9]/, 'Debe contener un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener un símbolo'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type OnboardingInput = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  token: string;
}

export function OnboardingForm({ token }: OnboardingFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: OnboardingInput) => {
    try {
      await api.post('/invitations/activate', {
        token,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success('Cuenta activada correctamente');
      router.push('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Error al activar la cuenta');
      } else {
        toast.error('Error al activar la cuenta');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          ¡Bienvenido!
        </h1>
        <p className="text-sm text-muted-foreground">
          Completa tus datos para activar tu cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              {...register('firstName')}
              placeholder="Juan"
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Apellido</label>
            <Input
              {...register('lastName')}
              placeholder="Pérez"
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Contraseña</label>
          <PasswordInput
            {...register('password')}
            placeholder="••••••••"
            showStrength
            value={passwordValue}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Confirmar contraseña</label>
          <PasswordInput {...register('confirmPassword')} placeholder="••••••••" />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Activar cuenta
        </Button>
      </form>
    </div>
  );
}
