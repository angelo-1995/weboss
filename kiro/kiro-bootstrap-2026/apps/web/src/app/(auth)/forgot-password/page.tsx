'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch {
      // Always show success message (don't reveal if email exists)
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email y te enviaremos un enlace de recuperación
          </p>
        </div>

        {submitted ? (
          <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4 text-sm text-green-800 dark:text-green-200">
            Si el email existe en nuestro sistema, recibirás un enlace de recuperación.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
