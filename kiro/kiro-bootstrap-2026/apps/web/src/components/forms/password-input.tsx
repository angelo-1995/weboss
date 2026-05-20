'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@community-os/ui';

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showStrength?: boolean;
}

function calculateStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Débil' };
  if (score <= 2) return { score, label: 'Media' };
  return { score, label: 'Fuerte' };
}

const strengthColors: Record<number, string> = {
  0: 'bg-muted',
  1: 'bg-red-500',
  2: 'bg-yellow-500',
  3: 'bg-green-400',
  4: 'bg-green-500',
};

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, value, onChange, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState('');

    const currentValue = (value as string) ?? internalValue;
    const strength = calculateStrength(currentValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={cn('pr-10', className)}
            value={value}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => setVisible(!visible)}
            tabIndex={-1}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showStrength && currentValue.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i <= strength.score ? strengthColors[strength.score] : 'bg-muted',
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strength.label}</p>
          </div>
        )}
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
