import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { KuberafiSidebar } from '@/components/kuberafi-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface KuberafiLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function KuberafiLayout({
    children,
    breadcrumbs = [],
}: KuberafiLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <KuberafiSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}