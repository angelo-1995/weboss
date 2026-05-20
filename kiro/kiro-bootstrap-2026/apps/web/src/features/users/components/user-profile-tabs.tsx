'use client';

import { TabsLayout } from '@/components/layout/tabs-layout';
import { UserGeneralTab } from './user-general-tab';
import { UserContactTab } from './user-contact-tab';
import { UserMinistryTab } from './user-ministry-tab';
import { UserGroupsTab } from './user-groups-tab';
import { UserDiscipleshipTab } from './user-discipleship-tab';
import { UserSocialTab } from './user-social-tab';
import { SpiritualMilestones } from './spiritual-milestones';

interface UserProfileTabsProps {
  user: Record<string, unknown>;
  onUpdate?: () => void;
}

export function UserProfileTabs({ user, onUpdate }: UserProfileTabsProps) {
  const userId = user.id as string;

  const tabs = [
    {
      value: 'general',
      label: 'General',
      content: <UserGeneralTab user={user as any} onUpdate={onUpdate} />,
    },
    {
      value: 'contacto',
      label: 'Contacto',
      content: <UserContactTab user={user as any} onUpdate={onUpdate} />,
    },
    {
      value: 'ministerio',
      label: 'Ministerio',
      content: <UserMinistryTab user={user as any} />,
    },
    {
      value: 'grupos',
      label: 'Grupos',
      content: <UserGroupsTab user={user as any} />,
    },
    {
      value: 'discipulado',
      label: 'Discipulado',
      content: <UserDiscipleshipTab user={user as any} />,
    },
    {
      value: 'redes-sociales',
      label: 'Redes Sociales',
      content: <UserSocialTab user={user as any} onUpdate={onUpdate} />,
    },
    {
      value: 'hitos',
      label: 'Hitos',
      content: userId ? <SpiritualMilestones userId={userId} /> : null,
    },
  ];

  return <TabsLayout tabs={tabs} defaultValue="general" />;
}
