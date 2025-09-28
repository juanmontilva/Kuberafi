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
    Calendar,
    CreditCard,
    Shield
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
    daily_limit: number;
    allowed_currencies: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    users_count: number;
    orders_count: number;
    orders_sum_base_amount: number;
    users?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
    orders?: Array<{
        id: number;
        order_number: string;
        base_amount: number;
        status: string;
        created_at: string;
    }>;
}

interface Props extends PageProps {
    exchangeHouse: ExchangeHouse;
}

function ShowExchangeHouse({ exchangeHouse }: Props) {
    const getStatusColor = (isActive: boolean) => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200';
    };

    const getStatusText = (isActive: boolean) => {
        return isActive ? 'Activa' : 'Inactiva';
    };

    return (
        <>
            <Head title={`Casa de Cambio - ${exchangeHouse.name}`} />
            
            <div className="space-y-8">
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0">
                                <Link href="/exchange-houses">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                                    {exchangeHouse.name}
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    {exchangeHouse.business_name}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className={`${getStatusColor(exchangeHouse.is_active)} text-sm px-3 py-1`}>
                                <Shield className="h-3 w-3 mr-1" />
                                {getStatusText(exchangeHouse.is_active)}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {exchangeHouse.users_count} usuarios
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                {exchangeHouse.orders_count} órdenes
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/exchange-houses">
                                <List className="h-4 w-4 mr-2" />
                                Ver Todas
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/exchange-houses/${exchangeHouse.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Información General */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Información General
                            </CardTitle>
                            <CardDescription>
                                Datos básicos y configuración de la casa de cambio
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Nombre Comercial</p>
                                    <p className="text-lg font-semibold">{exchangeHouse.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Razón Social</p>
                                    <p className="text-lg font-semibold">{exchangeHouse.business_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">RIF/NIT</p>
                                    <p className="text-lg font-mono font-semibold bg-muted px-3 py-2 rounded-md">
                                        {exchangeHouse.tax_id}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información de Contacto */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Información de Contacto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="font-medium">{exchangeHouse.email}</p>
                                    </div>
                                </div>
                                {exchangeHouse.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                            <p className="font-medium">{exchangeHouse.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {exchangeHouse.address && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                                            <p className="font-medium">{exchangeHouse.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuración Financiera */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Configuración Financiera
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground">Comisión</p>
                                    <p className="text-2xl font-bold">
                                        {exchangeHouse.commission_rate}%
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground">Límite Diario</p>
                                    <p className="text-2xl font-bold">
                                        ${exchangeHouse.daily_limit.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Monedas Permitidas</p>
                                    <div className="flex flex-wrap gap-2">
                                        {exchangeHouse.allowed_currencies.map((currency) => (
                                            <Badge key={currency} variant="outline" className="text-xs">
                                                {currency}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estadísticas */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Estadísticas y Actividad
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Usuarios</p>
                                            <p className="text-2xl font-bold">
                                                {exchangeHouse.users_count}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Órdenes</p>
                                            <p className="text-2xl font-bold">
                                                {exchangeHouse.orders_count}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Volumen Total</p>
                                            <p className="text-2xl font-bold">
                                                ${(exchangeHouse.orders_sum_base_amount || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fechas */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Información Temporal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
                                        <p className="font-semibold">
                                            {new Date(exchangeHouse.created_at).toLocaleString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 border rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                                        <p className="font-semibold">
                                            {new Date(exchangeHouse.updated_at).toLocaleString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ShowExchangeHouse.layout = (page: React.ReactElement) => (
    <KuberafiLayout>{page}</KuberafiLayout>
);

export default ShowExchangeHouse;