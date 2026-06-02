import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: J-PDVE Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#050505] via-[#0d1117] to-[#1565FF]/20 items-center justify-center p-12 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#1565FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-[#FFB400]/10 rounded-full blur-3xl" />

        <div className="relative max-w-md space-y-8 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#1565FF] flex items-center justify-center shadow-lg shadow-[#1565FF]/30">
              <span className="text-white text-lg font-bold tracking-tight">JP</span>
            </div>
            <div>
              <span className="text-3xl font-heading tracking-tight block">J-PDVE</span>
              <span className="text-sm text-white/60 tracking-wide">CONEXIONES</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-lg text-white/70 leading-relaxed">
            La plataforma integral para conectar, crecer y transformar vidas. Gestión ministerial, discipulado y reportes en un ecosistema unificado.
          </p>

          {/* Stats */}
          <div className="flex gap-6 pt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-heading text-[#FFB400]">100%</span>
              <span className="text-xs text-white/50">Visibilidad</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-heading text-[#FFB400]">360°</span>
              <span className="text-xs text-white/50">Seguimiento</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-heading text-[#FFB400]">∞</span>
              <span className="text-xs text-white/50">Crecimiento</span>
            </div>
          </div>

          {/* Ministry quote */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-sm text-white/40 italic">
              "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos."
            </p>
            <p className="text-xs text-white/30 mt-1">— Mateo 18:20</p>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-6">
            <div className="h-12 w-12 rounded-xl bg-[#1565FF] flex items-center justify-center shadow-lg shadow-[#1565FF]/20">
              <span className="text-white text-lg font-bold">JP</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-heading tracking-tight block">J-PDVE</span>
              <span className="text-xs text-muted-foreground tracking-widest">CONEXIONES</span>
            </div>
          </div>

          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-heading tracking-tight">Iniciar Sesión</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
          </div>

          <LoginForm />

          <div className="text-center lg:text-left">
            <Link href={'/forgot-password' as any} className="text-sm text-primary hover:text-primary/80 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center lg:text-left pt-8">
            © 2026 J-PDVE Conexiones · Ministerio Palabras de Vida Eterna
          </p>
        </div>
      </div>
    </div>
  );
}
