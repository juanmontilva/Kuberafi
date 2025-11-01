import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, ArrowLeft } from 'lucide-react';

interface CommissionPayment {
    id: number;
    amount: number;
    status: string;
    status_label: string;
    status_badge: string;
    requested_at: string;
    approved_at: string | null;
    paid_at: string | null;
    bank_name: string;
    account_number: string;
    requested_by: {
        name: string;
    };
}

interface PaginationData {
    data: CommissionPayment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    requests: PaginationData;
    filters: {
        status: string | null;
    };
}

export default function History({ requests, filters }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleFilterChange = (status: string) => {
        router.get('/commissions/history', { status: status === 'all' ? null : status }, {
            preserveState: true,
        });
    };

    return (
        <KuberafiLayout>
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/commissions">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h2 className="text-2xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Historial de Solicitudes
                </h2>
            </div>
            <Head title="Historial de Solicitudes" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Solicitudes de Pago</CardTitle>
                                    <CardDescription>
                                        Historial completo de todas tus solicitudes
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Select
                                        value={filters.status || 'all'}
                                        onValueChange={handleFilterChange}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Todos los estados" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="pending">Pendientes</SelectItem>
                                            <SelectItem value="approved">Aprobadas</SelectItem>
                                            <SelectItem value="paid">Pagadas</SelectItem>
                                            <SelectItem value="rejected">Rechazadas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {requests.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No hay solicitudes que mostrar</p>
                                    <Button className="mt-4" asChild>
                                        <Link href="/commissions/request-payment">
                                            Crear Primera Solicitud
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Monto</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Solicitado</TableHead>
                                                <TableHead>Aprobado</TableHead>
                                                <TableHead>Pagado</TableHead>
                                                <TableHead>Banco</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.data.map((request) => (
                                                <TableRow key={request.id}>
                                                    <TableCell className="font-medium">
                                                        #{request.id}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {formatCurrency(request.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={request.status_badge}>
                                                            {request.status_label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(request.requested_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(request.approved_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(request.paid_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.bank_name}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <Link href={`/commissions/payment/${request.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Paginación */}
                                    {requests.last_page > 1 && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Mostrando {requests.from} a {requests.to} de {requests.total} solicitudes
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={requests.current_page === 1}
                                                    onClick={() => router.get(`/commissions/history?page=${requests.current_page - 1}`)}
                                                >
                                                    Anterior
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={requests.current_page === requests.last_page}
                                                    onClick={() => router.get(`/commissions/history?page=${requests.current_page + 1}`)}
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </KuberafiLayout>
    );
}
