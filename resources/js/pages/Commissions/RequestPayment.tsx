import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Balance {
    total_earned: number;
    total_requested: number;
    available: number;
    in_process: number;
    total_paid: number;
}

interface Props {
    balance: Balance;
}

export default function RequestPayment({ balance }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        bank_name: '',
        account_number: '',
        account_holder: '',
        account_type: 'savings',
        identification: '',
        request_notes: '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/commissions/request-payment');
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
                    Solicitar Pago de Comisión
                </h2>
            </div>
            <Head title="Solicitar Pago" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* Balance Disponible */}
                    <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                                <DollarSign className="h-5 w-5" />
                                Balance Disponible
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                                {formatCurrency(balance.available)}
                            </div>
                            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                                Este es el monto máximo que puedes solicitar en este momento
                            </p>
                        </CardContent>
                    </Card>

                    {/* Formulario */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Solicitud</CardTitle>
                            <CardDescription>
                                Completa los datos para solicitar el pago de tus comisiones
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Monto */}
                                <div>
                                    <Label htmlFor="amount">Monto a Solicitar *</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            $
                                        </span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={balance.available}
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="pl-7"
                                            required
                                        />
                                    </div>
                                    {errors.amount && (
                                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                    )}
                                </div>

                                {/* Datos Bancarios */}
                                <div className="space-y-4 rounded-lg border p-4">
                                    <h3 className="font-medium">Datos Bancarios</h3>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Banco */}
                                        <div>
                                            <Label htmlFor="bank_name">Banco *</Label>
                                            <Input
                                                id="bank_name"
                                                value={data.bank_name}
                                                onChange={(e) => setData('bank_name', e.target.value)}
                                                placeholder="Ej: Banco de Venezuela"
                                                required
                                            />
                                            {errors.bank_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>
                                            )}
                                        </div>

                                        {/* Tipo de Cuenta */}
                                        <div>
                                            <Label htmlFor="account_type">Tipo de Cuenta *</Label>
                                            <Select
                                                value={data.account_type}
                                                onValueChange={(value) => setData('account_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="savings">Ahorro</SelectItem>
                                                    <SelectItem value="checking">Corriente</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.account_type && (
                                                <p className="mt-1 text-sm text-red-600">{errors.account_type}</p>
                                            )}
                                        </div>

                                        {/* Número de Cuenta */}
                                        <div>
                                            <Label htmlFor="account_number">Número de Cuenta *</Label>
                                            <Input
                                                id="account_number"
                                                value={data.account_number}
                                                onChange={(e) => setData('account_number', e.target.value)}
                                                placeholder="0000-0000-00-0000000000"
                                                required
                                            />
                                            {errors.account_number && (
                                                <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>
                                            )}
                                        </div>

                                        {/* Cédula/RIF */}
                                        <div>
                                            <Label htmlFor="identification">Cédula/RIF *</Label>
                                            <Input
                                                id="identification"
                                                value={data.identification}
                                                onChange={(e) => setData('identification', e.target.value)}
                                                placeholder="V-12345678"
                                                required
                                            />
                                            {errors.identification && (
                                                <p className="mt-1 text-sm text-red-600">{errors.identification}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Titular */}
                                    <div>
                                        <Label htmlFor="account_holder">Titular de la Cuenta *</Label>
                                        <Input
                                            id="account_holder"
                                            value={data.account_holder}
                                            onChange={(e) => setData('account_holder', e.target.value)}
                                            placeholder="Nombre completo del titular"
                                            required
                                        />
                                        {errors.account_holder && (
                                            <p className="mt-1 text-sm text-red-600">{errors.account_holder}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Notas */}
                                <div>
                                    <Label htmlFor="request_notes">Notas Adicionales</Label>
                                    <Textarea
                                        id="request_notes"
                                        value={data.request_notes}
                                        onChange={(e) => setData('request_notes', e.target.value)}
                                        placeholder="Información adicional sobre la solicitud (opcional)"
                                        rows={3}
                                    />
                                    {errors.request_notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.request_notes}</p>
                                    )}
                                </div>

                                {/* Alert */}
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Tu solicitud será revisada por el equipo administrativo. 
                                        El tiempo de procesamiento promedio es de 3-5 días hábiles.
                                    </AlertDescription>
                                </Alert>

                                {/* Botones */}
                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={processing || balance.available <= 0}
                                        className="flex-1"
                                    >
                                        {processing ? 'Procesando...' : 'Solicitar Pago'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                        className="flex-1"
                                    >
                                        <Link href="/commissions">Cancelar</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </KuberafiLayout>
    );
}
