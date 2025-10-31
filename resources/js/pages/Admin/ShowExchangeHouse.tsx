import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { 
    ArrowLeft, 
    Edit, 
    Building2, 
    Users, 
    Mail, 
    Phone, 
    MapPin, 
    DollarSign, 
    TrendingUp,
    ChevronRight,
    Home,
    List,
    CreditCard,
    Shield,
    Percent,
    ArrowUpRight,
    ArrowDownRight,
    Tag,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';

interface ExchangeHouse {
    id: number;
    name: string;
    business_name: string;
    tax_id: string;
    email: string;
    phone?: string;
    address?: string;
    commission_rate: number;
    zero_commission_promo: boolean;
    daily_limit: number;
    allowed_currencies: string[];
    is_active: boolean;
    users_count: number;
    orders_count: number;
    orders_sum_base_amount: number;
    users?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        is_active: boolean;
    }>;
    currency_pairs?: Array<{
        id: number;
        from_currency: string;
        to_currency: string;
        pivot: {
            margin_percent: number;
            min_amount: number;
            max_amount: number;
            is_active: boolean;
        };
    }>;
}

interface Order {
    id: number;
    order_number: string;
    base_amount: number;
    quote_amount: number;
    status: string;
    created_at: string;
    currency_pair: {
        from_currency: string;
        to_currency: string;
    };
    user: {
        name: string;
    };
}

interface Stats {
    orders_this_month: number;
    volume_this_month: number;
    platform_commissions_this_month: number;
    exchange_commissions_this_month: number;
    orders_today: number;
    volume_today: number;
}

interface Props extends PageProps {
    exchangeHouse: ExchangeHouse;
    recentOrders: Order[];
    stats: Stats;
}

function ShowExchangeHouse({ exchangeHouse, recentOrders, stats }: Props) {
    const getStatusColor = (isActive: boolean) => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200';
    };

    const getStatusText = (isActive: boolean) => {
        return isActive ? 'Activa' : 'Inactiva';
    };

    const getOrderStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'completed': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getOrderStatusText = (status: string) => {
        const texts: Record<string, string> = {
            'completed': 'Completada',
            'pending': 'Pendiente',
            'cancelled': 'Cancelada',
        };
        return texts[status] || status;
    };

    return (
        <>
            <Head title={`Casa de Cambio - ${exchangeHouse.name}`} />
            
            <div className="space-y-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-sm">
                    <Link 
                        href="/dashboard" 
                        className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Home className="h-4 w-4 mr-1" />
                        Inicio
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Link 
                        href="/exchange-houses" 
                        className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Building2 className="h-4 w-4 mr-1" />
                        Casas de Cambio
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                        {exchangeHouse.name}
                    </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0">
                                <Link href="/exchange-houses">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                                    {exchangeHouse.name}
                                </h1>
                                <p className="text-muted-foreground">
                                    {exchangeHouse.business_name}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className={`${getStatusColor(exchangeHouse.is_active)} text-xs px-2 py-1`}>
                                <Shield className="h-3 w-3 mr-1" />
                                {getStatusText(exchangeHouse.is_active)}
                            </Badge>
                            {exchangeHouse.zero_commission_promo && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-2 py-1">
                                    <Tag className="h-3 w-3 mr-1" />
                                    PROMO 0%
                                </Badge>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/exchange-houses">
                                <List className="h-4 w-4 mr-2" />
                                Ver Todas
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={`/exchange-houses/${exchangeHouse.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Métricas Principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Órdenes Hoy</p>
                                    <p className="text-2xl font-bold">{stats.orders_today}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Volumen Hoy</p>
                                    <p className="text-2xl font-bold">${stats.volume_today.toLocaleString()}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Órdenes Este Mes</p>
                                    <p className="text-2xl font-bold">{stats.orders_this_month}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Volumen Este Mes</p>
                                    <p className="text-2xl font-bold">${stats.volume_this_month.toLocaleString()}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <ArrowUpRight className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Información General */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Nombre Comercial</p>
                                    <p className="font-semibold">{exchangeHouse.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">RIF/NIT</p>
                                    <p className="font-mono font-semibold">{exchangeHouse.tax_id}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Razón Social</p>
                                <p className="font-semibold">{exchangeHouse.business_name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contacto */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Información de Contacto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{exchangeHouse.email}</span>
                            </div>
                            {exchangeHouse.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{exchangeHouse.phone}</span>
                                </div>
                            )}
                            {exchangeHouse.address && (
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span>{exchangeHouse.address}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Configuración Financiera */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Configuración Financiera
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">Comisión Casa</p>
                                    <p className="text-xl font-bold">{exchangeHouse.commission_rate}%</p>
                                </div>
                                <Percent className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">Límite Diario</p>
                                    <p className="text-xl font-bold">${exchangeHouse.daily_limit.toLocaleString()}</p>
                                </div>
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {exchangeHouse.zero_commission_promo && (
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-purple-600" />
                                        <p className="text-sm font-semibold text-purple-900">Promoción Activa</p>
                                    </div>
                                    <p className="text-xs text-purple-700 mt-1">
                                        Esta casa no paga comisión a la plataforma
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comisiones del Mes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Comisiones Este Mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div>
                                    <p className="text-xs text-green-700">Ganancia Casa</p>
                                    <p className="text-xl font-bold text-green-900">
                                        ${stats.exchange_commissions_this_month.toLocaleString()}
                                    </p>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div>
                                    <p className="text-xs text-blue-700">Comisión Plataforma</p>
                                    <p className="text-xl font-bold text-blue-900">
                                        ${stats.platform_commissions_this_month.toLocaleString()}
                                    </p>
                                </div>
                                <ArrowDownRight className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Usuarios */}
                {exchangeHouse.users && exchangeHouse.users.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Usuarios ({exchangeHouse.users.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {exchangeHouse.users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-semibold text-primary">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {user.role === 'exchange_house' ? 'Admin' : 'Operador'}
                                            </Badge>
                                            {user.is_active ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pares de Monedas */}
                {exchangeHouse.currency_pairs && exchangeHouse.currency_pairs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Pares de Monedas Activos ({exchangeHouse.currency_pairs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {exchangeHouse.currency_pairs.map((pair) => (
                                    <div key={pair.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold">
                                                {pair.from_currency} → {pair.to_currency}
                                            </p>
                                            <Badge variant="outline" className="text-xs">
                                                +{pair.pivot.margin_percent}%
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p>Mín: ${pair.pivot.min_amount.toLocaleString()}</p>
                                            <p>Máx: ${pair.pivot.max_amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Últimas Órdenes */}
                {recentOrders && recentOrders.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Últimas Órdenes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-mono text-sm font-semibold">{order.order_number}</p>
                                                <Badge className={`${getOrderStatusColor(order.status)} text-xs`}>
                                                    {getOrderStatusText(order.status)}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {order.currency_pair.from_currency} → {order.currency_pair.to_currency} • {order.user.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">${order.base_amount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ShowExchangeHouse.layout = (page: React.ReactElement) => (
    <KuberafiLayout>{page}</KuberafiLayout>
);

export default ShowExchangeHouse;
