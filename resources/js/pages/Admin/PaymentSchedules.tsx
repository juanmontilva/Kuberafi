import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import KuberafiLayout from '@/layouts/kuberafi-layout';
import { useState } from 'react';
import { 
    ArrowLeft, 
    Plus, 
    Calendar, 
    Clock, 
    DollarSign,
    ChevronRight,
    Home,
    Settings,
    Edit,
    Trash2,
    Play,
    Pause
} from 'lucide-react';

interface ExchangeHouse {
    id: number;
    name: string;
    business_name: string;
}

interface PaymentSchedule {
    id: number;
    exchange_house_id: number;
    frequency: string;
    payment_day?: number;
    minimum_amount: number;
    auto_generate: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    exchange_house?: ExchangeHouse;
}

interface Props extends PageProps {
    paymentSchedules: PaymentSchedule[];
    exchangeHouses: ExchangeHouse[];
}

function PaymentSchedules({ paymentSchedules = [], exchangeHouses = [] }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        exchange_house_id: '',
        frequency: 'monthly',
        payment_day: 1,
        minimum_amount: 0,
        auto_generate: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/payment-schedules', {
            onSuccess: () => {
                reset();
                setIsCreateOpen(false);
            },
        });
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200';
    };

    const getStatusText = (isActive: boolean) => {
        return isActive ? 'Activo' : 'Inactivo';
    };

    const getFrequencyText = (frequency: string) => {
        switch (frequency) {
            case 'daily': return 'Diario';
            case 'weekly': return 'Semanal';
            case 'biweekly': return 'Quincenal';
            case 'monthly': return 'Mensual';
            default: return frequency;
        }
    };

    return (
        <>
            <Head title="Cronogramas de Pago" />
            
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
                        href="/admin/payments" 
                        className="flex items-center px-2 py-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Gestión de Pagos
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                        Cronogramas
                    </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0">
                                <Link href="/admin/payments">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                                    Cronogramas de Pago
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Gestiona los cronogramas automáticos de pago de comisiones
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Settings className="h-4 w-4" />
                            Automatización de pagos de comisiones
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/admin/payments">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Ver Pagos
                            </Link>
                        </Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Cronograma
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Crear Cronograma de Pago</DialogTitle>
                                    <DialogDescription>
                                        Configura un cronograma automático para pagos de comisiones
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="exchange_house_id">Casa de Cambio</Label>
                                        <Select
                                            value={data.exchange_house_id}
                                            onValueChange={(value) => setData('exchange_house_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una casa de cambio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exchangeHouses.map((house) => (
                                                    <SelectItem key={house.id} value={house.id.toString()}>
                                                        {house.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.exchange_house_id && (
                                            <p className="text-sm text-red-600">{errors.exchange_house_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="frequency">Frecuencia</Label>
                                        <Select
                                            value={data.frequency}
                                            onValueChange={(value) => setData('frequency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Diario</SelectItem>
                                                <SelectItem value="weekly">Semanal</SelectItem>
                                                <SelectItem value="biweekly">Quincenal</SelectItem>
                                                <SelectItem value="monthly">Mensual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.frequency && (
                                            <p className="text-sm text-red-600">{errors.frequency}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_day">Día de Pago (1-31)</Label>
                                        <Input
                                            id="payment_day"
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={data.payment_day}
                                            onChange={(e) => setData('payment_day', parseInt(e.target.value))}
                                        />
                                        {errors.payment_day && (
                                            <p className="text-sm text-red-600">{errors.payment_day}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minimum_amount">Monto Mínimo ($)</Label>
                                        <Input
                                            id="minimum_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.minimum_amount}
                                            onChange={(e) => setData('minimum_amount', parseFloat(e.target.value))}
                                        />
                                        {errors.minimum_amount && (
                                            <p className="text-sm text-red-600">{errors.minimum_amount}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="auto_generate">Generación Automática</Label>
                                        <Switch
                                            id="auto_generate"
                                            checked={data.auto_generate}
                                            onCheckedChange={(checked) => setData('auto_generate', checked)}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreateOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creando...' : 'Crear Cronograma'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cronogramas</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{paymentSchedules.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Activos</CardTitle>
                            <Play className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {paymentSchedules.filter(s => s.is_active).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
                            <Pause className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {paymentSchedules.filter(s => !s.is_active).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Auto-Generación</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {paymentSchedules.filter(s => s.auto_generate).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Schedules List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Lista de Cronogramas
                        </CardTitle>
                        <CardDescription>
                            Todos los cronogramas de pago configurados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentSchedules.length > 0 ? (
                                paymentSchedules.map((schedule) => (
                                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold">
                                                    {schedule.exchange_house?.name || `Casa de Cambio #${schedule.exchange_house_id}`}
                                                </h3>
                                                <Badge className={getStatusColor(schedule.is_active)}>
                                                    {getStatusText(schedule.is_active)}
                                                </Badge>
                                                {schedule.auto_generate && (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                        Auto
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {getFrequencyText(schedule.frequency)}
                                                </div>
                                                {schedule.payment_day && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        Día: {schedule.payment_day}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    Mín: ${schedule.minimum_amount.toLocaleString()}
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-muted-foreground">
                                                {schedule.exchange_house?.business_name}
                                            </p>
                                            
                                            <p className="text-xs text-muted-foreground">
                                                Creado: {new Date(schedule.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {schedule.is_active ? (
                                                <Button variant="outline" size="sm" title="Pausar cronograma">
                                                    <Pause className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" title="Activar cronograma">
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/payment-schedules/${schedule.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No hay cronogramas configurados</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Crea tu primer cronograma de pago para automatizar las comisiones
                                    </p>
                                    <Button onClick={() => setIsCreateOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Crear Primer Cronograma
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PaymentSchedules.layout = (page: React.ReactElement) => (
    <KuberafiLayout>{page}</KuberafiLayout>
);

export default PaymentSchedules;