'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FormModal } from '@/components/forms/form-modal';
import { Input } from '@/components/ui/input';
import { UserSearchInput } from '@/components/forms/user-search-input';
import { useCreateUser } from '../hooks/use-create-user';
import { createUserSchema, type CreateUserInput } from '../schemas/user.schema';
import { ApiError, api } from '@/lib/api-client';

interface Network {
  id: string;
  name: string;
  code: string;
}

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateUserModal({ open, onOpenChange, onSuccess }: CreateUserModalProps) {
  const createUser = useCreateUser();
  const [networks, setNetworks] = useState<Network[]>([]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      roles: ['MEMBER'],
      spiritualStage: undefined,
      leaderId: undefined,
      networkId: undefined,
      sendInvitation: true,
    },
  });

  // Load networks
  useEffect(() => {
    if (!open) return;
    async function loadNetworks() {
      try {
        const res = await api.get<any[]>('/networks');
        const flat: Network[] = [];
        function flatten(nodes: any[]) {
          for (const n of nodes) {
            flat.push({ id: n.id, name: n.name, code: n.code });
            if (n.children?.length) flatten(n.children);
          }
        }
        flatten(Array.isArray(res) ? res : []);
        setNetworks(flat);
      } catch { /* ignore */ }
    }
    loadNetworks();
  }, [open]);

  const sendInvitation = watch('sendInvitation');

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Generate a random password (backend requires it, user won't see it)
      const randomPassword = crypto.randomUUID().slice(0, 16) + 'A1!';

      const { sendInvitation: shouldInvite, ...userData } = data;
      const result = await createUser.mutateAsync({
        ...userData,
        password: randomPassword,
      } as any);

      // Send invitation email if checked
      if (shouldInvite && data.email) {
        try {
          await api.post('/invitations', { email: data.email });
        } catch {
          // Non-blocking: user was created, invitation failed
        }
      }

      toast.success(`Miembro creado: ${data.firstName} ${data.lastName}`);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('email', { message: 'Este email ya está registrado' });
      } else {
        toast.error('Error al crear el miembro');
      }
    }
  });

  return (
    <FormModal
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="Nuevo Miembro"
      description="Registrar una nueva persona en la organización"
      onSubmit={onSubmit}
      isLoading={createUser.isPending}
      submitLabel="Crear Miembro"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="firstName" className="text-sm font-medium">
              Nombre
            </label>
            <Input id="firstName" placeholder="Nombre" {...register('firstName')} />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="lastName" className="text-sm font-medium">
              Apellido
            </label>
            <Input id="lastName" placeholder="Apellido" {...register('lastName')} />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Teléfono <span className="text-muted-foreground">(opcional)</span>
          </label>
          <Input id="phoneNumber" placeholder="+507 6000-0000" {...register('phoneNumber')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium">
              Rol
            </label>
            <select
              id="role"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue="MEMBER"
              onChange={(e) => {
                setValue('roles', [e.target.value]);
              }}
            >
              <option value="MEMBER">Miembro</option>
              <option value="LEADER">Líder</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="spiritualStage" className="text-sm font-medium">
              Etapa espiritual
            </label>
            <select
              id="spiritualStage"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue=""
              {...register('spiritualStage')}
            >
              <option value="">Sin asignar</option>
              <option value="GANADO">Ganado</option>
              <option value="CONSOLIDADO">Consolidado</option>
              <option value="DISCIPULADO">Discipulado</option>
              <option value="ENVIADO">Enviado</option>
            </select>
          </div>
        </div>

        {/* Cobertura (líder) */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Cobertura <span className="text-muted-foreground">(opcional)</span>
          </label>
          <UserSearchInput
            placeholder="Buscar líder de cobertura..."
            onSelect={(user) => setValue('leaderId', user.id)}
          />
          <p className="text-xs text-muted-foreground">Líder que dará cobertura a este miembro</p>
        </div>

        {/* Red */}
        <div className="space-y-1">
          <label htmlFor="networkId" className="text-sm font-medium">
            Red <span className="text-muted-foreground">(opcional)</span>
          </label>
          <select
            id="networkId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue=""
            {...register('networkId')}
          >
            <option value="">Sin red</option>
            {networks.map((n) => (
              <option key={n.id} value={n.id}>{n.name} ({n.code})</option>
            ))}
          </select>
        </div>

        {/* Enviar invitación */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <input
            id="sendInvitation"
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            {...register('sendInvitation')}
          />
          <label htmlFor="sendInvitation" className="text-sm font-medium">
            Enviar invitación por email
          </label>
        </div>
      </div>
    </FormModal>
  );
}
