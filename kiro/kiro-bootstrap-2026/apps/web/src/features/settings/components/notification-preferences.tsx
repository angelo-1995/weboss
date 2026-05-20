'use client';

import { useState } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationPreferences() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inSiteNotifications, setInSiteNotifications] = useState(true);

  return (
    <div className="space-y-3 max-w-md">
      <ToggleSwitch
        checked={emailNotifications}
        onChange={setEmailNotifications}
        label="Notificaciones por email"
        description="Recibe alertas y resúmenes en tu correo electrónico"
      />
      <ToggleSwitch
        checked={inSiteNotifications}
        onChange={setInSiteNotifications}
        label="Notificaciones en el sitio"
        description="Muestra notificaciones dentro de la plataforma"
      />
      <p className="text-xs text-muted-foreground pt-2">
        Las preferencias de notificación se guardarán automáticamente cuando el backend esté disponible.
      </p>
    </div>
  );
}
