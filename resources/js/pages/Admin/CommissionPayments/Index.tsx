import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, DollarSign, Clock, AlertCircle } from 'lucide-react';

interface CommissionPayment {
    id: number;
    amount: number;
    status: string;
    status_label: string;
    status_badge: string;
    requested_at: string;
    days_waiting: number;
    exchange_house: {
        name: string;
    };
    requested_by: {
        name: string;
    };
}

interface Stats {
    pending: { count: number; amount: number };
    approved: { count: number; amount: number };
    paid_this_month: { count: number; amount: number };
}

interface PaginationData {
    data: CommissionPayment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    payments: PaginationData;
    stats: Stats;
    filters: {
        status: string | null;
        exchange_house_id: number | null;
    };
}

export default function Index({ payments, stats, filters }: Props) {
    const [selectedPayment, setSelectedPayment] = useState<CommissionPayment | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'pay' | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        approval_notes: '',
        rejection_reason: '',
        payment_method: '',
        payment_reference: '',
        payment_notes: '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleAction = (payment: CommissionPayment, action: 'approve' | 'reject' | 'pay') => {
        setSelectedPayment(payment);
        setActionType(action);
    };

    const handleSubmit = () => {
        if (!selectedPayment || !actionType) return;

        const routes = {
            approve: `/admin/commission-payments/${selectedPayment.id}/approve`,
            reject: `/admin/commission-payments/${selectedPayment.id}/reject`,
            pay: `/admin/commission-payments/${selectedPayment.id}/mark-as-paid`,
        };

        post(routes[actionType], {
            onSuccess: () => {
                setSelectedPayment(null);
                setActionType(null);
                reset();
            },
        });
    };

    const closeDialog = () => {
        setSelectedPayment(null);
        setActionType(null);
        reset();
    };

    return (
        <KuberafiLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Gestión de Comisiones
                </h2>
            </div>
            <Head title="Gestión de Comisiones" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pending.count}</div>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.pending.amount)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.approved.count}</div>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.approved.amount)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pagadas Este Mes</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.paid_this_month.count}</div>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.paid_this_month.amount)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabla */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitudes de Pago</CardTitle>
                            <CardDescription>Gestiona todas las solicitudes de comisiones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Casa de Cambio</TableHead>
                                        <TableHead>Monto</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Días</TableHead>
                                        <TableHead>Solicitado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.data.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">#{payment.id}</TableCell>
                                            <TableCell>{payment.exchange_house.name}</TableCell>
                                            <TableCell className="font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={payment.status_badge}>
                                                    {payment.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {payment.days_waiting > 0 && (
                                                    <span className={payment.days_waiting > 5 ? 'text-red-600 font-medium' : ''}>
                                                        {payment.days_waiting}d
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(payment.requested_at)}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {payment.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleAction(payment, 'approve')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Aprobar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleAction(payment, 'reject')}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Rechazar
                                                        </Button>
                                                    </>
                                                )}
                                                {payment.status === 'approved' && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleAction(payment, 'pay')}
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-1" />
                                                        Marcar Pagada
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Diálogos */}
            {/* Aprobar */}
            <Dialog open={actionType === 'approve'} onOpenChange={closeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprobar Solicitud</DialogTitle>
                        <DialogDescription>
                            Aprobar solicitud #{selectedPayment?.id} por {formatCurrency(selectedPayment?.amount || 0)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Notas de Aprobación</Label>
                            <Textarea
                                value={data.approval_notes}
                                onChange={(e) => setData('approval_notes', e.target.value)}
                                placeholder="Notas opcionales..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={processing}>Aprobar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rechazar */}
            <Dialog open={actionType === 'reject'} onOpenChange={closeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar Solicitud</DialogTitle>
                        <DialogDescription>
                            Rechazar solicitud #{selectedPayment?.id} por {formatCurrency(selectedPayment?.amount || 0)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Razón del Rechazo *</Label>
                            <Textarea
                                value={data.rejection_reason}
                                onChange={(e) => setData('rejection_reason', e.target.value)}
                                placeholder="Explica la razón del rechazo..."
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleSubmit} disabled={processing || !data.rejection_reason}>
                            Rechazar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Marcar como Pagada */}
            <Dialog open={actionType === 'pay'} onOpenChange={closeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Marcar como Pagada</DialogTitle>
                        <DialogDescription>
                            Registrar pago de solicitud #{selectedPayment?.id} por {formatCurrency(selectedPayment?.amount || 0)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Método de Pago *</Label>
                            <Input
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                placeholder="Ej: Transferencia"
                                required
                            />
                        </div>
                        <div>
                            <Label>Referencia</Label>
                            <Input
                                value={data.payment_reference}
                                onChange={(e) => setData('payment_reference', e.target.value)}
                                placeholder="Número de referencia"
                            />
                        </div>
                        <div>
                            <Label>Notas</Label>
                            <Textarea
                                value={data.payment_notes}
                                onChange={(e) => setData('payment_notes', e.target.value)}
                                placeholder="Notas adicionales..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={processing || !data.payment_method}>
                            Marcar como Pagada
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </KuberafiLayout>
    );
}
