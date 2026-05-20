'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Tab {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsLayoutProps {
  tabs: Tab[];
  defaultValue?: string;
}

export function TabsLayout({ tabs, defaultValue }: TabsLayoutProps) {
  const initial = defaultValue || tabs[0]?.value || '';

  return (
    <Tabs defaultValue={initial}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
