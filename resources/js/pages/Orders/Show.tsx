import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { ArrowLeft, Edit, Building2, User, Calendar, DollarSign, ChevronRight, Home, List } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    amount: number;
    currency_from: string;
    currency_to: string;
    exchange_rate: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    created_at: string;
    updated_at: string;
    exchange_house?: {
        name: string;
        email: string;
    };
}

interface Props extends PageProps {
    order: Order;
}

function Show({ order }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'completed': return 'Completada';
            case 'cancelled': return 'Cancelada';
            case 'processing': return 'Procesando';
            default: return status;
        }
    };

    return (
        <>
            <Head title={`Orden ${order.order_number}`} />
            
            <div className="space-y-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Link 
                        href="/dashboard" 
                        className="flex items-center hover:text-foreground transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link 
                        href="/orders" 
                        className="flex items-center hover:text-foreground transition-colors"
                    >
                        <List className="h-4 w-4 mr-1" />
                        Órdenes
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">#{order.order_number}</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                <Link href="/orders">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                    Orden #{order.order_number}
                                </h1>
                                <p className="text-muted-foreground">
                                    Detalles completos de la orden
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                • Creada {new Date(order.created_at).toLocaleDateString('es-ES')}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/orders">
                                <List className="h-4 w-4 mr-2" />
                                Ver Todas
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información de la Orden */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Información de la Orden
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Número de Orden</p>
                                    <p className="text-sm font-mono">{order.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Monto</p>
                                    <p className="text-lg font-semibold">{order.amount} {order.currency_from}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Conversión</p>
                                    <p className="text-sm">{order.currency_from} → {order.currency_to}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tasa de Cambio</p>
                                    <p className="text-sm">{order.exchange_rate}</p>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="text-sm font-medium text-muted-foreground">Monto Final</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {(order.amount * order.exchange_rate).toFixed(2)} {order.currency_to}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                    <p className="text-sm">{order.client_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-sm">{order.client_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                                    <p className="text-sm">{order.client_phone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Casa de Cambio */}
                    {order.exchange_house && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Casa de Cambio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                        <p className="text-sm">{order.exchange_house.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{order.exchange_house.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Fechas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Fechas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Creada</p>
                                    <p className="text-sm">
                                        {new Date(order.created_at).toLocaleString('es-ES')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                                    <p className="text-sm">
                                        {new Date(order.updated_at).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Show.layout = (page: React.ReactElement) => (
    <KuberafiLayout>{page}</KuberafiLayout>
);

export default Show;