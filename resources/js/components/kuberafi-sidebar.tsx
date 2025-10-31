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
    ArrowLeftRight,
    CreditCard,
    MessageSquare,
    Target,
    Wallet,
    Coins
} from 'lucide-react';
import AppLogo from './app-logo';

export function KuberafiSidebar() {
    const { user, isSuperAdmin, isExchangeHouse, isOperator } = useAuth();
    
    // Cerrar sidebar en móvil después de navegar
    const handleNavigation = () => {
        // El sidebar se cerrará automáticamente en móvil gracias al Sheet
    };

    // Navegación para Super Admin
    const superAdminNavItems: NavItem[] = [
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
            title: 'Casas de Cambio',
            href: '/exchange-houses',
            icon: Building2,
        },
        {
            title: 'Usuarios',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Divisas',
            href: '/admin/currencies',
            icon: Coins,
        },
        {
            title: 'Pares de Divisas',
            href: '/admin/currency-pairs',
            icon: ArrowLeftRight,
        },
        {
            title: 'Solicitudes de Pago',
            href: '/admin/commission-requests',
            icon: DollarSign,
            badge: 'important',
        },
        {
            title: 'Comisiones',
            href: '/admin/commissions',
            icon: FileText,
        },
        {
            title: 'Métodos de Pago',
            href: '/admin/platform-payment-methods',
            icon: CreditCard,
        },
        {
            title: 'Reportes',
            href: '/admin/reports',
            icon: BarChart3,
        },
        {
            title: 'Soporte',
            href: '/tickets',
            icon: MessageSquare,
        },
        {
            title: 'Configuración',
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
            title: 'Finanzas',
            href: '/cash-box',
            icon: DollarSign,
            items: [
                {
                    title: 'Mi Fondo de Caja',
                    href: '/cash-box',
                },
                {
                    title: 'Cierre de Operaciones',
                    href: '/operation-closure',
                },
                {
                    title: 'Pagos a Kuberafi',
                    href: '/my-commission-requests',
                    badge: 'important',
                },
            ],
        },
        {
            title: 'Configuración',
            href: '/currency-pairs',
            icon: Settings,
            items: [
                {
                    title: 'Pares de Divisas',
                    href: '/currency-pairs',
                },
                {
                    title: 'Métodos de Pago',
                    href: '/payment-methods',
                },
            ],
        },
        {
            title: 'Mis Clientes',
            href: '/customers',
            icon: Users,
        },
        {
            title: 'Rendimiento',
            href: '/my-performance',
            icon: Target,
            items: [
                {
                    title: 'Mi Rendimiento',
                    href: '/my-performance',
                },
                {
                    title: 'Configurar Metas',
                    href: '/performance-goals',
                },
            ],
        },
        {
            title: 'Soporte',
            href: '/tickets',
            icon: MessageSquare,
        },
    ];

    // Navegación para Operador (MÁS LIMITADO que Casa de Cambio)
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
            title: 'Mi Fondo de Caja',
            href: '/cash-box',
            icon: Wallet,
        },
        {
            title: 'Cierre de Operaciones',
            href: '/operation-closure',
            icon: FileText,
        },
        {
            title: 'Mis Clientes',
            href: '/customers',
            icon: Users,
        },
        {
            title: 'Mi Rendimiento',
            href: '/my-performance',
            icon: Target,
        },
        {
            title: 'Soporte',
            href: '/tickets',
            icon: MessageSquare,
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