'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FormModal } from '@/components/forms/form-modal';
import { Input } from '@/components/ui/input';
import { UserSearchInput } from '@/components/forms/user-search-input';
import { PanamaLocationSelect, type PanamaLocationValue } from '@/components/forms/panama-location-select';
import { useCreateGroup } from '../hooks/use-create-group';
import { createGroupSchema, GROUP_TYPES, generateSlug, type CreateGroupInput } from '../schemas/group.schema';
import { ApiError } from '@/lib/api-client';

const TYPE_LABELS: Record<string, string> = {
  CELL: 'Célula',
  MINISTRY: 'Ministerio',
  TEAM: 'Equipo',
  DEPARTMENT: 'Departamento',
  CAMPUS: 'Campus',
  SPECIAL: 'Especial',
};

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateGroupModal({ open, onOpenChange, onSuccess }: CreateGroupModalProps) {
  const createGroup = useCreateGroup();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      slug: '',
      code: '',
      description: '',
      type: 'CELL',
      country: 'Panamá',
      province: '',
      district: '',
      corregimiento: '',
      neighborhood: '',
      street: '',
      houseNumber: '',
    },
  });

  // Auto-generate slug from name
  const nameValue = watch('name');
  useEffect(() => {
    if (nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false });
    } else {
      setValue('slug', '', { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Ensure slug is generated
      if (!data.slug && data.name) {
        data.slug = generateSlug(data.name);
      }
      await createGroup.mutateAsync(data);
      toast.success(`Grupo creado: ${data.name}`);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Ya existe un grupo con ese nombre o código');
      } else {
        toast.error('Error al crear el grupo');
      }
    }
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude);
        setValue('longitude', pos.coords.longitude);
        toast.success('Ubicación obtenida');
      },
      () => {
        toast.error('No se pudo obtener la ubicación');
      },
    );
  };

  return (
    <FormModal
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="Crear Grupo"
      description="Crear un nuevo grupo/célula en la organización"
      onSubmit={onSubmit}
      isLoading={createGroup.isPending}
      submitLabel="Crear Grupo"
    >
      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
        {/* Información básica */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground">Información básica</legend>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Nombre</label>
              <Input id="name" placeholder="Nombre del grupo" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="code" className="text-sm font-medium">Código</label>
              <Input id="code" placeholder="Ej: E5.1" {...register('code')} />
              <p className="text-xs text-muted-foreground">Código jerárquico de la célula</p>
            </div>
          </div>

          {/* Slug auto-generated (read-only) */}
          <div className="space-y-1">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug <span className="text-muted-foreground">(auto-generado)</span>
            </label>
            <Input
              id="slug"
              readOnly
              className="bg-muted/50 font-mono text-xs"
              {...register('slug')}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción <span className="text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="description"
              placeholder="Descripción del grupo..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              {...register('description')}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="type" className="text-sm font-medium">Tipo</label>
            <select
              id="type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('type')}
            >
              {GROUP_TYPES.map((type) => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Líderes */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground">Líderes</legend>

          <div className="space-y-1">
            <label className="text-sm font-medium">Líder</label>
            <UserSearchInput
              placeholder="Buscar líder..."
              onSelect={(user) => setValue('leaderId', user.id)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Co-líder <span className="text-muted-foreground">(opcional)</span></label>
            <UserSearchInput
              placeholder="Buscar co-líder..."
              onSelect={(user) => setValue('coLeaderId', user.id)}
            />
          </div>
        </fieldset>

        {/* Ubicación */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground">Ubicación</legend>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label htmlFor="country" className="text-sm font-medium">País</label>
              <Input id="country" placeholder="Panamá" {...register('country')} />
            </div>
          </div>

          <PanamaLocationSelect
            value={{
              province: watch('province') ?? '',
              district: watch('district') ?? '',
              corregimiento: watch('corregimiento') ?? '',
            }}
            onChange={(loc: PanamaLocationValue) => {
              setValue('province', loc.province);
              setValue('district', loc.district);
              setValue('corregimiento', loc.corregimiento);
            }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="neighborhood" className="text-sm font-medium">Barriada/Sector</label>
              <Input id="neighborhood" placeholder="Barriada o sector" {...register('neighborhood')} />
            </div>
            <div className="space-y-1">
              <label htmlFor="street" className="text-sm font-medium">Calle</label>
              <Input id="street" placeholder="Calle" {...register('street')} />
            </div>
            <div className="space-y-1">
              <label htmlFor="houseNumber" className="text-sm font-medium">Casa #</label>
              <Input id="houseNumber" placeholder="Número de casa" {...register('houseNumber')} />
            </div>
          </div>

          {/* Coordenadas GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Coordenadas GPS</label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs text-primary hover:underline"
              >
                📍 Obtener mi ubicación
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input
                  placeholder="Latitud"
                  type="number"
                  step="any"
                  {...register('latitude')}
                />
              </div>
              <div className="space-y-1">
                <Input
                  placeholder="Longitud"
                  type="number"
                  step="any"
                  {...register('longitude')}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Puedes obtener las coordenadas automáticamente o copiarlas desde Google Maps
            </p>
          </div>
        </fieldset>
      </div>
    </FormModal>
  );
}
