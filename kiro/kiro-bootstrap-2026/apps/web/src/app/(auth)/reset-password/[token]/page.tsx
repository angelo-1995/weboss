'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/forms/password-input';
import { api, ApiError } from '@/lib/api-client';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success('Contraseña actualizada');
      router.push('/login');
    } catch (err) {
      if (err instanceof ApiError && err.message.includes('expirado')) {
        setExpired(true);
      } else {
        setError(err instanceof ApiError ? err.message : 'Error al actualizar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  if (expired) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center space-y-4">
          <h1 className="text-xl font-semibold text-destructive">
            Enlace expirado
          </h1>
          <p className="text-sm text-muted-foreground">
            El enlace ha expirado. Solicita uno nuevo desde la página de recuperación.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm text-primary hover:underline"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Nueva contraseña</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              showStrength
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar contraseña</label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
