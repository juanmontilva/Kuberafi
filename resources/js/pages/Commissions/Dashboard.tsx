import React from 'react';
import { Head, Link } from '@inertiajs/react';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface Stats {
    balance: {
        total_earned: number;
        total_requested: number;
        available: number;
        in_process: number;
        total_paid: number;
    };
    last_request: {
        amount: number;
        status: string;
        requested_at: string;
    } | null;
    avg_approval_days: number;
}

interface TrendData {
    month: string;
    total_orders: number;
    total_volume: number;
    total_commission: number;
}

interface RecentRequest {
    id: number;
    amount: number;
    status: string;
    status_label: string;
    status_badge: string;
    requested_at: string;
}

interface Props {
    stats: Stats;
    trend: TrendData[];
    recent_requests: {
        data: RecentRequest[];
    };
}

export default function Dashboard({ stats, trend, recent_requests }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <KuberafiLayout>
            <Head title="Comisiones" />
            
            <div className="mb-6">
                <h2 className="text-2xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard de Comisiones
                </h2>
            </div>

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        {/* Total Acumulado */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Acumulado
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.balance.total_earned)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Ganado en total
                                </p>
                            </CardContent>
                        </Card>

                        {/* Disponible */}
                        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Disponible
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    {formatCurrency(stats.balance.available)}
                                </div>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    Listo para solicitar
                                </p>
                            </CardContent>
                        </Card>

                        {/* En Proceso */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    En Proceso
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.balance.in_process)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.avg_approval_days} días promedio
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Pagado */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Pagado
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.balance.total_paid)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recibido históricamente
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráfico de Tendencia */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Tendencia de Comisiones</CardTitle>
                            <CardDescription>
                                Últimos 6 meses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value: any) => formatCurrency(Number(value))}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="total_commission" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        name="Comisiones"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Últimas Solicitudes */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Solicitudes Recientes</CardTitle>
                                    <CardDescription>
                                        Últimas 5 solicitudes de pago
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" asChild>
                                    <Link href="/commissions/history">
                                        Ver todas
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recent_requests.data.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay solicitudes aún
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recent_requests.data.map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex items-center justify-between border-b pb-4 last:border-0"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {formatCurrency(request.amount)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(request.requested_at)}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status_badge}`}>
                                                {request.status_label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </KuberafiLayout>
    );
}
