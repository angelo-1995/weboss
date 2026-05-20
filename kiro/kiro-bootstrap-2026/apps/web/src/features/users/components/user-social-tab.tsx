'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usersService } from '../services/users.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const socialSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  whatsapp: z.string().optional(),
});

type SocialInput = z.infer<typeof socialSchema>;

interface UserSocialTabProps {
  user: {
    id: string;
    profile?: {
      instagram?: string | null;
      facebook?: string | null;
      twitter?: string | null;
      linkedin?: string | null;
      whatsapp?: string | null;
    } | null;
  };
  onUpdate?: () => void;
}

export function UserSocialTab({ user, onUpdate }: UserSocialTabProps) {
  const { accessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
    reset,
  } = useForm<SocialInput>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      instagram: user.profile?.instagram ?? '',
      facebook: user.profile?.facebook ?? '',
      twitter: user.profile?.twitter ?? '',
      linkedin: user.profile?.linkedin ?? '',
      whatsapp: user.profile?.whatsapp ?? '',
    },
  });

  const onSubmit = async (data: SocialInput) => {
    if (!accessToken) return;

    const changedFields: Record<string, unknown> = {};
    for (const key of Object.keys(dirtyFields) as (keyof SocialInput)[]) {
      changedFields[key] = data[key];
    }

    if (Object.keys(changedFields).length === 0) {
      toast.info('No hay cambios para guardar');
      return;
    }

    try {
      await usersService.updateProfile(accessToken, user.id, changedFields);
      toast.success('Redes sociales actualizadas');
      reset(data);
      onUpdate?.();
    } catch (error) {
      toast.error('Error al actualizar redes sociales');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium">Instagram</label>
        <Input {...register('instagram')} placeholder="@usuario" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Facebook</label>
        <Input {...register('facebook')} placeholder="URL o nombre de usuario" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Twitter / X</label>
        <Input {...register('twitter')} placeholder="@usuario" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">LinkedIn</label>
        <Input {...register('linkedin')} placeholder="URL del perfil" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">WhatsApp</label>
        <Input {...register('whatsapp')} placeholder="+1 234 567 890" />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
