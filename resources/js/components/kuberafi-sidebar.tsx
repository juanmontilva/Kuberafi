import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    TrendingUp, 
    DollarSign,
    FileText,
    Building2,
    Users,
    BarChart3,
    Settings,
    ArrowLeftRight
} from 'lucide-react';
import AppLogo from './app-logo';

export function KuberafiSidebar() {
    const { user, isSuperAdmin, isExchangeHouse, isOperator } = useAuth();

    // Navegación para Super Admin
    const superAdminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Todas las Órdenes',
            href: '/orders',
            icon: TrendingUp,
        },
        {
            title: 'Pares de Divisas',
            href: '/admin/currency-pairs',
            icon: ArrowLeftRight,
        },
        {
            title: 'Gestión de Pagos',
            href: '/admin/payments/dashboard',
            icon: DollarSign,
        },
        {
            title: 'Comisiones Plataforma',
            href: '/admin/commissions',
            icon: FileText,
        },
        {
            title: 'Casas de Cambio',
            href: '/exchange-houses',
            icon: Building2,
        },
        {
            title: 'Gestión de Usuarios',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Reportes Avanzados',
            href: '/admin/reports',
            icon: BarChart3,
        },
        {
            title: 'Configuraciones',
            href: '/admin/settings',
            icon: Settings,
        },
    ];

    // Navegación para Casa de Cambio
    const exchangeHouseNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Órdenes',
            href: '/orders',
            icon: TrendingUp,
        },
        {
            title: 'Nueva Orden',
            href: '/orders/create',
            icon: DollarSign,
        },
        {
            title: 'Pares',
            href: '/currency-pairs',
            icon: ArrowLeftRight,
        },
        {
            title: 'Mis Comisiones',
            href: '/my-commissions',
            icon: FileText,
        },
    ];

    // Navegación para Operador
    const operatorNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Mis Órdenes',
            href: '/orders',
            icon: TrendingUp,
        },
        {
            title: 'Nueva Orden',
            href: '/orders/create',
            icon: DollarSign,
        },
    ];

    // Seleccionar navegación según el rol
    let mainNavItems: NavItem[] = [];
    if (isSuperAdmin) {
        mainNavItems = superAdminNavItems;
    } else if (isExchangeHouse) {
        mainNavItems = exchangeHouseNavItems;
    } else if (isOperator) {
        mainNavItems = operatorNavItems;
    }

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Kuberafi</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {user.exchange_house?.name || 'Plataforma'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}