'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { OnboardingForm } from '@/features/auth/components/onboarding-form';
import { api } from '@/lib/api-client';

export default function ActivateAccountPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [status, setStatus] = useState<'loading' | 'valid' | 'expired'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('expired');
      return;
    }

    api.get<{ valid: boolean }>(`/invitations/validate/${token}`)
      .then((res) => {
        setStatus(res.valid ? 'valid' : 'expired');
      })
      .catch(() => {
        setStatus('expired');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center space-y-4">
          <h1 className="text-xl font-semibold text-destructive">
            Invitación expirada
          </h1>
          <p className="text-sm text-muted-foreground">
            Esta invitación ha expirado. Contacta a tu administrador.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-primary hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8">
        <OnboardingForm token={token!} />
      </div>
    </div>
  );
}
