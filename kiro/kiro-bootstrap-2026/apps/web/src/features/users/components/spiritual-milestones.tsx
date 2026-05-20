'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';

interface Milestones {
  id: string;
  isBaptized: boolean;
  baptizedDate: string | null;
  hasFirstRetreat: boolean;
  retreatDate: string | null;
  hasAcademy: boolean;
  academyDate: string | null;
  hasLaunch: boolean;
  launchDate: string | null;
}

interface MilestoneItem {
  key: keyof Pick<Milestones, 'isBaptized' | 'hasFirstRetreat' | 'hasAcademy' | 'hasLaunch'>;
  dateKey: keyof Pick<Milestones, 'baptizedDate' | 'retreatDate' | 'academyDate' | 'launchDate'>;
  label: string;
}

const MILESTONE_ITEMS: MilestoneItem[] = [
  { key: 'isBaptized', dateKey: 'baptizedDate', label: 'Bautizado' },
  { key: 'hasFirstRetreat', dateKey: 'retreatDate', label: 'Primer Retiro' },
  { key: 'hasAcademy', dateKey: 'academyDate', label: 'Academia completada' },
  { key: 'hasLaunch', dateKey: 'launchDate', label: 'Lanzamiento' },
];

interface SpiritualMilestonesProps {
  userId: string;
}

export function SpiritualMilestones({ userId }: SpiritualMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestones | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    try {
      const data = await api.get<Milestones>(`/users/${userId}/milestones`);
      setMilestones(data);
    } catch {
      // User might not have milestones yet
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleToggle = async (item: MilestoneItem, checked: boolean) => {
    if (!milestones) return;
    setSaving(item.key);

    const payload: Record<string, any> = {
      [item.key]: checked,
    };

    // If unchecking, clear the date
    if (!checked) {
      payload[item.dateKey] = null;
    }
    // If checking and no date, set today
    if (checked && !milestones[item.dateKey]) {
      payload[item.dateKey] = new Date().toISOString();
    }

    try {
      const updated = await api.patch<Milestones>(`/users/${userId}/milestones`, payload);
      setMilestones(updated);
      toast.success(`Hito "${item.label}" ${checked ? 'completado' : 'desmarcado'}`);
    } catch (err) {
      console.error('Error updating milestone:', err);
      toast.error('Error al actualizar el hito');
    } finally {
      setSaving(null);
    }
  };

  const handleDateChange = async (item: MilestoneItem, date: string) => {
    if (!milestones) return;
    setSaving(item.dateKey);

    try {
      const updated = await api.patch<Milestones>(`/users/${userId}/milestones`, {
        [item.dateKey]: date ? new Date(date).toISOString() : null,
      });
      setMilestones(updated);
    } catch (err) {
      console.error('Error updating date:', err);
      toast.error('Error al actualizar la fecha');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border p-4 animate-pulse h-40" />
    );
  }

  if (!milestones) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold mb-4">Hitos Espirituales</h3>
      <div className="space-y-3">
        {MILESTONE_ITEMS.map((item) => {
          const isChecked = milestones[item.key];
          const dateValue = milestones[item.dateKey];

          return (
            <div key={item.key} className="flex items-start gap-3">
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => handleToggle(item, !isChecked)}
                  disabled={saving === item.key}
                  className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-input hover:border-primary'
                  } ${saving === item.key ? 'opacity-50' : ''}`}
                >
                  {isChecked && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isChecked ? 'text-green-700 dark:text-green-400' : ''}`}>
                  {item.label}
                </p>
                {isChecked && (
                  <div className="mt-1">
                    <input
                      type="date"
                      value={dateValue ? dateValue.split('T')[0] : ''}
                      onChange={(e) => handleDateChange(item, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-background"
                    />
                    {dateValue && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(dateValue).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
