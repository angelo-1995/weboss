'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Milestones {
  isBaptized: boolean;
  hasFirstRetreat: boolean;
  hasAcademy: boolean;
  hasLaunch: boolean;
}

interface MilestoneBadgesProps {
  userId: string;
}

export function MilestoneBadges({ userId }: MilestoneBadgesProps) {
  const [milestones, setMilestones] = useState<Milestones | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Milestones>(`/users/${userId}/milestones`);
        setMilestones(data);
      } catch { /* no milestones */ }
    }
    load();
  }, [userId]);

  if (!milestones) return null;

  const badges: { show: boolean; emoji: string; label: string; color: string }[] = [
    { show: milestones.isBaptized, emoji: '🎉', label: 'Bautizado', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
    { show: milestones.hasFirstRetreat, emoji: '⛰️', label: 'Retiro', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' },
    { show: milestones.hasAcademy, emoji: '🎓', label: 'Academia', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' },
    { show: milestones.hasLaunch, emoji: '🚀', label: 'Lanzamiento', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
  ];

  const visible = badges.filter(b => b.show);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {visible.map((badge) => (
        <span
          key={badge.label}
          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}
        >
          <span>{badge.emoji}</span>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
