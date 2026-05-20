'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { FormModal } from '@/components/forms/form-modal';
import { Input } from '@/components/ui/input';
import { PanamaLocationSelect, type PanamaLocationValue } from '@/components/forms/panama-location-select';
import { useUpdateGroup } from '../hooks/use-groups';
import { generateSlug } from '../schemas/group.schema';

const GROUP_TYPES = [
  { value: 'CELL', label: 'Célula' },
  { value: 'MINISTRY', label: 'Ministerio' },
  { value: 'CAMPUS', label: 'Campus' },
  { value: 'DEPARTMENT', label: 'Departamento' },
  { value: 'TEAM', label: 'Equipo' },
  { value: 'SPECIAL', label: 'Especial' },
];

interface GroupData {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  type: string;
  location?: {
    province?: string;
    district?: string;
    corregimiento?: string;
  } | null;
}

interface EditGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupData;
}

export function EditGroupModal({ open, onOpenChange, group }: EditGroupModalProps) {
  const updateGroup = useUpdateGroup();
  const [name, setName] = React.useState(group.name);
  const [slug, setSlug] = React.useState(group.slug);
  const [description, setDescription] = React.useState(group.description ?? '');
  const [type, setType] = React.useState(group.type);
  const [location, setLocation] = React.useState<PanamaLocationValue>({
    province: group.location?.province ?? '',
    district: group.location?.district ?? '',
    corregimiento: group.location?.corregimiento ?? '',
  });

  React.useEffect(() => {
    if (open) {
      setName(group.name);
      setSlug(group.slug);
      setDescription(group.description ?? '');
      setType(group.type);
      setLocation({
        province: group.location?.province ?? '',
        district: group.location?.district ?? '',
        corregimiento: group.location?.corregimiento ?? '',
      });
    }
  }, [open, group]);

  // Auto-generate slug when name changes
  React.useEffect(() => {
    if (name) {
      setSlug(generateSlug(name));
    }
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateGroup.mutateAsync({
        id: group.id,
        data: {
          name,
          description: description || undefined,
          type,
          slug,
          location: location.province
            ? { province: location.province, district: location.district, corregimiento: location.corregimiento }
            : undefined,
        },
      });
      toast.success('Grupo actualizado correctamente');
      onOpenChange(false);
    } catch {
      toast.error('Error al actualizar el grupo');
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Grupo"
      description="Modificar la información del grupo"
      onSubmit={handleSubmit}
      isLoading={updateGroup.isPending}
      submitLabel="Guardar Cambios"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="groupName" className="text-sm font-medium">Nombre</label>
          <Input
            id="groupName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="groupSlug" className="text-sm font-medium">
            Slug <span className="text-muted-foreground">(auto-generado)</span>
          </label>
          <Input
            id="groupSlug"
            value={slug}
            readOnly
            className="bg-muted/50 font-mono text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="groupDesc" className="text-sm font-medium">
            Descripción <span className="text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="groupDesc"
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="groupType" className="text-sm font-medium">Tipo</label>
          <select
            id="groupType"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {GROUP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Ubicación</label>
          <PanamaLocationSelect value={location} onChange={setLocation} />
        </div>
      </div>
    </FormModal>
  );
}
