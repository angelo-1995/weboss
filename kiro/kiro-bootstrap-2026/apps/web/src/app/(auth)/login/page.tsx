import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/5 via-background to-primary/10 items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">C</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">Community OS</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            La plataforma integral para gestionar tu comunidad. Personas, grupos, discipulado y reportes en un solo lugar.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">100%</span>
              <span className="text-xs text-muted-foreground">Visibilidad</span>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">360°</span>
              <span className="text-xs text-muted-foreground">Seguimiento</span>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">∞</span>
              <span className="text-xs text-muted-foreground">Escalable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Community OS</span>
          </div>

          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
          </div>

          <LoginForm />

          <div className="text-center lg:text-left">
            <Link href={'/forgot-password' as any} className="text-sm text-primary hover:text-primary/80 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center lg:text-left pt-8">
            © 2026 Community OS
          </p>
        </div>
      </div>
    </div>
  );
}
