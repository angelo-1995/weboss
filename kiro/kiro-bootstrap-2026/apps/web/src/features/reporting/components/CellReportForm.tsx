'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { useGroups } from '@/features/groups/hooks/use-groups';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { cellReportService } from '../services/cell-report.service';
import { useOfflineReport } from '../hooks/use-offline-report';
import {
  createCellReportSchema,
  computeTotalAttendance,
  type CreateCellReportInput,
} from '../schemas/cell-report.schema';

export function CellReportForm() {
  const { accessToken } = useAuthStore();
  const { data: groupsData } = useGroups({ pageSize: 100 });
  const groups = groupsData?.data ?? [];
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { isOnline, hasPending, saveOffline, getPending, clearPending } = useOfflineReport();
  const [lookupLoading, setLookupLoading] = useState(false);
  const msgTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateCellReportInput>({
    resolver: zodResolver(createCellReportSchema),
    defaultValues: {
      groupId: '',
      cellCode: '',
      meetingDate: '',
      coverageName: '',
      leaderName: '',
      coLeaderName: '',
      contactPhone: '',
      menCount: 0,
      womenCount: 0,
      youthMaleCount: 0,
      youthFemaleCount: 0,
      childrenCount: 0,
      visitorsCount: 0,
      convertsCount: 0,
      reconciledCount: 0,
      messageTopic: '',
      startTime: '',
      endTime: '',
      offeringAmount: undefined,
      district: '',
      neighborhood: '',
      sector: '',
      street: '',
      houseNumber: '',
      wasSupervised: false,
      observations: '',
    },
  });

  // Auto-fill leader, co-leader, and coverage when cellCode changes
  const cellCodeValue = watch('cellCode');
  const groupIdValue = watch('groupId');

  useEffect(() => {
    if (!cellCodeValue || cellCodeValue.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const result = await api.get<{
          group: { id: string; name: string } | null;
          leader: string | null;
          coLeader: string | null;
          coverage: string | null;
          phone: string | null;
        }>('/reports/cell/lookup', { code: cellCodeValue.trim() });

        if (result.leader) setValue('leaderName', result.leader);
        if (result.coLeader) setValue('coLeaderName', result.coLeader);
        if (result.coverage) setValue('coverageName', result.coverage);
        if (result.phone) setValue('contactPhone', result.phone);
        if (result.group) setValue('groupId', result.group.id);
      } catch {
        // Silently fail — user can still fill manually
      } finally {
        setLookupLoading(false);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [cellCodeValue, setValue]);

  // Auto-fill when group is selected from dropdown
  useEffect(() => {
    if (!groupIdValue) return;

    const timer = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const result = await api.get<{
          code: string | null;
          leader: string | null;
          coLeader: string | null;
          coverage: string | null;
          phone: string | null;
          location: {
            country: string;
            province: string;
            district: string;
            corregimiento: string;
            neighborhood: string;
            street: string;
            houseNumber: string;
          } | null;
        }>('/reports/cell/lookup-by-group', { groupId: groupIdValue });

        if (result.code) setValue('cellCode', result.code);
        if (result.leader) setValue('leaderName', result.leader);
        if (result.coLeader) setValue('coLeaderName', result.coLeader);
        if (result.coverage) setValue('coverageName', result.coverage);
        if (result.phone) setValue('contactPhone', result.phone);
        if (result.location) {
          if (result.location.district) setValue('district', result.location.corregimiento || result.location.district);
          if (result.location.neighborhood) setValue('neighborhood', result.location.neighborhood);
          if (result.location.street) setValue('street', result.location.street);
          if (result.location.houseNumber) setValue('houseNumber', result.location.houseNumber);
        }
      } catch {
        // Silently fail — user can still fill manually
      } finally {
        setLookupLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdValue]);

  // Try to send pending offline report when coming back online
  const sendPendingReport = async () => {
    const pending = getPending();
    if (!pending || !accessToken) return;
    try {
      await cellReportService.create(accessToken, pending);
      clearPending();
      toast.success('Reporte guardado localmente enviado correctamente');
      setSuccessMsg('Reporte guardado localmente enviado correctamente');
    } catch (err: any) {
      toast.error(`Error al enviar reporte pendiente: ${err.message}`);
      setErrorMsg(`Error al enviar reporte pendiente: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isOnline && hasPending) {
      // Show banner instead of auto-sending
    }
  }, [isOnline, hasPending]);

  const watchedValues = watch(['menCount', 'womenCount', 'youthMaleCount', 'youthFemaleCount', 'childrenCount']);
  const totalAttendance = computeTotalAttendance({
    menCount: watchedValues[0],
    womenCount: watchedValues[1],
    youthMaleCount: watchedValues[2],
    youthFemaleCount: watchedValues[3],
    childrenCount: watchedValues[4],
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!accessToken) return;

    // If offline, save locally
    if (!isOnline) {
      saveOffline(data);
      toast.info('Reporte guardado localmente. Se enviará cuando tengas conexión.');
      setSuccessMsg('Reporte guardado localmente. Se enviará cuando tengas conexión.');
      reset();
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    // Clear any existing timer
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);

    try {
      await cellReportService.create(accessToken, data);
      toast.success('Reporte enviado correctamente');
      setSuccessMsg('Reporte de célula enviado correctamente');
      reset();
      // Auto-clear success message after 5 seconds
      msgTimerRef.current = setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      if (err.status === 409) {
        toast.error('Ya existe un reporte para esta semana');
        setErrorMsg('Ya existe un reporte para esta célula en la semana indicada');
      } else if (err.status === 403) {
        toast.error('Solo el líder o co-líder puede enviar');
        setErrorMsg('Solo el líder o co-líder de la célula puede enviar el reporte');
      } else {
        toast.error(err.message ?? 'Error al enviar el reporte');
        setErrorMsg(err.message ?? 'Error al enviar el reporte');
      }
      // Auto-clear error message after 5 seconds
      msgTimerRef.current = setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-3xl">
      {/* Offline pending banner */}
      {isOnline && hasPending && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3 text-sm text-blue-800 dark:text-blue-200 flex items-center justify-between">
          <span>Tienes un reporte guardado sin enviar</span>
          <Button type="button" size="sm" variant="outline" onClick={sendPendingReport}>
            Enviar ahora
          </Button>
        </div>
      )}

      {!isOnline && (
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Sin conexión — El reporte se guardará localmente
        </div>
      )}
      {successMsg && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 text-sm text-green-800 dark:text-green-200">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-800 dark:text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Sección 1: Información General */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">1. Información General</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="groupId" className="text-sm font-medium">Grupo</label>
            <select
              id="groupId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('groupId')}
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {errors.groupId && <p className="text-xs text-destructive">{errors.groupId.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="cellCode" className="text-sm font-medium">Código de célula</label>
            <div className="relative">
              <Input id="cellCode" placeholder="Ej: E5.1" {...register('cellCode')} />
              {lookupLoading && (
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground animate-pulse">
                  Buscando...
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Al escribir el código se auto-rellenan líder, co-líder y cobertura</p>
            {errors.cellCode && <p className="text-xs text-destructive">{errors.cellCode.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="meetingDate" className="text-sm font-medium">Fecha de reunión</label>
            <Input id="meetingDate" type="date" max={new Date().toISOString().split('T')[0]} {...register('meetingDate')} />
            {errors.meetingDate && <p className="text-xs text-destructive">{errors.meetingDate.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="coverageName" className="text-sm font-medium">Nombre de cobertura</label>
            <Input id="coverageName" placeholder="Líder de cobertura" {...register('coverageName')} />
            {errors.coverageName && <p className="text-xs text-destructive">{errors.coverageName.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="leaderName" className="text-sm font-medium">Nombre del líder</label>
            <Input id="leaderName" placeholder="Líder de célula" {...register('leaderName')} />
            {errors.leaderName && <p className="text-xs text-destructive">{errors.leaderName.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="coLeaderName" className="text-sm font-medium">Co-líder <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="coLeaderName" placeholder="Co-líder" {...register('coLeaderName')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="contactPhone" className="text-sm font-medium">Teléfono de contacto <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="contactPhone" placeholder="+507 6000-0000" {...register('contactPhone')} />
          </div>
        </div>
      </fieldset>

      {/* Sección 2: Asistencia */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">2. Asistencia</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="menCount" className="text-sm font-medium">Hombres</label>
            <Input id="menCount" type="number" min={0} {...register('menCount')} />
            {errors.menCount && <p className="text-xs text-destructive">{errors.menCount.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="womenCount" className="text-sm font-medium">Mujeres</label>
            <Input id="womenCount" type="number" min={0} {...register('womenCount')} />
            {errors.womenCount && <p className="text-xs text-destructive">{errors.womenCount.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="youthMaleCount" className="text-sm font-medium">Jóvenes (M)</label>
            <Input id="youthMaleCount" type="number" min={0} {...register('youthMaleCount')} />
            {errors.youthMaleCount && <p className="text-xs text-destructive">{errors.youthMaleCount.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="youthFemaleCount" className="text-sm font-medium">Jóvenes (F)</label>
            <Input id="youthFemaleCount" type="number" min={0} {...register('youthFemaleCount')} />
            {errors.youthFemaleCount && <p className="text-xs text-destructive">{errors.youthFemaleCount.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="childrenCount" className="text-sm font-medium">Niños</label>
            <Input id="childrenCount" type="number" min={0} {...register('childrenCount')} />
            {errors.childrenCount && <p className="text-xs text-destructive">{errors.childrenCount.message}</p>}
          </div>
        </div>
        <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium">
          Total asistencia: <span className="text-primary font-bold">{totalAttendance}</span>
        </div>
      </fieldset>

      {/* Sección 3: Métricas de Crecimiento */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">3. Métricas de Crecimiento</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="visitorsCount" className="text-sm font-medium">Visitantes</label>
            <Input id="visitorsCount" type="number" min={0} {...register('visitorsCount')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="convertsCount" className="text-sm font-medium">Convertidos</label>
            <Input id="convertsCount" type="number" min={0} {...register('convertsCount')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="reconciledCount" className="text-sm font-medium">Reconciliados</label>
            <Input id="reconciledCount" type="number" min={0} {...register('reconciledCount')} />
          </div>
        </div>
      </fieldset>

      {/* Sección 4: Reunión */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">4. Reunión</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="messageTopic" className="text-sm font-medium">Tema del mensaje <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="messageTopic" placeholder="Tema de la enseñanza" {...register('messageTopic')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="offeringAmount" className="text-sm font-medium">Ofrenda <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="offeringAmount" type="number" min={0} step="0.01" placeholder="0.00" {...register('offeringAmount')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="startTime" className="text-sm font-medium">Hora de inicio</label>
            <Input id="startTime" type="time" {...register('startTime')} />
            {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="endTime" className="text-sm font-medium">Hora de fin</label>
            <Input id="endTime" type="time" {...register('endTime')} />
            {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Sección 5: Ubicación */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">5. Ubicación</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="district" className="text-sm font-medium">Corregimiento <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="district" {...register('district')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="neighborhood" className="text-sm font-medium">Barriada <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="neighborhood" {...register('neighborhood')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="sector" className="text-sm font-medium">Sector <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="sector" {...register('sector')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="street" className="text-sm font-medium">Calle <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="street" {...register('street')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="houseNumber" className="text-sm font-medium">Casa # <span className="text-muted-foreground">(opcional)</span></label>
            <Input id="houseNumber" {...register('houseNumber')} />
          </div>
        </div>
      </fieldset>

      {/* Sección 6: Observaciones */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">6. Observaciones</legend>
        <div className="flex items-center gap-2">
          <input
            id="wasSupervised"
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            {...register('wasSupervised')}
          />
          <label htmlFor="wasSupervised" className="text-sm font-medium">¿Fue supervisada?</label>
        </div>
        <div className="space-y-1">
          <label htmlFor="observations" className="text-sm font-medium">Observaciones <span className="text-muted-foreground">(opcional)</span></label>
          <textarea
            id="observations"
            placeholder="Observaciones adicionales..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            {...register('observations')}
          />
        </div>
      </fieldset>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? 'Enviando...' : 'Enviar Reporte de Célula'}
      </Button>
    </form>
  );
}
