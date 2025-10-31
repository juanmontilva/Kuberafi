import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Tab {
  value: string;
  label: string;
  badge?: number;
  content: React.ReactNode;
}

interface ResponsiveTabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
}

export function ResponsiveTabs({ tabs, defaultValue, className }: ResponsiveTabsProps) {
  return (
    <Tabs defaultValue={defaultValue || tabs[0]?.value} className={cn('space-y-4', className)}>
      <TabsList className="w-full md:w-auto overflow-x-auto flex md:inline-flex justify-start">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-xs md:text-sm whitespace-nowrap flex-shrink-0"
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1 md:ml-2 px-1.5 py-0.5 text-xs rounded-full bg-muted">
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
